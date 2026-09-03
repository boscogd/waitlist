'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  appUsers: number;
  dormant: number;
  pendingCode: number;
  totalFeedbacks: number;
  avgRating: number;
}

export default function AdminDashboard() {
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const loadStats = async () => {
    try {
      // Peticiones same-origin: la cookie httpOnly `admin-session` viaja sola,
      // no hace falta cabecera Authorization.
      const [profilesRes, feedbackRes] = await Promise.allSettled([
        fetch('/api/profiles/count'),
        fetch('/api/feedback'),
      ]);
      // Embudos de las campañas (RPCs accesibles con la anon key)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const [wb, cr] = await Promise.allSettled([
        sb.rpc('winback_stats'),
        sb.rpc('code_reminder_stats'),
      ]);

      let appUsers = 0;
      let dormant = 0;
      let pendingCode = 0;
      let totalFeedbacks = 0;
      let avgRating = 0;

      if (profilesRes.status === 'fulfilled' && profilesRes.value.ok) {
        const data = await profilesRes.value.json();
        appUsers = data.count || 0;
      }
      if (wb.status === 'fulfilled' && !wb.value.error) {
        dormant = wb.value.data?.dormant_14d || 0;
      }
      if (cr.status === 'fulfilled' && !cr.value.error) {
        pendingCode = cr.value.data?.pending || 0;
      }
      if (feedbackRes.status === 'fulfilled' && feedbackRes.value.ok) {
        const data = await feedbackRes.value.json();
        totalFeedbacks = data.feedbacks?.length || 0;
        avgRating = parseFloat(data.averageRating) || 0;
      }

      setStats({ appUsers, dormant, pendingCode, totalFeedbacks, avgRating });
    } catch {
      // Stats are optional, don't block the dashboard
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar clave y establecer cookie de sesión segura
      const loginRes = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey }),
      });

      if (!loginRes.ok) {
        setError('Clave de acceso incorrecta');
        setLoading(false);
        return;
      }

      // Login OK: la cookie httpOnly ya está puesta. No guardamos la clave.
      setApiKey('');
      setAuthenticated(true);
      await loadStats();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Al montar, comprobamos la sesión con la cookie httpOnly (no reenviamos
    // la clave, que ya no vive en el navegador).
    fetch('/api/admin/login')
      .then(async (response) => {
        if (response.ok) {
          setAuthenticated(true);
          await loadStats();
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const panels = [
    {
      title: 'Correos',
      description: 'Escribe y envía correos, gestiona las plantillas de las campañas y consulta métricas.',
      href: '/admin/emails',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/20',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Win-back',
      description: 'Campaña de recuperación de usuarios dormidos: embudo, estadísticas y ejecución manual.',
      href: '/admin/winback',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      ),
      color: 'from-amber-500 to-amber-600',
      shadowColor: 'shadow-amber-500/20',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: 'Feedback',
      description: 'Consulta las valoraciones y comentarios que han dejado los usuarios.',
      href: '/admin/feedback',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      shadowColor: 'shadow-purple-500/20',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Analítica',
      description: 'Quién visita la web, cuántos, desde dónde, a qué página llegan y qué hacen (clics en instalar, Instagram, feedback).',
      href: '/admin/analytics',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      color: 'from-emerald-500 to-emerald-600',
      shadowColor: 'shadow-emerald-500/20',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ];

  // Auth screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-marfil flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-azul/5 border border-azul/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-azul to-azul-800 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-azul/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul">
                Panel de Administración
              </h2>
              <p className="text-texto/60 text-sm mt-2">
                Refugio en la Palabra
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-texto/70 mb-2">
                  Clave de acceso
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Tu clave de administrador"
                  required
                  className="w-full px-4 py-3 text-base text-texto bg-marfil/50 border border-azul/20 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-azul/30 focus:border-azul transition-all"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-azul to-azul-800 rounded-xl
                         hover:shadow-lg hover:shadow-azul/20 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verificando...
                  </>
                ) : (
                  <>
                    Acceder
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-marfil">
      {/* Header */}
      <header className="bg-white border-b border-azul/10 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-azul to-azul-800 rounded-xl flex items-center justify-center shadow-md shadow-azul/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  Panel de Administración
                </h1>
                <p className="text-xs text-texto/50">Refugio en la Palabra</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-sm text-texto/60 hover:text-azul hover:bg-azul/5 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
                </svg>
                Web
              </Link>
              <button
                onClick={async () => {
                  // Logout: el backend borra la cookie httpOnly de sesión.
                  await fetch('/api/admin/login', { method: 'DELETE' }).catch(() => {});
                  setAuthenticated(false);
                  setApiKey('');
                  setStats(null);
                }}
                className="px-4 py-2 text-sm text-texto/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-azul/10 shadow-sm">
              <div className="text-sm text-texto/50">Usuarios de la app</div>
              <div className="text-2xl font-bold text-azul mt-1">{stats.appUsers}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-azul/10 shadow-sm">
              <div className="text-sm text-texto/50">Dormidos (14d)</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{stats.dormant}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-azul/10 shadow-sm">
              <div className="text-sm text-texto/50">Código sin canjear</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.pendingCode}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-azul/10 shadow-sm">
              <div className="text-sm text-texto/50">Feedbacks</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {stats.totalFeedbacks}
                {stats.avgRating > 0 && (
                  <span className="text-sm font-normal text-texto/40 ml-2">
                    ({stats.avgRating.toFixed(1)}/5)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Panel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {panels.map((panel) => (
            <Link
              key={panel.href}
              href={panel.href}
              className="group bg-white rounded-2xl p-6 border border-azul/10 shadow-sm hover:shadow-xl hover:shadow-azul/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 ${panel.bgLight} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={panel.textColor}>
                    {panel.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul">
                      {panel.title}
                    </h2>
                    <svg className="w-5 h-5 text-texto/30 group-hover:text-azul group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-texto/60 mt-1 leading-relaxed">
                    {panel.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl p-6 border border-azul/10 shadow-sm">
          <h3 className="font-[family-name:var(--font-lora)] text-base font-semibold text-azul mb-4">
            Enlaces rápidos
          </h3>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://vercel.com/boscogds-projects/waitlist"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-texto/70 bg-marfil/50 hover:bg-azul/5 border border-azul/10 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 76 65" fill="currentColor">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              Vercel
            </a>
            <a
              href="https://github.com/boscogd/waitlist"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-texto/70 bg-marfil/50 hover:bg-azul/5 border border-azul/10 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-texto/70 bg-marfil/50 hover:bg-azul/5 border border-azul/10 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 109 113">
                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" />
                <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fillOpacity="0.5" />
              </svg>
              Supabase
            </a>
            <a
              href="https://resend.com/emails"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-texto/70 bg-marfil/50 hover:bg-azul/5 border border-azul/10 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Resend
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
