import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_PRODUCTOS = "tblR8v5ZI47l5k0iN";

function headers() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function GET() {
  const url = `${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCTOS}?fields[]=SKU&fields[]=Nombre&fields[]=Stock&fields[]=Precio USD&fields[]=Activo&fields[]=Stock Disponible`;
  const res = await fetch(url, { headers: headers() });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, fields } = await req.json();
  const res = await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCTOS}/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
