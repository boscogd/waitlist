// =====================================================
// Estructuras de inicio para el centro de correos
// =====================================================
// HTML de marca listo para usar (cabecera con logo, fondo crema, tipografía
// serif, firma). El editor arranca con una de estas y el redactor solo
// sustituye los textos de ejemplo. El pie legal + baja se añade solo al
// enviar (decorateEmailHtml), así que aquí NO va el pie.

const HEADER = `    <div style="text-align:center;margin-bottom:45px;padding-bottom:28px;border-bottom:1px solid #E5E0D5;">
      <img src="https://www.refugioenlapalabra.com/logo-refugio.png" alt="Refugio en la Palabra" width="60" height="60" style="display:block;margin:0 auto 14px;border-radius:14px;">
      <span style="font-size:14px;letter-spacing:3px;color:#8B7355;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Refugio en la Palabra</span>
    </div>`;

/** Envuelve el contenido en el "shell" de marca (cabecera + contenedor). */
function doc(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background-color:#FAF7F0;">
  <div style="max-width:580px;margin:0 auto;padding:40px 20px;">
${HEADER}
    <div style="color:#2D2A26;font-size:17px;line-height:1.9;">
${content}
    </div>
  </div>
</body>
</html>`;
}

export interface EmailStarter {
  id: string;
  label: string;
  description: string;
  suggestedSubject: string;
  html: string;
}

export const EMAIL_STARTERS: EmailStarter[] = [
  {
    id: 'carta',
    label: 'Carta sencilla',
    description: 'Saludo, mensaje y firma. Lo más versátil.',
    suggestedSubject: '',
    html: doc(`      <p style="margin-bottom:25px;">{{name}},</p>
      <p style="margin-bottom:25px;">Escribe aquí tu mensaje. Cuéntalo cercano, como si le escribieras a un amigo en la fe.</p>
      <p style="margin-bottom:25px;">Puedes añadir tantos párrafos como quieras, dejando espacio entre ellos para que respire.</p>
      <p style="margin-bottom:0;margin-top:40px;">Con cariño,<br><span style="color:#8B7355;">— El equipo de Refugio</span></p>`),
  },
  {
    id: 'cita',
    label: 'Con cita destacada',
    description: 'Incluye un recuadro con una cita bíblica o de un santo.',
    suggestedSubject: '',
    html: doc(`      <p style="margin-bottom:25px;">{{name}},</p>
      <p style="margin-bottom:25px;">Escribe aquí una breve introducción antes de la cita.</p>
      <div style="background-color:#ffffff;border-radius:8px;padding:30px;margin:35px 0;box-shadow:0 2px 15px rgba(0,0,0,0.04);border-left:3px solid #E1B955;">
        <p style="margin:0;font-style:italic;color:#5D574F;font-size:18px;">"Escribe aquí la cita bíblica o del santo."</p>
        <p style="margin:12px 0 0 0;font-size:14px;color:#A09A92;">— Referencia</p>
      </div>
      <p style="margin-bottom:25px;">Y aquí tu reflexión sobre lo que esa cita nos dice hoy.</p>
      <p style="margin-bottom:0;margin-top:40px;">Un abrazo,<br><span style="color:#8B7355;">— El equipo de Refugio</span></p>`),
  },
  {
    id: 'anuncio',
    label: 'Anuncio / novedad',
    description: 'Un bloque destacado con botón para una novedad.',
    suggestedSubject: '',
    html: doc(`      <p style="margin-bottom:25px;">{{name}},</p>
      <p style="margin-bottom:25px;">Escribe aquí la novedad que quieres compartir con la comunidad.</p>
      <div style="background-color:#1F3A5F;border-radius:12px;padding:30px;margin:35px 0;text-align:center;">
        <p style="margin:0 0 20px 0;color:#ffffff;font-size:17px;">Un texto destacado o una llamada a la acción.</p>
        <a href="https://refugio-en-la-palabra.netlify.app" style="display:inline-block;background-color:#E1B955;color:#1F3A5F;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;">Abrir Refugio</a>
      </div>
      <p style="margin-bottom:0;margin-top:40px;">Con cariño,<br><span style="color:#8B7355;">— El equipo de Refugio</span></p>`),
  },
  {
    id: 'evangelio',
    label: 'Reflexión del Evangelio',
    description: 'Pasaje del Evangelio + reflexión + pregunta para orar.',
    suggestedSubject: '',
    html: doc(`      <p style="margin-bottom:25px;">{{name}},</p>
      <p style="margin-bottom:30px;">Hoy quiero compartir contigo el Evangelio de este día.</p>
      <div style="background-color:#ffffff;border-radius:8px;padding:35px;margin:35px 0;box-shadow:0 2px 15px rgba(0,0,0,0.04);">
        <p style="margin:0 0 20px 0;font-size:13px;color:#8B7355;text-transform:uppercase;letter-spacing:2px;font-family:Arial,Helvetica,sans-serif;">Evangelio · Referencia</p>
        <p style="margin:0;font-style:italic;color:#2D2A26;font-size:18px;line-height:1.7;">"Escribe aquí el pasaje del Evangelio."</p>
      </div>
      <p style="margin-bottom:25px;">Escribe aquí una reflexión personal y cercana, no una homilía.</p>
      <p style="margin-bottom:25px;"><strong>Para pensar hoy:</strong> una pregunta que invite a la oración.</p>
      <p style="margin-bottom:0;margin-top:40px;">Que tengas un día en paz,<br><span style="color:#8B7355;">— El equipo de Refugio</span></p>`),
  },
];
