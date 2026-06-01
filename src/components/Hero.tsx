"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const BOTTLES = [
  {
    src: "/images/ahumadosis-clean.png",
    name: "AHUMADOSIS",
    sub: "Ahumado · Dulce",
    delay: 0.15,
    spinDuration: 11,
    floatDelay: 0.3,
    big: false,
  },
  {
    src: "/images/sobredosis-clean.png",
    name: "SOBREDOSIS",
    sub: "Intenso · Profundo",
    delay: 0,
    spinDuration: 14,
    floatDelay: 0,
    big: true,
  },
  {
    src: "/images/microdosis-clean.png",
    name: "MICRODOSIS",
    sub: "Suave · Frutal",
    delay: 0.3,
    spinDuration: 9,
    floatDelay: 0.6,
    big: false,
  },
];

export default function Hero() {
  return (
    <section
      className="relative min-h-screen bg-carbon overflow-hidden"
      aria-label="Hero"
    >
      {/* ── FONDO FOTO ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-fondo.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          style={{ opacity: 0.32 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #1C1917d8 0%, #1C191760 30%, #1C191778 65%, #1C1917f5 100%)",
          }}
        />
      </div>

      {/* Línea decorativa top */}
      <div
        className="absolute top-0 left-0 right-0 h-px linea-fuego pointer-events-none z-[1]"
        aria-hidden="true"
      />

      {/* Gradiente inferior */}
      <div
        className="absolute inset-x-0 bottom-0 h-52 pointer-events-none z-[2]"
        aria-hidden="true"
        style={{ background: "linear-gradient(to top, #1C1917f8, #1C191760, transparent)" }}
      />

      {/* ── LOGO ── */}
      <div
        className="absolute left-0 right-0 flex justify-center z-[5] pointer-events-none"
        style={{ top: "13vh" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.0 }}
          className="select-none"
          style={{
            filter:
              "drop-shadow(0 0 80px rgba(220,38,38,0.30)) drop-shadow(0 0 30px rgba(220,38,38,0.14))",
          }}
        >
          <Image
            src="/images/logo-transparent.png"
            alt="DOSIS"
            width={480}
            height={268}
            priority
            className="w-[230px] md:w-[340px] lg:w-[400px] h-auto"
          />
        </motion.div>
      </div>

      {/* ── BOTELLAS 3D ── */}
      <div
        className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none"
        style={{ paddingTop: "20vh", paddingBottom: "14vh" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.9 }}
          className="flex items-end justify-center gap-6 md:gap-12"
          style={{ perspective: "900px" }}
        >
          {BOTTLES.map((bottle) => (
            <motion.div
              key={bottle.name}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + bottle.delay, duration: 0.75 }}
              className="flex flex-col items-center gap-3"
            >
              {/* Float */}
              <motion.div
                animate={{ y: [0, -13, 0] }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: bottle.floatDelay,
                }}
              >
                {/* Spin 3D */}
                <motion.div
                  animate={{ rotateY: 360 }}
                  transition={{
                    duration: bottle.spinDuration,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Image
                    src={bottle.src}
                    alt={bottle.name}
                    width={160}
                    height={320}
                    className={`h-auto ${
                      bottle.big
                        ? "w-[82px] md:w-[100px] lg:w-[118px]"
                        : "w-[64px] md:w-[80px] lg:w-[94px]"
                    }`}
                    style={{
                      filter:
                        "drop-shadow(0 20px 44px rgba(0,0,0,0.70)) drop-shadow(0 0 22px rgba(220,38,38,0.14))",
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Label */}
              <div className="text-center">
                <p className="font-bebas text-[10px] md:text-[11px] tracking-[0.28em] text-crema/75 leading-none">
                  {bottle.name}
                </p>
                <p className="font-mono text-[6px] md:text-[7px] tracking-[0.2em] text-crema/30 mt-0.5">
                  {bottle.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── BOTONES ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center gap-4 pb-10 pt-4 px-6"
        style={{ pointerEvents: "none" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7 }}
          className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-8 w-full"
        >
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-tienda"))}
            className="group relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 md:px-12 py-4 bg-rojo text-crema font-bebas text-lg tracking-[0.3em] uppercase border-0 cursor-pointer w-full max-w-[280px] md:w-auto"
            style={{
              pointerEvents: "auto",
              boxShadow: "0 0 50px #DC262440, 0 4px 20px #DC262428",
            }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            Pedir Ahora
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:translate-x-1 transition-transform duration-200"
            >
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
