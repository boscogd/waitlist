import Image from 'next/image';
import AnimateOnScroll from '../AnimateOnScroll';
import SectionHeader from '../ui/SectionHeader';

export default function AboutSection() {
  return (
    <section id="nosotros" className="px-6 py-20 bg-azul text-white">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="Quiénes somos"
              eyebrowClassName="text-albero font-medium text-sm uppercase tracking-wider"
              title="Somos Aida y Bosco"
              titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold mt-3 mb-4"
              subtitle="Una pareja de España que un día se encontró con más preguntas que respuestas. Buscábamos algo que nos ayudara, pero no existía. Así que lo creamos juntos."
              subtitleClassName="text-white/70 max-w-2xl mx-auto"
            />
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            <div className="w-14 h-14 bg-gradient-to-br from-albero/30 to-dorado/30 rounded-xl flex items-center justify-center p-2">
              <Image src="/icons/calendario-icon.png" alt="Calendario que representa el tiempo que Aida y Bosco dedican al proyecto" width={40} height={40} />
            </div>
            <h3 className="font-semibold text-lg">Sacamos tiempo de donde no lo hay</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Trabajamos en cada rato libre. Y cuando no lo tenemos, lo buscamos. Este proyecto nace del esfuerzo de los dos, juntos.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            <div className="w-14 h-14 bg-gradient-to-br from-albero/30 to-dorado/30 rounded-xl flex items-center justify-center p-2">
              <Image src="/icons/comunidad-icon.png" alt="Icono de equipo que representa a Aida y Bosco trabajando juntos" width={40} height={40} />
            </div>
            <h3 className="font-semibold text-lg">Nos complementamos</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Aida da vida a lo visual, Bosco lo construye. Pero cada idea nace entre los dos. Sin el uno, el otro no tendría sentido.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            <div className="w-14 h-14 bg-gradient-to-br from-albero/30 to-dorado/30 rounded-xl flex items-center justify-center p-2">
              <Image src="/icons/amor-icon.png" alt="Corazón que simboliza el propósito de ayudar a otros con la app" width={40} height={40} />
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
