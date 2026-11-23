// =====================================================
// TIENDA · CESTA QUE SE COBRA (servidor)
// =====================================================
// El navegador solo manda slug, talla y cantidad. Los precios, el envío y las
// variantes de Printful salen siempre del catálogo, aquí. Solo se puede cobrar
// lo que tiene `pod` (la ropa bajo demanda); lo demás es de muestra.
import { ENVIO, precioDe, producto, type Producto } from '@/lib/tienda/catalogo';

/** Unidades máximas por pedido (sumando todas las líneas). */
export const MAX_UNIDADES = 20;
/** Unidades máximas por línea. */
export const MAX_POR_LINEA = 9;

export interface LineaCobro {
  producto: Producto;
  talla: string;
  cantidad: number;
  /** Precio por unidad en céntimos, IVA incluido. */
  unidadCent: number;
  /** variant_id del catálogo de Printful. */
  variantId: number;
}

export type ResultadoCesta =
  | { ok: true; lineas: LineaCobro[]; subtotalCent: number; envioCent: number }
  | { ok: false; error: string };

export const centimos = (euros: number) => Math.round(euros * 100);

/** Envío en céntimos para un subtotal en céntimos: 4,90 € o gratis desde 75 €. */
export function envioCent(subtotalCent: number) {
  return subtotalCent >= centimos(ENVIO.gratisDesde) ? 0 : centimos(ENVIO.coste);
}

/** Canarias (35, 38), Ceuta (51) y Melilla (52): no se envía (aduana e IGIC/IPSI). */
export function cpSinEnvio(cp: string | null | undefined) {
  const limpio = (cp ?? '').replace(/\s/g, '');
  return /^(35|38|51|52)\d{3}$/.test(limpio);
}

/** Comprueba la cesta que llega del navegador y le pone precio desde el catálogo. */
export function validarCesta(entrada: unknown): ResultadoCesta {
  if (!Array.isArray(entrada) || entrada.length === 0) return { ok: false, error: 'La cesta está vacía.' };
  if (entrada.length > 30) return { ok: false, error: 'La cesta tiene demasiadas líneas.' };

  const lineas: LineaCobro[] = [];
  let unidades = 0;
  for (const l of entrada) {
    const slug = typeof l?.slug === 'string' ? l.slug : '';
    const talla = typeof l?.talla === 'string' ? l.talla : '';
    const cantidad = l?.cantidad;
    const p = producto(slug);
    if (!p) return { ok: false, error: 'Hay un producto que no existe.' };
    if (!p.pod) return { ok: false, error: `${p.nombre} es de muestra y no se puede pagar todavía.` };
    const variantId = p.pod.variantes[talla];
    if (!variantId || !p.tallas?.includes(talla)) return { ok: false, error: `Elige una talla válida para ${p.nombre}.` };
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_POR_LINEA) {
      return { ok: false, error: `La cantidad de ${p.nombre} tiene que ser de 1 a ${MAX_POR_LINEA}.` };
    }
    const repetida = lineas.find((x) => x.producto.slug === slug && x.talla === talla);
    if (repetida) {
      if (repetida.cantidad + cantidad > MAX_POR_LINEA) {
        return { ok: false, error: `Como mucho ${MAX_POR_LINEA} de ${p.nombre} en talla ${talla}.` };
      }
      repetida.cantidad += cantidad;
    } else {
      lineas.push({ producto: p, talla, cantidad, unidadCent: centimos(precioDe(p, talla)), variantId });
    }
    unidades += cantidad;
  }
  if (unidades > MAX_UNIDADES) return { ok: false, error: `Como mucho ${MAX_UNIDADES} prendas por pedido.` };

  const subtotalCent = lineas.reduce((s, l) => s + l.unidadCent * l.cantidad, 0);
  return { ok: true, lineas, subtotalCent, envioCent: envioCent(subtotalCent) };
}

/** Cesta compacta para los metadatos de Stripe («camiseta-fiat:M:2|sudadera-refugio:2XL:1»; máx. 500 caracteres). */
export function codificarCesta(lineas: LineaCobro[]) {
  return lineas.map((l) => `${l.producto.slug}:${l.talla}:${l.cantidad}`).join('|');
}

/** Lo contrario de codificarCesta. Vuelve a validar contra el catálogo de hoy. */
export function decodificarCesta(texto: string | null | undefined): ResultadoCesta {
  if (!texto) return { ok: false, error: 'El pago no trae la cesta en los metadatos.' };
  const entrada = texto.split('|').map((trozo) => {
    const [slug, talla, cantidad] = trozo.split(':');
    return { slug, talla, cantidad: Number(cantidad) };
  });
  return validarCesta(entrada);
}
