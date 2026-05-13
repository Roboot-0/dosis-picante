"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * MoleculaFondo — Marca de agua de la capsaicina.
 * Misma estructura que MoleculaSVG, escalada 3× para fondos de sección.
 * viewBox 320×180 → 960×540, mismos paths × 3.
 */
export default function MoleculaFondo({
  opacity = 0.05,
  color = "#A8A29E",
  scale = 1,
}: {
  opacity?: number;
  color?: string;
  scale?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 960 540"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: `${scale * 900}px`, maxWidth: "95vw", opacity }}
      >
        {/* Backbone principal (M20 100 ... L200 60) × 3 */}
        <motion.path
          d="M60 300 L150 240 L240 300 L330 240 L420 300 L510 240 L600 180"
          stroke={color} strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 2.4, ease: "easeOut" }}
        />

        {/* Anillo bencénico (M200 60 ... Z) × 3 */}
        <motion.path
          d="M600 180 L660 120 L750 120 L780 180 L750 240 L660 240 Z"
          stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.5, delay: 1.6, ease: "easeOut" }}
        />

        {/* Dobles enlaces internos × 3 */}
        <motion.path
          d="M666 144 L744 144 M666 216 L744 216"
          stroke={color} strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 0.5 } : {}}
          transition={{ delay: 2.6 }}
        />

        {/* Grupos OH — círculos × 3 */}
        <motion.circle cx="690" cy="120" r="5" fill={color}
          initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
          transition={{ delay: 3.0, type: "spring" }}
        />
        <motion.circle cx="726" cy="240" r="5" fill={color}
          initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
          transition={{ delay: 3.2, type: "spring" }}
        />

        {/* Cola alquilo (M140 100 ... L200 150) × 3 */}
        <motion.path
          d="M420 300 L420 390 L510 390 L510 450 L600 450"
          stroke={color} strokeWidth="2" strokeDasharray="8 5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 0.6 } : {}}
          transition={{ duration: 1.5, delay: 1.0, ease: "easeOut" }}
        />

        {/* Grupo amino NH (M80 100 L80 130) × 3 */}
        <motion.path
          d="M240 300 L240 390"
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.9 }}
        />

        {/* Labels × 3 */}
        <motion.text x="24" y="294" fill={color} fontSize="22" fontFamily="monospace"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 0.7 } : {}}
          transition={{ delay: 0.5 }}
        >
          CH₃O
        </motion.text>
        <motion.text x="216" y="420" fill={color} fontSize="22" fontFamily="monospace"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 0.7 } : {}}
          transition={{ delay: 1.3 }}
        >
          NH
        </motion.text>
        <motion.text x="582" y="468" fill={color} fontSize="22" fontFamily="monospace"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 0.7 } : {}}
          transition={{ delay: 2.0 }}
        >
          OH
        </motion.text>

        {/* Glow pulsante en el anillo */}
        <motion.circle
          cx="705" cy="180" r="72"
          fill="none" stroke={color} strokeWidth="1"
          animate={{ opacity: [0, 0.25, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
