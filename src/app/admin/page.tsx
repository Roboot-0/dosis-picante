"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Users, Package, TrendingUp, AlertCircle, Clock } from "lucide-react";

interface Pedido {
  id: string;
  fields: {
    "ID Pedido": string;
    "Total USD": number;
    "Estado Pago": string;
    "Estado Envio": string;
    Fecha: string;
    "Nombre (from Cliente)": string[];
  };
}

interface Producto {
  id: string;
  fields: { SKU: string; Nombre: string; Stock: number; "Stock Disponible": boolean };
}

interface Cliente {
  id: string;
  fields: Record<string, unknown>;
}

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-[#292524] rounded-2xl p-6 border border-[#44403C]">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-[#A8A29E] text-sm mb-1">{label}</p>
      <p className="text-[#FAFAF9] text-3xl font-bold">{value}</p>
      {sub && <p className="text-[#57534E] text-xs mt-1">{sub}</p>}
    </div>
  );
}

function estadoPagoColor(estado: string) {
  if (estado === "Pagado") return "bg-green-900/40 text-green-400";
  if (estado === "Pendiente") return "bg-yellow-900/40 text-yellow-400";
  return "bg-red-900/40 text-red-400";
}

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [p, pr, c] = await Promise.all([
        fetch("/api/admin/pedidos").then((r) => r.json()),
        fetch("/api/admin/inventario").then((r) => r.json()),
        fetch("/api/admin/clientes").then((r) => r.json()),
      ]);
      setPedidos(p.records || []);
      setProductos(pr.records || []);
      setClientes(c.records || []);
      setLoading(false);
    }
    load();
  }, []);

  const totalVentas = pedidos
    .filter((p) => p.fields["Estado Pago"] === "Pagado")
    .reduce((s, p) => s + (p.fields["Total USD"] || 0), 0);

  const pendientesPago = pedidos.filter(
    (p) => p.fields["Estado Pago"] === "Pendiente"
  ).length;

  const stockBajo = productos.filter(
    (p) => (p.fields.Stock || 0) < 10
  );

  const recientes = [...pedidos]
    .sort((a, b) => new Date(b.fields.Fecha).getTime() - new Date(a.fields.Fecha).getTime())
    .slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[#FAFAF9] text-2xl font-bold">Dashboard</h1>
        <p className="text-[#A8A29E] text-sm mt-1">
          Resumen operativo de DOSIS Picante
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Ventas totales"
          value={`$${totalVentas.toFixed(2)}`}
          sub={`${pedidos.filter((p) => p.fields["Estado Pago"] === "Pagado").length} pedidos pagados`}
          icon={TrendingUp}
          color="bg-[#DC2626]"
        />
        <StatCard
          label="Pedidos totales"
          value={pedidos.length}
          sub={`${pendientesPago} pendientes de pago`}
          icon={ShoppingBag}
          color="bg-blue-600"
        />
        <StatCard
          label="Clientes"
          value={clientes.length}
          icon={Users}
          color="bg-purple-600"
        />
        <StatCard
          label="Productos activos"
          value={productos.filter((p) => p.fields["Stock Disponible"]).length}
          sub={`${stockBajo.length} con stock bajo`}
          icon={Package}
          color="bg-amber-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pedidos recientes */}
        <div className="lg:col-span-2 bg-[#292524] rounded-2xl border border-[#44403C] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#44403C] flex items-center gap-2">
            <Clock size={16} className="text-[#A8A29E]" />
            <h2 className="text-[#FAFAF9] font-semibold text-sm">
              Pedidos recientes
            </h2>
          </div>
          <div className="divide-y divide-[#44403C]">
            {recientes.length === 0 && (
              <p className="text-[#57534E] text-sm p-6">Sin pedidos aún</p>
            )}
            {recientes.map((p) => (
              <div
                key={p.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-[#FAFAF9] text-sm font-medium truncate">
                    {p.fields["ID Pedido"]}
                  </p>
                  <p className="text-[#57534E] text-xs truncate">
                    {Array.isArray(p.fields["Nombre (from Cliente)"])
                      ? p.fields["Nombre (from Cliente)"][0]
                      : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-lg font-medium ${estadoPagoColor(
                      p.fields["Estado Pago"]
                    )}`}
                  >
                    {p.fields["Estado Pago"] || "—"}
                  </span>
                  <span className="text-[#FAFAF9] text-sm font-semibold">
                    ${(p.fields["Total USD"] || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas de stock */}
        <div className="bg-[#292524] rounded-2xl border border-[#44403C] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#44403C] flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-400" />
            <h2 className="text-[#FAFAF9] font-semibold text-sm">
              Stock bajo (&lt; 10 unidades)
            </h2>
          </div>
          <div className="divide-y divide-[#44403C]">
            {stockBajo.length === 0 && (
              <p className="text-[#57534E] text-sm p-6">✓ Todo el stock está bien</p>
            )}
            {stockBajo.map((p) => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[#FAFAF9] text-sm font-medium">
                    {p.fields.SKU}
                  </p>
                  <p className="text-[#57534E] text-xs">{p.fields.Nombre}</p>
                </div>
                <span className="text-amber-400 font-bold text-sm">
                  {p.fields.Stock || 0} u.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
