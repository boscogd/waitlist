import FeedbackForm from './FeedbackForm';
import Link from 'next/link';

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-marfil flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-azul/10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-azul hover:text-azul/80 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12 sm:py-16">
        <div className="w-full max-w-3xl mx-auto space-y-8">

          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-5xl font-semibold text-azul leading-tight">
              Tu opinión nos importa
            </h1>
            <p className="font-[family-name:var(--font-inter)] text-lg text-texto/80 max-w-2xl mx-auto leading-relaxed">
              Estamos en la fase MVP y tu feedback es fundamental para crear la mejor experiencia posible.
              Comparte tu opinión de forma totalmente anónima.
            </p>
          </div>

          {/* Beneficio de participar */}
          <div className="bg-gradient-to-r from-albero/10 to-dorado/10 rounded-xl p-6 border border-albero/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-albero/20 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
                ✨
              </div>
              <div className="space-y-1">
                <h3 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul">
                  Ayúdanos a mejorar
                </h3>
                <p className="text-texto/70 text-sm leading-relaxed">
                  Tu feedback anónimo nos ayudará a priorizar las funcionalidades más importantes
                  y crear una app que realmente satisfaga tus necesidades espirituales.
                </p>
              </div>
            </div>
          </div>

          {/* Formulario de Feedback */}
          <FeedbackForm />

          {/* Información adicional */}
          <div className="text-center space-y-2 pt-6">
            <p className="text-xs text-texto/60 leading-relaxed">
              Este formulario es completamente anónimo. No recopilamos ningún dato personal.
            </p>
            <p className="text-xs text-texto/60 leading-relaxed">
              Las respuestas nos ayudarán a mejorar Refugio en la Palabra para toda la comunidad.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-azul/10">
        <p className="text-xs text-texto/50">
          © {new Date().getFullYear()} Refugio en la Palabra. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
