"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Clave incorrecta. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1917] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#DC2626] mb-4">
            <span className="text-2xl">🌶️</span>
          </div>
          <h1 className="font-bebas text-4xl text-[#FAFAF9] tracking-wider">
            DOSIS
          </h1>
          <p className="text-[#A8A29E] text-sm mt-1">Panel Administrativo</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#292524] rounded-2xl p-8 border border-[#44403C]"
        >
          <h2 className="text-[#FAFAF9] font-semibold text-lg mb-6">
            Iniciar sesión
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[#A8A29E] text-sm mb-2">
                Clave de acceso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                className="w-full bg-[#1C1917] border border-[#44403C] rounded-xl px-4 py-3
                           text-[#FAFAF9] placeholder-[#57534E] text-sm
                           focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]
                           transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-[#44403C]
                         disabled:text-[#78716C] text-white font-semibold py-3 rounded-xl
                         transition-colors text-sm cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </div>
        </form>

        <p className="text-center text-[#57534E] text-xs mt-6">
          Solo para uso interno de DOSIS Picante
        </p>
      </div>
    </div>
  );
}
