import { NextResponse } from "next/server";
import { forwardSessionJsonRequest } from "../shared";

export async function DELETE(request: Request) {
    let characterId = "";

    try {
        const body = (await request.json()) as { characterId?: unknown };
        if (typeof body.characterId === "string") {
            characterId = body.characterId.trim();
        }
    } catch {
        characterId = "";
    }

    if (!characterId) {
        return NextResponse.json(
            { error: "characterId es requerido" },
            { status: 400 },
        );
    }

    return forwardSessionJsonRequest(
        `/auth/characters/${encodeURIComponent(characterId)}`,
        {
            method: "DELETE",
        },
        request,
    );
}
