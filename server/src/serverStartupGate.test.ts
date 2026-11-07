import assert from "node:assert/strict";
import test from "node:test";
import { once } from "node:events";
const { WebSocket, WebSocketServer } = require("ws");
test("un cliente que entra durante el arranque recibe cierre reintentable y puede entrar cuando carga el mundo", async () => {
    const { acceptGameMessage } = require("./serverStartupGate");
    let ready = false;
    const server = new WebSocketServer({ port: 0 });
    await once(server, "listening");
    server.on("connection", (ws: any) =>
        ws.on("message", () => {
            if (acceptGameMessage(ws, ready)) ws.send("mundo listo");
        }),
    );
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const url = `ws://127.0.0.1:${address.port}`;
    const first = new WebSocket(url);
    await once(first, "open");
    const closed = once(first, "close");
    first.send("login");
    assert.equal((await closed)[0], 1013);
    ready = true;
    const second = new WebSocket(url);
    await once(second, "open");
    const message = once(second, "message");
    second.send("login");
    assert.equal(String((await message)[0]), "mundo listo");
    second.close();
    await once(second, "close");
    await new Promise<void>((resolve) => server.close(() => resolve()));
});
