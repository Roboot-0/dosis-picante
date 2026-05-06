import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_PRODUCCION = "tbl0gpoC06199wW7h";
const TBL_PRODUCTOS   = "tblR8v5ZI47l5k0iN";
const TBL_INGREDIENTES = "tblaIK8IDWsmxw44J";
const TBL_RECETAS      = "tbldWNyZTD2O5ieMc";

// Empaque: 1 unidad de cada uno por botella producida
const EMPAQUE_ITEMS = [
  "Frasco vidrio ámbar",
  "Gotero + tapa seguridad",
  "Etiqueta (acento metálico)",
  "Bolsa de vacío (mash)",
  "Caja / cartón individual",
];

function headers() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function airtableFetch(url: string, opts?: RequestInit) {
  return fetch(url, { ...opts, headers: headers() });
}

// Descuenta ingredientes y empaque del inventario al completar un batch
async function deductIngredients(sku: string, unidades: number) {
  // 1. Obtener receta del SKU
  const recetaRes = await airtableFetch(
    `${AIRTABLE_API}/${BASE_ID}/${TBL_RECETAS}?filterByFormula=${encodeURIComponent(`{SKU}="${sku}"`)}&pageSize=20`
  );
  const recetaData = await recetaRes.json();
  const recetaItems: Array<{ ingrediente: string; gramosPorBotella: number }> =
    (recetaData.records || []).map((r: { fields: Record<string, unknown> }) => ({
      ingrediente: r.fields["Ingrediente"] as string,
      gramosPorBotella: (r.fields["Gramos por Botella"] as number) || 0,
    }));

  // 2. Obtener todos los ingredientes del inventario
  const ingRes = await airtableFetch(
    `${AIRTABLE_API}/${BASE_ID}/${TBL_INGREDIENTES}?pageSize=100`
  );
  const ingData = await ingRes.json();
  const ingMap: Record<string, { id: string; stock: number; stockMin: number }> = {};
  for (const r of (ingData.records || []) as Array<{ id: string; fields: Record<string, unknown> }>) {
    ingMap[r.fields["Ingrediente"] as string] = {
      id: r.id,
      stock: (r.fields["Stock Actual"] as number) || 0,
      stockMin: (r.fields["Stock Minimo"] as number) || 0,
    };
  }

  // 3. Calcular deducción: receta (kg = g/1000 × unidades)
  const patches: Array<Promise<unknown>> = [];

  for (const item of recetaItems) {
    const entry = ingMap[item.ingrediente];
    if (!entry) continue;
    const consumidoKg = (item.gramosPorBotella / 1000) * unidades;
    const newStock = Math.max(0, entry.stock - consumidoKg);
    const alerta = newStock <= entry.stockMin ? "Reponer" : "OK";
    patches.push(
      airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_INGREDIENTES}/${entry.id}`, {
        method: "PATCH",
        body: JSON.stringify({ fields: { "Stock Actual": parseFloat(newStock.toFixed(4)), Alerta: alerta } }),
      })
    );
  }

  // 4. Empaque: 1 pieza por botella
  for (const nombre of EMPAQUE_ITEMS) {
    const entry = ingMap[nombre];
    if (!entry) continue;
    const newStock = Math.max(0, entry.stock - unidades);
    const alerta = newStock <= entry.stockMin ? "Reponer" : "OK";
    patches.push(
      airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_INGREDIENTES}/${entry.id}`, {
        method: "PATCH",
        body: JSON.stringify({ fields: { "Stock Actual": newStock, Alerta: alerta } }),
      })
    );
  }

  await Promise.all(patches);
}

export async function GET() {
  const url = `${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCCION}?sort[0][field]=Fecha&sort[0][direction]=desc&pageSize=50`;
  const res = await airtableFetch(url);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCCION}`, {
    method: "POST",
    body: JSON.stringify({ records: [{ fields: body }] }),
  });
  const data = await res.json();

  // Si el batch se registra como Completado, descontar inventario automáticamente
  if (body.Estado === "Completado" && body["Stock Actualizado"] && body.SKU && body["Unidades Producidas"]) {
    await deductIngredients(body.SKU, body["Unidades Producidas"]);

    // También actualizar stock de producto terminado
    const skuRes = await airtableFetch(
      `${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCTOS}?filterByFormula=${encodeURIComponent(`{SKU}="${body.SKU}"`)}`
    );
    const skuData = await skuRes.json();
    if (skuData.records?.length > 0) {
      const rec = skuData.records[0];
      const currentStock = (rec.fields["Stock"] as number) || 0;
      await airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCTOS}/${rec.id}`, {
        method: "PATCH",
        body: JSON.stringify({ fields: { Stock: currentStock + body["Unidades Producidas"] } }),
      });
    }
  }

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, fields, updateStock } = await req.json();

  const res = await airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCCION}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();

  if (updateStock && fields.SKU && fields["Unidades Producidas"]) {
    // Descontar ingredientes y empaque
    await deductIngredients(fields.SKU, fields["Unidades Producidas"]);

    // Actualizar stock de producto terminado
    const skuRes = await airtableFetch(
      `${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCTOS}?filterByFormula=${encodeURIComponent(`{SKU}="${fields.SKU}"`)}`
    );
    const skuData = await skuRes.json();
    if (skuData.records?.length > 0) {
      const rec = skuData.records[0];
      const currentStock = (rec.fields["Stock"] as number) || 0;
      await airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCTOS}/${rec.id}`, {
        method: "PATCH",
        body: JSON.stringify({ fields: { Stock: currentStock + fields["Unidades Producidas"] } }),
      });
    }
  }

  return NextResponse.json(data);
}
