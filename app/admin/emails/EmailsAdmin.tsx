'use client';

import { useState, useEffect, useCallback } from 'react';
import { PRESETS, blocksToEmailHtml } from '@/lib/email-blocks';
import BlockComposer from './BlockComposer';

// ---------------------------------------------------------------------------
// Tipos del contrato de API (consumidos por fetch, sin importar del backend).
// ---------------------------------------------------------------------------
interface Segment {
  id: 'all' | 'active' | 'dormant';
  label: string;
  count: number;
}

interface AudienceResponse {
  success: boolean;
  segments?: Segment[];
  error?: string;
}

interface BroadcastResult {
  success: boolean;
  testMode?: boolean;
  sent?: number;
  failed?: number;
  skipped?: number;
  error?: string;
}

interface Template {
  template_key: string;
  name: string;
  subject: string;
  preview_text: string | null;
  html_content: string;
  [key: string]: unknown;
}

interface TemplatesResponse {
  success: boolean;
  data?: Template[];
  error?: string;
}

interface TemplateSaveResponse {
  success: boolean;
  template?: Template;
  error?: string;
}

interface DayMetric {
  date: string;
  sent: number;
  failed: number;
}

interface MetricsResponse {
  success: boolean;
  totals?: { sent7d: number; failed7d: number };
  byDay?: DayMetric[];
  winback?: Record<string, number> | null;
  codeReminder?: Record<string, number> | null;
  error?: string;
}

type Tab = 'compose' | 'templates' | 'metrics';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// El backend puede devolver este error concreto cuando falta la service key.
function friendlyError(raw: string | undefined): string {
  if (!raw) return 'Ha ocurrido un error inesperado.';
  if (/SUPABASE_SERVICE_ROLE_KEY/i.test(raw) || /service.?role/i.test(raw)) {
    return 'Falta configurar la clave de servicio en Vercel (SUPABASE_SERVICE_ROLE_KEY).';
  }
  return raw;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Etiqueta legible para las claves de los embudos de campaña.
function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function EmailsAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('compose');

  useEffect(() => {
    // Al montar, comprobamos la sesión con la cookie httpOnly (same-origin).
    fetch('/api/admin/login')
      .then((r) => setAuthenticated(r.ok))
      .catch(() => setAuthenticated(false))
      .finally(() => setCheckingAuth(false));
  }, []);

  if (checkingAuth) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-azul" />
        <p className="mt-4 text-texto/70">Comprobando sesión…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-azul/10 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mb-3">
            Sesión requerida
          </h2>
          <p className="text-texto/70 text-sm mb-6">
            Necesitas iniciar sesión como administrador para acceder al centro de correos.
          </p>
          <a
            href="/admin"
            className="inline-block px-6 py-3 bg-azul text-white rounded-xl font-medium hover:bg-azul-800 transition-colors"
          >
            Iniciar sesión en /admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pestañas */}
      <div className="flex gap-2 border-b border-azul/10">
        <TabButton active={activeTab === 'compose'} onClick={() => setActiveTab('compose')}>
          Nuevo correo
        </TabButton>
        <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>
          Plantillas
        </TabButton>
        <TabButton active={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')}>
          Métricas
        </TabButton>
      </div>

      {activeTab === 'compose' && <ComposeTab />}
      {activeTab === 'templates' && <TemplatesTab />}
      {activeTab === 'metrics' && <MetricsTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-medium -mb-px border-b-2 transition-colors ${
        active
          ? 'border-albero text-azul'
          : 'border-transparent text-texto/60 hover:text-azul'
      }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Preview compartida (iframe con srcDoc). Sustituye {{name}} por un ejemplo.
// ---------------------------------------------------------------------------
function HtmlPreview({ html }: { html: string }) {
  const rendered = (html || '').replace(/\{\{\s*name\s*\}\}/g, 'María');
  return (
    <iframe
      title="Vista previa"
      srcDoc={rendered || '<p style="font-family:sans-serif;color:#888;padding:16px">La vista previa aparecerá aquí…</p>'}
      className="w-full h-[420px] rounded-xl border border-azul/10 bg-white"
      sandbox=""
    />
  );
}

// ===========================================================================
// PESTAÑA 1 — NUEVO CORREO
// ===========================================================================
function ComposeTab() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(true);
  const [segmentsError, setSegmentsError] = useState('');

  const [subject, setSubject] = useState('');
  // Arranca con el primer preset de bloques serializado a HTML de marca. El
  // BlockComposer parte de ese mismo preset y sincroniza `html` en cada cambio,
  // así que el estado inicial coincide con lo que ve el redactor.
  const [html, setHtml] = useState(() => blocksToEmailHtml(PRESETS[0].blocks));
  const [segment, setSegment] = useState<Segment['id']>('all');

  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [feedback, setFeedback] = useState<
    { kind: 'ok' | 'error'; message: string; result?: BroadcastResult } | null
  >(null);

  const loadSegments = useCallback(async () => {
    setLoadingSegments(true);
    setSegmentsError('');
    try {
      const res = await fetch('/api/admin/audience');
      if (res.status === 401) {
        setSegmentsError('Sesión expirada. Vuelve a iniciar sesión en /admin.');
        return;
      }
      const data: AudienceResponse = await res.json();
      if (!res.ok || !data.success || !data.segments) {
        throw new Error(data.error || 'No se pudieron cargar los grupos');
      }
      setSegments(data.segments);
    } catch (e) {
      setSegmentsError(e instanceof Error ? e.message : 'Error cargando los grupos');
    } finally {
      setLoadingSegments(false);
    }
  }, []);

  useEffect(() => {
    loadSegments();
  }, [loadSegments]);

  const selectedSegment = segments.find((s) => s.id === segment);
  const targetCount = selectedSegment?.count ?? 0;
  const canSend = subject.trim().length > 0 && html.trim().length > 0;

  const handleSendTest = async () => {
    setFeedback(null);
    if (!EMAIL_RE.test(testEmail)) {
      setFeedback({ kind: 'error', message: 'Introduce un email válido para la prueba.' });
      return;
    }
    if (!canSend) {
      setFeedback({ kind: 'error', message: 'Completa el asunto y el cuerpo antes de enviar.' });
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html, segment, testEmail }),
      });
      const data: BroadcastResult = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ kind: 'error', message: friendlyError(data.error) });
      } else {
        setFeedback({ kind: 'ok', message: `Correo de prueba enviado a ${testEmail}.` });
      }
    } catch {
      setFeedback({ kind: 'error', message: 'Error de conexión al enviar la prueba.' });
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendReal = async () => {
    setShowConfirm(false);
    setFeedback(null);
    setSending(true);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html, segment }),
      });
      const data: BroadcastResult = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ kind: 'error', message: friendlyError(data.error) });
      } else {
        setFeedback({
          kind: 'ok',
          message: `Envío completado: ${data.sent ?? 0} enviados, ${data.failed ?? 0} fallidos, ${data.skipped ?? 0} omitidos.`,
          result: data,
        });
      }
    } catch {
      setFeedback({ kind: 'error', message: 'Error de conexión al enviar el correo.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm ${
            feedback.kind === 'ok'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-azul mb-1">Asunto</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto del correo"
                className="w-full px-4 py-2.5 border border-azul/15 rounded-xl focus:outline-none focus:border-azul text-texto"
              />
            </div>

            <BlockComposer html={html} onHtmlChange={setHtml} />
          </div>

          {/* Selector de grupo */}
          <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-6">
            <h3 className="text-sm font-medium text-azul mb-3">Grupo de destinatarios</h3>
            {loadingSegments ? (
              <p className="text-texto/60 text-sm">Cargando grupos…</p>
            ) : segmentsError ? (
              <div className="text-sm">
                <p className="text-red-700 mb-2">{segmentsError}</p>
                <button onClick={loadSegments} className="text-azul underline">
                  Reintentar
                </button>
              </div>
            ) : segments.length === 0 ? (
              <p className="text-texto/60 text-sm">No hay grupos disponibles.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {segments.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSegment(s.id)}
                    className={`text-left p-4 rounded-xl border transition-colors ${
                      segment === s.id
                        ? 'border-albero bg-albero/10'
                        : 'border-azul/10 hover:border-azul/30'
                    }`}
                  >
                    <div className="text-sm font-medium text-azul">{s.label}</div>
                    <div className="text-2xl font-semibold text-texto mt-1">{s.count}</div>
                    <div className="text-xs text-texto/50">usuarios</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Envío de prueba */}
          <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-6">
            <h3 className="text-sm font-medium text-azul mb-3">Enviar prueba</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2.5 border border-azul/15 rounded-xl focus:outline-none focus:border-azul text-texto"
              />
              <button
                onClick={handleSendTest}
                disabled={sendingTest || sending}
                className="px-5 py-2.5 border border-azul/20 text-azul rounded-xl text-sm font-medium hover:bg-azul/5 disabled:opacity-50"
              >
                {sendingTest ? 'Enviando…' : 'Enviar prueba'}
              </button>
            </div>
          </div>

          {/* Envío real */}
          <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-6">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!canSend || sending || sendingTest || loadingSegments}
              className="w-full px-6 py-3 bg-azul text-white rounded-xl font-medium hover:bg-azul-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Enviando…' : `Enviar a ${targetCount} usuarios`}
            </button>
            {!canSend && (
              <p className="text-xs text-texto/50 mt-2 text-center">
                Completa el asunto y el cuerpo para habilitar el envío.
              </p>
            )}
          </div>
        </div>

        {/* Vista previa */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-6">
            <h3 className="text-sm font-medium text-azul mb-3">Cómo llegará al inbox</h3>
            <HtmlPreview html={html} />
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul mb-2">
              Confirmar envío
            </h3>
            <p className="text-texto/70 text-sm mb-4">
              Vas a enviar este correo al grupo{' '}
              <span className="font-medium text-azul">{selectedSegment?.label ?? segment}</span>, que
              incluye <span className="font-semibold text-azul">{targetCount}</span> usuarios. Esta
              acción no se puede deshacer.
            </p>
            <div className="bg-marfil rounded-xl p-3 mb-5 text-sm">
              <span className="text-texto/50">Asunto: </span>
              <span className="text-texto font-medium">{subject}</span>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 border border-azul/20 text-azul rounded-xl text-sm font-medium hover:bg-azul/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendReal}
                className="px-5 py-2.5 bg-azul text-white rounded-xl text-sm font-medium hover:bg-azul-800"
              >
                Sí, enviar a {targetCount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// PESTAÑA 2 — PLANTILLAS
// ===========================================================================
function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<
    { kind: 'ok' | 'error'; message: string } | null
  >(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/templates');
      if (res.status === 401) {
        setError('Sesión expirada. Vuelve a iniciar sesión en /admin.');
        return;
      }
      const data: TemplatesResponse = await res.json();
      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || 'No se pudieron cargar las plantillas');
      }
      // Solo plantillas de campañas automáticas.
      const campaign = data.data.filter(
        (t) =>
          t.template_key.startsWith('winback_') ||
          t.template_key.startsWith('code_reminder_'),
      );
      setTemplates(campaign);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando las plantillas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const selectTemplate = (t: Template) => {
    setSelectedKey(t.template_key);
    setSubject(t.subject);
    setPreviewText(t.preview_text ?? '');
    setHtmlContent(t.html_content);
    setSaveFeedback(null);
  };

  const handleSave = async () => {
    if (!selectedKey) return;
    setSaving(true);
    setSaveFeedback(null);
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_key: selectedKey,
          subject,
          preview_text: previewText,
          html_content: htmlContent,
        }),
      });
      const data: TemplateSaveResponse = await res.json();
      if (!res.ok || !data.success) {
        setSaveFeedback({ kind: 'error', message: friendlyError(data.error) });
      } else {
        setSaveFeedback({ kind: 'ok', message: 'Plantilla guardada correctamente.' });
        // Refrescamos la lista para que refleje los nuevos valores.
        setTemplates((prev) =>
          prev.map((t) =>
            t.template_key === selectedKey
              ? { ...t, subject, preview_text: previewText, html_content: htmlContent }
              : t,
          ),
        );
      }
    } catch {
      setSaveFeedback({ kind: 'error', message: 'Error de conexión al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-azul" />
        <p className="mt-4 text-texto/60">Cargando plantillas…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
        <p className="mb-2">{error}</p>
        <button onClick={loadTemplates} className="underline">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-albero/10 border border-albero/30 rounded-xl p-4 text-sm text-texto/80">
        Estos textos son los que envían las campañas automáticas (win-back y recordatorio de código).
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">📄</div>
          <p className="text-texto/70">No hay plantillas de campaña disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista */}
          <div className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.template_key}
                onClick={() => selectTemplate(t)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selectedKey === t.template_key
                    ? 'border-albero bg-albero/10'
                    : 'border-azul/10 bg-white hover:border-azul/30'
                }`}
              >
                <div className="text-sm font-medium text-azul">{t.name}</div>
                <div className="text-xs text-texto/50 font-mono mt-1">{t.template_key}</div>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {!selectedKey ? (
              <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-12 text-center text-texto/60">
                Selecciona una plantilla para editarla.
              </div>
            ) : (
              <div className="space-y-6">
                {saveFeedback && (
                  <div
                    className={`p-3 rounded-xl border text-sm ${
                      saveFeedback.kind === 'ok'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    {saveFeedback.message}
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-azul mb-1">Asunto</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 border border-azul/15 rounded-xl focus:outline-none focus:border-azul text-texto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-azul mb-1">
                      Texto de vista previa (preview)
                    </label>
                    <input
                      type="text"
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      className="w-full px-4 py-2.5 border border-azul/15 rounded-xl focus:outline-none focus:border-azul text-texto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-azul mb-1">Cuerpo (HTML)</label>
                    <textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      rows={14}
                      className="w-full px-4 py-3 border border-azul/15 rounded-xl focus:outline-none focus:border-azul font-mono text-sm text-texto resize-y"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-azul text-white rounded-xl font-medium hover:bg-azul-800 disabled:opacity-50"
                  >
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-6">
                  <h3 className="text-sm font-medium text-azul mb-3">Vista previa</h3>
                  <HtmlPreview html={htmlContent} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// PESTAÑA 3 — MÉTRICAS
// ===========================================================================
function MetricsTab() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.status === 401) {
        setError('Sesión expirada. Vuelve a iniciar sesión en /admin.');
        return;
      }
      const data: MetricsResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudieron cargar las métricas');
      }
      setMetrics(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando las métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-azul" />
        <p className="mt-4 text-texto/60">Cargando métricas…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
        <p className="mb-2">{error}</p>
        <button onClick={loadMetrics} className="underline">
          Reintentar
        </button>
      </div>
    );
  }

  const totals = metrics?.totals ?? { sent7d: 0, failed7d: 0 };
  const byDay = metrics?.byDay ?? [];
  const maxDay = Math.max(1, ...byDay.map((d) => d.sent + d.failed));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={loadMetrics}
          className="px-4 py-2 text-sm text-azul border border-azul/20 rounded-lg hover:bg-azul/5"
        >
          Refrescar
        </button>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-6">
          <div className="text-xs text-texto/60 uppercase tracking-wider mb-2">
            Enviados (7 días)
          </div>
          <div className="text-4xl font-semibold text-azul">{totals.sent7d}</div>
        </div>
        <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-6">
          <div className="text-xs text-texto/60 uppercase tracking-wider mb-2">
            Fallidos (7 días)
          </div>
          <div className="text-4xl font-semibold text-red-600">{totals.failed7d}</div>
        </div>
      </div>

      {/* Por día */}
      <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-6">
        <h3 className="text-sm font-medium text-azul mb-4">Actividad por día</h3>
        {byDay.length === 0 ? (
          <p className="text-texto/60 text-sm">Sin datos de envíos en el periodo.</p>
        ) : (
          <div className="space-y-2">
            {byDay.map((d) => (
              <div key={d.date} className="flex items-center gap-3 text-sm">
                <div className="w-24 shrink-0 text-texto/60 font-mono text-xs">{d.date}</div>
                <div className="flex-1 h-6 bg-marfil rounded-lg overflow-hidden flex">
                  <div
                    className="bg-azul h-full"
                    style={{ width: `${(d.sent / maxDay) * 100}%` }}
                    title={`${d.sent} enviados`}
                  />
                  <div
                    className="bg-red-400 h-full"
                    style={{ width: `${(d.failed / maxDay) * 100}%` }}
                    title={`${d.failed} fallidos`}
                  />
                </div>
                <div className="w-28 shrink-0 text-right text-texto/70">
                  <span className="text-azul font-medium">{d.sent}</span>
                  {' · '}
                  <span className="text-red-600">{d.failed}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Embudos de campañas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelCard title="Win-back" data={metrics?.winback} />
        <FunnelCard title="Recordatorio de código" data={metrics?.codeReminder} />
      </div>
    </div>
  );
}

function FunnelCard({
  title,
  data,
}: {
  title: string;
  data: Record<string, number> | null | undefined;
}) {
  const entries = data ? Object.entries(data) : [];
  return (
    <div className="bg-white rounded-2xl border border-azul/10 shadow-sm p-6">
      <h3 className="text-sm font-medium text-azul mb-4">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-texto/60 text-sm">Sin datos disponibles.</p>
      ) : (
        <dl className="grid grid-cols-2 gap-3">
          {entries.map(([key, value]) => (
            <div key={key} className="bg-marfil rounded-xl p-3">
              <dt className="text-xs text-texto/60">{humanizeKey(key)}</dt>
              <dd className="text-2xl font-semibold text-azul mt-1">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
