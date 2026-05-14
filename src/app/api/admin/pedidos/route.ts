import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_PEDIDOS = "tbl3YXihFUiElzG05";

const REMITENTE = "DOSIS Picante <pedidos@dosispicante.com>";
const REPLY_TO = "dosispicante@gmail.com";
const ADMIN_CC = "dosispicante@gmail.com";

function airtableHeaders() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

// ─── Email HTML (mismo diseño que /api/notificar-envio) ─────────────────────
function buildEmailHtml(nombre: string, idPedido: string, tracking: string, productos: string): string {
  const trackingHtml = tracking
    ? `<div style="border:1px solid #292524;padding:16px;margin:16px 0;background:#1c1917;text-align:center;">
         <p style="color:#555;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">Número de seguimiento</p>
         <p style="color:#DC2626;font-size:20px;font-weight:bold;letter-spacing:0.1em;margin:0;">${tracking}</p>
       </div>`
    : "";

  const productosHtml = productos
    ? `<p style="color:#555;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:20px 0 8px;">Tu pedido incluye</p>
       <p style="color:#e5e0d8;font-size:14px;line-height:1.7;margin:0 0 16px;">${productos}</p>`
    : "";

  return `
    <div style="background:#0a0a0a;color:#e5e0d8;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h1 style="font-size:28px;letter-spacing:0.2em;color:#DC2626;margin:0 0 4px;">DOSIS</h1>
      <p style="color:#555;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 28px;">Notificación de envío · C18H27NO3</p>

      <p style="color:#e5e0d8;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hola <strong>${nombre}</strong>,
      </p>
      <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Tu pedido <strong style="color:#e5e0d8;">${idPedido}</strong> ya fue enviado.
        ${tracking ? "Puedes hacer seguimiento con el número que aparece abajo." : "Te avisaremos cuando esté por llegar."}
      </p>

      ${trackingHtml}
      ${productosHtml}

      <p style="color:#aaa;font-size:13px;line-height:1.7;margin:24px 0 8px;">
        Si tienes alguna duda, responde este correo o escríbenos al WhatsApp
        <a href="https://wa.me/584142624078" style="color:#DC2626;text-decoration:none;">+58 414-262-4078</a>.
      </p>

      <p style="color:#e5e0d8;font-size:14px;margin:24px 0 0;">
        Gracias por elegir DOSIS. El picor está en camino.<br>
        <strong style="letter-spacing:0.1em;">— DOSIS</strong>
      </p>

      <p style="color:#333;font-size:10px;margin-top:32px;letter-spacing:0.3em;text-transform:uppercase;border-top:1px solid #292524;padding-top:16px;">
        DOSIS · C18H27NO3 · Venezuela
      </p>
    </div>
  `;
}

// ─── Envía el correo de notificación (fire-and-forget) ───────────────────────
async function sendEnvioNotification(fields: Record<string, unknown>): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;

    const emailArr = fields["Email (from Cliente)"] as string[] | undefined;
    const nombreArr = fields["Nombre (from Cliente)"] as string[] | undefined;
    const email = Array.isArray(emailArr) ? emailArr[0] : "";
    const nombre = (Array.isArray(nombreArr) ? nombreArr[0] : "")?.trim() ?? "";
    const idPedido = (fields["ID Pedido"] as string) || "";

    if (!email || !nombre || !idPedido) {
      console.warn("notificar-envio admin: faltan datos (email/nombre/idPedido)");
      return;
    }

    // Construir lista de productos desde Items JSON
    let productos = "";
    try {
      const itemsJson = fields["Items JSON"] as string | undefined;
      if (itemsJson) {
        const items = JSON.parse(itemsJson) as Array<{ nombre?: string; qty?: number }>;
        productos = items.map((i) => `${i.nombre} × ${i.qty}`).join(", ");
      }
    } catch { /* items no críticos */ }

    const html = buildEmailHtml(nombre, idPedido, "", productos);
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from:    REMITENTE,
      to:      [email],
      cc:      [ADMIN_CC],
      replyTo: REPLY_TO,
      subject: `Tu pedido DOSIS ${idPedido} fue enviado 🚀`,
      html,
    });

    if (error) {
      console.error("Error Resend (notificar-envio desde admin):", error);
    }
  } catch (err) {
    console.error("Error enviando notificación de envío desde admin:", err);
  }
}

// ─── GET — lista pedidos ──────────────────────────────────────────────────────
export async function GET() {
  const url =
    `${AIRTABLE_API}/${BASE_ID}/${TBL_PEDIDOS}` +
    `?sort[0][field]=Fecha&sort[0][direction]=desc&maxRecords=200`;
  const res = await fetch(url, { headers: airtableHeaders() });
  const data = await res.json();
  return NextResponse.json(data);
}

// ─── PATCH — actualiza estado del pedido ─────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const { recordId, fields } = await req.json();

  const settingEnviado = fields["Estado Envio"] === "Enviado";

  // Si vamos a marcar como Enviado, obtener el registro actual para:
  //   1. Verificar que no estaba ya en "Enviado" (anti-duplicado)
  //   2. Obtener email/nombre/idPedido para el correo
  let currentFields: Record<string, unknown> | null = null;
  let wasAlreadyEnviado = false;

  if (settingEnviado) {
    const fetchRes = await fetch(
      `${AIRTABLE_API}/${BASE_ID}/${TBL_PEDIDOS}/${recordId}`,
      { headers: airtableHeaders() }
    );
    if (fetchRes.ok) {
      const rec = (await fetchRes.json()) as { fields?: Record<string, unknown> };
      currentFields = rec.fields ?? null;
      wasAlreadyEnviado = (currentFields?.["Estado Envio"] as string | undefined) === "Enviado";
    }
  }

  // PATCH a Airtable (typecast:true acepta valores de select nuevos, p.ej. "Pagado")
  const res = await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PEDIDOS}/${recordId}`, {
    method: "PATCH",
    headers: airtableHeaders(),
    body: JSON.stringify({ fields, typecast: true }),
  });
  const data = await res.json();

  // Disparar correo de notificación (fire-and-forget — no bloquea la respuesta)
  if (settingEnviado && !wasAlreadyEnviado && currentFields) {
    void sendEnvioNotification(currentFields);
  }

  return NextResponse.json(data);
}
