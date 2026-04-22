import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const maxDuration = 15;

// Mismos datos que la ruta de pedido — dominio ya verificado en Resend
const REMITENTE = "DOSIS Picante <pedidos@dosispicante.com>";
const REPLY_TO = "dosispicante@gmail.com";
// Admin recibe copia del correo de despacho
const ADMIN_CC = "dosispicante@gmail.com";

// Clave secreta para que solo se pueda llamar desde Airtable o admin
const API_SECRET = process.env.NOTIFICACION_SECRET || process.env.RESEND_API_KEY;

// ─── HTML del correo de despacho (reutilizado por GET y POST) ───────────────
function buildEmailHtml(
  nombre: string,
  idPedido: string,
  tracking: string,
  productos: string
): string {
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

// ─── Página HTML de resultado (para el GET del botón Airtable) ───────────────
function resultPage(ok: boolean, message: string, detail = ""): NextResponse {
  const color = ok ? "#22c55e" : "#ef4444";
  const icon = ok ? "✅" : "❌";
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DOSIS — Notificación de envío</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0a;
      color: #e5e0d8;
      font-family: sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .box {
      text-align: center;
      padding: 48px 40px;
      border: 1px solid #292524;
      max-width: 420px;
      width: 90%;
    }
    h1 { color: #DC2626; letter-spacing: .2em; font-size: 26px; margin-bottom: 4px; }
    .sub { color: #555; font-size: 11px; letter-spacing: .3em; text-transform: uppercase; margin-bottom: 32px; }
    .msg { font-size: 18px; margin: 0 0 8px; color: ${color}; }
    .detail { color: #777; font-size: 13px; margin-bottom: 28px; }
    button {
      background: #DC2626;
      color: #fff;
      border: none;
      padding: 12px 28px;
      cursor: pointer;
      font-size: 14px;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    button:hover { background: #b91c1c; }
  </style>
</head>
<body>
  <div class="box">
    <h1>DOSIS</h1>
    <p class="sub">Notificación de envío</p>
    <p class="msg">${icon} ${message}</p>
    ${detail ? `<p class="detail">${detail}</p>` : ""}
    <button onclick="window.close()">Cerrar</button>
  </div>
</body>
</html>`,
    {
      status: ok ? 200 : 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

// ─── GET — llamado desde el botón de Airtable (abre URL en nueva pestaña) ───
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const token     = searchParams.get("token") ?? "";
  const email     = searchParams.get("email") ?? "";
  const nombre    = searchParams.get("nombre") ?? "";
  const idPedido  = searchParams.get("idPedido") ?? "";
  const tracking  = searchParams.get("tracking") ?? "";
  const productos = searchParams.get("productos") ?? "";

  // Auth
  if (!token || token !== API_SECRET) {
    return resultPage(false, "No autorizado", "Token inválido.");
  }
  if (!process.env.RESEND_API_KEY) {
    return resultPage(false, "Error de configuración", "RESEND_API_KEY no configurado en Vercel.");
  }
  if (!email || !nombre || !idPedido) {
    return resultPage(
      false,
      "Faltan datos",
      "El pedido no tiene email, nombre o ID. Verifica los campos en Airtable."
    );
  }

  const html = buildEmailHtml(nombre, idPedido, tracking, productos);

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from:    REMITENTE,
    to:      [email],
    cc:      [ADMIN_CC],
    replyTo: REPLY_TO,
    subject: `Tu pedido DOSIS ${idPedido} fue enviado 🚀`,
    html,
  });

  if (error) {
    console.error("Error Resend (notificar-envio GET):", error);
    return resultPage(
      false,
      "Error al enviar",
      (error as { message?: string }).message ?? "Error desconocido de Resend."
    );
  }

  return resultPage(
    true,
    "Correo enviado",
    `Notificación de despacho enviada a ${email}${tracking ? ` · Tracking: ${tracking}` : ""}`
  );
}

// ─── POST — llamado desde scripts o integraciones con Bearer token ────────────
export async function POST(req: NextRequest) {
  try {
    // Verificar que venga la clave (evita que cualquiera dispare correos)
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token || token !== API_SECRET) {
      return NextResponse.json(
        { ok: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "RESEND_API_KEY no configurado" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { email, nombre, idPedido, productos, tracking } = body;

    // Validar campos mínimos
    if (!email || !nombre || !idPedido) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos: email, nombre, idPedido" },
        { status: 400 }
      );
    }

    const html = buildEmailHtml(nombre, idPedido, tracking ?? "", productos ?? "");

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from:    REMITENTE,
      to:      [email],
      cc:      [ADMIN_CC],
      replyTo: REPLY_TO,
      subject: `Tu pedido DOSIS ${idPedido} fue enviado 🚀`,
      html,
    });

    if (error) {
      console.error("Error Resend (notificar-envio POST):", error);
      return NextResponse.json(
        { ok: false, error: (error as { message?: string }).message || "Error enviando email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, emailId: data?.id });
  } catch (err) {
    console.error("Error en notificar-envio:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
