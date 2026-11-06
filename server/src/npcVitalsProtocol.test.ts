import assert from "node:assert/strict";
import test from "node:test";
const { parseServerPacket } = require("../../frontend/lib/aowProtocol");
const protocol = require("./handleProtocol"),
    pkg = require("./package"),
    socket = require("./socket");
const decode = (b: Buffer) =>
    parseServerPacket(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
test("la vida de un NPC legendario conserva valores mayores a 65535 en snapshot y delta", () => {
    protocol.sendNpc({
        id: 123,
        nameCharacter: "Dragón · Legendario",
        map: 7,
        pos: { x: 50, y: 50 },
        hp: 100000,
        maxHp: 200000,
    });
    const packet = decode(pkg.dataSend());
    assert.equal(packet.type, "getNpc");
    if (packet.type === "getNpc") {
        assert.equal(packet.payload.hp, 100000);
        assert.equal(packet.payload.maxHp, 200000);
    }
    const original = socket.send;
    let decoded: any;
    socket.send = () => {
        decoded = decode(pkg.dataSend());
    };
    try {
        protocol.entityVitalsDelta(123, 90000, 200000, 0, 0, {});
        assert.equal(decoded.payload.hp, 90000);
        assert.equal(decoded.payload.maxHp, 200000);
    } finally {
        socket.send = original;
    }
});
