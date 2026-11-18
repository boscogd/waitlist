import type { Metadata } from 'next';
import SiteFooter from '../components/sections/SiteFooter';
import CabeceraTienda from './_componentes/CabeceraTienda';
import { CestaProvider } from './_componentes/Cesta';
import { TiendaDefs } from './_componentes/ProductoArte';

// Demo: fuera de Google hasta que la tienda sea real.
export const metadata: Metadata = {
  title: { default: 'Tienda', template: '%s · Tienda | Refugio en la Palabra' },
  robots: { index: false, follow: false },
};

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <CestaProvider>
      <TiendaDefs />
      <CabeceraTienda />
      <main id="main">{children}</main>
      <SiteFooter />
    </CestaProvider>
  );
}
