import AnimateOnScroll from '../AnimateOnScroll';
import SectionHeader from '../ui/SectionHeader';

export default function HowItWorksSection() {
  return (
    <section id="como-funciona" className="px-6 py-20 bg-gradient-to-b from-white/50 to-marfil">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <SectionHeader
              eyebrow="Así de fácil"
              eyebrowClassName="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider"
              title="Empieza en 3 simples pasos"
              titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4"
            />
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Línea conectora */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-albero/20 via-albero to-albero/20"></div>

          <div className="text-center space-y-4 relative">
            <div className="w-16 h-16 bg-marfil border-2 border-albero text-azul rounded-full flex items-center justify-center text-2xl font-bold mx-auto relative z-10">
              1
            </div>
            <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
              Instálala en 30 segundos
            </h3>
            <p className="text-texto/70 text-sm">
              Directamente desde el navegador, sin tiendas ni descargas. En medio minuto la tienes lista en tu móvil.
            </p>
          </div>

          <div className="text-center space-y-4 relative">
            <div className="w-16 h-16 bg-marfil border-2 border-albero text-azul rounded-full flex items-center justify-center text-2xl font-bold mx-auto relative z-10">
              2
            </div>
            <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
              Elige tu momento de oración
            </h3>
            <p className="text-texto/70 text-sm">
              Ábrela y escoge cuándo quieres rezar. Tú marcas el ritmo y la app se adapta a tu día.
            </p>
          </div>

          <div className="text-center space-y-4 relative">
            <div className="w-16 h-16 bg-marfil border-2 border-albero text-azul rounded-full flex items-center justify-center text-2xl font-bold mx-auto relative z-10">
              3
            </div>
            <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
              Reza acompañado cada día
            </h3>
            <p className="text-texto/70 text-sm">
              Rosario guiado, Evangelio comentado y tu compañero de fe siempre a mano para crecer día a día.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
