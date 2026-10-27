import Image from 'next/image';
import { DownloadLink } from '../StoreButtons';
import AnimateOnScroll from '../AnimateOnScroll';

export default function FinalCTASection() {
  return (
    <section className="px-6 pt-8 pb-24">
      <AnimateOnScroll className="max-w-2xl mx-auto text-center space-y-6">
        <Image
          src="/brand/rp-mark.png"
          alt="Refugio en la Palabra"
          width={72}
          height={72}
          className="mx-auto object-contain opacity-95"
        />
        <p className="font-[family-name:var(--font-lora)] text-2xl sm:text-3xl font-medium text-azul leading-snug text-balance">
          Que cada día encuentres aquí un refugio para descansar en Dios y crecer en la fe.
        </p>
        <p className="text-base text-texto/60">
          ¿Aún no la tienes?{' '}
          <DownloadLink
            where="final"
            className="text-azul font-medium underline decoration-albero/60 underline-offset-4 hover:decoration-albero transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-albero rounded-sm"
          >
            Descárgala aquí
          </DownloadLink>
        </p>
      </AnimateOnScroll>
    </section>
  );
}
