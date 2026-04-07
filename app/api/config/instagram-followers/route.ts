import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Forzar que esta ruta sea dinámica y no se cachee estáticamente
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Usa la función RPC `get_instagram_followers` definida en Supabase
    // con SECURITY DEFINER para saltarse RLS de la tabla config.
    const { data, error } = await supabase.rpc('get_instagram_followers');

    if (error || data === null) {
      console.error('Error obteniendo seguidores:', error);
      return NextResponse.json(
        { followers: 500 },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { followers: typeof data === 'number' ? data : 500 },
      {
        status: 200,
        headers: {
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
