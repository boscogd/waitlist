import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resend } from '@/lib/resend';

// =====================================================
// ACTUALIDAD — operaciones de escritura sobre ediciones (solo servidor)
// =====================================================
// Las usan /api/news-publish, /api/news-autopublish y /api/admin/news.
// Siempre con el cliente service-role: anon no puede escribir.

export const SITE_URL = 'https://www.refugioenlapalabra.com';

// Horas que espera un borrador antes de publicarse solo si nadie lo toca.
export const AUTO_PUBLISH_HOURS = 48;

// Hora (UTC) del cron diario /api/news-autopublish. Debe coincidir con vercel.json.
const AUTO_PUBLISH_CRON_HOUR_UTC = 8;

/**
 * Momento en que el borrador se publicará solo: la primera pasada del cron
 * diario tras AUTO_PUBLISH_HOURS. Así el correo y el panel anuncian la hora
 * real y no una que el cron no va a cumplir.
 */
export function nextAutoPublishAt(from = new Date()): string {
  const due = new Date(from.getTime() + AUTO_PUBLISH_HOURS * 3_600_000);
  const run = new Date(due);
  run.setUTCHours(AUTO_PUBLISH_CRON_HOUR_UTC, 0, 0, 0);
  if (run < due) run.setUTCDate(run.getUTCDate() + 1);
  return run.toISOString();
}

// Mínimo de noticias para publicar una edición (a mano o sola).
export const MIN_TO_PUBLISH = 5;

export type EditionState = 'draft' | 'published' | 'retired';

export interface EditionRow {
  id: string;
  edition_date: string;
  intro: string | null;
  is_published: boolean;
  is_draft: boolean;
  auto_publish_at: string | null;
  published_at: string | null;
  created_at: string | null;
}

export const EDITION_ADMIN_COLUMNS =
  'id, edition_date, intro, is_published, is_draft, auto_publish_at, published_at, created_at';

export function editionState(e: Pick<EditionRow, 'is_published' | 'is_draft'>): EditionState {
  if (e.is_published) return 'published';
  return e.is_draft ? 'draft' : 'retired';
}

// ¿El error de Supabase significa "esa tabla/columna todavía no existe"?
export function isMissingSchema(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === '42P01' || // undefined_table (Postgres)
    error.code === '42703' || // undefined_column (Postgres)
    error.code === 'PGRST205' || // tabla no encontrada en la caché de PostgREST
    error.code === 'PGRST204' || // columna no encontrada en la caché de PostgREST
    /news_editions|edition_id|is_draft|auto_publish_at/i.test(error.message || '')
  );
}

export const MISSING_DRAFTS_SCHEMA =
  'Faltan las columnas de borradores: ejecuta supabase/news-drafts.sql en Supabase.';

export function revalidateNews(editionDate?: string) {
  revalidatePath('/'); // la portada enseña la última edición
  revalidatePath('/actualidad');
  revalidatePath('/actualidad/archivo');
  if (editionDate) revalidatePath(`/actualidad/${editionDate}`);
  revalidatePath('/sitemap.xml');
}

/**
 * Publica una edición. Devuelve el nº de noticias publicadas, o null si la
 * edición ya no estaba en el estado esperado (otra acción se adelantó).
 *
 * Orden y concurrencia: primero se RECLAMA la edición con un UPDATE
 * condicional (solo si sigue sin publicar y, para el cron, si sigue siendo un
 * borrador vencido), así una pausa o un descarte hechos mientras tanto ganan.
 * Después se publican sus noticias; si eso falla, la edición vuelve a su
 * estado anterior. Mientras tanto la web no la muestra: getLatest() salta las
 * ediciones sin noticias publicadas.
 */
export async function publishEdition(
  admin: SupabaseClient,
  edition: EditionRow,
  opts: { onlyIfDue?: boolean } = {}
): Promise<number | null> {
  const { count, error: countError } = await admin
    .from('news_items')
    .select('id', { count: 'exact', head: true })
    .eq('edition_id', edition.id);
  if (countError) throw new Error(`Error contando noticias: ${countError.message}`);
  if ((count ?? 0) < MIN_TO_PUBLISH) {
    throw new Error(
      `La edición tiene ${count ?? 0} noticias; hacen falta al menos ${MIN_TO_PUBLISH} para publicarla.`
    );
  }

  let claim = admin
    .from('news_editions')
    .update({
      is_published: true,
      is_draft: false,
      auto_publish_at: null,
      published_at: new Date().toISOString(),
    })
    .eq('id', edition.id)
    .eq('is_published', false);
  if (opts.onlyIfDue) {
    claim = claim.eq('is_draft', true).lte('auto_publish_at', new Date().toISOString());
  }
  const { data: claimed, error: claimError } = await claim.select('id');
  if (claimError) throw new Error(`Error publicando la edición: ${claimError.message}`);
  if (!claimed?.length) return null;

  const { error: itemsError } = await admin
    .from('news_items')
    .update({ is_published: true })
    .eq('edition_id', edition.id);
  if (itemsError) {
    await admin
      .from('news_editions')
      .update({
        is_published: false,
        is_draft: edition.is_draft,
        auto_publish_at: edition.auto_publish_at,
        published_at: edition.published_at,
      })
      .eq('id', edition.id);
    throw new Error(`Error publicando las noticias: ${itemsError.message}`);
  }

  revalidateNews(edition.edition_date);
  return count ?? 0;
}

/**
 * Aviso por correo de que hay un borrador esperando revisión. Destinatarios:
 * NEWS_REVIEW_EMAIL (lista separada por comas) o, si no existe, ADMIN_EMAIL.
 * Best-effort: si falla, el borrador sigue ahí y se publicará igual.
 */
export async function notifyDraftReady(opts: {
  editionDate: string;
  titles: string[];
  autoPublishAt: string;
}): Promise<string | null> {
  const to = (process.env.NEWS_REVIEW_EMAIL || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (to.length === 0) return 'Sin NEWS_REVIEW_EMAIL ni ADMIN_EMAIL: no se avisa por correo.';

  const when = new Date(opts.autoPublishAt).toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  });
  const reviewUrl = `${SITE_URL}/admin/actualidad`;
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const list = opts.titles.map((t) => `<li style="margin:0 0 6px">${escape(t)}</li>`).join('');

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Refugio en la Palabra <onboarding@resend.dev>',
      to,
      subject: `Actualidad: la edición del ${opts.editionDate} está lista para revisar`,
      html: `<div style="font-family:Georgia,serif;color:#1f2a44;max-width:560px;line-height:1.5">
<p>La edición de esta semana de <strong>Actualidad</strong> está preparada como borrador (${opts.titles.length} noticias):</p>
<ul style="padding-left:18px">${list}</ul>
<p>Puedes quitar, corregir o añadir noticias y publicarla cuando quieras:</p>
<p><a href="${reviewUrl}" style="display:inline-block;background:#1f2a44;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Revisar la edición</a></p>
<p style="color:#666;font-size:14px">Si nadie la toca, se publicará sola el ${when}.</p>
</div>`,
    });
    return error ? `Error enviando el aviso: ${error.message}` : null;
  } catch (err) {
    return `Error enviando el aviso: ${err instanceof Error ? err.message : String(err)}`;
  }
}
