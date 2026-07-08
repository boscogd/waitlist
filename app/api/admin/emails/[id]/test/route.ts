import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendDraftEmail } from '@/lib/resend';
import { verifyAdminAuth } from '@/lib/api-auth';
import type { EmailDraft } from '@/lib/types';

// La autenticación admin (cookie httpOnly `admin-session` o Bearer legado)
// vive en @/lib/api-auth para no duplicar código entre rutas.

// =====================================================
// POST /api/admin/emails/[id]/test - Enviar email de prueba
// =====================================================

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdminAuth(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { test_email } = body;

    if (!test_email) {
      return NextResponse.json(
        { error: 'Se requiere un email de prueba' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(test_email)) {
      return NextResponse.json(
        { error: 'Formato de email no válido' },
        { status: 400 }
      );
    }

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

    // Obtener datos de prueba del body o usar valores por defecto
    const testName = body.test_name || 'Usuario';
    const testCode = body.test_code || 'REFUGIO-2024';

    // Personalizar contenido con datos proporcionados (email real, exacto como lo recibirán)
    const personalizedSubject = emailDraft.subject
      .replace(/\{\{name\}\}/g, testName)
      .replace(/\{\{email\}\}/g, test_email)
      .replace(/\{\{code\}\}/g, testCode);

    const personalizedHtml = emailDraft.html_content
      .replace(/\{\{name\}\}/g, testName)
      .replace(/\{\{email\}\}/g, test_email)
      .replace(/\{\{code\}\}/g, testCode);

    // Enviar email de prueba
    const result = await sendDraftEmail({
      to: test_email,
      subject: personalizedSubject,
      htmlContent: personalizedHtml,
      previewText: emailDraft.preview_text || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: `Error enviando email: ${result.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email de prueba enviado a ${test_email}`,
      resend_id: result.resendId,
    });

  } catch (error) {
    console.error('[Admin/Emails/Test] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
