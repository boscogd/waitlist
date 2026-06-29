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
    // Política CSP en modo BLOQUEANTE. Permite el inline que necesita Next
    // (JSON-LD, estilos inline) y las conexiones a Supabase y Resend. El
    // siguiente nivel de endurecimiento sería sustituir 'unsafe-inline' por
    // nonces/hashes.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.resend.com",
      "media-src 'self'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    // Bloqueante SOLO en producción. En preview/local va en modo solo-reporte
    // para no chocar con la barra de Vercel (vercel.live) ni con herramientas
    // de desarrollo.
    const cspHeaderKey =
      process.env.VERCEL_ENV === 'production'
        ? 'Content-Security-Policy'
        : 'Content-Security-Policy-Report-Only';

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
          { key: cspHeaderKey, value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
