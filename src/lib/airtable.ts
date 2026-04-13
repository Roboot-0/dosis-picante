/**
 * Airtable — cliente mínimo para escribir Clientes y Pedidos
 * desde el endpoint /api/pedido.
 *
 * Base DOSIS: appxJuRghB7SNB5md
 * Tablas:
 *   - Productos (tblR8v5ZI47l5k0iN)  → catálogo, solo lectura desde el server
 *   - Clientes  (tblWZb7RXfbsX3a0c)  → upsert por email
 *   - Pedidos   (tbl3YXihFUiElzG05)  → insert nuevo en cada checkout
 *
 * Usa fetch nativo (Node 20 / Next 15) — sin SDK extra.
 * Las funciones LANZAN si Airtable devuelve error; el caller decide si
 * convertir en fail del pedido o solo loguear.
 */

const AIRTABLE_API = "https://api.airtable.com/v0";

// IDs de tablas (fijos en la base DOSIS).
const TBL_PRODUCTOS    = "tblR8v5ZI47l5k0iN";
const TBL_CLIENTES     = "tblWZb7RXfbsX3a0c";
const TBL_PEDIDOS      = "tbl3YXihFUiElzG05";
const TBL_SUSCRIPTORES = "tbltf6pNVksUur8aI";

// Cache SKU → recordId de Productos. Se llena bajo demanda consultando Airtable,
// así si se borran y re-crean los productos NO hay que redeployar el código.
// La cache vive mientras el proceso Node esté arriba (dev server o serverless warm).
const skuRecordIdCache = new Map<string, string>();

/**
 * Convierte el id interno del frontend (Tienda.tsx) al SKU real de Airtable.
 * Nomenclatura: 2 letras del producto base + 2 números de variante (tamaño/versión).
 * Ej: MI-01 = Microdosis 30ml. Si mañana sale un tamaño nuevo, será MI-02 sin romper nada.
 */
export function idFrontendASku(id: string): string | null {
  const map: Record<string, string> = {
    microdosis: "MI-01",
    ahumadosis: "AH-01",
    sobredosis: "SO-01",
    kit:        "KI-01",
  };
  return map[id] ?? null;
}

/**
 * Busca el recordId de un producto por SKU. Cachea el resultado en memoria.
 * Devuelve null si el SKU no existe en la tabla Productos.
 */
export async function recordIdPorSku(sku: string): Promise<string | null> {
  if (!sku) return null;
  const cacheHit = skuRecordIdCache.get(sku);
  if (cacheHit) return cacheHit;

  const { baseId } = envOrThrow();
  const formula = encodeURIComponent(`{SKU} = "${sku.replace(/"/g, '\\"')}"`);
  const res = (await airtableFetch(
    `/${baseId}/${TBL_PRODUCTOS}?filterByFormula=${formula}&maxRecords=1`,
    { method: "GET" },
  )) as { records: { id: string }[] };

  if (res.records.length === 0) return null;
  const id = res.records[0].id;
  skuRecordIdCache.set(sku, id);
  return id;
}

function envOrThrow(): { apiKey: string; baseId: string } {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || "appxJuRghB7SNB5md";
  if (!apiKey) {
    throw new Error("AIRTABLE_API_KEY no está configurado en el environment");
  }
  return { apiKey, baseId };
}

async function airtableFetch(
  path: string,
  init: RequestInit & { body?: string },
): Promise<unknown> {
  const { apiKey } = envOrThrow();
  const res = await fetch(`${AIRTABLE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

/**
 * Genera un ID legible para el pedido: DOSIS-YYYYMMDD-XXX
 * Donde XXX es un sufijo aleatorio corto para evitar colisiones sin consultar Airtable.
 */
export function generarIdPedido(fecha: Date = new Date()): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `DOSIS-${y}${m}${d}-${rand}`;
}

export interface UpsertClienteInput {
  email: string;
  nombre: string;
  telefono?: string;
  ciudad?: string;
  direccion?: string;
  canal?: "Web" | "Instagram" | "WhatsApp" | "Referido";
}

/**
 * Busca un cliente por email exacto. Si existe, devuelve su record id.
 * Si no existe, lo crea con la info del form y devuelve el id nuevo.
 * (Airtable no tiene upsert nativo por campo arbitrario; lo hacemos manual.)
 */
export async function upsertCliente(
  input: UpsertClienteInput,
): Promise<string> {
  const { baseId } = envOrThrow();
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error("upsertCliente requiere email");

  // 1) Buscar por email (filterByFormula LOWER({Email}) = "...").
  const formula = encodeURIComponent(`LOWER({Email}) = "${email.replace(/"/g, '\\"')}"`);
  const buscar = (await airtableFetch(
    `/${baseId}/${TBL_CLIENTES}?filterByFormula=${formula}&maxRecords=1`,
    { method: "GET" },
  )) as { records: { id: string }[] };

  if (buscar.records.length > 0) {
    return buscar.records[0].id;
  }

  // 2) Crear nuevo cliente.
  const hoy = new Date().toISOString().slice(0, 10);
  const body = JSON.stringify({
    fields: {
      Email:                 email,
      Nombre:                input.nombre || "",
      Telefono:              input.telefono || "",
      Ciudad:                input.ciudad || "",
      Direccion:             input.direccion || "",
      "Fecha primer pedido": hoy,
      Canal:                 input.canal || "Web",
    },
  });

  const creado = (await airtableFetch(`/${baseId}/${TBL_CLIENTES}`, {
    method: "POST",
    body,
  })) as { id: string };

  return creado.id;
}

export interface CrearPedidoInput {
  idPedido:     string;
  fechaISO:     string;                        // ISO con zona, ej: 2026-04-11T18:45:00-04:00
  clienteId:    string;                        // record id de Clientes
  items: Array<{                               // items del carrito
    sku:      string;                          // MICRO | AHUMA | SOBRE | KIT
    nombre:   string;
    qty:      number;
    precio:   number;                          // precio USD al momento del pedido
    subtotal: number;
  }>;
  totalUSD:     number;
  tasaBCV?:     number;
  totalBs?:     number;
  metodoPago:   "Pago Móvil" | "Efectivo";
  direccionEnvio: string;
  notas?:       string;
}

/**
 * Crea el registro en la tabla Pedidos y lo linkea al Cliente y a los Productos.
 * Devuelve el record id del pedido.
 */
export async function crearPedido(
  input: CrearPedidoInput,
): Promise<{ recordId: string; idPedido: string }> {
  const { baseId } = envOrThrow();

  // Mapear SKUs → record ids de Productos. Los desconocidos se ignoran (pero se dejan en Items JSON).
  // Se resuelve en runtime contra Airtable (con cache) para que sobreviva a un reset de datos.
  const skusUnicos = Array.from(new Set(input.items.map((i) => i.sku).filter(Boolean)));
  const productoIdsResueltos = await Promise.all(skusUnicos.map((sku) => recordIdPorSku(sku)));
  const productoIds = productoIdsResueltos.filter((id): id is string => !!id);

  // NOTA: el campo "#" es de tipo Autonumber — Airtable lo asigna solo al crear el
  // registro y NO permite escribirlo desde la API (da error 422 "field is computed").
  // Por eso no aparece en el payload de fields de abajo.

  const itemsJson = JSON.stringify(input.items, null, 0);

  const fields: Record<string, unknown> = {
    "ID Pedido":       input.idPedido,
    Fecha:             input.fechaISO,
    Cliente:           [input.clienteId],
    Productos:         productoIds,
    "Items JSON":      itemsJson,
    "Total USD":       input.totalUSD,
    "Metodo Pago":     input.metodoPago,
    "Estado Pago":     "Pendiente",
    "Estado Envio":    "Pendiente",
    "Direccion Envio": input.direccionEnvio,
  };
  if (typeof input.tasaBCV === "number") fields["Tasa BCV"] = input.tasaBCV;
  if (typeof input.totalBs === "number") fields["Total Bs"] = input.totalBs;
  if (input.notas) fields["Notas"] = input.notas;

  const body = JSON.stringify({ fields });
  const creado = (await airtableFetch(`/${baseId}/${TBL_PEDIDOS}`, {
    method: "POST",
    body,
  })) as { id: string };

  return { recordId: creado.id, idPedido: input.idPedido };
}

export interface UpsertSuscriptorInput {
  telefono: string;                               // WhatsApp
  fuente?: "Drop-Web" | "IG" | "Referido" | "Otro";
  notas?: string;
}

/**
 * Upsert de suscriptor por teléfono. Normaliza el teléfono a solo dígitos (+ opcional)
 * para evitar duplicados por formato diferente ("+58 412 1234567" vs "04121234567").
 * Si el teléfono ya existe, NO sobreescribe — solo devuelve el record existente.
 * Si no existe, crea un nuevo registro con fecha = hoy y estado = Activo.
 */
export async function upsertSuscriptor(
  input: UpsertSuscriptorInput,
): Promise<{ recordId: string; yaExistia: boolean }> {
  const { baseId } = envOrThrow();
  const telefonoNormalizado = normalizarTelefono(input.telefono);
  if (!telefonoNormalizado) throw new Error("upsertSuscriptor requiere teléfono válido");

  // Buscar si ya existe un suscriptor con ese teléfono (comparamos solo dígitos para
  // ignorar diferencias de formato: "0412-123-4567" vs "+58 412 1234567").
  // Usamos REGEX_REPLACE para quitar todo lo no-dígito al vuelo en el servidor.
  const digitos = soloDigitos(telefonoNormalizado);
  const formula = encodeURIComponent(
    `REGEX_REPLACE({Telefono}, "[^0-9]", "") = "${digitos}"`,
  );
  const buscar = (await airtableFetch(
    `/${baseId}/${TBL_SUSCRIPTORES}?filterByFormula=${formula}&maxRecords=1`,
    { method: "GET" },
  )) as { records: { id: string }[] };

  if (buscar.records.length > 0) {
    return { recordId: buscar.records[0].id, yaExistia: true };
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const body = JSON.stringify({
    fields: {
      Telefono:            telefonoNormalizado,
      "Fecha suscripcion": hoy,
      Fuente:              input.fuente || "Drop-Web",
      Estado:              "Activo",
      ...(input.notas ? { Notas: input.notas } : {}),
    },
  });

  const creado = (await airtableFetch(`/${baseId}/${TBL_SUSCRIPTORES}`, {
    method: "POST",
    body,
  })) as { id: string };

  return { recordId: creado.id, yaExistia: false };
}

function soloDigitos(s: string): string {
  return s.replace(/[^0-9]/g, "");
}

/**
 * Normaliza un teléfono venezolano a formato +58XXXXXXXXXX si detecta un celular local,
 * o devuelve tal cual con espacios/guiones limpios si ya viene con + internacional.
 * No valida exhaustivamente — es best-effort para mejorar consistencia en la base.
 */
function normalizarTelefono(input: string): string | null {
  const limpio = input.trim().replace(/\s+/g, " ");
  if (!limpio) return null;
  const d = soloDigitos(limpio);
  if (d.length < 7) return null;                  // muy corto, inválido
  // Ej: 04121234567 → +584121234567
  if (d.length === 11 && d.startsWith("0")) {
    return `+58${d.slice(1)}`;
  }
  // Ej: 4121234567 → +584121234567
  if (d.length === 10 && (d.startsWith("4") || d.startsWith("2"))) {
    return `+58${d}`;
  }
  // Ya internacional o desconocido: devolver tal cual (con + si empezaba con +)
  return limpio.startsWith("+") ? limpio : `+${d}`;
}

// Evitar "unused export" si cambia el import: marcar los IDs como internos exportables para tests manuales.
export const _tablas = { TBL_PRODUCTOS, TBL_CLIENTES, TBL_PEDIDOS, TBL_SUSCRIPTORES };
