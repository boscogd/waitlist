// Guías de oración (/guias). Fuente única: alimenta el índice, cada página,
// su JSON-LD y el sitemap.
//
// CRITERIO EDITORIAL (aplicar siempre al añadir una guía):
// - Responde a algo que la gente busca de verdad («cómo rezar el rosario»),
//   en el primer párrafo y sin rodeos.
// - Solo práctica común de la Iglesia. Nada de opiniones, polémicas ni
//   devociones discutidas. Si se cita un documento, que sea comprobable.
// - No prometer de la app nada que no haga.
// - Una persona (Bosco o Aida) lee cada guía antes de publicarla.

export interface GuiaSection {
  heading: string;
  paragraphs?: string[];
  /** Lista con viñetas o numerada (`ordered`). */
  list?: string[];
  ordered?: boolean;
  /** Dónde cuesta hacerlo solo y qué hace la app con eso. Solo lo que la app hace de verdad. */
  appTip?: string;
}

export interface GuiaFaq {
  question: string;
  answer: string;
}

export interface Guia {
  slug: string;
  /** Título de la página (h1). */
  title: string;
  /** Título corto para tarjetas y migas. */
  shortTitle: string;
  description: string;
  /** Fecha de publicación y de última revisión, AAAA-MM-DD. */
  published: string;
  updated: string;
  minutes: number;
  intro: string[];
  sections: GuiaSection[];
  faqs: GuiaFaq[];
  /** Pregunta corta bajo la respuesta inicial que lleva a la app. */
  appHook: string;
  /** Cómo ayuda la app en esto (una frase, sin exagerar). */
  appNote: string;
}

export const guias: Guia[] = [
  {
    slug: 'como-rezar-el-rosario',
    appHook:
      '¿Prefieres que te lo vayan rezando? En la app tienes el Rosario guiado con audio.',
    title: 'Cómo rezar el Rosario paso a paso',
    shortTitle: 'Cómo rezar el Rosario',
    description:
      'Guía sencilla para rezar el Santo Rosario desde cero: qué se reza en cada cuenta, en qué orden y cuánto se tarda. Con las oraciones y los misterios.',
    published: '2026-11-10',
    updated: '2026-11-10',
    minutes: 5,
    intro: [
      'El Rosario se reza en cinco partes llamadas misterios. En cada una se recuerda un momento de la vida de Jesús y de María mientras se reza un Padrenuestro, diez Avemarías y un Gloria. Entero lleva unos veinte minutos.',
      'No hace falta saberlo de memoria ni tener un rosario en la mano para empezar: se pueden contar las Avemarías con los dedos. Este es el orden.',
    ],
    sections: [
      {
        heading: 'El orden, paso a paso',
        ordered: true,
        list: [
          'Haz la señal de la cruz: «En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén».',
          'En muchos lugares se empieza con el Credo, un Padrenuestro, tres Avemarías y un Gloria. En España es frecuente empezar con el acto de contrición («Señor mío Jesucristo…»). Las dos formas son válidas.',
          'Anuncia el primer misterio del día (por ejemplo, «Primer misterio gozoso: la Anunciación») y detente un momento a pensar en él.',
          'Reza un Padrenuestro.',
          'Reza diez Avemarías, sin prisa, con el misterio en la cabeza.',
          'Reza un Gloria. Muchas personas añaden la oración de Fátima: «Oh, Jesús mío, perdona nuestros pecados…».',
          'Repite los pasos 3 a 6 con el segundo, tercer, cuarto y quinto misterio.',
          'Termina con la Salve. Quien quiere añade las letanías de la Virgen y una oración por las intenciones del Papa.',
        ],
      },
      {
        heading: 'Cómo se usa el rosario de cuentas',
        appTip:
          'Si no tienes un rosario a mano o te pierdes con las cuentas, el Rosario guiado de la app lleva la cuenta por ti.',
        paragraphs: [
          'El rosario es solo una ayuda para no perder la cuenta. Tiene un crucifijo, un tramo corto de cinco cuentas y un círculo con cinco grupos de diez cuentas (las decenas), separados por una cuenta suelta.',
          'Se empieza por el crucifijo. Cada cuenta suelta es un Padrenuestro y cada cuenta de una decena es un Avemaría. Al acabar las diez, se reza el Gloria y se pasa a la siguiente cuenta suelta.',
        ],
      },
      {
        heading: 'Qué misterios tocan hoy',
        paragraphs: [
          'Hay cuatro grupos de misterios y cada día de la semana tiene el suyo: gozosos el lunes y el sábado, dolorosos el martes y el viernes, gloriosos el miércoles y el domingo, y luminosos el jueves.',
          'Es una costumbre, no una obligación: si un día prefieres rezar otros, puedes hacerlo.',
        ],
      },
      {
        heading: 'Si te distraes o no tienes veinte minutos',
        appTip:
          'A mucha gente le ayuda a no distraerse rezar acompañada de una voz: es lo que hace el audio del Rosario guiado en la app.',
        paragraphs: [
          'Distraerse es lo normal. Cuando te des cuenta, vuelve al misterio sin enfadarte contigo y sigue donde ibas; no hay que empezar de nuevo.',
          'Si no tienes tiempo, reza un solo misterio. Diez Avemarías bien rezadas valen más que cincuenta a la carrera. También se puede repartir a lo largo del día.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Cuánto se tarda en rezar el Rosario?',
        answer:
          'Unos veinte minutos los cinco misterios del día. Un solo misterio lleva unos cuatro minutos.',
      },
      {
        question: '¿Hace falta tener un rosario para rezarlo?',
        answer:
          'No. Las cuentas solo sirven para no perder la cuenta. Puedes contar las diez Avemarías con los dedos.',
      },
      {
        question: '¿Se puede rezar el Rosario caminando o en el coche?',
        answer:
          'Sí. Mucha gente lo reza andando, en el transporte o haciendo tareas sencillas. Lo importante es la atención que le pongas, no la postura.',
      },
    ],
    appNote:
      'En la app, el Rosario guiado con audio va diciendo cada oración: eliges los misterios y solo tienes que seguirlo.',
  },
  {
    slug: 'misterios-del-rosario-por-dia',
    appHook:
      '¿Vas a rezarlo ahora? En la app tienes el Rosario guiado con audio, con los misterios que elijas.',
    title: 'Misterios del Rosario: cuáles se rezan cada día de la semana',
    shortTitle: 'Misterios del Rosario por día',
    description:
      'Qué misterios del Rosario tocan hoy: gozosos, dolorosos, gloriosos y luminosos, día por día, con los cinco misterios de cada grupo.',
    published: '2026-11-10',
    updated: '2026-11-10',
    minutes: 4,
    intro: [
      'Lunes y sábado se rezan los misterios gozosos; martes y viernes, los dolorosos; miércoles y domingo, los gloriosos; y el jueves, los luminosos.',
      'Los misterios son veinte momentos de la vida de Jesús y de María, repartidos en cuatro grupos de cinco. Cada día se reza un grupo.',
    ],
    sections: [
      {
        heading: 'Qué se reza cada día',
        appTip:
          'En la app eliges los misterios al empezar y el audio te acompaña en cada uno, sin tener que recordar el orden.',
        list: [
          'Lunes: misterios gozosos.',
          'Martes: misterios dolorosos.',
          'Miércoles: misterios gloriosos.',
          'Jueves: misterios luminosos.',
          'Viernes: misterios dolorosos.',
          'Sábado: misterios gozosos.',
          'Domingo: misterios gloriosos.',
        ],
      },
      {
        heading: 'Misterios gozosos (lunes y sábado)',
        ordered: true,
        list: [
          'La Anunciación del ángel a María.',
          'La Visitación de María a su prima Isabel.',
          'El Nacimiento de Jesús en Belén.',
          'La Presentación de Jesús en el Templo.',
          'El Niño Jesús perdido y hallado en el Templo.',
        ],
      },
      {
        heading: 'Misterios dolorosos (martes y viernes)',
        ordered: true,
        list: [
          'La oración de Jesús en el huerto de Getsemaní.',
          'La flagelación del Señor.',
          'La coronación de espinas.',
          'Jesús con la cruz a cuestas camino del Calvario.',
          'La crucifixión y muerte de Jesús.',
        ],
      },
      {
        heading: 'Misterios gloriosos (miércoles y domingo)',
        ordered: true,
        list: [
          'La Resurrección del Señor.',
          'La Ascensión de Jesús al cielo.',
          'La venida del Espíritu Santo en Pentecostés.',
          'La Asunción de María al cielo.',
          'La coronación de María como Reina del cielo y de la tierra.',
        ],
      },
      {
        heading: 'Misterios luminosos (jueves)',
        ordered: true,
        list: [
          'El Bautismo de Jesús en el Jordán.',
          'Las bodas de Caná.',
          'El anuncio del Reino de Dios y la llamada a la conversión.',
          'La Transfiguración.',
          'La institución de la Eucaristía.',
        ],
      },
      {
        heading: 'De dónde viene este reparto',
        paragraphs: [
          'Durante siglos el Rosario tuvo quince misterios. En 2002, san Juan Pablo II propuso añadir los cinco luminosos, sobre la vida pública de Jesús, en la carta Rosarium Virginis Mariae, y sugirió rezarlos el jueves.',
          'El reparto por días es una recomendación para que a lo largo de la semana se recorra toda la vida de Cristo. No es una norma: puedes rezar los que mejor acompañen el día que estás viviendo.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Qué misterios se rezan el domingo?',
        answer:
          'Los gloriosos. Es costumbre en algunos lugares rezar los gozosos los domingos de Adviento y Navidad y los dolorosos los de Cuaresma.',
      },
      {
        question: '¿Cuántos misterios tiene el Rosario?',
        answer:
          'Veinte, en cuatro grupos de cinco: gozosos, luminosos, dolorosos y gloriosos. Cada día se reza un grupo.',
      },
      {
        question: '¿Es obligatorio rezar los misterios que tocan ese día?',
        answer:
          'No. El reparto por días es una costumbre recomendada, no una obligación.',
      },
    ],
    appNote:
      'En la app eliges los misterios al empezar el Rosario guiado con audio, y te acompaña en cada uno.',
  },
  {
    slug: 'lectio-divina-que-es-y-como-hacerla',
    appHook:
      '¿Quieres el Evangelio de hoy ya preparado, con una reflexión? Está en la app.',
    title: 'Lectio Divina: qué es y cómo hacerla en cuatro pasos',
    shortTitle: 'Qué es la Lectio Divina',
    description:
      'La Lectio Divina es una forma de rezar con la Biblia en cuatro pasos: leer, meditar, orar y contemplar. Cómo hacerla sola o en grupo, en quince minutos.',
    published: '2026-11-10',
    updated: '2026-11-10',
    minutes: 5,
    intro: [
      'La Lectio Divina («lectura divina») es una manera de rezar con un pasaje de la Biblia: se lee despacio, se piensa qué dice, se le responde a Dios y se guarda silencio. Son cuatro pasos y caben en quince minutos.',
      'No es un estudio del texto ni hace falta saber teología. Es escuchar un pasaje como si fuera dirigido a ti hoy.',
    ],
    sections: [
      {
        heading: 'Antes de empezar',
        appTip:
          'En la app tienes cada día las lecturas de la misa, así que no hay que buscar el pasaje.',
        paragraphs: [
          'Elige un pasaje corto. Lo más sencillo es tomar el Evangelio del día, el que se lee en la misa de hoy. Busca un sitio tranquilo, deja el móvil en silencio y pide ayuda al Espíritu Santo con tus palabras.',
        ],
      },
      {
        heading: 'Los cuatro pasos',
        ordered: true,
        list: [
          'Lectura (lectio): ¿qué dice el texto? Léelo despacio, dos veces si hace falta. Fíjate en quién habla, qué pasa y qué palabra o frase te llama la atención.',
          'Meditación (meditatio): ¿qué me dice a mí? Quédate con esa palabra o esa frase y pregúntate qué tiene que ver con tu vida de ahora.',
          'Oración (oratio): ¿qué le digo yo a Dios? Respóndele con lo que te haya salido: una petición, un gracias, una duda o un perdón.',
          'Contemplación (contemplatio): calla un rato. No hay que pensar ni decir nada; basta con estar delante de Dios.',
        ],
      },
      {
        heading: 'Y después, la vida',
        paragraphs: [
          'Muchos añaden un quinto paso, la acción: llevarte del rato de oración algo concreto para el día, por pequeño que sea. Benedicto XVI lo recoge en la exhortación Verbum Domini (n.º 87) al explicar los pasos de la Lectio Divina.',
        ],
      },
      {
        heading: 'De dónde viene',
        paragraphs: [
          'Es una práctica muy antigua de los monjes. Los cuatro pasos tal como se conocen hoy los ordenó en el siglo XII un monje cartujo, Guigo II, que los comparó con los peldaños de una escalera.',
        ],
      },
      {
        heading: 'Errores frecuentes',
        appTip:
          'Si un pasaje te deja con dudas, puedes preguntarlas al Compañero de fe de la app, que responde a partir del Catecismo y la Escritura. Es una inteligencia artificial y puede equivocarse: no sustituye a un sacerdote.',
        list: [
          'Elegir un texto demasiado largo. Con unos pocos versículos basta.',
          'Convertirla en un estudio: buscar datos y comentarios en vez de escuchar.',
          'Agobiarse si «no se siente nada». La oración no se mide por lo que se siente.',
          'Saltarse el silencio final porque parece que no se hace nada.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Cuánto dura una Lectio Divina?',
        answer:
          'Con quince o veinte minutos es suficiente. Quien tiene más tiempo puede alargar la meditación y el silencio.',
      },
      {
        question: '¿Qué texto elijo para la Lectio Divina?',
        answer:
          'Lo más habitual es el Evangelio del día. También sirve cualquier pasaje corto de los Evangelios o un salmo.',
      },
      {
        question: '¿Se puede hacer la Lectio Divina en grupo?',
        answer:
          'Sí. Se lee el pasaje en voz alta, se deja silencio y quien quiere comparte brevemente la palabra o frase que le ha tocado, sin debatir.',
      },
    ],
    appNote:
      'En la app tienes cada día las lecturas de la misa con una reflexión: un buen punto de partida para tu Lectio Divina.',
  },
  {
    slug: 'evangelio-del-dia-como-leerlo',
    appHook:
      '¿Quieres leer el de hoy con una reflexión que lo explique? Está en la app.',
    title: 'Evangelio del día: qué es y cómo leerlo para que te sirva',
    shortTitle: 'Cómo leer el Evangelio del día',
    description:
      'Qué es el Evangelio del día, por qué cambia cada jornada y cómo leerlo en cinco minutos para sacarle algo: una forma sencilla de empezar a rezar con la Biblia.',
    published: '2026-11-10',
    updated: '2026-11-10',
    minutes: 4,
    intro: [
      'El Evangelio del día es el pasaje de los Evangelios que se lee en la misa de esa jornada en toda la Iglesia católica. Es el mismo en Sevilla, en Lima o en Manila, y leerlo por tu cuenta lleva unos cinco minutos.',
      'Es probablemente la forma más sencilla de empezar a leer la Biblia: alguien ha elegido ya el texto, es breve y cada día hay uno nuevo.',
    ],
    sections: [
      {
        heading: 'Por qué cambia cada día',
        paragraphs: [
          'La Iglesia reparte la lectura de la Biblia en un calendario llamado leccionario. Los domingos siguen un ciclo de tres años (A, B y C): en cada uno se lee sobre todo un evangelista, Mateo, Marcos o Lucas, y el Evangelio de Juan aparece en los tiempos fuertes como la Pascua.',
          'Entre semana el ciclo es distinto y los Evangelios se recorren cada año. Así, quien lee el Evangelio del día de forma constante acaba conociendo buena parte de los cuatro Evangelios.',
        ],
      },
      {
        heading: 'Cómo leerlo en cinco minutos',
        ordered: true,
        list: [
          'Para un momento antes de empezar. Un «Señor, ayúdame a escucharte» es suficiente.',
          'Lee el pasaje despacio, entero.',
          'Vuelve a la frase que más te haya llamado la atención y léela otra vez.',
          'Pregúntate qué tiene que ver con tu día: con una persona, una decisión o una preocupación concreta.',
          'Dile algo a Dios sobre eso, con tus palabras, y quédate con esa frase para recordarla a lo largo del día.',
        ],
      },
      {
        heading: 'Si no entiendes el pasaje',
        appTip:
          'En la app, cada Evangelio lleva una reflexión, y las dudas que te queden puedes preguntarlas al Compañero de fe. Es una inteligencia artificial y puede equivocarse: no sustituye a un sacerdote.',
        paragraphs: [
          'Pasa a menudo: hay textos difíciles, parábolas que desconciertan y costumbres de otra época. Ayuda leer un comentario breve, mirar el contexto (qué pasa justo antes y después) o preguntar a un sacerdote o a alguien con formación.',
          'No hace falta entenderlo todo para que el rato sirva. Basta con una frase que se te quede.',
        ],
      },
      {
        heading: 'Cuándo leerlo',
        appTip:
          'Tenerlo en el móvil ayuda a no saltárselo: en la app lo abres en el mismo sitio cada día.',
        paragraphs: [
          'El mejor momento es el que puedas mantener. A mucha gente le funciona por la mañana, antes de mirar el correo o las redes, porque así la frase del día le acompaña. Otros prefieren la noche. Lo que más ayuda es que sea siempre a la misma hora.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿El Evangelio del día es el mismo en todo el mundo?',
        answer:
          'Sí, en la Iglesia católica de rito romano es el mismo en todos los países, salvo cuando un lugar celebra una fiesta propia ese día.',
      },
      {
        question: '¿Qué diferencia hay entre el Evangelio del día y las lecturas de la misa?',
        answer:
          'En la misa se leen varias lecturas: una primera lectura, un salmo y el Evangelio (los domingos, además, una segunda lectura). El Evangelio del día es la última, tomada de Mateo, Marcos, Lucas o Juan.',
      },
      {
        question: '¿Cuánto tiempo hay que dedicarle?',
        answer:
          'Con cinco minutos es suficiente para leerlo y pensar en una frase. Si tienes más tiempo, puedes hacer con él una Lectio Divina.',
      },
    ],
    appNote:
      'En la app tienes cada día el Evangelio y las lecturas de la misa, con una reflexión que los conecta con tu vida cotidiana.',
  },
];

export function getGuia(slug: string): Guia | undefined {
  return guias.find((g) => g.slug === slug);
}
