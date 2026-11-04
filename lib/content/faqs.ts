// Fuente única de las preguntas frecuentes (#faq).
// Alimenta TANTO la sección visible (FaqSection) COMO el JSON-LD de FAQPage
// que se inyecta en page.tsx. No dupliques este contenido en ningún otro sitio.

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: '¿Cómo descargo la aplicación?',
    answer:
      'En Android, búscala en Google Play como «Refugio en la Palabra» y descárgala como cualquier app. En iPhone o iPad, abre Safari, entra en la app y añádela a tu pantalla de inicio: en la página de descarga tienes un vídeo de 24 segundos. En el ordenador funciona directamente en el navegador.',
  },
  {
    question: '¿Es compatible con mi dispositivo?',
    answer:
      'Sí, si tienes un móvil, tablet u ordenador de los últimos años. En Android se descarga de Google Play; en iPhone, iPad y ordenador basta con un navegador actualizado como Safari, Chrome o Edge.',
  },
  {
    question: '¿Está en Google Play y en la App Store?',
    answer:
      'En Google Play, sí. En la App Store todavía no: en iPhone se instala desde Safari en medio minuto y funciona igual, con la misma cuenta y las mismas funciones, y se actualiza sola.',
  },
  {
    question: '¿Cómo funciona el Compañero de fe?',
    answer:
      'Es un asistente de inteligencia artificial al que le hemos dado como guía el Catecismo, la Sagrada Escritura y el Magisterio de la Iglesia. Responde dudas sobre la fe y te acompaña a cualquier hora. Como toda inteligencia artificial, puede equivocarse: no es un sacerdote, ni sustituye a la confesión ni a la dirección espiritual, y cuando el tema lo pide te anima a hablar con uno. Para generar las respuestas, tus mensajes se envían a un proveedor de inteligencia artificial (Google); nunca los usamos para publicidad.',
  },
  {
    question: '¿Cuánto cuesta la aplicación?',
    answer:
      'Descargarla y rezar con ella es gratis: el Rosario, el Evangelio del día, la Lectio Divina y mucho más, sin anuncios. Refugio Premium cuesta 4,99 € al mes o 49,99 € al año (precios en España) y amplía, entre otras cosas, el Compañero de fe sin el límite diario de mensajes. Con Premium nos ayudas a mantener el proyecto, y siempre podrás rezar sin pagar nada.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer:
      'Cumplimos el RGPD y la normativa española de protección de datos. No vendemos tus datos ni los usamos para publicidad. Solo los tratan los servicios que necesitamos para que la app funcione (alojamiento, correo y el proveedor de inteligencia artificial del Compañero de fe), y puedes pedirnos que los borremos cuando quieras. Tu vida espiritual es sagrada y la tratamos con ese cuidado.',
  },
];
