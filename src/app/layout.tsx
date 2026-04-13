import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Source_Sans_3 } from "next/font/google";
import { faqs } from "@/data/faqs";
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
  metadataBase: new URL("https://www.dosispicante.com"),
  title: "Dosis Picante — Salsas Artesanales que Queman Diferente",
  description:
    "Salsas picantes artesanales fermentadas naturalmente en Caracas. Tres niveles de intensidad: MICRODOSIS, AHUMADOSIS y SOBREDOSIS. Formato gotero 30 ml.",
  keywords: [
    "salsa picante",
    "salsa picante venezolana",
    "hot sauce",
    "artesanal",
    "fermentada",
    "Caracas",
    "Venezuela",
    "dosis picante",
    "capsaicina",
    "habanero",
    "carolina reaper",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Dosis Picante — Salsas Artesanales que Queman Diferente",
    description:
      "Salsas picantes fermentadas naturalmente en Caracas. Gota a gota. No es solo picante, es una experiencia.",
    url: "https://www.dosispicante.com",
    siteName: "Dosis Picante",
    type: "website",
    locale: "es_VE",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dosis Picante — Salsas artesanales fermentadas en Caracas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dosis Picante — Salsas Artesanales",
    description:
      "Salsas picantes fermentadas naturalmente en Caracas. Gota a gota.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-VE" className={`${bebas.variable} ${source.variable}`}>
      <head>
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-2XXQ2DYT9M" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-2XXQ2DYT9M');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.dosispicante.com/#organization",
                  name: "Dosis Picante",
                  url: "https://www.dosispicante.com",
                  logo: "https://www.dosispicante.com/apple-touch-icon.png",
                  sameAs: ["https://instagram.com/dosis_ve"],
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Caracas",
                    addressCountry: "VE",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.dosispicante.com/#website",
                  url: "https://www.dosispicante.com",
                  name: "Dosis Picante",
                  inLanguage: "es-VE",
                  publisher: { "@id": "https://www.dosispicante.com/#organization" },
                },
                {
                  "@type": "Product",
                  name: "MICRODOSIS",
                  description:
                    "Salsa picante fermentada con habanero y ají dulce venezolano. ~40,000 SHU.",
                  brand: { "@type": "Brand", name: "Dosis Picante" },
                  offers: {
                    "@type": "Offer",
                    price: "5.00",
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                  },
                },
                {
                  "@type": "Product",
                  name: "AHUMADOSIS",
                  description:
                    "Salsa picante fermentada con habanero y Carolina Reaper ahumado. ~100,000 SHU.",
                  brand: { "@type": "Brand", name: "Dosis Picante" },
                  offers: {
                    "@type": "Offer",
                    price: "5.00",
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                  },
                },
                {
                  "@type": "Product",
                  name: "SOBREDOSIS",
                  description:
                    "Salsa picante fermentada con Carolina Reaper y Trinidad Scorpion. ~1,200,000 SHU.",
                  brand: { "@type": "Brand", name: "Dosis Picante" },
                  offers: {
                    "@type": "Offer",
                    price: "12.00",
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                  },
                },
                {
                  "@type": "Product",
                  name: "KIT DOSIS",
                  description:
                    "Colección completa: las 3 salsas picantes artesanales de DOSIS (Microdosis, Ahumadosis y Sobredosis) en un solo kit. Formato 3 × 30 ml.",
                  brand: { "@type": "Brand", name: "Dosis Picante" },
                  offers: {
                    "@type": "Offer",
                    price: "20.00",
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                  },
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://www.dosispicante.com/#faq",
                  mainEntity: faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: f.a,
                    },
                  })),
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
