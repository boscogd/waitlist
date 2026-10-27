'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnimateOnScroll from '../components/AnimateOnScroll';
import { GooglePlayBadge } from '../components/StoreButtons';
import { APP_URL, INSTAGRAM_URL } from '@/lib/constants';
import { buildAppUrl, trackEvent } from '@/lib/track';

// =====================================================
// /descargar — cómo tener Refugio en cada dispositivo
// =====================================================
// Android → Google Play. iPhone/iPad → se instala desde Safari (aún no está
// en la App Store), con vídeo y pasos. Ordenador → se usa en el navegador.
// La plataforma se elige con ?plataforma=android|iphone|ordenador o se
// detecta por el navegador tras montar (el render inicial es Android).

type Platform = 'android' | 'ios' | 'pc';

type Step = {
  number: number;
  title: string;
  description: string;
  icon: ReactNode;
  important?: boolean;
};

const PLATFORM_PARAM: Record<string, Platform> = {
  android: 'android',
  iphone: 'ios',
  ipad: 'ios',
  ios: 'ios',
  ordenador: 'pc',
  pc: 'pc',
};

const ANDROID_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.523 15.341c-.5 0-.91.41-.91.91s.41.91.91.91.91-.41.91-.91-.41-.91-.91-.91m-11.046 0c-.5 0-.91.41-.91.91s.41.91.91.91.91-.41.91-.91-.41-.91-.91-.91m11.4-6.02l1.97-3.41c.11-.19.04-.43-.14-.54-.19-.11-.43-.04-.54.14l-2 3.46c-1.55-.7-3.29-1.09-5.16-1.09s-3.61.39-5.16 1.09l-2-3.46c-.11-.18-.35-.25-.54-.14-.18.11-.25.35-.14.54l1.97 3.41C2.79 11.27.5 14.53.5 18.32h23c0-3.79-2.29-7.05-5.67-9z" />
  </svg>
);

const APPLE_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const PC_ICON = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PLATFORMS: { id: Platform; label: string; icon: ReactNode }[] = [
  { id: 'android', label: 'Android', icon: ANDROID_ICON },
  { id: 'ios', label: 'iPhone / iPad', icon: APPLE_ICON },
  { id: 'pc', label: 'Ordenador', icon: PC_ICON },
];

const iosSteps: Step[] = [
  {
    number: 1,
    title: 'Abre la app en Safari',
    description:
      'Pulsa el botón «Abrir la app en Safari» que aparece debajo del vídeo. Si estás en Chrome u otro navegador, abre Safari y vuelve a esta página.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182a9.818 9.818 0 110 19.636 9.818 9.818 0 010-19.636zm4.034 4.352l-5.72 2.674-2.673 5.72 5.72-2.674zm-3.352 3.42a1.364 1.364 0 100 2.728 1.364 1.364 0 000-2.728z" />
      </svg>
    ),
    important: true,
  },
  {
    number: 2,
    title: 'Toca el botón Compartir',
    description:
      'Si en la barra de Safari ves tres puntos (···), tócalos y elige «Compartir». Si ves directamente el icono de compartir (un cuadrado con una flecha hacia arriba), tócalo.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Busca «Añadir a pantalla de inicio»',
    description: 'Baja en el menú hasta encontrar esa opción. Tiene un icono de un cuadrado con un +.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Confirma tocando «Añadir»',
    description:
      'Verás una vista previa del icono y el nombre. Toca «Añadir» arriba a la derecha y la app aparecerá en tu pantalla de inicio.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
];

const faqs = [
  {
    question: '¿Dónde descargo Refugio?',
    answer:
      'En Android, en Google Play: búscala como «Refugio en la Palabra». En iPhone y iPad se instala desde Safari en medio minuto. En el ordenador funciona directamente en el navegador.',
  },
  {
    question: '¿Por qué en iPhone no está en la App Store?',
    answer:
      'Por ahora solo estamos en Google Play. En iPhone se instala desde Safari y es la misma app, con la misma cuenta y las mismas funciones. No descargas ningún archivo: Safari añade a tu pantalla de inicio un acceso a la app oficial, con conexión segura.',
  },
  {
    question: '¿Tengo que usar Safari en el iPhone?',
    answer:
      'Es lo más sencillo y es lo que enseña el vídeo. Otros navegadores del iPhone solo lo permiten en versiones recientes de iOS y con pasos distintos.',
  },
  {
    question: '¿Mi cuenta es la misma en el móvil y en el ordenador?',
    answer:
      'Sí. Entra con el mismo correo o con tu cuenta de Google en cada dispositivo. Si ya usabas Refugio desde el navegador, puedes descargarla de Google Play y entrar con la misma cuenta.',
  },
  {
    question: '¿La app se actualiza sola?',
    answer:
      'Sí. En Android, Google Play la actualiza como cualquier otra app. En iPhone y en el ordenador se actualiza sola cada vez que la abres con conexión.',
  },
  {
    question: '¿Cómo la desinstalo si quiero?',
    answer:
      'Como cualquier otra app: en Android, mantén pulsado el icono y elige «Desinstalar». En iPhone, mantén pulsado el icono y toca «Eliminar app».',
  },
];

export default function DescargarPage() {
  const [platform, setPlatform] = useState<Platform>('android');
  // Enlace a la app con el origen de la visita (utm, referrer, página de
  // entrada). Se calcula tras montar porque sale de sessionStorage.
  const [appHref, setAppHref] = useState(`${APP_URL}/?src=web`);
  useEffect(() => {
    setAppHref(buildAppUrl());
  }, []);

  // Reproducciones del tutorial de iPhone: el vídeo no hace autoplay, así que
  // cada «play» es alguien que lo ha pulsado. Un evento por visita a la página.
  const tutorialTracked = useRef(new Set<string>());
  const trackTutorial = (kind: 'play' | 'end') => {
    const key = `tutorial_${kind}_ios`;
    if (tutorialTracked.current.has(key)) return;
    tutorialTracked.current.add(key);
    trackEvent(key);
  };

  // Plataforma: primero ?plataforma=…, si no, la del navegador. Tras montar
  // para no romper la hidratación (el render inicial siempre es Android).
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('plataforma')?.toLowerCase();
    if (param && PLATFORM_PARAM[param]) {
      setPlatform(PLATFORM_PARAM[param]);
      return;
    }
    const ua = navigator.userAgent || '';
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      // iPadOS 13+ se identifica como Mac con pantalla táctil
      (/Macintosh/.test(ua) && 'ontouchend' in document);
    if (isIOS) setPlatform('ios');
  }, []);

  // Datos estructurados: HowTo (solo iPhone, que es donde hay pasos) y
  // FAQPage. Texto idéntico al visible.
  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Instalar Refugio en la Palabra en iPhone',
    description: 'Cómo añadir Refugio en la Palabra a la pantalla de inicio del iPhone desde Safari',
    step: iosSteps.map((step) => ({
      '@type': 'HowToStep',
      position: step.number,
      name: step.title,
      text: step.description,
    })),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-marfil flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Header simplificado */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-marfil/95 backdrop-blur-md border-b border-azul/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-refugio.png" alt="Refugio en la Palabra" width={40} height={44} className="object-contain" />
            <span className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul hidden sm:block">
              Refugio en la Palabra
            </span>
          </Link>
          <Link href="/" className="text-sm text-texto/70 hover:text-azul transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </header>

      <main id="main" className="flex-1 pt-20">
        {/* Hero + selector de dispositivo */}
        <section className="px-6 pt-12 pb-8 sm:pt-16">
          <div className="max-w-4xl mx-auto text-center">
            <AnimateOnScroll>
              <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl lg:text-6xl font-semibold text-azul leading-tight tracking-tight mb-5">
                Descarga{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-albero to-dorado">Refugio</span>
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
              <p className="text-lg sm:text-xl text-texto/80 max-w-2xl mx-auto leading-relaxed mb-8">
                Gratis para empezar, sin anuncios. Elige tu dispositivo.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
              <div
                className="inline-flex flex-wrap justify-center bg-white rounded-2xl p-1.5 shadow-lg shadow-azul/5 border border-azul/5"
                role="group"
                aria-label="Elige tu dispositivo"
              >
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    data-track="platform_select"
                    data-track-platform={p.id}
                    aria-pressed={platform === p.id}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      platform === p.id
                        ? 'bg-gradient-to-r from-azul to-azul-800 text-white shadow-md'
                        : 'text-texto/70 hover:text-azul hover:bg-marfil/50'
                    }`}
                  >
                    {p.icon}
                    {p.label}
                  </button>
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {platform === 'android' && (
          <section className="px-6 pb-16">
            <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-azul/5 shadow-xl shadow-azul/5 text-center">
              <Image
                src="/icon-refugio-192.png"
                alt="Icono de Refugio en la Palabra"
                width={96}
                height={96}
                className="mx-auto rounded-3xl shadow-lg shadow-azul/15"
              />
              <h2 className="font-[family-name:var(--font-lora)] text-2xl sm:text-3xl font-semibold text-azul mt-5">
                Refugio en la Palabra
              </h2>
              <p className="text-texto/70 mt-2">Descárgala de Google Play como cualquier otra app.</p>
              <div className="mt-6 flex justify-center">
                <GooglePlayBadge where="descargar" />
              </div>
              <p className="text-sm text-texto/60 mt-6 leading-relaxed">
                ¿Ya la usabas desde el navegador? Entra en la de Google Play con la misma cuenta.
              </p>
            </div>
          </section>
        )}

        {platform === 'pc' && (
          <section className="px-6 pb-16">
            <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-azul/5 shadow-xl shadow-azul/5 text-center">
              <h2 className="font-[family-name:var(--font-lora)] text-2xl sm:text-3xl font-semibold text-azul">
                Úsala en el navegador
              </h2>
              <p className="text-texto/70 mt-3 leading-relaxed">
                En el ordenador no hace falta instalar nada: abre Refugio y entra con tu cuenta. Si usas Chrome o Edge,
                puedes instalarla con el icono de instalar que aparece en la barra de direcciones.
              </p>
              <a
                href={`${appHref}&web_where=ordenador`}
                target="_blank"
                rel="noopener noreferrer"
                data-track="install_click"
                data-track-where="ordenador"
                className="mt-6 inline-flex items-center gap-2 bg-azul hover:bg-azul-800 text-white px-7 py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Abrir Refugio
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <p className="text-sm text-texto/60 mt-6">
                ¿Quieres tenerla también en el móvil? Elige Android o iPhone arriba.
              </p>
            </div>
          </section>
        )}

        {platform === 'ios' && (
          <>
            <section className="px-6 pb-4">
              <div className="max-w-lg sm:max-w-xl mx-auto">
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start text-left">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 text-sm">En iPhone se instala desde Safari</h3>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Aún no estamos en la App Store. Desde Safari es la misma app y tarda medio minuto: mira el vídeo.
                    </p>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-azul to-azul-800 rounded-3xl overflow-hidden shadow-2xl shadow-azul/20">
                  <div className="relative aspect-[9/16] mx-auto max-h-[70vh]">
                    <video
                      className="absolute inset-0 w-full h-full object-contain"
                      controls
                      playsInline
                      preload="metadata"
                      poster="/ios-poster.jpg"
                      onPlay={() => trackTutorial('play')}
                      onEnded={() => trackTutorial('end')}
                      aria-label="Tutorial de instalación en iPhone, 24 segundos"
                    >
                      <source src="/ios.mp4" type="video/mp4" />
                      Tu navegador no soporta vídeos HTML5.
                    </video>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <a
                    href={`${appHref}&web_where=principal`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="install_click"
                    data-track-where="principal"
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-albero to-dorado text-azul-800 px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg shadow-albero/25 hover:shadow-xl hover:shadow-albero/30 hover:scale-[1.02] transition-all duration-300"
                  >
                    Abrir la app en Safari
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                  <p className="text-sm text-texto/70 mt-3">Se abre en una pestaña nueva. Luego sigue los pasos del vídeo.</p>
                  <p className="text-sm mt-4">
                    <a href="#pasos" className="text-azul hover:text-azul-800 underline underline-offset-2">
                      ¿Prefieres leer los pasos?
                    </a>
                  </p>
                </div>
              </div>
            </section>

            <section id="pasos" className="px-6 py-16 scroll-mt-24">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <span className="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider">Paso a paso</span>
                  <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3">
                    Instalación en iPhone
                  </h2>
                </div>
                <div className="space-y-6">
                  {iosSteps.map((step) => (
                    <div
                      key={step.number}
                      className={`bg-white rounded-2xl p-6 sm:p-8 border ${
                        step.important ? 'border-amber-200 bg-amber-50/30' : 'border-azul/5'
                      }`}
                    >
                      <div className="flex gap-6 items-start">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-albero to-dorado text-azul-800 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg shadow-albero/20">
                          {step.number}
                        </div>
                        <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-[family-name:var(--font-lora)] text-xl sm:text-2xl font-semibold text-azul mb-2">
                              {step.title}
                            </h3>
                            <p className="text-texto/70 leading-relaxed">{step.description}</p>
                          </div>
                          <div className="hidden sm:flex w-14 h-14 bg-marfil rounded-xl items-center justify-center flex-shrink-0 text-azul/60">
                            {step.icon}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Preguntas frecuentes */}
        <section className="px-6 py-16 bg-white/50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider">Dudas frecuentes</span>
              <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3">
                Preguntas sobre la descarga
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="group bg-white rounded-xl border border-azul/10 overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-azul hover:bg-marfil/50 transition-colors">
                    {faq.question}
                    <svg className="w-5 h-5 text-texto/50 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-texto/70">{faq.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Ayuda */}
        <section className="px-6 py-20">
          <AnimateOnScroll className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul">
              ¿Necesitas ayuda?
            </h2>
            <p className="text-lg text-texto/70 max-w-2xl mx-auto">
              Si algo no te funciona, escríbenos y te ayudamos. Somos dos personas y leemos cada mensaje.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-track="instagram_click"
                data-track-where="descargar"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-azul to-azul-800 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-azul/20 transition-all duration-300"
              >
                Escríbenos en Instagram
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white text-azul px-8 py-4 rounded-xl text-lg font-semibold border border-azul/10 hover:border-azul/30 hover:shadow-lg transition-all duration-300"
              >
                Volver al inicio
              </Link>
            </div>
          </AnimateOnScroll>
        </section>
      </main>

      {/* Footer simplificado */}
      <footer className="bg-azul text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <div className="flex items-center gap-3">
              <Image src="/icon-refugio-192.png" alt="Refugio en la Palabra" width={32} height={32} className="rounded-lg" />
              <span className="text-white/70">Refugio en la Palabra</span>
            </div>
            <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
