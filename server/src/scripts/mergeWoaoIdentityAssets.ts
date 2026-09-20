import fs from "node:fs";
import path from "node:path";
import { normalizeWoaoGraphicSpeed } from "./woaoGraphicSpeed";

const ROOT = path.resolve(__dirname, "../../..");
const OLD_RECURSOS = path.join(
    ROOT,
    "old/Nuevo Motor Graf/Cliente 7.7 1280x720/Recursos",
);
const OLD_INIT = path.join(OLD_RECURSOS, "Init");
const OLD_GRAFICOS = path.join(OLD_RECURSOS, "Graficos");
const OLD_INTERFACES = path.join(OLD_RECURSOS, "Interfaces");
const FRONT_INIT = path.join(ROOT, "frontend/public/init");
const FRONT_GRAPHICS = path.join(ROOT, "frontend/public/graphics");
const FRONT_STATIC_WOAO = path.join(ROOT, "frontend/public/static/woao");

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

function collectNeededGrhIds(
    heads: Record<string, HeadEntry>,
    bodies: Record<string, BodyEntry>,
    fxs: Record<string, FxEntry>,
): Set<number> {
    const ids = new Set<number>();

    for (const head of Object.values(heads)) {
        for (const key of ["1", "2", "3", "4"] as const) {
            if (head[key] > 0) {
                ids.add(head[key]);
            }
        }
    }

    for (const body of Object.values(bodies)) {
        for (const key of ["1", "2", "3", "4"] as const) {
            if (body[key] > 0) {
                ids.add(body[key]);
            }
        }
    }

    for (const fx of Object.values(fxs)) {
        if (fx.grh > 0) {
            ids.add(fx.grh);
        }
    }

    return ids;
}

function parseGraficosInd(filePath: string): Map<number, GraphicEntry> {
    const buffer = fs.readFileSync(filePath);
    const strategies = [16, 8, 0];

    for (const srcBytes of strategies) {
        try {
            const parsed = parseGraficosIndWithSrc(buffer, srcBytes);
            if (parsed.size > 100) {
                console.log(`Graficos.ind parse ok with srcBytes=${srcBytes}, entries=${parsed.size}`);
                return parsed;
            }
        } catch (error) {
            console.log(`Graficos.ind parse failed srcBytes=${srcBytes}:`, error);
        }
    }

    throw new Error("No se pudo parsear Graficos.ind");
}

function parseGraficosIndWithSrc(
    buffer: Buffer,
    srcBytes: number,
): Map<number, GraphicEntry> {
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
            const speed = normalizeWoaoGraphicSpeed(readSingle(), numFrames);
            result.set(grh, { numFrames, frames, speed });
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

function findOldGraphicFile(fileNum: number): string | null {
    const candidates = [
        path.join(OLD_GRAFICOS, `${fileNum}.png`),
        path.join(OLD_GRAFICOS, `${fileNum}.PNG`),
        path.join(OLD_GRAFICOS, `${fileNum}.Png`),
    ];

    return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function findFrontGraphicFile(fileNum: number): string | null {
    const candidates = [
        path.join(FRONT_GRAPHICS, `${fileNum}.png`),
        path.join(FRONT_GRAPHICS, `${fileNum}.PNG`),
    ];

    return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function main() {
    const cabezas = parseIni(readLatin1(path.join(OLD_INIT, "Cabezas.dat")));
    const personajes = parseIni(readLatin1(path.join(OLD_INIT, "Personajes.dat")));
    const fxsIni = parseIni(readLatin1(path.join(OLD_INIT, "Fxs.dat")));

    const headsPath = path.join(FRONT_INIT, "heads.json");
    const bodiesPath = path.join(FRONT_INIT, "bodies.json");
    const fxsPath = path.join(FRONT_INIT, "fxs.json");
    const graficosPath = path.join(FRONT_INIT, "graficos.json");

    const heads = JSON.parse(fs.readFileSync(headsPath, "utf8")) as Record<
        string,
        HeadEntry
    >;
    const bodies = JSON.parse(fs.readFileSync(bodiesPath, "utf8")) as Record<
        string,
        BodyEntry
    >;
    const fxs = JSON.parse(fs.readFileSync(fxsPath, "utf8")) as Record<
        string,
        FxEntry
    >;
    const graficos = JSON.parse(fs.readFileSync(graficosPath, "utf8")) as Record<
        string,
        GraphicEntry
    >;

    let headsAdded = 0;
    let bodiesAdded = 0;
    let fxsAdded = 0;

    for (const [section, values] of Object.entries(cabezas)) {
        const match = section.match(/^HEAD(\d+)$/i);
        if (!match) {
            continue;
        }

        const headId = match[1];
        const mapped = remapHeading(
            toInt(values.Head1),
            toInt(values.Head2),
            toInt(values.Head3),
            toInt(values.Head4),
        );

        if (mapped["1"] > 0) {
            heads[headId] = mapped;
            headsAdded += 1;
        }
    }

    for (const [section, values] of Object.entries(personajes)) {
        const match = section.match(/^BODY(\d+)$/i);
        if (!match) {
            continue;
        }

        const bodyId = match[1];
        const mapped = {
            ...remapHeading(
                toInt(values.Walk1),
                toInt(values.Walk2),
                toInt(values.Walk3),
                toInt(values.Walk4),
            ),
            headOffsetX: toInt(values.HeadOffsetX),
            headOffsetY: toInt(values.HeadOffsetY),
        };

        if (mapped["1"] > 0) {
            bodies[bodyId] = mapped;
            bodiesAdded += 1;
        }
    }

    for (const [section, values] of Object.entries(fxsIni)) {
        const match = section.match(/^FX(\d+)$/i);
        if (!match) {
            continue;
        }

        const fxId = match[1];
        const grh = toInt(values.Animacion);
        if (grh <= 0) {
            continue;
        }

        fxs[fxId] = {
            grh,
            offsetX: toInt(values.OffsetX),
            offsetY: toInt(values.OffsetY),
        };
        fxsAdded += 1;
    }

    const neededGrh = collectNeededGrhIds(heads, bodies, fxs);
    const missingGrh = [...neededGrh].filter((id) => !graficos[String(id)]);
    console.log(`GRH necesarios: ${neededGrh.size}, faltantes en graficos.json: ${missingGrh.length}`);

    const indPath = path.join(OLD_INIT, "Graficos.ind");
    const indEntries = fs.existsSync(indPath) ? parseGraficosInd(indPath) : new Map<number, GraphicEntry>();
    let graficosAdded = 0;
    const neededFiles = new Set<number>();

    const addGraphic = (id: number, entry: GraphicEntry) => {
        const alreadyExists = Boolean(graficos[String(id)]);
        graficos[String(id)] = entry;
        if (!alreadyExists) {
            graficosAdded += 1;
        }

        if (entry.numFile) {
            neededFiles.add(Number(entry.numFile));
        }

        if (entry.frames) {
            for (const frameId of Object.values(entry.frames)) {
                const numeric = Number(frameId);
                const frameEntry = indEntries.get(numeric);
                if (frameEntry) {
                    addGraphic(numeric, frameEntry);
                }
            }
        }
    };

    for (const grhId of missingGrh) {
        const entry = indEntries.get(grhId);
        if (entry) {
            addGraphic(grhId, entry);
        }
    }

    let pngCopied = 0;
    for (const fileNum of neededFiles) {
        const source = findOldGraphicFile(fileNum);
        if (!source) {
            if (!findFrontGraphicFile(fileNum)) {
                console.log(`PNG faltante: ${fileNum}`);
            }
            continue;
        }

        fs.copyFileSync(source, path.join(FRONT_GRAPHICS, `${fileNum}.png`));
        pngCopied += 1;
    }

    fs.mkdirSync(FRONT_STATIC_WOAO, { recursive: true });
    for (const fileName of ["CrearPj1.JPG", "CrearPj2.JPG", "RAZA.JPG", "Clase.jpg"]) {
        const source = path.join(OLD_INTERFACES, fileName);
        if (fs.existsSync(source)) {
            fs.copyFileSync(source, path.join(FRONT_STATIC_WOAO, fileName.toLowerCase()));
        }
    }

    fs.writeFileSync(headsPath, JSON.stringify(heads));
    fs.writeFileSync(bodiesPath, JSON.stringify(bodies));
    fs.writeFileSync(fxsPath, JSON.stringify(fxs));
    fs.writeFileSync(graficosPath, JSON.stringify(graficos));

    console.log(
        JSON.stringify(
            {
                headsAdded,
                bodiesAdded,
                fxsAdded,
                graficosAdded,
                pngCopied,
                missingGrhAfter: missingGrh.filter((id) => !graficos[String(id)]),
            },
            null,
            2,
        ),
    );
}

main();
