import type { Metadata } from "next";
import { Bebas_Neue, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const source = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dosis Picante — Salsas Artesanales que Queman Diferente",
  description:
    "Salsas picantes artesanales con carácter. Cada botella es una decisión de vida. ¿Puedes con el calor?",
  keywords: ["salsa picante", "artesanal", "hot sauce", "México", "dosis picante"],
  openGraph: {
    title: "Dosis Picante — Salsas Artesanales",
    description: "No es solo picante. Es una experiencia.",
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${bebas.variable} ${source.variable}`}>
      <body>
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
