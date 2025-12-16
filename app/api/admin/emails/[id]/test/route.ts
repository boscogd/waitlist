import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendDraftEmail } from '@/lib/resend';
import type { EmailDraft } from '@/lib/types';

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
// POST /api/admin/emails/[id]/test - Enviar email de prueba
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

    // Personalizar contenido con datos de prueba
    const testData = {
      name: 'Usuario de Prueba',
      email: test_email,
      code: 'TEST-1234',
    };

    const personalizedSubject = `[PRUEBA] ${emailDraft.subject}`
      .replace(/\{\{name\}\}/g, testData.name)
      .replace(/\{\{email\}\}/g, testData.email)
      .replace(/\{\{code\}\}/g, testData.code);

    const personalizedHtml = emailDraft.html_content
      .replace(/\{\{name\}\}/g, testData.name)
      .replace(/\{\{email\}\}/g, testData.email)
      .replace(/\{\{code\}\}/g, testData.code);

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
