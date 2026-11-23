'use client';

// =====================================================
// TIENDA · CESTA
// =====================================================
// La cesta vive en el navegador (localStorage). Con NEXT_PUBLIC_TIENDA_PAGOS=1,
// «Ir a pagar» manda la ropa bajo demanda (lo que tiene `pod`) a
// /api/tienda/checkout y abre Stripe Checkout; lo demás es de muestra y no se
// cobra. Sin esa variable, todo sigue siendo la demo de siempre.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ENVIO, euros, maximo, precioDe, producto, sePuedeComprar } from '@/lib/tienda/catalogo';
import Foto from './Foto';

/** Cobro real de la ropa activado (se fija al construir). */
export const PAGOS = process.env.NEXT_PUBLIC_TIENDA_PAGOS === '1';

const esRopaReal = (slug: string) => PAGOS && !!producto(slug)?.pod;

export interface LineaCesta {
  slug: string;
  talla?: string;
  nota?: string;
  cantidad: number;
}

interface CestaCtx {
  lineas: LineaCesta[];
  /** Ya se ha leído la cesta guardada en el navegador. */
  cargada: boolean;
  unidades: number;
  subtotal: number;
  abierta: boolean;
  abrir: () => void;
  cerrar: () => void;
  anadir: (l: Omit<LineaCesta, 'cantidad'>) => void;
  cambiar: (i: number, cantidad: number) => void;
  quitar: (i: number) => void;
  vaciar: () => void;
  /** Tras pagar: descuenta de la cesta lo pagado en esa sesión, una sola vez por sesión. */
  quitarPagadas: (sesion: string, pagadas: { slug: string; talla: string; cantidad: number }[]) => void;
}

const Ctx = createContext<CestaCtx | null>(null);
const CLAVE = 'refugio-tienda-demo-cesta';
/** Sesiones de pago ya descontadas de la cesta (volver al justificante no debe quitar nada más). */
const CLAVE_PAGADAS = 'refugio-tienda-sesiones-pagadas';

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

/** Unidades de un producto en la cesta, sumando todas sus tallas (menos la línea «salvo»). */
const enCesta = (lineas: LineaCesta[], slug: string, salvo = -1) =>
  lineas.reduce((s, l, i) => (l.slug === slug && i !== salvo ? s + l.cantidad : s), 0);

/** Lo guardado en el navegador puede venir de otra versión o estar tocado a mano: solo pasa lo válido. */
function limpiar(guardada: unknown): LineaCesta[] {
  if (!Array.isArray(guardada)) return [];
  const limpias: LineaCesta[] = [];
  for (const l of guardada) {
    const p = producto(typeof l?.slug === 'string' ? l.slug : '');
    if (!p || !sePuedeComprar(p) || !Number.isInteger(l.cantidad) || l.cantidad < 1) continue;
    const talla = typeof l.talla === 'string' && p.tallas?.includes(l.talla) ? l.talla : undefined;
    const nota = typeof l.nota === 'string' && l.nota.trim() ? l.nota.trim().slice(0, 40) : undefined;
    if (p.tallas && !talla) continue;
    // Nunca más de lo que queda, sumando todas las líneas del producto; las repetidas se juntan.
    const cabe = Math.min(l.cantidad, maximo(p) - enCesta(limpias, p.slug));
    if (cabe < 1) continue;
    const linea = { slug: p.slug, talla, nota };
    const i = limpias.findIndex((x) => mismaLinea(x, linea));
    if (i === -1) limpias.push({ ...linea, cantidad: cabe });
    else limpias[i] = { ...limpias[i], cantidad: limpias[i].cantidad + cabe };
  }
  return limpias;
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
      if (enCesta(prev, l.slug) >= tope(l.slug)) return prev;
      const i = prev.findIndex((x) => mismaLinea(x, l));
      if (i === -1) return [...prev, { ...l, cantidad: 1 }];
      return prev.map((x, j) => (j === i ? { ...x, cantidad: x.cantidad + 1 } : x));
    });
    setAbierta(true);
  }, []);

  const cambiar = useCallback((i: number, cantidad: number) => {
    setLineas((prev) =>
      cantidad <= 0
        ? prev.filter((_, j) => j !== i)
        : prev.map((x, j) => (j === i ? { ...x, cantidad: Math.min(tope(x.slug) - enCesta(prev, x.slug, i), cantidad) } : x))
    );
  }, []);

  // Estables: el panel las usa en un efecto y no debe recolocar el foco con cada cambio de la cesta.
  const abrir = useCallback(() => setAbierta(true), []);
  const cerrar = useCallback(() => setAbierta(false), []);

  const quitar = useCallback((i: number) => setLineas((prev) => prev.filter((_, j) => j !== i)), []);
  const vaciar = useCallback(() => setLineas([]), []);
  const quitarPagadas = useCallback((sesion: string, pagadas: { slug: string; talla: string; cantidad: number }[]) => {
    let hechas: string[] = [];
    try {
      const g = JSON.parse(localStorage.getItem(CLAVE_PAGADAS) || '[]');
      if (Array.isArray(g)) hechas = g.filter((x): x is string => typeof x === 'string');
    } catch {
      /* sin almacenamiento: se descuenta igual */
    }
    if (hechas.includes(sesion)) return;
    try {
      localStorage.setItem(CLAVE_PAGADAS, JSON.stringify([...hechas, sesion].slice(-20)));
    } catch {
      /* navegación privada */
    }
    // Solo lo pagado: lo que se añadió después (u otra talla) se queda.
    setLineas((prev) =>
      prev
        .map((l) => {
          const p = pagadas.find((x) => x.slug === l.slug && x.talla === (l.talla ?? ''));
          return p ? { ...l, cantidad: l.cantidad - p.cantidad } : l;
        })
        .filter((l) => l.cantidad > 0)
    );
  }, []);

  const valor = useMemo<CestaCtx>(() => {
    const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
    const subtotal = lineas.reduce((s, l) => {
      const p = producto(l.slug);
      return s + (p ? precioDe(p, l.talla) : 0) * l.cantidad;
    }, 0);
    return {
      lineas,
      cargada,
      unidades,
      subtotal,
      abierta,
      abrir,
      cerrar,
      anadir,
      cambiar,
      quitar,
      vaciar,
      quitarPagadas,
    };
  }, [lineas, cargada, abierta, abrir, cerrar, anadir, cambiar, quitar, vaciar, quitarPagadas]);

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
      className="relative -mr-2 grid h-11 w-11 place-items-center rounded-full text-texto transition-colors hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul cursor-pointer"
      aria-label={unidades ? `Cesta, ${unidades} ${unidades === 1 ? 'producto' : 'productos'}` : 'Cesta vacía'}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M5 9h14l-1.2 10.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 9Z" strokeLinejoin="round" />
        <path d="M9 9V7a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </svg>
      {unidades > 0 && (
        <span
          className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-azul px-1 text-[11px] font-semibold tabular-nums text-white"
          aria-hidden="true"
        >
          {unidades}
        </span>
      )}
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
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white transition-[translate,box-shadow] duration-300 ease-out motion-reduce:transition-none ${
          abierta ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-between border-b border-black/[0.08] px-6 py-5">
          <h2 id="cesta-titulo" className="text-lg font-semibold text-texto">
            Tu cesta
          </h2>
          <button
            ref={cerrarRef}
            type="button"
            onClick={cerrar}
            className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-texto hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-azul cursor-pointer"
            aria-label="Cerrar la cesta"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {lineas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-lg font-semibold text-texto">La cesta está vacía</p>
            <p className="text-sm text-texto/70">
              {PAGOS
                ? 'Las camisetas y la sudadera se hacen al pedirlas y llegan en 5 a 10 días laborables.'
                : 'Empieza por el misterio de ganchillo: es lo que más se pide en Adviento.'}
            </p>
            <Link
              href={PAGOS ? '/tienda#ropa' : '/tienda/misterio-ganchillo'}
              onClick={cerrar}
              className="border border-black/15 px-5 py-2.5 text-sm font-medium text-texto hover:border-texto"
            >
              {PAGOS ? 'Ver la ropa' : 'Ver el misterio'}
            </Link>
          </div>
        ) : pagando ? (
          <div className="flex flex-1 flex-col justify-center gap-5 px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-texto/55">Esto es una demo</p>
            <p ref={pagoRef} tabIndex={-1} className="text-xl font-semibold text-texto text-balance focus:outline-none">
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
                className="bg-azul px-5 py-3 text-sm font-medium text-white hover:bg-azul-800 cursor-pointer"
              >
                Vaciar la cesta
              </button>
              <button
                type="button"
                onClick={() => {
                  setPagando(false);
                  requestAnimationFrame(() => pagarRef.current?.focus());
                }}
                className="border border-black/15 px-5 py-3 text-sm font-medium text-texto hover:border-texto cursor-pointer"
              >
                Volver a la cesta
              </button>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-black/[0.08] overflow-y-auto px-6">
              {lineas.map((l, i) => {
                const p = producto(l.slug)!;
                return (
                  <li key={`${l.slug}-${l.talla}-${l.nota}`} className="flex gap-4 py-5">
                    <Foto foto={p.fotos[0]} sizes="80px" decorativa className="aspect-[4/5] w-20 shrink-0 bg-[#F2F1EE]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/tienda/${p.slug}`} onClick={cerrar} className="font-medium text-texto hover:underline">
                          {p.nombre}
                        </Link>
                        <span className="text-sm font-medium tabular-nums text-texto">{euros(precioDe(p, l.talla) * l.cantidad)}</span>
                      </div>
                      {(l.talla || l.nota) && (
                        <p className="mt-0.5 text-sm text-texto/65 break-words">
                          {l.talla && `Talla ${l.talla}`}
                          {l.talla && l.nota && ' · '}
                          {l.nota}
                        </p>
                      )}
                      {p.entrega.tipo === 'preventa' && <p className="mt-0.5 text-xs text-texto/60">Preventa · {p.entrega.texto}</p>}
                      {PAGOS && !p.pod && (
                        <p className="mt-1 inline-block bg-black/[0.06] px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-texto/60">
                          De muestra
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-black/15">
                          <button
                            type="button"
                            onClick={() => cambiar(i, l.cantidad - 1)}
                            className="grid h-9 w-9 place-items-center text-texto hover:bg-black/[0.04] rounded-l-full cursor-pointer"
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
                            disabled={enCesta(lineas, p.slug) >= maximo(p)}
                            className="grid h-9 w-9 place-items-center text-texto hover:bg-black/[0.04] rounded-r-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
                            aria-label={enCesta(lineas, p.slug) >= maximo(p) ? `No quedan más unidades de ${p.nombre}` : `Añadir una unidad de ${p.nombre}`}
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

            {PAGOS ? (
              <PagoRopa />
            ) : (
              <div className="border-t border-black/[0.08] bg-[#FAFAF9] px-6 py-5">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-texto/70">Productos</dt>
                    <dd className="tabular-nums">{euros(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-texto/70">Envío en península</dt>
                    <dd className="tabular-nums">{envio === 0 ? 'Gratis' : euros(envio)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-black/[0.08] pt-2 text-base font-semibold text-texto">
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
                  className="mt-4 w-full bg-azul py-3.5 text-base font-medium text-white transition-colors hover:bg-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul cursor-pointer"
                >
                  Ir a pagar
                </button>
                <p className="mt-2 text-center text-xs text-texto/55">Tarjeta, Bizum, Apple Pay o Google Pay</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Pie de la cesta cuando la ropa se cobra de verdad: suma solo la ropa bajo
 * demanda, avisa de lo que es de muestra y abre Stripe Checkout.
 */
function PagoRopa() {
  const { lineas } = useCesta();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ropa = lineas.filter((l) => esRopaReal(l.slug));
  const hayMuestra = ropa.length < lineas.length;
  const subtotal = ropa.reduce((s, l) => s + precioDe(producto(l.slug)!, l.talla) * l.cantidad, 0);
  const envio = subtotal === 0 || subtotal >= ENVIO.gratisDesde ? 0 : ENVIO.coste;
  const faltaParaGratis = Math.max(0, ENVIO.gratisDesde - subtotal);

  const pagar = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/tienda/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineas: ropa.map(({ slug, talla, cantidad }) => ({ slug, talla, cantidad })) }),
      });
      const datos = await res.json().catch(() => ({}));
      if (res.ok && typeof datos.url === 'string') {
        // Se queda «cargando» mientras el navegador se va a Stripe.
        window.location.assign(datos.url);
        return;
      }
      setError(typeof datos.error === 'string' ? datos.error : 'No se ha podido abrir el pago. Inténtalo otra vez.');
    } catch {
      setError('Sin conexión. Comprueba internet e inténtalo otra vez.');
    }
    setCargando(false);
  };

  return (
    <div className="border-t border-black/[0.08] bg-[#FAFAF9] px-6 py-5">
      {ropa.length === 0 ? (
        <p className="text-sm leading-relaxed text-texto/75">
          Todo lo que tienes en la cesta es de muestra: todavía no se vende. Por ahora solo se venden las camisetas y la sudadera.
        </p>
      ) : (
        <>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-texto/70">{hayMuestra ? 'Ropa' : 'Productos'}</dt>
              <dd className="tabular-nums">{euros(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-texto/70">Envío (península y Baleares)</dt>
              <dd className="tabular-nums">{envio === 0 ? 'Gratis' : euros(envio)}</dd>
            </div>
            <div className="flex justify-between border-t border-black/[0.08] pt-2 text-base font-semibold text-texto">
              <dt>Total</dt>
              <dd className="tabular-nums">{euros(subtotal + envio)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-texto/60">
            {faltaParaGratis > 0 ? `Te faltan ${euros(faltaParaGratis)} para el envío gratis.` : 'Tienes el envío gratis.'} Precios con IVA. No
            enviamos a Canarias, Ceuta ni Melilla.
          </p>
          {hayMuestra && (
            <p className="mt-3 border-l-2 border-azul/40 pl-3 text-xs leading-relaxed text-texto/75">
              Lo marcado «De muestra» aún no se vende: no se cobra y se queda en la cesta.
            </p>
          )}
        </>
      )}
      <button
        type="button"
        onClick={pagar}
        disabled={ropa.length === 0 || cargando}
        aria-busy={cargando}
        className="mt-4 w-full bg-azul py-3.5 text-base font-medium text-white transition-colors hover:bg-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul cursor-pointer disabled:cursor-not-allowed disabled:bg-black/[0.08] disabled:text-texto/50 aria-busy:cursor-wait aria-busy:bg-azul aria-busy:text-white/80"
      >
        {cargando ? 'Abriendo el pago…' : hayMuestra && ropa.length > 0 ? 'Pagar solo la ropa' : 'Ir a pagar'}
      </button>
      <p role="alert" className="mt-2 text-center text-sm text-[#9B2C2C]">
        {error}
      </p>
      <p className="mt-2 text-center text-xs text-texto/55">
        Pago seguro con Stripe ·{' '}
        <Link href="/tienda/condiciones" className="underline underline-offset-2 hover:text-texto">
          Condiciones de venta
        </Link>
      </p>
    </div>
  );
}
