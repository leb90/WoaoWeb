import { NextResponse } from "next/server";
import {
    fetchApi,
    getSessionTokenFromCookie,
    proxyJsonResponse,
} from "../../../auth/shared";

type RouteContext = { params: Promise<{ id: string }> };

function unauthorized() {
    return NextResponse.json(
        { error: "Tu sesion no es valida o ya vencio." },
        { status: 401 },
    );
}

// Cambia el estado de un reporte: { status: "pending" | "in_progress" | "resolved" }.
export async function PATCH(request: Request, { params }: RouteContext) {
    const token = await getSessionTokenFromCookie();

    if (!token) {
        return unauthorized();
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const response = await fetchApi(`/gm/bug-reports/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    return proxyJsonResponse(response);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
    const token = await getSessionTokenFromCookie();

    if (!token) {
        return unauthorized();
    }

    const { id } = await params;

    const response = await fetchApi(`/gm/bug-reports/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    return proxyJsonResponse(response);
}
