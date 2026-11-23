'use client';

// Botón de compra de la ficha, con la talla cuando la hay.
import { useId, useState } from 'react';
import { euros, maximo, sePuedeComprar, type Producto } from '@/lib/tienda/catalogo';
import { PAGOS, useCesta } from './Cesta';

const BOTON =
  'w-full py-4 text-[15px] font-bold uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul';

export function Comprar({ p }: { p: Producto }) {
  const { anadir, lineas } = useCesta();
  const [talla, setTalla] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  if (!sePuedeComprar(p)) {
    const texto =
      p.entrega.tipo === 'proximamente' ? 'Avisadme cuando llegue' : p.entrega.tipo === 'encargo' ? 'Apuntarme para el año que viene' : 'Agotado';
    return (
      <div className="space-y-2">
        <button type="button" disabled className={`${BOTON} cursor-not-allowed bg-black/[0.06] text-texto/50`}>
          {texto}
        </button>
        <p className="text-sm text-texto/60">En la tienda real, aquí dejas tu correo y te escribimos.</p>
      </div>
    );
  }

  const enviar = () => {
    if (p.tallas && !talla) {
      setError('Elige una talla.');
      document.getElementById(`${id}-tallas`)?.focus();
      return;
    }
    const yaHay = lineas.reduce((s, l) => (l.slug === p.slug ? s + l.cantidad : s), 0);
    if (yaHay >= maximo(p)) {
      setError(`Ya tienes en la cesta todas las que se pueden pedir de una vez (${maximo(p)}).`);
      return;
    }
    setError(null);
    anadir({ slug: p.slug, talla: talla ?? undefined });
  };

  return (
    <div className="space-y-5">
      {p.tallas && (
        <fieldset>
          <legend id={`${id}-tallas`} tabIndex={-1} className="mb-2.5 text-sm text-texto focus:outline-none">
            Talla{talla && <span className="text-texto/60">: {talla}</span>}
            {p.pod && talla === '2XL' && <span className="text-texto/60"> (+{euros(p.pod.extra2XL)})</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {p.tallas.map((t) => {
              const extra = p.pod && t === '2XL' ? p.pod.extra2XL : 0;
              return (
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
                <span className="grid h-11 min-w-14 place-items-center border-2 border-azul/25 px-3 text-sm text-texto transition-colors hover:border-texto peer-checked:border-texto peer-checked:bg-texto peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-azul">
                  {extra ? (
                    <span className="flex items-baseline gap-1">
                      {t}
                      <span className="text-xs opacity-70" aria-hidden="true">
                        +{euros(extra)}
                      </span>
                      <span className="sr-only">, {euros(extra)} más</span>
                    </span>
                  ) : (
                    t
                  )}
                </span>
              </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <button type="button" onClick={enviar} className={`${BOTON} bg-azul text-white hover:bg-azul-800 cursor-pointer`}>
          {p.entrega.tipo === 'preventa' ? 'Reservar el mío' : 'Añadir a la cesta'}
        </button>
        <p role="alert" className="mt-2 min-h-5 text-sm text-[#9B2C2C]">
          {error}
        </p>
        {PAGOS && !p.pod && (
          <p className="text-sm text-texto/60">Producto de muestra: aún no se vende. Por ahora solo se venden las camisetas y la sudadera.</p>
        )}
      </div>
    </div>
  );
}
