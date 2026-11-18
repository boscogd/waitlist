import Image from 'next/image';
import Link from 'next/link';
import { BotonCesta } from './Cesta';

const SECCIONES = [
  { href: '/tienda#hecho-en-casa', texto: 'Hecho en casa' },
  { href: '/tienda#ropa', texto: 'Ropa' },
  { href: '/tienda#encargos', texto: 'Encargos para grupos' },
];

export default function CabeceraTienda() {
  return (
    <>
      <p className="bg-azul-800 px-4 py-2 text-center text-[13px] text-white/85">
        <strong className="font-semibold text-albero">Demo de la tienda.</strong> Productos, dibujos y precios de ejemplo: no se cobra nada.
      </p>
      <header
        className="sticky z-50 border-b border-azul/10 bg-marfil/95 backdrop-blur-md"
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/tienda" className="flex items-center gap-3" aria-label="Tienda de Refugio en la Palabra, inicio">
            <Image src="/brand/rp-mark.png" alt="" width={34} height={38} className="object-contain" />
            <span className="leading-none">
              <span className="block font-[family-name:var(--font-lora)] text-lg font-semibold text-azul">Refugio</span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-azul/55">Tienda</span>
            </span>
          </Link>
          <nav aria-label="Secciones de la tienda" className="hidden items-center gap-7 md:flex">
            {SECCIONES.map((s) => (
              <Link key={s.href} href={s.href} className="text-sm text-texto/75 transition-colors hover:text-azul">
                {s.texto}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="hidden text-sm text-texto/60 hover:text-azul lg:inline">
              Volver a la app
            </Link>
            <BotonCesta />
          </div>
        </div>
        <nav aria-label="Secciones de la tienda" className="flex gap-5 overflow-x-auto border-t border-azul/5 px-4 py-2 md:hidden">
          {SECCIONES.map((s) => (
            <Link key={s.href} href={s.href} className="whitespace-nowrap py-1 text-sm text-texto/75">
              {s.texto}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
