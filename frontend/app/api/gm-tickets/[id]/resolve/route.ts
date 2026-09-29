import { NextResponse } from "next/server";
import {
    fetchApi,
    getSessionTokenFromCookie,
    proxyJsonResponse,
} from "../../../auth/shared";

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
    const body = await request.json();

    const response = await fetchApi(
        `/gm-tickets/${encodeURIComponent(id)}/resolve`,
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
