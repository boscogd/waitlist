// =====================================================
// TIENDA · CATÁLOGO DE EJEMPLO (DEMO)
// =====================================================
// Productos, precios, horas y existencias son de ejemplo para enseñar la
// tienda. Salen del plan de la tienda (18-nov-2026): precios de mercado de
// belenes de crochet, escapularios y polares. Cuando sea real, esto vivirá en
// Supabase y el pago irá por Stripe Checkout.

export type Arte =
  | 'misterio'
  | 'misterio-animales'
  | 'reyes'
  | 'belen-completo'
  | 'escapulario'
  | 'escapulario-comunion'
  | 'capillita'
  | 'kit-mayo'
  | 'polar'
  | 'sudadera'
  | 'camiseta';

export type Linea = 'hecho-en-casa' | 'ropa';

/** Quién lo hace y cuánto lleva. Es la «etiqueta cosida» de cada pieza. */
export interface Hechura {
  quien: string;
  horas: string;
  /** Piezas que salen al mes y cuántas quedan; null si es por encargo. */
  mes: { hechas: number; quedan: number } | null;
  /** Lo que pone la etiqueta cuando no hay cupo mensual (por defecto, «Por encargo»). */
  nota?: string;
}

export type Entrega =
  | { tipo: 'stock'; texto: string }
  | { tipo: 'encargo'; texto: string }
  | { tipo: 'bajo-demanda'; texto: string }
  | { tipo: 'preventa'; texto: string; cierra: string; total: number; reservadas: number }
  | { tipo: 'proximamente'; texto: string };

export interface Producto {
  slug: string;
  nombre: string;
  linea: Linea;
  precio: number;
  /** «desde» delante del precio (encargos con precio variable). */
  desde?: boolean;
  arte: Arte;
  resumen: string;
  descripcion: string[];
  detalles: { etiqueta: string; valor: string }[];
  hechura?: Hechura;
  entrega: Entrega;
  tallas?: string[];
  personalizable?: { etiqueta: string; ayuda: string };
  /** Aviso que la ley o la devoción piden decir antes de comprar. */
  aviso?: string;
}

export const PRODUCTOS: Producto[] = [
  {
    slug: 'misterio-crochet',
    nombre: 'Misterio de crochet',
    linea: 'hecho-en-casa',
    precio: 55,
    arte: 'misterio',
    resumen: 'La Virgen, san José y el Niño en su pesebre. Tres piezas de 9 a 12 cm.',
    descripcion: [
      'El corazón del belén, tejido punto a punto con algodón. La Virgen lleva su manto azul, san José su cayado y el Niño duerme en un pesebre de paja.',
      'Cada pieza es única: las caras cambian un poco de una a otra, como pasa con todo lo que se hace a mano. Si el año que viene quieres ampliarlo, los Reyes y los animales están hechos a la misma escala.',
    ],
    detalles: [
      { etiqueta: 'Piezas', valor: 'Virgen, san José y Niño con pesebre' },
      { etiqueta: 'Medidas', valor: 'De 9 a 12 cm de alto' },
      { etiqueta: 'Material', valor: '100 % algodón, relleno de fibra' },
      { etiqueta: 'Cuidado', valor: 'Quitar el polvo con un pincel; no lavar a máquina' },
    ],
    hechura: { quien: 'Tejido por mi madre', horas: '9 h', mes: { hechas: 4, quedan: 2 } },
    entrega: { tipo: 'stock', texto: 'Hecho y listo. Sale en 48 h.' },
    aviso: 'Objeto decorativo, no es un juguete. No apto para menores de 14 años.',
  },
  {
    slug: 'misterio-buey-mula',
    nombre: 'Misterio con buey y mula',
    linea: 'hecho-en-casa',
    precio: 72,
    arte: 'misterio-animales',
    resumen: 'El misterio de tres piezas con el buey y la mula que calientan al Niño.',
    descripcion: [
      'El mismo misterio, con los dos animales del portal. El buey en marrón tostado y la mula en gris, tumbados para que quepan en cualquier estantería.',
    ],
    detalles: [
      { etiqueta: 'Piezas', valor: 'Virgen, san José, Niño, buey y mula' },
      { etiqueta: 'Medidas', valor: 'De 6 a 12 cm' },
      { etiqueta: 'Material', valor: '100 % algodón, relleno de fibra' },
      { etiqueta: 'Cuidado', valor: 'Quitar el polvo con un pincel; no lavar a máquina' },
    ],
    hechura: { quien: 'Tejido por mi madre', horas: '13 h', mes: { hechas: 2, quedan: 1 } },
    entrega: { tipo: 'stock', texto: 'Hecho y listo. Sale en 48 h.' },
    aviso: 'Objeto decorativo, no es un juguete. No apto para menores de 14 años.',
  },
  {
    slug: 'reyes-magos',
    nombre: 'Los Reyes Magos',
    linea: 'hecho-en-casa',
    precio: 45,
    arte: 'reyes',
    resumen: 'Melchor, Gaspar y Baltasar, a la escala del misterio. Para ampliar el belén.',
    descripcion: [
      'Los tres Reyes con sus coronas y sus regalos: oro, incienso y mirra. Pensados para quien ya tiene el misterio y quiere que el belén crezca año a año.',
    ],
    detalles: [
      { etiqueta: 'Piezas', valor: 'Melchor, Gaspar y Baltasar' },
      { etiqueta: 'Medidas', valor: '11 cm de alto' },
      { etiqueta: 'Material', valor: '100 % algodón, relleno de fibra' },
      { etiqueta: 'Cuidado', valor: 'Quitar el polvo con un pincel' },
    ],
    hechura: { quien: 'Tejido por mi madre', horas: '10 h', mes: { hechas: 3, quedan: 3 } },
    entrega: { tipo: 'stock', texto: 'Se pueden pedir hasta el 2 de enero para Reyes.' },
    aviso: 'Objeto decorativo, no es un juguete. No apto para menores de 14 años.',
  },
  {
    slug: 'belen-completo',
    nombre: 'Belén completo, por encargo',
    linea: 'hecho-en-casa',
    precio: 220,
    desde: true,
    arte: 'belen-completo',
    resumen: 'De 12 a 15 figuras: misterio, animales, Reyes, ángel y pastores.',
    descripcion: [
      'Un belén entero tejido para tu casa. Lo hablamos contigo: cuántas figuras, qué colores y si quieres alguna escena especial.',
      'Lleva entre 30 y 50 horas de trabajo, por eso solo aceptamos unos pocos encargos al año y con plazo.',
    ],
    detalles: [
      { etiqueta: 'Piezas', valor: 'De 12 a 15 figuras' },
      { etiqueta: 'Plazo', valor: 'Unas 5 semanas desde que se confirma' },
      { etiqueta: 'Material', valor: '100 % algodón, relleno de fibra' },
    ],
    hechura: { quien: 'Tejido por mi madre', horas: '30–50 h', mes: null },
    entrega: { tipo: 'encargo', texto: 'Por encargo. Los de esta Navidad ya están cerrados: se apunta para 2027.' },
    personalizable: { etiqueta: 'Qué figuras quieres', ayuda: 'Por ejemplo: misterio, animales, Reyes y dos pastores.' },
    aviso: 'Al ser un encargo personalizado, no admite desistimiento. Objeto decorativo, no es un juguete.',
  },
  {
    slug: 'escapulario-carmen',
    nombre: 'Escapulario del Carmen',
    linea: 'hecho-en-casa',
    precio: 15,
    arte: 'escapulario',
    resumen: 'Dos piezas de lana marrón unidas por cordones, cosidas a mano.',
    descripcion: [
      'El escapulario de la Virgen del Carmen, como manda la tradición: dos piezas de lana marrón unidas por cordones, una sobre el pecho y otra sobre la espalda.',
      'Se entrega sin bendecir. La primera vez lo bendice e impone un sacerdote: llévalo a tu parroquia. En la app de Refugio tienes la oración de imposición y qué significa llevarlo.',
    ],
    detalles: [
      { etiqueta: 'Material', valor: '100 % lana, cordón de algodón' },
      { etiqueta: 'Medidas', valor: 'Piezas de 5 × 4 cm' },
      { etiqueta: 'Cuidado', valor: 'Lavar a mano en frío' },
    ],
    hechura: { quien: 'Cosido por Aida', horas: '1 h', mes: { hechas: 20, quedan: 14 } },
    entrega: { tipo: 'stock', texto: 'Hecho y listo. Sale en 48 h.' },
    aviso: 'Se entrega sin bendecir: no cobramos ninguna bendición.',
  },
  {
    slug: 'escapulario-comunion',
    nombre: 'Escapulario de Primera Comunión',
    linea: 'hecho-en-casa',
    precio: 24,
    arte: 'escapulario-comunion',
    resumen: 'En lana blanca, con el nombre y la fecha bordados en dorado.',
    descripcion: [
      'Un recuerdo para el día de la Primera Comunión: escapulario en lana blanca con el nombre y la fecha bordados a mano en hilo dorado.',
      'Se entrega sin bendecir, para que lo imponga el sacerdote el mismo día o en la parroquia.',
    ],
    detalles: [
      { etiqueta: 'Material', valor: '100 % lana, hilo dorado de poliéster' },
      { etiqueta: 'Plazo', valor: '3 semanas; para mayo, pídelo antes de abril' },
      { etiqueta: 'Cuidado', valor: 'Lavar a mano en frío' },
    ],
    hechura: { quien: 'Cosido y bordado por Aida', horas: '2 h', mes: { hechas: 10, quedan: 7 } },
    entrega: { tipo: 'encargo', texto: 'Se borda al pedirlo. Unas 3 semanas.' },
    personalizable: { etiqueta: 'Nombre y fecha', ayuda: 'Por ejemplo: Lucía · 10-05-2027' },
    aviso: 'Al llevar nombre bordado, no admite desistimiento. Se entrega sin bendecir.',
  },
  {
    slug: 'capillita',
    nombre: 'Capillita de pared',
    linea: 'hecho-en-casa',
    precio: 59,
    arte: 'capillita',
    resumen: 'Un pequeño altar de madera para el rincón de oración de casa.',
    descripcion: [
      'Una hornacina de madera pintada a mano, con su lámina de la Virgen y sitio para una vela pequeña. Para que en casa haya un lugar donde parar a rezar.',
      'En la web de Refugio tienes la guía para montar un rincón de oración.',
    ],
    detalles: [
      { etiqueta: 'Material', valor: 'Madera de pino pintada, lámina impresa' },
      { etiqueta: 'Medidas', valor: '25 × 18 × 8 cm' },
      { etiqueta: 'Plazo', valor: 'Unas 2 semanas' },
    ],
    hechura: { quien: 'Hecho por Aida', horas: '4 h', mes: { hechas: 3, quedan: 2 } },
    entrega: { tipo: 'encargo', texto: 'Se hace bajo pedido. Unas 2 semanas.' },
    aviso: 'La vela no se deja encendida sin vigilar.',
  },
  {
    slug: 'kit-altar-mayo',
    nombre: 'Altar de mayo',
    linea: 'hecho-en-casa',
    precio: 35,
    arte: 'kit-mayo',
    resumen: 'Tapete, vela, lámina de la Virgen y flores secas para el mes de María.',
    descripcion: [
      'Todo lo necesario para preparar en casa el altar del mes de mayo: tapete de ganchillo, vela, lámina enmarcada de la Virgen y un ramito de flores secas.',
    ],
    detalles: [
      { etiqueta: 'Incluye', valor: 'Tapete, vela, lámina enmarcada y flores secas' },
      { etiqueta: 'Disponible', valor: 'Desde primeros de abril' },
    ],
    hechura: { quien: 'Preparado por Aida', horas: '3 h', mes: null, nota: 'Llega en abril' },
    entrega: { tipo: 'proximamente', texto: 'Llega en abril, para el mes de María.' },
  },
  {
    slug: 'polar-inmaculada',
    nombre: 'Polar Inmaculada',
    linea: 'ropa',
    precio: 45,
    arte: 'polar',
    resumen: 'Media cremallera, bordado en el pecho. Edición de 50 unidades.',
    descripcion: [
      'El polar de media cremallera de toda la vida, en azul marino, con la cruz de Refugio bordada en albero sobre el pecho.',
      'Va en preventa: pagas ahora, encargamos al taller de Sevilla exactamente las que se pidan y te llega antes de Reyes. Cuando se cierra la preventa, no se vuelve a hacer igual.',
    ],
    detalles: [
      { etiqueta: 'Composición', valor: '100 % poliéster reciclado, 300 g/m²' },
      { etiqueta: 'Bordado', valor: 'Hecho en Sevilla' },
      { etiqueta: 'Corte', valor: 'Unisex, holgado' },
      { etiqueta: 'Cuidado', valor: 'Lavar del revés a 30 °C' },
    ],
    entrega: {
      tipo: 'preventa',
      texto: 'Entrega antes del 5 de enero.',
      cierra: '8 de diciembre',
      total: 50,
      reservadas: 31,
    },
    tallas: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'sudadera-refugio',
    nombre: 'Sudadera Refugio',
    linea: 'ropa',
    precio: 39.9,
    arte: 'sudadera',
    resumen: 'Con capucha, algodón orgánico y el nombre bordado.',
    descripcion: [
      'Sudadera con capucha de algodón orgánico con «Refugio en la Palabra» bordado en el pecho.',
      'Se fabrica cuando la pides, en Barcelona: así no hay excedentes y siempre hay todas las tallas.',
    ],
    detalles: [
      { etiqueta: 'Composición', valor: '85 % algodón orgánico, 15 % poliéster reciclado' },
      { etiqueta: 'Corte', valor: 'Unisex' },
      { etiqueta: 'Cuidado', valor: 'Lavar del revés a 30 °C' },
    ],
    entrega: { tipo: 'bajo-demanda', texto: 'Se hace al pedirla. Llega en 5–8 días.' },
    tallas: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'camiseta-fiat',
    nombre: 'Camiseta «Fiat»',
    linea: 'ropa',
    precio: 22,
    arte: 'camiseta',
    resumen: 'El «hágase» de María, en tinta azul sobre algodón crudo.',
    descripcion: [
      '«Fiat»: lo que respondió María al ángel. Una palabra, en letra de imprenta, sobre una camiseta de algodón orgánico color crudo.',
      'Se fabrica cuando la pides, en Barcelona.',
    ],
    detalles: [
      { etiqueta: 'Composición', valor: '100 % algodón orgánico' },
      { etiqueta: 'Corte', valor: 'Unisex' },
      { etiqueta: 'Cuidado', valor: 'Lavar del revés a 30 °C' },
    ],
    entrega: { tipo: 'bajo-demanda', texto: 'Se hace al pedirla. Llega en 5–8 días.' },
    tallas: ['XS', 'S', 'M', 'L', 'XL'],
  },
];

export const ENVIO = { coste: 4.9, gratisDesde: 60 };

export function producto(slug: string) {
  return PRODUCTOS.find((p) => p.slug === slug);
}

export function euros(n: number) {
  return n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  });
}

/** Unidades que se pueden pedir de una vez: lo que queda este mes o de la preventa, y nunca más de 9. */
export function maximo(p: Producto) {
  if (p.hechura?.mes) return Math.min(9, p.hechura.mes.quedan);
  if (p.entrega.tipo === 'preventa') return Math.min(9, p.entrega.total - p.entrega.reservadas);
  return 9;
}

/** Se puede meter en la cesta (lo que aún no se vende, no). */
export function sePuedeComprar(p: Producto) {
  if (p.entrega.tipo === 'proximamente') return false;
  if (p.slug === 'belen-completo') return false;
  if (p.hechura?.mes && p.hechura.mes.quedan <= 0) return false;
  return true;
}
