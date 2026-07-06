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

// Verifica el Authorization de las peticiones a los crons/campañas:
// - `Bearer <CRON_SECRET>`      → petición del cron de Vercel (isCron: true)
// - `Bearer <ADMIN_SECRET_KEY>` → trigger manual del admin (isCron: false)
// Ambas comparaciones son constant-time sobre el header completo.
export function verifyCampaignAuth(
  request: Request
): { authorized: boolean; isCron: boolean; error?: string } {
  const authHeader = request.headers.get('authorization');
  // Vercel inyecta `Authorization: Bearer <CRON_SECRET>` en las peticiones del cron.
  if (authHeader && process.env.CRON_SECRET && safeEqual(authHeader, `Bearer ${process.env.CRON_SECRET}`)) {
    return { authorized: true, isCron: true };
  }
  if (authHeader && process.env.ADMIN_SECRET_KEY && safeEqual(authHeader, `Bearer ${process.env.ADMIN_SECRET_KEY}`)) {
    return { authorized: true, isCron: false };
  }
  return { authorized: false, isCron: false, error: 'No autorizado' };
}
