import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
test("Dungeon Dragon no contiene apariciones sin plantilla ni reintroduce el NPC 570 eliminado del original", () => {
    const root = path.resolve(__dirname, "../..");
    const templates = require("../jsons/npcs.json");
    for (const base of ["server/mapas_source", "api/src/mapas_source"]) {
        const folder = path.join(root, base, "mapa_159");
        const npcs = JSON.parse(fs.readFileSync(path.join(folder, "npcs.json"), "utf8"));
        for (const npc of npcs) assert.ok(templates[npc.npcIndex], `${base}: NPC ${npc.npcIndex} sin plantilla`);
        const specials = JSON.parse(fs.readFileSync(path.join(folder, "specials.json"), "utf8"));
        for (const id of Object.values(specials.npcs ?? {}))
            assert.ok(templates[String(id)], `${base}: special ${id} sin plantilla`);
    }
});
