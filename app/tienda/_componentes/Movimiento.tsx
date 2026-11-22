'use client';

// La cinta de la portada: se puede pausar y se queda quieta si el móvil pide
// menos movimiento.
import { useEffect, useState } from 'react';

function usaMenosMovimiento() {
  const [menos, setMenos] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cambiar = () => setMenos(mq.matches);
    cambiar();
    mq.addEventListener('change', cambiar);
    return () => mq.removeEventListener('change', cambiar);
  }, []);
  return menos;
}

function BotonPausa({ parado, onClick, que, className = '' }: { parado: boolean; onClick: () => void; que: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={parado}
      aria-label={parado ? `Reanudar ${que}` : `Pausar ${que}`}
      className={`grid h-11 w-11 place-items-center bg-white text-azul focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer ${className}`}
    >
      {parado ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M7 4.5v15l12-7.5-12-7.5Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
        </svg>
      )}
    </button>
  );
}

export function Cinta({ textos }: { textos: string[] }) {
  const menos = usaMenosMovimiento();
  const [pausada, setPausada] = useState(false);
  const pieza = (t: string) => (
    <span key={t} className="tienda-titular flex items-center whitespace-nowrap px-5 text-[1.6rem] sm:text-3xl">
      {t}
      <span aria-hidden="true" className="ml-10 inline-block h-2.5 w-2.5 rotate-45 bg-[#F1BC45]" />
    </span>
  );

  return (
    <div className="relative bg-azul text-white">
      <ul className="sr-only">
        {textos.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {menos ? (
        // Quieta: todos los mensajes a la vista, en varias líneas si hace falta
        <div aria-hidden="true" className="flex flex-wrap justify-center gap-y-1 px-2 py-3.5">
          {textos.map(pieza)}
        </div>
      ) : (
        <div className="overflow-hidden py-3.5 pr-14" aria-hidden="true">
          <div className="tienda-cinta" style={{ animationPlayState: pausada ? 'paused' : undefined }}>
            {[0, 1].map((copia) => (
              <div key={copia} className="flex shrink-0">
                {textos.map(pieza)}
              </div>
            ))}
          </div>
        </div>
      )}
      {!menos && (
        <BotonPausa
          parado={pausada}
          onClick={() => setPausada(!pausada)}
          que="la cinta"
          className="absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2"
        />
      )}
    </div>
  );
}
