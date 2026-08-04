import Link from 'next/link';
import WaitlistCounter from '../WaitlistCounter';
import Parallax from '../Parallax';
import PhoneCarousel from '../PhoneCarousel';
import { IconArrowRight, IconCheckCircle } from '../icons';

export default function HeroSection() {
  return (
    <section className="px-6 py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Contenido izquierdo */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Título principal */}
            <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl lg:text-6xl font-semibold text-azul leading-tight tracking-tight animate-fade-in-up animation-delay-100">
              Tu refugio diario para{' '}
              <span className="text-[#8a6d1f]">
                crecer en la fe
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-lg sm:text-xl text-texto/80 max-w-md sm:max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up animation-delay-200 px-2 sm:px-0">
              Reza el Rosario guiado, reflexiona con el Evangelio diario y resuelve tus dudas de fe 24/7 con inteligencia artificial católica.
            </p>

            {/* CTA Principal */}
            <div className="flex flex-col items-center lg:items-start gap-2 pt-2 animate-fade-in-up animation-delay-300">
              <Link
                href="/descargar"
                className="group bg-gradient-to-r from-azul to-azul-800 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-azul/20 transition-all duration-300 flex items-center gap-2"
              >
                Instalar gratis
                <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-xs text-texto/70">
                Se instala desde tu navegador en 30 s · Sin App Store ni Google Play
              </p>
            </div>

            {/* Prueba social rápida */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-sm text-texto/60 animate-fade-in-up animation-delay-400">
              <WaitlistCounter />
              <div className="flex items-center gap-2">
                <IconCheckCircle className="w-4 h-4 text-albero" />
                <span>Descarga gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <IconCheckCircle className="w-4 h-4 text-albero" />
                <span>Sin anuncios</span>
              </div>
              <div className="flex items-center gap-2">
                <IconCheckCircle className="w-4 h-4 text-albero" />
                <span>Hecho en España</span>
              </div>
            </div>
          </div>

          {/* Mockups derecha */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in-up animation-delay-200">
            <Parallax className="relative w-full max-w-md lg:max-w-lg">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-albero/20 to-dorado/20 rounded-[3rem] blur-3xl scale-110"></div>

              {/* Carrusel circular de móviles (en redondo, arrastrable) */}
              <PhoneCarousel />
            </Parallax>
          </div>

        </div>
      </div>
    </section>
  );
}
