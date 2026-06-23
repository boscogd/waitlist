import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// =====================================================
// POST /api/code/mark-used
// =====================================================
// La APP llama a este endpoint cuando un usuario CANJEA su código,
// para sacarlo de la secuencia de recordatorios y registrar el canje.
//
// Body: { "code": "REFUGIO-XXXXX" }
// Header: Authorization: Bearer <ADMIN_SECRET_KEY o CODE_REDEEM_SECRET>
//
// Alternativa: la app puede llamar directamente al RPC de Supabase:
//   supabase.rpc('mark_code_used', { p_code })

function authorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const secrets = [process.env.CODE_REDEEM_SECRET, process.env.ADMIN_SECRET_KEY].filter(
    Boolean
  );
  return secrets.some((s) => authHeader === `Bearer ${s}`);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let code: unknown;
  try {
    ({ code } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  if (typeof code !== 'string' || !code.trim()) {
    return NextResponse.json({ error: 'code es requerido' }, { status: 400 });
  }

  // @ts-ignore - RPC types not generated for code-reminder functions
  const { data, error } = await supabase.rpc('mark_code_used', {
    p_code: code.trim(),
  });

  if (error) {
    console.error('[mark-used] Error:', error);
    return NextResponse.json({ error: 'Error marcando el código' }, { status: 500 });
  }

  // data === true si encontró el código; false si no existe
  return NextResponse.json({ success: true, found: data === true });
}
