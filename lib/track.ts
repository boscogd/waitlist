// =====================================================
// TRACKING PROPIO DE LA LANDING (cliente)
// =====================================================
// Envía páginas vistas y eventos a POST /api/track, que los guarda en la
// tabla `site_events` de Supabase (ver supabase/analytics-schema.sql).
//
// Sin cookies: la "sesión" es sessionStorage (muere al cerrar la pestaña).
// En la primera página vista guardamos la ATRIBUCIÓN de la visita (de dónde
// viene, utm, página de entrada) y con ella:
//   - marcamos esa página vista como entrada (is_entry) en site_events;
//   - construimos el enlace a la app (buildAppUrl) para que la app guarde el
//     origen en profiles.signup_attribution al crear la cuenta.
// El identificador de visitante lo calcula el servidor; aquí no hay ids.
//
// En localhost no se envía nada a /api/track (para no ensuciar los datos de
// producción) salvo que pongas `localStorage.rp_track_local = '1'`. La
// atribución sí se guarda siempre.

import { APP_URL } from '@/lib/constants';

const ENDPOINT = '/api/track';
const ATTR_KEY = 'rp_attr';

type Attribution = {
  landing: string; // página de entrada
  day: string; // YYYY-MM-DD (día de la visita, hora local)
  referrer?: string; // URL completa de origen (solo si es externa)
  ref?: string; // dominio de origen sin www.
  s?: string; // utm_source
  m?: string; // utm_medium
  c?: string; // utm_campaign
};

type Payload = {
  t: 'pageview' | 'event';
  n?: string;
  p: string;
  e?: boolean;
  r?: string;
  u?: { s?: string; m?: string; c?: string };
  pr?: Record<string, string | number | boolean>;
};

function enabled(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  if (!isLocal) return true;
  try {
    return window.localStorage.getItem('rp_track_local') === '1';
  } catch {
    return false;
  }
}

function localDay(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function readAttribution(): Attribution | null {
  try {
    const raw = window.sessionStorage.getItem(ATTR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && typeof parsed.landing === 'string' ? (parsed as Attribution) : null;
  } catch {
    return null;
  }
}

// Construye la atribución de la visita actual a partir de la URL y el
// referrer. Solo se usa en la primera página vista de la sesión.
function buildAttribution(path: string): Attribution {
  const attr: Attribution = { landing: path, day: localDay() };

  const ref = document.referrer;
  if (ref) {
    try {
      const refUrl = new URL(ref);
      if (refUrl.hostname !== window.location.hostname) {
        attr.referrer = ref.slice(0, 500);
        attr.ref = refUrl.hostname.toLowerCase().replace(/^www\./, '').slice(0, 120);
      }
    } catch {
      // referrer no parseable: lo ignoramos
    }
  }

  const params = new URLSearchParams(window.location.search);
  const s = params.get('utm_source');
  const m = params.get('utm_medium');
  const c = params.get('utm_campaign');
  if (s) attr.s = s.slice(0, 80);
  if (m) attr.m = m.slice(0, 80);
  if (c) attr.c = c.slice(0, 80);

  return attr;
}

// Devuelve la atribución de la sesión, creándola si es la primera página.
// `isEntry` indica si acaba de crearse (= esta página vista es la entrada).
function ensureAttribution(path: string): { attr: Attribution; isEntry: boolean } {
  const existing = readAttribution();
  if (existing) return { attr: existing, isEntry: false };
  const attr = buildAttribution(path);
  try {
    window.sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr));
  } catch {
    // sin sessionStorage cada vista cuenta como entrada; no hay más que hacer
  }
  return { attr, isEntry: true };
}

function send(payload: Payload) {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator.sendBeacon === 'function') {
      const ok = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (ok) return;
    }
  } catch {
    // caemos a fetch
  }
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

// Página vista. Solo la primera de la sesión lleva referrer + utm (is_entry).
export function trackPageview(path: string) {
  if (typeof window === 'undefined') return;
  if (path.startsWith('/admin')) return;

  // La atribución se guarda siempre (la usa buildAppUrl), se envíe o no.
  const { attr, isEntry } = ensureAttribution(path);
  if (!enabled()) return;

  const payload: Payload = { t: 'pageview', p: path, e: isEntry };
  if (isEntry) {
    if (attr.referrer) payload.r = attr.referrer;
    if (attr.s || attr.m || attr.c) {
      payload.u = {};
      if (attr.s) payload.u.s = attr.s;
      if (attr.m) payload.u.m = attr.m;
      if (attr.c) payload.u.c = attr.c;
    }
  }
  send(payload);
}

// Evento de interacción (clic en "Instalar", Instagram, feedback enviado...).
// `name`: snake_case, máx. 40 caracteres. `props`: valores planos.
export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  if (!enabled()) return;
  send({
    t: 'event',
    n: name,
    p: window.location.pathname,
    pr: props && Object.keys(props).length > 0 ? props : undefined,
  });
}

// =====================================================
// ENLACE A LA APP CON ORIGEN (web → app)
// =====================================================
// La app (index.html de refugio-rosario-letanias) lee estos parámetros al
// abrirse, los guarda en localStorage y los copia a
// profiles.signup_attribution cuando el usuario crea la cuenta:
//   src=web           siempre
//   utm_source/medium/campaign   si la visita a la landing los traía
//   web_ref           dominio de origen (instagram.com, google.com...)
//   web_landing       página de entrada en la landing
//   web_where         botón pulsado (principal | final)
//   web_day           día de la visita
// OJO: no usar `ref` (en la app es el id del usuario que invita) ni `code`
// (lo consume la recuperación de contraseña de Supabase).
export function buildAppUrl(where?: string): string {
  const params = new URLSearchParams({ src: 'web' });
  if (typeof window !== 'undefined') {
    const attr = readAttribution();
    if (attr) {
      if (attr.s) params.set('utm_source', attr.s);
      if (attr.m) params.set('utm_medium', attr.m);
      if (attr.c) params.set('utm_campaign', attr.c);
      if (attr.ref) params.set('web_ref', attr.ref);
      params.set('web_landing', attr.landing);
      params.set('web_day', attr.day);
    }
  }
  if (where) params.set('web_where', where);
  return `${APP_URL}/?${params.toString()}`;
}
