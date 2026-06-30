import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { NEWS_QUERIES, NEWS_EDITIONS, buildGoogleNewsRssUrl } from '@/lib/news/sources';

// =====================================================
// ACTUALIDAD — refresco de "buenas noticias de la Iglesia"
// =====================================================
// Cron/manual. Lee RSS de Google News (varias búsquedas y ediciones del
// mundo hispano), pasa los titulares por Gemini para quedarse SOLO con las
// noticias buenas/esperanzadoras y escribir un resumen propio, y los guarda
// en `news_items` (vía RPC SECURITY DEFINER). Nunca guarda el texto del medio.

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_CANDIDATES = 30; // titulares que mandamos a la IA por ejecución

// Acceso laxo a tablas/RPC aún no presentes en los tipos generados de Supabase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// Cliente service-role SOLO para ESCRITURA. Esta clave se salta RLS de forma
// controlada y vive únicamente en el servidor (nunca es NEXT_PUBLIC_, nunca
// llega al navegador). Es la ÚNICA vía con permiso para escribir noticias.
function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });
}

interface Candidate {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

function verifyAuth(request: Request): { authorized: boolean; isCron: boolean; error?: string } {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return { authorized: true, isCron: true };
  }
  if (process.env.ADMIN_SECRET_KEY && authHeader === `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return { authorized: true, isCron: false };
  }
  return { authorized: false, isCron: false, error: 'No autorizado' };
}

// =====================================================
// 1. Recoger titulares candidatos de los RSS
// =====================================================

function parseRssItems(xml: string): Candidate[] {
  const items: Candidate[] = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

  for (const item of itemMatches) {
    const titleMatch =
      item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
    const linkMatch = item.match(/<link>(.*?)<\/link>/);
    const sourceMatch =
      item.match(/<source[^>]*><!\[CDATA\[(.*?)\]\]><\/source>/) ||
      item.match(/<source[^>]*>(.*?)<\/source>/);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

    if (titleMatch && linkMatch) {
      items.push({
        title: titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
        link: linkMatch[1].trim(),
        source: sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : 'Google News',
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
      });
    }
  }
  return items;
}

async function fetchCandidates(): Promise<Candidate[]> {
  const all: Candidate[] = [];

  for (const edition of NEWS_EDITIONS) {
    for (const query of NEWS_QUERIES) {
      try {
        const res = await fetch(buildGoogleNewsRssUrl(query, edition), {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });
        if (!res.ok) continue;
        const xml = await res.text();
        // 2 por (búsqueda × edición) para diversidad de fuentes/países
        all.push(...parseRssItems(xml).slice(0, 2));
      } catch (e) {
        console.error('[News] Error RSS:', query, edition.label, e);
      }
    }
  }

  // Dedupe por título normalizado
  const seen = new Set<string>();
  const unique = all.filter((c) => {
    const key = c.title.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`[News] ${all.length} titulares, ${unique.length} únicos`);
  return unique.slice(0, MAX_CANDIDATES);
}

// =====================================================
// 2. Curar con Gemini (filtrar buenas noticias + resumir)
// =====================================================

interface CuratedItem {
  i: number;
  titulo: string;
  resumen: string;
  pais: string;
}

async function curateWithGemini(candidates: Candidate[]): Promise<CuratedItem[]> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error('GEMINI_API_KEY no configurada');

  const listado = candidates
    .map((c, idx) => `${idx}. "${c.title}" — Fuente: ${c.source}`)
    .join('\n');

  const prompt = `Eres el editor de "Refugio en la Palabra", una app católica de oración con tono cálido y cercano (tuteo, sin sensacionalismo, sin emojis).

Te paso una lista de titulares de noticias. Tu tarea es seleccionar SOLO las que sean BUENAS NOTICIAS o de ESPERANZA relacionadas con la Iglesia católica o la fe cristiana: testimonios, obras sociales y caridad, conversiones, beatificaciones y santos, iniciativas de comunidad o parroquia, vocaciones y jóvenes, mensajes de aliento del Papa o de obispos, peregrinaciones, milagros.

DESCARTA por completo: escándalos, abusos, política divisiva, tragedias sin mensaje de esperanza, sucesos negativos, publicidad, y cualquier noticia que no sea religiosa/de fe. Descarta también duplicados o muy parecidos (quédate con uno solo).

Para CADA noticia seleccionada devuelve un objeto con:
- "i": el número (índice) del titular original
- "titulo": el titular limpio (quita el sufijo " - Medio" si lo lleva), en español, fiel al original y sin exagerar
- "resumen": 1 o 2 frases CON TUS PROPIAS PALABRAS, cálidas y cercanas, basadas SOLO en lo que dice el titular (NO inventes datos, cifras ni nombres que no aparezcan)
- "pais": el país de la noticia si lo deduces ("España", "México", "Argentina", "Colombia", "Vaticano"…) o "Internacional"

TITULARES:
${listado}

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin \`\`\`), con esta forma exacta:
{"items": [{"i": 0, "titulo": "...", "resumen": "...", "pais": "..."}]}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 4000, topP: 0.95, topK: 40 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini ${res.status}: ${JSON.stringify(err).slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini no devolvió contenido');

  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No se encontró JSON en la respuesta de Gemini');

  const parsed = JSON.parse(jsonMatch[0]) as { items?: CuratedItem[] };
  const items = Array.isArray(parsed.items) ? parsed.items : [];

  // Validar y quedarnos con los que apuntan a un candidato real
  return items.filter(
    (it) =>
      typeof it.i === 'number' &&
      it.i >= 0 &&
      it.i < candidates.length &&
      typeof it.titulo === 'string' &&
      it.titulo.trim().length > 0 &&
      typeof it.resumen === 'string' &&
      it.resumen.trim().length > 0
  );
}

// =====================================================
// 3. Orquestación
// =====================================================

async function runRefresh(dryRun = false) {
  const candidates = await fetchCandidates();
  if (candidates.length === 0) {
    return { fetched: 0, curated: 0, saved: 0, dryRun, preview: [] as CuratedItem[] };
  }

  const curated = await curateWithGemini(candidates);
  console.log(`[News] IA seleccionó ${curated.length}/${candidates.length} buenas noticias`);

  let saved = 0;
  if (!dryRun) {
    // Escritura SOLO con service-role (servidor). El cliente anon no puede
    // tocar la tabla (RLS), así que no hay vía pública para inyectar noticias.
    const admin = getAdminClient();
    for (const it of curated) {
      const c = candidates[it.i];
      let publishedIso: string;
      try {
        publishedIso = new Date(c.pubDate).toISOString();
      } catch {
        publishedIso = new Date().toISOString();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (admin as any).from('news_items').upsert(
        {
          title: it.titulo.trim(),
          summary: it.resumen.trim(),
          source_name: c.source,
          source_url: c.link,
          country: (it.pais || 'Internacional').trim(),
          published_at: publishedIso,
        },
        { onConflict: 'source_url' }
      );
      if (error) {
        console.error('[News] Error guardando:', error.message);
      } else {
        saved++;
      }
    }
  }

  return {
    fetched: candidates.length,
    curated: curated.length,
    saved,
    dryRun,
    preview: dryRun ? curated : undefined,
  };
}

// =====================================================
// GET — el cron ejecuta; en otro caso devuelve stats
// =====================================================

export async function GET(request: Request) {
  const auth = verifyAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.isCron) {
    try {
      const result = await runRefresh();
      return NextResponse.json({ success: true, result });
    } catch (error) {
      console.error('[News] Error refresco:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error refrescando noticias' },
        { status: 500 }
      );
    }
  }

  const { count } = await db
    .from('news_items')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true);
  return NextResponse.json({ success: true, stats: { published: count ?? 0 } });
}

// =====================================================
// POST — trigger manual (ADMIN_SECRET_KEY). Acepta { dryRun: true }
// =====================================================

export async function POST(request: Request) {
  const auth = verifyAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { dryRun?: boolean };

  try {
    const result = await runRefresh(body.dryRun === true);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[News] Error refresco:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error refrescando noticias' },
      { status: 500 }
    );
  }
}
