import { NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieHeader,
  verifyLogin,
} from "@/lib/security/auth";
import { jsonError } from "@/lib/security/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: "Usuario y contraseña requeridos" },
        { status: 400 },
      );
    }
    const admin = await verifyLogin(body.username, body.password);
    if (!admin) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }
    const token = await createSessionToken(admin);
    const res = NextResponse.json({
      ok: true,
      username: admin.username,
    });
    res.headers.set("Set-Cookie", sessionCookieHeader(token));
    return res;
  } catch (error) {
    return jsonError(error);
  }
}
