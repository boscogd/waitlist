// Datos de la sección "Diferenciadores" (¿Qué nos hace diferentes?).
// Mapeados en DifferentiatorsSection.

export interface Differentiator {
  title: string;
  description: string;
}

export const differentiators: Differentiator[] = [
  {
    title: '100% Católico',
    description: 'Contenido fiel al Magisterio de la Iglesia, no sincretismo ni meditaciones genéricas.',
  },
  {
    title: 'En español nativo',
    description: 'Pensado y creado originalmente en español, no traducciones de apps americanas.',
  },
  {
    title: 'IA formada en doctrina',
    description: 'El Compañero de fe está entrenado con el Catecismo, Escrituras y documentos del Magisterio.',
  },
  {
    title: 'Privacidad garantizada',
    description: 'Tu vida espiritual es sagrada. No vendemos datos ni usamos tracking invasivo.',
  },
  {
    title: 'Web app universal',
    description: 'Funciona en cualquier dispositivo sin descargas. Accede desde móvil, tablet o PC.',
  },
  {
    title: 'Comunidad cercana',
    description: 'Equipo pequeño que escucha feedback. Tu opinión moldea el producto.',
  },
];
