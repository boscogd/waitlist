// =====================================================
// Fuentes de actualidad — Google News RSS (gratuito, sin API key)
// =====================================================
// Usamos búsquedas orientadas a "buenas noticias" de la Iglesia y la fe.
// La curación final (filtrar lo positivo + resumir) la hace la IA; aquí
// solo definimos de dónde sacamos los titulares candidatos.
//
// Nota legal: Google News RSS devuelve titular + enlace + fuente. Nunca
// guardamos el cuerpo del artículo; el resumen lo escribe la IA y siempre
// enlazamos al medio original.

// Términos sin nombres propios concretos (para no quedar desactualizados).
export const NEWS_QUERIES: string[] = [
  'Iglesia católica testimonio de fe',
  'Iglesia católica obra social ayuda solidaria',
  'beatificación santo milagro Iglesia',
  'jóvenes católicos vocación esperanza',
  'parroquia comunidad peregrinación',
  'Vaticano Papa mensaje',
];

export interface NewsEdition {
  hl: string; // idioma
  gl: string; // país
  ceid: string; // edición
  label: string;
}

// Dos ediciones que, juntas, cubren el mundo hispanohablante:
// - es-419 agrega Latinoamérica (México, Argentina, Colombia, Chile…)
// - es/ES cubre España.
export const NEWS_EDITIONS: NewsEdition[] = [
  { hl: 'es-419', gl: 'US', ceid: 'US:es-419', label: 'Latinoamérica' },
  { hl: 'es', gl: 'ES', ceid: 'ES:es', label: 'España' },
];

export function buildGoogleNewsRssUrl(query: string, edition: NewsEdition): string {
  const q = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${q}&hl=${edition.hl}&gl=${edition.gl}&ceid=${edition.ceid}`;
}
