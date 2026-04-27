"use client";

import { useState, useCallback } from "react";

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

interface Resultado {
  ok: boolean;
  msg: string;
}

function parseItems(json: string): Item[] {
  try {
    return JSON.parse(json) as Item[];
  } catch {
    return [];
  }
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

// ─── Pantalla de acceso ──────────────────────────────────────────────────────
function PantallaAcceso({
  onLogin,
  error,
  loading,
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
        <p className="text-[#555] text-[10px] tracking-[0.3em] uppercase mb-8">
          Panel de Despacho
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(val);
          }}
        >
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

// ─── Tarjeta de pedido ────────────────────────────────────────────────────────
function TarjetaPedido({
  pedido,
  token,
  onDespachado,
}: {
  pedido: Pedido;
  token: string;
  onDespachado: (recordId: string) => void;
}) {
  const [tracking, setTracking] = useState("");
  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msgError, setMsgError] = useState("");
  const items = parseItems(pedido.itemsJson);
  const despachado = pedido.estadoEnvio === "Enviado";

  const handleDespachar = async () => {
    setEstado("loading");
    setMsgError("");
    try {
      const productosStr = items.map((i) => `${i.nombre} x${i.qty}`).join(" · ");
      const res = await fetch("/api/notificar-envio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
        setEstado("ok");
        onDespachado(pedido.recordId);
      } else {
        setEstado("error");
        setMsgError(data.error || "Error al despachar");
      }
    } catch {
      setEstado("error");
      setMsgError("Error de conexión. Intenta de nuevo.");
    }
  };

  return (
    <div
      className={`border mb-4 overflow-hidden transition-opacity ${
        despachado
          ? "border-[#1c1917] opacity-50"
          : "border-[#292524] bg-[#111]"
      }`}
    >
      {/* Encabezado */}
      <div className="bg-[#1c1917] px-5 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-rojo font-bold tracking-wide">{pedido.idPedido}</span>
          <span className="text-[#555] text-xs">{formatFecha(pedido.fecha)}</span>
        </div>
        <div className="flex gap-2">
          <span
            className={`text-[11px] px-3 py-0.5 rounded-sm ${
              pedido.estadoPago === "Pendiente"
                ? "bg-yellow-900 text-yellow-300"
                : "bg-green-900 text-green-300"
            }`}
          >
            Pago: {pedido.estadoPago}
          </span>
          <span className="text-[11px] px-3 py-0.5 rounded-sm bg-rojo text-white">
            {pedido.metodoPago}
          </span>
          {despachado && (
            <span className="text-[11px] px-3 py-0.5 rounded-sm bg-green-900 text-green-300">
              ✓ Enviado
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cliente */}
        <div>
          <p className="text-[#555] text-[10px] tracking-[0.2em] uppercase mb-2">Cliente</p>
          <p className="text-[#e5e0d8] font-bold text-base mb-1">{pedido.nombre || "—"}</p>
          <p className="text-[#aaa] text-sm">{pedido.email || "sin email"}</p>
          <p className="text-[#aaa] text-sm">{pedido.telefono || "sin teléfono"}</p>
          {pedido.direccionEnvio && (
            <p className="text-[#666] text-xs mt-2">{pedido.direccionEnvio}</p>
          )}
        </div>

        {/* Productos */}
        <div>
          <p className="text-[#555] text-[10px] tracking-[0.2em] uppercase mb-2">Productos</p>
          {items.length === 0 ? (
            <p className="text-[#555] text-sm">—</p>
          ) : (
            <>
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between py-1 border-b border-[#292524] last:border-0"
                >
                  <span className="text-[#e5e0d8] text-sm">
                    {item.nombre}{" "}
                    <span className="text-[#555]">×{item.qty}</span>
                  </span>
                  <span className="text-rojo font-bold text-sm">${item.subtotal}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <span className="text-[#555] text-xs uppercase tracking-widest">Total</span>
                <span className="text-rojo text-xl font-bold">${pedido.totalUSD}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Acción de despacho — solo si no fue enviado */}
      {!despachado && estado !== "ok" && (
        <div className="border-t border-[#292524] px-5 py-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Número de tracking (opcional)"
            className="flex-1 min-w-[220px] px-4 py-2.5 bg-[#0a0a0a] border border-[#292524] text-[#e5e0d8] text-sm outline-none placeholder-[#444] focus:border-[#444]"
          />
          <button
            onClick={handleDespachar}
            disabled={estado === "loading" || !pedido.email}
            className="px-6 py-2.5 bg-rojo text-white font-bold text-sm tracking-widest uppercase disabled:opacity-50 hover:bg-rojo-oscuro transition-colors whitespace-nowrap"
          >
            {estado === "loading" ? "Enviando…" : "🚀 Despachar"}
          </button>
          {!pedido.email && (
            <span className="text-yellow-400 text-xs">Sin email — no se puede despachar</span>
          )}
          {estado === "error" && (
            <span className="text-red-400 text-sm">❌ {msgError}</span>
          )}
        </div>
      )}

      {/* Confirmación */}
      {estado === "ok" && (
        <div className="border-t border-[#292524] px-5 py-3 bg-green-950">
          <p className="text-green-300 font-bold text-sm">
            ✅ Correo de despacho enviado a {pedido.email}
            {tracking && ` · Tracking: ${tracking}`}
          </p>
        </div>
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

  const handleDespachado = (recordId: string) => {
    setPedidos((prev) =>
      prev.map((p) =>
        p.recordId === recordId ? { ...p, estadoEnvio: "Enviado" } : p
      )
    );
  };

  if (!token) {
    return <PantallaAcceso onLogin={handleLogin} error={error} loading={loading} />;
  }

  const pendientes = pedidos.filter((p) => p.estadoEnvio !== "Enviado");
  const enviados = pedidos.filter((p) => p.estadoEnvio === "Enviado");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e0d8] font-sans">
      {/* Header */}
      <header className="bg-[#111] border-b border-[#292524] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-rojo font-bold text-lg tracking-[0.2em]">DOSIS</span>
          <span className="text-[#555] text-[10px] tracking-[0.25em] uppercase hidden sm:inline">
            Panel de Despacho
          </span>
        </div>
        <div className="flex items-center gap-4">
          {pendientes.length > 0 && (
            <span className="text-rojo font-bold text-sm">
              {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-[#aaa] text-sm border border-[#292524] px-4 py-1.5 hover:border-[#444] transition-colors disabled:opacity-50"
          >
            {refreshing ? "…" : "↺ Actualizar"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Sin pendientes */}
        {pendientes.length === 0 && (
          <div className="text-center py-16 text-[#555]">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-base">Todos los pedidos han sido despachados</p>
          </div>
        )}

        {/* Pendientes */}
        {pendientes.length > 0 && (
          <section>
            <p className="text-[#555] text-[10px] tracking-[0.3em] uppercase mb-4">
              Pendientes de despacho
            </p>
            {pendientes.map((p) => (
              <TarjetaPedido
                key={p.recordId}
                pedido={p}
                token={token}
                onDespachado={handleDespachado}
              />
            ))}
          </section>
        )}

        {/* Despachados */}
        {enviados.length > 0 && (
          <details className="mt-8">
            <summary className="text-[#444] text-[11px] tracking-[0.25em] uppercase cursor-pointer border-t border-[#1c1917] pt-4 mb-4">
              {enviados.length} pedido{enviados.length !== 1 ? "s" : ""} ya despachado
              {enviados.length !== 1 ? "s" : ""}
            </summary>
            {enviados.map((p) => (
              <TarjetaPedido
                key={p.recordId}
                pedido={p}
                token={token}
                onDespachado={handleDespachado}
              />
            ))}
          </details>
        )}
      </main>
    </div>
  );
}
