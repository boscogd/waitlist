import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendDraftEmail } from '@/lib/resend';
import type { EmailDraft, WaitlistEntry, TargetAudience } from '@/lib/types';

// =====================================================
// MIDDLEWARE: Verificar autenticación admin
// =====================================================

function verifyAdminAuth(request: Request): { authorized: boolean; error?: string } {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.ADMIN_SECRET_KEY;

  if (!apiKey) {
    return { authorized: false, error: 'API key no configurada en el servidor' };
  }

  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return { authorized: false, error: 'No autorizado' };
  }

  return { authorized: true };
}

// =====================================================
// HELPER: Obtener destinatarios según target_audience
// =====================================================

async function getRecipients(targetAudience: TargetAudience): Promise<WaitlistEntry[]> {
  let query = supabase
    .from('waitlist')
    .select('*')
    .eq('unsubscribed', false);

  // Aplicar filtros según target_audience
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
    if (targetAudience.registered_before) {
      query = query.lt('created_at', targetAudience.registered_before);
    }
    if (targetAudience.registered_after) {
      query = query.gt('created_at', targetAudience.registered_after);
    }
    if (targetAudience.notified !== undefined) {
      query = query.eq('notified', targetAudience.notified);
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
// POST /api/admin/emails/[id]/send - Enviar email aprobado
// =====================================================

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.error?.includes('configurada') ? 500 : 401 });
    }

    const { id } = await params;

    // Obtener el borrador
    const { data: draft, error: draftError } = await supabase
      .from('email_drafts')
      .select('*')
      .eq('id', id)
      .single();

    if (draftError || !draft) {
      return NextResponse.json(
        { error: 'Borrador no encontrado' },
        { status: 404 }
      );
    }

    const emailDraft = draft as EmailDraft;

    // Verificar que el email está aprobado
    if (emailDraft.status !== 'approved' && emailDraft.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'El email debe estar aprobado antes de enviarlo' },
        { status: 400 }
      );
    }

    // Marcar como "enviándose"
    await supabase
      .from('email_drafts')
      // @ts-ignore - Supabase types not yet generated for new tables
      .update({ status: 'sending' })
      .eq('id', id);

    // Obtener destinatarios
    const recipients = await getRecipients(emailDraft.target_audience as TargetAudience);

    if (recipients.length === 0) {
      // Revertir estado
      await supabase
        .from('email_drafts')
        // @ts-ignore - Supabase types not yet generated for new tables
        .update({ status: 'approved' })
        .eq('id', id);

      return NextResponse.json(
        { error: 'No hay destinatarios que coincidan con los criterios' },
        { status: 400 }
      );
    }

    // Actualizar conteo de destinatarios
    await supabase
      .from('email_drafts')
      // @ts-ignore - Supabase types not yet generated for new tables
      .update({ recipients_count: recipients.length })
      .eq('id', id);

    // Enviar emails
    const results = {
      total: recipients.length,
      sent: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    };

    for (const recipient of recipients) {
      try {
        // Personalizar contenido
        const personalizedSubject = personalizeContent(emailDraft.subject, recipient);
        const personalizedHtml = personalizeContent(emailDraft.html_content, recipient);

        // Enviar email
        const result = await sendDraftEmail({
          to: recipient.email,
          subject: personalizedSubject,
          htmlContent: personalizedHtml,
          previewText: emailDraft.preview_text || undefined,
        });

        // Registrar en email_logs
        // @ts-expect-error - Supabase types not yet generated for new tables
        await supabase.from('email_logs').insert({
          draft_id: id,
          waitlist_id: recipient.id,
          email_to: recipient.email,
          subject: personalizedSubject,
          status: result.success ? 'sent' : 'failed',
          error_message: result.success ? null : String(result.error),
          resend_id: result.resendId,
        });

        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push({
            email: recipient.email,
            error: String(result.error),
          });
        }

        // Pausa para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.failed++;
        results.errors.push({
          email: recipient.email,
          error: String(error),
        });
      }
    }

    // Actualizar estado final del borrador
    await supabase
      .from('email_drafts')
      // @ts-ignore - Supabase types not yet generated for new tables
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_count: results.sent,
        failed_count: results.failed,
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      message: 'Emails enviados',
      results,
    });

  } catch (error) {
    console.error('[Admin/Emails/Send] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
