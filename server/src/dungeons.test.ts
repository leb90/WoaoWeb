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

const DUNGEON_OBJECT_IDS = { cofre: 1832, puerta: 1834, puertaAbierta: 1835, barrera: 1840, cofreJefe: 1849, paredBombeable: 1858, rocas: 1859 };

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
    const allNpcs = readJson("server/jsons/npcs.json");
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
                // Las de sala y las de un solo sentido arrancan abiertas; el bloque con cerradura se ve como la puerta, y la
                // pared que se vuela con una bomba, como un arco tapiado o un montón de rocas.
                const expected = barrier.tipo === "bomba"
                    ? barrier.horizontal
                        ? DUNGEON_OBJECT_IDS.paredBombeable
                        : DUNGEON_OBJECT_IDS.rocas
                    : barrier.bloque
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
                if (barrier.tipo === "placa") {
                    // La abren las placas, las antorchas, las cabezas de caballo o las baldosas voladoras de una de las salas
                    // que separa.
                    const shrine = mech.santuario ?? { cabezas: [], baldosas: [] };
                    const solvable = barrier.salas.some((sala: number) =>
                        mech.plates.some((key: string) => mech.roomOf[key] === sala) ||
                        (mech.torches ?? []).some((torch: { sala: number }) => torch.sala === sala) ||
                        [...shrine.cabezas, ...shrine.baldosas].some((thing: { sala: number }) => thing.sala === sala),
                    );
                    assert.ok(solvable, `${at}: la puerta "=" da a una sala con algo que la abra`);
                }
            }
            for (const chest of mech.chests) {
                const at = `${def.id} ${map} cofre (${chest.x},${chest.y})`;
                assert.ok(roomIds.has(chest.sala), `${at}: está en una sala`);
                // Los cofres aparecen al vaciar una sala que se cierra, al apretar las placas de su sala, al encender sus
                // antorchas o al matar en orden a sus criaturas.
                const plateRooms = new Set(mech.plates.map((key: string) => mech.roomOf[key]));
                const torchRooms = new Set((mech.torches ?? []).filter((torch: { encendida: boolean }) => !torch.encendida).map((torch: { sala: number }) => torch.sala));
                const orderRooms = new Set(
                    Object.entries((specials.npcs ?? {}) as Record<string, number>)
                        .filter(([, id]) => allNpcs[String(id)]?.orden)
                        .map(([key]) => mech.roomOf[key]),
                );
                const tileRooms = new Set((mech.santuario?.baldosas ?? []).map((tile: { sala: number }) => tile.sala));
                const hides =
                    closingRooms.has(chest.sala) || plateRooms.has(chest.sala) || torchRooms.has(chest.sala) || orderRooms.has(chest.sala) || tileRooms.has(chest.sala);
                assert.equal(chest.oculto, hides, `${at}: oculto solo en salas que se cierran, con placas, con antorchas apagadas, de matar en orden o con baldosas voladoras`);
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
        // Los jefes y minijefes se atacan: si no, su sala no los cuenta, no se cierra y no suena la música de combate (el
        // Genio de AO, por ejemplo, es un NPC amistoso).
        for (const map of def.mapas) {
            for (const id of Object.values((readJson(`server/mapas_source/mapa_${map}/specials.json`).npcs ?? {}) as Record<string, number>)) {
                const npc = allNpcs[String(id)];
                if (npc?.jefe || npc?.minijefe) assert.ok(Number(npc.attackable ?? 1) !== 0, `${def.id}: ${npc.name} (${id}) se puede atacar`);
            }
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

test("la mazmorra de prueba trae lo que tocan el Polvo de Fuego, el Gancho y el Brazalete de Fuerza", () => {
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
    assert.ok(torches.filter((torch) => !torch.encendida).length >= 2);
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
    for (const tipo of ["pesada", "piedra", "vasija"]) assert.ok(liftables.some((item) => item.tipo === tipo), `hay ${tipo}`);
    assert.ok(liftables.some((item) => item.placa), "una vasija tapa una placa");
    const liftableObject: Record<string, number> = { vasija: OBJ.vasija, piedra: OBJ.piedra, pesada: OBJ.piedraPesada, estatua: OBJ.estatuaPesada };
    for (const item of liftables) {
        const key = `${item.x},${item.y}`;
        assert.equal(objectAt(key), liftableObject[item.tipo]);
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

test("las bombas y el arco los tiene todo el mundo desde la primera mazmorra", () => {
    const nuevo = { id: 1, _id: "personaje-sin-items", map: 34, pos: { x: 50, y: 50 } } as never;
    assert.equal(dungeons.characterHasDungeonItem(nuevo, "bombas"), true);
    assert.equal(dungeons.characterHasDungeonItem(nuevo, "arco"), true);
    assert.equal(dungeons.characterHasDungeonItem(nuevo, "pluma"), false);
});

test("el Brazalete de Fuerza nivel 2 reemplaza al 1 y cumple lo que pedía el 1", () => {
    const progressStore = require("./woaoProgress") as typeof import("./woaoProgress");
    // En memoria, sin guardar: no toca los datos del server.
    progressStore.getProgress({ _id: "personaje-con-los-dos" }).dungeonItems = ["pulsera", "pulsera_poderosa"];
    const items = dungeons.ownedDungeonItems("personaje-con-los-dos").map((item: { id: string }) => item.id);
    assert.ok(items.includes("pulsera_poderosa") && !items.includes("pulsera"), "en la Mochila solo está el nivel 2");
    progressStore.getProgress({ _id: "personaje-solo-nivel-2" }).dungeonItems = ["pulsera_poderosa"];
    const solo = { id: 3, _id: "personaje-solo-nivel-2", map: 34, pos: { x: 50, y: 50 } } as never;
    assert.equal(dungeons.characterHasDungeonItem(solo, "pulsera"), true, "lo que pide el nivel 1 lo cumple el 2");
});

test("el Escudo Espejo solo frena lo que llega de frente, y solo adentro de una mazmorra", () => {
    const tools = require("./dungeonTools") as typeof import("./dungeonTools");
    const right = 3; // mira al este
    // Una bola de fuego que viaja hacia el oeste viene del este: de frente.
    assert.equal(tools.comesFromFront(right, { x: -1, y: 0 }), true);
    assert.equal(tools.comesFromFront(right, { x: 1, y: 0 }), false);
    assert.equal(tools.comesFromFront(right, { x: 0, y: 1 }), false);
    assert.equal(tools.comesFromFront(1, { x: 0, y: 1 }), true, "mirando al norte, lo que baja");
    // Afuera de una mazmorra no frena nada, aunque esté levantado.
    const outside = { id: 1, _id: "x", map: 34, pos: { x: 50, y: 50 }, heading: right, mirrorUntil: Date.now() + 2_000 } as never;
    assert.equal(tools.mirrorBlocks(outside, { x: -1, y: 0 }), false);
});

test("la mazmorra de prueba trae búho, pico, cristal, bloques de color, remolino e imitadores", () => {
    const specials = readJson("server/mapas_source/mapa_591/specials.json");
    const mech = specials.dungeon;
    const terrain = readJson("server/mapas_source/mapa_591/terrain.json");
    const blocked = (key: string) => {
        const [x, y] = key.split(",").map(Number);
        return Boolean(terrain.palette[String(terrain.rows[y - 1][x - 1])]?.blocked);
    };
    const objectAt = (key: string) => specials.objects?.[key]?.objIndex;
    const OBJ = (dungeons as unknown as { DUNGEON_OBJ: Record<string, number> }).DUNGEON_OBJ;
    // El búho habla con el pico; el pico está en un cofre de la sala oscura (aparece al encender las antorchas).
    assert.equal(mech.owls.length, 1);
    assert.equal(objectAt(`${mech.owls[0].x},${mech.owls[0].y}`), OBJ.buho);
    assert.ok(mech.owls[0].texto.length > 10);
    const beak = mech.chests.find((chest: { contenido: string }) => chest.contenido === "pico");
    assert.ok(beak?.oculto, "el pico aparece con las antorchas");
    // Los azules arrancan levantados y los naranjas bajados; el cristal tapa el paso.
    for (const key of mech.colorBlocks.azul) {
        assert.equal(objectAt(key), OBJ.bloqueAzul);
        assert.ok(blocked(key));
    }
    for (const key of mech.colorBlocks.naranja) {
        assert.equal(objectAt(key), OBJ.bloqueNaranjaBajo);
        assert.ok(!blocked(key));
    }
    for (const key of mech.switches) assert.equal(objectAt(key), OBJ.cristalAzul);
    // El remolino es piso (no tapa el paso) y las criaturas no lo pisan.
    for (const key of mech.vortexes) {
        assert.equal(objectAt(key), OBJ.remolino);
        assert.ok(!blocked(key));
        assert.equal(specials.triggers?.[key], 2);
    }
    const npcs = readJson("server/jsons/npcs.json");
    assert.ok(Object.values(specials.npcs).some((id) => npcs[String(id)]?.imitador), "hay imitadores");
});

test("la mazmorra de prueba trae fantasmas, orejudos, el escarabajo, matar en orden y la placa de peso", () => {
    const specials = readJson("server/mapas_source/mapa_591/specials.json");
    const mech = specials.dungeon;
    const npcs = readJson("server/jsons/npcs.json");
    const placed = Object.entries(specials.npcs as Record<string, number>).map(([key, id]) => ({ key, template: npcs[String(id)] }));
    for (const flag of ["fantasma", "orejudo", "retrocede"]) assert.ok(placed.some((p) => p.template?.[flag]), `hay una criatura con ${flag}`);
    // Matar en orden: tres números distintos en una sala, y el cofre de esa sala arranca oculto.
    const ordered = placed.filter((p) => p.template?.orden);
    const orderRoom = mech.roomOf[ordered[0].key];
    assert.deepEqual(ordered.filter((p) => mech.roomOf[p.key] === orderRoom).map((p) => p.template.orden).sort(), [1, 2, 3]);
    assert.ok(mech.chests.some((chest: { sala: number; oculto: boolean }) => chest.sala === orderRoom && chest.oculto), "el cofre del orden");
    // La placa de peso cuenta como placa, y la sala de las placas revela sus escaleras (las dos puntas).
    assert.equal(mech.weightPlates.length, 1);
    assert.ok(mech.plates.includes(mech.weightPlates[0]));
    const plateRoom = mech.roomOf[mech.weightPlates[0]];
    assert.equal(mech.hiddenExits.filter((exit: { revela: { sala: number } }) => exit.revela.sala === plateRoom).length, 2);
});

test("la Gruta de la Botella: antorchas que abren, fantasmas con el Brazalete, matar en orden y las escaleras que aparecen", () => {
    const specials = (map: number) => readJson(`server/mapas_source/mapa_${map}/specials.json`);
    const npcs = readJson("server/jsons/npcs.json");
    const def = (readJson("server/jsons/dungeons.json") as Array<Record<string, any>>).find((entry) => entry.id === "botella")!;
    assert.deepEqual(def.mapas, [550, 551, 552]);
    assert.equal(def.itemMazmorra.id, "pulsera");
    assert.ok(def.requiere.some((item: { id: string }) => item.id === "pluma"), "pide la pluma");
    const gruta = specials(550);
    const mech = gruta.dungeon;
    const roomsWith = (flag: string) =>
        new Set(Object.entries(gruta.npcs as Record<string, number>).filter(([, id]) => npcs[id]?.[flag]).map(([key]) => mech.roomOf[key]));
    const torchRooms = new Set(mech.torches.map((torch: { sala: number }) => torch.sala));
    const closing = new Set(mech.rooms.filter((room: { cierra: boolean }) => room.cierra).map((room: { id: number }) => room.id));
    // Las antorchas de la segunda sala abren la puerta del este.
    assert.ok(mech.barriers.some((b: { tipo: string; salas: number[] }) => b.tipo === "placa" && b.salas.some((s) => torchRooms.has(s))));
    // El Brazalete: en una sala oscura que se cierra, con los fantasmas.
    const item = mech.chests.find((chest: { contenido: string }) => chest.contenido === "premio");
    assert.ok(item.oculto && closing.has(item.sala) && torchRooms.has(item.sala) && roomsWith("fantasma").has(item.sala));
    // La llave del jefe: matando en orden al orejudo, al murciélago y al esqueleto.
    const bossKey = mech.chests.find((chest: { contenido: string }) => chest.contenido === "jefe");
    const order = Object.entries(gruta.npcs as Record<string, number>)
        .filter(([key]) => mech.roomOf[key] === bossKey.sala)
        .map(([, id]) => npcs[id])
        .sort((a, b) => a.orden - b.orden);
    assert.deepEqual(order.map((npc) => [npc.orden, npc.name]), [[1, "Orejudo preso"], [2, "Murciélago"], [3, "Esqueleto"]]);
    assert.ok(order[0].orejudo);
    // Cinco llaves chicas para cinco cerraduras; bloques de los dos colores y varios cristales.
    assert.equal(mech.chests.filter((chest: { contenido: string }) => chest.contenido === "llave").length, 5);
    assert.equal(mech.barriers.filter((b: { tipo: string }) => b.tipo === "llave").length, 5);
    assert.ok(mech.colorBlocks.azul.length > 0 && mech.colorBlocks.naranja.length > 0 && mech.switches.length >= 5);
    // Escaleras que aparecen: la A con los bloques, la E al vencer a los orejudos, la F con la placa de peso del pasaje
    // y el portal-atajo al vencer al Cíclope.
    const hiddenAt = new Map<string, { map: number; sala: number }>(
        mech.hiddenExits.map((h: { x: number; y: number; revela: { map: number; sala: number } }) => [`${h.x},${h.y}`, h.revela]),
    );
    const revealers = Object.entries(gruta.exits as Record<string, { map: number }>)
        .filter(([, exit]) => exit.map === 551)
        .map(([key]) => hiddenAt.get(key))
        .filter((revela): revela is { map: number; sala: number } => Boolean(revela));
    const plateRooms = new Set(mech.plates.map((key: string) => mech.roomOf[key]));
    assert.ok(revealers.some((r) => r.map === 550 && plateRooms.has(r.sala)), "la escalera A la revelan los bloques");
    assert.ok(revealers.some((r) => r.map === 550 && closing.has(r.sala) && roomsWith("orejudo").has(r.sala)), "la E, los orejudos");
    const passages = specials(551).dungeon;
    assert.deepEqual(passages.weightPlates.length, 1);
    const weightRoom = passages.roomOf[passages.weightPlates[0]];
    assert.ok(revealers.some((r) => r.map === 551 && r.sala === weightRoom), "la F, la placa de peso");
    const portals = mech.hiddenExits.filter((h: { x: number; y: number }) => gruta.exits[`${h.x},${h.y}`]?.map === 550);
    assert.equal(portals.length, 2);
    assert.ok(portals.every((h: { revela: { sala: number } }) => roomsWith("minijefe").has(h.revela.sala)), "el portal, el Cíclope");
    // El orejudo usa el sprite nuevo (el conejo LPC), indexado en el cliente.
    const bodies = readJson("frontend/public/init/bodies.json");
    const graficos = readJson("frontend/public/init/graficos_optimized.json");
    for (const id of [9769, 9770]) {
        const body = bodies[String(npcs[id].idBody)];
        assert.ok(body, `cuerpo del orejudo ${id}`);
        for (const dir of ["1", "2", "3", "4"]) assert.ok(graficos[String(body[dir])]?.f === 4, `animación ${dir}`);
    }
    // Los jefes: el Cíclope y el Genio, con su comportamiento (dungeonGrotto.ts); la botella es un objeto de mazmorra con
    // el sprite nuevo, para verla al levantarla y tirarla.
    const cyclops = Object.values(gruta.npcs as Record<string, number>).map((id) => npcs[id]).find((npc) => npc?.ciclope);
    assert.ok(cyclops?.minijefe, "el Cíclope es el minijefe");
    const genie = Object.values(specials(552).npcs as Record<string, number>).map((id) => npcs[id]).find((npc) => npc?.genio);
    assert.ok(genie?.jefe && Number(genie.attackable) === 1, "el Genio es el jefe y se ataca");
    const objs = readJson("server/jsons/objs.json");
    const clientObjs = readJson("frontend/public/init/objs.json");
    assert.equal(objs[1869]?.name, "Botella del Genio");
    assert.equal(Number(objs[1869].objType), 0);
    assert.equal(clientObjs[1869]?.name, "Botella del Genio");
    assert.ok(graficos[String(objs[1869].grhIndex)], "el gráfico de la botella está en el cliente");
    // La música: tres temas y el de combate, con sus créditos.
    const credits = fs.readFileSync(path.join(root, "docs/CREDITOS_SONIDOS.md"), "utf8");
    for (const file of [...def.musica.pistas, def.musica.combate]) {
        assert.ok(fs.existsSync(path.join(root, "frontend/public", file)), file);
        assert.ok(credits.includes(file.replace("/music/mazmorras/", "")), `créditos de ${file}`);
    }
});

test("la mazmorra de prueba trae lo del Santuario del Rostro", () => {
    const specials = readJson("server/mapas_source/mapa_591/specials.json");
    const mech = specials.dungeon;
    const npcs = readJson("server/jsons/npcs.json");
    const shrine = mech.santuario;
    // Estatua pesada, persiana que se abre tirándole algo y cofre trabado de la llave del jefe.
    assert.ok(mech.liftables.some((l: { tipo: string }) => l.tipo === "estatua"));
    assert.ok(mech.barriers.some((b: { tipo: string }) => b.tipo === "golpe"));
    assert.ok(mech.chests.some((c: { contenido: string; golpe?: boolean }) => c.contenido === "jefe" && c.golpe));
    // Dos cabezas en una sala con una puerta "=", y baldosas voladoras (una deja pozo) con un cofre oculto.
    assert.equal(shrine.cabezas.length, 2);
    const headRoom = shrine.cabezas[0].sala;
    assert.ok(mech.barriers.some((b: { tipo: string; salas: number[] }) => b.tipo === "placa" && b.salas.includes(headRoom)));
    assert.ok(shrine.baldosas.some((t: { pozo: boolean }) => t.pozo) && shrine.baldosas.some((t: { pozo: boolean }) => !t.pozo));
    const tileRoom = shrine.baldosas[0].sala;
    assert.ok(mech.chests.some((c: { sala: number; oculto: boolean }) => c.sala === tileRoom && c.oculto));
    // Cintas, un lanzallamas que escupe hacia la sala y un ojo de piedra.
    assert.ok(shrine.cintas.length > 0 && shrine.cintas.every((c: { dir: string }) => c.dir === "este"));
    assert.deepEqual(shrine.lanzallamas.map((s: { dir: string }) => s.dir), ["este"]);
    assert.equal(shrine.ojos.length, 1);
    // Los objetos nuevos existen en el server y en el cliente, y no se levantan del piso.
    const objs = readJson("server/jsons/objs.json");
    const clientObjs = readJson("frontend/public/init/objs.json");
    for (let id = 1870; id <= 1880; id++) {
        assert.equal(Number(objs[id]?.objType), 0, `objeto ${id}`);
        assert.equal(clientObjs[id]?.name, objs[id].name, `objeto ${id} en el cliente`);
    }
    // Hechicero, moco escondido y estrella.
    const kinds = Object.values(specials.npcs as Record<string, number>).map((id) => npcs[id]);
    assert.ok(kinds.some((npc) => npc?.hechicero) && kinds.some((npc) => npc?.escondido) && kinds.some((npc) => npc?.estrella));
});

