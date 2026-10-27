import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Descargar la app",
  description:
    "Descarga Refugio en la Palabra, la app católica de oración: en Google Play para Android y desde Safari en iPhone, en 30 segundos. Gratis para empezar y sin anuncios.",
  keywords: [
    "instalar refugio en la palabra",
    "descargar app católica",
    "app católica google play",
    "app rosario android",
    "app rosario iphone",
    "app católica iphone",
  ],
  openGraph: {
    title: "Descarga Refugio en la Palabra",
    description:
      "En Google Play para Android y desde Safari en iPhone. La app católica para rezar el Rosario, leer el Evangelio del día y resolver tus dudas de fe.",
    type: "website",
    locale: "es_ES",
    url: "https://www.refugioenlapalabra.com/descargar",
    siteName: "Refugio en la Palabra",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Refugio en la Palabra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Descarga Refugio en la Palabra",
    description:
      "En Google Play para Android y desde Safari en iPhone.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "https://www.refugioenlapalabra.com/descargar",
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
