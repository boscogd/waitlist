'use client';

import { useState, useEffect } from 'react';

interface ReminderStats {
  pendingReminder: number;
  alreadyUsedCode: number;
  unsubscribed: number;
}

interface PendingUser {
  email: string;
  name: string;
  code: string;
  registeredAt: string;
}

export default function RemindersAdmin() {
  // Auth state
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Data state
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [showUsersList, setShowUsersList] = useState(false);

  // Template state
  const [subject, setSubject] = useState('¡Tu mes gratis de Premium te está esperando!');
  const [htmlContent, setHtmlContent] = useState('');
  const [editMode, setEditMode] = useState<'visual' | 'code'>('visual');
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Send state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendResults, setSendResults] = useState<{
    total: number;
    success: number;
    failed: number;
  } | null>(null);

  // Default template - uses {{name}} and {{code}} as placeholders
  const defaultTemplate = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu mes gratis te está esperando</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FAF7F0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-family: 'Lora', Georgia, serif; color: #1F3A5F; font-size: 32px; margin: 0;">
          Refugio en la Palabra
        </h1>
      </div>

      <!-- Content -->
      <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #1F3A5F; font-size: 24px; margin-top: 0;">
          Hola, {{name}}
        </h2>

        <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
          Queríamos recordarte que tienes disponible un <strong>mes gratis de Premium</strong> en Refugio en la Palabra que aún no has activado.
        </p>

        <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
          Por ser de los primeros en confiar en nosotros, este regalo te da acceso completo a todas las funciones:
        </p>

        <ul style="color: #1F2937; font-size: 16px; line-height: 1.8; padding-left: 20px;">
          <li><strong>Rosario guiado</strong> con audio y meditaciones</li>
          <li><strong>Evangelio del día</strong> con reflexiones diarias</li>
          <li><strong>Compañero de fe</strong> para resolver tus dudas sobre doctrina</li>
          <li><strong>Experiencia sin anuncios</strong></li>
        </ul>

        <!-- Code Box -->
        <div style="background: linear-gradient(135deg, #E1B955 0%, #D4A84B 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
          <p style="color: white; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
            Tu código personal
          </p>
          <p style="color: white; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 3px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            {{code}}
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://refugio-en-la-palabra.netlify.app/bienvenida?code={{code}}"
             style="display: inline-block; background-color: #1F3A5F; color: white; padding: 18px 40px; text-decoration: none; border-radius: 10px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(31,58,95,0.3);">
            Activar mi mes gratis
          </a>
        </div>

        <p style="color: #6B7280; font-size: 14px; line-height: 1.6; text-align: center;">
          Solo tienes que introducir el código cuando te registres o lo puedes aplicar desde tu perfil.
        </p>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

        <p style="color: #1F2937; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
          ¿Tienes alguna duda? Responde a este email y te ayudamos.<br><br>
          Un abrazo,<br>
          <strong>Aida y Bosco</strong><br>
          <span style="color: #6B7280; font-size: 14px;">Creadores de Refugio en la Palabra</span>
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; color: #6B7280; font-size: 12px;">
        <p style="margin: 5px 0;">
          © 2025 Refugio en la Palabra. Todos los derechos reservados.
        </p>
        <p style="margin: 5px 0;">
          <a href="https://refugioenlapalabra.com/unsubscribe" style="color: #6B7280;">
            Darse de baja
          </a>
        </p>
      </div>
    </div>
  </body>
</html>`;

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

  // Load stats
  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/remind-code');

      if (response.status === 401) {
        setAuthenticated(false);
        setError('Sesión expirada');
        return;
      }

      if (!response.ok) throw new Error('Error cargando estadísticas');

      const data = await response.json();
      setStats(data.summary);
      setPendingUsers(data.pendingUsers || []);
    } catch (err) {
      setError('Error cargando estadísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auth handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/remind-code', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (response.status === 401) {
        setError('Clave de acceso incorrecta');
        setLoading(false);
        return;
      }

      setAuthenticated(true);
      localStorage.setItem('admin_reminder_key', apiKey);

      // Initialize template
      setHtmlContent(defaultTemplate);

      await loadStats();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    const savedKey = localStorage.getItem('admin_reminder_key');
    if (savedKey) {
      setApiKey(savedKey);
      fetch('/api/remind-code', {
        headers: { 'Authorization': `Bearer ${savedKey}` },
      }).then(response => {
        if (response.ok) {
          setAuthenticated(true);
          setApiKey(savedKey);
          setHtmlContent(defaultTemplate);
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
      loadStats();
    }
  }, [authenticated]);

  // Sync iframe content to state
  const syncIframeContent = () => {
    if (iframeRef && iframeRef.contentDocument) {
      const newHtml = iframeRef.contentDocument.documentElement.outerHTML;
      setHtmlContent('<!DOCTYPE html>' + newHtml);
    }
  };

  // Setup editable iframe
  const setupEditableIframe = (iframe: HTMLIFrameElement | null) => {
    if (iframe && iframe.contentDocument) {
      setIframeRef(iframe);
      const doc = iframe.contentDocument;
      doc.designMode = 'on';

      doc.body.addEventListener('blur', syncIframeContent, true);
      doc.body.addEventListener('input', () => {
        if (iframeRef && iframeRef.contentDocument) {
          const newHtml = iframeRef.contentDocument.documentElement.outerHTML;
          setHtmlContent('<!DOCTYPE html>' + newHtml);
        }
      });
    }
  };

  // Send test email
  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      alert('Ingresa un email para la prueba');
      return;
    }

    setSendingTest(true);
    try {
      const response = await fetchWithAuth('/api/remind-code', {
        method: 'POST',
        body: JSON.stringify({
          testMode: true,
          testEmail: testEmail,
          customSubject: subject,
          customHtml: htmlContent,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
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

  // Send to all
  const handleSendAll = async () => {
    if (!stats || stats.pendingReminder === 0) {
      alert('No hay usuarios pendientes de recordatorio');
      return;
    }

    if (!confirm(`¿Enviar recordatorio a ${stats.pendingReminder} usuarios?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    setSendingAll(true);
    setSendResults(null);

    try {
      const response = await fetchWithAuth('/api/remind-code', {
        method: 'POST',
        body: JSON.stringify({
          customSubject: subject,
          customHtml: htmlContent,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSendResults(data.results);
        alert(`Recordatorios enviados:\n- Total: ${data.results.total}\n- Exitosos: ${data.results.success}\n- Fallidos: ${data.results.failed}`);
        await loadStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setSendingAll(false);
    }
  };

  // Reset template
  const handleResetTemplate = () => {
    if (confirm('¿Restaurar la plantilla al contenido original?')) {
      setHtmlContent(defaultTemplate);
      setSubject('¡Tu mes gratis de Premium te está esperando!');
    }
  };

  // Auth form
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-marfil flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-azul/5 border border-azul/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-white text-2xl">🔔</span>
              </div>
              <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul">
                Recordatorios de Código
              </h2>
              <p className="text-texto/60 text-sm mt-2">
                Envía recordatorios a usuarios de la waitlist
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
                           focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
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
                className="w-full px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl
                         hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
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
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20">
                <span className="text-white text-lg">🔔</span>
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  Recordatorios de Código
                </h1>
                <p className="text-xs text-texto/50">Refugio en la Palabra</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('admin_reminder_key');
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-azul/10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-texto/50">Pendientes de recordatorio</div>
                <div className="text-3xl font-bold text-amber-600">{stats?.pendingReminder || 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-azul/10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-texto/50">Ya usaron su código</div>
                <div className="text-3xl font-bold text-emerald-600">{stats?.alreadyUsedCode || 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-azul/10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-texto/50">Dados de baja</div>
                <div className="text-3xl font-bold text-red-600">{stats?.unsubscribed || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Users list toggle */}
        {pendingUsers.length > 0 && (
          <div className="bg-white rounded-2xl border border-azul/10 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowUsersList(!showUsersList)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-marfil/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-texto/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium text-azul">Ver lista de usuarios ({pendingUsers.length})</span>
              </div>
              <svg className={`w-5 h-5 text-texto/40 transition-transform ${showUsersList ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUsersList && (
              <div className="border-t border-azul/10 max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-marfil/50 sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-texto/50">Nombre</th>
                      <th className="text-left py-3 px-4 font-medium text-texto/50">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-texto/50">Código</th>
                      <th className="text-left py-3 px-4 font-medium text-texto/50">Registrado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user, index) => (
                      <tr key={index} className="border-t border-azul/5 hover:bg-marfil/20">
                        <td className="py-3 px-4 text-texto/80">{user.name}</td>
                        <td className="py-3 px-4 text-texto/60 font-mono text-xs">{user.email}</td>
                        <td className="py-3 px-4">
                          <code className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-mono">
                            {user.code}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-texto/50 text-xs">
                          {new Date(user.registeredAt).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Email Template Editor */}
        <div className="bg-white rounded-2xl border border-azul/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-azul/10 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul">
                Plantilla del Email
              </h2>
              <p className="text-xs text-texto/50 mt-1">
                Edita el contenido visualmente o en código. Los campos {'{'}{'{'} name {'}'}{'}' } y {'{'}{'{'} code {'}'}{'}' } se reemplazarán automáticamente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetTemplate}
                className="px-3 py-2 text-sm text-texto/60 hover:text-texto hover:bg-texto/5 rounded-lg transition-colors"
              >
                Restaurar original
              </button>
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 text-sm text-texto/60 hover:text-texto hover:bg-texto/5 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      syncIframeContent();
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2
                             bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2
                           bg-azul/5 text-azul hover:bg-azul/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="px-6 py-4 border-b border-azul/10 bg-marfil/30">
            <label className="block text-xs font-medium text-texto/40 uppercase tracking-wider mb-2">
              Asunto del email
            </label>
            {isEditing ? (
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 text-base font-medium text-azul bg-white border border-azul/20 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            ) : (
              <div className="text-base font-medium text-azul">{subject}</div>
            )}
          </div>

          {/* Content Editor */}
          <div className="p-6">
            {isEditing && (
              <div className="flex items-center gap-1 bg-texto/5 rounded-lg p-1 mb-4 w-fit">
                <button
                  onClick={() => {
                    syncIframeContent();
                    setEditMode('visual');
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    editMode === 'visual'
                      ? 'bg-white text-azul shadow-sm'
                      : 'text-texto/60 hover:text-texto'
                  }`}
                >
                  Visual
                </button>
                <button
                  onClick={() => setEditMode('code')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    editMode === 'code'
                      ? 'bg-white text-azul shadow-sm'
                      : 'text-texto/60 hover:text-texto'
                  }`}
                >
                  Código HTML
                </button>
              </div>
            )}

            <div className="border border-azul/10 rounded-xl overflow-hidden">
              {isEditing ? (
                editMode === 'visual' ? (
                  <div>
                    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span className="text-sm text-amber-700 font-medium">
                        Haz clic en el texto para editarlo directamente
                      </span>
                    </div>
                    <iframe
                      ref={setupEditableIframe}
                      srcDoc={htmlContent}
                      className="w-full h-[600px] bg-white"
                      title="Email Editor"
                      onLoad={(e) => {
                        const iframe = e.target as HTMLIFrameElement;
                        if (iframe.contentDocument) {
                          iframe.contentDocument.designMode = 'on';
                          setIframeRef(iframe);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span className="text-sm text-slate-400 font-medium">
                        Edición de código HTML (avanzado)
                      </span>
                    </div>
                    <textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      className="w-full h-[600px] p-4 text-xs font-mono bg-slate-900 text-slate-200 resize-none focus:outline-none"
                      placeholder="Contenido HTML del email..."
                    />
                  </div>
                )
              ) : (
                <iframe
                  srcDoc={htmlContent}
                  className="w-full h-[600px] bg-white"
                  title="Email Preview"
                />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Email */}
          <div className="bg-white rounded-2xl p-6 border border-azul/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-azul">Enviar prueba</h3>
                <p className="text-xs text-texto/50">Recibe el email en tu bandeja</p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 text-sm bg-marfil/50 border border-azul/20 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              <button
                onClick={handleSendTest}
                disabled={sendingTest || !testEmail.trim()}
                className="w-full px-4 py-3 text-sm bg-blue-600 text-white rounded-xl font-medium
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                         flex items-center justify-center gap-2"
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
                Enviar email de prueba
              </button>
            </div>
          </div>

          {/* Send to All */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Enviar a todos</h3>
                <p className="text-xs text-white/80">
                  {stats?.pendingReminder || 0} usuarios recibirán el recordatorio
                </p>
              </div>
            </div>

            <button
              onClick={handleSendAll}
              disabled={sendingAll || !stats || stats.pendingReminder === 0}
              className="w-full px-4 py-4 text-base bg-white text-amber-600 rounded-xl font-semibold
                       hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                       flex items-center justify-center gap-2"
            >
              {sendingAll ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando... (puede tardar unos minutos)
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar recordatorio a {stats?.pendingReminder || 0} usuarios
                </>
              )}
            </button>

            {sendResults && (
              <div className="mt-4 p-3 bg-white/20 rounded-xl text-sm">
                <div className="flex justify-between mb-1">
                  <span>Total:</span>
                  <span className="font-semibold">{sendResults.total}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Exitosos:</span>
                  <span className="font-semibold text-emerald-200">{sendResults.success}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fallidos:</span>
                  <span className="font-semibold text-red-200">{sendResults.failed}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Refresh button */}
        <div className="flex justify-center">
          <button
            onClick={loadStats}
            disabled={loading}
            className="px-6 py-3 text-sm text-azul bg-azul/5 hover:bg-azul/10 rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar estadísticas
          </button>
        </div>
      </main>
    </div>
  );
}
