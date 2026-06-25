// Datos de la sección "Características principales" (#caracteristicas).
// Mapeados en FeaturesSection. Un cambio aquí cambia la sección visible.

export interface Feature {
  /** Ruta del icono dentro de /public. */
  icon: string;
  /** Texto alternativo del icono. */
  iconAlt: string;
  title: string;
  description: string;
  /** Bullets con check dorado. */
  bullets: string[];
}

export const features: Feature[] = [
  {
    icon: '/icons/rosario-icon.png',
    iconAlt: 'Rosario guiado con audio para rezar paso a paso',
    title: 'Rosario guiado con audio',
    description:
      'Reza cada misterio con guía paso a paso, meditaciones profundas y música sacra que te ayuda a concentrarte. Personaliza la duración según tu tiempo disponible.',
    bullets: ['Todos los misterios', 'Audio en español', 'Meditaciones personalizadas'],
  },
  {
    icon: '/icons/gospel-icon.png',
    iconAlt: 'Evangelio del día comentado con reflexiones diarias',
    title: 'Evangelio del día comentado',
    description:
      'Recibe cada mañana las lecturas del día con reflexiones que conectan el Evangelio con tu vida cotidiana. Ideal para la Lectio Divina.',
    bullets: ['Lecturas sincronizadas con la liturgia', 'Reflexiones contextuales', 'Santo del día'],
  },
  {
    icon: '/icons/chat-icon.png',
    iconAlt: 'Compañero de fe que responde dudas sobre la fe católica 24/7',
    title: 'Compañero de fe',
    description:
      'Un asistente formado en doctrina católica que responde tus dudas sobre fe, moral y vida cristiana. Disponible 24/7 cuando necesites orientación.',
    bullets: ['Basado en el Catecismo', 'Respuestas con fuentes', 'Disponible siempre'],
  },
  {
    icon: '/icons/logros-icon.png',
    iconAlt: 'Sistema de logros y rachas que premia la constancia en la oración',
    title: 'Logros y constancia',
    description:
      'Mantén tu compromiso espiritual con un sistema de medallas y rachas que celebra tu constancia en la oración. Pequeños pasos, grandes frutos.',
    bullets: ['Rachas de oración', 'Medallas especiales', 'Estadísticas de progreso'],
  },
];
