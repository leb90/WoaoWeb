import { NextResponse } from "next/server";
import { normalizeErrorPayload } from "../../../lib/api-errors";
import { fetchApi } from "../auth/shared";

// Quién está en la Arena ahora y el ranking por cuenta: es público, no hace falta la sesión.
export async function GET() {
    const response = await fetchApi("/arenas", { cache: "no-store" });
    const result = normalizeErrorPayload(await response.json());
    return NextResponse.json(result, { status: response.status });
}
