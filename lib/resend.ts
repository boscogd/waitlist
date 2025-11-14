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
 * Email de notificación cuando llega nuevo feedback
 */
export async function sendFeedbackNotification({
  feedbackId,
  rating,
  whatYouLike,
  whatYouDontLike,
  whatToImprove,
  additionalComments,
}: {
  feedbackId: string;
  rating?: number;
  whatYouLike?: string;
  whatYouDontLike?: string;
  whatToImprove?: string;
  additionalComments?: string;
}) {
  try {
    // Solo enviar si hay un email de administrador configurado
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.log('ADMIN_EMAIL no configurado, no se enviará notificación');
      return { success: false, error: 'Admin email not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Refugio en la Palabra <onboarding@resend.dev>',
      to: adminEmail,
      subject: `Nuevo Feedback MVP - ${rating ? `⭐ ${rating}/5` : 'Sin calificación'}`,
      html: getFeedbackNotificationTemplate({
        feedbackId,
        rating,
        whatYouLike,
        whatYouDontLike,
        whatToImprove,
        additionalComments,
      }),
    });

    if (error) {
      console.error('Error enviando email de feedback:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error en sendFeedbackNotification:', error);
    return { success: false, error };
  }
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

/**
 * Plantilla HTML para notificación de nuevo feedback
 */
function getFeedbackNotificationTemplate({
  feedbackId,
  rating,
  whatYouLike,
  whatYouDontLike,
  whatToImprove,
  additionalComments,
}: {
  feedbackId: string;
  rating?: number;
  whatYouLike?: string;
  whatYouDontLike?: string;
  whatToImprove?: string;
  additionalComments?: string;
}): string {
  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo Feedback del MVP</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FAF7F0;">
        <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: 'Lora', Georgia, serif; color: #1F3A5F; font-size: 28px; margin: 0;">
              Nuevo Feedback Recibido
            </h1>
            <p style="color: #6B7280; font-size: 14px; margin-top: 8px;">
              ID: ${feedbackId.substring(0, 8)}...
            </p>
          </div>

          <!-- Content -->
          <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

            ${rating ? `
              <!-- Rating Section -->
              <div style="background-color: #FAF7F0; border-left: 4px solid #E1B955; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #1F3A5F; font-size: 16px; margin: 0 0 8px 0; font-weight: 600;">
                  Calificación General
                </h3>
                <p style="font-size: 24px; margin: 0; letter-spacing: 4px;">
                  ${renderStars(rating)}
                </p>
                <p style="color: #6B7280; font-size: 14px; margin: 8px 0 0 0;">
                  ${rating} de 5 estrellas
                </p>
              </div>
            ` : ''}

            ${whatYouLike ? `
              <!-- What They Like -->
              <div style="margin-bottom: 24px;">
                <h3 style="color: #059669; font-size: 16px; margin: 0 0 8px 0; font-weight: 600;">
                  ✅ Lo que les gusta
                </h3>
                <div style="background-color: #ECFDF5; border-radius: 8px; padding: 16px;">
                  <p style="color: #1F2937; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                    ${whatYouLike}
                  </p>
                </div>
              </div>
            ` : ''}

            ${whatYouDontLike ? `
              <!-- What They Don't Like -->
              <div style="margin-bottom: 24px;">
                <h3 style="color: #DC2626; font-size: 16px; margin: 0 0 8px 0; font-weight: 600;">
                  ❌ Lo que no les gusta / encuentran confuso
                </h3>
                <div style="background-color: #FEF2F2; border-radius: 8px; padding: 16px;">
                  <p style="color: #1F2937; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                    ${whatYouDontLike}
                  </p>
                </div>
              </div>
            ` : ''}

            ${whatToImprove ? `
              <!-- Improvements -->
              <div style="margin-bottom: 24px;">
                <h3 style="color: #2563EB; font-size: 16px; margin: 0 0 8px 0; font-weight: 600;">
                  💡 Sugerencias de mejora
                </h3>
                <div style="background-color: #EFF6FF; border-radius: 8px; padding: 16px;">
                  <p style="color: #1F2937; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                    ${whatToImprove}
                  </p>
                </div>
              </div>
            ` : ''}

            ${additionalComments ? `
              <!-- Additional Comments -->
              <div style="margin-bottom: 24px;">
                <h3 style="color: #7C3AED; font-size: 16px; margin: 0 0 8px 0; font-weight: 600;">
                  💬 Comentarios adicionales
                </h3>
                <div style="background-color: #F5F3FF; border-radius: 8px; padding: 16px;">
                  <p style="color: #1F2937; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                    ${additionalComments}
                  </p>
                </div>
              </div>
            ` : ''}

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/feedback"
                 style="display: inline-block; background-color: #1F3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
                Ver todos los feedbacks
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 24px; color: #6B7280; font-size: 12px;">
            <p style="margin: 5px 0;">
              Fecha: ${new Date().toLocaleString('es-ES', {
                dateStyle: 'full',
                timeStyle: 'short'
              })}
            </p>
            <p style="margin: 5px 0;">
              Refugio en la Palabra - Panel de Administración
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
