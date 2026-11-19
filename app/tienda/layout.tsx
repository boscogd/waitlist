import type { Metadata } from 'next';
import SiteFooter from '../components/sections/SiteFooter';
import CabeceraTienda from './_componentes/CabeceraTienda';
import { CestaProvider } from './_componentes/Cesta';

// Demo: fuera de Google hasta que la tienda sea real.
export const metadata: Metadata = {
  title: { default: 'Tienda', template: '%s · Tienda | Refugio en la Palabra' },
  robots: { index: false, follow: false },
};

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <CestaProvider>
      <div className="bg-white text-texto">
        <CabeceraTienda />
        <main id="main">{children}</main>
        <p className="border-t border-black/[0.06] px-4 py-4 text-center text-xs text-texto/55">
          Demo de la tienda: fotos de muestra de Unsplash, productos y precios de ejemplo. No se cobra nada.
        </p>
      </div>
      <SiteFooter />
    </CestaProvider>
  );
}
