'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Número que sube de 0 al valor final con desaceleración suave.
 * Respeta prefers-reduced-motion (muestra el valor directamente).
 */
export default function CountUp({
  value,
  duration = 1400,
  prefix = '',
  className = '',
}: {
  value: number;
  duration?: number;
  prefix?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || value <= 0) {
      setDisplay(value);
      return;
    }
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {display.toLocaleString('es-ES')}
    </span>
  );
}
