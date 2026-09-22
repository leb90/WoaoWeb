/**
 * Temporary helper: connect 4 summon-room characters and keep them online.
 * Usage: npx tsx scripts/connectSummonRoom.ts
 */
import WebSocket from "ws";

const API = "http://127.0.0.1:3001";
const WS_URL = "ws://127.0.0.1:7666";
const PASSWORD = "TestSummon1!";

const PLAYERS = [
    { email: "summon@local.test", name: "InvoAlpha" },
    { email: "summon2@local.test", name: "InvoBeta" },
    { email: "summon3@local.test", name: "InvoGamma" },
    { email: "summon4@local.test", name: "InvoDelta" },
];

function writeByte(bytes: number[], value: number) {
    bytes.push(value & 0xff);
}

function writeShort(bytes: number[], value: number) {
    bytes.push(value & 0xff, (value >> 8) & 0xff);
}

function writeString(bytes: number[], value: string) {
    const encoded = Buffer.from(value, "utf8");
    writeShort(bytes, Array.from(value).length);
    for (const b of encoded) bytes.push(b);
}

function createConnectCharacterPacket(ticket: string): Buffer {
    const bytes: number[] = [];
    writeByte(bytes, 212); // connectCharacter
    writeString(bytes, ticket.trim());
    writeByte(bytes, 1); // typeGame
    writeByte(bytes, 0); // idChar
    return Buffer.from(bytes);
}

async function apiJson(path: string, init?: RequestInit) {
    const res = await fetch(`${API}${path}`, init);
    const data = await res.json();
    if (!res.ok) throw new Error(`${path} -> ${res.status} ${JSON.stringify(data)}`);
    return data as any;
}

async function loginAndTicket(email: string, characterName: string) {
    const login = await apiJson("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password: PASSWORD }),
    });

    const character = (login.characters || []).find(
        (c: any) => String(c.name).toLowerCase() === characterName.toLowerCase(),
    );
    if (!character) throw new Error(`Character ${characterName} not found for ${email}`);

    await apiJson("/auth/select-character", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${login.sessionToken}`,
        },
        body: JSON.stringify({ characterId: character._id || character.id }),
    });

    const ticketRes = await apiJson("/auth/game-ticket", {
        method: "POST",
        headers: { Authorization: `Bearer ${login.sessionToken}` },
    });

    return { ticket: ticketRes.ticket as string, characterName };
}

function connectWs(ticket: string, characterName: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(WS_URL);
        const timer = setTimeout(() => reject(new Error(`timeout connecting ${characterName}`)), 15000);

        ws.on("open", () => {
            ws.send(createConnectCharacterPacket(ticket));
        });

        ws.on("message", () => {
            // First game packet means we are in.
            clearTimeout(timer);
            resolve(ws);
        });

        ws.on("error", (err) => {
            clearTimeout(timer);
            reject(err);
        });

        ws.on("close", () => {
            console.log(`[close] ${characterName}`);
        });
    });
}

async function main() {
    const sockets: WebSocket[] = [];

    for (const player of PLAYERS) {
        console.log(`Logging ${player.name}...`);
        const { ticket } = await loginAndTicket(player.email, player.name);
        const ws = await connectWs(ticket, player.name);
        sockets.push(ws);
        console.log(`Connected ${player.name}`);
        await new Promise((r) => setTimeout(r, 400));
    }

    for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const snap = await fetch("http://127.0.0.1:7666/debug/summon-room").then((r) => r.json());
        const occupied = snap.triggers.filter((t: any) => t.user).length;
        const demons = snap.demons || [];
        console.log(
            `tick ${i + 1}: triggers=${occupied}/4 activeNpc=${snap.activeNpcId} demons=${demons.length}`,
            demons.map((d: any) => `${d.name}@${d.pos?.x},${d.pos?.y} hp=${d.hp}`).join(" | "),
        );
        if (snap.activeNpcId || demons.some((d: any) => Number(d.hp) > 0)) {
            console.log("SUCCESS: demon spawned");
            console.log(JSON.stringify(snap, null, 2));
            break;
        }
    }

    console.log("Keeping connections open 60s for browser inspection...");
    await new Promise((r) => setTimeout(r, 60000));
    for (const ws of sockets) ws.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
