"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-carbon"
      aria-label="Hero"
    >
      {/* Fondo: fórmula química como watermark */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 60%, #DC262610 0%, transparent 65%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          className="font-bebas text-[22vw] text-crema/[0.018] tracking-[0.15em] whitespace-nowrap"
        >
          C₁₈H₂₇NO₃
        </span>
      </div>

      {/* Línea lateral izquierda */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 items-center">
        <div className="w-px h-24 bg-gradient-to-b from-transparent to-rojo/40" />
        <span className="text-[9px] tracking-[0.4em] text-crema/20 [writing-mode:vertical-rl] uppercase font-mono">
          Experimenta
        </span>
        <div className="w-px h-24 bg-gradient-to-t from-transparent to-rojo/40" />
      </div>

      {/* Línea lateral derecha */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 items-center">
        <div className="w-px h-24 bg-gradient-to-b from-transparent to-rojo/40" />
        <span className="text-[9px] tracking-[0.4em] text-crema/20 [writing-mode:vertical-rl] uppercase font-mono">
          El Picor
        </span>
        <div className="w-px h-24 bg-gradient-to-t from-transparent to-rojo/40" />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        {/* Badge origen */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-mono text-[10px] tracking-[0.4em] text-crema/25 uppercase mb-6"
        >
          Arte · Ciencia · Gourmet
        </motion.p>

        {/* Título principal — una sola palabra, máximo impacto */}
        <div className="overflow-hidden mb-4">
          <motion.h1
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-bebas text-[clamp(7rem,28vw,20rem)] leading-none tracking-[0.05em] text-crema"
          >
            DOSIS
          </motion.h1>
        </div>

        {/* Tagline */}
        <div className="overflow-hidden mb-10">
          <motion.p
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-bebas text-[clamp(1.4rem,4vw,2.5rem)] tracking-[0.25em] text-crema/40 uppercase"
          >
            Experimenta El Picor
          </motion.p>
        </div>

        {/* Separador y descripción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="space-y-6"
        >
          <p className="text-base md:text-lg text-crema/50 font-sans font-300 max-w-lg mx-auto leading-relaxed tracking-wide">
            Salsas gourmet de autor. Ingredientes seleccionados, ciencia
            aplicada y meses de proceso artesanal. Gota a gota.
          </p>

          {/* Chips productos */}
          <div className="flex gap-3 justify-center flex-wrap">
            {["MICRODOSIS [01]", "AHUMADOSIS [02]", "SOBREDOSIS [03]"].map((p) => (
              <span
                key={p}
                className="font-mono text-[9px] tracking-[0.25em] text-crema/30 border border-carbon-medio px-3 py-1.5 uppercase"
              >
                {p}
              </span>
            ))}
          </div>

          {/* CTAs — descubrir + pedir */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8"
          >
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-tienda"))}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-rojo text-crema font-bebas text-base tracking-[0.3em] uppercase hover:bg-rojo-oscuro transition-all duration-300 border-0 cursor-pointer"
            >
              Pedir Ahora
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <a
              href="#historia"
              className="inline-flex items-center gap-3 text-crema/40 hover:text-crema font-sans text-sm tracking-[0.3em] uppercase transition-colors duration-300 group"
            >
              Descubrir
              <span className="w-8 h-px bg-crema/30 group-hover:w-14 group-hover:bg-rojo transition-all duration-400" />
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-rojo/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
