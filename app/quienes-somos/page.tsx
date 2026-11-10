import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import ScrollProgress from '../components/ScrollProgress';
import BackToTop from '../components/BackToTop';
import SiteFooter from '../components/sections/SiteFooter';
import StoreButtons from '../components/StoreButtons';
import { INSTAGRAM_URL, PLAY_URL, SITE_URL } from '@/lib/constants';

// =====================================================
// QUIÉNES SOMOS — la página propia del proyecto
// =====================================================
// Existe por dos motivos: que quien llega sepa quién hay detrás de la app, y
// que Google tenga una página que diga sin ambigüedad qué es «Refugio en la
// Palabra» (hay otro proyecto con el mismo nombre). Todo lo que se afirma aquí
// es comprobable: no añadas fechas ni cifras que no lo sean.

const PAGE_URL = `${SITE_URL}/quienes-somos`;
const TITLE = 'Quiénes somos: Aida y Bosco, creadores de la app';
const DESCRIPTION =
  'Refugio en la Palabra es la app católica de oración creada por Aida y Bosco, una pareja de España. Esta es nuestra historia, qué hacemos y dónde encontrarnos.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Quiénes somos | Refugio en la Palabra',
    description: DESCRIPTION,
    type: 'profile',
    locale: 'es_ES',
    url: PAGE_URL,
    siteName: 'Refugio en la Palabra',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Refugio en la Palabra' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiénes somos | Refugio en la Palabra',
    description: DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

// Hitos del proyecto. Solo fechas que constan (alta del dominio y de la web,
// publicación en Google Play).
const HITOS = [
  {
    fecha: 'Antes de todo',
    titulo: 'Una necesidad nuestra',
    texto:
      'Queríamos rezar cada día y entender mejor lo que creíamos, y no encontrábamos nada en español hecho a nuestra medida. Empezamos a construirlo para nosotros dos.',
  },
  {
    fecha: 'Octubre de 2025',
    titulo: 'Nace refugioenlapalabra.com',
    texto:
      'Abrimos esta web con una lista de espera para quien quisiera probar la app cuando estuviera lista.',
  },
  {
    fecha: 'Después',
    titulo: 'La app, primero en el navegador',
    texto:
      'Las primeras personas la usaron instalándola desde el navegador del móvil. Con lo que nos iban contando fuimos corrigiendo y añadiendo cosas.',
  },
  {
    fecha: '2026',
    titulo: 'Llega a Google Play',
    texto:
      'Hoy Refugio en la Palabra se descarga en Android desde Google Play, y en iPhone y en el ordenador se instala desde el navegador en medio minuto.',
  },
];

const VALORES = [
  {
    icon: '/icons/calendario-icon.png',
    titulo: 'Sacamos tiempo de donde no lo hay',
    texto:
      'Trabajamos en cada rato libre. Y cuando no lo tenemos, lo buscamos. Este proyecto nace del esfuerzo de los dos, juntos.',
  },
  {
    icon: '/icons/comunidad-icon.png',
    titulo: 'Nos complementamos',
    texto:
      'Aida da vida a lo visual, Bosco lo construye. Pero cada idea nace entre los dos. Sin el uno, el otro no tendría sentido.',
  },
  {
    icon: '/icons/amor-icon.png',
    titulo: 'Hecho con propósito',
    texto:
      'Empezó siendo para nosotros, pero la gente nos lo fue pidiendo. Si nos ayudó a nosotros, quizá pueda ayudarte a ti.',
  },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: 'Quiénes somos | Refugio en la Palabra',
    description: DESCRIPTION,
    inLanguage: 'es-ES',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    mainEntity: { '@id': `${SITE_URL}/#organization` },
    primaryImageOfPage: `${SITE_URL}/aida-bosco.jpg`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Quiénes somos', item: PAGE_URL },
    ],
  },
];

const linkClass =
  'font-medium text-azul underline underline-offset-4 decoration-albero/60 hover:decoration-azul transition-colors';

export default function QuienesSomosPage() {
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
        {/* Cabecera: quiénes somos, con la foto real */}
        <section className="px-6 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5 text-center md:text-left">
              <p className="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider">
                Quiénes somos
              </p>
              <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl font-semibold text-azul leading-tight tracking-tight text-balance">
                Somos Aida y Bosco, y hacemos Refugio en la Palabra
              </h1>
              <p className="text-lg text-texto/80 leading-relaxed">
                Refugio en la Palabra es una app católica para rezar cada día. La hacemos nosotros
                dos, una pareja de España, desde 2025. No hay una gran empresa detrás: hay dos
                personas que la usan a diario y que responden los correos.
              </p>
            </div>
            <div className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl shadow-azul/10 border border-azul/10">
              <Image
                src="/aida-bosco.jpg"
                alt="Aida y Bosco, creadores de la app Refugio en la Palabra"
                fill
                priority
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-cover object-top"
              />
            </div>
          </div>
        </section>

        {/* Qué es (y qué no es) Refugio en la Palabra */}
        <section className="px-6 py-14 bg-white/60 border-y border-azul/5">
          <div className="max-w-3xl mx-auto space-y-5">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul">
              Qué es Refugio en la Palabra
            </h2>
            <p className="text-texto/85 leading-relaxed">
              Es una aplicación para el móvil y el ordenador con la que puedes rezar el Rosario
              guiado con audio, leer el Evangelio del día con un comentario, hacer Lectio Divina y
              preguntar tus dudas de fe a un Compañero de fe: un asistente de inteligencia
              artificial que responde a partir del Catecismo, la Sagrada Escritura y el Magisterio.
              Está en español de principio a fin.
            </p>
            <p className="text-texto/85 leading-relaxed">
              Rezar con ella es gratis y no lleva anuncios. No vendemos tus datos. Hay una versión
              Premium de pago que amplía algunas funciones y que es lo que nos permite mantenerla.
            </p>
            <p className="text-texto/85 leading-relaxed">
              Para que no haya confusión: Refugio en la Palabra, la app, vive en{' '}
              <Link href="/" className={linkClass}>refugioenlapalabra.com</Link>, en{' '}
              <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Google Play
              </a>{' '}
              y en Instagram como{' '}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                @refugioenlapalabra_
              </a>
              . Somos un proyecto independiente: no tenemos relación con otros canales, webs o
              iniciativas que usen un nombre parecido.
            </p>
          </div>
        </section>

        {/* Historia */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul mb-10">
              Nuestra historia
            </h2>
            <ol className="relative border-l-2 border-albero/40 ml-2 space-y-10">
              {HITOS.map((h) => (
                <li key={h.titulo} className="pl-6 relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-albero border-2 border-marfil"
                  />
                  <p className="text-sm font-medium uppercase tracking-wider text-[#8a6d1f]">
                    {h.fecha}
                  </p>
                  <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul mt-1">
                    {h.titulo}
                  </h3>
                  <p className="text-texto/80 leading-relaxed mt-2">{h.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Cómo trabajamos */}
        <section className="px-6 py-16 bg-azul text-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold mb-10 text-center md:text-left">
              Cómo trabajamos
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {VALORES.map((v) => (
                <div key={v.titulo} className="bg-white/10 rounded-2xl p-6 space-y-4">
                  <div className="w-[72px] h-[72px] bg-marfil rounded-full flex items-center justify-center p-3">
                    <Image src={v.icon} alt="" width={48} height={48} />
                  </div>
                  <h3 className="font-semibold text-lg">{v.titulo}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{v.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dónde encontrarnos + descarga */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul">
              Dónde encontrarnos
            </h2>
            <ul className="space-y-3 text-texto/85 leading-relaxed">
              <li>
                <strong className="text-azul">La app:</strong>{' '}
                <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  en Google Play
                </a>{' '}
                para Android, y{' '}
                <Link href="/descargar" className={linkClass}>desde el navegador</Link> en iPhone y
                ordenador.
              </li>
              <li>
                <strong className="text-azul">Instagram:</strong>{' '}
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  @refugioenlapalabra_
                </a>
              </li>
              <li>
                <strong className="text-azul">Correo:</strong>{' '}
                <a href="mailto:info@refugioenlapalabra.com" className={linkClass}>
                  info@refugioenlapalabra.com
                </a>
                . Lo leemos nosotros.
              </li>
              <li>
                <strong className="text-azul">Cada semana:</strong>{' '}
                <Link href="/actualidad" className={linkClass}>
                  buenas noticias de la Iglesia
                </Link>{' '}
                en la sección Actualidad.
              </li>
            </ul>
            <div className="pt-4 flex flex-col items-center md:items-start gap-3">
              <StoreButtons where="quienes-somos" align="start" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
