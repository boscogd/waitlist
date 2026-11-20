'use client';

// Galería de la ficha: en el móvil se pasa con el dedo; en el ordenador, con
// las miniaturas.
import { useRef, useState } from 'react';
import type { Foto as TFoto } from '@/lib/tienda/catalogo';
import Foto from './Foto';

export default function Galeria({ fotos, aviso, fondo, tinta }: { fotos: TFoto[]; aviso?: string | null; fondo: string; tinta: string }) {
  const carril = useRef<HTMLDivElement>(null);
  const [activa, setActiva] = useState(0);

  const ir = (i: number) => {
    const el = carril.current;
    if (!el) return;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: quieto ? 'auto' : 'smooth' });
    setActiva(i);
  };

  const alDeslizar = () => {
    const el = carril.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== activa) setActiva(i);
  };

  return (
    <div>
      <div className="relative p-[7%] sm:p-[8%]" style={{ backgroundColor: fondo }}>
        <div
          ref={carril}
          onScroll={alDeslizar}
          className="flex snap-x snap-mandatory overflow-x-auto bg-black/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Fotos del producto"
          role="region"
          tabIndex={fotos.length > 1 ? 0 : undefined}
        >
          {fotos.map((f, i) => (
            <div key={`${f.id}-${i}`} className="aspect-square w-full shrink-0 snap-center sm:aspect-[4/5]">
              <Foto
                foto={f}
                sizes="(min-width: 1024px) 600px, 100vw"
                prioridad={i === 0}
                className="h-full w-full"
              />
            </div>
          ))}
        </div>
        {aviso && (
          <span
            className="absolute left-[7%] top-[7%] -translate-y-1/2 px-2 py-1 text-[11px] font-bold uppercase tracking-wide sm:left-[8%] sm:top-[8%]"
            style={{ backgroundColor: tinta, color: fondo }}
          >
            {aviso}
          </span>
        )}
        {fotos.length > 1 && (
          <span className="absolute bottom-[9%] right-[9%] bg-black/60 px-2 py-0.5 text-xs tabular-nums text-white sm:hidden" aria-hidden="true">
            {activa + 1} / {fotos.length}
          </span>
        )}
      </div>
      {fotos.length > 1 && (
        <div className="mt-3 hidden gap-3 sm:flex">
          {fotos.map((f, i) => (
            <button
              key={`${f.id}-${i}`}
              type="button"
              onClick={() => ir(i)}
              aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
              aria-current={activa === i}
              className={`w-20 overflow-hidden bg-black/5 outline-offset-2 focus-visible:outline-2 focus-visible:outline-azul cursor-pointer ${
                activa === i ? 'ring-2 ring-azul' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Foto foto={f} sizes="80px" decorativa inmediata className="aspect-[4/5] h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
