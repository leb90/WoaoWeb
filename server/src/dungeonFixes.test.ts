import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { pickTrapTiles } from "./dungeonHazardLogic";
import type { RuntimeCharacter } from "./types/runtime";

const root = path.resolve(__dirname, "../..");
const read = (file: string) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const vars = require("./vars");
const dungeons = require("./dungeons");
const game = require("./game");
const tools = require("./dungeonTools");
const protocol = require("./handleProtocol");

test("los aplastadores se sortean sin repetir posiciones y pueden cambiar entre corridas", () => {
    const candidates = ["1,1", "2,1", "3,1", "4,1", "1,1"];
    const first = pickTrapTiles(candidates, 3, () => 0);
    const second = pickTrapTiles(candidates, 3, () => 0.99);
    assert.equal(new Set(first).size, 3);
    assert.notDeepEqual(first, second);
    assert.ok(first.every((key) => candidates.includes(key)));
    assert.equal(pickTrapTiles(["1,1"], 3).length, 1);
});

test("el piso de prueba arranca cubierto y los aplastadores no muestran objetos en reposo", () => {
    const specials = read("server/mapas_source/mapa_590/specials.json");
    const terrain = read("server/mapas_source/mapa_590/terrain.json");
    assert.equal(specials.dungeon.fragile.length, 4);
    assert.equal(specials.dungeon.pits.length, 0);
    for (const key of [...specials.dungeon.fragile, ...specials.dungeon.crushers]) {
        const [x, y] = key.split(",").map(Number);
        assert.equal(specials.objects[key], undefined);
        assert.notEqual(terrain.palette[terrain.rows[y - 1][x - 1]].graphics, 1);
    }
    assert.ok(read("server/mapas_source/mapa_591/specials.json").dungeon.pits.includes("76,35"), "los pozos del Gancho siguen abiertos");
});

test("la puerta bombeable usa la reja de 330048 y conserva un arco vacío al abrirse", () => {
    const specials = read("server/mapas_source/mapa_591/specials.json");
    const gate = specials.dungeon.barriers.find((barrier: any) => barrier.tipo === "bomba" && barrier.horizontal);
    const objects = read("server/jsons/objs.json");
    const graphics = read("frontend/public/init/graficos.json");
    const closed = graphics[objects[dungeons.skinObject(591, gate, 1858)].grhIndex];
    const open = graphics[objects[dungeons.skinObject(591, gate, 1835)].grhIndex];
    assert.equal(closed.numFile, 330048);
    assert.equal(closed.sX, 256);
    assert.equal(open.numFile, 330048);
    assert.equal(open.sX, 0);
    for (const id of [42882, 42883, 42884, 42885]) assert.equal(graphics[id].offset.y, 16);
});

test("la unión en T mantiene el borde de la misma pared vertical arriba y abajo", () => {
    const terrain = read("server/mapas_source/mapa_590/terrain.json");
    // El muro entre las salas usa la pieza derecha (43075), también en las tres filas de la unión.
    for (let y = 23; y <= 27; y++) {
        for (let x = 31; x <= 33; x++) {
            const grh = terrain.palette[terrain.rows[y - 1][x - 1]].graphics;
            assert.ok(grh >= 43075 && grh < 43105, `${x},${y}: sigue siendo pared derecha`);
            assert.equal((grh - 43075) % 3, x - 31, `${x},${y}: conserva la columna del borde`);
        }
    }
});

test("el jefe acuático bloquea golpes, hechizos y herramientas desde tierra; las bombas nunca le hacen daño", () => {
    const map = 590;
    const user = { id: "dungeon-water-test", map, pos: { x: 1, y: 1 } } as RuntimeCharacter;
    const npc = { id: "dungeon-water-boss", templateNpcIndex: 9838, map, pos: { x: 2, y: 1 }, hp: 1500, maxHp: 1500, attackable: 1 };
    const originalConsole = protocol.console;
    const originalLoop = game.loopAreaPos;
    protocol.console = () => undefined;
    game.loopAreaPos = () => undefined;
    vars.mapa[map] = { 1: { 1: { graphics: { "1": 43249 } }, 2: { graphics: { "1": 1505 } }, 3: { graphics: { "1": 1505 } } } };
    vars.npcs[npc.id] = npc;
    vars.clients[user.id] = { id: user.id };
    try {
        for (const source of ["golpe", "hechizo", "fuego", "gancho", "tiro", "flecha", "polvo", "bomba"]) {
            assert.ok(dungeons.getNpcInvulnerableReason(npc, user, source), source);
            assert.equal(tools.damageNpc(user, npc.id, 50, source), false);
            assert.equal(npc.hp, 1500);
        }
        user.pos.x = 3;
        assert.equal(dungeons.getNpcInvulnerableReason(npc, user, "hechizo"), null);
        assert.equal(tools.damageNpc(user, npc.id, 50, "flecha"), true);
        assert.equal(npc.hp, 1450);
        assert.equal(tools.damageNpc(user, npc.id, 50, "bomba"), false);
        assert.equal(npc.hp, 1450);
    } finally {
        protocol.console = originalConsole;
        game.loopAreaPos = originalLoop;
        delete vars.mapa[map];
        delete vars.npcs[npc.id];
        delete vars.clients[user.id];
    }
});
