// Datos de la sección "Diferenciadores" (¿Qué nos hace diferentes?).
// Mapeados en DifferentiatorsSection.

export interface Differentiator {
  title: string;
  description: string;
  /** Icono ilustrado de marca en public/icons. */
  icon: string;
  /** Texto alternativo del icono. */
  iconAlt: string;
}

export const differentiators: Differentiator[] = [
  {
    title: '100% Católico',
    description: 'Contenido fiel al Magisterio de la Iglesia, no sincretismo ni meditaciones genéricas.',
    icon: '/icons/cruz-icon.png',
    iconAlt: 'Cruz que representa la fidelidad católica',
  },
  {
    title: 'En español nativo',
    description: 'Pensado y creado originalmente en español, no traducciones de apps americanas.',
    icon: '/icons/gospel-icon.png',
    iconAlt: 'Libro abierto que representa el contenido en español',
  },
  {
    title: 'IA formada en doctrina',
    description: 'El Compañero de fe está entrenado con el Catecismo, Escrituras y documentos del Magisterio.',
    icon: '/icons/chat-icon.png',
    iconAlt: 'Burbuja de conversación que representa al Compañero de fe',
  },
  {
    title: 'Privacidad garantizada',
    description: 'Tu vida espiritual es sagrada. No vendemos datos ni usamos tracking invasivo.',
    icon: '/icons/confianza-icon.png',
    iconAlt: 'Escudo que representa la privacidad garantizada',
  },
  {
    title: 'Web app universal',
    description: 'Funciona en cualquier dispositivo sin descargas. Accede desde móvil, tablet o PC.',
    icon: '/icons/mundo-icon.png',
    iconAlt: 'Globo que representa el acceso desde cualquier dispositivo',
  },
  {
    title: 'Comunidad cercana',
    description: 'Equipo pequeño que escucha feedback. Tu opinión moldea el producto.',
    icon: '/icons/comunidad-icon.png',
    iconAlt: 'Personas que representan la comunidad cercana',
  },
];
