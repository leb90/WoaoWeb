import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, type SessionPayload } from "./auth";
import { unsignSession } from "./session";

export async function requireSession(): Promise<SessionPayload> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) throw new AuthError("No autenticado");
  const session = await unsignSession(token);
  if (!session) throw new AuthError("No autenticado");
  return session;
}

export class AuthError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Error interno";
  console.error("[developer]", error);
  return NextResponse.json({ error: message }, { status: 500 });
}
