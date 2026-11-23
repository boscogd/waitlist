// =====================================================
// TIENDA · DEL PAGO AL PEDIDO
// =====================================================
// Lo que pasa cuando Stripe avisa de un pago (crear el pedido en Printful,
// o devolver el dinero si el destino no tiene envío) y cuando Printful avisa
// de un envío o de un problema. Los dos webhooks llaman aquí.
import { cpSinEnvio, decodificarCesta } from './cesta';
import { avisoInterno, correoConfirmacion, correoEnviado, correoReembolsoDestino, eur, resumenTexto, type ResumenPedido } from './correos';
import { crearPedido, idExterno, leerPedido, referenciaDe, type ArticuloPedido } from './printful';
import { envioDeSesion, ErrorStripe, leerLineas, leerSesion, reembolsar } from './stripe';
import { SITE_URL } from '@/lib/constants';

export interface Resultado {
  /** 200: hecho o no hay nada que hacer. 500: que el remitente lo reintente. */
  estado: 200 | 500;
  mensaje: string;
}

/** Dónde descarga Printful los PNG: la web publicada (en local no la alcanza). */
const baseArchivos = () => (process.env.TIENDA_URL_PUBLICA || SITE_URL).replace(/\/+$/, '');

const dosDecimales = (cent: number) => (cent / 100).toFixed(2);

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

  // Canarias, Ceuta y Melilla: no se envía. Se devuelve todo y se explica.
  if (dir.country !== 'ES' || cpSinEnvio(dir.postal_code)) {
    if (!s.payment_intent) {
      await avisoInterno('Reembolso imposible: falta el pago', [`Sesión ${s.id} con CP ${dir.postal_code} sin payment_intent.`]);
      return { estado: 500, mensaje: 'Sin payment_intent para reembolsar.' };
    }
    let estadoReembolso: string;
    try {
      estadoReembolso = (await reembolsar(s.payment_intent, s.id, `Destino sin envío (CP ${dir.postal_code})`)).status;
    } catch (e) {
      // La clave de idempotencia de Stripe dura 24 h: en un reintento posterior, si ya estaba devuelto, Stripe lo rechaza así.
      if (e instanceof ErrorStripe && e.codigo === 'charge_already_refunded') estadoReembolso = 'succeeded';
      else throw e;
    }
    if (estadoReembolso === 'failed' || estadoReembolso === 'canceled') {
      const ok = await avisoInterno(
        'Reembolso FALLIDO: destino sin envío',
        [
          `Sesión ${s.id} (${referencia}) con CP ${dir.postal_code}: Stripe dice que el reembolso está «${estadoReembolso}».`,
          'El cliente sigue sin su dinero y no hay pedido. Devuélveselo a mano desde Stripe y escríbele.',
        ],
        `reembolso-fallido-${s.id}`
      );
      return ok ? { estado: 200, mensaje: `Reembolso ${estadoReembolso}: avisado.` } : { estado: 500, mensaje: 'Reembolso fallido y aviso sin mandar.' };
    }
    // «pending» también vale: si luego falla, llega el evento refund.failed y se avisa.
    const okCliente = await correoReembolsoDestino({ email, nombre, importeCent: totalCent, cp: dir.postal_code }, `reembolso-cliente-${s.id}`);
    const okAviso = await avisoInterno(
      'Pago devuelto: destino sin envío',
      [
        `Sesión ${s.id} (${referencia}) con CP ${dir.postal_code} (${dir.city}).`,
        `Se ha pedido la devolución de todo (${eur(totalCent)}; estado en Stripe: ${estadoReembolso}) y se ha avisado a ${email}.`,
      ],
      `reembolso-aviso-${s.id}`
    );
    if (!okCliente || !okAviso) return { estado: 500, mensaje: 'Reembolsado, pero falta algún correo: que Stripe lo reintente.' };
    return { estado: 200, mensaje: 'Destino sin envío: reembolsado.' };
  }

  // Lo que se fabrica sale de lo que se cobró: cada línea de Stripe lleva en sus metadatos la variante de
  // Printful y el archivo de impresión del momento del pago. Así, aunque el catálogo cambie después, se hace
  // lo que el cliente pagó. Las sesiones sin esos metadatos (anteriores a este cambio) tiran del catálogo.
  const lineasStripe = (await leerLineas(s.id)).map((l) => {
    const m = (l.price && typeof l.price.product === 'object' ? l.price.product.metadata : null) ?? {};
    return {
      slug: m.slug ?? '',
      talla: m.talla ?? '',
      nombre: m.nombre ?? '',
      variante: Number(m.variante),
      archivo: m.archivo ?? '',
      cantidad: l.quantity,
      unidadCent: l.price?.unit_amount ?? Math.round(l.amount_subtotal / Math.max(1, l.quantity)),
    };
  });
  const completas =
    lineasStripe.length > 0 &&
    lineasStripe.every(
      (l) => l.slug && l.talla && l.nombre && Number.isInteger(l.variante) && l.variante > 0 && /^\/tienda\/impresion\/[a-z0-9-]+\.png$/.test(l.archivo)
    );

  let lineas: { nombre: string; talla: string; cantidad: number; unidadCent: number; variante: number; archivo: string }[];
  let subtotalCatalogo: number | null = null;
  if (completas) {
    lineas = lineasStripe;
  } else {
    const cesta = decodificarCesta(s.metadata?.cesta);
    if (!cesta.ok) {
      await avisoInterno('Pago con una cesta que no se entiende', [`Sesión ${s.id} (${referencia}): ${cesta.error}`, `Metadatos: ${s.metadata?.cesta ?? '(vacío)'}`]);
      return { estado: 500, mensaje: cesta.error };
    }
    const cobrado = new Map(lineasStripe.map((l) => [`${l.slug}:${l.talla}`, l.unidadCent]));
    lineas = cesta.lineas.map((l) => ({
      nombre: l.producto.nombre,
      talla: l.talla,
      cantidad: l.cantidad,
      unidadCent: cobrado.get(`${l.producto.slug}:${l.talla}`) ?? l.unidadCent,
      variante: l.variantId,
      archivo: l.producto.pod!.archivo,
    }));
    subtotalCatalogo = cesta.subtotalCent;
  }

  const base = baseArchivos();
  const articulos: ArticuloPedido[] = lineas.map((l) => ({
    variant_id: l.variante,
    quantity: l.cantidad,
    name: `${l.nombre} · ${l.talla}`,
    retail_price: dosDecimales(l.unidadCent),
    files: [{ type: 'front', url: `${base}${l.archivo}` }],
  }));

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
    direccion: [nombre, dir.line1, dir.line2, `${dir.postal_code} ${dir.city}`, dir.state].filter((x): x is string => !!x),
  };

  let resultado;
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
        zip: dir.postal_code.replace(/\s/g, ''),
        phone: s.customer_details?.phone || undefined,
        email,
      },
      articulos,
      cobrado: {
        subtotal: dosDecimales(subtotalCent),
        descuento: dosDecimales(descuentoCent),
        envio: dosDecimales(envioCent),
        total: dosDecimales(totalCent),
      },
    });
  } catch (e) {
    const motivo = e instanceof Error ? e.message : String(e);
    console.error('[tienda] Printful no ha aceptado el pedido', s.id, motivo);
    await avisoInterno('Printful no ha aceptado un pedido pagado', [
      `Motivo: ${motivo}`,
      ...resumenTexto(resumen),
      `Sesión de Stripe: ${s.id}. Stripe reintentará el aviso; si sigue fallando, crea el pedido a mano o devuelve el dinero.`,
    ]);
    return { estado: 500, mensaje: `Printful: ${motivo}` };
  }

  // Los correos se mandan también cuando el pedido ya existía (un reintento): llevan clave de idempotencia,
  // así que si la primera vez salieron no se repiten, y si fallaron, ahora sí salen.
  const descuadre = subtotalCatalogo !== null && subtotalCatalogo !== subtotalCent;
  const borrador = process.env.PRINTFUL_CONFIRMAR !== '1';
  const okCliente = await correoConfirmacion(resumen, `confirmacion-${externalId}`);
  const okAviso = await avisoInterno(
    borrador ? `Pedido nuevo ${referencia} (BORRADOR en Printful)` : `Pedido nuevo ${referencia}`,
    [
      ...resumenTexto(resumen),
      `Printful: pedido ${resultado.pedido.id} (${resultado.pedido.status}).`,
      ...(borrador ? ['Está en borrador porque PRINTFUL_CONFIRMAR no es 1: no se fabrica hasta que lo confirmes en Printful.'] : []),
      ...(descuadre ? [`Ojo: el catálogo de hoy suma ${eur(subtotalCatalogo!)} y se cobró ${eur(subtotalCent)}.`] : []),
      `Sesión de Stripe: ${s.id}`,
    ],
    `aviso-pedido-${externalId}`
  );
  if (!okCliente || !okAviso) {
    return { estado: 500, mensaje: `Pedido ${externalId} creado, pero falta algún correo: que Stripe lo reintente.` };
  }
  return { estado: 200, mensaje: resultado.yaExistia ? `Pedido ${externalId} ya creado; correos al día.` : `Pedido ${externalId} creado.` };
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
