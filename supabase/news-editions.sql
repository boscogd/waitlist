-- =====================================================
-- ACTUALIDAD — EDICIONES SEMANALES (archivo con URL permanente)
-- Ejecutar UNA vez en Supabase SQL Editor. Es idempotente: se puede repetir.
-- =====================================================
--
-- Hasta ahora cada tanda nueva sustituía a la anterior y el contenido se
-- perdía. Con esto cada tanda es una EDICIÓN con su fecha y su página
-- permanente (/actualidad/2026-09-21), y /actualidad muestra la última.
--
-- El código funciona ANTES y DESPUÉS de ejecutar este SQL: si la tabla no
-- existe, la web y el endpoint siguen con el comportamiento antiguo.
--
-- SEGURIDAD: igual que news_items. anon SOLO lee ediciones publicadas;
-- la escritura es exclusiva de service-role (servidor).

-- 1. Tabla de ediciones ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news_editions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_date  DATE NOT NULL UNIQUE,          -- el lunes en que se publica; es el slug de la URL
  intro         TEXT,                          -- entradilla propia de la semana (opcional)
  is_published  BOOLEAN NOT NULL DEFAULT TRUE, -- FALSE = edición retirada (no sale en web ni archivo)
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.news_editions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS news_editions_anon_read ON public.news_editions;
CREATE POLICY news_editions_anon_read ON public.news_editions
  FOR SELECT TO anon
  USING (is_published = TRUE);

-- 2. Cada noticia pertenece a una edición --------------------------------
ALTER TABLE public.news_items
  ADD COLUMN IF NOT EXISTS edition_id UUID REFERENCES public.news_editions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_news_items_edition
  ON public.news_items(edition_id, published_at DESC NULLS LAST);

-- 3. Migración de lo que ya hay -----------------------------------------
-- Una edición por cada día en que se cargó una tanda (hora de Madrid).
INSERT INTO public.news_editions (edition_date)
SELECT DISTINCT (created_at AT TIME ZONE 'Europe/Madrid')::date
FROM public.news_items
WHERE edition_id IS NULL
ON CONFLICT (edition_date) DO NOTHING;

UPDATE public.news_items n
SET edition_id = e.id
FROM public.news_editions e
WHERE n.edition_id IS NULL
  AND e.edition_date = (n.created_at AT TIME ZONE 'Europe/Madrid')::date;

-- Las tandas antiguas se despublicaron solo porque llegó una nueva, no
-- porque estuvieran mal: vuelven a ser visibles, ahora como archivo.
UPDATE public.news_items
SET is_published = TRUE
WHERE is_published = FALSE
  AND edition_id IS NOT NULL;

-- =====================================================
-- Comprobación
-- =====================================================
-- SELECT e.edition_date, e.is_published, COUNT(n.id) AS noticias
-- FROM news_editions e LEFT JOIN news_items n ON n.edition_id = e.id
-- GROUP BY 1, 2 ORDER BY 1 DESC;
--
-- Retirar una edición que salió mal (la web pasa sola a la anterior):
-- UPDATE news_editions SET is_published = FALSE WHERE edition_date = '2026-09-21';
