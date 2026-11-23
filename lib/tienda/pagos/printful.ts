// =====================================================
// TIENDA · PRINTFUL (API v1, sin SDK)
// =====================================================
// Los pedidos van con variantes del CATÁLOGO (variant_id) y el PNG del frente
// por URL pública, sin productos sincronizados: no hay que crear nada a mano en
// Printful. Solo servidor.
import { createHash } from 'node:crypto';

const API = 'https://api.printful.com';

export class ErrorPrintful extends Error {
  constructor(
    message: string,
    public estado: number
  ) {
    super(message);
  }
}

export function printfulConfigurado() {
  return !!process.env.PRINTFUL_API_TOKEN;
}

async function llamar<T>(metodo: 'GET' | 'POST', ruta: string, cuerpo?: unknown): Promise<T> {
  const token = process.env.PRINTFUL_API_TOKEN;
  if (!token) throw new ErrorPrintful('Falta PRINTFUL_API_TOKEN', 503);
  const tienda = process.env.PRINTFUL_STORE_ID;
  const res = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(tienda ? { 'X-PF-Store-Id': tienda } : {}),
      ...(cuerpo ? { 'Content-Type': 'application/json' } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || (typeof json?.result === 'string' ? json.result : '') || `Printful respondió ${res.status}`;
    throw new ErrorPrintful(msg, res.status);
  }
  return json.result as T;
}

// ─── Tipos (solo lo que usamos) ───

export interface Destinatario {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state_name?: string;
  country_code: 'ES';
  zip: string;
  phone?: string;
  email: string;
}

export interface ArticuloPedido {
  variant_id: number;
  quantity: number;
  name: string;
  retail_price: string;
  files: { type: 'front'; url: string }[];
}

export interface Envio {
  id: number;
  carrier: string;
  service: string;
  tracking_number: string;
  tracking_url: string;
  ship_date: string;
  shipped_at: number;
  reshipment: boolean;
}

export interface PedidoPrintful {
  id: number;
  external_id: string | null;
  status: string;
  recipient: Destinatario;
  items: { name: string; quantity: number; variant_id: number }[];
  shipments: Envio[];
  costs?: { total: string };
  retail_costs?: { total: string };
}

/** Identificador del pedido en Printful a partir de la sesión de Stripe (estable: sirve de llave de idempotencia). */
export function idExterno(sesionId: string) {
  return 'rp-' + createHash('sha256').update(sesionId).digest('hex').slice(0, 24);
}

/** Referencia corta que ve el cliente («RP-1A2B3C4D»), sacada del external_id. */
export const referenciaDe = (externalId: string) => 'RP-' + externalId.slice(3, 11).toUpperCase();

/** Lee un pedido por su external_id; null si no existe. */
export async function leerPedido(externalId: string): Promise<PedidoPrintful | null> {
  try {
    return await llamar<PedidoPrintful>('GET', `/orders/@${encodeURIComponent(externalId)}`);
  } catch (e) {
    if (e instanceof ErrorPrintful && e.estado === 404) return null;
    throw e;
  }
}

export interface DatosPedido {
  externalId: string;
  destinatario: Destinatario;
  articulos: ArticuloPedido[];
  /** Lo cobrado al cliente, en euros con dos decimales («25.00»). */
  cobrado: { subtotal: string; descuento: string; envio: string; total: string };
  referencia: string;
}

/**
 * Crea el pedido. Por defecto en borrador (no cobra ni se fabrica): solo se
 * confirma si PRINTFUL_CONFIRMAR=1. Idempotente: si ya existe un pedido con ese
 * external_id, lo devuelve sin crear otro.
 */
export async function crearPedido(d: DatosPedido): Promise<{ pedido: PedidoPrintful; yaExistia: boolean }> {
  const previo = await leerPedido(d.externalId);
  if (previo) return { pedido: previo, yaExistia: true };

  const confirmar = process.env.PRINTFUL_CONFIRMAR === '1';
  try {
    const pedido = await llamar<PedidoPrintful>('POST', `/orders?confirm=${confirmar ? 'true' : 'false'}`, {
      external_id: d.externalId,
      shipping: 'STANDARD',
      recipient: d.destinatario,
      items: d.articulos,
      retail_costs: {
        currency: 'EUR',
        subtotal: d.cobrado.subtotal,
        discount: d.cobrado.descuento,
        shipping: d.cobrado.envio,
      },
      packing_slip: {
        store_name: 'Refugio en la Palabra',
        email: process.env.TIENDA_CORREO || 'info@refugioenlapalabra.com',
        message: 'Gracias por tu pedido. Esta prenda se ha hecho solo para ti.',
        custom_order_id: d.referencia,
      },
    });
    return { pedido, yaExistia: false };
  } catch (e) {
    // Dos webhooks a la vez: el segundo choca con el external_id del primero.
    if (e instanceof ErrorPrintful && e.estado === 400 && /external/i.test(e.message)) {
      const otro = await leerPedido(d.externalId);
      if (otro) return { pedido: otro, yaExistia: true };
    }
    throw e;
  }
}

/** Eventos del webhook de Printful que atendemos (los registra scripts/tienda-printful-webhook.mjs). */
export const EVENTOS_WEBHOOK = ['package_shipped', 'order_failed', 'order_canceled', 'order_put_hold'] as const;
