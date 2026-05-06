"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ── ÍCONO: Las Salsas — tres gotas flotantes con stagger ── */
function IconGotas({ color }: { color: string }) {
  const drops = [
    { d: "M10 30C10 30 7 23 7 19C7 15.5 8.3 14 10 14C11.7 14 13 15.5 13 19C13 23 10 30 10 30Z", opacity: 0.5, delay: 0 },
    { d: "M22 34C22 34 17 25 17 19C17 13.5 19.2 11 22 11C24.8 11 27 13.5 27 19C27 25 22 34 22 34Z", opacity: 1, delay: 0.4 },
    { d: "M34 31C34 31 31 24 31 20C31 16.5 32.3 15 34 15C35.7 15 37 16.5 37 20C37 24 34 31 34 31Z", opacity: 0.7, delay: 0.75 },
  ];
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      {drops.map((drop, i) => (
        <motion.g
          key={i}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, delay: drop.delay, ease: "easeInOut" }}
        >
          <path d={drop.d} fill={color} opacity={drop.opacity} />
        </motion.g>
      ))}
    </svg>
  );
}

/* ── ÍCONO: Nuestra Historia — pin con ondas expansivas ── */
function IconPin({ color }: { color: string }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      {/* Pin */}
      <path
        d="M22 5C17.3 5 12.5 9.2 12.5 15.5C12.5 23.5 22 37 22 37C22 37 31.5 23.5 31.5 15.5C31.5 9.2 26.7 5 22 5Z"
        fill={color} opacity={0.85}
      />
      <circle cx="22" cy="15.5" r="5" fill="#1C1917" />
      {/* Ondas desde la base */}
      {[0, 1, 2].map((i) => (
        <motion.ellipse
          key={i}
          cx="22" cy="37" rx="1.5" ry="0.8"
          fill="none" stroke={color} strokeWidth="1.2"
          animate={{ rx: [1.5, 12], ry: [0.8, 5], opacity: [0.8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

/* ── ÍCONO: La Ciencia — anillo bencénico que se construye ── */
function IconMolecula({ color }: { color: string }) {
  const vertices: [number, number][] = [
    [22, 6], [32, 11.5], [32, 22.5], [22, 28], [12, 22.5], [12, 11.5],
  ];
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      {/* Hexágono externo */}
      <motion.path
        d="M22 6 L32 11.5 L32 22.5 L22 28 L12 22.5 L12 11.5 Z"
        stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, times: [0, 0.45, 0.75, 1], ease: "easeInOut" }}
      />
      {/* Hexágono interno — doble enlace */}
      <motion.path
        d="M22 9 L29.5 13.2 L29.5 21 L22 25.2 L14.5 21 L14.5 13.2 Z"
        stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.45, 0.45, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, times: [0, 0.45, 0.75, 1], ease: "easeInOut", delay: 0.25 }}
      />
      {/* Átomos en vértices */}
      {vertices.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x} cy={y} r="2.5"
          fill={color}
          animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" }}
        />
      ))}
      {/* Cola — grupo funcional */}
      <motion.path
        d="M22 28 L22 38"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2"
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.7, 0.7, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, delay: 1.4, ease: "easeInOut" }}
      />
      {/* Átomo terminal */}
      <motion.circle
        cx="22" cy="39" r="2"
        fill={color}
        animate={{ opacity: [0, 0.7, 0.7, 0], scale: [0, 1, 1, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, delay: 2, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ── ÍCONO: Preguntas — burbuja con puntos que suben ── */
function IconChat({ color }: { color: string }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      {/* Burbuja */}
      <path
        d="M8 9C8 7.3 9.3 6 11 6L33 6C34.7 6 36 7.3 36 9L36 26C36 27.7 34.7 29 33 29L16.5 29L9 37L9 29C8.4 29 8 28.6 8 28Z"
        stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" opacity={0.75}
      />
      {/* Tres puntos animados */}
      {[14, 22, 30].map((x, i) => (
        <motion.circle
          key={i}
          cx={x} cy={17.5} r="2.5"
          fill={color}
          animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

/* ── DATA ── */
const secciones = [
  {
    href: "/salsas",
    label: "Las Salsas",
    sub: "Las tres fórmulas en detalle",
    tag: "Productos",
    color: "#EA580C",
    Icon: IconGotas,
  },
  {
    href: "/historia",
    label: "Nuestra Historia",
    sub: "De la terraza de Caracas al mundo",
    tag: "Historia",
    color: "#D97706",
    Icon: IconPin,
  },
  {
    href: "/ciencia",
    label: "La Ciencia",
    sub: "Por qué el picante engancha",
    tag: "C₁₈H₂₇NO₃",
    color: "#DC2626",
    Icon: IconMolecula,
  },
  {
    href: "/faq",
    label: "Preguntas",
    sub: "Todo lo que necesitas saber",
    tag: "FAQ",
    color: "#78716C",
    Icon: IconChat,
  },
];

export default function NavSeccionesHome() {
  return (
    <section className="bg-carbon relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px linea-fuego" />

      {/* Eyebrow */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <div className="h-px w-8 bg-rojo/50" />
          <span className="text-xs tracking-[0.4em] text-crema/25 uppercase font-mono">
            Explorar DOSIS
          </span>
        </motion.div>
      </div>

      {/* Filas */}
      <div className="border-t border-carbon-medio">
        {secciones.map((sec, i) => (
          <motion.div
            key={sec.href}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: i * 0.08 }}
            className="border-b border-carbon-medio"
          >
            <Link
              href={sec.href}
              className="group relative flex items-center justify-between gap-6 px-6 py-7 md:px-10 md:py-8 overflow-hidden"
            >
              {/* Línea de color que entra desde la izquierda en hover */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 origin-top"
                style={{ background: sec.color }}
                initial={{ scaleY: 0 }}
                whileHover={{ scaleY: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />

              {/* Fondo sutil en hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `linear-gradient(90deg, ${sec.color}0a, transparent 60%)` }}
              />

              {/* Izquierda: número + nombre + subtítulo */}
              <div className="flex items-center gap-5 md:gap-8 relative z-10 min-w-0">
                <span
                  className="font-bebas text-4xl md:text-5xl leading-none tabular-nums flex-shrink-0 transition-colors duration-300"
                  style={{ color: `${sec.color}35` }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3
                    className="font-bebas text-[clamp(1.8rem,4vw,3.2rem)] leading-none tracking-wide text-crema/70 group-hover:text-crema transition-colors duration-300"
                  >
                    {sec.label.toUpperCase()}
                  </h3>
                  <p className="font-sans text-xs text-crema/30 mt-1 tracking-wider leading-relaxed group-hover:text-crema/50 transition-colors duration-300 truncate">
                    {sec.sub}
                  </p>
                </div>
              </div>

              {/* Derecha: ícono + flecha */}
              <div className="flex items-center gap-5 flex-shrink-0 relative z-10">
                {/* Ícono */}
                <motion.div
                  className="hidden sm:block opacity-40 group-hover:opacity-100 transition-opacity duration-400"
                  whileHover={{ scale: 1.15 }}
                  style={{ color: sec.color }}
                >
                  <sec.Icon color={sec.color} />
                </motion.div>

                {/* Flecha animada */}
                <motion.div
                  className="flex items-center gap-2"
                  animate={{}}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <span
                    className="hidden md:block w-8 h-px transition-all duration-500 group-hover:w-14"
                    style={{ background: sec.color, opacity: 0.5 }}
                  />
                  <svg
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    className="text-crema/20 group-hover:transition-colors duration-300"
                    style={{ color: `${sec.color}80` }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="h-16" />
    </section>
  );
}
