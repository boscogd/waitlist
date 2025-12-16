'use client';

import { useState, useEffect } from 'react';

// Types
interface EmailDraft {
  id: string;
  email_type: string;
  sequence_step: number | null;
  subject: string;
  preview_text: string | null;
  html_content: string;
  source: string;
  ai_prompt: string | null;
  status: string;
  scheduled_for: string | null;
  target_audience: Record<string, unknown>;
  recipients_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  sent_at: string | null;
}

interface DripStats {
  totalUsers: number;
  byStep: Record<number, number>;
  sequenceConfig: Array<{
    step: number;
    days_after_previous: number;
    template_key: string;
    is_active: boolean;
  }>;
}

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  description: string | null;
  email_type: string;
  sequence_step: number | null;
  subject: string;
  preview_text: string | null;
  html_content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type Tab = 'drafts' | 'templates' | 'generate' | 'stats';
type StatusFilter = 'all' | 'draft' | 'approved' | 'sent' | 'cancelled';

export default function EmailsAdmin() {
  // Auth state
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Data state
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<DripStats | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('drafts');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Modal state
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Generate state
  const [generateType, setGenerateType] = useState('broadcast');
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  // Test & Schedule state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // API helpers
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  };

  // Load drafts
  const loadDrafts = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all'
        ? '/api/admin/emails'
        : `/api/admin/emails?status=${statusFilter}`;
      const response = await fetchWithAuth(url);

      if (response.status === 401) {
        setAuthenticated(false);
        setError('Sesión expirada');
        return;
      }

      if (!response.ok) throw new Error('Error cargando borradores');

      const data = await response.json();
      setDrafts(data.data || []);
    } catch (err) {
      setError('Error cargando borradores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const response = await fetchWithAuth('/api/drip-campaign');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  // Load templates
  const loadTemplates = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      }
    } catch (err) {
      console.error('Error cargando plantillas:', err);
    }
  };

  // Auth handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/emails', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (response.status === 401) {
        setError('Clave de acceso incorrecta');
        return;
      }

      setAuthenticated(true);
      localStorage.setItem('admin_email_key', apiKey);
      await loadDrafts();
      await loadStats();
      await loadTemplates();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    const savedKey = localStorage.getItem('admin_email_key');
    if (savedKey) {
      setApiKey(savedKey);
      fetch('/api/admin/emails', {
        headers: { 'Authorization': `Bearer ${savedKey}` },
      }).then(response => {
        if (response.ok) {
          setAuthenticated(true);
          setApiKey(savedKey);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (authenticated) {
      loadDrafts();
      loadStats();
      loadTemplates();
    }
  }, [authenticated, statusFilter]);

  // Approve draft
  const handleApprove = async (draftId: string) => {
    if (!confirm('¿Aprobar este email para envío?')) return;

    try {
      const response = await fetchWithAuth(`/api/admin/emails/${draftId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'approved' }),
      });

      if (response.ok) {
        await loadDrafts();
        setSelectedDraft(null);
      } else {
        alert('Error aprobando email');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  // Send draft
  const handleSend = async (draftId: string) => {
    if (!confirm('¿Enviar este email a todos los destinatarios? Esta acción no se puede deshacer.')) return;

    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/admin/emails/${draftId}/send`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Emails enviados: ${data.results.sent}\nFallidos: ${data.results.failed}`);
        await loadDrafts();
        setSelectedDraft(null);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Delete draft
  const handleDelete = async (draftId: string) => {
    if (!confirm('¿Eliminar este borrador?')) return;

    try {
      const response = await fetchWithAuth(`/api/admin/emails/${draftId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadDrafts();
        setSelectedDraft(null);
      } else {
        alert('Error eliminando borrador');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  // Send test email
  const handleSendTest = async (draftId: string) => {
    if (!testEmail.trim()) {
      alert('Ingresa un email para la prueba');
      return;
    }

    setSendingTest(true);
    try {
      const response = await fetchWithAuth(`/api/admin/emails/${draftId}/test`, {
        method: 'POST',
        body: JSON.stringify({ test_email: testEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Email de prueba enviado a ${testEmail}`);
        setTestEmail('');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setSendingTest(false);
    }
  };

  // Schedule email
  const handleSchedule = async (draftId: string) => {
    if (!scheduledDate) {
      alert('Selecciona una fecha y hora para programar');
      return;
    }

    const scheduledTime = new Date(scheduledDate);
    if (scheduledTime <= new Date()) {
      alert('La fecha programada debe ser en el futuro');
      return;
    }

    setScheduling(true);
    try {
      const response = await fetchWithAuth(`/api/admin/emails/${draftId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'scheduled',
          scheduled_for: scheduledTime.toISOString(),
        }),
      });

      if (response.ok) {
        alert(`Email programado para ${scheduledTime.toLocaleString('es-ES')}`);
        setScheduledDate('');
        await loadDrafts();
        setSelectedDraft(null);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setScheduling(false);
    }
  };

  // Generate with AI
  const handleGenerate = async () => {
    if (!generatePrompt.trim()) {
      alert('Escribe un prompt para generar el email');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const response = await fetchWithAuth('/api/drip-campaign/generate', {
        method: 'POST',
        body: JSON.stringify({
          email_type: generateType,
          prompt: generatePrompt,
          save_draft: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Borrador generado exitosamente');
        setGeneratePrompt('');
        setActiveTab('drafts');
        await loadDrafts();
      } else {
        setError(data.error || 'Error generando email');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setGenerating(false);
    }
  };

  // Run drip campaign manually
  const handleRunDrip = async () => {
    if (!confirm('¿Ejecutar el drip campaign ahora? Esto enviará emails a usuarios que les corresponda según la secuencia.')) return;

    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/drip-campaign', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Drip campaign ejecutado:\n- Procesados: ${data.result.processed}\n- Enviados: ${data.result.sent}\n- Fallidos: ${data.result.failed}\n- Omitidos: ${data.result.skipped}`);
        await loadStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Format helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-texto/10', text: 'text-texto/70', label: 'Borrador' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aprobado' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Programado' },
      sending: { bg: 'bg-albero/20', text: 'text-albero', label: 'Enviando' },
      sent: { bg: 'bg-azul/10', text: 'text-azul', label: 'Enviado' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
    };
    const { bg, text, label } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {label}
      </span>
    );
  };

  const getSourceBadge = (source: string) => {
    const config: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      manual: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Manual', icon: '✏️' },
      ai_generated: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'IA', icon: '✨' },
      template: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Plantilla', icon: '📋' },
    };
    const { bg, text, label, icon } = config[source] || { bg: 'bg-gray-100', text: 'text-gray-600', label: source, icon: '📄' };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${bg} ${text} inline-flex items-center gap-1`}>
        <span className="text-[10px]">{icon}</span>
        {label}
      </span>
    );
  };

  const getEmailTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sequence: 'Secuencia',
      broadcast: 'Broadcast',
      gospel_reflection: 'Evangelio',
      pope_words: 'Papa Francisco',
      news: 'Noticias',
      launch: 'Lanzamiento',
    };
    return labels[type] || type;
  };

  // Auth form
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-marfil flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-azul/5 border border-azul/10">
            {/* Logo area */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-azul to-azul-800 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-azul/20">
                <span className="text-white text-2xl">✉️</span>
              </div>
              <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul">
                Panel de Emails
              </h2>
              <p className="text-texto/60 text-sm mt-2">
                Acceso administrativo a campañas de email
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
                  placeholder="ADMIN_SECRET_KEY"
                  required
                  className="w-full px-4 py-3 text-base text-texto bg-marfil/50 border border-azul/20 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-albero/50 focus:border-albero transition-all"
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-azul to-azul-800 rounded-xl flex items-center justify-center shadow-md shadow-azul/20">
                <span className="text-white text-lg">✉️</span>
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  Emails Admin
                </h1>
                <p className="text-xs text-texto/50">Refugio en la Palabra</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('admin_email_key');
                setAuthenticated(false);
                setApiKey('');
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
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-azul/10 p-1.5 inline-flex gap-1 shadow-sm">
          {[
            { key: 'drafts', label: 'Borradores', icon: '📝' },
            { key: 'templates', label: 'Plantillas', icon: '📋' },
            { key: 'generate', label: 'Generar con IA', icon: '✨' },
            { key: 'stats', label: 'Estadísticas', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2
                ${activeTab === tab.key
                  ? 'bg-gradient-to-r from-azul to-azul-800 text-white shadow-md shadow-azul/20'
                  : 'text-texto/60 hover:text-azul hover:bg-azul/5'
                }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drafts Tab */}
        {activeTab === 'drafts' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-azul/10 px-4 py-2">
                <svg className="w-4 h-4 text-texto/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="bg-transparent text-sm text-texto/70 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos los estados</option>
                  <option value="draft">Borradores</option>
                  <option value="approved">Aprobados</option>
                  <option value="sent">Enviados</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>

              <button
                onClick={loadDrafts}
                className="px-4 py-2 text-sm text-azul bg-azul/5 hover:bg-azul/10 rounded-xl transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>

            {/* Drafts List */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-azul/20 border-t-azul"></div>
                <p className="text-texto/50 text-sm mt-4">Cargando borradores...</p>
              </div>
            ) : drafts.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-azul/10 shadow-sm">
                <div className="w-20 h-20 bg-azul/5 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">📧</span>
                </div>
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul mb-2">
                  No hay borradores
                </h3>
                <p className="text-texto/60 mb-6">
                  Genera tu primer email con IA o crea uno manualmente
                </p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all inline-flex items-center gap-2"
                >
                  <span>✨</span>
                  Generar con IA
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => setSelectedDraft(draft)}
                    className="bg-white rounded-2xl p-6 border border-azul/10 hover:border-albero/30 hover:shadow-xl hover:shadow-azul/5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {getStatusBadge(draft.status)}
                          {getSourceBadge(draft.source)}
                          <span className="text-xs text-texto/40 bg-texto/5 px-2 py-1 rounded">
                            {getEmailTypeLabel(draft.email_type)}
                            {draft.sequence_step !== null && ` · Paso ${draft.sequence_step}`}
                          </span>
                        </div>
                        <h3 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul truncate group-hover:text-azul-800 transition-colors">
                          {draft.subject}
                        </h3>
                        {draft.preview_text && (
                          <p className="text-sm text-texto/50 truncate mt-1">{draft.preview_text}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-texto/40">{formatDate(draft.created_at)}</div>
                        {draft.status === 'sent' && (
                          <div className="mt-2 text-sm font-medium text-emerald-600 flex items-center justify-end gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {draft.sent_count} enviados
                          </div>
                        )}
                        <svg className="w-5 h-5 text-texto/30 group-hover:text-azul group-hover:translate-x-1 transition-all mt-2 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  Plantillas Pre-definidas
                </h2>
                <p className="text-sm text-texto/50 mt-1">
                  Plantillas de la secuencia de nurturing y broadcasts
                </p>
              </div>
              <button
                onClick={loadTemplates}
                className="px-4 py-2 text-sm text-azul bg-azul/5 hover:bg-azul/10 rounded-xl transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>

            {templates.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-azul/10 shadow-sm">
                <div className="w-20 h-20 bg-azul/5 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">📋</span>
                </div>
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul mb-2">
                  No hay plantillas
                </h3>
                <p className="text-texto/60 max-w-md mx-auto">
                  Las plantillas se crean ejecutando el schema SQL en Supabase. Revisa el archivo <code className="bg-azul/5 px-2 py-1 rounded text-xs">drip-campaign-schema.sql</code>
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className="bg-white rounded-2xl p-6 border border-azul/10 hover:border-albero/30 hover:shadow-xl hover:shadow-azul/5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            template.is_active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-texto/10 text-texto/50'
                          }`}>
                            {template.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                          <span className="text-xs text-texto/40 bg-texto/5 px-2 py-1 rounded">
                            {getEmailTypeLabel(template.email_type)}
                          </span>
                          {template.sequence_step !== null && (
                            <span className="text-xs text-azul/60 bg-azul/5 px-2 py-1 rounded font-medium">
                              Paso {template.sequence_step}
                            </span>
                          )}
                        </div>
                        <h3 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul truncate group-hover:text-azul-800 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-texto/60 mt-1 truncate">{template.subject}</p>
                        {template.description && (
                          <p className="text-xs text-texto/40 mt-2 line-clamp-1">{template.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <code className="text-xs text-texto/40 bg-texto/5 px-2 py-1 rounded font-mono">
                          {template.template_key}
                        </code>
                        <svg className="w-5 h-5 text-texto/30 group-hover:text-azul group-hover:translate-x-1 transition-all mt-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Template Detail Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-azul/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-azul/10 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedTemplate.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-texto/10 text-texto/50'
                    }`}>
                      {selectedTemplate.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                    <span className="text-xs text-texto/40 bg-texto/5 px-2 py-1 rounded">
                      {getEmailTypeLabel(selectedTemplate.email_type)}
                    </span>
                  </div>
                  <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                    {selectedTemplate.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="w-10 h-10 rounded-xl bg-texto/5 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-marfil/50 rounded-xl p-4">
                    <div className="text-xs font-medium text-texto/40 uppercase tracking-wider mb-1">Template Key</div>
                    <code className="text-sm font-mono text-azul">{selectedTemplate.template_key}</code>
                  </div>
                  {selectedTemplate.sequence_step !== null && (
                    <div className="bg-marfil/50 rounded-xl p-4">
                      <div className="text-xs font-medium text-texto/40 uppercase tracking-wider mb-1">Paso de Secuencia</div>
                      <div className="text-sm font-semibold text-azul">{selectedTemplate.sequence_step}</div>
                    </div>
                  )}
                </div>

                <div className="bg-marfil/50 rounded-xl p-4">
                  <div className="text-xs font-medium text-texto/40 uppercase tracking-wider mb-2">Asunto</div>
                  <div className="text-base font-medium text-azul">{selectedTemplate.subject}</div>
                </div>

                {selectedTemplate.preview_text && (
                  <div className="bg-marfil/50 rounded-xl p-4">
                    <div className="text-xs font-medium text-texto/40 uppercase tracking-wider mb-2">Vista previa</div>
                    <div className="text-sm text-texto/70">{selectedTemplate.preview_text}</div>
                  </div>
                )}

                {selectedTemplate.description && (
                  <div className="bg-marfil/50 rounded-xl p-4">
                    <div className="text-xs font-medium text-texto/40 uppercase tracking-wider mb-2">Descripción</div>
                    <div className="text-sm text-texto/70">{selectedTemplate.description}</div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-medium text-texto/40 uppercase tracking-wider">Contenido HTML</div>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm text-azul hover:text-azul-800 font-medium transition-colors"
                    >
                      {showPreview ? '← Ver código' : 'Ver preview →'}
                    </button>
                  </div>
                  <div className="border border-azul/10 rounded-xl overflow-hidden">
                    {showPreview ? (
                      <iframe
                        srcDoc={selectedTemplate.html_content}
                        className="w-full h-96 bg-white"
                        title="Template Preview"
                      />
                    ) : (
                      <pre className="p-4 text-xs overflow-auto bg-slate-900 text-slate-200 max-h-96 font-mono">
                        {selectedTemplate.html_content}
                      </pre>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-azul/10 flex items-center justify-end">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-5 py-2.5 text-sm text-texto/60 hover:text-texto hover:bg-texto/5 rounded-xl transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl p-8 border border-azul/10 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <span className="text-white text-2xl">✨</span>
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                    Generar Email con IA
                  </h2>
                  <p className="text-sm text-texto/50">
                    Usa Gemini para crear emails profesionales
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-texto/70 mb-3">
                    Tipo de Email
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'broadcast', label: 'Broadcast', icon: '📢', desc: 'Email masivo' },
                      { value: 'gospel_reflection', label: 'Evangelio', icon: '📖', desc: 'Reflexión diaria' },
                      { value: 'pope_words', label: 'Papa Francisco', icon: '🕊️', desc: 'Palabras del Santo Padre' },
                      { value: 'news', label: 'Noticias', icon: '📰', desc: 'Noticias de fe' },
                      { value: 'sequence', label: 'Secuencia', icon: '📬', desc: 'Nurturing' },
                      { value: 'launch', label: 'Lanzamiento', icon: '🚀', desc: 'Email de lanzamiento' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setGenerateType(type.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          generateType === type.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-azul/10 hover:border-azul/30 bg-white'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="text-sm font-medium text-azul">{type.label}</div>
                        <div className="text-xs text-texto/50">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-texto/70 mb-3">
                    Prompt para la IA
                  </label>
                  <textarea
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                    placeholder="Describe qué quieres que contenga el email. Por ejemplo: 'Escribe un email sobre la importancia de la oración en tiempos difíciles, incluyendo una cita de Santa Teresa de Ávila...'"
                    rows={6}
                    className="w-full px-4 py-3 text-base text-texto bg-marfil/50 border border-azul/20 rounded-xl resize-none
                             focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                  />
                  <p className="text-xs text-texto/40 mt-2">
                    Sé específico para obtener mejores resultados. Incluye temas, citas, tono deseado, etc.
                  </p>
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
                  onClick={handleGenerate}
                  disabled={generating || !generatePrompt.trim()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold
                           hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generando borrador...
                    </>
                  ) : (
                    <>
                      <span className="text-lg">✨</span>
                      Generar con IA
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-azul/10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-azul/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-texto/50">Total Usuarios</div>
                    <div className="text-3xl font-bold text-azul">{stats?.totalUsers || 0}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-azul/10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-albero/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-albero" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-texto/50">Pasos Configurados</div>
                    <div className="text-3xl font-bold text-azul">{stats?.sequenceConfig?.length || 0}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-azul to-azul-800 rounded-2xl p-6 text-white shadow-lg shadow-azul/20">
                <button
                  onClick={handleRunDrip}
                  disabled={loading}
                  className="w-full h-full flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Ejecutar Drip Ahora</span>
                </button>
              </div>
            </div>

            {/* Users by Step */}
            {stats?.byStep && Object.keys(stats.byStep).length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-azul/10 shadow-sm">
                <h3 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul mb-6">
                  Usuarios por Paso de Secuencia
                </h3>
                <div className="space-y-4">
                  {Object.entries(stats.byStep).sort(([a], [b]) => Number(a) - Number(b)).map(([step, count]) => (
                    <div key={step} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium text-texto/60">Paso {step}</div>
                      <div className="flex-1 bg-marfil rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-azul to-azul-800 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                          style={{ width: `${Math.max((count / stats.totalUsers) * 100, 5)}%` }}
                        >
                          {(count / stats.totalUsers) * 100 > 15 && (
                            <span className="text-xs text-white font-medium">{count}</span>
                          )}
                        </div>
                      </div>
                      {(count / stats.totalUsers) * 100 <= 15 && (
                        <div className="w-12 text-right text-sm font-medium text-azul">{count}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sequence Config */}
            {stats?.sequenceConfig && stats.sequenceConfig.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-azul/10 shadow-sm">
                <h3 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul mb-6">
                  Configuración de Secuencia
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-azul/10">
                        <th className="text-left py-3 px-4 font-medium text-texto/50">Paso</th>
                        <th className="text-left py-3 px-4 font-medium text-texto/50">Días después</th>
                        <th className="text-left py-3 px-4 font-medium text-texto/50">Plantilla</th>
                        <th className="text-left py-3 px-4 font-medium text-texto/50">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.sequenceConfig.map((config) => (
                        <tr key={config.step} className="border-b border-azul/5 hover:bg-marfil/30 transition-colors">
                          <td className="py-4 px-4">
                            <span className="w-8 h-8 bg-azul/10 rounded-lg inline-flex items-center justify-center font-semibold text-azul">
                              {config.step}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-texto/70">
                            {config.days_after_previous} días
                          </td>
                          <td className="py-4 px-4">
                            <code className="text-xs bg-texto/5 px-2 py-1 rounded font-mono text-texto/60">
                              {config.template_key}
                            </code>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              config.is_active
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-texto/10 text-texto/50'
                            }`}>
                              {config.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Draft Detail Modal */}
        {selectedDraft && (
          <div className="fixed inset-0 bg-azul/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-azul/10 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(selectedDraft.status)}
                    {getSourceBadge(selectedDraft.source)}
                  </div>
                  <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                    {selectedDraft.subject}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDraft(null)}
                  className="w-10 h-10 rounded-xl bg-texto/5 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedDraft.preview_text && (
                  <div className="bg-marfil/50 rounded-xl p-4">
                    <div className="text-xs font-medium text-texto/40 uppercase tracking-wider mb-2">Vista previa</div>
                    <div className="text-sm text-texto/70">{selectedDraft.preview_text}</div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-medium text-texto/40 uppercase tracking-wider">Contenido HTML</div>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm text-azul hover:text-azul-800 font-medium transition-colors"
                    >
                      {showPreview ? '← Ver código' : 'Ver preview →'}
                    </button>
                  </div>
                  <div className="border border-azul/10 rounded-xl overflow-hidden">
                    {showPreview ? (
                      <iframe
                        srcDoc={selectedDraft.html_content}
                        className="w-full h-96 bg-white"
                        title="Email Preview"
                      />
                    ) : (
                      <pre className="p-4 text-xs overflow-auto bg-slate-900 text-slate-200 max-h-96 font-mono">
                        {selectedDraft.html_content}
                      </pre>
                    )}
                  </div>
                </div>

                {selectedDraft.ai_prompt && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span>✨</span> Prompt IA
                    </div>
                    <div className="text-sm text-purple-800">{selectedDraft.ai_prompt}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-marfil/50 rounded-xl p-4">
                    <div className="text-xs font-medium text-texto/40 uppercase tracking-wider mb-1">Creado</div>
                    <div className="text-sm text-texto/70">{formatDate(selectedDraft.created_at)}</div>
                  </div>
                  {selectedDraft.sent_at && (
                    <div className="bg-marfil/50 rounded-xl p-4">
                      <div className="text-xs font-medium text-texto/40 uppercase tracking-wider mb-1">Enviado</div>
                      <div className="text-sm text-texto/70">{formatDate(selectedDraft.sent_at)}</div>
                    </div>
                  )}
                  {selectedDraft.status === 'sent' && (
                    <>
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                        <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">Enviados</div>
                        <div className="text-2xl font-bold text-emerald-700">{selectedDraft.sent_count}</div>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <div className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">Fallidos</div>
                        <div className="text-2xl font-bold text-red-700">{selectedDraft.failed_count}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Enviar prueba */}
                {selectedDraft.status !== 'sent' && selectedDraft.status !== 'sending' && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Enviar email de prueba
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="flex-1 px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <button
                        onClick={() => handleSendTest(selectedDraft.id)}
                        disabled={sendingTest || !testEmail.trim()}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {sendingTest ? (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                        Enviar prueba
                      </button>
                    </div>
                  </div>
                )}

                {/* Programar envio */}
                {(selectedDraft.status === 'draft' || selectedDraft.status === 'approved') && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Programar envio
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="flex-1 px-3 py-2 text-sm bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      />
                      <button
                        onClick={() => handleSchedule(selectedDraft.id)}
                        disabled={scheduling || !scheduledDate}
                        className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {scheduling ? (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        Programar
                      </button>
                    </div>
                    {selectedDraft.scheduled_for && (
                      <div className="mt-2 text-sm text-purple-700">
                        Programado para: {formatDate(selectedDraft.scheduled_for)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-azul/10 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(selectedDraft.id)}
                  disabled={selectedDraft.status === 'sent' || selectedDraft.status === 'sending'}
                  className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>

                <div className="flex items-center gap-3">
                  {selectedDraft.status === 'draft' && (
                    <button
                      onClick={() => handleApprove(selectedDraft.id)}
                      className="px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Aprobar
                    </button>
                  )}
                  {selectedDraft.status === 'approved' && (
                    <button
                      onClick={() => handleSend(selectedDraft.id)}
                      className="px-5 py-2.5 text-sm bg-gradient-to-r from-azul to-azul-800 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-azul/20 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Enviar Ahora
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
