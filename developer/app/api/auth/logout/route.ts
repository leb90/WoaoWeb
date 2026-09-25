import { NextResponse } from "next/server";
import { clearSessionCookieHeader } from "@/lib/security/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", clearSessionCookieHeader());
  return res;
}
