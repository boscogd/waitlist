// Datos de la sección "¿Qué nos hace diferentes?" (bento). Sustituye a los
// antiguos Diferenciadores + sellos de confianza, que repetían contenido.
// El ORDEN importa: WhySection coloca cada tarjeta en una celda concreta.
// IMPORTANTE: nada de testimonios inventados ni personas ficticias.

export interface WhyItem {
  key: string;
  title: string;
  description: string;
  /** Icono ilustrado de marca en public/icons. */
  icon: string;
  iconAlt: string;
  /** Etiquetas cortas (solo en la tarjeta grande). */
  tags?: string[];
  /** Enlace opcional con texto de acción. */
  href?: string;
  cta?: string;
}

export const whyItems: WhyItem[] = [
  {
    key: 'catolico',
    title: '100% católico',
    description:
      'Contenido fiel al Magisterio de la Iglesia. Nada de sincretismo, ni de "mindfulness" con vocabulario cristiano, ni de meditaciones genéricas.',
    icon: '/icons/cruz-icon.png',
    iconAlt: 'Cruz que representa la fidelidad católica',
    tags: ['Catecismo', 'Sagrada Escritura', 'Magisterio', 'Liturgia'],
  },
  {
    key: 'privacidad',
    title: 'Sin anuncios ni tracking',
    description:
      'Tu vida espiritual es sagrada. No vendemos tus datos ni te interrumpimos con publicidad.',
    icon: '/icons/confianza-icon.png',
    iconAlt: 'Manos en oración que representan la privacidad',
  },
  {
    key: 'espanol',
    title: 'En español nativo',
    description:
      'Pensada y escrita en español desde el primer día, no traducida de una app americana.',
    icon: '/icons/biblia-icon.png',
    iconAlt: 'Libro que representa el contenido en español',
  },
  {
    key: 'ia',
    title: 'IA formada en doctrina',
    description:
      'El Compañero de fe se apoya en el Catecismo, la Escritura y los documentos del Magisterio. Y sabe cuándo remitirte a un sacerdote.',
    icon: '/icons/chat-icon.png',
    iconAlt: 'Burbuja de conversación que representa al Compañero de fe',
  },
  {
    key: 'universal',
    title: 'Funciona en iPhone, Android y PC',
    description:
      'Se instala desde el navegador en 30 segundos. Sin tiendas, sin descargas pesadas y siempre actualizada.',
    icon: '/icons/mundo-icon.png',
    iconAlt: 'Paloma que representa la app disponible en cualquier dispositivo',
  },
  {
    key: 'cercania',
    title: 'Tu opinión moldea la app',
    description:
      'Somos dos personas que leen cada mensaje. Lo que nos cuentas acaba en la siguiente versión.',
    icon: '/icons/intercambio-icon.png',
    iconAlt: 'Flechas de intercambio que representan el feedback',
    href: '/feedback',
    cta: 'Enviar feedback',
  },
];
