import Image from 'next/image';
import Link from 'next/link';
import { BotonCesta } from './Cesta';

const SECCIONES = [
  { href: '/tienda#belenes', texto: 'Belenes' },
  { href: '/tienda#devocion', texto: 'Devoción' },
  { href: '/tienda#ropa', texto: 'Ropa' },
  { href: '/tienda#encargos', texto: 'Para grupos' },
];

export default function CabeceraTienda() {
  return (
    <>
      <div className="bg-azul-800 px-4 py-2 text-center text-[13px] text-white/90">
        Envío gratis desde 60 € · Para Navidad, pide antes del 10 de diciembre
        <span className="ml-2 rounded-[3px] bg-white/15 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">Demo</span>
      </div>
      <header
        className="sticky z-50 border-b border-black/[0.08] bg-white/95 backdrop-blur-md"
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/tienda" className="flex items-center gap-2.5" aria-label="Tienda de Refugio en la Palabra, inicio">
            <Image src="/brand/rp-mark.png" alt="" width={28} height={31} className="object-contain" />
            <span className="text-[17px] font-semibold tracking-tight text-azul">
              Refugio <span className="font-normal text-texto/55">Tienda</span>
            </span>
          </Link>
          <nav aria-label="Secciones de la tienda" className="hidden items-center gap-8 md:flex">
            {SECCIONES.map((s) => (
              <Link key={s.href} href={s.href} className="text-[15px] text-texto/80 transition-colors hover:text-texto">
                {s.texto}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <Link href="/" className="hidden text-sm text-texto/60 hover:text-texto lg:inline">
              Ir a la app
            </Link>
            <BotonCesta />
          </div>
        </div>
        <nav aria-label="Secciones de la tienda" className="flex gap-6 overflow-x-auto border-t border-black/[0.05] px-4 md:hidden">
          {SECCIONES.map((s) => (
            <Link key={s.href} href={s.href} className="whitespace-nowrap py-2.5 text-sm text-texto/80">
              {s.texto}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
