"use client";

// Vista en vivo del panel /online de los GM: dibuja en un canvas 2D lo que rodea al personaje observado, con los mismos
// gráficos y las mismas reglas de ubicación que el juego (characterLayout.ts y sceneRenderer.ts), pero sin el motor
// Pixi. El server manda un cuadro cada 200 ms (server/src/gmOnline.ts) y acá se interpolan las posiciones entre el
// anterior y el último para que se vea fluido. Los techos no se dibujan: al GM le interesa ver al personaje.

import { useEffect, useRef, useState } from "react";
import type {
    BodiesDB,
    GraphicData,
    GraphicsDB,
    HeadsDB,
    HelmetsDB,
    MapData,
    MapTile,
    ObjectsDB,
    ShieldsDB,
    WeaponsDB,
} from "@/types/game";
import {
    getTexturePath,
    loadBodiesDB,
    loadGraphicsDB,
    loadHeadsDB,
    loadHelmetsDB,
    loadMapData,
    loadObjectsDB,
    loadShieldsDB,
    loadWeaponsDB,
} from "@/utils/gameLoader";
import { normalizeGraphicAnimationSpeed } from "@/lib/graphicAnimationSpeed";
import type { GmLiveEntity, GmLiveFrame } from "@/lib/gmOnline";
import { getMountEquipmentLift } from "../rendering/characterLayout";

const TILE = 32;
export const LIVE_VIEW_TILES_X = 15;
export const LIVE_VIEW_TILES_Y = 11;
const VIEW_WIDTH = LIVE_VIEW_TILES_X * TILE;
const VIEW_HEIGHT = LIVE_VIEW_TILES_Y * TILE;
// Lo que tarda en llegar el próximo cuadro: las posiciones se interpolan en ese tiempo.
const FRAME_MS = 200;
const WALK_FRAME_MS = 1000 / 18;
const NAME_FONT = "600 10px Arial, Helvetica, sans-serif";
const SPEECH_FONT = "600 10px Arial, Helvetica, sans-serif";

type Assets = {
    graphics: GraphicsDB;
    bodies: BodiesDB;
    heads: HeadsDB;
    weapons: WeaponsDB;
    shields: ShieldsDB;
    helmets: HelmetsDB;
    objects: ObjectsDB;
};

let assetsPromise: Promise<Assets> | null = null;
const mapPromises = new Map<number, Promise<MapData | null>>();
const loadedMaps = new Map<number, MapData>();
const images = new Map<string, HTMLImageElement>();

function loadAssets(): Promise<Assets> {
    assetsPromise ??= Promise.all([
        loadGraphicsDB(),
        loadBodiesDB(),
        loadHeadsDB(),
        loadWeaponsDB(),
        loadShieldsDB(),
        loadHelmetsDB(),
        loadObjectsDB(),
    ]).then(([graphics, bodies, heads, weapons, shields, helmets, objects]) => ({
        graphics,
        bodies,
        heads,
        weapons,
        shields,
        helmets,
        objects,
    }));
    return assetsPromise;
}

function ensureMap(map: number): void {
    if (mapPromises.has(map)) {
        return;
    }
    mapPromises.set(
        map,
        loadMapData(map)
            .then((data) => {
                loadedMaps.set(map, data);
                return data;
            })
            .catch(() => null),
    );
}

function getImage(graphic: GraphicData): HTMLImageElement | null {
    const src = getTexturePath(graphic);
    let image = images.get(src);
    if (!image) {
        image = new Image();
        image.decoding = "async";
        image.src = src;
        images.set(src, image);
    }
    return image.complete && image.naturalWidth > 0 ? image : null;
}

function frameKeys(graphic: GraphicData): string[] {
    return Object.keys(graphic.frames ?? {}).sort((a, b) => Number(a) - Number(b));
}

/** El cuadro de un gráfico animado que toca ahora (o el primero, si no se anima). */
function resolveFrame(assets: Assets, graphicId: number, now: number, animate = true, frameMs?: number): GraphicData | null {
    const graphic = assets.graphics[String(graphicId)];
    if (!graphic) {
        return null;
    }
    if (graphic.numFrames <= 1) {
        return graphic;
    }
    const keys = frameKeys(graphic);
    if (!keys.length) {
        return graphic;
    }
    let index = 0;
    if (graphic.unaVez) {
        index = keys.length - 1;
    } else if (animate) {
        const ms = frameMs ?? normalizeGraphicAnimationSpeed(graphic.speed, graphic.numFrames);
        index = Math.floor(now / Math.max(ms, 16)) % keys.length;
    }
    return assets.graphics[String(graphic.frames[keys[index]])] ?? graphic;
}

function drawGraphic(ctx: CanvasRenderingContext2D, graphic: GraphicData, x: number, y: number): void {
    const image = getImage(graphic);
    if (!image) {
        return;
    }
    ctx.drawImage(image, graphic.sX, graphic.sY, graphic.width, graphic.height, Math.round(x), Math.round(y), graphic.width, graphic.height);
}

type Placement = GmLiveFrame["placements"][number];

/** Baldosa del mundo en coordenadas del mapa del personaje: el propio mapa, o el vecino que la cubre. */
function resolveTile(frame: GmLiveFrame, x: number, y: number): MapTile | undefined {
    const inside = (placement: Placement, localX: number, localY: number) =>
        localX >= placement.interior.minX &&
        localX <= placement.interior.maxX &&
        localY >= placement.interior.minY &&
        localY <= placement.interior.maxY;
    const tileOf = (map: number, localX: number, localY: number) =>
        loadedMaps.get(map)?.[map]?.[String(localY)]?.[String(localX)];

    for (const placement of frame.placements) {
        const localX = x - placement.originX;
        const localY = y - placement.originY;
        if (inside(placement, localX, localY)) {
            return tileOf(placement.map, localX, localY);
        }
    }
    return x >= 1 && x <= 100 && y >= 1 && y <= 100 ? tileOf(frame.map, x, y) : undefined;
}

type PlacedEntity = { entity: GmLiveEntity; x: number; y: number; moving: boolean };

function placeEntities(frame: GmLiveFrame, previous: GmLiveFrame | null, now: number): PlacedEntity[] {
    const progress = Math.min(1, Math.max(0, (now - frame.receivedAt) / FRAME_MS));
    const before = new Map((previous?.entities ?? []).map((entity) => [entity.id, entity]));

    return frame.entities.map((entity) => {
        const old = before.get(entity.id);
        if (!old || Math.abs(old.x - entity.x) + Math.abs(old.y - entity.y) > 2) {
            return { entity, x: entity.x, y: entity.y, moving: false };
        }
        const moved = old.x !== entity.x || old.y !== entity.y;
        return {
            entity,
            x: old.x + (entity.x - old.x) * progress,
            y: old.y + (entity.y - old.y) * progress,
            moving: moved && progress < 1,
        };
    });
}

function drawCharacter(
    ctx: CanvasRenderingContext2D,
    assets: Assets,
    placed: PlacedEntity,
    sx: number,
    sy: number,
    now: number,
): { headTop: number; feet: number } | null {
    const { entity, moving } = placed;
    const body = assets.bodies[String(entity.body)];
    if (!body) {
        return null;
    }
    const direction = String(entity.heading >= 1 && entity.heading <= 4 ? entity.heading : 3) as "1" | "2" | "3" | "4";
    const bodyGraphic = resolveFrame(assets, Number(body[direction]), now, moving, WALK_FRAME_MS);
    if (!bodyGraphic) {
        return null;
    }

    const bodyX = sx + 16 - Math.floor(bodyGraphic.width / 2);
    const bodyY = sy + 32 - bodyGraphic.height;
    const headOffsetX = Number(body.headOffsetX ?? 0);
    const headOffsetY = Number(body.headOffsetY ?? 0);
    let headTop = bodyY;

    const drawBody = () => drawGraphic(ctx, bodyGraphic, bodyX, bodyY);
    const drawHead = () => {
        const head = entity.head > 0 ? assets.heads[String(entity.head)] : undefined;
        const headGraphic = head ? resolveFrame(assets, Number(head[direction]), now, false) : null;
        if (headGraphic) {
            const y = bodyY + bodyGraphic.height - headGraphic.height + headOffsetY;
            headTop = Math.min(headTop, y);
            drawGraphic(ctx, headGraphic, bodyX + bodyGraphic.width / 2 - headGraphic.width / 2 + headOffsetX, y);
        }
        const helmet = entity.helmet > 0 ? assets.helmets[String(entity.helmet)] : undefined;
        const helmetGraphic = helmet ? resolveFrame(assets, Number(helmet[direction]), now, false) : null;
        if (helmet && helmetGraphic) {
            const y = bodyY + bodyGraphic.height - helmetGraphic.height + headOffsetY - 34 + Number(helmet.offsetY ?? 0);
            headTop = Math.min(headTop, y);
            drawGraphic(
                ctx,
                helmetGraphic,
                bodyX + bodyGraphic.width / 2 - helmetGraphic.width / 2 + headOffsetX + Number(helmet.offsetX ?? 0),
                y,
            );
        }
    };
    const drawEquipment = (kind: "weapon" | "shield") => {
        const data = kind === "weapon" ? assets.weapons[String(entity.weapon)] : assets.shields[String(entity.shield)];
        const id = kind === "weapon" ? entity.weapon : entity.shield;
        const graphic = id > 0 && data ? resolveFrame(assets, Number(data[direction]), now, moving, WALK_FRAME_MS) : null;
        if (!data || !graphic) {
            return;
        }
        drawGraphic(
            ctx,
            graphic,
            sx + 16 - Math.floor(graphic.width / 2) + Number(data.offsetX ?? 0),
            sy + (kind === "weapon" ? 28 : 32) - graphic.height - getMountEquipmentLift(headOffsetY) + Number(data.offsetY ?? 0),
        );
    };

    // Mirando al norte, el arma y el escudo quedan detrás del cuerpo (getEquipmentLayerZIndex).
    if (entity.heading === 1) {
        drawEquipment("weapon");
        drawEquipment("shield");
        drawBody();
        drawHead();
    } else {
        drawBody();
        drawHead();
        drawEquipment("weapon");
        drawEquipment("shield");
    }

    return { headTop, feet: sy + 32 };
}

function wrapSpeech(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = next;
        }
    }
    if (line) {
        lines.push(line);
    }
    if (lines.length > 3) {
        return [...lines.slice(0, 2), `${lines[2]}…`];
    }
    return lines;
}

function drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string): void {
    ctx.font = NAME_FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function drawHealth(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, x: number, y: number): void {
    if (maxHp <= 0) {
        return;
    }
    const width = 30;
    const ratio = Math.max(0, Math.min(1, hp / maxHp));
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(x - width / 2 - 1, y - 1, width + 2, 5);
    ctx.fillStyle = ratio > 0.5 ? "#22c55e" : ratio > 0.25 ? "#f59e0b" : "#ef4444";
    ctx.fillRect(x - width / 2, y, Math.round(width * ratio), 3);
}

function drawScene(
    ctx: CanvasRenderingContext2D,
    assets: Assets,
    frame: GmLiveFrame,
    previous: GmLiveFrame | null,
    now: number,
): void {
    const placed = placeEntities(frame, previous, now);
    const target = placed.find((item) => item.entity.id === frame.id);
    const cameraX = target?.x ?? frame.x;
    const cameraY = target?.y ?? frame.y;
    const offsetX = VIEW_WIDTH / 2 - TILE / 2 - cameraX * TILE;
    const offsetY = VIEW_HEIGHT / 2 - TILE / 2 - cameraY * TILE;
    const toScreenX = (x: number) => x * TILE + offsetX;
    const toScreenY = (y: number) => y * TILE + offsetY;

    const minX = Math.floor(cameraX - LIVE_VIEW_TILES_X / 2) - 2;
    const maxX = Math.ceil(cameraX + LIVE_VIEW_TILES_X / 2) + 2;
    const minY = Math.floor(cameraY - LIVE_VIEW_TILES_Y / 2) - 2;
    // Los árboles y las paredes de las filas de abajo suben y tapan parte de la vista.
    const maxY = Math.ceil(cameraY + LIVE_VIEW_TILES_Y / 2) + 5;

    ctx.fillStyle = "#050403";
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    const tiles = new Map<string, MapTile | undefined>();
    const tileAt = (x: number, y: number) => {
        const key = `${x}:${y}`;
        if (!tiles.has(key)) {
            tiles.set(key, resolveTile(frame, x, y));
        }
        return tiles.get(key);
    };

    for (const layer of ["1", "2"] as const) {
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const graphicId = Number(tileAt(x, y)?.graphics?.[layer] ?? 0);
                const graphic = graphicId > 0 ? resolveFrame(assets, graphicId, now) : null;
                if (graphic) {
                    drawGraphic(
                        ctx,
                        graphic,
                        toScreenX(x) + Number(graphic.offset?.x ?? 0),
                        toScreenY(y) + Number(graphic.offset?.y ?? 0),
                    );
                }
            }
        }
    }

    const itemsByRow = new Map<number, GmLiveFrame["items"]>();
    for (const item of frame.items) {
        itemsByRow.set(item.y, [...(itemsByRow.get(item.y) ?? []), item]);
    }
    const entitiesByRow = new Map<number, PlacedEntity[]>();
    for (const item of placed) {
        const row = Math.round(item.y);
        entitiesByRow.set(row, [...(entitiesByRow.get(row) ?? []), item]);
    }

    const labels: Array<() => void> = [];
    const speechById = new Map(frame.speech.map((line) => [line.id, line.text]));

    const drawBottomAnchored = (graphic: GraphicData, x: number, y: number) =>
        drawGraphic(
            ctx,
            graphic,
            toScreenX(x) + 16 - Math.floor(graphic.width / 2) + Number(graphic.offset?.x ?? 0),
            toScreenY(y) + 32 - graphic.height + Number(graphic.offset?.y ?? 0),
        );

    for (let y = minY; y <= maxY; y++) {
        for (const item of itemsByRow.get(y) ?? []) {
            const grh = Number(assets.objects[String(item.obj)]?.grhIndex ?? 0);
            const graphic = grh > 0 ? resolveFrame(assets, grh, now) : null;
            if (graphic) {
                drawBottomAnchored(graphic, item.x, item.y);
            }
        }

        for (const item of (entitiesByRow.get(y) ?? []).sort((a, b) => a.x - b.x)) {
            const sx = toScreenX(item.x);
            const sy = toScreenY(item.y);
            const isTarget = item.entity.id === frame.id;

            if (isTarget) {
                ctx.save();
                ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
                ctx.fillStyle = "rgba(251, 191, 36, 0.18)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.ellipse(sx + 16, sy + 29, 13, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            ctx.save();
            if (item.entity.invisible) {
                ctx.globalAlpha = 0.45;
            }
            const bounds = drawCharacter(ctx, assets, item, sx, sy, now);
            ctx.restore();

            const headTop = bounds?.headTop ?? sy - 16;
            const feet = bounds?.feet ?? sy + 32;
            const speech = speechById.get(item.entity.id);
            labels.push(() => {
                const color = isTarget ? "#fcd34d" : item.entity.color || (item.entity.npc ? "#e7e5e4" : "#f5f5f4");
                drawLabel(ctx, item.entity.name, sx + 16, feet + 2, color);
                if (isTarget || (item.entity.npc && item.entity.hp < item.entity.maxHp)) {
                    drawHealth(ctx, item.entity.hp, item.entity.maxHp, sx + 16, feet + 15);
                }
                if (speech) {
                    ctx.font = SPEECH_FONT;
                    const lines = wrapSpeech(ctx, speech, 150);
                    lines.forEach((line, index) => {
                        drawLabel(ctx, line, sx + 16, headTop - 6 - (lines.length - index) * 12, "#ffffff");
                    });
                }
            });
        }

        for (let x = minX; x <= maxX; x++) {
            const graphicId = Number(tileAt(x, y)?.graphics?.["3"] ?? 0);
            const graphic = graphicId > 0 ? resolveFrame(assets, graphicId, now) : null;
            if (graphic) {
                drawBottomAnchored(graphic, x, y);
            }
        }
    }

    for (const drawLabelLater of labels) {
        drawLabelLater();
    }
}

type GmLiveViewProps = {
    frame: GmLiveFrame | null;
    previousFrame: GmLiveFrame | null;
    offline: boolean;
};

export default function GmLiveView({ frame, previousFrame, offline }: GmLiveViewProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameRef = useRef<{ frame: GmLiveFrame | null; previous: GmLiveFrame | null }>({ frame, previous: previousFrame });
    const [assets, setAssets] = useState<Assets | null>(null);
    const [mapsReady, setMapsReady] = useState(false);

    useEffect(() => {
        frameRef.current = { frame, previous: previousFrame };
    }, [frame, previousFrame]);

    useEffect(() => {
        let active = true;
        void loadAssets()
            .then((loaded) => {
                if (active) {
                    setAssets(loaded);
                }
            })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, []);

    const mapsKey = frame?.placements.map((placement) => placement.map).join(",") ?? "";

    useEffect(() => {
        if (!mapsKey) {
            return;
        }
        let active = true;
        const maps = mapsKey.split(",").map(Number);
        maps.forEach(ensureMap);
        setMapsReady(maps.every((map) => loadedMaps.has(map)));
        void Promise.all(maps.map((map) => mapPromises.get(map))).then(() => {
            if (active) {
                setMapsReady(true);
            }
        });
        return () => {
            active = false;
        };
    }, [mapsKey]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context || !assets) {
            return;
        }

        const resize = () => {
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
            canvas.width = width;
            canvas.height = Math.round((width * VIEW_HEIGHT) / VIEW_WIDTH);
        };
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);

        let animationFrame = 0;
        const draw = () => {
            animationFrame = requestAnimationFrame(draw);
            const { frame: current, previous } = frameRef.current;
            const scale = canvas.width / VIEW_WIDTH;
            context.setTransform(scale, 0, 0, scale, 0, 0);
            context.imageSmoothingEnabled = false;
            if (!current) {
                context.fillStyle = "#050403";
                context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
                return;
            }
            drawScene(context, assets, current, previous, performance.now());
        };
        animationFrame = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationFrame);
            observer.disconnect();
        };
    }, [assets]);

    const message = offline
        ? "Se desconectó."
        : !frame
          ? "Conectando con el personaje…"
          : !assets || !mapsReady
            ? "Cargando el mapa…"
            : null;

    return (
        <div className="relative w-full overflow-hidden rounded-xl border border-amber-200/15 bg-[#050403]" style={{ aspectRatio: `${VIEW_WIDTH} / ${VIEW_HEIGHT}` }}>
            <canvas
                ref={canvasRef}
                className="block h-full w-full [image-rendering:pixelated]"
                aria-label={frame ? `Vista en vivo de ${frame.mapName}` : "Vista en vivo"}
                data-testid="gm-live-view"
            />
            {message ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm text-stone-200">
                    {message}
                </div>
            ) : null}
        </div>
    );
}
