// POST /api/tienda/checkout
// Recibe la cesta (solo slug, talla y cantidad), le pone precio en el servidor
// desde el catálogo y abre una sesión de Stripe Checkout. Devuelve { url }.
import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/constants';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { codificarCesta, validarCesta } from '@/lib/tienda/pagos/cesta';
import { crearSesionCheckout, ErrorStripe } from '@/lib/tienda/pagos/stripe';
import { faltanDelTitular } from '@/lib/tienda/titular';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Lo que tiene que estar puesto para cobrar de verdad (si falta algo, no se cobra nada). */
function faltaConfiguracion(): string[] {
  const faltan: string[] = [];
  if (process.env.NEXT_PUBLIC_TIENDA_PAGOS !== '1') faltan.push('NEXT_PUBLIC_TIENDA_PAGOS=1');
  for (const v of ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'PRINTFUL_API_TOKEN', 'TIENDA_AVISOS_EMAIL']) if (!process.env[v]) faltan.push(v);
  // Sin vendedor identificado no se puede vender (art. 97 TRLGDCU y art. 10 LSSI).
  for (const dato of faltanDelTitular()) faltan.push(`titular de la tienda: ${dato}`);
  return faltan;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(`tienda-checkout:${ip}`, 20, 10 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: 'Demasiados intentos. Espera unos minutos.' }, { status: 429 });

  const cuerpo = await request.json().catch(() => null);
  const cesta = validarCesta(cuerpo?.lineas);
  if (!cesta.ok) return NextResponse.json({ error: cesta.error }, { status: 400 });

  const faltan = faltaConfiguracion();
  if (faltan.length) {
    console.warn('[tienda] Checkout sin configurar. Falta:', faltan.join(', '));
    // Qué falta solo se dice fuera de producción (en producción, al registro).
    const detalle = process.env.VERCEL_ENV === 'production' ? {} : { falta: faltan };
    return NextResponse.json({ error: 'El pago todavía no está disponible. No se te ha cobrado nada.', ...detalle }, { status: 503 });
  }

  // En producción, siempre el dominio público; en local y previews, el origen de la petición.
  const base = process.env.VERCEL_ENV === 'production' ? SITE_URL : new URL(request.url).origin;
  const conImagen = base.startsWith('https://');

  try {
    const sesion = await crearSesionCheckout({
      base,
      cesta: codificarCesta(cesta.lineas),
      envioCent: cesta.envioCent,
      lineas: cesta.lineas.map((l) => ({
        slug: l.producto.slug,
        talla: l.talla,
        nombre: l.producto.nombre,
        descripcion: l.producto.resumen,
        imagen: conImagen ? `${base}/tienda/dibujos/${l.producto.fotos[0].id}.webp` : undefined,
        unidadCent: l.unidadCent,
        cantidad: l.cantidad,
        // Lo que se fabrica viaja con el pago: si el catálogo cambia luego, se hace lo que se cobró.
        variante: l.variantId,
        archivo: l.producto.pod!.archivo,
      })),
    });
    return NextResponse.json({ url: sesion.url });
  } catch (e) {
    console.error('[tienda] Stripe no ha abierto el pago:', e instanceof ErrorStripe ? `${e.estado} ${e.message}` : e);
    return NextResponse.json({ error: 'No se ha podido abrir el pago. Inténtalo otra vez en un momento.' }, { status: 502 });
  }
}
