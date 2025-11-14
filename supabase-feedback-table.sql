-- Tabla para almacenar feedback anónimo de usuarios
-- Ejecuta este SQL en Supabase SQL Editor para crear la tabla

CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  what_you_like TEXT,
  what_you_dont_like TEXT,
  what_to_improve TEXT,
  additional_comments TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Campos de gestión (opcionales)
  reviewed BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  priority INTEGER CHECK (priority >= 1 AND priority <= 3) DEFAULT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'discarded')),

  -- Añadir índice para mejorar performance en consultas ordenadas por fecha
  CONSTRAINT feedback_created_at_idx CHECK (created_at IS NOT NULL)
);

-- Crear índice para optimizar búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Crear índice para filtrar por rating
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating) WHERE rating IS NOT NULL;

-- Crear índice para filtrar por estado
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- Crear índice para filtrar por revisado
CREATE INDEX IF NOT EXISTS idx_feedback_reviewed ON feedback(reviewed);

-- Habilitar Row Level Security (RLS)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT anónimo (cualquiera puede enviar feedback)
CREATE POLICY "Permitir insert anónimo de feedback"
  ON feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para permitir SELECT solo a usuarios autenticados (opcional, para admin)
-- Si quieres permitir que cualquier usuario autenticado pueda ver los feedbacks, descomenta lo siguiente:
-- CREATE POLICY "Permitir select a usuarios autenticados"
--   ON feedback
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- Añadir comentarios a la tabla y columnas para documentación
COMMENT ON TABLE feedback IS 'Almacena feedback anónimo de usuarios del MVP';
COMMENT ON COLUMN feedback.id IS 'ID único del feedback';
COMMENT ON COLUMN feedback.what_you_like IS 'Lo que al usuario le gusta de la app';
COMMENT ON COLUMN feedback.what_you_dont_like IS 'Lo que al usuario no le gusta o encuentra confuso';
COMMENT ON COLUMN feedback.what_to_improve IS 'Sugerencias de mejora o nuevas funcionalidades';
COMMENT ON COLUMN feedback.additional_comments IS 'Comentarios adicionales del usuario';
COMMENT ON COLUMN feedback.rating IS 'Calificación general de 1 a 5 estrellas';
COMMENT ON COLUMN feedback.created_at IS 'Fecha y hora de creación del feedback';
COMMENT ON COLUMN feedback.reviewed IS 'Si el feedback ya ha sido revisado por el admin';
COMMENT ON COLUMN feedback.admin_notes IS 'Notas internas del administrador sobre este feedback';
COMMENT ON COLUMN feedback.priority IS 'Prioridad del feedback: 1=Alta, 2=Media, 3=Baja';
COMMENT ON COLUMN feedback.status IS 'Estado del feedback: pending, in_progress, completed, discarded';
