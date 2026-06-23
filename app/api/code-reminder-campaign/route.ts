import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendCodeReminderCampaign } from '@/lib/resend';
import type { EmailTemplate } from '@/lib/types';

// =====================================================
// CODE-REMINDER CAMPAIGN
// =====================================================
// Cron diario. Detecta usuarios de la WAITLIST que NO han
// canjeado su código de descuento (waitlist.code_used = false)
// y les manda hasta 3 recordatorios:
//   step 1 → día  3 desde el registro
//   step 2 → 7 días después del step 1  (~día 10)
//   step 3 → 11 días después del step 2 (~día 21)
//
// El usuario sale de la secuencia automáticamente cuando canjea
// el código (deja de aparecer en get_unredeemed_users), se da de
// baja, o completa los 3 emails (step = 4).
//
// IMPORTANTE: los cron jobs de Vercel solo hacen GET. Por eso el
// procesado vive en GET (lo que dispara el cron) y las stats se
// piden con GET ?mode=stats. POST también procesa (trigger manual).
//
// Requiere haber ejecutado supabase/code-reminder-schema.sql.

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Espaciado entre pasos (en días)
const STEP_INTERVAL_DAYS: Record<number, number> = {
  0: 3,  // registrado hace 3d → recordatorio #1
  1: 7,  // 7d después → recordatorio #2
  2: 11, // 11d después → recordatorio #3
};

const STEP_TEMPLATE: Record<number, string> = {
  1: 'code_reminder_1',
  2: 'code_reminder_2',
  3: 'code_reminder_3',
};

// Tope de envíos por ejecución del cron. Escalona la primera tanda grande
// (p. ej. 327 pendientes salen en ~4 días) para cuidar la reputación de
// envío. El cron diario reparte el resto solo. Súbelo (o ponlo muy alto)
// cuando la campaña esté rodada. Configurable por env sin tocar código.
const MAX_PER_RUN = Number(process.env.CODE_REMINDER_MAX_PER_RUN) || 100;

type UnredeemedUser = {
  id: string;
  email: string;
  name: string;
  code: string;
  created_at: string;
  code_reminder_step: number;
  last_code_reminder_at: string | null;
};

function verifyAuth(request: Request): { authorized: boolean; isCron: boolean; error?: string } {
  const authHeader = request.headers.get('authorization');
  // Vercel inyecta `Authorization: Bearer <CRON_SECRET>` en las peticiones del cron.
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return { authorized: true, isCron: true };
  }
  if (process.env.ADMIN_SECRET_KEY && authHeader === `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return { authorized: true, isCron: false };
  }
  return { authorized: false, isCron: false, error: 'No autorizado' };
}

function daysSince(dateString: string | null): number {
  if (!dateString) return Infinity;
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function buildUnsubscribeUrl(id: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://refugioenlapalabra.com';
  return `${base.replace(/\/$/, '')}/api/code-reminder/unsubscribe?u=${id}`;
}

async function loadTemplates(): Promise<Record<string, EmailTemplate>> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .in('template_key', Object.values(STEP_TEMPLATE));

  if (error) throw new Error(`Error cargando plantillas: ${error.message}`);
  const map: Record<string, EmailTemplate> = {};
  for (const t of (data as EmailTemplate[]) || []) {
    map[t.template_key] = t;
  }
  return map;
}

// =====================================================
// Núcleo: procesa la secuencia y envía los recordatorios
// =====================================================

async function processCampaign() {
  console.log('[CodeReminder] Iniciando procesamiento…');

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://refugio-en-la-palabra.netlify.app';
  const result = {
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [] as Array<{ email: string; error: string }>,
    byStep: { 1: 0, 2: 0, 3: 0 } as Record<number, number>,
  };

  const templates = await loadTemplates();
  for (const key of Object.values(STEP_TEMPLATE)) {
    if (!templates[key]) {
      throw new Error(`Plantilla no encontrada: ${key}. Ejecuta code-reminder-schema.sql primero.`);
    }
  }

  // @ts-ignore - RPC types not generated for code-reminder functions
  const { data: users, error: usersError } = await supabase.rpc('get_unredeemed_users', {
    p_max_age_days: null,
  });

  if (usersError) {
    throw new Error(`Error obteniendo no-canjeados: ${usersError.message}`);
  }

  const unredeemed = (users || []) as UnredeemedUser[];
  console.log(`[CodeReminder] ${unredeemed.length} usuarios candidatos`);

  for (const user of unredeemed) {
    result.processed++;

    const currentStep = user.code_reminder_step ?? 0;
    const nextStep = currentStep + 1;

    // Step 4 = completado, no insistir
    if (nextStep > 3) {
      result.skipped++;
      continue;
    }

    // ¿Ha pasado suficiente tiempo desde la última acción?
    const referenceDate =
      currentStep === 0 ? user.created_at : user.last_code_reminder_at;
    const wait = STEP_INTERVAL_DAYS[currentStep];
    if (daysSince(referenceDate) < wait) {
      result.skipped++;
      continue;
    }

    const template = templates[STEP_TEMPLATE[nextStep]];

    const sendResult = await sendCodeReminderCampaign({
      to: user.email,
      name: user.name,
      code: user.code,
      subject: template.subject,
      htmlContent: template.html_content,
      previewText: template.preview_text || undefined,
      appUrl,
      unsubscribeUrl: buildUnsubscribeUrl(user.id),
    });

    // Log siempre (sent o failed)
    // @ts-ignore — supabase types desactualizados para email_logs
    await supabase.from('email_logs').insert({
      waitlist_id: user.id,
      email_to: user.email,
      subject: template.subject
        .replace(/\{\{name\}\}/g, user.name)
        .replace(/\{\{code\}\}/g, user.code),
      status: sendResult.success ? 'sent' : 'failed',
      error_message: sendResult.success ? null : String(sendResult.error),
      resend_id: sendResult.resendId,
    });

    if (sendResult.success) {
      // Step 3 enviado → marcar completado (4) para no re-enganchar
      const newStep = nextStep === 3 ? 4 : nextStep;
      // @ts-ignore - RPC types not generated
      await supabase.rpc('update_code_reminder_state', {
        p_id: user.id,
        p_new_step: newStep,
      });

      result.sent++;
      result.byStep[nextStep]++;
      console.log(`[CodeReminder] ✉ ${user.email} → step ${nextStep}`);
    } else {
      result.failed++;
      result.errors.push({ email: user.email, error: String(sendResult.error) });
    }

    // Tope de envíos por ejecución (escalona la primera tanda grande)
    if (result.sent >= MAX_PER_RUN) {
      console.log(
        `[CodeReminder] Tope de ${MAX_PER_RUN} envíos alcanzado; el resto continúa en la próxima ejecución.`
      );
      break;
    }

    // Rate limit de Resend
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(
    `[CodeReminder] Done. sent=${result.sent} failed=${result.failed} skipped=${result.skipped}`
  );

  return result;
}

async function getStats() {
  // @ts-ignore - RPC types not generated for code-reminder functions
  const { data, error } = await supabase.rpc('code_reminder_stats');
  if (error) throw new Error(error.message);
  return data;
}

// =====================================================
// GET /api/code-reminder-campaign
//   (cron Vercel → procesa)   ·   ?mode=stats → métricas
// =====================================================

export async function GET(request: Request) {
  const auth = verifyAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // Solo el cron de Vercel (CRON_SECRET) dispara el envío. El admin
  // (ADMIN_SECRET_KEY) o ?mode=stats reciben estadísticas sin enviar nada.
  const { searchParams } = new URL(request.url);

  try {
    if (auth.isCron && searchParams.get('mode') !== 'stats') {
      const result = await processCampaign();
      return NextResponse.json({ success: true, result });
    }
    const stats = await getStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('[CodeReminder] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error procesando recordatorios' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/code-reminder-campaign — trigger manual
// =====================================================

export async function POST(request: Request) {
  const auth = verifyAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    testMode?: boolean;
    testEmail?: string;
    step?: number;
    name?: string;
    code?: string;
  };

  // Modo prueba: envía UN email de muestra a testEmail SIN tocar la base de
  // datos ni a ningún usuario real. Para previsualizar antes de activar.
  if (body.testMode) {
    if (!body.testEmail) {
      return NextResponse.json(
        { error: 'testEmail es requerido en modo prueba' },
        { status: 400 }
      );
    }
    const stepRaw = Number(body.step) || 1;
    const step = [1, 2, 3].includes(stepRaw) ? stepRaw : 1;
    try {
      const templates = await loadTemplates();
      const template = templates[STEP_TEMPLATE[step]];
      if (!template) {
        return NextResponse.json(
          { error: `Plantilla ${STEP_TEMPLATE[step]} no encontrada. Ejecuta code-reminder-schema.sql.` },
          { status: 500 }
        );
      }
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'https://refugio-en-la-palabra.netlify.app';
      const sendResult = await sendCodeReminderCampaign({
        to: body.testEmail,
        name: body.name || 'Prueba',
        code: body.code || 'REFUGIO-TEST1',
        subject: template.subject,
        htmlContent: template.html_content,
        previewText: template.preview_text || undefined,
        appUrl,
        unsubscribeUrl: buildUnsubscribeUrl('00000000-0000-0000-0000-000000000000'),
      });
      return NextResponse.json({ success: sendResult.success, testMode: true, step, result: sendResult });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error en modo prueba' },
        { status: 500 }
      );
    }
  }

  try {
    const result = await processCampaign();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[CodeReminder] Error crítico:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error procesando recordatorios' },
      { status: 500 }
    );
  }
}
