import Link from 'next/link';
import AnimateOnScroll from '../AnimateOnScroll';
import InstallVideoTabs from '../InstallVideoTabs';
import SectionHeader from '../ui/SectionHeader';
import { IconArrowRight } from '../icons';

const STEPS = [
  {
    title: 'Instálala en 30 segundos',
    description:
      'Directamente desde el navegador, sin tiendas ni descargas. En medio minuto la tienes lista en tu móvil.',
  },
  {
    title: 'Elige tu momento de oración',
    description:
      'Ábrela y escoge cuándo quieres rezar. Tú marcas el ritmo y la app se adapta a tu día.',
  },
  {
    title: 'Reza acompañado cada día',
    description:
      'Rosario guiado, Evangelio comentado y tu compañero de fe siempre a mano para crecer día a día.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="como-funciona" className="px-6 py-20 bg-gradient-to-b from-white/50 to-marfil scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Pasos en vertical */}
          <AnimateOnScroll>
            <div className="text-center lg:text-left">
              <SectionHeader
                eyebrow="Así de fácil"
                eyebrowClassName="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider"
                title="Empieza en 3 simples pasos"
                titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4"
                subtitle="No hay que registrarse en ninguna tienda ni esperar descargas. Mira el vídeo y sigue los pasos."
                subtitleClassName="text-texto/70 max-w-lg mx-auto lg:mx-0"
              />
            </div>

            <ol className="mt-10 relative space-y-8 text-left">
              {/* Línea conectora vertical */}
              <div
                aria-hidden="true"
                className="absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-albero/20 via-albero to-albero/20"
              />
              {STEPS.map((step, i) => (
                <li key={step.title} className="relative flex gap-5">
                  <div className="relative z-10 w-14 h-14 shrink-0 bg-marfil border-2 border-albero text-azul rounded-full flex items-center justify-center text-xl font-bold">
                    {i + 1}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-texto/70 text-sm leading-relaxed max-w-md">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 text-center lg:text-left">
              <Link
                href="/descargar"
                data-track="cta_click"
                data-track-where="como-funciona"
                className="group inline-flex items-center gap-2 bg-azul text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-azul-800 hover:shadow-lg hover:shadow-azul/20 transition-all duration-300"
              >
                Ver la guía completa de instalación
                <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </AnimateOnScroll>

          {/* Vídeo dentro de un móvil */}
          <AnimateOnScroll delay={150}>
            <InstallVideoTabs />
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
