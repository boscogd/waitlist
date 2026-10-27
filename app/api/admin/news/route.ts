import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/api-auth';
import { getServiceClient } from '@/lib/supabase-admin';
import { cleanIntro, cleanItem, cleanSummary, cleanTitle, todayInMadrid } from '@/lib/news/validate';
import {
  EDITION_ADMIN_COLUMNS,
  MISSING_DRAFTS_SCHEMA,
  type EditionRow,
  editionState,
  isMissingSchema,
  nextAutoPublishAt,
  publishEdition,
  revalidateNews,
} from '@/lib/news/editions-admin';

// =====================================================
// ADMIN — gestión de Actualidad (/admin/actualidad)
// =====================================================
// GET  → todos los borradores + las últimas ediciones publicadas o retiradas, con sus noticias.
// POST → { action, ... }:
//   publish       { edition_id }            publica ya
//   retire        { edition_id }            la quita de la web con sus noticias (no borra nada)
//   pause         { edition_id }            borrador: no se publicará solo
//   resume        { edition_id }            borrador: vuelve a publicarse solo (48 h, en la pasada del cron)
//   update_intro  { edition_id, intro }
//   update_item   { item_id, title, summary }
//   delete_item   { item_id }
//   add_item      { edition_id, item }      noticia añadida a mano
//   create_draft  { edition_date? }         edición vacía para montarla a mano
// Auth: sesión de admin (cookie httpOnly). Escritura con service-role.

export const dynamic = 'force-dynamic';

const EDITIONS_LIMIT = 60;

const ITEM_ADMIN_COLUMNS =
  'id, edition_id, title, summary, source_name, source_url, country, published_at, is_published';

type Admin = ReturnType<typeof getServiceClient>;

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function getEdition(admin: Admin, id: unknown): Promise<EditionRow> {
  if (typeof id !== 'string' || !id) throw new Error('Falta edition_id');
  const { data, error } = await admin.from('news_editions').select(EDITION_ADMIN_COLUMNS).eq('id', id).single();
  if (error || !data) throw new Error(isMissingSchema(error) ? MISSING_DRAFTS_SCHEMA : 'Edición no encontrada');
  return data as EditionRow;
}

async function getItemEdition(admin: Admin, itemId: unknown): Promise<{ itemId: string; edition: EditionRow | null }> {
  if (typeof itemId !== 'string' || !itemId) throw new Error('Falta item_id');
  const { data, error } = await admin.from('news_items').select('id, edition_id').eq('id', itemId).single();
  if (error || !data) throw new Error('Noticia no encontrada');
  return { itemId, edition: data.edition_id ? await getEdition(admin, data.edition_id) : null };
}

export async function GET(request: Request) {
  if (!(await verifyAdminAuth(request))) return fail('No autorizado', 401);
  let admin: Admin;
  try {
    admin = getServiceClient();
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Sin cliente admin', 500);
  }

  // Los borradores siempre (aunque sean antiguos y estén en pausa); del resto,
  // las últimas EDITIONS_LIMIT, de sobra para corregir o retirar semanas pasadas.
  const [drafts, others] = await Promise.all([
    admin.from('news_editions').select(EDITION_ADMIN_COLUMNS).eq('is_draft', true),
    admin
      .from('news_editions')
      .select(EDITION_ADMIN_COLUMNS)
      .eq('is_draft', false)
      .order('edition_date', { ascending: false })
      .limit(EDITIONS_LIMIT),
  ]);
  const error = drafts.error || others.error;
  if (error) return fail(isMissingSchema(error) ? MISSING_DRAFTS_SCHEMA : error.message, 500);
  const editions = [...(drafts.data || []), ...(others.data || [])].sort((a, b) =>
    a.edition_date < b.edition_date ? 1 : -1
  );

  const ids = (editions as EditionRow[]).map((e) => e.id);
  const { data: items, error: itemsError } = ids.length
    ? await admin
        .from('news_items')
        .select(ITEM_ADMIN_COLUMNS)
        .in('edition_id', ids)
        .order('published_at', { ascending: false, nullsFirst: false })
    : { data: [], error: null };
  if (itemsError) return fail(itemsError.message, 500);

  return NextResponse.json({
    today: todayInMadrid(),
    editions: (editions as EditionRow[]).map((e) => ({
      ...e,
      state: editionState(e),
      items: (items || []).filter((i: { edition_id: string }) => i.edition_id === e.id),
    })),
  });
}

export async function POST(request: Request) {
  if (!(await verifyAdminAuth(request))) return fail('No autorizado', 401);
  let admin: Admin;
  let body: Record<string, unknown>;
  try {
    admin = getServiceClient();
    body = await request.json();
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Petición inválida');
  }

  try {
    switch (body.action) {
      case 'publish': {
        const edition = await getEdition(admin, body.edition_id);
        const published = await publishEdition(admin, edition);
        if (published === null) return fail('La edición ya estaba publicada', 409);
        return NextResponse.json({ ok: true, published });
      }

      case 'retire': {
        const edition = await getEdition(admin, body.edition_id);
        const { error } = await admin
          .from('news_editions')
          .update({ is_published: false, is_draft: false, auto_publish_at: null })
          .eq('id', edition.id);
        if (error) throw new Error(error.message);
        // Sus noticias también dejan de ser públicas (anon solo lee lo
        // publicado). Volver a publicar la edición las recupera.
        const { error: itemsError } = await admin
          .from('news_items')
          .update({ is_published: false })
          .eq('edition_id', edition.id);
        revalidateNews(edition.edition_date);
        if (itemsError) throw new Error(`Edición retirada, pero sus noticias siguen visibles: ${itemsError.message}`);
        return NextResponse.json({ ok: true });
      }

      case 'pause':
      case 'resume': {
        const edition = await getEdition(admin, body.edition_id);
        if (editionState(edition) !== 'draft') throw new Error('Solo se puede pausar o reanudar un borrador');
        const autoPublishAt = body.action === 'resume' ? nextAutoPublishAt() : null;
        const { data: changed, error } = await admin
          .from('news_editions')
          .update({ auto_publish_at: autoPublishAt })
          .eq('id', edition.id)
          .eq('is_draft', true)
          .select('id');
        if (error) throw new Error(error.message);
        if (!changed?.length) return fail('La edición ya no es un borrador', 409);
        return NextResponse.json({ ok: true, auto_publish_at: autoPublishAt });
      }

      case 'update_intro': {
        const edition = await getEdition(admin, body.edition_id);
        const intro = cleanIntro(body.intro);
        const { error } = await admin.from('news_editions').update({ intro }).eq('id', edition.id);
        if (error) throw new Error(error.message);
        if (edition.is_published) revalidateNews(edition.edition_date);
        return NextResponse.json({ ok: true });
      }

      case 'update_item': {
        const { itemId, edition } = await getItemEdition(admin, body.item_id);
        const update = { title: cleanTitle(body.title), summary: cleanSummary(body.summary) };
        const { error } = await admin.from('news_items').update(update).eq('id', itemId);
        if (error) throw new Error(error.message);
        if (edition?.is_published) revalidateNews(edition.edition_date);
        return NextResponse.json({ ok: true });
      }

      case 'delete_item': {
        const { itemId, edition } = await getItemEdition(admin, body.item_id);
        const { error } = await admin.from('news_items').delete().eq('id', itemId);
        if (error) throw new Error(error.message);
        if (edition?.is_published) revalidateNews(edition.edition_date);
        return NextResponse.json({ ok: true });
      }

      case 'add_item': {
        const edition = await getEdition(admin, body.edition_id);
        if (editionState(edition) === 'retired') throw new Error('No se añaden noticias a una edición retirada');
        const item = cleanItem(body.item);
        const { data: dup } = await admin
          .from('news_items')
          .select('id')
          .eq('source_url', item.source_url)
          .limit(1);
        if (dup?.length) return fail('Esa noticia (mismo enlace) ya está en alguna edición', 409);
        const { error } = await admin
          .from('news_items')
          .insert({ ...item, edition_id: edition.id, is_published: edition.is_published });
        if (error) throw new Error(error.message);
        if (edition.is_published) revalidateNews(edition.edition_date);
        return NextResponse.json({ ok: true });
      }

      case 'create_draft': {
        const date = typeof body.edition_date === 'string' && body.edition_date ? body.edition_date : todayInMadrid();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Fecha con formato AAAA-MM-DD');
        const { data: existing } = await admin.from('news_editions').select('id').eq('edition_date', date).limit(1);
        if (existing?.length) return fail(`Ya hay una edición con fecha ${date}`, 409);
        const { error } = await admin
          .from('news_editions')
          .insert({ edition_date: date, is_published: false, is_draft: true, auto_publish_at: null });
        if (error) throw new Error(isMissingSchema(error) ? MISSING_DRAFTS_SCHEMA : error.message);
        return NextResponse.json({ ok: true });
      }

      default:
        return fail('Acción desconocida');
    }
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}
