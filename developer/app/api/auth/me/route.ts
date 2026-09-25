import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";

export async function GET() {
  try {
    const session = await requireSession();
    return NextResponse.json({
      username: session.username,
      adminId: session.adminId,
    });
  } catch (error) {
    return jsonError(error);
  }
}
