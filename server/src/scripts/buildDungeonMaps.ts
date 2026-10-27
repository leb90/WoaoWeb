// Arma los mapas de una mazmorra desde sus planos en texto (server/mazmorras/<id>/), con las texturas del dungeon
// del mapa 116, y escribe las mismas copias que el editor de mapas: server y api (mapas_source) y cliente
// (static/maps_local, que es lo que carga para los mapas 500-599, y maps). También anota en jsons/dungeons.json
// la entrada (E) y las salidas (S) que marca el plano.
//   pnpm --dir server exec tsx src/scripts/buildDungeonMaps.ts prueba
//
// Plano (mapa_<N>.txt): unas líneas "clave: valor" (nombre, musica, origen x,y, restringir), una línea "---" y el dibujo, un
// carácter por baldosa, ubicado en el origen; lo que queda afuera es vacío.
//   #  pared: si abajo hay piso a 4 o menos, se dibuja la cara de la pared; si no, piedra oscura
//   .  piso          ~  agua profunda (se nada con el ítem de la mazmorra)        (espacio)  vacío
//   E  entrada (piso) S  portal de salida
//   1-9 escalera: une las dos escaleras con el mismo número en dos mapas de la mazmorra
//   minúsculas: criaturas, según "criaturas" en leyenda.json
// Mecánicas (dungeons.ts). Las salas se detectan solas: cada zona de piso cerrada por paredes y puertas.
//   L  puerta con llave chica     J  puerta de la llave del jefe
//   +  puerta de sala: abierta, se cierra cuando la sala se cierra
//   =  puerta que se abre al resolver una de las salas que separa: apretar sus placas o encender sus antorchas
//   !  esta sala se cierra al entrar hasta matar a sus criaturas (sus cofres aparecen al vaciarla)
//   O  pozo          ^  lava (quema al pisarla)          %  lava que erupciona cada tanto
//   _  placa (se aprieta con un jugador o un bloque encima)          B  bloque que se empuja con un clic
//   ?  losa de piedra (texto en "losas" de leyenda.json, en orden de lectura)
//   cofres: K llave chica, N llave del jefe, M mapa, X brújula, $ oro, G oro grande, R ítem de la mazmorra, T trampa,
//           Y cofre del jefe (trofeo y oro, una vez por día), C caracola secreta (una por mazmorra)
// Caverna de las Llaves (la Carrera y el salto, dungeonMotion.ts):
//   *  bloque de cristal (lo rompe la Carrera)      :  piso que se desmorona (se cruza corriendo o saltando)
//   P  runa con tiempo (abre las puertas Q por unos segundos)      Q  reja que abre la runa con tiempo
//   W  pared rajada (tiembla con la Carrera; en la arena del jefe, lo baja)      Z  aplastador
//   < > { }  puerta de un solo sentido hacia el oeste, el este, el norte y el sur
// Cueva de la Cola:
//   &  bloque con cerradura (se abre con una llave chica y desaparece)
//   ,  piso que las criaturas no pisan (los puentes de la arena del Ciempiés)
//   D  adonde se cae desde los pozos de otro mapa (el plano de ese mapa dice "caida: <este mapa>")
// Roca de la Tortuga (el Polvo de Fuego, el Gancho y el Brazalete de Fuerza, dungeonTools.ts):
//   F  antorcha apagada (se enciende con el Polvo; si la sala tiene cofres, aparecen al encender todas)
//   A  antorcha encendida      I  bloque de hielo (lo derrite el Polvo)      H  estatua (se engancha con el Gancho)
//   U  vasija    V  vasija sobre una placa    ;  piedra suelta (se levantan y se tiran con el Brazalete de Fuerza)
//   ]  piedra pesada (solo con el Brazalete de Fuerza II)
// Mecánicas compartidas (Roca de la Tortuga y Gruta de la Botella):
//   0  cofre del pico de piedra      /  estatua búho: habla (texto en "buhos" de leyenda.json) si el grupo tiene el pico
//   (  bloque azul (arranca levantado)      )  bloque naranja (arranca bajado)      |  cristal: al golpearlo se
//      invierten los bloques de color de toda la corrida      "  remolino: arrastra hacia el centro y lleva a la entrada
//   Las salas con antorchas (F o A) están a oscuras mientras quede alguna apagada.
// Gruta de la Botella:
//   -  placa de peso: solo se aprieta si el que la pisa carga algo con el Brazalete (cuenta para las puertas =)
//   Las escaleras de una sala con placas aparecen al apretarlas todas (los bloques que abren la escalera A), y los
//   cofres de una sala con criaturas "orden" aparecen al matarlas en orden.
// Santuario del Rostro:
//   ♜  estatua pesada (solo con el Brazalete nivel 2)      ♞  cabeza de caballo: se tira y cae parada o acostada; con
//      todas las de la sala paradas, la sala se resuelve (abre sus puertas =)      [  persiana: se abre tirándole algo
//   Ñ  cofre de la llave del jefe trabado: se abre tirándole algo
//   ▦  baldosa voladora (se despega y vuela hacia el jugador)      ▩  la que deja un pozo; romperlas todas resuelve la sala
//   → ← ↑ ↓  cinta transportadora      ♨  lanzallamas (escupe fuego hacia la sala)      ◉  ojo de piedra (rayo)
// Bombas (los básicos que tiene todo el mundo):
//   @  pared rajada: un paso tapado que se abre con una bomba (arco tapiado en una pared horizontal, rocas en una vertical)
// Lo que aparece: los cofres de una sala que se cierra (!), que tiene placas o antorchas apagadas aparecen al vaciarla,
// al apretar las placas o al encender las antorchas; las escaleras de una sala que se cierra (y la otra punta)
// aparecen al vaciarla.
// Las puertas van en pasos de una baldosa: en una pared horizontal se ven como un arco de piedra; en una vertical,
// como un cristal que tapa el paso.
// leyenda.json puede traer "plantillas": criaturas propias de la mazmorra, armadas sobre una de AO ("base") con sus
// cambios (nombre, cuerpo, vida y las marcas de dungeons.ts: despierta, pareja, revivirMs, flota, divide; de
// dungeonHazards.ts: chispa, cuchilla, rodillo, empuja; de dungeonBoss.ts: ciempies). También "graficos" (piso y pared
// propios, bloques de 4 × 4), "portales" (escaleras que se ven como portal, por número) y "siempreVisibles" (escaleras
// que no se esconden aunque lleguen a una sala que se cierra).
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(__dirname, "../../..");
const SIZE = 100;
const DEFAULT_FLOOR_GRH = 9428; // bloque de 4×4 del piso verde del mapa 116
const DEFAULT_WALL_FACE_GRH = 9412; // bloque de 4×4 de la cara de las paredes
const VOID_GRH = 1; // negro
const WATER_GRH = 1505; // bloque de 4×4 de agua (waterTiles.ts)
const PORTAL_OBJ = 378; // Teleport (portal azul, no se puede levantar)
const STAIRS_OBJ = 1198; // Escalera Grande
const LAVA_GRHS = [9487, 9488, 9489, 9490, 9491, 9492, 9493, 9494, 9495]; // piso de lava del mapa 162
// Trigger que las criaturas no pisan (POSINVALIDA del AO original): pozos, lava y puertas, así ninguna sale de su
// sala (como en Zelda) y la sala que se cierra las encierra a todas.
const NO_NPC_TRIGGER = 2;
// Objetos de mazmorra (tipo 0, no se levantan): se crean o actualizan en objs.json al correr el generador.
export const DUNGEON_OBJECTS = {
    cofre: { id: 1832, name: "Cofre de mazmorra", grh: 18532 },
    cofreAbierto: { id: 1833, name: "Cofre de mazmorra abierto", grh: 502 },
    puerta: { id: 1834, name: "Puerta de piedra", grh: 9193 },
    puertaAbierta: { id: 1835, name: "Puerta de piedra abierta", grh: 9199 },
    bloque: { id: 1836, name: "Bloque de piedra", grh: 8623 },
    placa: { id: 1837, name: "Runa del suelo", grh: 36796 },
    placaApretada: { id: 1838, name: "Runa del suelo encendida", grh: 36797 },
    losa: { id: 1839, name: "Losa de piedra", grh: 513 },
    barrera: { id: 1840, name: "Barrera de cristal", grh: 18543 },
    cristal: { id: 1841, name: "Bloque de cristal", grh: 18542 },
    pisoRajado: { id: 1842, name: "Baldosa rajada", grh: 8629 },
    hueco: { id: 1843, name: "Hueco", grh: 1 },
    runaTiempo: { id: 1844, name: "Runa del tiempo", grh: 36798 },
    runaTiempoEncendida: { id: 1845, name: "Runa del tiempo encendida", grh: 36797 },
    paredRajada: { id: 1846, name: "Pared rajada", grh: 2161 },
    losaAplastador: { id: 1847, name: "Losa del aplastador", grh: 9413 },
    aplastador: { id: 1848, name: "Aplastador", grh: 8623 },
    cofreJefe: { id: 1849, name: "Cofre del jefe", grh: 18532 },
    rodillo: { id: 1851, name: "Rodillo de púas", grh: 18537 },
    // Roca de la Tortuga: lo que tocan el Polvo de Fuego, el Gancho y el Brazalete de Fuerza (docs/CREDITOS_GRAFICOS.md).
    vasija: { id: 1852, name: "Vasija", grh: 38215 },
    piedra: { id: 1853, name: "Piedra suelta", grh: 38216 },
    hielo: { id: 1854, name: "Bloque de hielo", grh: 38217 },
    poste: { id: 1855, name: "Estatua de piedra", grh: 38218 },
    antorchaApagada: { id: 1856, name: "Antorcha apagada", grh: 38219 },
    antorchaEncendida: { id: 1857, name: "Antorcha encendida", grh: 38229 },
    // Pared que se vuela con una bomba: un arco tapiado (pared horizontal) o un montón de rocas (vertical).
    paredBombeable: { id: 1858, name: "Pared rajada", grh: 38230 },
    rocas: { id: 1859, name: "Rocas sueltas", grh: 38231 },
    // Piedra pesada: solo la levanta el Brazalete de Fuerza II.
    piedraPesada: { id: 1860, name: "Piedra pesada", grh: 38232 },
    // Mecánicas compartidas de la Roca de la Tortuga y la Gruta de la Botella.
    buho: { id: 1861, name: "Estatua búho", grh: 42253 },
    bloqueAzul: { id: 1862, name: "Bloque azul", grh: 42249 },
    bloqueAzulBajo: { id: 1863, name: "Bloque azul bajado", grh: 42250 },
    bloqueNaranja: { id: 1864, name: "Bloque naranja", grh: 42251 },
    bloqueNaranjaBajo: { id: 1865, name: "Bloque naranja bajado", grh: 42252 },
    cristalAzul: { id: 1866, name: "Cristal azul", grh: 18543 },
    cristalNaranja: { id: 1867, name: "Cristal naranja", grh: 18544 },
    remolino: { id: 1868, name: "Remolino", grh: 42266 },
    // La botella del Genio (dungeonGrotto.ts): no va en el plano; es lo que se ve al levantarla y tirarla.
    botellaGenio: { id: 1869, name: "Botella del Genio", grh: 42287 },
    // Santuario del Rostro (dungeonShrine.ts).
    estatuaPesada: { id: 1870, name: "Estatua pesada", grh: 42289 },
    cabezaParada: { id: 1871, name: "Cabeza de caballo (parada)", grh: 42290 },
    cabezaAcostada: { id: 1872, name: "Cabeza de caballo (acostada)", grh: 42291 },
    baldosaVoladora: { id: 1873, name: "Baldosa con dibujo", grh: 42292 },
    pozoAbierto: { id: 1874, name: "Pozo", grh: 42293 },
    cintaNorte: { id: 1875, name: "Cinta transportadora", grh: 42294 },
    cintaSur: { id: 1876, name: "Cinta transportadora", grh: 42295 },
    cintaEste: { id: 1877, name: "Cinta transportadora", grh: 42296 },
    cintaOeste: { id: 1878, name: "Cinta transportadora", grh: 42297 },
    lanzallamas: { id: 1879, name: "Lanzallamas", grh: 42298 },
    ojoDePiedra: { id: 1880, name: "Ojo de piedra", grh: 42299 },
} as const;
const CONVEYOR_DIR: Record<string, string> = { "↑": "norte", "↓": "sur", "→": "este", "←": "oeste" };
const CHEST_CONTENT: Record<string, string> = {
    K: "llave",
    N: "jefe",
    M: "mapa",
    X: "brujula",
    $: "oro",
    G: "oroGrande",
    R: "premio",
    T: "trampa",
    Y: "trofeo",
    C: "caracola",
    "0": "pico",
    // La llave del jefe del Santuario del Rostro, en un cofre trabado que se abre tirándole algo.
    Ñ: "jefe",
};
const BARRIER_TYPE: Record<string, string> = {
    L: "llave",
    J: "jefe",
    "+": "sala",
    "=": "placa",
    Q: "tiempo",
    "<": "unica",
    ">": "unica",
    "{": "unica",
    "}": "unica",
    "&": "llave",
    "@": "bomba",
    "[": "golpe",
};
const ONE_WAY_DIR: Record<string, string> = { "<": "oeste", ">": "este", "{": "norte", "}": "sur" };
// Puertas que arrancan abiertas (no bloquean).
const OPEN_BARRIERS = new Set(["+", "<", ">", "{", "}"]);

type Tile = {
    graphics: number;
    blocked?: boolean;
    trigger?: number;
    object?: number;
    npc?: number;
    exit?: { map: number; x: number; y: number };
};
type Plan = { mapId: number; meta: Record<string, string>; origin: { x: number; y: number }; grid: string[] };
type Legend = {
    criaturas?: Record<string, number | { npc: number; movimiento?: number }>;
    // Textos de las losas de cada mapa, en orden de lectura (de arriba abajo y de izquierda a derecha).
    losas?: Record<string, string[]>;
    // Lo que dice cada búho de cada mapa, en orden de lectura (solo con el pico de piedra).
    buhos?: Record<string, string[]>;
    // Oro de cada cofre de oro y de cada cofre de oro grande.
    oro?: number;
    oroGrande?: number;
    // Criaturas que suelta un cofre trampa.
    trampa?: number[];
    // Criaturas propias de la mazmorra: número → plantilla de AO de base y los cambios.
    plantillas?: Record<string, { base: number } & Record<string, unknown>>;
    // Piso y cara de pared propios (bloques de 4 × 4); sin esto, los del mapa 116.
    graficos?: { piso?: number; pared?: number };
    // Escaleras (por número) que se ven como portal: el atajo de la Cueva de la Cola.
    portales?: string[];
    // Escaleras (por número) que llegan a una sala que se cierra y se ven siempre: se llega por ellas y la sala se
    // cierra hasta vaciarla (la F del Santuario del Rostro).
    siempreVisibles?: string[];
};

const dungeonId = process.argv[2];
if (!dungeonId) {
    console.error("Uso: tsx src/scripts/buildDungeonMaps.ts <mazmorra>");
    process.exit(1);
}
const planDir = path.join(ROOT, "server/mazmorras", dungeonId);
const legend: Legend = fs.existsSync(path.join(planDir, "leyenda.json"))
    ? JSON.parse(fs.readFileSync(path.join(planDir, "leyenda.json"), "utf8"))
    : {};
const FLOOR_GRH = Number(legend.graficos?.piso ?? DEFAULT_FLOOR_GRH);
const WALL_FACE_GRH = Number(legend.graficos?.pared ?? DEFAULT_WALL_FACE_GRH);
const portalDigits = new Set(legend.portales ?? []);

function readPlan(file: string): Plan {
    const mapId = Number(/mapa_(\d+)\.txt$/.exec(file)?.[1]);
    const text = fs.readFileSync(path.join(planDir, file), "utf8").replace(/\r/g, "");
    const [head, ...rest] = text.split("\n---\n");
    const meta: Record<string, string> = {};
    for (const line of head.split("\n")) {
        const match = /^\s*([a-zñ]+)\s*:\s*(.*)$/i.exec(line);
        if (match) meta[match[1].toLowerCase()] = match[2].trim();
    }
    const [ox, oy] = (meta.origen ?? "1,1").split(",").map((v) => Number(v.trim()));
    const grid = rest.join("\n---\n").split("\n");
    while (grid.length && !grid[grid.length - 1].trim()) grid.pop();
    return { mapId, meta, origin: { x: ox, y: oy }, grid };
}

const plans = fs
    .readdirSync(planDir)
    .filter((file) => /^mapa_\d+\.txt$/.test(file))
    .map(readPlan)
    .sort((a, b) => a.mapId - b.mapId);

const charAt = (plan: Plan, x: number, y: number) => plan.grid[y - plan.origin.y]?.[x - plan.origin.x] ?? " ";
const isWall = (c: string) => c === "#" || c === "W";
const isOpen = (c: string) => !isWall(c) && c !== " ";
const isBarrier = (c: string) => c in BARRIER_TYPE;
// Lo que forma parte de una sala (las puertas la cierran).
const isRoomTile = (c: string) => isOpen(c) && !isBarrier(c);
const block4 = (base: number, x: number, y: number, row?: number) => base + (row ?? (y - 1) % 4) * 4 + ((x - 1) % 4);

// Escaleras: dónde está cada número en cada mapa.
const stairs = new Map<string, Array<{ mapId: number; x: number; y: number }>>();
const markers: {
    entrada?: { map: number; x: number; y: number };
    salidas: Array<{ map: number; x: number; y: number }>;
    // Adonde se cae en cada mapa (D).
    caidas: Map<number, { map: number; x: number; y: number }>;
} = { salidas: [], caidas: new Map() };
for (const plan of plans) {
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            const c = charAt(plan, x, y);
            if (/[1-9]/.test(c)) stairs.set(c, [...(stairs.get(c) ?? []), { mapId: plan.mapId, x, y }]);
            if (c === "E") markers.entrada = { map: plan.mapId, x, y };
            if (c === "S") markers.salidas.push({ map: plan.mapId, x, y });
            if (c === "D") markers.caidas.set(plan.mapId, { map: plan.mapId, x, y });
        }
    }
}

// Al bajar una escalera se llega a la baldosa libre de al lado de la otra (no encima, si no rebotaría).
function arrivalNextTo(target: { mapId: number; x: number; y: number }) {
    const plan = plans.find((p) => p.mapId === target.mapId)!;
    for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const c = charAt(plan, target.x + dx, target.y + dy);
        if (c === "." || c === "E" || c === "D" || c === ",") return { map: target.mapId, x: target.x + dx, y: target.y + dy };
    }
    throw new Error(`La escalera de ${target.mapId} (${target.x},${target.y}) no tiene piso al lado.`);
}

// Salas: zonas de piso unidas por los lados, cortadas por paredes y puertas.
type Room = { id: number; x1: number; y1: number; x2: number; y2: number; cierra: boolean; tiles: number };
function detectRooms(plan: Plan) {
    const roomOf = new Map<string, number>();
    const rooms: Room[] = [];
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            if (roomOf.has(`${x},${y}`) || !isRoomTile(charAt(plan, x, y))) continue;
            const room: Room = { id: rooms.length + 1, x1: x, y1: y, x2: x, y2: y, cierra: false, tiles: 0 };
            const queue = [[x, y]];
            roomOf.set(`${x},${y}`, room.id);
            while (queue.length) {
                const [cx, cy] = queue.pop()!;
                room.tiles++;
                room.x1 = Math.min(room.x1, cx);
                room.y1 = Math.min(room.y1, cy);
                room.x2 = Math.max(room.x2, cx);
                room.y2 = Math.max(room.y2, cy);
                if (charAt(plan, cx, cy) === "!") room.cierra = true;
                for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const key = `${cx + dx},${cy + dy}`;
                    if (!roomOf.has(key) && isRoomTile(charAt(plan, cx + dx, cy + dy))) {
                        roomOf.set(key, room.id);
                        queue.push([cx + dx, cy + dy]);
                    }
                }
            }
            rooms.push(room);
        }
    }
    return { rooms, roomOf };
}

const roomsByMap = new Map(plans.map((plan) => [plan.mapId, detectRooms(plan)]));
// Salas con placas (sus cofres aparecen al apretarlas todas).
const plateRooms = new Set<string>();
for (const plan of plans) {
    const { roomOf } = roomsByMap.get(plan.mapId)!;
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            const plate = charAt(plan, x, y);
            if ((plate === "_" || plate === "V" || plate === "-") && roomOf.has(`${x},${y}`)) plateRooms.add(`${plan.mapId}:${roomOf.get(`${x},${y}`)}`);
        }
    }
}
// Salas con criaturas que se matan en orden (plantillas con "orden"): sus cofres aparecen al terminar.
const orderRooms = new Set<string>();
{
    const serverNpcs = JSON.parse(fs.readFileSync(path.join(ROOT, "server/jsons/npcs.json"), "utf8"));
    const hasOrder = (id: number) => Boolean((legend.plantillas?.[String(id)] as { orden?: number } | undefined)?.orden ?? serverNpcs[String(id)]?.orden);
    for (const plan of plans) {
        const { roomOf } = roomsByMap.get(plan.mapId)!;
        for (let y = 1; y <= SIZE; y++) {
            for (let x = 1; x <= SIZE; x++) {
                const c = charAt(plan, x, y);
                const entry = /[a-z]/.test(c) ? legend.criaturas?.[c] : undefined;
                const id = typeof entry === "number" ? entry : entry?.npc;
                if (id && hasOrder(id) && roomOf.has(`${x},${y}`)) orderRooms.add(`${plan.mapId}:${roomOf.get(`${x},${y}`)}`);
            }
        }
    }
}
// Salas con antorchas apagadas (sus cofres aparecen al encenderlas todas con el Polvo de Fuego).
const torchRooms = new Set<string>();
for (const plan of plans) {
    const { roomOf } = roomsByMap.get(plan.mapId)!;
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            if (charAt(plan, x, y) === "F" && roomOf.has(`${x},${y}`)) torchRooms.add(`${plan.mapId}:${roomOf.get(`${x},${y}`)}`);
        }
    }
}
// Salas con baldosas voladoras (sus cofres aparecen al romperlas todas).
const flyingTileRooms = new Set<string>();
for (const plan of plans) {
    const { roomOf } = roomsByMap.get(plan.mapId)!;
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            const c = charAt(plan, x, y);
            if ((c === "▦" || c === "▩") && roomOf.has(`${x},${y}`)) flyingTileRooms.add(`${plan.mapId}:${roomOf.get(`${x},${y}`)}`);
        }
    }
}
// Hacia dónde escupe un lanzallamas: hacia la sala, del lado contrario a la pared que tiene pegada (si no, hacia donde
// hay más piso libre en línea).
function shooterDir(plan: Plan, x: number, y: number): string {
    const dirs: Array<[string, number, number]> = [["norte", 0, -1], ["sur", 0, 1], ["este", 1, 0], ["oeste", -1, 0]];
    for (const [name, dx, dy] of dirs) {
        if (isWall(charAt(plan, x - dx, y - dy)) && isOpen(charAt(plan, x + dx, y + dy))) return name;
    }
    let best = "sur";
    let bestRun = -1;
    for (const [name, dx, dy] of dirs) {
        let run = 0;
        while (run < 20 && isOpen(charAt(plan, x + dx * (run + 1), y + dy * (run + 1)))) run++;
        if (run > bestRun) {
            best = name;
            bestRun = run;
        }
    }
    return best;
}
// Los cofres de las salas que se cierran no se ven hasta vaciarlas; los de las salas con placas, hasta apretarlas;
// los de las salas con antorchas apagadas, hasta encenderlas; los de las salas con baldosas voladoras, hasta romperlas.
const hiddenChests = new Set<string>();
for (const plan of plans) {
    const { rooms, roomOf } = roomsByMap.get(plan.mapId)!;
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            if (!(charAt(plan, x, y) in CHEST_CONTENT)) continue;
            const roomId = roomOf.get(`${x},${y}`);
            const room = rooms.find((r) => r.id === roomId);
            const roomKey = `${plan.mapId}:${roomId}`;
            if (room?.cierra || plateRooms.has(roomKey) || torchRooms.has(roomKey) || orderRooms.has(roomKey) || flyingTileRooms.has(roomKey)) {
                hiddenChests.add(`${plan.mapId}:${x},${y}`);
            }
        }
    }
}
// Las escaleras de una sala que se cierra aparecen al vaciarla, y su otra punta también.
const hiddenExits = new Map<number, Array<{ x: number; y: number; revela: { map: number; sala: number } }>>();
const alwaysVisible = new Set(legend.siempreVisibles ?? []);
for (const [digit, ends] of stairs) {
    if (alwaysVisible.has(digit)) continue;
    for (const end of ends) {
        const { rooms, roomOf } = roomsByMap.get(end.mapId)!;
        const roomId = roomOf.get(`${end.x},${end.y}`) ?? [[0, 1], [1, 0], [-1, 0], [0, -1]]
            .map(([dx, dy]) => roomOf.get(`${end.x + dx},${end.y + dy}`))
            .find((id) => id !== undefined);
        // Aparecen al vaciar una sala que se cierra o al apretar todas las placas de su sala.
        if (!rooms.find((r) => r.id === roomId)?.cierra && !plateRooms.has(`${end.mapId}:${roomId}`)) continue;
        for (const other of ends) {
            hiddenExits.set(other.mapId, [...(hiddenExits.get(other.mapId) ?? []), { x: other.x, y: other.y, revela: { map: end.mapId, sala: roomId! } }]);
        }
    }
}

// Datos de mecánicas que lee dungeons.ts (clave "dungeon" de specials.json; el server no la usa para otra cosa).
function buildMechanics(plan: Plan) {
    const { rooms, roomOf } = roomsByMap.get(plan.mapId)!;
    const slabTexts = legend.losas?.[String(plan.mapId)] ?? [];
    const owlTexts = legend.buhos?.[String(plan.mapId)] ?? [];
    const data = {
        rooms: rooms.map(({ id, x1, y1, x2, y2, cierra }) => ({ id, x1, y1, x2, y2, cierra })),
        roomOf: Object.fromEntries(roomOf),
        barriers: [] as Array<{ x: number; y: number; tipo: string; horizontal: boolean; salas: number[]; dir?: string }>,
        pits: [] as string[],
        lava: [] as string[],
        lavaPeriodica: [] as string[],
        plates: [] as string[],
        blocks: [] as string[],
        chests: [] as Array<{ x: number; y: number; contenido: string; oculto: boolean; sala: number }>,
        slabs: [] as Array<{ x: number; y: number; texto: string }>,
        oro: Number(legend.oro ?? 250),
        oroGrande: Number(legend.oroGrande ?? 4 * Number(legend.oro ?? 250)),
        trampa: legend.trampa ?? [],
        crystals: [] as string[],
        fragile: [] as string[],
        timedPlates: [] as string[],
        crackedWalls: [] as string[],
        crushers: [] as string[],
        hiddenExits: hiddenExits.get(plan.mapId) ?? [],
        caida: null as { map: number; x: number; y: number } | null,
        // Roca de la Tortuga: antorchas, hielo, lo que se levanta con el Brazalete y las estatuas del Gancho.
        torches: [] as Array<{ x: number; y: number; encendida: boolean; sala: number }>,
        ice: [] as string[],
        liftables: [] as Array<{ x: number; y: number; tipo: "vasija" | "piedra" | "pesada" | "estatua"; placa: boolean }>,
        hookPosts: [] as string[],
        // Mecánicas compartidas: búhos, bloques de color, cristales y remolinos.
        owls: [] as Array<{ x: number; y: number; texto: string }>,
        colorBlocks: { azul: [] as string[], naranja: [] as string[] },
        switches: [] as string[],
        vortexes: [] as string[],
        weightPlates: [] as string[],
        // Santuario del Rostro (dungeonShrine.ts).
        santuario: {
            cabezas: [] as Array<{ x: number; y: number; sala: number }>,
            baldosas: [] as Array<{ x: number; y: number; pozo: boolean; sala: number }>,
            cintas: [] as Array<{ x: number; y: number; dir: string }>,
            lanzallamas: [] as Array<{ x: number; y: number; dir: string; sala: number }>,
            ojos: [] as Array<{ x: number; y: number; sala: number }>,
        },
    };
    if (plan.meta.caida) {
        const caida = markers.caidas.get(Number(plan.meta.caida));
        if (!caida) throw new Error(`El mapa ${plan.mapId} dice "caida: ${plan.meta.caida}", pero ese mapa no tiene una D.`);
        data.caida = caida;
    }
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            const c = charAt(plan, x, y);
            const key = `${x},${y}`;
            if (isBarrier(c)) {
                const salas = [[1, 0], [-1, 0], [0, 1], [0, -1]]
                    .map(([dx, dy]) => roomOf.get(`${x + dx},${y + dy}`))
                    .filter((id): id is number => Boolean(id));
                data.barriers.push({
                    x,
                    y,
                    tipo: BARRIER_TYPE[c],
                    horizontal: isWall(charAt(plan, x - 1, y)) && isWall(charAt(plan, x + 1, y)),
                    salas: [...new Set(salas)],
                    ...(ONE_WAY_DIR[c] ? { dir: ONE_WAY_DIR[c] } : {}),
                    ...(c === "&" ? { bloque: true } : {}),
                });
            }
            if (c === "*") data.crystals.push(key);
            if (c === ":") data.fragile.push(key);
            if (c === "P") data.timedPlates.push(key);
            if (c === "W") data.crackedWalls.push(key);
            if (c === "Z") data.crushers.push(key);
            if (c === "O") data.pits.push(key);
            if (c === "^") data.lava.push(key);
            if (c === "%") data.lavaPeriodica.push(key);
            if (c === "_" || c === "V" || c === "-") data.plates.push(key);
            if (c === "-") data.weightPlates.push(key);
            if (c === "B") data.blocks.push(key);
            if (c === "F" || c === "A") data.torches.push({ x, y, encendida: c === "A", sala: roomOf.get(key) ?? 0 });
            if (c === "I") data.ice.push(key);
            if (c === "U" || c === "V" || c === ";" || c === "]" || c === "♜") {
                data.liftables.push({ x, y, tipo: c === ";" ? "piedra" : c === "]" ? "pesada" : c === "♜" ? "estatua" : "vasija", placa: c === "V" });
            }
            const sala = roomOf.get(key) ?? 0;
            if (c === "♞") data.santuario.cabezas.push({ x, y, sala });
            if (c === "▦" || c === "▩") data.santuario.baldosas.push({ x, y, pozo: c === "▩", sala });
            if (c in CONVEYOR_DIR) data.santuario.cintas.push({ x, y, dir: CONVEYOR_DIR[c] });
            if (c === "♨") data.santuario.lanzallamas.push({ x, y, dir: shooterDir(plan, x, y), sala });
            if (c === "◉") data.santuario.ojos.push({ x, y, sala });
            if (c === "H") data.hookPosts.push(key);
            if (c === "/") data.owls.push({ x, y, texto: owlTexts[data.owls.length] ?? "El búho no dice nada." });
            if (c === "(") data.colorBlocks.azul.push(key);
            if (c === ")") data.colorBlocks.naranja.push(key);
            if (c === "|") data.switches.push(key);
            if (c === '"') data.vortexes.push(key);
            if (c in CHEST_CONTENT) {
                data.chests.push({
                    x,
                    y,
                    contenido: CHEST_CONTENT[c],
                    oculto: hiddenChests.has(`${plan.mapId}:${key}`),
                    sala: roomOf.get(key) ?? 0,
                    ...(c === "Ñ" ? { golpe: true } : {}),
                });
            }
            if (c === "?") data.slabs.push({ x, y, texto: slabTexts[data.slabs.length] ?? "La losa está gastada: no se puede leer." });
        }
    }
    return data;
}

function buildTile(plan: Plan, x: number, y: number): Tile {
    const c = charAt(plan, x, y);
    if (c === " ") return { graphics: VOID_GRH, blocked: true };
    if (isWall(c)) {
        // Cara de la pared si hay piso abajo a 4 baldosas o menos; la fila de la textura depende de la distancia.
        let distance = 1;
        while (distance <= 4 && isWall(charAt(plan, x, y + distance))) distance++;
        const object = c === "W" ? DUNGEON_OBJECTS.paredRajada.id : undefined;
        if (distance <= 4 && isOpen(charAt(plan, x, y + distance))) {
            return { graphics: block4(WALL_FACE_GRH, x, y, 4 - distance), blocked: true, object };
        }
        return { graphics: VOID_GRH, blocked: true, object };
    }
    if (c === "~") return { graphics: block4(WATER_GRH, x, y) };
    if (c === "O") return { graphics: VOID_GRH, trigger: NO_NPC_TRIGGER };
    if (c === "^" || c === "%") return { graphics: LAVA_GRHS[(x * 7 + y * 3) % LAVA_GRHS.length], trigger: NO_NPC_TRIGGER };
    const tile: Tile = { graphics: block4(FLOOR_GRH, x, y) };
    if (c === "S") tile.object = PORTAL_OBJ;
    if (isBarrier(c)) {
        const horizontal = isWall(charAt(plan, x - 1, y)) && isWall(charAt(plan, x + 1, y));
        const open = OPEN_BARRIERS.has(c);
        tile.object =
            c === "&"
                ? DUNGEON_OBJECTS.puerta.id
                : horizontal
                  ? open
                      ? DUNGEON_OBJECTS.puertaAbierta.id
                      : DUNGEON_OBJECTS.puerta.id
                  : open
                    ? undefined
                    : DUNGEON_OBJECTS.barrera.id;
        if (c === "@") tile.object = horizontal ? DUNGEON_OBJECTS.paredBombeable.id : DUNGEON_OBJECTS.rocas.id;
        tile.blocked = !open;
        tile.trigger = NO_NPC_TRIGGER;
    }
    if (c === "_" || c === "-") tile.object = DUNGEON_OBJECTS.placa.id;
    if (c === "P") tile.object = DUNGEON_OBJECTS.runaTiempo.id;
    if (c === "*") {
        tile.object = DUNGEON_OBJECTS.cristal.id;
        tile.blocked = true;
    }
    // Las criaturas no pisan el piso que se desmorona ni los aplastadores.
    if (c === ":") {
        tile.object = DUNGEON_OBJECTS.pisoRajado.id;
        tile.trigger = NO_NPC_TRIGGER;
    }
    if (c === "Z") {
        tile.object = DUNGEON_OBJECTS.losaAplastador.id;
        tile.trigger = NO_NPC_TRIGGER;
    }
    if (c === ",") tile.trigger = NO_NPC_TRIGGER;
    if (c === "B") {
        tile.object = DUNGEON_OBJECTS.bloque.id;
        tile.blocked = true;
    }
    if (c === "?") {
        tile.object = DUNGEON_OBJECTS.losa.id;
        tile.blocked = true;
    }
    // Roca de la Tortuga: F antorcha apagada, A encendida, I hielo, U vasija, V vasija sobre una placa, ; piedra
    // suelta y H estatua para el Gancho. Todo tapa el paso hasta que se lo enciende, derrite o levanta.
    const tortoiseObject: Record<string, number> = {
        F: DUNGEON_OBJECTS.antorchaApagada.id,
        A: DUNGEON_OBJECTS.antorchaEncendida.id,
        I: DUNGEON_OBJECTS.hielo.id,
        U: DUNGEON_OBJECTS.vasija.id,
        V: DUNGEON_OBJECTS.vasija.id,
        ";": DUNGEON_OBJECTS.piedra.id,
        "]": DUNGEON_OBJECTS.piedraPesada.id,
        H: DUNGEON_OBJECTS.poste.id,
        // Santuario del Rostro: la estatua pesada, la cabeza de caballo (arranca acostada), el lanzallamas y el ojo.
        "♜": DUNGEON_OBJECTS.estatuaPesada.id,
        "♞": DUNGEON_OBJECTS.cabezaAcostada.id,
        "♨": DUNGEON_OBJECTS.lanzallamas.id,
        "◉": DUNGEON_OBJECTS.ojoDePiedra.id,
    };
    if (c in tortoiseObject) {
        tile.object = tortoiseObject[c];
        tile.blocked = true;
    }
    // Búhos, bloques de color (los azules arrancan levantados), cristales y remolinos.
    if (c === "/") {
        tile.object = DUNGEON_OBJECTS.buho.id;
        tile.blocked = true;
    }
    if (c === "(") {
        tile.object = DUNGEON_OBJECTS.bloqueAzul.id;
        tile.blocked = true;
        tile.trigger = NO_NPC_TRIGGER;
    }
    if (c === ")") {
        tile.object = DUNGEON_OBJECTS.bloqueNaranjaBajo.id;
        tile.trigger = NO_NPC_TRIGGER;
    }
    if (c === "|") {
        tile.object = DUNGEON_OBJECTS.cristalAzul.id;
        tile.blocked = true;
    }
    if (c === '"') {
        tile.object = DUNGEON_OBJECTS.remolino.id;
        tile.trigger = NO_NPC_TRIGGER;
    }
    // Baldosas voladoras y cintas: se pisan.
    if (c === "▦" || c === "▩") tile.object = DUNGEON_OBJECTS.baldosaVoladora.id;
    const conveyor: Record<string, number> = {
        "↑": DUNGEON_OBJECTS.cintaNorte.id,
        "↓": DUNGEON_OBJECTS.cintaSur.id,
        "→": DUNGEON_OBJECTS.cintaEste.id,
        "←": DUNGEON_OBJECTS.cintaOeste.id,
    };
    if (c in conveyor) tile.object = conveyor[c];
    if (c in CHEST_CONTENT && !hiddenChests.has(`${plan.mapId}:${x},${y}`)) {
        tile.object = c === "Y" ? DUNGEON_OBJECTS.cofreJefe.id : DUNGEON_OBJECTS.cofre.id;
        tile.blocked = true;
    }
    if (/[1-9]/.test(c)) {
        const pair = (stairs.get(c) ?? []).filter((s) => !(s.mapId === plan.mapId && s.x === x && s.y === y));
        if (pair.length !== 1) throw new Error(`La escalera ${c} tiene que estar en dos lugares (está en ${pair.length + 1}).`);
        tile.object = portalDigits.has(c) ? PORTAL_OBJ : STAIRS_OBJ;
        tile.exit = arrivalNextTo(pair[0]);
    }
    if (/[a-z]/.test(c)) {
        const entry = legend.criaturas?.[c];
        if (!entry) throw new Error(`La letra "${c}" del mapa ${plan.mapId} no está en criaturas de leyenda.json.`);
        tile.npc = typeof entry === "number" ? entry : entry.npc;
    }
    return tile;
}

// Minimapa (frontend/public/imgs_maps/<N>.png): un píxel por baldosa, con los colores del minimapa del mapa 116.
const MINIMAP_COLORS = {
    floor: [62, 60, 26],
    wall: [34, 30, 6],
    void: [17, 17, 17],
    water: [40, 70, 110],
    portal: [70, 150, 230],
    stairs: [150, 110, 60],
    lava: [150, 50, 20],
    chest: [210, 170, 60],
    door: [120, 100, 80],
    crystal: [150, 110, 200],
    fragile: [120, 70, 40],
    crusher: [110, 40, 30],
    crackedWall: [90, 70, 50],
} as const;

function crc32(buffer: Buffer) {
    let crc = ~0;
    for (const byte of buffer) {
        crc ^= byte;
        for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return ~crc >>> 0;
}

function pngChunk(type: string, data: Buffer) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
}

function encodePng(width: number, height: number, rgb: (x: number, y: number) => readonly number[]) {
    const raw = Buffer.alloc((width * 3 + 1) * height);
    for (let y = 0; y < height; y++) {
        raw[y * (width * 3 + 1)] = 0;
        for (let x = 0; x < width; x++) {
            const [r, g, b] = rgb(x + 1, y + 1);
            const i = y * (width * 3 + 1) + 1 + x * 3;
            raw[i] = r;
            raw[i + 1] = g;
            raw[i + 2] = b;
        }
    }
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header[8] = 8; // bits por canal
    header[9] = 2; // RGB
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        pngChunk("IHDR", header),
        pngChunk("IDAT", zlib.deflateSync(raw)),
        pngChunk("IEND", Buffer.alloc(0)),
    ]);
}

function minimapColor(plan: Plan, tile: Tile, x: number, y: number) {
    const c = charAt(plan, x, y);
    if (tile.object === PORTAL_OBJ) return MINIMAP_COLORS.portal;
    if (c === "&") return MINIMAP_COLORS.door;
    // La pared que se vuela no se delata: se ve como pared.
    if (c === "@") return MINIMAP_COLORS.wall;
    if (tile.object === STAIRS_OBJ) return MINIMAP_COLORS.stairs;
    if (c === "*") return MINIMAP_COLORS.crystal;
    if (c === ":") return MINIMAP_COLORS.fragile;
    if (c === "Z") return MINIMAP_COLORS.crusher;
    if (c === "W") return MINIMAP_COLORS.crackedWall;
    if (c === "~") return MINIMAP_COLORS.water;
    if (c === " " || c === "O") return MINIMAP_COLORS.void;
    if (c === "^" || c === "%") return MINIMAP_COLORS.lava;
    // Los cofres ocultos no se delatan en el minimapa.
    if (c in CHEST_CONTENT) return hiddenChests.has(`${plan.mapId}:${x},${y}`) ? MINIMAP_COLORS.floor : MINIMAP_COLORS.chest;
    if (isBarrier(c)) return MINIMAP_COLORS.door;
    if (isWall(c)) return tile.graphics === VOID_GRH ? MINIMAP_COLORS.void : MINIMAP_COLORS.wall;
    return MINIMAP_COLORS.floor;
}

function writeJson(relativePath: string, data: unknown) {
    const fullPath = path.join(ROOT, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(data), "utf8");
}

for (const plan of plans) {
    const palette: Record<string, { graphics: number; blocked?: boolean }> = {};
    const paletteIds = new Map<string, number>();
    const rows: number[][] = [];
    const specials = {
        id: plan.mapId,
        exits: {} as Record<string, unknown>,
        objects: {} as Record<string, unknown>,
        npcs: {} as Record<string, number>,
        triggers: {} as Record<string, number>,
        dungeon: buildMechanics(plan),
    };
    const placements: Array<{ mapNum: number; x: number; y: number; npcIndex: number; movement?: number }> = [];
    const expanded: Record<string, Record<string, Record<string, unknown>>> = {};

    for (let y = 1; y <= SIZE; y++) {
        const row: number[] = [];
        const expandedRow: Record<string, Record<string, unknown>> = {};
        for (let x = 1; x <= SIZE; x++) {
            const tile = buildTile(plan, x, y);
            const key = `${tile.graphics}|${tile.blocked ? 1 : 0}`;
            let paletteId = paletteIds.get(key);
            if (!paletteId) {
                paletteId = paletteIds.size + 1;
                paletteIds.set(key, paletteId);
                palette[String(paletteId)] = tile.blocked ? { graphics: tile.graphics, blocked: true } : { graphics: tile.graphics };
            }
            row.push(paletteId);
            const coord = `${x},${y}`;
            const cell: Record<string, unknown> = {};
            if (tile.blocked) cell.blocked = 1;
            cell.graphics = { "1": tile.graphics };
            if (tile.trigger) {
                specials.triggers[coord] = tile.trigger;
                cell.trigger = tile.trigger;
            }
            if (tile.exit) {
                specials.exits[coord] = tile.exit;
                cell.tileExit = tile.exit;
            }
            if (tile.object) {
                specials.objects[coord] = { objIndex: tile.object, amount: 1 };
                cell.objInfo = { objIndex: tile.object, amount: 1 };
            }
            if (tile.npc) {
                specials.npcs[coord] = tile.npc;
                placements.push({ mapNum: plan.mapId, x, y, npcIndex: tile.npc });
            }
            expandedRow[String(x)] = cell;
        }
        rows.push(row);
        expanded[String(y)] = expandedRow;
    }

    const meta = {
        id: plan.mapId,
        name: plan.meta.nombre ?? `Mazmorra ${plan.mapId}`,
        musicNum: Number(plan.meta.musica ?? 15),
        magiaSinEfecto: 0,
        noEncriptarMp: 0,
        terreno: "DUNGEON",
        zona: "DUNGEON",
        // "GM" la saca de la lista de mapas de la wiki (api/src/repositories/wiki.ts); el server no lo usa.
        restringir: plan.meta.restringir ?? "No",
        minLevel: 0,
        maxLevel: 0,
        backup: 0,
        pk: 0,
    };
    const terrain = { id: plan.mapId, width: SIZE, height: SIZE, palette, rows };
    for (const dir of ["server/mapas_source", "api/src/mapas_source"]) {
        writeJson(`${dir}/mapa_${plan.mapId}/meta.json`, meta);
        writeJson(`${dir}/mapa_${plan.mapId}/terrain.json`, terrain);
        writeJson(`${dir}/mapa_${plan.mapId}/specials.json`, specials);
        writeJson(`${dir}/mapa_${plan.mapId}/npcs.json`, placements);
    }
    writeJson(`frontend/public/static/maps_local/mapa_${plan.mapId}.json`, { [String(plan.mapId)]: expanded });
    fs.writeFileSync(
        path.join(ROOT, `frontend/public/imgs_maps/${plan.mapId}.png`),
        encodePng(SIZE, SIZE, (x, y) => minimapColor(plan, buildTile(plan, x, y), x, y)),
    );
    console.log(`mapa ${plan.mapId} (${meta.name}): ${placements.length} criaturas, ${Object.keys(specials.exits).length} escaleras, ${Object.keys(specials.objects).length} objetos`);
}

// Objetos de mazmorra en objs.json (server y api) y en la copia del cliente.
function upsertDungeonObjects() {
    for (const file of ["server/jsons/objs.json", "api/src/jsons/objs.json"]) {
        const fullPath = path.join(ROOT, file);
        const raw = fs.readFileSync(fullPath, "utf8");
        const objects = JSON.parse(raw);
        const template = objects["864"]; // Pozo: decoración que no se levanta
        for (const entry of Object.values(DUNGEON_OBJECTS)) {
            objects[String(entry.id)] = { ...template, name: entry.name, grhIndex: entry.grh, objType: 0, agarrable: 1, valor: 0 };
        }
        fs.writeFileSync(fullPath, `${JSON.stringify(objects)}${raw.endsWith("\n") ? "\n" : ""}`, "utf8");
    }
    execFileSync("pnpm", ["exec", "tsx", "src/scripts/exportClientObjs.ts"], { cwd: path.join(ROOT, "server"), stdio: "ignore" });
    console.log(`objetos de mazmorra: ${Object.values(DUNGEON_OBJECTS).map((entry) => entry.id).join(", ")}`);
}
upsertDungeonObjects();

// Criaturas propias de la mazmorra (plantillas de leyenda.json) en npcs.json (server y api) y en las copias del cliente.
function upsertCustomNpcs() {
    const custom = Object.entries(legend.plantillas ?? {});
    if (!custom.length) return;
    const serverNpcs = JSON.parse(fs.readFileSync(path.join(ROOT, "server/jsons/npcs.json"), "utf8"));
    const templates = new Map<string, Record<string, unknown>>();
    for (const [id, { base, ...changes }] of custom) {
        const baseTemplate = serverNpcs[String(base)];
        if (!baseTemplate) throw new Error(`La plantilla ${id} usa de base la criatura ${base}, que no existe.`);
        templates.set(id, { ...baseTemplate, ...changes });
    }
    for (const file of ["server/jsons/npcs.json", "api/src/jsons/npcs.json"]) {
        const fullPath = path.join(ROOT, file);
        const raw = fs.readFileSync(fullPath, "utf8");
        const npcs = JSON.parse(raw);
        for (const [id, template] of templates) npcs[id] = template;
        fs.writeFileSync(fullPath, `${JSON.stringify(npcs)}${raw.endsWith("\n") ? "\n" : ""}`, "utf8");
    }
    for (const file of ["frontend/public/init/npcs.json", "frontend/public/init/npcs_optimized.json"]) {
        const fullPath = path.join(ROOT, file);
        const raw = fs.readFileSync(fullPath, "utf8");
        const npcs = JSON.parse(raw);
        for (const [id, template] of templates) {
            const fields = ["name", "idHead", "idBody", "exp", "gold", "hp", "maxHp", "minHit", "maxHit", "def", "poderAtaque", "poderEvasion"];
            npcs[id] = Object.fromEntries(fields.filter((field) => template[field] !== undefined).map((field) => [field, template[field]]));
        }
        fs.writeFileSync(fullPath, `${JSON.stringify(npcs)}${raw.endsWith("\n") ? "\n" : ""}`, "utf8");
    }
    console.log(`criaturas propias: ${[...templates.keys()].join(", ")}`);
}
upsertCustomNpcs();

// Plantilla de la piedra de invocación de la mazmorra (piedraNpc en dungeons.json): una estatua que no se ataca,
// con el nombre de la mazmorra debajo y el id de la mazmorra, que es lo que abre su panel (dungeons.ts).
function upsertStoneTemplate(def: Record<string, unknown>) {
    const npcId = Number(def.piedraNpc ?? 0);
    if (!npcId) return;
    const template = {
        name: "Piedra de invocación",
        npcType: 0,
        idHead: 0,
        idBody: Number(def.piedraCuerpo ?? 256),
        etiqueta: String(def.nombre),
        dungeonId: String(def.id),
        movement: 0,
        aguaValida: 0,
        exp: 0,
        gold: 0,
        hp: 1,
        maxHp: 1,
        minHit: 0,
        maxHit: 0,
        def: 0,
        poderAtaque: 0,
        poderEvasion: 0,
        magicResistance: 0,
        magicDef: 0,
        defM: 0,
        snd1: 0,
        snd2: 0,
        soundClose: 0,
        objs: [],
        drop: [],
        desc: `Una piedra antigua late con un brillo tenue. Lleva a ${def.nombre}.`,
        spells: [],
        hostile: 0,
        comercia: 0,
        attackable: 0,
        tierraInvalida: 0,
    };
    for (const file of ["server/jsons/npcs.json", "api/src/jsons/npcs.json"]) {
        const npcs = JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
        npcs[String(npcId)] = template;
        fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(npcs)}\n`, "utf8");
    }
    for (const file of ["frontend/public/init/npcs.json", "frontend/public/init/npcs_optimized.json"]) {
        const fullPath = path.join(ROOT, file);
        const raw = fs.readFileSync(fullPath, "utf8");
        const npcs = JSON.parse(raw);
        npcs[String(npcId)] = { name: template.name, idHead: template.idHead, idBody: template.idBody, desc: template.desc, hp: 1, maxHp: 1 };
        fs.writeFileSync(fullPath, `${JSON.stringify(npcs)}${raw.endsWith("\n") ? "\n" : ""}`, "utf8");
    }
    console.log(`piedra de invocación: NPC ${npcId}`);
}

// Entrada y salidas en la definición de la mazmorra.
const dungeonsPath = path.join(ROOT, "server/jsons/dungeons.json");
const dungeons = JSON.parse(fs.readFileSync(dungeonsPath, "utf8")) as Array<Record<string, unknown>>;
const def = dungeons.find((entry) => entry.id === dungeonId);
if (def) {
    if (!markers.entrada) throw new Error("El plano no tiene entrada (E).");
    def.mapas = plans.map((plan) => plan.mapId);
    def.entrada = markers.entrada;
    def.salidas = markers.salidas;
    fs.writeFileSync(dungeonsPath, `${JSON.stringify(dungeons, null, 4)}\n`, "utf8");
    upsertStoneTemplate(def);
    console.log(`dungeons.json: ${dungeonId} entrada ${JSON.stringify(markers.entrada)}, ${markers.salidas.length} salidas`);
} else {
    console.warn(`No hay "${dungeonId}" en jsons/dungeons.json: no se anotaron entrada ni salidas.`);
}
