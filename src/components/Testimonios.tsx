"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

/* ──────────────────────────────────────────────────────
   PLACEHOLDER — Reemplaza con testimonios reales.
   Cada objeto: nombre, ciudad, texto, salsa (opcional).
   ────────────────────────────────────────────────────── */
const testimonios = [
  {
    nombre: "Andrés M.",
    ciudad: "Caracas",
    texto:
      "Le puse MICRODOSIS a unas arepas de pabellón y no había vuelta atrás. Ahora es fija en la mesa.",
    salsa: "MICRODOSIS",
  },
  {
    nombre: "Valentina R.",
    ciudad: "Valencia",
    texto:
      "AHUMADOSIS en la parrilla del domingo cambió todo. El ahumado llega primero, después el calor. Adictiva.",
    salsa: "AHUMADOSIS",
  },
  {
    nombre: "Carlos P.",
    ciudad: "Maracaibo",
    texto:
      "Compré SOBREDOSIS de broma para un reto entre amigos. Ahora la uso en serio — dos gotas en una sopa y la transforma.",
    salsa: "SOBREDOSIS",
  },
  {
    nombre: "María G.",
    ciudad: "Caracas",
    texto:
      "Pedí el Kit completo por curiosidad. Ya van tres pedidos y todavía no decido cuál es mi favorita.",
    salsa: "KIT DOSIS",
  },
];

const colorPorSalsa: Record<string, string> = {
  MICRODOSIS: "#D97706",
  AHUMADOSIS: "#EA580C",
  SOBREDOSIS: "#DC2626",
  "KIT DOSIS": "#DC2626",
};

export default function Testimonios() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  /* Autoplay en móvil — carrusel automático cada 5s */
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonios.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-28 bg-carbon relative overflow-hidden">
      {/* Línea superior */}
      <div className="absolute top-0 left-0 right-0 h-px linea-fuego" />

      <div ref={ref} className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="h-px w-8 bg-rojo" />
          <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">
            Quienes Probaron
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-bebas text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-crema mb-14"
        >
          LO QUE DICEN <span className="text-rojo">LOS QUE SABEN.</span>
        </motion.h2>

        {/* Grid desktop / Carrusel mobile */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {testimonios.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              className="border border-carbon-medio p-8 relative group hover:border-rojo/30 transition-colors duration-500"
            >
              {/* Comillas decorativas */}
              <span
                className="absolute top-4 right-6 font-bebas text-6xl leading-none opacity-10 select-none"
                style={{ color: colorPorSalsa[t.salsa] || "#DC2626" }}
              >
                &ldquo;
              </span>

              <p className="text-crema/70 font-sans font-300 leading-relaxed mb-6 text-base relative z-10">
                &ldquo;{t.texto}&rdquo;
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-crema font-sans font-600 text-sm">{t.nombre}</p>
                  <p className="text-crema/30 font-mono text-xs">{t.ciudad}</p>
                </div>
                {t.salsa && (
                  <span
                    className="font-mono text-[10px] tracking-[0.2em] px-3 py-1 border uppercase"
                    style={{
                      color: colorPorSalsa[t.salsa] || "#DC2626",
                      borderColor: `${colorPorSalsa[t.salsa] || "#DC2626"}33`,
                    }}
                  >
                    {t.salsa}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: un testimonio a la vez + dots */}
        <div className="md:hidden">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="border border-carbon-medio p-8 relative"
          >
            <span
              className="absolute top-4 right-6 font-bebas text-6xl leading-none opacity-10 select-none"
              style={{ color: colorPorSalsa[testimonios[active].salsa] || "#DC2626" }}
            >
              &ldquo;
            </span>

            <p className="text-crema/70 font-sans font-300 leading-relaxed mb-6 text-base relative z-10">
              &ldquo;{testimonios[active].texto}&rdquo;
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-crema font-sans font-600 text-sm">{testimonios[active].nombre}</p>
                <p className="text-crema/30 font-mono text-xs">{testimonios[active].ciudad}</p>
              </div>
              {testimonios[active].salsa && (
                <span
                  className="font-mono text-[10px] tracking-[0.2em] px-3 py-1 border uppercase"
                  style={{
                    color: colorPorSalsa[testimonios[active].salsa] || "#DC2626",
                    borderColor: `${colorPorSalsa[testimonios[active].salsa] || "#DC2626"}33`,
                  }}
                >
                  {testimonios[active].salsa}
                </span>
              )}
            </div>
          </motion.div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonios.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Testimonio ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === active ? "bg-rojo scale-125" : "bg-carbon-medio"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
