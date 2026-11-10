import type { Metadata, Viewport } from "next";
import { Lora, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SiteTracker from "./components/SiteTracker";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1F3A5F",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.refugioenlapalabra.com"),
  title: {
    default: "Refugio en la Palabra | App Católica de Oración y Crecimiento en la Fe",
    template: "%s | Refugio en la Palabra",
  },
  description:
    "Tu espacio diario para orar y crecer en la fe. Rosario guiado con audio, Evangelio del día comentado, sistema de logros y compañero de fe disponible 24/7. La app católica hecha por católicos, para católicos.",
  keywords: [
    "app católica",
    "rosario guiado",
    "rosario con audio",
    "evangelio del día",
    "oración diaria",
    "meditación católica",
    "lectio divina",
    "compañero de fe",
    "fe católica",
    "espiritualidad cristiana",
    "guía católico",
    "app de oración",
    "rezar rosario",
    "misterios del rosario",
    "reflexión espiritual",
    "católicos españoles",
    "vida espiritual",
    "oración guiada",
    "crecimiento espiritual",
    "app religiosa",
  ],
  authors: [{ name: "Refugio en la Palabra" }],
  creator: "Refugio en la Palabra",
  publisher: "Refugio en la Palabra",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://www.refugioenlapalabra.com",
    siteName: "Refugio en la Palabra",
    title: "Refugio en la Palabra | App Católica de Oración",
    description:
      "Tu espacio diario para orar, comprender y avanzar con sentido. Rosario guiado, Evangelio comentado y compañero de fe disponible 24/7.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Refugio en la Palabra - App Católica de Oración",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refugio en la Palabra | App Católica de Oración",
    description:
      "Tu espacio diario para orar, comprender y avanzar con sentido. Rosario guiado, Evangelio comentado y compañero de fe disponible 24/7.",
    images: ["/opengraph-image"],
    creator: "@refugioenlapalabra",
  },
  alternates: {
    canonical: "https://www.refugioenlapalabra.com",
  },
  manifest: "/manifest.json",
  category: "Religion & Spirituality",
  classification: "Catholic Prayer App",
};

// Schema.org JSON-LD para SEO.
// Hay otro proyecto con el mismo nombre (refugioenlapalabra.es, formación
// bíblica en vídeo). Estos datos le dicen a Google sin ambigüedad QUÉ es esta
// entidad: la app, quién la hace, y cuáles son sus perfiles oficiales. Los
// tres nodos se enlazan por @id para que cuenten como una sola entidad.
const SITE_URL = "https://www.refugioenlapalabra.com";
const PLAY_URL = "https://play.google.com/store/apps/details?id=com.refugioenlapalabra.app";
const ORG_ID = `${SITE_URL}/#organization`;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Refugio en la Palabra",
    alternateName: ["refugioenlapalabra", "Refugio en la Palabra App"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon-refugio-512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/aida-bosco.jpg`,
    description:
      "App católica de oración y crecimiento en la fe: Rosario guiado con audio, Evangelio del día comentado y compañero de fe disponible 24/7.",
    disambiguatingDescription:
      "La app católica de oración creada por Aida y Bosco en España, disponible en Google Play y en refugioenlapalabra.com.",
    email: "info@refugioenlapalabra.com",
    founder: [
      { "@type": "Person", name: "Aida" },
      { "@type": "Person", name: "Bosco" },
    ],
    foundingDate: "2025-10",
    areaServed: "ES",
    sameAs: ["https://www.instagram.com/refugioenlapalabra_", PLAY_URL],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Refugio en la Palabra",
    alternateName: ["refugioenlapalabra", "Refugio en la Palabra App"],
    url: SITE_URL,
    inLanguage: "es-ES",
    publisher: { "@id": ORG_ID },
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#app`,
    name: "Refugio en la Palabra",
    url: SITE_URL,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Android, iOS, Web",
    inLanguage: "es-ES",
    installUrl: PLAY_URL,
    downloadUrl: PLAY_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    description:
      "App católica con rosario guiado, evangelio diario y compañero de fe para resolver tus dudas.",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${lora.variable} ${inter.variable} antialiased`}>
        {/* Skip link (WCAG 2.4.1): visible solo al recibir foco con teclado */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-azul focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Saltar al contenido
        </a>
        {children}
        {/* Analítica propia (páginas vistas + eventos data-track) → /api/track → Supabase. */}
        <SiteTracker />
        {/* Analítica de Vercel: sin cookies, mismo dominio (no toca CSP ni RGPD). */}
        <Analytics />
      </body>
    </html>
  );
}
