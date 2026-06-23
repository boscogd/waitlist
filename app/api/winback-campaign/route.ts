import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWinbackEmail } from '@/lib/resend';
import type { EmailTemplate } from '@/lib/types';

// =====================================================
// WIN-BACK CAMPAIGN
// =====================================================
// Cron diario. Detecta usuarios de la app dormidos
// (auth.users.last_sign_in_at) y les manda hasta 3 emails:
//   step 1 → día 14 desde último login
//   step 2 → 3 días después del step 1
//   step 3 → 4 días después del step 2 (final)
//
// Si el usuario abre la app entre emails, se sale de
// la secuencia (winback_step se reinicia a 0).

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Espaciado entre pasos (en días)
const STEP_INTERVAL_DAYS: Record<number, number> = {
  // step actual → días que deben pasar antes del siguiente
  0: 14, // dormido 14d → mandar email #1
  1: 3,  // 3d después → email #2
  2: 4,  // 4d después → email #3
};

const STEP_TEMPLATE: Record<number, string> = {
  1: 'winback_1',
  2: 'winback_2',
  3: 'winback_3',
};

const MAX_DORMANT_DAYS = 90; // no insistir más allá

type DormantUser = {
  user_id: string;
  email: string;
  name: string;
  last_sign_in_at: string;
  winback_step: number;
  last_winback_at: string | null;
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

function shouldResetStep(user: DormantUser): boolean {
  if (!user.last_winback_at) return false;
  return new Date(user.last_sign_in_at) > new Date(user.last_winback_at);
}

function buildUnsubscribeUrl(userId: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://refugioenlapalabra.com';
  return `${base.replace(/\/$/, '')}/api/winback/unsubscribe?u=${userId}`;
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
// GET /api/winback-campaign — stats
// =====================================================

export async function GET(request: Request) {
  const auth = verifyAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // Los cron de Vercel solo hacen GET: cuando la petición viene del cron
  // (CRON_SECRET) ejecutamos la secuencia. El panel admin (ADMIN_SECRET_KEY)
  // o ?mode=stats devuelven estadísticas sin enviar nada.
  const { searchParams } = new URL(request.url);
  if (auth.isCron && searchParams.get('mode') !== 'stats') {
    return runWinback();
  }

  try {
    const { data, error } = await supabase.rpc('winback_stats');
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, stats: data });
  } catch (error) {
    console.error('[Winback] Error GET stats:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estadísticas' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/winback-campaign — ejecutar secuencia (trigger manual)
// =====================================================

export async function POST(request: Request) {
  const auth = verifyAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  return runWinback();
}

// =====================================================
// Núcleo: procesa la secuencia y envía los emails
// =====================================================

async function runWinback() {
  console.log('[Winback] Iniciando procesamiento…');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.refugioenlapalabra.com';
  const result = {
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    reset: 0,
    errors: [] as Array<{ email: string; error: string }>,
    byStep: { 1: 0, 2: 0, 3: 0 } as Record<number, number>,
  };

  try {
    const templates = await loadTemplates();
    for (const key of Object.values(STEP_TEMPLATE)) {
      if (!templates[key]) {
        return NextResponse.json(
          { error: `Plantilla no encontrada: ${key}. Ejecuta winback-schema.sql primero.` },
          { status: 500 }
        );
      }
    }

    // @ts-expect-error - RPC types not generated for winback functions
    const { data: users, error: usersError } = await supabase.rpc('get_dormant_users', {
      p_min_days: 14,
      p_max_days: MAX_DORMANT_DAYS,
    });

    if (usersError) {
      throw new Error(`Error obteniendo dormidos: ${usersError.message}`);
    }

    const dormantUsers = (users || []) as DormantUser[];
    console.log(`[Winback] ${dormantUsers.length} usuarios candidatos`);

    for (const user of dormantUsers) {
      result.processed++;

      // ¿Volvió tras el último email? Sí → resetear y dejar fuera de esta ronda.
      if (shouldResetStep(user)) {
        // @ts-expect-error - RPC types not generated
        await supabase.rpc('update_winback_state', {
          p_user_id: user.user_id,
          p_new_step: 0,
        });
        result.reset++;
        result.skipped++;
        continue;
      }

      const currentStep = user.winback_step ?? 0;
      const nextStep = currentStep + 1;

      // Step 4 = completado, no insistir
      if (nextStep > 3) {
        result.skipped++;
        continue;
      }

      // ¿Ha pasado suficiente tiempo desde la última acción?
      const referenceDate =
        currentStep === 0 ? user.last_sign_in_at : user.last_winback_at;
      const wait = STEP_INTERVAL_DAYS[currentStep];
      if (daysSince(referenceDate) < wait) {
        result.skipped++;
        continue;
      }

      const template = templates[STEP_TEMPLATE[nextStep]];

      const sendResult = await sendWinbackEmail({
        to: user.email,
        name: user.name,
        subject: template.subject,
        htmlContent: template.html_content,
        previewText: template.preview_text || undefined,
        appUrl,
        unsubscribeUrl: buildUnsubscribeUrl(user.user_id),
      });

      // Log siempre (sent o failed)
      // @ts-ignore — supabase types desactualizados
      await supabase.from('email_logs').insert({
        email_to: user.email,
        subject: template.subject.replace(/\{\{name\}\}/g, user.name),
        status: sendResult.success ? 'sent' : 'failed',
        error_message: sendResult.success ? null : String(sendResult.error),
        resend_id: sendResult.resendId,
      });

      if (sendResult.success) {
        // Step 3 envíado → marcar como completado (4) para no re-enganchar
        const newStep = nextStep === 3 ? 4 : nextStep;
        // @ts-expect-error - RPC types not generated
        await supabase.rpc('update_winback_state', {
          p_user_id: user.user_id,
          p_new_step: newStep,
        });

        result.sent++;
        result.byStep[nextStep]++;
        console.log(`[Winback] ✉ ${user.email} → step ${nextStep}`);
      } else {
        result.failed++;
        result.errors.push({ email: user.email, error: String(sendResult.error) });
      }

      // Rate limit de Resend
      await new Promise((r) => setTimeout(r, 300));
    }

    console.log(
      `[Winback] Done. sent=${result.sent} failed=${result.failed} skipped=${result.skipped} reset=${result.reset}`
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[Winback] Error crítico:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error procesando winback' },
      { status: 500 }
    );
  }
}
