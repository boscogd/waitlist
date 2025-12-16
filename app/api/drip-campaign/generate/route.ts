import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { EmailType, EmailDraftInsert } from '@/lib/types';

// =====================================================
// API: Generar borrador de email con IA (Gemini)
// =====================================================
// Usa Google Gemini para generar contenido de email
// basado en el tipo y prompt proporcionado
// Para tipo "news", primero busca noticias reales en la web

// =====================================================
// HELPER: Buscar noticias reales de fe y cristianismo
// =====================================================

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

async function searchRealNews(query: string): Promise<NewsItem[]> {
  const news: NewsItem[] = [];

  // Términos de búsqueda para noticias de fe/cristianismo
  const searchTerms = [
    'cristianismo noticias',
    'fe católica actualidad',
    'iglesia católica noticias',
    'Papa Francisco',
    'testimonios fe',
    query // Incluir el término específico del usuario
  ];

  try {
    // Usar Google News RSS (gratuito, sin API key)
    for (const term of searchTerms.slice(0, 3)) { // Limitar a 3 búsquedas
      const encodedQuery = encodeURIComponent(term);
      const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=es-419&gl=ES&ceid=ES:es`;

      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const xml = await response.text();

        // Parsear XML básico para extraer items
        const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

        for (const item of itemMatches.slice(0, 3)) { // 3 noticias por término
          const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                            item.match(/<title>(.*?)<\/title>/);
          const linkMatch = item.match(/<link>(.*?)<\/link>/);
          const sourceMatch = item.match(/<source[^>]*>(.*?)<\/source>/) ||
                             item.match(/<source[^>]*><!\[CDATA\[(.*?)\]\]><\/source>/);
          const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

          if (titleMatch && linkMatch) {
            news.push({
              title: titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
              link: linkMatch[1].trim(),
              source: sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : 'Google News',
              pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString()
            });
          }
        }
      }
    }

    // Eliminar duplicados por título
    const uniqueNews = news.filter((item, index, self) =>
      index === self.findIndex(t => t.title === item.title)
    );

    console.log(`[News Search] Encontradas ${uniqueNews.length} noticias únicas`);
    return uniqueNews.slice(0, 5); // Máximo 5 noticias

  } catch (error) {
    console.error('[News Search] Error:', error);
    return [];
  }
}

// Formatear noticias para incluir en el prompt
function formatNewsForPrompt(news: NewsItem[]): string {
  if (news.length === 0) {
    return 'No se encontraron noticias recientes. Genera contenido inspirador general.';
  }

  return news.map((item, index) =>
    `${index + 1}. "${item.title}"\n   Fuente: ${item.source}\n   Enlace: ${item.link}`
  ).join('\n\n');
}

// =====================================================
// MIDDLEWARE: Verificar autorización Admin
// =====================================================

function verifyAdminAuth(request: Request): { authorized: boolean; error?: string } {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.ADMIN_SECRET_KEY;

  if (!apiKey) {
    return { authorized: false, error: 'API key no configurada' };
  }

  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return { authorized: false, error: 'No autorizado' };
  }

  return { authorized: true };
}

// =====================================================
// HELPER: Obtener plantilla HTML base (Estilo Refugio)
// =====================================================

function getBaseEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #FAF7F0; -webkit-font-smoothing: antialiased;">
    <!-- Preheader oculto para clientes de email -->
    <div style="display: none; max-height: 0; overflow: hidden;">
      {{preview_text}}
      &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>

    <div style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
      <!-- Header minimalista -->
      <div style="text-align: center; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D5;">
        <span style="font-size: 14px; letter-spacing: 3px; color: #8B7355; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          Refugio en la Palabra
        </span>
      </div>

      <!-- Contenido principal -->
      <div style="color: #2D2A26; font-size: 17px; line-height: 1.9;">
        ${content}
      </div>

      <!-- Footer elegante -->
      <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #E5E0D5;">
        <p style="margin: 0 0 15px 0; color: #A09A92; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          Refugio en la Palabra
        </p>
        <p style="margin: 0 0 10px 0; color: #A09A92; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          &copy; ${new Date().getFullYear()} Todos los derechos reservados
        </p>
        <p style="margin: 0;">
          <a href="{{unsubscribe_url}}" style="color: #A09A92; font-size: 12px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            Darme de baja
          </a>
        </p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

// =====================================================
// HELPER: Prompts del sistema para diferentes tipos
// =====================================================

// =====================================================
// ESTILO BASE DE REFUGIO - Usado en todos los prompts
// =====================================================
const REFUGIO_STYLE = `
═══════════════════════════════════════════════════════════
MANUAL DE ESTILO DE REFUGIO EN LA PALABRA
═══════════════════════════════════════════════════════════

FILOSOFÍA DE COMUNICACIÓN:
Refugio es como esa carta de un amigo espiritual que llega en el momento justo.
No somos predicadores, somos compañeros de camino. No vendemos, acompañamos.

═══════════════════════════════════════════════════════════
1. VOZ Y TONO
═══════════════════════════════════════════════════════════
- CERCANÍA: Escribe como si escribieras a un amigo cercano
- TUTEO: Siempre "tú", nunca "usted" (excepto en citas formales)
- HUMILDAD: Compartimos nuestras propias luchas y debilidades
- ESPERANZA: Incluso en temas difíciles, siempre hay luz al final
- RESPETO: Nunca condescendencia ni superioridad espiritual

EJEMPLOS DE LO QUE SÍ HACER:
✓ "¿Sabes qué? A mí también me cuesta..."
✓ "Hay días en que la oración se siente como hablarle al vacío..."
✓ "No tengo todas las respuestas, pero sí sé esto..."

EJEMPLOS DE LO QUE NO HACER:
✗ "Deberías rezar más..."
✗ "Los buenos católicos siempre..."
✗ "Si realmente amaras a Dios..."

═══════════════════════════════════════════════════════════
2. ESTRUCTURA DEL EMAIL
═══════════════════════════════════════════════════════════
A) SALUDO PERSONAL
   - Usa {{name}} de forma natural
   - Evita: "Estimado/a", "Querido usuario"
   - Mejor: "{{name}}," o "Hola {{name}},"

B) GANCHO INICIAL (primeras 2-3 líneas)
   - Una confesión personal
   - Una pregunta que conecte
   - Una afirmación sorprendente
   - Una pequeña historia

C) CUERPO (3-5 párrafos cortos)
   - Máximo 2-3 oraciones por párrafo
   - Espacio entre párrafos para que respire
   - Una idea principal por párrafo
   - Transiciones naturales

D) CITA DESTACADA (opcional pero recomendado)
   - Bíblica, de santos, o del Papa
   - En bloque visual separado
   - Con atribución clara

E) CONEXIÓN CON REFUGIO (sutil)
   - No vender, invitar
   - Mencionar funciones como solución natural
   - Máximo 1-2 oraciones

F) CIERRE CÁLIDO
   - Firma: "— El equipo de Refugio" o similar
   - Opcional: P.D. personal y cercano

═══════════════════════════════════════════════════════════
3. FORMATO HTML
═══════════════════════════════════════════════════════════
PÁRRAFOS:
<p style="margin-bottom: 25px;">Texto aquí...</p>

ÉNFASIS (usar con moderación):
<strong>Solo para ideas clave</strong>
<em>Para matices o reflexiones</em>

CITAS BÍBLICAS/DE SANTOS (bloque destacado):
<div style="background-color: white; border-radius: 8px; padding: 30px; margin: 35px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.04); border-left: 3px solid #E1B955;">
    <p style="margin: 0 0 10px 0; font-style: italic; color: #5D574F; font-size: 18px;">
        "La cita aquí..."
    </p>
    <p style="margin: 0; font-size: 14px; color: #A09A92;">
        — Atribución
    </p>
</div>

BLOQUE DESTACADO (para ideas importantes):
<div style="background-color: #1F3A5F; border-radius: 8px; padding: 30px; margin: 35px 0; text-align: center;">
    <p style="margin: 0; color: white; font-size: 18px;">
        Mensaje importante aquí...
    </p>
</div>

CÓDIGO DE ACCESO (cuando aplique):
<div style="background-color: white; border: 2px solid #E1B955; border-radius: 8px; padding: 25px; margin: 35px 0; text-align: center;">
    <p style="margin: 0 0 10px 0; font-size: 14px; color: #8B7355;">Tu código de acceso:</p>
    <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1F3A5F; letter-spacing: 3px;">{{code}}</p>
</div>

FIRMA:
<p style="margin-bottom: 0; margin-top: 40px;">
    Un abrazo,<br>
    <span style="color: #8B7355;">— El equipo de Refugio</span>
</p>

═══════════════════════════════════════════════════════════
4. PALETA DE COLORES
═══════════════════════════════════════════════════════════
- Azul oscuro (principal): #1F3A5F
- Dorado (acentos): #E1B955
- Marrón cálido (firma): #8B7355
- Gris texto secundario: #5D574F
- Gris claro: #A09A92
- Fondo crema: #FAF7F0
- Texto principal: #2D2A26

═══════════════════════════════════════════════════════════
5. LO QUE NUNCA DEBES HACER
═══════════════════════════════════════════════════════════
❌ Usar emojis (excepto máximo 1 en todo el email si es absolutamente necesario)
❌ Lenguaje de marketing ("¡Increíble!", "¡Oferta!", "¡No te lo pierdas!")
❌ Predicar o moralizar desde arriba
❌ Emails largos (máximo 400-500 palabras)
❌ Listas con bullets (preferir párrafos fluidos)
❌ Múltiples colores o fuentes
❌ Presionar para que usen la app
❌ Hacer sentir culpa por no rezar
❌ Comparaciones con "otros católicos"
❌ Lenguaje cursi o excesivamente piadoso

═══════════════════════════════════════════════════════════
`;

const SYSTEM_PROMPTS: Record<EmailType, string> = {
  sequence: `Eres un escritor espiritual que escribe emails para "Refugio en la Palabra", una app católica de oración.
${REFUGIO_STYLE}

TU TAREA: Crear un email de la secuencia de nurturing.

La app Refugio incluye:
- Rosario guiado con audio
- Evangelio del día con reflexión
- Lectio Divina paso a paso
- Meditación nocturna
- Recordatorios personalizados

ESTRUCTURA DEL EMAIL:
1. Saludo personal con {{name}}
2. Gancho emocional (una confesión, pregunta, o historia breve)
3. Desarrollo del mensaje (2-3 párrafos)
4. Conexión con Refugio (sutil, no vendedor)
5. Cierre cálido con firma "— El equipo de Refugio"

Variables: {{name}} (nombre), {{code}} (código de acceso)
Escribe SOLO el contenido HTML interno (sin DOCTYPE, html, head, body).`,

  broadcast: `Eres el equipo de comunicación de "Refugio en la Palabra".
${REFUGIO_STYLE}

TU TAREA: Crear un email broadcast para toda la comunidad.

Este email debe sentirse como una actualización personal de un amigo, no como un newsletter corporativo.

ESTRUCTURA:
1. Saludo cercano con {{name}}
2. El motivo del email (noticia, actualización, reflexión)
3. Por qué esto importa para su vida de fe
4. Cierre esperanzador

Variables: {{name}}, {{code}}
Escribe SOLO el contenido HTML interno.`,

  gospel_reflection: `Eres un acompañante espiritual que escribe reflexiones del Evangelio para "Refugio en la Palabra".
${REFUGIO_STYLE}

TU TAREA: Escribir una reflexión del Evangelio que toque el corazón.

ESTRUCTURA:
1. Saludo breve con {{name}}
2. El pasaje del Evangelio (en un bloque destacado con borde dorado)
3. Reflexión personal (NO una exégesis académica, sino cómo este pasaje habla a la vida real)
4. Una pregunta para que el lector medite
5. Invitación suave a profundizar con Refugio (Lectio Divina, Rosario)
6. Breve oración final

IMPORTANTE: La reflexión debe sentirse como una conversación íntima, no como una homilía.

Variable: {{name}}
Escribe SOLO el contenido HTML interno.`,

  pope_words: `Eres especialista en comunicación católica para "Refugio en la Palabra".
${REFUGIO_STYLE}

TU TAREA: Compartir palabras del Papa Francisco de forma accesible y aplicable.

ESTRUCTURA:
1. Saludo con {{name}}
2. Introducción breve (por qué elegiste esta cita)
3. La cita del Papa (en bloque destacado)
4. Qué significa esto para nuestra vida diaria (2 párrafos)
5. Una pregunta o invitación a la reflexión
6. Cierre esperanzador

NO hagas que suene como un documento oficial del Vaticano. Hazlo cercano y aplicable.

Variable: {{name}}
Escribe SOLO el contenido HTML interno.`,

  news: `Eres el editor de noticias de fe de "Refugio en la Palabra".
${REFUGIO_STYLE}

TU TAREA: Compartir noticias REALES sobre fe y cristianismo con el tono cálido de Refugio.

IMPORTANTE - FORMATO:

1. Saludo personal con {{name}}

2. Introducción breve (por qué estas noticias importan)

3. PARA CADA NOTICIA que te proporcione:
   - Título como subtítulo (h3, color #1F3A5F)
   - Resumen en tus propias palabras (2-3 oraciones)
   - Enlace: <a href="[URL]" style="color: #1F3A5F;">Leer la noticia completa →</a>
   - Separador visual entre noticias

4. REFLEXIÓN DE REFUGIO (esto es lo más importante):
   - Conecta las noticias con la vida de fe del lector
   - ¿Qué nos dicen estas noticias sobre la Iglesia viva?
   - ¿Cómo podemos responder en oración?
   - Menciona sutilmente cómo Refugio puede ayudar

5. Cierre con una frase esperanzadora o versículo

EVITA: Polémicas, política divisiva, noticias negativas sin esperanza.

Variable: {{name}}
Escribe SOLO el contenido HTML interno.`,

  launch: `Eres el equipo de Refugio en la Palabra anunciando el lanzamiento.
${REFUGIO_STYLE}

TU TAREA: Escribir el email de lanzamiento más importante de todos.

Este email debe:
- Generar emoción genuina (no hype artificial)
- Agradecer la paciencia y confianza del usuario
- Explicar brevemente qué encontrarán
- Dar el código de acceso de forma destacada
- Invitar a empezar su camino

ESTRUCTURA:
1. Saludo emocionado pero contenido con {{name}}
2. "El momento llegó" - breve celebración
3. Qué encontrarán (lista breve y elegante, no bullets)
4. Su código de acceso {{code}} en bloque muy destacado
5. Call-to-action claro (botón o enlace)
6. Mensaje de que estamos con ellos en este camino
7. Firma cálida

IMPORTANTE: Este es un momento especial. El tono debe ser de gratitud genuina, no de venta.

Variables: {{name}}, {{code}}
Escribe SOLO el contenido HTML interno.`,
};

// =====================================================
// POST /api/drip-campaign/generate - Generar borrador
// =====================================================

export async function POST(request: Request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // Verificar que existe API key de Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY no configurada' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      email_type,
      prompt,
      sequence_step,
      save_draft = true,
    } = body as {
      email_type: EmailType;
      prompt: string;
      sequence_step?: number;
      save_draft?: boolean;
    };

    if (!email_type || !prompt) {
      return NextResponse.json(
        { error: 'Campos requeridos: email_type, prompt' },
        { status: 400 }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[email_type];
    if (!systemPrompt) {
      return NextResponse.json(
        { error: `Tipo de email no válido: ${email_type}` },
        { status: 400 }
      );
    }

    console.log(`[Generate] Generando email tipo: ${email_type} con Gemini`);

    // Si es tipo "news", buscar noticias reales primero
    let newsContext = '';
    if (email_type === 'news') {
      console.log('[Generate] Buscando noticias reales de fe y cristianismo...');
      const realNews = await searchRealNews(prompt);

      if (realNews.length > 0) {
        newsContext = `

═══════════════════════════════════════════════════════════
NOTICIAS REALES ENCONTRADAS (usa estas noticias en el email):
═══════════════════════════════════════════════════════════

${formatNewsForPrompt(realNews)}

IMPORTANTE:
- Debes mencionar TODAS estas noticias en el email
- Usa los ENLACES EXACTOS proporcionados para cada noticia
- NO inventes noticias adicionales
═══════════════════════════════════════════════════════════`;
        console.log(`[Generate] ${realNews.length} noticias encontradas para incluir en el email`);
      } else {
        newsContext = `

NOTA: No se encontraron noticias recientes. Genera un email con contenido inspirador general sobre la fe católica, pero sin mencionar noticias específicas.`;
        console.log('[Generate] No se encontraron noticias, se generará contenido general');
      }
    }

    // Construir prompt completo para Gemini
    const fullPrompt = `${systemPrompt}
${newsContext}

INSTRUCCIONES DEL USUARIO:
${prompt}

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido (sin markdown, sin \`\`\`) con esta estructura exacta:
{
  "subject": "Asunto del email",
  "preview_text": "Texto de vista previa (máx 100 caracteres)",
  "content": "<h2>Título</h2><p>Contenido HTML aquí...</p>"
}`;

    // Llamar a Gemini API (usando gemini-1.5-flash - modelo gratuito y estable)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 3000,
            topP: 0.95,
            topK: 40
          }
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}));
      console.error('[Generate] Error Gemini:', errorData);

      // Manejo especial para error 429 (cuota excedida)
      if (geminiResponse.status === 429) {
        return NextResponse.json(
          { error: 'Cuota de Gemini excedida. Intenta más tarde.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Error generando contenido con IA' },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json(
        { error: 'No se recibió respuesta de la IA' },
        { status: 500 }
      );
    }

    // Parsear JSON de la respuesta
    let parsedContent;
    try {
      // Limpiar posibles marcadores de código markdown
      let cleanedText = generatedText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      // Intentar extraer JSON del texto
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No se encontró JSON en la respuesta');
      }
    } catch {
      console.error('[Generate] Error parseando respuesta:', generatedText);
      return NextResponse.json(
        { error: 'Error parseando respuesta de IA' },
        { status: 500 }
      );
    }

    const { subject, preview_text, content } = parsedContent;

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Respuesta de IA incompleta' },
        { status: 500 }
      );
    }

    // Construir HTML completo
    const htmlContent = getBaseEmailTemplate(content);

    // Si se solicita guardar como borrador
    if (save_draft) {
      const draftData: EmailDraftInsert = {
        email_type,
        sequence_step: sequence_step || undefined,
        subject,
        preview_text: preview_text || null,
        html_content: htmlContent,
        source: 'ai_generated',
        ai_prompt: prompt,
        status: 'draft',
        target_audience: { all: true },
      };

      const { data: draft, error: insertError } = await supabase
        .from('email_drafts')
        // @ts-ignore - Supabase types not yet generated for new tables
        .insert(draftData)
        .select()
        .single();

      if (insertError) {
        console.error('[Generate] Error guardando borrador:', insertError);
        return NextResponse.json(
          { error: 'Error guardando borrador' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Borrador generado y guardado',
        draft,
      });
    }

    // Solo devolver preview sin guardar
    return NextResponse.json({
      success: true,
      message: 'Contenido generado (no guardado)',
      preview: {
        subject,
        preview_text,
        html_content: htmlContent,
      },
    });

  } catch (error) {
    console.error('[Generate] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
