// Datos de los entrenadores de clase (scripts/applyClassTrainersData.ts, docs/ENTRENADORES_DE_CLASE.md).
//   npx tsx --test src/classTrainers.test.ts
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(__dirname, "../..");
const readJson = (relativePath: string) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const npcs = readJson("server/jsons/npcs.json");
const objects = readJson("server/jsons/objs.json");
const spells = readJson("server/jsons/spells.json");

// Clase de cada entrenador, en el orden del círculo.
const TRAINER_CLASSES: Record<number, number> = {
    9700: 1,
    9701: 7,
    9702: 22,
    9703: 6,
    9704: 2,
    9705: 8,
    9706: 3,
    9707: 18,
    9708: 4,
    9709: 9,
    9710: 20,
};
const CITY_MAPS = [1, 34, 59, 63, 151, 170];
const canUse = (itemId: number, classId: number) => !(objects[String(itemId)]?.clasesNoPermitidas ?? []).includes(classId);

test("cada entrenador comercia, no se puede atacar y tiene su clase escrita", () => {
    for (const npcId of Object.keys(TRAINER_CLASSES)) {
        const npc = npcs[npcId];
        assert.ok(npc, `falta el NPC ${npcId}`);
        assert.equal(npc.comercia, 1);
        assert.equal(npc.attackable, 0);
        assert.equal(npc.movement, 0);
        assert.match(npc.name, /^Entrenador de /);
        assert.ok(npc.etiqueta && npc.etiqueta.length <= 8, `${npcId}: etiqueta "${npc.etiqueta}" (corta, para no pisarse)`);
    }
});

test("solo vende lo que su clase puede usar, con precio", () => {
    for (const [npcId, classId] of Object.entries(TRAINER_CLASSES)) {
        for (const entry of npcs[npcId].objs) {
            const item = objects[String(entry.item)];
            assert.ok(item, `${npcId}: no existe el ítem ${entry.item}`);
            assert.ok(canUse(entry.item, classId), `${npcId}: ${item.name} no es para la clase ${classId}`);
            assert.ok(Number(entry.valor ?? item.valor) > 1, `${npcId}: ${item.name} vale 1 en la tienda`);
        }
    }
});

test("vende todos los pergaminos que la clase puede aprender", () => {
    const excluded = new Set([34, 37, 38, 52, 53, 56, 57, 58, 59, 69]);
    for (const [npcId, classId] of Object.entries(TRAINER_CLASSES)) {
        const sold = new Set(npcs[npcId].objs.map((entry: { item: number }) => entry.item));
        for (const [id, item] of Object.entries<any>(objects)) {
            if (Number(item.objType) !== 24 || excluded.has(Number(item.spellIndex)) || /sin uso/i.test(item.name)) continue;
            if (canUse(Number(id), classId)) assert.ok(sold.has(Number(id)), `${npcId}: falta el pergamino ${item.name}`);
        }
    }
});

test("todos los hechizos de jugador tienen pergamino", () => {
    const withScroll = new Set(
        Object.values<any>(objects)
            .filter((item) => Number(item.objType) === 24)
            .map((item) => Number(item.spellIndex)),
    );
    // De GM, gratis (sin maná), sin uso o de criatura (68, Aliento de Dragón, del Caballero Oscuro).
    const notForPlayers = new Set([34, 37, 38, 52, 53, 56, 58, 59, 68, 69]);
    for (const id of Object.keys(spells).map(Number)) {
        if (!notForPlayers.has(id)) assert.ok(withScroll.has(id), `el hechizo ${id} (${spells[id].name}) no tiene pergamino`);
    }
});

test("los 11 están en cada ciudad, igual en npcs.json y specials.json del server y de la api", () => {
    for (const map of CITY_MAPS) {
        const copies = ["server/mapas_source", "api/src/mapas_source"].map((dir) => ({
            placements: readJson(`${dir}/mapa_${map}/npcs.json`) as Array<{ x: number; y: number; npcIndex: number }>,
            specials: readJson(`${dir}/mapa_${map}/specials.json`).npcs as Record<string, number>,
        }));
        for (const { placements, specials } of copies) {
            const trainers = placements.filter((entry) => TRAINER_CLASSES[entry.npcIndex]);
            assert.equal(trainers.length, 11, `mapa ${map}`);
            assert.equal(new Set(trainers.map((entry) => entry.npcIndex)).size, 11, `mapa ${map}: repetidos`);
            for (const entry of trainers) assert.equal(specials[`${entry.x},${entry.y}`], entry.npcIndex, `mapa ${map}`);
        }
        assert.deepEqual(copies[0], copies[1], `mapa ${map}: server y api distintos`);
    }
});
