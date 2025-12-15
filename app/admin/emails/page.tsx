import EmailsAdmin from './EmailsAdmin';
import Link from 'next/link';

export default function EmailsAdminPage() {
  return (
    <div className="min-h-screen bg-marfil">
      {/* Header */}
      <header className="bg-white border-b border-azul/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul">
                Gestión de Emails
              </h1>
              <p className="text-sm text-texto/60 mt-1">
                Drip Campaign y Borradores de Email
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/feedback"
                className="text-sm text-texto/70 hover:text-azul transition-colors"
              >
                Feedback
              </Link>
              <Link
                href="/"
                className="text-sm text-azul hover:text-azul/80 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <EmailsAdmin />
      </main>
    </div>
  );
}
