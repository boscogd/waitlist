import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { safeEqual } from '@/lib/api-auth';
import { getServiceClient } from '@/lib/supabase-admin';

// =====================================================
// ACTUALIDAD — publicación de una tanda CURADA de noticias
// =====================================================
// Lo llama la rutina semanal de Claude (claude.ai/code → Routines) cada
// lunes con 8-10 noticias ya curadas y resumidas con criterio editorial.
// A diferencia de /api/news-refresh (Gemini), aquí NO hay IA: el endpoint
// solo valida y guarda lo que recibe.
//
// SEGURIDAD:
// - Auth: `Authorization: Bearer <NEWS_PUBLISH_SECRET>`. Secreto PROPIO y de
//   alcance mínimo: no vale para campañas, ni para el admin, ni para nada
//   más. Lo peor que puede hacer quien lo robe es publicar noticias, que se
//   deshacen con un UPDATE (ver "Deshacer" abajo).
// - Escritura con service-role (solo servidor). anon sigue sin poder escribir.
// - Validación estricta del cuerpo: nº de noticias, longitudes, URLs https,
//   sin HTML, fechas recientes, URLs únicas.
//
// CUERPO: { items: [...], edition_date?: "YYYY-MM-DD", intro?: "entradilla" }
//
// COMPORTAMIENTO (con ediciones, ver supabase/news-editions.sql): cada tanda
// es una EDICIÓN con su fecha y su página permanente /actualidad/<fecha>.
// Las ediciones anteriores NO se tocan: son el archivo. Republicar la misma
// fecha sustituye la tanda de esa edición. /actualidad muestra la última.
//
// Deshacer una edición que salió mal (la web pasa sola a la anterior):
//   UPDATE public.news_editions SET is_published = false WHERE edition_date = '2026-09-21';
//
// MODO ANTIGUO (si la tabla news_editions aún no existe): la tanda publicada
// pasa a borrador y la nueva la sustituye. La respuesta indica el modo usado.

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MIN_ITEMS = 5;
const MAX_ITEMS = 12;
const MAX_AGE_DAYS = 45; // ventana de "actualidad"
const DRAFT_RETENTION_DAYS = 90;

interface IncomingItem {
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  country?: string | null;
  published_at: string;
}

interface CleanItem {
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  country: string;
  published_at: string;
  is_published: true;
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.NEWS_PUBLISH_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization');
  return !!header && safeEqual(header, `Bearer ${secret}`);
}

// Texto plano: recorta, colapsa espacios y rechaza HTML.
function cleanText(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== 'string') throw new Error(`"${field}" debe ser texto`);
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length < min || text.length > max) {
    throw new Error(`"${field}" debe tener entre ${min} y ${max} caracteres (tiene ${text.length})`);
  }
  if (/<[a-z!/][^>]*>/i.test(text)) throw new Error(`"${field}" no puede contener HTML`);
  return text;
}

function cleanUrl(value: unknown): string {
  if (typeof value !== 'string') throw new Error('"source_url" debe ser texto');
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(`"source_url" no es una URL válida: ${String(value).slice(0, 80)}`);
  }
  if (url.protocol !== 'https:') throw new Error('"source_url" debe ser https');
  if (/(^|\.)news\.google\.com$/i.test(url.hostname)) {
    throw new Error('"source_url" debe enlazar al medio original, no a Google News');
  }
  url.hash = '';
  return url.toString();
}

function cleanDate(value: unknown): string {
  if (typeof value !== 'string') throw new Error('"published_at" debe ser texto ISO');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`"published_at" no es una fecha válida: ${value}`);
  const ageDays = (Date.now() - date.getTime()) / 86_400_000;
  if (ageDays > MAX_AGE_DAYS) throw new Error(`"published_at" tiene más de ${MAX_AGE_DAYS} días: ${value}`);
  if (ageDays < -1) throw new Error(`"published_at" está en el futuro: ${value}`);
  return date.toISOString();
}

function validateItems(raw: unknown): CleanItem[] {
  if (!Array.isArray(raw)) throw new Error('"items" debe ser un array');
  if (raw.length < MIN_ITEMS || raw.length > MAX_ITEMS) {
    throw new Error(`"items" debe tener entre ${MIN_ITEMS} y ${MAX_ITEMS} noticias (tiene ${raw.length})`);
  }
  const seenUrls = new Set<string>();
  return raw.map((entry, index) => {
    if (!entry || typeof entry !== 'object') throw new Error(`items[${index}] no es un objeto`);
    const it = entry as Partial<IncomingItem>;
    try {
      const item: CleanItem = {
        title: cleanText(it.title, 'title', 15, 140),
        summary: cleanText(it.summary, 'summary', 60, 420),
        source_name: cleanText(it.source_name, 'source_name', 2, 60),
        source_url: cleanUrl(it.source_url),
        country:
          it.country == null || it.country === ''
            ? 'Internacional'
            : cleanText(it.country, 'country', 2, 40),
        published_at: cleanDate(it.published_at),
        is_published: true,
      };
      const key = item.source_url.toLowerCase();
      if (seenUrls.has(key)) throw new Error(`"source_url" repetida: ${item.source_url}`);
      seenUrls.add(key);
      return item;
    } catch (err) {
      throw new Error(`items[${index}]: ${err instanceof Error ? err.message : String(err)}`);
    }
  });
}

// Fecha de hoy en Madrid, YYYY-MM-DD (la edición se publica "el lunes" de allí).
function todayInMadrid(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
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

// Entradilla de la semana: opcional, texto propio.
function cleanIntro(value: unknown): string | null {
  if (value == null || value === '') return null;
  return cleanText(value, 'intro', 80, 600);
}

// ¿El error de Supabase significa "esa tabla/columna todavía no existe"?
// (SQL de ediciones sin ejecutar → seguimos con el comportamiento antiguo.)
function isMissingSchema(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === '42P01' || // undefined_table (Postgres)
    error.code === '42703' || // undefined_column (Postgres)
    error.code === 'PGRST205' || // tabla no encontrada en la caché de PostgREST
    error.code === 'PGRST204' || // columna no encontrada en la caché de PostgREST
    /news_editions|edition_id/i.test(error.message || '')
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let items: CleanItem[];
  let editionDate: string;
  let intro: string | null;
  try {
    const body = await request.json();
    items = validateItems(body?.items);
    editionDate = cleanEditionDate(body?.edition_date);
    intro = cleanIntro(body?.intro);
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

  // 2. Retirar lo que la tanda nueva sustituye.
  //    - Con ediciones: SOLO las noticias de esta misma edición (republicar el
  //      mismo día reemplaza la tanda). Las semanas anteriores NO se tocan:
  //      son el archivo.
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
  const rows = editionId ? items.map((item) => ({ ...item, edition_id: editionId })) : items;
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

  revalidatePath('/actualidad');
  revalidatePath('/actualidad/archivo');
  revalidatePath(`/actualidad/${editionDate}`);
  revalidatePath('/sitemap.xml');

  return NextResponse.json({
    ok: true,
    mode: editionId ? 'editions' : 'legacy',
    edition_date: editionId ? editionDate : null,
    published: items.length,
    purge_warning: purgeError?.message ?? null,
    titles: items.map((i) => i.title),
  });
}
