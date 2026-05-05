"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";

interface Pedido {
  id: string;
  fields: {
    "ID Pedido": string;
    "Total USD": number;
    "Estado Pago": string;
    "Estado Envio": string;
    Fecha: string;
    "Nombre (from Cliente)": string[];
    "Email (from Cliente)": string[];
    "Metodo Pago": string;
    "Direccion Envio": string;
    Notas: string;
    "Items JSON": string;
  };
}

const ESTADOS_PAGO = ["Pendiente", "Pagado", "Reembolsado", "Cancelado"];
const ESTADOS_ENVIO = ["Pendiente", "Preparando", "Enviado", "Entregado", "Devuelto"];

function estadoPagoStyle(e: string) {
  if (e === "Pagado") return "bg-green-900/40 text-green-400 border border-green-800/40";
  if (e === "Pendiente") return "bg-yellow-900/40 text-yellow-400 border border-yellow-800/40";
  if (e === "Reembolsado") return "bg-blue-900/40 text-blue-400 border border-blue-800/40";
  return "bg-red-900/40 text-red-400 border border-red-800/40";
}

function estadoEnvioStyle(e: string) {
  if (e === "Entregado") return "bg-green-900/40 text-green-400 border border-green-800/40";
  if (e === "Enviado") return "bg-blue-900/40 text-blue-400 border border-blue-800/40";
  if (e === "Preparando") return "bg-purple-900/40 text-purple-400 border border-purple-800/40";
  if (e === "Devuelto") return "bg-orange-900/40 text-orange-400 border border-orange-800/40";
  return "bg-[#3C3835] text-[#A8A29E] border border-[#57534E]/40";
}

function SelectDropdown({
  value,
  options,
  onChange,
  styleMap,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  styleMap: (v: string) => string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${styleMap(value)}`}
      >
        {value || "—"}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 bg-[#1C1917] border border-[#44403C] rounded-xl shadow-2xl min-w-[130px] overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-[#292524] transition-colors ${styleMap(opt)}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterPago, setFilterPago] = useState("");
  const [filterEnvio, setFilterEnvio] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/pedidos");
    const data = await res.json();
    setPedidos(data.records || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, field: string, value: string) => {
    setSaving(id);
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, fields: { ...p.fields, [field]: value } } : p
      )
    );
    await fetch("/api/admin/pedidos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordId: id, fields: { [field]: value } }),
    });
    setSaving(null);
  };

  const filtered = pedidos.filter((p) => {
    const nombre = Array.isArray(p.fields["Nombre (from Cliente)"])
      ? p.fields["Nombre (from Cliente)"][0]
      : "";
    const matchSearch =
      !search ||
      p.fields["ID Pedido"]?.toLowerCase().includes(search.toLowerCase()) ||
      nombre.toLowerCase().includes(search.toLowerCase());
    const matchPago = !filterPago || p.fields["Estado Pago"] === filterPago;
    const matchEnvio = !filterEnvio || p.fields["Estado Envio"] === filterEnvio;
    return matchSearch && matchPago && matchEnvio;
  });

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-VE", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#FAFAF9] text-2xl font-bold">Pedidos</h1>
          <p className="text-[#A8A29E] text-sm mt-1">{pedidos.length} pedidos totales</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl text-sm hover:bg-[#3C3835] transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por ID o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-[#292524] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
        />
        <select
          value={filterPago}
          onChange={(e) => setFilterPago(e.target.value)}
          className="bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
        >
          <option value="">Todos los pagos</option>
          {ESTADOS_PAGO.map((e) => <option key={e}>{e}</option>)}
        </select>
        <select
          value={filterEnvio}
          onChange={(e) => setFilterEnvio(e.target.value)}
          className="bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]"
        >
          <option value="">Todos los envíos</option>
          {ESTADOS_ENVIO.map((e) => <option key={e}>{e}</option>)}
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#292524] rounded-2xl border border-[#44403C] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#44403C] text-[#57534E] text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Pago</th>
                  <th className="text-left px-4 py-3">Envío</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#44403C]">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-[#57534E] py-12">
                      No hay pedidos que coincidan
                    </td>
                  </tr>
                )}
                {filtered.map((p) => {
                  const nombre = Array.isArray(p.fields["Nombre (from Cliente)"])
                    ? p.fields["Nombre (from Cliente)"][0]
                    : "—";
                  const email = Array.isArray(p.fields["Email (from Cliente)"])
                    ? p.fields["Email (from Cliente)"][0]
                    : "";
                  const isExpanded = expanded === p.id;
                  return (
                    <>
                      <tr key={p.id} className="hover:bg-[#3C3835]/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-[#FAFAF9] font-medium text-xs">
                          {p.fields["ID Pedido"] || "—"}
                        </td>
                        <td className="px-4 py-3 text-[#A8A29E] whitespace-nowrap">
                          {formatDate(p.fields.Fecha)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#FAFAF9] font-medium">{nombre}</p>
                          {email && <p className="text-[#57534E] text-xs">{email}</p>}
                        </td>
                        <td className="px-4 py-3 text-[#FAFAF9] font-semibold">
                          ${(p.fields["Total USD"] || 0).toFixed(2)}
                          {saving === p.id && (
                            <span className="ml-2 w-3 h-3 border border-[#DC2626] border-t-transparent rounded-full animate-spin inline-block" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <SelectDropdown
                            value={p.fields["Estado Pago"] || "Pendiente"}
                            options={ESTADOS_PAGO}
                            onChange={(v) => update(p.id, "Estado Pago", v)}
                            styleMap={estadoPagoStyle}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <SelectDropdown
                            value={p.fields["Estado Envio"] || "Pendiente"}
                            options={ESTADOS_ENVIO}
                            onChange={(v) => update(p.id, "Estado Envio", v)}
                            styleMap={estadoEnvioStyle}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpanded(isExpanded ? null : p.id)}
                            className="text-[#57534E] hover:text-[#A8A29E] text-xs transition-colors"
                          >
                            {isExpanded ? "▲" : "▼"}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${p.id}-detail`} className="bg-[#1C1917]">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-[#57534E] mb-1">Método de pago</p>
                                <p className="text-[#A8A29E]">{p.fields["Metodo Pago"] || "—"}</p>
                              </div>
                              <div>
                                <p className="text-[#57534E] mb-1">Dirección de envío</p>
                                <p className="text-[#A8A29E]">{p.fields["Direccion Envio"] || "—"}</p>
                              </div>
                              {p.fields.Notas && (
                                <div className="col-span-2">
                                  <p className="text-[#57534E] mb-1">Notas</p>
                                  <p className="text-[#A8A29E]">{p.fields.Notas}</p>
                                </div>
                              )}
                              {p.fields["Items JSON"] && (() => {
                                try {
                                  const items = JSON.parse(p.fields["Items JSON"]);
                                  if (Array.isArray(items) && items.length > 0) {
                                    return (
                                      <div className="col-span-2">
                                        <p className="text-[#57534E] mb-2">Productos</p>
                                        <div className="space-y-1">
                                          {items.map((item: { nombre?: string; qty?: number; precio?: number }, i: number) => (
                                            <div key={i} className="flex justify-between text-[#A8A29E]">
                                              <span>{item.nombre} × {item.qty}</span>
                                              <span>${((item.precio || 0) * (item.qty || 1)).toFixed(2)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                } catch { return null; }
                                return null;
                              })()}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
