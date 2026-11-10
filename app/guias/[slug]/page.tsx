import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '../../components/SiteHeader';
import ScrollProgress from '../../components/ScrollProgress';
import BackToTop from '../../components/BackToTop';
import SiteFooter from '../../components/sections/SiteFooter';
import StoreButtons, { DownloadLink } from '../../components/StoreButtons';
import { SITE_URL } from '@/lib/constants';
import { getGuia, guias } from '@/lib/content/guias';

// =====================================================
// GUÍAS DE ORACIÓN — una guía
// =====================================================
// Páginas estáticas: solo existen los slugs de lib/content/guias.ts.
export const dynamicParams = false;

export function generateStaticParams() {
  return guias.map((g) => ({ slug: g.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const GUIAS_URL = `${SITE_URL}/guias`;

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guia = getGuia(slug);
  if (!guia) return {};
  const url = `${GUIAS_URL}/${guia.slug}`;
  return {
    title: guia.title,
    description: guia.description,
    alternates: { canonical: url },
    openGraph: {
      title: guia.title,
      description: guia.description,
      type: 'article',
      locale: 'es_ES',
      url,
      siteName: 'Refugio en la Palabra',
      publishedTime: `${guia.published}T08:00:00Z`,
      modifiedTime: `${guia.updated}T08:00:00Z`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Refugio en la Palabra' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guia.title,
      description: guia.description,
      images: ['/opengraph-image'],
    },
  };
}

export default async function GuiaPage({ params }: PageProps) {
  const { slug } = await params;
  const guia = getGuia(slug);
  if (!guia) notFound();

  const url = `${GUIAS_URL}/${guia.slug}`;
  const otras = guias.filter((g) => g.slug !== guia.slug);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: guia.title,
      description: guia.description,
      inLanguage: 'es-ES',
      datePublished: `${guia.published}T08:00:00Z`,
      dateModified: `${guia.updated}T08:00:00Z`,
      mainEntityOfPage: url,
      image: `${SITE_URL}/opengraph-image`,
      author: { '@id': `${SITE_URL}/#organization` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guia.faqs.map((f) => ({
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
        { '@type': 'ListItem', position: 2, name: 'Guías de oración', item: GUIAS_URL },
        { '@type': 'ListItem', position: 3, name: guia.shortTitle, item: url },
      ],
    },
  ];

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
            {/* Migas */}
            <nav aria-label="Migas de pan" className="text-sm text-texto/70 mb-6">
              <Link href="/" className="hover:text-azul transition-colors">Inicio</Link>
              <span aria-hidden="true" className="mx-2">/</span>
              <Link href="/guias" className="hover:text-azul transition-colors">Guías de oración</Link>
            </nav>

            <header className="space-y-4 mb-8">
              <h1 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul leading-tight tracking-tight text-balance">
                {guia.title}
              </h1>
              <p className="text-sm text-texto/70">
                {guia.minutes} min de lectura · Revisada el{' '}
                <time dateTime={guia.updated}>{formatDate(guia.updated)}</time>
              </p>
            </header>

            {/* Respuesta directa: lo primero que se lee */}
            <div className="space-y-4 text-lg text-texto/90 leading-relaxed">
              {guia.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            {/* Paso natural hacia la app, antes de que el lector se vaya con su respuesta */}
            <p className="mt-6 rounded-xl border border-albero/50 bg-white px-5 py-4 text-texto/90 leading-relaxed">
              {guia.appHook}{' '}
              <DownloadLink
                where={`guia-inicio-${guia.slug}`}
                className="font-semibold text-azul underline underline-offset-4 decoration-albero hover:decoration-azul transition-colors whitespace-nowrap"
              >
                Abrir la app
              </DownloadLink>
            </p>

            {guia.sections.map((s) => {
              const ListTag = s.ordered ? 'ol' : 'ul';
              return (
                <section key={s.heading} className="mt-10">
                  <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mb-4">
                    {s.heading}
                  </h2>
                  {s.paragraphs?.map((p) => (
                    <p key={p} className="text-texto/85 leading-relaxed mb-4">
                      {p}
                    </p>
                  ))}
                  {s.list ? (
                    <ListTag
                      className={`space-y-3 pl-6 text-texto/85 leading-relaxed marker:text-[#8a6d1f] marker:font-semibold ${
                        s.ordered ? 'list-decimal' : 'list-disc'
                      }`}
                    >
                      {s.list.map((item) => (
                        <li key={item} className="pl-1">
                          {item}
                        </li>
                      ))}
                    </ListTag>
                  ) : null}
                  {s.appTip ? (
                    <p className="mt-5 border-l-4 border-albero pl-4 text-texto/85 leading-relaxed">
                      <span className="font-semibold text-azul">Con la app: </span>
                      {s.appTip}
                    </p>
                  ) : null}
                </section>
              );
            })}

            {/* La app, como ayuda y no como interrupción */}
            <aside className="mt-12 rounded-2xl bg-azul text-white p-6 sm:p-8 space-y-4">
              <h2 className="font-[family-name:var(--font-lora)] text-xl font-semibold">
                Hazlo con Refugio en la Palabra
              </h2>
              <p className="text-white/85 leading-relaxed">{guia.appNote} Rezar con ella es gratis y no tiene anuncios.</p>
              <StoreButtons where={`guia-${guia.slug}`} align="start" />
            </aside>

            {/* Preguntas frecuentes (mismo contenido que el JSON-LD) */}
            <section className="mt-12">
              <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mb-4">
                Preguntas frecuentes
              </h2>
              <dl className="divide-y divide-azul/10 border-y border-azul/10">
                {guia.faqs.map((f) => (
                  <div key={f.question} className="py-5">
                    <dt className="font-semibold text-azul">{f.question}</dt>
                    <dd className="text-texto/85 leading-relaxed mt-2">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Otras guías: enlaces internos */}
            <section className="mt-12">
              <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mb-4">
                Otras guías
              </h2>
              <ul className="space-y-3">
                {otras.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guias/${g.slug}`}
                      className="font-medium text-azul underline underline-offset-4 decoration-albero/60 hover:decoration-azul transition-colors"
                    >
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
