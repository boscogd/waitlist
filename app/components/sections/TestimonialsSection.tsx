import Image from 'next/image';
import AnimateOnScroll from '../AnimateOnScroll';
import SectionHeader from '../ui/SectionHeader';
import WaitlistCounter from '../WaitlistCounter';
import InstagramBadge from '../InstagramBadge';
import { trustSeals } from '@/lib/content/testimonials';

export default function TestimonialsSection() {
  return (
    <section className="px-6 py-20 bg-white/50">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="La comunidad crece"
              eyebrowClassName="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider"
              title="Por qué confían en Refugio"
              titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4"
            />
          </div>
        </AnimateOnScroll>

        {/* Cifras reales y vivas: personas que ya rezan y comunidad de Instagram */}
        <AnimateOnScroll delay={50}>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <WaitlistCounter />
            <InstagramBadge />
          </div>
        </AnimateOnScroll>

        {/* Sellos honestos del proyecto (sin personas ni frases inventadas) */}
        <div className="grid md:grid-cols-3 gap-8">
          {trustSeals.map((seal) => (
            <AnimateOnScroll key={seal.title} delay={seal.delay}>
              <div className="bg-white rounded-2xl p-6 border border-azul/5 shadow-sm space-y-4 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-albero/30 to-dorado/30 rounded-xl flex items-center justify-center p-2">
                  <Image src={seal.icon} alt={seal.iconAlt} width={40} height={40} />
                </div>
                <h3 className="font-semibold text-lg text-azul">{seal.title}</h3>
                <p className="text-texto/70 text-sm leading-relaxed">
                  {seal.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
