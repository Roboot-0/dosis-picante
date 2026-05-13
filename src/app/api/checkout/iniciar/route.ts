/**
 * POST /api/checkout/iniciar
 * Se llama cuando el usuario completa el Step 2 (ya tenemos su email y carrito).
 * Guarda en Airtable tabla "Checkout Abandonado" para poder mandar un email de recuperación
 * si el pedido no se completa en ~1 hora.
 *
 * Campos en la tabla "Checkout Abandonado":
 *   - Email          (email)
 *   - Nombre         (text)
 *   - Items JSON     (long text)
 *   - Total USD      (number)
 *   - Fecha Inicio   (date/time)
 *   - Completado     (checkbox) — false por defecto
 *   - Email Enviado  (checkbox) — false por defecto
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API      = "https://api.airtable.com/v0";
const BASE_ID           = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_ABANDONADOS   = process.env.AIRTABLE_TBL_ABANDONADOS || "tblABANDONADOS_ID";

export async function POST(req: NextRequest) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: true }); // silencioso — no romper el checkout

  try {
    const body = await req.json() as {
      email: string; nombre: string;
      items: Array<{ id: string; nombre: string; qty: number; precio: number }>;
      total: number;
    };

    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: true }); // email inválido — silencioso
    }

    // Verificar si ya existe un registro activo con este email (evitar duplicados)
    const formula = encodeURIComponent(
      `AND(LOWER({Email}) = "${email}", {Completado} = FALSE(), {Email Enviado} = FALSE())`
    );
    const buscarRes = await fetch(
      `${AIRTABLE_API}/${BASE_ID}/${TBL_ABANDONADOS}?filterByFormula=${formula}&maxRecords=1`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (buscarRes.ok) {
      const buscarData = await buscarRes.json() as { records: Array<{ id: string }> };
      if (buscarData.records.length > 0) {
        // Ya existe — actualizar timestamp y carrito
        const recordId = buscarData.records[0].id;
        await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_ABANDONADOS}/${recordId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              "Items JSON": JSON.stringify(body.items),
              "Total USD": body.total,
              "Fecha Inicio": new Date().toISOString(),
            },
          }),
        });
        return NextResponse.json({ ok: true });
      }
    }

    // Crear nuevo registro
    await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_ABANDONADOS}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          Email: email,
          Nombre: body.nombre || "",
          "Items JSON": JSON.stringify(body.items),
          "Total USD": body.total,
          "Fecha Inicio": new Date().toISOString(),
          Completado: false,
          "Email Enviado": false,
        },
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Nunca romper el checkout por un error aquí
    console.error("Error en /api/checkout/iniciar:", err);
    return NextResponse.json({ ok: true });
  }
}
