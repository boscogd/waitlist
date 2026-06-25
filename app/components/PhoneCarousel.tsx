'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

const PHONES = [
  { src: '/home.jpeg', alt: 'Pantalla principal de Refugio' },
  { src: '/logros.jpeg', alt: 'Sistema de logros' },
  { src: '/calendario.jpeg', alt: 'Calendario litúrgico' },
];

const STEP = 360 / PHONES.length; // 120º entre móviles

/**
 * Carrusel circular de los 3 móviles del hero: van cambiando de posición
 * en redondo (el de un lado pasa al centro, etc.). Se mueve SOLO al arrastrar
 * a izquierda/derecha (ratón o dedo) o con las flechas; no gira solo.
 *
 * Todos los valores de transform se redondean (toFixed) para que el HTML del
 * servidor y el del cliente coincidan y NO haya error de hidratación.
 */
export default function PhoneCarousel() {
  const [rotation, setRotation] = useState(0);
  const [animate, setAnimate] = useState(true);
  const drag = useRef({ active: false, startX: 0, startRot: 0 });

  const onDown = (e: React.PointerEvent) => {
    drag.current = { active: true, startX: e.clientX, startRot: rotation };
    setAnimate(false);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    setRotation(drag.current.startRot + (e.clientX - drag.current.startX) * 0.45);
  };
  const onUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setAnimate(true);
    setRotation((r) => Math.round(r / STEP) * STEP);
  };
  const go = (dir: number) => {
    setAnimate(true);
    setRotation((r) => Math.round(r / STEP) * STEP + dir * STEP);
  };

  return (
    <div className="relative w-full select-none">
      <div
        className="relative h-[360px] sm:h-[440px] lg:h-[470px] cursor-grab active:cursor-grabbing"
        style={{ perspective: '1200px', touchAction: 'pan-y' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {PHONES.map((p, i) => {
          const phase = (((rotation + i * STEP) % 360) + 360) % 360;
          const rad = (phase * Math.PI) / 180;
          const x = Math.sin(rad); // -1..1 (horizontal)
          const depth = Math.cos(rad); // 1 delante .. -1 detrás
          const translateX = (x * 115).toFixed(2);
          const translateY = ((1 - depth) * -6).toFixed(2); // ligera redondez
          const scale = (0.6 + ((depth + 1) / 2) * 0.4).toFixed(3);
          const rotateY = (-x * 26).toFixed(2);
          const opacity = Number((0.4 + ((depth + 1) / 2) * 0.6).toFixed(3));
          const zIndex = Math.round((depth + 1) * 50);
          const isFront = depth > 0.9;
          return (
            <div
              key={p.src}
              className="absolute left-1/2 top-1/2"
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
                  isFront ? 'shadow-azul/30' : 'shadow-black/10'
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

      {/* Flechas */}
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
  );
}
