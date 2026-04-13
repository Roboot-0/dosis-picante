"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Historia", href: "#historia" },
    { label: "Salsas", href: "#productos" },
    { label: "Ciencia", href: "#ciencia" },
    { label: "FAQ", href: "#faq" },
  ];

  const openTienda = () => {
    window.dispatchEvent(new Event("open-tienda"));
    setMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-carbon/90 backdrop-blur-md border-b border-carbon-medio/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="font-bebas text-2xl tracking-[0.3em] text-crema hover:text-rojo transition-colors">
          DOSIS
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-sans font-600 tracking-wider text-crema/70 hover:text-rojo transition-colors uppercase"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={openTienda}
            className="ml-4 px-5 py-2 bg-rojo text-crema text-sm font-sans font-600 tracking-wider uppercase rounded-sm hover:bg-rojo-oscuro transition-colors border-0 cursor-pointer"
          >
            Pedir
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="nav-mobile-menu"
          type="button"
        >
          <span className={`block w-6 h-0.5 bg-crema transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-crema transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-crema transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="nav-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-carbon border-t border-carbon-medio overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-bebas text-2xl tracking-widest text-crema hover:text-rojo transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={openTienda}
                className="mt-2 px-6 py-3 bg-rojo text-crema font-bebas text-xl tracking-widest text-center rounded-sm border-0 cursor-pointer"
              >
                PEDIR AHORA
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
