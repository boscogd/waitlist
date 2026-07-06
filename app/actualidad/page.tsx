import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import SiteHeader from '../components/SiteHeader';
import ScrollProgress from '../components/ScrollProgress';
import BackToTop from '../components/BackToTop';
import AnimateOnScroll from '../components/AnimateOnScroll';
import SiteFooter from '../components/sections/SiteFooter';

// ISR: las noticias se curan on-demand, así que la página se sirve cacheada
// y se revalida cada 15 minutos. El try/catch de getNews() ya protege el
// build si la tabla todavía no existe.
export const revalidate = 900;

export const metadata: Metadata = {
  title: 'Actualidad — Buenas noticias de la Iglesia',
  description:
    'Buenas noticias y testimonios de esperanza de la Iglesia católica en el mundo hispanohablante. Resúmenes cuidados, con enlace a la fuente original.',
  openGraph: {
    title: 'Actualidad | Refugio en la Palabra',
    description:
      'Buenas noticias y testimonios de esperanza de la Iglesia en el mundo hispanohablante.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://www.refugioenlapalabra.com/actualidad',
    siteName: 'Refugio en la Palabra',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Refugio en la Palabra' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Actualidad | Refugio en la Palabra',
    description: 'Buenas noticias de la Iglesia en el mundo hispanohablante.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://www.refugioenlapalabra.com/actualidad' },
};

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  country: string | null;
  published_at: string | null;
}

async function getNews(): Promise<NewsItem[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('news_items')
      .select('id, title, summary, source_name, source_url, country, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(40);
    if (error) return [];
    return (data as NewsItem[]) || [];
  } catch {
    return [];
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function ActualidadPage() {
  const news = await getNews();

  // Structured data (JSON-LD): página de colección con la lista de noticias
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Actualidad — Buenas noticias de la Iglesia',
    url: 'https://www.refugioenlapalabra.com/actualidad',
    inLanguage: 'es',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: news.map((n, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: n.title,
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
      { '@type': 'ListItem', position: 2, name: 'Actualidad', item: 'https://www.refugioenlapalabra.com/actualidad' },
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
              Actualidad
            </span>
            <h1 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl md:text-5xl font-semibold text-azul mt-3 mb-5">
              Buenas noticias de la Iglesia
            </h1>
            <p className="text-lg text-texto/70 leading-relaxed">
              Historias de fe, esperanza y caridad de todo el mundo hispanohablante. Cada resumen
              es nuestro; pulsa para leer la noticia completa en su medio original.
            </p>
          </div>
        </section>

        {/* Noticias */}
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            {news.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-2xl border border-azul/5 shadow-sm max-w-2xl mx-auto">
                <p className="text-texto/60 text-lg">
                  Estamos preparando las primeras noticias. Vuelve pronto. 🙏
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {news.map((n, i) => (
                  <AnimateOnScroll key={n.id} delay={(i % 3) * 80} className="h-full">
                    <article className="hover-lift h-full bg-white rounded-2xl p-6 border border-azul/5 shadow-sm flex flex-col">
                      <div className="flex items-center gap-2 mb-4 text-xs">
                        {n.country && (
                          <span className="bg-albero/15 text-azul px-2.5 py-1 rounded-full font-medium">
                            {n.country}
                          </span>
                        )}
                        {n.published_at && (
                          <span className="text-texto/40">{formatDate(n.published_at)}</span>
                        )}
                      </div>

                      <h2 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul leading-snug mb-3">
                        {n.title}
                      </h2>

                      <p className="text-texto/80 text-sm leading-relaxed mb-5 flex-1">
                        {n.summary}
                      </p>

                      <a
                        href={n.source_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-azul hover:text-albero transition-colors mt-auto"
                      >
                        Leer en {n.source_name}
                        <span aria-hidden="true">→</span>
                      </a>
                    </article>
                  </AnimateOnScroll>
                ))}
              </div>
            )}

            {/* Nota de transparencia */}
            <p className="text-center text-xs text-texto/40 mt-14 max-w-2xl mx-auto leading-relaxed">
              Los titulares pertenecen a sus respectivos medios. Ofrecemos un resumen propio con
              enlace al original; no reproducimos los artículos completos.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
