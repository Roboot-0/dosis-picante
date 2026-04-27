"use client";

import { useState, useCallback, useMemo } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Item {
  nombre: string;
  qty: number;
  subtotal: number;
}

interface Pedido {
  recordId: string;
  idPedido: string;
  fecha: string;
  nombre: string;
  email: string;
  telefono: string;
  itemsJson: string;
  totalUSD: number;
  metodoPago: string;
  estadoPago: string;
  estadoEnvio: string;
  direccionEnvio: string;
  notas: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseItems(json: string): Item[] {
  try { return JSON.parse(json) as Item[]; } catch { return []; }
}

function formatFecha(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
  );
}

function esMesActual(iso: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const hoy = new Date();
  return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
}

// ─── Pantalla de acceso ───────────────────────────────────────────────────────
function PantallaAcceso({
  onLogin, error, loading,
}: {
  onLogin: (token: string) => void;
  error: string;
  loading: boolean;
}) {
  const [val, setVal] = useState("");
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="bg-[#111] border border-[#292524] p-10 w-full max-w-sm text-center">
        <h1 className="text-rojo text-2xl font-bold tracking-[0.2em] mb-1">DOSIS</h1>
        <p className="text-[#555] text-[10px] tracking-[0.3em] uppercase mb-8">Panel Operaciones</p>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(val); }}>
          <input
            type="password"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Contraseña"
            className="w-full px-4 py-3 bg-[#1c1917] border border-[#292524] text-[#e5e0d8] text-sm outline-none mb-3 placeholder-[#444]"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading || !val}
            className="w-full py-3 bg-rojo text-white text-sm tracking-widest uppercase font-bold disabled:opacity-50 hover:bg-rojo-oscuro transition-colors"
          >
            {loading ? "Cargando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-[#111] border border-[#292524] p-4 flex-1 min-w-[130px]">
      <p className="text-[#555] text-[9px] tracking-[0.3em] uppercase mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-rojo" : "text-[#e5e0d8]"}`}>{value}</p>
      {sub && <p className="text-[#555] text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ─── Tarjeta de pedido ────────────────────────────────────────────────────────
function TarjetaPedido({
  pedido, token, onUpdate,
}: {
  pedido: Pedido;
  token: string;
  onUpdate: (recordId: string, changes: Partial<Pedido>) => void;
}) {
  const [tracking, setTracking] = useState("");
  const [estadoDespacho, setEstadoDespacho] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [estadoPagoLocal, setEstadoPagoLocal] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msgError, setMsgError] = useState("");
  const items = parseItems(pedido.itemsJson);

  const pagoConfirmado = pedido.estadoPago === "Recibido";
  const despachado = pedido.estadoEnvio === "Enviado";

  // Confirmar pago
  const handleConfirmarPago = async () => {
    setEstadoPagoLocal("loading");
    try {
      const res = await fetch("/api/admin/pedidos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recordId: pedido.recordId, fields: { "Estado Pago": "Recibido" } }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setEstadoPagoLocal("ok");
        onUpdate(pedido.recordId, { estadoPago: "Recibido" });
      } else {
        setEstadoPagoLocal("error");
        setMsgError(data.error || "Error");
      }
    } catch {
      setEstadoPagoLocal("error");
      setMsgError("Error de conexión");
    }
  };

  // Despachar
  const handleDespachar = async () => {
    setEstadoDespacho("loading");
    setMsgError("");
    try {
      const productosStr = items.map((i) => `${i.nombre} x${i.qty}`).join(" · ");
      const res = await fetch("/api/notificar-envio", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: pedido.email,
          nombre: pedido.nombre,
          idPedido: pedido.idPedido,
          productos: productosStr,
          tracking: tracking.trim(),
          recordId: pedido.recordId,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setEstadoDespacho("ok");
        onUpdate(pedido.recordId, { estadoEnvio: "Enviado" });
      } else {
        setEstadoDespacho("error");
        setMsgError(data.error || "Error al despachar");
      }
    } catch {
      setEstadoDespacho("error");
      setMsgError("Error de conexión");
    }
  };

  return (
    <div className={`border mb-3 overflow-hidden transition-opacity ${despachado ? "border-[#1c1917] opacity-50" : "border-[#292524] bg-[#111]"}`}>
      {/* Encabezado */}
      <div className="bg-[#1c1917] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-rojo font-bold tracking-wide text-sm">{pedido.idPedido}</span>
          <span className="text-[#555] text-xs">{formatFecha(pedido.fecha)}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {/* Badge pago */}
          <span className={`text-[10px] px-2.5 py-0.5 rounded-sm font-medium ${
            pagoConfirmado ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"
          }`}>
            {pagoConfirmado ? "✓ Pago recibido" : "Pago pendiente"}
          </span>
          {/* Método */}
          <span className="text-[10px] px-2.5 py-0.5 rounded-sm bg-[#292524] text-[#aaa]">
            {pedido.metodoPago}
          </span>
          {/* Estado envío */}
          {despachado && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-sm bg-green-900 text-green-300">
              ✓ Despachado
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cliente */}
        <div>
          <p className="text-[#555] text-[9px] tracking-[0.3em] uppercase mb-1.5">Cliente</p>
          <p className="text-[#e5e0d8] font-bold">{pedido.nombre || "—"}</p>
          <p className="text-[#aaa] text-sm">{pedido.email || "sin email"}</p>
          <p className="text-[#aaa] text-sm">{pedido.telefono || "—"}</p>
          {pedido.direccionEnvio && (
            <p className="text-[#666] text-xs mt-1.5 leading-relaxed">{pedido.direccionEnvio}</p>
          )}
        </div>

        {/* Productos */}
        <div>
          <p className="text-[#555] text-[9px] tracking-[0.3em] uppercase mb-1.5">Productos</p>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between py-1 border-b border-[#1c1917] last:border-0">
              <span className="text-[#e5e0d8] text-sm">{item.nombre} <span className="text-[#555]">×{item.qty}</span></span>
              <span className="text-rojo font-bold text-sm">${item.subtotal}</span>
            </div>
          ))}
          <div className="flex justify-between pt-1.5">
            <span className="text-[#555] text-xs uppercase tracking-widest">Total</span>
            <span className="text-rojo text-lg font-bold">${pedido.totalUSD}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="border-t border-[#292524] px-4 py-3 flex flex-wrap gap-2 items-center">
        {/* Confirmar pago */}
        {!pagoConfirmado && estadoPagoLocal !== "ok" && (
          <button
            onClick={handleConfirmarPago}
            disabled={estadoPagoLocal === "loading"}
            className="px-4 py-2 border border-yellow-600 text-yellow-400 text-xs tracking-widest uppercase font-bold hover:bg-yellow-900/30 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {estadoPagoLocal === "loading" ? "…" : "✓ Confirmar pago"}
          </button>
        )}
        {(pagoConfirmado || estadoPagoLocal === "ok") && (
          <span className="text-green-400 text-xs font-bold">✓ Pago confirmado</span>
        )}

        {/* Despachar */}
        {!despachado && estadoDespacho !== "ok" && (
          <>
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Tracking (opcional)"
              className="flex-1 min-w-[160px] px-3 py-2 bg-[#0a0a0a] border border-[#292524] text-[#e5e0d8] text-xs outline-none placeholder-[#444] focus:border-[#444]"
            />
            <button
              onClick={handleDespachar}
              disabled={estadoDespacho === "loading" || !pedido.email}
              className="px-4 py-2 bg-rojo text-white font-bold text-xs tracking-widest uppercase disabled:opacity-50 hover:bg-rojo-oscuro transition-colors whitespace-nowrap"
            >
              {estadoDespacho === "loading" ? "Enviando…" : "🚀 Despachar"}
            </button>
          </>
        )}
        {estadoDespacho === "ok" && (
          <span className="text-green-400 text-xs font-bold">✅ Correo enviado{tracking && ` · ${tracking}`}</span>
        )}
        {(estadoDespacho === "error" || estadoPagoLocal === "error") && (
          <span className="text-red-400 text-xs">❌ {msgError}</span>
        )}
        {!pedido.email && !despachado && (
          <span className="text-yellow-500 text-xs">Sin email — no se puede despachar</span>
        )}
      </div>
    </div>
  );
}

// ─── Sección KPIs + Productos ──────────────────────────────────────────────────
function ResumenSection({ pedidos }: { pedidos: Pedido[] }) {
  const [abierto, setAbierto] = useState(true);

  const kpis = useMemo(() => {
    const totalVentas = pedidos.reduce((s, p) => s + p.totalUSD, 0);
    const esteMes = pedidos.filter((p) => esMesActual(p.fecha));
    const ventasMes = esteMes.reduce((s, p) => s + p.totalUSD, 0);
    const pendientesDespacho = pedidos.filter((p) => p.estadoEnvio !== "Enviado").length;
    const pagosPendientes = pedidos.filter((p) => p.estadoPago !== "Recibido").length;
    const totalPedidos = pedidos.length;

    // Productos: agrupar por nombre
    const prodMap = new Map<string, { unidades: number; ingresos: number }>();
    for (const p of pedidos) {
      for (const item of parseItems(p.itemsJson)) {
        const prev = prodMap.get(item.nombre) || { unidades: 0, ingresos: 0 };
        prodMap.set(item.nombre, {
          unidades: prev.unidades + item.qty,
          ingresos: prev.ingresos + item.subtotal,
        });
      }
    }
    const productos = Array.from(prodMap.entries())
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((a, b) => b.ingresos - a.ingresos);

    const maxIngresos = productos[0]?.ingresos || 1;

    return { totalVentas, ventasMes, pendientesDespacho, pagosPendientes, totalPedidos, productos, maxIngresos, esteMes: esteMes.length };
  }, [pedidos]);

  return (
    <div className="mb-6">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full text-left flex items-center justify-between mb-3"
      >
        <span className="text-[#555] text-[9px] tracking-[0.3em] uppercase">Resumen y KPIs</span>
        <span className="text-[#555] text-xs">{abierto ? "▲ ocultar" : "▼ mostrar"}</span>
      </button>

      {abierto && (
        <>
          {/* KPI cards */}
          <div className="flex flex-wrap gap-3 mb-4">
            <KpiCard label="Total ventas" value={`$${kpis.totalVentas.toFixed(0)}`} sub={`${kpis.totalPedidos} pedidos`} accent />
            <KpiCard label="Este mes" value={`$${kpis.ventasMes.toFixed(0)}`} sub={`${kpis.esteMes} pedidos`} />
            <KpiCard label="Sin despachar" value={String(kpis.pendientesDespacho)} sub="pendientes de envío" accent={kpis.pendientesDespacho > 0} />
            <KpiCard label="Cobro pendiente" value={String(kpis.pagosPendientes)} sub="sin confirmar" accent={kpis.pagosPendientes > 0} />
          </div>

          {/* Breakdown por producto */}
          {kpis.productos.length > 0 && (
            <div className="bg-[#111] border border-[#292524] p-4">
              <p className="text-[#555] text-[9px] tracking-[0.3em] uppercase mb-3">Ventas por producto</p>
              <div className="space-y-3">
                {kpis.productos.map((prod) => (
                  <div key={prod.nombre}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[#e5e0d8] text-sm font-medium">{prod.nombre}</span>
                      <div className="flex gap-4 text-right">
                        <span className="text-[#555] text-xs">{prod.unidades} uds</span>
                        <span className="text-rojo font-bold text-sm w-14 text-right">${prod.ingresos}</span>
                      </div>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full bg-[#1c1917] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rojo rounded-full"
                        style={{ width: `${(prod.ingresos / kpis.maxIngresos) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DespacharPage() {
  const [token, setToken] = useState("");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [vista, setVista] = useState<"pendientes" | "todos">("pendientes");

  const cargarPedidos = useCallback(async (tk: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/pedidos?token=${encodeURIComponent(tk)}`);
      const data = (await res.json()) as { ok: boolean; pedidos?: Pedido[]; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Contraseña incorrecta");
        return false;
      }
      setPedidos(data.pedidos || []);
      setError("");
      return true;
    } catch {
      setError("Error de conexión");
      return false;
    }
  }, []);

  const handleLogin = async (tk: string) => {
    setLoading(true);
    const ok = await cargarPedidos(tk);
    if (ok) setToken(tk);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarPedidos(token);
    setRefreshing(false);
  };

  const handleUpdate = useCallback((recordId: string, changes: Partial<Pedido>) => {
    setPedidos((prev) =>
      prev.map((p) => (p.recordId === recordId ? { ...p, ...changes } : p))
    );
  }, []);

  if (!token) {
    return <PantallaAcceso onLogin={handleLogin} error={error} loading={loading} />;
  }

  const pendientes = pedidos.filter((p) => p.estadoEnvio !== "Enviado");
  const todos = pedidos;
  const listaMostrada = vista === "pendientes" ? pendientes : todos;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e0d8] font-sans">
      {/* Header */}
      <header className="bg-[#111] border-b border-[#292524] px-5 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-rojo font-bold text-lg tracking-[0.2em]">DOSIS</span>
          <span className="text-[#444] text-[9px] tracking-[0.25em] uppercase hidden sm:inline">Panel Operaciones</span>
        </div>
        <div className="flex items-center gap-3">
          {pendientes.length > 0 && (
            <span className="bg-rojo text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {pendientes.length}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-[#555] text-sm border border-[#292524] px-3 py-1.5 hover:border-[#444] transition-colors disabled:opacity-50"
          >
            {refreshing ? "…" : "↺"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Resumen */}
        <ResumenSection pedidos={pedidos} />

        {/* Tabs vista */}
        <div className="flex gap-0 mb-4 border border-[#292524] w-fit">
          <button
            onClick={() => setVista("pendientes")}
            className={`px-4 py-2 text-xs tracking-widest uppercase font-bold transition-colors ${
              vista === "pendientes" ? "bg-rojo text-white" : "bg-transparent text-[#555] hover:text-[#aaa]"
            }`}
          >
            Pendientes ({pendientes.length})
          </button>
          <button
            onClick={() => setVista("todos")}
            className={`px-4 py-2 text-xs tracking-widest uppercase font-bold transition-colors ${
              vista === "todos" ? "bg-rojo text-white" : "bg-transparent text-[#555] hover:text-[#aaa]"
            }`}
          >
            Todos ({todos.length})
          </button>
        </div>

        {/* Lista */}
        {listaMostrada.length === 0 ? (
          <div className="text-center py-16 text-[#555]">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm">
              {vista === "pendientes"
                ? "No hay pedidos pendientes"
                : "No hay pedidos aún"}
            </p>
          </div>
        ) : (
          listaMostrada.map((p) => (
            <TarjetaPedido
              key={p.recordId}
              pedido={p}
              token={token}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </main>
    </div>
  );
}
