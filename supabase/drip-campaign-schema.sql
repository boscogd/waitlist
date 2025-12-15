-- =====================================================
-- DRIP CAMPAIGN SCHEMA
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Modificar tabla waitlist para tracking de secuencia
-- =====================================================
ALTER TABLE waitlist
ADD COLUMN IF NOT EXISTS email_sequence_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE;

-- Crear índice para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_waitlist_sequence_step ON waitlist(email_sequence_step);
CREATE INDEX IF NOT EXISTS idx_waitlist_last_email ON waitlist(last_email_sent_at);

-- 2. Tabla para borradores de email
-- =====================================================
CREATE TABLE IF NOT EXISTS email_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo de email
    email_type VARCHAR(50) NOT NULL, -- 'sequence', 'broadcast', 'gospel_reflection', 'pope_words', 'news'
    sequence_step INTEGER, -- NULL para broadcasts, número para secuencia

    -- Contenido
    subject VARCHAR(255) NOT NULL,
    preview_text VARCHAR(255), -- Texto de preview en inbox
    html_content TEXT NOT NULL,
    plain_text_content TEXT, -- Versión texto plano opcional

    -- Metadatos
    source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'ai_generated', 'template'
    ai_prompt TEXT, -- Prompt usado si fue generado con IA

    -- Estado
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'approved', 'scheduled', 'sent', 'cancelled'

    -- Programación
    scheduled_for TIMESTAMP WITH TIME ZONE,

    -- Destinatarios (filtro)
    target_audience JSONB DEFAULT '{"all": true}'::jsonb,
    -- Ejemplos:
    -- {"all": true} - Todos
    -- {"sequence_step": 0} - Solo paso 0
    -- {"sequence_step_gte": 5} - Paso 5 o mayor (post-lanzamiento)
    -- {"registered_before": "2024-01-01"} - Registrados antes de fecha

    -- Estadísticas (se actualizan después del envío)
    recipients_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,

    -- Usuario que aprobó (opcional, para auditoría)
    approved_by VARCHAR(255)
);

-- Índices para email_drafts
CREATE INDEX IF NOT EXISTS idx_email_drafts_status ON email_drafts(status);
CREATE INDEX IF NOT EXISTS idx_email_drafts_type ON email_drafts(email_type);
CREATE INDEX IF NOT EXISTS idx_email_drafts_scheduled ON email_drafts(scheduled_for) WHERE status = 'scheduled';

-- 3. Tabla para plantillas pre-definidas
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificador único para referencia en código
    template_key VARCHAR(100) UNIQUE NOT NULL,

    -- Metadatos
    name VARCHAR(255) NOT NULL,
    description TEXT,
    email_type VARCHAR(50) NOT NULL,
    sequence_step INTEGER, -- Para templates de secuencia

    -- Contenido (con placeholders como {{name}}, {{code}})
    subject VARCHAR(255) NOT NULL,
    preview_text VARCHAR(255),
    html_content TEXT NOT NULL,

    -- Control
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla para log de emails enviados
-- =====================================================
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Referencias
    draft_id UUID REFERENCES email_drafts(id),
    waitlist_id UUID REFERENCES waitlist(id),

    -- Datos del envío
    email_to VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,

    -- Estado
    status VARCHAR(20) NOT NULL, -- 'sent', 'failed', 'bounced'
    error_message TEXT,

    -- IDs externos
    resend_id VARCHAR(255), -- ID de Resend para tracking

    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_draft ON email_logs(draft_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_waitlist ON email_logs(waitlist_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- 5. Función para actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_email_drafts_updated_at ON email_drafts;
CREATE TRIGGER update_email_drafts_updated_at
    BEFORE UPDATE ON email_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Insertar plantillas pre-definidas de la secuencia
-- =====================================================
-- EMAILS COMPLETAMENTE REESCRITOS - Más emocionales, personales y efectivos
INSERT INTO email_templates (template_key, name, description, email_type, sequence_step, subject, preview_text, html_content)
VALUES
-- ═══════════════════════════════════════════════════════════════════
-- EMAIL #1: LA CONFESIÓN (2 días después)
-- Objetivo: Crear conexión emocional, mostrar vulnerabilidad, generar confianza
-- ═══════════════════════════════════════════════════════════════════
('sequence_1_constancia',
 'Secuencia #1: La confesión',
 'Email de conexión emocional. Compartimos nuestra propia lucha para crear empatía.',
 'sequence',
 1,
 'Te voy a confesar algo...',
 'Hay algo que nunca le cuento a nadie sobre mi vida de oración...',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header minimalista -->
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <!-- Contenido principal -->
        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">
                {{name}},
            </p>

            <p style="margin-bottom: 25px;">
                Te voy a confesar algo que me da un poco de vergüenza admitir.
            </p>

            <p style="margin-bottom: 25px;">
                Durante años, mi vida de oración fue... <em>inconsistente</em>. Y eso es decirlo de forma elegante.
            </p>

            <p style="margin-bottom: 25px;">
                La verdad es que había semanas enteras donde no rezaba. Donde me acostaba pensando <em>"mañana sí"</em>, y mañana se convertía en la próxima semana, y la próxima semana en el próximo mes.
            </p>

            <p style="margin-bottom: 25px;">
                Y lo peor no era la inconsistencia en sí.
            </p>

            <p style="margin-bottom: 25px;">
                <strong>Lo peor era la culpa.</strong>
            </p>

            <p style="margin-bottom: 25px;">
                Esa vocecita que te dice que no eres suficientemente bueno. Que si de verdad amaras a Dios, encontrarías el tiempo. Que otros lo logran, ¿por qué tú no?
            </p>

            <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04);">
                <p style="margin: 0; font-style: italic; color: #5D574F;">
                    ¿Te suena familiar?
                </p>
            </div>

            <p style="margin-bottom: 25px;">
                Si es así, quiero que sepas algo importante:
            </p>

            <p style="margin-bottom: 25px;">
                <strong>No estás solo. Y no es tu culpa.</strong>
            </p>

            <p style="margin-bottom: 25px;">
                Vivimos en un mundo diseñado para distraernos. Para robarnos la atención. Para hacernos sentir que siempre hay algo más urgente que detenernos a estar con Dios.
            </p>

            <p style="margin-bottom: 25px;">
                Por eso estamos creando Refugio.
            </p>

            <p style="margin-bottom: 25px;">
                No como otra app más de oraciones que termina olvidada en tu teléfono. Sino como un <strong>verdadero compañero</strong> que te ayuda a volver, una y otra vez, sin juicio.
            </p>

            <p style="margin-bottom: 25px;">
                En los próximos días te contaré más sobre cómo funciona.
            </p>

            <p style="margin-bottom: 25px;">
                Pero por ahora, solo quería que supieras esto: si luchas con la constancia en la oración, <strong>eres exactamente la persona para quien estamos construyendo esto</strong>.
            </p>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Un abrazo,<br>
                <span style="color: #8B7355;">— El equipo de Refugio</span>
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Darme de baja</a>
        </div>
    </div>
</body>
</html>'),

-- ═══════════════════════════════════════════════════════════════════
-- EMAIL #2: LA HISTORIA DE MARÍA (5 días después)
-- Objetivo: Mostrar transformación posible a través de una historia
-- ═══════════════════════════════════════════════════════════════════
('sequence_2_comunidad',
 'Secuencia #2: La historia de María',
 'Email con storytelling. Historia de transformación que inspira.',
 'sequence',
 2,
 'La mujer que rezaba en el metro',
 'Me escribió hace unas semanas y su mensaje me dejó sin palabras...',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header minimalista -->
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <!-- Contenido principal -->
        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">
                {{name}},
            </p>

            <p style="margin-bottom: 25px;">
                Hace unas semanas recibí un mensaje que me dejó pensando durante días.
            </p>

            <p style="margin-bottom: 25px;">
                Era de María, una enfermera de Barcelona. Me escribió para contarme cómo empezó a rezar.
            </p>

            <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04); border-left: 3px solid #E1B955;">
                <p style="margin: 0 0 20px 0; font-style: italic; color: #5D574F;">
                    "Trabajo turnos de 12 horas. Cuando llego a casa, lo único que quiero es dormir. Durante años me dije que no tenía tiempo para rezar.
                </p>
                <p style="margin: 0 0 20px 0; font-style: italic; color: #5D574F;">
                    Un día, en el metro camino al hospital, una señora mayor estaba rezando el rosario en voz baja. La observé durante todo el trayecto.
                </p>
                <p style="margin: 0; font-style: italic; color: #5D574F;">
                    Y pensé: si ella puede encontrar 15 minutos en un vagón lleno de gente... ¿cuál es mi excusa?"
                </p>
            </div>

            <p style="margin-bottom: 25px;">
                María empezó a rezar en el metro. Todos los días, 15 minutos de ida, 15 de vuelta.
            </p>

            <p style="margin-bottom: 25px;">
                <strong>30 minutos diarios que transformaron su vida.</strong>
            </p>

            <p style="margin-bottom: 25px;">
                Me contó que ahora, incluso en los turnos más duros, tiene una paz que antes no conocía. Que cuando pierde a un paciente (porque en su trabajo pasa), tiene a dónde ir. Tiene un refugio.
            </p>

            <p style="margin-bottom: 35px;">
                La historia de María me enseñó algo importante:
            </p>

            <div style="background-color: #1F3A5F; border-radius: 8px; padding: 30px; margin: 35px 0; text-align: center;">
                <p style="margin: 0; color: white; font-size: 18px; font-style: italic;">
                    No se trata de tener tiempo.<br>Se trata de <strong>crear</strong> el espacio.
                </p>
            </div>

            <p style="margin-bottom: 25px;">
                Eso es lo que queremos ayudarte a hacer con Refugio.
            </p>

            <p style="margin-bottom: 25px;">
                No necesitas una hora de silencio perfecto. No necesitas estar en una capilla. Necesitas <strong>un sistema que te encuentre donde estás</strong> y te ayude a crear ese espacio sagrado, aunque sea en un vagón de metro.
            </p>

            <p style="margin-bottom: 25px;">
                ¿Cuál es tu "metro"? ¿Ese momento del día que podrías transformar?
            </p>

            <p style="margin-bottom: 25px;">
                Piénsalo. Te escribo pronto.
            </p>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Con cariño,<br>
                <span style="color: #8B7355;">— El equipo de Refugio</span>
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Darme de baja</a>
        </div>
    </div>
</body>
</html>'),

-- ═══════════════════════════════════════════════════════════════════
-- EMAIL #3: EL DESCUBRIMIENTO (10 días después)
-- Objetivo: Revelar el "secreto" - mostrar valor concreto
-- ═══════════════════════════════════════════════════════════════════
('sequence_3_recordatorios',
 'Secuencia #3: El descubrimiento',
 'Email de revelación. Muestra cómo funciona el sistema.',
 'sequence',
 3,
 'El truco que usaba Santa Teresa (y que cambió todo para mí)',
 'No es fuerza de voluntad. Es algo mucho más simple...',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header minimalista -->
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <!-- Contenido principal -->
        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">
                {{name}},
            </p>

            <p style="margin-bottom: 25px;">
                Hoy quiero contarte algo que descubrí leyendo sobre los santos.
            </p>

            <p style="margin-bottom: 25px;">
                Durante mucho tiempo pensé que su vida de oración era fruto de una <em>fuerza de voluntad sobrehumana</em>. Que ellos simplemente eran "mejores" que nosotros.
            </p>

            <p style="margin-bottom: 25px;">
                Pero no es así.
            </p>

            <p style="margin-bottom: 25px;">
                <strong>Los santos no dependían de la fuerza de voluntad. Dependían de los rituales.</strong>
            </p>

            <p style="margin-bottom: 25px;">
                Santa Teresa de Jesús tenía horarios fijos de oración tan sagrados que nada los interrumpía. San Ignacio de Loyola diseñó los Ejercicios Espirituales con una estructura precisa. San Josemaría asociaba cada momento del día con una oración específica.
            </p>

            <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04);">
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px;">El patrón común:</p>
                <p style="margin: 0; font-size: 19px; color: #1F3A5F;">
                    No esperaban "sentir ganas" de rezar.<br>
                    <strong>Creaban sistemas que hacían la oración inevitable.</strong>
                </p>
            </div>

            <p style="margin-bottom: 25px;">
                La ciencia moderna lo confirma: la fuerza de voluntad es un recurso limitado. Se agota. Por eso las personas más productivas del mundo no dependen de ella.
            </p>

            <p style="margin-bottom: 25px;">
                Dependen de <strong>hábitos y sistemas</strong>.
            </p>

            <p style="margin-bottom: 35px;">
                Esto es exactamente lo que estamos construyendo en Refugio:
            </p>

            <div style="background-color: #F8F6F3; border-radius: 8px; padding: 25px; margin: 35px 0;">
                <p style="margin: 0 0 15px 0; font-size: 15px; color: #2D2A26;">
                    <span style="color: #E1B955; font-size: 18px;">→</span> Recordatorios gentiles en los momentos que <em>tú</em> elijas
                </p>
                <p style="margin: 0 0 15px 0; font-size: 15px; color: #2D2A26;">
                    <span style="color: #E1B955; font-size: 18px;">→</span> Oraciones listas para el momento (no tienes que pensar qué rezar)
                </p>
                <p style="margin: 0 0 15px 0; font-size: 15px; color: #2D2A26;">
                    <span style="color: #E1B955; font-size: 18px;">→</span> Un sistema de rachas que celebra tu constancia
                </p>
                <p style="margin: 0; font-size: 15px; color: #2D2A26;">
                    <span style="color: #E1B955; font-size: 18px;">→</span> Flexibilidad para los días difíciles (porque todos los tenemos)
                </p>
            </div>

            <p style="margin-bottom: 25px;">
                La idea es simple: <strong>eliminamos la fricción</strong> entre tú y tu encuentro con Dios.
            </p>

            <p style="margin-bottom: 25px;">
                No necesitas superhéroes de la voluntad. Necesitas un buen sistema.
            </p>

            <p style="margin-bottom: 25px;">
                Pronto podrás probarlo.
            </p>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Hasta pronto,<br>
                <span style="color: #8B7355;">— El equipo de Refugio</span>
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Darme de baja</a>
        </div>
    </div>
</body>
</html>'),

-- ═══════════════════════════════════════════════════════════════════
-- EMAIL #4: EL ADELANTO EXCLUSIVO (15 días después)
-- Objetivo: Crear anticipación máxima, mostrar que es real
-- ═══════════════════════════════════════════════════════════════════
('sequence_4_anticipacion',
 'Secuencia #4: El adelanto exclusivo',
 'Email de anticipación. Preview exclusivo con screenshots/descripción detallada.',
 'sequence',
 4,
 '{{name}}, un adelanto solo para ti',
 'Nadie más ha visto esto todavía...',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header minimalista -->
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <!-- Contenido principal -->
        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">
                {{name}},
            </p>

            <p style="margin-bottom: 25px;">
                Hoy quiero mostrarte algo que nadie más ha visto todavía.
            </p>

            <p style="margin-bottom: 25px;">
                Llevamos meses trabajando en Refugio, y ya está casi listo. Y como parte de nuestra comunidad de espera, quiero darte un adelanto de lo que encontrarás cuando abras la app por primera vez.
            </p>

            <div style="background-color: #1F3A5F; border-radius: 12px; padding: 35px; margin: 40px 0; color: white;">
                <p style="margin: 0 0 25px 0; font-size: 13px; letter-spacing: 2px; opacity: 0.7; text-transform: uppercase;">Lo que encontrarás en Refugio:</p>

                <div style="margin-bottom: 25px;">
                    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">El Evangelio del día</p>
                    <p style="margin: 0; font-size: 15px; opacity: 0.9;">Cada mañana, el Evangelio con una reflexión breve y profunda. No para leer en 30 segundos, sino para llevar contigo todo el día.</p>
                </div>

                <div style="margin-bottom: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">Rosario guiado</p>
                    <p style="margin: 0; font-size: 15px; opacity: 0.9;">Con audio, para que no tengas que pensar en nada. Solo cerrar los ojos, escuchar, y dejarte llevar.</p>
                </div>

                <div style="margin-bottom: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">Lectio Divina</p>
                    <p style="margin: 0; font-size: 15px; opacity: 0.9;">El método de oración de los monjes, adaptado para tu día a día. 10 minutos que pueden cambiar tu perspectiva.</p>
                </div>

                <div style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">Meditación nocturna</p>
                    <p style="margin: 0; font-size: 15px; opacity: 0.9;">Para terminar el día en paz. Examen de conciencia suave, sin culpas. Solo gratitud y descanso.</p>
                </div>
            </div>

            <p style="margin-bottom: 25px;">
                Y esto es solo el comienzo.
            </p>

            <p style="margin-bottom: 25px;">
                Hay más que todavía no puedo contarte. Pero lo que sí puedo decirte es esto:
            </p>

            <p style="margin-bottom: 25px;">
                <strong>Esto no es una app. Es una invitación a encontrarte con Dios, todos los días, de una forma que funcione para ti.</strong>
            </p>

            <div style="background-color: white; border: 2px solid #E1B955; border-radius: 8px; padding: 25px; margin: 35px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #8B7355;">Tu código de acceso anticipado:</p>
                <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1F3A5F; letter-spacing: 3px;">{{code}}</p>
                <p style="margin: 15px 0 0 0; font-size: 13px; color: #A09A92;">Guárdalo. Lo necesitarás muy pronto.</p>
            </div>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Con ilusión,<br>
                <span style="color: #8B7355;">— El equipo de Refugio</span>
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Darme de baja</a>
        </div>
    </div>
</body>
</html>'),

-- ═══════════════════════════════════════════════════════════════════
-- EMAIL #5: LA CARTA PERSONAL (21 días después)
-- Objetivo: Crear conexión final, gratitud genuina, preparar para lanzamiento
-- ═══════════════════════════════════════════════════════════════════
('sequence_5_prelanzamiento',
 'Secuencia #5: La carta personal',
 'Email final antes del lanzamiento. Tono muy personal y de gratitud.',
 'sequence',
 5,
 'Gracias por esperar, {{name}}',
 'No es un email automático. Es una carta.',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header minimalista -->
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <!-- Contenido principal -->
        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">
                Querido/a {{name}},
            </p>

            <p style="margin-bottom: 25px;">
                Este no es un email automático.
            </p>

            <p style="margin-bottom: 25px;">
                Bueno, técnicamente sí lo es. Pero quiero que lo leas como lo que realmente es: una carta de agradecimiento.
            </p>

            <p style="margin-bottom: 25px;">
                Han pasado varias semanas desde que te uniste a nuestra lista de espera. En ese tiempo, he pensado mucho en las personas que están al otro lado de estos emails. Personas como tú, que en algún momento decidieron que querían profundizar su vida de oración.
            </p>

            <p style="margin-bottom: 25px;">
                <strong>Eso no es poca cosa.</strong>
            </p>

            <p style="margin-bottom: 25px;">
                En un mundo que nos empuja constantemente hacia afuera —más noticias, más notificaciones, más ruido— tú elegiste buscar un espacio hacia adentro. Hacia el silencio. Hacia Dios.
            </p>

            <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04); border-left: 3px solid #E1B955;">
                <p style="margin: 0; font-style: italic; color: #5D574F; font-size: 18px;">
                    "Señor, Tú me conoces: sabes si me siento o me levanto; de lejos percibes lo que pienso."
                </p>
                <p style="margin: 15px 0 0 0; font-size: 14px; color: #A09A92;">
                    — Salmo 139
                </p>
            </div>

            <p style="margin-bottom: 25px;">
                Él ya te conoce. Ya sabe lo que buscas. Y creo firmemente que te trajo hasta aquí por una razón.
            </p>

            <p style="margin-bottom: 25px;">
                Muy pronto —más pronto de lo que crees— recibirás un email diferente. Uno con un botón para acceder a Refugio.
            </p>

            <p style="margin-bottom: 25px;">
                Cuando ese momento llegue, quiero que recuerdes algo:
            </p>

            <p style="margin-bottom: 25px;">
                <strong>No tienes que ser perfecto. No tienes que rezar durante horas. Solo tienes que empezar.</strong>
            </p>

            <p style="margin-bottom: 25px;">
                Un Padrenuestro. Un misterio del Rosario. Tres minutos de silencio con el Evangelio del día.
            </p>

            <p style="margin-bottom: 25px;">
                Eso es suficiente. Eso es más que suficiente.
            </p>

            <div style="background-color: #1F3A5F; border-radius: 12px; padding: 30px; margin: 40px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.7); font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Tu código de acceso</p>
                <p style="margin: 0; color: #E1B955; font-size: 32px; font-weight: bold; letter-spacing: 4px;">{{code}}</p>
            </div>

            <p style="margin-bottom: 25px;">
                Gracias por esperarnos. Gracias por confiar en nosotros.
            </p>

            <p style="margin-bottom: 25px;">
                Nos vemos muy pronto, del otro lado.
            </p>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Con gratitud y esperanza,<br>
                <span style="color: #8B7355;">— El equipo de Refugio en la Palabra</span>
            </p>

            <p style="margin-top: 30px; font-size: 15px; color: #8B7355; font-style: italic;">
                P.D. Si en algún momento quieres responder a este email, hazlo. Lo leemos todo. De verdad.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Darme de baja</a>
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

-- ═══════════════════════════════════════════════════════════════════
-- EMAIL DE LANZAMIENTO - El más importante de todos
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO email_templates (template_key, name, description, email_type, sequence_step, subject, preview_text, html_content)
VALUES
('launch_email',
 'Email de Lanzamiento',
 'El email más importante: anuncia que Refugio está listo y da acceso a los usuarios de la waitlist.',
 'launch',
 NULL,
 '{{name}}, tu refugio está listo',
 'El momento que esperabas ha llegado. Abre esta puerta...',
 '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, ''Times New Roman'', serif; background-color: #FAF7F0;">
    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header minimalista -->
        <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
            <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase;">Refugio en la Palabra</span>
        </div>

        <!-- Contenido principal -->
        <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
            <p style="margin-bottom: 25px;">
                {{name}},
            </p>

            <p style="margin-bottom: 25px;">
                Hace semanas confiaste en nosotros.
            </p>

            <p style="margin-bottom: 25px;">
                Nos diste tu email sin saber exactamente qué estábamos construyendo. Sin garantías. Sin promesas más allá de una idea: crear un espacio donde tu vida de oración pudiera florecer.
            </p>

            <p style="margin-bottom: 25px;">
                Hoy vengo a decirte algo que llevamos tiempo queriendo escribir:
            </p>

            <div style="background-color: #1F3A5F; border-radius: 12px; padding: 35px; margin: 40px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: rgba(255,255,255,0.7); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                    Tu refugio
                </p>
                <p style="margin: 0; color: white; font-size: 26px; font-weight: bold;">
                    está listo
                </p>
            </div>

            <p style="margin-bottom: 25px;">
                No es una app perfecta. Ninguna lo es. Pero es una app hecha con amor, con fe, y con un solo objetivo: <strong>ayudarte a encontrarte con Dios, todos los días, de una forma que funcione para ti</strong>.
            </p>

            <p style="margin-bottom: 35px;">
                Esto es lo que encontrarás cuando entres:
            </p>

            <div style="background-color: white; border-radius: 12px; padding: 30px; margin: 35px 0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #E5E0D5;">
                    <p style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold; color: #1F3A5F;">El Evangelio del día</p>
                    <p style="margin: 0; font-size: 15px; color: #5D574F;">Con una reflexión que conecta la Palabra con tu vida real.</p>
                </div>
                <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #E5E0D5;">
                    <p style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold; color: #1F3A5F;">Rosario guiado con audio</p>
                    <p style="margin: 0; font-size: 15px; color: #5D574F;">Solo tienes que cerrar los ojos y dejarte llevar.</p>
                </div>
                <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #E5E0D5;">
                    <p style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold; color: #1F3A5F;">Lectio Divina</p>
                    <p style="margin: 0; font-size: 15px; color: #5D574F;">El método de oración de los monjes, adaptado para tu día a día.</p>
                </div>
                <div>
                    <p style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold; color: #1F3A5F;">Consultor espiritual IA</p>
                    <p style="margin: 0; font-size: 15px; color: #5D574F;">Respuestas a tus dudas de fe, basadas en el Catecismo y las Escrituras.</p>
                </div>
            </div>

            <p style="margin-bottom: 25px;">
                Y mucho más que irás descubriendo.
            </p>

            <p style="margin-bottom: 35px;">
                Este es tu código de acceso exclusivo:
            </p>

            <div style="background: linear-gradient(135deg, #1F3A5F 0%, #2A4A6F 100%); border-radius: 16px; padding: 40px; margin: 40px 0; text-align: center; box-shadow: 0 10px 40px rgba(31,58,95,0.3);">
                <p style="margin: 0 0 15px 0; color: rgba(255,255,255,0.8); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                    Tu código personal
                </p>
                <p style="margin: 0 0 20px 0; color: #E1B955; font-size: 36px; font-weight: bold; letter-spacing: 5px;">
                    {{code}}
                </p>
                <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 13px;">
                    Este código es único y te da acceso anticipado con beneficios exclusivos
                </p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="https://refugioenlapalabra.com/acceso" style="display: inline-block; background: linear-gradient(135deg, #E1B955 0%, #D4A84A 100%); color: #1F3A5F; text-decoration: none; padding: 18px 40px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(225,185,85,0.4);">
                    Entrar a Refugio →
                </a>
            </div>

            <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04); border-left: 3px solid #E1B955;">
                <p style="margin: 0 0 10px 0; font-style: italic; color: #5D574F; font-size: 18px;">
                    "Mira que estoy a la puerta y llamo; si alguno oye mi voz y abre la puerta, entraré a él..."
                </p>
                <p style="margin: 0; font-size: 14px; color: #A09A92;">
                    — Apocalipsis 3:20
                </p>
            </div>

            <p style="margin-bottom: 25px;">
                {{name}}, gracias por esperar. Gracias por confiar. Gracias por querer crecer en tu fe.
            </p>

            <p style="margin-bottom: 25px;">
                Ahora es tu turno. <strong>Abre la puerta.</strong>
            </p>

            <p style="margin-bottom: 0; margin-top: 40px;">
                Con profunda gratitud,<br>
                <span style="color: #8B7355;">— El equipo de Refugio en la Palabra</span>
            </p>

            <p style="margin-top: 30px; font-size: 15px; color: #8B7355; font-style: italic;">
                P.D. Si tienes cualquier problema para acceder, responde a este email. Lo leemos todo y te ayudaremos personalmente.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5; color: #A09A92; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">Refugio en la Palabra</p>
            <a href="{{unsubscribe_url}}" style="color: #A09A92;">Darme de baja</a>
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

-- 7. Vista útil para ver estado de la secuencia
-- =====================================================
CREATE OR REPLACE VIEW waitlist_sequence_stats AS
SELECT
    email_sequence_step,
    COUNT(*) as user_count,
    MIN(created_at) as oldest_user,
    MAX(created_at) as newest_user,
    COUNT(*) FILTER (WHERE unsubscribed = true) as unsubscribed_count
FROM waitlist
GROUP BY email_sequence_step
ORDER BY email_sequence_step;

-- 8. Configuración de secuencia (días de espera entre emails)
-- =====================================================
CREATE TABLE IF NOT EXISTS email_sequence_config (
    step INTEGER PRIMARY KEY,
    days_after_previous INTEGER NOT NULL,
    template_key VARCHAR(100) REFERENCES email_templates(template_key),
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT
);

INSERT INTO email_sequence_config (step, days_after_previous, template_key, description)
VALUES
    (1, 2, 'sequence_1_constancia', 'El poder de la constancia - 2 días después del registro'),
    (2, 3, 'sequence_2_comunidad', 'Comunidad que reza unida - 3 días después del email #1'),
    (3, 5, 'sequence_3_recordatorios', 'El secreto de los santos - 5 días después del email #2'),
    (4, 5, 'sequence_4_anticipacion', 'Algo especial viene - 5 días después del email #3'),
    (5, 6, 'sequence_5_prelanzamiento', 'Preparando tu refugio - 6 días después del email #4')
ON CONFLICT (step) DO UPDATE SET
    days_after_previous = EXCLUDED.days_after_previous,
    template_key = EXCLUDED.template_key,
    description = EXCLUDED.description;

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================

-- Para verificar que todo se creó correctamente:
-- SELECT * FROM email_templates;
-- SELECT * FROM email_sequence_config;
-- SELECT * FROM waitlist_sequence_stats;
