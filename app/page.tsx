import WaitlistForm from './components/WaitlistForm';
import WaitlistCounter from './components/WaitlistCounter';
import InstagramBadge from './components/InstagramBadge';
import AnimateOnScroll from './components/AnimateOnScroll';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-marfil flex flex-col">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-marfil/95 backdrop-blur-md border-b border-azul/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#caracteristicas" className="text-sm text-texto/70 hover:text-azul transition-colors">
              Características
            </a>
            <a href="#como-funciona" className="text-sm text-texto/70 hover:text-azul transition-colors">
              Cómo funciona
            </a>
            <a href="#testimonios" className="text-sm text-texto/70 hover:text-azul transition-colors">
              Quiénes somos
            </a>
            <a href="#faq" className="text-sm text-texto/70 hover:text-azul transition-colors">
              FAQ
            </a>
          </nav>
          <a
            href="#unete"
            className="bg-azul text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-azul-800 transition-colors shadow-sm"
          >
            Únete gratis
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">

        {/* Hero Section */}
        <section className="px-6 py-12 sm:py-16 lg:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

              {/* Contenido izquierdo */}
              <div className="space-y-6 text-center lg:text-left">
                {/* Badges de comunidad y waitlist */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <InstagramBadge />
                  <WaitlistCounter />
                </div>

                {/* Título principal */}
                <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl lg:text-6xl font-semibold text-azul leading-tight tracking-tight animate-fade-in-up">
                  Tu refugio diario para{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-albero to-dorado">
                    crecer en la fe
                  </span>
                </h1>

                {/* Subtítulo */}
                <p className="text-lg sm:text-xl text-texto/80 max-w-md sm:max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up animation-delay-100 px-2 sm:px-0">
                  Reza el Rosario guiado, reflexiona con el Evangelio diario y recibe acompañamiento espiritual 24/7 con inteligencia artificial católica.
                </p>

                {/* CTA Principal */}
                <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 pt-2 animate-fade-in-up animation-delay-200">
                  <a
                    href="#unete"
                    className="group bg-gradient-to-r from-azul to-azul-800 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-azul/20 transition-all duration-300 flex items-center gap-2"
                  >
                    Únete a la lista de espera
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>

                {/* Prueba social rápida */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-sm text-texto/60 animate-fade-in-up animation-delay-300">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>100% gratis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Sin anuncios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Hecho en España</span>
                  </div>
                </div>
              </div>

              {/* Mockups derecha */}
              <div className="relative flex justify-center lg:justify-end animate-fade-in-up animation-delay-200">
                <div className="relative w-full max-w-md lg:max-w-lg">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-albero/20 to-dorado/20 rounded-[3rem] blur-3xl scale-110"></div>

                  {/* Phone mockups - Desktop */}
                  <div className="relative hidden sm:flex items-center justify-center">
                    {/* Teléfono trasero izquierdo */}
                    <div className="absolute -left-8 top-8 w-48 opacity-60 -rotate-6 animate-float animation-delay-200">
                      <div className="bg-azul rounded-[2rem] p-2 shadow-2xl">
                        <Image
                          src="/calendario.jpeg"
                          alt="Calendario litúrgico"
                          width={200}
                          height={400}
                          className="rounded-[1.5rem] w-full"
                        />
                      </div>
                    </div>

                    {/* Teléfono principal central */}
                    <div className="relative z-10 w-64 animate-float">
                      <div className="bg-azul rounded-[2.5rem] p-2 shadow-2xl shadow-azul/30">
                        <Image
                          src="/home.jpeg"
                          alt="Pantalla principal de Refugio"
                          width={260}
                          height={520}
                          className="rounded-[2rem] w-full"
                          priority
                        />
                      </div>
                    </div>

                    {/* Teléfono trasero derecho */}
                    <div className="absolute -right-8 top-8 w-48 opacity-60 rotate-6 animate-float animation-delay-400">
                      <div className="bg-azul rounded-[2rem] p-2 shadow-2xl">
                        <Image
                          src="/logros.jpeg"
                          alt="Sistema de logros"
                          width={200}
                          height={400}
                          className="rounded-[1.5rem] w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone mockups - Mobile (3 phones stacked) */}
                  <div className="sm:hidden relative flex items-center justify-center h-80">
                    {/* Teléfono izquierdo */}
                    <div className="absolute left-4 top-4 w-28 opacity-70 -rotate-6 animate-float animation-delay-200">
                      <div className="bg-azul rounded-[1.5rem] p-1.5 shadow-xl">
                        <Image
                          src="/calendario.jpeg"
                          alt="Calendario litúrgico"
                          width={200}
                          height={400}
                          className="rounded-[1.2rem] w-full"
                        />
                      </div>
                    </div>

                    {/* Teléfono central (principal) */}
                    <div className="relative z-10 w-36 animate-float">
                      <div className="bg-azul rounded-[2rem] p-1.5 shadow-2xl shadow-azul/30">
                        <Image
                          src="/home.jpeg"
                          alt="Pantalla principal de Refugio"
                          width={260}
                          height={520}
                          className="rounded-[1.5rem] w-full"
                          priority
                        />
                      </div>
                    </div>

                    {/* Teléfono derecho */}
                    <div className="absolute right-4 top-4 w-28 opacity-70 rotate-6 animate-float animation-delay-400">
                      <div className="bg-azul rounded-[1.5rem] p-1.5 shadow-xl">
                        <Image
                          src="/logros.jpeg"
                          alt="Sistema de logros"
                          width={200}
                          height={400}
                          className="rounded-[1.2rem] w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Sección: Por qué Refugio */}
        <section className="px-6 py-16 bg-white/50">
          <div className="max-w-5xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mb-4">
                  ¿Por qué necesitas un refugio espiritual?
                </h2>
                <p className="text-texto/70 max-w-2xl mx-auto">
                  En un mundo lleno de ruido y distracciones, encontrar un espacio para conectar con Dios puede ser difícil. Refugio en la Palabra te ofrece ese espacio sagrado, siempre disponible.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid md:grid-cols-3 gap-8">
              <AnimateOnScroll delay={100}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-albero/10 rounded-2xl flex items-center justify-center mx-auto p-3">
                    <Image src="/icons/calendario-icon.png" alt="Sin tiempo" width={48} height={48} />
                  </div>
                  <h3 className="font-semibold text-azul">Sin tiempo para orar</h3>
                  <p className="text-sm text-texto/70">El ritmo diario te consume y la oración queda relegada. Necesitas algo que se adapte a tu vida.</p>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={200}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-albero/10 rounded-2xl flex items-center justify-center mx-auto p-3">
                    <Image src="/icons/confianza-icon.png" alt="Dudas" width={48} height={48} />
                  </div>
                  <h3 className="font-semibold text-azul">Dudas sin respuesta</h3>
                  <p className="text-sm text-texto/70">Tienes preguntas sobre la fe pero no siempre hay alguien disponible para orientarte.</p>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={300}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-albero/10 rounded-2xl flex items-center justify-center mx-auto p-3">
                    <Image src="/icons/mundo-icon.png" alt="Apps" width={48} height={48} />
                  </div>
                  <h3 className="font-semibold text-azul">Apps que no conectan</h3>
                  <p className="text-sm text-texto/70">Las apps genéricas de meditación no entienden tu fe católica ni tus tradiciones.</p>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Características principales */}
        <section id="caracteristicas" className="px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <span className="text-albero font-medium text-sm uppercase tracking-wider">Características</span>
                <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4">
                  Todo lo que necesitas para tu vida espiritual
                </h2>
                <p className="text-texto/70 max-w-2xl mx-auto">
                  Diseñado por católicos, para católicos. Cada función está pensada para acercarte más a Dios.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="group bg-white rounded-2xl p-8 space-y-4 border border-azul/5 hover:border-albero/30 hover:shadow-xl hover:shadow-albero/5 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-albero/20 to-dorado/20 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <Image src="/icons/rosario-icon.png" alt="Rosario" width={40} height={40} />
                </div>
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  Rosario guiado con audio
                </h3>
                <p className="text-texto/70 leading-relaxed">
                  Reza cada misterio con guía paso a paso, meditaciones profundas y música sacra que te ayuda a concentrarte. Personaliza la duración según tu tiempo disponible.
                </p>
                <ul className="space-y-2 text-sm text-texto/60">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Todos los misterios
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Audio en español
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Meditaciones personalizadas
                  </li>
                </ul>
              </div>

              <div className="group bg-white rounded-2xl p-8 space-y-4 border border-azul/5 hover:border-albero/30 hover:shadow-xl hover:shadow-albero/5 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-albero/20 to-dorado/20 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <Image src="/icons/gospel-icon.png" alt="Evangelio" width={40} height={40} />
                </div>
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  Evangelio del día comentado
                </h3>
                <p className="text-texto/70 leading-relaxed">
                  Recibe cada mañana las lecturas del día con reflexiones que conectan el Evangelio con tu vida cotidiana. Ideal para la Lectio Divina.
                </p>
                <ul className="space-y-2 text-sm text-texto/60">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Lecturas sincronizadas con la liturgia
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Reflexiones contextuales
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Santo del día
                  </li>
                </ul>
              </div>

              <div className="group bg-white rounded-2xl p-8 space-y-4 border border-azul/5 hover:border-albero/30 hover:shadow-xl hover:shadow-albero/5 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-albero/20 to-dorado/20 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <Image src="/icons/chat-icon.png" alt="Chat" width={40} height={40} />
                </div>
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  Consultor espiritual IA
                </h3>
                <p className="text-texto/70 leading-relaxed">
                  Un guía virtual formado en doctrina católica que responde tus dudas sobre fe, moral y espiritualidad. Disponible 24/7 cuando necesites orientación.
                </p>
                <ul className="space-y-2 text-sm text-texto/60">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Basado en el Catecismo
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Respuestas con fuentes
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Disponible siempre
                  </li>
                </ul>
              </div>

              <div className="group bg-white rounded-2xl p-8 space-y-4 border border-azul/5 hover:border-albero/30 hover:shadow-xl hover:shadow-albero/5 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-albero/20 to-dorado/20 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <Image src="/icons/logros-icon.png" alt="Logros" width={40} height={40} />
                </div>
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  Logros y constancia
                </h3>
                <p className="text-texto/70 leading-relaxed">
                  Mantén tu compromiso espiritual con un sistema de medallas y rachas que celebra tu constancia en la oración. Pequeños pasos, grandes frutos.
                </p>
                <ul className="space-y-2 text-sm text-texto/60">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Rachas de oración
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Medallas especiales
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-albero" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Estadísticas de progreso
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="px-6 py-20 bg-gradient-to-b from-white/50 to-marfil">
          <div className="max-w-5xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <span className="text-albero font-medium text-sm uppercase tracking-wider">Así de fácil</span>
                <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4">
                  Empieza en 3 simples pasos
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Línea conectora */}
              <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-albero/20 via-albero to-albero/20"></div>

              <div className="text-center space-y-4 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-albero to-dorado text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto relative z-10 shadow-lg shadow-albero/20">
                  1
                </div>
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  Únete a la lista
                </h3>
                <p className="text-texto/70 text-sm">
                  Regístrate con tu email para ser de los primeros en saber cuando lancemos.
                </p>
              </div>

              <div className="text-center space-y-4 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-albero to-dorado text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto relative z-10 shadow-lg shadow-albero/20">
                  2
                </div>
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  Recibe el aviso
                </h3>
                <p className="text-texto/70 text-sm">
                  Te notificaremos por email cuando la app esté lista, antes que nadie.
                </p>
              </div>

              <div className="text-center space-y-4 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-albero to-dorado text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto relative z-10 shadow-lg shadow-albero/20">
                  3
                </div>
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  Empieza a orar
                </h3>
                <p className="text-texto/70 text-sm">
                  Accede a la app y comienza tu camino espiritual con las herramientas que necesitas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Diferenciadores */}
        <section className="px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <span className="text-albero font-medium text-sm uppercase tracking-wider">Único en su clase</span>
                <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4">
                  ¿Qué nos hace diferentes?
                </h2>
              <p className="text-texto/70 max-w-2xl mx-auto">
                No somos una app genérica de meditación. Somos católicos creando para católicos.
              </p>
              </div>
            </AnimateOnScroll>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4 p-6 bg-white/80 rounded-xl border border-azul/5">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-azul mb-1">100% Católico</h3>
                  <p className="text-sm text-texto/70">Contenido fiel al Magisterio de la Iglesia, no sincretismo ni meditaciones genéricas.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/80 rounded-xl border border-azul/5">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-azul mb-1">En español nativo</h3>
                  <p className="text-sm text-texto/70">Pensado y creado originalmente en español, no traducciones de apps americanas.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/80 rounded-xl border border-azul/5">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-azul mb-1">IA formada en doctrina</h3>
                  <p className="text-sm text-texto/70">Nuestro consultor está entrenado con el Catecismo, Escrituras y documentos del Magisterio.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/80 rounded-xl border border-azul/5">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-azul mb-1">Privacidad garantizada</h3>
                  <p className="text-sm text-texto/70">Tu vida espiritual es sagrada. No vendemos datos ni usamos tracking invasivo.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/80 rounded-xl border border-azul/5">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-azul mb-1">Web app universal</h3>
                  <p className="text-sm text-texto/70">Funciona en cualquier dispositivo sin descargas. Accede desde móvil, tablet o PC.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/80 rounded-xl border border-azul/5">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-azul mb-1">Comunidad cercana</h3>
                  <p className="text-sm text-texto/70">Equipo pequeño que escucha feedback. Tu opinión moldea el producto.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección Comunidad */}
        <section className="px-6 py-20 bg-gradient-to-b from-marfil to-white/50 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Texto */}
              <AnimateOnScroll>
                <div className="space-y-6 text-center lg:text-left">
                  <span className="text-albero font-medium text-sm uppercase tracking-wider">Comunidad</span>
                <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul">
                  No caminas solo
                </h2>
                <p className="text-texto/80 text-lg leading-relaxed">
                  Únete a grupos de oración, participa en eventos y conecta con otros católicos que comparten tu fe. Juntos es más fácil.
                </p>
                <ul className="space-y-3 text-texto/70">
                  <li className="flex items-center gap-3 justify-center lg:justify-start">
                    <svg className="w-5 h-5 text-albero flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Grupos de oración y estudio
                  </li>
                  <li className="flex items-center gap-3 justify-center lg:justify-start">
                    <svg className="w-5 h-5 text-albero flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Calendario de eventos católicos
                  </li>
                  <li className="flex items-center gap-3 justify-center lg:justify-start">
                    <svg className="w-5 h-5 text-albero flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Comparte tu camino de fe
                  </li>
                </ul>
                </div>
              </AnimateOnScroll>

              {/* Mockup */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-albero/20 to-dorado/20 rounded-[3rem] blur-2xl scale-110"></div>
                  <div className="relative w-56 sm:w-64 animate-float">
                    <div className="bg-azul rounded-[2.5rem] p-2 shadow-2xl shadow-azul/30">
                      <Image
                        src="/comunidad.jpeg"
                        alt="Comunidad de Refugio"
                        width={260}
                        height={520}
                        className="rounded-[2rem] w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quiénes somos */}
        <section id="testimonios" className="px-6 py-20 bg-azul text-white">
          <div className="max-w-5xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <span className="text-albero font-medium text-sm uppercase tracking-wider">Quiénes somos</span>
                <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold mt-3 mb-4">
                  Somos Aida y Bosco
                </h2>
                <p className="text-white/70 max-w-2xl mx-auto">
                  Una pareja de España que un día se encontró con más preguntas que respuestas. Buscábamos algo que nos ayudara, pero no existía. Así que lo creamos juntos.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-albero/30 to-dorado/30 rounded-xl flex items-center justify-center p-2">
                  <Image src="/icons/calendario-icon.png" alt="Tiempo" width={40} height={40} />
                </div>
                <h3 className="font-semibold text-lg">Sacamos tiempo de donde no lo hay</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Trabajamos en cada rato libre. Y cuando no lo tenemos, lo buscamos. Este proyecto nace del esfuerzo de los dos, juntos.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-albero/30 to-dorado/30 rounded-xl flex items-center justify-center p-2">
                  <Image src="/icons/comunidad-icon.png" alt="Equipo" width={40} height={40} />
                </div>
                <h3 className="font-semibold text-lg">Nos complementamos</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Aida da vida a lo visual, Bosco lo construye. Pero cada idea nace entre los dos. Sin el uno, el otro no tendría sentido.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-albero/30 to-dorado/30 rounded-xl flex items-center justify-center p-2">
                  <Image src="/icons/amor-icon.png" alt="Propósito" width={40} height={40} />
                </div>
                <h3 className="font-semibold text-lg">Hecho con propósito</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Empezó siendo para nosotros, pero la gente nos lo fue pidiendo. Si nos ayudó a nosotros, quizá pueda ayudarte a ti.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Formulario de Waitlist */}
        <section id="unete" className="px-6 py-20">
          <AnimateOnScroll className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-white to-marfil rounded-3xl p-8 sm:p-12 shadow-xl shadow-azul/5 border border-azul/5">
              <div className="text-center space-y-4 mb-8">
                <div className="inline-flex items-center gap-2 bg-albero/10 text-albero px-4 py-2 rounded-full text-sm font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-albero opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-albero"></span>
                  </span>
                  Únete a la comunidad
                </div>
                <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul">
                  Sé parte de Refugio desde el principio
                </h2>
                <p className="text-texto/70">
                  Únete a nuestra lista de espera y te avisaremos en cuanto la app esté disponible. Además, te tenemos preparada una sorpresa...
                </p>
              </div>

              <WaitlistForm />

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-texto/50">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Datos protegidos
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Sin spam
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Baja cuando quieras
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 py-20 bg-white/50">
          <div className="max-w-3xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <span className="text-albero font-medium text-sm uppercase tracking-wider">FAQ</span>
                <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3">
                  Preguntas frecuentes
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="space-y-4">
              <details className="group bg-white rounded-xl border border-azul/10 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-azul hover:bg-marfil/50 transition-colors">
                  ¿Cuándo estará disponible la aplicación?
                  <svg className="w-5 h-5 text-texto/50 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-texto/70">
                  Estamos en fase final de desarrollo. Los miembros de la lista de espera serán los primeros en recibir acceso cuando lancemos. Estimamos que será en las próximas semanas.
                </div>
              </details>

              <details className="group bg-white rounded-xl border border-azul/10 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-azul hover:bg-marfil/50 transition-colors">
                  ¿Es compatible con mi dispositivo?
                  <svg className="w-5 h-5 text-texto/50 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-texto/70">
                  Refugio en la Palabra es una aplicación web que funciona en cualquier dispositivo moderno: móvil, tablet o computadora. Solo necesitas un navegador actualizado. No requiere descargas.
                </div>
              </details>

              <details className="group bg-white rounded-xl border border-azul/10 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-azul hover:bg-marfil/50 transition-colors">
                  ¿Por qué unirme a la lista de espera?
                  <svg className="w-5 h-5 text-texto/50 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-texto/70">
                  Serás de los primeros en saber cuando lancemos. Recibirás emails con contenido espiritual mientras esperamos juntos. Y entre nosotros... te tenemos preparada una sorpresa especial por confiar desde el principio.
                </div>
              </details>

              <details className="group bg-white rounded-xl border border-azul/10 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-azul hover:bg-marfil/50 transition-colors">
                  ¿Cómo funciona el consultor espiritual IA?
                  <svg className="w-5 h-5 text-texto/50 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-texto/70">
                  Es un asistente de inteligencia artificial entrenado específicamente con fuentes católicas: el Catecismo, las Escrituras, documentos del Magisterio y enseñanzas de santos. Puede responder dudas sobre la fe, orientarte en situaciones difíciles y acompañarte en tu camino espiritual. No reemplaza a un sacerdote, pero está disponible 24/7 para cuando necesites orientación.
                </div>
              </details>

              <details className="group bg-white rounded-xl border border-azul/10 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-azul hover:bg-marfil/50 transition-colors">
                  ¿Cuánto costará la aplicación?
                  <svg className="w-5 h-5 text-texto/50 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-texto/70">
                  Habrá una versión gratuita con funciones esenciales. Los miembros de la lista de espera recibirán beneficios especiales en la versión premium. Nuestro objetivo es que el precio nunca sea una barrera para acercarse a Dios.
                </div>
              </details>

              <details className="group bg-white rounded-xl border border-azul/10 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-azul hover:bg-marfil/50 transition-colors">
                  ¿Mis datos están seguros?
                  <svg className="w-5 h-5 text-texto/50 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-texto/70">
                  Absolutamente. Cumplimos con el RGPD y la normativa española de protección de datos. No vendemos ni compartimos tus datos con terceros. Tu vida espiritual es sagrada y merece la máxima privacidad.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="px-6 py-20">
          <AnimateOnScroll className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl lg:text-5xl font-semibold text-azul">
              Tu camino espiritual comienza con un paso
            </h2>
            <p className="text-lg text-texto/70 max-w-2xl mx-auto">
              Únete a quienes ya esperan Refugio en la Palabra. El primer paso es el más importante.
            </p>
            <a
              href="#unete"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-albero to-dorado text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-albero/20 transition-all duration-300"
            >
              Únete a la lista de espera
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </AnimateOnScroll>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-azul text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Logo y descripción */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-512-1.png"
                  alt="Refugio en la Palabra"
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <span className="font-[family-name:var(--font-lora)] text-xl font-semibold">
                  Refugio en la Palabra
                </span>
              </div>
              <p className="text-white/70 text-sm max-w-md">
                Tu espacio diario para orar, comprender y avanzar con sentido. Una herramienta católica diseñada para fortalecer tu fe y acompañarte en tu camino espiritual.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="https://www.instagram.com/refugioenlapalabra_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Enlaces */}
            <div className="space-y-4">
              <h3 className="font-semibold">Navegación</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><a href="#caracteristicas" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a></li>
                <li><a href="#testimonios" className="hover:text-white transition-colors">Quiénes somos</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Preguntas frecuentes</a></li>
                <li><a href="#unete" className="hover:text-white transition-colors">Únete</a></li>
                <li><Link href="/descargar" className="hover:text-white transition-colors">Instalar App</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><Link href="/descargar" className="hover:text-white transition-colors font-medium text-albero">Instalar App</Link></li>
                <li><Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                <li><Link href="/legal" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
                <li><Link href="/legal#cookies" className="hover:text-white transition-colors">Política de Cookies</Link></li>
                <li><Link href="/feedback" className="hover:text-white transition-colors">Enviar Feedback</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>© {new Date().getFullYear()} Refugio en la Palabra. Todos los derechos reservados.</p>
            <p className="flex items-center gap-1">
              Hecho con
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              en España
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
