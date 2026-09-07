'use client';

import { useEffect, useState } from 'react';
import CountUp from './CountUp';
import { INSTAGRAM_URL } from '@/lib/constants';

interface Stats {
  people: number | null;
  followers: number | null;
  rosaries: number | null;
  achievements: number | null;
  communities: number | null;
}

interface Item {
  key: string;
  value: number;
  prefix: string;
  label: string;
  href?: string;
}

/**
 * Franja de cifras reales bajo el hero. Todo sale de /api/stats (Supabase).
 * Los recuentos de la app (rosarios, logros, grupos) solo aparecen cuando
 * existen y superan un mínimo: una cifra pequeña resta más de lo que suma.
 */
export default function StatsBand() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Stats) => setStats(data))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  const items: Item[] = [];
  if (stats) {
    if (stats.people !== null && stats.people > 0) {
      items.push({ key: 'people', value: stats.people, prefix: '+', label: 'personas ya rezan con Refugio' });
    }
    if (stats.rosaries !== null && stats.rosaries >= 100) {
      items.push({ key: 'rosaries', value: stats.rosaries, prefix: '+', label: 'rosarios rezados en la app' });
    }
    if (stats.achievements !== null && stats.achievements >= 100) {
      items.push({ key: 'achievements', value: stats.achievements, prefix: '+', label: 'logros desbloqueados' });
    }
    if (stats.communities !== null && stats.communities >= 10) {
      items.push({ key: 'communities', value: stats.communities, prefix: '', label: 'grupos de oración creados' });
    }
    if (stats.followers !== null && stats.followers >= 100) {
      items.push({
        key: 'followers',
        value: Math.floor(stats.followers / 100) * 100,
        prefix: '+',
        label: 'en la comunidad de Instagram',
        href: INSTAGRAM_URL,
      });
    }
  }

  if (stats && items.length === 0) return null;

  return (
    <section aria-label="La comunidad en cifras" className="px-6 border-y border-azul/10 bg-white/60">
      {/* Móvil: rejilla de 2 columnas (evita filas de 1/2/1 y desbordes); sm+: fila centrada con separadores */}
      <div className="max-w-6xl mx-auto min-h-[6.5rem] py-6 grid grid-cols-2 gap-y-6 sm:flex sm:flex-wrap sm:items-stretch sm:justify-center">
        {!stats
          ? [0, 1, 2].map((i) => (
              <div key={i} className="px-8 py-2 flex flex-col items-center gap-2" aria-hidden="true">
                <span className="skeleton h-8 w-24 rounded-md" />
                <span className="skeleton h-3 w-32 rounded-md" />
              </div>
            ))
          : items.map((item) => {
              const inner = (
                <>
                  <CountUp
                    value={item.value}
                    prefix={item.prefix}
                    className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul leading-none"
                  />
                  <span className="text-xs sm:text-sm text-texto/60 text-center leading-snug">{item.label}</span>
                </>
              );
              const cls =
                'min-w-0 px-2 sm:px-10 py-2 flex flex-col items-center gap-2 sm:border-l sm:first:border-l-0 border-azul/10';
              return item.href ? (
                <a
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="instagram_click"
                  data-track-where="stats"
                  className={`${cls} rounded-lg hover:bg-albero/10 transition-colors`}
                >
                  {inner}
                </a>
              ) : (
                <div key={item.key} className={cls}>
                  {inner}
                </div>
              );
            })}
      </div>
    </section>
  );
}
