import { NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_PEDIDOS    = "tbl3YXihFUiElzG05";
const TBL_GASTOS     = "tblPp6cjiBWc7ZPA3";
const TBL_PRODUCCION = "tbl0gpoC06199wW7h";

function headers() {
  return { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` };
}

async function fetchAll(url: string): Promise<unknown[]> {
  const records: unknown[] = [];
  let offset: string | undefined;
  do {
    const u = offset ? `${url}&offset=${offset}` : url;
    const res = await fetch(u, { headers: headers() });
    const data = await res.json() as { records: unknown[]; offset?: string };
    records.push(...(data.records || []));
    offset = data.offset;
  } while (offset);
  return records;
}

export async function GET() {
  const [pedidos, gastos, produccion] = await Promise.all([
    fetchAll(`${AIRTABLE_API}/${BASE_ID}/${TBL_PEDIDOS}?fields[]=Total USD&fields[]=Fecha&fields[]=Estado Pago&pageSize=100`),
    fetchAll(`${AIRTABLE_API}/${BASE_ID}/${TBL_GASTOS}?fields[]=Monto USD&fields[]=Fecha&fields[]=Categoría&fields[]=Estado&fields[]=Concepto&fields[]=Moneda PNL&pageSize=100`),
    fetchAll(`${AIRTABLE_API}/${BASE_ID}/${TBL_PRODUCCION}?fields[]=Costo Total USD&fields[]=Fecha&fields[]=SKU&fields[]=Unidades Producidas&fields[]=Estado&pageSize=100`),
  ]);

  return NextResponse.json({ pedidos, gastos, produccion });
}
