// Arma los mapas de una mazmorra desde sus planos en texto (server/mazmorras/<id>/), con las texturas del dungeon
// del mapa 116, y escribe las mismas copias que el editor de mapas: server y api (mapas_source) y cliente
// (static/maps_local, que es lo que carga para los mapas 500-599, y maps). También anota en jsons/dungeons.json
// la entrada (E) y las salidas (S) que marca el plano.
//   pnpm --dir server exec tsx src/scripts/buildDungeonMaps.ts prueba
//
// Plano (mapa_<N>.txt): unas líneas "clave: valor" (nombre, musica, origen x,y, restringir), una línea "---" y el dibujo, un
// carácter por baldosa, ubicado en el origen; lo que queda afuera es vacío.
//   #  pared: si abajo hay piso a 4 o menos, se dibuja la cara de la pared; si no, piedra oscura
//   .  piso          ~  agua profunda        (espacio)  vacío
//   E  entrada (piso) S  portal de salida
//   1-9 escalera: une las dos escaleras con el mismo número en dos mapas de la mazmorra
//   letras: criaturas, según "criaturas" en leyenda.json
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(__dirname, "../../..");
const SIZE = 100;
const FLOOR_GRH = 9428; // bloque de 4×4 del piso verde del mapa 116
const WALL_FACE_GRH = 9412; // bloque de 4×4 de la cara de las paredes
const VOID_GRH = 1; // negro
const WATER_GRH = 1505; // bloque de 4×4 de agua (waterTiles.ts)
const PORTAL_OBJ = 378; // Teleport (portal azul, no se puede levantar)
const STAIRS_OBJ = 1198; // Escalera Grande

type Tile = { graphics: number; blocked?: boolean; object?: number; npc?: number; exit?: { map: number; x: number; y: number } };
type Plan = { mapId: number; meta: Record<string, string>; origin: { x: number; y: number }; grid: string[] };
type Legend = { criaturas?: Record<string, number | { npc: number; movimiento?: number }> };

const dungeonId = process.argv[2];
if (!dungeonId) {
    console.error("Uso: tsx src/scripts/buildDungeonMaps.ts <mazmorra>");
    process.exit(1);
}
const planDir = path.join(ROOT, "server/mazmorras", dungeonId);
const legend: Legend = fs.existsSync(path.join(planDir, "leyenda.json"))
    ? JSON.parse(fs.readFileSync(path.join(planDir, "leyenda.json"), "utf8"))
    : {};

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
const isWall = (c: string) => c === "#";
const isOpen = (c: string) => c !== "#" && c !== " ";
const block4 = (base: number, x: number, y: number, row?: number) => base + (row ?? (y - 1) % 4) * 4 + ((x - 1) % 4);

// Escaleras: dónde está cada número en cada mapa.
const stairs = new Map<string, Array<{ mapId: number; x: number; y: number }>>();
const markers: { entrada?: { map: number; x: number; y: number }; salidas: Array<{ map: number; x: number; y: number }> } = { salidas: [] };
for (const plan of plans) {
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            const c = charAt(plan, x, y);
            if (/[1-9]/.test(c)) stairs.set(c, [...(stairs.get(c) ?? []), { mapId: plan.mapId, x, y }]);
            if (c === "E") markers.entrada = { map: plan.mapId, x, y };
            if (c === "S") markers.salidas.push({ map: plan.mapId, x, y });
        }
    }
}

// Al bajar una escalera se llega a la baldosa libre de al lado de la otra (no encima, si no rebotaría).
function arrivalNextTo(target: { mapId: number; x: number; y: number }) {
    const plan = plans.find((p) => p.mapId === target.mapId)!;
    for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const c = charAt(plan, target.x + dx, target.y + dy);
        if (c === "." || c === "E") return { map: target.mapId, x: target.x + dx, y: target.y + dy };
    }
    throw new Error(`La escalera de ${target.mapId} (${target.x},${target.y}) no tiene piso al lado.`);
}

function buildTile(plan: Plan, x: number, y: number): Tile {
    const c = charAt(plan, x, y);
    if (c === " ") return { graphics: VOID_GRH, blocked: true };
    if (isWall(c)) {
        // Cara de la pared si hay piso abajo a 4 baldosas o menos; la fila de la textura depende de la distancia.
        let distance = 1;
        while (distance <= 4 && isWall(charAt(plan, x, y + distance))) distance++;
        if (distance <= 4 && isOpen(charAt(plan, x, y + distance))) {
            return { graphics: block4(WALL_FACE_GRH, x, y, 4 - distance), blocked: true };
        }
        return { graphics: VOID_GRH, blocked: true };
    }
    if (c === "~") return { graphics: block4(WATER_GRH, x, y) };
    const tile: Tile = { graphics: block4(FLOOR_GRH, x, y) };
    if (c === "S") tile.object = PORTAL_OBJ;
    if (/[1-9]/.test(c)) {
        const pair = (stairs.get(c) ?? []).filter((s) => !(s.mapId === plan.mapId && s.x === x && s.y === y));
        if (pair.length !== 1) throw new Error(`La escalera ${c} tiene que estar en dos lugares (está en ${pair.length + 1}).`);
        tile.object = STAIRS_OBJ;
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
    if (tile.object === STAIRS_OBJ) return MINIMAP_COLORS.stairs;
    if (c === "~") return MINIMAP_COLORS.water;
    if (c === " ") return MINIMAP_COLORS.void;
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
    const specials = { id: plan.mapId, exits: {} as Record<string, unknown>, objects: {} as Record<string, unknown>, npcs: {} as Record<string, number>, triggers: {} };
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
