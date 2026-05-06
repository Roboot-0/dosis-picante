import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Source_Sans_3 } from "next/font/google";
import { faqs } from "@/data/faqs";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Tienda from "@/components/Tienda";
import Footer from "@/components/Footer";
import CTAFlotante from "@/components/CTAFlotante";
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
  title: {
    default: "Dosis Picante — Salsas Artesanales que Queman Diferente",
    template: "%s | Dosis Picante",
  },
  description:
    "Salsas picantes artesanales fermentadas en Caracas. Microdosis, Ahumadosis y Sobredosis — tres intensidades, sin conservantes. Pide ahora.",
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
        {/* Preconnect — reduce latencia de recursos críticos */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />

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
                  sku: "DOSIS-MICRO-50",
                  description:
                    "Salsa picante fermentada con habanero y ají dulce venezolano. ~40,000 SHU. Formato gotero 50 ml.",
                  brand: { "@type": "Brand", name: "Dosis Picante" },
                  url: "https://www.dosispicante.com/salsas",
                  image: "https://www.dosispicante.com/images/microdosis.png",
                  offers: {
                    "@type": "Offer",
                    price: "6.00",
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                    url: "https://www.dosispicante.com",
                    seller: { "@type": "Organization", name: "Dosis Picante" },
                  },
                },
                {
                  "@type": "Product",
                  name: "AHUMADOSIS",
                  sku: "DOSIS-AHUMA-50",
                  description:
                    "Salsa picante fermentada con habanero y Carolina Reaper ahumado. ~100,000 SHU. Formato gotero 50 ml.",
                  brand: { "@type": "Brand", name: "Dosis Picante" },
                  url: "https://www.dosispicante.com/salsas",
                  image: "https://www.dosispicante.com/images/ahumadosis.png",
                  offers: {
                    "@type": "Offer",
                    price: "6.00",
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                    url: "https://www.dosispicante.com",
                    seller: { "@type": "Organization", name: "Dosis Picante" },
                  },
                },
                {
                  "@type": "Product",
                  name: "SOBREDOSIS",
                  sku: "DOSIS-SOBRE-30",
                  description:
                    "Salsa picante fermentada con Carolina Reaper y Trinidad Scorpion. ~1,200,000 SHU. Formato gotero 30 ml.",
                  brand: { "@type": "Brand", name: "Dosis Picante" },
                  url: "https://www.dosispicante.com/salsas",
                  image: "https://www.dosispicante.com/images/sobredosis.png",
                  offers: {
                    "@type": "Offer",
                    price: "12.00",
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                    url: "https://www.dosispicante.com",
                    seller: { "@type": "Organization", name: "Dosis Picante" },
                  },
                },
                {
                  "@type": "Product",
                  name: "KIT DOSIS",
                  sku: "DOSIS-KIT-3X",
                  description:
                    "Colección completa: Microdosis (50 ml) + Ahumadosis (50 ml) + Sobredosis (30 ml). Las 3 salsas artesanales DOSIS en un solo kit.",
                  brand: { "@type": "Brand", name: "Dosis Picante" },
                  url: "https://www.dosispicante.com/salsas",
                  image: "https://www.dosispicante.com/images/kit-real.jpg",
                  offers: {
                    "@type": "Offer",
                    price: "22.00",
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                    url: "https://www.dosispicante.com",
                    seller: { "@type": "Organization", name: "Dosis Picante" },
                  },
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://www.dosispicante.com/faq#faq",
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
        <SmoothScroll>
          <Nav />
          <main>{children}</main>
          <Footer />
          <Tienda />
          <CTAFlotante />
        </SmoothScroll>
      </body>
    </html>
  );
}