import { NextResponse } from "next/server";
import {
    fetchApi,
    getSessionTokenFromCookie,
    proxyJsonResponse,
} from "../auth/shared";

export async function GET(request: Request) {
    const token = await getSessionTokenFromCookie();

    if (!token) {
        return NextResponse.json(
            { error: "Tu sesion no es valida o ya vencio." },
            { status: 401 },
        );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const path = status
        ? `/gm-tickets?status=${encodeURIComponent(status)}`
        : "/gm-tickets";

    const response = await fetchApi(path, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    return proxyJsonResponse(response);
}
