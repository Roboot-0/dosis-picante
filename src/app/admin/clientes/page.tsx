"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Users, Search } from "lucide-react";

interface Cliente {
  id: string;
  fields: Record<string, unknown>;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/clientes");
    const data = await res.json();
    setClientes(data.records || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const get = (c: Cliente, key: string): string => {
    const v = c.fields[key];
    if (Array.isArray(v)) return v[0] as string || "";
    return (v as string) || "";
  };

  const filtered = clientes.filter((c) => {
    if (!search) return true;
    const nombre = get(c, "Nombre");
    const email = get(c, "Email");
    const tel = get(c, "Teléfono");
    return (
      nombre.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      tel.includes(search)
    );
  });

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-VE", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const totalUSD = (c: Cliente): number => {
    const v = c.fields["Total Gastado USD"] ?? c.fields["Total USD"] ?? 0;
    return typeof v === "number" ? v : 0;
  };

  const pedidosCount = (c: Cliente): number => {
    const pedidos = c.fields["Pedidos"];
    if (Array.isArray(pedidos)) return pedidos.length;
    const v = c.fields["Número de Pedidos"] ?? c.fields["N Pedidos"] ?? 0;
    return typeof v === "number" ? v : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#FAFAF9] text-2xl font-bold">Clientes</h1>
          <p className="text-[#A8A29E] text-sm mt-1">{clientes.length} clientes registrados</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-[#292524] border border-[#44403C] text-[#A8A29E] rounded-xl text-sm hover:bg-[#3C3835] transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Buscar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57534E]" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#292524] border border-[#44403C] text-[#FAFAF9] placeholder-[#57534E] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-[#57534E] py-16">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>No se encontraron clientes</p>
        </div>
      ) : (
        <div className="bg-[#292524] rounded-2xl border border-[#44403C] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#44403C] text-[#57534E] text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-left px-4 py-3">Contacto</th>
                  <th className="text-left px-4 py-3">Pedidos</th>
                  <th className="text-left px-4 py-3">Total gastado</th>
                  <th className="text-left px-4 py-3">Primer pedido</th>
                  <th className="text-left px-4 py-3">Ciudad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#44403C]">
                {filtered.map((c) => {
                  const nombre = get(c, "Nombre");
                  const email = get(c, "Email");
                  const tel = get(c, "Teléfono") || get(c, "Telefono");
                  const ciudad = get(c, "Ciudad");
                  const fechaPrimer = get(c, "Fecha primer pedido") || get(c, "Fecha Primer Pedido");
                  const np = pedidosCount(c);
                  const total = totalUSD(c);

                  return (
                    <tr key={c.id} className="hover:bg-[#3C3835]/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#DC2626]/20 rounded-full flex items-center justify-center text-[#DC2626] font-bold text-sm shrink-0">
                            {nombre ? nombre[0].toUpperCase() : "?"}
                          </div>
                          <p className="text-[#FAFAF9] font-medium">{nombre || "—"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {email && <p className="text-[#A8A29E] text-xs">{email}</p>}
                        {tel && <p className="text-[#57534E] text-xs">{tel}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-[#3C3835] text-[#A8A29E] text-xs font-bold rounded-full">
                          {np}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#FAFAF9] font-semibold">
                        {total > 0 ? `$${total.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-[#A8A29E] whitespace-nowrap">
                        {formatDate(fechaPrimer)}
                      </td>
                      <td className="px-4 py-3 text-[#A8A29E]">
                        {ciudad || "—"}
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
