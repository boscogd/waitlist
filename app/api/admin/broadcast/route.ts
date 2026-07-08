import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/api-auth';
import { getServiceClient } from '@/lib/supabase-admin';
import { sendBroadcastEmail } from '@/lib/resend';

// =====================================================
// POST /api/admin/broadcast — envío masivo a un segmento
// =====================================================
// Centro de correos del admin. Envía un email libre (subject + html) a un
// segmento de usuarios de la app, o un email de prueba a una sola dirección.
//
// Segmentos: 'all' | 'active' | 'dormant' (mismo criterio que /audience).
// Protecciones para no quemar reputación de dominio:
//   - Excluye a quien tenga profiles.winback_unsubscribed = true.
//   - Frequency-cap global: excluye a quien recibió CUALQUIER 'sent' en
//     email_logs en las últimas EMAIL_MIN_GAP_HOURS (72h por defecto).
//   - Tope BROADCAST_MAX_PER_RUN (200 por defecto) por ejecución.

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const ACTIVE_WINDOW_DAYS = 14;

type MinimalUser = {
  id: string;
  email?: string;
  last_sign_in_at?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_metadata?: Record<string, any> | null;
};

// Recorre auth.admin.listUsers paginando hasta agotar (perPage 1000).
async function listAllUsers(
  client: ReturnType<typeof getServiceClient>
): Promise<MinimalUser[]> {
  const all: MinimalUser[] = [];
  let page = 1;
  const perPage = 1000;

  for (;;) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Error listando usuarios: ${error.message}`);
    const users = (data?.users || []) as MinimalUser[];
    all.push(...users);
    if (users.length < perPage) break;
    page++;
  }

  return all;
}

// Set de ids de perfiles dados de baja del win-back.
async function loadUnsubscribedIds(
  client: ReturnType<typeof getServiceClient>
): Promise<Set<string>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from('profiles')
    .select('id')
    .eq('winback_unsubscribed', true);
  if (error) throw new Error(`Error leyendo bajas: ${error.message}`);
  return new Set(((data || []) as Array<{ id: string }>).map((r) => r.id));
}

// ¿El usuario pertenece al segmento pedido según su last_sign_in_at?
function matchesSegment(user: MinimalUser, segment: string, cutoff: number): boolean {
  if (segment === 'all') return true;
  const last = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : null;
  const isActive = last !== null && last >= cutoff;
  if (segment === 'active') return isActive;
  if (segment === 'dormant') return !isActive; // fuera de ventana o nunca
  return false;
}

// Nombre para personalizar {{name}}: full_name/name del metadata o el prefijo
// del email (antes de la @), como fallback razonable.
function displayName(user: MinimalUser): string {
  const meta = user.user_metadata || {};
  const fromMeta = meta.full_name || meta.name;
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim();
  const email = user.email || '';
  const prefix = email.split('@')[0];
  return prefix || 'amigo';
}

export async function POST(request: Request) {
  // Autenticación admin (cookie httpOnly `admin-session` o Bearer legado).
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    subject?: string;
    html?: string;
    segment?: string;
    testEmail?: string;
  };

  const subject = (body.subject || '').trim();
  const html = (body.html || '').trim();

  if (!subject || !html) {
    return NextResponse.json(
      { success: false, error: 'subject y html son obligatorios' },
      { status: 400 }
    );
  }

  // ---------------------------------------------------
  // Modo prueba: un solo email, sin tocar la base de datos.
  // ---------------------------------------------------
  if (body.testEmail) {
    try {
      const result = await sendBroadcastEmail({
        to: body.testEmail,
        name: 'Prueba',
        subject,
        html,
      });
      return NextResponse.json({ success: result.success, testMode: true, result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en modo prueba';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  // ---------------------------------------------------
  // Envío real al segmento.
  // ---------------------------------------------------
  const segment = body.segment || 'all';
  if (!['all', 'active', 'dormant'].includes(segment)) {
    return NextResponse.json(
      { success: false, error: `Segmento inválido: ${segment}` },
      { status: 400 }
    );
  }

  const MAX_PER_RUN = Number(process.env.BROADCAST_MAX_PER_RUN) || 200;

  try {
    const client = getServiceClient();
    const [users, unsubscribed] = await Promise.all([
      listAllUsers(client),
      loadUnsubscribedIds(client),
    ]);

    const cutoff = Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

    // Destinatarios del segmento, excluyendo bajas y sin email.
    const recipients = users.filter(
      (u) =>
        !!u.email &&
        !unsubscribed.has(u.id) &&
        matchesSegment(u, segment, cutoff)
    );

    // Frequency-cap global: no escribir a quien haya recibido CUALQUIER correo
    // nuestro (winback, code-reminder, broadcast…) con status 'sent' en las
    // últimas EMAIL_MIN_GAP_HOURS, para que las campañas no se solapen.
    const gapHours = Number(process.env.EMAIL_MIN_GAP_HOURS) || 72;
    const sinceIso = new Date(Date.now() - gapHours * 3600 * 1000).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recentLogs } = await (client as any)
      .from('email_logs')
      .select('email_to')
      .eq('status', 'sent')
      .gte('sent_at', sinceIso)
      .limit(5000);
    const recentlyEmailed = new Set(
      ((recentLogs || []) as Array<{ email_to: string }>).map((r) => r.email_to.toLowerCase())
    );

    const result = { sent: 0, failed: 0, skipped: 0 };

    for (const user of recipients) {
      const email = user.email as string;

      // Frequency-cap: saltar si ya recibió algo en la ventana.
      if (recentlyEmailed.has(email.toLowerCase())) {
        result.skipped++;
        continue;
      }

      // Tope por ejecución: los que sobren cuentan como saltados.
      if (result.sent + result.failed >= MAX_PER_RUN) {
        result.skipped++;
        continue;
      }

      const sendResult = await sendBroadcastEmail({
        to: email,
        name: displayName(user),
        subject,
        html,
      });

      // Registro en email_logs (sent o failed), también base del frequency-cap.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (client as any).from('email_logs').insert({
        email_to: email,
        subject: subject.split('{{name}}').join(displayName(user)),
        status: sendResult.success ? 'sent' : 'failed',
        error_message: sendResult.success ? null : String(sendResult.error),
        resend_id: sendResult.resendId ?? null,
      });

      if (sendResult.success) {
        result.sent++;
      } else {
        result.failed++;
      }

      // Rate limit de Resend (~2 req/s): pequeño delay entre envíos.
      await new Promise((r) => setTimeout(r, 300));
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    // "SUPABASE_SERVICE_ROLE_KEY no configurada" y demás → 400 legible.
    const message = error instanceof Error ? error.message : 'Error enviando broadcast';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
