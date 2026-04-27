import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_API = "https://api.airtable.com/v0";
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
const TBL_PEDIDOS = "tbl3YXihFUiElzG05";
const TBL_CLIENTES = "tblWZb7RXfbsX3a0c";

const API_SECRET = process.env.NOTIFICACION_SECRET || process.env.RESEND_API_KEY;

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

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
    // Fetch pedidos — más recientes primero, hasta 100
    const pedidosUrl =
      `${AIRTABLE_API}/${BASE_ID}/${TBL_PEDIDOS}` +
      `?sort[0][field]=Fecha&sort[0][direction]=desc&maxRecords=100`;

    const pedidosRes = await fetch(pedidosUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!pedidosRes.ok) {
      const text = await pedidosRes.text();
      return NextResponse.json({ ok: false, error: `Airtable: ${text}` }, { status: 500 });
    }

    const pedidosData = (await pedidosRes.json()) as { records: AirtableRecord[] };
    const pedidos = pedidosData.records;

    // Recopilar IDs únicos de clientes vinculados
    const clienteIds = Array.from(
      new Set(pedidos.flatMap((p) => (p.fields.Cliente as string[]) || []))
    );

    // Traer todos los clientes en una sola llamada
    const clienteMap = new Map<string, { nombre: string; email: string; telefono: string }>();

    if (clienteIds.length > 0) {
      const formula = `OR(${clienteIds.map((id) => `RECORD_ID()="${id}"`).join(",")})`;
      const clientesUrl =
        `${AIRTABLE_API}/${BASE_ID}/${TBL_CLIENTES}` +
        `?filterByFormula=${encodeURIComponent(formula)}` +
        `&fields[]=Nombre&fields[]=Email&fields[]=Telefono`;

      const clientesRes = await fetch(clientesUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (clientesRes.ok) {
        const clientesData = (await clientesRes.json()) as { records: AirtableRecord[] };
        for (const c of clientesData.records) {
          clienteMap.set(c.id, {
            nombre: (c.fields.Nombre as string) || "",
            email: (c.fields.Email as string) || "",
            telefono: (c.fields.Telefono as string) || "",
          });
        }
      }
    }

    // Combinar pedidos + datos de cliente
    const result = pedidos.map((p) => {
      const clienteId = ((p.fields.Cliente as string[]) || [])[0];
      const cliente = clienteMap.get(clienteId) || { nombre: "", email: "", telefono: "" };
      return {
        recordId: p.id,
        idPedido: (p.fields["ID Pedido"] as string) || "",
        fecha: (p.fields.Fecha as string) || "",
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        itemsJson: (p.fields["Items JSON"] as string) || "[]",
        totalUSD: (p.fields["Total USD"] as number) || 0,
        metodoPago: (p.fields["Metodo Pago"] as string) || "",
        estadoPago: (p.fields["Estado Pago"] as string) || "",
        estadoEnvio: (p.fields["Estado Envio"] as string) || "",
        direccionEnvio: (p.fields["Direccion Envio"] as string) || "",
        notas: (p.fields.Notas as string) || "",
      };
    });

    return NextResponse.json({ ok: true, pedidos: result });
  } catch (err) {
    console.error("Error en /api/admin/pedidos:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
