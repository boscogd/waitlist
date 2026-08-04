'use client';

import { useState, useEffect, useRef } from 'react';

export default function WaitlistCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Fetch del número real (sin cambiar la lógica de datos ni el endpoint)
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/profiles/count', {
          cache: 'no-store',
        });
        const data = await res.json();
        if (typeof data.count === 'number') {
          setCount(data.count);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('Error fetching waitlist count:', error);
        setHasError(true);
      }
    }

    fetchCount();
  }, []);

  // Count-up animado de 0 al valor final (respeta prefers-reduced-motion)
  useEffect(() => {
    if (count === null) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || count <= 0) {
      setDisplayCount(count);
      return;
    }

    const duration = 1200; // ms
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutCubic para una desaceleración suave
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(eased * count));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayCount(count);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [count]);

  // Si el fetch falla, se oculta el badge en lugar de dejar "..." perpetuo
  if (hasError) return null;

  const display = count === null ? '...' : `+${displayCount}`;

  return (
    <div className="flex items-center gap-2 bg-albero/15 text-[#8a6d1f] px-3 py-1.5 rounded-full font-medium">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
      <span>
        {/* tabular-nums + ancho mínimo: evita el salto de layout al pasar de "..." a la cifra */}
        <span className="tabular-nums inline-block min-w-[3ch] text-right">{display}</span>
        {' '}ya rezan con Refugio
      </span>
    </div>
  );
}
