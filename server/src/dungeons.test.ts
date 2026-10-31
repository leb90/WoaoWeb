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
    const npcsForFlags = readJson("server/jsons/npcs.json");
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
                        ? // Abierta, en una pared vertical no se ve, salvo la puerta lateral de una mazmorra con piel.
                          barrier.horizontal || mech.piel?.porBaldosa[`${barrier.x},${barrier.y}`]?.[DUNGEON_OBJECT_IDS.puertaAbierta]
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
                    // que separa; en la Torre del Águila, también los ojos rotos de una sala de ojos y el Águila vencida (la
                    // Sala del Órgano, la del trofeo).
                    const shrine = mech.santuario ?? { cabezas: [], baldosas: [] };
                    const tower = mech.torre ?? { salasOjos: [] };
                    const trophyRoom = mech.chests.find((chest: { contenido: string }) => chest.contenido === "trofeo")?.sala;
                    const solvable = barrier.salas.some((sala: number) =>
                        mech.plates.some((key: string) => mech.roomOf[key] === sala) ||
                        (mech.torches ?? []).some((torch: { sala: number }) => torch.sala === sala) ||
                        [...shrine.cabezas, ...shrine.baldosas].some((thing: { sala: number }) => thing.sala === sala) ||
                        tower.salasOjos.includes(sala) ||
                        (trophyRoom !== undefined && sala === trophyRoom && tower.salasOjos !== undefined && Object.values(specials.npcs ?? {}).some((id: unknown) => npcsForFlags[String(id)]?.aguila)),
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
                const joinRooms = new Set(mech.fauces?.salasJuntar ?? []);
                const hides =
                    closingRooms.has(chest.sala) ||
                    plateRooms.has(chest.sala) ||
                    torchRooms.has(chest.sala) ||
                    orderRooms.has(chest.sala) ||
                    tileRooms.has(chest.sala) ||
                    joinRooms.has(chest.sala) ||
                    Boolean(chest.trasJefe);
                assert.equal(chest.oculto, hides, `${at}: oculto solo en salas que se cierran, con placas, con antorchas apagadas, de matar en orden, con baldosas voladoras, con bloques que se juntan o si espera al jefe`);
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
    // Los postes del Gancho son estatuas o cabezas de dragón (las Fauces del Bagre).
    for (const key of mech.hookPosts) assert.ok([OBJ.poste, OBJ.cabezaDragon].includes(objectAt(key)), key);
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

test("el Campo de Protección solo frena lo que llega de frente, y solo adentro de una mazmorra", () => {
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


test("el Santuario del Rostro: el Brazalete nivel 2, estatuas, cabezas, baldosas, el Gancho y las escaleras", () => {
    const specials = (map: number) => readJson(`server/mapas_source/mapa_${map}/specials.json`);
    const npcs = readJson("server/jsons/npcs.json");
    const def = (readJson("server/jsons/dungeons.json") as Array<Record<string, any>>).find((entry) => entry.id === "rostro")!;
    assert.deepEqual(def.mapas, [560, 561, 562]);
    assert.equal(def.itemMazmorra.id, "pulsera_poderosa");
    assert.deepEqual(
        def.requiere.map((item: { id: string }) => item.id),
        ["pulsera", "pluma", "botas_de_pegaso", "gancho"],
    );
    const shrine = specials(560);
    const mech = shrine.dungeon;
    const roomsWith = (flag: string) =>
        new Set(Object.entries(shrine.npcs as Record<string, number>).filter(([, id]) => npcs[id]?.[flag]).map(([key]) => mech.roomOf[key]));
    const closing = new Set(mech.rooms.filter((room: { cierra: boolean }) => room.cierra).map((room: { id: number }) => room.id));
    const doorsOf = (tipo: string) => mech.barriers.filter((b: { tipo: string }) => b.tipo === tipo);
    // El Brazalete nivel 2 a la vista, con la pared giratoria (un solo sentido) que vuelve al Cristal central.
    const item = mech.chests.find((chest: { contenido: string }) => chest.contenido === "premio");
    assert.ok(item && !item.oculto);
    assert.ok(doorsOf("unica").some((b: { salas: number[] }) => b.salas.includes(item.sala)));
    // Estatuas pesadas y cinco persianas que se abren tirándoles algo.
    assert.ok(mech.liftables.filter((l: { tipo: string }) => l.tipo === "estatua").length >= 10);
    assert.equal(doorsOf("golpe").length, 5);
    // Tres llaves para tres cerraduras (una puerta y dos bloques) y la llave del jefe en el cofre trabado.
    assert.equal(mech.chests.filter((chest: { contenido: string }) => chest.contenido === "llave").length, 3);
    assert.equal(doorsOf("llave").length, 3);
    assert.ok(mech.chests.find((chest: { contenido: string }) => chest.contenido === "jefe")?.golpe);
    // Tres pares de cabezas de caballo, cada uno con su puerta "=".
    const headRooms = new Set<number>(mech.santuario.cabezas.map((head: { sala: number }) => head.sala));
    assert.equal(mech.santuario.cabezas.length, 6);
    assert.equal(headRooms.size, 3);
    for (const room of headRooms) assert.ok(doorsOf("placa").some((b: { salas: number[] }) => b.salas.includes(room)), `puerta de la sala ${room}`);
    // Baldosas voladoras: en una sala abren la puerta norte; en la otra dejan pozos y esconden la K3.
    const tiles = (pozo: boolean) => mech.santuario.baldosas.filter((tile: { pozo: boolean }) => tile.pozo === pozo);
    assert.equal(tiles(false).length, 8);
    assert.equal(tiles(true).length, 8);
    assert.ok(doorsOf("placa").some((b: { salas: number[] }) => b.salas.includes(tiles(false)[0].sala)));
    assert.ok(mech.chests.some((c: { contenido: string; oculto: boolean; sala: number }) => c.contenido === "llave" && c.oculto && c.sala === tiles(true)[0].sala));
    // Cintas, lanzallamas y el ojo de piedra.
    assert.equal(mech.santuario.cintas.length, 20);
    assert.equal(mech.santuario.lanzallamas.length, 4);
    assert.equal(mech.santuario.ojos.length, 1);
    // El Gancho: dos postes en el Canal; debajo del de arriba, tres filas de pozos (el salto en carrera cruza dos).
    assert.equal(mech.hookPosts.length, 2);
    const [hx, hy] = mech.hookPosts[0].split(",").map(Number);
    for (const dy of [2, 3, 4]) assert.ok(mech.pits.includes(`${hx},${hy + dy}`), `pozo debajo del poste (${hx},${hy + dy})`);
    // Las criaturas: el Machacador y las Serpientes Glotonas son minijefes; el Rostro de Piedra, el jefe, y se lo ataca.
    for (const flag of ["hechicero", "escondido", "estrella", "orejudo", "imitador"]) assert.ok(roomsWith(flag).size > 0, flag);
    const minibosses = Object.values(shrine.npcs as Record<string, number>).map((id) => npcs[id]).filter((npc) => npc?.minijefe);
    assert.deepEqual([...new Set(minibosses.map((npc) => npc.name))].sort(), ["Machacador", "Serpiente Glotona"]);
    const face = Object.values(specials(562).npcs as Record<string, number>).map((id) => npcs[id]).find((npc) => npc?.jefe);
    assert.ok(face && Number(face.attackable) === 1 && Number(face.hostile) === 1, "el Rostro es el jefe y se ataca");
    // El portal-atajo aparece al vencer al Machacador.
    const portals = mech.hiddenExits.filter((h: { x: number; y: number }) => shrine.exits[`${h.x},${h.y}`]?.map === 560);
    assert.equal(portals.length, 2);
    const smasherRoom = Object.entries(shrine.npcs as Record<string, number>).find(([, id]) => npcs[id]?.name === "Machacador")!;
    assert.ok(portals.every((h: { revela: { sala: number } }) => h.revela.sala === mech.roomOf[smasherRoom[0]]));
    // La F llega a la sala de los Orejudos, que se cierra, pero se ve siempre: si no, el pasaje E → F sería un callejón.
    const passages = specials(561);
    const orejudos = [...roomsWith("orejudo")][0];
    assert.ok(closing.has(orejudos));
    const toOrejudos = Object.entries(passages.exits as Record<string, { map: number; x: number; y: number }>).filter(
        ([, exit]) => exit.map === 560 && mech.roomOf[`${exit.x},${exit.y}`] === orejudos,
    );
    assert.equal(toOrejudos.length, 1);
    assert.ok(!passages.dungeon.hiddenExits.some((h: { x: number; y: number }) => `${h.x},${h.y}` === toOrejudos[0][0]));
    assert.equal(new Set(passages.dungeon.crushers.map((key: string) => key.split(",")[0])).size, 7, "siete aplastadores");
    // La Guarida: el borde de baldosas voladoras y una vasija en cada esquina.
    const lair = specials(562).dungeon;
    assert.equal(lair.santuario.baldosas.length, 20);
    assert.equal(lair.liftables.length, 4);
    // La música: tres temas y el de combate, con sus créditos.
    const credits = fs.readFileSync(path.join(root, "docs/CREDITOS_SONIDOS.md"), "utf8");
    for (const file of [...def.musica.pistas, def.musica.combate]) {
        assert.ok(fs.existsSync(path.join(root, "frontend/public", file)), file);
        assert.ok(credits.includes(file.replace("/music/mazmorras/", "")), `créditos de ${file}`);
    }
});

test("los jefes del Santuario del Rostro: el Machacador, las Serpientes Glotonas y el Rostro de Piedra", () => {
    const specials = (map: number) => readJson(`server/mapas_source/mapa_${map}/specials.json`);
    const npcs = readJson("server/jsons/npcs.json");
    const shrine = specials(560);
    const placed = (flag: string) =>
        Object.entries(shrine.npcs as Record<string, number>).filter(([, id]) => npcs[id]?.[flag]).map(([key]) => key);
    // Cada uno lo mueve dungeonShrineBosses.ts según la marca de su plantilla.
    assert.equal(placed("machacador").length, 1);
    const snakes = placed("glotona");
    assert.equal(snakes.length, 2);
    assert.equal(new Set(snakes.map((key) => shrine.dungeon.roomOf[key])).size, 1, "las dos serpientes en la misma sala");
    // El Rostro de Piedra: tira las 20 baldosas y las 4 vasijas de su sala, y abre los pozos en el anillo a dos baldosas
    // de la cara, que tiene que ser piso de la sala.
    const lair = specials(562);
    const terrain = readJson("server/mapas_source/mapa_562/terrain.json");
    const blocked = (x: number, y: number) => Boolean(terrain.palette[String(terrain.rows[y - 1][x - 1])]?.blocked);
    const [faceKey] = Object.entries(lair.npcs as Record<string, number>).find(([, id]) => npcs[id]?.rostro)!;
    const [fx, fy] = faceKey.split(",").map(Number);
    const room = lair.dungeon.roomOf[faceKey];
    assert.ok(lair.dungeon.santuario.baldosas.every((tile: { sala: number }) => tile.sala === room));
    const vases = lair.dungeon.liftables.filter((item: { tipo: string; x: number; y: number }) => item.tipo === "vasija" && lair.dungeon.roomOf[`${item.x},${item.y}`] === room);
    assert.equal(vases.length, 4);
    let ring = 0;
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== 2) continue;
            const key = `${fx + dx},${fy + dy}`;
            assert.ok(!blocked(fx + dx, fy + dy) && lair.dungeon.roomOf[key] === room && !lair.exits?.[key], `pozo en ${key}`);
            ring++;
        }
    }
    assert.equal(ring, 16);
    // La bola de hierro es la 1881, que no puede usarla otro objeto de mazmorra.
    const OBJ = (dungeons as unknown as { DUNGEON_OBJ: Record<string, number> }).DUNGEON_OBJ;
    assert.equal(OBJ.bolaDeHierro, 1881);
    assert.equal(Object.values(OBJ).filter((id) => id === 1881).length, 1);
    assert.ok(!readJson("frontend/public/init/objs.json")["1881"], "1881 no está en objs.json");
});

test("las mecánicas de las Fauces del Bagre en la mazmorra de prueba: agua baja, zambullida, ancla, piso flojo, cristales, bloques y nota", () => {
    const specials = readJson("server/mapas_source/mapa_591/specials.json");
    const terrain = readJson("server/mapas_source/mapa_591/terrain.json");
    const npcs = readJson("server/jsons/npcs.json");
    const mech = specials.dungeon;
    const cell = (key: string) => {
        const [x, y] = key.split(",").map(Number);
        return terrain.palette[String(terrain.rows[y - 1][x - 1])];
    };
    const isWater = (graphics: unknown) => {
        const layer1 = Array.isArray(graphics) ? graphics[0] : graphics;
        return Number(layer1) >= 1505 && Number(layer1) <= 1520;
    };
    // El agua baja es agua con algo en la capa 2 (así se camina); la profunda, agua sola.
    assert.ok(mech.fauces.aguaBaja.length >= 40);
    for (const key of mech.fauces.aguaBaja) {
        const graphics = cell(key).graphics;
        assert.ok(Array.isArray(graphics) && isWater(graphics) && graphics[1] > 0, `agua baja en ${key}`);
    }
    // La escalera bajo el agua: en el agua profunda, sin objeto, y la otra punta en otra sala.
    const underwater = Object.entries(specials.exits as Record<string, { map: number; x: number; y: number }>).filter(([key]) => isWater(cell(key).graphics) && !Array.isArray(cell(key).graphics));
    assert.equal(underwater.length, 1);
    assert.ok(!specials.objects[underwater[0][0]], "la zambullida no se ve");
    assert.notEqual(mech.roomOf[underwater[0][0]], mech.roomOf[`${underwater[0][1].x},${underwater[0][1].y}`]);
    // El ancla: al lado de una columna de pozos.
    assert.equal(mech.fauces.anclas.length, 1);
    const [ax, ay] = mech.fauces.anclas[0].split(",").map(Number);
    assert.ok(mech.pits.includes(`${ax},${ay - 1}`), "pozos arriba del ancla");
    // Piso flojo, cristales de golpe (tapan el paso), peces y la cabeza de dragón (se engancha).
    assert.equal(mech.fauces.pisoFlojo.length, 6);
    for (const key of mech.fauces.cristalesGolpe) assert.ok(cell(key).blocked, `cristal en ${key}`);
    assert.equal(mech.fauces.peces.length, 1);
    assert.ok(mech.hookPosts.some((key: string) => specials.objects[key]?.objIndex === 1885), "cabeza de dragón");
    // Los bloques que se juntan: su sala esconde el cofre hasta juntarlos.
    assert.equal(mech.fauces.salasJuntar.length, 1);
    const joinRoom = mech.fauces.salasJuntar[0];
    assert.equal(mech.blocks.filter((key: string) => mech.roomOf[key] === joinRoom).length, 2);
    assert.ok(mech.chests.some((chest: { sala: number; oculto: boolean }) => chest.sala === joinRoom && chest.oculto));
    // El cofre con nota.
    const note = mech.chests.find((chest: { contenido: string }) => chest.contenido === "nota");
    assert.ok(note && /Vení a buscarlo/.test(note.texto));
    // Las criaturas de prueba: cada una con su marca; las de agua nacen en el agua.
    const placed = Object.entries(specials.npcs as Record<string, number>);
    for (const flag of ["mascara", "saltarin", "esquiva", "pulga"]) assert.ok(placed.some(([, id]) => npcs[id]?.[flag]), flag);
    const squid = placed.find(([, id]) => npcs[id]?.tierraInvalida);
    assert.ok(squid && isWater(cell(squid[0]).graphics) && !Array.isArray(cell(squid[0]).graphics), "el calamar en el agua profunda");
    const flea = placed.find(([, id]) => npcs[id]?.pulga);
    assert.ok(flea && Array.isArray(cell(flea[0]).graphics), "la pulga en el agua baja");
});

test("las Fauces del Bagre: el Gancho, los cuatro Maestro Stalfos, las Gohma, las anclas, la zambullida y los pasajes", () => {
    const specials = (map: number) => readJson(`server/mapas_source/mapa_${map}/specials.json`);
    const npcs = readJson("server/jsons/npcs.json");
    const def = (readJson("server/jsons/dungeons.json") as Array<Record<string, any>>).find((entry) => entry.id === "fauces")!;
    assert.deepEqual(def.mapas, [570, 571, 572]);
    assert.equal(def.itemMazmorra.id, "gancho");
    assert.deepEqual(def.requiere.map((item: { id: string }) => item.id), ["patas_de_rana", "pluma", "pulsera"]);
    const maw = specials(570);
    const mech = maw.dungeon;
    const closing = new Set(mech.rooms.filter((room: { cierra: boolean }) => room.cierra).map((room: { id: number }) => room.id));
    const placed = (name: string) => Object.entries(maw.npcs as Record<string, number>).filter(([, id]) => npcs[id]?.name === name).map(([key]) => key);
    // El Maestro Stalfos: cuatro salas que se cierran; en una de ellas, el cofre del Gancho (oculto hasta vencerlo).
    const stalfos = placed("Maestro Stalfos");
    assert.equal(stalfos.length, 4);
    assert.ok(stalfos.every((key) => closing.has(mech.roomOf[key])));
    const item = mech.chests.find((chest: { contenido: string }) => chest.contenido === "premio");
    assert.ok(item && item.oculto && stalfos.some((key) => mech.roomOf[key] === item.sala));
    // Los cuatro encuentros, cada uno con su número y sus bombazos (huye a los 3, 2 y 2; el cuarto muere al tercero). El
    // cofre del Gancho no aparece al vaciar su sala: lo revela la muerte del cuarto.
    const encounters = stalfos.map((key) => npcs[maw.npcs[key]]).sort((a, b) => a.maestroStalfos - b.maestroStalfos);
    assert.deepEqual(encounters.map((npc) => [npc.maestroStalfos, npc.bombazos]), [[1, 3], [2, 2], [3, 2], [4, 3]]);
    assert.equal(mech.roomOf[stalfos.find((key) => npcs[maw.npcs[key]].maestroStalfos === 4)!], item.sala);
    assert.ok(item.trasJefe, "el cofre del Gancho espera al cuarto Maestro Stalfos");
    // Las Gohma: dos en una sala que se cierra, con el portal-atajo a la Entrada escondido hasta vencerlas.
    const gohma = placed("Gohma");
    assert.equal(gohma.length, 2);
    assert.ok(gohma.every((key) => npcs[maw.npcs[key]].gohma), "las Gohma las mueve dungeonMawBosses.ts");
    const gohmaRoom = mech.roomOf[gohma[0]];
    assert.ok(closing.has(gohmaRoom));
    assert.ok(mech.hiddenExits.some((h: { revela: { sala: number } }) => h.revela.sala === gohmaRoom));
    // Llaves: tres chicas para tres cerraduras (una puerta y dos bloques) y la del jefe para la puerta del jefe.
    const doors = (tipo: string) => mech.barriers.filter((b: { tipo: string }) => b.tipo === tipo);
    assert.equal(mech.chests.filter((chest: { contenido: string }) => chest.contenido === "llave").length, 3);
    assert.equal(doors("llave").length, 3);
    assert.equal(doors("jefe").length, 1);
    assert.equal(mech.chests.filter((chest: { contenido: string }) => chest.contenido === "jefe").length, 1);
    // Tres anclas, cada una al lado de una columna de pozos; la zambullida en el agua profunda de la Sala del agua.
    assert.equal(mech.fauces.anclas.length, 3);
    for (const key of mech.fauces.anclas) {
        const [x, y] = key.split(",").map(Number);
        assert.ok([[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => mech.pits.includes(`${x + dx},${y + dy}`)), `ancla ${key}`);
    }
    assert.ok(mech.fauces.aguaBaja.length >= 80, "agua baja en la Sala del agua, el Canal, los Murciélagos y el Río");
    const terrain = readJson("server/mapas_source/mapa_570/terrain.json");
    const underwater = Object.keys(maw.exits).filter((key) => {
        const [x, y] = key.split(",").map(Number);
        const graphics = terrain.palette[String(terrain.rows[y - 1][x - 1])].graphics;
        return !Array.isArray(graphics) && graphics >= 1505 && graphics <= 1520;
    });
    assert.equal(underwater.length, 1, "la zambullida");
    // El cofre con la nota, los búhos, el pico, el mapa y la brújula, y el oro.
    assert.ok(/Vení a buscarlo/.test(mech.chests.find((chest: { contenido: string }) => chest.contenido === "nota")?.texto ?? ""));
    assert.equal(mech.owls.length, 3);
    for (const contenido of ["pico", "mapa", "brujula", "oroGrande"]) assert.ok(mech.chests.some((chest: { contenido: string }) => chest.contenido === contenido), contenido);
    assert.equal(mech.chests.filter((chest: { contenido: string }) => chest.contenido === "oro").length, 2);
    // Los bloques que se juntan (la K1) y la reja del Cruce que abre el botón.
    assert.equal(mech.fauces.salasJuntar.length, 1);
    assert.ok(doors("placa").some((b: { salas: number[] }) => b.salas.some((sala) => mech.plates.some((key: string) => mech.roomOf[key] === sala))));
    // Los pasajes: cuatro pares de escaleras, el túnel inundado con calamares, los peces y las cabezas de dragón.
    const passages = specials(571);
    assert.equal(Object.keys(passages.exits).length, 8);
    assert.ok(passages.dungeon.fauces.peces.length >= 3);
    assert.ok(passages.dungeon.hookPosts.length >= 6);
    assert.ok(Object.values(passages.npcs as Record<string, number>).some((id) => npcs[id]?.tierraInvalida));
    // Las criaturas con sus marcas; el jefe se ataca.
    for (const flag of ["mascara", "saltarin", "esquiva", "pulga", "escondido", "estrella"]) {
        assert.ok(Object.values(maw.npcs as Record<string, number>).some((id) => npcs[id]?.[flag]), flag);
    }
    const eel = Object.values(specials(572).npcs as Record<string, number>).map((id) => npcs[id]).find((npc) => npc?.jefe);
    assert.ok(eel && Number(eel.attackable) === 1 && Number(eel.hostile) === 1 && eel.anguila);
    // La Guarida: la sala de la Anguila tiene lugar para los cuatro agujeros (a cuatro baldosas de cada esquina) y el
    // pozo del medio.
    const lair = specials(572).dungeon;
    const eelKey = Object.keys(specials(572).npcs)[0];
    const lairRoom = lair.rooms.find((room: { id: number }) => room.id === lair.roomOf[eelKey]);
    assert.ok(lairRoom.x2 - lairRoom.x1 >= 12 && lairRoom.y2 - lairRoom.y1 >= 10 && lairRoom.cierra);
    // La música: tres temas y el de combate, con sus créditos.
    const credits = fs.readFileSync(path.join(root, "docs/CREDITOS_SONIDOS.md"), "utf8");
    for (const file of [...def.musica.pistas, def.musica.combate]) {
        assert.ok(fs.existsSync(path.join(root, "frontend/public", file)), file);
        assert.ok(credits.includes(file.replace("/music/mazmorras/", "")), `créditos de ${file}`);
    }
});

test("la Torre del Águila: cuatro pisos, el Campo de Protección, los pilares y el Orbe, los ojos que abren puertas, el Flautista y el Águila", () => {
    const specials = (map: number) => readJson(`server/mapas_source/mapa_${map}/specials.json`);
    const npcs = readJson("server/jsons/npcs.json");
    const def = (readJson("server/jsons/dungeons.json") as Array<Record<string, any>>).find((entry) => entry.id === "torre")!;
    assert.deepEqual(def.mapas, [580, 581, 582, 583]);
    assert.equal(def.itemMazmorra.id, "campo_de_proteccion");
    assert.deepEqual(def.requiere.map((item: { id: string }) => item.id), ["pluma", "pulsera", "gancho"]);
    assert.equal(def.entrada.map, 580);
    const ground = specials(580).dungeon;
    const first = specials(581).dungeon;
    const second = specials(582).dungeon;
    const top = specials(583).dungeon;
    // Los pozos de cada piso tiran al de abajo; los de la terraza, a la sala de la escalera del mismo mapa.
    assert.equal(ground.caida, null);
    assert.equal(first.caida.map, 580);
    assert.equal(second.caida.map, 581);
    assert.equal(top.caida.map, 583);
    assert.ok(second.pits.length >= 150, "los abismos del segundo piso");
    assert.ok(second.fauces.pisoFlojo.length >= 30, "las cornisas de piso flojo");
    // El Campo está en el primer piso, con el Orbe al lado; los cuatro pilares, en las salas del centro.
    const item = first.chests.find((chest: { contenido: string }) => chest.contenido === "premio");
    assert.ok(item && first.torre.orbe && first.roomOf[`${first.torre.orbe.x},${first.torre.orbe.y}`] === item.sala);
    assert.equal(first.torre.pilares.length, 4);
    assert.equal(new Set(first.torre.pilares.map((p: { sala: number }) => p.sala)).size, 4);
    for (const pillar of first.torre.pilares) assert.equal(specials(581).objects[`${pillar.x},${pillar.y}`]?.objIndex, 1891);
    assert.equal(specials(581).objects[`${first.torre.orbe.x},${first.torre.orbe.y}`]?.objIndex, 1893);
    // La escalera 6 (del segundo piso a lo alto) espera al derrumbe: escondida en las dos puntas, la revela la "sala" -1
    // del mapa de los pilares.
    const collapseExits = [...second.hiddenExits, ...top.hiddenExits].filter((h: { revela: { sala: number } }) => h.revela.sala === -1);
    assert.equal(collapseExits.length, 2);
    assert.ok(collapseExits.every((h: { revela: { map: number } }) => h.revela.map === 581));
    // Las salas de ojos: la de los dos ojos tiene una persiana que abren los ojos rotos.
    assert.ok(second.torre.salasOjos.length >= 1);
    const eyeRoom = second.torre.salasOjos.find((sala: number) => second.santuario.ojos.filter((eye: { sala: number }) => eye.sala === sala).length === 2);
    assert.ok(eyeRoom !== undefined, "la sala de los dos ojos");
    assert.ok(second.barriers.some((b: { tipo: string; salas: number[] }) => b.tipo === "placa" && b.salas.includes(eyeRoom)));
    // Llaves: tres chicas para tres cerraduras (una puerta y dos bloques) y la del jefe para la puerta del jefe de lo alto.
    const all = [ground, first, second, top];
    const count = (tipo: string) => all.reduce((n, mech) => n + mech.barriers.filter((b: { tipo: string }) => b.tipo === tipo).length, 0);
    const chests = (contenido: string) => all.reduce((n, mech) => n + mech.chests.filter((c: { contenido: string }) => c.contenido === contenido).length, 0);
    assert.equal(chests("llave"), 3);
    assert.equal(count("llave"), 3);
    assert.equal(count("jefe"), 1);
    assert.equal(chests("jefe"), 1);
    assert.equal(top.barriers.filter((b: { tipo: string }) => b.tipo === "jefe").length, 1);
    for (const contenido of ["pico", "mapa", "brujula", "caracola", "trofeo"]) assert.equal(chests(contenido), 1, contenido);
    assert.equal(chests("oro"), 4);
    assert.equal(chests("oroGrande"), 2);
    // La K1 la custodian los Tragones en una sala que se cierra; el Cíclope rojo también suelta una llave.
    const placed = (map: number, name: string) => Object.entries(specials(map).npcs as Record<string, number>).filter(([, id]) => npcs[id]?.name === name).map(([key]) => key);
    const tragones = placed(580, "Tragón");
    assert.ok(tragones.length >= 2 && tragones.every((key) => npcs[specials(580).npcs[key]].tragon));
    const keyRoom = ground.chests.find((c: { contenido: string; oculto: boolean }) => c.contenido === "llave" && c.oculto)!;
    assert.ok(tragones.some((key) => ground.roomOf[key] === keyRoom.sala) && ground.rooms.find((r: { id: number }) => r.id === keyRoom.sala)!.cierra);
    const cyclops = placed(581, "Cíclope rojo");
    assert.equal(cyclops.length, 1);
    assert.ok(npcs[specials(581).npcs[cyclops[0]]].ciclope);
    assert.ok(first.chests.some((c: { contenido: string; sala: number }) => c.contenido === "llave" && c.sala === first.roomOf[cyclops[0]]));
    // El Flautista: una sala que se cierra, con el portal-atajo a la Entrada escondido hasta vencerlo.
    const piper = placed(582, "Flautista");
    assert.equal(piper.length, 1);
    const piperTemplate = npcs[specials(582).npcs[piper[0]]];
    assert.ok(piperTemplate.flautista && piperTemplate.bandada === 6 && npcs[String(piperTemplate.murcielagos)]);
    const piperRoom = second.roomOf[piper[0]];
    assert.ok(second.rooms.find((r: { id: number }) => r.id === piperRoom)!.cierra);
    assert.ok(second.hiddenExits.some((h: { revela: { sala: number } }) => h.revela.sala === piperRoom) && ground.hiddenExits.some((h: { revela: { map: number; sala: number } }) => h.revela.map === 582 && h.revela.sala === piperRoom));
    // La Llave del jefe aparece al apretar las dos placas con los bloques.
    const bossKey = second.chests.find((c: { contenido: string }) => c.contenido === "jefe")!;
    assert.ok(bossKey.oculto);
    assert.equal(second.plates.filter((key: string) => second.roomOf[key] === bossKey.sala).length, 2);
    assert.equal(second.blocks.filter((key: string) => second.roomOf[key] === bossKey.sala).length, 2);
    // El Águila: en la terraza (una sala que se cierra, rodeada de vacío), con la escalera 7 siempre a la vista.
    const eagle = placed(583, "Águila Malvada");
    assert.equal(eagle.length, 1);
    const eagleTemplate = npcs[specials(583).npcs[eagle[0]]];
    assert.ok(eagleTemplate.aguila && eagleTemplate.jefe && eagleTemplate.idBody === 584);
    const terrace = top.rooms.find((r: { id: number }) => r.id === top.roomOf[eagle[0]])!;
    assert.ok(terrace.cierra && terrace.x2 - terrace.x1 >= 12 && terrace.y2 - terrace.y1 >= 6);
    const terraceExit = Object.keys(specials(583).exits).find((key) => top.roomOf[key] === terrace.id);
    assert.ok(terraceExit && !top.hiddenExits.some((h: { x: number; y: number }) => `${h.x},${h.y}` === terraceExit), "la escalera 7 no se esconde");
    assert.ok(top.pits.length >= 200, "el vacío alrededor de la terraza");
    // El trofeo está en la Sala del Órgano, detrás de una persiana que abre el Águila vencida.
    const trophy = top.chests.find((c: { contenido: string }) => c.contenido === "trofeo")!;
    assert.ok(top.barriers.some((b: { tipo: string; salas: number[] }) => b.tipo === "placa" && b.salas.includes(trophy.sala)));
    // Las criaturas con sus marcas y los Naipes en orden.
    for (const [map, flag] of [[580, "hechicero"], [580, "cuchilla"], [580, "chispa"], [581, "escondido"], [582, "mascara"], [581, "orden"]] as Array<[number, string]>) {
        assert.ok(Object.values(specials(map).npcs as Record<string, number>).some((id) => npcs[id]?.[flag]), `${flag} en ${map}`);
    }
    assert.deepEqual(["Naipe I", "Naipe II", "Naipe III"].map((name) => npcs[specials(581).npcs[placed(581, name)[0]]].orden), [1, 2, 3]);
    // La música: tres temas y el de combate, con sus créditos.
    const credits = fs.readFileSync(path.join(root, "docs/CREDITOS_SONIDOS.md"), "utf8");
    for (const file of [...def.musica.pistas, def.musica.combate]) {
        assert.ok(fs.existsSync(path.join(root, "frontend/public", file)), file);
        assert.ok(credits.includes(file.replace("/music/mazmorras/", "")), `créditos de ${file}`);
    }
});

test("la piel de la Gruta: el cliente ve los objetos de Ezequiel y el server sigue con los de siempre", () => {
    const run = dungeons.instanceMapId(590, 0);
    const mech = readJson("server/mapas_source/mapa_590/specials.json").dungeon;
    const objects = readJson("server/jsons/objs.json");
    const clientMap = readJson("frontend/public/static/maps_local/mapa_590.json")["590"];
    // Cada objeto de la piel existe y no se levanta.
    for (const id of [...Object.values(mech.piel.objetos), ...Object.values(mech.piel.porBaldosa).flatMap((tile) => Object.values(tile as object))]) {
        assert.ok(objects[String(id)], `objeto ${id}`);
        assert.equal(objects[String(id)].agarrable, 1);
    }
    // Lo que manda el server (renderItem) y lo que trae el mapa del cliente es lo mismo: la piel.
    for (const [key, info] of Object.entries(readJson("server/mapas_source/mapa_590/specials.json").objects) as Array<[string, { objIndex: number }]>) {
        const [x, y] = key.split(",").map(Number);
        const shown = dungeons.skinObject(run, { x, y }, info.objIndex);
        assert.equal(clientMap[String(y)][String(x)].objInfo.objIndex, shown, `(${key})`);
        assert.equal(dungeons.skinObject(590, { x, y }, info.objIndex), shown, `(${key}) en el mapa base`);
    }
    // Cada puerta según su tipo; la abierta y la cerrada de las laterales gruesas, distintas.
    const door = (tipo: string) => mech.barriers.find((barrier: { tipo: string }) => barrier.tipo === tipo);
    const llave = door("llave");
    assert.notEqual(dungeons.skinObject(run, llave, DUNGEON_OBJECT_IDS.puerta), DUNGEON_OBJECT_IDS.puerta);
    const lateral = mech.barriers.find((barrier: { horizontal: boolean }) => !barrier.horizontal);
    assert.notEqual(dungeons.skinObject(run, lateral, DUNGEON_OBJECT_IDS.barrera), dungeons.skinObject(run, lateral, DUNGEON_OBJECT_IDS.puertaAbierta));
    // Las otras mazmorras y el mundo no cambian.
    assert.equal(dungeons.skinObject(dungeons.instanceMapId(580, 0), { x: 10, y: 10 }, DUNGEON_OBJECT_IDS.cofre), DUNGEON_OBJECT_IDS.cofre);
    assert.equal(dungeons.skinObject(34, { x: 50, y: 50 }, DUNGEON_OBJECT_IDS.cofre), DUNGEON_OBJECT_IDS.cofre);
});
