-- =====================================================
-- SECCIÓN ACTUALIDAD — "Buenas noticias de la Iglesia"
-- Ejecutar en Supabase SQL Editor (idempotente)
-- =====================================================
--
-- Almacena noticias CURADAS (titular + resumen propio + enlace a la
-- fuente). NO guardamos el texto completo de los medios: solo un resumen
-- escrito por nosotros y un enlace al original → sin problemas de copyright.
--
-- La curación la hace `app/api/news-refresh`: lee RSS de Google News,
-- filtra con IA (Gemini) solo las noticias buenas/esperanzadoras y escribe
-- un resumen breve con el tono de Refugio.

-- =====================================================
-- 1. Tabla
-- =====================================================

CREATE TABLE IF NOT EXISTS public.news_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL,
  source_name   TEXT NOT NULL,
  source_url    TEXT NOT NULL UNIQUE,
  country       TEXT,
  published_at  TIMESTAMP WITH TIME ZONE,
  is_published  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_items_published
  ON public.news_items(is_published, published_at DESC NULLS LAST);

-- =====================================================
-- 2. RLS: anon solo LEE las publicadas
-- =====================================================

ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS news_anon_read ON public.news_items;
CREATE POLICY news_anon_read ON public.news_items
  FOR SELECT TO anon
  USING (is_published = TRUE);

-- (No hay policy de escritura para anon: la inserción va por el RPC
--  SECURITY DEFINER de abajo, que sí puede saltarse RLS de forma controlada.)

-- =====================================================
-- 3. RPC: upsert_news_item (escritura controlada)
-- =====================================================

CREATE OR REPLACE FUNCTION public.upsert_news_item(
  p_title        TEXT,
  p_summary      TEXT,
  p_source_name  TEXT,
  p_source_url   TEXT,
  p_country      TEXT,
  p_published_at TIMESTAMP WITH TIME ZONE
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.news_items
    (title, summary, source_name, source_url, country, published_at)
  VALUES
    (p_title, p_summary, p_source_name, p_source_url, p_country, p_published_at)
  ON CONFLICT (source_url) DO UPDATE SET
    title        = EXCLUDED.title,
    summary      = EXCLUDED.summary,
    source_name  = EXCLUDED.source_name,
    country      = EXCLUDED.country,
    published_at = EXCLUDED.published_at;
$$;

REVOKE ALL ON FUNCTION public.upsert_news_item(TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE) FROM public;
-- Solo el endpoint server-side (anon key) lo llama.
GRANT EXECUTE ON FUNCTION public.upsert_news_item(TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE) TO anon;

-- =====================================================
-- FIN
-- =====================================================
-- Para verificar:
-- SELECT title, source_name, country, published_at FROM news_items ORDER BY published_at DESC LIMIT 10;
