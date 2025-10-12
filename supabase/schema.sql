-- Tabla para la waitlist de Refugio en la Palabra
-- Ejecuta este SQL en el Supabase SQL Editor

-- Crear la tabla waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_code ON waitlist(code);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserciones públicas (para el formulario)
CREATE POLICY "Permitir inserciones públicas en waitlist"
  ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir lectura solo a usuarios autenticados (para el admin)
CREATE POLICY "Permitir lectura a usuarios autenticados"
  ON waitlist
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para permitir actualizaciones solo a usuarios autenticados
CREATE POLICY "Permitir actualizaciones a usuarios autenticados"
  ON waitlist
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE waitlist IS 'Lista de espera para Refugio en la Palabra';
COMMENT ON COLUMN waitlist.email IS 'Email del usuario (único)';
COMMENT ON COLUMN waitlist.name IS 'Nombre del usuario';
COMMENT ON COLUMN waitlist.code IS 'Código único de acceso anticipado (formato: REFUGIO-XXXXX)';
COMMENT ON COLUMN waitlist.notified IS 'Si el usuario ya recibió el email de bienvenida';
