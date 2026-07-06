import Link from 'next/link';
import AnimateOnScroll from '../AnimateOnScroll';
import { IconArrowRight } from '../icons';

export default function FinalCTASection() {
  return (
    <section className="px-6 py-20">
      <AnimateOnScroll className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl lg:text-5xl font-semibold text-azul">
          Tu camino espiritual comienza con un paso
        </h2>
        <p className="text-lg text-texto/70 max-w-2xl mx-auto">
          Instala Refugio en la Palabra y empieza hoy tu camino de fe. El primer paso es el más importante.
        </p>
        <Link
          href="/descargar"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-albero to-dorado text-azul-800 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-albero/20 transition-all duration-300"
        >
          Instalar gratis
          <IconArrowRight className="w-5 h-5" />
        </Link>
      </AnimateOnScroll>
    </section>
  );
}
