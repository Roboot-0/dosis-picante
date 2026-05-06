"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const items = [
  "ARTESANAL",
  "FERMENTADA",
  "CARACAS",
  "GOTA A GOTA",
  "NATURAL",
  "SIN CONSERVANTES",
  "HECHO A MANO",
  "PICANTE",
  "100% REAL",
  "VENEZUELA",
];

const Sep = () => (
  <span className="text-rojo mx-4 md:mx-6 opacity-50 select-none" aria-hidden="true">
    ·
  </span>
);

interface MarqueeStripProps {
  /** "left" = default (izquierda). "right" = dirección inversa */
  direction?: "left" | "right";
  speed?: number; /** segundos por ciclo completo */
  className?: string;
}

export default function MarqueeStrip({
  direction = "left",
  speed = 28,
  className = "",
}: MarqueeStripProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  /* Parallax sutil — la tira se mueve un poco más lento que el scroll */
  const y = useTransform(scrollYProgress, [0, 1], ["-4px", "4px"]);

  /* Duplicamos 4× para que nunca haya huecos en pantallas muy anchas */
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden border-y border-carbon-medio bg-carbon py-3 md:py-4 ${className}`}
      aria-hidden="true"
    >
      {/* Fade en los bordes */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-carbon to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-carbon to-transparent" />

      <motion.div style={{ y }}>
        <motion.div
          className="flex whitespace-nowrap w-max"
          animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {repeated.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center font-bebas text-xs md:text-sm tracking-[0.4em] text-crema/25"
            >
              {item}
              <Sep />
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
