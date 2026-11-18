'use client';

// =====================================================
// TIENDA · CESTA (DEMO)
// =====================================================
// La cesta vive en el navegador (localStorage) y no se cobra nada: en la tienda
// real, «Ir a pagar» abrirá Stripe Checkout con tarjeta, Bizum y Apple/Google Pay.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ENVIO, euros, maximo, producto } from '@/lib/tienda/catalogo';
import ProductoArte from './ProductoArte';

export interface LineaCesta {
  slug: string;
  talla?: string;
  nota?: string;
  cantidad: number;
}

interface CestaCtx {
  lineas: LineaCesta[];
  unidades: number;
  subtotal: number;
  abierta: boolean;
  abrir: () => void;
  cerrar: () => void;
  anadir: (l: Omit<LineaCesta, 'cantidad'>) => void;
  cambiar: (i: number, cantidad: number) => void;
  quitar: (i: number) => void;
  vaciar: () => void;
}

const Ctx = createContext<CestaCtx | null>(null);
const CLAVE = 'refugio-tienda-demo-cesta';

export function useCesta() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCesta fuera de <CestaProvider>');
  return c;
}

const mismaLinea = (a: Omit<LineaCesta, 'cantidad'>, b: Omit<LineaCesta, 'cantidad'>) =>
  a.slug === b.slug && (a.talla ?? '') === (b.talla ?? '') && (a.nota ?? '') === (b.nota ?? '');

const tope = (slug: string) => {
  const p = producto(slug);
  return p ? maximo(p) : 0;
};

/** Lo guardado en el navegador puede venir de otra versión o estar tocado a mano: solo pasa lo válido. */
function limpiar(guardada: unknown): LineaCesta[] {
  if (!Array.isArray(guardada)) return [];
  return guardada.flatMap((l) => {
    const p = producto(typeof l?.slug === 'string' ? l.slug : '');
    if (!p) return [];
    const cantidad = Number.isInteger(l.cantidad) ? Math.min(l.cantidad, maximo(p)) : 0;
    const talla = typeof l.talla === 'string' && p.tallas?.includes(l.talla) ? l.talla : undefined;
    const nota = typeof l.nota === 'string' && l.nota.trim() ? l.nota.trim().slice(0, 40) : undefined;
    if (cantidad < 1 || (p.tallas && !talla) || (p.personalizable && !nota)) return [];
    return [{ slug: p.slug, talla, nota, cantidad }];
  });
}

export function CestaProvider({ children }: { children: React.ReactNode }) {
  const [lineas, setLineas] = useState<LineaCesta[]>([]);
  const [cargada, setCargada] = useState(false);
  const [abierta, setAbierta] = useState(false);

  useEffect(() => {
    try {
      setLineas(limpiar(JSON.parse(localStorage.getItem(CLAVE) || '[]')));
    } catch {
      /* sin almacenamiento: la cesta empieza vacía */
    }
    setCargada(true);
  }, []);

  useEffect(() => {
    if (!cargada) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lineas));
    } catch {
      /* navegación privada: la cesta dura lo que dure la pestaña */
    }
  }, [lineas, cargada]);

  const anadir = useCallback((l: Omit<LineaCesta, 'cantidad'>) => {
    setLineas((prev) => {
      const i = prev.findIndex((x) => mismaLinea(x, l));
      if (i === -1) return tope(l.slug) > 0 ? [...prev, { ...l, cantidad: 1 }] : prev;
      return prev.map((x, j) => (j === i ? { ...x, cantidad: Math.min(tope(x.slug), x.cantidad + 1) } : x));
    });
    setAbierta(true);
  }, []);

  const cambiar = useCallback((i: number, cantidad: number) => {
    setLineas((prev) =>
      cantidad <= 0
        ? prev.filter((_, j) => j !== i)
        : prev.map((x, j) => (j === i ? { ...x, cantidad: Math.min(tope(x.slug), cantidad) } : x))
    );
  }, []);

  // Estables: el panel las usa en un efecto y no debe recolocar el foco con cada cambio de la cesta.
  const abrir = useCallback(() => setAbierta(true), []);
  const cerrar = useCallback(() => setAbierta(false), []);

  const quitar = useCallback((i: number) => setLineas((prev) => prev.filter((_, j) => j !== i)), []);
  const vaciar = useCallback(() => setLineas([]), []);

  const valor = useMemo<CestaCtx>(() => {
    const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
    const subtotal = lineas.reduce((s, l) => s + (producto(l.slug)?.precio ?? 0) * l.cantidad, 0);
    return {
      lineas,
      unidades,
      subtotal,
      abierta,
      abrir,
      cerrar,
      anadir,
      cambiar,
      quitar,
      vaciar,
    };
  }, [lineas, abierta, abrir, cerrar, anadir, cambiar, quitar, vaciar]);

  return (
    <Ctx.Provider value={valor}>
      {children}
      <CestaPanel />
    </Ctx.Provider>
  );
}

/** Botón de la cabecera con el número de productos. */
export function BotonCesta() {
  const { unidades, abrir } = useCesta();
  return (
    <button
      type="button"
      onClick={abrir}
      data-boton-cesta
      className="relative inline-flex items-center gap-2 rounded-full bg-azul px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-albero cursor-pointer"
      aria-label={unidades ? `Cesta, ${unidades} ${unidades === 1 ? 'producto' : 'productos'}` : 'Cesta vacía'}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 9h14l-1.2 10.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 9Z" strokeLinejoin="round" />
        <path d="M9 9V7a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">Cesta</span>
      <span
        className={`min-w-6 rounded-full px-1.5 text-center text-xs font-semibold tabular-nums ${
          unidades ? 'bg-albero text-azul' : 'bg-white/15 text-white/80'
        }`}
        aria-hidden="true"
      >
        {unidades}
      </span>
    </button>
  );
}

function CestaPanel() {
  const { lineas, subtotal, abierta, cerrar, cambiar, quitar, vaciar } = useCesta();
  const [pagando, setPagando] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const pagoRef = useRef<HTMLParagraphElement>(null);
  const pagarRef = useRef<HTMLButtonElement>(null);

  // Al cambiar entre la cesta y el aviso de pago, el foco va a la vista nueva.
  useEffect(() => {
    if (abierta && pagando) pagoRef.current?.focus();
  }, [abierta, pagando]);

  const envio = subtotal === 0 || subtotal >= ENVIO.gratisDesde ? 0 : ENVIO.coste;
  const faltaParaGratis = Math.max(0, ENVIO.gratisDesde - subtotal);

  // Al abrir: foco dentro, Escape cierra, la página de detrás no se mueve.
  useEffect(() => {
    if (!abierta) {
      setPagando(false);
      return;
    }
    const anterior = document.activeElement as HTMLElement | null;
    cerrarRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
      if (e.key === 'Tab' && panelRef.current) {
        const foco = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea');
        if (!foco.length) return;
        const primero = foco[0];
        const ultimo = foco[foco.length - 1];
        if (!panelRef.current.contains(document.activeElement)) {
          e.preventDefault();
          primero.focus();
          return;
        }
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      (anterior ?? document.querySelector<HTMLElement>('[data-boton-cesta]'))?.focus();
    };
  }, [abierta, cerrar]);

  return (
    <div className={`fixed inset-0 z-[60] overflow-hidden ${abierta ? '' : 'pointer-events-none'}`} aria-hidden={!abierta}>
      <div
        className={`absolute inset-0 bg-azul-800/40 transition-opacity duration-200 motion-reduce:transition-none ${abierta ? 'opacity-100' : 'opacity-0'}`}
        onClick={cerrar}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cesta-titulo"
        inert={!abierta}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-marfil shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
          abierta ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-between border-b border-azul/10 px-6 py-5">
          <h2 id="cesta-titulo" className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul">
            Tu cesta
          </h2>
          <button
            ref={cerrarRef}
            type="button"
            onClick={cerrar}
            className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-azul hover:bg-azul/5 focus-visible:outline-2 focus-visible:outline-albero cursor-pointer"
            aria-label="Cerrar la cesta"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {lineas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="font-[family-name:var(--font-lora)] text-xl text-azul">La cesta está vacía</p>
            <p className="text-sm text-texto/70">Empieza por el misterio de crochet: es lo que más se pide en Adviento.</p>
            <Link
              href="/tienda/misterio-crochet"
              onClick={cerrar}
              className="rounded-full border border-azul/20 px-5 py-2.5 text-sm font-medium text-azul hover:border-azul"
            >
              Ver el misterio
            </Link>
          </div>
        ) : pagando ? (
          <div className="flex flex-1 flex-col justify-center gap-5 px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-azul/60">Esto es una demo</p>
            <p ref={pagoRef} tabIndex={-1} className="font-[family-name:var(--font-lora)] text-2xl text-azul text-balance focus:outline-none">
              Aquí se abriría el pago seguro de Stripe.
            </p>
            <p className="text-sm leading-relaxed text-texto/75">
              Con tarjeta, Bizum, Apple Pay o Google Pay, por {euros(subtotal + envio)}. Después llegaría un correo con el pedido y la factura. En esta demo no se cobra nada ni se envía ningún dato: la cesta solo se guarda en este navegador.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  vaciar();
                  cerrar();
                }}
                className="rounded-full bg-azul px-5 py-3 text-sm font-medium text-white hover:bg-azul-800 cursor-pointer"
              >
                Vaciar la cesta
              </button>
              <button
                type="button"
                onClick={() => {
                  setPagando(false);
                  requestAnimationFrame(() => pagarRef.current?.focus());
                }}
                className="rounded-full border border-azul/20 px-5 py-3 text-sm font-medium text-azul hover:border-azul cursor-pointer"
              >
                Volver a la cesta
              </button>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-azul/10 overflow-y-auto px-6">
              {lineas.map((l, i) => {
                const p = producto(l.slug)!;
                return (
                  <li key={`${l.slug}-${l.talla}-${l.nota}`} className="flex gap-4 py-5">
                    <ProductoArte arte={p.arte} titulo="" className="h-20 w-20 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/tienda/${p.slug}`} onClick={cerrar} className="font-medium text-azul hover:underline">
                          {p.nombre}
                        </Link>
                        <span className="text-sm font-medium tabular-nums text-texto">{euros(p.precio * l.cantidad)}</span>
                      </div>
                      {(l.talla || l.nota) && (
                        <p className="mt-0.5 text-sm text-texto/65 break-words">
                          {l.talla && `Talla ${l.talla}`}
                          {l.talla && l.nota && ' · '}
                          {l.nota}
                        </p>
                      )}
                      {p.entrega.tipo === 'preventa' && <p className="mt-0.5 text-xs text-texto/60">Preventa · {p.entrega.texto}</p>}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-azul/15">
                          <button
                            type="button"
                            onClick={() => cambiar(i, l.cantidad - 1)}
                            className="grid h-9 w-9 place-items-center text-azul hover:bg-azul/5 rounded-l-full cursor-pointer"
                            aria-label={`Quitar una unidad de ${p.nombre}`}
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-sm tabular-nums" aria-label={`${l.cantidad} unidades`}>
                            {l.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => cambiar(i, l.cantidad + 1)}
                            disabled={l.cantidad >= maximo(p)}
                            className="grid h-9 w-9 place-items-center text-azul hover:bg-azul/5 rounded-r-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
                            aria-label={l.cantidad >= maximo(p) ? `No quedan más unidades de ${p.nombre}` : `Añadir una unidad de ${p.nombre}`}
                          >
                            +
                          </button>
                        </div>
                        <button type="button" onClick={() => quitar(i)} className="text-sm text-texto/60 underline-offset-2 hover:text-texto hover:underline cursor-pointer">
                          Quitar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-azul/10 bg-white/60 px-6 py-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-texto/70">Productos</dt>
                  <dd className="tabular-nums">{euros(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-texto/70">Envío en península</dt>
                  <dd className="tabular-nums">{envio === 0 ? 'Gratis' : euros(envio)}</dd>
                </div>
                <div className="flex justify-between border-t border-azul/10 pt-2 text-base font-semibold text-azul">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{euros(subtotal + envio)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-texto/60">
                {faltaParaGratis > 0
                  ? `Te faltan ${euros(faltaParaGratis)} para el envío gratis.`
                  : 'Tienes el envío gratis.'}{' '}
                Precios con IVA.
              </p>
              <button
                ref={pagarRef}
                type="button"
                onClick={() => setPagando(true)}
                className="mt-4 w-full rounded-full bg-azul py-3.5 text-base font-medium text-white transition-colors hover:bg-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-albero cursor-pointer"
              >
                Ir a pagar
              </button>
              <p className="mt-2 text-center text-xs text-texto/55">Tarjeta, Bizum, Apple Pay o Google Pay</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
