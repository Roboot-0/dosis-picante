"use client";

import { motion, useInView, useScroll, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import MoleculaFondo from "@/components/MoleculaFondo";
import MoleculeBackground from "@/components/MoleculeBackground";

// Escala Scoville — proporciones normalizadas vs Carolina Reaper (récord Guinness 2013, ~2.2M SHU)
const comparacion = [
  { nombre: "Ají dulce venezolano", shu: "0 – 1.000", bar: 0.3, dosis: false },
  { nombre: "Tabasco (salsa)", shu: "2.500 – 5.000", bar: 1, dosis: false },
  { nombre: "Jalapeño", shu: "2.500 – 8.000", bar: 1.2, dosis: false },
  { nombre: "▸ MICRODOSIS [01]", shu: "~40.000", bar: 6, dosis: true },
  { nombre: "▸ AHUMADOSIS [02]", shu: "~100.000", bar: 12, dosis: true },
  { nombre: "Habanero", shu: "100.000 – 350.000", bar: 18, dosis: false },
  { nombre: "▸ SOBREDOSIS [03]", shu: "~1.200.000", bar: 45, dosis: true },
  { nombre: "Trinidad Scorpion", shu: "~1.400.000", bar: 52, dosis: false },
  { nombre: "Carolina Reaper · Récord Guinness 2013", shu: "~2.200.000", bar: 100, dosis: false },
];

const etapas = [
  {
    num: "01",
    titulo: "La capsaicina toca TRPV1",
    sub: "Tu lengua y boca",
    desc: "La molécula C₁₈H₂₇NO₃ se une a los receptores TRPV1 — los mismos que detectan calor físico por encima de 43°C. El cerebro recibe la misma señal que si estuvieras tocando algo caliente. No hay calor real.",
    color: "#D97706",
    stat: "43°C",
    statLabel: "umbral de activación TRPV1",
  },
  {
    num: "02",
    titulo: "La señal viaja al cerebro",
    sub: "Médula espinal → corteza",
    desc: "El nervio trigémino transmite la señal a 120 m/s. Tu cerebro interpreta la amenaza. Sudoración, ritmo cardíaco elevado, salivación. Tu cuerpo responde a un incendio que no existe.",
    color: "#EA580C",
    stat: "120m/s",
    statLabel: "velocidad de transmisión",
  },
  {
    num: "03",
    titulo: "Endorfinas. Dopamina.",
    sub: "El efecto adictivo",
    desc: "Para contrarrestar el 'dolor', el cerebro libera endorfinas — los analgésicos naturales del cuerpo. El resultado: euforia. Es la misma respuesta que genera el ejercicio intenso. Por eso el picante es adictivo.",
    color: "#DC2626",
    stat: "β-End",
    statLabel: "β-endorfinas liberadas",
  },
];

function HeatBar({ bar, dosis, delay }: { bar: number; dosis: boolean; delay: number }) {
  return (
    <div className="w-16 sm:w-48 shrink-0">
      <div className="h-1.5 sm:h-2 bg-carbon-medio rounded-none overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${bar}%` }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] }}
          className="h-full relative"
          style={{ background: dosis ? "linear-gradient(90deg, #DC262688, #DC2626)" : "linear-gradient(90deg, #44403C, #57534E)" }}
        >
          {dosis && (
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: delay + 1.5 }}
              style={{ background: "linear-gradient(90deg, transparent, #DC262660)" }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Molécula SVG animada de capsaicina (estilizada)
function MoleculaSVG() {
  return (
    <motion.svg
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[320px] opacity-80 mx-auto block"
      animate={{ rotate: [0, 2, -2, 0] }}
      transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
    >
      {/* Backbone principal */}
      <motion.path
        d="M20 100 L50 80 L80 100 L110 80 L140 100 L170 80 L200 60"
        stroke="#D97706" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      {/* Anillo benceno */}
      <motion.path
        d="M200 60 L220 40 L250 40 L260 60 L250 80 L220 80 Z"
        stroke="#EA580C" strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
      />
      {/* Dobles enlaces estilizados */}
      <motion.path
        d="M222 48 L248 48 M222 72 L248 72"
        stroke="#DC2626" strokeWidth="1.5" opacity="0.5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: true }}
        transition={{ delay: 2.5 }}
      />
      {/* Grupos OH */}
      <motion.circle cx="230" cy="40" r="3" fill="#DC2626"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }}
        viewport={{ once: true }} transition={{ delay: 2.8, type: "spring" }}
      />
      <motion.circle cx="242" cy="80" r="3" fill="#D97706"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }}
        viewport={{ once: true }} transition={{ delay: 3.0, type: "spring" }}
      />
      {/* Cola alquilo larga */}
      <motion.path
        d="M140 100 L140 130 L170 130 L170 150 L200 150"
        stroke="#D97706" strokeWidth="1.5" strokeDasharray="4 3"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
      />
      {/* Grupo amino */}
      <motion.path
        d="M80 100 L80 130"
        stroke="#EA580C" strokeWidth="2"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ delay: 0.8 }}
      />
      <motion.text x="72" y="148" fill="#EA580C" fontSize="12" fontFamily="monospace"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.7 }}
        viewport={{ once: true }} transition={{ delay: 1.2 }}
      >
        NH
      </motion.text>
      {/* Labels */}
      <motion.text x="8" y="98" fill="#78716C" fontSize="10" fontFamily="monospace"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }} transition={{ delay: 0.5 }}
      >
        CH₃O
      </motion.text>
      <motion.text x="194" y="155" fill="#78716C" fontSize="10" fontFamily="monospace"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }} transition={{ delay: 1.8 }}
      >
        OH
      </motion.text>
      {/* Glow pulsante en el anillo */}
      <motion.circle
        cx="235" cy="60" r="28"
        fill="none" stroke="#DC2626"
        strokeWidth="1"
        animate={{ opacity: [0, 0.3, 0], scale: [0.9, 1.1, 0.9] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        style={{ transformOrigin: "235px 60px" }}
      />
    </motion.svg>
  );
}

export default function Ciencia() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <>
      {/* ── BLOQUE 1: La Molécula ── */}
      <section id="ciencia" className="relative py-32 bg-carbon">
        {/* Background heat gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full"
            style={{ background: "radial-gradient(ellipse 60% 80% at 80% 30%, #DC262608, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2"
            style={{ background: "radial-gradient(ellipse 60% 60% at 20% 80%, #D9770608, transparent)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Texto */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, x: -40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-8 bg-rojo" />
                <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans">
                  La Molécula
                </span>
              </div>

              <div className="inline-block font-mono text-xs tracking-[0.3em] text-crema/40 border border-rojo/20 px-4 py-2 mb-6 bg-rojo/5">
                C₁₈H₂₇NO₃ — CAPSAICINA
              </div>

              <h2 className="font-bebas text-[clamp(2.8rem,6vw,4.5rem)] leading-none text-crema mb-8">
                TU CEREBRO NO SIENTE{" "}
                <span className="text-rojo">CALOR REAL.</span>
                <br />
                LO CREE.
              </h2>

              <div className="space-y-5 text-crema/60 font-sans font-300 leading-relaxed">
                <p>
                  La capsaicina no produce calor físico. Lo que hace es unirse
                  a los receptores <span className="text-rojo/80 font-400">TRPV1</span> — los mismos que tu cuerpo
                  usa para detectar temperaturas superiores a 43°C.
                  Tu cerebro recibe la señal de emergencia, responde con sudoración,
                  euforia, y libera endorfinas para contrarrestar el dolor.
                </p>
                <p className="text-crema/40 text-sm">
                  Es por eso que el picante es <span className="text-amber-500/70">adictivo</span>. No metafóricamente.
                  Las endorfinas liberadas son los mismos neurotransmisores del ejercicio intenso.
                  La molécula de capsaicina aparece en nuestro empaque porque es nuestra materia prima real.
                </p>
              </div>
            </motion.div>

            {/* Molécula 3D interactiva */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col items-center gap-8"
            >
              <div
                className="relative w-full overflow-hidden"
                style={{ height: "380px" }}
              >
                <MoleculeBackground single />
              </div>
              <div className="text-center">
                <p className="font-mono text-xs tracking-[0.3em] text-crema/35 uppercase">
                  Estructura molecular de la capsaicina · arrastra para girar
                </p>
                <p className="font-mono text-[10px] tracking-[0.25em] text-crema/20 uppercase mt-1">
                  C₁₈H₂₇NO₃
                </p>
              </div>

              {/* Stats rápidos */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
                {[
                  { val: "43°C", label: "Temp. TRPV1" },
                  { val: "120m/s", label: "Vel. del nervio" },
                  { val: "16M", label: "SHU pura" },
                ].map((s) => (
                  <div key={s.label} className="border border-carbon-medio p-3 sm:p-4 text-center bg-carbon-claro">
                    <p className="font-bebas text-xl sm:text-2xl text-rojo mb-1">{s.val}</p>
                    <p className="font-mono text-[8px] sm:text-[9px] text-crema/30 tracking-wider leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BLOQUE 2: Journey del picor en el cuerpo ── */}
      <section className="py-24 bg-carbon-claro relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #DC262630, transparent)" }} />

        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="h-px w-8 bg-rojo" />
              <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans">Lo que pasa cuando tragas</span>
              <div className="h-px w-8 bg-rojo" />
            </div>
            <h2 className="font-bebas text-[clamp(2.5rem,5vw,4rem)] leading-none text-crema">
              EL VIAJE DEL <span className="text-rojo">FUEGO</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-carbon-medio">
            {etapas.map((etapa, i) => (
              <motion.div
                key={etapa.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-carbon p-8 lg:p-10 relative group overflow-hidden"
              >
                {/* Glow en hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${etapa.color}12, transparent)` }} />

                {/* Número + dato científico */}
                <div className="flex items-start justify-between mb-6">
                  <span className="font-bebas text-6xl leading-none opacity-15 select-none" style={{ color: etapa.color }}>
                    {etapa.num}
                  </span>
                  <div className="text-right">
                    <p className="font-bebas text-2xl leading-none" style={{ color: etapa.color }}>{etapa.stat}</p>
                    <p className="font-mono text-[8px] tracking-widest text-crema/25 uppercase mt-0.5">{etapa.statLabel}</p>
                  </div>
                </div>

                {/* Barra de heat progresiva */}
                <div className="h-0.5 w-full bg-carbon-medio mb-6 overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ background: `linear-gradient(90deg, ${etapa.color}60, ${etapa.color})` }}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i * 0.2 + 0.3, ease: "easeOut" }}
                  />
                </div>

                <p className="font-mono text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: etapa.color }}>
                  {etapa.sub}
                </p>
                <h3 className="font-bebas text-2xl text-crema mb-4 leading-tight">{etapa.titulo}</h3>
                <p className="text-sm text-crema/50 font-sans font-300 leading-relaxed">{etapa.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOQUE 3: Tabla Scoville ── */}
      <section className="py-24 bg-carbon relative">
        <MoleculaFondo opacity={0.045} color="#78716C" scale={0.9} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-1/3 h-96 -translate-y-1/2"
            style={{ background: "radial-gradient(ellipse 60% 80% at 100% 50%, #DC262606, transparent)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-8 bg-rojo" />
              <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans">Escala Scoville</span>
            </div>
            <h2 className="font-bebas text-[clamp(2.5rem,5vw,4rem)] leading-none text-crema">
              ¿CUÁNTO <span className="text-rojo">QUEMA?</span>
            </h2>
            <p className="text-crema/40 font-sans text-sm mt-3 max-w-md">
              Comparativa real de intensidad. Tres niveles DOSIS marcados en rojo.
            </p>
          </motion.div>

          {/* Header row */}
          <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 border border-carbon-medio font-mono text-[9px] tracking-[0.25em] uppercase text-crema/25">
            <div className="flex-1 min-w-0">Pimiento / Salsa</div>
            <div className="w-16 sm:w-24 text-right shrink-0">SHU</div>
            <div className="w-16 sm:w-48 shrink-0">Intensidad</div>
          </div>

          <div className="space-y-0 border-x border-b border-carbon-medio">
            {comparacion.map((item, i) => (
              <motion.div
                key={item.nombre}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 border-b border-carbon-medio last:border-0 group ${
                  item.dosis ? "bg-rojo/5" : "bg-carbon"
                }`}
              >
                <div className={`flex-1 min-w-0 font-mono text-[10px] sm:text-xs tracking-wider ${
                  item.dosis ? "text-rojo" : "text-crema/40"
                }`}>
                  {item.nombre}
                </div>
                <div className="w-16 sm:w-24 text-right font-mono text-[10px] sm:text-xs text-crema/30 tracking-wider shrink-0">
                  {item.shu}
                </div>
                <HeatBar bar={item.bar} dosis={item.dosis} delay={i * 0.08 + 0.4} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <p className="font-mono text-xs text-crema/25 tracking-widest">
              MICRODOSIS es 8× más picante que Tabasco · SOBREDOSIS es 240× más picante que el Tabasco
            </p>
            <button
       
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-tienda"))}
              className="flex-shrink-0 inline-flex items-center gap-2 font-bebas text-sm tracking-[0.25em] text-rojo uppercase hover:text-rojo-oscuro transition-colors cursor-pointer bg-transparent border-0 p-0 group"
            >
              Probar ahora
              <span className="w-5 h-px bg-rojo group-hover:w-8 transition-all duration-300" />
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
