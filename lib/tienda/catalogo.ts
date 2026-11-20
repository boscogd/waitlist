// =====================================================
// TIENDA · CATÁLOGO DE EJEMPLO (DEMO)
// =====================================================
// Productos, precios y existencias son de ejemplo para enseñar la tienda.
// Las fotos y el vídeo son de muestra (Unsplash y Pexels, licencia libre): se
// cambiarán por los de las piezas reales. Cuando sea real, esto vivirá en Supabase y el pago
// irá por Stripe Checkout.

export type Linea = 'belenes' | 'devocion' | 'ropa';

export const LINEAS: Record<Linea, { nombre: string; ancla: string }> = {
  belenes: { nombre: 'Belenes de ganchillo', ancla: 'reparto' },
  devocion: { nombre: 'Devoción', ancla: 'devocion' },
  ropa: { nombre: 'Ropa', ancla: 'ropa' },
};

/** Colores de la tienda: cada producto tiene el suyo y su foto se enseña sobre él. */
export const TONOS = {
  celeste: { fondo: '#A9C9EC', tinta: '#1F3A5F' },
  albero: { fondo: '#F1BC45', tinta: '#3A2A10' },
  rosa: { fondo: '#F5C3CD', tinta: '#5A1F2E' },
  verde: { fondo: '#2E7A56', tinta: '#FFFFFF' },
  azul: { fondo: '#1F3A5F', tinta: '#FFFFFF' },
  morado: { fondo: '#4B2F6F', tinta: '#FFFFFF' },
} as const;
export type Tono = keyof typeof TONOS;

/** Foto de muestra: id en Unsplash («photo-…») o en Pexels (número), y texto alternativo. */
export interface Foto {
  id: string;
  alt: string;
  fuente?: 'unsplash' | 'pexels';
  /** Recorte centrado en un punto: x e y de 0 a 1, y el zoom (1 = sin zoom). */
  foco?: [number, number, number];
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
  /** Color sobre el que se enseña el producto. */
  tono: Tono;
  precio: number;
  /** «desde» delante del precio (encargos con precio variable). */
  desde?: boolean;
  fotos: Foto[];
  resumen: string;
  descripcion: string[];
  detalles: { etiqueta: string; valor: string }[];
  /** Quién lo hace, en una línea («Tejido a mano por mi madre»). */
  hechoPor?: string;
  /** Unidades que quedan, cuando son pocas y se hacen a mano. */
  quedan?: number;
  entrega: Entrega;
  tallas?: string[];
  /** Aviso que la ley o la devoción piden decir antes de comprar. */
  aviso?: string;
}

const NO_JUGUETE = 'Objeto decorativo, no es un juguete. No apto para menores de 14 años.';
const CUIDADO_GANCHILLO = 'Quitar el polvo con un pincel; no lavar a máquina';
const MADRE = 'Tejido a mano por mi madre, en Sevilla';

export const PRODUCTOS: Producto[] = [
  // ─── Belenes de ganchillo ───
  {
    slug: 'misterio-ganchillo',
    nombre: 'Misterio de ganchillo',
    linea: 'belenes',
    tono: 'celeste',
    precio: 55,
    fotos: [
      { id: 'photo-1607172567746-5f2ea1e4b12b', alt: 'La Virgen de punto, con manto azul, junto al Niño en su pesebre', foco: [0.47, 0.58, 1.5] },
      { id: 'photo-1606915634445-ef81ad3709bb', alt: 'La Virgen y el Niño de punto sobre una tela blanca', foco: [0.4, 0.6, 1.4] },
    ],
    resumen: 'La Virgen, san José y el Niño. Tres piezas de 9 a 12 cm.',
    descripcion: [
      'El centro del belén, tejido con algodón. La Virgen lleva su manto, san José su cayado y el Niño va en un pesebre.',
      'Las caras cambian un poco de una figura a otra, porque se hacen a mano. Los Reyes, el ángel y los pastores están hechos a la misma escala, por si quieres ampliarlo.',
    ],
    detalles: [
      { etiqueta: 'Piezas', valor: 'Virgen, san José y Niño con pesebre' },
      { etiqueta: 'Medidas', valor: 'De 9 a 12 cm de alto' },
      { etiqueta: 'Material', valor: '100 % algodón, relleno de fibra' },
      { etiqueta: 'Cuidado', valor: CUIDADO_GANCHILLO },
    ],
    hechoPor: MADRE,
    quedan: 2,
    entrega: { tipo: 'stock', texto: 'Hecho y listo. Sale en 48 h.' },
    aviso: NO_JUGUETE,
  },
  {
    slug: 'reyes-magos',
    nombre: 'Reyes Magos de ganchillo',
    linea: 'belenes',
    tono: 'albero',
    precio: 45,
    fotos: [{ id: 'photo-1765672479078-7f2c14e3163a', alt: 'Los tres Reyes Magos de ganchillo con sus camellos' }],
    resumen: 'Melchor, Gaspar y Baltasar, a la escala del misterio.',
    descripcion: [
      'Los tres Reyes con sus coronas y sus regalos. Pensados para quien ya tiene el misterio y quiere que el belén crezca año a año.',
    ],
    detalles: [
      { etiqueta: 'Piezas', valor: 'Melchor, Gaspar y Baltasar' },
      { etiqueta: 'Medidas', valor: '11 cm de alto' },
      { etiqueta: 'Material', valor: '100 % algodón, relleno de fibra' },
      { etiqueta: 'Cuidado', valor: CUIDADO_GANCHILLO },
    ],
    hechoPor: MADRE,
    quedan: 3,
    entrega: { tipo: 'stock', texto: 'Se pueden pedir hasta el 2 de enero para Reyes.' },
    aviso: NO_JUGUETE,
  },
  {
    slug: 'pastor-ovejas',
    nombre: 'Pastor y rebaño',
    linea: 'belenes',
    tono: 'verde',
    precio: 28,
    fotos: [
      { id: '40966102', fuente: 'pexels', alt: 'Rebaño de ovejas de ganchillo con sus ropitas de colores' },
      { id: 'photo-1607172567746-5f2ea1e4b12b', alt: 'Pastor de punto con túnica de rayas y su cayado', foco: [0.86, 0.55, 2] },
    ],
    resumen: 'Un pastor y cuatro ovejas para completar el misterio.',
    descripcion: ['Un pastor con su cayado y cuatro ovejas de lana, cada una con su ropita, a la escala del misterio.'],
    detalles: [
      { etiqueta: 'Piezas', valor: 'Pastor y cuatro ovejas' },
      { etiqueta: 'Medidas', valor: 'Pastor de 10 cm; ovejas de 5 cm' },
      { etiqueta: 'Material', valor: 'Algodón y lana rizada, relleno de fibra' },
      { etiqueta: 'Cuidado', valor: CUIDADO_GANCHILLO },
    ],
    hechoPor: MADRE,
    quedan: 4,
    entrega: { tipo: 'stock', texto: 'Hecho y listo. Sale en 48 h.' },
    aviso: NO_JUGUETE,
  },
  {
    slug: 'angel-ganchillo',
    nombre: 'Ángel de ganchillo',
    linea: 'belenes',
    tono: 'rosa',
    precio: 18,
    fotos: [{ id: 'photo-1792591768727-99dcc34b3e41', alt: 'Ángel de ganchillo con vestido blanco y alas rosas' }],
    resumen: 'Para lo alto del portal o para colgar del árbol.',
    descripcion: ['Un ángel con su vestido blanco y alas de punto. Lleva una cinta por detrás para colgarlo.'],
    detalles: [
      { etiqueta: 'Medidas', valor: '12 cm de alto' },
      { etiqueta: 'Material', valor: '100 % algodón, relleno de fibra' },
      { etiqueta: 'Cuidado', valor: CUIDADO_GANCHILLO },
    ],
    hechoPor: MADRE,
    quedan: 6,
    entrega: { tipo: 'stock', texto: 'Hecho y listo. Sale en 48 h.' },
    aviso: NO_JUGUETE,
  },
  {
    slug: 'belen-completo',
    nombre: 'Belén completo, por encargo',
    linea: 'belenes',
    tono: 'azul',
    precio: 220,
    desde: true,
    fotos: [
      { id: 'photo-1607172567746-5f2ea1e4b12b', alt: 'Belén completo de ganchillo con el portal de madera, los Reyes y los pastores' },
      { id: 'photo-1606915634445-ef81ad3709bb', alt: 'Figuras del belén de ganchillo sobre una tela blanca' },
    ],
    resumen: 'De 12 a 15 figuras: misterio, Reyes, ángel, pastores y animales.',
    descripcion: [
      'Un belén entero tejido para tu casa. Lo hablamos contigo: cuántas figuras, qué colores y si quieres alguna escena especial.',
      'Lleva entre 30 y 50 horas de trabajo, así que se aceptan pocos encargos al año. Los de esta Navidad ya están cerrados.',
    ],
    detalles: [
      { etiqueta: 'Piezas', valor: 'De 12 a 15 figuras' },
      { etiqueta: 'Plazo', valor: 'Unas 5 semanas desde que se confirma' },
      { etiqueta: 'Material', valor: '100 % algodón, relleno de fibra' },
    ],
    hechoPor: MADRE,
    entrega: { tipo: 'encargo', texto: 'Por encargo. Se apunta para la Navidad de 2027.' },
    aviso: 'Al ser un encargo personalizado, no admite desistimiento. ' + NO_JUGUETE,
  },

  // ─── Devoción ───
  {
    slug: 'escapulario-carmen',
    nombre: 'Escapulario del Carmen',
    linea: 'devocion',
    tono: 'albero',
    precio: 15,
    fotos: [
      { id: 'photo-1695437229606-40c602d9e444', alt: 'Escapulario de tela marrón con la imagen de la Virgen y su cordón' },
      { id: 'photo-1689392351542-ff112fe917c6', alt: 'Escapularios con la imagen de la Virgen junto a un rosario' },
    ],
    resumen: 'Dos piezas de tela marrón unidas por cordones, cosidas a mano.',
    descripcion: [
      'El escapulario de la Virgen del Carmen: dos piezas de tela marrón unidas por cordones, una sobre el pecho y otra sobre la espalda.',
      'Se entrega sin bendecir. La primera vez lo bendice e impone un sacerdote: llévalo a tu parroquia. En la app de Refugio tienes la oración de imposición.',
    ],
    detalles: [
      { etiqueta: 'Material', valor: 'Lana, cordón de algodón' },
      { etiqueta: 'Medidas', valor: 'Piezas de 5 × 4 cm' },
      { etiqueta: 'Cuidado', valor: 'Lavar a mano en frío' },
    ],
    hechoPor: 'Cosido a mano por Aida',
    entrega: { tipo: 'stock', texto: 'Hecho y listo. Sale en 48 h.' },
    aviso: 'Se entrega sin bendecir: no cobramos ninguna bendición.',
  },
  {
    slug: 'rosario-madera',
    nombre: 'Rosario de madera',
    linea: 'devocion',
    tono: 'celeste',
    precio: 19,
    fotos: [
      { id: '7543087', fuente: 'pexels', alt: 'Rosario de cuentas de madera con cruz de madera, sobre blanco' },
      { id: '1556713', fuente: 'pexels', alt: 'Rosario de madera en forma de corazón sobre fondo amarillo' },
    ],
    resumen: 'Cuentas de madera de 8 mm y cruz de madera, montado a mano.',
    descripcion: [
      'Un rosario sencillo para el bolsillo o la mesilla. Cuentas de madera de 8 mm, cordón resistente y cruz de madera.',
      'En la app de Refugio tienes los misterios de cada día para rezarlo.',
    ],
    detalles: [
      { etiqueta: 'Material', valor: 'Madera y cordón encerado' },
      { etiqueta: 'Medidas', valor: '45 cm de largo; cruz de 4 cm' },
    ],
    hechoPor: 'Montado a mano por Aida',
    entrega: { tipo: 'stock', texto: 'Hecho y listo. Sale en 48 h.' },
    aviso: 'Se entrega sin bendecir.',
  },
  {
    slug: 'rosario-claro',
    nombre: 'Rosario de cuentas rojas',
    linea: 'devocion',
    tono: 'rosa',
    precio: 17,
    fotos: [
      { id: '4202951', fuente: 'pexels', alt: 'Rosario de cuentas rojas con cruz roja sobre fondo rosa' },
      { id: '4202953', fuente: 'pexels', alt: 'La cruz roja del rosario, de cerca' },
    ],
    resumen: 'Cuentas rojas y cruz a juego. Un buen regalo de Primera Comunión.',
    descripcion: ['Rosario de cuentas rojas con la cruz a juego. Va en una bolsita de tela, listo para regalar.'],
    detalles: [
      { etiqueta: 'Material', valor: 'Cuentas de resina y cordón de nailon' },
      { etiqueta: 'Medidas', valor: '42 cm de largo' },
    ],
    hechoPor: 'Montado a mano por Aida',
    entrega: { tipo: 'stock', texto: 'Hecho y listo. Sale en 48 h.' },
    aviso: 'Se entrega sin bendecir.',
  },
  {
    slug: 'medalla-milagrosa',
    nombre: 'Medalla de la Milagrosa',
    linea: 'devocion',
    tono: 'morado',
    precio: 29,
    fotos: [
      { id: 'photo-1778000000815-5b06539b1f85', alt: 'Medalla ovalada dorada de la Virgen sobre fondo blanco' },
      { id: 'photo-1781901726878-24afc3bb8cbb', alt: 'La medalla colgada de una cadena dorada' },
    ],
    resumen: 'Plata de ley con baño de oro y cadena de 45 cm.',
    descripcion: ['La medalla de la Virgen Milagrosa en plata de ley con baño de oro, con su cadena. Va en estuche.'],
    detalles: [
      { etiqueta: 'Material', valor: 'Plata de ley 925 con baño de oro' },
      { etiqueta: 'Medidas', valor: 'Medalla de 18 mm; cadena de 45 cm' },
    ],
    entrega: { tipo: 'stock', texto: 'Sale en 48 h.' },
    aviso: 'Se entrega sin bendecir.',
  },
  {
    slug: 'crucifijo-pared',
    nombre: 'Crucifijo de pared',
    linea: 'devocion',
    tono: 'verde',
    precio: 39,
    fotos: [{ id: 'photo-1630892116465-8bb147daf88f', alt: 'Crucifijo de madera oscura con Cristo plateado colgado en una pared blanca' }],
    resumen: 'Madera de nogal y Cristo de metal. 25 cm.',
    descripcion: ['Un crucifijo para la entrada o el dormitorio. Madera de nogal barnizada y Cristo de metal plateado, con colgador por detrás.'],
    detalles: [
      { etiqueta: 'Material', valor: 'Madera de nogal, Cristo de metal plateado' },
      { etiqueta: 'Medidas', valor: '25 × 13 cm' },
    ],
    entrega: { tipo: 'stock', texto: 'Sale en 48 h.' },
  },
  {
    slug: 'altar-mayo',
    nombre: 'Altar de mayo',
    linea: 'devocion',
    tono: 'celeste',
    precio: 35,
    fotos: [
      { id: 'photo-1565567246634-990fb94afff1', alt: 'Imagen blanca de la Virgen rodeada de orquídeas' },
      { id: 'photo-1576027202680-eef36697d47d', alt: 'Imagen de la Virgen con flores amarillas y velas encendidas' },
    ],
    resumen: 'Imagen de la Virgen, tapete, vela y flores secas para el mes de María.',
    descripcion: ['Todo lo que hace falta para preparar en casa el altar de mayo: una imagen de la Virgen de 20 cm, tapete de ganchillo, vela y un ramo de flores secas.'],
    detalles: [
      { etiqueta: 'Incluye', valor: 'Imagen de 20 cm, tapete, vela y flores secas' },
      { etiqueta: 'Disponible', valor: 'Desde primeros de abril' },
    ],
    hechoPor: 'Preparado por Aida',
    entrega: { tipo: 'proximamente', texto: 'Llega en abril, para el mes de María.' },
  },

  // ─── Ropa ───
  {
    slug: 'polar-inmaculada',
    nombre: 'Polar Inmaculada',
    linea: 'ropa',
    tono: 'celeste',
    precio: 45,
    fotos: [{ id: 'photo-1794699793044-95933253e125', alt: 'Chico con el polar de media cremallera en color crudo' }],
    resumen: 'Media cremallera, color crudo, bordado en el pecho. Edición de 50.',
    descripcion: [
      'El polar de media cremallera de toda la vida, en color crudo, con la cruz de Refugio bordada en azul sobre el pecho.',
      'Va en preventa: pagas ahora, el taller de Sevilla hace exactamente los que se pidan y te llega antes de Reyes. Cuando se cierra la preventa, no se vuelve a hacer igual.',
    ],
    detalles: [
      { etiqueta: 'Composición', valor: '100 % poliéster reciclado, 300 g/m²' },
      { etiqueta: 'Bordado', valor: 'Taller de Sevilla' },
      { etiqueta: 'Corte', valor: 'Unisex, holgado' },
      { etiqueta: 'Cuidado', valor: 'Lavar del revés a 30 °C' },
    ],
    entrega: { tipo: 'preventa', texto: 'Entrega antes del 5 de enero.', cierra: '8 de diciembre', total: 50, reservadas: 31 },
    tallas: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'sudadera-refugio',
    nombre: 'Sudadera Refugio',
    linea: 'ropa',
    tono: 'rosa',
    precio: 39.9,
    fotos: [{ id: 'photo-1549653233-423867e8feab', alt: 'Chica con la sudadera azul marino de cuello redondo' }],
    resumen: 'Azul marino, cuello redondo, algodón orgánico.',
    descripcion: [
      'Sudadera de cuello redondo en algodón orgánico, con «Refugio en la Palabra» bordado pequeño en el pecho.',
      'Se fabrica cuando la pides: así no sobra ropa en ningún almacén y siempre están todas las tallas.',
    ],
    detalles: [
      { etiqueta: 'Composición', valor: '85 % algodón orgánico, 15 % poliéster reciclado' },
      { etiqueta: 'Corte', valor: 'Unisex' },
      { etiqueta: 'Cuidado', valor: 'Lavar del revés a 30 °C' },
    ],
    entrega: { tipo: 'bajo-demanda', texto: 'Se hace al pedirla. Llega en 5 a 8 días.' },
    tallas: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'camiseta-fiat',
    nombre: 'Camiseta «Fiat»',
    linea: 'ropa',
    tono: 'albero',
    precio: 22,
    fotos: [
      { id: 'photo-1778671394516-8270eac13c42', alt: 'Camiseta blanca colgada de una percha de madera' },
      { id: 'photo-1521572163474-6864f9cf17ab', alt: 'Chico con la camiseta blanca puesta' },
    ],
    resumen: 'El «hágase» de María, pequeño en el pecho. Algodón orgánico.',
    descripcion: [
      '«Fiat» es lo que respondió María al ángel. Una palabra, impresa pequeña en azul sobre una camiseta blanca de algodón orgánico.',
      'Se fabrica cuando la pides.',
    ],
    detalles: [
      { etiqueta: 'Composición', valor: '100 % algodón orgánico' },
      { etiqueta: 'Corte', valor: 'Unisex' },
      { etiqueta: 'Cuidado', valor: 'Lavar del revés a 30 °C' },
    ],
    entrega: { tipo: 'bajo-demanda', texto: 'Se hace al pedirla. Llega en 5 a 8 días.' },
    tallas: ['XS', 'S', 'M', 'L', 'XL'],
  },
];

/** Fotos de ambiente que no son de un producto. */
export const AMBIENTE: Record<'lana' | 'manos', Foto> = {
  lana: { id: 'photo-1532629804872-98086b058cae', alt: 'Cesta de mimbre con ovillos de lana blanca y gris' },
  manos: { id: '7585268', fuente: 'pexels', alt: 'Manos tejiendo con ganchillo e hilo blanco' },
};

/** Vídeo de la portada (Pexels, licencia libre): manos haciendo ganchillo. */
export const VIDEO_PORTADA = { mp4: '/tienda/video/10474567.mp4', poster: '/tienda/video/10474567.webp' };

export const ENVIO = { coste: 4.9, gratisDesde: 60 };

export function producto(slug: string) {
  return PRODUCTOS.find((p) => p.slug === slug);
}

export function porLinea(linea: Linea) {
  return PRODUCTOS.filter((p) => p.linea === linea);
}

/** URL de la foto recortada al tamaño pedido (el CDN de Unsplash la sirve en AVIF/WebP). */
export function urlFoto(f: Foto, ancho: number, proporcion = 1.25) {
  const alto = Math.round(ancho * proporcion);
  if (f.fuente === 'pexels') {
    return `https://images.pexels.com/photos/${f.id}/pexels-photo-${f.id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${ancho}&h=${alto}`;
  }
  const recorte = f.foco ? `&crop=focalpoint&fp-x=${f.foco[0]}&fp-y=${f.foco[1]}&fp-z=${f.foco[2]}` : '';
  return `https://images.unsplash.com/${f.id}?auto=format&fit=crop&q=70&w=${ancho}&h=${alto}${recorte}`;
}

export function srcSetFoto(f: Foto, anchos: number[], proporcion = 1.25) {
  return anchos.map((w) => `${urlFoto(f, w, proporcion)} ${w}w`).join(', ');
}

export function euros(n: number) {
  return n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  });
}

/** Unidades que se pueden pedir de una vez: lo que queda o lo que falta de la preventa, y nunca más de 9. */
export function maximo(p: Producto) {
  if (p.quedan !== undefined) return Math.min(9, p.quedan);
  if (p.entrega.tipo === 'preventa') return Math.min(9, p.entrega.total - p.entrega.reservadas);
  return 9;
}

/** Se puede meter en la cesta (lo que aún no se vende o es por encargo, no). */
export function sePuedeComprar(p: Producto) {
  if (p.entrega.tipo === 'proximamente' || p.entrega.tipo === 'encargo') return false;
  if (p.entrega.tipo === 'preventa' && p.entrega.reservadas >= p.entrega.total) return false;
  if (p.quedan !== undefined && p.quedan <= 0) return false;
  return true;
}

/** Aviso corto sobre la foto de la tarjeta («Quedan 2», «Preventa»…), o null. */
export function distintivo(p: Producto): string | null {
  if (p.entrega.tipo === 'preventa') return p.entrega.reservadas >= p.entrega.total ? 'Agotado' : 'Preventa';
  if (p.entrega.tipo === 'encargo') return 'Por encargo';
  if (p.entrega.tipo === 'proximamente') return 'Llega en abril';
  if (p.quedan !== undefined && p.quedan <= 0) return 'Agotado';
  if (p.quedan !== undefined && p.quedan <= 3) return `Quedan ${p.quedan}`;
  return null;
}
