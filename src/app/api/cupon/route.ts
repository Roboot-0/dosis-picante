/**
 * GET /api/cupon?codigo=XXXX
 * Valida un código de descuento contra la tabla "Cupones" de Airtable.
 *
 * Campos esperados en la tabla Airtable "Cupones":
 *   - Codigo           (text)   — el código en mayúsculas, ej: DOSIS10
 *   - Tipo             (select) — "porcentaje" | "fijo"
 *   - Valor            (number) — 10 para 10% o 2 para $2
 *   - Activo           (checkbox)
 *   - Usos Maximos     (number) — 0 = ilimitado
 *   - Usos Actuales    (number)
 *   - Fecha Expiracion (date)   — YYYY-MM-DD, vacío = sin expiración
 *   - Descripcion      (text)   — texto amigable para el usuario
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID      = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
// ID de la tabla Cupones — créala en Airtable y pega el ID aquí.
// Para obtenerlo: abre la tabla → URL → /tblXXXXXXXXXXXXXX
const TBL_CUPONES  = process.env.AIRTABLE_TBL_CUPONES || "tblCUPONES_ID";

interface CuponFields {
  Codigo?: string;
  Tipo?: "porcentaje" | "fijo";
  Valor?: number;
  Activo?: boolean;
  "Usos Maximos"?: number;
  "Usos Actuales"?: number;
  "Fecha Expiracion"?: string;
  Descripcion?: string;
}

export async function GET(req: NextRequest) {
  const codigo = new URL(req.url).searchParams.get("codigo")?.trim().toUpperCase();
  if (!codigo) {
    return NextResponse.json({ ok: false, error: "Código requerido" }, { status: 400 });
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }

  try {
    const formula = encodeURIComponent(`AND({Codigo} = "${codigo.replace(/"/g, '\\"')}", {Activo} = TRUE())`);
    const url = `${AIRTABLE_API}/${BASE_ID}/${TBL_CUPONES}?filterByFormula=${formula}&maxRecords=1`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Airtable cupones error:", text);
      return NextResponse.json({ ok: false, error: "Error consultando cupones" }, { status: 500 });
    }

    const data = await res.json() as { records: Array<{ id: string; fields: CuponFields }> };

    if (data.records.length === 0) {
      return NextResponse.json({ ok: false, error: "Código no válido o expirado" }, { status: 404 });
    }

    const record = data.records[0];
    const fields = record.fields;

    // Verificar expiración
    if (fields["Fecha Expiracion"]) {
      const exp = new Date(fields["Fecha Expiracion"]);
      exp.setHours(23, 59, 59);
      if (exp < new Date()) {
        return NextResponse.json({ ok: false, error: "Este código ya expiró" }, { status: 400 });
      }
    }

    // Verificar límite de usos
    const usosMax = fields["Usos Maximos"] ?? 0;
    const usosActuales = fields["Usos Actuales"] ?? 0;
    if (usosMax > 0 && usosActuales >= usosMax) {
      return NextResponse.json({ ok: false, error: "Este código ya alcanzó su límite de usos" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      cupon: {
        codigo,
        tipo: fields.Tipo ?? "porcentaje",
        valor: fields.Valor ?? 0,
        descripcion: fields.Descripcion ?? "",
      },
    });
  } catch (err) {
    console.error("Error en /api/cupon:", err);
    return NextResponse.json({ ok: false, error: "Error al validar el código" }, { status: 500 });
  }
}
