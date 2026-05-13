/**
 * GET /api/checkout/recuperar
 * Cron Job de Vercel — se ejecuta cada 30 minutos.
 * Busca checkouts abandonados con más de 1 hora y envía email de recuperación.
 *
 * Configurar en vercel.json:
 * {
 *   "crons": [{ "path": "/api/checkout/recuperar", "schedule": "0,30 * * * *" }]
 * }
 *
 * El endpoint está protegido por CRON_SECRET para evitar llamadas externas.
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime   = "nodejs";
export const maxDuration = 30;

const AIRTABLE_API    = "https://api.airtable.com/v0";
const BASE_ID         = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_ABANDONADOS = process.env.AIRTABLE_TBL_ABANDONADOS || "tblABANDONADOS_ID";
const REMITENTE       = "DOSIS Picante <pedidos@dosispicante.com>";
const WA_LINK         = "https://wa.me/584142624078?text=Hola!%20Quiero%20completar%20mi%20pedido%20DOSIS%20%F0%9F%8C%B6";

interface AbandonadoFields {
  Email?: string;
  Nombre?: string;
  "Items JSON"?: string;
  "Total USD"?: number;
  "Fecha Inicio"?: string;
  Completado?: boolean;
  "Email Enviado"?: boolean;
}

interface ItemCarrito {
  nombre: string;
  qty: number;
  precio: number;
}

export async function GET(req: NextRequest) {
  // Verificar autorización (Vercel pone el secret automáticamente, o lo ponemos manual para testing)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!apiKey || !resendKey) {
    return NextResponse.json({ ok: false, error: "Configuración incompleta" }, { status: 500 });
  }

  try {
    // Buscar checkouts iniciados hace más de 1 hora, no completados, sin email enviado
    const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const formula = encodeURIComponent(
      `AND({Completado} = FALSE(), {Email Enviado} = FALSE(), IS_BEFORE({Fecha Inicio}, "${unaHoraAtras}"))`
    );
    const url = `${AIRTABLE_API}/${BASE_ID}/${TBL_ABANDONADOS}?filterByFormula=${formula}&maxRecords=20`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ ok: false, error: `Airtable: ${text}` }, { status: 500 });
    }

    const data = await res.json() as { records: Array<{ id: string; fields: AbandonadoFields }> };
    const abandonados = data.records;

    if (abandonados.length === 0) {
      return NextResponse.json({ ok: true, message: "Sin checkouts abandonados", enviados: 0 });
    }

    const resend = new Resend(resendKey);
    let enviados = 0;

    for (const record of abandonados) {
      const { Email: email, Nombre: nombre, "Items JSON": itemsJson, "Total USD": total } = record.fields;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;

      // Parsear items del carrito
      let items: ItemCarrito[] = [];
      try { items = JSON.parse(itemsJson || "[]") as ItemCarrito[]; } catch { items = []; }

      const itemsHtml = items.map(i =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #292524;color:#e5e0d8;">${i.nombre}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #292524;text-align:center;color:#aaa;">×${i.qty}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #292524;text-align:right;color:#DC2626;">$${i.precio * i.qty}</td>
        </tr>`
      ).join("");

      const nombreMostrar = nombre || "Amig@";

      const html = `
        <div style="background:#0a0a0a;color:#e5e0d8;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h1 style="font-size:28px;letter-spacing:0.2em;color:#DC2626;margin:0 0 4px;">DOSIS</h1>
          <p style="color:#555;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 28px;">Tu carrito te está esperando</p>

          <p style="color:#e5e0d8;font-size:16px;line-height:1.6;margin:0 0 8px;">
            ${nombreMostrar}, ¿se te fue el internet?
          </p>
          <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 24px;">
            Dejaste tu pedido a medias. Las salsas siguen aquí — complétalo cuando quieras.
          </p>

          ${itemsHtml.length > 0 ? `
          <p style="color:#555;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">Lo que dejaste en el carrito</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #292524;margin-bottom:24px;">
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr style="background:#1c1917;">
                <td colspan="2" style="padding:10px 12px;font-size:12px;color:#555;text-transform:uppercase;letter-spacing:0.2em;">Total</td>
                <td style="padding:10px 12px;text-align:right;font-size:20px;font-weight:bold;color:#DC2626;">$${total}</td>
              </tr>
            </tfoot>
          </table>
          ` : ""}

          <a href="https://www.dosispicante.com" style="display:inline-block;padding:16px 40px;background:#DC2626;color:#fff;font-size:14px;letter-spacing:0.3em;text-transform:uppercase;text-decoration:none;font-weight:bold;margin-bottom:16px;">
            Completar pedido →
          </a>

          <p style="color:#555;font-size:13px;margin:16px 0 0;">
            ¿Prefieres hablar directo?
            <a href="${WA_LINK}" style="color:#DC2626;text-decoration:none;">WhatsApp</a>
          </p>

          <p style="color:#333;font-size:10px;margin-top:32px;letter-spacing:0.3em;text-transform:uppercase;border-top:1px solid #292524;padding-top:16px;">
            DOSIS · C18H27NO3 · Venezuela<br>
            <span style="color:#222;">Si no quieres recibir estos recordatorios, simplemente ignora este email.</span>
          </p>
        </div>
      `;

      const { error } = await resend.emails.send({
        from: REMITENTE,
        to: [email],
        replyTo: "dosispicante@gmail.com",
        subject: `${nombreMostrar}, dejaste tu carrito DOSIS 🌶`,
        html,
      });

      if (!error) {
        // Marcar como email enviado
        await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_ABANDONADOS}/${record.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ fields: { "Email Enviado": true } }),
        });
        enviados++;
      }
    }

    return NextResponse.json({ ok: true, procesados: abandonados.length, enviados });
  } catch (err) {
    console.error("Error en /api/checkout/recuperar:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
