// =====================================================
// TIENDA · EXISTENCIAS DE LO HECHO A MANO (solo servidor)
// =====================================================
// Las unidades que quedan de los belenes viven en Supabase
// (supabase/tienda-existencias.sql), no en el catálogo: así, cuando alguien
// compra, la web deja de ofrecer lo vendido sin tener que publicar nada.
// Solo cuenta con los pagos encendidos; en la demo manda `quedan` del catálogo.
import { cache } from 'react';
import { getServiceClient } from '@/lib/supabase-admin';
import { conExistencias, PRODUCTOS, type Existencias, type Producto } from '@/lib/tienda/catalogo';

const PAGOS = () => process.env.NEXT_PUBLIC_TIENDA_PAGOS === '1';

/**
 * Lo que queda de cada pieza hecha a mano, o null si no se puede leer (o los pagos están apagados).
 * Una sola lectura por petición aunque la pidan el layout y la página (cache de React).
 */
export const leerExistencias = cache(async (): Promise<Existencias | null> => {
  if (!PAGOS()) return null;
  try {
    const { data, error } = await getServiceClient().from('tienda_existencias').select('slug, quedan');
    if (error) throw new Error(error.message);
    const ex: Existencias = {};
    for (const f of data ?? []) if (typeof f.slug === 'string' && Number.isInteger(f.quedan)) ex[f.slug] = f.quedan;
    return ex;
  } catch (e) {
    console.error('[tienda] No se pueden leer las existencias:', e instanceof Error ? e.message : e);
    return null;
  }
});

/** Todo el catálogo con las existencias puestas. */
export async function catalogoVivo() {
  const ex = await leerExistencias();
  const productos = PRODUCTOS.map((p) => conExistencias(p, ex));
  return {
    existencias: ex,
    productos,
    producto: (slug: string) => productos.find((p) => p.slug === slug),
    porLinea: (linea: Producto['linea']) => productos.filter((p) => p.linea === linea),
  };
}

export type ResultadoDescuento =
  | { estado: 'ok'; avisoEnviado: boolean; confirmacionEnviada: boolean }
  | { estado: 'faltan'; faltan: { slug: string; pide: number; quedan: number }[] };

/**
 * Descuenta lo pagado en una sesión de Stripe, todo o nada. Idempotente por sesión: un aviso repetido devuelve
 * lo mismo que la primera vez. Lanza si Supabase falla (el webhook responde 500 y Stripe lo reintenta).
 */
export async function descontar(sesion: string, lineas: { slug: string; cantidad: number }[]): Promise<ResultadoDescuento> {
  const { data, error } = await getServiceClient().rpc('tienda_descontar', { p_sesion: sesion, p_lineas: lineas });
  if (error) throw new Error(`Supabase (tienda_descontar): ${error.message}`);
  if (data?.estado === 'ok') return { estado: 'ok', avisoEnviado: data.aviso_enviado === true, confirmacionEnviada: data.confirmacion_enviada === true };
  if (data?.estado === 'faltan') return { estado: 'faltan', faltan: Array.isArray(data.faltan) ? data.faltan : [] };
  throw new Error(`Supabase (tienda_descontar) ha devuelto algo raro: ${JSON.stringify(data)}`);
}

/** Apunta que ya salió un correo de un pedido con belenes (para no repetirlo en un reintento de días después). */
export async function marcarCorreo(sesion: string, correo: 'aviso' | 'confirmacion') {
  const { error } = await getServiceClient().rpc('tienda_marcar_correo', { p_sesion: sesion, p_correo: correo });
  // No se lanza: el correo ya ha salido. Si no se apunta, en el peor caso se repite pasadas 24 h.
  if (error) console.error('[tienda] No se ha podido apuntar el correo', correo, sesion, error.message);
}

/** Cómo quedó lo hecho a mano de un pago: 'ok', 'faltan' (se devolvió por agotado) o null si aún no se sabe. */
export async function estadoReserva(sesion: string): Promise<'ok' | 'faltan' | null> {
  if (!PAGOS()) return null;
  try {
    const { data, error } = await getServiceClient().from('tienda_reservas').select('estado').eq('sesion', sesion).maybeSingle();
    if (error) throw new Error(error.message);
    return data?.estado === 'ok' || data?.estado === 'faltan' ? data.estado : null;
  } catch (e) {
    console.error('[tienda] No se puede leer la reserva:', e instanceof Error ? e.message : e);
    return null;
  }
}
