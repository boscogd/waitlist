'use client';

import { useState } from 'react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('¡Bienvenido! Revisa tu correo para confirmar tu registro.');
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Hubo un error. Por favor, inténtalo de nuevo.');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión. Por favor, inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="sr-only">
            Tu nombre
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
            className="w-full px-6 py-4 text-base text-texto bg-white border border-azul/20 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-albero focus:border-transparent
                     placeholder:text-texto/50 transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="email" className="sr-only">
            Tu correo electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            className="w-full px-6 py-4 text-base text-texto bg-white border border-azul/20 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-albero focus:border-transparent
                     placeholder:text-texto/50 transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-8 py-4 text-base font-medium text-white bg-azul rounded-lg
                   hover:bg-azul-800 focus:outline-none focus:ring-2 focus:ring-offset-2
                   focus:ring-albero disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {loading ? 'Enviando...' : 'Quiero acceso anticipado'}
        </button>
      </form>

      {status !== 'idle' && (
        <div
          className={`mt-4 p-4 rounded-lg text-sm ${
            status === 'success'
              ? 'bg-albero/10 text-azul border border-albero/30'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <p className="mt-6 text-xs text-center text-texto/60 leading-relaxed">
        Cero spam. Baja con un clic.{' '}
        <a
          href="/privacidad"
          className="underline hover:text-azul transition-colors"
        >
          Consulta la política de privacidad
        </a>
        .
      </p>
    </div>
  );
}
