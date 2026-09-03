import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/api-auth';
import { getServiceClient } from '@/lib/supabase-admin';

// =====================================================
// GET /api/admin/analytics?days=7|30|90 — panel de analítica
// =====================================================
// Devuelve el JSON agregado de la RPC site_analytics() (ver
// supabase/analytics-schema.sql). La RPC solo la puede ejecutar
// service_role, de ahí que esta ruta use SUPABASE_SERVICE_ROLE_KEY.

export const dynamic = 'force-dynamic';

const ALLOWED_DAYS = new Set([7, 30, 90]);

export async function GET(request: Request) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const url = new URL(request.url);
  const daysParam = Number(url.searchParams.get('days') || 30);
  const days = ALLOWED_DAYS.has(daysParam) ? daysParam : 30;

  try {
    const sb = getServiceClient();
    const { data, error } = await sb.rpc('site_analytics', { p_days: days, p_recent: 40 });

    if (error) {
      // Mensaje legible cuando la RPC/tabla aún no existen.
      const missing = /could not find the function|does not exist/i.test(error.message);
      const message = missing
        ? 'La función site_analytics no existe todavía. Ejecuta supabase/analytics-schema.sql en el SQL Editor de Supabase.'
        : `Error leyendo analítica: ${error.message}`;
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error obteniendo analítica';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
