-- =====================================================
-- SECCIÓN ACTUALIDAD — "Buenas noticias de la Iglesia"
-- Ejecutar en Supabase SQL Editor (idempotente)
-- =====================================================
--
-- Almacena noticias CURADAS (titular + resumen propio + enlace a la
-- fuente). NO guardamos el texto completo de los medios: solo un resumen
-- escrito por nosotros y un enlace al original → sin problemas de copyright.
--
-- SEGURIDAD:
-- - anon (clave pública del navegador) SOLO puede LEER noticias publicadas.
-- - La ESCRITURA la hace exclusivamente el servidor con la SERVICE_ROLE key
--   (clave secreta que nunca viaja al navegador). No existe ninguna vía
--   pública para insertar/editar noticias → nadie puede inyectar contenido.

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
-- 2. RLS: anon SOLO lee las publicadas (ni escribe ni ve borradores)
-- =====================================================

ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS news_anon_read ON public.news_items;
CREATE POLICY news_anon_read ON public.news_items
  FOR SELECT TO anon
  USING (is_published = TRUE);

-- No hay ninguna policy de escritura para anon: con RLS activado y sin policy
-- de INSERT/UPDATE/DELETE, el cliente anon NO puede modificar la tabla.

-- =====================================================
-- 3. Escritura: SOLO service-role (servidor), NUNCA anon
-- =====================================================
-- La service-role key se salta RLS de forma controlada y solo se usa en el
-- servidor (app/api/news-refresh). Por seguridad eliminamos cualquier RPC de
-- escritura que pudiera ser accesible por anon, para que no exista ninguna
-- puerta pública hacia la tabla.

DROP FUNCTION IF EXISTS public.upsert_news_item(TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE);

-- =====================================================
-- FIN
-- =====================================================
-- Para verificar:
-- SELECT title, source_name, country, published_at FROM news_items ORDER BY published_at DESC LIMIT 10;
