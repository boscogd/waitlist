-- =====================================================
-- CODE-REMINDER CAMPAIGN SCHEMA
-- Recordatorios automáticos a usuarios de la WAITLIST que
-- NO han canjeado su código de descuento (mes premium gratis).
-- Ejecutar en Supabase SQL Editor (idempotente).
-- =====================================================
--
-- ESTRATEGIA:
-- Detecta usuarios de `waitlist` con code_used = FALSE y les
-- envía una secuencia de 3 recordatorios cálidos:
--   Email #1 (día  3):  "Tu regalo sigue sin abrir"
--   Email #2 (día 10):  "¿Te echo una mano para empezar?"
--   Email #3 (día 21):  "Última llamada, sin presión"
--
-- El reloj de cada paso se mide:
--   step 0 → 1 : 3 días desde created_at (registro)
--   step 1 → 2 : 7 días desde el email #1
--   step 2 → 3 : 11 días desde el email #2
--
-- El usuario SALE de la secuencia automáticamente cuando:
--   - canjea el código (code_used = TRUE)  → deja de aparecer en el RPC
--   - se da de baja (unsubscribed = TRUE)
--   - completa los 3 emails (code_reminder_step = 4)
--
-- Se replica la arquitectura del win-back: RPCs SECURITY DEFINER
-- (porque el endpoint usa la anon key y la RLS de `waitlist`
-- bloquea el acceso directo de anónimos). Reutiliza las tablas
-- email_templates y email_logs ya existentes (drip-campaign-schema.sql).

-- =====================================================
-- 1. Columnas de tracking en `waitlist`
-- =====================================================
-- code_used / code_used_at  → estado de canje del código.
--   IMPORTANTE: la APP debe poner code_used = TRUE al canjear
--   (usa el RPC mark_code_used de más abajo). Si nunca se marca,
--   estos recordatorios llegarían también a quien ya canjeó.
-- code_reminder_step         → 0=fuera, 1/2/3=paso enviado, 4=completado
-- last_code_reminder_at      → timestamp del último recordatorio

ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS code_used BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS code_used_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS code_reminder_step INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_code_reminder_at TIMESTAMP WITH TIME ZONE;

-- `unsubscribed` / `unsubscribed_at` ya existen (drip-campaign-schema.sql).
-- Si ejecutas este script SIN el de drip, descomenta:
-- ALTER TABLE public.waitlist
--   ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT FALSE,
--   ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_waitlist_code_used
  ON public.waitlist(code_used);
CREATE INDEX IF NOT EXISTS idx_waitlist_code_reminder_step
  ON public.waitlist(code_reminder_step);

COMMENT ON COLUMN public.waitlist.code_used IS
  'TRUE cuando el usuario ha canjeado su código (mes premium gratis). La app lo marca vía RPC mark_code_used.';
COMMENT ON COLUMN public.waitlist.code_reminder_step IS
  '0=no en secuencia, 1/2/3=paso enviado, 4=secuencia completada (no re-enganchar)';

-- =====================================================
-- 1b. Tablas base (por si NO se ejecutó drip-campaign-schema)
-- =====================================================
-- email_templates y email_logs normalmente las crea drip-campaign-schema.
-- Las creamos aquí IF NOT EXISTS para que este script funcione por sí solo.
-- (Si ya existen, estos CREATE no tocan nada.)

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    email_type VARCHAR(50) NOT NULL,
    sequence_step INTEGER,
    subject VARCHAR(255) NOT NULL,
    preview_text VARCHAR(255),
    html_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID,
    waitlist_id UUID,
    email_to VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    resend_id VARCHAR(255),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_to ON email_logs(email_to);

-- RLS: la app usa la anon key. Si email_templates tiene RLS activado sin
-- política, loadTemplates() recibe [] aunque las plantillas existan. Damos
-- a anon lectura de plantillas y lectura/escritura de logs (no son datos
-- sensibles). Idempotente.
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "templates_anon_read" ON public.email_templates;
CREATE POLICY "templates_anon_read" ON public.email_templates
  FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "logs_anon_rw" ON public.email_logs;
CREATE POLICY "logs_anon_rw" ON public.email_logs
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 2. RPC: get_unredeemed_users
-- =====================================================
-- Devuelve usuarios de la waitlist elegibles para el siguiente
-- recordatorio: código sin canjear, no dados de baja, secuencia
-- no completada. SECURITY DEFINER para saltar la RLS con anon key.

CREATE OR REPLACE FUNCTION public.get_unredeemed_users(
  p_max_age_days INTEGER DEFAULT NULL  -- NULL = sin límite de antigüedad
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  code TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  code_reminder_step INTEGER,
  last_code_reminder_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.email::TEXT,
    w.name::TEXT,
    w.code::TEXT,
    w.created_at,
    COALESCE(w.code_reminder_step, 0) AS code_reminder_step,
    w.last_code_reminder_at
  FROM public.waitlist w
  WHERE
    COALESCE(w.code_used, FALSE) = FALSE
    AND COALESCE(w.unsubscribed, FALSE) = FALSE
    AND COALESCE(w.code_reminder_step, 0) < 4
    AND (
      p_max_age_days IS NULL
      OR w.created_at > (NOW() - (p_max_age_days || ' days')::INTERVAL)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_unredeemed_users(INTEGER) FROM public;
GRANT EXECUTE ON FUNCTION public.get_unredeemed_users(INTEGER) TO anon;

-- =====================================================
-- 3. RPC: update_code_reminder_state
-- =====================================================
-- Atómico: actualiza el paso + timestamp al enviar un recordatorio.

CREATE OR REPLACE FUNCTION public.update_code_reminder_state(
  p_id UUID,
  p_new_step INTEGER
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.waitlist
  SET
    code_reminder_step = p_new_step,
    last_code_reminder_at = NOW()
  WHERE id = p_id;
$$;

REVOKE ALL ON FUNCTION public.update_code_reminder_state(UUID, INTEGER) FROM public;
GRANT EXECUTE ON FUNCTION public.update_code_reminder_state(UUID, INTEGER) TO anon;

-- =====================================================
-- 4. RPC: unsubscribe_code_reminder
-- =====================================================
-- Para el link "no quiero más recordatorios" del footer.

CREATE OR REPLACE FUNCTION public.unsubscribe_code_reminder(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.waitlist
  SET
    unsubscribed = TRUE,
    unsubscribed_at = NOW()
  WHERE id = p_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.unsubscribe_code_reminder(UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.unsubscribe_code_reminder(UUID) TO anon;

-- =====================================================
-- 5. RPC: mark_code_used   ← LA PIEZA QUE FALTABA
-- =====================================================
-- La APP debe llamar a esto cuando un usuario canjea su código,
-- para sacarlo de la secuencia de recordatorios y tener métricas
-- de canje fiables. Devuelve TRUE si encontró el código.
--
-- Desde la app (cliente Supabase):
--   await supabase.rpc('mark_code_used', { p_code: 'REFUGIO-XXXXX' })
-- O vía el endpoint POST /api/code/mark-used (ver repo).

CREATE OR REPLACE FUNCTION public.mark_code_used(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.waitlist
  SET
    code_used = TRUE,
    code_used_at = COALESCE(code_used_at, NOW())
  WHERE UPPER(TRIM(code)) = UPPER(TRIM(p_code));
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_code_used(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.mark_code_used(TEXT) TO anon;

-- =====================================================
-- 6. RPC: code_reminder_stats
-- =====================================================
-- Métricas para el panel de admin sin exponer datos personales.

CREATE OR REPLACE FUNCTION public.code_reminder_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'pending', (
      SELECT COUNT(*) FROM public.waitlist
      WHERE COALESCE(code_used, FALSE) = FALSE
        AND COALESCE(unsubscribed, FALSE) = FALSE
        AND COALESCE(code_reminder_step, 0) < 4
    ),
    'redeemed', (
      SELECT COUNT(*) FROM public.waitlist
      WHERE COALESCE(code_used, FALSE) = TRUE
    ),
    'in_step_1', (
      SELECT COUNT(*) FROM public.waitlist
      WHERE code_reminder_step = 1 AND COALESCE(unsubscribed, FALSE) = FALSE
    ),
    'in_step_2', (
      SELECT COUNT(*) FROM public.waitlist
      WHERE code_reminder_step = 2 AND COALESCE(unsubscribed, FALSE) = FALSE
    ),
    'in_step_3', (
      SELECT COUNT(*) FROM public.waitlist
      WHERE code_reminder_step = 3 AND COALESCE(unsubscribed, FALSE) = FALSE
    ),
    'completed', (
      SELECT COUNT(*) FROM public.waitlist
      WHERE code_reminder_step = 4
    ),
    'unsubscribed', (
      SELECT COUNT(*) FROM public.waitlist
      WHERE COALESCE(unsubscribed, FALSE) = TRUE
    )
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.code_reminder_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.code_reminder_stats() TO anon;

-- =====================================================
-- 7. Plantillas de email
-- =====================================================
-- Tono: cálido y de regalo, sin urgencia agresiva. Reconoce que
-- la vida pesa y recuerda que el mes premium gratis sigue ahí.
-- Placeholders: {{name}}, {{code}}, {{app_url}}, {{unsubscribe_url}}

-- Borramos cualquier versión previa (incl. inserciones parciales) y
-- reinsertamos en limpio. SIN ON CONFLICT, para no depender de que exista
-- la restricción única en template_key (que era la causa del fallo).
DELETE FROM email_templates
WHERE template_key IN ('code_reminder_1', 'code_reminder_2', 'code_reminder_3');

INSERT INTO email_templates (template_key, name, description, email_type, sequence_step, subject, preview_text, html_content)
VALUES

-- ─────────────────────────────────────────────────────
-- CODE REMINDER #1 — Día 3: "Tu regalo sigue sin abrir"
-- ─────────────────────────────────────────────────────
('code_reminder_1',
 'Recordatorio código #1: Tu regalo sigue sin abrir',
 'Día 3 sin canjear. Recordatorio suave del mes premium gratis.',
 'sequence',
 NULL,
 '{{name}}, tu mes gratis sigue esperándote',
 'Apartaste tu código y aún no lo has usado. No caduca, pero sería una pena...',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">{{name}},</p>

            <p style="margin-bottom: 25px;">
                Hace unos días te uniste a Refugio y guardamos algo para ti: <strong>un mes entero de Premium, gratis</strong>. Todavía no lo has activado, y solo quería recordártelo sin agobiarte.
            </p>

            <p style="margin-bottom: 25px;">
                No caduca mañana. Pero sería una pena que se quedara olvidado en este correo cuando podría estar acompañándote cada día.
            </p>

            <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04); border-left: 3px solid #E1B955;">
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #8B7355; text-transform: uppercase; letter-spacing: 2px;">Tu código personal</p>
                <p style="margin: 0; font-size: 30px; font-weight: bold; color: #1F3A5F; letter-spacing: 3px;">{{code}}</p>
            </div>

            <p style="margin-bottom: 25px;">
                Con él tienes acceso completo: el Rosario guiado con audio, el Evangelio del día con su reflexión, la Lectio Divina y el Compañero de fe. Sin anuncios, sin límites.
            </p>

            <div style="text-align: center; margin: 45px 0 35px 0;">
                <a href="{{app_url}}/bienvenida?code={{code}}" style="display: inline-block; background-color: #1F3A5F; color: white; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-size: 17px; font-weight: bold;">
                    Activar mi mes gratis
                </a>
            </div>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Con cariño,<br>
                <span style="color: #8B7355;">— Aida y Bosco · Refugio en la Palabra</span>
            </p>
        </div>

        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Dejar de recibir estos recordatorios</a>
        </div>
    </div>
</body>
</html>'),

-- ─────────────────────────────────────────────────────
-- CODE REMINDER #2 — Día 10: "¿Te echo una mano?"
-- ─────────────────────────────────────────────────────
('code_reminder_2',
 'Recordatorio código #2: ¿Te echo una mano?',
 'Día 10 sin canjear. Resuelve la fricción y explica cómo activarlo.',
 'sequence',
 NULL,
 '¿Te ayudo a empezar, {{name}}?',
 'A veces lo que frena no son las ganas, sino no saber por dónde empezar...',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">{{name}},</p>

            <p style="margin-bottom: 25px;">
                Vuelvo a escribirte por tu mes gratis de Premium, que sigue sin activar. Y lo hago porque, muchas veces, lo que nos frena no son las ganas: es no saber por dónde empezar.
            </p>

            <p style="margin-bottom: 25px;">
                Así que aquí lo tienes, en tres pasos:
            </p>

            <div style="background-color: #F8F6F3; border-radius: 8px; padding: 25px; margin: 35px 0;">
                <p style="margin: 0 0 14px 0; font-size: 16px; color: #2D2A26;">
                    <span style="color: #E1B955; font-weight: bold;">1.</span>&nbsp; Abre la app desde el botón de abajo.
                </p>
                <p style="margin: 0 0 14px 0; font-size: 16px; color: #2D2A26;">
                    <span style="color: #E1B955; font-weight: bold;">2.</span>&nbsp; Introduce tu código <strong>{{code}}</strong> al registrarte (o desde tu perfil).
                </p>
                <p style="margin: 0; font-size: 16px; color: #2D2A26;">
                    <span style="color: #E1B955; font-weight: bold;">3.</span>&nbsp; Ya está. Un mes completo, sin pagar nada.
                </p>
            </div>

            <p style="margin-bottom: 25px;">
                Y si solo tienes cinco minutos al día, te diría que empieces por el Evangelio de la mañana. Es el hábito más pequeño que más cambia la jornada.
            </p>

            <div style="text-align: center; margin: 45px 0 35px 0;">
                <a href="{{app_url}}/bienvenida?code={{code}}" style="display: inline-block; background-color: #1F3A5F; color: white; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-size: 17px; font-weight: bold;">
                    Activar mi mes gratis
                </a>
            </div>

            <p style="margin-bottom: 25px;">
                ¿Te atascas en algo? Responde a este correo. Lo leemos nosotros, de verdad, y te ayudamos.
            </p>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Un abrazo,<br>
                <span style="color: #8B7355;">— Aida y Bosco · Refugio en la Palabra</span>
            </p>
        </div>

        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Dejar de recibir estos recordatorios</a>
        </div>
    </div>
</body>
</html>'),

-- ─────────────────────────────────────────────────────
-- CODE REMINDER #3 — Día 21: "Última llamada, sin presión"
-- ─────────────────────────────────────────────────────
('code_reminder_3',
 'Recordatorio código #3: Última llamada',
 'Día 21 sin canjear. Cierre amable: es el último recordatorio.',
 'sequence',
 NULL,
 'El último recordatorio, {{name}}',
 'No te escribiremos más sobre esto. Pero tu código seguirá ahí...',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">{{name}},</p>

            <p style="margin-bottom: 25px;">
                Este es el último correo que te enviaremos sobre tu mes gratis. No queremos ser pesados: si no es el momento, lo respetamos de corazón.
            </p>

            <p style="margin-bottom: 25px;">
                Pero quería que supieras que <strong>tu código no desaparece</strong>. Estará esperándote el día que sientas que necesitas un rato de silencio, una oración, o simplemente volver a empezar sin culpa.
            </p>

            <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04); border-left: 3px solid #E1B955;">
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #8B7355; text-transform: uppercase; letter-spacing: 2px;">Tu código, por si vuelves</p>
                <p style="margin: 0; font-size: 30px; font-weight: bold; color: #1F3A5F; letter-spacing: 3px;">{{code}}</p>
            </div>

            <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04);">
                <p style="margin: 0; font-style: italic; color: #5D574F; font-size: 18px;">
                    "Mira que estoy a la puerta y llamo; si alguno oye mi voz y abre, entraré."
                </p>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #A09A92;">— Apocalipsis 3,20</p>
            </div>

            <div style="text-align: center; margin: 45px 0 35px 0;">
                <a href="{{app_url}}/bienvenida?code={{code}}" style="display: inline-block; color: #1F3A5F; text-decoration: none; padding: 14px 32px; border: 1px solid #1F3A5F; border-radius: 8px; font-size: 16px;">
                    Activar mi mes gratis
                </a>
            </div>

            <p style="margin-bottom: 25px;">
                Pase lo que pase, gracias por haberte apuntado. Significa mucho para nosotros.
            </p>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Con cariño,<br>
                <span style="color: #8B7355;">— Aida y Bosco · Refugio en la Palabra</span>
            </p>

            <p style="margin-top: 30px; font-size: 15px; color: #8B7355; font-style: italic;">
                P.D. Si respondes a este correo, lo lee una persona de verdad. No un bot.
            </p>
        </div>

        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Dejar de recibir estos recordatorios</a>
        </div>
    </div>
</body>
</html>');

-- =====================================================
-- 8. RPC: suppress_email — baja automática por rebote/queja
-- =====================================================
-- Lo llama el webhook de Resend (/api/resend/webhook) cuando un correo
-- rebota (bounce) o el usuario lo marca como spam (complaint). Da de baja
-- en AMBAS campañas para proteger la reputación de envío.

CREATE OR REPLACE FUNCTION public.suppress_email(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Baja en la waitlist (campaña de recordatorio de código)
  UPDATE public.waitlist
  SET unsubscribed = TRUE,
      unsubscribed_at = COALESCE(unsubscribed_at, NOW())
  WHERE LOWER(email) = LOWER(TRIM(p_email));

  -- Baja en el win-back (usuarios de la app) si hay un auth user con ese email
  UPDATE public.profiles p
  SET winback_unsubscribed = TRUE,
      winback_unsubscribed_at = COALESCE(winback_unsubscribed_at, NOW())
  FROM auth.users u
  WHERE u.id = p.id AND LOWER(u.email) = LOWER(TRIM(p_email));
END;
$$;

REVOKE ALL ON FUNCTION public.suppress_email(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.suppress_email(TEXT) TO anon;

-- =====================================================
-- FIN
-- =====================================================
-- VERIFICACIÓN — pega esto en el SQL Editor para comprobar el estado:
--
-- 1) ¿Existen las columnas y cuántos tienen el código sin canjear?
--    SELECT
--      COUNT(*)                                          AS total,
--      COUNT(*) FILTER (WHERE code_used)                 AS canjeados,
--      COUNT(*) FILTER (WHERE NOT COALESCE(code_used,FALSE)) AS sin_canjear
--    FROM public.waitlist;
--
--    >>> Si "canjeados" es 0 y sabes que hay gente que SÍ ha usado el
--        código, significa que la app NO está marcando code_used. En ese
--        caso, integra el RPC mark_code_used en el flujo de canje de la app
--        ANTES de activar el cron, o estos recordatorios llegarán también
--        a quien ya lo usó.
--
-- 2) Plantillas creadas:
--    SELECT template_key, name FROM email_templates WHERE template_key LIKE 'code_reminder_%';
--
-- 3) Métricas:
--    SELECT public.code_reminder_stats();
--
-- 4) A quién se le enviaría ahora mismo (primeros 20):
--    SELECT email, name, code_reminder_step, created_at
--    FROM public.get_unredeemed_users(NULL) LIMIT 20;
