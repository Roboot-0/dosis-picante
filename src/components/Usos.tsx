"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const usos = [
  {
    id: "microdosis",
    numero: "01",
    nombre: "MICRODOSIS",
    contexto: "El primer contacto",
    copy: "Unas gotas antes de cada mordisco de tu empanada, encima de unos huevos, en cualquier cosa que no debería tener salsa picante — y de repente la necesita.",
    imagen: "/images/uso-microdosis.jpg",
    color: "#D97706",
    tag: "Para todos los días",
  },
  {
    id: "ahumadosis",
    numero: "02",
    nombre: "AHUMADOSIS",
    contexto: "La que convierte",
    copy: "En una empanada, en un pastelito, en una parrilla del domingo. El ahumado llega primero y te convence. El fuego llega después, y se queda.",
    imagen: "/images/uso-ahumadosis.jpg",
    color: "#EA580C",
    tag: "Para cuando quieres más",
  },
  {
    id: "sobredosis",
    numero: "03",
    nombre: "SOBREDOSIS",
    contexto: "La última advertencia",
    copy: "No es para agregar sabor. Es para demostrar algo. Úsala con criterio — o no la uses.",
    imagen: "/images/uso-sobredosis.jpg",
    color: "#DC2626",
    tag: "No para todos",
  },
];

export default function Usos() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const headerY = useTransform(scrollYProgress, [0, 0.4], [40, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section id="usos" ref={containerRef} className="py-24 bg-carbon overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px w-8 bg-rojo" />
            <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">
              En la mesa
            </span>
          </div>
          <h2 className="font-bebas text-[clamp(2.8rem,6vw,4.5rem)] leading-none text-crema">
            ASÍ SE VE
            <br />
            <span className="text-rojo">EN ACCIÓN.</span>
          </h2>
        </motion.div>

        {/* Grid de usos — 3 imágenes full */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-carbon-medio">
          {usos.map((uso, i) => (
            <UsoCard key={uso.id} uso={uso} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function UsoCard({
  uso,
  index,
}: {
  uso: (typeof usos)[0];
  index: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.12 }}
      className="group relative bg-carbon overflow-hidden"
    >
      {/* Imagen con parallax */}
      <div className="relative h-[420px] lg:h-[520px] overflow-hidden">
        <motion.div style={{ y: imgY }} className="absolute inset-[-10%] w-[120%] h-[120%]">
          <Image
            src={uso.imagen}
            alt={`${uso.nombre} — ${uso.contexto}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        </motion.div>

        {/* Overlay gradiente bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent z-10" />

        {/* Número decorativo */}
        <span
          className="absolute top-5 right-5 font-bebas text-7xl leading-none opacity-20 select-none z-10"
          style={{ color: uso.color }}
        >
          {uso.numero}
        </span>

        {/* Tag pill */}
        <div className="absolute top-5 left-5 z-20">
          <span
            className="font-mono text-[9px] tracking-[0.3em] uppercase px-3 py-1.5 border"
            style={{ color: uso.color, borderColor: `${uso.color}60`, background: `${uso.color}15` }}
          >
            {uso.tag}
          </span>
        </div>
      </div>

      {/* Texto */}
      <div className="relative z-20 px-7 pb-8 -mt-16">
        <p className="text-[10px] tracking-[0.35em] uppercase font-sans mb-2" style={{ color: uso.color }}>
          {uso.contexto}
        </p>
        <h3 className="font-bebas text-3xl tracking-wide text-crema mb-3">
          {uso.nombre}
        </h3>
        <p className="text-sm text-crema/55 font-sans font-300 leading-relaxed">
          {uso.copy}
        </p>
      </div>

      {/* Línea inferior animada */}
      <div
        className="h-px w-0 group-hover:w-full transition-all duration-500 mx-7"
        style={{ background: uso.color }}
      />
    </motion.div>
  );
}
