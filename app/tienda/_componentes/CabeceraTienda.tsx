import Link from 'next/link';
import { BotonCesta } from './Cesta';

const SECCIONES = [
  { href: '/tienda#reparto', texto: 'Belenes' },
  { href: '/tienda#devocion', texto: 'Devoción' },
  { href: '/tienda#ropa', texto: 'Ropa' },
  { href: '/tienda#encargos', texto: 'Grupos' },
];

export default function CabeceraTienda() {
  return (
    <header
      className="sticky z-50 border-b-2 border-azul bg-white"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-10">
        <Link href="/tienda" className="flex items-baseline gap-2 text-azul" aria-label="Tienda de Refugio en la Palabra, inicio">
          <span className="tienda-titular text-[2rem] leading-none">Refugio</span>
          <span className="text-xs font-bold uppercase tracking-[0.14em]">Tienda</span>
          <span className="ml-1 self-center bg-azul px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Demo</span>
        </Link>
        <nav aria-label="Secciones de la tienda" className="hidden items-center gap-8 md:flex">
          {SECCIONES.map((s) => (
            <Link key={s.href} href={s.href} className="text-sm font-bold uppercase tracking-[0.08em] text-azul hover:underline hover:underline-offset-4">
              {s.texto}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <Link href="/" className="hidden text-sm font-semibold text-azul/70 hover:text-azul lg:inline">
            Ir a la app
          </Link>
          <BotonCesta />
        </div>
      </div>
      <nav aria-label="Secciones de la tienda" className="flex gap-6 overflow-x-auto border-t border-azul/15 px-4 md:hidden">
        {SECCIONES.map((s) => (
          <Link key={s.href} href={s.href} className="whitespace-nowrap py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-azul">
            {s.texto}
          </Link>
        ))}
      </nav>
    </header>
  );
}
