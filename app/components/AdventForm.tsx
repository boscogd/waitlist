'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/track';
import { adventoCerrado } from '@/lib/content/adviento';

const inputClass =
  'w-full px-5 py-4 text-base text-texto bg-white border border-azul/20 rounded-lg ' +
  'focus:outline-none focus:ring-2 focus:ring-albero focus:border-transparent ' +
  'placeholder:text-texto/60 transition-all duration-200';

export default function AdventForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  // La página es estática: si el reto ha terminado se sabe en el navegador.
  const [closed, setClosed] = useState(false);
  useEffect(() => setClosed(adventoCerrado()), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setStatus('idle');
    setMessage('');
    try {
      const source = new URLSearchParams(window.location.search).get('utm_source') || undefined;
      const response = await fetch('/api/adviento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, website, source }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setStatus('success');
        trackEvent('adviento_signup');
      } else {
        setStatus('error');
        setMessage(data.error || 'No hemos podido apuntarte. Inténtalo de nuevo.');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión. Inténtalo de nuevo en un momento.');
    } finally {
      setLoading(false);
    }
  };

  if (closed) {
    return (
      <p role="status" className="text-center text-texto/80 leading-relaxed">
        El reto de Adviento ya ha terminado. Gracias a quienes lo habéis rezado con nosotros.
      </p>
    );
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-albero/40 bg-albero/10 p-6 space-y-3 text-center"
      >
        <p className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul">
          Ya estás dentro
        </p>
        <p className="text-texto/85 leading-relaxed">
          Recuerda rezar en la app con la cuenta de este mismo correo: así sabremos a quién darle
          el regalo. Si todavía no tienes la app, instálala ahora y crea tu cuenta con él.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="adviento-name" className="block text-sm font-medium text-azul mb-1.5">
          Tu nombre
        </label>
        <input
          id="adviento-name"
          name="name"
          type="text"
          autoComplete="given-name"
          required
          minLength={2}
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="adviento-email" className="block text-sm font-medium text-azul mb-1.5">
          El correo de tu cuenta de la app
        </label>
        <input
          id="adviento-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          aria-describedby="adviento-email-help"
          className={inputClass}
        />
        <p id="adviento-email-help" className="mt-1.5 text-sm text-texto/70">
          Si aún no tienes cuenta, usa este mismo correo cuando la crees.
        </p>
      </div>

      {/* Campo trampa para robots: oculto a personas y a lectores de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="adviento-website">No rellenes este campo</label>
        <input
          id="adviento-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-8 py-4 text-base font-medium text-white bg-azul rounded-lg hover:bg-azul-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-albero disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {loading ? 'Apuntándote…' : 'Apuntarme al reto'}
      </button>

      {status === 'error' && (
        <p role="alert" className="p-4 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
          {message}
        </p>
      )}

      <p className="text-xs text-texto/70 leading-relaxed">
        Usaremos tu correo solo para el reto de Adviento: saber a qué cuenta darle el regalo y
        escribirte sobre el propio reto.{' '}
        <Link href="/privacidad" className="underline hover:text-azul transition-colors">
          Política de privacidad
        </Link>
        .
      </p>
    </form>
  );
}
