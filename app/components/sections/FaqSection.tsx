import AnimateOnScroll from '../AnimateOnScroll';
import SectionHeader from '../ui/SectionHeader';
import { IconChevronDown } from '../icons';
import { faqs } from '@/lib/content/faqs';

export default function FaqSection() {
  // El JSON-LD de FAQPage se inyecta desde page.tsx usando el MISMO array `faqs`.
  return (
    <section id="faq" className="px-6 py-20 bg-white/50">
      <div className="max-w-3xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="FAQ"
              eyebrowClassName="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider"
              title="Preguntas frecuentes"
              titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3"
            />
          </div>
        </AnimateOnScroll>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="group bg-white rounded-xl border border-azul/10 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-azul hover:bg-marfil/50 transition-colors">
                {faq.question}
                <IconChevronDown className="w-5 h-5 text-texto/50 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-texto/70">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
