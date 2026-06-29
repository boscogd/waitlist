'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Envoltorio de parallax sutil ligado al scroll.
 * Desplaza ligeramente su contenido según su posición en el viewport,
 * dando sensación de profundidad. Respeta prefers-reduced-motion
 * (si está activado, no aplica ninguna transformación).
 *
 * Usa requestAnimationFrame + listener pasivo para ir a 60fps sin jank,
 * y translate3d (acelerado por GPU). El movimiento está limitado para
 * que sea elegante, nunca exagerado.
 */
export default function Parallax({
  children,
  speed = 0.12,
  max = 48,
  className = '',
}: {
  children: ReactNode;
  speed?: number;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elCenter = rect.top + rect.height / 2;
      let offset = (elCenter - viewportCenter) * -speed;
      offset = Math.max(-max, Math.min(max, offset));
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, max]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
