import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function hashToken(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key + '-refugio-admin-session');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('admin-session')?.value;
  const adminKey = process.env.ADMIN_SECRET_KEY;

  if (!adminKey || !sessionToken) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const expectedToken = await hashToken(adminKey);

  if (sessionToken !== expectedToken) {
    // Cookie inválida o expirada — redirigir al login
    const response = NextResponse.redirect(new URL('/admin', request.url));
    response.cookies.delete('admin-session');
    return response;
  }

  return NextResponse.next();
}

// Solo proteger sub-rutas de admin (emails, feedback, etc.)
// /admin en sí no se bloquea porque contiene el formulario de login
export const config = {
  matcher: ['/admin/:path+'],
};
