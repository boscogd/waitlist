import Link from 'next/link';
import { PLAY_URL } from '@/lib/constants';

// =====================================================
// Botones de descarga: Google Play (Android) + iPhone y ordenador
// =====================================================
// Android → ficha de Google Play. iPhone y ordenador → /descargar, donde se
// explica cómo instalarla desde el navegador (aún no está en la App Store).
// `where` etiqueta los clics en la analítica propia (data-track).

function PlayLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#4285F4" d="M3.6 1.8 13.8 12 3.6 22.2c-.4-.4-.6-1-.6-1.6V3.4c0-.6.2-1.2.6-1.6Z" />
      <path fill="#34A853" d="M3.6 1.8c.5-.3 1.1-.3 1.7 0l11.8 7.1-3.3 3.1Z" />
      <path fill="#EA4335" d="M3.6 22.2 13.8 12l3.3 3.1-11.8 7.1c-.6.3-1.2.3-1.7 0Z" />
      <path fill="#FBBC04" d="M17.1 8.9 20.6 11c.7.4.7 1.6 0 2l-3.5 2.1-3.3-3.1Z" />
    </svg>
  );
}

export function GooglePlayBadge({ where, className = '' }: { where: string; className?: string }) {
  return (
    <a
      href={PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-track="play_click"
      data-track-where={where}
      aria-label="Descargar Refugio en la Palabra en Google Play"
      className={`group inline-flex min-w-[12.5rem] items-center gap-3 rounded-xl bg-black px-5 py-2.5 text-white ring-1 ring-white/15 shadow-lg shadow-black/10 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <PlayLogo className="h-7 w-7 shrink-0" />
      <span className="flex flex-col items-start leading-none whitespace-nowrap">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/80">Disponible en</span>
        <span className="mt-1 text-xl font-semibold tracking-tight">Google Play</span>
      </span>
    </a>
  );
}

// Icono neutro (móvil + flecha), no el de Apple: en iPhone NO se instala
// desde la App Store y no queremos que lo parezca.
function DeviceIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" className={className}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path strokeLinecap="round" d="M10.5 18.5h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v6m0 0-2.5-2.5M12 13l2.5-2.5" />
    </svg>
  );
}

export function IphoneButton({ where, className = '' }: { where: string; className?: string }) {
  return (
    <Link
      href="/descargar?plataforma=iphone"
      data-track="cta_click"
      data-track-where={where}
      data-track-platform="ios"
      className={`group inline-flex min-w-[12.5rem] items-center gap-3 rounded-xl bg-white px-5 py-2.5 text-azul ring-1 ring-azul/15 shadow-sm hover:-translate-y-0.5 hover:ring-azul/30 hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <DeviceIcon className="h-7 w-7 shrink-0" />
      <span className="flex flex-col items-start leading-none whitespace-nowrap">
        <span className="text-[10px] font-medium uppercase tracking-wider text-texto/60">Instálala en</span>
        <span className="mt-1 text-xl font-semibold tracking-tight">iPhone y PC</span>
      </span>
    </Link>
  );
}

export default function StoreButtons({
  where,
  align = 'center',
}: {
  where: string;
  align?: 'center' | 'start';
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${
        align === 'start' ? 'justify-center lg:justify-start' : 'justify-center'
      }`}
    >
      <GooglePlayBadge where={where} />
      <IphoneButton where={where} />
    </div>
  );
}
