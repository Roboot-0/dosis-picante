import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const maxDuration = 15;

// Mismos datos que la ruta de pedido — dominio ya verificado en Resend
const REMITENTE = "DOSIS Picante <pedidos@dosispicante.com>";
const REPLY_TO = "dosispicante@gmail.com";

// Clave secreta para que solo se pueda llamar desde Airtable o admin
const API_SECRET = process.env.NOTIFICACION_SECRET || process.env.RESEND_API_KEY;

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

    // Línea de tracking (opcional — si no hay, solo dice que fue enviado)
    const trackingHtml = tracking
      ? `<div style="border:1px solid #292524;padding:16px;margin:16px 0;background:#1c1917;text-align:center;">
           <p style="color:#555;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">Número de seguimiento</p>
           <p style="color:#DC2626;font-size:20px;font-weight:bold;letter-spacing:0.1em;margin:0;">${tracking}</p>
         </div>`
      : "";

    // Lista de productos (opcional)
    const productosHtml = productos
      ? `<p style="color:#555;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:20px 0 8px;">Tu pedido incluye</p>
         <p style="color:#e5e0d8;font-size:14px;line-height:1.7;margin:0 0 16px;">${productos}</p>`
      : "";

    const html = `
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

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: REMITENTE,
      to: [email],
      replyTo: REPLY_TO,
      subject: `Tu pedido DOSIS ${idPedido} fue enviado 🚀`,
      html,
    });

    if (error) {
      console.error("Error Resend (notificar-envio):", error);
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
