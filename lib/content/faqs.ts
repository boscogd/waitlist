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
      'Es un asistente de inteligencia artificial formado con fuentes católicas: el Catecismo, las Escrituras, documentos del Magisterio y enseñanzas de santos. Puede responder dudas sobre la fe, orientarte en situaciones difíciles y acompañarte en tu camino. No reemplaza a un sacerdote ni a la dirección espiritual, pero está disponible 24/7 para cuando necesites orientación.',
  },
  {
    question: '¿Cuánto cuesta la aplicación?',
    answer:
      'Descargar y usar Refugio en la Palabra es gratis. Tienes acceso al Evangelio del día, Rosario, Lectio Divina y mucho más sin pagar nada. Algunas funciones avanzadas son de pago para ayudarnos a mantener el proyecto, pero siempre podrás rezar y crecer en tu fe sin coste.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer:
      'Absolutamente. Cumplimos con el RGPD y la normativa española de protección de datos. No vendemos ni compartimos tus datos con terceros. Tu vida espiritual es sagrada y merece la máxima privacidad.',
  },
];
