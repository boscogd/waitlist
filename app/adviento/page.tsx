import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import ScrollProgress from '../components/ScrollProgress';
import BackToTop from '../components/BackToTop';
import SiteFooter from '../components/sections/SiteFooter';
import StoreButtons, { DownloadLink } from '../components/StoreButtons';
import { SITE_URL } from '@/lib/constants';
import {
  ADVIENTO_DIAS,
  ADVIENTO_FALLOS,
  ADVIENTO_FAQS,
  ADVIENTO_HITOS,
  ADVIENTO_MESES_PREMIUM,
  ADVIENTO_MINIMO,
} from '@/lib/content/adviento';

// =====================================================
// CALENDARIO DE ADVIENTO 2026
// =====================================================
// La página solo anuncia el calendario y lleva a la app, que es donde ocurre
// todo: no hay formulario ni se guarda ningún dato aquí. Las reglas están en
// lib/content/adviento.ts y tienen que coincidir con las de la app. No
// prometas aquí nada que la app no haga.

const PAGE_URL = `${SITE_URL}/adviento`;
const TITLE = 'Calendario de Adviento 2026: del 1 al 25 de diciembre';
const DESCRIPTION = `Un calendario de Adviento para rezar: del 1 al 25 de diciembre, cada día una ventana con un reto, una intención y una oración en la app Refugio en la Palabra. Gratis, con ${ADVIENTO_MESES_PREMIUM} meses de Premium de regalo si completas ${ADVIENTO_MINIMO} de los ${ADVIENTO_DIAS} días.`;

export const metadata: Metadata = {
  // Sin la marca detrás, para que quepa entero en Google.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Calendario de Adviento | Refugio en la Palabra',
    description: DESCRIPTION,
    type: 'website',
    locale: 'es_ES',
    url: PAGE_URL,
    siteName: 'Refugio en la Palabra',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Refugio en la Palabra' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calendario de Adviento | Refugio en la Palabra',
    description: DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

const PASOS = [
  {
    titulo: 'Abre la app',
    texto:
      'El calendario está dentro de Refugio en la Palabra. Si no tienes la app, descárgala y crea tu cuenta: es gratis.',
  },
  {
    titulo: 'Abre la ventana del día',
    texto:
      'Cada día hay un reto para hacer en la app, una intención por la que rezamos todos y una oración. Al terminar, tu Belén gana una figura.',
  },
  {
    titulo: 'Llega a Navidad',
    texto: `Si completas ${ADVIENTO_MINIMO} de los ${ADVIENTO_DIAS} días, te regalamos ${ADVIENTO_MESES_PREMIUM} meses de Premium.`,
  },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: 'Calendario de Adviento | Refugio en la Palabra',
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
      { '@type': 'ListItem', position: 2, name: 'Calendario de Adviento', item: PAGE_URL },
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
        {/* Cabecera + cómo empezar */}
        <section className="px-6 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="space-y-5 text-center lg:text-left">
              <p className="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider">
                Del 1 al 25 de diciembre
              </p>
              <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl font-semibold text-azul leading-tight tracking-tight text-balance">
                Calendario de Adviento: una ventana cada día hasta Navidad
              </h1>
              <p className="text-lg text-texto/80 leading-relaxed">
                Un calendario de Adviento para rezar. Cada día, del 1 al 25 de diciembre, abres una
                ventana en la app: un reto, una intención por la que rezamos todos y una oración. Y
                con cada día, una figura más en tu Belén. Lo hacemos nosotros también.
              </p>
              <p className="text-lg text-texto/80 leading-relaxed">
                A quien complete al menos{' '}
                <strong className="text-azul">
                  {ADVIENTO_MINIMO} de los {ADVIENTO_DIAS} días
                </strong>{' '}
                le regalamos{' '}
                <strong className="text-azul">{ADVIENTO_MESES_PREMIUM} meses de Premium</strong>,
                sin tarjeta y sin renovación.
              </p>
            </div>

            <div
              id="empezar"
              className="bg-white rounded-2xl border border-azul/10 shadow-xl shadow-azul/5 p-6 sm:p-8 scroll-mt-28 space-y-5"
            >
              <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul">
                Para empezar no hay que apuntarse
              </h2>
              <p className="text-texto/85 leading-relaxed">
                El calendario está dentro de la app y es gratis. Entra con tu cuenta y lo verás en
                Inicio. La primera ventana se abre el martes 1 de diciembre.
              </p>
              <StoreButtons where="adviento-inicio" align="start" />
              <p className="text-sm text-texto/70 leading-relaxed">
                ¿Ya tienes la app y no te aparece? Actualízala, o ábrela en el navegador con tu
                misma cuenta.
              </p>
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
                Lo recibe quien complete en la app al menos {ADVIENTO_MINIMO} de los{' '}
                {ADVIENTO_DIAS} días, entre el 1 y el 25 de diciembre. Se pueden fallar{' '}
                {ADVIENTO_FALLOS}.
              </li>
              <li>
                Cada ventana se completa en su día, así que el último día para empezar y optar al
                regalo es el viernes 4 de diciembre.
              </li>
              <li>
                No hay que pedirlo: la app sabe qué días has completado y lo activamos en tu cuenta
                después de Navidad.
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
              <DownloadLink
                where="adviento-final"
                className="inline-block bg-azul text-white px-8 py-4 rounded-lg font-medium hover:bg-azul-800 transition-colors shadow-sm"
              >
                Abrir el calendario en la app
              </DownloadLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
