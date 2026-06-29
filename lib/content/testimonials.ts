// Datos de la sección "Testimonios".
// Mapeados en TestimonialsSection. Las comillas tipográficas (“ ”) y los
// acentos se almacenan ya como caracteres Unicode; renderizan idénticos a
// las entidades HTML que había inline (&ldquo;, &aacute;, …).

export interface Testimonial {
  /** Cita; incluye las comillas tipográficas de apertura/cierre. */
  quote: string;
  /** Nombre mostrado. */
  name: string;
  /** Ciudad. */
  location: string;
  /** Inicial mostrada en el avatar. */
  initial: string;
  /** Delay de la animación de entrada (ms). */
  delay: number;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      '“El rosario guiado me ha ayudado a mantener una rutina de oración que antes no tenía. Es como tener un compañero espiritual siempre disponible.”',
    name: 'María G.',
    location: 'Madrid',
    initial: 'M',
    delay: 100,
  },
  {
    quote:
      '“Lo que más me gusta es el Evangelio comentado cada día. Me ayuda a empezar la mañana con una reflexión que se queda conmigo todo el día.”',
    name: 'Javier R.',
    location: 'Barcelona',
    initial: 'J',
    delay: 200,
  },
  {
    quote:
      '“El compañero de fe es increíble. Puedo preguntar cualquier duda y me responde con citas del Catecismo. Muy útil para entender mejor mi fe.”',
    name: 'Ana L.',
    location: 'Sevilla',
    initial: 'A',
    delay: 300,
  },
];
