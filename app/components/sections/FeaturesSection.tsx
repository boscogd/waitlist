import Image from 'next/image';
import AnimateOnScroll from '../AnimateOnScroll';
import SectionHeader from '../ui/SectionHeader';
import { IconCheckAlbero } from '../icons';
import { features } from '@/lib/content/features';

export default function FeaturesSection() {
  return (
    <section id="caracteristicas" className="px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <SectionHeader
              eyebrow="Características"
              eyebrowClassName="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider"
              title="Todo lo que necesitas para tu vida espiritual"
              titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4"
              subtitle="Diseñado por católicos, para católicos. Cada función está pensada para acercarte más a Dios."
              subtitleClassName="text-texto/70 max-w-2xl mx-auto"
            />
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="group bg-white rounded-2xl p-8 space-y-4 border border-azul/5 hover:border-albero/30 hover:shadow-xl hover:shadow-albero/5 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-albero/20 to-dorado/20 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                <Image src={feature.icon} alt={feature.iconAlt} width={40} height={40} />
              </div>
              <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                {feature.title}
              </h3>
              <p className="text-texto/70 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-2 text-sm text-texto/60">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2">
                    <IconCheckAlbero className="w-4 h-4 text-albero" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
