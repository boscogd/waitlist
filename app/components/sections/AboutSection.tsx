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
            <div className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-2xl bg-white/10 border border-white/10 overflow-hidden shadow-2xl shadow-black/20">
              <Image
                src="/aida-bosco.jpg"
                alt="Aida y Bosco, fundadores de Refugio en la Palabra, mostrando la app"
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-cover object-top"
              />
            </div>
          </AnimateOnScroll>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            {/* Circulo claro tras el icono: da contraste a la ilustracion azul+dorado sobre el fondo azul */}
            <div className="w-[72px] h-[72px] bg-marfil rounded-full flex items-center justify-center p-3">
              <Image src="/icons/calendario-icon.png" alt="Calendario que representa el tiempo que Aida y Bosco dedican al proyecto" width={48} height={48} />
            </div>
            <h3 className="font-semibold text-lg">Sacamos tiempo de donde no lo hay</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Trabajamos en cada rato libre. Y cuando no lo tenemos, lo buscamos. Este proyecto nace del esfuerzo de los dos, juntos.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            {/* Circulo claro tras el icono: da contraste a la ilustracion azul+dorado sobre el fondo azul */}
            <div className="w-[72px] h-[72px] bg-marfil rounded-full flex items-center justify-center p-3">
              <Image src="/icons/comunidad-icon.png" alt="Icono de equipo que representa a Aida y Bosco trabajando juntos" width={48} height={48} />
            </div>
            <h3 className="font-semibold text-lg">Nos complementamos</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Aida da vida a lo visual, Bosco lo construye. Pero cada idea nace entre los dos. Sin el uno, el otro no tendría sentido.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            {/* Circulo claro tras el icono: da contraste a la ilustracion azul+dorado sobre el fondo azul */}
            <div className="w-[72px] h-[72px] bg-marfil rounded-full flex items-center justify-center p-3">
              <Image src="/icons/amor-icon.png" alt="Corazón que simboliza el propósito de ayudar a otros con la app" width={48} height={48} />
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
