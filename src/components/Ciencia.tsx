"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const comparacion = [
  { nombre: "Ají dulce venezolano", shu: "0 — 1,000", bar: 0.2, dosis: false },
  { nombre: "Jalapeño", shu: "2,500 — 8,000", bar: 1.2, dosis: false },
  { nombre: "Tabasco (salsa)", shu: "2,500 — 5,000", bar: 1, dosis: false },
  { nombre: "▸ MICRODOSIS [01]", shu: "~40,000", bar: 8, dosis: true },
  { nombre: "▸ AHUMADOSIS [02]", shu: "~100,000", bar: 16, dosis: true },
  { nombre: "Habanero", shu: "100,000 — 350,000", bar: 22, dosis: false },
  { nombre: "Trinidad Scorpion", shu: "~1,400,000", bar: 68, dosis: false },
  { nombre: "▸ SOBREDOSIS [03]", shu: "~1,200,000", bar: 60, dosis: true },
  { nombre: "Carolina Reaper (récord)", shu: "~2,200,000", bar: 100, dosis: false },
];

export default function Ciencia() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section id="ciencia" className="relative py-32 bg-carbon-claro overflow-hidden">
      {/* Molécula de capsaicina como fondo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div style={{ y }} className="opacity-[0.025] select-none">
          <Image
            src="/images/capsaicina.jpeg"
            alt=""
            width={900}
            height={600}
            className="object-cover"
          />
        </motion.div>
      </div>

      <div ref={containerRef} className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-20 max-w-3xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-8 bg-rojo" />
            <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans">
              La Molécula
            </span>
          </div>

          <div className="inline-block font-mono text-xs tracking-[0.3em] text-crema/40 border border-carbon-medio px-4 py-2 mb-6">
            C₁₈H₂₇NO₃ — CAPSAICINA
          </div>

          <h2 className="font-bebas text-[clamp(3rem,7vw,5rem)] leading-none text-crema mb-6">
            TU CEREBRO NO SIENTE
            <br />
            <span className="text-rojo">CALOR REAL.</span>
            <br />
            LO CREE.
          </h2>

          <p className="text-lg text-crema/60 font-sans font-300 leading-relaxed max-w-2xl">
            La capsaicina no produce calor físico — engaña a tu cerebro.
            Activa los receptores TRPV1, los mismos que detectan cuando
            tocas algo caliente. Tu cerebro percibe fuego donde no lo hay.
            El resultado: sudoración, endorfinas, euforia.
          </p>
          <p className="text-base text-crema/40 font-sans font-300 leading-relaxed max-w-2xl mt-4">
            Es por eso que la molécula de capsaicina aparece en nuestro
            empaque. No es decoración — es nuestra materia prima.
          </p>
        </motion.div>

        {/* Tabla Scoville */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-xs tracking-[0.3em] text-crema/30 uppercase">
              Escala Scoville · Comparativa
            </span>
          </div>

          <div className="space-y-0 border border-carbon-medio">
            {comparacion.map((item, i) => (
              <motion.div
                key={item.nombre}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`flex items-center gap-4 px-5 py-3 border-b border-carbon-medio last:border-0 group ${
                  item.dosis ? "bg-rojo/5" : "bg-carbon"
                }`}
              >
                <div className={`flex-1 font-mono text-xs tracking-wider ${
                  item.dosis ? "text-rojo font-600" : "text-crema/40"
                }`}>
                  {item.nombre}
                </div>
                <div className="w-24 text-right font-mono text-xs text-crema/30 tracking-wider hidden sm:block">
                  {item.shu}
                </div>
                <div className="w-48 hidden md:block">
                  <div className="h-1.5 bg-carbon-medio rounded-none overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.bar}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.05 + 0.3 }}
                      className={`h-full ${item.dosis ? "bg-rojo" : "bg-carbon-medio bg-opacity-60"}`}
                      style={!item.dosis ? { background: "#44403C" } : {}}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-4 text-center font-mono text-xs text-crema/25 tracking-widest"
          >
            MICRODOSIS es 8× más picante que Tabasco · SOBREDOSIS es 240× más picante
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
