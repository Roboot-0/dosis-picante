import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_PEDIDOS = "tbl3YXihFUiElzG05";

function headers() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function GET() {
  const url =
    `${AIRTABLE_API}/${BASE_ID}/${TBL_PEDIDOS}` +
    `?sort[0][field]=Fecha&sort[0][direction]=desc&maxRecords=200`;
  const res = await fetch(url, { headers: headers() });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { recordId, fields } = await req.json();
  const res = await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PEDIDOS}/${recordId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
