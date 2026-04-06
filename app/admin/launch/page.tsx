'use client';

import { useState, useEffect } from 'react';

export default function LaunchPage() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'sending' | 'done' | 'error'>('idle');
  const [testEmail, setTestEmail] = useState('');
  const [result, setResult] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [pending, setPending] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);

  const checkPending = async () => {
    setLoadingCount(true);
    try {
      const res = await fetch('/api/waitlist/count');
      const data = await res.json();
      setPending(data.pendingNotification || 0);
    } catch {
      setPending(null);
    }
    setLoadingCount(false);
  };

  useEffect(() => {
    checkPending();
  }, []);

  const sendTest = async () => {
    if (!testEmail || !apiKey) {
      setResult('Introduce tu email y la API key');
      return;
    }

    setStatus('testing');
    setResult('');

    try {
      const res = await fetch('/api/notify-launch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testMode: true, testEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(`Email de prueba enviado a ${testEmail}. Revisa tu bandeja de entrada.`);
        setStatus('done');
      } else {
        setResult(`Error: ${data.error || 'Error desconocido'}`);
        setStatus('error');
      }
    } catch (error) {
      setResult(`Error de conexión: ${error}`);
      setStatus('error');
    }
  };

  const sendToAll = async () => {
    if (!apiKey) {
      setResult('Introduce la API key');
      return;
    }

    const confirmed = window.confirm(
      `¿Enviar el email a los ${pending} usuarios pendientes?\n\nTardará aproximadamente ${Math.ceil((pending || 0) / 60)} minutos.`
    );

    if (!confirmed) return;

    setStatus('sending');
    setResult('Enviando emails... Esto puede tardar varios minutos. NO cierres esta página.');

    try {
      const res = await fetch('/api/notify-launch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (res.ok) {
        const successCount = data.results?.success || 0;
        const failedCount = data.results?.failed || 0;

        if (failedCount > 0) {
          setResult(`Enviados: ${successCount} ✓ | Fallidos: ${failedCount} ✗\n\nPulsa "Reintentar fallidos" para enviar a los que fallaron.`);
        } else {
          setResult(`¡Todos enviados! ${successCount} emails enviados correctamente.`);
        }
        setStatus('done');
        checkPending(); // Actualizar contador
      } else {
        setResult(`Error: ${data.error || 'Error desconocido'}`);
        setStatus('error');
      }
    } catch (error) {
      setResult(`Error de conexión: ${error}`);
      setStatus('error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAF7F0',
      padding: '40px 20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          color: '#1F3A5F',
          fontSize: '28px',
          marginBottom: '8px',
          marginTop: 0
        }}>
          Enviar Email de Lanzamiento
        </h1>

        {/* Contador de pendientes */}
        <div style={{
          backgroundColor: '#FEF3C7',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          {loadingCount ? (
            <p style={{ margin: 0, color: '#92400E' }}>Cargando...</p>
          ) : pending !== null ? (
            <>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#92400E' }}>
                {pending}
              </p>
              <p style={{ margin: '4px 0 0', color: '#A16207', fontSize: '14px' }}>
                usuarios pendientes de recibir el email
              </p>
            </>
          ) : (
            <p style={{ margin: 0, color: '#92400E' }}>No se pudo cargar</p>
          )}
          <button
            onClick={checkPending}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              backgroundColor: 'transparent',
              border: '1px solid #D97706',
              borderRadius: '6px',
              color: '#D97706',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Actualizar
          </button>
        </div>

        {/* API Key */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1F3A5F' }}>
            API Key de Admin
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Introduce tu ADMIN_API_KEY"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Test Email */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1F3A5F' }}>
            Email para prueba (opcional)
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="tu@email.com"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={sendTest}
            disabled={status === 'testing' || status === 'sending'}
            style={{
              padding: '16px 24px',
              backgroundColor: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: status === 'testing' || status === 'sending' ? 'not-allowed' : 'pointer',
              opacity: status === 'testing' || status === 'sending' ? 0.6 : 1
            }}
          >
            {status === 'testing' ? 'Enviando prueba...' : 'Enviar prueba a mi email'}
          </button>

          <button
            onClick={sendToAll}
            disabled={status === 'testing' || status === 'sending' || pending === 0}
            style={{
              padding: '20px 24px',
              background: pending === 0 ? '#9CA3AF' : 'linear-gradient(135deg, #E1B955 0%, #D4A84B 100%)',
              color: '#1F3A5F',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: status === 'testing' || status === 'sending' || pending === 0 ? 'not-allowed' : 'pointer',
              opacity: status === 'testing' || status === 'sending' ? 0.6 : 1
            }}
          >
            {status === 'sending'
              ? 'Enviando... NO cierres la página'
              : pending === 0
                ? 'Todos los emails ya fueron enviados'
                : `ENVIAR A ${pending} USUARIOS`}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: status === 'error' ? '#FEF2F2' : status === 'sending' ? '#FEF3C7' : '#ECFDF5',
            color: status === 'error' ? '#DC2626' : status === 'sending' ? '#92400E' : '#059669',
            fontSize: '14px',
            whiteSpace: 'pre-wrap'
          }}>
            {result}
          </div>
        )}

        {/* Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#F3F4F6',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#6B7280'
        }}>
          <strong>Nota:</strong> Los emails se envían de uno en uno con 1 segundo de pausa para evitar límites.
          Si hay muchos usuarios, puede tardar varios minutos. Si algunos fallan, simplemente vuelve a pulsar
          el botón para reintentar solo los pendientes.
        </div>
      </div>
    </div>
  );
}
