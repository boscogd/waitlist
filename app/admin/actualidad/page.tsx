import Link from 'next/link';
import ActualidadAdmin from './ActualidadAdmin';

export default function ActualidadAdminPage() {
  return (
    <div className="min-h-screen bg-marfil">
      <header className="bg-white border-b border-azul/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul">Actualidad</h1>
            <p className="text-sm text-texto/60 mt-1">Revisa la edición de la semana y publícala</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/actualidad" target="_blank" rel="noopener noreferrer" className="text-azul hover:text-azul/80">
              Ver en la web
            </a>
            <Link href="/admin" className="text-azul hover:text-azul/80">
              Panel
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <ActualidadAdmin />
      </main>
    </div>
  );
}
