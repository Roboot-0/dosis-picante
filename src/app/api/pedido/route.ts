import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import {
  upsertCliente,
  crearPedido,
  generarIdPedido,
} from "@/lib/airtable";

// Route handler en Node.js runtime
export const runtime = "nodejs";
export const maxDuration = 30;

// Destinatario (dónde llegan los pedidos)
const DESTINATARIO = process.env.PEDIDOS_DESTINATARIO || "dosispicante@gmail.com";
// Remitente — dominio verificado en Resend (dosispicante.com)
const REMITENTE = "Pedidos DOSIS Picante <pedidos@dosispicante.com>";
// Cuando el cliente le dé "Responder" a cualquier correo, la respuesta llega acá
const REPLY_TO = "dosispicante@gmail.com";

// Log de diagnóstico local (se escribe en la raíz del proyecto)
function logDebug(msg: string) {
  try {
    const logPath = path.join(process.cwd(), "pedidos-debug.log");
    const stamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${stamp}] ${msg}\n`);
  } catch {
    /* ignore */
  }
}

// Base de datos local de clientes en CSV.
// Se abre directo con Excel (doble click). Cada pedido añade una fila.
// Ubicación: site-v3/data/clientes.csv
function escaparCSV(valor: string): string {
  // Si contiene coma, comilla o salto de línea, hay que envolver en comillas
  // y duplicar las comillas internas
  const s = String(valor ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

type PedidoFormLike = {
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  deliveryType?: string;
};

function guardarClienteEnCSV(
  form: PedidoFormLike,
  items: { nombre: string; qty: number }[],
  total: number,
  paymentLabel: string,
  deliveryLabel: string
) {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const csvPath = path.join(dataDir, "clientes.csv");

    // Si el archivo no existe, escribimos el encabezado primero.
    // Usamos BOM UTF-8 para que Excel abra los acentos correctamente.
    const esNuevo = !fs.existsSync(csvPath);
    if (esNuevo) {
      const header =
        "\uFEFFFecha,Hora,Nombre,Email,Teléfono,Dirección,Ciudad,Entrega,Método de pago,Total (USD),Productos\n";
      fs.writeFileSync(csvPath, header, "utf-8");
    }

    // Fecha y hora legibles en formato venezolano
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const hora = ahora.toLocaleTimeString("es-VE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Resumen de productos en una sola celda
    const productos = items
      .map((i) => `${i.nombre} x${i.qty}`)
      .join(" · ");

    const fila = [
      fecha,
      hora,
      form.nombre || "",
      form.email || "",
      form.telefono || "",
      form.direccion || "",
      form.ciudad || "",
      deliveryLabel,
      paymentLabel,
      String(total),
      productos,
    ]
      .map(escaparCSV)
      .join(",");

    fs.appendFileSync(csvPath, fila + "\n", "utf-8");
    logDebug(`Cliente guardado en data/clientes.csv`);
  } catch (err) {
    logDebug(
      `WARN no se pudo guardar cliente en CSV: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

export async function POST(req: NextRequest) {
  logDebug("===== NUEVO PEDIDO (Resend) =====");
  logDebug(`RESEND_API_KEY presente: ${!!process.env.RESEND_API_KEY} (len=${process.env.RESEND_API_KEY?.length ?? 0})`);

  try {
    if (!process.env.RESEND_API_KEY) {
      logDebug("ERROR: falta RESEND_API_KEY en el environment");
      return NextResponse.json(
        { ok: false, error: "Email no configurado (falta RESEND_API_KEY). Reinicia el servidor después de actualizar .env.local." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { items, total, form, payment, tasaBCV, montoBS, comprobante } = body;
    logDebug(`Body recibido: ${form?.nombre ?? "sin nombre"} - total $${total} - ${items?.length ?? 0} items - comprobante: ${comprobante ? "sí" : "no"}`);

    const deliveryLabel =
      form.deliveryType === "caracas"
        ? "Entrega en Caracas (a coordinar según zona)"
        : "Envío Nacional — Zoom/Domesa/MRW (a cargo del comprador)";

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

    // Adjunto del comprobante (si viene)
    const attachments = comprobante?.base64
      ? [
          {
            filename: comprobante.nombre || "comprobante.jpg",
            content: comprobante.base64, // Resend acepta base64 string directo
          },
        ]
      : undefined;

    logDebug("Llamando a Resend.emails.send (admin)...");
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 1) Correo para el admin (DOSIS) con el pedido completo + comprobante adjunto
    const { data: adminData, error: adminError } = await resend.emails.send({
      from: REMITENTE,
      to: [DESTINATARIO],
      replyTo: REPLY_TO,
      subject: `🌶 Nuevo pedido — ${form.nombre} — $${total}`,
      html,
      attachments,
    });

    if (adminError) {
      logDebug(`ERROR Resend (admin): ${JSON.stringify(adminError)}`);
      console.error("Error Resend admin:", adminError);
      return NextResponse.json(
        { ok: false, error: (adminError as { message?: string }).message || "Error enviando email al admin" },
        { status: 500 }
      );
    }
    logDebug(`Resend OK (admin). id=${adminData?.id}`);

    // 2) Correo de confirmación al cliente (si dejó email válido)
    const emailCliente = typeof form.email === "string" ? form.email.trim() : "";
    const emailClienteValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCliente);

    if (emailClienteValido) {
      const htmlCliente = `
        <div style="background:#0a0a0a;color:#e5e0d8;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h1 style="font-size:28px;letter-spacing:0.2em;color:#DC2626;margin:0 0 4px;">DOSIS</h1>
          <p style="color:#555;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 28px;">Confirmación de pedido · C18H27NO3</p>

          <p style="color:#e5e0d8;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Hola <strong>${form.nombre}</strong>,
          </p>
          <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 24px;">
            Recibimos tu pedido correctamente. En las próximas horas te escribimos por WhatsApp al
            <strong style="color:#e5e0d8;">${form.telefono}</strong> para confirmar los detalles de la entrega.
          </p>

          <p style="color:#555;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:24px 0 8px;">Resumen del pedido</p>
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

          <div style="border:1px solid #292524;padding:16px;margin-bottom:24px;background:#111;">
            <p style="margin:5px 0;color:#aaa;font-size:13px;"><strong style="color:#eee;">Entrega:</strong> ${deliveryLabel}</p>
            <p style="margin:5px 0;color:#aaa;font-size:13px;"><strong style="color:#eee;">Dirección:</strong> ${form.direccion}, ${form.ciudad}</p>
            <p style="margin:5px 0;color:#aaa;font-size:13px;"><strong style="color:#eee;">Método de pago:</strong> ${paymentLabel}</p>
          </div>

          <p style="color:#555;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:24px 0 8px;">¿Qué sigue?</p>
          <ol style="color:#aaa;font-size:13px;line-height:1.8;padding-left:20px;margin:0 0 24px;">
            <li>Verificamos tu comprobante.</li>
            <li>Te contactamos por WhatsApp para confirmar.</li>
            <li>Coordinamos la entrega.</li>
          </ol>

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

      const destinoComprador = emailCliente;
      const asuntoComprador = `Confirmación de tu pedido DOSIS — $${total}`;

      logDebug(`Enviando confirmación al cliente (${destinoComprador})...`);
      const { data: clienteData, error: clienteError } = await resend.emails.send({
        from: REMITENTE,
        to: [destinoComprador],
        replyTo: REPLY_TO,
        subject: asuntoComprador,
        html: htmlCliente,
      });

      if (clienteError) {
        // No hacemos fail de todo el pedido si falla el correo del cliente —
        // el pedido ya le llegó al admin. Solo logueamos.
        logDebug(`WARN: falló correo al cliente: ${JSON.stringify(clienteError)}`);
      } else {
        logDebug(`Resend OK (cliente). id=${clienteData?.id}`);
      }
    } else {
      logDebug("Cliente sin email válido, no se envía confirmación");
    }

    // 3) Guardar al cliente en la base de datos local (data/clientes.csv).
    //    Fire-and-forget: si falla, no rompemos el pedido.
    //    Nota: en Vercel el filesystem es efímero, por eso también escribimos a Airtable (paso 4).
    guardarClienteEnCSV(form, items, total, paymentLabel, deliveryLabel);

    // 4) Airtable — fuente de verdad persistente.
    //    Si falla, NO rompemos el pedido (email admin ya salió).
    //    Solo logueamos el error para revisarlo después.
    let airtableIdPedido: string | null = null;
    try {
      if (!process.env.AIRTABLE_API_KEY) {
        logDebug("AIRTABLE_API_KEY no configurado — skipping Airtable write");
      } else if (!emailClienteValido) {
        // Sin email no podemos hacer upsert de cliente (es la clave).
        // Caemos a crear un "cliente sin email" con un placeholder único.
        logDebug("Cliente sin email válido — creando pedido con placeholder");
        const emailPlaceholder = `sin-email+${Date.now()}@dosispicante.com`;
        const clienteId = await upsertCliente({
          email:     emailPlaceholder,
          nombre:    form.nombre || "",
          telefono:  form.telefono || "",
          ciudad:    form.ciudad || "",
          direccion: form.direccion || "",
          canal:     "Web",
        });
        const idPedido = generarIdPedido();
        const itemsAirtable = (items as Array<{
          sku?: string; nombre: string; qty: number; precio?: number; subtotal: number;
        }>).map((i) => ({
          sku:      i.sku || "",
          nombre:   i.nombre,
          qty:      i.qty,
          precio:   typeof i.precio === "number" ? i.precio : i.subtotal / Math.max(i.qty, 1),
          subtotal: i.subtotal,
        }));
        const { idPedido: idFinal } = await crearPedido({
          idPedido,
          fechaISO:       new Date().toISOString(),
          clienteId,
          items:          itemsAirtable,
          totalUSD:       total,
          tasaBCV:        typeof tasaBCV === "number" ? tasaBCV : undefined,
          totalBs:        typeof montoBS === "number" ? montoBS : undefined,
          metodoPago:     payment === "pagomovil" ? "Pago Móvil" : "Efectivo",
          direccionEnvio: `${form.direccion ?? ""}, ${form.ciudad ?? ""}`.trim().replace(/^,\s*/, ""),
          notas:          `Entrega: ${deliveryLabel}${comprobante ? " · Comprobante en email admin" : ""}`,
        });
        airtableIdPedido = idFinal;
        logDebug(`Airtable OK (sin email). idPedido=${idFinal}`);
      } else {
        const clienteId = await upsertCliente({
          email:     emailCliente,
          nombre:    form.nombre || "",
          telefono:  form.telefono || "",
          ciudad:    form.ciudad || "",
          direccion: form.direccion || "",
          canal:     "Web",
        });
        const idPedido = generarIdPedido();
        const itemsAirtable = (items as Array<{
          sku?: string; nombre: string; qty: number; precio?: number; subtotal: number;
        }>).map((i) => ({
          sku:      i.sku || "",
          nombre:   i.nombre,
          qty:      i.qty,
          precio:   typeof i.precio === "number" ? i.precio : i.subtotal / Math.max(i.qty, 1),
          subtotal: i.subtotal,
        }));
        const { idPedido: idFinal } = await crearPedido({
          idPedido,
          fechaISO:       new Date().toISOString(),
          clienteId,
          items:          itemsAirtable,
          totalUSD:       total,
          tasaBCV:        typeof tasaBCV === "number" ? tasaBCV : undefined,
          totalBs:        typeof montoBS === "number" ? montoBS : undefined,
          metodoPago:     payment === "pagomovil" ? "Pago Móvil" : "Efectivo",
          direccionEnvio: `${form.direccion ?? ""}, ${form.ciudad ?? ""}`.trim().replace(/^,\s*/, ""),
          notas:          `Entrega: ${deliveryLabel}${comprobante ? " · Comprobante en email admin" : ""}`,
        });
        airtableIdPedido = idFinal;
        logDebug(`Airtable OK. idPedido=${idFinal} clienteId=${clienteId}`);
      }
    } catch (err) {
      logDebug(
        `WARN Airtable falló (pedido igual aceptado): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      console.error("Error escribiendo a Airtable:", err);
    }

    return NextResponse.json({ ok: true, id: adminData?.id, idPedido: airtableIdPedido });
  } catch (err) {
    logDebug(`ERROR excepción en POST /api/pedido: ${err instanceof Error ? err.message : String(err)}`);
    console.error("Error enviando pedido:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
