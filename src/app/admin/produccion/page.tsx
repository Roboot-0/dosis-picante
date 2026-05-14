"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus, RefreshCw, FlaskConical, AlertTriangle, CheckCircle,
  Clock, Package, X, Droplets,
} from "lucide-react";

// ── Tipos ────────────────────────────────────────────────────────────────────
interface Batch {
  id: string;
  fields: {
    "Batch ID": string;
    SKU: string;
    Fecha: string;
    "Fecha Embotellado": string | null;  // extraído de Notas por la API
    "Unidades Producidas": number;
    "Costo Total USD": number;
    "Costo por Unidad USD": number;
    Estado: string;   // "Fermentando" | "Embotellado" | "Cancelado"
    "Stock Actualizado": boolean;
    Notas: string;
  };
}
interface RecetaItem {
  fields: { SKU: string; Ingrediente: string; "Gramos por Botella": number };
}
interface Ingrediente {
  id: string;
  fields: { Ingrediente: string; "Stock Actual": number; "Stock Minimo": number; Unidad: string };
}

// ── Constantes ───────────────────────────────────────────────────────────────
const SKUS = ["MICRO", "AHUMA", "SOBRE"];
const SKU_NOMBRES: Record<string, string> = {
  MICRO: "MICRODOSIS",
  AHUMA: "AHUMADOSIS",
  SOBRE: "SOBREDOSIS",
};
const SKU_COLOR: Record<string, string> = {
  MICRO: "text-yellow-400 bg-yellow-900/20",
  AHUMA: "text-orange-400 bg-orange-900/20",
  SOBRE: "text-red-400 bg-red-900/20",
};
const DIAS_FERMENTACION = 30;
const EMPAQUE_ITEMS = [
  "Frasco vidrio ámbar",
  "Gotero + tapa seguridad",
  "Etiqueta (acento metálico)",
  "Bolsa de vacío (mash)",
  "Caja / cartón individual",
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function diasRestantes(fechaInicio: string) {
  const listo = new Date(fechaInicio);
  listo.setDate(listo.getDate() + DIAS_FERMENTACION);
  return Math.ceil((listo.getTime() - Date.now()) / 86_400_000);
}

function fechaLista(fechaInicio: string) {
  const d = new Date(fechaInicio);
  d.setDate(d.getDate() + DIAS_FERMENTACION);
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
}

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
}

function generateBatchId(sku: string) {
  const d = new Date();
  return `B-${sku}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 100).toString().padStart(2, "0")}`;
}

const EMPTY_FORM = {
  SKU: "MICRO",
  Fecha: new Date().toISOString().split("T")[0],
  "Unidades Producidas": "",
  "Costo Total USD": "",
  Notas: "",
};

const EMPTY_EMB = {
  unidades: "",
  fecha: new Date().toISOString().split("T")[0],
  costo: "",
};

// ════════════════════════════════════════════════════════════════════════════
export default function ProduccionPage() {
  const [batches, setBatches]       = useState<Batch[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [recetas, setRecetas]       = useState<RecetaItem[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [embotellando, setEmbotellando] = useState<Batch | null>(null);
  const [embForm, setEmbForm]       = useState(EMPTY_EMB);
  const [savingEmb, setSavingEmb]   = useState(false);

  const load = async () => {
    setLoading(true);
    const [bR, iR] = await Promise.all([
      fetch("/api/admin/produccion"),
      fetch("/api/admin/ingredientes"),
    ]);
    const [bD, iD] = await Promise.all([bR.json(), iR.json()]);
    setBatches(bD.records || []);
    setRecetas(iD.recetas || []);
    setIngredientes(iD.ingredientes || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Calculadora de materiales ────────────────────────────────────────────
  const materialNeeds = useMemo(() => {
    const uds = parseInt(form["Unidades Producidas"] as string) || 0;
    if (!uds || !form.SKU) return null;
    const recetaSKU = recetas.filter((r) => r.fields.SKU === form.SKU);
    const ingMap    = Object.fromEntries(ingredientes.map((i) => [i.fields.Ingrediente, i]));
    const items: Array<{ nombre: string; necesitas: number; unidad: string; disponible: number; deficit: number; ok: boolean }> = [];
    for (const r of recetaSKU) {
      const n = r.fields.Ingrediente;
      const nec = parseFloat(((r.fields["Gramos por Botella"] / 1000) * uds).toFixed(4));
      const ing = ingMap[n];
      const disp = parseFloat((ing?.fields["Stock Actual"] ?? 0).toFixed(4));
      const def  = parseFloat(Math.max(0, nec - disp).toFixed(4));
      items.push({ nombre: n, necesitas: nec, unidad: ing?.fields.Unidad || "kg", disponible: disp, deficit: def, ok: def === 0 });
    }
    for (const n of EMPAQUE_ITEMS) {
      const ing  = ingMap[n];
      const disp = ing?.fields["Stock Actual"] ?? 0;
      const def  = Math.max(0, uds - disp);
      items.push({ nombre: n, necesitas: uds, unidad: "pcs", disponible: disp, deficit: def, ok: def === 0 });
    }
    return { items, faltantes: items.filter((i) => !i.ok), allOk: items.every((i) => i.ok) };
  }, [form.SKU, form["Unidades Producidas"], recetas, ingredientes]);

  // ── Crear batch ──────────────────────────────────────────────────────────
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const uds  = parseInt(form["Unidades Producidas"] as string) || 0;
    const cost = parseFloat(form["Costo Total USD"] as string) || 0;
    await fetch("/api/admin/produccion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "Batch ID": generateBatchId(form.SKU),
        SKU: form.SKU,
        Fecha: form.Fecha,
        "Unidades Producidas": uds,
        "Costo Total USD": cost,
        "Costo por Unidad USD": uds > 0 ? parseFloat((cost / uds).toFixed(4)) : 0,
        Estado: "Fermentando",
        "Stock Actualizado": false,
        Notas: form.Notas,
      }),
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
    load();
  };

  // ── Confirmar embotellado ─────────────────────────────────────────────────
  const confirmarEmb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!embotellando) return;
    setSavingEmb(true);
    const uds  = parseInt(embForm.unidades) || embotellando.fields["Unidades Producidas"];
    const cost = parseFloat(embForm.costo)  || embotellando.fields["Costo Total USD"];
    await fetch("/api/admin/produccion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: embotellando.id,
        embotellar: true,
        fields: {
          Estado: "Embotellado",
          "Fecha Embotellado": embForm.fecha,
          "Unidades Producidas": uds,
          "Costo Total USD": cost,
          "Costo por Unidad USD": uds > 0 ? parseFloat((cost / uds).toFixed(4)) : 0,
          "Stock Actualizado": true,
          SKU: embotellando.fields.SKU,
          Notas: embotellando.fields.Notas,
        },
      }),
    });
    setEmbotellando(null);
    setEmbForm(EMPTY_EMB);
    setSavingEmb(false);
    load();
  };

  // ── Listas derivadas ──────────────────────────────────────────────────────
  const fermentando  = batches.filter((b) => b.fields.Estado === "Fermentando");
  const embotellados = batches.filter((b) => b.fields.Estado === "Embotellado");
  const listos       = fermentando.filter((b) => diasRestantes(b.fields.Fecha) <= 0);

  // Totales embotellados por SKU
  const totalesSKU = useMemo(() =>
    SKUS.map((sku) => ({
      sku,
      total: embotellados.filter((b) => b.fields.SKU === sku)
        .reduce((s, b) => s + (b.fields["Unidades Producidas"] || 0), 0),
    })),
  [embotellados]);

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[#FAFAF9] text-2xl font-bold">Producción</h1>
          <p className="text-[#A8A29E] text-sm mt-1">
            {fermentando.length} fermentando · {embotellados.length} embotellados
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl text-sm hover:bg-[#3C3835] transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowForm((p) => !p)}
            className="flex items-center gap-2 px-4 py-2 bg-[#DC2626] text-white rounded-xl text-sm font-medium hover:bg-[#B91C1C] transition-colors">
            <Plus size={14} /> Nuevo batch
          </button>
        </div>
      </div>

      {/* Alerta: listos para embotellar */}
      {listos.length > 0 && (
        <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle size={18} className="text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-green-400 font-semibold text-sm">
              {listos.length === 1
                ? `${SKU_NOMBRES[listos[0].fields.SKU]} listo para embotellar 🍾`
                : `${listos.length} batches listos para embotellar 🍾`}
            </p>
            <p className="text-green-400/70 text-xs mt-0.5">
              Fermentación completada. Agrega el vinagre y registra el embotellado.
            </p>
          </div>
        </div>
      )}

      {/* Formulario nuevo batch */}
      {showForm && (
        <form onSubmit={submit} className="bg-[#292524] border border-[#44403C] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#FAFAF9] font-semibold text-sm flex items-center gap-2">
              <FlaskConical size={15} className="text-[#DC2626]" /> Iniciar fermentación
            </h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-[#57534E] hover:text-[#FAFAF9]">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Salsa *</label>
              <select value={form.SKU} onChange={(e) => setForm((f) => ({ ...f, SKU: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]">
                {SKUS.map((s) => <option key={s} value={s}>{SKU_NOMBRES[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Fecha inicio</label>
              <input type="date" value={form.Fecha}
                onChange={(e) => setForm((f) => ({ ...f, Fecha: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]" />
            </div>
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Unidades planificadas *</label>
              <input required type="number" min={1} placeholder="0"
                value={form["Unidades Producidas"]}
                onChange={(e) => setForm((f) => ({ ...f, "Unidades Producidas": e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]" />
            </div>
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Costo materia prima USD</label>
              <input type="number" step={0.01} placeholder="0.00"
                value={form["Costo Total USD"]}
                onChange={(e) => setForm((f) => ({ ...f, "Costo Total USD": e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]" />
            </div>
            <div className="col-span-2">
              <label className="text-[#57534E] text-xs mb-1 block">Notas</label>
              <input type="text" placeholder="Tipo de ají, mezcla, observaciones..."
                value={form.Notas}
                onChange={(e) => setForm((f) => ({ ...f, Notas: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]" />
            </div>
          </div>

          {/* Fecha estimada de embotellado */}
          {form.Fecha && (
            <div className="flex items-center gap-2 bg-[#1C1917] rounded-xl px-4 py-3">
              <Clock size={14} className="text-[#57534E]" />
              <span className="text-[#A8A29E] text-xs">
                Lista para embotellar aprox. el{" "}
                <span className="text-[#FAFAF9] font-semibold">{fechaLista(form.Fecha)}</span>
                {" "}· 30 días de fermentación
              </span>
            </div>
          )}

          {/* Calculadora de materiales */}
          {materialNeeds && (
            <div className="border border-[#44403C] rounded-xl overflow-hidden">
              <div className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b border-[#44403C]
                ${materialNeeds.allOk ? "bg-green-900/20 text-green-400" : "bg-yellow-900/20 text-yellow-400"}`}>
                {materialNeeds.allOk
                  ? <><CheckCircle size={14} /> Stock OK — puedes iniciar {SKU_NOMBRES[form.SKU]}</>
                  : <><AlertTriangle size={14} /> Faltan {materialNeeds.faltantes.length} insumo(s)</>}
              </div>
              <div className="bg-[#1C1917] grid grid-cols-2 divide-y divide-[#292524]">
                {materialNeeds.items.map((item) => (
                  <div key={item.nombre} className="flex items-center justify-between px-3 py-2 odd:border-r border-[#292524]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {item.ok ? <CheckCircle size={11} className="text-green-400 shrink-0" /> : <AlertTriangle size={11} className="text-yellow-400 shrink-0" />}
                      <span className="text-[#A8A29E] text-xs truncate">{item.nombre}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className={`text-xs font-bold ${item.ok ? "text-green-400" : "text-yellow-400"}`}>{item.necesitas} {item.unidad}</span>
                      {!item.ok && <p className="text-yellow-400 text-[10px]">faltan {item.deficit}</p>}
                      <p className="text-[#57534E] text-[10px]">stock: {item.disponible}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-[#DC2626] text-white rounded-xl text-sm font-medium hover:bg-[#B91C1C] disabled:opacity-50 transition-colors">
              {saving ? "Guardando..." : "Iniciar fermentación"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-[#3C3835] text-[#A8A29E] rounded-xl text-sm hover:bg-[#44403C] transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : batches.length === 0 ? (
        <div className="text-center text-[#57534E] py-16">
          <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay batches registrados</p>
          <p className="text-xs mt-1">Crea el primero con "Nuevo batch"</p>
        </div>
      ) : (
        <>
          {/* ── Batches fermentando ─────────────────────────────────────────── */}
          {fermentando.length > 0 && (
            <section>
              <h2 className="text-[#57534E] text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <FlaskConical size={12} /> En fermentación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fermentando.map((b) => {
                  const dias    = diasRestantes(b.fields.Fecha);
                  const listo   = dias <= 0;
                  const urgente = dias > 0 && dias <= 5;
                  const pct     = Math.min(100, Math.max(0, ((DIAS_FERMENTACION - dias) / DIAS_FERMENTACION) * 100));
                  return (
                    <div key={b.id}
                      className={`bg-[#292524] rounded-2xl border p-5 space-y-4
                        ${listo ? "border-green-600/50" : urgente ? "border-yellow-600/30" : "border-[#44403C]"}`}>
                      {/* SKU + badge */}
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${SKU_COLOR[b.fields.SKU] || "text-[#A8A29E] bg-[#44403C]"}`}>
                            {b.fields.SKU}
                          </span>
                          <p className="text-[#FAFAF9] font-semibold text-sm mt-2">{SKU_NOMBRES[b.fields.SKU]}</p>
                          <p className="text-[#57534E] text-[11px] font-mono mt-0.5">{b.fields["Batch ID"]}</p>
                        </div>
                        {listo
                          ? <span className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded-lg font-semibold">✓ Listo</span>
                          : <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${urgente ? "bg-yellow-900/40 text-yellow-400" : "bg-[#1C1917] text-[#A8A29E]"}`}>
                              {dias}d restantes
                            </span>
                        }
                      </div>

                      {/* Timeline */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#57534E]">Inicio fermentación</span>
                          <span className="text-[#A8A29E]">{fmt(b.fields.Fecha)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#57534E]">Lista para embotellar</span>
                          <span className={listo ? "text-green-400 font-semibold" : "text-[#A8A29E]"}>
                            {fechaLista(b.fields.Fecha)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#57534E]">Unidades planificadas</span>
                          <span className="text-[#FAFAF9] font-semibold">{b.fields["Unidades Producidas"]} uds</span>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="space-y-1">
                        <div className="h-1.5 bg-[#1C1917] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${listo ? "bg-green-500" : "bg-[#DC2626]"}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[#57534E] text-[10px]">
                          {listo
                            ? "Fermentación completada — agrega vinagre y embotella"
                            : `${Math.round(pct)}% · ${DIAS_FERMENTACION - dias} de ${DIAS_FERMENTACION} días`}
                        </p>
                      </div>

                      {/* Botón embotellar */}
                      {listo && (
                        <button
                          onClick={() => {
                            setEmbotellando(b);
                            setEmbForm({ ...EMPTY_EMB, unidades: String(b.fields["Unidades Producidas"]), costo: String(b.fields["Costo Total USD"] || "") });
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors">
                          <Droplets size={14} /> Registrar embotellado
                        </button>
                      )}

                      {b.fields.Notas && (
                        <p className="text-[#57534E] text-xs border-t border-[#44403C] pt-3 italic">{b.fields.Notas}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Inventario embotellado ──────────────────────────────────────── */}
          {embotellados.length > 0 && (
            <section>
              <h2 className="text-[#57534E] text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <Package size={12} /> Embotellados — Inventario
              </h2>

              {/* Tarjetas de stock por SKU */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {totalesSKU.map(({ sku, total }) => (
                  <div key={sku} className="bg-[#292524] border border-[#44403C] rounded-2xl p-4 text-center">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${SKU_COLOR[sku]}`}>{sku}</span>
                    <p className="text-[#FAFAF9] text-2xl font-bold mt-2">{total}</p>
                    <p className="text-[#57534E] text-xs">unidades producidas</p>
                  </div>
                ))}
              </div>

              {/* Historial */}
              <div className="bg-[#292524] rounded-2xl border border-[#44403C] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#44403C] text-[#57534E] text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3">Batch</th>
                        <th className="text-left px-4 py-3">SKU</th>
                        <th className="text-left px-4 py-3">Fermentó</th>
                        <th className="text-left px-4 py-3">Embotellado</th>
                        <th className="text-right px-4 py-3">Uds</th>
                        <th className="text-right px-4 py-3">Costo/u</th>
                        <th className="text-left px-4 py-3">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#44403C]">
                      {embotellados.map((b) => (
                        <tr key={b.id} className="hover:bg-[#3C3835]/40 transition-colors">
                          <td className="px-4 py-3 font-mono text-[#A8A29E] text-xs">{b.fields["Batch ID"] || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${SKU_COLOR[b.fields.SKU] || ""}`}>
                              {b.fields.SKU}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#A8A29E] text-xs whitespace-nowrap">{fmt(b.fields.Fecha)}</td>
                          <td className="px-4 py-3 text-[#FAFAF9] text-xs whitespace-nowrap">
                            {fmt(b.fields["Fecha Embotellado"])}
                          </td>
                          <td className="px-4 py-3 text-[#FAFAF9] font-semibold text-right">
                            {(b.fields["Unidades Producidas"] || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-[#A8A29E] text-xs text-right">
                            {b.fields["Costo por Unidad USD"] ? `$${b.fields["Costo por Unidad USD"].toFixed(4)}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-[#57534E] text-xs max-w-[160px] truncate">
                            {b.fields.Notas || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Modal de embotellado ─────────────────────────────────────────────── */}
      {embotellando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <form onSubmit={confirmarEmb}
            className="bg-[#1C1917] border border-[#44403C] rounded-2xl p-6 w-full max-w-md space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[#FAFAF9] font-semibold flex items-center gap-2">
                  <Droplets size={16} className="text-green-400" /> Registrar embotellado
                </h2>
                <p className="text-[#57534E] text-xs mt-0.5">
                  {SKU_NOMBRES[embotellando.fields.SKU]} · {embotellando.fields["Batch ID"]}
                </p>
              </div>
              <button type="button" onClick={() => setEmbotellando(null)} className="text-[#57534E] hover:text-[#FAFAF9]">
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#292524] rounded-xl p-3 text-xs text-[#A8A29E] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#57534E]">Fermentación inició:</span>
                <span className="text-[#FAFAF9]">{fmt(embotellando.fields.Fecha)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#57534E]">Unidades planificadas:</span>
                <span className="text-[#FAFAF9] font-semibold">{embotellando.fields["Unidades Producidas"]}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[#57534E] text-xs mb-1 block">Fecha de embotellado *</label>
                <input required type="date" value={embForm.fecha}
                  onChange={(e) => setEmbForm((f) => ({ ...f, fecha: e.target.value }))}
                  className="w-full bg-[#292524] border border-[#44403C] text-[#FAFAF9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="text-[#57534E] text-xs mb-1 block">Unidades reales embotelladas</label>
                <input type="number" min={1} value={embForm.unidades}
                  onChange={(e) => setEmbForm((f) => ({ ...f, unidades: e.target.value }))}
                  className="w-full bg-[#292524] border border-[#44403C] text-[#FAFAF9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-600" />
                <p className="text-[#57534E] text-xs mt-0.5">Ajusta si la cantidad real difiere</p>
              </div>
              <div>
                <label className="text-[#57534E] text-xs mb-1 block">Costo total USD (con vinagre)</label>
                <input type="number" step={0.01} value={embForm.costo}
                  onChange={(e) => setEmbForm((f) => ({ ...f, costo: e.target.value }))}
                  className="w-full bg-[#292524] border border-[#44403C] text-[#FAFAF9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-600" />
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3">
              <p className="text-yellow-400 text-xs">
                Al confirmar: se descuentan ingredientes y empaque del inventario, y se suma el stock del producto terminado.
              </p>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={savingEmb}
                className="flex-1 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                {savingEmb ? "Procesando..." : "✓ Confirmar embotellado"}
              </button>
              <button type="button" onClick={() => setEmbotellando(null)}
                className="px-4 py-2.5 bg-[#3C3835] text-[#A8A29E] rounded-xl text-sm hover:bg-[#44403C] transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
