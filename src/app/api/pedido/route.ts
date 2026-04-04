import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const DESTINATARIO = "raulsds@gmail.com";

// Configura el transporter de Gmail
function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,   // raulsds@gmail.com
      pass: process.env.GMAIL_PASS,   // App Password de Google (16 caracteres)
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, total, form, payment, tasaBCV, montoBS, comprobante } = body;

    const deliveryLabel =
      form.deliveryType === "caracas"
        ? "Delivery Caracas"
        : "Envío Nacional (a cargo del comprador)";

    const paymentLabel =
      payment === "pagomovil" ? "Pago Móvil" : "Efectivo contra entrega";

    const itemsHtml = (items as { nombre: string; qty: number; subtotal: number }[])
      .map(
        (i) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #292524;font-family:monospace;color:#e5e0d8;">${i.nombre}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #292524;text-align:center;color:#aaa;">${i.qty}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #292524;text-align:right;color:#e5e0d8;">$${i.subtotal}</td>
          </tr>`
      )
      .join("");

    const bsLine =
      montoBS
        ? `<p style="margin:5px 0;color:#aaa;font-size:14px;"><strong style="color:#eee;">Monto en Bs.:</strong> Bs. ${Number(montoBS).toLocaleString("es-VE", { minimumFractionDigits: 2 })} <span style="color:#666;">(tasa BCV: ${tasaBCV})</span></p>`
        : "";

    const html = `
      <div style="background:#0a0a0a;color:#e5e0d8;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:28px;letter-spacing:0.2em;color:#DC2626;margin:0 0 4px;">DOSIS</h1>
        <p style="color:#555;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 28px;">Nuevo pedido recibido</p>

        <table style="width:100%;border-collapse:collapse;border:1px solid #292524;margin-bottom:16px;">
          <thead>
            <tr style="background:#1c1917;">
              <th style="padding:10px 12px;text-align:left;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#666;">Producto</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;color:#666;">Cant.</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;color:#666;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr style="background:#1c1917;">
              <td colspan="2" style="padding:12px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#555;">Total</td>
              <td style="padding:12px;text-align:right;font-size:22px;font-weight:bold;color:#DC2626;">$${total}</td>
            </tr>
          </tfoot>
        </table>

        <div style="border:1px solid #292524;padding:16px;margin-bottom:16px;background:#111;">
          <p style="margin:5px 0;color:#aaa;font-size:14px;"><strong style="color:#eee;">Nombre:</strong> ${form.nombre}</p>
          <p style="margin:5px 0;color:#aaa;font-size:14px;"><strong style="color:#eee;">Teléfono:</strong> ${form.telefono}</p>
          <p style="margin:5px 0;color:#aaa;font-size:14px;"><strong style="color:#eee;">Dirección:</strong> ${form.direccion}, ${form.ciudad}</p>
          <p style="margin:5px 0;color:#aaa;font-size:14px;"><strong style="color:#eee;">Entrega:</strong> ${deliveryLabel}</p>
          <p style="margin:5px 0;color:#aaa;font-size:14px;"><strong style="color:#eee;">Pago:</strong> ${paymentLabel}</p>
          ${bsLine}
        </div>

        ${comprobante ? `<p style="color:#888;font-size:12px;border:1px solid #292524;padding:10px;">📎 Comprobante adjunto a este correo.</p>` : ""}

        <p style="color:#333;font-size:10px;margin-top:28px;letter-spacing:0.3em;text-transform:uppercase;">C18H27NO3 — DOSIS · ${new Date().toLocaleDateString("es-VE")}</p>
      </div>
    `;

    // Construir attachments si hay comprobante
    const attachments = comprobante?.base64
      ? [
          {
            filename: comprobante.nombre || "comprobante.jpg",
            content: Buffer.from(comprobante.base64, "base64"),
            contentType: comprobante.mimeType || "image/jpeg",
          },
        ]
      : [];

    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"DOSIS Pedidos" <${process.env.GMAIL_USER}>`,
      to: DESTINATARIO,
      subject: `🌶 Nuevo pedido — ${form.nombre} — $${total}`,
      html,
      attachments,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error enviando pedido:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
