// =====================================================
// ROSARIO DE HOY — los veinte misterios y el reparto por días
// =====================================================
// Fuente única de /rosario-de-hoy.
//
// CRITERIO (el mismo de las guías):
// - El reparto por días es el de la carta Rosarium Virginis Mariae (2002),
//   n.º 38: gozosos lunes y sábado, luminosos jueves, dolorosos martes y
//   viernes, gloriosos miércoles y domingo. No se cambia por tiempo litúrgico:
//   la costumbre de Adviento y Cuaresma se explica en las preguntas.
// - Cada misterio lleva la cita donde se lee y una frase que cuenta lo que
//   pasa, sin opiniones. Asunción y Coronación no se narran en la Escritura:
//   se dice así, sin forzar una cita.
// - Una persona (Bosco o Aida) lee estos textos antes de darlos por buenos.

export type GrupoId = 'gozosos' | 'luminosos' | 'dolorosos' | 'gloriosos';

export interface Misterio {
  titulo: string;
  /** Dónde se lee. Vacío si la Escritura no lo narra. */
  cita: string;
  texto: string;
}

export interface GrupoMisterios {
  id: GrupoId;
  /** «misterios gozosos», en minúscula para usar dentro de una frase. */
  nombre: string;
  /** Qué parte de la vida de Cristo recorre. */
  resumen: string;
  misterios: Misterio[];
}

export const GRUPOS: Record<GrupoId, GrupoMisterios> = {
  gozosos: {
    id: 'gozosos',
    nombre: 'misterios gozosos',
    resumen: 'La infancia de Jesús, de la Anunciación al Templo.',
    misterios: [
      {
        titulo: 'La Anunciación del ángel a María',
        cita: 'Lucas 1, 26-38',
        texto: 'El ángel Gabriel anuncia a María que será la madre del Hijo de Dios, y ella responde: «Hágase en mí según tu palabra».',
      },
      {
        titulo: 'La Visitación de María a su prima Isabel',
        cita: 'Lucas 1, 39-56',
        texto: 'María va deprisa a la montaña a visitar a Isabel, que la recibe llamándola bendita entre las mujeres.',
      },
      {
        titulo: 'El Nacimiento de Jesús en Belén',
        cita: 'Lucas 2, 1-20',
        texto: 'Jesús nace en Belén y es acostado en un pesebre, porque no había sitio para ellos en la posada.',
      },
      {
        titulo: 'La Presentación de Jesús en el Templo',
        cita: 'Lucas 2, 22-40',
        texto: 'María y José llevan al Niño al Templo, donde Simeón lo reconoce como luz para todos los pueblos.',
      },
      {
        titulo: 'El Niño Jesús perdido y hallado en el Templo',
        cita: 'Lucas 2, 41-52',
        texto: 'Tras tres días de búsqueda, María y José encuentran a Jesús en el Templo, entre los maestros.',
      },
    ],
  },
  luminosos: {
    id: 'luminosos',
    nombre: 'misterios luminosos',
    resumen: 'La vida pública de Jesús, del Jordán a la Última Cena.',
    misterios: [
      {
        titulo: 'El Bautismo de Jesús en el Jordán',
        cita: 'Mateo 3, 13-17',
        texto: 'Juan bautiza a Jesús en el Jordán y se oye la voz del Padre: «Este es mi Hijo amado».',
      },
      {
        titulo: 'Las bodas de Caná',
        cita: 'Juan 2, 1-11',
        texto: 'A petición de su madre, Jesús convierte el agua en vino: es el primero de sus signos.',
      },
      {
        titulo: 'El anuncio del Reino de Dios y la llamada a la conversión',
        cita: 'Marcos 1, 14-15',
        texto: 'Jesús recorre Galilea anunciando que el Reino de Dios está cerca y llamando a convertirse y a creer en el Evangelio.',
      },
      {
        titulo: 'La Transfiguración',
        cita: 'Lucas 9, 28-36',
        texto: 'En lo alto del monte, mientras ora, Jesús muestra su gloria ante Pedro, Santiago y Juan.',
      },
      {
        titulo: 'La institución de la Eucaristía',
        cita: 'Lucas 22, 14-20',
        texto: 'En la Última Cena, Jesús entrega a sus discípulos su Cuerpo y su Sangre bajo el pan y el vino.',
      },
    ],
  },
  dolorosos: {
    id: 'dolorosos',
    nombre: 'misterios dolorosos',
    resumen: 'La Pasión, del huerto de Getsemaní a la cruz.',
    misterios: [
      {
        titulo: 'La oración de Jesús en el huerto de Getsemaní',
        cita: 'Lucas 22, 39-46',
        texto: 'La noche antes de morir, Jesús ora en el huerto: «Que no se haga mi voluntad, sino la tuya».',
      },
      {
        titulo: 'La flagelación del Señor',
        cita: 'Juan 19, 1',
        texto: 'Pilato manda azotar a Jesús.',
      },
      {
        titulo: 'La coronación de espinas',
        cita: 'Mateo 27, 27-31',
        texto: 'Los soldados le ponen una corona de espinas y se burlan de él llamándolo rey.',
      },
      {
        titulo: 'Jesús con la cruz a cuestas camino del Calvario',
        cita: 'Juan 19, 16-17',
        texto: 'Jesús sale de la ciudad cargando con la cruz hacia el lugar llamado Calvario.',
      },
      {
        titulo: 'La crucifixión y muerte de Jesús',
        cita: 'Lucas 23, 33-46',
        texto: 'Clavado en la cruz, Jesús perdona a quienes lo crucifican y entrega su espíritu al Padre.',
      },
    ],
  },
  gloriosos: {
    id: 'gloriosos',
    nombre: 'misterios gloriosos',
    resumen: 'De la Resurrección a la gloria de María.',
    misterios: [
      {
        titulo: 'La Resurrección del Señor',
        cita: 'Mateo 28, 1-10',
        texto: 'Al amanecer del primer día de la semana, las mujeres encuentran el sepulcro vacío: Jesús ha resucitado.',
      },
      {
        titulo: 'La Ascensión de Jesús al cielo',
        cita: 'Hechos 1, 3-11',
        texto: 'Cuarenta días después de resucitar, Jesús sube al cielo a la vista de sus discípulos.',
      },
      {
        titulo: 'La venida del Espíritu Santo en Pentecostés',
        cita: 'Hechos 1, 14; 2, 1-13',
        texto: 'El Espíritu Santo desciende sobre los apóstoles, reunidos en oración con María.',
      },
      {
        titulo: 'La Asunción de María al cielo',
        cita: '',
        texto: 'Al terminar su vida en la tierra, María es llevada al cielo en cuerpo y alma. La Escritura no lo narra: es fe de la Iglesia, definida como dogma en 1950.',
      },
      {
        titulo: 'La coronación de María como Reina del cielo y de la tierra',
        cita: '',
        texto: 'María participa de la gloria de su Hijo como Reina y Madre. Tampoco se narra en la Escritura; la tradición lo contempla a la luz de Apocalipsis 12, 1.',
      },
    ],
  },
};

/** Reparto por día de la semana. Índice 0 = domingo, como `Date.getDay()`. */
export const SEMANA: { dia: string; grupo: GrupoId }[] = [
  { dia: 'Domingo', grupo: 'gloriosos' },
  { dia: 'Lunes', grupo: 'gozosos' },
  { dia: 'Martes', grupo: 'dolorosos' },
  { dia: 'Miércoles', grupo: 'gloriosos' },
  { dia: 'Jueves', grupo: 'luminosos' },
  { dia: 'Viernes', grupo: 'dolorosos' },
  { dia: 'Sábado', grupo: 'gozosos' },
];

/** Orden en que se muestra la semana: de lunes a domingo. */
export const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

export interface HoyRosario {
  /** 0 = domingo … 6 = sábado. */
  diaSemana: number;
  /** «viernes, 13 de noviembre». */
  etiqueta: string;
  /** AAAA-MM-DD, para el atributo datetime. */
  iso: string;
}

const DIAS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * El día que es «hoy» en una zona horaria. En el servidor se pide la de
 * Madrid; en el navegador se deja sin zona para usar la de quien lee.
 */
export function hoyRosario(now: Date = new Date(), timeZone?: string): HoyRosario {
  const corto = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone }).format(now);
  const diaSemana = Math.max(0, DIAS_EN.indexOf(corto));
  const etiqueta = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone,
  }).format(now);
  // en-CA da AAAA-MM-DD.
  const iso = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(now);
  return { diaSemana, etiqueta, iso };
}

export const ROSARIO_FAQS = [
  {
    question: '¿Qué misterios del Rosario se rezan cada día?',
    answer:
      'Lunes y sábado, los gozosos; martes y viernes, los dolorosos; miércoles y domingo, los gloriosos; y el jueves, los luminosos.',
  },
  {
    question: '¿Puedo rezar otros misterios distintos a los del día?',
    answer:
      'Sí. El reparto por días es una recomendación para recorrer toda la vida de Cristo a lo largo de la semana, no una obligación. Puedes rezar los que mejor acompañen el día que estás viviendo.',
  },
  {
    question: '¿Por qué los luminosos se rezan el jueves?',
    answer:
      'Los propuso san Juan Pablo II en 2002, en la carta Rosarium Virginis Mariae, y sugirió rezarlos el jueves. Para hacerles sitio, los gozosos pasaron del jueves al sábado, día tradicionalmente dedicado a María.',
  },
  {
    question: '¿Cambian los misterios en Adviento o en Cuaresma?',
    answer:
      'El reparto que propone la carta de 2002 es el mismo todo el año, con los gloriosos el domingo, y es el que sigue esta página. En algunos lugares se mantiene la costumbre de rezar los gozosos los domingos de Adviento y Navidad y los dolorosos los de Cuaresma. Las dos formas son buenas.',
  },
  {
    question: '¿Cuánto se tarda en rezar el Rosario de hoy?',
    answer:
      'Unos veinte minutos: cinco misterios, y en cada uno un Padrenuestro, diez Avemarías y un Gloria.',
  },
];
