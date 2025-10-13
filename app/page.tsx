import WaitlistForm from './components/WaitlistForm';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-marfil flex flex-col">
      {/* Main Content */}
      <main className="flex-1 px-6 py-16 sm:py-20">
        <div className="w-full max-w-4xl mx-auto space-y-20">

          {/* Hero Section */}
          <section className="text-center space-y-8 pt-8">
            <div className="space-y-8">
              <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl md:text-6xl font-semibold text-azul leading-tight tracking-tight">
                Fortalece tu fe cada día<br />con tu guía espiritual
              </h1>

              {/* Logo/App Image */}
              <div className="flex justify-center">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                  <Image
                    src="/logo-512-1.png"
                    alt="Refugio en la Palabra"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>

              <p className="font-[family-name:var(--font-inter)] text-lg sm:text-xl text-texto/80 max-w-2xl mx-auto leading-relaxed">
                Reza el rosario, reflexiona con el evangelio y avanza en tu camino espiritual con acompañamiento 24/7.
              </p>
            </div>

            {/* CTA destacado */}
            <div className="inline-block bg-albero/10 border border-albero/30 rounded-lg px-6 py-3">
              <p className="text-sm text-azul font-medium">
                ✨ Únete a la lista de espera y recibe acceso anticipado
              </p>
            </div>
          </section>

          {/* Beneficios principales */}
          <section className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-3 border border-azul/5">
              <div className="w-12 h-12 bg-albero/10 rounded-lg flex items-center justify-center text-2xl">
                ✝
              </div>
              <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                Rezo del Rosario guiado
              </h3>
              <p className="text-texto/80 text-sm leading-relaxed">
                Guías paso a paso para cada misterio, con audio y reflexiones que te acompañan en tu oración.
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-3 border border-azul/5">
              <div className="w-12 h-12 bg-albero/10 rounded-lg flex items-center justify-center text-2xl">
                📖
              </div>
              <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                Evangelio diario
              </h3>
              <p className="text-texto/80 text-sm leading-relaxed">
                Lecturas y meditaciones personalizadas del evangelio del día para profundizar en tu fe.
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-3 border border-azul/5">
              <div className="w-12 h-12 bg-albero/10 rounded-lg flex items-center justify-center text-2xl">
                🏆
              </div>
              <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                Sistema de logros
              </h3>
              <p className="text-texto/80 text-sm leading-relaxed">
                Consigue medallas y avanza en tu camino espiritual mientras fortaleces tu constancia en la oración.
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-3 border border-azul/5">
              <div className="w-12 h-12 bg-albero/10 rounded-lg flex items-center justify-center text-2xl">
                💬
              </div>
              <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                Consultor espiritual
              </h3>
              <p className="text-texto/80 text-sm leading-relaxed">
                Un guía cristiano virtual que te acompaña, responde tus preguntas y te ayuda en tu camino de fe.
              </p>
            </div>
          </section>

          {/* Prueba social */}
          <section className="text-center space-y-6 py-8">
            <div className="inline-flex items-center gap-2 bg-white/50 rounded-full px-6 py-3 border border-azul/10">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-albero/20 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-azul/20 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-dorado/20 border-2 border-white" />
              </div>
              <p className="text-sm text-texto/70">
                Cientos de personas ya esperan el lanzamiento
              </p>
            </div>
            <p className="font-[family-name:var(--font-inter)] text-base text-texto/70 italic max-w-xl mx-auto">
              &ldquo;Una herramienta que estaba esperando para fortalecer mi vida espiritual cada día&rdquo;
            </p>
          </section>

          {/* Formulario de Waitlist */}
          <section className="max-w-2xl mx-auto space-y-6 text-center">
            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul">
                Únete hoy y recibe acceso anticipado
              </h2>
              <p className="text-texto/70">
                Sé de los primeros en experimentar Refugio en la Palabra y recibe un código exclusivo en el lanzamiento.
              </p>
            </div>
            <WaitlistForm />
          </section>

          {/* FAQ */}
          <section className="max-w-2xl mx-auto space-y-8">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul text-center">
              Preguntas frecuentes
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-[family-name:var(--font-inter)] text-base font-semibold text-azul">
                  ¿Cuándo estará disponible la aplicación?
                </h3>
                <p className="text-texto/70 text-sm leading-relaxed">
                  Estamos en fase final de desarrollo. Los miembros de la lista de espera serán notificados primero cuando lancemos.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-[family-name:var(--font-inter)] text-base font-semibold text-azul">
                  ¿Es compatible con mi dispositivo?
                </h3>
                <p className="text-texto/70 text-sm leading-relaxed">
                  Refugio en la Palabra es una aplicación web que funciona en cualquier dispositivo: móvil, tablet o computadora. No necesitas descargar nada.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-[family-name:var(--font-inter)] text-base font-semibold text-azul">
                  ¿Qué incluye el acceso anticipado?
                </h3>
                <p className="text-texto/70 text-sm leading-relaxed">
                  Recibirás un código único para acceder antes del lanzamiento público, permitiéndote ser de los primeros en usar todas las funcionalidades.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-[family-name:var(--font-inter)] text-base font-semibold text-azul">
                  ¿Cómo funciona el sistema de logros?
                </h3>
                <p className="text-texto/70 text-sm leading-relaxed">
                  A medida que rezas, lees el evangelio y mantienes tu práctica diaria, desbloquearás medallas y logros que te motivan a continuar en tu camino espiritual.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-azul/10 mt-16">
        <p className="text-xs text-texto/50">
          © {new Date().getFullYear()} Refugio en la Palabra. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
