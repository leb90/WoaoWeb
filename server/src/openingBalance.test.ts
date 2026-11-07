import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
const quests = require("../jsons/quests.json");
const npcs = require("../jsons/npcs.json");
test("misiones iniciales siguen accesibles y las avanzadas exigen su tramo de nivel", () => {
    for (const [id, level] of [
        [1, 1],
        [2, 10],
        [3, 25],
        [6, 30],
        [7, 40],
        [16, 45],
        [19, 1],
        [24, 40],
        [36, 15],
    ])
        assert.equal(quests[id].requiredLevel, level);
    assert.equal(quests[1].rewardExp, 5000);
    assert.equal(quests[2].rewardExp, 5960);
    assert.equal(quests[36].rewardExp, 21000);
});
test("los tres materiales de clan tienen probabilidades explícitas y fuentes en mapas", () => {
    const placements = fs
        .readdirSync(path.resolve(__dirname, "../mapas_source"), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .flatMap((d) => {
            const f = path.resolve(__dirname, "../mapas_source", d.name, "npcs.json");
            if (!fs.existsSync(f)) return [];
            return Object.values(JSON.parse(fs.readFileSync(f, "utf8"))) as { npcIndex: number }[];
        });
    for (const [npc, item, chance] of [
        [739, 1095, 5],
        [754, 1095, 10],
        [761, 1096, 5],
        [726, 1096, 10],
        [585, 1241, 5],
        [726, 1241, 5],
    ]) {
        const drop = npcs[npc].drop.find((d: { item: number }) => d.item === item);
        assert.equal(drop?.chancePercent, chance);
        assert.equal(drop?.cant, 1);
        if (npc === 726) {
            const boss = require("./bossEvents")
                .getSnapshot()
                .find((b: { npcIndex: number }) => b.npcIndex === 726);
            assert.equal(boss?.map, 279);
        } else if (npc === 585) {
            assert.equal(typeof require("./summonRoom").onNpcDied, "function");
        } else
            assert.ok(
                placements.some((p) => Number(p.npcIndex) === npc),
                `NPC ${npc} debe tener una aparición`,
            );
    }
});
