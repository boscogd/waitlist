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
    url: "https://refugioenlapalabra.com",
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
    card: "summary_large_image",
    title: "Refugio en la Palabra | App Católica de Oración",
    description:
      "Tu espacio diario para orar, comprender y avanzar con sentido. Rosario guiado, Evangelio comentado y compañero de fe disponible 24/7.",
    images: ["/logo-512-1.png"],
    creator: "@refugioenlapalabra",
  },
  alternates: {
    canonical: "https://refugioenlapalabra.com",
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
const jsonLd = [
  {
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
      url: "https://refugioenlapalabra.com",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo descargo la aplicación?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Es muy sencillo. Ve a la página de descarga y sigue las instrucciones según tu dispositivo. En iPhone/iPad, abre Safari y añade la app a tu pantalla de inicio. En Android, Chrome te ofrecerá instalarla directamente.",
        },
      },
      {
        "@type": "Question",
        name: "¿Es compatible con mi dispositivo?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Refugio en la Palabra funciona en cualquier dispositivo moderno: iPhone, Android, tablet o computadora. Solo necesitas un navegador actualizado como Safari, Chrome o Firefox.",
        },
      },
      {
        "@type": "Question",
        name: "¿Por qué no está en la App Store o Google Play?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Refugio es una Progressive Web App (PWA). Esto significa que funciona como una app nativa pero se instala directamente desde el navegador. No necesitas pasar por las tiendas, se actualiza automáticamente y ocupa menos espacio en tu dispositivo.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo funciona el Compañero de fe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Es un asistente de inteligencia artificial formado con fuentes católicas: el Catecismo, las Escrituras, documentos del Magisterio y enseñanzas de santos. No reemplaza a un sacerdote ni a la dirección espiritual, pero está disponible 24/7 para cuando necesites orientación.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuánto cuesta la aplicación?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Descargar y usar Refugio en la Palabra es gratis. Tienes acceso al Evangelio del día, Rosario, Lectio Divina y mucho más sin pagar nada.",
        },
      },
      {
        "@type": "Question",
        name: "¿Mis datos están seguros?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutamente. Cumplimos con el RGPD y la normativa española de protección de datos. No vendemos ni compartimos tus datos con terceros.",
        },
      },
    ],
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
        {children}
      </body>
    </html>
  );
}
