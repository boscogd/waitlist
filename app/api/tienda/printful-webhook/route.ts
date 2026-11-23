// POST /api/tienda/printful-webhook?token=…
// Printful avisa de envíos y problemas. La API v1 no firma los webhooks: se
// exige un token secreto en la URL y, aun así, se vuelve a leer el pedido de la
// API antes de mandar nada (lib/tienda/pagos/pedido.ts).
import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { atenderPrintful } from '@/lib/tienda/pagos/pedido';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Compara en tiempo constante (los resúmenes igualan la longitud). */
function mismoToken(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(request: Request) {
  const esperado = process.env.PRINTFUL_WEBHOOK_TOKEN;
  if (!esperado || esperado.length < 16) {
    console.error('[tienda] Llega un webhook de Printful y falta PRINTFUL_WEBHOOK_TOKEN (o es corto).');
    return NextResponse.json({ error: 'Webhook sin configurar.' }, { status: 503 });
  }
  const token = new URL(request.url).searchParams.get('token') ?? '';
  if (!mismoToken(token, esperado)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const aviso = await request.json().catch(() => null);
  const tipo = typeof aviso?.type === 'string' ? aviso.type : '';
  if (!tipo) return NextResponse.json({ error: 'Aviso sin tipo.' }, { status: 400 });

  const datos = aviso?.data ?? {};
  try {
    const r = await atenderPrintful(tipo, datos.order?.external_id, {
      envioId: typeof datos.shipment?.id === 'number' ? datos.shipment.id : undefined,
      motivo: typeof datos.reason === 'string' ? datos.reason.slice(0, 500) : undefined,
    });
    console.log(`[tienda] Printful ${tipo}: ${r.mensaje}`);
    return NextResponse.json({ recibido: true, mensaje: r.mensaje }, { status: r.estado });
  } catch (e) {
    console.error('[tienda] Error atendiendo el aviso de Printful', tipo, e);
    return NextResponse.json({ error: 'Error interno; Printful lo reintentará.' }, { status: 500 });
  }
}
