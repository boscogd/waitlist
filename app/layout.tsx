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
  metadataBase: new URL("https://refugioenlapalabra.vercel.app"),
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
    url: "https://refugioenlapalabra.vercel.app",
    siteName: "Refugio en la Palabra",
    title: "Refugio en la Palabra | App Católica de Oración",
    description:
      "Tu espacio diario para orar, comprender y avanzar con sentido. Rosario guiado, Evangelio comentado y compañero de fe disponible 24/7.",
    images: [
      {
        url: "/logo-512-1.png",
        width: 512,
        height: 512,
        alt: "Refugio en la Palabra - App de Oración Católica",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Refugio en la Palabra | App Católica de Oración",
    description:
      "Tu espacio diario para orar, comprender y avanzar con sentido. Rosario guiado, Evangelio comentado y compañero de fe disponible 24/7.",
    images: ["/logo-512-1.png"],
    creator: "@refugioenlapalabra",
  },
  alternates: {
    canonical: "https://refugioenlapalabra.vercel.app",
  },
  category: "Religion & Spirituality",
  classification: "Catholic Prayer App",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
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
    "App católica con rosario guiado, evangelio diario y compañero de fe para resolver tus dudas.",
  author: {
    "@type": "Organization",
    name: "Refugio en la Palabra",
    url: "https://refugioenlapalabra.vercel.app",
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
