"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { faqs } from "@/data/faqs";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" className="py-32 bg-carbon relative">
      <div className="max-w-4xl mx-auto px-6">
        <div ref={ref} className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-px w-8 bg-rojo" />
            <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">
              Preguntas Frecuentes
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-bebas text-[clamp(3rem,7vw,5rem)] leading-none tracking-tight text-crema"
          >
            TODO LO QUE
            <br />
            <span className="text-rojo">NECESITAS SABER.</span>
          </motion.h2>
        </div>

        <div className="divide-y divide-carbon-medio border-t border-b border-carbon-medio">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left group bg-transparent border-0 cursor-pointer"
                >
                  <div className="flex items-start gap-5 flex-1">
                    <span className="font-mono text-xs text-rojo tracking-widest pt-1 flex-shrink-0 w-8">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans font-600 text-crema text-base md:text-lg leading-snug group-hover:text-rojo transition-colors">
                      {item.q}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-rojo text-xl flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pl-13 ml-8 pr-10 pb-6 text-crema/60 font-sans font-300 text-sm md:text-base leading-relaxed max-w-2xl">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center text-xs text-crema/30 font-mono tracking-widest uppercase"
        >
          ¿Otra pregunta? Escríbenos por{" "}
          <a
            href="https://wa.me/584241788803"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rojo hover:underline"
          >
            WhatsApp
          </a>
          .
        </motion.p>
      </div>
    </section>
  );
}
