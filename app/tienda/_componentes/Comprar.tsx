'use client';

// Botones para meter un producto en la cesta: rápido (tarjeta) o con talla y
// personalización (ficha del producto).
import { useId, useState } from 'react';
import { sePuedeComprar, type Producto } from '@/lib/tienda/catalogo';
import { useCesta } from './Cesta';

export function AnadirRapido({ p }: { p: Producto }) {
  const { anadir } = useCesta();
  return (
    <button
      type="button"
      onClick={() => anadir({ slug: p.slug })}
      className="relative z-10 rounded-full border border-azul/20 bg-white px-4 py-2 text-sm font-medium text-azul transition-colors hover:border-azul hover:bg-azul hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-albero cursor-pointer"
      aria-label={`Añadir ${p.nombre} a la cesta`}
    >
      Añadir
    </button>
  );
}

export function Comprar({ p }: { p: Producto }) {
  const { anadir } = useCesta();
  const [talla, setTalla] = useState<string | null>(null);
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const comprable = sePuedeComprar(p);

  if (!comprable) {
    const texto = p.entrega.tipo === 'proximamente' ? 'Avisadme cuando llegue' : 'Apuntarme para el año que viene';
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="w-full rounded-full bg-azul/10 py-3.5 text-base font-medium text-azul/60 cursor-not-allowed"
        >
          {texto}
        </button>
        <p className="text-sm text-texto/60">En la tienda real, aquí se deja el correo y avisamos cuando se pueda pedir.</p>
      </div>
    );
  }

  const enviar = () => {
    if (p.tallas && !talla) {
      setError('Elige una talla para añadirlo a la cesta.');
      document.getElementById(`${id}-tallas`)?.focus();
      return;
    }
    if (p.personalizable && !nota.trim()) {
      setError(`Escribe ${p.personalizable.etiqueta.toLowerCase()} para que podamos hacerlo.`);
      document.getElementById(`${id}-nota`)?.focus();
      return;
    }
    setError(null);
    anadir({ slug: p.slug, talla: talla ?? undefined, nota: nota.trim() || undefined });
  };

  return (
    <div className="space-y-5">
      {p.tallas && (
        <fieldset>
          <legend id={`${id}-tallas`} tabIndex={-1} className="mb-2 text-sm font-medium text-texto">
            Talla
          </legend>
          <div className="flex flex-wrap gap-2">
            {p.tallas.map((t) => (
              <label key={t} className="cursor-pointer">
                <input
                  type="radio"
                  name={`${id}-talla`}
                  value={t}
                  checked={talla === t}
                  onChange={() => {
                    setTalla(t);
                    setError(null);
                  }}
                  className="peer sr-only"
                />
                <span className="grid h-11 min-w-12 place-items-center rounded-full border border-azul/20 px-3 text-sm font-medium text-azul transition-colors peer-checked:border-azul peer-checked:bg-azul peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-albero hover:border-azul">
                  {t}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {p.personalizable && (
        <div>
          <label htmlFor={`${id}-nota`} className="mb-1.5 block text-sm font-medium text-texto">
            {p.personalizable.etiqueta}
          </label>
          <input
            id={`${id}-nota`}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            maxLength={40}
            aria-describedby={`${id}-ayuda`}
            className="w-full rounded-lg border border-azul/20 bg-white px-4 py-3 text-base text-texto focus:border-azul focus:outline-2 focus:outline-albero"
          />
          <p id={`${id}-ayuda`} className="mt-1 text-sm text-texto/60">
            {p.personalizable.ayuda}
          </p>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={enviar}
          className="w-full rounded-full bg-azul py-3.5 text-base font-medium text-white transition-colors hover:bg-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-albero cursor-pointer"
        >
          {p.entrega.tipo === 'preventa' ? 'Reservar el mío' : 'Añadir a la cesta'}
        </button>
        <p role="alert" className="mt-2 min-h-5 text-sm text-[#9B2C2C]">
          {error}
        </p>
      </div>
    </div>
  );
}
