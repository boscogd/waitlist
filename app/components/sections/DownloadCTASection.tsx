import AnimateOnScroll from '../AnimateOnScroll';
import StoreButtons from '../StoreButtons';

export default function DownloadCTASection() {
  return (
    <section id="unete" className="px-6 py-20">
      <AnimateOnScroll className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-white to-marfil rounded-3xl p-8 sm:p-12 shadow-xl shadow-azul/5 border border-azul/5">
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 bg-albero/15 text-[#8a6d1f] px-4 py-2 rounded-full text-sm font-medium">
              <span className="relative flex h-2 w-2">
                {/* Puntito dorado de marca (antes verde) */}
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dorado opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-dorado"></span>
              </span>
              Ya en Google Play
            </div>
            <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul">
              Descarga Refugio en la Palabra
            </h2>
            <p className="text-texto/70">
              En Android, desde Google Play. En iPhone y en el ordenador, desde el navegador. Empieza hoy tu camino de fe.
            </p>
          </div>

          <StoreButtons where="descargar-cta" />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-texto/70">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Datos protegidos
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gratis para empezar
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Android, iPhone y ordenador
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
