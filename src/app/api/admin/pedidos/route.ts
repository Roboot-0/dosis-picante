import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_PEDIDOS = "tbl3YXihFUiElzG05";

const API_SECRET = process.env.NOTIFICACION_SECRET || process.env.RESEND_API_KEY;

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

// ─── GET: lista de pedidos con datos de cliente ───────────────────────────────
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token || token !== API_SECRET) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "AIRTABLE_API_KEY no configurado" }, { status: 500 });
  }

  try {
    const pedidosUrl =
      `${AIRTABLE_API}/${BASE_ID}/${TBL_PEDIDOS}` +
      `?sort[0][field]=Fecha&sort[0][direction]=desc&maxRecords=200`;

    const pedidosRes = await fetch(pedidosUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!pedidosRes.ok) {
      const text = await pedidosRes.text();
      return NextResponse.json({ ok: false, error: `Airtable: ${text}` }, { status: 500 });
    }

    const pedidosData = (await pedidosRes.json()) as { records: AirtableRecord[] };
    const pedidos = pedidosData.records;

    // Los campos lookup "Nombre (from Cliente)" y "Email (from Cliente)" ya vienen
    // en la respuesta de Pedidos — no hace falta una segunda llamada a Clientes.
    const result = pedidos.map((p) => {
      const nombreRaw = p.fields["Nombre (from Cliente)"];
      const emailRaw  = p.fields["Email (from Cliente)"];
      const nombre = Array.isArray(nombreRaw) ? (nombreRaw[0] as string) : ((nombreRaw as string) || "");
      const email  = Array.isArray(emailRaw)  ? (emailRaw[0]  as string) : ((emailRaw  as string) || "");
      return {
        recordId: p.id,
        idPedido: (p.fields["ID Pedido"] as string) || "",
        fecha: (p.fields.Fecha as string) || "",
        nombre,
        email,
        telefono: "",
        itemsJson: (p.fields["Items JSON"] as string) || "[]",
        totalUSD: (p.fields["Total USD"] as number) || 0,
        metodoPago: (p.fields["Metodo Pago"] as string) || "",
        estadoPago: (p.fields["Estado Pago"] as string) || "Pendiente",
        estadoEnvio: (p.fields["Estado Envio"] as string) || "Pendiente",
        direccionEnvio: (p.fields["Direccion Envio"] as string) || "",
        notas: (p.fields.Notas as string) || "",
      };
    });

    return NextResponse.json({ ok: true, pedidos: result });
  } catch (err) {
    console.error("Error en /api/admin/pedidos GET:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// ─── PATCH: actualizar campo de un pedido (Estado Pago o Estado Envio) ────────
export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token || token !== API_SECRET) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "AIRTABLE_API_KEY no configurado" }, { status: 500 });
  }

  try {
    const body = (await req.json()) as { recordId: string; fields: Record<string, string> };
    const { recordId, fields } = body;

    if (!recordId || !fields) {
      return NextResponse.json({ ok: false, error: "Faltan recordId o fields" }, { status: 400 });
    }

    // Solo se permiten actualizar estos campos desde el panel
    const camposPermitidos = ["Estado Pago", "Estado Envio"];
    const camposFiltrados: Record<string, string> = {};
    for (const k of camposPermitidos) {
      if (k in fields) camposFiltrados[k] = fields[k];
    }

    if (Object.keys(camposFiltrados).length === 0) {
      return NextResponse.json({ ok: false, error: "Ningún campo válido para actualizar" }, { status: 400 });
    }

    const res = await fetch(`${AIRTABLE_API}/${BASE_ID}/${TBL_PEDIDOS}/${recordId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: camposFiltrados }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ ok: false, error: text }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/admin/pedidos PATCH:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
