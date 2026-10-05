// URLs canónicas del sitio. Fuente única de verdad para enlaces hardcodeados.

/** Dominio público del sitio (producción). */
export const SITE_URL = 'https://www.refugioenlapalabra.com';

/**
 * URL de la app donde se accede/instala el producto.
 * Manda `NEXT_PUBLIC_APP_URL` (Vercel); el literal es solo el respaldo.
 * Se quita la barra final para que `${APP_URL}/ruta` nunca genere `//ruta`.
 */
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://app.refugioenlapalabra.com'
).replace(/\/+$/, '');

/** Perfil de Instagram (variante canónica, sin parámetros de tracking). */
export const INSTAGRAM_URL = 'https://www.instagram.com/refugioenlapalabra_';
