import AnimateOnScroll from '../AnimateOnScroll';
import PhoneFrame from '../PhoneFrame';
import { IconCheckCircle } from '../icons';

export default function CommunitySection() {
  return (
    <section className="px-6 py-20 bg-gradient-to-b from-marfil to-white/50 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <AnimateOnScroll>
            <div className="space-y-6 text-center lg:text-left">
              <span className="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider">Comunidad</span>
              <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul">
                No caminas solo
              </h2>
              <p className="text-texto/80 text-lg leading-relaxed">
                Únete a grupos de oración, participa en eventos y conecta con otros católicos que comparten tu fe. Juntos es más fácil.
              </p>
              <ul className="space-y-3 text-texto/70">
                <li className="flex items-center gap-3 justify-center lg:justify-start">
                  <IconCheckCircle className="w-5 h-5 text-albero flex-shrink-0" />
                  Grupos de oración y estudio
                </li>
                <li className="flex items-center gap-3 justify-center lg:justify-start">
                  <IconCheckCircle className="w-5 h-5 text-albero flex-shrink-0" />
                  Calendario de eventos católicos
                </li>
                <li className="flex items-center gap-3 justify-center lg:justify-start">
                  <IconCheckCircle className="w-5 h-5 text-albero flex-shrink-0" />
                  Comparte tu camino de fe
                </li>
              </ul>
            </div>
          </AnimateOnScroll>

          {/* Pantalla real de Comunidad */}
          <AnimateOnScroll delay={100}>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-albero/25 to-azul/10 rounded-[3rem] blur-2xl scale-110"></div>
                <div className="relative animate-float">
                  <PhoneFrame
                    src="/app/comunidad.jpg"
                    alt="Pantalla de Comunidad de la app: buscador de comunidades, la lista Mis Comunidades con los grupos Effetá San Vicente y Corpus Christi, y el calendario semanal de próximos eventos."
                    sizes="(max-width: 640px) 224px, 272px"
                    className="w-56 sm:w-68"
                  />
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
