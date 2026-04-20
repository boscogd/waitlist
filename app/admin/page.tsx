'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  pendingReminder: number;
  usedCode: number;
  totalFeedbacks: number;
  avgRating: number;
}

export default function AdminDashboard() {
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchWithAuth = async (url: string) => {
    return fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
  };

  const loadStats = async (key: string) => {
    try {
      const [remindRes, feedbackRes, countRes] = await Promise.allSettled([
        fetch('/api/remind-code', { headers: { 'Authorization': `Bearer ${key}` } }),
        fetch('/api/feedback', { headers: { 'Authorization': `Bearer ${key}` } }),
        fetch('/api/waitlist/count'),
      ]);

      let totalUsers = 0;
      let pendingReminder = 0;
      let usedCode = 0;
      let totalFeedbacks = 0;
      let avgRating = 0;

      if (countRes.status === 'fulfilled' && countRes.value.ok) {
        const data = await countRes.value.json();
        totalUsers = data.count || 0;
      }

      if (remindRes.status === 'fulfilled' && remindRes.value.ok) {
        const data = await remindRes.value.json();
        pendingReminder = data.summary?.pendingReminder || 0;
        usedCode = data.summary?.alreadyUsedCode || 0;
      }

      if (feedbackRes.status === 'fulfilled' && feedbackRes.value.ok) {
        const data = await feedbackRes.value.json();
        totalFeedbacks = data.feedbacks?.length || 0;
        avgRating = parseFloat(data.averageRating) || 0;
      }

      setStats({ totalUsers, pendingReminder, usedCode, totalFeedbacks, avgRating });
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

      setAuthenticated(true);
      localStorage.setItem('admin_dashboard_key', apiKey);
      await loadStats(apiKey);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('admin_dashboard_key');
    if (savedKey) {
      setApiKey(savedKey);
      // Verificar clave y renovar cookie de sesión
      fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: savedKey }),
      }).then(async (response) => {
        if (response.ok) {
          setAuthenticated(true);
          setApiKey(savedKey);
          await loadStats(savedKey);
        } else {
          localStorage.removeItem('admin_dashboard_key');
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const panels = [
    {
      title: 'Emails',
      description: 'Borradores, plantillas, generar con IA y estadísticas de la campaña de emails.',
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
      title: 'Recordatorios',
      description: 'Envía recordatorios a usuarios que no han activado su código de acceso.',
      href: '/admin/reminders',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      ),
      color: 'from-amber-500 to-amber-600',
      shadowColor: 'shadow-amber-500/20',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: 'Lanzamiento',
      description: 'Envía la notificación de lanzamiento a los usuarios de la lista de espera.',
      href: '/admin/launch',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-emerald-600',
      shadowColor: 'shadow-emerald-500/20',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
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
                onClick={() => {
                  localStorage.removeItem('admin_dashboard_key');
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
              <div className="text-sm text-texto/50">Usuarios totales</div>
              <div className="text-2xl font-bold text-azul mt-1">{stats.totalUsers}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-azul/10 shadow-sm">
              <div className="text-sm text-texto/50">Código activado</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.usedCode}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-azul/10 shadow-sm">
              <div className="text-sm text-texto/50">Pendientes</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingReminder}</div>
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
