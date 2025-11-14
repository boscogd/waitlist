import FeedbackAdmin from './FeedbackAdmin';
import Link from 'next/link';

export default function FeedbackAdminPage() {
  return (
    <div className="min-h-screen bg-marfil">
      {/* Header */}
      <header className="bg-white border-b border-azul/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul">
                Panel de Feedback
              </h1>
              <p className="text-sm text-texto/60 mt-1">
                Gestiona y revisa el feedback del MVP
              </p>
            </div>
            <Link
              href="/"
              className="text-sm text-azul hover:text-azul/80 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <FeedbackAdmin />
      </main>
    </div>
  );
}
