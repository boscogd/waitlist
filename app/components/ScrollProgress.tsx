'use client';

import { useEffect, useState } from 'react';

/** Barra fina superior que indica el progreso de scroll de la página. */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 pointer-events-none" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-albero to-dorado"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
