"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const pasos = [
  {
    num: "01",
    titulo: "Fermentación al vacío",
    texto:
      "Los chiles se sellan sin oxígeno. Las bacterias lácticas naturales producen ácido láctico que preserva el producto — sin conservantes artificiales.",
  },
  {
    num: "02",
    titulo: "Matraz Erlenmeyer",
    texto:
      "Equipo de microbiología de laboratorio. El CO₂ escapa sin dejar entrar contaminantes. Sí, como en un laboratorio de química. Porque esto es ciencia.",
  },
  {
    num: "03",
    titulo: "Tiempo sin atajos",
    texto:
      "Cada lote toma varios meses. La fermentación prolongada desarrolla el sabor característico. No hay forma de apurar esto.",
  },
  {
    num: "04",
    titulo: "Un solo aditivo",
    texto:
      "Vinagre para estabilizar el pH. Nada más. Todo lo demás es naturaleza, bacterias y paciencia.",
  },
];

export default function Historia() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const refProceso = useRef(null);
  const inViewProceso = useInView(refProceso, { once: true, margin: "-80px" });

  return (
    <>
      {/* ── HISTORIA ── */}
      <section id="historia" className="relative py-32 bg-carbon overflow-hidden">
        <div className="linea-fuego" />
        <div className="max-w-7xl mx-auto px-6 pt-16">

          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-16"
          >
            <div className="h-px w-8 bg-rojo" />
            <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">
              Origen · Caracas, Venezuela
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Columna izquierda — imagen */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative aspect-[4/3] overflow-hidden border border-carbon-medio">
                <Image
                  src="/images/caracas.jpg"
                  alt="Vista de Caracas — donde nació DOSIS"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-mono text-xs text-crema/50 tracking-widest">
                    Caracas, Venezuela · Terraza donde cultivan los chiles
                  </p>
                </div>
              </div>
              {/* Imagen proceso superpuesta */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="absolute -bottom-8 -right-4 w-40 h-40 border-2 border-carbon overflow-hidden hidden lg:block"
              >
                <Image
                  src="/images/fermentacion.jpg"
                  alt="Fermentación natural DOSIS"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </motion.div>

            {/* Columna derecha — texto */}
            <div className="space-y-7 lg:pt-4">
              <div className="overflow-hidden">
                <motion.h2
                  custom={0}
                  variants={fadeUp}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  className="font-bebas text-[clamp(3rem,7vw,5rem)] leading-none tracking-tight text-crema"
                >
                  NACIÓ EN UNA
                  <br />
                  <span className="text-rojo">TERRAZA.</span>
                </motion.h2>
              </div>

              <motion.p
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="text-lg text-crema/70 font-sans font-300 leading-relaxed"
              >
                Somos cuatro amigos. Dos ingenieros, un economista y un
                marketero. Nos une lo mismo: nos gusta comer bien, probar
                cosas nuevas y compartir una mesa con las personas que queremos.
              </motion.p>

              <motion.p
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="text-lg text-crema/70 font-sans font-300 leading-relaxed"
              >
                Hace más de cuatro años nos dimos cuenta de algo que nos
                frustraba: en Venezuela no existía un picante que fuera más
                allá de lo tradicional. Las mismas salsas de siempre, los
                mismos sabores predecibles.
              </motion.p>

              <motion.p
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="text-base text-crema/50 font-sans font-300 leading-relaxed border-l-2 border-rojo pl-5 italic"
              >
                "Así que dejamos de buscar y empezamos a crear. Cada reunión
                era un laboratorio informal. Y el veredicto fue siempre el
                mismo: ¿cuándo van a vender esto?"
              </motion.p>

              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid grid-cols-2 gap-4 pt-2"
              >
                {[
                  { n: "4+", l: "años perfeccionando" },
                  { n: "4", l: "fundadores" },
                  { n: "100%", l: "ingredientes naturales" },
                  { n: "0", l: "conservantes añadidos" },
                ].map((s) => (
                  <div key={s.l} className="border border-carbon-medio p-4">
                    <div className="font-bebas text-3xl text-rojo">{s.n}</div>
                    <div className="text-xs text-crema/40 font-sans tracking-wider uppercase mt-1">{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section className="py-32 bg-carbon-claro relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            ref={refProceso}
            initial={{ opacity: 0, y: 30 }}
            animate={inViewProceso ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-rojo" />
              <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">
                Fermentación Natural
              </span>
            </div>
            <h2 className="font-bebas text-[clamp(3rem,6vw,4.5rem)] leading-none text-crema">
              NUESTRAS SALSAS
              <br />
              <span className="text-rojo">NO SE COCINAN.</span>
              <br />
              SE FERMENTAN.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Imagen laboratorio */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative aspect-[4/3] overflow-hidden border border-carbon-medio"
            >
              <Image
                src="/images/fermentacion.jpg"
                alt="Proceso de fermentación DOSIS"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbon/70 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-mono text-xs text-crema/50 tracking-widest">
                  Matraces Erlenmeyer con válvula airlock · Equipo de microbiología
                </p>
              </div>
            </motion.div>

            {/* Pasos */}
            <div className="space-y-0">
              {pasos.map((paso, i) => (
                <motion.div
                  key={paso.num}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-6 py-6 border-b border-carbon-medio last:border-0 group"
                >
                  <span className="font-mono text-xs text-rojo tracking-widest pt-1 flex-shrink-0 w-8">
                    {paso.num}
                  </span>
                  <div>
                    <h4 className="font-sans font-600 text-crema text-base mb-1 group-hover:text-rojo transition-colors">
                      {paso.titulo}
                    </h4>
                    <p className="text-sm text-crema/50 font-sans font-300 leading-relaxed">
                      {paso.texto}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Sin / Con */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 gap-px bg-carbon-medio mt-6"
              >
                <div className="bg-carbon p-5">
                  <p className="font-mono text-xs text-rojo tracking-widest mb-3">✕ NO TIENE</p>
                  <p className="text-xs text-crema/40 font-sans leading-loose">
                    Conservantes artificiales<br />
                    Colorantes<br />
                    Saborizantes<br />
                    Espesantes
                  </p>
                </div>
                <div className="bg-carbon p-5">
                  <p className="font-mono text-xs text-[#25D366] tracking-widest mb-3">✓ SÍ TIENE</p>
                  <p className="text-xs text-crema/40 font-sans leading-loose">
                    Chiles frescos naturales<br />
                    Vinagre (estabilizar pH)<br />
                    Fermentación prolongada<br />
                    Tiempo y paciencia
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
