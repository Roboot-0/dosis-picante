"use client";

import { motion } from "framer-motion";
import MoleculeBackground from "@/components/MoleculeBackground";

const LIFESTYLE = [
  {
    src: "/images/uso-ahumadosis.jpg",
    name: "AHUMADOSIS",
    sub: "Ahumado · Dulce",
    wide: true,
  },
  {
    src: "/images/uso-microdosis.jpg",
    name: "MICRODOSIS",
    sub: "Suave · Frutal",
    wide: false,
  },
  {
    src: "/images/uso-sobredosis.jpg",
    name: "SOBREDOSIS",
    sub: "Intenso · Profundo",
    wide: false,
  },
];

export default function Hero() {
  return (
    <section
      className="relative min-h-screen bg-carbon overflow-hidden"
      aria-label="Hero"
    >
      {/* ── MOLÉCULA 3D — fondo interactivo ── */}
      <MoleculeBackground />

      {/* Gradiente inferior */}
      <div
        className="absolute inset-x-0 bottom-0 h-48 pointer-events-none z-[1]"
        aria-hidden="true"
        style={{ background: "linear-gradient(to top, #1C1917f4, #1C191750, transparent)" }}
      />

      {/* Línea decorativa top */}
      <div
        className="absolute top-0 left-0 right-0 h-px linea-fuego pointer-events-none z-[1]"
        aria-hidden="true"
      />

      {/* ── LOGO — overlay HTML fijo, no rota con la molécula ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[5] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1.1 }}
          className="text-center select-none"
        >
          <p className="font-mono text-[8px] md:text-[9px] tracking-[0.55em] text-crema/25 uppercase mb-3">
            Capsaicina venezolana
          </p>

          <h1
            className="font-bebas text-[6rem] md:text-[10rem] lg:text-[12rem] leading-none tracking-[0.3em] text-crema uppercase"
            style={{
              textShadow:
                "0 0 100px rgba(220,38,38,0.30), 0 0 30px rgba(220,38,38,0.12), 0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            DOSIS
          </h1>

          <p className="font-mono text-[8px] md:text-[9px] tracking-[0.5em] text-crema/20 uppercase mt-2">
            Salsas artesanales · Edición limitada
          </p>
        </motion.div>
      </div>

      {/* ── LIFESTYLE CARDS — tercio inferior ── */}
      <div className="absolute bottom-28 md:bottom-32 left-0 right-0 z-[7] pointer-events-none px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="flex items-end justify-center gap-2 md:gap-3"
        >
          {LIFESTYLE.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.35 + i * 0.12, duration: 0.55 }}
              className={`relative overflow-hidden flex-shrink-0 ${
                item.wide
                  ? "w-40 h-24 md:w-56 md:h-36"
                  : "w-28 h-24 md:w-40 md:h-36"
              }`}
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
              }}
            >
              <img
                src={item.src}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.72 }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.7) 100%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="font-bebas text-[11px] md:text-sm tracking-[0.25em] text-crema leading-none">
                  {item.name}
                </p>
                <p className="font-mono text-[6px] md:text-[7px] tracking-[0.2em] text-crema/40 mt-0.5">
                  {item.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── PIE DEL HERO — botones ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center gap-4 pb-8 pt-6"
        style={{ pointerEvents: "none" }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="font-mono text-[8px] tracking-[0.45em] text-crema/18 uppercase"
        >
          Arrastra · Gira · Explora
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7 }}
          className="flex flex-row items-center justify-center gap-8"
        >
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-tienda"))}
            className="group relative overflow-hidden inline-flex items-center gap-3 px-12 py-4 bg-rojo text-crema font-bebas text-lg tracking-[0.3em] uppercase border-0 cursor-pointer"
            style={{
              pointerEvents: "auto",
              boxShadow: "0 0 50px #DC262440, 0 4px 20px #DC262428",
            }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            Pedir Ahora
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-200">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <a
            href="/salsas"
            className="inline-flex items-center gap-3 text-crema/35 hover:text-crema font-sans text-sm tracking-[0.35em] uppercase transition-colors duration-300 group"
            style={{ pointerEvents: "auto" }}
          >
            Ver las salsas
            <span className="w-6 h-px bg-crema/20 group-hover:w-12 group-hover:bg-rojo transition-all duration-500" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
