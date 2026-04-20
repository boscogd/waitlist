import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendCodeReminder } from '@/lib/resend';

interface WaitlistUser {
  id: string;
  email: string;
  name: string;
  code: string;
  code_used: boolean;
  unsubscribed: boolean;
}

/**
 * Endpoint para enviar recordatorios a usuarios de waitlist que no han usado su código.
 *
 * POST /api/remind-code
 * Headers: { "Authorization": "Bearer TU_ADMIN_SECRET_KEY" }
 * Body (opcional): { "testMode": true, "testEmail": "test@example.com" }
 */
export async function POST(request: Request) {
  try {
    // Verificar API key
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.ADMIN_SECRET_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key no configurada en el servidor' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros opcionales
    const body = await request.json().catch(() => ({}));
    const { testMode = false, testEmail = null, customSubject, customHtml } = body;

    // Si está en modo test, enviar a un email específico con datos de ejemplo
    if (testMode) {
      if (!testEmail) {
        return NextResponse.json(
          { error: 'testEmail es requerido en modo test' },
          { status: 400 }
        );
      }

      // Primero intentar buscar el usuario en la waitlist para usar sus datos reales
      const { data: testUser } = await supabase
        .from('waitlist')
        .select('*')
        .eq('email', testEmail)
        .single();

      // Si el usuario existe, usar sus datos reales; si no, usar datos de ejemplo
      const userData = testUser
        ? {
            email: testUser.email,
            name: testUser.name,
            code: testUser.code,
          }
        : {
            email: testEmail,
            name: 'Usuario de prueba',
            code: 'REFUGIO-TEST1',
          };

      const result = await sendCodeReminder(userData, customSubject, customHtml);

      return NextResponse.json({
        success: true,
        testMode: true,
        message: testUser
          ? 'Email de prueba enviado con tus datos reales de la waitlist'
          : 'Email de prueba enviado con datos de ejemplo',
        result,
        usedRealData: !!testUser,
      });
    }

    // Obtener usuarios que:
    // 1. No han usado su código (code_used = false)
    // 2. No se han dado de baja (unsubscribed = false)
    const { data: waitlistUsers, error } = await supabase
      .from('waitlist')
      .select('*')
      .eq('code_used', false)
      .eq('unsubscribed', false);

    if (error) {
      console.error('Error obteniendo usuarios de waitlist:', error);
      return NextResponse.json(
        { error: 'Error obteniendo usuarios de la waitlist' },
        { status: 500 }
      );
    }

    if (!waitlistUsers || waitlistUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay usuarios pendientes de recordatorio (todos han usado su código o se dieron de baja)',
        count: 0,
      });
    }

    const users = waitlistUsers as WaitlistUser[];

    // Enviar emails
    const results = {
      total: users.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: unknown }>,
    };

    for (const user of users) {
      const emailResult = await sendCodeReminder({
        email: user.email,
        name: user.name,
        code: user.code,
      }, customSubject, customHtml);

      if (emailResult.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({
          email: user.email,
          error: emailResult.error,
        });
      }

      // Pausa de 1 segundo para evitar límites de rate de Resend
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      message: 'Recordatorios de código enviados',
      results,
    });
  } catch (error) {
    console.error('Error en remind-code:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET para ver cuántos usuarios recibirían el recordatorio
 */
export async function GET(request: Request) {
  try {
    // Verificar API key
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.ADMIN_SECRET_KEY;

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Contar usuarios que recibirían el recordatorio (solo count, sin datos)
    const { count: pendingCount, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('code_used', false)
      .eq('unsubscribed', false);

    if (error) {
      return NextResponse.json(
        { error: 'Error consultando la base de datos' },
        { status: 500 }
      );
    }

    // Contar usuarios que ya usaron su código
    const { count: usedCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('code_used', true);

    // Contar usuarios dados de baja
    const { count: unsubscribedCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('unsubscribed', true);

    return NextResponse.json({
      success: true,
      summary: {
        pendingReminder: pendingCount || 0,
        alreadyUsedCode: usedCount || 0,
        unsubscribed: unsubscribedCount || 0,
      },
    });
  } catch (error) {
    console.error('Error en GET remind-code:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
