import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendLaunchNotification } from '@/lib/resend';
import type { WaitlistEntry } from '@/lib/types';

/**
 * Endpoint protegido para notificar a todos los usuarios de la waitlist
 * cuando se lance la aplicación.
 *
 * Requiere una API key en el header Authorization para seguridad.
 *
 * Uso:
 * POST /api/notify-launch
 * Headers: { "Authorization": "Bearer TU_API_KEY_SECRETA" }
 * Body (opcional): { "testMode": true, "testEmail": "test@example.com" }
 */
export async function POST(request: Request) {
  try {
    // Verificar API key
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.ADMIN_API_KEY;

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
    const { testMode = false, testEmail = null } = body;

    // Si está en modo test, solo enviar a un email específico
    if (testMode) {
      if (!testEmail) {
        return NextResponse.json(
          { error: 'testEmail es requerido en modo test' },
          { status: 400 }
        );
      }

      const { data: testUser, error: testError } = await supabase
        .from('waitlist')
        .select('*')
        .eq('email', testEmail)
        .single();

      if (testError || !testUser) {
        return NextResponse.json(
          { error: 'Email de prueba no encontrado en la waitlist' },
          { status: 404 }
        );
      }

      const result = await sendLaunchNotification({
        email: (testUser as WaitlistEntry).email,
        name: (testUser as WaitlistEntry).name,
        code: (testUser as WaitlistEntry).code,
      });

      return NextResponse.json({
        success: true,
        testMode: true,
        message: 'Email de prueba enviado',
        result,
      });
    }

    // Obtener todos los usuarios de la waitlist que no han sido notificados
    const { data: waitlistUsers, error } = await supabase
      .from('waitlist')
      .select('*')
      .eq('notified', false);

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
        message: 'No hay usuarios pendientes de notificar',
        count: 0,
      });
    }

    // Cast a tipo correcto
    const users = waitlistUsers as WaitlistEntry[];

    // Enviar emails a todos los usuarios
    const results = {
      total: users.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: unknown }>,
    };

    for (const user of users) {
      const emailResult = await sendLaunchNotification({
        email: user.email,
        name: user.name,
        code: user.code,
      });

      if (emailResult.success) {
        results.success++;

        // Marcar como notificado
        await supabase
          .from('waitlist')
          .update({ notified: true })
          .eq('id', user.id);
      } else {
        results.failed++;
        results.errors.push({
          email: user.email,
          error: emailResult.error,
        });
      }

      // Pequeña pausa para evitar límites de rate
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      message: 'Notificaciones de lanzamiento enviadas',
      results,
    });
  } catch (error) {
    console.error('Error en notify-launch:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
