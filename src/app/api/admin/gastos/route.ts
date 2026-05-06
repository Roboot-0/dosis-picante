import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_GASTOS = "tblPp6cjiBWc7ZPA3";

function headers() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes");
  const categoria = searchParams.get("categoria");

  let url = `${AIRTABLE_API}/${BASE_ID}/${TBL_GASTOS}?sort[0][field]=Fecha&sort[0][direction]=desc&pageSize=100`;
  const filters: string[] = [];
  if (mes) filters.push(`{Mes} = "${mes}"`);
  if (categoria) filters.push(`{Categoría} = "${categoria}"`);
  if (filters.length > 0) {
    const formula = filters.length === 1 ? filters[0] : `AND(${filters.join(",")})`;
    url += `&filterByFormula=${encodeURIComponent(formula)}`;
  }

  const res = await fetch(url, { headers: headers() });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_GASTOS}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      records: [{ fields: body }],
    }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, fields } = await req.json();
  const res = await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_GASTOS}/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const res = await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_GASTOS}/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
