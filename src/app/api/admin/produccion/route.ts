import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_PRODUCCION = "tbl0gpoC06199wW7h";
const TBL_PRODUCTOS = "tblR8v5ZI47l5k0iN";

function headers() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function GET() {
  const url = `${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCCION}?sort[0][field]=Fecha&sort[0][direction]=desc&pageSize=50`;
  const res = await fetch(url, { headers: headers() });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCCION}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ records: [{ fields: body }] }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, fields, updateStock } = await req.json();

  // Actualiza el batch
  const res = await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCCION}/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();

  // Si se pide actualizar el stock de Productos
  if (updateStock && fields.SKU && fields["Unidades Producidas"]) {
    const skuRes = await fetch(
      `${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCTOS}?filterByFormula=${encodeURIComponent(`{SKU} = "${fields.SKU}"`)}`,
      { headers: headers() }
    );
    const skuData = await skuRes.json();
    if (skuData.records?.length > 0) {
      const record = skuData.records[0];
      const currentStock = (record.fields["Stock"] as number) || 0;
      await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCTOS}/${record.id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({
          fields: { Stock: currentStock + fields["Unidades Producidas"] },
        }),
      });
    }
  }

  return NextResponse.json(data);
}
