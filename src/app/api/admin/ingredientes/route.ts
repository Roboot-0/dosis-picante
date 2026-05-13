import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_ING = "tblaIK8IDWsmxw44J";
const TBL_REC = "tbldWNyZTD2O5ieMc";

function headers() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");

  let url = `${AIRTABLE_API}/${BASE_ID}/${TBL_ING}?sort[0][field]=Tipo&sort[0][direction]=asc&sort[1][field]=Ingrediente&sort[1][direction]=asc&pageSize=100`;
  if (tipo) url += `&filterByFormula=${encodeURIComponent(`{Tipo}="${tipo}"`)}`;

  const [resIng, resRec] = await Promise.all([
    fetch(url, { headers: headers() }),
    fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_REC}?sort[0][field]=SKU&sort[0][direction]=asc&pageSize=100`, { headers: headers() }),
  ]);

  const [dataIng, dataRec] = await Promise.all([resIng.json(), resRec.json()]);
  return NextResponse.json({ ingredientes: dataIng.records || [], recetas: dataRec.records || [] });
}

export async function PATCH(req: NextRequest) {
  const { id, fields } = await req.json();
  const res = await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_ING}/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
