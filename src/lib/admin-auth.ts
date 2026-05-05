/**
 * admin-auth.ts — Utilidades de autenticación para el panel admin DOSIS
 * Usa Web Crypto API (disponible en Edge + Node.js 18+)
 */

const COOKIE_NAME = "dosis-admin-session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function getSecret(): string {
  return (
    process.env.ADMIN_SECRET ||
    process.env.AIRTABLE_API_KEY ||
    "dosis-admin-fallback-secret"
  );
}

/** Genera un token HMAC-SHA256 a partir del password y el secreto */
async function generateToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`dosis:admin:${password}`)
  );
  return Buffer.from(signature).toString("hex");
}

/** Verifica si el token de la cookie es válido */
export async function verifyToken(token: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD || "dosis2024";
  const expected = await generateToken(password);
  return token === expected;
}

/** Genera el token de sesión para el password correcto */
export async function createSessionToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD || "dosis2024";
  return generateToken(password);
}

export { COOKIE_NAME, COOKIE_MAX_AGE };
