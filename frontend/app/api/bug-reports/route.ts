import { NextResponse } from "next/server";
import {
    fetchApi,
    getSessionTokenFromCookie,
    proxyJsonResponse,
} from "../auth/shared";

// Reporte de bug que manda el jugador desde el juego (components/BugReportModal.tsx).
// La API toma la cuenta y el personaje de la sesión; el body trae el texto y dónde estaba.
export async function POST(request: Request) {
    const token = await getSessionTokenFromCookie();

    if (!token) {
        return NextResponse.json(
            { error: "Tu sesión venció. Volvé a entrar para reportar." },
            { status: 401 },
        );
    }

    const response = await fetchApi("/bug-reports", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: await request.text(),
        cache: "no-store",
    });

    return proxyJsonResponse(response);
}
