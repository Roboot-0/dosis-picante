"use client";

import { useEffect, useState, useMemo } from "react";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, ShoppingBag, FlaskConical, Receipt } from "lucide-react";

interface PedidoRec {
  id: string;
  fields: { "Total USD"?: number; Fecha?: string; "Estado Pago"?: string };
}
interface GastoRec {
  id: string;
  fields: { "Monto USD"?: number; Fecha?: string; "Categoría"?: string; Estado?: string; Concepto?: string };
}
interface ProduccionRec {
  id: string;
  fields: { "Costo Total USD"?: number; Fecha?: string; SKU?: string; "Unidades Producidas"?: number; Estado?: string };
}

const ESTADOS_PAGADO = ["Confirmado", "Pagado", "Verificado", "Completado"];

function kpi(label: string, value: string, sub: string, icon: React.ReactNode, color: string) {
  return (
    <div className="bg-[#292524] border border-[#44403C] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#57534E] text-xs uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <p className="text-[#FAFAF9] text-2xl font-bold">{value}</p>
      <p className="text-[#57534E] text-xs mt-1">{sub}</p>
    </div>
  );
}

function plRow(label: string, value: number, indent = false, bold = false, positive?: boolean) {
  const color = positive === true ? "text-green-400" : positive === false ? "text-red-400" : "text-[#FAFAF9]";
  return (
    <div className={`flex items-center justify-between py-2.5 ${indent ? "pl-6" : ""} ${bold ? "border-t border-[#44403C] mt-1 pt-3" : ""}`}>
      <span className={`text-sm ${bold ? "text-[#FAFAF9] font-semibold" : "text-[#A8A29E]"}`}>{label}</span>
      <span className={`text-sm font-semibold ${color}`}>
        {value >= 0 ? "" : "−"}${Math.abs(value).toFixed(2)}
      </span>
    </div>
  );
}

export default function FinanzasPage() {
  const [data, setData] = useState<{ pedidos: PedidoRec[]; gastos: GastoRec[]; produccion: ProduccionRec[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterMes, setFilterMes] = useState("todos");

  const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/finanzas");
    const d = await res.json();
    setData(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const metrics = useMemo(() => {
    if (!data) return null;

    const filterByMes = (fecha?: string) => {
      if (filterMes === "todos" || !fecha) return true;
      const d = new Date(fecha);
      return MESES[d.getMonth()] === filterMes;
    };

    // Ingresos: pedidos confirmados/pagados
    const pedidosFiltrados = data.pedidos.filter(
      (p) => ESTADOS_PAGADO.includes(p.fields["Estado Pago"] || "") && filterByMes(p.fields.Fecha)
    );
    const ingresos = pedidosFiltrados.reduce((s, p) => s + (p.fields["Total USD"] || 0), 0);

    // COGS: batches completados
    const produccionFiltrada = data.produccion.filter(
      (p) => p.fields.Estado === "Completado" && filterByMes(p.fields.Fecha)
    );
    const cogs = produccionFiltrada.reduce((s, p) => s + (p.fields["Costo Total USD"] || 0), 0);
    const unidadesProducidas = produccionFiltrada.reduce((s, p) => s + (p.fields["Unidades Producidas"] || 0), 0);

    // Gastos operativos (pagados)
    const gastosFiltrados = data.gastos.filter(
      (g) => g.fields.Estado === "Pagado" && filterByMes(g.fields.Fecha)
    );
    const gastosTotal = gastosFiltrados.reduce((s, g) => s + (g.fields["Monto USD"] || 0), 0);

    // Gastos por categoría
    const gastosPorCat: Record<string, number> = {};
    for (const g of gastosFiltrados) {
      const cat = g.fields["Categoría"] || "Otros";
      gastosPorCat[cat] = (gastosPorCat[cat] || 0) + (g.fields["Monto USD"] || 0);
    }

    // P&L
    const margenBruto = ingresos - cogs;
    const utilidadNeta = margenBruto - gastosTotal;
    const margenPct = ingresos > 0 ? (margenBruto / ingresos) * 100 : 0;
    const roi = gastosTotal > 0 ? (utilidadNeta / gastosTotal) * 100 : 0;

    // Ventas por SKU (desde produccion como proxy)
    const ventasPorSKU = data.produccion.reduce((acc, p) => {
      if (p.fields.Estado === "Completado") {
        const sku = p.fields.SKU || "—";
        acc[sku] = (acc[sku] || 0) + (p.fields["Unidades Producidas"] || 0);
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      ingresos, cogs, margenBruto, gastosTotal, utilidadNeta,
      margenPct, roi, gastosPorCat, ventasPorSKU,
      pedidosCount: pedidosFiltrados.length, unidadesProducidas,
    };
  }, [data, filterMes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[#FAFAF9] text-2xl font-bold">Finanzas & P&L</h1>
          <p className="text-[#A8A29E] text-sm mt-1">Estado financiero real — ventas, costos y utilidad</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterMes}
            onChange={(e) => setFilterMes(e.target.value)}
            className="bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
          >
            <option value="todos">Todo el período</option>
            {MESES.map((m) => <option key={m}>{m}</option>)}
          </select>
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl text-sm hover:bg-[#3C3835] transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading || !metrics ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── KPIs ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpi("Ingresos", `$${metrics.ingresos.toFixed(2)}`, `${metrics.pedidosCount} pedidos confirmados`,
              <ShoppingBag size={16} />, "bg-green-900/40 text-green-400")}
            {kpi("COGS", `$${metrics.cogs.toFixed(2)}`, `${metrics.unidadesProducidas} uds producidas`,
              <FlaskConical size={16} />, "bg-blue-900/40 text-blue-400")}
            {kpi("Gastos Operativos", `$${metrics.gastosTotal.toFixed(2)}`, "gastos pagados",
              <Receipt size={16} />, "bg-yellow-900/40 text-yellow-400")}
            {kpi("Utilidad Neta", `$${metrics.utilidadNeta.toFixed(2)}`,
              `ROI ${metrics.roi.toFixed(1)}% · Margen ${metrics.margenPct.toFixed(1)}%`,
              metrics.utilidadNeta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />,
              metrics.utilidadNeta >= 0 ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400")}
          </div>

          {/* ── P&L Statement + Breakdown ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Estado de resultados */}
            <div className="bg-[#292524] border border-[#44403C] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={16} className="text-[#DC2626]" />
                <h2 className="text-[#FAFAF9] font-semibold text-sm">Estado de Resultados (P&L)</h2>
              </div>
              <div className="divide-y divide-[#44403C]/50">
                {plRow("Ventas brutas", metrics.ingresos)}
                {plRow("Costo de ventas (COGS)", -metrics.cogs, true)}
                {plRow("Margen Bruto", metrics.margenBruto, false, true, metrics.margenBruto >= 0)}
                <div className="pt-2">
                  <p className="text-[#57534E] text-xs uppercase tracking-wider mb-1">Gastos Operativos</p>
                  {Object.entries(metrics.gastosPorCat)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, monto]) => plRow(cat, -monto, true))}
                  {plRow("Total Gastos Op.", -metrics.gastosTotal, false, true)}
                </div>
                {plRow("UTILIDAD NETA", metrics.utilidadNeta, false, true, metrics.utilidadNeta >= 0)}
              </div>

              {/* Métricas clave */}
              <div className="mt-4 pt-4 border-t border-[#44403C] grid grid-cols-2 gap-3">
                <div className="bg-[#1C1917] rounded-xl p-3">
                  <p className="text-[#57534E] text-xs">Margen bruto</p>
                  <p className={`text-lg font-bold ${metrics.margenPct >= 50 ? "text-green-400" : "text-yellow-400"}`}>
                    {metrics.margenPct.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-[#1C1917] rounded-xl p-3">
                  <p className="text-[#57534E] text-xs">ROI sobre inversión</p>
                  <p className={`text-lg font-bold ${metrics.roi >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {metrics.roi.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-[#1C1917] rounded-xl p-3">
                  <p className="text-[#57534E] text-xs">Inversión total</p>
                  <p className="text-lg font-bold text-[#FAFAF9]">
                    ${(metrics.cogs + metrics.gastosTotal).toFixed(2)}
                  </p>
                </div>
                <div className="bg-[#1C1917] rounded-xl p-3">
                  <p className="text-[#57534E] text-xs">Recuperación inversión</p>
                  <p className={`text-lg font-bold ${metrics.utilidadNeta >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {metrics.utilidadNeta >= 0 ? "✓ Recuperada" : "En progreso"}
                  </p>
                </div>
              </div>
            </div>

            {/* Gastos por categoría + Producción por SKU */}
            <div className="space-y-5">
              {/* Gastos por categoría */}
              <div className="bg-[#292524] border border-[#44403C] rounded-2xl p-5">
                <h2 className="text-[#FAFAF9] font-semibold text-sm mb-4">Gastos por Categoría</h2>
                {Object.keys(metrics.gastosPorCat).length === 0 ? (
                  <p className="text-[#57534E] text-sm">Sin gastos en el período</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(metrics.gastosPorCat)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, monto]) => {
                        const pct = metrics.gastosTotal > 0 ? (monto / metrics.gastosTotal) * 100 : 0;
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-[#A8A29E]">{cat}</span>
                              <span className="text-[#FAFAF9] font-semibold">${monto.toFixed(2)}</span>
                            </div>
                            <div className="h-1.5 bg-[#1C1917] rounded-full overflow-hidden">
                              <div className="h-full bg-[#DC2626] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Unidades producidas por SKU */}
              <div className="bg-[#292524] border border-[#44403C] rounded-2xl p-5">
                <h2 className="text-[#FAFAF9] font-semibold text-sm mb-4">Producción por SKU</h2>
                {Object.keys(metrics.ventasPorSKU).length === 0 ? (
                  <p className="text-[#57534E] text-sm">Sin batches completados</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(metrics.ventasPorSKU)
                      .sort((a, b) => b[1] - a[1])
                      .map(([sku, uds]) => {
                        const pct = metrics.unidadesProducidas > 0 ? (uds / metrics.unidadesProducidas) * 100 : 0;
                        return (
                          <div key={sku}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-mono text-[#DC2626] text-xs font-bold bg-[#DC2626]/10 px-2 py-0.5 rounded-lg">{sku}</span>
                              <span className="text-[#FAFAF9] font-semibold">{uds} uds</span>
                            </div>
                            <div className="h-1.5 bg-[#1C1917] rounded-full overflow-hidden">
                              <div className="h-full bg-[#DC2626]/60 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    <p className="text-[#57534E] text-xs pt-1">Total: {metrics.unidadesProducidas} unidades producidas</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nota si ingresos = 0 */}
          {metrics.ingresos === 0 && (
            <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-4">
              <p className="text-yellow-400 text-sm">
                <strong>Nota:</strong> Los ingresos muestran $0 porque los pedidos en Airtable aún no tienen Estado Pago marcado como &quot;Confirmado&quot; o &quot;Pagado&quot;. Los gastos e inversiones sí están correctos ($
                {metrics.gastosTotal.toFixed(2)} en gastos operativos + ${metrics.cogs.toFixed(2)} COGS).
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
