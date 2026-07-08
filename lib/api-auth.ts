import crypto from 'crypto';

// =====================================================
// AUTENTICACIÓN COMPARTIDA DE ENDPOINTS DE CAMPAÑA/CRON
// =====================================================
// Utilidades usadas por los crons (winback, code-reminder, news-refresh)
// para verificar el header Authorization sin duplicar código.

// Comparación constant-time para evitar timing attacks. Hasheamos ambos
// lados con SHA-256 antes de comparar: así los buffers siempre miden lo
// mismo (timingSafeEqual no lanza) y no se filtra ni la longitud del
// secreto por el tiempo de respuesta.
export function safeEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// =====================================================
// AUTENTICACIÓN DEL PANEL ADMIN (cookie httpOnly o Bearer)
// =====================================================

// Hash del token de sesión admin. IDÉNTICO al de middleware.ts y
// app/api/admin/login/route.ts: SHA-256 hex de `key + '-refugio-admin-session'`.
// El valor que devuelve es el que se guarda en la cookie `admin-session`.
export async function hashAdminToken(key: string): Promise<string> {
  return crypto
    .createHash('sha256')
    .update(key + '-refugio-admin-session')
    .digest('hex');
}

// Parsea el header `cookie` y devuelve el valor de la cookie `name` (o null).
export function getCookieValue(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const k = part.slice(0, eq).trim();
    if (k === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return null;
}

// Verifica que la petición viene de un admin autenticado. Retrocompatible:
//   (a) cookie httpOnly `admin-session` con hash válido, O
//   (b) header `Authorization: Bearer <ADMIN_SECRET_KEY>` (legado).
// Ambas comprobaciones son constant-time (safeEqual).
export async function verifyAdminAuth(request: Request): Promise<boolean> {
  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (!adminKey) return false;

  // (a) Cookie de sesión: comparamos su valor con el hash esperado.
  const sessionToken = getCookieValue(request, 'admin-session');
  if (sessionToken) {
    const expected = await hashAdminToken(adminKey);
    if (safeEqual(sessionToken, expected)) return true;
  }

  // (b) Legado: Bearer con la clave admin en claro (lo usa EmailsAdmin aún).
  const authHeader = request.headers.get('authorization');
  if (authHeader && safeEqual(authHeader, `Bearer ${adminKey}`)) return true;

  return false;
}

// Verifica el Authorization de las peticiones a los crons/campañas:
// - `Bearer <CRON_SECRET>`      → petición del cron de Vercel (isCron: true)
// - `Bearer <ADMIN_SECRET_KEY>` → trigger manual del admin (isCron: false)
// - cookie `admin-session` válida → trigger manual del admin (isCron: false)
// Así el panel win-back puede disparar ejecuciones manuales con la cookie
// httpOnly sin exponer la clave en el navegador. La rama de CRON no cambia.
// Todas las comparaciones son constant-time.
export async function verifyCampaignAuth(
  request: Request
): Promise<{ authorized: boolean; isCron: boolean; error?: string }> {
  const authHeader = request.headers.get('authorization');
  // Vercel inyecta `Authorization: Bearer <CRON_SECRET>` en las peticiones del cron.
  if (authHeader && process.env.CRON_SECRET && safeEqual(authHeader, `Bearer ${process.env.CRON_SECRET}`)) {
    return { authorized: true, isCron: true };
  }
  // Admin vía Bearer (legado) O vía cookie de sesión httpOnly.
  if (await verifyAdminAuth(request)) {
    return { authorized: true, isCron: false };
  }
  return { authorized: false, isCron: false, error: 'No autorizado' };
}
