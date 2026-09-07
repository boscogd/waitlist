import Image from 'next/image';
import Link from 'next/link';
import AnimateOnScroll from '../AnimateOnScroll';
import SectionHeader from '../ui/SectionHeader';
import { IconArrowRight } from '../icons';
import { whyItems } from '@/lib/content/why';

/** Rejilla asimétrica (bento): 1 tarjeta grande + 4 medianas + 1 banda con CTA. */
const CELLS = [
  'md:col-span-4 md:row-span-2',
  'md:col-span-2',
  'md:col-span-2',
  'md:col-span-3',
  'md:col-span-3',
  'md:col-span-6',
];

export default function WhySection() {
  const [hero, ...rest] = whyItems;

  return (
    <section id="por-que" className="px-6 py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-12">
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

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
          {/* Tarjeta grande */}
          <AnimateOnScroll className={CELLS[0]}>
            <div className="relative h-full overflow-hidden rounded-3xl bg-azul text-white p-8 sm:p-10 flex flex-col justify-between min-h-[22rem]">
              <Image
                src="/brand/rp-mark-white.png"
                alt=""
                width={534}
                height={572}
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -bottom-12 w-72 opacity-[0.08] rotate-[-8deg]"
              />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-marfil flex items-center justify-center p-2.5">
                  <Image src={hero.icon} alt={hero.iconAlt} width={44} height={44} />
                </div>
                <h3 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold mt-6">
                  {hero.title}
                </h3>
                <p className="mt-4 text-white/80 leading-relaxed max-w-md">{hero.description}</p>
              </div>
              {hero.tags && (
                <ul className="relative mt-8 flex flex-wrap gap-2" aria-label="Fuentes del contenido">
                  {hero.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-albero/50 bg-white/5 px-3 py-1 text-xs font-medium text-albero"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AnimateOnScroll>

          {rest.map((item, i) => {
            const cell = CELLS[i + 1];
            const isBanner = cell.includes('col-span-6');
            return (
              <AnimateOnScroll key={item.key} className={cell} delay={60 * (i + 1)}>
                <div
                  className={`hover-lift h-full rounded-3xl bg-white border border-azul/5 hover:border-albero/30 hover:shadow-xl hover:shadow-albero/5 p-6 sm:p-7 ${
                    isBanner ? 'flex flex-col sm:flex-row sm:items-center gap-6' : 'flex flex-col'
                  }`}
                >
                  <Image src={item.icon} alt={item.iconAlt} width={52} height={52} className="shrink-0" />
                  <div className={isBanner ? 'flex-1' : 'mt-4'}>
                    <h3 className="font-semibold text-lg text-azul">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-texto/70 leading-relaxed">{item.description}</p>
                  </div>
                  {item.href && item.cta && (
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 self-start sm:self-center rounded-xl border border-azul/15 px-5 py-2.5 text-sm font-medium text-azul hover:bg-azul hover:text-white transition-colors"
                    >
                      {item.cta}
                      <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
