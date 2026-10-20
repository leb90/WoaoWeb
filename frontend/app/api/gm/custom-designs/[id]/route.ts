import { NextResponse } from "next/server";
import {
    fetchApi,
    getSessionTokenFromCookie,
    proxyJsonResponse,
} from "../../../auth/shared";

// Acciones del staff sobre un pedido de diseño:
// { action: "in_progress" | "deliver" | "reject", objIndex?: number, note?: string }
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const token = await getSessionTokenFromCookie();

    if (!token) {
        return NextResponse.json(
            { error: "Tu sesion no es valida o ya vencio." },
            { status: 401 },
        );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const response = await fetchApi(
        `/gm/custom-designs/${encodeURIComponent(id)}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
            cache: "no-store",
        },
    );

    return proxyJsonResponse(response);
}
