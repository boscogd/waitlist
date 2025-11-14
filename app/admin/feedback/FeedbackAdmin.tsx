'use client';

import { useState, useEffect } from 'react';

interface Feedback {
  id: string;
  what_you_like: string | null;
  what_you_dont_like: string | null;
  what_to_improve: string | null;
  additional_comments: string | null;
  rating: number | null;
  created_at: string;
}

export default function FeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const fetchFeedbacks = async (key: string) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/feedback?key=${encodeURIComponent(key)}`);

      if (response.status === 401) {
        setError('Clave de acceso incorrecta');
        setAuthenticated(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar feedbacks');
      }

      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
      setAverageRating(parseFloat(data.averageRating) || 0);
      setAuthenticated(true);

      // Guardar la clave en localStorage para persistencia
      localStorage.setItem('admin_key', key);
    } catch (err) {
      setError('Error al cargar los feedbacks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFeedbacks(secretKey);
  };

  useEffect(() => {
    // Intentar cargar la clave guardada
    const savedKey = localStorage.getItem('admin_key');
    if (savedKey) {
      setSecretKey(savedKey);
      fetchFeedbacks(savedKey);
    } else {
      setLoading(false);
    }
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-dorado' : 'text-texto/20'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Auth form
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-azul/10">
          <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mb-4">
            Acceso Administrativo
          </h2>
          <p className="text-texto/70 text-sm mb-6">
            Ingresa la clave secreta para acceder al panel de feedback
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="secretKey" className="sr-only">
                Clave secreta
              </label>
              <input
                type="password"
                id="secretKey"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Clave secreta"
                required
                className="w-full px-4 py-3 text-base text-texto bg-white border border-azul/20 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-albero focus:border-transparent
                         placeholder:text-texto/50 transition-all duration-200"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 text-base font-medium text-white bg-azul rounded-lg
                       hover:bg-azul-800 focus:outline-none focus:ring-2 focus:ring-offset-2
                       focus:ring-albero disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
            >
              {loading ? 'Verificando...' : 'Acceder'}
            </button>
          </form>

          <p className="mt-6 text-xs text-texto/60 text-center">
            La clave se configura en la variable de entorno ADMIN_SECRET_KEY
          </p>
        </div>
      </div>
    );
  }

  // Main content
  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-azul"></div>
        <p className="mt-4 text-texto/70">Cargando feedbacks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-azul/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-texto/60">Total Feedbacks</p>
              <p className="text-3xl font-bold text-azul mt-1">{feedbacks.length}</p>
            </div>
            <div className="w-12 h-12 bg-albero/10 rounded-lg flex items-center justify-center text-2xl">
              💬
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-azul/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-texto/60">Calificación Promedio</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-3xl font-bold text-azul">{averageRating.toFixed(1)}</p>
                <span className="text-dorado text-xl">★</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-dorado/10 rounded-lg flex items-center justify-center text-2xl">
              ⭐
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-azul/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-texto/60">Con Calificación</p>
              <p className="text-3xl font-bold text-azul mt-1">
                {feedbacks.filter(f => f.rating).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-azul/10 rounded-lg flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
        </div>
      </div>

      {/* Feedbacks list */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-azul/10">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul mb-2">
              No hay feedbacks aún
            </h3>
            <p className="text-texto/70">
              Los feedbacks que recibas aparecerán aquí
            </p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white rounded-xl p-6 border border-azul/10 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-azul/10">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {feedback.rating && (
                      <div className="flex items-center gap-2">
                        {renderStars(feedback.rating)}
                        <span className="text-sm text-texto/60">
                          ({feedback.rating}/5)
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-texto/50 mt-2">
                    {formatDate(feedback.created_at)}
                  </p>
                </div>
                <div className="text-xs text-texto/40 font-mono">
                  ID: {feedback.id.substring(0, 8)}...
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {feedback.what_you_like && (
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <span>✅</span>
                      Lo que les gusta
                    </h4>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <p className="text-sm text-texto leading-relaxed whitespace-pre-wrap">
                        {feedback.what_you_like}
                      </p>
                    </div>
                  </div>
                )}

                {feedback.what_you_dont_like && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                      <span>❌</span>
                      Lo que no les gusta
                    </h4>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <p className="text-sm text-texto leading-relaxed whitespace-pre-wrap">
                        {feedback.what_you_dont_like}
                      </p>
                    </div>
                  </div>
                )}

                {feedback.what_to_improve && (
                  <div>
                    <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      <span>💡</span>
                      Sugerencias de mejora
                    </h4>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-sm text-texto leading-relaxed whitespace-pre-wrap">
                        {feedback.what_to_improve}
                      </p>
                    </div>
                  </div>
                )}

                {feedback.additional_comments && (
                  <div>
                    <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                      <span>💬</span>
                      Comentarios adicionales
                    </h4>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <p className="text-sm text-texto leading-relaxed whitespace-pre-wrap">
                        {feedback.additional_comments}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
