import type { NextConfig } from "next";

const securityHeaders = [
  // Evita que la página se cargue en un iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // El browser no intenta adivinar el Content-Type de las respuestas
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Solo envía el origen (no la ruta completa) como Referrer a sitios externos
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desactiva features que no se usan: cámara, micrófono, geolocalización
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Fuerza HTTPS por 1 año (solo en producción, Vercel lo envía en HTTPS)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "dosispicante.com" },
    ],
  },
  async headers() {
    return [
      {
        // Aplica a todas las rutas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
