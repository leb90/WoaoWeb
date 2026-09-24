import fs from "node:fs";
import path from "node:path";
import { normalizeWoaoGraphicSpeed } from "./woaoGraphicSpeed";

const ROOT = path.resolve(__dirname, "../../..");
const OLD_INIT = path.join(
    ROOT,
    "old/Nuevo Motor Graf/Cliente 7.7 1280x720/Recursos/Init",
);
const OLD_GRAFICOS = path.join(
    ROOT,
    "old/Nuevo Motor Graf/Cliente 7.7 1280x720/Recursos/Graficos",
);
const OLD_DAT = path.join(ROOT, "old/Nuevo Motor Graf/Servidor 7.0/Dat");
const FRONT_INIT = path.join(ROOT, "frontend/public/init");
const FRONT_GRAPHICS = path.join(ROOT, "frontend/public/graphics");
const API_JSONS = path.join(ROOT, "api/src/jsons");
const SERVER_JSONS = path.join(ROOT, "server/jsons");

type IniSection = Record<string, string>;
type IniFile = Record<string, IniSection>;

type GraphicEntry = {
    numFrames?: number;
    numFile?: number | string;
    sX?: number;
    sY?: number;
    width?: number;
    height?: number;
    frames?: Record<string, number | string>;
    speed?: number;
};

type HeadEntry = {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    offsetX?: number;
    offsetY?: number;
};

type BodyEntry = HeadEntry & {
    headOffsetX: number;
    headOffsetY: number;
};

type FxEntry = {
    grh: number;
    offsetX: number;
    offsetY: number;
};

function readLatin1(filePath: string): string {
    return fs.readFileSync(filePath, "latin1");
}

function readJson<T>(filePath: string): T {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function writeJson(filePath: string, data: unknown): void {
    fs.writeFileSync(filePath, JSON.stringify(data));
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

function getValue(section: IniSection, key: string): string | undefined {
    if (section[key] !== undefined) {
        return section[key];
    }

    const lower = key.toLowerCase();
    for (const [entryKey, value] of Object.entries(section)) {
        if (entryKey.toLowerCase() === lower) {
            return value;
        }
    }

    return undefined;
}

function toInt(value: string | undefined, fallback = 0): number {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function remapHeading(north: number, east: number, south: number, west: number): HeadEntry {
    return {
        "1": north,
        "2": south,
        "3": east,
        "4": west,
    };
}

function parseGraficosInd(filePath: string): Map<number, GraphicEntry> {
    const buffer = fs.readFileSync(filePath);
    const strategies = [16, 8, 0];

    for (const srcBytes of strategies) {
        try {
            const parsed = parseGraficosIndWithSrc(buffer, srcBytes);
            if (parsed.size > 100) {
                console.log(`Graficos.ind parse ok srcBytes=${srcBytes} entries=${parsed.size}`);
                return parsed;
            }
        } catch (error) {
            console.log(`Graficos.ind parse failed srcBytes=${srcBytes}:`, error);
        }
    }

    throw new Error("No se pudo parsear Graficos.ind");
}

function parseGraficosIndWithSrc(buffer: Buffer, srcBytes: number): Map<number, GraphicEntry> {
    let offset = 0;
    const readLong = () => {
        const value = buffer.readInt32LE(offset);
        offset += 4;
        return value;
    };
    const readInt = () => {
        const value = buffer.readInt16LE(offset);
        offset += 2;
        return value;
    };
    const readSingle = () => {
        const value = buffer.readFloatLE(offset);
        offset += 4;
        return value;
    };

    const fileVersion = readLong();
    const grhCount = readLong();
    if (grhCount <= 0 || grhCount > 2_000_000) {
        throw new Error(`GrhCount invalido: ${grhCount}`);
    }

    const result = new Map<number, GraphicEntry>();

    while (offset + 6 <= buffer.length) {
        const grh = readLong();
        if (grh === 0) {
            continue;
        }
        if (grh < 0 || grh > grhCount + 1000) {
            throw new Error(`GRH fuera de rango: ${grh} @${offset}`);
        }

        const numFrames = readInt();
        if (numFrames <= 0 || numFrames > 256) {
            throw new Error(`NumFrames invalido ${numFrames} en GRH ${grh}`);
        }

        if (numFrames > 1) {
            const frames: Record<string, number> = {};
            for (let frame = 1; frame <= numFrames; frame += 1) {
                const frameId = readLong();
                if (frameId <= 0) {
                    throw new Error(`Frame invalido ${frameId} en GRH ${grh}`);
                }
                frames[String(frame)] = frameId;
            }
            result.set(grh, {
                numFrames,
                frames,
                speed: normalizeWoaoGraphicSpeed(readSingle(), numFrames),
            });
            continue;
        }

        const numFile = readLong();
        const sX = readInt();
        const sY = readInt();
        const width = readInt();
        const height = readInt();
        if (srcBytes === 16) {
            readSingle();
            readSingle();
            readSingle();
            readSingle();
        } else if (srcBytes === 8) {
            readInt();
            readInt();
            readInt();
            readInt();
        }

        if (numFile <= 0 || width <= 0 || height <= 0) {
            throw new Error(`Grafico invalido GRH ${grh}`);
        }

        result.set(grh, {
            numFrames: 1,
            numFile,
            sX,
            sY,
            width,
            height,
            frames: { "1": grh },
        });
    }

    void fileVersion;
    return result;
}

function overwriteHeadingTable(
    ini: IniFile,
    sectionPrefix: RegExp,
    northKey: string,
    eastKey: string,
    southKey: string,
    westKey: string,
    extra?: (section: IniSection) => Partial<HeadEntry>,
): Record<string, HeadEntry> {
    const result: Record<string, HeadEntry> = {};

    for (const [sectionName, section] of Object.entries(ini)) {
        const match = sectionName.match(sectionPrefix);
        if (!match) {
            continue;
        }

        const mapped = remapHeading(
            toInt(getValue(section, northKey)),
            toInt(getValue(section, eastKey)),
            toInt(getValue(section, southKey)),
            toInt(getValue(section, westKey)),
        );

        if (mapped["1"] <= 0 && mapped["2"] <= 0 && mapped["3"] <= 0 && mapped["4"] <= 0) {
            continue;
        }

        result[match[1]] = {
            ...mapped,
            ...extra?.(section),
        };
    }

    return result;
}

function keepExtras<T>(existing: Record<string, T>, overwritten: Record<string, T>): Record<string, T> {
    const result = { ...overwritten };
    for (const [id, entry] of Object.entries(existing)) {
        if (!result[id]) {
            result[id] = entry;
        }
    }
    return result;
}

function collectNeededFiles(graficos: Record<string, GraphicEntry>): Set<number> {
    const files = new Set<number>();
    for (const entry of Object.values(graficos)) {
        if (entry.numFile) {
            files.add(Number(entry.numFile));
        }
    }
    return files;
}

function copyOldPngs(): { copied: number; overwritten: number; missing: number[] } {
    fs.mkdirSync(FRONT_GRAPHICS, { recursive: true });
    const oldFiles = fs.readdirSync(OLD_GRAFICOS).filter((name) => /\.png$/i.test(name));
    let copied = 0;
    let overwritten = 0;

    for (const fileName of oldFiles) {
        const destName = fileName.replace(/\.png$/i, ".png");
        const dest = path.join(FRONT_GRAPHICS, destName);
        const existed = fs.existsSync(dest);
        fs.copyFileSync(path.join(OLD_GRAFICOS, fileName), dest);
        if (existed) {
            overwritten += 1;
        } else {
            copied += 1;
        }
    }

    return { copied, overwritten, missing: [] };
}

function updateObjectGraphics(): { objects: number; changed: number } {
    const clientIni = parseIni(readLatin1(path.join(OLD_INIT, "OBJ.dat")));
    const serverIni = parseIni(readLatin1(path.join(OLD_DAT, "OBJ.dat")));
    const apiObjs = readJson<Record<string, Record<string, unknown>>>(path.join(API_JSONS, "objs.json"));
    const serverObjs = fs.existsSync(path.join(SERVER_JSONS, "objs.json"))
        ? readJson<Record<string, Record<string, unknown>>>(path.join(SERVER_JSONS, "objs.json"))
        : { ...apiObjs };
    const frontObjs = readJson<Record<string, Record<string, unknown>>>(path.join(FRONT_INIT, "objs.json"));
    let changed = 0;

    const apply = (ini: IniFile) => {
        for (const [sectionName, section] of Object.entries(ini)) {
            const match = sectionName.match(/^OBJ(\d+)$/i);
            if (!match) {
                continue;
            }

            const id = match[1];
            const grhIndex = toInt(getValue(section, "GrhIndex"));
            const anim = toInt(getValue(section, "NumRopaje") ?? getValue(section, "Anim"));
            const apiObject = apiObjs[id] ?? {};
            const serverObject = serverObjs[id] ?? {};
            const frontObject = frontObjs[id] ?? {};
            const previousGrh = Number(apiObject.grhIndex ?? frontObject.grhIndex ?? 0);
            const previousAnim = Number(apiObject.anim ?? 0);

            apiObject.grhIndex = grhIndex;
            serverObject.grhIndex = grhIndex;
            if (anim) {
                apiObject.anim = anim;
                serverObject.anim = anim;
            }
            apiObjs[id] = apiObject;
            serverObjs[id] = serverObject;

            frontObject.grhIndex = String(grhIndex);
            frontObjs[id] = frontObject;

            if (previousGrh !== grhIndex || previousAnim !== anim) {
                changed += 1;
            }
        }
    };

    apply(serverIni);
    apply(clientIni);
    writeJson(path.join(API_JSONS, "objs.json"), apiObjs);
    writeJson(path.join(SERVER_JSONS, "objs.json"), serverObjs);
    writeJson(path.join(FRONT_INIT, "objs.json"), frontObjs);

    return { objects: Object.keys(apiObjs).length, changed };
}

function updateNpcGraphics(): { npcs: number; changed: number } {
    const apiNpcs = readJson<Record<string, Record<string, unknown>>>(path.join(API_JSONS, "npcs.json"));
    const serverNpcs = fs.existsSync(path.join(SERVER_JSONS, "npcs.json"))
        ? readJson<Record<string, Record<string, unknown>>>(path.join(SERVER_JSONS, "npcs.json"))
        : { ...apiNpcs };
    const frontNpcs = readJson<Record<string, Record<string, unknown>>>(path.join(FRONT_INIT, "npcs.json"));
    let changed = 0;

    const apply = (filePath: string) => {
        if (!fs.existsSync(filePath)) {
            return;
        }

        const ini = parseIni(readLatin1(filePath));
        for (const [sectionName, section] of Object.entries(ini)) {
            const match = sectionName.match(/^NPC(\d+)$/i);
            if (!match) {
                continue;
            }

            const id = match[1];
            const idHead = toInt(getValue(section, "Head"));
            const idBody = toInt(getValue(section, "Body"));
            const apiNpc = apiNpcs[id] ?? {};
            const serverNpc = serverNpcs[id] ?? {};
            const frontNpc = frontNpcs[id] ?? {};
            const previousHead = Number(apiNpc.idHead ?? frontNpc.idHead ?? 0);
            const previousBody = Number(apiNpc.idBody ?? frontNpc.idBody ?? 0);

            apiNpc.idHead = idHead;
            apiNpc.idBody = idBody;
            apiNpcs[id] = apiNpc;

            serverNpc.idHead = idHead;
            serverNpc.idBody = idBody;
            serverNpcs[id] = serverNpc;

            frontNpc.idHead = idHead;
            frontNpc.idBody = idBody;
            frontNpcs[id] = frontNpc;

            if (previousHead !== idHead || previousBody !== idBody) {
                changed += 1;
            }
        }
    };

    apply(path.join(OLD_DAT, "NPCs.dat"));
    apply(path.join(OLD_DAT, "NPCs-HOSTILES.dat"));
    writeJson(path.join(API_JSONS, "npcs.json"), apiNpcs);
    writeJson(path.join(SERVER_JSONS, "npcs.json"), serverNpcs);
    writeJson(path.join(FRONT_INIT, "npcs.json"), frontNpcs);
    writeJson(path.join(FRONT_INIT, "npcs_optimized.json"), frontNpcs);

    return { npcs: Object.keys(apiNpcs).length, changed };
}

function main(): void {
    const existingHeads = readJson<Record<string, HeadEntry>>(path.join(FRONT_INIT, "heads.json"));
    const existingBodies = readJson<Record<string, BodyEntry>>(path.join(FRONT_INIT, "bodies.json"));
    const existingArmas = readJson<Record<string, HeadEntry>>(path.join(FRONT_INIT, "armas.json"));
    const existingCascos = readJson<Record<string, HeadEntry>>(path.join(FRONT_INIT, "cascos.json"));
    const existingEscudos = readJson<Record<string, HeadEntry>>(path.join(FRONT_INIT, "escudos.json"));
    const existingFxs = readJson<Record<string, FxEntry>>(path.join(FRONT_INIT, "fxs.json"));
    const existingGraficos = readJson<Record<string, GraphicEntry>>(path.join(FRONT_INIT, "graficos.json"));

    const heads = keepExtras(
        existingHeads,
        overwriteHeadingTable(parseIni(readLatin1(path.join(OLD_INIT, "Cabezas.dat"))), /^HEAD(\d+)$/i, "Head1", "Head2", "Head3", "Head4"),
    );

    const bodiesIni = parseIni(readLatin1(path.join(OLD_INIT, "Personajes.dat")));
    const bodiesOverwritten: Record<string, BodyEntry> = {};
    for (const [sectionName, section] of Object.entries(bodiesIni)) {
        const match = sectionName.match(/^BODY(\d+)$/i);
        if (!match) {
            continue;
        }

        const mapped = remapHeading(
            toInt(getValue(section, "Walk1")),
            toInt(getValue(section, "Walk2")),
            toInt(getValue(section, "Walk3")),
            toInt(getValue(section, "Walk4")),
        );
        if (mapped["1"] <= 0) {
            continue;
        }

        bodiesOverwritten[match[1]] = {
            ...mapped,
            headOffsetX: toInt(getValue(section, "HeadOffsetX")),
            headOffsetY: toInt(getValue(section, "HeadOffsetY")),
        };
    }
    const bodies = keepExtras(existingBodies, bodiesOverwritten);

    const armas = keepExtras(
        existingArmas,
        overwriteHeadingTable(parseIni(readLatin1(path.join(OLD_INIT, "Armas.dat"))), /^ARMA(\d+)$/i, "Dir1", "Dir2", "Dir3", "Dir4"),
    );

    const cascos = keepExtras(
        existingCascos,
        overwriteHeadingTable(
            parseIni(readLatin1(path.join(OLD_INIT, "Cascos.dat"))),
            /^CASCO(\d+)$/i,
            "Head1",
            "Head2",
            "Head3",
            "Head4",
            (section) => ({
                offsetX: toInt(getValue(section, "HeadOffsetX")),
                offsetY: toInt(getValue(section, "HeadOffsetY")),
            }),
        ),
    );

    const escudos = keepExtras(
        existingEscudos,
        overwriteHeadingTable(parseIni(readLatin1(path.join(OLD_INIT, "Escudos.dat"))), /^ESC(\d+)$/i, "Dir1", "Dir2", "Dir3", "Dir4"),
    );

    const fxsIni = parseIni(readLatin1(path.join(OLD_INIT, "Fxs.dat")));
    const fxsOverwritten: Record<string, FxEntry> = {};
    for (const [sectionName, section] of Object.entries(fxsIni)) {
        const match = sectionName.match(/^FX(\d+)$/i);
        if (!match) {
            continue;
        }

        const grh = toInt(getValue(section, "Animacion"));
        if (grh <= 0) {
            continue;
        }

        fxsOverwritten[match[1]] = {
            grh,
            offsetX: toInt(getValue(section, "OffsetX")),
            offsetY: toInt(getValue(section, "OffsetY")),
        };
    }
    const fxs = keepExtras(existingFxs, fxsOverwritten);

    const indEntries = parseGraficosInd(path.join(OLD_INIT, "Graficos.ind"));
    const graficos: Record<string, GraphicEntry> = {};
    const addGraphic = (id: number, entry: GraphicEntry) => {
        if (graficos[String(id)]) {
            return;
        }

        graficos[String(id)] = entry;
        if (!entry.frames) {
            return;
        }

        for (const frameId of Object.values(entry.frames)) {
            const numeric = Number(frameId);
            const frameEntry = indEntries.get(numeric);
            if (frameEntry) {
                addGraphic(numeric, frameEntry);
            }
        }
    };

    for (const [grhId, entry] of indEntries) {
        addGraphic(grhId, entry);
    }

    let extrasKept = 0;
    for (const [id, entry] of Object.entries(existingGraficos)) {
        if (!graficos[id]) {
            graficos[id] = entry;
            extrasKept += 1;
        }
    }

    writeJson(path.join(FRONT_INIT, "heads.json"), heads);
    writeJson(path.join(FRONT_INIT, "bodies.json"), bodies);
    writeJson(path.join(FRONT_INIT, "armas.json"), armas);
    writeJson(path.join(FRONT_INIT, "cascos.json"), cascos);
    writeJson(path.join(FRONT_INIT, "escudos.json"), escudos);
    writeJson(path.join(FRONT_INIT, "fxs.json"), fxs);
    writeJson(path.join(FRONT_INIT, "graficos.json"), graficos);

    const pngs = copyOldPngs();
    const objects = updateObjectGraphics();
    const npcs = updateNpcGraphics();
    const neededFiles = collectNeededFiles(graficos);
    const missingPngs = [...neededFiles].filter((fileNum) => {
        return !fs.existsSync(path.join(FRONT_GRAPHICS, `${fileNum}.png`));
    });

    const sample = {
        head12: heads["12"],
        head601: heads["601"],
        body5: bodies["5"],
        body215: bodies["215"],
        casco3: cascos["3"],
        arma1: armas["1"],
    };

    console.log(
        JSON.stringify(
            {
                heads: Object.keys(heads).length,
                bodies: Object.keys(bodies).length,
                armas: Object.keys(armas).length,
                cascos: Object.keys(cascos).length,
                escudos: Object.keys(escudos).length,
                fxs: Object.keys(fxs).length,
                graficos: Object.keys(graficos).length,
                graficosExtrasKept: extrasKept,
                pngs,
                missingPngs: missingPngs.slice(0, 30),
                missingPngCount: missingPngs.length,
                objects,
                npcs,
                sample,
            },
            null,
            2,
        ),
    );
}

main();
