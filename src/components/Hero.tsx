"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const salsas = [
  { id: "microdosis", nombre: "MICRODOSIS", precio: 6,  shu: "40K",  color: "#D97706", img: "/images/microdosis-clean.png" },
  { id: "ahumadosis", nombre: "AHUMADOSIS", precio: 6,  shu: "100K", color: "#EA580C", img: "/images/ahumadosis-clean.png" },
  { id: "sobredosis",  nombre: "SOBREDOSIS",  precio: 12, shu: "1.2M", color: "#DC2626", img: "/images/sobredosis-clean.png" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY  = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center bg-carbon"
      aria-label="Hero"
    >
      {/* ── FOTO DE FONDO ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-110 pointer-events-none" aria-hidden="true">
        <Image
          src="/images/hero-fondo.jpg"
          alt="" fill priority sizes="100vw"
          className="object-cover object-center"
          style={{ opacity: 0.35 }}
        />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 85% 75% at 50% 45%, transparent 5%, #1C191780 50%, #1C1917 95%)"
        }} />
      </motion.div>

      {/* Línea decorativa top */}
      <div className="absolute top-0 left-0 right-0 h-px linea-fuego" aria-hidden="true" />

      {/* ── CONTENIDO SIN wrapper de opacity — cada bloque maneja su propio fade ── */}
      <div className="relative w-full max-w-6xl mx-auto px-6 pt-24 pb-10 flex flex-col items-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ opacity: fade }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px w-6 bg-rojo/40" />
          <p className="font-mono text-[9px] tracking-[0.5em] text-crema/25 uppercase">Caracas · Venezuela · Artesanal</p>
          <div className="h-px w-6 bg-rojo/40" />
        </motion.div>

        {/* ── LOGO
             logo-screen.png tiene fondo negro puro (diseñado para screen mode).
             El wrapper div hace screen blend contra el fondo oscuro del Hero
             (fondo negro → transparente) mientras el filter brightness en la
             imagen lleva el D-chile de rojo oscuro a rojo vibrante antes del blend.
        ── */}
        <div className="mb-10" style={{ mixBlendMode: "screen" }}>
          <Image
            src="/images/logo-screen.png"
            alt="DOSIS Picante — Experimenta el picor"
            width={1377}
            height={768}
            priority
            className="w-[300px] sm:w-[440px] md:w-[580px] lg:w-[700px] object-contain"
            style={{ filter: "brightness(2.8) saturate(1.3)" }}
          />
        </div>

        {/* ── BOTELLAS ── */}
        <motion.div
          style={{ opacity: fade }}
          className="relative flex justify-center items-end gap-6 md:gap-12 lg:gap-20 mb-14"
        >
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-24 blur-3xl pointer-events-none"
            style={{ background: "linear-gradient(90deg, #D9770625, #EA580C35, #DC262640)" }}
            aria-hidden="true"
          />

          {salsas.map((s, i) => (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-tienda"))}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.14, type: "spring", stiffness: 60, damping: 14 }}
              whileHover={{ y: -18, scale: 1.05, transition: { type: "spring", stiffness: 300, damping: 18 } }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex flex-col items-center gap-4 cursor-pointer bg-transparent border-0 p-0"
              aria-label={`Comprar ${s.nombre}`}
            >
              {/* Glow pulsante bajo la botella */}
              <motion.div
                className="absolute bottom-16 w-40 h-20 blur-3xl -z-10 pointer-events-none"
                style={{ background: `${s.color}60` }}
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 3 + i * 0.7, ease: "easeInOut" }}
              />
              {/* Botella */}
              <motion.div
                style={{ filter: `drop-shadow(0 24px 48px ${s.color}70) drop-shadow(0 4px 16px ${s.color}40)` }}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: "easeInOut", delay: i * 0.4 }}
              >
                <Image
                  src={s.img}
                  alt={s.nombre}
                  width={240} height={131}
                  style={{ width: "clamp(140px, 17vw, 230px)" }}
                  className="object-contain"
                  sizes="230px"
                />
              </motion.div>
              <div className="text-center">
                <p className="font-bebas text-base md:text-lg tracking-[0.2em] leading-none mb-1" style={{ color: s.color }}>{s.nombre}</p>
                <p className="font-bebas text-2xl md:text-3xl leading-none text-crema">${s.precio}</p>
                <p className="font-mono text-[7px] text-crema/20 tracking-widest mt-0.5">{s.shu} SHU · 50ml</p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ opacity: fade }}
          transition={{ delay: 1.4, duration: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
        >
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-tienda"))}
            className="group relative overflow-hidden inline-flex items-center gap-3 px-14 py-5 bg-rojo text-crema font-bebas text-xl tracking-[0.3em] uppercase border-0 cursor-pointer"
            style={{ boxShadow: "0 0 70px #DC262445, 0 4px 30px #DC262428" }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            Pedir Ahora
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-200">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <a href="/salsas" className="inline-flex items-center gap-3 text-crema/30 hover:text-crema font-sans text-sm tracking-[0.35em] uppercase transition-colors duration-300 group">
            Ver las salsas
            <span className="w-6 h-px bg-crema/20 group-hover:w-12 group-hover:bg-rojo transition-all duration-500" />
          </a>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ opacity: fade }}
          transition={{ delay: 1.8, duration: 1 }}
          className="flex items-center justify-center gap-6 md:gap-10 mt-12 flex-wrap"
        >
          {["100% Natural", "Sin conservantes", "Fermentada artesanalmente", "Envío a todo el país"].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-rojo/40" />
              <span className="font-mono text-[8px] tracking-[0.35em] text-crema/20 uppercase">{t}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 2.1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="w-px h-14 bg-gradient-to-b from-rojo/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}
