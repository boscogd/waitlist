'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import PhoneFrame from '../PhoneFrame';
import SectionHeader from '../ui/SectionHeader';
import { IconCheckAlbero } from '../icons';
import { features } from '@/lib/content/features';

/**
 * - scrub: escritorio con ratón. El vídeo de cada función avanza con el scroll
 *   (cada tarjeta ocupa ~80vh y el progreso dentro de ella marca el tiempo).
 * - autoplay: móvil/tablet. El teléfono se queda pegado arriba y el vídeo de la
 *   función visible se reproduce solo, en bucle y sin sonido.
 * - static: prefers-reduced-motion. Solo pósteres, nada se mueve solo.
 */
type Mode = 'scrub' | 'autoplay' | 'static';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export default function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>('static');
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  // Elegimos el modo en el cliente (en SSR todo es estático).
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktop = window.matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
    ).matches;
    setMode(reduce ? 'static' : desktop ? 'scrub' : 'autoplay');
  }, []);

  // Escritorio: el scroll "frota" el vídeo (con suavizado para que no dé saltos).
  useEffect(() => {
    if (mode !== 'scrub') return;
    let raf = 0;
    let dirty = true;
    let idx = 0;
    let progress = 0; // 0..1 dentro de la tarjeta activa
    let current = -1; // tiempo suavizado del vídeo

    const measure = () => {
      const center = window.innerHeight / 2;
      let i = 0;
      let p = 0;
      for (let k = 0; k < itemRefs.current.length; k++) {
        const el = itemRefs.current[k];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const local = (center - r.top) / r.height;
        if (local < 0) break; // esta tarjeta aún no ha llegado al centro
        i = k;
        p = clamp(local, 0, 1);
      }
      if (i !== activeRef.current) {
        activeRef.current = i;
        current = -1;
        setActive(i);
      }
      idx = i;
      progress = p;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(3)})`;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (dirty) {
        dirty = false;
        measure();
      }
      const video = videoRefs.current[idx];
      if (!video || !video.duration) return;
      // Dejamos un pelín de margen al final para no caer en el "ended".
      const target = progress * Math.max(video.duration - 0.05, 0);
      if (current < 0) current = target;
      else current += (target - current) * 0.16;
      if (Math.abs(video.currentTime - current) > 1 / 30 && !video.seeking) {
        video.currentTime = current;
      }
    };

    const onScroll = () => {
      dirty = true;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [mode]);

  // Móvil: la tarjeta visible decide qué vídeo se reproduce.
  useEffect(() => {
    if (mode !== 'autoplay') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(i)) {
            activeRef.current = i;
            setActive(i);
          }
        });
      },
      // Franja inferior del viewport: arriba está el teléfono pegado.
      { rootMargin: '-60% 0px -22% 0px', threshold: 0 }
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [mode]);

  // Reproduce solo el vídeo activo (y solo en modo autoplay).
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (mode === 'autoplay' && i === active) {
        v.muted = true;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active, mode]);

  const current = features[active];

  return (
    <section id="caracteristicas" className="px-6 py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <SectionHeader
            eyebrow="Características"
            eyebrowClassName="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider"
            title="Todo lo que necesitas para tu vida espiritual"
            titleClassName="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3 mb-4"
            subtitle="Diseñado por católicos, para católicos. Baja despacio: cada función se enseña con la app real en movimiento."
            subtitleClassName="text-texto/70 max-w-2xl mx-auto"
          />
        </div>

        {/* Sin items-start: la celda del teléfono debe estirarse a toda la fila
            para que el sticky interior tenga recorrido. */}
        <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* Teléfono fijo */}
          <div className="sticky top-20 z-10 -mx-6 px-6 pb-5 pt-2 bg-marfil lg:static lg:mx-0 lg:px-0 lg:bg-transparent lg:pt-0 lg:pb-0">
            <div className="lg:sticky lg:top-28">
              <div className="relative mx-auto w-36 sm:w-44 lg:w-72">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-albero/30 via-dorado/10 to-azul/15 blur-3xl scale-110"
                />
                <PhoneFrame className="relative" screenClassName="bg-white">
                  {features.map((f, i) => {
                    const on = i === active;
                    return (
                      <video
                        key={f.video}
                        ref={(el) => {
                          videoRefs.current[i] = el;
                        }}
                        src={f.video}
                        poster={f.poster}
                        muted
                        playsInline
                        loop={mode === 'autoplay'}
                        preload={mode === 'scrub' ? 'auto' : 'metadata'}
                        disablePictureInPicture
                        aria-hidden={!on}
                        aria-label={f.videoLabel}
                        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
                        style={{ opacity: on ? 1 : 0 }}
                      />
                    );
                  })}
                </PhoneFrame>
              </div>

              {/* Progreso: barra (escritorio, sigue el scroll) o puntos (móvil) */}
              {mode === 'scrub' ? (
                <div
                  className="mx-auto mt-5 h-1 w-40 overflow-hidden rounded-full bg-azul/10"
                  aria-hidden="true"
                >
                  <div
                    ref={barRef}
                    className="h-full w-full origin-left bg-gradient-to-r from-albero to-dorado"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mt-4" aria-hidden="true">
                  {features.map((f, i) => (
                    <span
                      key={f.title}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === active ? 'w-6 bg-azul' : 'w-1.5 bg-azul/25'
                      }`}
                    />
                  ))}
                </div>
              )}
              <p role="status" aria-live="polite" className="sr-only">
                {current.videoLabel}
              </p>
            </div>
          </div>

          {/* Tarjetas de funciones. En escritorio cada una ocupa ~80vh: es el
              tramo de scroll que recorre su vídeo. */}
          <ol className="space-y-4 mt-6 lg:mt-0 lg:space-y-0">
            {features.map((feature, i) => {
              const isActive = i === active;
              return (
                <li
                  key={feature.title}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  data-index={i}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => setActive(i)}
                  className="lg:min-h-[80vh] lg:flex lg:items-center"
                >
                  <div
                    className={`w-full rounded-2xl border p-6 sm:p-7 cursor-pointer transition-all duration-500 ${
                      isActive
                        ? 'bg-white border-albero/40 shadow-xl shadow-albero/10'
                        : 'bg-white/40 border-azul/5 hover:bg-white/70 hover:border-azul/10'
                    }`}
                  >
                    <div className="flex items-start gap-4 sm:gap-5">
                      <Image
                        src={feature.icon}
                        alt={feature.iconAlt}
                        width={52}
                        height={52}
                        className={`shrink-0 transition-transform duration-500 ${
                          isActive ? 'scale-110' : 'scale-100 opacity-80'
                        }`}
                      />
                      <div className="min-w-0">
                        <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                          {feature.title}
                        </h3>
                        <p className="mt-2 text-texto/70 leading-relaxed">{feature.description}</p>
                        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-texto/60">
                          {feature.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-center gap-1.5">
                              <IconCheckAlbero className="w-4 h-4 text-albero" />
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
