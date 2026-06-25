import type { NextConfig } from "next";

// La clave `eslint` es válida en runtime (Next 16 la sigue leyendo) pero ya
// no está declarada en el tipo `NextConfig`. La añadimos vía intersección para
// conservar el chequeo de tipos del resto de la config sin un cast amplio.
const nextConfig: NextConfig & {
  eslint?: { ignoreDuringBuilds?: boolean };
} = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tipado limpio (tsc --noEmit pasa): el build vigila regresiones de tipos.
    ignoreBuildErrors: false,
  },
  async headers() {
    // Política CSP en modo SOLO-REPORTE: el navegador reporta violaciones
    // pero NO bloquea nada, así que no puede romper Next. Permite el inline
    // necesario (JSON-LD, estilos inline de Next) y las conexiones a Supabase
    // y Resend. Cuando se confirme que no genera falsos positivos, se puede
    // migrar a `Content-Security-Policy` (enforcing) en otra iteración.
    const cspReportOnly = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.resend.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
        ],
      },
    ];
  },
};

export default nextConfig;
