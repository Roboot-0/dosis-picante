import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dosis Picante",
    short_name: "DOSIS",
    description:
      "Salsas picantes artesanales fermentadas naturalmente en Caracas.",
    start_url: "/",
    display: "standalone",
    background_color: "#1C1917",
    theme_color: "#DC2626",
    lang: "es-VE",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
