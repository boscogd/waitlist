'use client';

import { useState, useEffect, useCallback } from 'react';

interface WinbackStats {
  dormant_14d: number;
  in_step_1: number;
  in_step_2: number;
  in_step_3: number;
  completed: number;
  unsubscribed: number;
  reactivated_7d: number;
}

interface RunResult {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  reset: number;
  byStep: Record<string, number>;
  errors: Array<{ email: string; error: string }>;
}

export default function WinbackAdmin() {
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState<WinbackStats | null>(null);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<RunResult | null>(null);

  const loadStats = useCallback(async () => {
    try {
      // ?mode=stats: pide solo métricas, nunca dispara la secuencia. La cookie
      // httpOnly autoriza como admin en verifyCampaignAuth (same-origin).
      const res = await fetch('/api/winback-campaign?mode=stats');
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error('No se pudieron cargar estadísticas');
      const data = await res.json();
      setStats(data.stats);
    } catch (e) {
      console.error(e);
      setError('Error cargando estadísticas');
    }
  }, []);

  useEffect(() => {
    // Al montar, comprobamos la sesión con la cookie httpOnly.
    fetch('/api/admin/login')
      .then((r) => {
        if (r.ok) {
          setAuthenticated(true);
          loadStats();
        }
      })
      .finally(() => setLoading(false));
  }, [loadStats]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Validar la clave y establecer la cookie httpOnly de sesión.
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey }),
      });
      if (!r.ok) {
        setError('Clave incorrecta');
        return;
      }
      // Cookie puesta: ya no guardamos la clave en el navegador.
      setApiKey('');
      setAuthenticated(true);
      await loadStats();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const runCampaign = async () => {
    if (!confirm('¿Ejecutar la campaña ahora? Esto enviará emails reales a los usuarios elegibles.')) return;
    setRunning(true);
    setLastRun(null);
    try {
      // Ejecución manual: la cookie httpOnly autoriza como admin (isCron:false).
      const r = await fetch('/api/winback-campaign', { method: 'POST' });
      const data = await r.json();
      if (r.ok && data.success) {
        setLastRun(data.result);
        await loadStats();
      } else {
        alert(`Error: ${data.error || 'desconocido'}`);
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-marfil flex items-center justify-center">
        <div className="text-azul/60">Cargando…</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-marfil flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-azul/5 border border-azul/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-azul to-azul-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">↻</span>
              </div>
              <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul">
                Win-back
              </h2>
              <p className="text-texto/60 text-sm mt-2">
                Re-engagement de usuarios dormidos
              </p>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Clave de admin"
                className="w-full px-4 py-3 border border-azul/15 rounded-xl focus:outline-none focus:border-azul"
                autoFocus
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={!apiKey || loading}
                className="w-full bg-azul text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const reactivationRate =
    stats && stats.in_step_1 + stats.in_step_2 + stats.in_step_3 + stats.completed > 0
      ? (
          (stats.reactivated_7d /
            (stats.in_step_1 + stats.in_step_2 + stats.in_step_3 + stats.completed)) *
          100
        ).toFixed(1)
      : '—';

  return (
    <div className="min-h-screen bg-marfil p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul">
              Win-back
            </h1>
            <p className="text-texto/60 text-sm mt-1">
              Re-engagement de usuarios dormidos · Cron diario 10:00 UTC
            </p>
          </div>
          <button
            onClick={() => loadStats()}
            className="px-4 py-2 text-sm text-azul border border-azul/20 rounded-lg hover:bg-azul/5"
          >
            Refrescar
          </button>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Dormidos (14d+)" value={stats.dormant_14d} primary />
              <StatCard label="Re-activados (7d)" value={stats.reactivated_7d} accent />
              <StatCard label="Baja" value={stats.unsubscribed} muted />
              <StatCard label="Tasa re-activación" value={`${reactivationRate}%`} accent />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-azul/10 mb-6">
              <h3 className="text-azul font-medium mb-4">Funnel actual</h3>
              <div className="grid grid-cols-4 gap-4">
                <FunnelStep label="Email #1" sub="día 14" value={stats.in_step_1} />
                <FunnelStep label="Email #2" sub="día 17" value={stats.in_step_2} />
                <FunnelStep label="Email #3" sub="día 21" value={stats.in_step_3} />
                <FunnelStep label="Completado" sub="no más correos" value={stats.completed} muted />
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-azul/10 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-azul font-medium">Ejecución manual</h3>
            <button
              onClick={runCampaign}
              disabled={running}
              className="px-6 py-2.5 bg-azul text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {running ? 'Procesando…' : 'Ejecutar ahora'}
            </button>
          </div>
          <p className="text-texto/60 text-sm">
            El cron ya corre cada día. Esto solo es útil para una primera ronda o para pruebas.
          </p>
        </div>

        {lastRun && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-azul/10">
            <h3 className="text-azul font-medium mb-4">Última ejecución</h3>
            <div className="grid grid-cols-5 gap-4 text-sm">
              <Mini label="Procesados" value={lastRun.processed} />
              <Mini label="Enviados" value={lastRun.sent} highlight />
              <Mini label="Fallidos" value={lastRun.failed} />
              <Mini label="Saltados" value={lastRun.skipped} />
              <Mini label="Reset" value={lastRun.reset} />
            </div>
            <div className="mt-4 pt-4 border-t border-azul/10 text-sm text-texto/70">
              Por paso: #1: {lastRun.byStep['1'] || 0} · #2: {lastRun.byStep['2'] || 0} · #3:{' '}
              {lastRun.byStep['3'] || 0}
            </div>
            {lastRun.errors.length > 0 && (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-red-600">
                  Errores ({lastRun.errors.length})
                </summary>
                <ul className="mt-2 space-y-1 text-texto/60">
                  {lastRun.errors.slice(0, 10).map((e, i) => (
                    <li key={i}>
                      <span className="font-mono">{e.email}</span> — {e.error}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  primary,
  accent,
  muted,
}: {
  label: string;
  value: number | string;
  primary?: boolean;
  accent?: boolean;
  muted?: boolean;
}) {
  const color = primary
    ? 'text-azul'
    : accent
    ? 'text-amber-600'
    : muted
    ? 'text-texto/50'
    : 'text-texto';
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-azul/10">
      <div className="text-xs text-texto/60 uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-3xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function FunnelStep({
  label,
  sub,
  value,
  muted,
}: {
  label: string;
  sub: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div className={`text-center p-4 rounded-xl ${muted ? 'bg-marfil' : 'bg-azul/5'}`}>
      <div className="text-xs text-texto/60 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${muted ? 'text-texto/50' : 'text-azul'}`}>
        {value}
      </div>
      <div className="text-xs text-texto/50 mt-1">{sub}</div>
    </div>
  );
}

function Mini({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-texto/60 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-semibold ${highlight ? 'text-amber-600' : 'text-azul'}`}>
        {value}
      </div>
    </div>
  );
}
