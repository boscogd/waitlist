/**
 * Rate limiter para endpoints públicos.
 *
 * Usa Upstash Redis (compartido entre todas las instancias serverless) si
 * están configuradas las env vars UPSTASH_REDIS_REST_URL y
 * UPSTASH_REDIS_REST_TOKEN. Si no, cae a un limitador en memoria (no
 * compartido, pero suficiente para local/preview y como respaldo).
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type Result = { allowed: boolean; remaining: number };

// ── Fallback en memoria ──────────────────────────────────────────────
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowMs: number): Result {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (entry && now > entry.resetAt) memoryStore.delete(key);

  const current = memoryStore.get(key);
  if (!current) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (current.count >= limit) return { allowed: false, remaining: 0 };
  current.count++;
  return { allowed: true, remaining: limit - current.count };
}

// ── Upstash (si está configurado) ────────────────────────────────────
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Cacheamos un Ratelimit por (límite, ventana) para no recrearlo en cada hit.
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  let rl = limiterCache.get(cacheKey);
  if (!rl) {
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    rl = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s` as `${number} s`),
      prefix: 'rl',
      analytics: false,
    });
    limiterCache.set(cacheKey, rl);
  }
  return rl;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<Result> {
  if (!redis) return memoryLimit(key, limit, windowMs);
  try {
    const { success, remaining } = await getLimiter(limit, windowMs).limit(key);
    return { allowed: success, remaining };
  } catch {
    // Si Upstash falla, no penalizamos al usuario: caemos al fallback.
    return memoryLimit(key, limit, windowMs);
  }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
