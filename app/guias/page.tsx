import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import ScrollProgress from '../components/ScrollProgress';
import BackToTop from '../components/BackToTop';
import SiteFooter from '../components/sections/SiteFooter';
import { SITE_URL } from '@/lib/constants';
import { guias } from '@/lib/content/guias';

// =====================================================
// GUÍAS DE ORACIÓN — índice
// =====================================================
// Contenido que no caduca y que responde a lo que la gente busca («cómo rezar
// el rosario»). Las guías viven en lib/content/guias.ts.

const PAGE_URL = `${SITE_URL}/guias`;
const DESCRIPTION =
  'Guías sencillas para rezar cada día: cómo rezar el Rosario, qué misterios tocan hoy, cómo hacer la Lectio Divina y cómo leer el Evangelio del día.';

export const metadata: Metadata = {
  title: 'Guías de oración católica, paso a paso',
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Guías de oración católica | Refugio en la Palabra',
    description: DESCRIPTION,
    type: 'website',
    locale: 'es_ES',
    url: PAGE_URL,
    siteName: 'Refugio en la Palabra',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Refugio en la Palabra' }],
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: 'Guías de oración católica',
    description: DESCRIPTION,
    inLanguage: 'es-ES',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: guias.length,
      itemListElement: guias.map((g, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: g.title,
        url: `${PAGE_URL}/${g.slug}`,
      })),
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guías de oración', item: PAGE_URL },
    ],
  },
];

export default function GuiasPage() {
  return (
    <div className="min-h-screen bg-marfil flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollProgress />
      <SiteHeader />
      <BackToTop />

      <main id="main" className="flex-1 pt-20">
        <section className="px-6 pt-14 md:pt-20 pb-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider">
              Guías de oración
            </p>
            <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl font-semibold text-azul leading-tight tracking-tight text-balance">
              Aprende a rezar, paso a paso
            </h1>
            <p className="text-lg text-texto/80 leading-relaxed">
              Explicaciones breves y claras de las oraciones de siempre, para quien empieza y para
              quien quiere retomarlas.
            </p>
          </div>
        </section>

        <section className="px-6 pb-20">
          <ul className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
            {guias.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guias/${g.slug}`}
                  className="group block h-full rounded-2xl bg-white border border-azul/10 p-6 shadow-sm hover:shadow-md hover:border-albero/60 transition-all"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-[#8a6d1f]">
                    {g.minutes} min de lectura
                  </p>
                  <h2 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul mt-2 group-hover:underline underline-offset-4 decoration-albero/60">
                    {g.title}
                  </h2>
                  <p className="text-sm text-texto/75 leading-relaxed mt-2">{g.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
