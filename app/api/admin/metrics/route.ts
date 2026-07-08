import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/api-auth';

// =====================================================
// GET /api/admin/metrics — panel de métricas de correo
// =====================================================
// Agrega los envíos de los últimos 7 días desde email_logs (por día y por
// status) y devuelve los embudos de win-back y recordatorio de código vía RPC.

export const dynamic = 'force-dynamic';

// Devuelve 'YYYY-MM-DD' (UTC) de una fecha ISO.
function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  // Autenticación admin (cookie httpOnly `admin-session` o Bearer legado).
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // Ventana de 7 días para los logs.
    const sinceIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: logs, error: logsError } = await (supabase as any)
      .from('email_logs')
      .select('status, sent_at')
      .gte('sent_at', sinceIso)
      .limit(5000);

    if (logsError) throw new Error(`Error leyendo email_logs: ${logsError.message}`);

    // Prepara el esqueleto de los 7 días (incluye hoy) con ceros, para que el
    // frontend siempre reciba una serie continua aunque falten envíos un día.
    const byDayMap = new Map<string, { date: string; sent: number; failed: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      byDayMap.set(key, { date: key, sent: 0, failed: 0 });
    }

    let sent7d = 0;
    let failed7d = 0;

    for (const row of (logs || []) as Array<{ status: string; sent_at: string }>) {
      const key = dayKey(row.sent_at);
      const bucket = byDayMap.get(key) || { date: key, sent: 0, failed: 0 };
      if (row.status === 'sent') {
        bucket.sent++;
        sent7d++;
      } else if (row.status === 'failed') {
        bucket.failed++;
        failed7d++;
      }
      byDayMap.set(key, bucket);
    }

    const byDay = Array.from(byDayMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Embudos de las campañas automáticas vía RPC (el cliente anon vale para
    // estas funciones). Si alguna falla, devolvemos null en vez de romper todo.
    const [winbackRes, codeReminderRes] = await Promise.all([
      supabase.rpc('winback_stats'),
      supabase.rpc('code_reminder_stats'),
    ]);

    return NextResponse.json({
      success: true,
      totals: { sent7d, failed7d },
      byDay,
      winback: winbackRes.error ? null : winbackRes.data,
      codeReminder: codeReminderRes.error ? null : codeReminderRes.data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error obteniendo métricas';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
