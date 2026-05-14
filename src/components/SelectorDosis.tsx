"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import MoleculaFondo from "@/components/MoleculaFondo";

const preguntas = [
  {
    id: "tolerancia",
    texto: "¿Cómo describes tu relación con el picante?",
    opciones: [
      { label: "Le pongo salsa a todo pero tampoco soy masoquista",     valor: "bajo"  },
      { label: "Me gusta que pique de verdad, no ese picor de mentira", valor: "medio" },
      { label: "Mientras más picante, mejor. Sin excepciones.",          valor: "alto"  },
    ],
  },
  {
    id: "ocasion",
    texto: "¿Para qué la usas más?",
    opciones: [
      { label: "El día a día: huevos, pasta, lo que sea",         valor: "bajo"  },
      { label: "Parrilla, hamburguesas, cosas con sustancia",     valor: "medio" },
      { label: "Retos, alitas, experiencias extremas",            valor: "alto"  },
    ],
  },
];

type Nivel = "bajo" | "medio" | "alto";

const resultados: Record<Nivel, {
  id: string; nombre: string; tagline: string; desc: string;
  precio: number; color: string; img: string; shu: string;
}> = {
  bajo: {
    id: "microdosis",
    nombre: "MICRODOSIS",
    tagline: "Tu puerta de entrada",
    desc: "Habanero + Ají dulce venezolano. Frutal, con calor que llega despacio. Para usar todos los días en todo.",
    precio: 6,
    color: "#D97706",
    img: "/images/microdosis-clean.png",
    shu: "~40,000 SHU",
  },
  medio: {
    id: "ahumadosis",
    nombre: "AHUMADOSIS",
    tagline: "La que convierte",
    desc: "Habanero + Carolina Reaper ahumado. El ahumado llega primero, el fuego después. La más adictiva de las tres.",
    precio: 6,
    color: "#EA580C",
    img: "/images/ahumadosis-clean.png",
    shu: "~100,000 SHU",
  },
  alto: {
    id: "sobredosis",
    nombre: "SOBREDOSIS",
    tagline: "La última advertencia",
    desc: "Carolina Reaper + Trinidad Scorpion. Se instala y se queda. Para quien ya conoce su límite y decide ignorarlo.",
    precio: 12,
    color: "#DC2626",
    img: "/images/sobredosis-clean.png",
    shu: "~1,200,000 SHU",
  },
};

const salsasOrden: Nivel[] = ["bajo", "medio", "alto"];

function calcularNivel(respuestas: string[]): Nivel {
  const conteo: Record<string, number> = { bajo: 0, medio: 0, alto: 0 };
  respuestas.forEach((r) => { conteo[r] = (conteo[r] || 0) + 1; });
  return (Object.entries(conteo).sort((a, b) => b[1] - a[1])[0][0]) as Nivel;
}

// ── Pantalla de resultado extraída para evitar IIFE ──
function Resultado({ nivel, onReiniciar }: { nivel: Nivel; onReiniciar: () => void }) {
  const r = resultados[nivel];
  return (
    <motion.div
      key="resultado"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 md:p-12"
    >
      <p className="font-mono text-[10px] tracking-[0.35em] text-crema/30 uppercase mb-6 text-center">
        Tu fórmula es
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Imagen */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{ filter: `drop-shadow(0 12px 32px ${r.color}60)` }}
          >
            <Image
              src={r.img} alt={r.nombre} width={240} height={131}
              className="object-contain w-[180px]"
              style={{
                maskImage: "linear-gradient(to bottom, black 55%, transparent 92%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 92%)",
              }}
            />
          </motion.div>
          <div className="text-center">
            <h3 className="font-bebas text-4xl tracking-wide" style={{ color: r.color }}>
              {r.nombre}
            </h3>
            <p className="font-mono text-xs text-crema/30 tracking-widest mt-1">{r.shu}</p>
          </div>
        </div>

        {/* Info + CTAs */}
        <div className="space-y-5">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase font-sans mb-2" style={{ color: r.color }}>
              {r.tagline}
            </p>
            <p className="text-crema/60 font-sans text-sm leading-relaxed">{r.desc}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-bebas text-4xl leading-none" style={{ color: r.color }}>${r.precio}</span>
            <span className="font-mono text-xs text-crema/30 tracking-widest">
              USD · {r.id === "sobredosis" ? "30 ml" : "50 ml"} gotero
            </span>
          </div>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-tienda"))}
            className="w-full py-4 font-bebas text-lg tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer border-0 text-crema hover:opacity-90"
            style={{ background: r.color, boxShadow: `0 0 30px ${r.color}40` }}
          >
            Pedir {r.nombre} — ${r.precio}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-tienda"))}
              className="flex-1 py-3 border border-carbon-medio text-crema/40 font-sans text-xs tracking-[0.2em] uppercase hover:border-crema/20 hover:text-crema/60 transition-all cursor-pointer bg-transparent"
            >
              Ver el Kit ($22)
            </button>
            <button
              type="button"
              onClick={onReiniciar}
              className="py-3 px-4 border border-carbon-medio text-crema/25 font-mono text-xs hover:border-crema/20 hover:text-crema/40 transition-all cursor-pointer bg-transparent"
              aria-label="Volver a empezar"
            >
              ↺
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SelectorDosis() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<string[]>([]);

  const responder = (valor: string) => {
    const nuevas = [...respuestas, valor];
    setRespuestas(nuevas);
    if (nuevas.length >= preguntas.length) {
      setPaso(3);
    } else {
      setPaso(paso + 1);
    }
  };

  const reiniciar = () => { setPaso(0); setRespuestas([]); };

  const preguntaActual = paso >= 1 && paso <= 2 ? preguntas[paso - 1] : null;

  return (
    <section className="py-32 bg-carbon relative">
      <div className="absolute top-0 left-0 right-0 h-px linea-fuego" aria-hidden="true" />

      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-8 bg-rojo" />
            <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">
              Encuentra tu fórmula
            </span>
            <div className="h-px w-8 bg-rojo" />
          </div>
          <h2 className="font-bebas text-[clamp(2.8rem,7vw,5rem)] leading-none text-crema">
            ¿CUÁL ES
            <br />
            <span className="text-rojo">TU DOSIS?</span>
          </h2>
          <p className="text-crema/40 font-sans text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Dos preguntas. Una respuesta. Sin adivinar.
          </p>
        </motion.div>

        {/* Contenedor de pasos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border border-carbon-medio bg-carbon-claro relative overflow-hidden"
        >
          {/* Molécula visible dentro del card */}
          <MoleculaFondo opacity={0.055} color="#78716C" scale={0.85} />
          <AnimatePresence mode="wait">

            {/* INTRO */}
            {paso === 0 && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-10 md:p-14 text-center"
              >
                <div className="flex justify-center items-end gap-8 mb-10">
                  {salsasOrden.map((nivel, i) => {
                    const s = resultados[nivel];
                    return (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <Image
                          src={s.img}
                          alt={s.nombre}
                          width={160}
                          height={87}
                          className="object-contain w-[130px]"
                          style={{
                            filter: `drop-shadow(0 4px 16px ${s.color}50)`,
                            maskImage: "linear-gradient(to bottom, black 52%, transparent 90%)",
                            WebkitMaskImage: "linear-gradient(to bottom, black 52%, transparent 90%)",
                          }}
                        />
                        <span className="font-mono text-[8px] tracking-widest uppercase" style={{ color: s.color }}>
                          {s.nombre}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-rojo text-crema font-bebas text-xl tracking-[0.25em] uppercase hover:bg-rojo-oscuro transition-colors duration-300 cursor-pointer border-0"
                  style={{ boxShadow: "0 0 30px #DC262630" }}
                >
                  Descubrir mi salsa
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            )}

            {/* PREGUNTAS */}
            {preguntaActual && (
              <motion.div
                key={`pregunta-${paso}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="p-8 md:p-12"
              >
                {/* Barra de progreso */}
                <div className="flex items-center gap-2 mb-8">
                  {preguntas.map((_, i) => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 transition-all duration-500 ${
                        i < paso - 1 ? "bg-rojo" : i === paso - 1 ? "bg-rojo/60" : "bg-carbon-medio"
                      }`}
                    />
                  ))}
                </div>

                <p className="font-mono text-[10px] tracking-[0.3em] text-crema/30 uppercase mb-3">
                  Pregunta {paso} de {preguntas.length}
                </p>
                <h3 className="font-bebas text-[clamp(1.6rem,4vw,2.5rem)] text-crema leading-tight mb-8">
                  {preguntaActual.texto}
                </h3>

                <div className="space-y-3">
                  {preguntaActual.opciones.map((op, oi) => (
                    <motion.button
                      key={op.valor}
                      type="button"
                      onClick={() => responder(op.valor)}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 22, delay: oi * 0.06 }}
                      whileHover={{ x: 10, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left px-6 py-4 border border-carbon-medio hover:border-rojo/50 hover:bg-rojo/5 transition-colors duration-200 group cursor-pointer bg-carbon"
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full bg-carbon-medio flex-shrink-0"
                          whileHover={{ backgroundColor: "#DC2626", scale: 1.5 }}
                        />
                        <span className="font-sans text-sm text-crema/60 group-hover:text-crema transition-colors leading-relaxed">
                          {op.label}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* RESULTADO */}
            {paso === 3 && (
              <Resultado key="resultado" nivel={calcularNivel(respuestas)} onReiniciar={reiniciar} />
            )}

          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center font-mono text-[9px] tracking-[0.3em] text-crema/20 uppercase mt-6"
        >
          ¿No sabes cuál elegir? El Kit DOSIS trae las tres por $22.
        </motion.p>
      </div>
    </section>
  );
}
