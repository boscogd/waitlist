import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// =====================================================
// POST /api/track — analítica propia de la landing
// =====================================================
// Recibe páginas vistas y eventos desde lib/track.ts y los guarda en
// `site_events` (supabase/analytics-schema.sql) con la anon key: la tabla
// tiene política de INSERT para anon y ninguna de SELECT.
//
// Privacidad: no se guarda IP ni user-agent. El visitante es un hash de
// (sal diaria + IP + user-agent) recortado a 16 caracteres, así que no es
// enlazable entre días. Geo: cabeceras de Vercel (x-vercel-ip-*).
//
// Siempre responde 204 (incluso si descartamos el evento) para que el
// cliente no reintente ni muestre errores.

export const dynamic = 'force-dynamic';

const BOT_RE =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|pingdom|uptime|monitor|preview|facebookexternalhit|whatsapp|telegram|discord|python-requests|axios|curl\/|wget|go-http-client|java\/|okhttp|vercel-screenshot/i;

const EVENT_NAME_RE = /^[a-z0-9_]{1,40}$/;

const OWN_HOSTS = new Set([
  'refugioenlapalabra.com',
  'www.refugioenlapalabra.com',
  'app.refugioenlapalabra.com',
]);

function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

function noContent() {
  return new NextResponse(null, { status: 204 });
}

// Dominio del referrer sin "www."; null si es nuestro propio dominio.
function referrerHost(ref: string | null): string | null {
  if (!ref) return null;
  try {
    const host = new URL(ref).hostname.toLowerCase();
    if (OWN_HOSTS.has(host)) return null;
    return host.replace(/^www\./, '').slice(0, 120);
  } catch {
    return null;
  }
}

// Clasificación mínima del user-agent (no necesitamos más granularidad).
function parseUserAgent(ua: string): { device: string; os: string; browser: string } {
  const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const isMobile = !isTablet && /Mobi|iPhone|iPod|Android|Windows Phone|webOS/i.test(ua);
  const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  let os = 'Otro';
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Otro';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/CriOS/i.test(ua)) browser = 'Chrome';
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && /Version\//i.test(ua)) browser = 'Safari';

  return { device, os, browser };
}

// Hash de visitante con sal diaria (UTC): mismo visitante = mismo hash
// dentro del día; distinto al día siguiente.
function visitorHash(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.ANALYTICS_SALT || process.env.ADMIN_SECRET_KEY || 'refugio-en-la-palabra';
  const salt = crypto.createHash('sha256').update(`${day}|${secret}`).digest('hex');
  return crypto.createHash('sha256').update(`${salt}|${ip}|${ua}`).digest('hex').slice(0, 16);
}

export async function POST(request: Request) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (!ua || BOT_RE.test(ua)) return noContent();

    // Tope generoso por IP: una persona no genera 120 eventos por minuto.
    const ip = getClientIp(request);
    const { allowed } = await checkRateLimit(`track:${ip}`, 120, 60 * 1000);
    if (!allowed) return noContent();

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return noContent();
    }
    if (!body || typeof body !== 'object') return noContent();

    const kind: 'pageview' | 'event' = body.t === 'event' ? 'event' : 'pageview';
    const path = str(body.p, 300);
    if (!path || !path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) {
      return noContent();
    }

    let name = 'pageview';
    if (kind === 'event') {
      const n = str(body.n, 40);
      if (!n || !EVENT_NAME_RE.test(n)) return noContent();
      name = n;
    }

    const isEntry = kind === 'pageview' && body.e === true;
    const referrer = isEntry ? str(body.r, 500) : null;
    const refHost = referrerHost(referrer);
    const utm = isEntry && body.u && typeof body.u === 'object' ? (body.u as Record<string, unknown>) : null;

    let props: Record<string, unknown> | null = null;
    if (body.pr && typeof body.pr === 'object' && !Array.isArray(body.pr)) {
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(body.pr as Record<string, unknown>)) {
        if (!/^[a-z0-9_-]{1,32}$/i.test(k)) continue;
        if (typeof v === 'string') clean[k] = v.slice(0, 120);
        else if (typeof v === 'number' || typeof v === 'boolean') clean[k] = v;
      }
      if (Object.keys(clean).length > 0 && JSON.stringify(clean).length <= 1500) props = clean;
    }

    const { device, os, browser } = parseUserAgent(ua);

    // Geo de Vercel (en local no existen: quedan null)
    const country = str(request.headers.get('x-vercel-ip-country'), 2);
    const region = str(request.headers.get('x-vercel-ip-country-region'), 40);
    const cityRaw = request.headers.get('x-vercel-ip-city');
    let city: string | null = null;
    if (cityRaw) {
      try {
        city = decodeURIComponent(cityRaw).slice(0, 80);
      } catch {
        city = cityRaw.slice(0, 80);
      }
    }

    // Mismo patrón que el resto de rutas admin: el genérico de supabase-js
    // no resuelve la tabla desde lib/types.ts y colapsa a never.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('site_events').insert({
      kind,
      name,
      path,
      is_entry: isEntry,
      referrer_host: refHost,
      referrer: refHost ? referrer : null,
      utm_source: utm ? str(utm.s, 80) : null,
      utm_medium: utm ? str(utm.m, 80) : null,
      utm_campaign: utm ? str(utm.c, 80) : null,
      country,
      region,
      city,
      device,
      os,
      browser,
      visitor_hash: visitorHash(ip, ua),
      props,
    });

    if (error) {
      // Lo dejamos en los logs de Vercel; el visitante nunca ve nada.
      console.error('[track] insert error:', error.message);
    }
    return noContent();
  } catch (err) {
    console.error('[track] error:', err instanceof Error ? err.message : err);
    return noContent();
  }
}
