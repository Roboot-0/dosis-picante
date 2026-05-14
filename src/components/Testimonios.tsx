"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const testimonios = [
  {
    id: "manuel",
    nombre: "Manuel R.",
    ciudad: "Maturín",
    salsa: "MICRODOSIS",
    salsaColor: "#D97706",
    quote:
      "Llegó el kit con las tres. Empecé con la Microdosis en unos perritos y uff, le gustó a toda la familia. Ya vamos por la Ahumadosis.",
    imagen: "/images/testimonio-manuel.jpg",
    objectPosition: "12% 58%",
    numero: "01",
  },
  {
    id: "alejandro",
    nombre: "Alejandro V.",
    ciudad: "Caracas",
    salsa: "SOBREDOSIS",
    salsaColor: "#DC2626",
    quote:
      "Dos gotas haciéndome el valiente. Le cambió la cara a la sopa y a mí también. No me arrepiento.",
    imagen: "/images/testimonio-alejandro.jpg",
    objectPosition: "18% 8%",
    numero: "02",
  },
  {
    id: "carlos",
    nombre: "Carlos M.",
    ciudad: "Caracas",
    salsa: "AHUMADOSIS",
    salsaColor: "#EA580C",
    quote:
      "La parrilla del domingo no es la misma desde que llegó la Ahumadosis. El ahumado se mete en la carne, el picante llega después. A mi familia le encanta.",
    imagen: "/images/lifestyle-carne-ahumadosis.jpg",
    objectPosition: "50% 5%",
    numero: "03",
  },
];

export default function Testimonios() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const headerY = useTransform(scrollYProgress, [0, 0.4], [50, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section
      id="testimonios"
      ref={containerRef}
      className="py-32 bg-carbon-claro overflow-hidden relative"
    >
      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-px linea-fuego" />

      {/* Número decorativo de fondo */}
      <div
        className="absolute -top-4 right-8 font-bebas text-[22vw] leading-none text-crema/[0.025] select-none pointer-events-none"
        aria-hidden="true"
      >
        REAL
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px w-8 bg-rojo" />
            <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">
              Los que ya saben
            </span>
          </div>
          <h2 className="font-bebas text-[clamp(2.8rem,6vw,4.5rem)] leading-none text-crema">
            LO QUE DICE
            <br />
            <span className="text-rojo">LA GENTE.</span>
          </h2>
        </motion.div>

        {/* Testimonios grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonios.map((t, i) => (
            <TestimonioCard key={t.id} testimonio={t} index={i} />
          ))}
        </div>

        {/* Firma inferior */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 text-center text-xs tracking-[0.4em] text-crema/25 font-mono uppercase"
        >
          Clientes reales. Sin filtros. Sin guiones.
        </motion.p>
      </div>

      {/* Línea decorativa inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px linea-fuego" />
    </section>
  );
}

function TestimonioCard({
  testimonio: t,
  index,
}: {
  testimonio: (typeof testimonios)[0];
  index: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative bg-carbon overflow-hidden"
    >
      {/* Foto con parallax */}
      <div className="relative h-[320px] sm:h-[380px] overflow-hidden">
        <motion.div
          style={{ y: imgY }}
          className="absolute inset-[-6%] w-[112%] h-[112%]"
        >
          <Image
            src={t.imagen}
            alt={`${t.nombre} usando DOSIS ${t.salsa}`}
            fill
            className="object-cover transition-transform duration-700 ease-out"
            style={{ objectPosition: t.objectPosition }}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-carbon/10 z-10" />

        {/* Badge de salsa */}
        <div className="absolute top-5 left-5 z-20">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.3 }}
            className="font-mono text-[9px] tracking-[0.3em] uppercase px-3 py-1.5 border"
            style={{
              color: t.salsaColor,
              borderColor: `${t.salsaColor}60`,
              background: `${t.salsaColor}18`,
            }}
          >
            {t.salsa}
          </motion.span>
        </div>

        {/* Número decorativo */}
        <span
          className="absolute top-4 right-5 font-bebas text-6xl leading-none opacity-15 select-none z-10"
          style={{ color: t.salsaColor }}
          aria-hidden="true"
        >
          {t.numero}
        </span>
      </div>

      {/* Contenido del testimonio */}
      <div className="relative z-20 px-7 pb-8 -mt-20">
        {/* Comilla gigante */}
        <div
          className="font-bebas text-[6rem] leading-[0.7] mb-3 select-none"
          style={{ color: `${t.salsaColor}40` }}
          aria-hidden="true"
        >
          "
        </div>

        <blockquote className="mb-6">
          <p className="text-crema font-sans font-300 text-lg sm:text-xl leading-snug">
            {t.quote}
          </p>
        </blockquote>

        {/* Firma */}
        <div className="flex items-center gap-3">
          <div
            className="h-px flex-shrink-0 w-6"
            style={{ background: t.salsaColor }}
          />
          <div>
            <p className="font-bebas tracking-widest text-crema text-base leading-none">
              {t.nombre}
            </p>
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase mt-0.5"
               style={{ color: `${t.salsaColor}90` }}>
              {t.ciudad}
            </p>
          </div>
        </div>
      </div>

      {/* Línea inferior animada */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: t.salsaColor }}
      />
    </motion.div>
  );
}
