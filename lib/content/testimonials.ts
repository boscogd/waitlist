// Datos de la sección de prueba social ("Por qué confían en Refugio").
// IMPORTANTE: nada de testimonios inventados ni personas ficticias.
// Solo sellos honestos y verificables sobre el proyecto. Las cifras vivas
// (personas que ya rezan, seguidores de Instagram) las aportan los
// componentes WaitlistCounter e InstagramBadge, no este archivo.

export interface TrustSeal {
  /** Icono ilustrado de marca en public/icons. */
  icon: string;
  /** Texto alternativo del icono. */
  iconAlt: string;
  /** Título del sello. */
  title: string;
  /** Descripción breve y honesta. */
  description: string;
  /** Delay de la animación de entrada (ms). */
  delay: number;
}

export const trustSeals: TrustSeal[] = [
  {
    icon: '/icons/cruz-icon.png',
    iconAlt: 'Cruz que representa la fidelidad católica de Refugio',
    title: '100% católico',
    description:
      'Contenido fiel al Magisterio de la Iglesia. Nada de sincretismo ni meditaciones genéricas.',
    delay: 100,
  },
  {
    icon: '/icons/comunidad-icon.png',
    iconAlt: 'Dos personas que representan a los fundadores de Refugio',
    title: 'Hecho en España por dos personas',
    description:
      'Aida y Bosco, una pareja que reza como tú. Sin grandes empresas detrás, solo dos manos y una fe.',
    delay: 200,
  },
  {
    icon: '/icons/confianza-icon.png',
    iconAlt: 'Escudo que representa la privacidad y la ausencia de anuncios',
    title: 'Sin anuncios ni tracking',
    description:
      'Tu vida espiritual es sagrada. No vendemos tus datos ni te interrumpimos con publicidad.',
    delay: 300,
  },
];
