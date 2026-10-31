// Plantillas del modo Arena (arenaClasses.ts): cada clase puede usar todo lo que lleva.
//   npx tsx --test src/arenaClasses.test.ts
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { ARENA_CLASSES, ARENA_SPELL_SLOTS, buildArenaTemplate, getArenaClass } from "./arenaClasses";

const root = path.resolve(__dirname, "../..");
const readJson = (relativePath: string) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const objects = readJson("server/jsons/objs.json");
const spells = readJson("server/jsons/spells.json");

const SCROLL = 24;
const LOW_RACES = new Set([4, 5, 9]);
const NO_MAGIC_CLASSES = new Set([3, 9, 20]);

// Las mismas clases que se pueden crear (api/src/lib/characterCreation.ts).
const PLAYABLE_CLASSES = [1, 2, 3, 4, 6, 7, 8, 9, 18, 20, 22];

const scrollsBySpell = new Map<number, number[][]>();
for (const object of Object.values(objects) as Array<Record<string, unknown>>) {
    if (Number(object?.objType) === SCROLL && Number(object.spellIndex) > 0) {
        const list = scrollsBySpell.get(Number(object.spellIndex)) ?? [];
        list.push((object.clasesNoPermitidas as number[]) ?? []);
        scrollsBySpell.set(Number(object.spellIndex), list);
    }
}

test("hay una plantilla por cada clase jugable", () => {
    assert.deepEqual(
        ARENA_CLASSES.map((arenaClass) => arenaClass.idClase),
        PLAYABLE_CLASSES,
    );
});

test("cada clase puede ponerse todo su equipo", () => {
    for (const arenaClass of ARENA_CLASSES) {
        for (const idItem of arenaClass.equipo) {
            const object = objects[String(idItem)];
            assert.ok(object, `${arenaClass.nombre}: no existe el objeto ${idItem}`);
            assert.ok(
                !(object.clasesNoPermitidas ?? []).includes(arenaClass.idClase),
                `${arenaClass.nombre} no puede usar ${object.name}`,
            );
            if (LOW_RACES.has(arenaClass.idRaza)) {
                assert.equal(Number(object.razaEnana ?? 0), 1, `${object.name} no es para razas bajas`);
            } else {
                assert.notEqual(Number(object.razaEnana ?? 0), 1, `${object.name} es solo para razas bajas`);
            }
        }
    }
});

test("cada clase puede aprender y lanzar sus hechizos contra jugadores", () => {
    for (const arenaClass of ARENA_CLASSES) {
        if (NO_MAGIC_CLASSES.has(arenaClass.idClase)) {
            assert.deepEqual(arenaClass.hechizos, [], `${arenaClass.nombre} no usa magia`);
            continue;
        }

        assert.equal(
            new Set(arenaClass.hechizos).size,
            arenaClass.hechizos.length,
            `${arenaClass.nombre} repite hechizos`,
        );
        for (const idSpell of arenaClass.hechizos) {
            const spell = spells[String(idSpell)];
            assert.ok(spell, `${arenaClass.nombre}: no existe el hechizo ${idSpell}`);
            assert.notEqual(Number(spell.target), 2, `${spell.name} es solo contra criaturas`);
            const scrolls = scrollsBySpell.get(idSpell) ?? [];
            assert.ok(
                scrolls.some((forbidden) => !forbidden.includes(arenaClass.idClase)),
                `${arenaClass.nombre} no puede aprender ${spell.name}`,
            );
        }
    }
});

test("la plantilla lleva el equipo puesto, pociones y una cabeza de la raza", () => {
    const mage = buildArenaTemplate(1, () => 0);
    assert.ok(mage);
    const items = Object.values(mage.inv);
    assert.deepEqual(
        items.filter((item) => item.equipped).map((item) => item.idItem),
        getArenaClass(1)?.equipo,
    );
    assert.ok(
        items.some((item) => item.idItem === 38 && !item.equipped),
        "lleva Poción Roja",
    );
    assert.ok(
        items.some((item) => item.idItem === 37),
        "un mago lleva Poción Azul",
    );
    assert.equal(mage.idHead, 3);
    assert.equal(buildArenaTemplate(1, () => 0.999)?.idHead, 53);

    const warrior = buildArenaTemplate(3);
    assert.ok(warrior);
    assert.ok(!Object.values(warrior.inv).some((item) => item.idItem === 37), "un guerrero no lleva Poción Azul");
    assert.deepEqual(warrior.spells, {});

    assert.equal(buildArenaTemplate(5), null, "el ladrón no es una clase de la arena");
});

// Pedido de Leandro, como en argentumonline.io: de abajo para arriba van Remover Parálisis (el último de todos),
// Paralizar, el hechizo más poderoso, el que le sigue y la curación más poderosa, con los que la clase tenga.
test("de abajo para arriba: remover, paralizar, los dos más fuertes y la mejor curación", () => {
    const REMOVER = 10;
    const PARALIZAR = 9;
    const average = (spell: Record<string, number>) => (Number(spell.minHp) + Number(spell.maxHp)) / 2;

    for (const arenaClass of ARENA_CLASSES) {
        const list = arenaClass.hechizos.map((id) => ({ id, ...spells[String(id)] }));
        const paralyze =
            list.find((spell) => spell.id === PARALIZAR) ?? list.find((spell) => Number(spell.paraliza) === 1);
        const strongest = list
            .filter((spell) => Number(spell.subeHp) === 2)
            .sort((left, right) => average(right) - average(left))
            .slice(0, 2);
        const bestHeal = list
            .filter((spell) => Number(spell.subeHp) === 1)
            .sort((left, right) => average(right) - average(left))[0];
        const fromBottom = [list.find((spell) => spell.id === REMOVER), paralyze, ...strongest, bestHeal]
            .filter((spell) => spell)
            .map((spell) => spell!.id);
        const expected = [...fromBottom].reverse();

        assert.deepEqual(arenaClass.hechizos.slice(-expected.length), expected, arenaClass.nombre);
    }
});

test("los hechizos van en los últimos casilleros, como en argentumonline.io", () => {
    const mage = buildArenaTemplate(1);
    assert.ok(mage);
    const slots = Object.keys(mage.spells).map(Number);
    const hechizos = getArenaClass(1)?.hechizos ?? [];

    assert.equal(Math.max(...slots), ARENA_SPELL_SLOTS);
    assert.equal(Math.min(...slots), ARENA_SPELL_SLOTS - hechizos.length + 1);
    assert.equal(mage.spells[String(ARENA_SPELL_SLOTS)].idSpell, hechizos[hechizos.length - 1]);
    assert.equal(mage.spells[String(ARENA_SPELL_SLOTS)].idSpell, 10, "Remover Parálisis queda en el último casillero");
});
