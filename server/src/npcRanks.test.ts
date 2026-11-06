import assert from "node:assert/strict";
import test from "node:test";
import { rollNpcRank, applyNpcRank, isNpcRankEligible, getRankedDropChance, refreshNpcRank } from "./npcRanks";
const base = {
    name: "Lobo",
    hostile: 1,
    attackable: 1,
    exp: 100,
    gold: 4,
    hp: 75,
    maxHp: 75,
    minHit: 10,
    maxHit: 20,
    npcType: 0,
    movement: 3,
};
test("los cortes de probabilidad eligen los cinco rangos", () => {
    for (const [roll, want] of [
        [0, "normal"],
        [0.96499, "normal"],
        [0.965, "mejorado"],
        [0.98, "lider"],
        [0.99, "especial"],
        [0.999, "legendario"],
    ] as const)
        assert.equal(
            rollNpcRank(() => roll),
            want,
        );
});
test("recargar una plantilla no acumula mejoras ni cura la vida perdida", () => {
    const npc: Record<string, any> = { hp: 75 };
    refreshNpcRank(npc, base as any, "legendario");
    assert.equal(npc.maxHp, 300);
    npc.hp = 100;
    refreshNpcRank(npc, base as any, "legendario");
    assert.equal(npc.hp, 100);
    assert.equal(npc.maxHp, 300);
    assert.equal(npc.npcRankBaseHp, 75);
    assert.equal(npc.exp, 700);
});
test("rango Líder mejora vida, daño y premios sin mutar su plantilla", () => {
    const next = applyNpcRank(base, "lider");
    assert.equal(next.maxHp, 150);
    assert.equal(next.hp, 150);
    assert.equal(next.exp, 300);
    assert.equal(next.gold, 12);
    assert.equal(next.maxHit, 28);
    assert.equal(next.npcRankDamageMultiplier, 1.4);
    assert.match(next.name, /Líder/);
    assert.equal(base.maxHp, 75);
    assert.deepEqual(applyNpcRank(base, "lider"), next);
});
test("no mejora comerciantes, principiantes, zonas seguras, jefes ni invocaciones", () => {
    assert.equal(isNpcRankEligible(base, { templateNpcIndex: 501 }, {}), true);
    for (const context of [{ safe: true }, { newbie: true }, { special: true }])
        assert.equal(isNpcRankEligible(base, { templateNpcIndex: 501 }, context), false);
    for (const npc of [
        { templateNpcIndex: 585 },
        { templateNpcIndex: 501, summonedByUserId: "a" },
        { templateNpcIndex: 501, ephemeralSummon: 1 },
    ])
        assert.equal(isNpcRankEligible(base, npc, {}), false);
    assert.equal(isNpcRankEligible({ ...base, comercia: 1 }, { templateNpcIndex: 501 }, {}), false);
});
test("drop de rango y equipo se combinan una sola vez con tope 100", () => {
    assert.equal(getRankedDropChance(10, "lider", 50), 22.5);
    assert.equal(getRankedDropChance(80, "legendario", 50), 100);
    assert.equal(getRankedDropChance(0, "legendario", 50), 0);
});
