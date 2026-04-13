import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rojo: "#DC2626",
        "rojo-oscuro": "#991B1B",
        "rojo-claro": "#FCA5A5",
        oro: "#D97706",
        "oro-claro": "#FCD34D",
        carbon: "#1C1917",
        "carbon-claro": "#292524",
        "carbon-medio": "#44403C",
        crema: "#FAFAF9",
        "crema-oscura": "#F5F0EB",
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "cursive"],
        sans: ["var(--font-source)", "sans-serif"],
      },
      animation: {
        "flame-flicker": "flicker 2s ease-in-out infinite alternate",
        "heat-pulse": "heatPulse 3s ease-in-out infinite",
        "fade-up": "fadeUp 0.8s ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        flicker: {
          "0%": { opacity: "0.85", transform: "scaleY(1)" },
          "100%": { opacity: "1", transform: "scaleY(1.02)" },
        },
        heatPulse: {
          "0%, 100%": { boxShadow: "0 0 20px #DC2626aa, 0 0 60px #DC262644" },
          "50%": { boxShadow: "0 0 40px #DC2626cc, 0 0 100px #DC262666" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
