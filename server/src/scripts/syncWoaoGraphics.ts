import fs from "node:fs";
import path from "node:path";
import { normalizeWoaoGraphicSpeed } from "./woaoGraphicSpeed";

const ROOT = path.resolve(__dirname, "../../..");
const OLD_GRAFICOS = path.join(
    ROOT,
    "old/Nuevo Motor Graf/Cliente 7.7 1280x720/Recursos/Graficos",
);
const OLD_IND = path.join(
    ROOT,
    "old/Nuevo Motor Graf/Cliente 7.7 1280x720/Recursos/Init/Graficos.ind",
);
const FRONT_GRAPHICS = path.join(ROOT, "frontend/public/graphics");
const GRAFICOS_PATH = path.join(ROOT, "frontend/public/init/graficos.json");

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

function main() {
    fs.mkdirSync(FRONT_GRAPHICS, { recursive: true });

    let pngCopied = 0;
    const oldFiles = fs.readdirSync(OLD_GRAFICOS).filter((name) => /\.png$/i.test(name));
    for (const fileName of oldFiles) {
        const dest = path.join(FRONT_GRAPHICS, fileName.toLowerCase().endsWith(".png") ? fileName.replace(/\.PNG$/i, ".png") : fileName);
        if (fs.existsSync(dest)) {
            continue;
        }

        fs.copyFileSync(path.join(OLD_GRAFICOS, fileName), dest);
        pngCopied += 1;
    }

    const graficos = JSON.parse(fs.readFileSync(GRAFICOS_PATH, "utf8")) as Record<string, GraphicEntry>;
    const indEntries = parseGraficosInd(OLD_IND);
    let graficosAdded = 0;

    const addGraphic = (id: number, entry: GraphicEntry) => {
        if (graficos[String(id)]) {
            return;
        }

        graficos[String(id)] = entry;
        graficosAdded += 1;

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

    for (const [grhId, entry] of indEntries) {
        addGraphic(grhId, entry);
    }

    fs.writeFileSync(GRAFICOS_PATH, JSON.stringify(graficos));

    console.log(
        JSON.stringify(
            {
                pngCopied,
                graficosAdded,
                graficosTotal: Object.keys(graficos).length,
                oldPngs: oldFiles.length,
            },
            null,
            2,
        ),
    );
}

main();
