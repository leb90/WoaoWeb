// Efectos del Chamán elemental (elementalEffects.ts).
//   npx tsx --test src/elementalEffects.test.ts
import assert from "node:assert/strict";
import test from "node:test";

const effects = require("./elementalEffects") as typeof import("./elementalEffects");

type Holder = { elemental?: import("./elementalEffects").ElementalState | null };

test("escudos propios: uno a la vez, el físico frena golpes y el mágico magia y elemental", () => {
    const now = 1_000_000;
    const user: Holder = {};
    effects.setSelfShield(user, "fisico", now);
    assert.equal(effects.applyShieldReduction(user, 100, "melee", now), 50);
    assert.equal(effects.applyShieldReduction(user, 100, "ranged", now), 50);
    assert.equal(effects.applyShieldReduction(user, 100, "magic", now), 100);

    // Tirar otro escudo reemplaza al anterior.
    effects.setSelfShield(user, "magico", now);
    assert.equal(effects.applyShieldReduction(user, 100, "melee", now), 100);
    assert.equal(effects.applyShieldReduction(user, 100, "magic", now), 50);
    assert.equal(effects.applyShieldReduction(user, 100, "elemental", now), 50);

    // El mágico y el físico duran 10 s.
    assert.equal(effects.applyShieldReduction(user, 100, "magic", now + 9_999), 50);
    assert.equal(effects.applyShieldReduction(user, 100, "magic", now + 10_001), 100);
});

test("escudos para aliados: 5 % cada uno, se suman al propio y duran 60 s", () => {
    const now = 2_000_000;
    const user: Holder = {};
    effects.setAllyShield(user, "magico", now);
    effects.setAllyShield(user, "fisico", now);
    assert.equal(effects.applyShieldReduction(user, 100, "melee", now), 95);
    assert.equal(effects.applyShieldReduction(user, 100, "elemental", now), 95);
    effects.setSelfShield(user, "magico", now);
    assert.equal(effects.applyShieldReduction(user, 100, "magic", now), 45);
    assert.equal(effects.applyShieldReduction(user, 100, "melee", now + effects.ALLY_SHIELD_MS + 1), 100);
});

test("Evasión de viento: 90 % de esquiva, no deja atacar ni hacerse invisible y se recarga en 30 s", () => {
    const now = 3_000_000;
    const user: Holder = {};
    assert.equal(effects.startWindEvasion(user, now), 0);
    assert.equal(effects.rollWindEvasion(user, now, () => 0.89), true);
    assert.equal(effects.rollWindEvasion(user, now, () => 0.91), false);
    assert.ok(effects.getActionBlockReason(user, "melee", now));
    assert.ok(effects.getActionBlockReason(user, "spell", now));
    assert.equal(effects.getActionBlockReason(user, "support", now), null);
    assert.equal(effects.canBecomeInvisible(user, now), false);

    // Termina a los 10 s, pero no se puede volver a usar hasta los 30 s.
    const later = now + effects.WIND_EVASION_MS + 1;
    assert.equal(effects.rollWindEvasion(user, later, () => 0), false);
    assert.equal(effects.canBecomeInvisible(user, later), true);
    assert.ok(effects.startWindEvasion(user, later) > 0);
    assert.equal(effects.startWindEvasion(user, now + effects.WIND_EVASION_COOLDOWN_MS), 0);
});

test("Rayo Eléctrico: el silencio total no se acumula y deja 1 s de respiro al terminar", () => {
    const now = 4_000_000;
    const user: Holder = {};
    assert.equal(effects.applyFullSilence(user, 3000, now, 1000), "applied");
    assert.ok(effects.getActionBlockReason(user, "melee", now + 100));
    assert.ok(effects.getActionBlockReason(user, "support", now + 100));
    // Mientras dura no se renueva.
    assert.equal(effects.applyFullSilence(user, 3000, now + 2000, 1000), "active");
    assert.equal(effects.getActionBlockReason(user, "melee", now + 3001), null);
    // Respiro de 1 s después de terminar.
    assert.equal(effects.applyFullSilence(user, 3000, now + 3500, 1000), "immune");
    assert.equal(effects.applyFullSilence(user, 3000, now + 4001, 1000), "applied");
});

test("silencio de magia: no deja lanzar hechizos pero sí golpear", () => {
    const now = 5_000_000;
    const user: Holder = {};
    effects.applyMagicSilence(user, 4000, now);
    assert.ok(effects.getActionBlockReason(user, "spell", now));
    assert.ok(effects.getActionBlockReason(user, "support", now));
    assert.equal(effects.getActionBlockReason(user, "melee", now), null);
    assert.equal(effects.getActionBlockReason(user, "spell", now + 4001), null);
});

test("lentitud: cada paso tarda el doble durante 6 s", () => {
    const now = 6_000_000;
    const user: Holder = {};
    assert.equal(effects.getWalkStepMultiplier(user, now), 1);
    effects.applySlow(user, 6000, now);
    assert.equal(effects.getWalkStepMultiplier(user, now + 5999), effects.SLOW_WALK_MULTIPLIER);
    assert.equal(effects.getWalkStepMultiplier(user, now + 6001), 1);
});

test("vencimientos, quemadura y muerte", () => {
    const now = 7_000_000;
    const user: Holder = {};
    effects.setSelfShield(user, "energia", now);
    effects.rememberTarget(user, 42, true, now);
    effects.startBurn(user, 10, 7, now);
    assert.equal(effects.buildPayload(user, now).burning, true);
    assert.deepEqual(effects.getStoneTarget(user, now), { id: 42, isNpc: true, at: now });

    // El de energía dura 30 s.
    assert.equal(effects.getSelfShield(user, now + 29_000), "energia");
    const energyEnd = now + effects.SELF_SHIELD_DURATION_MS.energia + 1;
    assert.equal(effects.expire(user, energyEnd), true);
    assert.equal(effects.getSelfShield(user, energyEnd), null);
    assert.equal(effects.getStoneTarget(user, energyEnd), null);

    assert.equal(effects.stopBurn(user), true);
    effects.startWindEvasion(user, now);
    effects.clearOnDeath(user);
    assert.equal(effects.hasVisibleEffects(user, now), false);
    // El enfriamiento de la evasión sobrevive a la muerte.
    assert.ok(effects.startWindEvasion(user, now + 1000) > 0);
});

test("clasificación de hechizos", () => {
    assert.equal(effects.isElementalSpell({ elemental: 1 }), true);
    assert.equal(effects.isElementalSpell({}), false);
    assert.equal(effects.isSelfOnlySpell({ escudoPropio: "magico" }), true);
    assert.equal(effects.isSelfOnlySpell({ evasionViento: 1 }), true);
    assert.equal(effects.isSelfOnlySpell({ escudoAliado: "magico" }), false);
    assert.equal(effects.hasHostileElementalEffect({ silencioTotal: 3000 }), true);
    assert.equal(effects.hasSupportElementalEffect({ curaEfectos: 1 }), true);
});
