import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "dosis-admin-session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protege /admin/* y /api/admin/*
  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/api/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  // Rutas públicas del sistema admin (no requieren sesión)
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/admin/auth") return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    if (isAdminApi) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Verifica el token con Web Crypto
  const secret =
    process.env.ADMIN_SECRET ||
    process.env.AIRTABLE_API_KEY ||
    "dosis-admin-fallback-secret";
  const password = process.env.ADMIN_PASSWORD || "dosis2024";

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`dosis:admin:${password}`)
  );
  const expected = Buffer.from(signature).toString("hex");

  if (token !== expected) {
    if (isAdminApi) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
