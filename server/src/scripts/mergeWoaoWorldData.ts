import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");
const OLD_SERVER = path.join(ROOT, "old/Nuevo Motor Graf/Servidor 7.0");
const OLD_CLIENT = path.join(ROOT, "old/Nuevo Motor Graf/Cliente 7.7 1280x720/Recursos");
const OLD_MAPS = path.join(OLD_SERVER, "Maps");
const OLD_DAT = path.join(OLD_SERVER, "Dat");
const OLD_MINIMAPS = path.join(OLD_CLIENT, "MiniMapa");

const MAPS_SOURCE_DIR = path.join(ROOT, "server/mapas_source");
const FRONT_MAPS_DIR = path.join(ROOT, "frontend/public/maps");
const FRONT_MAPS_OPTIMIZED_DIR = path.join(ROOT, "frontend/public/maps_optimized");
const FRONT_IMGS_MAPS = path.join(ROOT, "frontend/public/imgs_maps");
const FRONT_INIT = path.join(ROOT, "frontend/public/init");
const API_JSONS = path.join(ROOT, "api/src/jsons");
const SERVER_JSONS = path.join(ROOT, "server/jsons");

const MAP_SIZE = 100;
const MAP_HEADER_SIZE = 273;
const INF_HEADER_SIZE = 10;

type IniSection = Record<string, string>;
type IniFile = Record<string, IniSection>;

type TerrainTile = {
    blocked?: boolean;
    graphics?: number | Array<number | null>;
};

type TerrainMap = {
    id: number;
    width: number;
    height: number;
    palette: Record<string, TerrainTile>;
    rows: number[][];
};

type TileExit = { map: number; x: number; y: number };

type SpecialsMap = {
    id: number;
    exits: Record<string, TileExit>;
    objects: Record<string, { objIndex: number; amount: number }>;
    npcs: Record<string, number>;
    triggers: Record<string, number>;
};

type CompactTile = {
    b?: 1;
    g?: number | Array<number | null>;
    e?: { m: number; x: number; y: number };
    n?: number;
    t?: number;
    o?: { i: number; a: number };
};

type JsonRecord = Record<string, Record<string, unknown>>;

function readLatin1(filePath: string): string {
    return fs.readFileSync(filePath, "latin1");
}

function parseIni(content: string): IniFile {
    const result: IniFile = {};
    let current = "";

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("'") || line.startsWith(";")) {
            continue;
        }

        const sectionMatch = line.match(/^\[([^\]]+)]/);
        if (sectionMatch) {
            current = sectionMatch[1];
            result[current] ??= {};
            continue;
        }

        const eq = line.indexOf("=");
        if (eq < 0 || !current) {
            continue;
        }

        result[current][line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }

    return result;
}

function getSection(ini: IniFile, name: string): IniSection {
    const direct = ini[name];
    if (direct) {
        return direct;
    }

    const upper = name.toUpperCase();
    for (const [key, value] of Object.entries(ini)) {
        if (key.toUpperCase() === upper) {
            return value;
        }
    }

    return {};
}

function getValue(section: IniSection, key: string): string | undefined {
    if (section[key] !== undefined) {
        return section[key];
    }

    const upper = key.toUpperCase();
    for (const [name, value] of Object.entries(section)) {
        if (name.toUpperCase() === upper) {
            return value;
        }
    }

    return undefined;
}

function toInt(value: string | undefined, fallback = 0): number {
    if (!value) {
        return fallback;
    }

    const parsed = Number.parseInt(value.replace(/[^\d-].*$/, ""), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function toNumber(value: string | undefined, fallback = 0): number {
    if (!value) {
        return fallback;
    }

    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : fallback;
}

function decodeLatin1(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}

function readJson<T>(filePath: string): T | null {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function writeJson(filePath: string, value: unknown): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(value), "utf8");
}

function findMapStem(mapId: number): string | null {
    const names = [`Mapa${mapId}`, `mapa${mapId}`];
    for (const name of names) {
        if (fs.existsSync(path.join(OLD_MAPS, `${name}.map`))) {
            return path.join(OLD_MAPS, name);
        }
    }

    const files = fs.readdirSync(OLD_MAPS);
    const match = files.find((file) => file.toLowerCase() === `mapa${mapId}.map`);
    return match ? path.join(OLD_MAPS, match.replace(/\.map$/i, "")) : null;
}

function readInt16(buffer: Buffer, offset: number): number {
    return buffer.readInt16LE(offset);
}

function readInt32(buffer: Buffer, offset: number): number {
    return buffer.readInt32LE(offset);
}

function parseMapNames(): Record<number, string> {
    const names: Record<number, string> = {};
    const content = readLatin1(path.join(OLD_DAT, "Mapas.dat"));

    for (const rawLine of content.split(/\r?\n/)) {
        const match = rawLine.match(/^\[Map(\d+)]\s*'?\s*(.*)$/i);
        if (!match) {
            continue;
        }

        const mapId = Number(match[1]);
        const comment = decodeLatin1(match[2].replace(/^'/, "").trim());
        if (comment) {
            names[mapId] = comment;
        }
    }

    return names;
}

function normalizeGraphics(layers: Array<number | null>): number | Array<number | null> {
    const lastUsed = layers.reduce<number>((last, value, index) => (value ? index : last), 0);
    const sliced = layers.slice(0, lastUsed + 1);

    if (sliced.length === 1 && typeof sliced[0] === "number") {
        return sliced[0];
    }

    return sliced;
}

function paletteKey(tile: TerrainTile): string {
    return JSON.stringify({
        b: tile.blocked ? 1 : 0,
        g: tile.graphics ?? 0,
    });
}

function convertMap(mapId: number, mapNames: Record<number, string>) {
    const stem = findMapStem(mapId);
    if (!stem) {
        return null;
    }

    const mapBuffer = fs.readFileSync(`${stem}.map`);
    const infPath = `${stem}.inf`;
    const datPath = fs.existsSync(`${stem}.dat`)
        ? `${stem}.dat`
        : fs.existsSync(`${stem}.Dat`)
          ? `${stem}.Dat`
          : null;

    if (mapBuffer.length < MAP_HEADER_SIZE) {
        throw new Error(`Mapa ${mapId}: .map demasiado corto`);
    }

    const infBuffer = fs.existsSync(infPath) ? fs.readFileSync(infPath) : Buffer.alloc(INF_HEADER_SIZE);
    const dat = datPath ? parseIni(readLatin1(datPath)) : {};
    const info = getSection(dat, `Mapa${mapId}`);

    let mapOffset = MAP_HEADER_SIZE;
    let infOffset = INF_HEADER_SIZE;

    const paletteByKey = new Map<string, number>();
    const palette: Record<string, TerrainTile> = {};
    const rows: number[][] = [];
    const exits: Record<string, TileExit> = {};
    const objects: Record<string, { objIndex: number; amount: number }> = {};
    const npcs: Record<string, number> = {};
    const triggers: Record<string, number> = {};

    for (let y = 1; y <= MAP_SIZE; y++) {
        const row: number[] = [];

        for (let x = 1; x <= MAP_SIZE; x++) {
            const flags = mapBuffer[mapOffset];
            mapOffset += 1;

            const layers: Array<number | null> = [readInt32(mapBuffer, mapOffset)];
            mapOffset += 4;

            if (flags & 2) {
                layers[1] = readInt32(mapBuffer, mapOffset);
                mapOffset += 4;
            }
            if (flags & 4) {
                layers[2] = readInt32(mapBuffer, mapOffset);
                mapOffset += 4;
            }
            if (flags & 8) {
                layers[3] = readInt32(mapBuffer, mapOffset);
                mapOffset += 4;
            }

            let trigger = 0;
            if (flags & 16) {
                trigger = readInt16(mapBuffer, mapOffset);
                mapOffset += 2;
            }

            if (infOffset < infBuffer.length) {
                const infFlags = infBuffer[infOffset];
                infOffset += 1;

                if (infFlags & 1) {
                    exits[`${x},${y}`] = {
                        map: readInt16(infBuffer, infOffset),
                        x: readInt16(infBuffer, infOffset + 2),
                        y: readInt16(infBuffer, infOffset + 4),
                    };
                    infOffset += 6;
                }

                if (infFlags & 2) {
                    const npcIndex = readInt16(infBuffer, infOffset);
                    infOffset += 2;
                    if (npcIndex > 0) {
                        npcs[`${x},${y}`] = npcIndex;
                    }
                }

                if (infFlags & 4) {
                    objects[`${x},${y}`] = {
                        objIndex: readInt16(infBuffer, infOffset),
                        amount: readInt16(infBuffer, infOffset + 2),
                    };
                    infOffset += 4;
                }
            }

            const tile: TerrainTile = {
                graphics: normalizeGraphics(layers),
            };
            if (flags & 1) {
                tile.blocked = true;
            }

            const key = paletteKey(tile);
            let paletteId = paletteByKey.get(key);
            if (!paletteId) {
                paletteId = paletteByKey.size + 1;
                paletteByKey.set(key, paletteId);
                palette[String(paletteId)] = tile;
            }

            row.push(paletteId);

            if (trigger) {
                triggers[`${x},${y}`] = trigger;
            }
        }

        rows.push(row);
    }

    const nameFromDat = decodeLatin1(getValue(info, "Name") ?? "");
    const name =
        mapNames[mapId] ||
        (nameFromDat && !/^mapa\d+$/i.test(nameFromDat) ? nameFromDat : `Mapa ${mapId}`);

    const meta = {
        id: mapId,
        name,
        musicNum: toInt(getValue(info, "MusicNum")),
        magiaSinEfecto: toInt(getValue(info, "MagiaSinefecto")),
        noEncriptarMp: toInt(getValue(info, "NoEncriptarMP")),
        terreno: decodeLatin1(getValue(info, "Terreno") ?? ""),
        zona: decodeLatin1(getValue(info, "Zona") ?? ""),
        restringir: decodeLatin1(getValue(info, "Restringir") ?? "No"),
        minLevel: 0,
        maxLevel: 0,
        backup: toInt(getValue(info, "BACKUP") ?? getValue(info, "BackUp")),
        pk: toInt(getValue(info, "Pk"), 1),
    };

    const terrain: TerrainMap = {
        id: mapId,
        width: MAP_SIZE,
        height: MAP_SIZE,
        palette,
        rows,
    };

    const specials: SpecialsMap = {
        id: mapId,
        exits,
        objects,
        npcs,
        triggers,
    };

    const npcPlacements = Object.entries(npcs).map(([coordinate, npcIndex]) => {
        const [x, y] = coordinate.split(",").map(Number);
        return { mapNum: mapId, x, y, npcIndex };
    });

    return { meta, terrain, specials, npcPlacements };
}

function buildCompactMap(mapId: number, terrain: TerrainMap, specials: SpecialsMap) {
    const width = terrain.width;
    const height = terrain.height;
    const palette = terrain.palette;
    const rows = terrain.rows;
    const complexTiles: CompactTile[] = [];
    const complexIndexBySignature = new Map<string, number>();
    const data: number[] = [];

    for (let y = 1; y <= height; y++) {
        for (let x = 1; x <= width; x++) {
            const paletteId = rows[y - 1]?.[x - 1] ?? 0;
            const terrainTile = paletteId > 0 ? palette[String(paletteId)] : undefined;
            const coordinateKey = `${x},${y}`;
            const compactTile: CompactTile = {};

            if (terrainTile?.blocked) {
                compactTile.b = 1;
            }
            if (terrainTile?.graphics !== undefined) {
                compactTile.g = terrainTile.graphics;
            }

            const exit = specials.exits[coordinateKey];
            if (exit) {
                compactTile.e = { m: exit.map, x: exit.x, y: exit.y };
            }

            const objectInfo = specials.objects[coordinateKey];
            if (objectInfo) {
                compactTile.o = { i: objectInfo.objIndex, a: objectInfo.amount };
            }

            const trigger = specials.triggers[coordinateKey];
            if (trigger !== undefined) {
                compactTile.t = trigger;
            }

            const npcIndex = specials.npcs[coordinateKey];
            if (npcIndex !== undefined) {
                compactTile.n = npcIndex;
            }

            const keys = Object.keys(compactTile);
            if (keys.length === 0) {
                data.push(0);
                continue;
            }

            if (keys.length === 1 && typeof compactTile.g === "number") {
                data.push(compactTile.g);
                continue;
            }

            if (keys.length === 2 && compactTile.b === 1 && typeof compactTile.g === "number") {
                data.push(100000 + compactTile.g);
                continue;
            }

            const signature = JSON.stringify(compactTile);
            let complexIndex = complexIndexBySignature.get(signature);
            if (complexIndex === undefined) {
                complexIndex = complexTiles.length;
                complexIndexBySignature.set(signature, complexIndex);
                complexTiles.push(compactTile);
            }

            data.push(-(complexIndex + 1));
        }
    }

    return complexTiles.length > 0
        ? { id: mapId, w: width, h: height, d: data, cx: complexTiles }
        : { id: mapId, w: width, h: height, d: data };
}

function convertPairList(section: IniSection, prefix: string, countKey: string): Array<{ item: number; cant: number }> {
    const count = toInt(getValue(section, countKey));
    const entries: Array<{ item: number; cant: number }> = [];

    for (let index = 1; index <= Math.max(count, 20); index++) {
        const raw = getValue(section, `${prefix}${index}`);
        if (!raw) {
            continue;
        }

        const [itemRaw, cantRaw] = raw.split("-");
        const item = toInt(itemRaw);
        const cant = toInt(cantRaw, 1);
        if (item > 0) {
            entries.push({ item, cant });
        }
    }

    return entries;
}

function convertObjects(): JsonRecord {
    const existing =
        readJson<JsonRecord>(path.join(API_JSONS, "objs.json")) ??
        readJson<JsonRecord>(path.join(FRONT_INIT, "objs.json")) ??
        {};
    const ini = parseIni(readLatin1(path.join(OLD_DAT, "OBJ.dat")));
    const converted: JsonRecord = { ...existing };

    for (const [sectionName, section] of Object.entries(ini)) {
        const match = sectionName.match(/^OBJ(\d+)$/i);
        if (!match) {
            continue;
        }

        const id = match[1];
        const name = decodeLatin1(getValue(section, "Name") ?? `Objeto ${id}`);
        converted[id] = {
            name,
            objType: toInt(getValue(section, "ObjType")),
            grhIndex: toInt(getValue(section, "GrhIndex")),
            valor: toInt(getValue(section, "Valor")),
            minHit: toInt(getValue(section, "MinHit") ?? getValue(section, "MINHIT")),
            maxHit: toInt(getValue(section, "MaxHit") ?? getValue(section, "MAXHIT")),
            minDef: toInt(getValue(section, "MinDef") ?? getValue(section, "MINDEF")),
            maxDef: toInt(getValue(section, "MaxDef") ?? getValue(section, "MAXDEF")),
            minDefMag: toInt(getValue(section, "MinDefMag") ?? getValue(section, "DefMagic")),
            maxDefMag: toInt(getValue(section, "MaxDefMag") ?? getValue(section, "MaxDefMag")),
            resistenciaMagica: toInt(getValue(section, "ResistenciaMagica")),
            tipoPocion: toInt(getValue(section, "TipoPocion")),
            minModificador: toInt(getValue(section, "MinModificador")),
            maxModificador: toInt(getValue(section, "MaxModificador")),
            anim: toInt(getValue(section, "NumRopaje") ?? getValue(section, "Anim")),
            newbie: toInt(getValue(section, "Newbie")),
            proyectil: toInt(getValue(section, "Proyectil")),
            apu: toInt(getValue(section, "Apu") ?? getValue(section, "Apunala")),
            spellIndex: toInt(getValue(section, "HechizoIndex") ?? getValue(section, "SpellIndex") ?? getValue(section, "Hechizo")),
            razaEnana: toInt(getValue(section, "RazaEnana")),
            agarrable: toInt(getValue(section, "Agarrable"), 1),
            noSeCae: toInt(getValue(section, "NoSeCae") ?? getValue(section, "nocaer")),
            staffDamageBonus: toInt(getValue(section, "StaffDamageBonus")),
            magicDamageBonus: toInt(getValue(section, "MagicDamageBonus")),
            porcentaje: toInt(getValue(section, "Porcentaje")),
            indexAbierta: toInt(getValue(section, "IndexAbierta")),
            indexCerrada: toInt(getValue(section, "IndexCerrada")),
            llave: toInt(getValue(section, "Llave")),
            cerrada: toInt(getValue(section, "Cerrada")),
            minSkill: toInt(getValue(section, "MinSkill")),
            subtipo: toInt(getValue(section, "Subtipo")),
        };
    }

    return converted;
}

function toClientObjects(objects: JsonRecord): JsonRecord {
    const client: JsonRecord = {};

    for (const [id, objectData] of Object.entries(objects)) {
        const clientObject: Record<string, unknown> = {
            name: objectData.name,
            grhIndex: String(objectData.grhIndex ?? 0),
        };

        for (const key of [
            "objType",
            "minHit",
            "maxHit",
            "minDef",
            "maxDef",
            "minDefMag",
            "maxDefMag",
            "resistenciaMagica",
            "apu",
            "proyectil",
            "staffDamageBonus",
            "magicDamageBonus",
        ]) {
            const value = Number(objectData[key] ?? 0);
            if (value) {
                clientObject[key] = value;
            }
        }

        client[id] = clientObject;
    }

    return client;
}

function convertNpcsFromFile(filePath: string, target: JsonRecord): number {
    if (!fs.existsSync(filePath)) {
        return 0;
    }

    const ini = parseIni(readLatin1(filePath));
    let count = 0;

    for (const [sectionName, section] of Object.entries(ini)) {
        const match = sectionName.match(/^NPC(\d+)$/i);
        if (!match) {
            continue;
        }

        const id = match[1];
        const drop = convertPairList(section, "Drop", "NRODROPS");
        const objs = convertPairList(section, "Obj", "NROITEMS");
        const spells: Array<{ idSpell: number }> = [];
        const spellCount = toInt(getValue(section, "LanzaSpells") ?? getValue(section, "NumHechizos"));

        for (let index = 1; index <= Math.max(spellCount, 8); index++) {
            const spellId = toInt(getValue(section, `Sp${index}`) ?? getValue(section, `Hechizo${index}`));
            if (spellId > 0) {
                spells.push({ idSpell: spellId });
            }
        }

        target[id] = {
            name: decodeLatin1(getValue(section, "Name") ?? `NPC ${id}`),
            npcType: toInt(getValue(section, "NpcType")),
            idHead: toInt(getValue(section, "Head")),
            idBody: toInt(getValue(section, "Body")),
            movement: toInt(getValue(section, "Movement"), 1),
            desc: decodeLatin1(getValue(section, "Desc") ?? ""),
            aguaValida: toInt(getValue(section, "AguaValida")),
            tierraInvalida: toInt(getValue(section, "TierraInvalida")),
            exp: toInt(getValue(section, "GiveEXP") ?? getValue(section, "Exp")),
            gold: toInt(getValue(section, "GiveGLD") ?? getValue(section, "Gold")),
            hp: toInt(getValue(section, "MaxHP") ?? getValue(section, "MinHP") ?? getValue(section, "HP"), 1),
            maxHp: toInt(getValue(section, "MaxHP") ?? getValue(section, "HP"), 1),
            minHit: toInt(getValue(section, "MinHIT") ?? getValue(section, "MinHit")),
            maxHit: toInt(getValue(section, "MaxHIT") ?? getValue(section, "MaxHit")),
            def: toInt(getValue(section, "DEF") ?? getValue(section, "Def")),
            poderAtaque: toInt(getValue(section, "PoderAtaque")),
            poderEvasion: toInt(getValue(section, "PoderEvasion")),
            magicResistance: toInt(getValue(section, "ResistenciaMagica")),
            snd1: toInt(getValue(section, "Snd1")),
            snd2: toInt(getValue(section, "Snd2")),
            hostile: toInt(getValue(section, "Hostile")),
            attackable: toInt(getValue(section, "Attackable")),
            comercia: toInt(getValue(section, "Comercia")),
            drop,
            objs,
            questNumber: toInt(getValue(section, "QuestNumber")),
            spells,
        };
        count += 1;
    }

    return count;
}

function convertNpcs(): JsonRecord {
    const existing =
        readJson<JsonRecord>(path.join(API_JSONS, "npcs.json")) ??
        readJson<JsonRecord>(path.join(FRONT_INIT, "npcs.json")) ??
        {};
    const converted: JsonRecord = { ...existing };
    convertNpcsFromFile(path.join(OLD_DAT, "NPCs.dat"), converted);
    convertNpcsFromFile(path.join(OLD_DAT, "NPCs-HOSTILES.dat"), converted);
    return converted;
}

function toClientNpcs(npcs: JsonRecord): JsonRecord {
    const client: JsonRecord = {};

    for (const [id, npc] of Object.entries(npcs)) {
        const clientNpc: Record<string, unknown> = {
            name: npc.name,
            idHead: npc.idHead,
            idBody: npc.idBody,
        };

        for (const key of ["npcType", "desc", "exp", "gold", "hp", "maxHp", "minHit", "maxHit", "def", "poderAtaque", "poderEvasion", "questNumber"]) {
            const value = npc[key];
            if (value) {
                clientNpc[key] = value;
            }
        }

        if (Array.isArray(npc.drop) && npc.drop.length > 0) {
            clientNpc.drop = npc.drop;
        }

        client[id] = clientNpc;
    }

    return client;
}

function convertSpells(): JsonRecord {
    const existing =
        readJson<JsonRecord>(path.join(SERVER_JSONS, "spells.json")) ??
        readJson<JsonRecord>(path.join(FRONT_INIT, "spells.json")) ??
        {};
    const ini = parseIni(readLatin1(path.join(OLD_DAT, "Hechizos.dat")));
    const converted: JsonRecord = { ...existing };

    for (const [sectionName, section] of Object.entries(ini)) {
        const match = sectionName.match(/^HECHIZO(\d+)$/i);
        if (!match) {
            continue;
        }

        const id = match[1];
        const oldType = toInt(getValue(section, "Tipo"), 1);
        const numNpc = toInt(getValue(section, "NumNpc"));
        const invoca = toInt(getValue(section, "Invoca"));
        const type = invoca || numNpc > 0 ? 4 : oldType === 3 ? 3 : oldType;

        converted[id] = {
            name: decodeLatin1(getValue(section, "Nombre") ?? `Hechizo ${id}`),
            desc: decodeLatin1(getValue(section, "Desc") ?? ""),
            type,
            wav: toInt(getValue(section, "WAV") ?? getValue(section, "Wav")),
            fxGrh: toInt(getValue(section, "FXgrh") ?? getValue(section, "FxGrh")),
            minSkill: toInt(getValue(section, "MinSkill")),
            manaRequired: toInt(getValue(section, "ManaRequerido")),
            staRequired: toInt(getValue(section, "StaRequerido") ?? getValue(section, "STARequerido")),
            target: toInt(getValue(section, "Target"), 1),
            palabrasMagicas: decodeLatin1(getValue(section, "PalabrasMagicas") ?? ""),
            paraliza: toInt(getValue(section, "Paraliza")),
            inmoviliza: toInt(getValue(section, "Inmoviliza")),
            removerParalisis: toInt(getValue(section, "RemoverParalisis")),
            invisibilidad: toInt(getValue(section, "Invisibilidad")),
            revivir: toInt(getValue(section, "Revivir")),
            curaVeneno: toInt(getValue(section, "CuraVeneno")),
            envenena: toInt(getValue(section, "Envenena")),
            ceguera: toInt(getValue(section, "Ceguera")),
            estupidez: toInt(getValue(section, "Estupidez")),
            paralizaarea: toInt(getValue(section, "Paralizaarea") ?? getValue(section, "ParalizaArea")),
            remueveInvisibilidadParcial: toInt(getValue(section, "RemueveInvisibilidadParcial")),
            morph: toInt(getValue(section, "Morph")),
            protec: toInt(getValue(section, "Protec")),
            invoca: invoca,
            cant: toInt(getValue(section, "Cant")),
            minNivel: toInt(getValue(section, "MinNivel")),
            noesquivar: toInt(getValue(section, "Noesquivar")),
            minHp: toInt(getValue(section, "MinHP") ?? getValue(section, "MinHp")),
            maxHp: toInt(getValue(section, "MaxHP") ?? getValue(section, "MaxHp")),
            subeHp: toInt(getValue(section, "SubeHP") ?? getValue(section, "SubeHp")),
            subeAg: toInt(getValue(section, "SubeAG") ?? getValue(section, "SubeAg") ?? getValue(section, "SubeAgilidad")),
            minAg: toInt(getValue(section, "MinAG") ?? getValue(section, "MinAg") ?? getValue(section, "MinAgilidad")),
            maxAg: toInt(getValue(section, "MaxAG") ?? getValue(section, "MaxAg") ?? getValue(section, "MaxAgilidad")),
            subeFz: toInt(
                getValue(section, "SubeFZ") ??
                    getValue(section, "SubeFz") ??
                    getValue(section, "SubeFU") ??
                    getValue(section, "SubeFuerza"),
            ),
            minFz: toInt(
                getValue(section, "MinFZ") ??
                    getValue(section, "MinFz") ??
                    getValue(section, "MinFU") ??
                    getValue(section, "MinFuerza"),
            ),
            maxFz: toInt(
                getValue(section, "MaxFZ") ??
                    getValue(section, "MaxFz") ??
                    getValue(section, "MaxFU") ??
                    getValue(section, "MaxFuerza"),
            ),
            subeMana: toInt(getValue(section, "SubeMana")),
            minMana: toInt(getValue(section, "MinMana") ?? getValue(section, "MiMana")),
            maxMana: toInt(getValue(section, "MaxMana") ?? getValue(section, "MaMana")),
            subeHam: toInt(getValue(section, "SubeHam") ?? getValue(section, "SubeHAM")),
            minHam: toInt(getValue(section, "MinHam") ?? getValue(section, "MinHAM")),
            maxHam: toInt(getValue(section, "MaxHam") ?? getValue(section, "MaxHAM")),
            subeSed: toInt(getValue(section, "SubeSed") ?? getValue(section, "SubeSED")),
            minSed: toInt(getValue(section, "MinSed") ?? getValue(section, "MinSED")),
            maxSed: toInt(getValue(section, "MaxSed") ?? getValue(section, "MaxSED")),
            staffAffected: toInt(getValue(section, "Resis")),
            numNpc,
            loops: toInt(getValue(section, "Loops") ?? getValue(section, "loops") ?? getValue(section, "loop")),
        };
    }

    return converted;
}

function convertMinimaps(): number {
    if (!fs.existsSync(OLD_MINIMAPS)) {
        return 0;
    }

    fs.mkdirSync(FRONT_IMGS_MAPS, { recursive: true });
    let converted = 0;

    for (const file of fs.readdirSync(OLD_MINIMAPS)) {
        const match = file.match(/^Mapa(\d+)\.(bmp|png|jpg)$/i);
        if (!match) {
            continue;
        }

        const mapId = match[1];
        const source = path.join(OLD_MINIMAPS, file);
        const target = path.join(FRONT_IMGS_MAPS, `${mapId}.png`);

        if (file.toLowerCase().endsWith(".png")) {
            fs.copyFileSync(source, target);
        } else {
            execFileSync("sips", ["-s", "format", "png", source, "--out", target], { stdio: "ignore" });
        }

        converted += 1;
    }

    return converted;
}

function main() {
    const mapNames = parseMapNames();
    let mapsConverted = 0;
    let npcPlacements = 0;

    for (let mapId = 1; mapId <= 306; mapId++) {
        const converted = convertMap(mapId, mapNames);
        if (!converted) {
            continue;
        }

        const mapDir = path.join(MAPS_SOURCE_DIR, `mapa_${mapId}`);
        fs.mkdirSync(mapDir, { recursive: true });
        writeJson(path.join(mapDir, "meta.json"), converted.meta);
        writeJson(path.join(mapDir, "terrain.json"), converted.terrain);
        writeJson(path.join(mapDir, "specials.json"), converted.specials);
        writeJson(path.join(mapDir, "npcs.json"), converted.npcPlacements);

        const compact = buildCompactMap(mapId, converted.terrain, converted.specials);
        writeJson(path.join(FRONT_MAPS_DIR, `mapa_${mapId}.json`), compact);
        writeJson(path.join(FRONT_MAPS_OPTIMIZED_DIR, `mapa_${mapId}.json`), compact);

        mapsConverted += 1;
        npcPlacements += converted.npcPlacements.length;
    }

    const objects = convertObjects();
    const npcs = convertNpcs();
    const spells = convertSpells();

    writeJson(path.join(API_JSONS, "objs.json"), objects);
    writeJson(path.join(API_JSONS, "npcs.json"), npcs);
    writeJson(path.join(SERVER_JSONS, "spells.json"), spells);
    writeJson(path.join(API_JSONS, "spells.json"), spells);
    writeJson(path.join(FRONT_INIT, "objs.json"), toClientObjects(objects));
    writeJson(path.join(FRONT_INIT, "npcs.json"), toClientNpcs(npcs));
    writeJson(path.join(FRONT_INIT, "spells.json"), spells);

    const minimaps = convertMinimaps();

    console.log(
        JSON.stringify(
            {
                maps: mapsConverted,
                npcPlacements,
                objects: Object.keys(objects).length,
                npcs: Object.keys(npcs).length,
                spells: Object.keys(spells).length,
                minimaps,
            },
            null,
            2,
        ),
    );
}

main();
