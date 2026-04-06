import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Forzar que esta ruta sea dinámica y no se cachee estáticamente
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Contar total
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    // Contar pendientes de notificar
    const { count: pendingCount, error: pendingError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('notified', false);

    if (error || pendingError) {
      console.error('Error contando waitlist:', error || pendingError);
      return NextResponse.json(
        { error: 'Error al obtener el conteo' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        count: count || 0,
        pendingNotification: pendingCount || 0
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Error en API waitlist count:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
