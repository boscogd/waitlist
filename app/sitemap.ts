import type { MetadataRoute } from "next";

const BASE_URL = "https://www.refugioenlapalabra.com";

// Fechas realistas de última modificación (no la fecha de build):
// las páginas legales no cambian desde su última revisión, y el contenido
// principal se actualizó por última vez en la fecha indicada.
const LEGAL_LAST_MODIFIED = new Date("2026-06-29");
const CONTENT_LAST_MODIFIED = new Date("2026-07-05");

export default function sitemap(): MetadataRoute.Sitemap {
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
      // Actualidad sí cambia con frecuencia (noticias curadas on-demand)
      url: `${BASE_URL}/actualidad`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
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
