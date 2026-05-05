"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, RefreshCw, FlaskConical, AlertTriangle, CheckCircle } from "lucide-react";

interface Batch {
  id: string;
  fields: {
    "Batch ID": string;
    SKU: string;
    Fecha: string;
    "Unidades Producidas": number;
    "Costo Total USD": number;
    "Costo por Unidad USD": number;
    Estado: string;
    "Stock Actualizado": boolean;
    Notas: string;
  };
}

interface RecetaItem {
  fields: { SKU: string; Ingrediente: string; "Gramos por Botella": number; Porcentaje: number };
}

interface Ingrediente {
  id: string;
  fields: { Ingrediente: string; "Stock Actual": number; "Stock Minimo": number; Unidad: string; Tipo: string };
}

const SKUS = ["MICRO", "AHUMA", "SOBRE", "KIT"];
const ESTADOS = ["Planeado", "En proceso", "Completado", "Cancelado"];
const EMPAQUE_ITEMS = [
  "Frasco vidrio ámbar",
  "Gotero + tapa seguridad",
  "Etiqueta (acento metálico)",
  "Bolsa de vacío (mash)",
  "Caja / cartón individual",
];

const estadoColor = (e: string) => {
  if (e === "Completado") return "bg-green-900/40 text-green-400";
  if (e === "En proceso") return "bg-blue-900/40 text-blue-400";
  if (e === "Planeado") return "bg-yellow-900/40 text-yellow-400";
  return "bg-red-900/40 text-red-400";
};

const EMPTY_FORM = {
  SKU: "MICRO",
  Fecha: new Date().toISOString().split("T")[0],
  "Unidades Producidas": "",
  "Costo Total USD": "",
  Estado: "Completado",
  Notas: "",
};

export default function ProduccionPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [recetas, setRecetas] = useState<RecetaItem[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

  const load = async () => {
    setLoading(true);
    const [batchRes, ingRes] = await Promise.all([
      fetch("/api/admin/produccion"),
      fetch("/api/admin/ingredientes"),
    ]);
    const [batchData, ingData] = await Promise.all([batchRes.json(), ingRes.json()]);
    setBatches(batchData.records || []);
    setRecetas(ingData.recetas || []);
    setIngredientes(ingData.ingredientes || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Calculadora de materiales en tiempo real ──
  const materialNeeds = useMemo(() => {
    const unidades = parseInt(form["Unidades Producidas"] as string) || 0;
    if (!unidades || !form.SKU || form.SKU === "KIT") return null;

    const recetaSKU = recetas.filter((r) => r.fields.SKU === form.SKU);
    const ingMap = Object.fromEntries(ingredientes.map((i) => [i.fields.Ingrediente, i]));

    const items: Array<{
      nombre: string; necesitas: number; unidad: string; disponible: number; deficit: number; ok: boolean;
    }> = [];

    for (const r of recetaSKU) {
      const nombre = r.fields.Ingrediente;
      const necesitasKg = parseFloat(((r.fields["Gramos por Botella"] / 1000) * unidades).toFixed(4));
      const ing = ingMap[nombre];
      const disponible = parseFloat((ing?.fields["Stock Actual"] ?? 0).toFixed(4));
      const deficit = parseFloat(Math.max(0, necesitasKg - disponible).toFixed(4));
      items.push({ nombre, necesitas: necesitasKg, unidad: ing?.fields.Unidad || "kg", disponible, deficit, ok: deficit === 0 });
    }

    for (const nombre of EMPAQUE_ITEMS) {
      const ing = ingMap[nombre];
      const disponible = ing?.fields["Stock Actual"] ?? 0;
      const deficit = Math.max(0, unidades - disponible);
      items.push({ nombre, necesitas: unidades, unidad: "pcs", disponible, deficit, ok: deficit === 0 });
    }

    const faltantes = items.filter((i) => !i.ok);
    return { items, faltantes, allOk: faltantes.length === 0 };
  }, [form.SKU, form["Unidades Producidas"], recetas, ingredientes]);

  const generateBatchId = () => {
    const d = new Date();
    return `B-${form.SKU}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 100).toString().padStart(2, "0")}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const unidades = parseInt(form["Unidades Producidas"] as string) || 0;
    const costoTotal = parseFloat(form["Costo Total USD"] as string) || 0;
    const costoPorUnidad = unidades > 0 ? costoTotal / unidades : 0;

    await fetch("/api/admin/produccion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "Batch ID": generateBatchId(),
        SKU: form.SKU,
        Fecha: form.Fecha,
        "Unidades Producidas": unidades,
        "Costo Total USD": costoTotal,
        "Costo por Unidad USD": parseFloat(costoPorUnidad.toFixed(4)),
        Estado: form.Estado,
        "Stock Actualizado": form.Estado === "Completado",
        Notas: form.Notas,
      }),
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
    load();
  };

  const marcarStock = async (b: Batch) => {
    if (b.fields["Stock Actualizado"]) return;
    setUpdatingStock(b.id);
    await fetch("/api/admin/produccion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: b.id,
        fields: { "Stock Actualizado": true, SKU: b.fields.SKU, "Unidades Producidas": b.fields["Unidades Producidas"] },
        updateStock: true,
      }),
    });
    setBatches((prev) => prev.map((x) => x.id === b.id ? { ...x, fields: { ...x.fields, "Stock Actualizado": true } } : x));
    setUpdatingStock(null);
    load();
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#FAFAF9] text-2xl font-bold">Producción</h1>
          <p className="text-[#A8A29E] text-sm mt-1">{batches.length} batches registrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl text-sm hover:bg-[#3C3835] transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowForm((p) => !p)} className="flex items-center gap-2 px-4 py-2 bg-[#DC2626] text-white rounded-xl text-sm font-medium hover:bg-[#B91C1C] transition-colors">
            <Plus size={14} /> Nuevo batch
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-[#292524] border border-[#44403C] rounded-2xl p-5 space-y-4">
          <h2 className="text-[#FAFAF9] font-semibold text-sm">Registrar batch de producción</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">SKU *</label>
              <select value={form.SKU} onChange={(e) => setForm((f) => ({ ...f, SKU: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]">
                {SKUS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Fecha</label>
              <input type="date" value={form.Fecha} onChange={(e) => setForm((f) => ({ ...f, Fecha: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]" />
            </div>
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Estado</label>
              <select value={form.Estado} onChange={(e) => setForm((f) => ({ ...f, Estado: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]">
                {ESTADOS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Unidades producidas *</label>
              <input required type="number" min={1} placeholder="0"
                value={form["Unidades Producidas"]}
                onChange={(e) => setForm((f) => ({ ...f, "Unidades Producidas": e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]" />
            </div>
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Costo total USD</label>
              <input type="number" min={0} step={0.01} placeholder="0.00"
                value={form["Costo Total USD"]}
                onChange={(e) => setForm((f) => ({ ...f, "Costo Total USD": e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]" />
              {form["Unidades Producidas"] && form["Costo Total USD"] && (
                <p className="text-[#DC2626] text-xs mt-1">
                  ${(parseFloat(form["Costo Total USD"] as string) / parseInt(form["Unidades Producidas"] as string)).toFixed(4)} / unidad
                </p>
              )}
            </div>
            <div className="col-span-2 lg:col-span-1">
              <label className="text-[#57534E] text-xs mb-1 block">Notas</label>
              <input type="text" placeholder="Opcional..." value={form.Notas}
                onChange={(e) => setForm((f) => ({ ...f, Notas: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]" />
            </div>
          </div>

          {/* ── Calculadora de materiales ── */}
          {materialNeeds && (
            <div className="border border-[#44403C] rounded-xl overflow-hidden">
              <div className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b border-[#44403C] ${materialNeeds.allOk ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"}`}>
                {materialNeeds.allOk
                  ? <><CheckCircle size={14} /> Tienes todo para producir {form["Unidades Producidas"]} unidades de {form.SKU}</>
                  : <><AlertTriangle size={14} /> Faltan {materialNeeds.faltantes.length} insumo(s) para {form["Unidades Producidas"]} uds de {form.SKU}</>
                }
              </div>
              <div className="bg-[#1C1917]">
                <div className="grid grid-cols-2 gap-0 divide-y divide-[#292524]">
                  {materialNeeds.items.map((item) => (
                    <div key={item.nombre} className="flex items-center justify-between px-3 py-2 odd:border-r border-[#292524]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {item.ok
                          ? <CheckCircle size={11} className="text-green-400 shrink-0" />
                          : <AlertTriangle size={11} className="text-red-400 shrink-0" />
                        }
                        <span className="text-[#A8A29E] text-xs truncate">{item.nombre}</span>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className={`text-xs font-bold ${item.ok ? "text-green-400" : "text-red-400"}`}>
                          {item.necesitas} {item.unidad}
                        </span>
                        {!item.ok && (
                          <p className="text-red-400 text-[10px]">faltan {item.deficit}</p>
                        )}
                        <p className="text-[#57534E] text-[10px]">stock: {item.disponible}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-[#DC2626] text-white rounded-xl text-sm font-medium hover:bg-[#B91C1C] transition-colors disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar batch"}
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
        </div>
      ) : (
        <div className="bg-[#292524] rounded-2xl border border-[#44403C] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#44403C] text-[#57534E] text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Batch ID</th>
                  <th className="text-left px-4 py-3">SKU</th>
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="text-left px-4 py-3">Unidades</th>
                  <th className="text-left px-4 py-3">Costo total</th>
                  <th className="text-left px-4 py-3">Costo/u</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3">Inventario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#44403C]">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-[#3C3835]/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-[#A8A29E] text-xs">{b.fields["Batch ID"] || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[#DC2626] text-xs font-bold bg-[#DC2626]/10 px-2 py-0.5 rounded-lg">{b.fields.SKU}</span>
                    </td>
                    <td className="px-4 py-3 text-[#A8A29E] whitespace-nowrap">{formatDate(b.fields.Fecha)}</td>
                    <td className="px-4 py-3 text-[#FAFAF9] font-semibold">{(b.fields["Unidades Producidas"] || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#FAFAF9]">${(b.fields["Costo Total USD"] || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-[#A8A29E] text-xs">
                      {b.fields["Costo por Unidad USD"] ? `$${b.fields["Costo por Unidad USD"].toFixed(4)}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${estadoColor(b.fields.Estado)}`}>
                        {b.fields.Estado || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.fields["Stock Actualizado"] ? (
                        <span className="text-green-400 text-xs font-medium">✓ Descontado</span>
                      ) : (
                        <button onClick={() => marcarStock(b)} disabled={updatingStock === b.id}
                          className="text-xs px-2 py-1 bg-[#DC2626]/20 text-[#DC2626] rounded-lg hover:bg-[#DC2626]/30 transition-colors disabled:opacity-50">
                          {updatingStock === b.id ? "..." : "Descontar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
