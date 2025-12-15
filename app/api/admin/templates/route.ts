import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { EmailTemplate } from '@/lib/types';

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
// GET /api/admin/templates - Listar plantillas
// =====================================================

export async function GET(request: Request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.error?.includes('configurada') ? 500 : 401 });
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
