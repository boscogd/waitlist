import AnimateOnScroll from '../AnimateOnScroll';
import SectionHeader from '../ui/SectionHeader';
import { IconStar } from '../icons';
import { testimonials } from '@/lib/content/testimonials';

export default function TestimonialsSection() {
  return (
    <section className="px-6 py-20 bg-white/50">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="Testimonios"
              eyebrowClassName="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider"
              title="Lo que dice nuestra comunidad"
              titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4"
            />
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <AnimateOnScroll key={testimonial.name} delay={testimonial.delay}>
              <div className="bg-white rounded-2xl p-6 border border-azul/5 shadow-sm space-y-4">
                {/* Las estrellas son decorativas; el conjunto se anuncia como una sola imagen */}
                <div className="flex gap-1" role="img" aria-label="Valoración: 5 de 5">
                  {[1,2,3,4,5].map(i => (
                    <IconStar key={i} className="w-5 h-5 text-albero" />
                  ))}
                </div>
                <p className="text-texto/80 text-sm leading-relaxed italic">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-albero/30 to-dorado/30 rounded-full flex items-center justify-center text-azul font-semibold text-sm">
                    {testimonial.initial}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-azul">{testimonial.name}</p>
                    <p className="text-xs text-texto/70">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
