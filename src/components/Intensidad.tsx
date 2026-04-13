"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString("es-ES") + suffix);

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

// Orden estrictamente ascendente por SHU
const niveles = [
  {
    nombre: "MICRODOSIS [01]",
    scoville: "~40,000",
    shu: 40000,
    comparacion: "8× más picante que Tabasco",
    porcentaje: 12,
    color: "#D97706",
    descripcion:
      "Habanero + Ají dulce venezolano. Tu primer encuentro con DOSIS. El calor llega como una conversación — despacio, con sabor, sin apresurarse.",
  },
  {
    nombre: "AHUMADOSIS [02]",
    scoville: "~100,000",
    shu: 100000,
    comparacion: "Nivel Habanero intenso",
    porcentaje: 38,
    color: "#EA580C",
    descripcion:
      "Habanero + Carolina Reaper ahumado. El ahumado llega primero. El fuego, después. Punto de no retorno.",
  },
  {
    nombre: "SOBREDOSIS [03]",
    scoville: "~1,200,000",
    shu: 1200000,
    comparacion: "240× más picante que Tabasco",
    porcentaje: 100,
    color: "#DC2626",
    descripcion:
      "Carolina Reaper + Trinidad Scorpion. No crece y se va — se instala. No te la recomendamos. Pero tampoco te la quitamos.",
  },
];

export default function Intensidad() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="intensidad" className="py-32 bg-carbon relative overflow-hidden">
      {/* Fórmula watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025] select-none">
        <span className="font-bebas text-[18vw] text-crema tracking-widest">C18H27NO3</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-8 bg-rojo" />
            <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans">
              La Ciencia del Picante
            </span>
          </div>
          <h2 className="font-bebas text-[clamp(3rem,7vw,5rem)] leading-none text-crema mb-4">
            ESCALA DE <span className="text-rojo">INTENSIDAD</span>
          </h2>
          <p className="text-crema/40 font-sans max-w-md text-sm leading-relaxed">
            Medido en Unidades Scoville (SHU). Orden ascendente — de menor a mayor intensidad.
          </p>
        </motion.div>

        {/* Barras de intensidad */}
        <div className="space-y-12 mb-24">
          {niveles.map((nivel, i) => (
            <motion.div
              key={nivel.nombre}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="lg:w-72 flex-shrink-0">
                  <h3
                    className="font-bebas text-3xl tracking-wide group-hover:text-rojo transition-colors"
                    style={{ color: nivel.color }}
                  >
                    {nivel.nombre}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-mono text-xl text-crema/70">{nivel.scoville}</span>
                    <span className="text-xs text-crema/30 font-mono uppercase tracking-wider">SHU</span>
                  </div>
                  <p className="text-xs text-crema/30 font-sans mt-1">{nivel.comparacion}</p>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="h-2 bg-carbon-medio overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${nivel.porcentaje}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.3, delay: i * 0.12 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full"
                      style={{
                        background: `linear-gradient(90deg, ${nivel.color}88, ${nivel.color})`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-crema/50 font-sans font-300 leading-relaxed">
                    {nivel.descripcion}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats — corregidos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-carbon-medio border border-carbon-medio"
        >
          {[
            { val: 16000000, suffix: "", label: "SHU máx. capsaicina pura" },
            { val: 100, suffix: "%", label: "Nuestras salsas son naturales" },
            { val: 0, suffix: "", label: "Conservantes añadidos" },
            { val: 3, suffix: "", label: "Fórmulas. Una para cada quien." },
          ].map((stat, i) => (
            <div key={i} className="bg-carbon-claro p-6 text-center">
              <div className="font-bebas text-4xl lg:text-5xl text-rojo mb-1">
                <AnimatedNumber value={stat.val} suffix={stat.suffix} />
              </div>
              <p className="text-xs text-crema/40 font-sans leading-relaxed mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
