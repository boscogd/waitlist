import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import ScrollProgress from '../components/ScrollProgress';
import BackToTop from '../components/BackToTop';
import SiteFooter from '../components/sections/SiteFooter';
import NewsGrid, { TransparencyNote } from './NewsGrid';
import {
  ACTUALIDAD_URL,
  editionPath,
  formatDate,
  formatEditionDate,
  getLatest,
  latestCreatedAt,
} from '@/lib/news/queries';

// ISR: la tanda se renueva cada lunes (y /api/news-publish revalida esta
// ruta al publicar), así que la página se sirve cacheada y se revalida cada
// 15 minutos. Las consultas devuelven vacío si la tabla no existe.
export const revalidate = 900;

// SEO: el público católico busca "actualidad católica", "noticias católicas"
// o "noticias de la Iglesia". "Actualidad/noticias cristianas" es, en español,
// vocabulario del mundo evangélico y lo copan sus medios; lo mencionamos de
// forma natural, pero el foco es católico y nuestro ángulo: BUENAS noticias.
const SEO_TITLE = 'Actualidad católica: buenas noticias de la Iglesia | Refugio';
const SEO_DESCRIPTION =
  'Actualidad católica y cristiana en positivo: cada semana, buenas noticias de la Iglesia en España, Latinoamérica y el Vaticano, con enlace a la fuente.';

export const metadata: Metadata = {
  title: { absolute: SEO_TITLE },
  description: SEO_DESCRIPTION,
  keywords: [
    'actualidad católica',
    'noticias católicas',
    'buenas noticias de la Iglesia',
    'noticias de la Iglesia católica',
    'actualidad cristiana',
    'noticias católicas positivas',
    'noticias del Papa',
    'testimonios de fe',
  ],
  openGraph: {
    title: 'Actualidad católica: buenas noticias de la Iglesia',
    description: SEO_DESCRIPTION,
    type: 'website',
    locale: 'es_ES',
    url: ACTUALIDAD_URL,
    siteName: 'Refugio en la Palabra',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Refugio en la Palabra' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Actualidad católica: buenas noticias de la Iglesia',
    description: 'Cada semana, buenas noticias de la Iglesia en el mundo hispanohablante.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: ACTUALIDAD_URL },
};

export default async function ActualidadPage() {
  const { edition, items: news, previous } = await getLatest();
  const updatedAt = latestCreatedAt(news);

  // Structured data (JSON-LD): página de colección con la lista de noticias.
  // No marcamos las noticias como NewsArticle nuestras: son de sus medios;
  // aquí solo listamos nuestro resumen y el enlace al original.
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Actualidad católica: buenas noticias de la Iglesia',
    description: SEO_DESCRIPTION,
    url: ACTUALIDAD_URL,
    inLanguage: 'es',
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    isPartOf: {
      '@type': 'WebSite',
      name: 'Refugio en la Palabra',
      url: 'https://www.refugioenlapalabra.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Refugio en la Palabra',
      url: 'https://www.refugioenlapalabra.com',
      logo: 'https://www.refugioenlapalabra.com/logo-refugio.png',
    },
    about: ['Iglesia católica', 'Actualidad católica', 'Buenas noticias'],
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: news.length,
      itemListElement: news.map((n, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: n.title,
        description: n.summary,
        url: n.source_url,
      })),
    },
  };

  // Migas de pan (Inicio → Actualidad) para buscadores
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.refugioenlapalabra.com' },
      { '@type': 'ListItem', position: 2, name: 'Actualidad católica', item: ACTUALIDAD_URL },
    ],
  };

  return (
    <div className="min-h-screen bg-marfil flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ScrollProgress />
      <SiteHeader />
      <BackToTop />

      <main className="flex-1 pt-20">
        {/* Intro */}
        <section className="px-6 pt-14 md:pt-20 pb-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider">
              Actualidad católica
            </span>
            <h1 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl md:text-5xl font-semibold text-azul mt-3 mb-5">
              Buenas noticias de la Iglesia
            </h1>
            <p className="text-lg text-texto/70 leading-relaxed">
              La actualidad cristiana también tiene buenas noticias. Cada semana elegimos diez
              historias de fe, esperanza y caridad de España, Latinoamérica y el Vaticano. Cada
              resumen es nuestro; pulsa para leer la noticia completa en su medio original.
            </p>
            {edition?.intro && (
              <p className="text-base text-texto/80 leading-relaxed mt-5 italic">{edition.intro}</p>
            )}
            {updatedAt && (
              <p className="text-sm text-texto/50 mt-4">
                Actualizado el <time dateTime={updatedAt}>{formatDate(updatedAt)}</time> · se
                renueva cada lunes
                {edition && (
                  <>
                    {' · '}
                    <Link
                      href={editionPath(edition.edition_date)}
                      className="underline underline-offset-2 hover:text-azul transition-colors"
                    >
                      enlace permanente a esta semana
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>
        </section>

        {/* Noticias */}
        <section className="px-6 pb-16" aria-label="Noticias de la semana">
          <div className="max-w-6xl mx-auto">
            {news.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-2xl border border-azul/5 shadow-sm max-w-2xl mx-auto">
                <p className="text-texto/60 text-lg">
                  Estamos preparando las primeras noticias. Vuelve pronto. 🙏
                </p>
              </div>
            ) : (
              <NewsGrid news={news} />
            )}
            <TransparencyNote />
          </div>
        </section>

        {/* Semanas anteriores: enlaces internos al archivo */}
        {previous.length > 0 && (
          <section className="px-6 pb-16" aria-labelledby="semanas-anteriores">
            <div className="max-w-3xl mx-auto text-center">
              <h2
                id="semanas-anteriores"
                className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mb-6"
              >
                Buenas noticias de semanas anteriores
              </h2>
              <ul className="flex flex-wrap justify-center gap-3">
                {previous.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={editionPath(e.edition_date)}
                      className="inline-block bg-white border border-azul/10 rounded-full px-4 py-2 text-sm text-azul hover:border-albero hover:text-albero transition-colors"
                    >
                      Semana del {formatEditionDate(e.edition_date)}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6">
                <Link
                  href="/actualidad/archivo"
                  className="text-sm font-medium text-azul hover:text-albero transition-colors"
                >
                  Ver todo el archivo <span aria-hidden="true">→</span>
                </Link>
              </p>
            </div>
          </section>
        )}

        {/* Qué es esta sección: texto estable que explica el criterio editorial */}
        <section className="px-6 pb-20" aria-labelledby="sobre-actualidad">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-azul/5 shadow-sm p-8 md:p-12">
            <h2
              id="sobre-actualidad"
              className="font-[family-name:var(--font-lora)] text-2xl md:text-3xl font-semibold text-azul text-center mb-10"
            >
              Actualidad católica, contada de otra manera
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="font-semibold text-azul mb-2">Solo buenas noticias</h3>
                <p className="text-sm text-texto/70 leading-relaxed">
                  La mayoría de las noticias católicas que llegan a los titulares son polémicas. Aquí
                  recogemos lo otro, que también es verdad: testimonios de fe, obras de caridad,
                  vocaciones, santos, peregrinaciones y comunidades que siguen vivas.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-azul mb-2">Elegidas y leídas una a una</h3>
                <p className="text-sm text-texto/70 leading-relaxed">
                  Cada lunes repasamos medios como Vatican News, ACI Prensa, Alfa y Omega, Omnes,
                  Vida Nueva, Ecclesia, Aleteia o El Debate, leemos cada artículo y nos quedamos con
                  diez noticias de la Iglesia en España, Latinoamérica y el Vaticano.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-azul mb-2">Siempre con su fuente</h3>
                <p className="text-sm text-texto/70 leading-relaxed">
                  El titular y el resumen son nuestros; la noticia es del medio que la publicó. Por
                  eso cada tarjeta enlaza al artículo original, para que puedas leerlo completo y
                  apoyar a quien hace el trabajo de contarlo.
                </p>
              </div>
            </div>
            <div className="text-center mt-10">
              <p className="text-texto/70 mb-4">
                Y si además de leer buenas noticias quieres rezar cada día, Refugio en la Palabra
                es una app católica con Rosario guiado y el Evangelio del día.
              </p>
              <Link
                href="/descargar"
                className="inline-flex items-center gap-2 bg-azul text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-azul-800 hover:shadow-lg hover:shadow-azul/20 transition-all duration-300"
              >
                Conocer la app
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
