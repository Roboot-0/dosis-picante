/**
 * POST /api/checkout/completar
 * Marca el checkout como completado para que el cron job NO envíe el email de recuperación.
 * Se llama al final del submitPedido exitoso.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API    = "https://api.airtable.com/v0";
const BASE_ID         = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_ABANDONADOS = process.env.AIRTABLE_TBL_ABANDONADOS || "tblABANDONADOS_ID";

export async function POST(req: NextRequest) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: true });

  try {
    const body = await req.json() as { email: string };
    const email = body.email?.trim().toLowerCase();
    if (!email) return NextResponse.json({ ok: true });

    // Buscar registros activos (no completados) de este email
    const formula = encodeURIComponent(
      `AND(LOWER({Email}) = "${email}", {Completado} = FALSE())`
    );
    const res = await fetch(
      `${AIRTABLE_API}/${BASE_ID}/${TBL_ABANDONADOS}?filterByFormula=${formula}&maxRecords=5`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!res.ok) return NextResponse.json({ ok: true });
    const data = await res.json() as { records: Array<{ id: string }> };

    // Marcar todos como completados (por si hay duplicados)
    await Promise.all(data.records.map(record =>
      fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_ABANDONADOS}/${record.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { Completado: true } }),
      })
    ));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/checkout/completar:", err);
    return NextResponse.json({ ok: true });
  }
}
