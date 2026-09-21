import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import ScrollProgress from '../../components/ScrollProgress';
import BackToTop from '../../components/BackToTop';
import SiteFooter from '../../components/sections/SiteFooter';
import {
  ACTUALIDAD_URL,
  editionPath,
  formatEditionDate,
  getEditions,
} from '@/lib/news/queries';

// =====================================================
// ACTUALIDAD — índice de todas las ediciones semanales
// =====================================================
export const revalidate = 3600;

const ARCHIVE_URL = `${ACTUALIDAD_URL}/archivo`;
const DESCRIPTION =
  'Archivo de buenas noticias de la Iglesia católica, semana a semana: testimonios de fe, obras de caridad y esperanza en España, Latinoamérica y el Vaticano.';

export async function generateMetadata(): Promise<Metadata> {
  // Mientras no haya ediciones (SQL sin ejecutar) la página está vacía:
  // que Google no la indexe hasta que tenga contenido.
  const hasEditions = (await getEditions(1)).length > 0;
  return {
    title: 'Archivo de buenas noticias de la Iglesia',
    description: DESCRIPTION,
    alternates: { canonical: ARCHIVE_URL },
    ...(hasEditions ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title: 'Archivo de buenas noticias de la Iglesia',
      description: DESCRIPTION,
      type: 'website',
      locale: 'es_ES',
      url: ARCHIVE_URL,
      siteName: 'Refugio en la Palabra',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Refugio en la Palabra' }],
    },
  };
}

// "septiembre de 2026" para agrupar las ediciones por mes.
function monthLabel(editionDate: string): string {
  return new Date(`${editionDate}T12:00:00Z`).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  });
}

export default async function ArchivoPage() {
  const editions = await getEditions();

  const groups: { label: string; editions: typeof editions }[] = [];
  for (const e of editions) {
    const label = monthLabel(e.edition_date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.editions.push(e);
    else groups.push({ label, editions: [e] });
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.refugioenlapalabra.com' },
      { '@type': 'ListItem', position: 2, name: 'Actualidad católica', item: ACTUALIDAD_URL },
      { '@type': 'ListItem', position: 3, name: 'Archivo', item: ARCHIVE_URL },
    ],
  };

  return (
    <div className="min-h-screen bg-marfil flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ScrollProgress />
      <SiteHeader />
      <BackToTop />

      <main className="flex-1 pt-20">
        <section className="px-6 pt-14 md:pt-20 pb-10">
          <div className="max-w-3xl mx-auto text-center">
            <nav aria-label="Migas de pan" className="text-sm text-texto/50 mb-4">
              <Link href="/actualidad" className="hover:text-azul transition-colors">
                Actualidad católica
              </Link>
              <span aria-hidden="true"> / </span>
              <span>Archivo</span>
            </nav>
            <h1 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl md:text-5xl font-semibold text-azul mb-5">
              Archivo de buenas noticias
            </h1>
            <p className="text-lg text-texto/70 leading-relaxed">
              Todas las semanas de buenas noticias de la Iglesia que hemos publicado. Las malas
              noticias caducan pronto; estas merece la pena volver a leerlas.
            </p>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="max-w-3xl mx-auto">
            {groups.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-2xl border border-azul/5 shadow-sm">
                <p className="text-texto/60 text-lg mb-4">
                  El archivo empieza a llenarse esta semana.
                </p>
                <Link href="/actualidad" className="font-medium text-azul hover:text-albero transition-colors">
                  Ver las noticias de esta semana <span aria-hidden="true">→</span>
                </Link>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="mb-10">
                  <h2 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul capitalize mb-4">
                    {group.label}
                  </h2>
                  <ul className="space-y-3">
                    {group.editions.map((e) => (
                      <li key={e.id}>
                        <Link
                          href={editionPath(e.edition_date)}
                          className="hover-lift block bg-white rounded-2xl p-5 border border-azul/5 shadow-sm"
                        >
                          <span className="font-semibold text-azul">
                            Semana del{' '}
                            <time dateTime={e.edition_date}>{formatEditionDate(e.edition_date)}</time>
                          </span>
                          {e.intro && (
                            <span className="block text-sm text-texto/70 leading-relaxed mt-1.5">
                              {e.intro}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
