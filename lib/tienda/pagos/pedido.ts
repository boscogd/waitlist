// =====================================================
// TIENDA · DEL PAGO AL PEDIDO
// =====================================================
// Lo que pasa cuando Stripe avisa de un pago (descontar los belenes, crear el
// pedido de la ropa en Printful y avisarnos de lo que hay que enviar a mano, o
// devolver el dinero si el destino no tiene envío o se agotó mientras pagaba) y
// cuando Printful avisa de un envío o de un problema. Los dos webhooks llaman aquí.
import { cpSinEnvio, decodificarCesta, plazoPedido } from './cesta';
import {
  avisoInterno,
  correoConfirmacion,
  correoEnviado,
  correoReembolsoDestino,
  correoSinExistencias,
  eur,
  resumenTexto,
  type ResumenPedido,
} from './correos';
import { crearPedido, idExterno, leerPedido, referenciaDe, type ArticuloPedido } from './printful';
import { devueltoDe, envioDeSesion, ErrorStripe, leerLineas, leerSesion, reembolsar, type SesionCheckout } from './stripe';
import { descontar, marcarCorreo } from '@/lib/tienda/existencias';
import { SITE_URL } from '@/lib/constants';

export interface Resultado {
  /** 200: hecho o no hay nada que hacer. 500: que el remitente lo reintente. */
  estado: 200 | 500;
  mensaje: string;
}

/** Dónde descarga Printful los PNG: la web publicada (en local no la alcanza). */
const baseArchivos = () => (process.env.TIENDA_URL_PUBLICA || SITE_URL).replace(/\/+$/, '');

const dosDecimales = (cent: number) => (cent / 100).toFixed(2);

type LineaPedido = {
  slug: string;
  nombre: string;
  /** '' si no tiene tallas. */
  talla: string;
  cantidad: number;
  unidadCent: number;
  tipo: 'pod' | 'mano';
  variante: number | null;
  archivo: string | null;
};

const ARCHIVO_IMPRESION = /^\/tienda\/impresion\/[a-z0-9-]+\.png$/;

const lineaCompleta = (l: LineaPedido) =>
  !!l.slug &&
  !!l.nombre &&
  (l.tipo === 'mano' || (!!l.talla && Number.isInteger(l.variante) && (l.variante ?? 0) > 0 && ARCHIVO_IMPRESION.test(l.archivo ?? '')));

/**
 * Devuelve todo el pago y lo explica: al cliente con `correoCliente` y a nosotros con un aviso.
 * Idempotente: el reembolso y los correos llevan clave por sesión.
 */
async function devolverTodo(
  s: SesionCheckout,
  d: { referencia: string; email: string; totalCent: number; motivo: string },
  correoCliente: (clave: string) => Promise<boolean>,
  aviso: { asunto: string; lineas: string[] }
): Promise<Resultado> {
  if (!s.payment_intent) {
    await avisoInterno('Reembolso imposible: falta el pago', [`Sesión ${s.id} (${d.referencia}): ${d.motivo}. No trae payment_intent.`]);
    return { estado: 500, mensaje: 'Sin payment_intent para reembolsar.' };
  }
  let estadoReembolso: string;
  try {
    estadoReembolso = (await reembolsar(s.payment_intent, s.id, d.motivo)).status;
  } catch (e) {
    // La clave de idempotencia de Stripe dura 24 h: en un reintento posterior, si ya estaba devuelto, Stripe lo rechaza así.
    if (e instanceof ErrorStripe && e.codigo === 'charge_already_refunded') estadoReembolso = 'succeeded';
    else throw e;
  }
  if (estadoReembolso === 'failed' || estadoReembolso === 'canceled') {
    const ok = await avisoInterno(
      `Reembolso FALLIDO (${aviso.asunto})`,
      [
        `Sesión ${s.id} (${d.referencia}): ${d.motivo}. Stripe dice que el reembolso está «${estadoReembolso}».`,
        'El cliente sigue sin su dinero y no hay pedido. Devuélveselo a mano desde Stripe y escríbele.',
      ],
      `reembolso-fallido-${s.id}`
    );
    return ok ? { estado: 200, mensaje: `Reembolso ${estadoReembolso}: avisado.` } : { estado: 500, mensaje: 'Reembolso fallido y aviso sin mandar.' };
  }
  // «pending» también vale: si luego falla, llega el evento refund.failed y se avisa.
  const okCliente = await correoCliente(`reembolso-cliente-${s.id}`);
  const okAviso = await avisoInterno(
    aviso.asunto,
    [...aviso.lineas, `Se ha pedido la devolución de todo (${eur(d.totalCent)}; estado en Stripe: ${estadoReembolso}) y se ha avisado a ${d.email}.`],
    `reembolso-aviso-${s.id}`
  );
  if (!okCliente || !okAviso) return { estado: 500, mensaje: 'Reembolsado, pero falta algún correo: que Stripe lo reintente.' };
  return { estado: 200, mensaje: `${aviso.asunto}: reembolsado.` };
}

/** Stripe avisa de que una sesión de Checkout está pagada. */
export async function procesarPago(sesionId: string): Promise<Resultado> {
  // Se vuelve a leer de la API (versión fija) en vez de fiarse de la forma del evento.
  const s = await leerSesion(sesionId);
  if (s.metadata?.tienda !== 'refugio') return { estado: 200, mensaje: 'Sesión que no es de la tienda: se ignora.' };
  if (s.payment_status !== 'paid') return { estado: 200, mensaje: `Sesión sin pagar (${s.payment_status}): se espera.` };

  const externalId = idExterno(s.id);
  const referencia = referenciaDe(externalId);
  const envio = envioDeSesion(s);
  const dir = envio?.address;
  const email = s.customer_details?.email ?? '';
  const nombre = (envio?.name || s.customer_details?.name || '').trim();
  const totalCent = s.amount_total ?? 0;

  if (!dir || !email || !dir.line1 || !dir.postal_code || !dir.city) {
    await avisoInterno('Pago sin dirección completa', [`Sesión ${s.id} (${referencia}) pagada sin dirección o sin correo. Revísalo en Stripe.`]);
    return { estado: 500, mensaje: 'Pago sin dirección completa.' };
  }
  const cp = dir.postal_code;

  // Canarias, Ceuta y Melilla: no se envía. Se devuelve todo y se explica.
  if (dir.country !== 'ES' || cpSinEnvio(cp)) {
    return devolverTodo(
      s,
      { referencia, email, totalCent, motivo: `Destino sin envío (CP ${cp})` },
      (clave) => correoReembolsoDestino({ email, nombre, importeCent: totalCent, cp }, clave),
      { asunto: 'Pago devuelto: destino sin envío', lineas: [`Sesión ${s.id} (${referencia}) con CP ${cp} (${dir.city}).`] }
    );
  }

  // Lo que se hace sale de lo que se cobró: cada línea de Stripe lleva en sus metadatos el tipo y, en la ropa,
  // la variante de Printful y el archivo de impresión del momento del pago. Así, aunque el catálogo cambie
  // después, se hace lo que el cliente pagó. Las sesiones sin esos metadatos (anteriores) tiran del catálogo.
  const lineasStripe: LineaPedido[] = (await leerLineas(s.id)).map((l) => {
    const m = (l.price && typeof l.price.product === 'object' ? l.price.product.metadata : null) ?? {};
    return {
      slug: m.slug ?? '',
      nombre: m.nombre ?? '',
      talla: m.talla ?? '',
      cantidad: l.quantity,
      unidadCent: l.price?.unit_amount ?? Math.round(l.amount_subtotal / Math.max(1, l.quantity)),
      // Antes de los belenes, todo lo que se cobraba era ropa bajo demanda.
      tipo: m.tipo === 'mano' ? 'mano' : 'pod',
      variante: m.variante ? Number(m.variante) : null,
      archivo: m.archivo ?? null,
    };
  });

  let lineas: LineaPedido[];
  let subtotalCatalogo: number | null = null;
  if (lineasStripe.length > 0 && lineasStripe.every(lineaCompleta)) {
    lineas = lineasStripe;
  } else {
    const cesta = decodificarCesta(s.metadata?.cesta);
    if (!cesta.ok) {
      await avisoInterno('Pago con una cesta que no se entiende', [`Sesión ${s.id} (${referencia}): ${cesta.error}`, `Metadatos: ${s.metadata?.cesta ?? '(vacío)'}`]);
      return { estado: 500, mensaje: cesta.error };
    }
    const cobrado = new Map(lineasStripe.map((l) => [`${l.slug}:${l.talla}`, l.unidadCent]));
    lineas = cesta.lineas.map((l) => ({
      slug: l.producto.slug,
      nombre: l.producto.nombre,
      talla: l.talla,
      cantidad: l.cantidad,
      unidadCent: cobrado.get(`${l.producto.slug}:${l.talla}`) ?? l.unidadCent,
      tipo: l.tipo,
      variante: l.variantId,
      archivo: l.producto.pod?.archivo ?? null,
    }));
    subtotalCatalogo = cesta.subtotalCent;
  }
  const deMano = lineas.filter((l) => l.tipo === 'mano');
  const deRopa = lineas.filter((l) => l.tipo === 'pod');

  const subtotalCent = s.amount_subtotal ?? lineas.reduce((t, l) => t + l.unidadCent * l.cantidad, 0);
  const envioCent = s.total_details?.amount_shipping ?? s.shipping_cost?.amount_total ?? 0;
  const descuentoCent = s.total_details?.amount_discount ?? 0;

  const resumen: ResumenPedido = {
    referencia,
    email,
    nombre,
    lineas: lineas.map((l) => ({ nombre: l.nombre, talla: l.talla, cantidad: l.cantidad, importeCent: l.unidadCent * l.cantidad })),
    subtotalCent,
    envioCent,
    totalCent,
    direccion: [nombre, dir.line1, dir.line2, `${cp} ${dir.city}`, dir.state].filter((x): x is string => !!x),
    plazo: plazoPedido(lineas.map((l) => l.tipo)).texto,
  };

  // 1. Lo hecho a mano se descuenta de las existencias, todo o nada. Si alguien se ha llevado la última unidad
  //    mientras este cliente pagaba, no se hace nada del pedido y se le devuelve todo.
  let correosYa = { aviso: false, confirmacion: false };
  if (deMano.length) {
    const r = await descontar(
      s.id,
      deMano.map((l) => ({ slug: l.slug, cantidad: l.cantidad }))
    );
    if (r.estado === 'faltan') {
      const nombreDe = (slug: string) => deMano.find((l) => l.slug === slug)?.nombre ?? slug;
      const agotadas = r.faltan.map((f) => nombreDe(f.slug));
      return devolverTodo(
        s,
        { referencia, email, totalCent, motivo: `Agotado mientras pagaba: ${agotadas.join(', ')}` },
        (clave) => correoSinExistencias({ email, nombre, importeCent: totalCent, piezas: agotadas }, clave),
        {
          asunto: 'Pago devuelto: se agotó mientras pagaba',
          lineas: [
            `Sesión ${s.id} (${referencia}).`,
            ...r.faltan.map((f) => `${nombreDe(f.slug)}: pidió ${f.pide} y quedaban ${f.quedan}.`),
            'No se ha descontado nada ni se ha pedido nada a Printful.',
          ],
        }
      );
    }
    correosYa = { aviso: r.avisoEnviado, confirmacion: r.confirmacionEnviada };
  }

  // Si el pago se ha devuelto mientras tanto (p. ej. a mano en Stripe tras un fallo de Printful), no se hace nada
  // más: ni pedido en Printful ni orden de envío. Las existencias ya descontadas se reponen a mano.
  if (s.payment_intent && (await devueltoDe(s.payment_intent)) > 0) {
    await avisoInterno(
      `Pago ${referencia} devuelto: no se ha preparado nada`,
      [
        `La sesión ${s.id} tiene un reembolso en Stripe, así que no se ha pedido nada a Printful ni hay que enviar nada.`,
        ...(deMano.length ? [`Repón a mano en tienda_existencias: ${deMano.map((l) => `${l.cantidad} x ${l.nombre}`).join(', ')}.`] : []),
      ],
      `devuelto-${s.id}`
    );
    return { estado: 200, mensaje: 'Pago devuelto: no se prepara nada.' };
  }

  // 2. La ropa va a Printful (idempotente por externalId).
  let resultado: Awaited<ReturnType<typeof crearPedido>> | null = null;
  if (deRopa.length) {
    const base = baseArchivos();
    const articulos: ArticuloPedido[] = deRopa.map((l) => ({
      variant_id: l.variante!,
      quantity: l.cantidad,
      name: `${l.nombre} · ${l.talla}`,
      retail_price: dosDecimales(l.unidadCent),
      files: [{ type: 'front', url: `${base}${l.archivo}` }],
    }));
    // En un pedido mixto, el albarán de Printful solo lleva lo suyo: la ropa y el envío.
    const ropaCent = deRopa.reduce((t, l) => t + l.unidadCent * l.cantidad, 0);
    const cobrado = deMano.length
      ? { subtotal: dosDecimales(ropaCent), descuento: '0.00', envio: dosDecimales(envioCent), total: dosDecimales(ropaCent + envioCent) }
      : { subtotal: dosDecimales(subtotalCent), descuento: dosDecimales(descuentoCent), envio: dosDecimales(envioCent), total: dosDecimales(totalCent) };
    try {
      resultado = await crearPedido({
        externalId,
        referencia,
        destinatario: {
          name: nombre || email,
          address1: dir.line1,
          address2: dir.line2 || undefined,
          city: dir.city,
          state_name: dir.state || undefined,
          country_code: 'ES',
          zip: cp.replace(/\s/g, ''),
          phone: s.customer_details?.phone || undefined,
          email,
        },
        articulos,
        cobrado,
      });
    } catch (e) {
      const motivo = e instanceof Error ? e.message : String(e);
      console.error('[tienda] Printful no ha aceptado el pedido', s.id, motivo);
      await avisoInterno('Printful no ha aceptado un pedido pagado', [
        `Motivo: ${motivo}`,
        ...resumenTexto(resumen),
        ...(deMano.length ? ['Lo hecho a mano ya está descontado de las existencias.'] : []),
        `Sesión de Stripe: ${s.id}. Stripe lo reintenta solo durante 3 días. No crees el pedido a mano (el reintento lo duplicaría): si hay que cancelarlo, devuelve el dinero desde Stripe y la web no preparará nada.`,
      ]);
      return { estado: 500, mensaje: `Printful: ${motivo}` };
    }
  }

  // 3. Correos. Se mandan también en un reintento: llevan clave de idempotencia, así que si la primera vez
  //    salieron no se repiten, y si fallaron, ahora sí salen.
  const descuadre = subtotalCatalogo !== null && subtotalCatalogo !== subtotalCent;
  const borrador = !!resultado && process.env.PRINTFUL_CONFIRMAR !== '1';
  const partes = [deMano.length ? 'belenes para enviar' : '', resultado ? (borrador ? 'ropa en BORRADOR en Printful' : 'ropa en Printful') : '']
    .filter(Boolean)
    .join(' + ');
  const telefono = s.customer_details?.phone;
  // Con belenes, lo que ya salió queda apuntado en Supabase: un reintento de Stripe días después (cuando la clave
  // de Resend ya ha caducado) no repite la orden de envío.
  const okCliente = correosYa.confirmacion || (await correoConfirmacion(resumen, `confirmacion-${externalId}`));
  if (okCliente && deMano.length && !correosYa.confirmacion) await marcarCorreo(s.id, 'confirmacion');
  const okAviso = correosYa.aviso || (await avisoInterno(
    `Pedido nuevo ${referencia}: ${partes}`,
    [
      ...resumenTexto(resumen),
      ...(telefono ? [`Teléfono: ${telefono}`] : []),
      ...(deMano.length
        ? [
            `PARA ENVIAR NOSOTROS (sale en 48 h): ${deMano.map((l) => `${l.cantidad} x ${l.nombre}`).join(', ')}.`,
            'Ya está descontado de las existencias. Cuando lo envíes, escribe al cliente con el número de seguimiento.',
          ]
        : []),
      ...(resultado
        ? [`Printful: pedido ${resultado.pedido.id} (${resultado.pedido.status}) con ${deRopa.map((l) => `${l.cantidad} x ${l.nombre} ${l.talla}`).join(', ')}.`]
        : []),
      ...(borrador ? ['La ropa está en borrador porque PRINTFUL_CONFIRMAR no es 1: no se fabrica hasta que la confirmes en Printful.'] : []),
      ...(descuadre ? [`Ojo: el catálogo de hoy suma ${eur(subtotalCatalogo!)} y se cobró ${eur(subtotalCent)}.`] : []),
      `Sesión de Stripe: ${s.id}`,
    ],
    `aviso-pedido-${externalId}`
  ));
  if (okAviso && deMano.length && !correosYa.aviso) await marcarCorreo(s.id, 'aviso');
  if (!okCliente || !okAviso) {
    return { estado: 500, mensaje: `Pedido ${externalId} en marcha, pero falta algún correo: que Stripe lo reintente.` };
  }
  return { estado: 200, mensaje: resultado?.yaExistia ? `Pedido ${externalId} ya creado; correos al día.` : `Pedido ${externalId} en marcha.` };
}

const ES_NUESTRO = /^rp-[0-9a-f]{24}$/;

/** Printful avisa de algo. La v1 no firma: se vuelve a leer el pedido antes de hacer nada. */
export async function atenderPrintful(tipo: string, externalId: string | null | undefined, datos: { envioId?: number; motivo?: string }): Promise<Resultado> {
  if (!externalId || !ES_NUESTRO.test(externalId)) return { estado: 200, mensaje: 'Pedido que no es de la tienda: se ignora.' };
  const pedido = await leerPedido(externalId);
  if (!pedido) return { estado: 200, mensaje: 'Pedido que no existe en Printful: se ignora.' };
  const referencia = referenciaDe(externalId);

  if (tipo === 'package_shipped') {
    const envio = pedido.shipments.find((x) => x.id === datos.envioId) ?? pedido.shipments.at(-1);
    if (!envio) return { estado: 200, mensaje: 'Aviso de envío sin envíos en el pedido: se ignora.' };
    const ok = await correoEnviado({
      email: pedido.recipient.email,
      nombre: pedido.recipient.name,
      referencia,
      transportista: envio.carrier || 'el transportista',
      numero: envio.tracking_number,
      url: /^https:\/\//.test(envio.tracking_url) ? envio.tracking_url : '',
    }, `envio-${externalId}-${envio.id}`);
    if (ok) return { estado: 200, mensaje: 'Correo de envío mandado.' };
    // Un 500 para que Printful repita el aviso; la clave evita que el correo salga dos veces.
    await avisoInterno(`No ha salido el correo de envío de ${referencia}`, [
      `Printful ha avisado de que el pedido ${referencia} ha salido, pero el correo al cliente ha fallado.`,
      'Se reintentará con el siguiente aviso de Printful. Si no llega, mándale el seguimiento a mano desde Printful.',
    ], `envio-fallido-${externalId}-${envio.id}`);
    return { estado: 500, mensaje: 'No se pudo mandar el correo de envío.' };
  }

  const titulos: Record<string, string> = {
    order_failed: 'ha fallado',
    order_canceled: 'se ha cancelado',
    order_put_hold: 'está retenido',
  };
  if (titulos[tipo]) {
    await avisoInterno(`El pedido ${referencia} ${titulos[tipo]} en Printful`, [
      `Estado en Printful ahora: ${pedido.status} (pedido ${pedido.id}).`,
      `Motivo que da el aviso: ${datos.motivo || '(sin motivo)'}`,
      `Cliente: ${pedido.recipient.name} <${pedido.recipient.email}>`,
      'Revísalo en Printful y, si no se puede servir, devuelve el dinero desde Stripe y escribe al cliente.',
    ]);
    return { estado: 200, mensaje: 'Aviso interno mandado.' };
  }
  return { estado: 200, mensaje: `Evento ${tipo} sin nada que hacer.` };
}
