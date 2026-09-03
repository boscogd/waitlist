'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent, trackPageview } from '@/lib/track';

/**
 * Registra páginas vistas (en cada cambio de ruta) y clics en cualquier
 * elemento con `data-track="nombre_evento"`. Los atributos `data-track-*`
 * adicionales viajan como props del evento:
 *
 *   <a href="/descargar" data-track="cta_click" data-track-where="hero">
 *
 * Se monta una vez en el layout raíz. No renderiza nada.
 */
export default function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    trackPageview(pathname);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest?.('[data-track]');
      if (!el) return;
      const name = el.getAttribute('data-track');
      if (!name) return;
      const props: Record<string, string> = {};
      for (const attr of Array.from(el.attributes)) {
        if (attr.name.startsWith('data-track-')) {
          props[attr.name.slice('data-track-'.length)] = attr.value;
        }
      }
      trackEvent(name, props);
    };
    // Fase de captura: se registra aunque el handler del elemento pare la propagación.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
