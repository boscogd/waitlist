import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import ScrollProgress from '../components/ScrollProgress';
import BackToTop from '../components/BackToTop';
import SiteFooter from '../components/sections/SiteFooter';
import StoreButtons from '../components/StoreButtons';
import AdventForm from '../components/AdventForm';
import { SITE_URL } from '@/lib/constants';
import {
  ADVIENTO_DIAS,
  ADVIENTO_FAQS,
  ADVIENTO_HITOS,
  ADVIENTO_MESES_PREMIUM,
  ADVIENTO_MINIMO,
} from '@/lib/content/adviento';

// =====================================================
// RETO DE ADVIENTO 2026
// =====================================================
// La página anuncia el reto y recoge las inscripciones. Quién rezó cada día
// lo sabe la app, no la web: las reglas están en lib/content/adviento.ts y el
// acuerdo con la app en supabase/adviento-schema.sql. No prometas aquí nada
// que la app no pueda comprobar.

const PAGE_URL = `${SITE_URL}/adviento`;
const TITLE = `Reto de Adviento: ${ADVIENTO_DIAS} días rezando hasta Navidad`;
const DESCRIPTION = `Del 29 de noviembre al 24 de diciembre, reza cada día el Evangelio con la app Refugio en la Palabra. A quien nos acompañe ${ADVIENTO_MINIMO} de los ${ADVIENTO_DIAS} días le regalamos ${ADVIENTO_MESES_PREMIUM} meses de Premium.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Adviento en Refugio | Refugio en la Palabra',
    description: DESCRIPTION,
    type: 'website',
    locale: 'es_ES',
    url: PAGE_URL,
    siteName: 'Refugio en la Palabra',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Refugio en la Palabra' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adviento en Refugio | Refugio en la Palabra',
    description: DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

const PASOS = [
  {
    titulo: 'Apúntate',
    texto: 'Deja aquí tu nombre y el correo de tu cuenta de la app. Es gratis.',
  },
  {
    titulo: 'Reza cada día',
    texto:
      'Abre la app y reza el Evangelio del día. Son unos minutos, y la app apunta sola cada día que rezas.',
  },
  {
    titulo: 'Llega a Navidad',
    texto: `Si rezas ${ADVIENTO_MINIMO} de los ${ADVIENTO_DIAS} días, te regalamos ${ADVIENTO_MESES_PREMIUM} meses de Premium.`,
  },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: 'Adviento en Refugio | Refugio en la Palabra',
    description: DESCRIPTION,
    inLanguage: 'es-ES',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#app` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ADVIENTO_FAQS.map((f) => ({
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
      { '@type': 'ListItem', position: 2, name: 'Reto de Adviento', item: PAGE_URL },
    ],
  },
];

const h2Class = 'font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul';

export default function AdvientoPage() {
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
        {/* Cabecera + inscripción */}
        <section className="px-6 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="space-y-5 text-center lg:text-left">
              <p className="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider">
                Del 29 de noviembre al 24 de diciembre
              </p>
              <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl font-semibold text-azul leading-tight tracking-tight text-balance">
                Adviento en Refugio: {ADVIENTO_DIAS} días rezando hasta Navidad
              </h1>
              <p className="text-lg text-texto/80 leading-relaxed">
                Te proponemos algo sencillo para preparar la Navidad: rezar cada día el Evangelio
                con la app, unos minutos, hasta Nochebuena. Lo hacemos nosotros también.
              </p>
              <p className="text-lg text-texto/80 leading-relaxed">
                A quien nos acompañe al menos{' '}
                <strong className="text-azul">
                  {ADVIENTO_MINIMO} de los {ADVIENTO_DIAS} días
                </strong>{' '}
                le regalamos{' '}
                <strong className="text-azul">{ADVIENTO_MESES_PREMIUM} meses de Premium</strong>,
                sin tarjeta y sin renovación.
              </p>
            </div>

            <div
              id="apuntarme"
              className="bg-white rounded-2xl border border-azul/10 shadow-xl shadow-azul/5 p-6 sm:p-8 scroll-mt-28"
            >
              <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mb-5">
                Apúntate al reto
              </h2>
              <AdventForm />
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="px-6 py-16 bg-white/60 border-y border-azul/5">
          <div className="max-w-5xl mx-auto space-y-8">
            <h2 className={h2Class}>Cómo funciona</h2>
            <ol className="grid md:grid-cols-3 gap-6">
              {PASOS.map((p, i) => (
                <li key={p.titulo} className="bg-marfil rounded-2xl border border-azul/10 p-6 space-y-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-azul text-white font-semibold"
                  >
                    {i + 1}
                  </span>
                  <h3 className="font-semibold text-lg text-azul">{p.titulo}</h3>
                  <p className="text-texto/80 leading-relaxed">{p.texto}</p>
                </li>
              ))}
            </ol>
            <div className="flex flex-col items-center gap-3 pt-2">
              <p className="text-texto/80">¿Todavía no tienes la app?</p>
              <StoreButtons where="adviento" />
            </div>
          </div>
        </section>

        {/* El regalo, con sus condiciones */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto space-y-5">
            <h2 className={h2Class}>El regalo, sin letra pequeña</h2>
            <ul className="space-y-3 text-texto/85 leading-relaxed list-disc pl-5 marker:text-albero">
              <li>
                Son {ADVIENTO_MESES_PREMIUM} meses de Premium en tu cuenta de la app.
              </li>
              <li>
                Lo recibe quien esté apuntado aquí y haya rezado el Evangelio del día en la app al
                menos {ADVIENTO_MINIMO} de los {ADVIENTO_DIAS} días, entre el 29 de noviembre y el
                24 de diciembre.
              </li>
              <li>
                Tienes que apuntarte con el mismo correo de tu cuenta de la app: es como sabemos a
                quién dárselo.
              </li>
              <li>
                Lo activamos la semana del 28 de diciembre y te avisamos por correo.
              </li>
              <li>
                No hay que poner tarjeta. Cuando pasen los tres meses, el Premium se termina solo:
                no se renueva ni se cobra nada.
              </li>
            </ul>
          </div>
        </section>

        {/* Calendario */}
        <section className="px-6 py-16 bg-azul text-white">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold">
              El camino, día a día
            </h2>
            <ol className="space-y-5 border-l border-white/25 pl-6">
              {ADVIENTO_HITOS.map((h) => (
                <li key={h.fecha} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-albero"
                  />
                  <p className="text-sm uppercase tracking-wider text-white/70">{h.fecha}</p>
                  <p className="font-semibold text-lg">{h.titulo}</p>
                  <p className="text-white/80 leading-relaxed">{h.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Preguntas */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className={h2Class}>Preguntas frecuentes</h2>
            <dl className="divide-y divide-azul/10 border-y border-azul/10">
              {ADVIENTO_FAQS.map((f) => (
                <div key={f.question} className="py-5">
                  <dt className="font-semibold text-azul">{f.question}</dt>
                  <dd className="text-texto/85 leading-relaxed mt-2">{f.answer}</dd>
                </div>
              ))}
            </dl>
            <div className="pt-4 text-center">
              <a
                href="#apuntarme"
                data-track="cta_click"
                data-track-where="adviento-final"
                className="inline-block bg-azul text-white px-8 py-4 rounded-lg font-medium hover:bg-azul-800 transition-colors shadow-sm"
              >
                Apuntarme al reto
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
