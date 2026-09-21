import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://www.refugioenlapalabra.com";

// Fechas realistas de última modificación (no la fecha de build):
// las páginas legales no cambian desde su última revisión, y el contenido
// principal se actualizó por última vez en la fecha indicada.
const LEGAL_LAST_MODIFIED = new Date("2026-06-29");
const CONTENT_LAST_MODIFIED = new Date("2026-07-05");

// El sitemap se regenera cada hora para que la fecha de /actualidad siga a
// la última tanda publicada sin necesidad de un deploy.
export const revalidate = 3600;

// Fecha real de la última tanda de /actualidad (created_at más reciente).
// Una fecha veraz vale más que "ahora": Google deja de fiarse de los
// lastmod que cambian en cada petición sin que cambie el contenido.
async function getActualidadLastModified(): Promise<Date> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("news_items")
      .select("created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(1);
    const iso = data?.[0]?.created_at;
    const date = iso ? new Date(iso) : null;
    if (date && !isNaN(date.getTime())) return date;
  } catch {
    // sin tabla o sin red en build: cae al respaldo
  }
  return CONTENT_LAST_MODIFIED;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const actualidadLastModified = await getActualidadLastModified();
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/descargar`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      // Actualidad se renueva cada lunes: fecha real de la última tanda
      url: `${BASE_URL}/actualidad`,
      lastModified: actualidadLastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/feedback`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacidad`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
