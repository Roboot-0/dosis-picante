"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface NavPaginasProps {
  anterior?: { href: string; label: string };
  siguiente?: { href: string; label: string };
}

/**
 * NavPaginas — Navegación al final de cada página.
 * Muestra botones de página anterior / siguiente para guiar al usuario.
 */
export default function NavPaginas({ anterior, siguiente }: NavPaginasProps) {
  return (
    <section className="bg-carbon border-t border-carbon-medio">
      <div className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between gap-6">
        {/* Anterior */}
        {anterior ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href={anterior.href}
              className="group flex items-center gap-4 text-crema/40 hover:text-crema transition-colors duration-300"
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform duration-200">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className="w-6 h-px bg-current group-hover:w-10 transition-all duration-400" />
              </div>
              <div>
                <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-crema/25 mb-0.5">Anterior</p>
                <p className="font-bebas text-xl tracking-widest">{anterior.label}</p>
              </div>
            </Link>
          </motion.div>
        ) : (
          <div />
        )}

        {/* Separator */}
        <div className="h-8 w-px bg-carbon-medio hidden sm:block" />

        {/* Siguiente */}
        {siguiente ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href={siguiente.href}
              className="group flex items-center gap-4 text-crema/60 hover:text-crema transition-colors duration-300"
            >
              <div className="text-right">
                <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-crema/25 mb-0.5">Siguiente</p>
                <p className="font-bebas text-xl tracking-widest">{siguiente.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-px bg-rojo group-hover:w-10 transition-all duration-400" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rojo group-hover:translate-x-1 transition-transform duration-200">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </motion.div>
        ) : (
          <div />
        )}
      </div>
    </section>
  );
}
