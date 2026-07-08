import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/api-auth';
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
