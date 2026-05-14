"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function CTAFlotante() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed right-6 z-40"
          style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-tienda"))}
            className="group flex items-center gap-3 px-6 py-3.5 bg-rojo text-crema font-bebas text-base tracking-[0.25em] uppercase hover:bg-rojo-oscuro transition-colors duration-300 cursor-pointer border-0 shadow-2xl"
            style={{ boxShadow: "0 4px 30px #DC262660" }}
            aria-label="Hacer mi pedido"
          >
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-crema opacity-70"
            />
            Pedir Ahora
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
