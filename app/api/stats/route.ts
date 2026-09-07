import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Cifras públicas de la home. Todas salen de RPCs SECURITY DEFINER (no exponen
// filas, solo recuentos) y ninguna es obligatoria: si una falla, va como null
// y la franja simplemente no pinta ese dato.
export const dynamic = 'force-dynamic';

interface RpcResult {
  data: unknown;
  error: unknown;
}

// El tipo `Database` no declara `Functions`, así que el cliente tipado no
// conoce estos nombres. Llamamos a rpc por nombre y validamos el resultado.
const rpc = (fn: string): PromiseLike<RpcResult> =>
  (supabase.rpc as unknown as (name: string) => PromiseLike<RpcResult>)(fn);

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

export async function GET() {
  const [people, followers, extra] = await Promise.all([
    rpc('profiles_count'),
    rpc('get_instagram_followers'),
    // Definida en supabase/landing-stats-function.sql. Opcional.
    rpc('landing_stats'),
  ]);

  const ex: Record<string, unknown> =
    !extra.error && extra.data && typeof extra.data === 'object'
      ? (extra.data as Record<string, unknown>)
      : {};

  return NextResponse.json(
    {
      people: num(people.data),
      followers: num(followers.data),
      rosaries: num(ex.rosaries),
      achievements: num(ex.achievements),
      communities: num(ex.communities),
    },
    {
      headers: {
        // 5 min en el edge de Vercel: suficiente frescura, cero carga en Supabase.
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
      },
    }
  );
}
