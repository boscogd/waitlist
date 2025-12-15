import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { EmailDraft, EmailDraftUpdate } from '@/lib/types';

// =====================================================
// MIDDLEWARE: Verificar autenticaci├│n admin
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
// GET /api/admin/emails/[id] - Obtener borrador por ID
// =====================================================

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.error?.includes('configurada') ? 500 : 401 });
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from('email_drafts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Borrador no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as EmailDraft,
    });
  } catch (error) {
    console.error('[Admin/Emails] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/admin/emails/[id] - Actualizar borrador
// =====================================================

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.error?.includes('configurada') ? 500 : 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar que el borrador existe
    const { data: existingDraft, error: fetchError } = await supabase
      .from('email_drafts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingDraft) {
      return NextResponse.json(
        { error: 'Borrador no encontrado' },
        { status: 404 }
      );
    }

    // Preparar datos para actualizar
    const updateData: EmailDraftUpdate = {};

    // Solo incluir campos que fueron enviados
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.preview_text !== undefined) updateData.preview_text = body.preview_text;
    if (body.html_content !== undefined) updateData.html_content = body.html_content;
    if (body.plain_text_content !== undefined) updateData.plain_text_content = body.plain_text_content;
    if (body.scheduled_for !== undefined) updateData.scheduled_for = body.scheduled_for;
    if (body.target_audience !== undefined) updateData.target_audience = body.target_audience;
    if (body.email_type !== undefined) updateData.email_type = body.email_type;
    if (body.sequence_step !== undefined) updateData.sequence_step = body.sequence_step;

    // Manejo especial para cambios de estado
    if (body.status !== undefined) {
      updateData.status = body.status;

      // Si se aprueba, registrar fecha y autor
      if (body.status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = body.approved_by || 'admin';
      }

      // Si se marca como enviado, registrar fecha
      if (body.status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      }
    }

    // Actualizar contadores si se proporcionan
    if (body.recipients_count !== undefined) updateData.recipients_count = body.recipients_count;
    if (body.sent_count !== undefined) updateData.sent_count = body.sent_count;
    if (body.failed_count !== undefined) updateData.failed_count = body.failed_count;

    const { data, error } = await supabase
      .from('email_drafts')
      // @ts-ignore - Supabase types not yet generated for new tables
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin/Emails] Error actualizando borrador:', error);
      return NextResponse.json(
        { error: 'Error actualizando borrador' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Borrador actualizado exitosamente',
      data: data as EmailDraft,
    });
  } catch (error) {
    console.error('[Admin/Emails] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE /api/admin/emails/[id] - Eliminar borrador
// =====================================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.error?.includes('configurada') ? 500 : 401 });
    }

    const { id } = await params;

    // Verificar que el borrador existe y no ha sido enviado
    const { data: existingDraft, error: fetchError } = await supabase
      .from('email_drafts')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !existingDraft) {
      return NextResponse.json(
        { error: 'Borrador no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar emails ya enviados
    // @ts-expect-error - Supabase types not yet generated for new tables
    if (existingDraft.status === 'sent' || existingDraft.status === 'sending') {
      return NextResponse.json(
        { error: 'No se puede eliminar un email que ya ha sido enviado o está enviándose' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('email_drafts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Admin/Emails] Error eliminando borrador:', error);
      return NextResponse.json(
        { error: 'Error eliminando borrador' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Borrador eliminado exitosamente',
    });
  } catch (error) {
    console.error('[Admin/Emails] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
