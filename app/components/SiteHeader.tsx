'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const NAV = [
  { id: 'caracteristicas', label: 'Características' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'nosotros', label: 'Quiénes somos' },
  { id: 'faq', label: 'FAQ' },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  // Header gana sombra al bajar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scrollspy: resalta la sección visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-marfil/95 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? 'shadow-md shadow-azul/5 border-b border-azul/10' : 'border-b border-azul/5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo → arriba del todo */}
        <a href="#top" className="flex items-center gap-3" aria-label="Inicio">
          <Image
            src="/logo-512-1.png"
            alt="Refugio en la Palabra"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul hidden sm:block">
            Refugio en la Palabra
          </span>
        </a>

        {/* Navegación desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`text-sm transition-colors ${
                active === id ? 'text-azul font-medium' : 'text-texto/70 hover:text-azul'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA + hamburguesa */}
        <div className="flex items-center gap-2">
          <Link
            href="/descargar"
            className="bg-azul text-white px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-azul-800 transition-colors shadow-sm"
          >
            Instalar gratis
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-azul hover:bg-azul/5 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menú desplegable móvil */}
      <div
        className={`md:hidden overflow-hidden border-t border-azul/5 transition-all duration-300 ease-out ${
          open ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-6 py-2 flex flex-col">
          {NAV.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className={`py-3 text-base border-b border-azul/5 last:border-0 transition-colors ${
                active === id ? 'text-azul font-medium' : 'text-texto/80 hover:text-azul'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
