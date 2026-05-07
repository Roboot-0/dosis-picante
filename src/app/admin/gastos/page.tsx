"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, RefreshCw, Receipt, Loader2 } from "lucide-react";

interface Gasto {
  id: string;
  fields: {
    Concepto: string;
    "Monto USD": number;
    "Monto Original": number;
    Moneda: string;
    "Moneda PNL": string;
    Fecha: string;
    Mes: string;
    "Categoría": string;
    Estado: string;
    Notas: string;
  };
}

interface Tasas {
  usd_bs: number;
  eur_bs: number;
  fecha: string;
  fuente: string;
}

// Monedas disponibles para registrar el pago
// Bs BCV  → bolívares a tasa BCV USD    → P&L: USD BCV
// EUR BCV → euros a tasa BCV EUR        → P&L: USD BCV  (EUR × tasa_eur_bs ÷ tasa_usd_bs)
// Binance → USDT directo                → P&L: USD Binance
const MONEDAS = [
  { value: "Bs BCV",   label: "Bs BCV",   desc: "Bolívares a tasa BCV",          pnl: "BCV"     },
  { value: "EUR BCV",  label: "EUR BCV",  desc: "Euros a tasa BCV (→ Bs → USD)", pnl: "BCV"     },
  { value: "Binance",  label: "Binance",  desc: "USDT / cripto (1:1 USD)",       pnl: "Binance" },
];

const CATEGORIAS = ["Insumos", "Empaque", "Logística", "Marketing", "Operaciones", "Servicios", "Otros"];
const ESTADOS = ["Pagado", "Pendiente", "Cancelado"];
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
  if (e === "Pagado")   return "bg-green-900/40 text-green-400";
  if (e === "Pendiente") return "bg-yellow-900/40 text-yellow-400";
  return "bg-red-900/40 text-red-400";
};

const pnlColor = (p: string) => {
  if (p === "Binance") return "bg-yellow-900/40 text-yellow-400";
  return "bg-blue-900/40 text-blue-400";
};

const EMPTY_FORM = {
  Concepto: "",
  "Monto Original": "",
  "Monto USD": "",
  Moneda: "Bs BCV",
  Fecha: new Date().toISOString().split("T")[0],
  Mes: MESES[new Date().getMonth()],
  "Categoría": "Insumos",
  Estado: "Pagado",
  Notas: "",
};

export default function GastosPage() {
  const [gastos, setGastos]     = useState<Gasto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterMes, setFilterMes]   = useState("");
  const [filterCat, setFilterCat]   = useState("");
  const [tasas, setTasas]           = useState<Tasas | null>(null);
  const [loadingTasas, setLoadingTasas] = useState(false);
  const [tasaError, setTasaError]   = useState("");

  // Moneda actual info
  const monedaInfo = MONEDAS.find(m => m.value === form.Moneda) || MONEDAS[0];

  // ── Calcular Monto USD según moneda ──────────────────────────────────────
  const calcUSD = useCallback((montoOrig: string, moneda: string, t: Tasas | null): string => {
    const n = parseFloat(montoOrig);
    if (!n || n <= 0) return "";
    if (moneda === "Binance") return n.toFixed(2);
    if (!t) return "";
    if (moneda === "Bs BCV")  return (n / t.usd_bs).toFixed(2);
    if (moneda === "EUR BCV") return ((n * t.eur_bs) / t.usd_bs).toFixed(2);
    return "";
  }, []);

  // Recalcular cuando cambia el monto o moneda
  useEffect(() => {
    const usd = calcUSD(form["Monto Original"], form.Moneda, tasas);
    setForm(f => ({ ...f, "Monto USD": usd }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form["Monto Original"], form.Moneda, tasas]);

  // Cargar tasas BCV al abrir el formulario (si no es Binance)
  useEffect(() => {
    if (!showForm || form.Moneda === "Binance") return;
    if (tasas) return; // ya las tenemos
    setLoadingTasas(true);
    setTasaError("");
    fetch("/api/admin/tipo-cambio")
      .then(r => r.json())
      .then((d: Tasas & { error?: string }) => {
        if (d.error) { setTasaError(d.error); return; }
        setTasas(d);
      })
      .catch(() => setTasaError("No se pudo obtener las tasas BCV."))
      .finally(() => setLoadingTasas(false));
  }, [showForm, form.Moneda]);

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const montoOrig = parseFloat(form["Monto Original"] as string) || 0;
    const montoUSD  = parseFloat(form["Monto USD"] as string) || 0;
    const pnl = monedaInfo.pnl;

    await fetch("/api/admin/gastos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        "Monto Original": montoOrig,
        "Monto USD":      montoUSD,
        "Moneda PNL":     pnl,
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
    setGastos(prev => prev.filter(g => g.id !== id));
    setDeleting(null);
  };

  const totalBCV     = gastos.filter(g => g.fields.Estado === "Pagado" && g.fields["Moneda PNL"] !== "Binance").reduce((s, g) => s + (g.fields["Monto USD"] || 0), 0);
  const totalBinance = gastos.filter(g => g.fields.Estado === "Pagado" && g.fields["Moneda PNL"] === "Binance").reduce((s, g) => s + (g.fields["Monto USD"] || 0), 0);

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
  };

  const monedaOrigLabel = (g: Gasto) => {
    const m = g.fields.Moneda || "";
    if (m === "Bs BCV")  return `Bs ${(g.fields["Monto Original"] || 0).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
    if (m === "EUR BCV") return `€${(g.fields["Monto Original"] || 0).toFixed(2)}`;
    if (m === "Binance") return `$${(g.fields["Monto USD"] || 0).toFixed(2)}`;
    return `$${(g.fields["Monto USD"] || 0).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[#FAFAF9] text-2xl font-bold">Gastos</h1>
          <div className="flex gap-4 mt-1">
            <p className="text-[#A8A29E] text-sm">
              BCV: <span className="text-blue-400 font-semibold">${totalBCV.toFixed(2)}</span>
            </p>
            <p className="text-[#A8A29E] text-sm">
              Binance: <span className="text-yellow-400 font-semibold">${totalBinance.toFixed(2)}</span>
            </p>
            <p className="text-[#A8A29E] text-sm">
              Total: <span className="text-[#FAFAF9] font-semibold">${(totalBCV + totalBinance).toFixed(2)}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl text-sm hover:bg-[#3C3835] transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 px-4 py-2 bg-[#DC2626] text-white rounded-xl text-sm font-medium hover:bg-[#B91C1C] transition-colors">
            <Plus size={14} />
            Nuevo gasto
          </button>
        </div>
      </div>

      {/* ── Formulario ── */}
      {showForm && (
        <form onSubmit={submit} className="bg-[#292524] border border-[#44403C] rounded-2xl p-5 space-y-4">
          <h2 className="text-[#FAFAF9] font-semibold text-sm">Registrar nuevo gasto</h2>

          {/* Tasas BCV en tiempo real */}
          {form.Moneda !== "Binance" && (
            <div className="bg-[#1C1917] rounded-xl px-4 py-2.5 flex items-center gap-3">
              {loadingTasas ? (
                <><Loader2 size={13} className="animate-spin text-[#57534E]" /><span className="text-[#57534E] text-xs">Consultando tasas BCV...</span></>
              ) : tasaError ? (
                <span className="text-red-400 text-xs">{tasaError}</span>
              ) : tasas ? (
                <>
                  <span className="text-[#57534E] text-xs">BCV hoy</span>
                  <span className="text-[#FAFAF9] text-xs font-semibold">$1 = Bs {tasas.usd_bs.toFixed(2)}</span>
                  <span className="text-[#44403C]">·</span>
                  <span className="text-[#FAFAF9] text-xs font-semibold">€1 = Bs {tasas.eur_bs.toFixed(2)}</span>
                  <span className="text-[#44403C]">·</span>
                  <span className="text-[#57534E] text-xs">{tasas.fecha}</span>
                </>
              ) : null}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">

            {/* Concepto */}
            <div className="col-span-2 lg:col-span-3">
              <label className="text-[#57534E] text-xs mb-1 block">Concepto *</label>
              <input required type="text" placeholder="Ej: Ají caballero 2kg, Etiquetas batch #3"
                value={form.Concepto}
                onChange={e => setForm(f => ({ ...f, Concepto: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            {/* Moneda */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Moneda *</label>
              <select value={form.Moneda}
                onChange={e => setForm(f => ({ ...f, Moneda: e.target.value, "Monto Original": "", "Monto USD": "" }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              >
                {MONEDAS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <p className="text-[#57534E] text-[10px] mt-1">{monedaInfo.desc} · P&L: <span className={monedaInfo.pnl === "Binance" ? "text-yellow-400" : "text-blue-400"}>{monedaInfo.pnl}</span></p>
            </div>

            {/* Monto Original */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">
                {form.Moneda === "Bs BCV" ? "Monto en Bs *" : form.Moneda === "EUR BCV" ? "Monto en EUR *" : "Monto USDT *"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57534E] text-sm">
                  {form.Moneda === "Bs BCV" ? "Bs" : form.Moneda === "EUR BCV" ? "€" : "$"}
                </span>
                <input required type="number" min={0} step={form.Moneda === "Bs BCV" ? "1" : "0.01"} placeholder="0.00"
                  value={form["Monto Original"]}
                  onChange={e => setForm(f => ({ ...f, "Monto Original": e.target.value }))}
                  className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
                />
              </div>
            </div>

            {/* Equivalente USD — calculado automáticamente, editable como override */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">
                {form.Moneda === "Binance" ? "USD" : "Equiv. USD (auto)"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57534E] text-sm">$</span>
                <input required type="number" min={0} step="0.01" placeholder="0.00"
                  value={form["Monto USD"]}
                  onChange={e => setForm(f => ({ ...f, "Monto USD": e.target.value }))}
                  className={`w-full bg-[#1C1917] border rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-[#DC2626] ${
                    form.Moneda !== "Binance" && form["Monto USD"]
                      ? "border-green-800 text-green-400"
                      : "border-[#44403C] text-[#FAFAF9]"
                  } placeholder-[#57534E]`}
                />
              </div>
              {form.Moneda !== "Binance" && form["Monto USD"] && (
                <p className="text-[#57534E] text-[10px] mt-1">Calculado con tasa BCV · editable si hay diferencia</p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Fecha</label>
              <input type="date" value={form.Fecha}
                onChange={e => setForm(f => ({ ...f, Fecha: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            {/* Mes */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Mes</label>
              <select value={form.Mes}
                onChange={e => setForm(f => ({ ...f, Mes: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              >
                {MESES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Categoría</label>
              <select value={form["Categoría"]}
                onChange={e => setForm(f => ({ ...f, "Categoría": e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              >
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="text-[#57534E] text-xs mb-1 block">Estado</label>
              <select value={form.Estado}
                onChange={e => setForm(f => ({ ...f, Estado: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              >
                {ESTADOS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>

            {/* Notas */}
            <div className="col-span-2">
              <label className="text-[#57534E] text-xs mb-1 block">Notas</label>
              <input type="text" placeholder="Opcional..."
                value={form.Notas}
                onChange={e => setForm(f => ({ ...f, Notas: e.target.value }))}
                className="w-full bg-[#1C1917] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-[#DC2626] text-white rounded-xl text-sm font-medium hover:bg-[#B91C1C] transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar gasto"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-[#3C3835] text-[#A8A29E] rounded-xl text-sm hover:bg-[#44403C] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterMes} onChange={e => setFilterMes(e.target.value)}
          className="bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
        >
          <option value="">Todos los meses</option>
          {MESES.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
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
                  <th className="text-left px-4 py-3">USD P&L</th>
                  <th className="text-left px-4 py-3">P&L</th>
                  <th className="text-left px-4 py-3">Categoría</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#44403C]">
                {gastos.map(g => (
                  <tr key={g.id} className="hover:bg-[#3C3835]/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-[#FAFAF9] font-medium">{g.fields.Concepto || "—"}</p>
                      {g.fields.Notas && <p className="text-[#57534E] text-xs mt-0.5">{g.fields.Notas}</p>}
                    </td>
                    <td className="px-4 py-3 text-[#A8A29E] text-xs whitespace-nowrap">{g.fields.Moneda || "—"}</td>
                    <td className="px-4 py-3 text-[#FAFAF9] font-semibold whitespace-nowrap text-xs">
                      {monedaOrigLabel(g)}
                    </td>
                    <td className="px-4 py-3 text-[#FAFAF9] font-semibold whitespace-nowrap">
                      ${(g.fields["Monto USD"] || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${pnlColor(g.fields["Moneda PNL"])}`}>
                        {g.fields["Moneda PNL"] || "BCV"}
                      </span>
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
                    <td className="px-4 py-3 text-[#A8A29E] whitespace-nowrap text-xs">
                      {formatDate(g.fields.Fecha)}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => del(g.id)} disabled={deleting === g.id}
                        className="text-[#57534E] hover:text-red-400 transition-colors p-1"
                      >
                        {deleting === g.id
                          ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={14} />}
                      </button>
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
