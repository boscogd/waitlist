import AnimateOnScroll from '../components/AnimateOnScroll';
import { formatDate, type NewsItem } from '@/lib/news/queries';

// Rejilla de tarjetas de noticias. La comparten /actualidad (última edición)
// y /actualidad/[fecha] (cada edición del archivo).
export default function NewsGrid({ news }: { news: NewsItem[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {news.map((n, i) => (
        <AnimateOnScroll key={n.id} delay={(i % 3) * 80} className="h-full">
          <article className="hover-lift h-full bg-white rounded-2xl p-6 border border-azul/5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-xs">
              {n.country && (
                <span className="bg-albero/15 text-azul px-2.5 py-1 rounded-full font-medium">
                  {n.country}
                </span>
              )}
              {n.published_at && (
                <time dateTime={n.published_at} className="text-texto/40">
                  {formatDate(n.published_at)}
                </time>
              )}
            </div>

            <h2 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul leading-snug mb-3">
              {n.title}
            </h2>

            <p className="text-texto/80 text-sm leading-relaxed mb-5 flex-1">{n.summary}</p>

            {/* Enlace editorial a un medio que recomendamos: sin nofollow ni
                noreferrer, para que el medio vea que el tráfico llega de
                Refugio. noopener basta para la seguridad. */}
            <a
              href={n.source_url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-azul hover:text-albero transition-colors mt-auto"
            >
              Leer en {n.source_name}
              <span aria-hidden="true">→</span>
            </a>
          </article>
        </AnimateOnScroll>
      ))}
    </div>
  );
}

// Nota de transparencia que acompaña siempre a la rejilla.
export function TransparencyNote() {
  return (
    <p className="text-center text-xs text-texto/40 mt-14 max-w-2xl mx-auto leading-relaxed">
      Las noticias pertenecen a sus respectivos medios. Ofrecemos un titular y un resumen propios
      con enlace al original; no reproducimos los artículos.
    </p>
  );
}
