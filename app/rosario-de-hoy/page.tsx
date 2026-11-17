import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import ScrollProgress from '../components/ScrollProgress';
import BackToTop from '../components/BackToTop';
import SiteFooter from '../components/sections/SiteFooter';
import StoreButtons from '../components/StoreButtons';
import RosarioHoy from '../components/RosarioHoy';
import { SITE_URL } from '@/lib/constants';
import { ROSARIO_FAQS, hoyRosario } from '@/lib/content/rosario';

// =====================================================
// ROSARIO DE HOY
// =====================================================
// Responde a una sola búsqueda: «qué misterios se rezan hoy». Se escribe en
// cada visita con la fecha de Madrid, y no desde una copia guardada: una copia
// podría servir el día de ayer a la primera visita tras medianoche, que bien
// puede ser la de Google. El componente RosarioHoy la ajusta en el navegador a
// la fecha de quien lee. Los textos y el reparto están en lib/content/rosario.ts.
export const dynamic = 'force-dynamic';

const PAGE_URL = `${SITE_URL}/rosario-de-hoy`;
// Título y descripción fijos a propósito: Google tarda días en refrescarlos y
// un «hoy, viernes» en el resultado sería falso seis días de cada siete.
const TITLE = 'Rosario de hoy: qué misterios se rezan hoy';
const DESCRIPTION =
  'Qué misterios del Santo Rosario tocan hoy, con los cinco misterios del día, explicados y con su cita. Y el reparto de toda la semana: gozosos, luminosos, dolorosos y gloriosos.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    locale: 'es_ES',
    url: PAGE_URL,
    siteName: 'Refugio en la Palabra',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Refugio en la Palabra' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: 'es-ES',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ROSARIO_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Rosario de hoy', item: PAGE_URL },
    ],
  },
];

const h2Class = 'font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mb-4';
const linkClass =
  'font-medium text-azul underline underline-offset-4 decoration-albero/60 hover:decoration-azul transition-colors';

export default function RosarioDeHoyPage() {
  const hoy = hoyRosario(new Date(), 'Europe/Madrid');

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
        <article className="px-6 pt-10 md:pt-14 pb-16">
          <div className="max-w-2xl mx-auto">
            <nav aria-label="Migas de pan" className="text-sm text-texto/70 mb-6">
              <Link href="/" className="hover:text-azul transition-colors">Inicio</Link>
              <span aria-hidden="true" className="mx-2">/</span>
              <Link href="/guias" className="hover:text-azul transition-colors">Guías de oración</Link>
            </nav>

            <h1 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul leading-tight tracking-tight text-balance mb-8">
              Rosario de hoy: qué misterios se rezan
            </h1>

            <RosarioHoy inicial={hoy} />

            <aside className="mt-12 rounded-2xl bg-azul text-white p-6 sm:p-8 space-y-4">
              <h2 className="font-[family-name:var(--font-lora)] text-xl font-semibold">
                Rézalo con Refugio en la Palabra
              </h2>
              <p className="text-white/85 leading-relaxed">
                En la app tienes el Rosario guiado con audio: eliges los misterios y la voz te
                acompaña en cada uno. Rezar con ella es gratis y no tiene anuncios.
              </p>
              <StoreButtons where="rosario-de-hoy" align="start" />
            </aside>

            <section className="mt-12">
              <h2 className={h2Class}>Preguntas frecuentes</h2>
              <dl className="divide-y divide-azul/10 border-y border-azul/10">
                {ROSARIO_FAQS.map((f) => (
                  <div key={f.question} className="py-5">
                    <dt className="font-semibold text-azul">{f.question}</dt>
                    <dd className="text-texto/85 leading-relaxed mt-2">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-12">
              <h2 className={h2Class}>Para seguir</h2>
              <ul className="space-y-3">
                <li>
                  <Link href="/guias/como-rezar-el-rosario" className={linkClass}>
                    Cómo rezar el Rosario paso a paso
                  </Link>
                </li>
                <li>
                  <Link href="/guias/misterios-del-rosario-por-dia" className={linkClass}>
                    Los veinte misterios del Rosario, grupo por grupo
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
