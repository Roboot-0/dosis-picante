"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, RefreshCw, Receipt } from "lucide-react";

interface Gasto {
  id: string;
  fields: {
    Concepto: string;
    "Monto USD": number;
    "Monto Original": number;
    Moneda: string;
    Fecha: string;
    Mes: string;
    "Categoría": string;
    Estado: string;
    Notas: string;
  };
}

const CATEGORIAS = ["Insumos", "Empaque", "Logística", "Marketing", "Operaciones", "Servicios", "Otros"];
const ESTADOS = ["Pagado", "Pendiente", "Cancelado"];
const MONEDAS = ["USD", "EUR", "Binance", "Bs"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const catColor = (cat: string) => {
  const map: Record<string, string> = {
    Insumos: "bg-green-900/40 text-green-400",
    Empaque: "bg-blue-900/40 text-blue-400",
    Logística: "bg-yellow-900/40 text-yellow-400",
    Marketing: "bg-purple-900/40 text-purple-400",
    Operaciones: "bg-orange-900/40 text-orange-400",
    Servicios: "bg-cyan-900/40 text-cyan-400",
    Otros: "bg-[#3C3835] text-[#A8A29E]",
  };
  return map[cat] || map["Otros"];
};

const estadoColor = (e: string) => {
  if (e === "Pagado") return "bg-green-900/40 text-green-400";
  if (e === "Pendiente") return "bg-yellow-900/40 text-yellow-400";
  return "bg-red-900/40 text-red-400";
};

const monedaColor = (m: string) => {
  if (m === "USD") return "bg-green-900/40 text-green-400";
  if (m === "EUR") return "bg-blue-900/40 text-blue-400";
  if (m === "Binance") return "bg-yellow-900/40 text-yellow-400";
  if (m === "Bs") return "bg-orange-900/40 text-orange-400";
  return "bg-[#3C3835] text-[#A8A29E]";
};

const monedaSymbol = (m: string) => {
  if (m === "EUR") return "€";
  if (m === "Bs") return "Bs ";
  return "$";
};

const EMPTY_FORM = {
  Concepto: "",
  "Monto Original": "",
  "Monto USD": "",
  Moneda: "USD",
  Fecha: new Date().toISOString().split("T")[0],
  Mes: MESES[new Date().getMonth()],
  "Categoría": "Insumos",
  Estado: "Pagado",
  Notas: "",
};

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterMes, setFilterMes] = useState("");
  const [filterCat, setFilterCat] = useState("");

  // USD y Binance son 1:1 con USD — no hace falta campo extra
  const isSameCurrency = form.Moneda === "USD" || form.Moneda === "Binance";

  const load = async () => {
    setLoading(true);
    let url = "/api/admin/gastos?";
    if (filterMes) url += `mes=${filterMes}&`;
    if (filterCat) url += `categoria=${filterCat}`;
    const res = await fetch(url);
    const data = await res.json();
    setGastos(data.records || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterMes, filterCat]);

  // Sincronizar Monto USD cuando la moneda es USD o Binance
  useEffect(() => {
    if (isSameCurrency) {
      setForm((f) => ({ ...f, "Monto USD": f["Monto Original"] }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form["Monto Original"], form.Moneda]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const montoOriginal = parseFloat(form["Monto Original"] as string) || 0;
    const montoUSD = isSameCurrency ? montoOriginal : (parseFloat(form["Monto USD"] as string) || 0);
    await fetch("/api/admin/gastos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        "Monto Original": montoOriginal,
        "Monto USD": montoUSD,
      }),
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("¿Eliminar este gasto?")) return;
    setDeleting(id);
    await fetch("/api/admin/gastos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setGastos((prev) => prev.filter((g) => g.id !== id));
    setDeleting(null);
  };

  const totalFiltrado = gastos
    .filter((g) => g.fields.Estado === "Pagado")
    .reduce((s, g) => s + (g.fields["Monto USD"] || 0), 0);

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#FAFAF9] text-2xl font-bold">Gastos</h1>
          <p className="text-[#A8A29E] text-sm mt-1">
            Total pagado: <span className="text-[#FAFAF9] font-semibold">${totalFiltrado.toFixed(2)} USD</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl text-sm hover:bg-[#3C3835] transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="flex items-center gap-2 px-4 py-2 bg-[#DC2626] text-white rounded-xl text-sm font-medium hover:bg-[#B91C1C] transition-colors"
          >
            <Plus size={14} />
            Nuevo gasto
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={submit} className="bg-[#292524] border border-[#44403C] rounded-2xl p-5 space-y-4">
          <h2 className="text-[#FAFAF9] font-semibold text-sm">Registrar nuevo gasto</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">

            {/* Concepto */}
            <div className="col-span-2 lg:col-span-3">
              <label className="text-[#57534E] text-xs mb-1 block">Concepto *</label>
              <input
                required
                type="text"
                placeholder="Ej: Ají caballero 2kg, Etiquetas batch #3"
                value={form.Concepto}
                onChange={(e) => setForm((f) => ({ ...f, Concepto: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            {/* Moneda */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Moneda *</label>
              <select
                value={form.Moneda}
                onChange={(e) => setForm((f) => ({ ...f, Moneda: e.target.value, "Monto USD": "" }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              >
                {MONEDAS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <p className="text-[#57534E] text-[10px] mt-1">
                {form.Moneda === "USD" && "Dólares cash"}
                {form.Moneda === "EUR" && "Euros — ingresa equiv. USD también"}
                {form.Moneda === "Binance" && "USDT / cripto"}
                {form.Moneda === "Bs" && "Bolívares — ingresa equiv. USD también"}
              </p>
            </div>

            {/* Monto Original */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">
                Monto en {form.Moneda} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57534E] text-sm">
                  {monedaSymbol(form.Moneda)}
                </span>
                <input
                  required
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={form["Monto Original"]}
                  onChange={(e) => setForm((f) => ({ ...f, "Monto Original": e.target.value }))}
                  className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
                />
              </div>
            </div>

            {/* Equivalente USD — solo para EUR y Bs */}
            {!isSameCurrency && (
              <div>
                <label className="text-[#57534E] text-xs mb-1 block">Equivalente USD *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57534E] text-sm">$</span>
                  <input
                    required
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    value={form["Monto USD"]}
                    onChange={(e) => setForm((f) => ({ ...f, "Monto USD": e.target.value }))}
                    className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
                  />
                </div>
              </div>
            )}

            {/* Fecha */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Fecha</label>
              <input
                type="date"
                value={form.Fecha}
                onChange={(e) => setForm((f) => ({ ...f, Fecha: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            {/* Mes */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Mes</label>
              <select
                value={form.Mes}
                onChange={(e) => setForm((f) => ({ ...f, Mes: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              >
                {MESES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Categoría</label>
              <select
                value={form["Categoría"]}
                onChange={(e) => setForm((f) => ({ ...f, "Categoría": e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              >
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Estado</label>
              <select
                value={form.Estado}
                onChange={(e) => setForm((f) => ({ ...f, Estado: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              >
                {ESTADOS.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>

            {/* Notas */}
            <div className="col-span-2">
              <label className="text-[#57534E] text-xs mb-1 block">Notas</label>
              <input
                type="text"
                placeholder="Opcional..."
                value={form.Notas}
                onChange={(e) => setForm((f) => ({ ...f, Notas: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#DC2626] text-white rounded-xl text-sm font-medium hover:bg-[#B91C1C] transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar gasto"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-[#3C3835] text-[#A8A29E] rounded-xl text-sm hover:bg-[#44403C] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterMes}
          onChange={(e) => setFilterMes(e.target.value)}
          className="bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
        >
          <option value="">Todos los meses</option>
          {MESES.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : gastos.length === 0 ? (
        <div className="text-center text-[#57534E] py-16">
          <Receipt size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay gastos registrados</p>
        </div>
      ) : (
        <div className="bg-[#292524] rounded-2xl border border-[#44403C] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#44403C] text-[#57534E] text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Concepto</th>
                  <th className="text-left px-4 py-3">Moneda</th>
                  <th className="text-left px-4 py-3">Monto</th>
                  <th className="text-left px-4 py-3">USD</th>
                  <th className="text-left px-4 py-3">Categoría</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#44403C]">
                {gastos.map((g) => {
                  const moneda = g.fields.Moneda || "USD";
                  const montoOrig = g.fields["Monto Original"] || g.fields["Monto USD"] || 0;
                  const montoUSD = g.fields["Monto USD"] || 0;
                  const isSame = moneda === "USD" || moneda === "Binance";
                  return (
                    <tr key={g.id} className="hover:bg-[#3C3835]/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-[#FAFAF9] font-medium">{g.fields.Concepto || "—"}</p>
                        {g.fields.Notas && <p className="text-[#57534E] text-xs mt-0.5">{g.fields.Notas}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${monedaColor(moneda)}`}>
                          {moneda}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#FAFAF9] font-semibold whitespace-nowrap">
                        {monedaSymbol(moneda)}{montoOrig.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isSame
                          ? <span className="text-[#57534E] text-xs">—</span>
                          : <span className="text-[#A8A29E] text-xs">${montoUSD.toFixed(2)}</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${catColor(g.fields["Categoría"])}`}>
                          {g.fields["Categoría"] || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${estadoColor(g.fields.Estado)}`}>
                          {g.fields.Estado || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#A8A29E] whitespace-nowrap">
                        {formatDate(g.fields.Fecha)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => del(g.id)}
                          disabled={deleting === g.id}
                          className="text-[#57534E] hover:text-red-400 transition-colors p-1"
                        >
                          {deleting === g.id ? (
                            <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
