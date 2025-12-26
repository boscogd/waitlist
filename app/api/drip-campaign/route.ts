import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendDraftEmail } from '@/lib/resend';
import type { WaitlistEntry, SequenceConfig, EmailTemplate, DripCampaignResult, EmailDraft, TargetAudience } from '@/lib/types';

// =====================================================
// VERCEL CRON JOB: Drip Campaign Processor
// =====================================================
// Se ejecuta diariamente para:
// 1. Procesar emails programados (scheduled)
// 2. Verificar usuarios que necesitan el siguiente email de la secuencia
// 3. Enviar emails según la configuración de timing
// 4. Actualizar el progreso de cada usuario

// =====================================================
// MIDDLEWARE: Verificar autorización (Cron o Admin)
// =====================================================

function verifyAuth(request: Request): { authorized: boolean; error?: string } {
  const authHeader = request.headers.get('authorization');

  // DEBUG: Log para diagnosticar problemas de autenticación
  console.log('[DripCampaign Auth] Header recibido:', authHeader ? `Bearer ***${authHeader.slice(-8)}` : 'ninguno');
  console.log('[DripCampaign Auth] CRON_SECRET configurado:', process.env.CRON_SECRET ? `***${process.env.CRON_SECRET.slice(-8)}` : 'no');
  console.log('[DripCampaign Auth] ADMIN_SECRET_KEY configurado:', process.env.ADMIN_SECRET_KEY ? `***${process.env.ADMIN_SECRET_KEY.slice(-8)}` : 'no');

  // Verificar Vercel Cron secret (para ejecución automática)
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    console.log('[DripCampaign Auth] ✓ Autenticado via CRON_SECRET');
    return { authorized: true };
  }

  // Verificar Admin Secret Key (para acceso desde panel de admin)
  if (process.env.ADMIN_SECRET_KEY && authHeader === `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    console.log('[DripCampaign Auth] ✓ Autenticado via ADMIN_SECRET_KEY');
    return { authorized: true };
  }

  console.log('[DripCampaign Auth] ✗ No autorizado - header no coincide con ningún secret');
  return { authorized: false, error: 'No autorizado' };
}

// =====================================================
// HELPER: Personalizar contenido del email
// =====================================================

function personalizeContent(content: string, user: WaitlistEntry): string {
  return content
    .replace(/\{\{name\}\}/g, user.name)
    .replace(/\{\{email\}\}/g, user.email)
    .replace(/\{\{code\}\}/g, user.code);
}

// =====================================================
// HELPER: Calcular días desde última acción
// =====================================================

function daysSince(dateString: string | null): number {
  if (!dateString) return Infinity;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// =====================================================
// HELPER: Obtener destinatarios para email programado
// =====================================================

async function getScheduledEmailRecipients(targetAudience: TargetAudience): Promise<WaitlistEntry[]> {
  let query = supabase
    .from('waitlist')
    .select('*')
    .eq('unsubscribed', false);

  if (!targetAudience.all) {
    if (targetAudience.sequence_step !== undefined) {
      query = query.eq('email_sequence_step', targetAudience.sequence_step);
    }
    if (targetAudience.sequence_step_gte !== undefined) {
      query = query.gte('email_sequence_step', targetAudience.sequence_step_gte);
    }
    if (targetAudience.sequence_step_lte !== undefined) {
      query = query.lte('email_sequence_step', targetAudience.sequence_step_lte);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(`Error obteniendo destinatarios: ${error.message}`);
  return (data || []) as WaitlistEntry[];
}

// =====================================================
// HELPER: Procesar emails programados
// =====================================================

async function processScheduledEmails(): Promise<{ processed: number; sent: number; failed: number }> {
  const result = { processed: 0, sent: 0, failed: 0 };

  const now = new Date().toISOString();
  const { data: scheduledEmails, error } = await supabase
    .from('email_drafts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_for', now);

  if (error || !scheduledEmails || scheduledEmails.length === 0) {
    console.log('[DripCampaign] No hay emails programados para enviar');
    return result;
  }

  console.log(`[DripCampaign] Procesando ${scheduledEmails.length} emails programados...`);

  for (const draft of scheduledEmails as EmailDraft[]) {
    // @ts-ignore
    await supabase.from('email_drafts').update({ status: 'sending' }).eq('id', draft.id);

    const recipients = await getScheduledEmailRecipients(draft.target_audience as TargetAudience);

    if (recipients.length === 0) {
      // @ts-ignore
      await supabase.from('email_drafts').update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipients_count: 0,
        sent_count: 0,
        failed_count: 0,
      }).eq('id', draft.id);
      result.processed++;
      continue;
    }

    // @ts-ignore
    await supabase.from('email_drafts').update({ recipients_count: recipients.length }).eq('id', draft.id);

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        const personalizedSubject = personalizeContent(draft.subject, recipient);
        const personalizedHtml = personalizeContent(draft.html_content, recipient);

        const sendResult = await sendDraftEmail({
          to: recipient.email,
          subject: personalizedSubject,
          htmlContent: personalizedHtml,
          previewText: draft.preview_text || undefined,
        });

        // @ts-ignore
        await supabase.from('email_logs').insert({
          draft_id: draft.id,
          waitlist_id: recipient.id,
          email_to: recipient.email,
          subject: personalizedSubject,
          status: sendResult.success ? 'sent' : 'failed',
          error_message: sendResult.success ? null : String(sendResult.error),
          resend_id: sendResult.resendId,
        });

        if (sendResult.success) sentCount++;
        else failedCount++;

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch {
        failedCount++;
      }
    }

    // @ts-ignore
    await supabase.from('email_drafts').update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_count: sentCount,
      failed_count: failedCount,
    }).eq('id', draft.id);

    result.processed++;
    result.sent += sentCount;
    result.failed += failedCount;
    console.log(`[DripCampaign] Email programado enviado: ${draft.subject} - ${sentCount} ok, ${failedCount} fail`);
  }

  return result;
}

// =====================================================
// GET /api/drip-campaign - Obtener estadísticas
// =====================================================

export async function GET(request: Request) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // Obtener estadísticas de la secuencia
    const { data: sequenceStats, error: statsError } = await supabase
      .from('waitlist')
      .select('email_sequence_step')
      .eq('unsubscribed', false);

    if (statsError) {
      throw new Error(`Error obteniendo estadísticas: ${statsError.message}`);
    }

    // Contar usuarios por paso
    const stepCounts: Record<number, number> = {};
    for (const user of sequenceStats || []) {
      // @ts-expect-error - Supabase types not yet generated for new fields
      const step = user.email_sequence_step || 0;
      stepCounts[step] = (stepCounts[step] || 0) + 1;
    }

    // Obtener configuración de secuencia
    const { data: sequenceConfig } = await supabase
      .from('email_sequence_config')
      .select('*')
      .eq('is_active', true)
      .order('step', { ascending: true });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: sequenceStats?.length || 0,
        byStep: stepCounts,
        sequenceConfig: sequenceConfig || [],
      },
    });

  } catch (error) {
    console.error('[DripCampaign] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/drip-campaign - Procesar secuencia
// =====================================================

export async function POST(request: Request) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    console.log('[DripCampaign] Iniciando procesamiento...');

    // 1. Primero procesar emails programados
    const scheduledResult = await processScheduledEmails();
    console.log(`[DripCampaign] Emails programados: ${scheduledResult.processed} procesados, ${scheduledResult.sent} enviados`);

    // 2. Luego procesar secuencia de drip campaign
    console.log('[DripCampaign] Procesando secuencia de nurturing...');

    const result: DripCampaignResult = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      scheduledEmails: scheduledResult,
    };

    // Obtener configuración de secuencia activa
    const { data: sequenceConfig, error: configError } = await supabase
      .from('email_sequence_config')
      .select('*')
      .eq('is_active', true)
      .order('step', { ascending: true });

    if (configError) {
      throw new Error(`Error obteniendo configuración: ${configError.message}`);
    }

    if (!sequenceConfig || sequenceConfig.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay pasos de secuencia activos',
        result,
      });
    }

    // Obtener usuarios elegibles (no desuscritos)
    const { data: users, error: usersError } = await supabase
      .from('waitlist')
      .select('*')
      .eq('unsubscribed', false);

    if (usersError) {
      throw new Error(`Error obteniendo usuarios: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay usuarios en la waitlist',
        result,
      });
    }

    console.log(`[DripCampaign] Procesando ${users.length} usuarios...`);

    // Procesar cada usuario
    for (const user of users as WaitlistEntry[]) {
      result.processed++;

      const currentStep = user.email_sequence_step;
      const nextStep = currentStep + 1;

      // Buscar configuración del siguiente paso
      const nextStepConfig = (sequenceConfig as SequenceConfig[]).find(
        (c) => c.step === nextStep
      );

      // Si no hay siguiente paso, el usuario completó la secuencia
      if (!nextStepConfig) {
        result.skipped++;
        continue;
      }

      // Calcular días desde el último email
      const lastEmailDate = user.last_email_sent_at || user.created_at;
      const daysSinceLastEmail = daysSince(lastEmailDate);

      // Verificar si es tiempo de enviar el siguiente email
      if (daysSinceLastEmail < nextStepConfig.days_after_previous) {
        result.skipped++;
        continue;
      }

      // Obtener plantilla del email
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_key', nextStepConfig.template_key)
        .eq('is_active', true)
        .single();

      if (templateError || !template) {
        console.error(`[DripCampaign] Plantilla no encontrada: ${nextStepConfig.template_key}`);
        result.skipped++;
        continue;
      }

      const emailTemplate = template as EmailTemplate;

      // Personalizar contenido
      const personalizedSubject = personalizeContent(emailTemplate.subject, user);
      const personalizedHtml = personalizeContent(emailTemplate.html_content, user);

      try {
        // Enviar email
        const sendResult = await sendDraftEmail({
          to: user.email,
          subject: personalizedSubject,
          htmlContent: personalizedHtml,
          previewText: emailTemplate.preview_text || undefined,
        });

        if (sendResult.success) {
          result.sent++;

          // Actualizar usuario
          await supabase
            .from('waitlist')
            // @ts-ignore - Supabase types not yet generated for new fields
            .update({
              email_sequence_step: nextStep,
              last_email_sent_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          // Registrar en logs
          // @ts-ignore - Supabase types not yet generated for new tables
          await supabase.from('email_logs').insert({
            waitlist_id: user.id,
            email_to: user.email,
            subject: personalizedSubject,
            status: 'sent',
            resend_id: sendResult.resendId,
          });

          console.log(`[DripCampaign] Email enviado a ${user.email} (paso ${nextStep})`);
        } else {
          result.failed++;
          result.errors.push({
            email: user.email,
            error: String(sendResult.error),
          });

          // Registrar error en logs
          // @ts-ignore - Supabase types not yet generated for new tables
          await supabase.from('email_logs').insert({
            waitlist_id: user.id,
            email_to: user.email,
            subject: personalizedSubject,
            status: 'failed',
            error_message: String(sendResult.error),
          });
        }

        // Pausa para evitar rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));

      } catch (error) {
        result.failed++;
        result.errors.push({
          email: user.email,
          error: String(error),
        });
      }
    }

    console.log(`[DripCampaign] Completado: ${result.sent} enviados, ${result.failed} fallidos, ${result.skipped} omitidos`);

    return NextResponse.json({
      success: true,
      message: 'Secuencia procesada',
      result,
    });

  } catch (error) {
    console.error('[DripCampaign] Error crítico:', error);
    return NextResponse.json(
      { error: 'Error procesando drip campaign' },
      { status: 500 }
    );
  }
}
