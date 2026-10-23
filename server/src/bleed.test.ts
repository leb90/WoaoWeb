// Apuñalada y desangrado entre jugadores (game.ts: apuUser, processBleedTick).
//   npx tsx --test src/bleed.test.ts
import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

const vars = require("./vars");
const funct = require("./functions");
const { loadObjectsDataFromJsonFile } = require("./objectData");
const { applyBalanceDataToVars, createDefaultBalanceData } = require("./balanceData");
vars.datObj = loadObjectsDataFromJsonFile(path.resolve(__dirname, "../jsons/objs.json"));
applyBalanceDataToVars(vars, createDefaultBalanceData());
const game = require("./game");

function makeUser(idClase: number, heading: number) {
    const user: Record<string, any> = {
        id: `bleed-${Math.random()}`, nameCharacter: "Prueba", idClase, idRaza: 1, level: 50, heading,
        map: 1, pos: { x: 50, y: 50 }, hp: 500, maxHp: 500, mana: 0, maxMana: 0, inv: {}, skills: Array(31).fill(100),
        idItemWeapon: 0, idItemBody: 0, idItemHelmet: 0, idItemShield: 0, idItemRing: 0, zonaSegura: 0,
    };
    vars.personajes[user.id] = user;
    return user;
}

// Fuerza la tirada de la apuñalada (el asesino acierta con 1 a 4).
function withStabRoll<T>(roll: number, run: () => T): T {
    const original = funct.randomIntFromInterval;
    funct.randomIntFromInterval = () => roll;
    try {
        return run();
    } finally {
        funct.randomIntFromInterval = original;
    }
}

test("la apuñalada por la espalda suma solo un 10 % y abre el desangrado con el daño del golpe", () => {
    const assassin = makeUser(vars.clases.asesino, 1);
    const target = makeUser(vars.clases.mago, 1);
    const result = withStabRoll(1, () => game.apuUser(assassin.id, target.id, 200));
    assert.equal(result.stabbed, true);
    assert.equal(result.extraDamage, 20);
    assert.equal(result.totalDamage, 220);
    assert.equal(result.bleedDamage, 200);
    assert.equal(target.hp, 480);
});

test("las otras clases apuñalan como siempre: doble por la espalda y sin desangrado", () => {
    const bard = makeUser(vars.clases.bardo, 1);
    const target = makeUser(vars.clases.mago, 1);
    const result = withStabRoll(2, () => game.apuUser(bard.id, target.id, 200));
    assert.equal(result.stabbed, true);
    assert.equal(result.totalDamage, 400);
    assert.equal(result.bleedDamage, 0);
});

test("de frente la apuñalada no sangra ni suma daño", () => {
    const assassin = makeUser(vars.clases.asesino, 1);
    const target = makeUser(vars.clases.mago, 2);
    const result = withStabRoll(1, () => game.apuUser(assassin.id, target.id, 200));
    assert.equal(result.stabbed, true);
    assert.equal(result.extraDamage, 0);
    assert.equal(result.bleedDamage, 0);
});

test("el desangrado pega cada 2 segundos durante 10 y curarse no lo corta", () => {
    const assassin = makeUser(vars.clases.asesino, 1);
    const target = makeUser(vars.clases.mago, 1);
    target.hp = 1000;
    target.maxHp = 1000;
    const start = 1_000_000;
    target.bleed = { attackerId: assassin.id, tickDamage: 100, endsAt: start + 10000, nextTickAt: start + 2000 };

    game.processBleedTick(start + 1999);
    assert.equal(target.hp, 1000);
    game.processBleedTick(start + 2000);
    assert.equal(target.hp, 900);
    // Se cura: el desangrado sigue.
    target.hp = 1000;
    game.processBleedTick(start + 4000);
    assert.equal(target.hp, 900);
    // Si el tick se atrasa, aplica los que faltaron.
    game.processBleedTick(start + 8000);
    assert.equal(target.hp, 700);
    game.processBleedTick(start + 10000);
    assert.equal(target.hp, 600);
    assert.equal(target.bleed, null);
    game.processBleedTick(start + 12000);
    assert.equal(target.hp, 600);
});

test("en zona segura la herida deja de sangrar", () => {
    const assassin = makeUser(vars.clases.asesino, 1);
    const target = makeUser(vars.clases.mago, 1);
    const start = 2_000_000;
    target.bleed = { attackerId: assassin.id, tickDamage: 100, endsAt: start + 10000, nextTickAt: start + 2000 };
    target.zonaSegura = 1;
    game.processBleedTick(start + 2000);
    assert.equal(target.hp, 500);
    assert.equal(target.bleed, null);
});
