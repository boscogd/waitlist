// =====================================================
// TIENDA · CESTA QUE SE COBRA (servidor)
// =====================================================
// El navegador solo manda slug, talla y cantidad. Los precios, el envío y las
// variantes de Printful salen siempre del catálogo, aquí. Solo se puede cobrar
// lo que tiene `pod` (la ropa bajo demanda) o `aMano` (los belenes); lo demás es
// de muestra. Las existencias de lo hecho a mano se comprueban aparte (existencias.ts).
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
  /** «pod»: la fabrica Printful. «mano»: la enviamos nosotros. */
  tipo: 'pod' | 'mano';
  /** variant_id del catálogo de Printful (solo la ropa bajo demanda). */
  variantId: number | null;
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
    if (!p.pod && !p.aMano) return { ok: false, error: `${p.nombre} es de muestra y no se puede pagar todavía.` };
    let variantId: number | null = null;
    if (p.pod) {
      variantId = p.pod.variantes[talla] ?? null;
      if (!variantId || !p.tallas?.includes(talla)) return { ok: false, error: `Elige una talla válida para ${p.nombre}.` };
    } else if (talla !== '') {
      return { ok: false, error: `${p.nombre} no tiene tallas.` };
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_POR_LINEA) {
      return { ok: false, error: `La cantidad de ${p.nombre} tiene que ser de 1 a ${MAX_POR_LINEA}.` };
    }
    const repetida = lineas.find((x) => x.producto.slug === slug && x.talla === talla);
    if (repetida) {
      if (repetida.cantidad + cantidad > MAX_POR_LINEA) {
        return { ok: false, error: `Como mucho ${MAX_POR_LINEA} de ${p.nombre}${talla ? ` en talla ${talla}` : ''}.` };
      }
      repetida.cantidad += cantidad;
    } else {
      lineas.push({ producto: p, talla, cantidad, unidadCent: centimos(precioDe(p, talla)), tipo: p.pod ? 'pod' : 'mano', variantId });
    }
    unidades += cantidad;
  }
  if (unidades > MAX_UNIDADES) return { ok: false, error: `Como mucho ${MAX_UNIDADES} unidades por pedido.` };

  const subtotalCent = lineas.reduce((s, l) => s + l.unidadCent * l.cantidad, 0);
  return { ok: true, lineas, subtotalCent, envioCent: envioCent(subtotalCent) };
}

/** Cesta compacta para los metadatos de Stripe («camiseta-fiat:M:2|angel-ganchillo::1»; máx. 500 caracteres). */
export function codificarCesta(lineas: LineaCobro[]) {
  return lineas.map((l) => `${l.producto.slug}:${l.talla}:${l.cantidad}`).join('|');
}

/** Lo contrario de codificarCesta. Vuelve a validar contra el catálogo de hoy. */
export function decodificarCesta(texto: string | null | undefined): ResultadoCesta {
  if (!texto) return { ok: false, error: 'El pago no trae la cesta en los metadatos.' };
  const entrada = texto.split('|').map((trozo) => {
    const [slug, talla, cantidad] = trozo.split(':');
    return { slug, talla: talla ?? '', cantidad: Number(cantidad) };
  });
  return validarCesta(entrada);
}

/** Plazo de entrega de un pedido según lo que lleva, en días laborables, y cómo se cuenta. */
export function plazoPedido(tipos: Iterable<'pod' | 'mano'>) {
  const t = new Set(tipos);
  const pod = t.has('pod');
  const mano = t.has('mano');
  if (pod && mano) {
    return {
      min: 2,
      max: 10,
      texto:
        'Llega en dos paquetes: lo hecho a mano sale de Sevilla en 48 h y llega en 2 a 5 días laborables; la ropa se fabrica al pedirla (casi siempre en Barcelona) y llega en 5 a 10.',
    };
  }
  if (mano) return { min: 2, max: 5, texto: 'Lo hecho a mano sale de Sevilla en 48 h y llega en 2 a 5 días laborables.' };
  return { min: 5, max: 10, texto: 'Cada prenda se fabrica al pedirla (casi siempre en Barcelona) y llega en 5 a 10 días laborables.' };
}
