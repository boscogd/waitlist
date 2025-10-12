import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email de confirmación para la waitlist
 */
export async function sendWaitlistConfirmation({
  email,
  name,
  code,
}: {
  email: string;
  name: string;
  code: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Refugio en la Palabra <onboarding@resend.dev>',
      to: email,
      subject: '¡Bienvenido a Refugio en la Palabra!',
      html: getWaitlistEmailTemplate(name, code),
    });

    if (error) {
      console.error('Error enviando email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error en sendWaitlistConfirmation:', error);
    return { success: false, error };
  }
}

/**
 * Email de notificación de lanzamiento con código de acceso
 */
export async function sendLaunchNotification({
  email,
  name,
  code,
}: {
  email: string;
  name: string;
  code: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Refugio en la Palabra <onboarding@resend.dev>',
      to: email,
      subject: '¡Refugio en la Palabra ya está disponible!',
      html: getLaunchEmailTemplate(name, code),
    });

    if (error) {
      console.error('Error enviando email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error en sendLaunchNotification:', error);
    return { success: false, error };
  }
}

/**
 * Plantilla HTML para email de confirmación de waitlist
 */
function getWaitlistEmailTemplate(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a Refugio en la Palabra</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FAF7F0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-family: 'Lora', Georgia, serif; color: #1F3A5F; font-size: 32px; margin: 0;">
              Refugio en la Palabra
            </h1>
          </div>

          <!-- Content -->
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #1F3A5F; font-size: 24px; margin-top: 0;">
              ¡Hola, ${name}!
            </h2>

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
              Gracias por unirte a la lista de espera de <strong>Refugio en la Palabra</strong>.
            </p>

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
              Hemos guardado tu código de acceso anticipado. Cuando lancemos la aplicación,
              recibirás un email con tu código personalizado para acceder antes que nadie.
            </p>

            <!-- Code Box -->
            <div style="background-color: #FAF7F0; border: 2px dashed #E1B955; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="color: #1F2937; font-size: 14px; margin: 0 0 10px 0;">
                Tu código de acceso:
              </p>
              <p style="color: #1F3A5F; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px;">
                ${code}
              </p>
            </div>

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
              Mientras tanto, te mantendremos informado sobre el desarrollo del proyecto.
            </p>

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
              Con gratitud,<br>
              <strong>El equipo de Refugio en la Palabra</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; color: #6B7280; font-size: 12px;">
            <p style="margin: 5px 0;">
              © ${new Date().getFullYear()} Refugio en la Palabra. Todos los derechos reservados.
            </p>
            <p style="margin: 5px 0;">
              Si deseas darte de baja, responde a este email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Plantilla HTML para email de lanzamiento
 */
function getLaunchEmailTemplate(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Refugio en la Palabra ya está disponible!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FAF7F0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-family: 'Lora', Georgia, serif; color: #1F3A5F; font-size: 32px; margin: 0;">
              Refugio en la Palabra
            </h1>
          </div>

          <!-- Content -->
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #1F3A5F; font-size: 24px; margin-top: 0;">
              ¡Hola, ${name}! 🎉
            </h2>

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
              ¡El momento ha llegado! <strong>Refugio en la Palabra</strong> ya está disponible.
            </p>

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
              Como miembro de nuestra lista de espera, tienes acceso anticipado exclusivo.
              Usa tu código personal a continuación para comenzar tu viaje espiritual.
            </p>

            <!-- Code Box -->
            <div style="background-color: #FAF7F0; border: 2px solid #E1B955; border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center;">
              <p style="color: #1F2937; font-size: 14px; margin: 0 0 15px 0;">
                Tu código de bienvenida:
              </p>
              <p style="color: #1F3A5F; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">
                ${code}
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tuapp.com'}/bienvenida?code=${code}"
                 style="display: inline-block; background-color: #1F3A5F; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 500;">
                Acceder ahora
              </a>
            </div>

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
              Estamos emocionados de acompañarte en este camino de oración, comprensión y crecimiento.
            </p>

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
              Con gratitud y bendiciones,<br>
              <strong>El equipo de Refugio en la Palabra</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; color: #6B7280; font-size: 12px;">
            <p style="margin: 5px 0;">
              © ${new Date().getFullYear()} Refugio en la Palabra. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
