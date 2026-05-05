"use client";

import { useEffect, useState } from "react";
import { RefreshCw, FlaskConical, AlertTriangle, CheckCircle, Package } from "lucide-react";

interface Ingrediente {
  id: string;
  fields: {
    Ingrediente: string;
    "Costo USD": number;
    Unidad: string;
    Tipo: string;
    "Stock Actual": number;
    "Stock Minimo": number;
    Origen: string;
    Estado: string;
    Alerta: string;
    "Ultima Compra": string;
    Notas: string;
  };
}

interface RecetaItem {
  id: string;
  fields: {
    ID: string;
    SKU: string;
    Ingrediente: string;
    "Gramos por Botella": number;
    Porcentaje: number;
    Notas: string;
  };
}

const TIPO_COLOR: Record<string, string> = {
  "Materia Prima": "bg-red-900/40 text-red-400",
  "Empaque": "bg-blue-900/40 text-blue-400",
  "Insumo": "bg-yellow-900/40 text-yellow-400",
};

const SKU_COLOR: Record<string, string> = {
  MICRO: "bg-orange-900/40 text-orange-400",
  AHUMA: "bg-purple-900/40 text-purple-400",
  SOBRE: "bg-red-900/40 text-red-400",
};

const SKUS = ["MICRO", "AHUMA", "SOBRE"];

export default function IngredientesPage() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [recetas, setRecetas] = useState<RecetaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"inventario" | "recetas">("inventario");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/ingredientes");
    const data = await res.json();
    setIngredientes(data.ingredientes || []);
    setRecetas(data.recetas || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveStock = async (ing: Ingrediente) => {
    const newStock = editing[ing.id];
    if (newStock === undefined) return;
    setSaving(ing.id);
    const alerta = newStock <= (ing.fields["Stock Minimo"] || 0) ? "Reponer" : "OK";
    await fetch("/api/admin/ingredientes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ing.id, fields: { "Stock Actual": newStock, Alerta: alerta } }),
    });
    setIngredientes((prev) =>
      prev.map((i) =>
        i.id === ing.id
          ? { ...i, fields: { ...i.fields, "Stock Actual": newStock, Alerta: alerta } }
          : i
      )
    );
    setEditing((prev) => { const n = { ...prev }; delete n[ing.id]; return n; });
    setSaving(null);
  };

  // Group recetas by SKU
  const recetasBySKU = SKUS.reduce((acc, sku) => {
    acc[sku] = recetas.filter((r) => r.fields.SKU === sku);
    return acc;
  }, {} as Record<string, RecetaItem[]>);

  const alertas = ingredientes.filter((i) => i.fields.Alerta === "Reponer").length;
  const tiposOrden = ["Materia Prima", "Empaque", "Insumo"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#FAFAF9] text-2xl font-bold">Ingredientes & Recetas</h1>
          <p className="text-[#A8A29E] text-sm mt-1">
            {ingredientes.length} ingredientes ·{" "}
            {alertas > 0 ? (
              <span className="text-red-400">{alertas} con stock bajo</span>
            ) : (
              <span className="text-green-400">inventario OK</span>
            )}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl text-sm hover:bg-[#3C3835] transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#292524] p-1 rounded-xl w-fit border border-[#44403C]">
        <button
          onClick={() => setActiveTab("inventario")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "inventario"
              ? "bg-[#DC2626] text-white"
              : "text-[#A8A29E] hover:text-[#FAFAF9]"
          }`}
        >
          <span className="flex items-center gap-2"><Package size={14} /> Inventario MP</span>
        </button>
        <button
          onClick={() => setActiveTab("recetas")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "recetas"
              ? "bg-[#DC2626] text-white"
              : "text-[#A8A29E] hover:text-[#FAFAF9]"
          }`}
        >
          <span className="flex items-center gap-2"><FlaskConical size={14} /> Recetas por SKU</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === "inventario" ? (
        /* ─── INVENTARIO ─── */
        <div className="space-y-6">
          {tiposOrden.map((tipo) => {
            const items = ingredientes.filter((i) => i.fields.Tipo === tipo);
            if (items.length === 0) return null;
            return (
              <div key={tipo}>
                <h2 className="text-[#57534E] text-xs uppercase tracking-wider font-semibold mb-3">{tipo}</h2>
                <div className="bg-[#292524] rounded-2xl border border-[#44403C] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#44403C] text-[#57534E] text-xs uppercase tracking-wider">
                          <th className="text-left px-4 py-3">Ingrediente</th>
                          <th className="text-left px-4 py-3">Costo</th>
                          <th className="text-left px-4 py-3">Stock actual</th>
                          <th className="text-left px-4 py-3">Stock mín.</th>
                          <th className="text-left px-4 py-3">Estado</th>
                          <th className="text-left px-4 py-3">Origen</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#44403C]">
                        {items.map((ing) => {
                          const stockActual = ing.fields["Stock Actual"] ?? 0;
                          const stockMin = ing.fields["Stock Minimo"] ?? 0;
                          const reponer = stockActual <= stockMin;
                          return (
                            <tr key={ing.id} className="hover:bg-[#3C3835]/40 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {reponer ? (
                                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                                  ) : (
                                    <CheckCircle size={14} className="text-green-400 shrink-0" />
                                  )}
                                  <span className="text-[#FAFAF9] font-medium">{ing.fields.Ingrediente}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[#A8A29E] text-xs">
                                ${(ing.fields["Costo USD"] || 0).toFixed(2)}/{ing.fields.Unidad || "kg"}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={editing[ing.id] !== undefined ? editing[ing.id] : stockActual}
                                    onChange={(e) =>
                                      setEditing((prev) => ({ ...prev, [ing.id]: parseFloat(e.target.value) || 0 }))
                                    }
                                    className="w-24 bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#DC2626]"
                                  />
                                  <span className="text-[#57534E] text-xs">{ing.fields.Unidad}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[#57534E] text-sm">
                                {stockMin} {ing.fields.Unidad}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-xs px-2 py-1 rounded-lg font-medium ${
                                    reponer ? "bg-red-900/40 text-red-400" : "bg-green-900/40 text-green-400"
                                  }`}
                                >
                                  {reponer ? "⚠ Reponer" : "✓ OK"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#57534E] text-xs">{ing.fields.Origen || "—"}</td>
                              <td className="px-4 py-3">
                                {editing[ing.id] !== undefined && (
                                  <button
                                    onClick={() => saveStock(ing)}
                                    disabled={saving === ing.id}
                                    className="text-xs px-3 py-1 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors disabled:opacity-50"
                                  >
                                    {saving === ing.id ? "..." : "Guardar"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── RECETAS ─── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {SKUS.map((sku) => {
            const items = recetasBySKU[sku] || [];
            const ml = sku === "SOBRE" ? 30 : 50;
            const gNeto = sku === "SOBRE" ? 36 : 60;
            return (
              <div key={sku} className="bg-[#292524] border border-[#44403C] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-bold font-mono ${SKU_COLOR[sku]}`}>
                      {sku}
                    </span>
                    <p className="text-[#57534E] text-xs mt-1">{ml}ml · {gNeto}g neto/botella</p>
                  </div>
                  <FlaskConical size={18} className="text-[#57534E]" />
                </div>

                <div className="space-y-2">
                  {items.map((r) => (
                    <div key={r.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-[#FAFAF9] text-sm">{r.fields.Ingrediente}</p>
                        {r.fields.Notas && (
                          <p className="text-[#57534E] text-xs">{r.fields.Notas}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[#FAFAF9] text-sm font-semibold">
                          {r.fields["Gramos por Botella"]?.toFixed(2)}g
                        </p>
                        <p className="text-[#57534E] text-xs">{r.fields.Porcentaje?.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>

                {items.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#44403C]">
                    <div className="flex justify-between text-xs text-[#A8A29E]">
                      <span>Total por botella</span>
                      <span className="font-semibold">
                        {items.reduce((s, r) => s + (r.fields["Gramos por Botella"] || 0), 0).toFixed(2)}g
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-[#57534E] mt-1">
                      <span>Rendimiento 1kg chiles base</span>
                      <span>~{sku === "SOBRE" ? "30" : "18"} botellas</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
