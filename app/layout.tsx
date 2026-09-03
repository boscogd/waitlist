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

// Schema.org JSON-LD para SEO
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Refugio en la Palabra",
    url: "https://www.refugioenlapalabra.com",
    logo: "https://www.refugioenlapalabra.com/logo-refugio.png",
    description:
      "App católica de oración y crecimiento en la fe: Rosario guiado con audio, Evangelio del día comentado y compañero de fe disponible 24/7.",
    email: "info@refugioenlapalabra.com",
    sameAs: ["https://www.instagram.com/refugioenlapalabra_"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Refugio en la Palabra",
    url: "https://www.refugioenlapalabra.com",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Refugio en la Palabra",
    url: "https://www.refugioenlapalabra.com",
    applicationCategory: "ReligionApplication",
    operatingSystem: "iOS, Android, Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    description:
      "App católica con rosario guiado, evangelio diario y compañero de fe para resolver tus dudas.",
    author: {
      "@type": "Organization",
      name: "Refugio en la Palabra",
      url: "https://www.refugioenlapalabra.com",
    },
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
