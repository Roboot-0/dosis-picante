"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const salsas = [
  {
    id: "microdosis",
    nombre: "MICRODOSIS",
    numero: "01",
    tagline: "El primer contacto",
    descripcion:
      "Habanero + Ají dulce venezolano. Fermentada naturalmente. El calor llega despacio, con sabor y sin apresurarse. Tu puerta de entrada al universo DOSIS.",
    nivel: 1,
    scoville: "~40,000 SHU",
    ml: "50 ml",
    precio: 6,
    color: "#D97706",
    imagen: "/images/microdosis.png",
    lifestyle: "/images/uso-microdosis.jpg",
    tags: ["Habanero", "Ají dulce", "Frutal"],
    usos: ["Tacos y burritos", "Huevos y desayunos", "Carnes a la plancha", "Pastas y pizzas"],
  },
  {
    id: "ahumadosis",
    nombre: "AHUMADOSIS",
    numero: "02",
    tagline: "La que convierte",
    descripcion:
      "Habanero + Carolina Reaper ahumado. Un perfil profundo que empieza en el paladar y termina en adicción. El ahumado llega primero, el fuego después.",
    nivel: 2,
    scoville: "~100,000 SHU",
    ml: "50 ml",
    precio: 6,
    color: "#EA580C",
    imagen: "/images/ahumadosis.png",
    lifestyle: "/images/uso-ahumadosis.jpg",
    tags: ["Habanero", "Reaper ahumado", "Compleja"],
    usos: ["Parrillas y asados", "Hamburguesas gourmet", "Marinadas", "Sopas y guisos"],
  },
  {
    id: "sobredosis",
    nombre: "SOBREDOSIS",
    numero: "03",
    tagline: "La última advertencia",
    descripcion:
      "Carolina Reaper + Trinidad Scorpion. No crece y se va — se instala. Para quien ya conoce su límite y decide ignorarlo. No te la recomendamos. Pero tampoco te la quitamos.",
    nivel: 3,
    scoville: "~1,200,000 SHU",
    ml: "30 ml",
    precio: 12,
    color: "#DC2626",
    imagen: "/images/sobredosis.png",
    lifestyle: "/images/uso-sobredosis.jpg",
    tags: ["Carolina Reaper", "Trinidad Scorpion", "Extrema"],
    usos: ["Retos y experiencias", "Alitas picantes", "Salsas base", "Solo si lo mereces"],
  },
];

function NivelDots({ nivel }: { nivel: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all ${
            i <= nivel ? "bg-rojo scale-110" : "bg-carbon-medio"
          }`}
        />
      ))}
    </div>
  );
}

export default function Productos() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="productos" className="py-32 bg-carbon-claro relative">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div ref={ref} className="mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-px w-8 bg-rojo" />
            <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">
              Las Salsas
            </span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-bebas text-[clamp(3rem,7vw,5rem)] leading-none tracking-tight text-crema"
            >
              TRES FÓRMULAS.
              <br />
              <span className="text-rojo">UN SOLO PROPÓSITO.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-crema/40 font-sans text-sm max-w-xs leading-relaxed font-mono tracking-wider"
            >
              Fermentadas naturalmente.
              <br />
              Sin conservantes.
              <br />
              Hechas en Caracas.
            </motion.p>
          </div>
        </div>

        {/* Productos — layout alternado */}
        <div className="space-y-2">
          {salsas.map((salsa, i) => (
            <motion.div
              key={salsa.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group grid grid-cols-1 lg:grid-cols-2 gap-px bg-carbon-medio overflow-hidden"
            >
              {/* Imagen del producto */}
              <div
                className={`relative bg-carbon overflow-hidden min-h-[380px] ${
                  i % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"
                  style={{
                    background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${salsa.color}15, transparent)`,
                  }}
                />
                <Image
                  src={salsa.imagen}
                  alt={salsa.nombre}
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Número decorativo */}
                <span
                  className="absolute bottom-4 right-6 font-bebas text-8xl leading-none opacity-10 select-none"
                  style={{ color: salsa.color }}
                >
                  {salsa.numero}
                </span>
              </div>

              {/* Info del producto */}
              <div
                className={`bg-carbon p-10 lg:p-14 flex flex-col justify-center gap-6 ${
                  i % 2 === 1 ? "lg:order-1" : ""
                }`}
              >
                <div>
                  <p className="text-xs tracking-[0.4em] text-crema/30 uppercase font-sans mb-2">
                    {salsa.tagline}
                  </p>
                  <h3
                    className="font-bebas text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-wide mb-1"
                    style={{ color: salsa.color }}
                  >
                    {salsa.nombre}
                  </h3>
                  <div className="flex items-center gap-4 mt-3">
                    <NivelDots nivel={salsa.nivel} />
                    <span className="font-mono text-xs text-crema/30 tracking-widest">
                      {salsa.scoville}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3 mt-4">
                    <span
                      className="font-bebas text-4xl leading-none"
                      style={{ color: salsa.color }}
                    >
                      ${salsa.precio}
                    </span>
                    <span className="font-mono text-xs text-crema/40 tracking-widest uppercase">
                      {salsa.ml} · gotero
                    </span>
                  </div>
                </div>

                <p className="text-crema/60 font-sans font-300 text-base leading-relaxed max-w-md">
                  {salsa.descripcion}
                </p>

                <div className="flex flex-wrap gap-2">
                  {salsa.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 border border-carbon-medio text-crema/40 font-mono tracking-widest uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Usos / maridajes */}
                <div className="border-t border-carbon-medio pt-5">
                  <p className="text-[10px] tracking-[0.3em] text-crema/30 uppercase font-mono mb-3">
                    Úsala en
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {salsa.usos.map((uso) => (
                      <div key={uso} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: salsa.color }} />
                        <span className="text-xs text-crema/50 font-sans">{uso}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA individual */}
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("open-tienda"))}
                  className="inline-flex items-center gap-3 w-fit text-sm font-sans font-600 tracking-widest uppercase transition-all duration-300 group/link cursor-pointer bg-transparent border-0 p-0"
                  style={{ color: salsa.color }}
                >
                  Pedir esta salsa
                  <span className="w-6 h-px group-hover/link:w-10 transition-all duration-300" style={{ background: salsa.color }} />
                </button>

                <div
                  className="h-px w-0 group-hover:w-full transition-all duration-700"
                  style={{ background: `linear-gradient(90deg, ${salsa.color}, transparent)` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Kit CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-4 bg-carbon-medio grid grid-cols-1 lg:grid-cols-2 gap-px overflow-hidden"
        >
          <div className="relative bg-carbon min-h-[280px] overflow-hidden">
            <Image
              src="/images/kit.jpeg"
              alt="Kit DOSIS — las tres salsas"
              fill
              className="object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-carbon/60 to-transparent" />
          </div>
          <div className="bg-carbon p-10 lg:p-14 flex flex-col justify-center gap-6">
            <div>
              <p className="text-xs tracking-[0.4em] text-oro uppercase font-sans mb-2">
                Colección completa
              </p>
              <h3 className="font-bebas text-5xl text-crema leading-none">
                EL KIT <span className="text-rojo">DOSIS</span>
              </h3>
            </div>
            <p className="text-crema/60 font-sans font-300 leading-relaxed max-w-sm">
              Las tres fórmulas juntas. Para quien quiere la experiencia
              completa, de menor a mayor intensidad. O al revés.
            </p>
            <div className="flex items-baseline gap-3">
              <span className="font-bebas text-5xl text-rojo leading-none">$22</span>
              <span className="font-mono text-xs text-crema/40 tracking-widest uppercase">
                50+50+30 ml · ahorras $2
              </span>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-tienda"))}
              className="inline-flex items-center gap-3 w-fit px-8 py-4 bg-rojo text-crema font-bebas text-lg tracking-[0.2em] uppercase hover:bg-rojo-oscuro transition-colors duration-300 border-0 cursor-pointer"
            >
              Pedir el Kit
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
