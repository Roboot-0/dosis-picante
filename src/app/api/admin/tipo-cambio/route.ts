import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Caché en memoria — las tasas BCV cambian una vez al día
let cache: { usd: number; eur: number; fecha: string; ts: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

export async function GET() {
  // Servir desde caché si es reciente
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json({
      usd_bs: cache.usd,
      eur_bs: cache.eur,
      fecha: cache.fecha,
      fuente: "BCV (caché)",
    });
  }

  try {
    // Fetch USD/Bs y EUR/Bs del BCV en paralelo via dolarapi.com
    const [resUsd, resEur] = await Promise.all([
      fetch("https://ve.dolarapi.com/v1/dolares/oficial", { next: { revalidate: 3600 } }),
      fetch("https://ve.dolarapi.com/v1/euros", { next: { revalidate: 3600 } }),
    ]);

    if (!resUsd.ok) throw new Error(`USD HTTP ${resUsd.status}`);
    if (!resEur.ok) throw new Error(`EUR HTTP ${resEur.status}`);

    // USD: respuesta es un objeto  { promedio: number, fechaActualizacion: string, ... }
    const dataUsd = await resUsd.json() as { promedio: number; fechaActualizacion: string };

    // EUR: respuesta es un ARRAY   [{ fuente: "oficial", promedio: number }, { fuente: "paralelo", ... }]
    const dataEurArr = await resEur.json() as Array<{ fuente: string; promedio: number; fechaActualizacion: string }>;
    const dataEur = Array.isArray(dataEurArr)
      ? dataEurArr.find(r => r.fuente === "oficial") ?? dataEurArr[0]
      : dataEurArr as unknown as { promedio: number; fechaActualizacion: string };

    const tasaUsd = Number(dataUsd.promedio);
    const tasaEur = Number(dataEur?.promedio);
    const fecha = dataUsd.fechaActualizacion ?? new Date().toISOString();

    if (!isFinite(tasaUsd) || tasaUsd <= 0 || !isFinite(tasaEur) || tasaEur <= 0) {
      throw new Error(`Tasas inválidas de dolarapi: USD=${tasaUsd} EUR=${tasaEur}`);
    }

    cache = { usd: tasaUsd, eur: tasaEur, fecha, ts: Date.now() };

    return NextResponse.json({
      usd_bs: tasaUsd,
      eur_bs: tasaEur,
      fecha,
      fuente: "BCV",
    });
  } catch (err) {
    console.error("Error fetching BCV rates:", err);
    return NextResponse.json(
      { error: "No se pudo obtener las tasas BCV." },
      { status: 503 }
    );
  }
}
