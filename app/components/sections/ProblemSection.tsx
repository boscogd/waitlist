import Image from 'next/image';
import AnimateOnScroll from '../AnimateOnScroll';
import SectionHeader from '../ui/SectionHeader';
import { IconArrowRight, IconCheckCircle } from '../icons';

// Cada fila enfrenta un problema real con lo que hace la app al respecto.
// Formato editorial (lista con filetes) a propósito: rompe la sucesión de
// rejillas de tres tarjetas y da un motivo para bajar a las características.
const PAINS = [
  {
    icon: '/icons/calendario-icon.png',
    iconAlt: 'Calendario que ilustra la falta de tiempo para orar cada día',
    pain: 'Sin tiempo para orar',
    detail: 'El ritmo diario te consume y la oración siempre queda para luego.',
    answer:
      'Rosario guiado, Evangelio y examen de conciencia en tu móvil. Eliges cuánto tiempo tienes y la app se adapta a ti.',
  },
  {
    icon: '/icons/confianza-icon.png',
    iconAlt: 'Manos en oración que representan las dudas de fe sin respuesta',
    pain: 'Dudas sin respuesta',
    detail: 'Tienes preguntas sobre la fe y no siempre hay alguien a quien preguntárselas.',
    answer:
      'El Compañero de fe responde a cualquier hora a partir del Catecismo, y sabe cuándo remitirte a un sacerdote.',
  },
  {
    icon: '/icons/mundo-icon.png',
    iconAlt: 'Paloma que simboliza la fe que las apps genéricas no acompañan',
    pain: 'Apps que no conectan',
    detail: 'La meditación genérica no entiende tu fe católica ni tus tradiciones.',
    answer:
      'Hecha por católicos para católicos: liturgia, santos y sacramentos. Nada de sincretismo.',
  },
];

export default function ProblemSection() {
  return (
    <section className="relative px-6 py-20 bg-white/50 overflow-hidden">
      {/* Marca de agua del logo (decorativa) */}
      <Image
        src="/brand/rp-mark.png"
        alt=""
        width={534}
        height={572}
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -bottom-28 w-[24rem] opacity-[0.04] rotate-[-10deg] hidden lg:block"
      />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-16 items-start">
        {/* Texto */}
        <AnimateOnScroll>
          <div className="text-center lg:text-left lg:sticky lg:top-28">
            <SectionHeader
              eyebrow="El problema"
              eyebrowClassName="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider"
              title="¿Por qué necesitas un refugio espiritual?"
              titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4 text-balance"
              subtitle="En un mundo lleno de ruido, encontrar un espacio para estar con Dios cuesta. Refugio en la Palabra te ofrece ese espacio: siempre disponible y pensado para tu fe."
              subtitleClassName="text-texto/70 leading-relaxed max-w-md mx-auto lg:mx-0"
            />
            <a
              href="#caracteristicas"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-azul underline decoration-albero/60 underline-offset-4 hover:decoration-albero transition-colors"
            >
              Ver cómo lo resolvemos
              <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </AnimateOnScroll>

        {/* Problema → respuesta */}
        <ul className="border-y border-azul/10 divide-y divide-azul/10">
          {PAINS.map((item, i) => (
            <li key={item.pain}>
              <AnimateOnScroll
                delay={120 * i}
                className="group grid sm:grid-cols-[3.5rem_minmax(0,1fr)] gap-4 sm:gap-6 py-7 sm:py-8"
              >
                <div className="flex sm:flex-col items-center sm:items-start gap-3">
                  <span className="text-xs font-semibold tracking-widest text-[#8a6d1f] tabular-nums sm:order-2">
                    0{i + 1}
                  </span>
                  <Image
                    src={item.icon}
                    alt={item.iconAlt}
                    width={52}
                    height={52}
                    className="shrink-0 transition-transform duration-500 group-hover:scale-110 sm:order-1"
                  />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-lora)] text-xl sm:text-2xl font-semibold text-azul">
                    {item.pain}
                  </h3>
                  <p className="mt-1.5 text-texto/60 leading-relaxed">{item.detail}</p>
                  <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-albero/10 px-4 py-3 text-texto/85 leading-relaxed">
                    <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-albero" />
                    <span>
                      <span className="font-semibold text-azul">Con Refugio: </span>
                      {item.answer}
                    </span>
                  </p>
                </div>
              </AnimateOnScroll>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
