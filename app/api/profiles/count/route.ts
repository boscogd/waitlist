import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Forzar que esta ruta sea dinámica y no se cachee estáticamente
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Usa la función RPC `profiles_count` definida en Supabase con
    // SECURITY DEFINER. Así podemos contar filas de `profiles` sin
    // exponer sus datos y sin necesidad de service_role key.
    const { data, error } = await supabase.rpc('profiles_count');

    if (error) {
      console.error('Error contando profiles:', error);
      return NextResponse.json(
        { error: 'Error al obtener el conteo' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { count: typeof data === 'number' ? data : 0 },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error en API profiles count:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
