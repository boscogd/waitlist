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
// COMPORTAMIENTO: la tanda publicada actual pasa a borrador
// (is_published = false) y la nueva se inserta publicada. Así deshacer un
// lunes malo es cuestión de un UPDATE. Los borradores de más de 90 días se
// borran.
//
// Deshacer la última tanda (Supabase SQL Editor), en dos pasos:
//   -- a) retira la tanda nueva (la última created_at)
//   UPDATE public.news_items SET is_published = false
//   WHERE created_at >= (SELECT MAX(created_at) FROM public.news_items) - interval '1 minute';
//   -- b) vuelve a publicar la anterior (los borradores más recientes que queden)
//   UPDATE public.news_items SET is_published = true
//   WHERE id IN (SELECT id FROM public.news_items WHERE NOT is_published ORDER BY created_at DESC LIMIT 10);

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

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let items: CleanItem[];
  try {
    const body = await request.json();
    items = validateItems(body?.items);
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

  // 1. La tanda actual pasa a borrador (recuperable).
  const { error: unpublishError } = await admin
    .from('news_items')
    .update({ is_published: false })
    .eq('is_published', true);
  if (unpublishError) {
    return NextResponse.json(
      { error: `Error al retirar la tanda anterior: ${unpublishError.message}` },
      { status: 500 }
    );
  }

  // 2. Inserta la nueva tanda publicada. Si una URL ya existía (noticia
  //    repetida de otra semana), se actualiza y vuelve a publicarse.
  const { error: upsertError } = await admin
    .from('news_items')
    .upsert(items, { onConflict: 'source_url' });
  if (upsertError) {
    return NextResponse.json(
      { error: `Error al guardar la tanda nueva: ${upsertError.message}` },
      { status: 500 }
    );
  }

  // 3. Limpieza de borradores viejos (best-effort).
  const cutoff = new Date(Date.now() - DRAFT_RETENTION_DAYS * 86_400_000).toISOString();
  const { error: purgeError } = await admin
    .from('news_items')
    .delete()
    .eq('is_published', false)
    .lt('created_at', cutoff);

  revalidatePath('/actualidad');

  return NextResponse.json({
    ok: true,
    published: items.length,
    purge_warning: purgeError?.message ?? null,
    titles: items.map((i) => i.title),
  });
}
