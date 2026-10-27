import { NextResponse } from 'next/server';
import { safeEqual } from '@/lib/api-auth';
import { getServiceClient } from '@/lib/supabase-admin';
import {
  type CleanItem,
  MIN_ITEMS,
  cleanIntro,
  todayInMadrid,
  validateItems,
} from '@/lib/news/validate';
import {
  AUTO_PUBLISH_HOURS,
  EDITION_ADMIN_COLUMNS,
  MISSING_DRAFTS_SCHEMA,
  type EditionRow,
  editionState,
  isMissingSchema,
  notifyDraftReady,
  revalidateNews,
} from '@/lib/news/editions-admin';

// =====================================================
// ACTUALIDAD — entrada de una tanda CURADA de noticias
// =====================================================
// Lo llama el trabajo semanal (GitHub Actions, .github/actualidad/prompt.md)
// con 8-10 noticias ya curadas y resumidas con criterio editorial. Aquí NO
// hay IA: el endpoint solo valida y guarda lo que recibe.
//
// SEGURIDAD:
// - Auth: `Authorization: Bearer <NEWS_PUBLISH_SECRET>`. Secreto PROPIO y de
//   alcance mínimo: no vale para campañas, ni para el admin, ni para nada
//   más. Lo peor que puede hacer quien lo robe es crear noticias, que se
//   retiran desde /admin/actualidad.
// - Escritura con service-role (solo servidor). anon sigue sin poder escribir.
// - Validación estricta del cuerpo (lib/news/validate.ts).
//
// CUERPO: { items: [...], edition_date?: "YYYY-MM-DD", intro?: "…", status?: "draft" | "published" }
//
// status = "draft" (lo que usa el trabajo semanal, ver supabase/news-drafts.sql):
//   la edición queda como BORRADOR, invisible en la web. Se avisa por correo
//   a NEWS_REVIEW_EMAIL; Aida la revisa en /admin/actualidad y la publica, o
//   se publica sola a las AUTO_PUBLISH_HOURS horas (/api/news-autopublish).
//   Las noticias cuya URL ya salió en otra edición se descartan (no se roban
//   de semanas anteriores). Si esa fecha ya está publicada o retirada → 409.
//
// status = "published" (por defecto, compatibilidad): publica al momento.
//   Cada tanda es una EDICIÓN con su fecha y su página permanente
//   /actualidad/<fecha>. Las anteriores NO se tocan: son el archivo.
//   Republicar la misma fecha sustituye la tanda de esa edición.
//   Sin la tabla news_editions → modo antiguo (la tanda nueva sustituye a la
//   anterior). La respuesta indica el modo usado.

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const DRAFT_RETENTION_DAYS = 90;

function isAuthorized(request: Request): boolean {
  const secret = process.env.NEWS_PUBLISH_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization');
  return !!header && safeEqual(header, `Bearer ${secret}`);
}

// Fecha de la edición = slug de su URL permanente. Opcional: por defecto, hoy.
// Se acota a ±7 días para que un despiste no cree ediciones en fechas absurdas.
function cleanEditionDate(value: unknown): string {
  if (value == null || value === '') return todayInMadrid();
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('"edition_date" debe tener formato YYYY-MM-DD');
  }
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`"edition_date" no es una fecha válida: ${value}`);
  }
  const diffDays = Math.abs(date.getTime() - new Date(`${todayInMadrid()}T12:00:00Z`).getTime()) / 86_400_000;
  if (diffDays > 7) throw new Error(`"edition_date" debe estar a menos de 7 días de hoy: ${value}`);
  return value;
}

function cleanStatus(value: unknown): 'draft' | 'published' {
  if (value == null || value === '' || value === 'published') return 'published';
  if (value === 'draft') return 'draft';
  throw new Error('"status" debe ser "draft" o "published"');
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let items: CleanItem[];
  let editionDate: string;
  let intro: string | null;
  let status: 'draft' | 'published';
  try {
    const body = await request.json();
    items = validateItems(body?.items);
    editionDate = cleanEditionDate(body?.edition_date);
    intro = cleanIntro(body?.intro);
    status = cleanStatus(body?.status);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cuerpo inválido' },
      { status: 400 }
    );
  }

  let admin;
  try {
    admin = getServiceClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sin cliente admin' },
      { status: 500 }
    );
  }

  if (status === 'draft') return saveDraft(admin, items, editionDate, intro);

  // ---------------------------------------------------------------
  // PUBLICACIÓN DIRECTA
  // ---------------------------------------------------------------

  // 1. Edición de la semana (crea o actualiza la de esa fecha). Si la tabla
  //    aún no existe, editionId queda en null y seguimos en modo antiguo.
  let editionId: string | null = null;
  {
    const { data, error } = await admin
      .from('news_editions')
      .upsert(
        { edition_date: editionDate, is_published: true, ...(intro ? { intro } : {}) },
        { onConflict: 'edition_date' }
      )
      .select('id')
      .single();
    if (error && !isMissingSchema(error)) {
      return NextResponse.json(
        { error: `Error al crear la edición ${editionDate}: ${error.message}` },
        { status: 500 }
      );
    }
    editionId = data?.id ?? null;
  }

  // Si ya existen las columnas de borradores, deja la edición como publicada
  // a todos los efectos (best-effort: sin esas columnas no pasa nada).
  if (editionId) {
    await admin
      .from('news_editions')
      .update({ is_draft: false, auto_publish_at: null, published_at: new Date().toISOString() })
      .eq('id', editionId);
  }

  // 2. Retirar lo que la tanda nueva sustituye.
  //    - Con ediciones: SOLO las noticias de esta misma edición (republicar el
  //      mismo día reemplaza la tanda). Las semanas anteriores NO se tocan.
  //    - Modo antiguo: toda la tanda publicada pasa a borrador.
  {
    const query = admin.from('news_items').update({ is_published: false }).eq('is_published', true);
    const { error } = await (editionId ? query.eq('edition_id', editionId) : query);
    if (error) {
      return NextResponse.json(
        { error: `Error al retirar la tanda anterior: ${error.message}` },
        { status: 500 }
      );
    }
  }

  // 3. Inserta la nueva tanda publicada. Si una URL ya existía (noticia
  //    repetida de otra semana), se actualiza y pasa a esta edición.
  const rows = items.map((item) => ({
    ...item,
    is_published: true,
    ...(editionId ? { edition_id: editionId } : {}),
  }));
  const { error: upsertError } = await admin
    .from('news_items')
    .upsert(rows, { onConflict: 'source_url' });
  if (upsertError) {
    return NextResponse.json(
      { error: `Error al guardar la tanda nueva: ${upsertError.message}` },
      { status: 500 }
    );
  }

  // 4. Limpieza de noticias retiradas hace mucho (best-effort). Con ediciones
  //    lo publicado nunca se borra: solo lo que alguien despublicó.
  const cutoff = new Date(Date.now() - DRAFT_RETENTION_DAYS * 86_400_000).toISOString();
  const { error: purgeError } = await admin
    .from('news_items')
    .delete()
    .eq('is_published', false)
    .lt('created_at', cutoff);

  revalidateNews(editionDate);

  return NextResponse.json({
    ok: true,
    status: 'published',
    mode: editionId ? 'editions' : 'legacy',
    edition_date: editionId ? editionDate : null,
    published: items.length,
    purge_warning: purgeError?.message ?? null,
    titles: items.map((i) => i.title),
  });
}

// ---------------------------------------------------------------
// BORRADOR
// ---------------------------------------------------------------
async function saveDraft(
  admin: ReturnType<typeof getServiceClient>,
  items: CleanItem[],
  editionDate: string,
  intro: string | null
) {
  // 1. ¿Ya hay una edición con esa fecha?
  const { data: existingRows, error: existingError } = await admin
    .from('news_editions')
    .select(EDITION_ADMIN_COLUMNS)
    .eq('edition_date', editionDate)
    .limit(1);
  if (existingError) {
    const missing = isMissingSchema(existingError);
    return NextResponse.json(
      { error: missing ? MISSING_DRAFTS_SCHEMA : `Error leyendo la edición: ${existingError.message}` },
      { status: 500 }
    );
  }
  const existing = (existingRows?.[0] as EditionRow | undefined) ?? null;
  if (existing && editionState(existing) !== 'draft') {
    return NextResponse.json(
      {
        error: `La edición ${editionDate} ya está ${
          editionState(existing) === 'published' ? 'publicada' : 'retirada'
        }; no se sobrescribe con un borrador.`,
      },
      { status: 409 }
    );
  }

  // 2. Descarta noticias ya usadas en OTRA edición (no se les cambia de semana).
  const { data: dupRows, error: dupError } = await admin
    .from('news_items')
    .select('source_url, edition_id')
    .in('source_url', items.map((i) => i.source_url));
  if (dupError) {
    return NextResponse.json({ error: `Error comprobando duplicados: ${dupError.message}` }, { status: 500 });
  }
  const taken = new Set(
    (dupRows || [])
      .filter((r: { edition_id: string | null }) => !existing || r.edition_id !== existing.id)
      .map((r: { source_url: string }) => r.source_url)
  );
  const fresh = items.filter((i) => !taken.has(i.source_url));
  const skipped = items.filter((i) => taken.has(i.source_url)).map((i) => i.source_url);
  if (fresh.length < MIN_ITEMS) {
    return NextResponse.json(
      {
        error: `Solo quedan ${fresh.length} noticias nuevas (mínimo ${MIN_ITEMS}); estas ya salieron en otra edición: ${skipped.join(', ')}`,
      },
      { status: 400 }
    );
  }

  // 3. Crea o actualiza el borrador.
  const autoPublishAt = new Date(Date.now() + AUTO_PUBLISH_HOURS * 3_600_000).toISOString();
  const { data: edition, error: editionError } = await admin
    .from('news_editions')
    .upsert(
      {
        edition_date: editionDate,
        is_published: false,
        is_draft: true,
        auto_publish_at: autoPublishAt,
        intro,
      },
      { onConflict: 'edition_date' }
    )
    .select('id')
    .single();
  if (editionError || !edition) {
    const missing = isMissingSchema(editionError);
    return NextResponse.json(
      { error: missing ? MISSING_DRAFTS_SCHEMA : `Error guardando el borrador: ${editionError?.message}` },
      { status: 500 }
    );
  }

  // 4. Sustituye las noticias del borrador (nunca han sido públicas).
  const { error: deleteError } = await admin.from('news_items').delete().eq('edition_id', edition.id);
  if (deleteError) {
    return NextResponse.json({ error: `Error vaciando el borrador: ${deleteError.message}` }, { status: 500 });
  }
  const { error: insertError } = await admin
    .from('news_items')
    .insert(fresh.map((item) => ({ ...item, is_published: false, edition_id: edition.id })));
  if (insertError) {
    return NextResponse.json({ error: `Error guardando las noticias: ${insertError.message}` }, { status: 500 });
  }

  const notifyWarning = await notifyDraftReady({
    editionDate,
    titles: fresh.map((i) => i.title),
    autoPublishAt,
  });

  return NextResponse.json({
    ok: true,
    status: 'draft',
    edition_date: editionDate,
    saved: fresh.length,
    skipped_duplicates: skipped,
    auto_publish_at: autoPublishAt,
    notify_warning: notifyWarning,
    titles: fresh.map((i) => i.title),
  });
}
