// =====================================================
// ACTUALIDAD — validación de noticias (servidor)
// =====================================================
// Compartida por /api/news-publish (trabajo semanal) y /api/admin/news
// (panel de Aida): las mismas reglas valgan por donde entre la noticia.

export const MIN_ITEMS = 5;
export const MAX_ITEMS = 12;
const MAX_AGE_DAYS = 45; // ventana de "actualidad"

export interface IncomingItem {
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  country?: string | null;
  published_at: string;
}

export interface CleanItem {
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  country: string;
  published_at: string;
}

// Texto plano: recorta, colapsa espacios y rechaza HTML.
export function cleanText(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== 'string') throw new Error(`"${field}" debe ser texto`);
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length < min || text.length > max) {
    throw new Error(`"${field}" debe tener entre ${min} y ${max} caracteres (tiene ${text.length})`);
  }
  if (/<[a-z!/][^>]*>/i.test(text)) throw new Error(`"${field}" no puede contener HTML`);
  return text;
}

export function cleanTitle(value: unknown): string {
  return cleanText(value, 'title', 15, 140);
}

export function cleanSummary(value: unknown): string {
  return cleanText(value, 'summary', 60, 420);
}

export function cleanUrl(value: unknown): string {
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

export function cleanDate(value: unknown): string {
  if (typeof value !== 'string') throw new Error('"published_at" debe ser texto ISO');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`"published_at" no es una fecha válida: ${value}`);
  const ageDays = (Date.now() - date.getTime()) / 86_400_000;
  if (ageDays > MAX_AGE_DAYS) throw new Error(`"published_at" tiene más de ${MAX_AGE_DAYS} días: ${value}`);
  if (ageDays < -1) throw new Error(`"published_at" está en el futuro: ${value}`);
  return date.toISOString();
}

export function cleanItem(entry: unknown): CleanItem {
  if (!entry || typeof entry !== 'object') throw new Error('no es un objeto');
  const it = entry as Partial<IncomingItem>;
  return {
    title: cleanTitle(it.title),
    summary: cleanSummary(it.summary),
    source_name: cleanText(it.source_name, 'source_name', 2, 60),
    source_url: cleanUrl(it.source_url),
    country:
      it.country == null || it.country === ''
        ? 'Internacional'
        : cleanText(it.country, 'country', 2, 40),
    published_at: cleanDate(it.published_at),
  };
}

export function validateItems(raw: unknown): CleanItem[] {
  if (!Array.isArray(raw)) throw new Error('"items" debe ser un array');
  if (raw.length < MIN_ITEMS || raw.length > MAX_ITEMS) {
    throw new Error(`"items" debe tener entre ${MIN_ITEMS} y ${MAX_ITEMS} noticias (tiene ${raw.length})`);
  }
  const seenUrls = new Set<string>();
  return raw.map((entry, index) => {
    try {
      const item = cleanItem(entry);
      const key = item.source_url.toLowerCase();
      if (seenUrls.has(key)) throw new Error(`"source_url" repetida: ${item.source_url}`);
      seenUrls.add(key);
      return item;
    } catch (err) {
      throw new Error(`items[${index}]: ${err instanceof Error ? err.message : String(err)}`);
    }
  });
}

// Entradilla de la semana: opcional, texto propio.
export function cleanIntro(value: unknown): string | null {
  if (value == null || value === '') return null;
  return cleanText(value, 'intro', 80, 600);
}

// Fecha de hoy en Madrid, YYYY-MM-DD (la edición se publica "el lunes" de allí).
export function todayInMadrid(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
}
