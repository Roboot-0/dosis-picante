"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
const PAGO_MOVIL = { telefono: "0414-262-4078", cedula: "V-11.741.520", nombre: "DOSIS C.A." };
const WA_BASE = "https://wa.me/584142624078";
// ────────────────────────────────────────────────────────────────────────────

const PRODUCTOS = [
  { id: "microdosis", nombre: "MICRODOSIS", tagline: "El primer contacto",   precio: 5,  ml: "30 ml",      imagen: "/images/microdosis.png", color: "#D97706", nivel: 1 },
  { id: "ahumadosis", nombre: "AHUMADOSIS", tagline: "La que convierte",      precio: 5,  ml: "30 ml",      imagen: "/images/ahumadosis.png", color: "#EA580C", nivel: 2 },
  { id: "sobredosis", nombre: "SOBREDOSIS", tagline: "La última advertencia", precio: 12, ml: "30 ml",      imagen: "/images/sobredosis.png", color: "#DC2626", nivel: 3 },
  { id: "kit",        nombre: "KIT DOSIS",  tagline: "Colección completa",    precio: 20, ml: "3 × 30 ml",  imagen: "/images/kit.jpeg",       color: "#9CA3AF", nivel: 3 },
];

type Cart = Record<string, number>;
type DeliveryType = "caracas" | "nacional";
type PaymentMethod = "pagomovil" | "efectivo";
interface FormData { nombre: string; email: string; telefono: string; cedula: string; direccion: string; ciudad: string; deliveryType: DeliveryType; }
interface Comprobante { base64: string; mimeType: string; nombre: string; preview: string; }

// ─── FIELD (a nivel de módulo para no perder el focus) ───────────────────────
function FormField({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] tracking-[0.3em] uppercase font-mono text-crema/35">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="bg-carbon border border-carbon-medio px-3 py-2 text-sm font-sans text-crema placeholder:text-crema/20 focus:outline-none focus:border-rojo transition-colors" />
    </div>
  );
}

function Dots({ nivel, color }: { nivel: number; color: string }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i <= nivel ? color : "#292524" }} />
      ))}
    </div>
  );
}

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
function StepIndicator({ step, hasComprobante }: { step: number; hasComprobante: boolean }) {
  const steps = hasComprobante
    ? ["Carrito", "Datos", "Pago", "Comprobante", "Listo"]
    : ["Carrito", "Datos", "Pago", "Listo"];
  return (
    <div className="flex items-center justify-center gap-0 mb-5">
      {steps.map((label, i) => {
        const n = i + 1; const done = step > n; const active = step === n;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] transition-all ${done ? "bg-rojo text-crema" : active ? "border-2 border-rojo text-rojo" : "border border-carbon-medio text-crema/20"}`}>
                {done ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> : n}
              </div>
              <span className={`text-[8px] tracking-[0.1em] uppercase font-mono whitespace-nowrap ${active ? "text-rojo" : done ? "text-crema/30" : "text-crema/15"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-6 h-px mb-4 ${done ? "bg-rojo" : "bg-carbon-medio"}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── STEP 1: CARRITO ─────────────────────────────────────────────────────────
function StepCarrito({ cart, setCart, onNext }: { cart: Cart; setCart: (c: Cart) => void; onNext: () => void }) {
  const total = PRODUCTOS.reduce((s, p) => s + (cart[p.id] ?? 0) * p.precio, 0);
  const itemCount = Object.values(cart).reduce((s, v) => s + v, 0);
  const update = (id: string, d: number) => setCart({ ...cart, [id]: Math.max(0, (cart[id] ?? 0) + d) });
  return (
    <div>
      <div className="divide-y divide-carbon-medio border border-carbon-medio mb-4">
        {PRODUCTOS.map((p) => {
          const qty = cart[p.id] ?? 0;
          return (
            <div key={p.id} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${qty > 0 ? "bg-rojo/5" : ""}`}>
              <div className="relative w-11 h-11 flex-shrink-0 bg-carbon-medio">
                <Image src={p.imagen} alt={p.nombre} fill className="object-contain p-1" sizes="44px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bebas text-base tracking-wide leading-none" style={{ color: p.color }}>{p.nombre}</p>
                <p className="text-[10px] text-crema/30 font-sans">{p.ml} · {p.tagline} · <span className="text-crema/50">${p.precio}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => update(p.id, -1)} disabled={qty === 0}
                  className="w-6 h-6 border border-carbon-medio flex items-center justify-center text-crema/40 hover:border-rojo hover:text-rojo disabled:opacity-20 disabled:cursor-not-allowed transition-all font-mono text-sm leading-none">−</button>
                <span className="font-bebas text-lg w-4 text-center text-crema tabular-nums">{qty}</span>
                <button onClick={() => update(p.id, 1)}
                  className="w-6 h-6 border border-carbon-medio flex items-center justify-center text-crema/40 hover:border-rojo hover:text-rojo transition-all font-mono text-sm leading-none">+</button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <div>
          {itemCount === 0
            ? <p className="text-xs text-crema/25 font-sans">Selecciona un producto.</p>
            : <div>
                <p className="text-[9px] text-crema/30 font-mono tracking-widest uppercase">{itemCount} producto{itemCount !== 1 ? "s" : ""}</p>
                <p className="font-bebas text-2xl text-crema">Total: <span className="text-rojo">${total}</span></p>
              </div>
          }
        </div>
        <button onClick={onNext} disabled={itemCount === 0}
          className="px-6 py-3 bg-rojo text-crema font-bebas text-sm tracking-[0.2em] uppercase hover:bg-rojo-oscuro disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2">
          Continuar <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2: DATOS ───────────────────────────────────────────────────────────
function StepDatos({ form, setForm, onNext, onBack }: { form: FormData; setForm: (f: FormData) => void; onNext: () => void; onBack: () => void }) {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const valid = form.nombre.trim() && emailOk && form.telefono.trim() && form.cedula.trim() && form.direccion.trim() && form.ciudad.trim();
  const set = (k: keyof FormData) => (v: string) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nombre" value={form.nombre} onChange={set("nombre")} placeholder="Juan Pérez" />
        <FormField label="Teléfono / WhatsApp" value={form.telefono} onChange={set("telefono")} placeholder="0412-000-0000" type="tel" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Correo electrónico" value={form.email} onChange={set("email")} placeholder="tu@correo.com" type="email" />
        <FormField label="Cédula de Identidad" value={form.cedula} onChange={set("cedula")} placeholder="V-12.345.678" />
      </div>
      <div>
        <p className="text-[9px] tracking-[0.3em] uppercase font-mono text-crema/35 mb-1.5">Tipo de entrega</p>
        <div className="grid grid-cols-2 gap-px bg-carbon-medio">
          {([
            { value: "caracas" as DeliveryType, label: "Entrega en Caracas", sub: "A coordinar según tu zona." },
            { value: "nacional" as DeliveryType, label: "Envío Nacional", sub: "Zoom / Domesa / MRW, a cargo del comprador." },
          ]).map((opt) => (
            <button key={opt.value} onClick={() => setForm({ ...form, deliveryType: opt.value })}
              className={`bg-carbon p-3 text-left border-2 transition-all ${form.deliveryType === opt.value ? "border-rojo bg-rojo/5" : "border-transparent hover:bg-carbon-claro"}`}>
              <p className={`font-bebas text-sm tracking-wide ${form.deliveryType === opt.value ? "text-crema" : "text-crema/40"}`}>{opt.label}</p>
              <p className="text-[9px] text-crema/25 font-sans">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>
      <FormField label="Dirección" value={form.direccion} onChange={set("direccion")} placeholder="Av. Principal, Las Mercedes..." />
      <FormField label="Ciudad / Estado" value={form.ciudad} onChange={set("ciudad")} placeholder="Caracas, Miranda" />
      <div className="flex gap-2 pt-1">
        <button onClick={onBack} className="px-4 py-2.5 border border-carbon-medio text-crema/40 font-bebas text-sm tracking-[0.15em] uppercase hover:border-crema/20 transition-all flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M7 12L3 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> Volver
        </button>
        <button onClick={onNext} disabled={!valid}
          className="flex-1 py-2.5 bg-rojo text-crema font-bebas text-sm tracking-[0.2em] uppercase hover:bg-rojo-oscuro disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          Continuar al pago →
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: PAGO (con tasa BCV en tiempo real) ───────────────────────────────
function StepPago({ payment, setPayment, total, tasaBCV, loadingTasa, onNext, onBack }: {
  payment: PaymentMethod; setPayment: (p: PaymentMethod) => void;
  total: number; tasaBCV: number | null; loadingTasa: boolean;
  onNext: () => void; onBack: () => void;
}) {
  const montoBS = tasaBCV ? total * tasaBCV : null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-crema/40 font-sans">Total: <span className="text-crema font-600">${total}</span></p>

      {/* Pago Móvil */}
      <button onClick={() => setPayment("pagomovil")}
        className={`w-full text-left p-4 border-2 transition-all ${payment === "pagomovil" ? "border-rojo bg-rojo/5" : "border-carbon-medio hover:bg-carbon-claro"}`}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${payment === "pagomovil" ? "border-rojo" : "border-carbon-medio"}`}>
            {payment === "pagomovil" && <div className="w-2 h-2 rounded-full bg-rojo" />}
          </div>
          <p className="font-bebas text-base tracking-wide text-crema">Pago Móvil</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-6">
          {[["Teléfono", PAGO_MOVIL.telefono], ["Cédula/RIF", PAGO_MOVIL.cedula], ["Nombre", PAGO_MOVIL.nombre]].map(([l, v]) => (
            <div key={l}>
              <span className="text-[8px] tracking-[0.25em] uppercase font-mono text-crema/20 block">{l}</span>
              <span className="text-xs font-mono text-crema/65">{v}</span>
            </div>
          ))}
        </div>
        {/* Monto en Bs. */}
        <div className="mt-3 pl-6 border-t border-rojo/15 pt-2">
          {loadingTasa ? (
            <p className="text-xs text-crema/30 font-mono animate-pulse">Consultando tasa BCV...</p>
          ) : montoBS ? (
            <div>
              <p className="text-[8px] tracking-[0.25em] uppercase font-mono text-crema/20 mb-0.5">Monto a transferir (tasa BCV)</p>
              <p className="font-bebas text-xl text-rojo">
                Bs. {montoBS.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[9px] text-crema/25 font-mono">1 USD = Bs. {tasaBCV?.toLocaleString("es-VE", { minimumFractionDigits: 2 })} · tasa BCV de hoy</p>
            </div>
          ) : (
            <p className="text-[9px] text-crema/25 font-sans italic">Monto en Bs. no disponible — confirmamos por WhatsApp.</p>
          )}
        </div>
      </button>

      {/* Efectivo */}
      <button onClick={() => setPayment("efectivo")}
        className={`w-full text-left p-4 border-2 transition-all ${payment === "efectivo" ? "border-rojo bg-rojo/5" : "border-carbon-medio hover:bg-carbon-claro"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${payment === "efectivo" ? "border-rojo" : "border-carbon-medio"}`}>
            {payment === "efectivo" && <div className="w-2 h-2 rounded-full bg-rojo" />}
          </div>
          <div>
            <p className="font-bebas text-base tracking-wide text-crema">Efectivo (contra entrega)</p>
            <p className="text-[9px] text-crema/30 font-sans">Pagas al recibir. Solo disponible en Caracas.</p>
          </div>
        </div>
      </button>

      <p className="text-[10px] text-crema/25 font-sans text-center">
        ¿Prefieres hablar primero?{" "}
        <a href={`${WA_BASE}?text=Hola!%20Quiero%20hacer%20un%20pedido%20DOSIS`} target="_blank" rel="noopener noreferrer"
          className="text-crema/45 underline underline-offset-2 hover:text-rojo transition-colors">Escríbenos por WhatsApp.</a>
      </p>

      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-2.5 border border-carbon-medio text-crema/40 font-bebas text-sm tracking-[0.15em] uppercase hover:border-crema/20 transition-all flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M7 12L3 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> Volver
        </button>
        <button onClick={onNext}
          className="flex-1 py-2.5 bg-rojo text-crema font-bebas text-sm tracking-[0.2em] uppercase hover:bg-rojo-oscuro transition-all">
          {payment === "pagomovil" ? "Subir comprobante →" : "Confirmar pedido →"}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 4: COMPROBANTE ─────────────────────────────────────────────────────
function StepComprobante({ comprobante, setComprobante, onNext, onBack, submitting }: {
  comprobante: Comprobante | null; setComprobante: (c: Comprobante | null) => void;
  onNext: () => void; onBack: () => void; submitting: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    // PDFs: no se pueden comprimir por canvas → se envían tal cual (suelen ser chicos)
    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(",")[1];
        setComprobante({ base64, mimeType: file.type, nombre: file.name, preview: result });
      };
      reader.readAsDataURL(file);
      return;
    }

    // Imágenes: comprimimos en canvas antes de subir para no romper el body del API
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const MAX = 1600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // fallback sin compresión
          const base64 = dataUrl.split(",")[1];
          setComprobante({ base64, mimeType: file.type, nombre: file.name, preview: dataUrl });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.82);
        const base64 = compressed.split(",")[1];
        setComprobante({
          base64,
          mimeType: "image/jpeg",
          nombre: file.name.replace(/\.[^.]+$/, "") + ".jpg",
          preview: compressed,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="font-bebas text-lg text-crema tracking-wide">Sube tu comprobante</p>
        <p className="text-xs text-crema/40 font-sans mt-0.5 leading-relaxed">
          Haz la transferencia por Pago Móvil y sube la captura de pantalla o foto del comprobante.
        </p>
      </div>

      {/* Drop zone / preview */}
      <button type="button" onClick={() => inputRef.current?.click()}
        className={`w-full border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden ${
          comprobante ? "border-rojo/40 bg-rojo/5 p-0 h-44" : "border-carbon-medio hover:border-rojo/40 hover:bg-rojo/5 p-8"
        }`}>
        {comprobante ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={comprobante.preview} alt="Comprobante" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-carbon/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="font-bebas text-sm tracking-[0.2em] text-crema uppercase">Cambiar imagen</span>
            </div>
          </>
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-crema/25">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="text-center">
              <p className="font-bebas text-base tracking-wide text-crema/50">Toca para subir</p>
              <p className="text-[10px] text-crema/25 font-sans">JPG, PNG o PDF · máx. 5 MB</p>
            </div>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      <div className="flex gap-2">
        <button onClick={onBack} disabled={submitting}
          className="px-4 py-2.5 border border-carbon-medio text-crema/40 font-bebas text-sm tracking-[0.15em] uppercase hover:border-crema/20 transition-all flex items-center gap-1.5 disabled:opacity-30">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M7 12L3 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> Volver
        </button>
        <button onClick={onNext} disabled={!comprobante || submitting}
          className="flex-1 py-2.5 bg-rojo text-crema font-bebas text-sm tracking-[0.2em] uppercase hover:bg-rojo-oscuro disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
          {submitting ? (
            <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> Enviando...</>
          ) : "Enviar pedido →"}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 5: CONFIRMADO ───────────────────────────────────────────────────────
function StepConfirmado({ nombre, onReset }: { nombre: string; onReset: () => void }) {
  return (
    <div className="text-center space-y-5 py-2">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-14 h-14 rounded-full bg-rojo/10 border border-rojo/30 flex items-center justify-center mx-auto">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </motion.div>
      <div>
        <h3 className="font-bebas text-3xl text-crema tracking-wide">¡Pedido enviado!</h3>
        <p className="text-sm text-crema/45 font-sans mt-1.5 leading-relaxed max-w-xs mx-auto">
          Gracias, <strong className="text-crema">{nombre}</strong>. Recibimos tu pedido y comprobante. Te contactamos para confirmar la entrega.
        </p>
      </div>
      <div className="border border-carbon-medio p-4 text-left space-y-1">
        <p className="text-[10px] tracking-[0.3em] uppercase font-mono text-crema/30 mb-2">¿Qué sigue?</p>
        {["Revisamos tu comprobante", "Confirmamos el pedido por WhatsApp", "Coordinamos la entrega"].map((s, i) => (
          <div key={s} className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-rojo/20 flex items-center justify-center text-[9px] font-mono text-rojo flex-shrink-0">{i + 1}</span>
            <span className="text-xs text-crema/50 font-sans">{s}</span>
          </div>
        ))}
      </div>
      <button onClick={onReset} className="text-[10px] text-crema/20 hover:text-crema/40 font-mono tracking-widest uppercase transition-colors">
        Hacer otro pedido
      </button>
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function CheckoutModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<Cart>({});
  const [form, setForm] = useState<FormData>({ nombre: "", email: "", telefono: "", cedula: "", direccion: "", ciudad: "", deliveryType: "caracas" });
  const [payment, setPayment] = useState<PaymentMethod>("pagomovil");
  const [comprobante, setComprobante] = useState<Comprobante | null>(null);
  const [tasaBCV, setTasaBCV] = useState<number | null>(null);
  const [loadingTasa, setLoadingTasa] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const total = PRODUCTOS.reduce((s, p) => s + (cart[p.id] ?? 0) * p.precio, 0);
  const isPayMov = payment === "pagomovil";
  // step mapping: 1=carrito 2=datos 3=pago 4=comprobante(solo pagomovil) 5=listo
  const totalSteps = isPayMov ? 5 : 4;

  // Fetch tasa BCV cuando entra al paso de pago
  useEffect(() => {
    if (step !== 3) return;
    setLoadingTasa(true);
    fetch("/api/tasa-bcv")
      .then((r) => r.json())
      .then((d) => { if (d.tasa) setTasaBCV(d.tasa); })
      .catch(() => {})
      .finally(() => setLoadingTasa(false));
  }, [step]);

  // Pausar Lenis
  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("lenis-stop"));
    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("lenis-start"));
    };
  }, []);

  // Prevenir rueda en backdrop
  useEffect(() => {
    const el = backdropRef.current;
    if (!el) return;
    const h = (e: WheelEvent) => e.stopPropagation();
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);

  // Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const submitPedido = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    // Mapa id interno (frontend) → SKU de Airtable. Debe coincidir con
    // idFrontendASku() en src/lib/airtable.ts.
    // Nomenclatura: 2 letras + 2 números (ej. MI-01 = Microdosis 30ml).
    // Futuros tamaños/variantes serían MI-02, MI-03, etc.
    const SKU_POR_ID: Record<string, string> = {
      microdosis: "MI-01",
      ahumadosis: "AH-01",
      sobredosis: "SO-01",
      kit:        "KI-01",
    };
    const items = PRODUCTOS.filter((p) => (cart[p.id] ?? 0) > 0).map((p) => ({
      sku: SKU_POR_ID[p.id] ?? p.id.toUpperCase(),
      id: p.id,
      nombre: p.nombre,
      qty: cart[p.id]!,
      precio: p.precio,
      subtotal: cart[p.id]! * p.precio,
    }));
    const montoBS = tasaBCV ? total * tasaBCV : null;
    try {
      const res = await fetch("/api/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, total, form, payment, tasaBCV, montoBS, comprobante }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Error ${res.status}`);
      }
      setSubmitting(false);
      setStep(totalSteps);
    } catch (e) {
      console.error("Error enviando pedido:", e);
      setSubmitError(
        e instanceof Error ? e.message : "No pudimos enviar el pedido. Revisa tu conexión o escríbenos por WhatsApp."
      );
      setSubmitting(false);
    }
  }, [cart, form, payment, tasaBCV, total, comprobante, totalSteps]);

  const handlePagoNext = () => {
    if (isPayMov) { setStep(4); } else { submitPedido(); }
  };

  const reset = () => {
    setStep(1); setCart({}); setComprobante(null); setTasaBCV(null);
    setForm({ nombre: "", email: "", telefono: "", cedula: "", direccion: "", ciudad: "", deliveryType: "caracas" });
    setPayment("pagomovil");
  };

  return (
    <motion.div ref={backdropRef}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: "rgba(8,8,8,0.88)", backdropFilter: "blur(8px)" }}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tienda-modal-title"
        initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-carbon border border-carbon-medio shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-carbon-medio">
          <div className="flex items-center gap-2.5">
            <span id="tienda-modal-title" className="font-bebas text-lg tracking-[0.2em] text-crema">DOSIS</span>
            <span className="text-crema/20 font-mono text-xs">·</span>
            <span className="text-[10px] tracking-[0.3em] text-crema/35 font-mono uppercase">Tu pedido</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-crema/25 hover:text-crema hover:bg-carbon-medio transition-all" aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="px-5 py-4">
          <StepIndicator step={step} hasComprobante={isPayMov} />
          {submitError && (
            <div className="mb-3 border border-rojo/40 bg-rojo/10 px-3 py-2 text-xs font-sans text-rojo/90">
              {submitError}{" "}
              <a
                href={`${WA_BASE}?text=Hola!%20Tuve%20un%20problema%20con%20el%20checkout`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-rojo"
              >
                Escríbenos por WhatsApp
              </a>
              .
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
              {step === 1 && <StepCarrito cart={cart} setCart={setCart} onNext={() => setStep(2)} />}
              {step === 2 && <StepDatos form={form} setForm={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
              {step === 3 && <StepPago payment={payment} setPayment={setPayment} total={total} tasaBCV={tasaBCV} loadingTasa={loadingTasa} onNext={handlePagoNext} onBack={() => setStep(2)} />}
              {step === 4 && isPayMov && <StepComprobante comprobante={comprobante} setComprobante={setComprobante} onNext={submitPedido} onBack={() => setStep(3)} submitting={submitting} />}
              {step === totalSteps && <StepConfirmado nombre={form.nombre} onReset={reset} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {step < totalSteps && (
          <div className="px-5 py-2.5 border-t border-carbon-medio flex items-center gap-2">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-crema/12">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <p className="text-[8px] text-crema/12 font-mono tracking-wider">Tus datos solo se usan para este pedido.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── SECCIÓN EN LA PÁGINA ────────────────────────────────────────────────────
export default function Tienda() {
  const [open, setOpen] = useState(false);

  // Escucha el evento del botón "Pedir Ahora" del CTAFinal
  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener("open-tienda", h);
    return () => window.removeEventListener("open-tienda", h);
  }, []);

  return (
    <>
      <section id="tienda" className="py-24 bg-carbon relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, #DC262608 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="h-px w-8 bg-rojo" />
                <span className="text-xs tracking-[0.4em] text-rojo uppercase font-sans font-600">Pedidos</span>
              </div>
              <h2 className="font-bebas text-[clamp(3rem,7vw,5.5rem)] leading-none text-crema mb-5">
                HAZ TU<br /><span className="text-rojo">PEDIDO.</span>
              </h2>
              <p className="text-crema/40 font-sans text-sm leading-relaxed max-w-sm mb-7">
                Elige tu salsa, coloca tu dirección y elige cómo pagar. El proceso toma menos de dos minutos.
              </p>
              <div className="space-y-2.5 mb-8">
                {[["📦", "Delivery en Caracas"], ["🚚", "Envíos a todo el país"], ["💳", "Pago Móvil o efectivo contra entrega"]].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-3">
                    <span className="text-sm">{icon}</span>
                    <span className="text-sm text-crema/45 font-sans">{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setOpen(true)}
                  className="group flex items-center gap-3 px-8 py-4 bg-rojo text-crema font-bebas text-lg tracking-[0.2em] uppercase hover:bg-rojo-oscuro transition-all duration-300">
                  Hacer mi pedido
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <a href={`${WA_BASE}?text=Hola!%20Tengo%20dudas%20sobre%20las%20salsas%20DOSIS%20%F0%9F%8C%B6`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 border border-carbon-medio text-crema/50 font-bebas text-base tracking-[0.2em] uppercase hover:border-rojo hover:text-crema transition-all duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-crema/40">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Habla con nosotros
                </a>
              </div>
            </div>
            {/* Lista de precios */}
            <div className="border border-carbon-medio">
              {PRODUCTOS.map((p, i) => (
                <div key={p.id} className={`flex items-center gap-4 px-5 py-3.5 ${i < PRODUCTOS.length - 1 ? "border-b border-carbon-medio" : ""}`}>
                  <div className="relative w-11 h-11 flex-shrink-0">
                    <Image src={p.imagen} alt={p.nombre} fill className="object-contain" sizes="44px" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bebas text-lg tracking-wide leading-none" style={{ color: p.color }}>{p.nombre}</p>
                    <p className="text-[10px] text-crema/30 font-sans">{p.tagline}</p>
                  </div>
                  <p className="font-bebas text-2xl text-crema">${p.precio}</p>
                </div>
              ))}
              <div className="px-5 py-2.5 bg-carbon-claro border-t border-carbon-medio">
                <p className="text-[9px] text-crema/20 font-mono tracking-widest text-center uppercase">Precios en USD · Pago Bs. al cambio BCV del día</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {open && <CheckoutModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
