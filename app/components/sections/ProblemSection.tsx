import Image from 'next/image';
import AnimateOnScroll from '../AnimateOnScroll';
import SectionHeader from '../ui/SectionHeader';

export default function ProblemSection() {
  return (
    <section className="px-6 py-16 bg-white/50">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <SectionHeader
              title="¿Por qué necesitas un refugio espiritual?"
              titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mb-4"
              subtitle="En un mundo lleno de ruido y distracciones, encontrar un espacio para conectar con Dios puede ser difícil. Refugio en la Palabra te ofrece ese espacio sagrado, siempre disponible."
              subtitleClassName="text-texto/70 max-w-2xl mx-auto"
            />
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-8">
          <AnimateOnScroll delay={100}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-albero/10 rounded-2xl flex items-center justify-center mx-auto p-3">
                <Image src="/icons/calendario-icon.png" alt="Calendario que ilustra la falta de tiempo para orar cada día" width={48} height={48} />
              </div>
              <h3 className="font-semibold text-azul">Sin tiempo para orar</h3>
              <p className="text-sm text-texto/70">El ritmo diario te consume y la oración queda relegada. Necesitas algo que se adapte a tu vida.</p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-albero/10 rounded-2xl flex items-center justify-center mx-auto p-3">
                <Image src="/icons/confianza-icon.png" alt="Icono que representa las dudas de fe sin respuesta" width={48} height={48} />
              </div>
              <h3 className="font-semibold text-azul">Dudas sin respuesta</h3>
              <p className="text-sm text-texto/70">Tienes preguntas sobre la fe pero no siempre hay alguien disponible para orientarte.</p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={300}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-albero/10 rounded-2xl flex items-center justify-center mx-auto p-3">
                <Image src="/icons/mundo-icon.png" alt="Globo terráqueo que simboliza las apps genéricas que no conectan con la fe católica" width={48} height={48} />
              </div>
              <h3 className="font-semibold text-azul">Apps que no conectan</h3>
              <p className="text-sm text-texto/70">Las apps genéricas de meditación no entienden tu fe católica ni tus tradiciones.</p>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
