import { NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_CLIENTES = "tblWZb7RXfbsX3a0c";

function headers() {
  return { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` };
}

export async function GET() {
  const url = `${AIRTABLE_API}/${BASE_ID}/${TBL_CLIENTES}?sort[0][field]=Fecha primer pedido&sort[0][direction]=desc&pageSize=100`;
  const res = await fetch(url, { headers: headers() });
  const data = await res.json();
  return NextResponse.json(data);
}
