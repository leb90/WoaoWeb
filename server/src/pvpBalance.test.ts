// Núcleo del balance PvP (docs/balance/BALANCE_PVP.md): sets de tier, vida y maná con equipo y factores
// que solo se aplican contra jugadores. Corre con el motor real en memoria, sin server ni base.
//   npx tsx --test src/pvpBalance.test.ts
import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

const vars = require("./vars");
const { loadObjectsDataFromJsonFile } = require("./objectData");
const { applyBalanceDataToVars, createDefaultBalanceData } = require("./balanceData");
vars.datObj = loadObjectsDataFromJsonFile(path.resolve(__dirname, "../jsons/objs.json"));
applyBalanceDataToVars(vars, createDefaultBalanceData());
const game = require("./game");
const tierSets = require("./tierSets");
const { getEquippedNpcGoldBonusPct } = require("./equipmentRewardBonuses");

// Set del Verdugo (guerrero): espada, armadura, yelmo y escudo.
const WARRIOR_SET = { weapon: 1770, body: 1772, helmet: 1769, shield: 1771 };

function makeWarrior(gear: Partial<Record<"weapon" | "body" | "helmet" | "shield" | "ring", number>>) {
    const inv: Record<string, { idItem: number; amount: number; equipped: number }> = {};
    const slots: Record<string, number> = {};
    let slot = 22;
    for (const [kind, idItem] of Object.entries(gear)) {
        inv[String(slot)] = { idItem: Number(idItem), amount: 1, equipped: 1 };
        slots[kind] = slot++;
    }
    const user: Record<string, any> = {
        id: `test-${Math.random()}`, idClase: 3, idRaza: 1, level: 50,
        attrFuerza: 30, attrAgilidad: 30, attrInteligencia: 18, attrConstitucion: 20,
        minHit: 100, maxHit: 100, hp: 535, maxHp: 535, mana: 0, maxMana: 0, inv,
        idItemWeapon: slots.weapon ?? 0, idItemBody: slots.body ?? 0, idItemHelmet: slots.helmet ?? 0,
        idItemShield: slots.shield ?? 0, idItemRing: slots.ring ?? 0,
    };
    vars.personajes[user.id] = user;
    return user;
}

test("el set cuenta lugares distintos y da el escalón alcanzado", () => {
    assert.equal(tierSets.getEquippedSetBonus([WARRIOR_SET.weapon]).hpPct, 0);
    const two = tierSets.getEquippedSetBonus([WARRIOR_SET.weapon, WARRIOR_SET.body]);
    assert.equal(two.pieces, 2);
    assert.equal(two.hpPct, 10);
    assert.equal(two.dmgPct, 0);
    const full = tierSets.getEquippedSetBonus(Object.values(WARRIOR_SET));
    assert.equal(full.pieces, 4);
    assert.equal(full.hpPct, 20);
    assert.equal(full.dmgPct, 25);
    // La misma pieza repetida ocupa un solo lugar.
    assert.equal(tierSets.getEquippedSetBonus([WARRIOR_SET.weapon, WARRIOR_SET.weapon]).pieces, 1);
    assert.equal(tierSets.isTierSetItem(402), false);
    // Las piezas de los sets viejos (Desterrado y del Caído) ya no son de tier.
    assert.equal(tierSets.isTierSetItem(1503), false);
    assert.equal(tierSets.isTierSetItem(1341), false);
});

test("la vida del set se suma sin acumularse y se guarda la base", () => {
    const user = makeWarrior(WARRIOR_SET);
    assert.equal(game.refreshEquipmentVitals(user, false), true);
    assert.equal(user.maxHp, 642);
    // Recalcular de nuevo no acumula.
    assert.equal(game.refreshEquipmentVitals(user, false), false);
    assert.equal(user.maxHp, 642);
    // Sacarse el casco y el escudo: quedan 2 piezas (+10 %).
    user.idItemHelmet = 0;
    user.idItemShield = 0;
    game.refreshEquipmentVitals(user, false);
    assert.equal(user.maxHp, 589);
    // Sin set vuelve a la base y la vida actual no supera el máximo.
    user.idItemWeapon = 0;
    game.refreshEquipmentVitals(user, false);
    assert.equal(user.maxHp, 535);
    assert.ok(user.hp <= 535);
});

test("si la vida máxima se reasigna desde afuera, ese valor es la nueva base", () => {
    const user = makeWarrior(WARRIOR_SET);
    game.refreshEquipmentVitals(user, false);
    assert.equal(user.maxHp, 642);
    // Por ejemplo, el login o una recarga de balance ponen la vida base guardada.
    user.maxHp = 545;
    game.refreshEquipmentVitals(user, false);
    assert.equal(user.maxHp, 654);
});

test("el maná de los ítems con +maná se suma (antes no se aplicaba)", () => {
    const user = makeWarrior({ body: 1341 });
    user.idClase = 1;
    user.maxMana = 2487;
    user.mana = 2487;
    game.refreshEquipmentVitals(user, false);
    assert.equal(user.maxMana, 2787);
});

test("el factor PvP y el bono del set solo se aplican contra jugadores", () => {
    // Arma de prueba con golpe fijo para que el daño sea determinista.
    vars.datObj[99001] = { name: "Espada de prueba", objType: 2, minHit: 40, maxHit: 40 };
    const plain = makeWarrior({ weapon: 99001 });
    const npcHit = game.calcularDmg(plain.id, true);
    assert.equal(game.calcularDmg(plain.id, false), Math.floor(npcHit * vars.modDmgPvpArmas[3]));

    // 3 piezas del set (sin la espada del set): sin bono de daño. Fuerza 30 + 10 del equipo = 40, justo el tope.
    const threePieces = makeWarrior({ ...WARRIOR_SET, weapon: 99001 });
    const threeNpc = game.calcularDmg(threePieces.id, true);
    assert.equal(game.calcularDmg(threePieces.id, false), Math.floor(threeNpc * vars.modDmgPvpArmas[3]));

    // Set completo: +25 % de daño, solo contra jugadores. Se fija el golpe de la espada del set.
    const sword = vars.datObj[WARRIOR_SET.weapon];
    const original = { minHit: sword.minHit, maxHit: sword.maxHit };
    Object.assign(sword, { minHit: 48, maxHit: 48 });
    const fullSet = makeWarrior(WARRIOR_SET);
    // Fuerza 20 + 13 del equipo = 33: por debajo del tope, así el test mide solo el bono del set.
    fullSet.attrFuerza = 20;
    const fullNpc = game.calcularDmg(fullSet.id, true);
    assert.equal(game.calcularDmg(fullSet.id, false), Math.floor(fullNpc * vars.modDmgPvpArmas[3] * 1.25));
    Object.assign(sword, original);
    delete vars.datObj[99001];
});

test("la fuerza efectiva tiene tope de 40 solo en PvP", () => {
    vars.datObj[99002] = { name: "Espada de prueba", objType: 2, minHit: 40, maxHit: 40 };
    const strong = makeWarrior({ weapon: 99002 });
    strong.attrFuerza = 60;
    const capped = makeWarrior({ weapon: 99002 });
    capped.attrFuerza = 40;
    assert.ok(game.calcularDmg(strong.id, true) > game.calcularDmg(capped.id, true));
    assert.equal(game.calcularDmg(strong.id, false), game.calcularDmg(capped.id, false));
    delete vars.datObj[99002];
});

test("las túnicas especiales leen el equipo del inventario en juego", () => {
    const tunic = Object.entries(vars.datObj).find(([, item]: [string, any]) => Number(item.bonusGoldNpcPct) > 0);
    assert.ok(tunic, "debería existir una túnica con bonusGoldNpcPct");
    const [id, data] = tunic as [string, { bonusGoldNpcPct: number }];
    assert.equal(getEquippedNpcGoldBonusPct({ idItemBody: 22, inv: { 22: { idItem: Number(id) } } }), Number(data.bonusGoldNpcPct));
});

test("el set Silvano completo hace fallar 3 de cada 10 parálisis", () => {
    const silvano = [1773, 1774, 1775, 1776];
    assert.equal(tierSets.getEquippedSetBonus(silvano).paralysisResistPct, 30);
    assert.equal(tierSets.getEquippedSetBonus(silvano.slice(0, 3)).paralysisResistPct, 0);
    assert.equal(tierSets.getEquippedSetBonus(Object.values(WARRIOR_SET)).paralysisResistPct, 0);

    const archer = makeWarrior({ helmet: 1773, weapon: 1774, shield: 1775, body: 1776 });
    archer.idClase = 20;
    const original = Math.random;
    try {
        Math.random = () => 0.29;
        assert.equal(game.resistsParalysisBySet(archer), true);
        Math.random = () => 0.31;
        assert.equal(game.resistsParalysisBySet(archer), false);
    } finally {
        Math.random = original;
    }
});

