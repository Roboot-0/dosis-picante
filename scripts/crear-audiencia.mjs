// Script de un solo uso:
// crea la "audiencia" (lista de contactos) en Resend para guardar los clientes
// que hacen pedidos en la web de DOSIS.
//
// Cómo se usa:
//   1) Abre el archivo "crear audiencia.bat" (doble click)
//   2) Copia el AUDIENCE_ID que aparece en pantalla
//   3) Pégalo en el archivo .env.local, en la línea RESEND_AUDIENCE_ID=...
//   4) Reinicia el servidor (cierra la ventana negra y abre versitio v3.bat)
//
// Solo hay que hacer esto UNA VEZ.

import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Cargar .env.local manualmente (Node no lo hace solo)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "..", ".env.local");

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("❌ No encontré RESEND_API_KEY en .env.local");
  process.exit(1);
}

const resend = new Resend(apiKey);

console.log("Creando audiencia 'Clientes DOSIS' en Resend...\n");

try {
  const { data, error } = await resend.audiences.create({
    name: "Clientes DOSIS",
  });

  if (error) {
    console.error("❌ Error creando audiencia:", error);
    process.exit(1);
  }

  console.log("✅ Audiencia creada con éxito\n");
  console.log("   Nombre: Clientes DOSIS");
  console.log(`   ID:     ${data?.id}\n`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log(" SIGUIENTE PASO:");
  console.log(" 1) Copia esta línea y pégala al final de .env.local:");
  console.log("");
  console.log(`    RESEND_AUDIENCE_ID=${data?.id}`);
  console.log("");
  console.log(" 2) Cierra la ventana del servidor (la negra) si está abierta");
  console.log(" 3) Abre de nuevo 'versitio v3.bat'");
  console.log(" 4) Listo: cada pedido nuevo va a guardar al cliente");
  console.log("    automáticamente en tu lista 'Clientes DOSIS' en Resend.");
  console.log("═══════════════════════════════════════════════════════════");
} catch (err) {
  console.error("❌ Excepción:", err);
  process.exit(1);
}
