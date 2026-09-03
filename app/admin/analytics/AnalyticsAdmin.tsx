'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

// =====================================================
// TIPOS (espejo del JSON de la RPC site_analytics)
// =====================================================

type Totals = { visitors: number; pageviews: number; entries: number; installs: number; events: number };
type DayPoint = { date: string; visitors: number; pageviews: number; installs: number };
type Named = { name: string; visitors: number; entries?: number };
type RecentEvent = {
  id: number;
  created_at: string;
  kind: 'pageview' | 'event';
  name: string;
  path: string;
  is_entry: boolean;
  referrer_host: string | null;
  utm_source: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  os: string | null;
  browser: string | null;
  visitor_hash: string;
  props: Record<string, unknown> | null;
};
type Signups = {
  total: number;
  from_web: number;
  prev_total: number;
  prev_from_web: number;
  by_source: { name: string; signups: number }[];
  by_where: { name: string; signups: number }[];
  by_landing: { name: string; signups: number }[];
};
type AnalyticsData = {
  range: { days: number; from: string; to: string; tz: string; generated_at: string };
  totals: Totals;
  prev: Totals;
  by_day: DayPoint[];
  referrers: Named[];
  utm: { source: string | null; medium: string | null; campaign: string | null; visitors: number; entries: number }[];
  landing: { path: string; visitors: number; entries: number }[];
  pages: { path: string; pageviews: number; visitors: number }[];
  countries: { country: string; visitors: number }[];
  cities: { city: string; country: string | null; visitors: number }[];
  devices: Named[];
  os: Named[];
  browsers: Named[];
  events: { name: string; count: number; visitors: number }[];
  recent: RecentEvent[];
  signups?: Signups; // ausente hasta ejecutar el SQL con la sección web → app
};

type Period = 7 | 30 | 90;
const PERIODS: Period[] = [7, 30, 90];
const PERIOD_KEY = 'rp_admin_analytics_days';
const AUTO_REFRESH_MS = 60_000;

// =====================================================
// FORMATO
// =====================================================

const nf = new Intl.NumberFormat('es-ES');
const fmt = (n: number | null | undefined) => nf.format(n ?? 0);

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['es'], { type: 'region' })
    : null;

function countryName(code: string | null | undefined): string {
  if (!code || code === '??') return 'Desconocido';
  try {
    return regionNames?.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

const DEVICE_LABEL: Record<string, string> = {
  mobile: 'Móvil',
  tablet: 'Tablet',
  desktop: 'Ordenador',
  otro: 'Otro',
};

// Nombres legibles de los eventos que emite la web (data-track / trackEvent).
const EVENT_LABEL: Record<string, string> = {
  install_click: 'Abrir la app e instalar',
  cta_click: 'Instalar gratis (CTA)',
  instagram_click: 'Ir a Instagram',
  feedback_sent: 'Feedback enviado',
  platform_select: 'Elige Android / iPhone',
};
const eventLabel = (name: string) => EVENT_LABEL[name] || name;

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 45) return 'ahora';
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ayer';
  if (d < 7) return `hace ${d} días`;
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// Variación porcentual vs. periodo anterior. null si no hay base.
function delta(cur: number, prev: number): number | null {
  if (!prev) return null;
  return ((cur - prev) / prev) * 100;
}

// Techo "bonito" para el eje Y (1 / 2 / 5 × 10^k).
function niceCeil(n: number): number {
  if (n <= 5) return 5;
  const p = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / p;
  const m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return m * p;
}

// =====================================================
// PIEZAS DE UI
// =====================================================

function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white rounded-2xl border border-azul/10 shadow-sm p-5 sm:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-lora)] text-base font-semibold text-azul">{title}</h2>
          {subtitle && <p className="text-xs text-texto/55 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  size = 'sm',
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  size?: 'sm' | 'md';
}) {
  const pad = size === 'md' ? 'px-3.5 py-2 text-sm' : 'px-2.5 py-1.5 text-xs';
  return (
    <div role="group" aria-label={label} className="inline-flex bg-marfil rounded-lg p-1 border border-azul/10">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`${pad} rounded-md font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-albero ${
              active ? 'bg-white text-azul shadow-sm' : 'text-texto/60 hover:text-azul'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function KpiTile({
  label,
  value,
  prev,
  format = 'int',
  hint,
}: {
  label: string;
  value: number;
  prev: number;
  format?: 'int' | 'pct';
  hint?: string;
}) {
  const d = delta(value, prev);
  const display = format === 'pct' ? `${value.toFixed(1).replace('.', ',')} %` : fmt(value);
  return (
    <div className="bg-white rounded-xl p-4 border border-azul/10 shadow-sm min-w-0">
      <div className="text-xs font-medium text-texto/55 truncate" title={hint}>
        {label}
      </div>
      <div className="text-3xl font-semibold text-azul mt-1 leading-none">{display}</div>
      <div className="mt-2 text-xs flex items-center gap-1.5 min-w-0">
        {d === null ? (
          <span className="text-texto/40">sin periodo previo</span>
        ) : (
          <>
            <span
              className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${
                d > 0 ? 'text-emerald-700' : d < 0 ? 'text-red-700' : 'text-texto/50'
              }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                {d > 0 ? <path d="M6 2l4 5H2z" /> : d < 0 ? <path d="M6 10L2 5h8z" /> : <rect x="2" y="5" width="8" height="2" />}
              </svg>
              {d > 0 ? '+' : ''}
              {Math.abs(d) >= 1000 ? '>999' : d.toFixed(0)} %
            </span>
            <span className="text-texto/40 truncate">vs. anterior</span>
          </>
        )}
      </div>
    </div>
  );
}

// Columnas por día (HTML/CSS): 1 serie, hueco de 2px entre barras, extremo
// redondeado, tooltip al pasar el ratón o enfocar con teclado. Debajo, la
// tabla de datos plegada como alternativa accesible.
function DailyChart({ points }: { points: DayPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const n = points.length;
  const maxV = Math.max(0, ...points.map((p) => p.visitors));
  const top = niceCeil(maxV);
  const today = new Date().toISOString().slice(0, 10);
  const labelEvery = Math.max(1, Math.ceil(n / 6));
  const total = points.reduce((a, p) => a + p.visitors, 0);
  const peak = points.reduce<DayPoint | null>((best, p) => (!best || p.visitors > best.visitors ? p : best), null);

  const summary =
    total === 0
      ? 'Sin visitantes en el periodo.'
      : `${fmt(total)} visitantes en ${n} días; máximo ${fmt(peak?.visitors ?? 0)} el ${peak ? dayLabel(peak.date) : ''}.`;

  return (
    <div>
      <div className="relative" role="img" aria-label={`Visitantes por día. ${summary}`}>
        {/* Eje Y: 3 líneas finas (0, mitad, techo) */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[1, 0.5, 0].map((f) => (
            <div key={f} className="absolute left-0 right-0 flex items-center" style={{ top: `${(1 - f) * 100}%` }}>
              <span className="w-9 text-[10px] tabular-nums text-texto/40 -translate-y-1/2 text-right pr-2">
                {fmt(Math.round(top * f))}
              </span>
              <div className="flex-1 border-t border-azul/10" />
            </div>
          ))}
        </div>

        <div className="relative ml-9 h-44 flex items-end gap-[2px]" onMouseLeave={() => setActive(null)}>
          {points.map((p, i) => {
            const h = top > 0 ? (p.visitors / top) * 100 : 0;
            const isToday = p.date === today;
            const isActive = active === i;
            return (
              <button
                key={p.date}
                type="button"
                className="group relative flex-1 min-w-0 h-full flex items-end justify-center cursor-pointer focus:outline-none"
                aria-label={`${dayLabel(p.date)}: ${fmt(p.visitors)} visitantes, ${fmt(p.pageviews)} páginas vistas, ${fmt(p.installs)} clics en instalar`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <span
                  className={`block w-full max-w-6 rounded-t transition-colors ${
                    isActive ? 'bg-azul-800' : 'bg-azul'
                  } ${isToday ? 'opacity-60' : ''} group-focus-visible:ring-2 group-focus-visible:ring-albero`}
                  style={{ height: `${Math.max(h, p.visitors > 0 ? 2 : 0)}%` }}
                />
              </button>
            );
          })}

        {/* Tooltip */}
        {active !== null && points[active] && (
          <div
            role="tooltip"
            className="absolute top-0 z-10 pointer-events-none bg-azul-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap"
            style={{
              left: `${((active + 0.5) / n) * 100}%`,
              transform:
                active < n * 0.2 ? 'translate(0, -100%)' : active > n * 0.8 ? 'translate(-100%, -100%)' : 'translate(-50%, -100%)',
            }}
          >
            <div className="font-medium">
              {dayLabel(points[active].date)}
              {points[active].date === today ? ' · hoy (en curso)' : ''}
            </div>
            <div className="tabular-nums text-white/85 mt-0.5">
              {fmt(points[active].visitors)} visitantes · {fmt(points[active].pageviews)} vistas · {fmt(points[active].installs)} instalar
            </div>
          </div>
        )}
        </div>

      </div>

      {/* Eje X */}
      <div className="ml-9 mt-1.5 flex gap-[2px]" aria-hidden="true">
        {points.map((p, i) => (
          <div key={p.date} className="flex-1 min-w-0 text-[10px] text-texto/45 text-center truncate">
            {i % labelEvery === 0 || i === n - 1 ? dayLabel(p.date) : ''}
          </div>
        ))}
      </div>

      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-texto/55 hover:text-azul select-none">Ver como tabla</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-azul/10">
          <table className="w-full text-xs">
            <thead className="bg-marfil text-texto/60 sticky top-0">
              <tr>
                <th className="text-left font-medium px-3 py-1.5">Día</th>
                <th className="text-right font-medium px-3 py-1.5">Visitantes</th>
                <th className="text-right font-medium px-3 py-1.5">Páginas vistas</th>
                <th className="text-right font-medium px-3 py-1.5">Clics instalar</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {points.map((p) => (
                <tr key={p.date} className="border-t border-azul/5">
                  <td className="px-3 py-1.5">{dayLabel(p.date)}</td>
                  <td className="px-3 py-1.5 text-right">{fmt(p.visitors)}</td>
                  <td className="px-3 py-1.5 text-right">{fmt(p.pageviews)}</td>
                  <td className="px-3 py-1.5 text-right">{fmt(p.installs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

type RankRow = { key: string; label: string; sub?: string; value: number; secondary?: string };

// Lista ordenada con barra proporcional (una sola tonalidad; la etiqueta
// siempre en texto, nunca solo color).
function RankList({ rows, unit = 'visitantes', empty }: { rows: RankRow[]; unit?: string; empty: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-texto/45 py-6 text-center">{empty}</p>;
  }
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ol className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.key} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-texto" title={r.label}>
              {r.label}
              {r.sub && <span className="text-texto/45 text-xs ml-1.5">{r.sub}</span>}
            </span>
            <span className="tabular-nums text-texto/80 shrink-0">
              {fmt(r.value)}
              {r.secondary && <span className="text-texto/40 text-xs ml-1.5">{r.secondary}</span>}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-azul/10 overflow-hidden" aria-hidden="true">
            <div className="h-full rounded-full bg-azul" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="sr-only">
            {fmt(r.value)} {unit}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-azul/5 ${className}`} aria-hidden="true" />;
}

// =====================================================
// PANEL
// =====================================================

export default function AnalyticsAdmin() {
  const [period, setPeriod] = useState<Period>(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);
  const [auto, setAuto] = useState(false);
  const [geoTab, setGeoTab] = useState<'countries' | 'cities'>('countries');
  const [deviceTab, setDeviceTab] = useState<'devices' | 'os' | 'browsers'>('devices');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // Periodo recordado por navegador (comodidad, no crítico).
  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(PERIOD_KEY));
      if (PERIODS.includes(saved as Period)) setPeriod(saved as Period);
    } catch {
      // sin localStorage: 30 días
    }
  }, []);

  const load = useCallback(
    async (days: Period, silent: boolean) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`, { cache: 'no-store' });
        if (res.status === 401) {
          setUnauthorized(true);
          return;
        }
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Error cargando la analítica');
        }
        setData(json.data as AnalyticsData);
        setUpdatedAt(new Date());
        setUnauthorized(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error de conexión');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    load(period, false);
  }, [period, load]);

  // Auto-refresco cada 60 s (solo con la pestaña visible).
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      if (!document.hidden) load(period, true);
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [auto, period, load]);

  const changePeriod = (p: Period) => {
    setPeriod(p);
    try {
      window.localStorage.setItem(PERIOD_KEY, String(p));
    } catch {
      // ignorar
    }
  };

  const conversion = useMemo(() => {
    if (!data) return { cur: 0, prev: 0 };
    const cur = data.totals.visitors ? (data.totals.installs / data.totals.visitors) * 100 : 0;
    const prev = data.prev.visitors ? (data.prev.installs / data.prev.visitors) * 100 : 0;
    return { cur, prev };
  }, [data]);

  const isEmpty = !!data && data.totals.pageviews === 0 && data.totals.events === 0 && data.recent.length === 0;

  const geoRows: RankRow[] = useMemo(() => {
    if (!data) return [];
    return geoTab === 'countries'
      ? data.countries.map((c) => ({ key: c.country, label: countryName(c.country), sub: c.country !== '??' ? c.country : undefined, value: c.visitors }))
      : data.cities.map((c) => ({ key: `${c.city}-${c.country}`, label: c.city, sub: countryName(c.country), value: c.visitors }));
  }, [data, geoTab]);

  const deviceRows: RankRow[] = useMemo(() => {
    if (!data) return [];
    const src = data[deviceTab];
    return src.map((d) => ({
      key: d.name,
      label: deviceTab === 'devices' ? DEVICE_LABEL[d.name] || d.name : d.name,
      value: d.visitors,
    }));
  }, [data, deviceTab]);

  return (
    <div className="min-h-screen bg-marfil">
      {/* Cabecera */}
      <header className="bg-white border-b border-azul/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <Link href="/admin" className="text-xs text-texto/55 hover:text-azul transition-colors inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Panel de administración
            </Link>
            <h1 className="font-[family-name:var(--font-lora)] text-xl sm:text-2xl font-semibold text-azul leading-tight">
              Analítica de la web
            </h1>
            <p className="text-xs sm:text-sm text-texto/60 mt-0.5">
              Quién entra, cuántos, desde dónde, a qué página llegan y qué hacen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Periodo"
              size="md"
              value={period}
              onChange={changePeriod}
              options={PERIODS.map((p) => ({ value: p, label: `${p} días` }))}
            />
            <label className="inline-flex items-center gap-2 text-xs text-texto/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={auto}
                onChange={(e) => setAuto(e.target.checked)}
                className="w-4 h-4 accent-[var(--azul)] cursor-pointer"
              />
              Auto 60 s
            </label>
            <button
              type="button"
              onClick={() => load(period, true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-azul bg-white border border-azul/15 rounded-lg hover:bg-azul/5 disabled:opacity-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-albero"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? 'animate-spin motion-reduce:animate-none' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6" aria-busy={loading}>
        {/* Sesión caducada */}
        {unauthorized && (
          <div className="bg-white rounded-2xl p-8 border border-azul/10 shadow-sm text-center max-w-md mx-auto">
            <h2 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul">Sesión caducada</h2>
            <p className="text-sm text-texto/60 mt-2">Vuelve a entrar con tu clave de administrador.</p>
            <Link
              href="/admin"
              className="inline-flex mt-5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-azul to-azul-800 rounded-xl hover:shadow-lg hover:shadow-azul/20 transition-all"
            >
              Ir al login
            </Link>
          </div>
        )}

        {/* Error */}
        {!unauthorized && error && (
          <div role="alert" className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-sm flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => load(period, false)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Carga inicial */}
        {!unauthorized && loading && !data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-72" />
            <div className="grid lg:grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </>
        )}

        {/* Sin datos todavía */}
        {!unauthorized && isEmpty && (
          <div className="bg-white rounded-2xl p-8 border border-azul/10 shadow-sm max-w-2xl mx-auto">
            <h2 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul">Todavía no hay visitas registradas</h2>
            <p className="text-sm text-texto/65 mt-2 leading-relaxed">
              Los datos empiezan a acumularse con la primera visita a la web desde que se despliega el tracking.
              Si acabas de desplegar, comprueba que has ejecutado <code className="text-xs bg-marfil px-1.5 py-0.5 rounded">supabase/analytics-schema.sql</code> en
              el SQL Editor de Supabase. En localhost no se envía nada por defecto.
            </p>
          </div>
        )}

        {!unauthorized && data && !isEmpty && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <KpiTile label="Visitantes únicos" value={data.totals.visitors} prev={data.prev.visitors} hint="Personas distintas (hash diario)" />
              <KpiTile label="Páginas vistas" value={data.totals.pageviews} prev={data.prev.pageviews} />
              <KpiTile label="Sesiones" value={data.totals.entries} prev={data.prev.entries} hint="Primera página de cada visita" />
              <KpiTile label="Clics en instalar" value={data.totals.installs} prev={data.prev.installs} hint="Botón «Abrir la app e instalar» en /descargar" />
              <KpiTile label="Conversión" value={conversion.cur} prev={conversion.prev} format="pct" hint="Clics en instalar ÷ visitantes únicos" />
            </div>

            {/* Serie diaria */}
            <Card
              title="Visitantes por día"
              subtitle={`Personas distintas por día natural (${data.range.tz}). El día de hoy aparece atenuado porque aún no ha terminado.`}
            >
              <DailyChart points={data.by_day} />
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* De dónde vienen */}
              <Card title="De dónde vienen" subtitle="Dominio de origen de la primera página de cada visita">
                <RankList
                  rows={data.referrers.map((r) => ({
                    key: r.name,
                    label: r.name,
                    value: r.visitors,
                    secondary: r.entries !== undefined && r.entries !== r.visitors ? `${fmt(r.entries)} sesiones` : undefined,
                  }))}
                  empty="Sin entradas en el periodo."
                />
                {data.utm.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-azul/10">
                    <h3 className="text-xs font-semibold text-texto/60 uppercase tracking-wide mb-2">Campañas (utm)</h3>
                    <RankList
                      rows={data.utm.map((u) => ({
                        key: `${u.source}-${u.medium}-${u.campaign}`,
                        label: [u.source, u.medium, u.campaign].filter(Boolean).join(' · '),
                        value: u.visitors,
                      }))}
                      empty=""
                    />
                  </div>
                )}
              </Card>

              {/* A dónde llegan */}
              <Card title="A dónde llegan" subtitle="Página de entrada de cada visita">
                <RankList
                  rows={data.landing.map((l) => ({
                    key: l.path,
                    label: l.path,
                    value: l.visitors,
                    secondary: l.entries !== l.visitors ? `${fmt(l.entries)} sesiones` : undefined,
                  }))}
                  empty="Sin entradas en el periodo."
                />
              </Card>

              {/* Desde dónde */}
              <Card
                title="Desde dónde"
                subtitle="Geolocalización aproximada por IP (cabeceras de Vercel); no se guarda la IP"
                action={
                  <Segmented
                    label="Ver por"
                    value={geoTab}
                    onChange={setGeoTab}
                    options={[
                      { value: 'countries', label: 'Países' },
                      { value: 'cities', label: 'Ciudades' },
                    ]}
                  />
                }
              >
                <RankList rows={geoRows} empty={geoTab === 'cities' ? 'Sin ciudad conocida (en local Vercel no envía geo).' : 'Sin datos.'} />
              </Card>

              {/* Dispositivos */}
              <Card
                title="Con qué entran"
                subtitle="Tipo de dispositivo, sistema y navegador"
                action={
                  <Segmented
                    label="Ver por"
                    value={deviceTab}
                    onChange={setDeviceTab}
                    options={[
                      { value: 'devices', label: 'Tipo' },
                      { value: 'os', label: 'Sistema' },
                      { value: 'browsers', label: 'Navegador' },
                    ]}
                  />
                }
              >
                <RankList rows={deviceRows} empty="Sin datos." />
              </Card>

              {/* Qué hacen */}
              <Card title="Qué hacen" subtitle="Clics y acciones registradas (cuántas veces · cuántas personas)">
                <RankList
                  rows={data.events.map((e) => ({
                    key: e.name,
                    label: eventLabel(e.name),
                    sub: EVENT_LABEL[e.name] ? e.name : undefined,
                    value: e.count,
                    secondary: `${fmt(e.visitors)} pers.`,
                  }))}
                  unit="veces"
                  empty="Ningún clic registrado todavía."
                />
              </Card>

              {/* Web → app */}
              <Card
                title="Web → app"
                subtitle="Cuentas creadas en la app en el periodo y cuántas llegaron desde la web (origen guardado al registrarse)"
              >
                {data.signups ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <KpiTile label="Cuentas creadas" value={data.signups.total} prev={data.signups.prev_total} hint="Altas en la app (auth.users)" />
                      <KpiTile label="Con origen web" value={data.signups.from_web} prev={data.signups.prev_from_web} hint="Perfiles con signup_attribution.src = web" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <h3 className="text-xs font-semibold text-texto/60 uppercase tracking-wide mb-2">Por fuente</h3>
                        <RankList
                          rows={data.signups.by_source.map((s) => ({ key: s.name, label: s.name, value: s.signups }))}
                          unit="cuentas"
                          empty="Ninguna cuenta con origen web todavía."
                        />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-texto/60 uppercase tracking-wide mb-2">Por botón</h3>
                        <RankList
                          rows={data.signups.by_where.map((s) => ({ key: s.name, label: s.name, value: s.signups }))}
                          unit="cuentas"
                          empty="Sin datos."
                        />
                        {data.signups.by_landing.length > 0 && (
                          <>
                            <h3 className="text-xs font-semibold text-texto/60 uppercase tracking-wide mt-4 mb-2">Por página de entrada</h3>
                            <RankList
                              rows={data.signups.by_landing.map((s) => ({ key: s.name, label: s.name, value: s.signups }))}
                              unit="cuentas"
                              empty=""
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-texto/45 mt-4">
                      Compara «Con origen web» con «Clics en instalar» para ver cuántos de los que pulsan acaban creando cuenta.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-texto/45 py-6 text-center">
                    Esta sección aparece cuando la RPC site_analytics incluye «signups» (vuelve a ejecutar supabase/analytics-schema.sql).
                  </p>
                )}
              </Card>

              {/* Páginas vistas */}
              <Card title="Páginas más vistas" subtitle="Vistas totales · personas distintas">
                <RankList
                  rows={data.pages.map((p) => ({
                    key: p.path,
                    label: p.path,
                    value: p.pageviews,
                    secondary: `${fmt(p.visitors)} pers.`,
                  }))}
                  unit="vistas"
                  empty="Sin páginas vistas."
                />
              </Card>
            </div>

            {/* Últimos movimientos */}
            <Card
              title="Últimos movimientos"
              subtitle="Los 40 eventos más recientes, en tiempo real si activas «Auto 60 s»"
              action={
                updatedAt && (
                  <span className="text-xs text-texto/45 whitespace-nowrap">
                    Actualizado {updatedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )
              }
            >
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="text-xs text-texto/55 border-b border-azul/10">
                      <th className="text-left font-medium py-2 pr-3">Cuándo</th>
                      <th className="text-left font-medium py-2 pr-3">Visitante</th>
                      <th className="text-left font-medium py-2 pr-3">Dónde</th>
                      <th className="text-left font-medium py-2 pr-3">Dispositivo</th>
                      <th className="text-left font-medium py-2 pr-3">Acción</th>
                      <th className="text-left font-medium py-2">Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((e) => {
                      const where = e.props && typeof e.props.where === 'string' ? e.props.where : null;
                      const platform = e.props && typeof e.props.platform === 'string' ? e.props.platform : null;
                      return (
                        <tr key={e.id} className="border-b border-azul/5 last:border-0 align-top">
                          <td className="py-2 pr-3 whitespace-nowrap text-texto/70">
                            <time dateTime={e.created_at} title={fullDate(e.created_at)}>
                              {timeAgo(e.created_at)}
                            </time>
                          </td>
                          <td className="py-2 pr-3 whitespace-nowrap">
                            <code className="text-xs text-texto/70 bg-marfil px-1.5 py-0.5 rounded" title={`Identificador anónimo del día: ${e.visitor_hash}`}>
                              {e.visitor_hash.slice(0, 6)}
                            </code>
                          </td>
                          <td className="py-2 pr-3 text-texto/80">
                            {e.city ? `${e.city}, ` : ''}
                            {countryName(e.country)}
                          </td>
                          <td className="py-2 pr-3 text-texto/70 whitespace-nowrap">
                            {DEVICE_LABEL[e.device || 'otro'] || e.device} · {e.os} · {e.browser}
                          </td>
                          <td className="py-2 pr-3">
                            {e.kind === 'pageview' ? (
                              <span className="inline-flex items-center gap-1.5 flex-wrap">
                                <span className="text-texto">{e.path}</span>
                                {e.is_entry && (
                                  <span className="text-[10px] uppercase tracking-wide font-semibold text-azul bg-azul/10 rounded px-1.5 py-0.5">
                                    entrada
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] uppercase tracking-wide font-semibold text-[#6b4f0a] bg-albero/25 rounded px-1.5 py-0.5">
                                  {eventLabel(e.name)}
                                </span>
                                {(where || platform) && <span className="text-xs text-texto/55">{where || platform}</span>}
                                <span className="text-xs text-texto/45">en {e.path}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 text-texto/70">
                            {e.utm_source ? `utm: ${e.utm_source}` : e.referrer_host || (e.is_entry ? 'directo' : '')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <p className="text-xs text-texto/50 leading-relaxed max-w-3xl">
              <strong className="font-medium text-texto/70">Sobre el «quién»:</strong> los visitantes de la web son anónimos. El identificador es un hash
              de IP y navegador con una sal que cambia cada día, así que no se puede seguir a una persona de un día a otro ni
              cruzarla con los usuarios registrados de la app (esos viven en Supabase Auth y se ven en «Correos»). No se usan
              cookies ni se guarda la IP.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
