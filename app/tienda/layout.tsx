import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import Link from 'next/link';
import SiteFooter from '../components/sections/SiteFooter';
import CabeceraTienda from './_componentes/CabeceraTienda';
import { CestaProvider } from './_componentes/Cesta';
import { leerExistencias } from '@/lib/tienda/existencias';
import './tienda.css';

// Titulares de la tienda: grotesca condensada y pesada, en mayúsculas.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth', 'opsz'],
  variable: '--font-bricolage',
  display: 'swap',
});

// Demo: fuera de Google hasta que la tienda sea real.
export const metadata: Metadata = {
  title: { default: 'Tienda', template: '%s · Tienda | Refugio en la Palabra' },
  robots: { index: false, follow: false },
};

// Con los pagos encendidos, lo que queda de los belenes se vuelve a leer como mucho cada minuto.
export const revalidate = 60;

export default async function TiendaLayout({ children }: { children: React.ReactNode }) {
  const existencias = await leerExistencias();
  return (
    <CestaProvider existencias={existencias}>
      <div className={`${bricolage.variable} bg-white text-texto`}>
        <CabeceraTienda />
        <main id="main">{children}</main>
        <p className="border-t border-black/[0.06] px-4 py-4 text-center text-xs text-texto/55">
          {process.env.NEXT_PUBLIC_TIENDA_PAGOS === '1' ? (
            <>
              Se venden de verdad los belenes de ganchillo (los envía la familia desde Sevilla), las camisetas y la sudadera (se
              fabrican al pedirlas, casi siempre en Barcelona). Lo demás (devoción y el polar) es de muestra y no se vende todavía.{' '}
              <Link href="/tienda/condiciones" className="underline underline-offset-2 hover:text-texto">
                Condiciones de venta
              </Link>
            </>
          ) : (
            'Demo de la tienda: dibujos, productos y precios de ejemplo. No se cobra nada.'
          )}
        </p>
      </div>
      <SiteFooter />
    </CestaProvider>
  );
}
