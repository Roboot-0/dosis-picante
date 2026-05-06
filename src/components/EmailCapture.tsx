"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEmailCapture } from "@/lib/analytics";

interface Props {
  fuente?: string;
  titulo?: string;
  subtitulo?: string;
  placeholder?: string;
  className?: string;
}

export default function EmailCapture({
  fuente = "home",
  titulo = "Avísame del próximo lote",
  subtitulo = "Cada batch es limitado. Sé el primero en saberlo.",
  placeholder = "tu@correo.com",
  className = "",
}: Props) {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk || estado === "loading") return;
    setEstado("loading");
    try {
      const res = await fetch("/api/suscribir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), nombre: nombre.trim(), fuente }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        setEstado("ok");
        setMsg("¡Listo! Te avisamos cuando salga el próximo lote.");
        trackEmailCapture(fuente);
      } else {
        setEstado("error");
        setMsg(data.error || "Algo falló. Intenta de nuevo.");
      }
    } catch {
      setEstado("error");
      setMsg("Error de conexión. Intenta de nuevo.");
    }
  };

  return (
    <section className={`bg-carbon-claro relative overflow-hidden ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-px linea-fuego" />
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="max-w-xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-8 bg-rojo/50" />
            <span className="text-xs tracking-[0.4em] text-crema/25 uppercase font-mono">Batch limitado</span>
            <div className="h-px w-8 bg-rojo/50" />
          </div>

          <AnimatePresence mode="wait">
            {estado === "ok" ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-12 h-12 rounded-full bg-rojo/10 border border-rojo/30 flex items-center justify-center mx-auto mb-4"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <h3 className="font-bebas text-2xl text-crema tracking-wide mb-1">¡Apuntado!</h3>
                <p className="text-sm text-crema/45 font-sans">{msg}</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="font-bebas text-[clamp(1.8rem,4vw,2.8rem)] leading-none text-crema mb-3 tracking-wide">
                  {titulo}
                </h2>
                <p className="text-sm text-crema/35 font-sans mb-8 leading-relaxed">
                  {subtitulo}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder}
                    required
                    className="flex-1 bg-carbon border border-carbon-medio px-4 py-3 text-sm font-sans text-crema placeholder:text-crema/20 focus:outline-none focus:border-rojo/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!emailOk || estado === "loading"}
                    className="px-6 py-3 bg-rojo text-crema font-bebas text-sm tracking-[0.25em] uppercase hover:bg-rojo-oscuro disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    {estado === "loading" ? (
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : "Avisarme"}
                  </button>
                </form>

                {estado === "error" && (
                  <p className="text-red-400 text-xs mt-2 font-mono">{msg}</p>
                )}

                <p className="text-[9px] text-crema/15 font-mono tracking-widest uppercase mt-4">
                  Sin spam. Solo cuando hay nuevo lote.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px linea-fuego" />
    </section>
  );
}
