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
            <div className="w-16 h-16 bg-gradient-to-br from-albero to-dorado text-azul-800 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto relative z-10 shadow-lg shadow-albero/20">
              1
            </div>
            <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
              Descarga la app
            </h3>
            <p className="text-texto/70 text-sm">
              Instálala en tu móvil o accede desde cualquier navegador. Sin tiendas, sin complicaciones.
            </p>
          </div>

          <div className="text-center space-y-4 relative">
            <div className="w-16 h-16 bg-gradient-to-br from-albero to-dorado text-azul-800 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto relative z-10 shadow-lg shadow-albero/20">
              2
            </div>
            <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
              Crea tu cuenta
            </h3>
            <p className="text-texto/70 text-sm">
              Regístrate en segundos y personaliza tu experiencia espiritual.
            </p>
          </div>

          <div className="text-center space-y-4 relative">
            <div className="w-16 h-16 bg-gradient-to-br from-albero to-dorado text-azul-800 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto relative z-10 shadow-lg shadow-albero/20">
              3
            </div>
            <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
              Empieza a orar
            </h3>
            <p className="text-texto/70 text-sm">
              Accede a la app y comienza tu camino espiritual con las herramientas que necesitas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
