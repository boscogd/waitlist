import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '../../components/SiteHeader';
import ScrollProgress from '../../components/ScrollProgress';
import BackToTop from '../../components/BackToTop';
import SiteFooter from '../../components/sections/SiteFooter';
import NewsGrid, { TransparencyNote } from '../NewsGrid';
import {
  ACTUALIDAD_URL,
  editionPath,
  formatEditionDate,
  getEditionByDate,
  getEditions,
  getItemsByEdition,
  isEditionSlug,
} from '@/lib/news/queries';

// =====================================================
// ACTUALIDAD — página permanente de UNA edición semanal
// =====================================================
// /actualidad/2026-09-21 → las buenas noticias de esa semana, para siempre.
// Una edición ya publicada casi nunca cambia: revalidamos cada hora (y
// /api/news-publish revalida esta ruta si se republica esa fecha).
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ fecha: string }>;
}

function editionTitle(editionDate: string): string {
  return `Buenas noticias de la Iglesia: semana del ${formatEditionDate(editionDate)}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { fecha } = await params;
  if (!isEditionSlug(fecha)) return {};
  const edition = await getEditionByDate(fecha);
  if (!edition) return {};

  const title = editionTitle(fecha);
  const description =
    edition.intro?.slice(0, 155) ||
    `Actualidad católica de la semana del ${formatEditionDate(fecha)}: diez buenas noticias de la Iglesia en España, Latinoamérica y el Vaticano.`;
  const url = `${ACTUALIDAD_URL}/${fecha}`;

  return {
    // Absoluto: con el sufijo de marca del layout pasaba de 90 caracteres y
    // Google cortaba justo la fecha, que es lo que distingue a cada edición.
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'es_ES',
      url,
      siteName: 'Refugio en la Palabra',
      publishedTime: `${fecha}T07:00:00Z`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Refugio en la Palabra' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  };
}

export default async function EdicionPage({ params }: PageProps) {
  const { fecha } = await params;
  if (!isEditionSlug(fecha)) notFound();

  const edition = await getEditionByDate(fecha);
  if (!edition) notFound();

  const news = await getItemsByEdition(edition.id);
  if (news.length === 0) notFound();

  // Anterior / siguiente para navegar el archivo (y para que Google lo recorra).
  const editions = await getEditions();
  const index = editions.findIndex((e) => e.edition_date === fecha);
  const newer = index > 0 ? editions[index - 1] : null;
  const older = index >= 0 && index < editions.length - 1 ? editions[index + 1] : null;

  const url = `${ACTUALIDAD_URL}/${fecha}`;
  const title = editionTitle(fecha);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    url,
    inLanguage: 'es',
    datePublished: `${fecha}T07:00:00Z`,
    ...(edition.intro ? { description: edition.intro } : {}),
    isPartOf: { '@type': 'CollectionPage', name: 'Actualidad católica', url: ACTUALIDAD_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Refugio en la Palabra',
      url: 'https://www.refugioenlapalabra.com',
      logo: 'https://www.refugioenlapalabra.com/logo-refugio.png',
    },
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.refugioenlapalabra.com' },
      { '@type': 'ListItem', position: 2, name: 'Actualidad católica', item: ACTUALIDAD_URL },
      { '@type': 'ListItem', position: 3, name: `Semana del ${formatEditionDate(fecha)}`, item: url },
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
        <section className="px-6 pt-14 md:pt-20 pb-8">
          <div className="max-w-3xl mx-auto text-center">
            <nav aria-label="Migas de pan" className="text-sm text-texto/50 mb-4">
              <Link href="/actualidad" className="hover:text-azul transition-colors">
                Actualidad católica
              </Link>
              <span aria-hidden="true"> / </span>
              <Link href="/actualidad/archivo" className="hover:text-azul transition-colors">
                Archivo
              </Link>
            </nav>
            <span className="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider">
              Semana del <time dateTime={fecha}>{formatEditionDate(fecha)}</time>
            </span>
            <h1 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl md:text-5xl font-semibold text-azul mt-3 mb-5">
              Buenas noticias de la Iglesia
            </h1>
            <p className="text-lg text-texto/70 leading-relaxed">
              {edition.intro ||
                `Las ${news.length} historias de fe, esperanza y caridad que elegimos esa semana en España, Latinoamérica y el Vaticano. Cada resumen es nuestro; pulsa para leer la noticia completa en su medio original.`}
            </p>
          </div>
        </section>

        <section className="px-6 pb-16" aria-label="Noticias de la semana">
          <div className="max-w-6xl mx-auto">
            <NewsGrid news={news} />
            <TransparencyNote />
          </div>
        </section>

        {/* Navegación entre ediciones */}
        <nav aria-label="Otras semanas" className="px-6 pb-20">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            {older ? (
              <Link
                href={editionPath(older.edition_date)}
                rel="prev"
                className="text-azul hover:text-albero transition-colors"
              >
                <span aria-hidden="true">← </span>Semana del {formatEditionDate(older.edition_date)}
              </Link>
            ) : (
              <span />
            )}
            <Link
              href="/actualidad/archivo"
              className="font-medium text-azul hover:text-albero transition-colors"
            >
              Todo el archivo
            </Link>
            {newer ? (
              <Link
                href={editionPath(newer.edition_date)}
                rel="next"
                className="text-azul hover:text-albero transition-colors"
              >
                Semana del {formatEditionDate(newer.edition_date)}
                <span aria-hidden="true"> →</span>
              </Link>
            ) : (
              <Link href="/actualidad" className="text-azul hover:text-albero transition-colors">
                Noticias de esta semana<span aria-hidden="true"> →</span>
              </Link>
            )}
          </div>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
