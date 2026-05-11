"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Users,
  Eye,
  Activity,
  TrendingUp,
  Clock,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MetricsPeriod {
  users: number;
  sessions: number;
  pageviews: number;
  bounceRate?: number;
  avgSessionDuration?: number;
  newUsers?: number;
}

interface TopPage {
  path: string;
  title: string;
  views: number;
  users: number;
}

interface TrafficSource {
  channel: string;
  sessions: number;
  users: number;
}

interface TrendPoint {
  date: string;
  users: number;
  sessions: number;
}

interface MetricsData {
  today: MetricsPeriod;
  week: MetricsPeriod;
  month: MetricsPeriod;
  topPages: TopPage[];
  sources: TrafficSource[];
  trend: TrendPoint[];
  generatedAt: string;
  error?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(yyyymmdd: string): string {
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${d}/${m}`;
}

function channelColor(channel: string): string {
  const map: Record<string, string> = {
    "Organic Search": "bg-green-500",
    "Direct": "bg-blue-500",
    "Referral": "bg-purple-500",
    "Social": "bg-pink-500",
    "Email": "bg-yellow-500",
    "Paid Search": "bg-orange-500",
    "Display": "bg-cyan-500",
    "Organic Social": "bg-rose-500",
    "Unassigned": "bg-[#57534E]",
  };
  return map[channel] || "bg-[#A8A29E]";
}

function channelLabel(channel: string): string {
  const map: Record<string, string> = {
    "Organic Search": "Búsqueda orgánica",
    "Direct": "Directo",
    "Referral": "Referidos",
    "Social": "Redes sociales",
    "Email": "Email",
    "Paid Search": "Búsqueda pagada",
    "Display": "Display",
    "Organic Social": "Social orgánico",
    "Unassigned": "Sin clasificar",
  };
  return map[channel] || channel;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-[#292524] border border-[#44403C] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#57534E] text-xs uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="text-[#FAFAF9] text-2xl font-bold">{value}</p>
      <p className="text-[#57534E] text-xs mt-1">{sub}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[#FAFAF9] text-sm font-semibold uppercase tracking-wider mb-4">
      {children}
    </h2>
  );
}

// Simple sparkline rendered with SVG
function Sparkline({ data, color = "#DC2626" }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 100;
  const h = 36;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MetricasPage() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metricas");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const current = data ? data[period] : null;

  // Trend sparkline data
  const usersTrend = data?.trend.map((p) => p.users) || [];
  const sessionsTrend = data?.trend.map((p) => p.sessions) || [];

  // Source totals for bar widths
  const maxSessions = Math.max(...(data?.sources.map((s) => s.sessions) || [1]), 1);

  // Top pages total views for bar widths
  const maxViews = Math.max(...(data?.topPages.map((p) => p.views) || [1]), 1);

  const PERIODS = [
    { key: "today" as const, label: "Hoy" },
    { key: "week" as const, label: "7 días" },
    { key: "month" as const, label: "30 días" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#FAFAF9] text-2xl font-bold tracking-tight">Métricas del sitio</h1>
          <p className="text-[#57534E] text-sm mt-0.5">
            {data?.generatedAt
              ? `Actualizado ${new Date(data.generatedAt).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}`
              : "Google Analytics 4 · dosispicante.com"}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#292524] border border-[#44403C]
                     text-[#A8A29E] hover:text-[#FAFAF9] text-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${period === key
                ? "bg-[#DC2626] text-white"
                : "bg-[#292524] border border-[#44403C] text-[#A8A29E] hover:text-[#FAFAF9]"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw size={24} className="animate-spin text-[#57534E]" />
        </div>
      ) : data?.error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6 text-red-400 text-sm">
          Error: {data.error}
        </div>
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard
              label="Usuarios"
              value={current?.users.toLocaleString() || "—"}
              sub={period === "today" ? "hoy" : period === "week" ? "últimos 7 días" : "últimos 30 días"}
              icon={<Users size={16} className="text-white" />}
              accent="bg-[#DC2626]"
            />
            <KpiCard
              label="Sesiones"
              value={current?.sessions.toLocaleString() || "—"}
              sub={`${data?.month.newUsers?.toLocaleString() || 0} nuevos este mes`}
              icon={<Activity size={16} className="text-white" />}
              accent="bg-blue-600"
            />
            <KpiCard
              label="Vistas de página"
              value={current?.pageviews.toLocaleString() || "—"}
              sub={period === "today" ? "hoy" : "período seleccionado"}
              icon={<Eye size={16} className="text-white" />}
              accent="bg-purple-600"
            />
            <KpiCard
              label={period === "today" ? "Prom. sesión (7d)" : "Duración promedio"}
              value={
                current?.avgSessionDuration !== undefined
                  ? formatDuration(current.avgSessionDuration)
                  : data?.week.avgSessionDuration !== undefined
                  ? formatDuration(data.week.avgSessionDuration)
                  : "—"
              }
              sub={`${current?.bounceRate ?? data?.week.bounceRate ?? 0}% tasa de rebote`}
              icon={<Clock size={16} className="text-white" />}
              accent="bg-emerald-600"
            />
          </div>

          {/* Trend + Sources row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Trend chart (2 cols) */}
            <div className="lg:col-span-2 bg-[#292524] border border-[#44403C] rounded-2xl p-5">
              <SectionTitle>Tendencia 30 días</SectionTitle>
              {data?.trend && data.trend.length > 0 ? (
                <>
                  <div className="mb-2">
                    <Sparkline data={usersTrend} color="#DC2626" />
                  </div>
                  <div className="mb-4">
                    <Sparkline data={sessionsTrend} color="#3B82F6" />
                  </div>
                  <div className="flex items-center gap-6 text-xs text-[#57534E]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-1 rounded-full bg-[#DC2626] inline-block" />
                      Usuarios
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-1 rounded-full bg-blue-500 inline-block" />
                      Sesiones
                    </span>
                    <span className="ml-auto">
                      {data.trend[0] && formatDate(data.trend[0].date)} →{" "}
                      {data.trend[data.trend.length - 1] && formatDate(data.trend[data.trend.length - 1].date)}
                    </span>
                  </div>
                  {/* X-axis labels */}
                  <div className="flex justify-between mt-2 text-[10px] text-[#44403C]">
                    {data.trend
                      .filter((_, i) => i % Math.ceil(data.trend.length / 6) === 0)
                      .map((p) => (
                        <span key={p.date}>{formatDate(p.date)}</span>
                      ))}
                  </div>
                </>
              ) : (
                <p className="text-[#57534E] text-sm">Sin datos de tendencia disponibles.</p>
              )}
            </div>

            {/* Traffic sources (1 col) */}
            <div className="bg-[#292524] border border-[#44403C] rounded-2xl p-5">
              <SectionTitle>Fuentes de tráfico</SectionTitle>
              {data?.sources && data.sources.length > 0 ? (
                <div className="space-y-3">
                  {data.sources.slice(0, 6).map((src) => (
                    <div key={src.channel}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${channelColor(src.channel)}`} />
                          <span className="text-[#A8A29E] text-xs">{channelLabel(src.channel)}</span>
                        </div>
                        <span className="text-[#FAFAF9] text-xs font-semibold">
                          {src.sessions}
                        </span>
                      </div>
                      <div className="w-full bg-[#1C1917] rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${channelColor(src.channel)}`}
                          style={{ width: `${(src.sessions / maxSessions) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#57534E] text-sm">Sin datos de fuentes disponibles.</p>
              )}
            </div>
          </div>

          {/* Top pages */}
          <div className="bg-[#292524] border border-[#44403C] rounded-2xl p-5">
            <SectionTitle>Páginas más visitadas — últimos 7 días</SectionTitle>
            {data?.topPages && data.topPages.length > 0 ? (
              <div className="space-y-2">
                {data.topPages.map((pg, i) => (
                  <div key={pg.path} className="flex items-center gap-4 py-2 border-b border-[#1C1917] last:border-0">
                    <span className="text-[#57534E] text-xs w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#FAFAF9] text-sm truncate">{pg.path}</p>
                      <p className="text-[#57534E] text-xs truncate">{pg.title}</p>
                    </div>
                    <div className="flex-1 max-w-xs hidden md:block">
                      <div className="w-full bg-[#1C1917] rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-[#DC2626]"
                          style={{ width: `${(pg.views / maxViews) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[#A8A29E] text-xs">{pg.users} usuarios</span>
                      <span className="text-[#FAFAF9] text-sm font-semibold w-12 text-right">
                        {pg.views}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#57534E] text-sm">Sin datos de páginas disponibles.</p>
            )}
          </div>

          {/* Footer note */}
          <p className="text-[#44403C] text-xs mt-4 text-center">
            Datos via Google Analytics 4 · Property ID {GA4_PROPERTY_ID_DISPLAY} · Sólo lectura
          </p>
        </>
      )}
    </div>
  );
}

const GA4_PROPERTY_ID_DISPLAY = "532553446";
