import { NextResponse } from "next/server";
import {
    fetchApi,
    getSessionTokenFromCookie,
    proxyJsonResponse,
} from "../auth/shared";

// Pedidos de diseño personalizado del personaje seleccionado.
export async function GET() {
    const token = await getSessionTokenFromCookie();

    if (!token) {
        return NextResponse.json(
            { error: "Tu sesion no es valida o ya vencio." },
            { status: 401 },
        );
    }

    const response = await fetchApi("/custom-designs/mine", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    return proxyJsonResponse(response);
}

// Crea (y cobra) un pedido. El body puede traer la imagen de referencia como
// data URL (hasta 1 MB): se reenvia tal cual, sin parsearlo.
export async function POST(request: Request) {
    const token = await getSessionTokenFromCookie();

    if (!token) {
        return NextResponse.json(
            { error: "Tu sesion no es valida o ya vencio." },
            { status: 401 },
        );
    }

    const response = await fetchApi("/custom-designs", {
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
