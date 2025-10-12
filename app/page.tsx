import WaitlistForm from './components/WaitlistForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-marfil flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 sm:py-24">
        <div className="w-full max-w-2xl mx-auto text-center space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl md:text-6xl font-semibold text-azul leading-tight tracking-tight">
              Refugio en la Palabra
            </h1>
            <p className="font-[family-name:var(--font-inter)] text-lg sm:text-xl text-texto/80 max-w-xl mx-auto leading-relaxed">
              Tu espacio diario para orar, comprender y avanzar con sentido.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 max-w-md mx-auto">
            <div className="flex items-start gap-3 text-left">
              <span className="text-albero text-xl mt-0.5">•</span>
              <p className="font-[family-name:var(--font-inter)] text-base text-texto/90">
                Acompañamiento espiritual 24/7
              </p>
            </div>
            <div className="flex items-start gap-3 text-left">
              <span className="text-albero text-xl mt-0.5">•</span>
              <p className="font-[family-name:var(--font-inter)] text-base text-texto/90">
                Oración guiada y ritmo diario
              </p>
            </div>
            <div className="flex items-start gap-3 text-left">
              <span className="text-albero text-xl mt-0.5">•</span>
              <p className="font-[family-name:var(--font-inter)] text-base text-texto/90">
                Contenido que aterriza la fe en tu vida
              </p>
            </div>
          </div>

          {/* Waitlist Form */}
          <div className="pt-8">
            <WaitlistForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center">
        <p className="text-xs text-texto/50">
          © {new Date().getFullYear()} Refugio en la Palabra. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
