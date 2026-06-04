"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Orden correcto 01 → 02 → 03, con tamaño progresivo
const BOTTLES = [
  {
    id: "microdosis",
    src: "/images/microdosis-clean.png",
    name: "MICRODOSIS",
    sub: "Suave · Frutal",
    tagline: "El primer contacto",
    descripcion:
      "Habanero + ají dulce venezolano. Fermentada naturalmente. El calor llega despacio, con sabor y sin apresurarse.",
    scoville: "~40,000 SHU",
    nivel: 1,
    precio: 6,
    color: "#D97706",
    delay: 0.1,
    floatDelay: 0.6,
    rockDuration: 5.5,
    wClass: "w-[68px] md:w-[86px] lg:w-[100px]",
  },
  {
    id: "ahumadosis",
    src: "/images/ahumadosis-clean.png",
    name: "AHUMADOSIS",
    sub: "Ahumado · Complejo",
    tagline: "La que convierte",
    descripcion:
      "Habanero + Carolina Reaper combinado con vegetales ahumados. El ahumado llega primero, el fuego después.",
    scoville: "~100,000 SHU",
    nivel: 2,
    precio: 6,
    color: "#EA580C",
    delay: 0,
    floatDelay: 0.3,
    rockDuration: 6.5,
    wClass: "w-[82px] md:w-[102px] lg:w-[120px]",
  },
  {
    id: "sobredosis",
    src: "/images/sobredosis-clean.png",
    name: "SOBREDOSIS",
    sub: "Extremo · Intenso",
    tagline: "La última advertencia",
    descripcion:
      "Carolina Reaper + Trinidad Scorpion. No crece y se va — se instala. Para quien ya conoce su límite.",
    scoville: "~1,200,000 SHU",
    nivel: 3,
    precio: 12,
    color: "#DC2626",
    delay: 0.2,
    floatDelay: 0,
    rockDuration: 8,
    wClass: "w-[74px] md:w-[94px] lg:w-[110px]",
  },
];

function NivelDots({ nivel, color }: { nivel: number; color: string }) {
  return (
    <div className="flex gap-1.5 items-center">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: i <= nivel ? color : "#292524" }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const [selected, setSelected] = useState<string | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const info = BOTTLES.find((b) => b.id === selected) ?? null;

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

      <div
        className="absolute top-0 left-0 right-0 h-px linea-fuego pointer-events-none z-[1]"
        aria-hidden="true"
      />
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
          className="flex items-end justify-center gap-8 md:gap-14"
          style={{ perspective: "900px" }}
        >
          {BOTTLES.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + b.delay, duration: 0.75 }}
              style={{ pointerEvents: "auto" }}
            >
              {/* Dimming con CSS puro — no interfiere con la animación de entrada de FM */}
              <div
                className="transition-all duration-300"
                style={{
                  opacity: selected && selected !== b.id ? 0.2 : 1,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelected(selected === b.id ? null : b.id)}
                  className="flex flex-col items-center gap-3 group cursor-pointer focus:outline-none"
                  aria-expanded={selected === b.id}
                  aria-label={`Detalles de ${b.name}`}
                >
                  {/* Float */}
                  <motion.div
                    animate={{ y: [0, -13, 0] }}
                    transition={{
                      duration: 3.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: b.floatDelay,
                    }}
                  >
                    {/* Balanceo 3D oscilante */}
                    <motion.div
                      animate={{ rotateY: [-25, 25, -25] }}
                      whileHover={{ scale: 1.07 }}
                      transition={{
                        rotateY: {
                          duration: b.rockDuration,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: b.floatDelay,
                        },
                        scale: { type: "spring", stiffness: 300, damping: 20 },
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="relative"
                    >
                      <Image
                        src={b.src}
                        alt={b.name}
                        width={160}
                        height={320}
                        className={`h-auto ${b.wClass}`}
                        style={{
                          filter:
                            "drop-shadow(0 16px 40px rgba(0,0,0,0.90)) drop-shadow(0 0 18px rgba(220,38,38,0.10))",
                        }}
                      />
                      {/* Gradiente radial para suavizar halo blanco del PNG */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse 82% 72% at 50% 38%, transparent 38%, rgba(28,25,23,0.50) 66%, rgba(28,25,23,0.88) 100%)",
                        }}
                      />
                    </motion.div>
                  </motion.div>

                  {/* Label */}
                  <div className="text-center">
                    <p
                      className="font-bebas text-[10px] md:text-[12px] tracking-[0.28em] leading-none transition-colors duration-300"
                      style={{
                        color:
                          selected === b.id
                            ? b.color
                            : "rgba(245,240,232,0.75)",
                      }}
                    >
                      {b.name}
                    </p>
                    <p className="font-mono text-[6px] md:text-[8px] tracking-[0.2em] text-crema/30 mt-0.5">
                      {b.sub}
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── PANEL INFO (popup al clicar botella) ── */}
      <AnimatePresence>
        {info && (
          <motion.div
            key={info.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 z-[25]"
            style={{
              bottom: "calc(10vh + 3.5rem)",
              transform: "translateX(-50%)",
              width: "min(420px, calc(100vw - 2rem))",
              pointerEvents: "auto",
            }}
          >
            <div
              className="relative border backdrop-blur-sm px-5 py-4"
              style={{
                background: "rgba(20,17,15,0.95)",
                borderColor: info.color + "33",
                borderTopColor: info.color,
              }}
            >
              {/* Cerrar */}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-crema/25 hover:text-crema transition-colors"
                aria-label="Cerrar"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2 2l12 12M14 2L2 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <div className="pr-8">
                <p
                  className="text-[8px] tracking-[0.4em] uppercase font-mono mb-0.5"
                  style={{ color: info.color + "90" }}
                >
                  {info.tagline}
                </p>
                <h3
                  className="font-bebas text-[2.1rem] leading-none tracking-wide mb-2"
                  style={{ color: info.color }}
                >
                  {info.name}
                </h3>
                <div className="flex items-center gap-3 mb-2.5">
                  <NivelDots nivel={info.nivel} color={info.color} />
                  <span className="font-mono text-[8px] text-crema/30 tracking-widest">
                    {info.scoville}
                  </span>
                </div>
                <p className="text-[11px] text-crema/50 font-sans leading-relaxed mb-3">
                  {info.descripcion}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      window.dispatchEvent(new Event("open-tienda"));
                    }}
                    className="flex-1 py-2.5 font-bebas text-sm tracking-[0.2em] uppercase text-crema border-0 cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ background: info.color }}
                  >
                    Pedir — ${info.precio}
                  </button>
                  <a
                    href={`/salsas#${info.id}`}
                    className="text-[9px] font-mono tracking-[0.25em] text-crema/30 hover:text-crema/60 uppercase transition-colors whitespace-nowrap"
                  >
                    Ver más →
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
