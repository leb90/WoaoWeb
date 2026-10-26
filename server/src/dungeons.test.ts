// Mazmorras (dungeons.ts, docs/MAZMORRAS.md): cuentas puras y datos de jsons/dungeons.json.
//   npx tsx --test src/dungeons.test.ts
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const dungeons = require("./dungeons") as typeof import("./dungeons");
const root = path.resolve(__dirname, "../..");
const readJson = (relativePath: string) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

test("el mapa de una instancia vuelve a su mapa base y entra en 16 bits", () => {
    for (const base of [510, 590, 599]) {
        for (const slot of [0, 49]) {
            const mapId = dungeons.instanceMapId(base, slot);
            assert.equal(dungeons.baseMapOf(mapId), base);
            assert.ok(mapId <= 65_535, `${mapId}`);
        }
    }
    assert.equal(dungeons.baseMapOf(34), null);
});

test("la dificultad sube con cada jugador extra", () => {
    const def = { escalado: { vidaPorJugador: 0.7, danoPorJugador: 0.15 } };
    assert.deepEqual(dungeons.scaleFactors(def, 1), { vida: 1, dano: 1 });
    const five = dungeons.scaleFactors(def, 5);
    assert.ok(Math.abs(five.vida - 3.8) < 1e-9);
    assert.ok(Math.abs(five.dano - 1.6) < 1e-9);
});

test("cada corrida usa el primer lugar libre en todos los mapas de la mazmorra", () => {
    const taken = new Set([dungeons.instanceMapId(590, 0), dungeons.instanceMapId(591, 1)]);
    // El 0 está ocupado en 590 y el 1 en 591: el primero libre en los dos es el 2.
    assert.equal(dungeons.findFreeSlot([590, 591], (mapId) => taken.has(mapId)), 2);
    assert.equal(dungeons.findFreeSlot([590], () => true), null);
});

test("afuera de una mazmorra no se bloquea el ataque entre jugadores", () => {
    const attacker = { id: 1, map: 34, pos: { x: 50, y: 50 } } as never;
    assert.equal(dungeons.getAttackDeniedReason(attacker, { isNpc: false, map: 34 }), null);
    assert.equal(dungeons.getAttackDeniedReason(attacker, { isNpc: true, map: 34 }), null);
});

test("cada mazmorra tiene sus mapas, entrada, salida, regreso y piedra", () => {
    const defs = readJson("server/jsons/dungeons.json") as Array<Record<string, any>>;
    const npcs = readJson("server/jsons/npcs.json");
    assert.ok(defs.length > 0);
    for (const def of defs) {
        for (const map of def.mapas) {
            assert.ok(map >= 507 && map <= 599, `${def.id}: el mapa ${map} tiene que estar entre 507 y 599`);
            for (const dir of ["server/mapas_source", "api/src/mapas_source"]) {
                assert.ok(fs.existsSync(path.join(root, dir, `mapa_${map}`, "terrain.json")), `${dir}/mapa_${map}`);
            }
            assert.ok(fs.existsSync(path.join(root, "frontend/public/static/maps_local", `mapa_${map}.json`)), `cliente mapa_${map}`);
        }
        assert.ok(def.mapas.includes(def.entrada.map), `${def.id}: la entrada está en un mapa de la mazmorra`);
        assert.ok(def.salidas.length > 0, `${def.id}: tiene salida`);
        for (const exit of def.salidas) {
            const objects = readJson(`server/mapas_source/mapa_${exit.map}/specials.json`).objects ?? {};
            assert.equal(objects[`${exit.x},${exit.y}`]?.objIndex, 378, `${def.id}: hay un portal en la salida`);
        }
        assert.ok(!def.mapas.includes(def.regreso.map), `${def.id}: el regreso es afuera`);
        assert.equal(npcs[def.piedraNpc]?.dungeonId, def.id, `${def.id}: la piedra ${def.piedraNpc} abre esta mazmorra`);
        assert.equal(npcs[def.piedraNpc]?.attackable, 0);
    }
});

test("las escaleras de una mazmorra solo llevan a otros mapas de la misma mazmorra", () => {
    const defs = readJson("server/jsons/dungeons.json") as Array<Record<string, any>>;
    for (const def of defs) {
        for (const map of def.mapas) {
            const exits = readJson(`server/mapas_source/mapa_${map}/specials.json`).exits ?? {};
            for (const [coord, exit] of Object.entries<any>(exits)) {
                assert.ok(def.mapas.includes(exit.map), `${def.id} mapa ${map} (${coord}) lleva a ${exit.map}`);
            }
        }
    }
});

const DUNGEON_OBJECT_IDS = { cofre: 1832, puerta: 1834, puertaAbierta: 1835, barrera: 1840, cofreJefe: 1849 };

test("los objetos de mazmorra existen y no se levantan", () => {
    const objs = readJson("server/jsons/objs.json");
    const clientObjs = readJson("frontend/public/init/objs.json");
    for (let id = 1832; id <= 1849; id++) {
        assert.ok(objs[id]?.name, `objeto ${id}`);
        assert.equal(Number(objs[id].objType), 0, `objeto ${id} es decoración`);
        assert.equal(clientObjs[id]?.name, objs[id].name, `objeto ${id} en el cliente`);
    }
});

test("las mecánicas de cada mapa están bien armadas y la mazmorra se puede resolver", () => {
    const defs = readJson("server/jsons/dungeons.json") as Array<Record<string, any>>;
    for (const def of defs) {
        const counts = { llaves: 0, puertasConLlave: 0, llaveJefe: 0, puertaJefe: 0 };
        for (const map of def.mapas) {
            const specials = readJson(`server/mapas_source/mapa_${map}/specials.json`);
            const mech = specials.dungeon;
            assert.ok(mech, `${def.id} mapa ${map}: tiene mecánicas`);
            const objects = specials.objects ?? {};
            const roomIds = new Set(mech.rooms.map((room: { id: number }) => room.id));
            const closingRooms = new Set(mech.rooms.filter((room: { cierra: boolean }) => room.cierra).map((room: { id: number }) => room.id));
            for (const barrier of mech.barriers) {
                const at = `${def.id} ${map} (${barrier.x},${barrier.y})`;
                assert.ok(barrier.salas.length > 0 && barrier.salas.every((id: number) => roomIds.has(id)), `${at}: la puerta da a una sala`);
                const objIndex = objects[`${barrier.x},${barrier.y}`]?.objIndex;
                // Las de sala y las de un solo sentido arrancan abiertas; el bloque con cerradura se ve como la puerta.
                const expected = barrier.bloque
                    ? DUNGEON_OBJECT_IDS.puerta
                    : barrier.tipo === "sala" || barrier.tipo === "unica"
                        ? barrier.horizontal
                            ? DUNGEON_OBJECT_IDS.puertaAbierta
                            : undefined
                        : barrier.horizontal
                          ? DUNGEON_OBJECT_IDS.puerta
                          : DUNGEON_OBJECT_IDS.barrera;
                assert.equal(objIndex, expected, `${at}: objeto de la puerta ${barrier.tipo}`);
                if (barrier.tipo === "llave") counts.puertasConLlave++;
                if (barrier.tipo === "jefe") counts.puertaJefe++;
                if (barrier.tipo === "placa") assert.ok(mech.plates.length > 0, `${at}: la puerta de placas tiene placas en su mapa`);
            }
            for (const chest of mech.chests) {
                const at = `${def.id} ${map} cofre (${chest.x},${chest.y})`;
                assert.ok(roomIds.has(chest.sala), `${at}: está en una sala`);
                // Los cofres aparecen al vaciar una sala que se cierra, al apretar las placas de su sala o al encender sus
                // antorchas.
                const plateRooms = new Set(mech.plates.map((key: string) => mech.roomOf[key]));
                const torchRooms = new Set((mech.torches ?? []).filter((torch: { encendida: boolean }) => !torch.encendida).map((torch: { sala: number }) => torch.sala));
                const hides = closingRooms.has(chest.sala) || plateRooms.has(chest.sala) || torchRooms.has(chest.sala);
                assert.equal(chest.oculto, hides, `${at}: oculto solo en salas que se cierran, con placas o con antorchas apagadas`);
                const chestObject = chest.contenido === "trofeo" ? DUNGEON_OBJECT_IDS.cofreJefe : DUNGEON_OBJECT_IDS.cofre;
                assert.equal(objects[`${chest.x},${chest.y}`]?.objIndex, chest.oculto ? undefined : chestObject, `${at}: objeto`);
                if (chest.contenido === "llave") counts.llaves++;
                if (chest.contenido === "jefe") counts.llaveJefe++;
                if (chest.contenido === "premio") assert.ok(def.itemMazmorra?.id, `${def.id}: el cofre principal tiene ítem`);
                if (chest.contenido === "trampa") assert.ok(mech.trampa.length > 0, `${at}: la trampa suelta criaturas`);
            }
            for (const key of [...mech.pits, ...mech.lava, ...mech.lavaPeriodica]) {
                assert.equal(specials.triggers?.[key], 2, `${def.id} ${map} (${key}): las criaturas no pisan pozos ni lava`);
            }
            for (const barrier of mech.barriers) {
                assert.equal(specials.triggers?.[`${barrier.x},${barrier.y}`], 2, `${def.id} ${map} (${barrier.x},${barrier.y}): las criaturas no salen de su sala`);
            }
            for (const slab of mech.slabs) assert.ok(slab.texto, `${def.id} ${map}: la losa tiene texto`);
        }
        assert.ok(counts.llaves >= counts.puertasConLlave, `${def.id}: alcanzan las llaves chicas`);
        if (counts.puertaJefe) assert.ok(counts.llaveJefe > 0, `${def.id}: hay llave del jefe`);
    }
});

test("afuera de una mazmorra no se nada ni cambia ningún bloqueo", () => {
    const user = { id: 1, _id: "x", map: 34, pos: { x: 50, y: 50 } } as never;
    assert.equal(dungeons.canSwim(user), false);
    assert.equal(dungeons.getSwimBlockReason(user), null);
    assert.equal(dungeons.getDynamicBlocked(34, 50, 50), null);
    assert.equal(dungeons.getWaterStepDeniedReason(user, false), null);
});

test("las llaves del que se va pasan al primero que sigue adentro", () => {
    const holdings = { keys: new Map([["a", 2], ["b", 1]]), bossKeyHolder: "a" as string | null };
    assert.deepEqual(dungeons.handOverKeys(holdings, "a", ["a", "c", "b"]), { heir: "c", keys: 2, bossKey: true });
    assert.deepEqual([...holdings.keys], [["b", 1], ["c", 2]]);
    assert.equal(holdings.bossKeyHolder, "c");
    // Sin llaves no pasa nada.
    assert.equal(dungeons.handOverKeys(holdings, "d", ["c"]), null);
    // Sin nadie que las reciba, se pierden.
    assert.deepEqual(dungeons.handOverKeys(holdings, "b", []), { heir: null, keys: 1, bossKey: false });
    assert.deepEqual([...holdings.keys], [["c", 2]]);
});

test("una mazmorra en desarrollo: en producción solo entra un GM", () => {
    const def = { nombre: "Mazmorra de prueba", soloDesarrollo: true };
    assert.ok(dungeons.developmentLockReason(def, { privileges: 0 }, true));
    assert.equal(dungeons.developmentLockReason(def, { privileges: 1 }, true), null);
    assert.equal(dungeons.developmentLockReason(def, { privileges: 0 }, false), null);
    assert.equal(dungeons.developmentLockReason({ ...def, soloDesarrollo: false }, { privileges: 0 }, true), null);
});

test("los sonidos de mazmorra están en el cliente y en los créditos", () => {
    const credits = fs.readFileSync(path.join(root, "docs/CREDITOS_SONIDOS.md"), "utf8");
    for (const [name, id] of Object.entries(dungeons.DUNGEON_SOUNDS)) {
        assert.ok(fs.existsSync(path.join(root, "frontend/public/sounds", `${id}.wav`)), `${name}: falta sounds/${id}.wav`);
        assert.ok(credits.includes(`| ${id} |`), `${name}: falta el ${id} en docs/CREDITOS_SONIDOS.md`);
    }
});

test("afuera de una mazmorra las criaturas no usan el paseo de mazmorra", () => {
    assert.equal(dungeons.isWatchedDungeonNpc({ map: 34, pos: { x: 50, y: 50 }, wanderRadius: 1 }), false);
    assert.equal(dungeons.isWatchedDungeonNpc({ map: 34, pos: { x: 50, y: 50 } }), false);
});

test("el cuerpo del Ciempiés sigue el rastro de la cabeza", () => {
    const { pointBehind } = require("./dungeonBoss") as typeof import("./dungeonBoss");
    // Rastro en L: de (0,0) a (4,0) y de ahí a (4,3); la cabeza es el último punto.
    const trail = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
    ];
    assert.deepEqual(pointBehind(trail, 0), { x: 4, y: 3 });
    assert.deepEqual(pointBehind(trail, 1), { x: 4, y: 2 });
    // Pasando la esquina sigue por el tramo anterior.
    assert.deepEqual(pointBehind(trail, 4), { x: 3, y: 0 });
    // Más atrás que el rastro: el punto más viejo.
    assert.deepEqual(pointBehind(trail, 50), { x: 0, y: 0 });
});

test("en la Cueva de la Cola aparecen la escalera A, el portal y la K2, y los pozos de la Guarida llevan abajo", () => {
    const mech = (map: number) => readJson(`server/mapas_source/mapa_${map}/specials.json`).dungeon;
    const exits = (map: number) => readJson(`server/mapas_source/mapa_${map}/specials.json`).exits as Record<string, { map: number }>;
    const cueva = mech(530);
    const closing = new Set(cueva.rooms.filter((room: { cierra: boolean }) => room.cierra).map((room: { id: number }) => room.id));
    // La escalera A (530 → 531) y el portal de la Entrada (530 → 530): las dos puntas, reveladas por una sala que se cierra.
    const hidden530 = cueva.hiddenExits as Array<{ x: number; y: number; revela: { map: number; sala: number } }>;
    const toGalleries = Object.entries(exits(530)).filter(([, exit]) => exit.map === 531).map(([key]) => key);
    assert.ok(hidden530.some((h) => toGalleries.includes(`${h.x},${h.y}`)), "la escalera A está oculta");
    assert.equal(hidden530.filter((h) => exits(530)[`${h.x},${h.y}`]?.map === 530).length, 2, "las dos puntas del portal");
    for (const hidden of hidden530) assert.ok(closing.has(hidden.revela.sala), "las revela una sala que se cierra");
    assert.equal(mech(531).hiddenExits.length, 1, "la otra punta de la escalera A");
    // La K2 del Botón aparece con su placa.
    const plateRooms = new Set(cueva.plates.map((key: string) => cueva.roomOf[key]));
    assert.ok(cueva.chests.some((chest: { contenido: string; oculto: boolean; sala: number }) => chest.contenido === "llave" && chest.oculto && plateRooms.has(chest.sala)));
    // El bloque con cerradura de la Cornisa.
    assert.ok(cueva.barriers.some((barrier: { tipo: string; bloque?: boolean }) => barrier.tipo === "llave" && barrier.bloque));
    // Caer de la Guarida lleva a la D de las Galerías.
    const caida = mech(532).caida;
    assert.equal(caida.map, 531);
    const galleries = readJson("server/mapas_source/mapa_531/terrain.json");
    const tile = galleries.palette[String(galleries.rows[caida.y - 1][caida.x - 1])];
    assert.ok(tile && !tile.blocked, "la D es piso");
});

test("la mazmorra de prueba trae lo que tocan el Polvo de Fuego, el Gancho y la Pulsera", () => {
    const specials = readJson("server/mapas_source/mapa_591/specials.json");
    const mech = specials.dungeon;
    const terrain = readJson("server/mapas_source/mapa_591/terrain.json");
    const blocked = (key: string) => {
        const [x, y] = key.split(",").map(Number);
        return Boolean(terrain.palette[String(terrain.rows[y - 1][x - 1])]?.blocked);
    };
    const objectAt = (key: string) => specials.objects?.[key]?.objIndex;
    const OBJ = (dungeons as unknown as { DUNGEON_OBJ: Record<string, number> }).DUNGEON_OBJ;
    // Antorchas apagadas que tapan el paso y un cofre que aparece al encenderlas.
    const torches = mech.torches as Array<{ x: number; y: number; encendida: boolean; sala: number }>;
    assert.equal(torches.filter((torch) => !torch.encendida).length, 2);
    for (const torch of torches) {
        assert.equal(objectAt(`${torch.x},${torch.y}`), torch.encendida ? OBJ.antorchaEncendida : OBJ.antorchaApagada);
        assert.ok(blocked(`${torch.x},${torch.y}`), "la antorcha tapa el paso");
    }
    assert.ok(mech.chests.some((chest: { oculto: boolean; sala: number }) => chest.oculto && chest.sala === torches[0].sala), "cofre de las antorchas");
    // Hielo, vasijas (una sobre la placa que abre una puerta), una piedra y la estatua del Gancho.
    for (const key of mech.ice) {
        assert.equal(objectAt(key), OBJ.hielo);
        assert.ok(blocked(key));
    }
    const liftables = mech.liftables as Array<{ x: number; y: number; tipo: string; placa: boolean }>;
    assert.deepEqual(liftables.map((item) => item.tipo).sort(), ["piedra", "vasija", "vasija"]);
    for (const item of liftables) {
        const key = `${item.x},${item.y}`;
        assert.equal(objectAt(key), item.tipo === "piedra" ? OBJ.piedra : OBJ.vasija);
        assert.ok(blocked(key));
        assert.equal(mech.plates.includes(key), item.placa, "la vasija con placa la tapa");
    }
    assert.ok(mech.barriers.some((barrier: { tipo: string }) => barrier.tipo === "placa"), "la placa abre una puerta");
    for (const key of mech.hookPosts) assert.equal(objectAt(key), OBJ.poste);
    // La estatua está pasando la lava, a 7 baldosas como mucho de la orilla.
    const [hx, hy] = mech.hookPosts[0].split(",").map(Number);
    const lavaInRow = (mech.lava as string[]).map((key) => key.split(",").map(Number)).filter(([, y]) => y === hy).map(([x]) => x);
    assert.ok(lavaInRow.length >= 3 && Math.max(...lavaInRow) < hx && hx - Math.min(...lavaInRow) + 1 <= 7);
});
