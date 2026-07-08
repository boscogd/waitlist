import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/api-auth';
import { getServiceClient } from '@/lib/supabase-admin';
import type { EmailTemplate } from '@/lib/types';

// La autenticación admin (cookie httpOnly `admin-session` o Bearer legado)
// vive en @/lib/api-auth para no duplicar código entre rutas.

// =====================================================
// GET /api/admin/templates - Listar plantillas
// =====================================================

export async function GET(request: Request) {
  try {
    if (!(await verifyAdminAuth(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const emailType = searchParams.get('email_type');
    const activeOnly = searchParams.get('active') === 'true';

    // Construir query
    let query = supabase
      .from('email_templates')
      .select('*');

    // Aplicar filtros
    if (emailType) {
      query = query.eq('email_type', emailType);
    }
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    // Ordenar por step de secuencia y luego por nombre
    query = query.order('sequence_step', { ascending: true, nullsFirst: false })
                 .order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('[Admin/Templates] Error listando plantillas:', error);
      return NextResponse.json(
        { error: 'Error obteniendo plantillas' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as EmailTemplate[],
    });
  } catch (error) {
    console.error('[Admin/Templates] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/admin/templates - Editar una plantilla existente
// =====================================================
// Escribe subject/preview_text/html_content de la plantilla identificada por
// template_key. La escritura usa service-role (se salta RLS de forma
// controlada, solo en servidor). Valida que la template_key exista.

export async function PUT(request: Request) {
  try {
    if (!(await verifyAdminAuth(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      template_key?: string;
      subject?: string;
      preview_text?: string;
      html_content?: string;
    };

    const templateKey = (body.template_key || '').trim();
    if (!templateKey) {
      return NextResponse.json(
        { success: false, error: 'template_key es obligatorio' },
        { status: 400 }
      );
    }

    // Cliente service-role para la escritura (400 legible si falta la key).
    let client;
    try {
      client = getServiceClient();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'SUPABASE_SERVICE_ROLE_KEY no configurada';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    // Validar que la plantilla exista antes de intentar actualizarla.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: findError } = await (client as any)
      .from('email_templates')
      .select('id')
      .eq('template_key', templateKey)
      .maybeSingle();

    if (findError) {
      console.error('[Admin/Templates] Error buscando plantilla:', findError);
      return NextResponse.json(
        { success: false, error: 'Error buscando la plantilla' },
        { status: 500 }
      );
    }
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `No existe la plantilla ${templateKey}` },
        { status: 404 }
      );
    }

    const { data, error } = await (client as any)
      .from('email_templates')
      .update({
        subject: body.subject,
        preview_text: body.preview_text,
        html_content: body.html_content,
        updated_at: new Date().toISOString(),
      })
      .eq('template_key', templateKey)
      .select()
      .single();

    if (error) {
      console.error('[Admin/Templates] Error actualizando plantilla:', error);
      return NextResponse.json(
        { success: false, error: 'Error actualizando la plantilla' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, template: data as EmailTemplate });
  } catch (error) {
    console.error('[Admin/Templates] Error PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
