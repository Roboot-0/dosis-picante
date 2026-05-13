import { NextResponse } from "next/server";

export const revalidate = 3600; // revalidar cada hora

export async function GET() {
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      next: { revalidate: 3600 },
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    return NextResponse.json({
      tasa: parseFloat(data.promedio),
      fecha: data.fechaActualizacion,
      fuente: "BCV",
    });
  } catch (err) {
    console.error("Error fetching BCV rate:", err);
    return NextResponse.json(
      { tasa: null, error: "No se pudo obtener la tasa BCV en este momento." },
      { status: 500 }
    );
  }
}
