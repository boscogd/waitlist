import AnimateOnScroll from '../AnimateOnScroll';
import SectionHeader from '../ui/SectionHeader';
import { IconCheckStroke } from '../icons';
import { differentiators } from '@/lib/content/differentiators';

export default function DifferentiatorsSection() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <SectionHeader
              eyebrow="Único en su clase"
              eyebrowClassName="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider"
              title="¿Qué nos hace diferentes?"
              titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4"
              subtitle="No somos una app genérica de meditación. Somos católicos creando para católicos."
              subtitleClassName="text-texto/70 max-w-2xl mx-auto"
            />
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 gap-6">
          {differentiators.map((item) => (
            <div key={item.title} className="flex gap-4 p-6 bg-white rounded-xl border border-azul/5 hover:border-albero/30 hover:shadow-xl hover:shadow-albero/5 transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <IconCheckStroke className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-azul mb-1">{item.title}</h3>
                <p className="text-sm text-texto/70">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
