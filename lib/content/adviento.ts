// =====================================================
// RETO DE ADVIENTO 2026 — reglas, en un solo sitio
// =====================================================
// Estas reglas son un ACUERDO con la app: la web las anuncia y recoge las
// inscripciones; la app es la que sabe qué días rezó cada persona y la que
// concede el Premium. Si cambias algo aquí, cámbialo también en la app
// (ver supabase/adviento-schema.sql, apartado «Acuerdo con la app»).

/** Primer día del reto: I domingo de Adviento. */
export const ADVIENTO_INICIO = '2026-11-29';
/** Último día del reto: Nochebuena. */
export const ADVIENTO_FIN = '2026-12-24';
/** Días que dura (29-nov a 24-dic, ambos incluidos). */
export const ADVIENTO_DIAS = 26;
/** Días rezados necesarios para recibir el regalo. */
export const ADVIENTO_MINIMO = 23;
/** Meses de Premium que se regalan. */
export const ADVIENTO_MESES_PREMIUM = 3;

/**
 * Último instante en el que se admite una inscripción: el final del 24 de
 * diciembre en hora peninsular (CET, UTC+1).
 */
export const ADVIENTO_CIERRE_ISO = '2026-12-24T23:59:59+01:00';

export function adventoCerrado(now: Date = new Date()): boolean {
  return now.getTime() > new Date(ADVIENTO_CIERRE_ISO).getTime();
}

/** Fechas señaladas del camino (solo calendario litúrgico, comprobable). */
export const ADVIENTO_HITOS = [
  { fecha: 'Domingo 29 de noviembre', titulo: 'Primer domingo de Adviento', texto: 'Empieza el reto. Primera vela de la corona.' },
  { fecha: 'Domingo 6 de diciembre', titulo: 'Segundo domingo', texto: 'Segunda vela.' },
  { fecha: 'Martes 8 de diciembre', titulo: 'La Inmaculada Concepción', texto: 'Buen día para rezar también el Rosario.' },
  { fecha: 'Domingo 13 de diciembre', titulo: 'Tercer domingo, «Gaudete»', texto: 'El domingo de la alegría. Tercera vela.' },
  { fecha: 'Domingo 20 de diciembre', titulo: 'Cuarto domingo', texto: 'Cuarta vela. Últimos días antes de Navidad.' },
  { fecha: 'Jueves 24 de diciembre', titulo: 'Nochebuena', texto: 'Último día del reto.' },
];

export const ADVIENTO_FAQS = [
  {
    question: '¿Qué tengo que hacer cada día?',
    answer:
      'Rezar el Evangelio del día en la app de Refugio en la Palabra, con tu cuenta. Son unos minutos. No hay que hacer nada más ni avisarnos: la app lo apunta sola.',
  },
  {
    question: '¿Y si un día no puedo?',
    answer: `No pasa nada. El reto dura ${ADVIENTO_DIAS} días y para recibir el regalo basta con rezar ${ADVIENTO_MINIMO} de ellos. Puedes fallar hasta ${ADVIENTO_DIAS - ADVIENTO_MINIMO} días.`,
  },
  {
    question: '¿Puedo apuntarme con el reto ya empezado?',
    answer: `Sí, puedes apuntarte hasta el 24 de diciembre. Ten en cuenta que para el regalo cuentan los días rezados entre el 29 de noviembre y el 24 de diciembre, así que para llegar a ${ADVIENTO_MINIMO} conviene empezar pronto.`,
  },
  {
    question: '¿Cómo recibo los 3 meses de Premium?',
    answer:
      'Apúntate aquí con el mismo correo que usas en tu cuenta de la app. La semana del 28 de diciembre activamos el Premium en esa cuenta y te avisamos por correo. No tienes que poner ninguna tarjeta y al terminar los tres meses no se renueva ni se cobra nada.',
  },
  {
    // Pendiente de confirmar con la app que el cobro se puede retrasar en
    // Stripe y en Google Play. Si no se puede, se entrega con un código.
    question: '¿Y si ya pago Premium?',
    answer:
      'También recibes el regalo: tus tres meses siguientes son gratis. Si pagas mes a mes, dejamos de cobrarte durante tres meses; si tienes el plan anual, tu renovación se retrasa tres meses. No pierdes nada de lo que ya has pagado.',
  },
  {
    question: '¿Cuesta algo participar?',
    answer: 'No. Rezar con la app es gratis y apuntarse al reto también.',
  },
  {
    question: '¿Para qué usáis mi correo?',
    answer:
      'Solo para el reto: saber a qué cuenta darle el regalo y escribirte sobre el propio reto. Si quieres que lo borremos, escríbenos a info@refugioenlapalabra.com.',
  },
];
