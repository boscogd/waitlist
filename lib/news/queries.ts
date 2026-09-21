import { supabase } from '@/lib/supabase';

// =====================================================
// ACTUALIDAD — lecturas públicas (cliente anon, solo lo publicado por RLS)
// =====================================================
// Todas las funciones devuelven vacío/null si algo falla (tabla sin crear,
// red caída en build…): la web nunca se rompe por las noticias.
//
// COMPATIBILIDAD: las ediciones semanales (tabla `news_editions`, ver
// supabase/news-editions.sql) pueden no existir todavía. Si no hay
// ediciones, getLatest() cae al comportamiento antiguo: "todo lo publicado".

export const ACTUALIDAD_URL = 'https://www.refugioenlapalabra.com/actualidad';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  country: string | null;
  published_at: string | null;
  created_at: string | null;
}

export interface NewsEdition {
  id: string;
  edition_date: string; // YYYY-MM-DD
  intro: string | null;
  created_at: string | null;
}

const ITEM_COLUMNS = 'id, title, summary, source_name, source_url, country, published_at, created_at';
const EDITION_COLUMNS = 'id, edition_date, intro, created_at';

// Acceso laxo: estas tablas no están en los tipos generados de Supabase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** Ediciones publicadas, de la más reciente a la más antigua. */
export async function getEditions(limit = 200): Promise<NewsEdition[]> {
  try {
    const { data, error } = await db
      .from('news_editions')
      .select(EDITION_COLUMNS)
      .eq('is_published', true)
      .order('edition_date', { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data as NewsEdition[]) || [];
  } catch {
    return [];
  }
}

export async function getEditionByDate(date: string): Promise<NewsEdition | null> {
  if (!isEditionSlug(date)) return null;
  try {
    const { data, error } = await db
      .from('news_editions')
      .select(EDITION_COLUMNS)
      .eq('is_published', true)
      .eq('edition_date', date)
      .limit(1);
    if (error || !data?.length) return null;
    return data[0] as NewsEdition;
  } catch {
    return null;
  }
}

export async function getItemsByEdition(editionId: string): Promise<NewsItem[]> {
  try {
    const { data, error } = await db
      .from('news_items')
      .select(ITEM_COLUMNS)
      .eq('is_published', true)
      .eq('edition_id', editionId)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(40);
    if (error) return [];
    return (data as NewsItem[]) || [];
  } catch {
    return [];
  }
}

/** Comportamiento previo a las ediciones: todo lo publicado. */
async function getAllPublishedItems(): Promise<NewsItem[]> {
  try {
    const { data, error } = await db
      .from('news_items')
      .select(ITEM_COLUMNS)
      .eq('is_published', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(40);
    if (error) return [];
    return (data as NewsItem[]) || [];
  } catch {
    return [];
  }
}

export interface LatestNews {
  edition: NewsEdition | null; // null = modo antiguo (sin ediciones)
  items: NewsItem[];
  previous: NewsEdition[]; // ediciones anteriores, para enlazarlas
}

/** Lo que muestra /actualidad: la última edición con noticias. */
export async function getLatest(previousLimit = 6): Promise<LatestNews> {
  const editions = await getEditions(previousLimit + 3);
  for (let i = 0; i < editions.length; i++) {
    const items = await getItemsByEdition(editions[i].id);
    if (items.length > 0) {
      return {
        edition: editions[i],
        items,
        previous: editions.slice(i + 1, i + 1 + previousLimit),
      };
    }
  }
  return { edition: null, items: await getAllPublishedItems(), previous: [] };
}

// =====================================================
// Utilidades de presentación
// =====================================================

/** El slug de una edición es su fecha: 2026-09-21. */
export function isEditionSlug(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  });
}

/** "21 de septiembre de 2026" a partir de un slug YYYY-MM-DD (sin bailes de zona horaria). */
export function formatEditionDate(editionDate: string): string {
  return formatDate(`${editionDate}T12:00:00Z`);
}

export function editionPath(editionDate: string): string {
  return `/actualidad/${editionDate}`;
}

/** Fecha de la última tanda entre unas noticias (created_at más reciente). */
export function latestCreatedAt(items: NewsItem[]): string | null {
  let latest: string | null = null;
  for (const n of items) {
    if (n.created_at && (!latest || n.created_at > latest)) latest = n.created_at;
  }
  return latest;
}
