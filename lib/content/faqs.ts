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
      'Es muy sencillo. Ve a la página de descarga y sigue las instrucciones según tu dispositivo. En iPhone/iPad, abre Safari y añade la app a tu pantalla de inicio. En Android, Chrome te ofrecerá instalarla directamente.',
  },
  {
    question: '¿Es compatible con mi dispositivo?',
    answer:
      'Refugio en la Palabra funciona en cualquier dispositivo moderno: iPhone, Android, tablet u ordenador. Solo necesitas un navegador actualizado como Safari, Chrome o Firefox.',
  },
  {
    question: '¿Por qué no está en la App Store o Google Play?',
    answer:
      'Refugio es una Progressive Web App (PWA). Esto significa que funciona como una app nativa pero se instala directamente desde el navegador. No necesitas pasar por las tiendas, se actualiza automáticamente y ocupa menos espacio en tu dispositivo.',
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
