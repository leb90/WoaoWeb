import { NextResponse } from "next/server";
import {
    fetchApi,
    getSessionTokenFromCookie,
    proxyJsonResponse,
} from "../../auth/shared";

// Listado de reportes de bugs para la página /bugs (solo GM).
// ?status=pending|in_progress|resolved|all
export async function GET(request: Request) {
    const token = await getSessionTokenFromCookie();

    if (!token) {
        return NextResponse.json(
            { error: "Tu sesion no es valida o ya vencio." },
            { status: 401 },
        );
    }

    const status = new URL(request.url).searchParams.get("status");
    const path = status
        ? `/gm/bug-reports?status=${encodeURIComponent(status)}`
        : "/gm/bug-reports";

    const response = await fetchApi(path, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    return proxyJsonResponse(response);
}
