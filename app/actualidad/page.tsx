import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

// Render dinámico: leemos las noticias frescas en cada visita y evitamos
// prerender en build (la tabla podría no existir todavía).
export const dynamic = 'force-dynamic';

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

  return (
    <div className="min-h-screen bg-marfil">
      {/* Header */}
      <header className="bg-white border-b border-azul/10 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-azul hover:text-azul-800 transition-colors"
          >
            <Image src="/logo-512-1.png" alt="Refugio en la Palabra" width={36} height={36} className="object-contain" />
            <span className="font-[family-name:var(--font-lora)] text-lg font-semibold hidden sm:block">
              Refugio en la Palabra
            </span>
          </Link>
          <Link
            href="/descargar"
            className="bg-azul text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-azul-800 transition-colors shadow-sm"
          >
            Instalar gratis
          </Link>
        </div>
      </header>

      {/* Intro */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
        <span className="text-sm tracking-[0.2em] text-albero uppercase font-medium">Actualidad</span>
        <h1 className="font-[family-name:var(--font-lora)] text-4xl md:text-5xl font-semibold text-azul mt-3 mb-5">
          Buenas noticias de la Iglesia
        </h1>
        <p className="text-lg text-texto/70 max-w-2xl mx-auto leading-relaxed">
          Historias de fe, esperanza y caridad de todo el mundo hispanohablante. Cada resumen es
          nuestro; pulsa para leer la noticia completa en su medio original.
        </p>
      </section>

      {/* Noticias */}
      <main className="max-w-5xl mx-auto px-6 pb-24">
        {news.length === 0 ? (
          <div className="text-center py-20 bg-white/60 rounded-2xl border border-azul/10">
            <p className="text-texto/60 text-lg">
              Estamos preparando las primeras noticias. Vuelve pronto. 🙏
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {news.map((n) => (
              <article
                key={n.id}
                className="hover-lift bg-white rounded-2xl border border-azul/10 shadow-sm p-7 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4 text-xs">
                  {n.country && (
                    <span className="bg-albero/15 text-azul px-2.5 py-1 rounded-full font-medium">
                      {n.country}
                    </span>
                  )}
                  {n.published_at && <span className="text-texto/40">{formatDate(n.published_at)}</span>}
                </div>

                <h2 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul leading-snug mb-3">
                  {n.title}
                </h2>

                <p className="text-texto/70 leading-relaxed mb-6 flex-1">{n.summary}</p>

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
            ))}
          </div>
        )}

        {/* Nota de transparencia */}
        <p className="text-center text-xs text-texto/40 mt-16 max-w-2xl mx-auto leading-relaxed">
          Los titulares pertenecen a sus respectivos medios. Aquí ofrecemos un resumen propio con
          enlace al original; no reproducimos los artículos completos.
        </p>
      </main>
    </div>
  );
}
