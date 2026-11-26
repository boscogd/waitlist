// =====================================================
// TIENDA · CORREOS DE LOS PEDIDOS
// =====================================================
// Transaccionales (no llevan baja): confirmación, envío con seguimiento,
// reembolso (destino sin envío o agotado mientras pagaba) y avisos internos a
// TIENDA_AVISOS_EMAIL.
// Usan el mismo cliente y remitente que el resto de correos (lib/resend.ts).
// Nunca lanzan: si Resend falla, se apunta en el registro y se sigue.
import { resend } from '@/lib/resend';
import { SITE_URL } from '@/lib/constants';

const REMITENTE = process.env.RESEND_FROM_EMAIL || 'Refugio en la Palabra <onboarding@resend.dev>';
const RESPONDER_A = process.env.TIENDA_CORREO || process.env.RESEND_REPLY_TO || 'info@refugioenlapalabra.com';

export const esc = (s: string | number | null | undefined) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const eur = (cent: number) =>
  (cent / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });

function plantilla(titulo: string, cuerpo: string) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#F6F5F2;font-family:Arial,Helvetica,sans-serif;color:#1F2A37;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <p style="margin:0 0 24px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#1F3A5F;font-weight:bold;">Refugio en la Palabra · Tienda</p>
  <div style="background:#fff;padding:28px 24px;border-radius:4px;">
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1F3A5F;">${esc(titulo)}</h1>
    ${cuerpo}
  </div>
  <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#7A746C;text-align:center;">
    ¿Alguna duda? Responde a este correo y te contesta una persona.<br>
    <a href="${SITE_URL}/tienda/condiciones" style="color:#7A746C;">Condiciones de venta</a>
  </p>
</div></body></html>`;
}

const P = (html: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${html}</p>`;

/** `clave`: clave de idempotencia de Resend (24 h). Con ella el envío se puede reintentar sin mandar el correo dos veces. */
async function enviar(to: string, subject: string, html: string, text: string, clave?: string) {
  try {
    const { error } = await resend.emails.send(
      { from: REMITENTE, to, replyTo: RESPONDER_A, subject, html, text },
      clave ? { idempotencyKey: clave } : undefined
    );
    if (error) {
      console.error('[tienda] Error enviando correo:', subject, error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[tienda] Error enviando correo:', subject, e);
    return false;
  }
}

export interface ResumenPedido {
  referencia: string;
  email: string;
  nombre: string;
  /** talla '' si la pieza no tiene tallas (los belenes). */
  lineas: { nombre: string; talla: string; cantidad: number; importeCent: number }[];
  subtotalCent: number;
  envioCent: number;
  totalCent: number;
  direccion: string[];
  /** Cuándo llega, explicado (plazoPedido). */
  plazo: string;
}

function tablaLineas(r: ResumenPedido) {
  const filas = r.lineas
    .map(
      (l) =>
        `<tr><td style="padding:6px 0;font-size:15px;">${esc(l.cantidad)} × ${esc(l.nombre)}${l.talla ? ` <span style="color:#7A746C;">· talla ${esc(l.talla)}</span>` : ''}</td><td style="padding:6px 0;font-size:15px;text-align:right;white-space:nowrap;">${eur(l.importeCent)}</td></tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E7E4DF;border-bottom:1px solid #E7E4DF;margin:8px 0 16px;">
${filas}
<tr><td style="padding:6px 0;font-size:14px;color:#7A746C;">Envío</td><td style="padding:6px 0;font-size:14px;text-align:right;color:#7A746C;">${r.envioCent ? eur(r.envioCent) : 'Gratis'}</td></tr>
<tr><td style="padding:8px 0;font-size:16px;font-weight:bold;">Total (IVA incluido)</td><td style="padding:8px 0;font-size:16px;font-weight:bold;text-align:right;">${eur(r.totalCent)}</td></tr>
</table>`;
}

const textoLineas = (r: ResumenPedido) =>
  r.lineas.map((l) => `${l.cantidad} x ${l.nombre}${l.talla ? ` (talla ${l.talla})` : ''}: ${eur(l.importeCent)}`).join('\n') +
  `\nEnvío: ${r.envioCent ? eur(r.envioCent) : 'gratis'}\nTotal (IVA incluido): ${eur(r.totalCent)}`;

/** Al cliente, cuando el pago entra y el pedido está en marcha. */
export function correoConfirmacion(r: ResumenPedido, clave?: string) {
  const saludo = r.nombre ? `Hola, ${esc(r.nombre.split(' ')[0])}:` : 'Hola:';
  const html = plantilla(
    'Tu pedido está en marcha',
    P(saludo) +
      P(`Hemos recibido el pago. ${esc(r.plazo)} Cuando salga, te escribimos con el número de seguimiento.`) +
      tablaLineas(r) +
      P(`<strong>Se envía a:</strong><br>${r.direccion.map(esc).join('<br>')}`) +
      P(`Referencia del pedido: <strong>${esc(r.referencia)}</strong>`) +
      P('Tienes 14 días desde que te llegue para devolverlo. El recibo del pago te lo manda Stripe en otro correo.')
  );
  const text = `${r.nombre ? `Hola, ${r.nombre.split(' ')[0]}:` : 'Hola:'}\n\nHemos recibido el pago. ${r.plazo} Cuando salga, te escribimos con el seguimiento.\n\n${textoLineas(r)}\n\nSe envía a:\n${r.direccion.join('\n')}\n\nReferencia: ${r.referencia}\n\nCondiciones de venta: ${SITE_URL}/tienda/condiciones`;
  return enviar(r.email, `Tu pedido ${r.referencia} está en marcha`, html, text, clave);
}

/** Al cliente, cuando Printful avisa de que ha salido. */
export function correoEnviado(d: { email: string; nombre: string; referencia: string; transportista: string; numero: string; url: string }, clave?: string) {
  const saludo = d.nombre ? `Hola, ${esc(d.nombre.split(' ')[0])}:` : 'Hola:';
  const html = plantilla(
    'Tu pedido ya ha salido',
    P(saludo) +
      P(`Tu pedido <strong>${esc(d.referencia)}</strong> ya va de camino con ${esc(d.transportista)}.`) +
      (d.numero ? P(`Número de seguimiento: <strong>${esc(d.numero)}</strong>`) : '') +
      (d.url
        ? `<p style="margin:20px 0;"><a href="${esc(d.url)}" style="display:inline-block;background:#1F3A5F;color:#fff;text-decoration:none;padding:12px 20px;font-size:15px;font-weight:bold;">Seguir el envío</a></p>`
        : '')
  );
  const text = `Tu pedido ${d.referencia} ya va de camino con ${d.transportista}.\n${d.numero ? `Seguimiento: ${d.numero}\n` : ''}${d.url ? `${d.url}\n` : ''}`;
  return enviar(d.email, `Tu pedido ${d.referencia} ya ha salido`, html, text, clave);
}

/** Al cliente, cuando el CP es de Canarias, Ceuta o Melilla y se le devuelve el dinero. */
export function correoReembolsoDestino(d: { email: string; nombre: string; importeCent: number; cp: string }, clave?: string) {
  const saludo = d.nombre ? `Hola, ${esc(d.nombre.split(' ')[0])}:` : 'Hola:';
  const html = plantilla(
    'No podemos enviar a tu dirección',
    P(saludo) +
      P(`Lo sentimos: por ahora solo enviamos a la península y Baleares, y el código postal ${esc(d.cp)} es de Canarias, Ceuta o Melilla, donde el envío pasa por aduana.`) +
      P(`Ya hemos dado la orden de devolverte el pago completo, <strong>${eur(d.importeCent)}</strong>. Según tu banco, tarda de 5 a 10 días en verse en la cuenta. No se ha fabricado nada.`) +
      P('Si tienes otra dirección en la península o Baleares, puedes volver a pedirlo con ella.')
  );
  const text = `Por ahora solo enviamos a la península y Baleares, y el código postal ${d.cp} es de Canarias, Ceuta o Melilla. Ya hemos dado la orden de devolverte el pago completo, ${eur(d.importeCent)}. Según tu banco, tarda de 5 a 10 días en verse.`;
  return enviar(d.email, 'Te devolvemos el pago: no enviamos a tu dirección', html, text, clave);
}

/** Al cliente, cuando lo hecho a mano se ha agotado mientras pagaba y se le devuelve el dinero. */
export function correoSinExistencias(d: { email: string; nombre: string; importeCent: number; piezas: string[] }, clave?: string) {
  const saludo = d.nombre ? `Hola, ${esc(d.nombre.split(' ')[0])}:` : 'Hola:';
  const piezas = d.piezas.join(', ');
  const html = plantilla(
    'Se ha agotado mientras pagabas',
    P(saludo) +
      P(`Lo sentimos mucho: mientras pagabas, alguien se ha llevado la última unidad de <strong>${esc(piezas)}</strong>. Cada figura se teje a mano y ahora mismo no hay más.`) +
      P(`Por eso no hemos preparado nada del pedido y ya hemos dado la orden de devolverte el pago completo, <strong>${eur(d.importeCent)}</strong>. Según tu banco, tarda de 5 a 10 días en verse en la cuenta.`) +
      P('Si quieres lo demás del pedido, puedes volver a pedirlo en la tienda. Y si quieres que te avisemos cuando haya más, responde a este correo.')
  );
  const text = `Lo sentimos: mientras pagabas, alguien se ha llevado la última unidad de ${piezas}. No hemos preparado nada del pedido y ya hemos dado la orden de devolverte el pago completo, ${eur(d.importeCent)}. Según tu banco, tarda de 5 a 10 días en verse. Si quieres que te avisemos cuando haya más, responde a este correo.`;
  return enviar(d.email, 'Te devolvemos el pago: se agotó mientras pagabas', html, text, clave);
}

/** Aviso interno a TIENDA_AVISOS_EMAIL (pedidos nuevos y problemas). */
export function avisoInterno(asunto: string, lineas: string[], clave?: string) {
  const to = process.env.TIENDA_AVISOS_EMAIL;
  if (!to) {
    // Solo el asunto: las líneas llevan nombre, correo y dirección del cliente y no deben quedar en los registros.
    console.warn('[tienda] TIENDA_AVISOS_EMAIL no está configurado; aviso sin mandar:', asunto);
    return Promise.resolve(false);
  }
  const html = plantilla(asunto, lineas.map((l) => P(esc(l))).join(''));
  return enviar(to, `[Tienda] ${asunto}`, html, lineas.join('\n'), clave);
}

export function resumenTexto(r: ResumenPedido) {
  return [
    `Referencia: ${r.referencia}`,
    `Cliente: ${r.nombre} <${r.email}>`,
    ...r.lineas.map((l) => `${l.cantidad} x ${l.nombre}${l.talla ? ` (${l.talla})` : ''}: ${eur(l.importeCent)}`),
    `Envío: ${r.envioCent ? eur(r.envioCent) : 'gratis'} · Total: ${eur(r.totalCent)}`,
    `Dirección: ${r.direccion.join(', ')}`,
  ];
}
