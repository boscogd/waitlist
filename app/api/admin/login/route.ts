import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Comparación constant-time para evitar timing attacks. Iguala longitudes
// antes de comparar para que timingSafeEqual no lance por buffers de
// distinto tamaño; si difieren en longitud, no hay match.
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  try {
    const { key } = await request.json();
    const adminKey = process.env.ADMIN_SECRET_KEY;

    if (!adminKey || typeof key !== 'string' || !safeEqual(key, adminKey)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Generar token de sesión (hash del secret + salt)
    const encoder = new TextEncoder();
    const data = encoder.encode(adminKey + '-refugio-admin-session');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 horas
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
