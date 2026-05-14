/**
 * POST /api/suscribir
 * Guarda un email en la tabla "Email Suscriptores" de Airtable.
 * También añade el contacto a la audiencia de Resend para envíos masivos.
 *
 * Campos en la tabla "Email Suscriptores":
 *   - Email          (email)
 *   - Nombre         (text)    — opcional
 *   - Fuente         (select)  — "home" | "out_of_stock" | "footer" | "otro"
 *   - Fecha          (date)
 *   - Activo         (checkbox) — true por defecto
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const AIRTABLE_API      = "https://api.airtable.com/v0";
const BASE_ID           = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_EMAIL_SUBS    = process.env.AIRTABLE_TBL_EMAIL_SUBS || "tblEMAILSUBS_ID";
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; nombre?: string; fuente?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Email inválido" }, { status: 400 });
    }

    const apiKey = process.env.AIRTABLE_API_KEY;

    // 1) Airtable — guardar suscriptor
    if (apiKey) {
      // Verificar si ya existe
      const formula = encodeURIComponent(`LOWER({Email}) = "${email.replace(/"/g, '\\"')}"`);
      const buscarRes = await fetch(
        `${AIRTABLE_API}/${BASE_ID}/${TBL_EMAIL_SUBS}?filterByFormula=${formula}&maxRecords=1`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      const yaExiste = buscarRes.ok
        ? ((await buscarRes.json()) as { records: unknown[] }).records.length > 0
        : false;

      if (!yaExiste) {
        await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_EMAIL_SUBS}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              Email: email,
              Nombre: body.nombre || "",
              Fuente: body.fuente || "home",
              Fecha: new Date().toISOString().slice(0, 10),
              Activo: true,
            },
          }),
        });
      }
    }

    // 2) Resend Audiences — añadir contacto para envíos masivos
    if (process.env.RESEND_API_KEY && RESEND_AUDIENCE_ID) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.contacts.create({
        email,
        firstName: body.nombre?.split(" ")[0] || "",
        lastName: body.nombre?.split(" ").slice(1).join(" ") || "",
        audienceId: RESEND_AUDIENCE_ID,
        unsubscribed: false,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/suscribir:", err);
    return NextResponse.json({ ok: false, error: "Error al suscribir" }, { status: 500 });
  }
}
