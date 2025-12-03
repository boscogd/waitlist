import type { Metadata, Viewport } from "next";
import { Lora, Inter } from "next/font/google";
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
  metadataBase: new URL("https://refugioenlapalabra.com"),
  title: {
    default: "Refugio en la Palabra | App Católica de Oración y Acompañamiento Espiritual",
    template: "%s | Refugio en la Palabra",
  },
  description:
    "Tu espacio diario para orar y crecer en la fe. Rosario guiado con audio, Evangelio del día comentado, sistema de logros espirituales y consultor IA católico disponible 24/7. La app de acompañamiento espiritual hecha por católicos, para católicos.",
  keywords: [
    "app católica",
    "rosario guiado",
    "rosario con audio",
    "evangelio del día",
    "oración diaria",
    "meditación católica",
    "lectio divina",
    "acompañamiento espiritual",
    "fe católica",
    "espiritualidad cristiana",
    "consultor espiritual",
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
    url: "https://refugioenlapalabra.com",
    siteName: "Refugio en la Palabra",
    title: "Refugio en la Palabra | App Católica de Oración",
    description:
      "Tu espacio diario para orar, comprender y avanzar con sentido. Rosario guiado, Evangelio comentado y acompañamiento espiritual 24/7.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Refugio en la Palabra - App de Oración Católica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refugio en la Palabra | App Católica de Oración",
    description:
      "Tu espacio diario para orar, comprender y avanzar con sentido. Rosario guiado, Evangelio comentado y acompañamiento espiritual 24/7.",
    images: ["/og-image.png"],
    creator: "@refugioenlapalabra",
  },
  alternates: {
    canonical: "https://refugioenlapalabra.com",
  },
  category: "Religion & Spirituality",
  classification: "Catholic Prayer App",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-512-1.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/logo-512-1.png", sizes: "512x512", type: "image/png" }],
  },
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Refugio",
    "mobile-web-app-capable": "yes",
  },
};

// Schema.org JSON-LD para SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Refugio en la Palabra",
  applicationCategory: "ReligionApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  description:
    "App católica de acompañamiento espiritual con rosario guiado, evangelio diario y consultor IA.",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "500",
    bestRating: "5",
    worstRating: "1",
  },
  author: {
    "@type": "Organization",
    name: "Refugio en la Palabra",
    url: "https://refugioenlapalabra.com",
  },
};

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
        {children}
      </body>
    </html>
  );
}
