"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Save, Package } from "lucide-react";

interface Producto {
  id: string;
  fields: {
    SKU: string;
    Nombre: string;
    Stock: number;
    "Precio USD": number;
    Activo: boolean;
    "Stock Disponible": boolean;
  };
}

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, Partial<Producto["fields"]>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/inventario");
    const data = await res.json();
    setProductos(data.records || []);
    setEdits({});
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const edit = (id: string, field: string, value: unknown) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const save = async (id: string) => {
    if (!edits[id]) return;
    setSaving(id);
    await fetch("/api/admin/inventario", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, fields: edits[id] }),
    });
    setProductos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, fields: { ...p.fields, ...edits[id] } }
          : p
      )
    );
    setEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSaving(null);
    setSaved(id);
    setTimeout(() => setSaved(null), 2000);
  };

  const getVal = <K extends keyof Producto["fields"]>(
    p: Producto,
    field: K
  ): Producto["fields"][K] => {
    if (edits[p.id] && field in edits[p.id]) {
      return edits[p.id][field] as Producto["fields"][K];
    }
    return p.fields[field];
  };

  const stockStatus = (stock: number, disponible: boolean) => {
    if (!disponible) return { label: "Inactivo", cls: "bg-[#3C3835] text-[#57534E]" };
    if (stock === 0) return { label: "Sin stock", cls: "bg-red-900/40 text-red-400" };
    if (stock < 10) return { label: "Stock bajo", cls: "bg-yellow-900/40 text-yellow-400" };
    return { label: "OK", cls: "bg-green-900/40 text-green-400" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#FAFAF9] text-2xl font-bold">Inventario</h1>
          <p className="text-[#A8A29E] text-sm mt-1">
            {productos.filter((p) => p.fields["Stock Disponible"]).length} productos activos
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl text-sm hover:bg-[#3C3835] transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {productos.length === 0 && (
            <div className="text-center text-[#57534E] py-16">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay productos</p>
            </div>
          )}
          {productos.map((p) => {
            const stock = (getVal(p, "Stock") as number) ?? 0;
            const precio = (getVal(p, "Precio USD") as number) ?? 0;
            const disponible = (getVal(p, "Stock Disponible") as boolean) ?? false;
            const activo = (getVal(p, "Activo") as boolean) ?? false;
            const status = stockStatus(stock, disponible);
            const hasEdits = !!edits[p.id] && Object.keys(edits[p.id]).length > 0;

            return (
              <div
                key={p.id}
                className="bg-[#292524] border border-[#44403C] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5"
              >
                {/* SKU + Nombre */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-[#DC2626] text-xs font-bold bg-[#DC2626]/10 px-2 py-0.5 rounded-lg">
                      {p.fields.SKU}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                    {saved === p.id && (
                      <span className="text-green-400 text-xs">✓ Guardado</span>
                    )}
                  </div>
                  <p className="text-[#FAFAF9] font-semibold truncate">{p.fields.Nombre}</p>
                </div>

                {/* Controles */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Stock */}
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[#57534E] text-xs">Stock (u.)</label>
                    <input
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => edit(p.id, "Stock", parseInt(e.target.value) || 0)}
                      className="w-20 bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] text-center rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>

                  {/* Precio */}
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[#57534E] text-xs">Precio USD</label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={precio}
                      onChange={(e) => edit(p.id, "Precio USD", parseFloat(e.target.value) || 0)}
                      className="w-24 bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] text-center rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>

                  {/* Disponible toggle */}
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[#57534E] text-xs">Disponible</label>
                    <button
                      onClick={() => edit(p.id, "Stock Disponible", !disponible)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        disponible ? "bg-[#DC2626]" : "bg-[#44403C]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          disponible ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Activo toggle */}
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[#57534E] text-xs">Activo</label>
                    <button
                      onClick={() => edit(p.id, "Activo", !activo)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        activo ? "bg-[#DC2626]" : "bg-[#44403C]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          activo ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Guardar */}
                  <button
                    onClick={() => save(p.id)}
                    disabled={!hasEdits || saving === p.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      hasEdits && saving !== p.id
                        ? "bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                        : "bg-[#3C3835] text-[#57534E] cursor-not-allowed"
                    }`}
                  >
                    {saving === p.id ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Guardar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
