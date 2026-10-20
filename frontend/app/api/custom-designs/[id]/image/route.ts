import { NextResponse } from "next/server";
import {
    fetchApi,
    getSessionTokenFromCookie,
    proxyJsonResponse,
} from "../../../auth/shared";

// Imagen de referencia de un pedido (la ve el dueño del pedido o el staff).
// Proxy binario: se devuelve el body tal cual con el Content-Type de la api.
export async function GET(
    _request: Request,
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
    const response = await fetchApi(
        `/custom-designs/${encodeURIComponent(id)}/image`,
        {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        },
    );

    if (!response.ok) {
        return proxyJsonResponse(response);
    }

    return new NextResponse(await response.arrayBuffer(), {
        status: 200,
        headers: {
            "Content-Type":
                response.headers.get("Content-Type") ?? "application/octet-stream",
            "Cache-Control": "private, max-age=3600",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
