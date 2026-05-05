import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD || "dosis2024";

  if (!password || password !== adminPassword) {
    return NextResponse.json({ ok: false, error: "Clave incorrecta" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
