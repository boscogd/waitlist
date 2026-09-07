import Image from 'next/image';
import Link from 'next/link';
import HeroPhone from '../HeroPhone';
import { IconArrowRight, IconCheckCircle } from '../icons';

export default function HeroSection() {
  return (
    <section className="relative px-6 py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Fondo: luces suaves de marca + la cruz del logo como marca de agua */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-aurora absolute -top-40 right-[-12%] h-[34rem] w-[34rem] rounded-full bg-albero/25 blur-3xl" />
        <div className="animate-aurora-slow absolute bottom-[-10rem] left-[-14%] h-[30rem] w-[30rem] rounded-full bg-azul/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-3xl" />
        <Image
          src="/brand/rp-mark.png"
          alt=""
          width={534}
          height={572}
          className="absolute right-[-3rem] top-[-2rem] w-[26rem] rotate-[8deg] opacity-[0.06] hidden lg:block"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Contenido izquierdo */}
          <div className="space-y-6 text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-albero/40 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-[#8a6d1f] animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dorado opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-dorado" />
              </span>
              App católica · Ya disponible
            </p>

            {/* Título principal */}
            <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl lg:text-6xl font-semibold text-azul leading-tight tracking-tight text-balance animate-fade-in-up animation-delay-100">
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
                data-track="cta_click"
                data-track-where="hero"
                className="group bg-gradient-to-r from-azul to-azul-800 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-azul/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                Instalar gratis
                <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-xs text-texto/70">
                Se instala desde tu navegador en 30 s · Sin App Store ni Google Play
              </p>
            </div>

            {/* Garantías rápidas (las cifras van en la franja de debajo) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-2 text-sm text-texto/60 animate-fade-in-up animation-delay-400">
              <div className="flex items-center gap-2">
                <IconCheckCircle className="w-4 h-4 text-albero" />
                <span>Gratis</span>
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

          {/* La app en movimiento */}
          <div className="relative animate-fade-in-up animation-delay-200">
            <HeroPhone />
          </div>

        </div>
      </div>
    </section>
  );
}
