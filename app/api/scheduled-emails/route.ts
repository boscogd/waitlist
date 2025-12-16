import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendDraftEmail } from '@/lib/resend';
import type { EmailDraft, WaitlistEntry, TargetAudience } from '@/lib/types';

// =====================================================
// API: Procesar emails programados (Cron Job)
// =====================================================
// Este endpoint es llamado por el cron de Vercel cada hora
// para enviar emails que están programados

// =====================================================
// MIDDLEWARE: Verificar autorización (Cron o Admin)
// =====================================================

function verifyCronAuth(request: Request): { authorized: boolean; error?: string } {
  const authHeader = request.headers.get('authorization');

  // Verificar CRON_SECRET (para llamadas desde Vercel Cron)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true };
  }

  // Verificar ADMIN_SECRET_KEY (para llamadas manuales desde admin)
  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (adminKey && authHeader === `Bearer ${adminKey}`) {
    return { authorized: true };
  }

  return { authorized: false, error: 'No autorizado' };
}

// =====================================================
// HELPER: Obtener destinatarios según target_audience
// =====================================================

async function getRecipients(targetAudience: TargetAudience): Promise<WaitlistEntry[]> {
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

  if (error) {
    throw new Error(`Error obteniendo destinatarios: ${error.message}`);
  }

  return (data || []) as WaitlistEntry[];
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
// POST /api/scheduled-emails - Procesar emails programados
// =====================================================

export async function POST(request: Request) {
  try {
    const auth = verifyCronAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    console.log('[Scheduled Emails] Buscando emails programados...');

    // Buscar emails programados que ya pasaron su hora
    const now = new Date().toISOString();
    const { data: scheduledEmails, error: fetchError } = await supabase
      .from('email_drafts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now);

    if (fetchError) {
      console.error('[Scheduled Emails] Error buscando emails:', fetchError);
      return NextResponse.json(
        { error: 'Error buscando emails programados' },
        { status: 500 }
      );
    }

    if (!scheduledEmails || scheduledEmails.length === 0) {
      console.log('[Scheduled Emails] No hay emails programados para enviar');
      return NextResponse.json({
        success: true,
        message: 'No hay emails programados para enviar',
        processed: 0,
      });
    }

    console.log(`[Scheduled Emails] Encontrados ${scheduledEmails.length} emails para enviar`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      details: [] as Array<{ id: string; subject: string; sent: number; failed: number }>,
    };

    for (const draft of scheduledEmails as EmailDraft[]) {
      console.log(`[Scheduled Emails] Procesando: ${draft.subject}`);

      // Marcar como "enviándose"
      await supabase
        .from('email_drafts')
        // @ts-ignore
        .update({ status: 'sending' })
        .eq('id', draft.id);

      // Obtener destinatarios
      const recipients = await getRecipients(draft.target_audience as TargetAudience);

      if (recipients.length === 0) {
        console.log(`[Scheduled Emails] Sin destinatarios para: ${draft.subject}`);
        await supabase
          .from('email_drafts')
          // @ts-ignore
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            recipients_count: 0,
            sent_count: 0,
            failed_count: 0,
          })
          .eq('id', draft.id);

        results.processed++;
        results.details.push({
          id: draft.id,
          subject: draft.subject,
          sent: 0,
          failed: 0,
        });
        continue;
      }

      // Actualizar conteo de destinatarios
      await supabase
        .from('email_drafts')
        // @ts-ignore
        .update({ recipients_count: recipients.length })
        .eq('id', draft.id);

      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of recipients) {
        try {
          const personalizedSubject = personalizeContent(draft.subject, recipient);
          const personalizedHtml = personalizeContent(draft.html_content, recipient);

          const result = await sendDraftEmail({
            to: recipient.email,
            subject: personalizedSubject,
            htmlContent: personalizedHtml,
            previewText: draft.preview_text || undefined,
          });

          // Registrar en email_logs
          // @ts-ignore
          await supabase.from('email_logs').insert({
            draft_id: draft.id,
            waitlist_id: recipient.id,
            email_to: recipient.email,
            subject: personalizedSubject,
            status: result.success ? 'sent' : 'failed',
            error_message: result.success ? null : String(result.error),
            resend_id: result.resendId,
          });

          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
          }

          // Pausa para evitar rate limits
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`[Scheduled Emails] Error enviando a ${recipient.email}:`, error);
          failedCount++;
        }
      }

      // Actualizar estado final
      await supabase
        .from('email_drafts')
        // @ts-ignore
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: sentCount,
          failed_count: failedCount,
        })
        .eq('id', draft.id);

      results.processed++;
      results.sent += sentCount;
      results.failed += failedCount;
      results.details.push({
        id: draft.id,
        subject: draft.subject,
        sent: sentCount,
        failed: failedCount,
      });

      console.log(`[Scheduled Emails] Completado: ${draft.subject} - ${sentCount} enviados, ${failedCount} fallidos`);
    }

    console.log(`[Scheduled Emails] Proceso completado: ${results.processed} emails procesados`);

    return NextResponse.json({
      success: true,
      message: `Procesados ${results.processed} emails programados`,
      results,
    });

  } catch (error) {
    console.error('[Scheduled Emails] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET para verificar estado (sin autenticación)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'scheduled-emails',
    description: 'Procesa emails programados cuando scheduled_for <= ahora',
  });
}
