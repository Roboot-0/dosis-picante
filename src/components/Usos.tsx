"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const usosHome = [
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

const usosSalsas = [
  {
    id: "microdosis",
    numero: "01",
    nombre: "MICRODOSIS",
    contexto: "Todos los días",
    copy: "Huevos, pasta, empanadas, lo que sea. La Microdosis no hace ruido — hace que cualquier plato sea mejor sin dominarlo.",
    imagen: "/images/salsas-microdosis.jpg",
    color: "#D97706",
    tag: "Uso diario",
  },
  {
    id: "ahumadosis",
    numero: "02",
    nombre: "AHUMADOSIS",
    contexto: "Parrilla y carnes",
    copy: "El ahumado se mete en la carne antes de que el fuego llegue. Para cortes a la parrilla, hamburguesas, marinadas. La diferencia se nota en el primer mordisco.",
    imagen: "/images/salsas-ahumadosis.jpg",
    color: "#EA580C",
    tag: "Parrilla y asados",
  },
  {
    id: "sobredosis",
    numero: "03",
    nombre: "SOBREDOSIS",
    contexto: "Experiencias extremas",
    copy: "Alitas, retos, salsas base. Una gota en el momento correcto lo cambia todo. No la uses si no estás listo.",
    imagen: "/images/salsas-sobredosis.jpg",
    color: "#DC2626",
    tag: "No para todos",
  },
];

export default function Usos({ variant = "home" }: { variant?: "home" | "salsas" }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const headerY = useTransform(scrollYProgress, [0, 0.4], [40, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  const usos = variant === "salsas" ? usosSalsas : usosHome;

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
              {variant === "salsas" ? "Cómo usarlas" : "En la mesa"}
            </span>
          </div>
          <h2 className="font-bebas text-[clamp(2.8rem,6vw,4.5rem)] leading-none text-crema">
            {variant === "salsas" ? (
              <>
                CADA SALSA,
                <br />
                <span className="text-rojo">SU MOMENTO.</span>
              </>
            ) : (
              <>
                ASÍ SE VE
                <br />
                <span className="text-rojo">EN ACCIÓN.</span>
              </>
            )}
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

type UsoItem = (typeof usosHome)[0];

function UsoCard({
  uso,
  index,
}: {
  uso: UsoItem;
  index: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <Link href={`/salsas#${uso.id}`} className="block group">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ type: "spring", stiffness: 60, damping: 16, delay: index * 0.12 }}
        whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
        className="relative bg-carbon overflow-hidden cursor-pointer"
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

          {/* CTA hover */}
          <div className="absolute bottom-20 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span
              className="font-bebas text-[11px] tracking-[0.3em] uppercase flex items-center gap-1.5"
              style={{ color: uso.color }}
            >
              Ver salsa
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
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
          className="h-px w-0 group-hover:w-full transition-all duration-500"
          style={{ background: `${uso.color}60` }}
        />
      </motion.div>
    </Link>
  );
}
