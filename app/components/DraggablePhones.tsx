'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Envuelve los móviles del hero y permite arrastrarlos en cualquier
 * dirección. Al soltar, vuelven a su sitio con un rebote suave. Mantiene el
 * aspecto original (móviles flotando); solo añade la interacción.
 *
 * El estilo dinámico se aplica SOLO tras montar en cliente (mounted), para
 * que el HTML del servidor y el primer render del cliente coincidan y no
 * haya error de hidratación.
 */
export default function DraggablePhones({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
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
    setOffset({
      x: clamp(e.clientX - start.current.x, 150),
      y: clamp(e.clientY - start.current.y, 150),
    });
  };
  const onUp = () => {
    setDragging(false);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      className="touch-pan-y"
      style={
        mounted
          ? {
              transform: `translate(${Math.round(offset.x)}px, ${Math.round(
                offset.y
              )}px) rotate(${(offset.x * 0.03).toFixed(2)}deg)`,
              transition: dragging
                ? 'none'
                : 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
  );
}
