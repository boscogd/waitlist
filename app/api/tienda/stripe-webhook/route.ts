// POST /api/tienda/stripe-webhook
// Stripe avisa de los pagos. Se comprueba la firma a mano (sin SDK) y, si la
// sesión está pagada, se crea el pedido en Printful (o se devuelve el dinero si
// el destino no tiene envío). Un 500 hace que Stripe lo reintente.
import { NextResponse } from 'next/server';
import { avisoInterno } from '@/lib/tienda/pagos/correos';
import { procesarPago } from '@/lib/tienda/pagos/pedido';
import { ID_SESION, verificarFirma } from '@/lib/tienda/pagos/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EVENTOS_DE_PAGO = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded']);

export async function POST(request: Request) {
  // El cuerpo tal cual llega: la firma se calcula sobre estos bytes exactos.
  const cuerpo = await request.text();
  const firma = request.headers.get('stripe-signature');
  if (!firma || !/(^|,)t=\d+/.test(firma) || !/(^|,)v1=/.test(firma)) {
    return NextResponse.json({ error: 'Falta la firma de Stripe.' }, { status: 400 });
  }

  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secreto) {
    console.error('[tienda] Llega un webhook de Stripe y falta STRIPE_WEBHOOK_SECRET.');
    return NextResponse.json({ error: 'Webhook sin configurar.' }, { status: 503 });
  }
  if (!verificarFirma(cuerpo, firma, secreto)) {
    return NextResponse.json({ error: 'Firma no válida.' }, { status: 400 });
  }

  let evento: { id?: string; type?: string; data?: { object?: { id?: string; object?: string; payment_status?: string } } };
  try {
    evento = JSON.parse(cuerpo);
  } catch {
    return NextResponse.json({ error: 'Cuerpo que no es JSON.' }, { status: 400 });
  }

  // Un reembolso que Stripe no ha podido completar (p.ej. el de un destino sin envío): avisar para hacerlo a mano.
  if (evento.type === 'refund.failed') {
    const r = evento.data?.object as { id?: string; payment_intent?: string; failure_reason?: string; metadata?: Record<string, string> } | undefined;
    if (!r?.metadata?.sesion) return NextResponse.json({ recibido: true, nada: 'Reembolso que no es de la tienda.' });
    const ok = await avisoInterno(
      'Reembolso FALLIDO',
      [
        `Stripe no ha podido devolver el pago ${r.payment_intent ?? '?'} (reembolso ${r.id ?? '?'}): ${r.failure_reason ?? 'sin motivo'}.`,
        `Sesión de la tienda: ${r.metadata.sesion}. Motivo del reembolso: ${r.metadata.motivo ?? '?'}.`,
        'El cliente sigue sin su dinero: devuélveselo por otra vía y escríbele.',
      ],
      `refund-failed-${r.id}`
    );
    return NextResponse.json({ recibido: ok }, { status: ok ? 200 : 500 });
  }

  if (!evento.type || !EVENTOS_DE_PAGO.has(evento.type)) {
    return NextResponse.json({ recibido: true, nada: `Evento ${evento.type ?? '?'} sin nada que hacer.` });
  }
  const sesion = evento.data?.object;
  if (sesion?.object !== 'checkout.session' || !sesion.id || !ID_SESION.test(sesion.id)) {
    return NextResponse.json({ error: 'El evento no trae una sesión de Checkout.' }, { status: 400 });
  }
  // «completed» con pago aún pendiente (métodos asíncronos): llegará async_payment_succeeded.
  if (sesion.payment_status !== 'paid') {
    return NextResponse.json({ recibido: true, nada: `Pago ${sesion.payment_status ?? '?'}: se espera.` });
  }

  try {
    const r = await procesarPago(sesion.id);
    console.log(`[tienda] ${evento.type} ${sesion.id}: ${r.mensaje}`);
    return NextResponse.json({ recibido: r.estado === 200, mensaje: r.mensaje }, { status: r.estado });
  } catch (e) {
    const motivo = e instanceof Error ? e.message : String(e);
    console.error('[tienda] Error atendiendo el pago', sesion.id, motivo);
    await avisoInterno('Error atendiendo un pago', [`Sesión ${sesion.id}: ${motivo}`, 'Stripe reintentará el aviso.']);
    return NextResponse.json({ error: 'Error interno; Stripe lo reintentará.' }, { status: 500 });
  }
}
