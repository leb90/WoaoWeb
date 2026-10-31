import { forwardArenaRequest } from "../shared";

export async function POST(request: Request) {
    const body = await request.json();

    return forwardArenaRequest("/arenas/ticket", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
}
