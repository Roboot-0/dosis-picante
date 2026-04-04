"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function CTAFinal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contacto" className="relative py-40 bg-carbon-claro overflow-hidden">
      {/* Fondo con gradiente fuego */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, #DC262612 0%, #D9770608 40%, transparent 70%)",
        }}
      />

      {/* Patrón molecular decorativo */}
      <div className="absolute top-0 left-0 right-0 h-px linea-fuego" />
      <div className="absolute bottom-0 left-0 right-0 h-px linea-fuego" />

      <div ref={ref} className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="h-px w-12 bg-rojo" />
          <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">
            Experimenta El Picor
          </span>
          <div className="h-px w-12 bg-rojo" />
        </motion.div>

        <div className="overflow-hidden mb-6">
          <motion.h2
            initial={{ y: "100%" }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-bebas text-[clamp(3.5rem,10vw,7rem)] leading-none text-crema"
          >
            ¿LISTO PARA
          </motion.h2>
        </div>
        <div className="overflow-hidden mb-10">
          <motion.h2
            initial={{ y: "100%" }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-bebas text-[clamp(3.5rem,10vw,7rem)] leading-none text-fuego"
          >
            TU DOSIS?
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg text-crema/60 font-sans font-300 mb-12 max-w-lg mx-auto leading-relaxed"
        >
          Escríbenos por WhatsApp. Te contamos qué salsa es para ti,
          te hacemos el pedido y te lo llevamos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* CTA principal → abre el checkout modal */}
          <button
            onClick={() => window.dispatchEvent(new Event("open-tienda"))}
            className="group relative flex items-center gap-3 px-10 py-5 bg-rojo text-crema font-bebas text-xl tracking-[0.2em] uppercase overflow-hidden hover:bg-rojo-oscuro transition-colors duration-300"
          >
            Pedir Ahora
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:translate-x-1 transition-transform duration-200">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          {/* Instagram */}
          <a
            href="https://instagram.com/dosis_ve"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-10 py-5 border border-crema/20 text-crema/70 font-bebas text-xl tracking-[0.2em] uppercase hover:border-rojo hover:text-rojo transition-all duration-300"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Seguir en Instagram
          </a>
        </motion.div>

        {/* Fórmula como firma */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 text-xs tracking-[0.4em] text-crema/20 font-sans uppercase"
        >
          C18H27NO3 — Capsaicina. La razón de todo.
        </motion.p>
      </div>
    </section>
  );
}
