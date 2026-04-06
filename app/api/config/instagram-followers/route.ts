import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Forzar que esta ruta sea dinámica y no se cachee estáticamente
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'instagram_followers')
      .single();

    if (error || !data) {
      // Fallback si no existe la tabla o el valor
      return NextResponse.json(
        { followers: 500 },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { followers: parseInt(data.value) || 500 },
      {
        status: 200,
        headers: {
          // Sin caché para que los cambios se reflejen inmediatamente
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Error obteniendo seguidores:', error);
    return NextResponse.json(
      { followers: 500 },
      { status: 200 }
    );
  }
}
