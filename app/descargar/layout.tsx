import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Descargar App | Refugio en la Palabra",
  description:
    "Aprende a instalar Refugio en la Palabra en tu móvil. Tutorial paso a paso para Android e iPhone. Sin tiendas de apps, instalación en 30 segundos.",
  keywords: [
    "instalar refugio en la palabra",
    "descargar app católica",
    "pwa católica",
    "app rosario android",
    "app rosario iphone",
    "instalar app sin app store",
    "progressive web app católica",
  ],
  openGraph: {
    title: "Instala Refugio en tu móvil | Tutorial paso a paso",
    description:
      "Añade Refugio en la Palabra a tu pantalla de inicio en 30 segundos. Tutorial para Android e iPhone.",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/logo-512-1.png",
        width: 512,
        height: 512,
        alt: "Refugio en la Palabra - Instalar App",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Instala Refugio en tu móvil",
    description:
      "Tutorial para añadir Refugio en la Palabra a tu pantalla de inicio. Android e iPhone.",
    images: ["/logo-512-1.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DescargarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
