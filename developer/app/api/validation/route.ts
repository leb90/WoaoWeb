import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { runBasicValidation } from "@/lib/validation/rules";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    const issues = runBasicValidation();
    return NextResponse.json({
      issues,
      counts: {
        error: issues.filter((i) => i.severity === "ERROR").length,
        warning: issues.filter((i) => i.severity === "WARNING").length,
        info: issues.filter((i) => i.severity === "INFO").length,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
