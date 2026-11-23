// =====================================================
// TIENDA · CATÁLOGO
// =====================================================
// La ropa con `pod` (camisetas y sudadera) se vende de verdad cuando
// NEXT_PUBLIC_TIENDA_PAGOS=1: la cobra Stripe y la fabrica Printful. El resto
// (belenes, devoción y polar) sigue siendo de muestra: productos, precios y
// existencias de ejemplo para enseñar la tienda.
// Los productos se enseñan con dibujos en el estilo de los monigotes de Refugio
// (hechos en Google Flow con Nano Banana sobre la referencia del pódcast). Las
// fotos de las piezas reales irán en la ficha cuando las haya.

export type Linea = 'belenes' | 'devocion' | 'ropa';

export const LINEAS: Record<Linea, { nombre: string; ancla: string }> = {
  belenes: { nombre: 'Belenes de ganchillo', ancla: 'reparto' },
  devocion: { nombre: 'Devoción', ancla: 'devocion' },
  ropa: { nombre: 'Ropa', ancla: 'ropa' },
};

/** Colores de la tienda: cada producto tiene el suyo y su foto se enseña sobre él. */
// fondo/tinta: bloques grandes de la página. panel/tintaPanel: el panel claro donde va el dibujo de cada
// producto (claro para que el trazo azul marino se lea encima).
export const TONOS = {
  celeste: { fondo: '#A9C9EC', tinta: '#1F3A5F', panel: '#B9D3EF', tintaPanel: '#1F3A5F' },
  albero: { fondo: '#F1BC45', tinta: '#3A2A10', panel: '#F4C85F', tintaPanel: '#3A2A10' },
  rosa: { fondo: '#F5C3CD', tinta: '#5A1F2E', panel: '#F7CDD5', tintaPanel: '#5A1F2E' },
  verde: { fondo: '#2E7A56', tinta: '#FFFFFF', panel: '#C4E0CC', tintaPanel: '#1E4D37' },
  azul: { fondo: '#1F3A5F', tinta: '#FFFFFF', panel: '#CBD8EB', tintaPanel: '#1F3A5F' },
  morado: { fondo: '#4B2F6F', tinta: '#FFFFFF', panel: '#DACFEC', tintaPanel: '#3E2660' },
} as const;
export type Tono = keyof typeof TONOS;

/** Imagen de un producto: dibujo propio (public/tienda/dibujos/<id>.webp) o foto de Unsplash/Pexels. */
export interface Foto {
  id: string;
  alt: string;
  fuente?: 'dibujo' | 'unsplash' | 'pexels';
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
  /** Ropa bajo demanda que se vende de verdad (Stripe + Printful). Lo que no lo tiene es de muestra. */
  pod?: Pod;
}

/** Impresión bajo demanda: qué variante del catálogo de Printful se pide en cada talla y qué archivo se imprime. */
export interface Pod {
  proveedor: 'printful';
  /** Ruta pública del PNG que se imprime en el frente (Printful lo descarga de la web publicada). */
  archivo: string;
  /** variant_id del catálogo de Printful por talla. */
  variantes: Record<string, number>;
  /** Lo que se suma al precio en la talla 2XL (a Printful le cuesta más). */
  extra2XL: number;
}

const NO_JUGUETE = 'Objeto decorativo, no es un juguete. No apto para menores de 14 años.';
const CUIDADO_GANCHILLO = 'Quitar el polvo con un pincel; no lavar a máquina';
const MADRE = 'Tejido a mano por mi madre, en Sevilla';

// ─── Ropa bajo demanda (Printful) ───
const PLAZO_POD = 'Se fabrica al pedirla, casi siempre en Barcelona. Llega en 5 a 10 días laborables.';
const CUIDADO_POD = 'Lavar del revés a 30 °C; sin secadora y sin planchar sobre el estampado';
const TALLAS_POD = ['S', 'M', 'L', 'XL', '2XL'];
/** Catálogo de Printful, producto 456 (Stanley/Stella STTU169), color White. */
const VARIANTES_CAMISETA_BLANCA = { S: 11864, M: 11865, L: 11866, XL: 11867, '2XL': 11868 };
const DETALLES_CAMISETA = [
  { etiqueta: 'Composición', valor: '100 % algodón orgánico peinado, 180 g/m²' },
  { etiqueta: 'Estampado', valor: 'Impreso en el pecho' },
  { etiqueta: 'Tallas', valor: 'S, M, L, XL y 2XL. Corte unisex, ajuste medio' },
  { etiqueta: 'Plazo', valor: PLAZO_POD },
  { etiqueta: 'Cuidado', valor: CUIDADO_POD },
  { etiqueta: 'Fabricante', valor: 'Prenda de Stanley/Stella; la imprime y la envía Printful' },
];

export const PRODUCTOS: Producto[] = [
  // ─── Belenes de ganchillo ───
  {
    slug: 'misterio-ganchillo',
    nombre: 'Misterio de ganchillo',
    linea: 'belenes',
    tono: 'celeste',
    precio: 55,
    fotos: [{ id: 'misterio', fuente: 'dibujo', alt: 'Dibujo de la Virgen arrodillada, san José con su cayado y el Niño en el pesebre' }],
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
    fotos: [{ id: 'reyes', fuente: 'dibujo', alt: 'Dibujo de los tres Reyes Magos con sus coronas y sus regalos' }],
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
    fotos: [{ id: 'pastor', fuente: 'dibujo', alt: 'Dibujo de un pastorcillo con su cayado y cuatro ovejas' }],
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
    fotos: [{ id: 'angel', fuente: 'dibujo', alt: 'Dibujo de un ángel niño que sostiene una estrella' }],
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
    fotos: [{ id: 'belen', fuente: 'dibujo', alt: 'Dibujo del portal con la Sagrada Familia, el buey, la mula y la estrella' }],
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
    fotos: [{ id: 'escapulario', fuente: 'dibujo', alt: 'Dibujo de un escapulario con sus dos piezas y los cordones' }],
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
    fotos: [{ id: 'rosario-madera', fuente: 'dibujo', alt: 'Dibujo de un rosario de cuentas de madera con su cruz' }],
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
    fotos: [{ id: 'rosario-rojo', fuente: 'dibujo', alt: 'Dibujo de un rosario en forma de corazón' }],
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
    fotos: [{ id: 'medalla', fuente: 'dibujo', alt: 'Dibujo de la medalla de la Milagrosa con su cadena' }],
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
    fotos: [{ id: 'crucifijo', fuente: 'dibujo', alt: 'Dibujo de un crucifijo de madera colgado en la pared' }],
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
    fotos: [{ id: 'altar', fuente: 'dibujo', alt: 'Dibujo de un altar de mayo con la imagen de la Virgen, una vela y flores' }],
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
    fotos: [
      { id: 'polar', fuente: 'dibujo', alt: 'Dibujo del polar de media cremallera con el logo de Refugio bordado en el pecho' },
      { id: 'diseno-polar', fuente: 'dibujo', alt: 'El logo de Refugio que va bordado: la cruz azul, un aro ocre y una paloma' },
    ],
    resumen: 'Media cremallera, color crudo, con el logo de Refugio bordado. Edición de 50.',
    descripcion: [
      'El polar de media cremallera de toda la vida, en color crudo, con el logo de Refugio bordado en el pecho: la cruz en azul marino y el aro con la paloma en ocre.',
      'Va en preventa: pagas ahora, el taller de Sevilla hace exactamente los que se pidan y te llega antes de Reyes. Cuando se cierra la preventa, no se vuelve a hacer igual.',
    ],
    detalles: [
      { etiqueta: 'Composición', valor: '100 % poliéster reciclado, 300 g/m²' },
      { etiqueta: 'Bordado', valor: 'Logo de Refugio, unos 8 cm, en dos hilos. Taller de Sevilla' },
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
    fotos: [
      { id: 'sudadera', fuente: 'dibujo', alt: 'Dibujo de la sudadera azul marino con «Refugio en la Palabra» pequeño en el pecho' },
      { id: 'diseno-refugio', fuente: 'dibujo', alt: 'El texto «Refugio en la Palabra» que va impreso en el pecho' },
    ],
    resumen: 'Azul marino, cuello redondo, algodón orgánico.',
    descripcion: [
      'Sudadera de cuello redondo en azul marino, con «Refugio en la Palabra» impreso pequeño en el pecho. Por fuera es todo algodón orgánico; por dentro, felpa suave.',
      'Se fabrica cuando la pides: así no sobra ropa en ningún almacén y siempre están todas las tallas.',
    ],
    detalles: [
      { etiqueta: 'Prenda', valor: "SOL'S Comet (03574), color French Navy" },
      { etiqueta: 'Composición', valor: '80 % algodón orgánico y 20 % poliéster reciclado; la cara exterior es 100 % algodón' },
      { etiqueta: 'Estampado', valor: 'Impreso (no bordado), pequeño en el pecho' },
      { etiqueta: 'Tallas', valor: 'S, M, L, XL y 2XL. Corte unisex, de talla europea. La 2XL puede salir del taller de Printful en Letonia y tardar algún día más' },
      { etiqueta: 'Plazo', valor: PLAZO_POD },
      { etiqueta: 'Cuidado', valor: CUIDADO_POD },
      { etiqueta: 'Fabricante', valor: "Prenda de SOL'S; la imprime y la envía Printful" },
    ],
    entrega: { tipo: 'bajo-demanda', texto: PLAZO_POD },
    tallas: TALLAS_POD,
    pod: {
      proveedor: 'printful',
      archivo: '/tienda/impresion/sudadera-refugio.png',
      // Catálogo de Printful, producto 506 (SOL'S 03574), color French Navy. La 2XL (12713) no está en
      // stock en Barcelona (EU_ES) a 23-11-2026, sí en Letonia (EU_LV).
      variantes: { S: 12709, M: 12710, L: 12711, XL: 12712, '2XL': 12713 },
      extra2XL: 2,
    },
  },
  {
    slug: 'camiseta-fiat',
    nombre: 'Camiseta «Fiat»',
    linea: 'ropa',
    tono: 'albero',
    precio: 25,
    fotos: [
      { id: 'camiseta', fuente: 'dibujo', alt: 'Dibujo de la camiseta blanca con la palabra Fiat' },
      { id: 'diseno-fiat', fuente: 'dibujo', alt: 'La palabra «Fiat» que va impresa en el pecho' },
    ],
    resumen: 'El «hágase» de María, pequeño en el pecho. Algodón orgánico.',
    descripcion: [
      '«Fiat» es lo que respondió María al ángel. Una palabra, impresa pequeña en el pecho de una camiseta blanca de algodón orgánico.',
      'Se fabrica cuando la pides.',
    ],
    detalles: [{ etiqueta: 'Prenda', valor: 'Stanley/Stella Creator 2.0 (STTU169), blanca' }, ...DETALLES_CAMISETA],
    entrega: { tipo: 'bajo-demanda', texto: PLAZO_POD },
    tallas: TALLAS_POD,
    pod: {
      proveedor: 'printful',
      archivo: '/tienda/impresion/camiseta-fiat.png',
      variantes: VARIANTES_CAMISETA_BLANCA,
      extra2XL: 2,
    },
  },
  {
    slug: 'camiseta-belen',
    nombre: 'Camiseta del Belén',
    linea: 'ropa',
    tono: 'celeste',
    precio: 25,
    fotos: [
      { id: 'camiseta-belen', fuente: 'dibujo', alt: 'Dibujo de la camiseta blanca con el portal de Belén impreso en el pecho' },
      { id: 'diseno-belen', fuente: 'dibujo', alt: 'El portal de Belén con los monigotes de Refugio en azul marino y ocre, tal como va impreso' },
    ],
    resumen: 'El portal de Belén con los monigotes de Refugio. Algodón orgánico.',
    descripcion: [
      'El portal de Belén dibujado con los monigotes de Refugio, en azul marino y ocre, impreso en el pecho de una camiseta blanca de algodón orgánico.',
      'Se fabrica cuando la pides.',
    ],
    detalles: [{ etiqueta: 'Prenda', valor: 'Stanley/Stella Creator 2.0 (STTU169), blanca' }, ...DETALLES_CAMISETA],
    entrega: { tipo: 'bajo-demanda', texto: PLAZO_POD },
    tallas: TALLAS_POD,
    pod: {
      proveedor: 'printful',
      archivo: '/tienda/impresion/camiseta-belen.png',
      variantes: VARIANTES_CAMISETA_BLANCA,
      extra2XL: 2,
    },
  },
];

/** Fotos de ambiente que no son de un producto. */
export const AMBIENTE: Record<'madre' | 'belen', Foto> = {
  madre: { id: 'madre', fuente: 'dibujo', alt: 'Dibujo de una señora mayor sentada que teje con ganchillo, con tres figuras del belén en la mesita' },
  belen: { id: 'belen', fuente: 'dibujo', alt: 'Dibujo del portal de Belén con la Sagrada Familia' },
};

// Solo península y Baleares; gratis desde 75 €.
export const ENVIO = { coste: 4.9, gratisDesde: 75 };

/** Precio de una unidad en esa talla (la 2XL de la ropa bajo demanda cuesta algo más). */
export function precioDe(p: Producto, talla?: string) {
  return talla === '2XL' && p.pod ? p.precio + p.pod.extra2XL : p.precio;
}

export function producto(slug: string) {
  return PRODUCTOS.find((p) => p.slug === slug);
}

export function porLinea(linea: Linea) {
  return PRODUCTOS.filter((p) => p.linea === linea);
}

/** URL de la foto recortada al tamaño pedido (el CDN de Unsplash la sirve en AVIF/WebP). */
export function urlFoto(f: Foto, ancho: number, proporcion = 1.25) {
  if (f.fuente === 'dibujo') return `/tienda/dibujos/${f.id}.webp`;
  const alto = Math.round(ancho * proporcion);
  if (f.fuente === 'pexels') {
    return `https://images.pexels.com/photos/${f.id}/pexels-photo-${f.id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${ancho}&h=${alto}`;
  }
  const recorte = f.foco ? `&crop=focalpoint&fp-x=${f.foco[0]}&fp-y=${f.foco[1]}&fp-z=${f.foco[2]}` : '';
  return `https://images.unsplash.com/${f.id}?auto=format&fit=crop&q=70&w=${ancho}&h=${alto}${recorte}`;
}

export function srcSetFoto(f: Foto, anchos: number[], proporcion = 1.25) {
  if (f.fuente === 'dibujo') return undefined;
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
