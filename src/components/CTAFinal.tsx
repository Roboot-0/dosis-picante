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
          Haz tu pedido en menos de dos minutos. Te contamos qué
          salsa es para ti, la preparamos y te la llevamos.
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

          {/* WhatsApp — contacto directo */}
          <a
            href="https://wa.me/584241788803?text=Hola%20DOSIS%2C%20quiero%20hablar%20con%20ustedes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-10 py-5 border border-crema/20 text-crema/70 font-bebas text-xl tracking-[0.2em] uppercase hover:border-rojo hover:text-rojo transition-all duration-300"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
            </svg>
            Hablemos
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
