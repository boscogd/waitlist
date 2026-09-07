'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import PhoneFrame from './PhoneFrame';

const CLIPS = [
  {
    key: 'rosario',
    icon: '/icons/rosario-icon.png',
    label: 'Rosario guiado',
    video: '/app/video/rosario.mp4',
    poster: '/app/video/rosario.jpg',
    videoLabel: 'Configuración del Rosario guiado',
    chipClassName: '-left-4 top-[16%] animate-float',
  },
  {
    key: 'evangelio',
    icon: '/icons/gospel-icon.png',
    label: 'Evangelio del día',
    video: '/app/video/evangelio.mp4',
    poster: '/app/video/evangelio.jpg',
    videoLabel: 'Evangelio del día con narración en audio',
    chipClassName: '-right-4 top-[44%] animate-float-slow',
  },
  {
    key: 'logros',
    icon: '/icons/logros-icon.png',
    label: 'Rachas y logros',
    video: '/app/video/logros.mp4',
    poster: '/app/video/logros.jpg',
    videoLabel: 'Mi camino espiritual: nivel, puntos y racha de días',
    chipClassName: '-left-3 bottom-[14%] animate-float-slower',
  },
];

const nextOf = (i: number) => (i + 1) % CLIPS.length;

/**
 * Visual del hero: un solo móvil que va rotando por tres vídeos reales de la
 * app (Rosario → Evangelio → Logros). El chip de la función que se está viendo
 * se ilumina, y pulsar un chip salta a su vídeo. Se inclina siguiendo el ratón.
 * Con prefers-reduced-motion: póster fijo, sin rotación, inclinación ni flotación.
 */
export default function HeroPhone() {
  const [active, setActive] = useState(0);
  const [reduce, setReduce] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const activeRef = useRef(0);

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Reproduce solo el clip activo; al terminar, pasa al siguiente.
  useEffect(() => {
    activeRef.current = active;
    if (reduce) {
      videoRefs.current.forEach((v) => v?.pause());
      return;
    }
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        if (v.currentTime > 0 && !v.ended) v.currentTime = 0;
        v.muted = true;
        v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  }, [active, reduce]);

  // Inclinación con el ratón (solo puntero fino y sin reduced-motion).
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const wrap = wrapRef.current;
    const tilt = tiltRef.current;
    if (reduce || !finePointer || !wrap || !tilt) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const tick = () => {
      raf = 0;
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      tilt.style.transform = `perspective(1200px) rotateY(${cx.toFixed(2)}deg) rotateX(${cy.toFixed(2)}deg)`;
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tx = x * 14;
      ty = -y * 10;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);
    return () => {
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const current = CLIPS[active];

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-md lg:max-w-lg py-6">
      {/* Glow */}
      <div
        aria-hidden="true"
        className="absolute inset-x-8 inset-y-0 rounded-[3rem] bg-gradient-to-br from-albero/30 to-dorado/10 blur-3xl"
      />

      <div ref={tiltRef} className="relative mx-auto w-52 sm:w-60 lg:w-64 will-change-transform">
        <PhoneFrame className="relative" screenClassName="bg-white">
          {CLIPS.map((clip, i) => {
            const on = i === active;
            return (
              <video
                key={clip.key}
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={clip.video}
                poster={clip.poster}
                muted
                playsInline
                autoPlay={i === 0}
                // El activo y el siguiente se precargan enteros; el resto, solo metadatos.
                preload={on || i === nextOf(active) ? 'auto' : 'metadata'}
                disablePictureInPicture
                onEnded={() => setActive((a) => nextOf(a))}
                // Si el navegador lo pausa por su cuenta (ahorro de energía,
                // pestaña en segundo plano...) lo reanudamos al volver; si se
                // niega, se queda en el póster y no insistimos.
                onPause={(e) => {
                  const v = e.currentTarget;
                  if (
                    i === activeRef.current &&
                    !v.ended &&
                    !reduce &&
                    document.visibilityState === 'visible'
                  ) {
                    v.play().catch(() => {});
                  }
                }}
                aria-hidden={!on}
                aria-label={clip.videoLabel}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                style={{ opacity: on ? 1 : 0 }}
              />
            );
          })}
        </PhoneFrame>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        Ahora en pantalla: {current.label}
      </p>

      {/* Chips: solo desde sm (en móvil taparían la pantalla), rozando el borde
          del marco. El activo se ilumina; pulsar uno salta a su vídeo. */}
      {CLIPS.map((clip, i) => {
        const on = i === active;
        return (
          <button
            key={clip.key}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={on}
            aria-label={`Ver ${clip.label}`}
            className={`absolute z-20 hidden sm:flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium shadow-lg backdrop-blur transition-colors duration-500 cursor-pointer ${
              on
                ? 'border-azul bg-azul text-white shadow-azul/25'
                : 'border-white/70 bg-white/85 text-azul shadow-azul/10 hover:bg-white'
            } ${clip.chipClassName}`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-500 ${
                on ? 'bg-marfil' : 'bg-transparent'
              }`}
            >
              <Image src={clip.icon} alt="" width={24} height={24} className="shrink-0" />
            </span>
            {clip.label}
            {on && (
              <span aria-hidden="true" className="relative ml-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-albero opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-albero" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
