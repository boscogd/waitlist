'use client';

import { useEffect, useId, useState } from 'react';
import PhoneFrame from './PhoneFrame';

type Platform = 'android' | 'ios';

const TABS: { id: Platform; label: string; src: string }[] = [
  { id: 'android', label: 'Android', src: '/android.mp4' },
  { id: 'ios', label: 'iPhone', src: '/ios.mp4' },
];

/**
 * Vídeo de instalación (30 s) dentro de un marco de móvil, con pestañas
 * Android / iPhone. Detecta iOS tras montar (evita mismatch de hidratación).
 */
export default function InstallVideoTabs() {
  const [platform, setPlatform] = useState<Platform>('android');
  const baseId = useId();

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (/Macintosh/.test(ua) && 'ontouchend' in document);
    if (isIOS) setPlatform('ios');
  }, []);

  const current = TABS.find((t) => t.id === platform) ?? TABS[0];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const idx = TABS.findIndex((t) => t.id === platform);
    const next = (idx + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
    setPlatform(TABS[next].id);
    document.getElementById(`${baseId}-tab-${TABS[next].id}`)?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        role="tablist"
        aria-label="Elige tu móvil"
        onKeyDown={onKeyDown}
        className="inline-flex rounded-full bg-white p-1 border border-azul/10 shadow-sm"
      >
        {TABS.map((tab) => {
          const selected = tab.id === platform;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setPlatform(tab.id)}
              className={`min-w-24 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selected ? 'bg-azul text-white shadow-sm' : 'text-texto/70 hover:text-azul'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${platform}`}
        className="relative w-52 sm:w-60"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-albero/25 to-azul/10 blur-2xl scale-110"
        />
        <PhoneFrame className="relative" screenClassName="bg-[#0e1726]">
          <video
            key={platform}
            className="absolute inset-0 h-full w-full object-contain"
            controls
            playsInline
            preload="metadata"
            aria-label={`Tutorial de instalación en ${current.label}, 30 segundos`}
          >
            <source src={current.src} type="video/mp4" />
            Tu navegador no soporta vídeos HTML5.
          </video>
        </PhoneFrame>
      </div>

      <p className="text-xs text-texto/60">Tutorial de {current.label} · 30 segundos</p>
    </div>
  );
}
