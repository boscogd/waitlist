'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Envuelve los móviles del hero y permite GIRARLOS arrastrando: al arrastrar
 * en horizontal el grupo rota en círculo, y en vertical se inclina un poco en
 * 3D. Al soltar, vuelve a su sitio con un rebote suave. Mantiene el aspecto
 * original (móviles flotando); solo añade la interacción.
 *
 * El estilo dinámico se aplica SOLO tras montar en cliente (mounted), para que
 * el HTML del servidor y el primer render del cliente coincidan (sin error de
 * hidratación).
 */
export default function DraggablePhones({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [rot, setRot] = useState({ z: 0, x: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, y: 0 });

  useEffect(() => setMounted(true), []);

  const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

  const onDown = (e: React.PointerEvent) => {
    setDragging(true);
    start.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    setRot({ z: clamp(dx * 0.4, 75), x: clamp(-dy * 0.15, 22) });
  };
  const onUp = () => {
    setDragging(false);
    setRot({ z: 0, x: 0 });
  };

  return (
    <div style={{ perspective: '1100px' }}>
      <div
        className="touch-pan-y"
        style={
          mounted
            ? {
                transform: `rotate(${rot.z.toFixed(2)}deg) rotateX(${rot.x.toFixed(2)}deg)`,
                transition: dragging
                  ? 'none'
                  : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: dragging ? 'grabbing' : 'grab',
                willChange: 'transform',
              }
            : undefined
        }
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {children}
      </div>
    </div>
  );
}
