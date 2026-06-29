-- =====================================================
-- WIN-BACK CAMPAIGN SCHEMA
-- Re-engagement de usuarios dormidos de la app
-- Ejecutar en Supabase SQL Editor (idempotente)
-- =====================================================
--
-- ESTRATEGIA:
-- Detecta usuarios que no han abierto la app en 14+ días
-- (usando auth.users.last_sign_in_at) y les envía una
-- secuencia de 3 emails:
--   Email #1 (día 14):  "¿Sigues ahí?"  - solo recordar
--   Email #2 (día 17):  "El evangelio de hoy"  - dar valor
--   Email #3 (día 21):  "Una intención por ti" - invitación final
--
-- Si el usuario abre la app entre emails, se sale de la
-- secuencia automáticamente (winback_step se reinicia
-- cuando last_sign_in_at > last_winback_at).
--
-- IMPORTANTE: Este script solo asume que la tabla `profiles`
-- existe y tiene una columna `id UUID` que coincide con
-- auth.users.id (el patrón estándar de Supabase). El nombre
-- del usuario se lee de auth.users.raw_user_meta_data, así
-- que NO necesitas tener ninguna columna de nombre concreta
-- en `profiles`. Puedes pegar este script tal cual.

-- =====================================================
-- 1. Añadir columnas de tracking a profiles
-- =====================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS winback_step INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_winback_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS winback_unsubscribed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS winback_unsubscribed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_profiles_winback_step
  ON public.profiles(winback_step);
CREATE INDEX IF NOT EXISTS idx_profiles_last_winback
  ON public.profiles(last_winback_at);

COMMENT ON COLUMN public.profiles.winback_step IS
  '0=no en secuencia, 1/2/3=paso actual, 4=secuencia completada (no re-enganchar)';

-- =====================================================
-- 2. RPC: get_dormant_users
-- =====================================================
-- Devuelve usuarios elegibles para la siguiente acción de win-back.
-- SECURITY DEFINER porque necesita leer auth.users.
--
-- Lógica:
-- - Filtra unsubscribed
-- - Solo usuarios que han iniciado sesión alguna vez
-- - Inactivos entre min_days y max_days (default 14-90)
-- - Excluye los que ya completaron la secuencia (step=4)
-- - Si han abierto la app después del último email, el endpoint
--   los resetea (no es trabajo del RPC).

CREATE OR REPLACE FUNCTION public.get_dormant_users(
  p_min_days INTEGER DEFAULT 14,
  p_max_days INTEGER DEFAULT 90
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  name TEXT,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  winback_step INTEGER,
  last_winback_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS user_id,
    u.email::TEXT AS email,
    -- Nombre robusto: lee de los metadatos de auth.users (siempre existen,
    -- nunca rompen aunque la clave no esté) y cae al prefijo del email.
    -- No depende de ninguna columna de `profiles`, así no falla al crearse.
    COALESCE(
      NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'first_name'), ''),
      split_part(u.email::TEXT, '@', 1)
    ) AS name,
    u.last_sign_in_at,
    COALESCE(p.winback_step, 0) AS winback_step,
    p.last_winback_at
  FROM public.profiles p
  INNER JOIN auth.users u ON u.id = p.id
  WHERE
    COALESCE(p.winback_unsubscribed, FALSE) = FALSE
    AND u.last_sign_in_at IS NOT NULL
    AND u.last_sign_in_at < (NOW() - (p_min_days || ' days')::INTERVAL)
    AND u.last_sign_in_at > (NOW() - (p_max_days || ' days')::INTERVAL)
    AND COALESCE(p.winback_step, 0) < 4;
END;
$$;

REVOKE ALL ON FUNCTION public.get_dormant_users(INTEGER, INTEGER) FROM public;
-- Solo el endpoint server-side (anon key) debe poder llamarlo.
-- La función NO devuelve datos a usuarios autenticados normales.
GRANT EXECUTE ON FUNCTION public.get_dormant_users(INTEGER, INTEGER) TO anon;

-- =====================================================
-- 3. RPC: update_winback_state
-- =====================================================
-- Atómico: actualiza step + timestamp cuando se envía un email.

CREATE OR REPLACE FUNCTION public.update_winback_state(
  p_user_id UUID,
  p_new_step INTEGER
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles
  SET
    winback_step = p_new_step,
    last_winback_at = NOW()
  WHERE id = p_user_id;
$$;

REVOKE ALL ON FUNCTION public.update_winback_state(UUID, INTEGER) FROM public;
GRANT EXECUTE ON FUNCTION public.update_winback_state(UUID, INTEGER) TO anon;

-- =====================================================
-- 4. RPC: unsubscribe_winback
-- =====================================================
-- Para el link de "no quiero más estos correos" en el footer.

CREATE OR REPLACE FUNCTION public.unsubscribe_winback(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    winback_unsubscribed = TRUE,
    winback_unsubscribed_at = NOW()
  WHERE id = p_user_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.unsubscribe_winback(UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.unsubscribe_winback(UUID) TO anon;

-- =====================================================
-- 5. RPC: winback_stats
-- =====================================================
-- Estadísticas para el panel de admin sin exponer datos.

CREATE OR REPLACE FUNCTION public.winback_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'dormant_14d', (
      SELECT COUNT(*)
      FROM public.profiles p
      INNER JOIN auth.users u ON u.id = p.id
      WHERE u.last_sign_in_at IS NOT NULL
        AND u.last_sign_in_at < NOW() - INTERVAL '14 days'
        AND COALESCE(p.winback_unsubscribed, FALSE) = FALSE
    ),
    'in_step_1', (
      SELECT COUNT(*) FROM public.profiles
      WHERE winback_step = 1 AND COALESCE(winback_unsubscribed, FALSE) = FALSE
    ),
    'in_step_2', (
      SELECT COUNT(*) FROM public.profiles
      WHERE winback_step = 2 AND COALESCE(winback_unsubscribed, FALSE) = FALSE
    ),
    'in_step_3', (
      SELECT COUNT(*) FROM public.profiles
      WHERE winback_step = 3 AND COALESCE(winback_unsubscribed, FALSE) = FALSE
    ),
    'completed', (
      SELECT COUNT(*) FROM public.profiles
      WHERE winback_step = 4
    ),
    'unsubscribed', (
      SELECT COUNT(*) FROM public.profiles
      WHERE COALESCE(winback_unsubscribed, FALSE) = TRUE
    ),
    'reactivated_7d', (
      -- Usuarios que estaban en step >= 1 y que abrieron la app
      -- en los últimos 7 días (signo de que el email funcionó)
      SELECT COUNT(*)
      FROM public.profiles p
      INNER JOIN auth.users u ON u.id = p.id
      WHERE p.last_winback_at IS NOT NULL
        AND p.last_winback_at < u.last_sign_in_at
        AND u.last_sign_in_at > NOW() - INTERVAL '7 days'
    )
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.winback_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.winback_stats() TO anon;

-- =====================================================
-- 6. Plantillas de email
-- =====================================================
-- Tono: cálido, sin urgencia, sin promo. Reconoce que la vida
-- pesa y que la app sigue aquí sin juicio.

INSERT INTO email_templates (template_key, name, description, email_type, sequence_step, subject, preview_text, html_content)
VALUES

-- ─────────────────────────────────────────────────────
-- WINBACK #1 — Día 14: "¿Sigues ahí?"
-- ─────────────────────────────────────────────────────
('winback_1',
 'Win-back #1: ¿Sigues ahí?',
 'Email suave a los 14 días sin abrir. Sin pedir nada, solo reconocer.',
 'sequence',
 NULL,
 '{{name}}, sin prisa',
 'No hace falta que vuelvas hoy. Solo quería que supieras...',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <img src="https://refugioenlapalabra.com/logo-512-1.png" alt="Refugio en la Palabra" width="60" height="60" style="display: block; margin: 0 auto 14px; border-radius: 14px;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">{{name}},</p>

            <p style="margin-bottom: 25px;">
                Han pasado unas semanas desde la última vez que abriste Refugio.
            </p>

            <p style="margin-bottom: 25px;">
                No te escribo para reclamarte nada. Sé cómo es la vida: el trabajo, los niños, el cansancio que se acumula, las cosas que se quedan a medias.
            </p>

            <p style="margin-bottom: 25px;">
                Solo quería que supieras que <strong>la app sigue aquí</strong>. El Evangelio del día se publica cada mañana, aunque no entres. Las oraciones siguen estando. Tu cuenta sigue tal cual la dejaste.
            </p>

            <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04); border-left: 3px solid #E1B955;">
                <p style="margin: 0; font-style: italic; color: #5D574F; font-size: 18px;">
                    "Venid a mí todos los que estáis cansados y agobiados, y yo os aliviaré."
                </p>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #A09A92;">— Mateo 11,28</p>
            </div>

            <p style="margin-bottom: 25px;">
                No tienes que volver hoy. Ni mañana. Pero si en algún momento sientes que necesitas un rato de silencio con Dios, aquí estamos.
            </p>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Con cariño,<br>
                <span style="color: #8B7355;">— El equipo de Refugio</span>
            </p>
        </div>

        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Dejar de recibir estos correos</a>
        </div>
    </div>
</body>
</html>'),

-- ─────────────────────────────────────────────────────
-- WINBACK #2 — Día 17: "Lo que te has perdido"
-- ─────────────────────────────────────────────────────
('winback_2',
 'Win-back #2: El evangelio de hoy',
 'Email con valor concreto: trae la lectura del día y una reflexión breve.',
 'sequence',
 NULL,
 'El Evangelio de hoy, {{name}}',
 'Llega aunque no abras la app. Tres minutos de lectura...',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <img src="https://refugioenlapalabra.com/logo-512-1.png" alt="Refugio en la Palabra" width="60" height="60" style="display: block; margin: 0 auto 14px; border-radius: 14px;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">{{name}},</p>

            <p style="margin-bottom: 25px;">
                Hoy quiero traerte algo. Sin pedirte que abras la app, sin pedirte nada en realidad.
            </p>

            <p style="margin-bottom: 30px;">
                Aquí va una de las lecturas que más nos toca cuando volvemos después de un tiempo lejos:
            </p>

            <div style="background-color: white; border-radius: 8px; padding: 35px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04);">
                <p style="margin: 0 0 20px 0; font-size: 13px; color: #8B7355; text-transform: uppercase; letter-spacing: 2px;">
                    Parábola del hijo pródigo · Lc 15,20
                </p>
                <p style="margin: 0 0 18px 0; font-style: italic; color: #2D2A26; font-size: 18px; line-height: 1.7;">
                    "Cuando todavía estaba lejos, su padre lo vio y se conmovió.
                </p>
                <p style="margin: 0; font-style: italic; color: #2D2A26; font-size: 18px; line-height: 1.7;">
                    Corrió a su encuentro, se le echó al cuello y lo besó."
                </p>
            </div>

            <p style="margin-bottom: 25px;">
                Lo que más sorprende de esta parábola no es que el hijo vuelva. <strong>Es que el padre lo está esperando.</strong>
            </p>

            <p style="margin-bottom: 25px;">
                Mientras el hijo se preparaba un discurso de disculpa, el padre ya estaba corriendo. Sin sermón, sin reproche. Solo abrazo.
            </p>

            <p style="margin-bottom: 25px;">
                Eso es lo que muchos olvidamos cuando nos alejamos de la oración: <strong>no hay nada que reconstruir</strong>. La relación nunca se rompió por su lado.
            </p>

            <p style="margin-bottom: 25px;">
                Si quieres seguir leyendo, en la app tienes la reflexión completa de hoy y el Evangelio del día. Si no, ya está bien: este trozo era para ti.
            </p>

            <div style="text-align: center; margin: 45px 0 35px 0;">
                <a href="{{app_url}}" style="display: inline-block; color: #1F3A5F; text-decoration: none; padding: 14px 32px; border: 1px solid #1F3A5F; border-radius: 8px; font-size: 16px;">
                    Leer la reflexión completa
                </a>
            </div>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Un abrazo,<br>
                <span style="color: #8B7355;">— El equipo de Refugio</span>
            </p>
        </div>

        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Dejar de recibir estos correos</a>
        </div>
    </div>
</body>
</html>'),

-- ─────────────────────────────────────────────────────
-- WINBACK #3 — Día 21: "Una intención por ti"
-- ─────────────────────────────────────────────────────
('winback_3',
 'Win-back #3: Una intención por ti',
 'Invitación final. Sin descuento, sin urgencia. Solo un gesto.',
 'sequence',
 NULL,
 '¿Hay algo que te pese, {{name}}?',
 'Si nos cuentas tu intención, rezamos por ti...',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <img src="https://refugioenlapalabra.com/logo-512-1.png" alt="Refugio en la Palabra" width="60" height="60" style="display: block; margin: 0 auto 14px; border-radius: 14px;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">{{name}},</p>

            <p style="margin-bottom: 25px;">
                Este es el último correo de esta serie. Te prometo que no te seguiremos escribiendo si no quieres.
            </p>

            <p style="margin-bottom: 25px;">
                Pero antes de despedirnos por ahora, quería preguntarte algo:
            </p>

            <div style="background-color: white; border-radius: 8px; padding: 35px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04); border-left: 3px solid #E1B955;">
                <p style="margin: 0; font-size: 19px; color: #1F3A5F; line-height: 1.7;">
                    ¿Hay algo que te esté pesando ahora mismo?
                </p>
            </div>

            <p style="margin-bottom: 25px;">
                Una persona enferma. Un trabajo que se cae. Una relación que duele. Una decisión que no sabes tomar. Una pérdida que aún no has digerido.
            </p>

            <p style="margin-bottom: 25px;">
                Si quieres, <strong>responde a este email con tu intención</strong>. No tienes que dar detalles, basta con una línea. Nosotros la añadiremos a las oraciones del equipo esta semana.
            </p>

            <p style="margin-bottom: 25px;">
                No es magia. No te prometemos resultados. Solo te decimos: <em>no estás solo con eso</em>.
            </p>

            <div style="background-color: #1F3A5F; border-radius: 12px; padding: 30px; margin: 40px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.7); font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">
                    Si prefieres volver tú mismo
                </p>
                <p style="margin: 0 0 20px 0; color: white; font-size: 17px;">
                    En la app tienes una oración para empezar de nuevo sin culpa.
                </p>
                <a href="{{app_url}}" style="display: inline-block; background-color: #E1B955; color: #1F3A5F; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                    Abrir Refugio
                </a>
            </div>

            <p style="margin-bottom: 25px;">
                Pase lo que pase, gracias por haber estado.
            </p>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Con cariño,<br>
                <span style="color: #8B7355;">— El equipo de Refugio</span>
            </p>

            <p style="margin-top: 30px; font-size: 15px; color: #8B7355; font-style: italic;">
                P.D. Si respondes a este correo, lo lee una persona de verdad. No un bot.
            </p>
        </div>

        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Dejar de recibir estos correos</a>
        </div>
    </div>
</body>
</html>')

ON CONFLICT (template_key) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    subject = EXCLUDED.subject,
    preview_text = EXCLUDED.preview_text,
    html_content = EXCLUDED.html_content,
    updated_at = NOW();

-- =====================================================
-- FIN
-- =====================================================
-- Para verificar:
-- SELECT template_key, name FROM email_templates WHERE template_key LIKE 'winback_%';
-- SELECT public.winback_stats();
