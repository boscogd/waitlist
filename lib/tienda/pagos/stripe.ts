// =====================================================
// TIENDA · STRIPE (sin SDK)
// =====================================================
// Llamadas a la API REST de Stripe con fetch (cuerpo form-urlencoded) y
// verificación a mano de la firma de los webhooks. Solo servidor.
import { createHmac, timingSafeEqual } from 'node:crypto';

const API = 'https://api.stripe.com/v1';
// Versión fija: así la forma de la sesión (shipping_details, customer_details…)
// no cambia aunque cambie la versión por defecto de la cuenta.
const VERSION = '2024-06-20';

export class ErrorStripe extends Error {
  constructor(
    message: string,
    public estado: number,
    public codigo?: string
  ) {
    super(message);
  }
}

export function stripeConfigurado() {
  return !!process.env.STRIPE_SECRET_KEY;
}

type Valor = string | number | boolean | null | undefined | Valor[] | { [k: string]: Valor };

/** Aplana un objeto a la notación de Stripe: line_items[0][price_data][currency]=eur. */
export function aFormulario(datos: Record<string, Valor>): URLSearchParams {
  const params = new URLSearchParams();
  const poner = (clave: string, v: Valor) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((x, i) => poner(`${clave}[${i}]`, x));
    else if (typeof v === 'object') for (const [k, x] of Object.entries(v)) poner(`${clave}[${k}]`, x);
    else params.append(clave, String(v));
  };
  for (const [k, v] of Object.entries(datos)) poner(k, v);
  return params;
}

async function llamar<T>(
  metodo: 'GET' | 'POST',
  ruta: string,
  datos?: Record<string, Valor>,
  idempotencia?: string
): Promise<T> {
  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) throw new ErrorStripe('Falta STRIPE_SECRET_KEY', 503);
  const cuerpo = datos ? aFormulario(datos).toString() : '';
  const url = metodo === 'GET' && cuerpo ? `${API}${ruta}?${cuerpo}` : `${API}${ruta}`;
  const res = await fetch(url, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${clave}`,
      'Stripe-Version': VERSION,
      ...(metodo === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(idempotencia ? { 'Idempotency-Key': idempotencia } : {}),
    },
    body: metodo === 'POST' ? cuerpo : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = json?.error ?? {};
    throw new ErrorStripe(e.message || `Stripe respondió ${res.status}`, res.status, e.code);
  }
  return json as T;
}

// ─── Tipos (solo lo que usamos) ───

export interface Direccion {
  line1: string | null;
  line2: string | null;
  postal_code: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface SesionCheckout {
  id: string;
  mode: string;
  status: string | null;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  payment_intent: string | null;
  amount_subtotal: number | null;
  amount_total: number | null;
  currency: string | null;
  created: number;
  metadata: Record<string, string> | null;
  customer_details: { email: string | null; name: string | null; phone: string | null; address: Direccion | null } | null;
  shipping_details?: { name: string | null; address: Direccion | null } | null;
  // Versiones nuevas de la API lo mueven aquí; leemos las dos por si acaso.
  collected_information?: { shipping_details?: { name: string | null; address: Direccion | null } | null } | null;
  shipping_cost: { amount_total: number } | null;
  total_details: { amount_discount: number; amount_shipping: number; amount_tax: number } | null;
}

export interface LineaSesion {
  id: string;
  quantity: number;
  amount_total: number;
  amount_subtotal: number;
  description: string;
  price: { unit_amount: number | null; product: string | { id: string; name: string; metadata: Record<string, string> } } | null;
}

export function envioDeSesion(s: SesionCheckout) {
  return s.collected_information?.shipping_details ?? s.shipping_details ?? null;
}

// ─── Checkout ───

export interface DatosCheckout {
  lineas: { nombre: string; descripcion: string; imagen?: string; unidadCent: number; cantidad: number; slug: string; talla: string; variante: number; archivo: string }[];
  envioCent: number;
  cesta: string;
  base: string;
}

export function crearSesionCheckout(d: DatosCheckout) {
  return llamar<SesionCheckout & { url: string }>('POST', '/checkout/sessions', {
    mode: 'payment',
    locale: 'es',
    currency: 'eur',
    line_items: d.lineas.map((l) => ({
      quantity: l.cantidad,
      price_data: {
        currency: 'eur',
        unit_amount: l.unidadCent,
        product_data: {
          name: `${l.nombre} · talla ${l.talla}`,
          description: l.descripcion,
          images: l.imagen ? [l.imagen] : undefined,
          metadata: { slug: l.slug, talla: l.talla, nombre: l.nombre, variante: String(l.variante), archivo: l.archivo },
        },
      },
    })),
    shipping_address_collection: { allowed_countries: ['ES'] },
    phone_number_collection: { enabled: true },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: d.envioCent === 0 ? 'Envío gratis (península y Baleares)' : 'Envío a península y Baleares',
          fixed_amount: { amount: d.envioCent, currency: 'eur' },
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 10 },
          },
        },
      },
    ],
    custom_text: {
      shipping_address: {
        message: 'Solo enviamos a la península y Baleares. No a Canarias, Ceuta ni Melilla.',
      },
      submit: {
        message: `Al pagar aceptas las [condiciones de venta](${d.base}/tienda/condiciones). Cada prenda se fabrica al pedirla (casi siempre en Barcelona) y llega en 5 a 10 días laborables.`,
      },
    },
    success_url: `${d.base}/tienda/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${d.base}/tienda`,
    metadata: { tienda: 'refugio', cesta: d.cesta },
    payment_intent_data: {
      description: 'Tienda Refugio en la Palabra',
      metadata: { tienda: 'refugio', cesta: d.cesta },
    },
  });
}

export function leerSesion(id: string) {
  return llamar<SesionCheckout>('GET', `/checkout/sessions/${encodeURIComponent(id)}`);
}

/** Líneas de la sesión con el producto expandido (para leer slug y talla de sus metadatos). */
export async function leerLineas(id: string) {
  const r = await llamar<{ data: LineaSesion[] }>('GET', `/checkout/sessions/${encodeURIComponent(id)}/line_items`, {
    limit: 100,
    expand: ['data.price.product'],
  });
  return r.data;
}

/** Devuelve todo el pago. Idempotente por sesión: aunque el webhook se repita, solo hay un reembolso. */
export function reembolsar(paymentIntent: string, sesionId: string, motivo: string) {
  return llamar<{ id: string; amount: number; status: string }>(
    'POST',
    '/refunds',
    { payment_intent: paymentIntent, reason: 'requested_by_customer', metadata: { motivo, sesion: sesionId } },
    `reembolso-${sesionId}`
  );
}

/** Formato de los id de sesión de Checkout (para no llamar a Stripe con cualquier cosa). */
export const ID_SESION = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

// ─── Webhooks ───

/** Tolerancia de la marca de tiempo de la firma (5 minutos), como la librería oficial. */
export const TOLERANCIA_FIRMA_S = 300;

/**
 * Verifica la cabecera Stripe-Signature («t=…,v1=…,v1=…») de un webhook:
 * HMAC-SHA256 de `${t}.${cuerpo}` con el secreto del endpoint, comparado en
 * tiempo constante, y la marca de tiempo a menos de 5 minutos.
 */
export function verificarFirma(cuerpo: string, cabecera: string | null, secreto: string, ahoraS = Math.floor(Date.now() / 1000)) {
  if (!cabecera || !secreto) return false;
  let t: number | null = null;
  const firmas: string[] = [];
  for (const parte of cabecera.split(',')) {
    const i = parte.indexOf('=');
    if (i < 1) continue;
    const k = parte.slice(0, i).trim();
    const v = parte.slice(i + 1).trim();
    if (k === 't' && /^\d+$/.test(v)) t = Number(v);
    if (k === 'v1' && /^[0-9a-f]{64}$/.test(v)) firmas.push(v);
  }
  if (t === null || firmas.length === 0) return false;
  if (Math.abs(ahoraS - t) > TOLERANCIA_FIRMA_S) return false;
  const esperada = createHmac('sha256', secreto).update(`${t}.${cuerpo}`, 'utf8').digest();
  return firmas.some((f) => {
    const recibida = Buffer.from(f, 'hex');
    return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
  });
}

/** Firma un cuerpo como lo haría Stripe (para pruebas). */
export function firmarComoStripe(cuerpo: string, secreto: string, t = Math.floor(Date.now() / 1000)) {
  const v1 = createHmac('sha256', secreto).update(`${t}.${cuerpo}`, 'utf8').digest('hex');
  return `t=${t},v1=${v1}`;
}
