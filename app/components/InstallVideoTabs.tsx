'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import PhoneFrame from './PhoneFrame';
import { GooglePlayBadge } from './StoreButtons';

type Platform = 'android' | 'ios';

const TABS: { id: Platform; label: string }[] = [
  { id: 'android', label: 'Android' },
  { id: 'ios', label: 'iPhone' },
];

const IOS_VIDEO = { src: '/ios.mp4', poster: '/ios-poster.jpg', seconds: 24 };

/**
 * Marco de móvil con pestañas Android / iPhone. Android: la app está en
 * Google Play (botón a la ficha). iPhone: vídeo de instalación desde Safari.
 * Detecta iOS tras montar (evita mismatch de hidratación).
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
        {platform === 'ios' ? (
          <PhoneFrame className="relative" screenClassName="bg-[#0e1726]">
            <video
              className="absolute inset-0 h-full w-full object-contain"
              controls
              playsInline
              preload="metadata"
              poster={IOS_VIDEO.poster}
              aria-label={`Tutorial de instalación en iPhone, ${IOS_VIDEO.seconds} segundos`}
            >
              <source src={IOS_VIDEO.src} type="video/mp4" />
              Tu navegador no soporta vídeos HTML5.
            </video>
          </PhoneFrame>
        ) : (
          <PhoneFrame className="relative" screenClassName="bg-marfil">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5 text-center">
              <Image
                src="/icon-refugio-192.png"
                alt=""
                width={72}
                height={72}
                className="rounded-2xl shadow-lg shadow-azul/15"
              />
              <div>
                <p className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul leading-tight">
                  Refugio en la Palabra
                </p>
                <p className="mt-1 text-xs text-texto/60">Búscala en Google Play o pulsa aquí</p>
              </div>
              <GooglePlayBadge where="como-funciona" className="!min-w-0 !px-4" />
            </div>
          </PhoneFrame>
        )}
      </div>

      <p className="text-xs text-texto/60">
        {platform === 'ios'
          ? `Tutorial de iPhone · ${IOS_VIDEO.seconds} segundos`
          : 'En Android se descarga como cualquier app'}
      </p>
    </div>
  );
}
