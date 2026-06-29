'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const PHONES = [
  { src: '/home.jpeg', alt: 'Pantalla principal de Refugio', label: 'Inicio' },
  { src: '/logros.jpeg', alt: 'Sistema de logros', label: 'Logros' },
  { src: '/calendario.jpeg', alt: 'Calendario litúrgico', label: 'Calendario litúrgico' },
];

const STEP = 360 / PHONES.length; // 120º entre móviles
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Carrusel circular de los 3 móviles del hero: cambian de posición en redondo.
 * Se mueve al arrastrar (con inercia al soltar), con las flechas, las teclas
 * ◀ ▶, los puntos, o tocando un móvil lateral para traerlo al centro. No gira
 * solo. Los transforms se redondean para no romper la hidratación.
 */
export default function PhoneCarousel() {
  const [rotation, setRotation] = useState(0);
  const [animate, setAnimate] = useState(true);
  const drag = useRef({
    active: false,
    startX: 0,
    startRot: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    moved: false,
  });
  // rAF para coalescer los setRotation de pointermove (mejora INP)
  const rafId = useRef<number | null>(null);
  const pendingRot = useRef<number | null>(null);

  const cancelRaf = () => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    pendingRot.current = null;
  };

  useEffect(() => cancelRaf, []);

  const activeIndex =
    ((Math.round(-rotation / STEP) % PHONES.length) + PHONES.length) % PHONES.length;

  const onDown = (e: React.PointerEvent) => {
    const now = performance.now();
    drag.current = {
      active: true,
      startX: e.clientX,
      startRot: rotation,
      lastX: e.clientX,
      lastT: now,
      velocity: 0,
      moved: false,
    };
    setAnimate(false);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 5) drag.current.moved = true;
    const now = performance.now();
    const dt = now - drag.current.lastT;
    if (dt > 0) drag.current.velocity = (e.clientX - drag.current.lastX) / dt;
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
    // Coalescer: solo aplicamos el último valor en el próximo frame.
    pendingRot.current = drag.current.startRot + dx * 0.45;
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        if (pendingRot.current !== null) setRotation(pendingRot.current);
      });
    }
  };
  const onUp = () => {
    if (!drag.current.active) return;
    // Recoge el último valor pendiente del frame coalescido antes de cancelar.
    const flushed = pendingRot.current;
    cancelRaf();
    drag.current.active = false;
    setAnimate(true);
    // Inercia: la velocidad al soltar añade giro extra antes de encajar.
    const extra = clamp(drag.current.velocity * 0.45 * 110, -2 * STEP, 2 * STEP);
    setRotation((rot) => {
      const base = flushed ?? rot;
      return Math.round((base + extra) / STEP) * STEP;
    });
  };
  const go = (dir: number) => {
    setAnimate(true);
    setRotation((r) => Math.round(r / STEP) * STEP + dir * STEP);
  };
  const goTo = (k: number) => {
    setAnimate(true);
    setRotation((rot) => {
      const cur = Math.round(rot / STEP) * STEP;
      const m = Math.round((cur + k * STEP) / 360); // vuelta más corta
      return -k * STEP + 360 * m;
    });
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(-1);
    }
  };

  return (
    <div className="relative w-full select-none">
      {/* Carrusel + flechas */}
      <div className="relative">
        <div
          className="relative h-[360px] sm:h-[440px] lg:h-[470px] cursor-grab active:cursor-grabbing rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-azul/40"
          style={{ perspective: '1200px', touchAction: 'pan-y' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKeyDown}
          tabIndex={0}
          role="group"
          aria-label="Pantallas de la app. Arrastra, usa las flechas o las teclas izquierda y derecha."
        >
          {PHONES.map((p, i) => {
            const phase = (((rotation + i * STEP) % 360) + 360) % 360;
            const rad = (phase * Math.PI) / 180;
            const x = Math.sin(rad);
            const depth = Math.cos(rad);
            const translateX = (x * 115).toFixed(2);
            const translateY = ((1 - depth) * -6).toFixed(2);
            const scale = (0.6 + ((depth + 1) / 2) * 0.4).toFixed(3);
            const rotateY = (-x * 26).toFixed(2);
            const opacity = Number((0.4 + ((depth + 1) / 2) * 0.6).toFixed(3));
            const zIndex = Math.round((depth + 1) * 50);
            const isFront = depth > 0.9;
            return (
              <div
                key={p.src}
                className="absolute left-1/2 top-1/2"
                aria-hidden={!isFront}
                onClick={() => {
                  if (!drag.current.moved) goTo(i);
                }}
                style={{
                  transform: `translate(-50%, -50%) translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  zIndex,
                  opacity,
                  transition: animate
                    ? 'transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease'
                    : 'none',
                  willChange: 'transform',
                }}
              >
                <div
                  className={`bg-azul p-2 rounded-[2.2rem] shadow-2xl ${
                    isFront ? 'shadow-azul/30' : 'shadow-black/10 cursor-pointer'
                  }`}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={240}
                    height={480}
                    className="rounded-[1.7rem] w-44 sm:w-52 lg:w-56 h-auto pointer-events-none"
                    priority={i === 0}
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Flechas (centradas en el carrusel) */}
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Móvil anterior"
          className="absolute left-0 sm:-left-2 top-1/2 -translate-y-1/2 z-[200] w-10 h-10 rounded-full bg-white/80 backdrop-blur text-azul shadow-md flex items-center justify-center hover:bg-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Móvil siguiente"
          className="absolute right-0 sm:-right-2 top-1/2 -translate-y-1/2 z-[200] w-10 h-10 rounded-full bg-white/80 backdrop-blur text-azul shadow-md flex items-center justify-center hover:bg-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Región estable que anuncia el cambio a lectores de pantalla */}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {PHONES[activeIndex].label}
      </span>
      {/* Etiqueta visible de la pantalla del centro (aria-hidden: ya se anuncia arriba) */}
      <p
        key={activeIndex}
        aria-hidden="true"
        className="animate-fade-in text-center text-sm font-medium text-texto/70 mt-3"
      >
        {PHONES[activeIndex].label}
      </p>

      {/* Puntos indicadores */}
      <div className="flex items-center justify-center gap-2 mt-2">
        {PHONES.map((p, k) => (
          <button
            key={p.src}
            type="button"
            onClick={() => goTo(k)}
            aria-label={`Ir a ${p.label}`}
            aria-current={k === activeIndex}
            className={`h-2 rounded-full transition-all duration-300 ${
              k === activeIndex ? 'w-6 bg-azul' : 'w-2 bg-azul/25 hover:bg-azul/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
