// =====================================================
// CALENDARIO DE ADVIENTO 2026 — reglas, en un solo sitio
// =====================================================
// La web solo ANUNCIA el calendario: todo ocurre dentro de la app, que es la
// que abre cada ventana, sabe qué días ha completado cada persona y concede
// el regalo. Aquí no se recoge ningún dato. Si la app cambia fechas o reglas
// (js/adviento.js y la tabla de días en su base de datos), hay que cambiarlas
// también aquí: esta página no debe prometer nada que la app no haga.

/** Primer día del calendario. */
export const ADVIENTO_INICIO = '2026-12-01';
/** Último día: Navidad. */
export const ADVIENTO_FIN = '2026-12-25';
/** Días que dura (1 a 25 de diciembre, ambos incluidos). */
export const ADVIENTO_DIAS = 25;
/** Días que se pueden fallar sin perder el regalo. */
export const ADVIENTO_FALLOS = 3;
/** Días completados necesarios para recibir el regalo. */
export const ADVIENTO_MINIMO = ADVIENTO_DIAS - ADVIENTO_FALLOS;
/** Meses de Premium que se regalan. */
export const ADVIENTO_MESES_PREMIUM = 3;

/** Fechas señaladas del camino (solo calendario litúrgico, comprobable). */
export const ADVIENTO_HITOS = [
  { fecha: 'Martes 1 de diciembre', titulo: 'Se abre la primera ventana', texto: 'Empieza el calendario.' },
  { fecha: 'Domingo 6 de diciembre', titulo: 'Segundo domingo de Adviento', texto: 'Segunda vela de la corona.' },
  { fecha: 'Martes 8 de diciembre', titulo: 'La Inmaculada Concepción', texto: 'Solemnidad de la Virgen, en pleno Adviento.' },
  { fecha: 'Domingo 13 de diciembre', titulo: 'Tercer domingo, «Gaudete»', texto: 'El domingo de la alegría. Tercera vela.' },
  { fecha: 'Domingo 20 de diciembre', titulo: 'Cuarto domingo de Adviento', texto: 'Cuarta vela. Últimos días antes de Navidad.' },
  { fecha: 'Jueves 24 de diciembre', titulo: 'Nochebuena', texto: 'La penúltima ventana.' },
  { fecha: 'Viernes 25 de diciembre', titulo: 'Navidad', texto: 'La última ventana: el Niño Jesús llega al Belén.' },
];

export const ADVIENTO_FAQS = [
  {
    question: '¿Qué tengo que hacer cada día?',
    answer:
      'Abrir en la app la ventana del día. Dentro hay un reto para hacer en la propia app, una intención por la que rezamos todos y una oración. Al terminar, se añade una figura a tu Belén.',
  },
  {
    question: '¿Y si un día no puedo?',
    answer: `No pasa nada. El calendario tiene ${ADVIENTO_DIAS} días y para recibir el regalo basta con completar ${ADVIENTO_MINIMO}: puedes fallar hasta ${ADVIENTO_FALLOS}. Cada ventana se completa en su día.`,
  },
  {
    question: '¿Puedo empezar con el calendario ya en marcha?',
    answer: `Sí, puedes empezar cualquier día y seguir hasta Navidad. Para optar al regalo solo se pueden fallar ${ADVIENTO_FALLOS} días, así que el último día para empezar y recibirlo es el viernes 4 de diciembre.`,
  },
  {
    question: '¿Cómo recibo los 3 meses de Premium?',
    answer:
      'No tienes que pedirlos. Si completas los días necesarios, los activamos en tu cuenta de la app después de Navidad. No hay que poner ninguna tarjeta y, cuando pasan los tres meses, el Premium se termina solo: no se renueva ni se cobra nada.',
  },
  {
    question: '¿Cuesta algo participar?',
    answer:
      'No. El calendario es gratis y está abierto a todo el que tenga la app. Solo necesitas una cuenta, que también es gratis, para que se guarden tus días.',
  },
  {
    question: '¿Por qué empieza el día 1 si el Adviento empieza antes?',
    answer:
      'Este año el Adviento empieza el domingo 29 de noviembre. El calendario sigue la costumbre de los calendarios de Adviento de toda la vida: una ventana por día, del 1 de diciembre a Navidad.',
  },
  {
    question: 'No me aparece el calendario en la app, ¿qué hago?',
    answer:
      'Actualiza la app desde Google Play. Si todavía no te sale, ábrela en el navegador, en app.refugioenlapalabra.com, con tu misma cuenta: allí está siempre la última versión.',
  },
];
