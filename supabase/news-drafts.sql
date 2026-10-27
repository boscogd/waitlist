-- =====================================================
-- ACTUALIDAD — BORRADORES CON PUBLICACIÓN AUTOMÁTICA
-- Ejecutar UNA vez en Supabase SQL Editor (después de news-editions.sql).
-- Es idempotente: se puede repetir.
-- =====================================================
--
-- El trabajo de los lunes ya no publica directamente: deja la edición como
-- BORRADOR. Aida la revisa en /admin/actualidad (quita, corrige o añade
-- noticias) y pulsa Publicar. Si nadie la toca, el cron diario la publica
-- sola cuando llega auto_publish_at (48 h después de prepararla).
--
-- Estados de una edición:
--   borrador  → is_draft = TRUE  (is_published = FALSE)
--               auto_publish_at con fecha = se publicará sola
--               auto_publish_at NULL      = en pausa, solo a mano
--   publicada → is_published = TRUE,  is_draft = FALSE
--   retirada  → is_published = FALSE, is_draft = FALSE
--
-- SEGURIDAD: no cambia nada. anon sigue leyendo SOLO lo publicado (las
-- políticas existentes filtran por is_published) y no puede escribir.

ALTER TABLE public.news_editions
  ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_publish_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Las ediciones ya publicadas toman su fecha de creación como publicación.
UPDATE public.news_editions
SET published_at = created_at
WHERE is_published = TRUE AND published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_news_editions_due
  ON public.news_editions(auto_publish_at)
  WHERE is_draft = TRUE;

-- =====================================================
-- Comprobación
-- =====================================================
-- SELECT edition_date, is_draft, is_published, auto_publish_at, published_at
-- FROM news_editions ORDER BY edition_date DESC;
