import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getNpcSpellEffect, isNpcOffensiveSpell, shouldSkipNpcSpellForTarget } from "./npcSpellLogic";

const spells = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../jsons/spells.json"), "utf8")) as Record<
    string,
    Record<string, unknown>
>;
const fireDemon = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../jsons/npcs.json"), "utf8")) as Record<
    string,
    { spells?: Array<{ idSpell: number }> }
>;

const fireDemonSpellIds = fireDemon["585"]?.spells?.map((spell) => spell.idSpell);

assert.deepEqual(fireDemonSpellIds, [45, 46, 51, 31, 9]);
assert.deepEqual(
    fireDemonSpellIds?.map((id) => getNpcSpellEffect(spells[String(id)] as never)),
    ["damage", "envenena", "damage", "estupidez", "paraliza"],
);

for (const spellId of fireDemonSpellIds ?? []) {
    assert.equal(isNpcOffensiveSpell(spells[String(spellId)] as never), true);
}

assert.equal(shouldSkipNpcSpellForTarget(spells["46"] as never, {}), false);
assert.equal(shouldSkipNpcSpellForTarget(spells["46"] as never, { envenenado: 15 }), true);
assert.equal(shouldSkipNpcSpellForTarget(spells["31"] as never, { idClase: 6 }), true);
assert.equal(shouldSkipNpcSpellForTarget(spells["31"] as never, { mounted: 1 }), true);
assert.equal(shouldSkipNpcSpellForTarget(spells["9"] as never, { paralizado: 1 }), true);

console.log("npcSpellLogic.test.ts: OK");
