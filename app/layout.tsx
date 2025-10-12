import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Refugio en la Palabra | Tu espacio diario de oración",
  description: "Acompañamiento espiritual 24/7, oración guiada y contenido que aterriza la fe en tu vida.",
  keywords: ["oración", "espiritualidad", "fe", "reflexión", "acompañamiento espiritual"],
  openGraph: {
    title: "Refugio en la Palabra",
    description: "Tu espacio diario para orar, comprender y avanzar con sentido.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${lora.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
