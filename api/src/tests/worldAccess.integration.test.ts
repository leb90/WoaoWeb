import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { afterAll, beforeAll, describe, test } from "vitest";
import { WORLD_CLOSED_MESSAGE } from "../lib/worldAccess";
import {
    API_URL,
    consumeGameTicket,
    createAccountFixture,
    createCharacter,
    createCharacterFixture,
    createWorldGameTicket,
    ensureApiReady,
    selectCharacter,
    uniqueLetters,
} from "./helpers/api";

// Segunda API con el mundo cerrado, sobre la misma base que la de los fixtures:
// así las cuentas ya tienen personaje y sesión de antes del cierre, como en producción.
const CLOSED_PORT = 3199;
const CLOSED_API = `http://127.0.0.1:${CLOSED_PORT}`;
const ALLOWED_NAME = `Ok ${uniqueLetters(10)}`;
const ALLOWED_EMAIL = `ok-${Date.now()}@local.test`;

let closedApi: ChildProcess;

const closedRequest = async (
    route: string,
    token: string,
    body?: unknown,
    baseUrl = CLOSED_API,
) => {
    const response = await fetch(`${baseUrl}${route}`, {
        method: body === undefined ? "GET" : "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
        status: response.status,
        data: (await response.json()) as {
            error?: string;
            ticket?: string;
            worldAccess?: boolean;
        },
    };
};

const accountWithCharacter = async (options: {
    name?: string;
    email?: string;
}) => {
    const account = await createAccountFixture(options);
    const token = account.session.sessionToken;
    const created = await createCharacter(
        token,
        `Tick ${uniqueLetters(6)}`,
    );
    const characterId = created.characters[0]._id;
    await selectCharacter(token, characterId);
    return { token, characterId };
};

beforeAll(async () => {
    await ensureApiReady();

    closedApi = spawn(
        path.join(process.cwd(), "node_modules/.bin/tsx"),
        ["src/server.ts"],
        {
            env: {
                ...process.env,
                PORT: String(CLOSED_PORT),
                WORLD_ACCESS_ALLOWLIST: `${ALLOWED_NAME},${ALLOWED_EMAIL}`,
            },
            stdio: "ignore",
        },
    );

    for (let attempt = 0; attempt < 100; attempt += 1) {
        const healthy = await fetch(`${CLOSED_API}/health`)
            .then((response) => response.ok)
            .catch(() => false);
        if (healthy) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
    throw new Error("La API con el mundo cerrado no levantó");
});

afterAll(() => {
    closedApi?.kill();
});

describe("con el mundo cerrado", () => {
    test("una cuenta fuera de la lista no elige ni crea personajes, ni entra al mundo", async () => {
        const { token, characterId } = await accountWithCharacter({});

        const session = await closedRequest("/auth/me", token);
        assert.equal(session.status, 200);
        assert.equal(session.data.worldAccess, false);

        const ticket = await closedRequest("/auth/game-ticket", token, {});
        assert.equal(ticket.status, 403);
        assert.equal(ticket.data.error, WORLD_CLOSED_MESSAGE);

        const selected = await closedRequest("/auth/select-character", token, {
            characterId,
        });
        assert.equal(selected.status, 403);
        assert.equal(selected.data.error, WORLD_CLOSED_MESSAGE);

        const created = await closedRequest("/auth/create-character", token, {
            name: `Nuevo ${uniqueLetters(6)}`,
            class: "guerrero",
            race: "humano",
            gender: "male",
            headId: 3,
        });
        assert.equal(created.status, 403);
        assert.equal(created.data.error, WORLD_CLOSED_MESSAGE);
    });

    test("esa misma cuenta sigue pudiendo jugar en las arenas", async () => {
        const { token } = await accountWithCharacter({});

        const arena = await closedRequest("/arenas/ticket", token, {
            idClase: 22,
        });
        assert.equal(arena.status, 200);
        assert.ok(arena.data.ticket);

        const consumed = await consumeGameTicket(
            arena.data.ticket as string,
            "127.0.0.1",
        );
        assert.equal(consumed.status, 200);
        assert.equal((consumed.data as { mode?: string }).mode, "arena");
    });

    test.each([
        ["por nombre, sin importar mayúsculas", { name: ALLOWED_NAME.toUpperCase() }],
        ["por email", { email: ALLOWED_EMAIL }],
    ])("una cuenta de la lista entra normalmente: %s", async (_label, identity) => {
        const { token, characterId } = await accountWithCharacter(identity);

        const session = await closedRequest("/auth/me", token);
        assert.equal(session.data.worldAccess, true);

        const selected = await closedRequest("/auth/select-character", token, {
            characterId,
        });
        assert.equal(selected.status, 200);

        const ticket = await closedRequest("/auth/game-ticket", token, {});
        assert.equal(ticket.status, 200);

        const consumed = await consumeGameTicket(
            ticket.data.ticket as string,
            "127.0.0.1",
        );
        assert.equal(consumed.status, 200);
        assert.equal(
            (consumed.data as { character?: { _id: string } }).character?._id,
            characterId,
        );
    });
});

describe("sin la variable (local, tests)", () => {
    test("cualquier cuenta usa personajes y entra al mundo", async () => {
        const owner = await createCharacterFixture({ namePrefix: "Open" });

        const session = await closedRequest(
            "/auth/me",
            owner.sessionToken,
            undefined,
            API_URL,
        );
        assert.equal(session.data.worldAccess, true);

        const ticket = await createWorldGameTicket(owner.sessionToken);
        assert.equal(ticket.status, 200);
    });
});
