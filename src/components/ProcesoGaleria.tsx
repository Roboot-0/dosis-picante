"use client";

import { motion, useScroll, useTransform, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";

const fotos = [
  {
    src: "/images/proceso-chiles-rojos-bandeja.jpg",
    objectPosition: "50% 50%",
    alt: "Habaneros rojos maduros en bandeja de acero — materia prima DOSIS Picante",
    label: "Los ingredientes",
    desc: "Habaneros rojos seleccionados a mano. Sin atajos.",
  },
  {
    src: "/images/plantacion-03.jpg",
    objectPosition: "50% 50%",
    alt: "Carolina Reaper y Trinidad Scorpion cultivados en terraza de Caracas — DOSIS Picante",
    label: "La plantación",
    desc: "Cultivamos personalmente en la terraza los chiles super picantes Carolina Reaper y Scorpion.",
  },
  {
    src: "/images/flores-macro-02.jpg",
    objectPosition: "50% 50%",
    alt: "Flor de chile en macro — el inicio de cada salsa DOSIS",
    label: "El origen",
    desc: "Cada gota empieza aquí.",
  },
  {
    src: "/images/produccion-01.jpg",
    objectPosition: "50% 50%",
    alt: "Proceso de producción artesanal DOSIS Picante",
    label: "La producción",
    desc: "Artesanal. Sin línea de ensamblaje.",
  },
  {
    src: "/images/proceso-chiles-amarillos-bandeja.jpg",
    objectPosition: "50% 50%",
    alt: "Ajíes amarillos frescos en bandeja — materia prima DOSIS Picante",
    label: "Materia prima",
    desc: "Chiles cultivados en la terraza. Cosechados a mano.",
  },
  {
    src: "/images/caracas-desde-terraza.jpeg",
    objectPosition: "50% 88%",
    alt: "Vista de Caracas desde la terraza con semilleros en primer plano — donde empezó DOSIS",
    label: "Caracas",
    desc: "Donde empezó todo.",
  },
];

function AnimatedStat({ n, suffix, label }: { n: number; suffix: string; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, n, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [inView, n]);

  return (
    <div ref={ref} className="bg-carbon p-6 md:p-8 text-center">
      <div className="font-bebas text-4xl md:text-5xl text-rojo leading-none mb-1">
        {display}{suffix}
      </div>
      <div className="font-mono text-[9px] text-crema/30 tracking-[0.25em] uppercase">{label}</div>
    </div>
  );
}

function FotoCard({ foto, index }: { foto: typeof fotos[0]; index: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.1 }}
      className="group relative overflow-hidden bg-carbon-claro border border-carbon-medio"
    >
      {/* Foto con parallax */}
      <div className="relative overflow-hidden" style={{ height: index % 3 === 1 ? "420px" : "320px" }}>
        <motion.div
          style={{ y: imgY }}
          className="absolute inset-[-10%] w-[120%] h-[120%]"
        >
          <Image
            src={foto.src}
            alt={foto.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            style={{ objectPosition: foto.objectPosition }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/20 to-transparent z-10" />

        {/* Label arriba */}
        <div className="absolute top-4 left-4 z-20">
          <span className="font-mono text-[9px] tracking-[0.35em] text-crema/50 uppercase border border-crema/15 px-2.5 py-1 bg-carbon/60 backdrop-blur-sm">
            {foto.label}
          </span>
        </div>
      </div>

      {/* Texto */}
      <div className="px-5 py-4 border-t border-carbon-medio">
        <p className="font-sans text-xs text-crema/40 leading-relaxed">{foto.desc}</p>
      </div>

      {/* Línea inferior animada */}
      <div className="h-px w-0 group-hover:w-full transition-all duration-500 bg-rojo/40" />
    </motion.div>
  );
}

export default function ProcesoGaleria() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "center center"] });
  const headerY = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <section className="py-32 bg-carbon-claro relative overflow-hidden">
      {/* Línea top */}
      <div className="absolute top-0 left-0 right-0 h-px linea-fuego" aria-hidden="true" />

      <div ref={containerRef} className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-8 bg-rojo" />
            <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">
              Hecho a mano · Caracas
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="font-bebas text-[clamp(2.8rem,6vw,4.5rem)] leading-none text-crema">
              EL PROCESO
              <br />
              <span className="text-rojo">ES EL PRODUCTO.</span>
            </h2>
            <div className="max-w-xs">
              <p className="text-crema/40 font-sans text-sm leading-relaxed mb-4">
                Cada lote tarda meses. No existe una versión más rápida. Así es como se hace bien.
              </p>
              {/* CTA inline */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-tienda"))}
                className="inline-flex items-center gap-2 font-bebas text-sm tracking-[0.25em] text-rojo uppercase hover:text-rojo-oscuro transition-colors cursor-pointer bg-transparent border-0 p-0 group"
              >
                Probar ahora
                <span className="w-5 h-px bg-rojo group-hover:w-8 transition-all duration-300" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Grid de fotos — 3 columnas desktop, masonry-like */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-carbon-medio">
          {fotos.map((foto, i) => (
            <FotoCard key={foto.src} foto={foto} index={i} />
          ))}
        </div>

        {/* Stats + CTA al final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-px bg-carbon-medio border border-carbon-medio"
        >
          {[
            { n: 4, suffix: "+", l: "años perfeccionando" },
            { n: 100, suffix: "%", l: "ingredientes naturales" },
            { n: 0, suffix: "", l: "conservantes añadidos" },
            { n: 3, suffix: "", l: "fórmulas únicas" },
          ].map((s) => (
            <AnimatedStat key={s.l} n={s.n} suffix={s.suffix} label={s.l} />
          ))}
        </motion.div>

        {/* CTA final de la sección */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-tienda"))}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-rojo text-crema font-bebas text-xl tracking-[0.25em] uppercase hover:bg-rojo-oscuro transition-colors duration-300 cursor-pointer border-0"
            style={{ boxShadow: "0 0 40px #DC262635" }}
          >
            Quiero las salsas
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-200">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <p className="font-mono text-[9px] tracking-[0.3em] text-crema/20 uppercase mt-4">
            Entrega en Caracas · Envíos a todo el país
          </p>
        </motion.div>

      </div>
    </section>
  );
}
