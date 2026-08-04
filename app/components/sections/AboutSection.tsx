import Image from 'next/image';
import AnimateOnScroll from '../AnimateOnScroll';
import SectionHeader from '../ui/SectionHeader';

export default function AboutSection() {
  return (
    <section id="nosotros" className="px-6 py-20 bg-azul text-white">
      <div className="max-w-5xl mx-auto">
        {/* Bloque de texto + hueco para la foto real de los fundadores */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
          <AnimateOnScroll>
            <div className="text-center md:text-left">
              <SectionHeader
                eyebrow="Quiénes somos"
                eyebrowClassName="text-albero font-medium text-sm uppercase tracking-wider"
                title="Somos Aida y Bosco"
                titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold mt-3 mb-4"
                subtitle="Una pareja de España que un día se encontró con más preguntas que respuestas. Buscábamos algo que nos ayudara, pero no existía. Así que lo creamos juntos."
                subtitleClassName="text-white/70 md:mx-0"
              />
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            {/* TODO: sustituir por foto real de Aida y Bosco */}
            {/* Cuando exista la foto: <Image src="/aida-bosco.jpg" alt="Aida y Bosco, fundadores de Refugio" fill className="object-cover" /> dentro de este contenedor */}
            <div className="relative aspect-[4/3] w-full rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 overflow-hidden flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center p-3">
                <Image
                  src="/logo-refugio.png"
                  alt="Logo de Refugio en la Palabra"
                  width={72}
                  height={72}
                  className="opacity-90"
                />
              </div>
              <p className="text-white/50 text-sm">Foto de Aida y Bosco</p>
            </div>
          </AnimateOnScroll>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-albero/30 to-dorado/30 rounded-xl flex items-center justify-center p-2">
              <Image src="/icons/calendario-icon.png" alt="Calendario que representa el tiempo que Aida y Bosco dedican al proyecto" width={56} height={56} />
            </div>
            <h3 className="font-semibold text-lg">Sacamos tiempo de donde no lo hay</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Trabajamos en cada rato libre. Y cuando no lo tenemos, lo buscamos. Este proyecto nace del esfuerzo de los dos, juntos.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-albero/30 to-dorado/30 rounded-xl flex items-center justify-center p-2">
              <Image src="/icons/comunidad-icon.png" alt="Icono de equipo que representa a Aida y Bosco trabajando juntos" width={56} height={56} />
            </div>
            <h3 className="font-semibold text-lg">Nos complementamos</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Aida da vida a lo visual, Bosco lo construye. Pero cada idea nace entre los dos. Sin el uno, el otro no tendría sentido.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-albero/30 to-dorado/30 rounded-xl flex items-center justify-center p-2">
              <Image src="/icons/amor-icon.png" alt="Corazón que simboliza el propósito de ayudar a otros con la app" width={56} height={56} />
            </div>
            <h3 className="font-semibold text-lg">Hecho con propósito</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Empezó siendo para nosotros, pero la gente nos lo fue pidiendo. Si nos ayudó a nosotros, quizá pueda ayudarte a ti.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
