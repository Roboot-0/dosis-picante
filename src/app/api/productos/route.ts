/**
 * GET /api/productos
 * Devuelve el catálogo de productos con su estado de stock.
 * Lee desde la tabla "Productos" de Airtable.
 *
 * Campos relevantes en la tabla Productos:
 *   - SKU              (text)     — MI-01, AH-01, SO-01, KI-01
 *   - Nombre           (text)
 *   - Stock Disponible (checkbox) — true = disponible, false = agotado
 *
 * Cachea 5 minutos en Vercel Edge para no abusar de la API de Airtable.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API  = "https://api.airtable.com/v0";
const BASE_ID       = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_PRODUCTOS = "tblR8v5ZI47l5k0iN";

interface ProductoFields {
  SKU?: string;
  Nombre?: string;
  "Stock Disponible"?: boolean;
}

// Mapa id frontend → SKU
const ID_A_SKU: Record<string, string> = {
  microdosis: "MI-01",
  ahumadosis: "AH-01",
  sobredosis: "SO-01",
  kit:        "KI-01",
};

export async function GET() {
  const apiKey = process.env.AIRTABLE_API_KEY;

  // Sin API key: todos disponibles (no romper el frontend)
  if (!apiKey) {
    const stock = Object.fromEntries(Object.keys(ID_A_SKU).map(id => [id, true]));
    return NextResponse.json({ ok: true, stock }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  }

  try {
    const url = `${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCTOS}?fields[]=SKU&fields[]=Stock+Disponible&maxRecords=20`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 300 }, // Next.js data cache 5 min
    });

    if (!res.ok) {
      // Error en Airtable: devolvemos todos disponibles para no bloquear ventas
      const stock = Object.fromEntries(Object.keys(ID_A_SKU).map(id => [id, true]));
      return NextResponse.json({ ok: true, stock, fallback: true }, {
        headers: { "Cache-Control": "public, s-maxage=60" },
      });
    }

    const data = await res.json() as { records: Array<{ fields: ProductoFields }> };

    // Construir mapa SKU → disponible
    const skuStock: Record<string, boolean> = {};
    for (const record of data.records) {
      const sku = record.fields.SKU;
      const disponible = record.fields["Stock Disponible"] ?? true;
      if (sku) skuStock[sku] = disponible;
    }

    // Convertir a id frontend → disponible
    const stock = Object.fromEntries(
      Object.entries(ID_A_SKU).map(([id, sku]) => [id, skuStock[sku] ?? true])
    );

    return NextResponse.json({ ok: true, stock }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("Error en /api/productos:", err);
    const stock = Object.fromEntries(Object.keys(ID_A_SKU).map(id => [id, true]));
    return NextResponse.json({ ok: true, stock, fallback: true });
  }
}
