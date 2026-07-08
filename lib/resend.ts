import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

// =====================================================
// Utilidades comunes de email (profesionalización)
// =====================================================
// Buzón al que llegan las respuestas (la copia promete "responde y te
// lee una persona"). Configurable; por defecto el contacto público.
const REPLY_TO = process.env.RESEND_REPLY_TO || 'info@refugioenlapalabra.com';
// Identificación del remitente para el pie (LSSI/RGPD). Pon tu dirección
// postal/fiscal en EMAIL_SENDER_ADDRESS para cumplimiento pleno.
const SENDER_IDENTITY = process.env.EMAIL_SENDER_IDENTITY || 'Refugio en la Palabra';
const SENDER_ADDRESS = process.env.EMAIL_SENDER_ADDRESS || '';

/** Pie legal con identificación del remitente, contacto y baja. */
function legalFooterHtml(unsubscribeUrl: string): string {
  const addr = SENDER_ADDRESS ? ` · ${SENDER_ADDRESS}` : '';
  const unsub = unsubscribeUrl
    ? ` Puedes <a href="${unsubscribeUrl}" style="color:#A09A92;">darte de baja</a> cuando quieras.`
    : '';
  return `<div style="max-width:580px;margin:0 auto;padding:8px 20px 32px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#A09A92;text-align:center;line-height:1.7;">
  ${SENDER_IDENTITY}${addr} · <a href="mailto:${REPLY_TO}" style="color:#A09A92;">${REPLY_TO}</a><br>
  Recibes este correo porque te registraste en Refugio en la Palabra.${unsub}
</div>`;
}

/** Inserta el pie legal antes de </body> (o al final si no existe). */
function withLegalFooter(html: string, unsubscribeUrl: string): string {
  const footer = legalFooterHtml(unsubscribeUrl);
  return html.includes('</body>')
    ? html.replace('</body>', `${footer}\n</body>`)
    : html + footer;
}

/** Inserta un preheader oculto (texto de preview del inbox) tras <body>. */
function withPreheader(html: string, preview: string): string {
  if (!preview) return html;
  const ph = `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${preview}</div>`;
  return /<body[^>]*>/i.test(html)
    ? html.replace(/(<body[^>]*>)/i, `$1\n${ph}`)
    : ph + html;
}

/**
 * Decora un HTML de email exactamente igual que en el envío real
 * (preheader + pie legal). Útil para vistas previa que muestran el
 * email tal cual lo recibe el usuario, sin enviar nada.
 */
export function decorateEmailHtml(
  html: string,
  previewText: string,
  unsubscribeUrl: string
): string {
  return withPreheader(withLegalFooter(html, unsubscribeUrl), previewText);
}

/** Versión texto plano básica a partir del HTML, para enviar multipart. */
function htmlToText(html: string): string {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&ldquo;|&rdquo;|&laquo;|&raquo;/g, '"')
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&[a-z]+;/gi, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Enviar email genérico desde un borrador
 */
export async function sendDraftEmail({
  to,
  subject,
  htmlContent,
  previewText,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  previewText?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Refugio en la Palabra <onboarding@resend.dev>',
      to,
      subject,
      html: htmlContent,
      text: previewText || undefined,
    });

    if (error) {
      console.error('Error enviando email:', error);
      const errorMessage = error.message || JSON.stringify(error);
      return { success: false, error: errorMessage, resendId: null };
    }

    return { success: true, data, resendId: data?.id || null };
  } catch (error) {
    console.error('Error en sendDraftEmail:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return { success: false, error: errorMessage, resendId: null };
  }
}

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
            <img src="https://www.refugioenlapalabra.com/logo-512-1.png" alt="Refugio en la Palabra" width="64" height="64" style="display: block; margin: 0 auto 16px; border-radius: 14px;">
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
              Gracias por unirte a <strong>Refugio en la Palabra</strong>.
            </p>

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
              La app ya está disponible. Aquí tienes tu código para disfrutar de
              un mes de Premium gratis: úsalo al descargarla.
            </p>

            <!-- Code Box -->
            <div style="background-color: #FAF7F0; border: 2px dashed #E1B955; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="color: #1F2937; font-size: 14px; margin: 0 0 10px 0;">
                Tu código de mes gratis:
              </p>
              <p style="color: #1F3A5F; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px;">
                ${code}
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://refugio-en-la-palabra.netlify.app'}/bienvenida?code=${code}"
                 style="display: inline-block; background-color: #1F3A5F; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 500;">
                Descargar y empezar gratis
              </a>
            </div>

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
 * Email de win-back para usuarios dormidos de la app.
 * Reemplaza {{name}}, {{app_url}} y {{unsubscribe_url}} en
 * subject y html antes de enviar.
 */
export async function sendWinbackEmail({
  to,
  name,
  subject,
  htmlContent,
  previewText,
  appUrl,
  unsubscribeUrl,
}: {
  to: string;
  name: string;
  subject: string;
  htmlContent: string;
  previewText?: string;
  appUrl: string;
  unsubscribeUrl: string;
}) {
  const replacements: Record<string, string> = {
    '{{name}}': name,
    '{{app_url}}': appUrl,
    '{{unsubscribe_url}}': unsubscribeUrl,
  };

  const apply = (s: string) =>
    Object.entries(replacements).reduce(
      (acc, [token, value]) => acc.split(token).join(value),
      s
    );

  const finalHtml = withPreheader(
    withLegalFooter(apply(htmlContent), unsubscribeUrl),
    apply(previewText || '')
  );

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Refugio en la Palabra <onboarding@resend.dev>',
      to,
      replyTo: REPLY_TO,
      subject: apply(subject),
      html: finalHtml,
      text: htmlToText(finalHtml),
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });

    if (error) {
      console.error('Error enviando winback:', error);
      const errorMessage = error.message || JSON.stringify(error);
      return { success: false, error: errorMessage, resendId: null };
    }

    return { success: true, data, resendId: data?.id || null };
  } catch (error) {
    console.error('Error en sendWinbackEmail:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return { success: false, error: errorMessage, resendId: null };
  }
}

/**
 * Email de difusión genérico (broadcast) del centro de correos del admin.
 * Se envía a un segmento de usuarios de la app con un asunto y HTML libres.
 *
 * - Sustituye {{name}} en subject y html.
 * - Decora igual que sendWinbackEmail: preheader + pie legal (que ya incluye
 *   la info de baja) mediante decorateEmailHtml.
 * - Como es genérico (no hay enlace de baja por-usuario), la cabecera
 *   List-Unsubscribe apunta a un mailto genérico a info@refugioenlapalabra.com.
 * - Multipart texto+html (htmlToText) y retry-on-429 como las otras campañas.
 *
 * Devuelve { success, resendId?, error? } con la misma forma que el resto.
 */
export async function sendBroadcastEmail({
  to,
  name,
  subject,
  html,
}: {
  to: string;
  name: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; resendId?: string | null; error?: string }> {
  const apply = (s: string) => s.split('{{name}}').join(name);

  // Baja genérica: no hay unsubscribe por-usuario en un broadcast puntual, así
  // que reutilizamos el pie legal (sin enlace de baja específico) y ofrecemos
  // la baja por respuesta al buzón de contacto vía cabecera List-Unsubscribe.
  const unsubscribeMailto = `mailto:${REPLY_TO}?subject=baja`;
  const finalHtml = decorateEmailHtml(apply(html), apply(subject), '');

  const payload = {
    from: process.env.RESEND_FROM_EMAIL || 'Refugio en la Palabra <onboarding@resend.dev>',
    to,
    replyTo: REPLY_TO,
    subject: apply(subject),
    html: finalHtml,
    text: htmlToText(finalHtml),
    headers: {
      'List-Unsubscribe': `<${unsubscribeMailto}>`,
    },
  };

  // Reintentos con backoff si Resend nos devuelve rate-limit (2 req/s por defecto).
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data, error } = await resend.emails.send(payload);

      if (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        const isRateLimit =
          statusCode === 429 ||
          /rate.?limit|too many requests/i.test(error.name || '') ||
          /rate.?limit|too many requests/i.test(error.message || '');

        if (isRateLimit && attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
          continue;
        }

        console.error('Error enviando broadcast:', error);
        const errorMessage = error.message || JSON.stringify(error);
        return { success: false, error: errorMessage, resendId: null };
      }

      return { success: true, resendId: data?.id || null };
    } catch (error) {
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
        continue;
      }
      console.error('Error en sendBroadcastEmail:', error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      return { success: false, error: errorMessage, resendId: null };
    }
  }

  return { success: false, error: 'No se pudo enviar tras varios intentos', resendId: null };
}

/**
 * Email de recordatorio de código para usuarios de la waitlist que NO
 * han canjeado su código (mes premium gratis). Secuencia automática.
 * Reemplaza {{name}}, {{code}}, {{app_url}} y {{unsubscribe_url}} en
 * subject y html antes de enviar.
 */
export async function sendCodeReminderCampaign({
  to,
  name,
  code,
  subject,
  htmlContent,
  previewText,
  appUrl,
  unsubscribeUrl,
}: {
  to: string;
  name: string;
  code: string;
  subject: string;
  htmlContent: string;
  previewText?: string;
  appUrl: string;
  unsubscribeUrl: string;
}) {
  const replacements: Record<string, string> = {
    '{{name}}': name,
    '{{code}}': code,
    '{{app_url}}': appUrl,
    '{{unsubscribe_url}}': unsubscribeUrl,
  };

  const apply = (s: string) =>
    Object.entries(replacements).reduce(
      (acc, [token, value]) => acc.split(token).join(value),
      s
    );

  const finalHtml = withPreheader(
    withLegalFooter(apply(htmlContent), unsubscribeUrl),
    apply(previewText || '')
  );
  const payload = {
    from: process.env.RESEND_FROM_EMAIL || 'Refugio en la Palabra <onboarding@resend.dev>',
    to,
    replyTo: REPLY_TO,
    subject: apply(subject),
    html: finalHtml,
    text: htmlToText(finalHtml),
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };

  // El rate limit de Resend (2 req/s por defecto) es independiente del plan.
  // Reintentamos con backoff si nos lo devuelve, para auto-recuperarnos.
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data, error } = await resend.emails.send(payload);

      if (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        const isRateLimit =
          statusCode === 429 ||
          /rate.?limit|too many requests/i.test(error.name || '') ||
          /rate.?limit|too many requests/i.test(error.message || '');

        if (isRateLimit && attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
          continue;
        }

        console.error('Error enviando recordatorio de código:', error);
        const errorMessage = error.message || JSON.stringify(error);
        return { success: false, error: errorMessage, resendId: null };
      }

      return { success: true, data, resendId: data?.id || null };
    } catch (error) {
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
        continue;
      }
      console.error('Error en sendCodeReminderCampaign:', error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      return { success: false, error: errorMessage, resendId: null };
    }
  }

  return { success: false, error: 'No se pudo enviar tras varios intentos', resendId: null };
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
            <img src="https://www.refugioenlapalabra.com/logo-512-1.png" alt="Refugio en la Palabra" width="64" height="64" style="display: block; margin: 0 auto 16px; border-radius: 14px;">
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
              Como miembro de nuestra lista de espera, tienes un codigo para un mes gratis del premium.
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
 * Email de recordatorio para usuarios que no han usado su código
 */
export async function sendCodeReminder({
  email,
  name,
  code,
}: {
  email: string;
  name: string;
  code: string;
}, customSubject?: string, customHtml?: string) {
  try {
    // If custom template provided, replace {{name}} and {{code}} placeholders
    const finalHtml = customHtml
      ? customHtml.replace(/\{\{name\}\}/g, name).replace(/\{\{code\}\}/g, code)
      : getCodeReminderTemplate(name, code);
    const finalSubject = customSubject
      ? customSubject.replace(/\{\{name\}\}/g, name).replace(/\{\{code\}\}/g, code)
      : '¡Tu mes gratis de Premium te está esperando!';

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Refugio en la Palabra <onboarding@resend.dev>',
      to: email,
      subject: finalSubject,
      html: finalHtml,
    });

    if (error) {
      console.error('Error enviando email de recordatorio:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error en sendCodeReminder:', error);
    return { success: false, error };
  }
}

/**
 * Plantilla HTML para email de recordatorio de código
 */
function getCodeReminderTemplate(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu mes gratis te está esperando</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FAF7F0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <img src="https://www.refugioenlapalabra.com/logo-512-1.png" alt="Refugio en la Palabra" width="64" height="64" style="display: block; margin: 0 auto 16px; border-radius: 14px;">
            <h1 style="font-family: 'Lora', Georgia, serif; color: #1F3A5F; font-size: 32px; margin: 0;">
              Refugio en la Palabra
            </h1>
          </div>

          <!-- Content -->
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #1F3A5F; font-size: 24px; margin-top: 0;">
              Hola, ${name}
            </h2>

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
              Queríamos recordarte que tienes disponible un <strong>mes gratis de Premium</strong> en Refugio en la Palabra que aún no has activado.
            </p>

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
              Por ser de los primeros en confiar en nosotros, este regalo te da acceso completo a todas las funciones:
            </p>

            <ul style="color: #1F2937; font-size: 16px; line-height: 1.8; padding-left: 20px;">
              <li><strong>Rosario guiado</strong> con audio y meditaciones</li>
              <li><strong>Evangelio del día</strong> con reflexiones diarias</li>
              <li><strong>Compañero de fe</strong> para resolver tus dudas sobre doctrina</li>
              <li><strong>Experiencia sin anuncios</strong></li>
            </ul>

            <!-- Code Box -->
            <div style="background: linear-gradient(135deg, #E1B955 0%, #D4A84B 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
              <p style="color: white; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                Tu código personal
              </p>
              <p style="color: white; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 3px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${code}
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://refugio-en-la-palabra.netlify.app'}/bienvenida?code=${code}"
                 style="display: inline-block; background-color: #1F3A5F; color: white; padding: 18px 40px; text-decoration: none; border-radius: 10px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(31,58,95,0.3);">
                Activar mi mes gratis
              </a>
            </div>

            <p style="color: #6B7280; font-size: 14px; line-height: 1.6; text-align: center;">
              Solo tienes que introducir el código cuando te registres o lo puedes aplicar desde tu perfil.
            </p>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #1F2937; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
              ¿Tienes alguna duda? Responde a este email y te ayudamos.<br><br>
              Un abrazo,<br>
              <strong>El equipo de Refugio en la Palabra</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; color: #6B7280; font-size: 12px;">
            <p style="margin: 5px 0;">
              © ${new Date().getFullYear()} Refugio en la Palabra. Todos los derechos reservados.
            </p>
            <p style="margin: 5px 0;">
              Si no quieres recibir más recordatorios, responde a este email y te damos de baja.
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
