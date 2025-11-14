'use client';

import { useState } from 'react';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    whatYouLike: '',
    whatYouDontLike: '',
    whatToImprove: '',
    additionalComments: '',
    rating: 0,
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('¡Gracias por tu feedback! Tu opinión nos ayuda a mejorar.');
        // Reset form
        setFormData({
          whatYouLike: '',
          whatYouDontLike: '',
          whatToImprove: '',
          additionalComments: '',
          rating: 0,
        });
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleRatingClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  return (
    <div className="w-full">
      {/* Success/Error Message */}
      {status !== 'idle' && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm ${
            status === 'success'
              ? 'bg-albero/10 text-azul border border-albero/30'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Rating Section */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-azul/10">
          <div className="space-y-2">
            <label className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul block">
              ¿Cómo calificarías tu experiencia general con la app?
            </label>
            <p className="text-texto/70 text-sm">
              Selecciona una puntuación del 1 al 5
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className={`text-4xl transition-all hover:scale-110 ${
                  formData.rating >= star ? 'text-dorado' : 'text-texto/20'
                }`}
                aria-label={`Calificar ${star} estrellas`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-texto/60">
            {formData.rating > 0 && `Has seleccionado ${formData.rating} estrella${formData.rating > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* What you like */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-azul/10">
          <div className="space-y-2">
            <label htmlFor="whatYouLike" className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul block">
              ¿Qué es lo que más te gusta de la app?
            </label>
            <p className="text-texto/70 text-sm">
              Cuéntanos qué funcionalidades o aspectos valoras más
            </p>
          </div>
          <textarea
            id="whatYouLike"
            name="whatYouLike"
            value={formData.whatYouLike}
            onChange={(e) => setFormData({ ...formData, whatYouLike: e.target.value })}
            rows={4}
            placeholder="Por ejemplo: Me encanta el rosario guiado porque..."
            className="w-full px-4 py-3 text-base text-texto bg-white border border-azul/20 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-albero focus:border-transparent
                     placeholder:text-texto/50 transition-all duration-200 resize-y"
          />
        </div>

        {/* What you don't like */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-azul/10">
          <div className="space-y-2">
            <label htmlFor="whatYouDontLike" className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul block">
              ¿Qué es lo que menos te gusta o encuentras confuso?
            </label>
            <p className="text-texto/70 text-sm">
              Sé honesto, nos ayuda a identificar problemas y puntos de fricción
            </p>
          </div>
          <textarea
            id="whatYouDontLike"
            name="whatYouDontLike"
            value={formData.whatYouDontLike}
            onChange={(e) => setFormData({ ...formData, whatYouDontLike: e.target.value })}
            rows={4}
            placeholder="Por ejemplo: Me cuesta encontrar... o No me gusta que..."
            className="w-full px-4 py-3 text-base text-texto bg-white border border-azul/20 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-albero focus:border-transparent
                     placeholder:text-texto/50 transition-all duration-200 resize-y"
          />
        </div>

        {/* What to improve */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-azul/10">
          <div className="space-y-2">
            <label htmlFor="whatToImprove" className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul block">
              ¿Qué mejorarías o añadirías?
            </label>
            <p className="text-texto/70 text-sm">
              Comparte ideas de nuevas funcionalidades o mejoras que te gustaría ver
            </p>
          </div>
          <textarea
            id="whatToImprove"
            name="whatToImprove"
            value={formData.whatToImprove}
            onChange={(e) => setFormData({ ...formData, whatToImprove: e.target.value })}
            rows={4}
            placeholder="Por ejemplo: Sería genial si pudiera... o Me gustaría que..."
            className="w-full px-4 py-3 text-base text-texto bg-white border border-azul/20 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-albero focus:border-transparent
                     placeholder:text-texto/50 transition-all duration-200 resize-y"
          />
        </div>

        {/* Additional comments */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-azul/10">
          <div className="space-y-2">
            <label htmlFor="additionalComments" className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul block">
              Comentarios adicionales
            </label>
            <p className="text-texto/70 text-sm">
              ¿Hay algo más que quieras compartir para ayudarnos a crear la mejor app posible?
            </p>
          </div>
          <textarea
            id="additionalComments"
            name="additionalComments"
            value={formData.additionalComments}
            onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
            rows={5}
            placeholder="Cualquier otro comentario, sugerencia o idea que quieras compartir..."
            className="w-full px-4 py-3 text-base text-texto bg-white border border-azul/20 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-albero focus:border-transparent
                     placeholder:text-texto/50 transition-all duration-200 resize-y"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-4 text-base font-medium text-white bg-azul rounded-lg
                     hover:bg-azul-800 focus:outline-none focus:ring-2 focus:ring-offset-2
                     focus:ring-albero disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {loading ? 'Enviando feedback...' : 'Enviar feedback'}
          </button>
        </div>

        <p className="text-xs text-center text-texto/60 leading-relaxed pt-2">
          Recuerda: Este formulario es totalmente anónimo. No guardamos ningún dato que pueda identificarte.
        </p>
      </form>
    </div>
  );
}
