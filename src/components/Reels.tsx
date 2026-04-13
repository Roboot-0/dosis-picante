"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* ──────────────────────────────────────────────────────
   PLACEHOLDER — Reemplaza con URLs reales de reels.
   Formato: { url: "https://www.instagram.com/reel/XXXX/", caption: "..." }
   ────────────────────────────────────────────────────── */
const reels = [
  {
    id: "placeholder-1",
    embedUrl: "https://www.instagram.com/reel/PLACEHOLDER1/embed",
    caption: "El primer lote — así empezó todo",
  },
  {
    id: "placeholder-2",
    embedUrl: "https://www.instagram.com/reel/PLACEHOLDER2/embed",
    caption: "Fermentación día 21",
  },
  {
    id: "placeholder-3",
    embedUrl: "https://www.instagram.com/reel/PLACEHOLDER3/embed",
    caption: "Reacción en vivo",
  },
];

/* Mientras no haya reels reales, mostramos un mockup visual */
function ReelPlaceholder({ caption, index }: { caption: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="group relative"
    >
      <div className="aspect-[9/16] bg-carbon-claro border border-carbon-medio overflow-hidden relative flex items-center justify-center">
        {/* Ícono de play mock */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-crema/20 flex items-center justify-center group-hover:border-rojo/60 transition-colors duration-300">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-crema/30 group-hover:text-rojo transition-colors duration-300 ml-1"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-[10px] tracking-[0.3em] text-crema/20 uppercase font-mono">
            Reel
          </span>
        </div>

        {/* Gradiente inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-carbon to-transparent" />

        {/* Caption */}
        <p className="absolute bottom-4 left-4 right-4 text-crema/60 font-sans text-xs leading-relaxed">
          {caption}
        </p>
      </div>
    </motion.div>
  );
}

export default function Reels() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 bg-carbon-claro relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px linea-fuego" />

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="h-px w-8 bg-rojo" />
          <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">
            En Acción
          </span>
        </motion.div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-bebas text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-crema"
          >
            DOSIS <span className="text-rojo">EN VIVO.</span>
          </motion.h2>

          <motion.a
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            href="https://instagram.com/dosis_ve"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-crema/40 hover:text-rojo font-sans text-sm tracking-wider uppercase transition-colors group"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Ver más en Instagram
            <span className="w-6 h-px bg-crema/30 group-hover:w-10 group-hover:bg-rojo transition-all duration-300" />
          </motion.a>
        </div>

        {/* Grid de reels — 3 columnas desktop, scroll horizontal mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {reels.map((reel, i) => (
            <ReelPlaceholder key={reel.id} caption={reel.caption} index={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-8 text-xs tracking-[0.3em] text-crema/15 font-mono uppercase"
        >
          Contenido real próximamente
        </motion.p>
      </div>
    </section>
  );
}
