import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { EmailDraft, EmailDraftInsert, EmailStatus } from '@/lib/types';

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
// GET /api/admin/emails - Listar borradores
// =====================================================

export async function GET(request: Request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.error?.includes('configurada') ? 500 : 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as EmailStatus | null;
    const emailType = searchParams.get('email_type');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Construir query
    let query = supabase
      .from('email_drafts')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }
    if (emailType) {
      query = query.eq('email_type', emailType);
    }

    // Ordenar por fecha de creación descendente
    query = query.order('created_at', { ascending: false });

    // Paginación
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Admin/Emails] Error listando borradores:', error);
      return NextResponse.json(
        { error: 'Error obteniendo borradores' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as EmailDraft[],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
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
// POST /api/admin/emails - Crear nuevo borrador
// =====================================================

export async function POST(request: Request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.error?.includes('configurada') ? 500 : 401 });
    }

    const body = await request.json();

    // Validar campos requeridos
    const { email_type, subject, html_content } = body;

    if (!email_type || !subject || !html_content) {
      return NextResponse.json(
        { error: 'Campos requeridos: email_type, subject, html_content' },
        { status: 400 }
      );
    }

    // Preparar datos para insertar
    const draftData: EmailDraftInsert = {
      email_type: body.email_type,
      sequence_step: body.sequence_step || null,
      subject: body.subject,
      preview_text: body.preview_text || null,
      html_content: body.html_content,
      plain_text_content: body.plain_text_content || null,
      source: body.source || 'manual',
      ai_prompt: body.ai_prompt || null,
      status: 'draft',
      scheduled_for: body.scheduled_for || null,
      target_audience: body.target_audience || { all: true },
    };

    const { data, error } = await supabase
      .from('email_drafts')
      // @ts-ignore - Supabase types not yet generated for new tables
      .insert(draftData)
      .select()
      .single();

    if (error) {
      console.error('[Admin/Emails] Error creando borrador:', error);
      return NextResponse.json(
        { error: 'Error creando borrador' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Borrador creado exitosamente',
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
