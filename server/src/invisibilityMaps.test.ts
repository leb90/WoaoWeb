import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");
const SOURCES = ["server/mapas_source", "api/src/mapas_source"];

// Mapas donde no se puede estar invisible: hechizo, Capa Hobbit ni Ocultarse.
const BLOCKED_MAPS = [
    92, 115, 164, 182, 194, 279, 303,
    ...Array.from({ length: 16 }, (_, i) => 200 + i), // 200-215: bosques y mares de evento y torneo
    ...Array.from({ length: 10 }, (_, i) => 251 + i), // 251-260: Conquista
    ...Array.from({ length: 5 }, (_, i) => 291 + i), // 291-295: torneos
];

function readMeta(base: string, mapId: number) {
    return JSON.parse(fs.readFileSync(path.join(root, base, `mapa_${mapId}`, "meta.json"), "utf8"));
}

test("los mapas de evento, torneo, conquista y sala de clan bloquean la invisibilidad", () => {
    for (const base of SOURCES) {
        for (const mapId of BLOCKED_MAPS) {
            assert.equal(readMeta(base, mapId).sinInviOcul, 1, `${base}: mapa ${mapId}`);
        }
        assert.ok(!readMeta(base, 1).sinInviOcul, `${base}: Ullathorpe permite invisibilidad`);
    }
});

test("isInvisibilityBlockedMap lee la marca sinInviOcul del mapa", () => {
    const vars = require("./vars");
    const safeZone = require("./safeZone");
    const previous = { a: vars.mapData[9001], b: vars.mapData[9002] };
    vars.mapData[9001] = { sinInviOcul: 1 };
    vars.mapData[9002] = { sinInviOcul: 0 };
    try {
        assert.equal(safeZone.isInvisibilityBlockedMap(9001), true);
        assert.equal(safeZone.isInvisibilityBlockedMap(9002), false);
        assert.equal(safeZone.isInvisibilityBlockedMap(undefined), false);
    } finally {
        vars.mapData[9001] = previous.a;
        vars.mapData[9002] = previous.b;
    }
});

test("Detectar invisibilidad ya no existe ni se vende", () => {
    for (const base of ["server/jsons", "api/src/jsons", "frontend/public/init"]) {
        const spells = JSON.parse(fs.readFileSync(path.join(root, base, "spells.json"), "utf8"));
        assert.equal(spells["55"], undefined, `${base}: hechizo 55`);
        for (const [id, spell] of Object.entries<any>(spells)) {
            assert.notEqual(Number(spell.remueveInvisibilidadParcial ?? 0), 1, `${base}: hechizo ${id}`);
        }
    }

    const objs = require("../jsons/objs.json");
    const spells = require("../jsons/spells.json");
    const npcs = require("../jsons/npcs.json");
    for (const [id, npc] of Object.entries<any>(npcs)) {
        for (const entry of Array.isArray(npc.objs) ? npc.objs : []) {
            const spellIndex = Number(objs[String(entry.item)]?.spellIndex ?? 0);
            if (spellIndex > 0) {
                assert.ok(spells[String(spellIndex)], `NPC ${id} vende el objeto ${entry.item}, que enseña un hechizo inexistente`);
            }
        }
    }
});
