import Link from 'next/link';
import AnimateOnScroll from '../AnimateOnScroll';
import { editionPath, formatEditionDate, getLatest } from '@/lib/news/queries';

// =====================================================
// Portada: últimas buenas noticias de Actualidad
// =====================================================
// Tres titulares de la última edición publicada, con enlace a la edición
// completa. Muestra que la web está viva y enlaza el archivo desde la
// portada (bueno para Google). Si no hay noticias, no se pinta nada.

const SHOWN = 3;

export default async function NewsTeaserSection() {
  const { edition, items } = await getLatest(0);
  if (items.length === 0) return null;

  const href = edition ? editionPath(edition.edition_date) : '/actualidad';

  return (
    <section id="actualidad" className="px-6 py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <AnimateOnScroll>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 text-center sm:text-left">
            <div>
              <span className="text-[#8a6d1f] font-medium text-sm uppercase tracking-wider">
                Actualidad{edition ? ` · ${formatEditionDate(edition.edition_date)}` : ''}
              </span>
              <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-semibold text-azul mt-3">
                Buenas noticias de la Iglesia
              </h2>
            </div>
            <Link
              href={href}
              className="shrink-0 text-azul font-medium underline decoration-albero/60 underline-offset-4 hover:decoration-albero transition-colors"
            >
              Ver las {items.length} noticias
            </Link>
          </div>
        </AnimateOnScroll>

        <div className="grid gap-6 md:grid-cols-3">
          {items.slice(0, SHOWN).map((n, i) => (
            <AnimateOnScroll key={n.id} delay={i * 80} className="h-full">
              <article className="h-full bg-white rounded-2xl p-6 border border-azul/5 shadow-sm flex flex-col">
                <p className="text-xs text-texto/50 mb-3">
                  {n.country || 'Internacional'} · {n.source_name}
                </p>
                <h3 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul leading-snug mb-3">
                  {n.title}
                </h3>
                <p className="text-texto/70 text-sm leading-relaxed line-clamp-3 flex-1">{n.summary}</p>
                <Link
                  href={href}
                  className="mt-4 text-sm font-medium text-azul hover:text-albero transition-colors"
                >
                  Seguir leyendo <span aria-hidden="true">→</span>
                </Link>
              </article>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
