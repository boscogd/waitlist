'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnimateOnScroll from '../components/AnimateOnScroll';

type Platform = 'android' | 'ios';

export default function DescargarPage() {
  const [platform, setPlatform] = useState<Platform>('android');

  const androidSteps = [
    {
      number: 1,
      title: 'Abre Chrome',
      description: 'Visita refugioenlapalabra.app desde el navegador Chrome en tu dispositivo Android.',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.952 6.848a12.014 12.014 0 0 0 9.921-9.718zm-3.218 2.31a2.182 2.182 0 1 0 0 4.364 2.182 2.182 0 0 0 0-4.364z"/>
        </svg>
      ),
    },
    {
      number: 2,
      title: 'Toca el menú',
      description: 'Pulsa los tres puntos verticales (⋮) en la esquina superior derecha del navegador.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      ),
    },
    {
      number: 3,
      title: '"Añadir a pantalla de inicio"',
      description: 'Selecciona esta opción en el menú. También puede aparecer como "Instalar aplicación".',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      number: 4,
      title: 'Confirma y listo',
      description: 'Pulsa "Añadir" o "Instalar". La app aparecerá en tu pantalla de inicio como cualquier otra aplicación.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  const iosSteps = [
    {
      number: 1,
      title: 'Abre Safari',
      description: 'Es importante usar Safari, el navegador de Apple. Chrome u otros navegadores no permiten instalar apps en iOS.',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182a9.818 9.818 0 110 19.636 9.818 9.818 0 010-19.636zm4.034 4.352l-5.72 2.674-2.673 5.72 5.72-2.674zm-3.352 3.42a1.364 1.364 0 100 2.728 1.364 1.364 0 000-2.728z"/>
        </svg>
      ),
      important: true,
    },
    {
      number: 2,
      title: 'Toca el botón Compartir',
      description: 'Es el icono con forma de cuadrado con una flecha hacia arriba, ubicado en la barra inferior del navegador.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    },
    {
      number: 3,
      title: 'Desplaza y busca la opción',
      description: 'Baja en el menú hasta encontrar "Añadir a pantalla de inicio". Tiene un icono de un cuadrado con un +.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: 4,
      title: 'Confirma tocando "Añadir"',
      description: 'Verás una vista previa del icono y nombre. Toca "Añadir" en la esquina superior derecha para finalizar.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  const steps = platform === 'android' ? androidSteps : iosSteps;

  const benefits = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Acceso instantáneo',
      description: 'Abre la app directamente desde tu pantalla de inicio, sin buscar en el navegador.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'Sin distracciones',
      description: 'Experiencia a pantalla completa, sin barras del navegador que molesten.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: 'Notificaciones',
      description: 'Recibe recordatorios para tu oración diaria (cuando las actives).',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      title: 'Ocupa muy poco',
      description: 'No necesitas espacio de almacenamiento como las apps tradicionales.',
    },
  ];

  const faqs = [
    {
      question: '¿Es seguro instalar la app de esta forma?',
      answer: 'Absolutamente. Las PWA (Progressive Web Apps) son una tecnología estándar aprobada por Google y Apple. Grandes empresas como Starbucks, Pinterest y Twitter la utilizan. No estás descargando nada extraño, simplemente creando un acceso directo inteligente a nuestra web.',
    },
    {
      question: '¿Por qué no están en la App Store o Google Play?',
      answer: 'Las tiendas de aplicaciones cobran un 30% de comisión y tienen procesos de aprobación largos. Al ser una PWA, podemos ofrecerte la app gratis, actualizarla más rápido y sin intermediarios. Además, funciona igual o mejor que una app nativa.',
    },
    {
      question: '¿Funciona sin conexión a internet?',
      answer: 'Sí, parcialmente. Una vez instalada, podrás acceder a contenido que ya hayas visitado incluso sin conexión. Las funciones que requieren datos nuevos (como el Evangelio del día) necesitarán conexión.',
    },
    {
      question: '¿Cómo desinstalo la app si quiero?',
      answer: 'Igual que cualquier otra app: en Android, mantén pulsado el icono y selecciona "Desinstalar". En iPhone, mantén pulsado el icono hasta que tiemble y toca la X o "Eliminar app".',
    },
    {
      question: '¿Por qué en iPhone solo funciona con Safari?',
      answer: 'Apple solo permite instalar PWAs desde Safari, su navegador nativo. Es una limitación de iOS, no nuestra. Chrome, Firefox y otros navegadores en iPhone no tienen esta capacidad.',
    },
    {
      question: '¿La app se actualiza automáticamente?',
      answer: 'Sí. Cada vez que abras la app con conexión a internet, se actualizará automáticamente a la última versión. No tienes que hacer nada, siempre tendrás las últimas funciones.',
    },
  ];

  return (
    <div className="min-h-screen bg-marfil flex flex-col">
      {/* Header simplificado */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-marfil/95 backdrop-blur-md border-b border-azul/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-512-1.png"
              alt="Refugio en la Palabra"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul hidden sm:block">
              Refugio en la Palabra
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-texto/70 hover:text-azul transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">

        {/* Hero Section */}
        <section className="px-6 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Instalación en 30 segundos
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl lg:text-6xl font-semibold text-azul leading-tight tracking-tight mb-6">
                Instala{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-albero to-dorado">
                  Refugio
                </span>
                {' '}en tu móvil
              </h1>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <p className="text-lg sm:text-xl text-texto/80 max-w-2xl mx-auto leading-relaxed mb-8">
                Añade la app a tu pantalla de inicio y accede con un solo toque.
                Sin tiendas de apps, sin esperas, sin complicaciones.
              </p>
            </AnimateOnScroll>

            {/* Platform selector */}
            <AnimateOnScroll delay={300}>
              <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-lg shadow-azul/5 border border-azul/5">
                <button
                  onClick={() => setPlatform('android')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    platform === 'android'
                      ? 'bg-gradient-to-r from-azul to-azul-800 text-white shadow-md'
                      : 'text-texto/70 hover:text-azul hover:bg-marfil/50'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.341c-.5 0-.91.41-.91.91s.41.91.91.91.91-.41.91-.91-.41-.91-.91-.91m-11.046 0c-.5 0-.91.41-.91.91s.41.91.91.91.91-.41.91-.91-.41-.91-.91-.91m11.4-6.02l1.97-3.41c.11-.19.04-.43-.14-.54-.19-.11-.43-.04-.54.14l-2 3.46c-1.55-.7-3.29-1.09-5.16-1.09s-3.61.39-5.16 1.09l-2-3.46c-.11-.18-.35-.25-.54-.14-.18.11-.25.35-.14.54l1.97 3.41C2.79 11.27.5 14.53.5 18.32h23c0-3.79-2.29-7.05-5.67-9z"/>
                  </svg>
                  Android
                </button>
                <button
                  onClick={() => setPlatform('ios')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    platform === 'ios'
                      ? 'bg-gradient-to-r from-azul to-azul-800 text-white shadow-md'
                      : 'text-texto/70 hover:text-azul hover:bg-marfil/50'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  iPhone / iPad
                </button>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Video Tutorial Section */}
        <section className="px-6 py-8">
          <div className="max-w-3xl mx-auto">
            <AnimateOnScroll>
              <div className="relative bg-gradient-to-br from-azul to-azul-800 rounded-3xl overflow-hidden shadow-2xl shadow-azul/20">
                {/* Video placeholder - aspect ratio 9:16 para móvil */}
                <div className="relative aspect-[9/16] sm:aspect-video max-h-[500px] mx-auto">
                  {/* Fondo decorativo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-azul via-azul-800 to-azul flex items-center justify-center">
                    {/* Patrón decorativo */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
                      <div className="absolute bottom-10 right-10 w-48 h-48 border border-white/20 rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-full"></div>
                    </div>

                    {/* Contenido del placeholder */}
                    <div className="relative z-10 text-center text-white p-8">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <h3 className="font-[family-name:var(--font-lora)] text-xl sm:text-2xl font-semibold mb-2">
                        Tutorial en vídeo
                      </h3>
                      <p className="text-white/70 text-sm sm:text-base max-w-xs mx-auto">
                        {platform === 'android'
                          ? 'Cómo instalar Refugio en Android paso a paso'
                          : 'Cómo instalar Refugio en iPhone paso a paso'}
                      </p>
                      <div className="mt-6 inline-flex items-center gap-2 text-xs text-white/50 bg-white/5 px-4 py-2 rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Próximamente
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge de plataforma */}
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                  {platform === 'android' ? (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.523 15.341c-.5 0-.91.41-.91.91s.41.91.91.91.91-.41.91-.91-.41-.91-.91-.91m-11.046 0c-.5 0-.91.41-.91.91s.41.91.91.91.91-.41.91-.91-.41-.91-.91-.91m11.4-6.02l1.97-3.41c.11-.19.04-.43-.14-.54-.19-.11-.43-.04-.54.14l-2 3.46c-1.55-.7-3.29-1.09-5.16-1.09s-3.61.39-5.16 1.09l-2-3.46c-.11-.18-.35-.25-.54-.14-.18.11-.25.35-.14.54l1.97 3.41C2.79 11.27.5 14.53.5 18.32h23c0-3.79-2.29-7.05-5.67-9z"/>
                      </svg>
                      Android
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      iOS
                    </>
                  )}
                </div>
              </div>
            </AnimateOnScroll>

            {/* Nota bajo el video */}
            <AnimateOnScroll delay={100}>
              <p className="text-center text-sm text-texto/50 mt-4">
                ¿Prefieres leer los pasos? Los tienes justo debajo
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Steps Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <span className="text-albero font-medium text-sm uppercase tracking-wider">Paso a paso</span>
                <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4">
                  {platform === 'android' ? 'Instalación en Android' : 'Instalación en iPhone'}
                </h2>
                <p className="text-texto/70 max-w-xl mx-auto">
                  Sigue estos sencillos pasos para tener Refugio en tu pantalla de inicio
                </p>
              </div>
            </AnimateOnScroll>

            {/* iOS Safari Warning */}
            {platform === 'ios' && (
              <AnimateOnScroll>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-1">Importante: Usa Safari</h3>
                    <p className="text-sm text-amber-700">
                      En iPhone y iPad, solo Safari permite instalar apps web. Si estás usando Chrome, Firefox u otro navegador,
                      abre esta página en Safari para continuar.
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            )}

            {/* Steps Grid */}
            <div className="space-y-6">
              {steps.map((step, index) => (
                <AnimateOnScroll key={step.number} delay={index * 100}>
                  <div className={`bg-white rounded-2xl p-6 sm:p-8 border transition-all duration-300 hover:shadow-lg ${
                    step.important ? 'border-amber-200 bg-amber-50/30' : 'border-azul/5 hover:border-albero/30'
                  }`}>
                    <div className="flex gap-6 items-start">
                      {/* Number */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-albero to-dorado text-white rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg shadow-albero/20">
                        {step.number}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-[family-name:var(--font-lora)] text-xl sm:text-2xl font-semibold text-azul mb-2">
                              {step.title}
                            </h3>
                            <p className="text-texto/70 leading-relaxed">
                              {step.description}
                            </p>
                          </div>

                          {/* Icon */}
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-marfil rounded-xl flex items-center justify-center flex-shrink-0 text-azul/60">
                            {step.icon}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            {/* Success message */}
            <AnimateOnScroll delay={500}>
              <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-green-800 mb-2">
                  ¡Ya está!
                </h3>
                <p className="text-green-700">
                  Refugio en la Palabra ya está en tu pantalla de inicio. Ábrela cuando quieras rezar.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-6 py-16 bg-gradient-to-b from-white/50 to-marfil">
          <div className="max-w-5xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <span className="text-albero font-medium text-sm uppercase tracking-wider">Ventajas</span>
                <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4">
                  ¿Por qué instalar la app?
                </h2>
                <p className="text-texto/70 max-w-xl mx-auto">
                  Más que un acceso directo: una experiencia completa de aplicación
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <AnimateOnScroll key={index} delay={index * 100}>
                  <div className="bg-white rounded-2xl p-6 border border-azul/5 hover:border-albero/30 hover:shadow-lg transition-all duration-300 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-albero/20 to-dorado/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-albero">
                      {benefit.icon}
                    </div>
                    <h3 className="font-semibold text-azul mb-2">{benefit.title}</h3>
                    <p className="text-sm text-texto/70">{benefit.description}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <AnimateOnScroll>
              <div className="bg-gradient-to-br from-azul to-azul-800 rounded-3xl p-8 sm:p-12 text-white text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-albero" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="font-[family-name:var(--font-lora)] text-2xl sm:text-3xl font-semibold mb-4">
                  Tecnología de confianza
                </h2>
                <p className="text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
                  Las PWA (Progressive Web Apps) son utilizadas por empresas como <strong>Starbucks</strong>, <strong>Pinterest</strong>, <strong>Twitter</strong> y <strong>Spotify</strong>.
                  Es una tecnología estándar, segura y respaldada por Google y Apple.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Sin malware
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Sin permisos extraños
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Conexión segura HTTPS
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-16 bg-white/50">
          <div className="max-w-3xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <span className="text-albero font-medium text-sm uppercase tracking-wider">Dudas frecuentes</span>
                <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3">
                  Preguntas sobre la instalación
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <AnimateOnScroll key={index} delay={index * 50}>
                  <details className="group bg-white rounded-xl border border-azul/10 overflow-hidden">
                    <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-azul hover:bg-marfil/50 transition-colors">
                      {faq.question}
                      <svg className="w-5 h-5 text-texto/50 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 text-texto/70">
                      {faq.answer}
                    </div>
                  </details>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="px-6 py-20">
          <AnimateOnScroll className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul">
              ¿Necesitas más ayuda?
            </h2>
            <p className="text-lg text-texto/70 max-w-2xl mx-auto">
              Si tienes problemas instalando la app, escríbenos y te ayudamos encantados.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://www.instagram.com/refugioenlapalabra_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-azul to-azul-800 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-azul/20 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Escríbenos en Instagram
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white text-azul px-8 py-4 rounded-xl text-lg font-semibold border border-azul/10 hover:border-azul/30 hover:shadow-lg transition-all duration-300"
              >
                Volver al inicio
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
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
              <Image
                src="/logo-512-1.png"
                alt="Refugio en la Palabra"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-white/70">Refugio en la Palabra</span>
            </div>
            <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
