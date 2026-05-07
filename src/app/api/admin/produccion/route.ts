import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API    = "https://api.airtable.com/v0";
const BASE_ID         = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_PRODUCCION  = "tbl0gpoC06199wW7h";
const TBL_PRODUCTOS   = "tblR8v5ZI47l5k0iN";
const TBL_INGREDIENTES = "tblaIK8IDWsmxw44J";
const TBL_RECETAS     = "tbldWNyZTD2O5ieMc";

// Empaque: 1 unidad de cada uno por botella producida
const EMPAQUE_ITEMS = [
  "Frasco vidrio ámbar",
  "Gotero + tapa seguridad",
  "Etiqueta (acento metálico)",
  "Bolsa de vacío (mash)",
  "Caja / cartón individual",
];

// ── Mapeo UI ↔ Airtable ──────────────────────────────────────────────────────
// Airtable sólo acepta sus opciones existentes. Remapeamos en ambas direcciones.
// "En proceso"  → Fermentando   (batch en fermentación)
// "Completado"  → Embotellado   (batch listo y embotellado)
export function uiToDb(estado: string): string {
  if (estado === "Fermentando") return "En proceso";
  if (estado === "Embotellado") return "Completado";
  return estado;
}
export function dbToUi(estado: string): string {
  if (estado === "En proceso") return "Fermentando";
  if (estado === "Completado") return "Embotellado";
  return estado;
}

// ── Fecha Embotellado en Notas ───────────────────────────────────────────────
// Formato: "[emb:2026-05-15] texto libre"
// Si no hay fecha embotellada, Notas es sólo texto libre.
export function encodeNotas(fechaEmb: string | null, notas: string): string {
  if (!fechaEmb) return notas || "";
  return `[emb:${fechaEmb}]${notas ? " " + notas : ""}`;
}
export function decodeNotas(raw: string): { fechaEmb: string | null; notas: string } {
  const match = raw?.match(/^\[emb:(\d{4}-\d{2}-\d{2})\]\s*(.*)/s);
  if (match) return { fechaEmb: match[1], notas: match[2].trim() };
  return { fechaEmb: null, notas: raw || "" };
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function airtableFetch(url: string, opts?: RequestInit) {
  return fetch(url, { ...opts, headers: headers() });
}

// ── Descuenta ingredientes y empaque al embotellar ────────────────────────────
async function deductIngredients(sku: string, unidades: number) {
  const recetaRes = await airtableFetch(
    `${AIRTABLE_API}/${BASE_ID}/${TBL_RECETAS}?filterByFormula=${encodeURIComponent(`{SKU}="${sku}"`)}&pageSize=20`
  );
  const recetaData = await recetaRes.json();
  const recetaItems: Array<{ ingrediente: string; gramosPorBotella: number }> =
    (recetaData.records || []).map((r: { fields: Record<string, unknown> }) => ({
      ingrediente: r.fields["Ingrediente"] as string,
      gramosPorBotella: (r.fields["Gramos por Botella"] as number) || 0,
    }));

  const ingRes  = await airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_INGREDIENTES}?pageSize=100`);
  const ingData = await ingRes.json();
  const ingMap: Record<string, { id: string; stock: number; stockMin: number }> = {};
  for (const r of (ingData.records || []) as Array<{ id: string; fields: Record<string, unknown> }>) {
    ingMap[r.fields["Ingrediente"] as string] = {
      id: r.id,
      stock:    (r.fields["Stock Actual"] as number) || 0,
      stockMin: (r.fields["Stock Minimo"] as number) || 0,
    };
  }

  const patches: Array<Promise<unknown>> = [];

  for (const item of recetaItems) {
    const entry = ingMap[item.ingrediente];
    if (!entry) continue;
    const consumidoKg = (item.gramosPorBotella / 1000) * unidades;
    const newStock    = Math.max(0, entry.stock - consumidoKg);
    patches.push(
      airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_INGREDIENTES}/${entry.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          fields: {
            "Stock Actual": parseFloat(newStock.toFixed(4)),
            Alerta: newStock <= entry.stockMin ? "Reponer" : "OK",
          },
        }),
      })
    );
  }

  for (const nombre of EMPAQUE_ITEMS) {
    const entry = ingMap[nombre];
    if (!entry) continue;
    const newStock = Math.max(0, entry.stock - unidades);
    patches.push(
      airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_INGREDIENTES}/${entry.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          fields: {
            "Stock Actual": newStock,
            Alerta: newStock <= entry.stockMin ? "Reponer" : "OK",
          },
        }),
      })
    );
  }

  await Promise.all(patches);
}

async function addProductStock(sku: string, unidades: number) {
  const skuRes  = await airtableFetch(
    `${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCTOS}?filterByFormula=${encodeURIComponent(`{SKU}="${sku}"`)}`
  );
  const skuData = await skuRes.json();
  if (skuData.records?.length > 0) {
    const rec          = skuData.records[0];
    const currentStock = (rec.fields["Stock"] as number) || 0;
    await airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCTOS}/${rec.id}`, {
      method: "PATCH",
      body: JSON.stringify({ fields: { Stock: currentStock + unidades } }),
    });
  }
}

// ── Transforma un record de Airtable al formato que usa el frontend ───────────
function transformRecord(rec: { id: string; fields: Record<string, unknown> }) {
  const f = rec.fields;
  const rawNotas = (f["Notas"] as string) || "";
  const { fechaEmb, notas } = decodeNotas(rawNotas);
  return {
    id: rec.id,
    fields: {
      ...f,
      Estado:            dbToUi(f["Estado"] as string),
      "Fecha Embotellado": fechaEmb,
      Notas:             notas,
    },
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET() {
  const url = `${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCCION}?sort[0][field]=Fecha&sort[0][direction]=desc&pageSize=50`;
  const res  = await airtableFetch(url);
  const data = await res.json();

  const records = (data.records || []).map(transformRecord);
  return NextResponse.json({ records });
}

// ── POST — crear batch en fermentación ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();

  const dbFields = {
    ...body,
    Estado: uiToDb(body.Estado || "Fermentando"),
    Notas:  encodeNotas(body["Fecha Embotellado"] || null, body.Notas || ""),
  };
  delete dbFields["Fecha Embotellado"];

  const res  = await airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCCION}`, {
    method: "POST",
    body:   JSON.stringify({ records: [{ fields: dbFields }] }),
  });
  const data = await res.json();
  const records = (data.records || []).map(transformRecord);
  return NextResponse.json({ records });
}

// ── PATCH — actualizar batch (embotellar / cambiar estado) ────────────────────
export async function PATCH(req: NextRequest) {
  const { id, fields, embotellar } = await req.json();

  const dbFields = {
    ...fields,
    Estado: uiToDb(fields.Estado || ""),
    Notas:  encodeNotas(fields["Fecha Embotellado"] || null, fields.Notas || ""),
  };
  delete dbFields["Fecha Embotellado"];

  const res  = await airtableFetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCCION}/${id}`, {
    method: "PATCH",
    body:   JSON.stringify({ fields: dbFields }),
  });
  const data = await res.json();

  if (embotellar && fields.SKU && fields["Unidades Producidas"]) {
    await deductIngredients(fields.SKU, fields["Unidades Producidas"]);
    await addProductStock(fields.SKU, fields["Unidades Producidas"]);
  }

  return NextResponse.json(transformRecord(data));
}
