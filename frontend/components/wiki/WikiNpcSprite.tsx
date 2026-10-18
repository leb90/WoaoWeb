"use client";

import { useEffect, useRef } from "react";
import type { BodiesDB, GraphicData, GraphicsDB, HeadsDB } from "@/types/game";
import { getTexturePath, loadBodiesDB, loadGraphicsDB, loadHeadsDB } from "@/utils/gameLoader";

let dataPromise: Promise<[GraphicsDB, BodiesDB, HeadsDB]> | null = null;
const imagePromises = new Map<string, Promise<HTMLImageElement>>();

function loadSpriteData(): Promise<[GraphicsDB, BodiesDB, HeadsDB]> {
    dataPromise ??= Promise.all([loadGraphicsDB(), loadBodiesDB(), loadHeadsDB()]);
    return dataPromise;
}

function resolveFrame(graphics: GraphicsDB, graphicId: number): GraphicData | null {
    const graphic = graphics[String(graphicId)];
    if (!graphic) return null;
    const frameId = graphic.numFrames > 1
        ? graphic.frames?.["1"] ?? Object.values(graphic.frames ?? {})[0]
        : undefined;
    return frameId ? graphics[String(frameId)] ?? graphic : graphic;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    const cached = imagePromises.get(src);
    if (cached) return cached;
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
    imagePromises.set(src, promise);
    return promise;
}

type Layer = { graphic: GraphicData; x: number; y: number; image: HTMLImageElement };

async function buildLayers(graphics: GraphicsDB, bodies: BodiesDB, heads: HeadsDB, bodyId: number, headId: number): Promise<Layer[]> {
    const body = bodies[String(bodyId)];
    if (!body) return [];
    const bodyGraphic = resolveFrame(graphics, Number(body["2"]));
    if (!bodyGraphic) return [];

    const bodyX = 16 - bodyGraphic.width / 2;
    const bodyY = 32 - bodyGraphic.height;
    const layers: Layer[] = [{
        graphic: bodyGraphic,
        x: bodyX,
        y: bodyY,
        image: await loadImage(getTexturePath(bodyGraphic)),
    }];
    const head = headId > 0 ? heads[String(headId)] : undefined;
    const headGraphic = head ? resolveFrame(graphics, Number(head["2"])) : null;
    if (headGraphic) {
        layers.push({
            graphic: headGraphic,
            x: bodyX + bodyGraphic.width / 2 - headGraphic.width / 2 + Number(body.headOffsetX ?? 0),
            y: bodyY + bodyGraphic.height - headGraphic.height + Number(body.headOffsetY ?? 0),
            image: await loadImage(getTexturePath(headGraphic)),
        });
    }
    return layers;
}

export default function WikiNpcSprite({ bodyId, headId, name, width = 64, height = 72 }: { bodyId: number; headId: number; name: string; width?: number; height?: number }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        let cancelled = false;
        const canvas = canvasRef.current;
        if (!canvas) return;

        void loadSpriteData().then(async ([graphics, bodies, heads]) => {
            const layers = await buildLayers(graphics, bodies, heads, bodyId, headId);
            if (cancelled || !layers.length) return;
            const context = canvas.getContext("2d");
            if (!context) return;

            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            context.imageSmoothingEnabled = false;
            context.clearRect(0, 0, width, height);

            const minX = Math.min(...layers.map((layer) => layer.x));
            const minY = Math.min(...layers.map((layer) => layer.y));
            const maxX = Math.max(...layers.map((layer) => layer.x + layer.graphic.width));
            const maxY = Math.max(...layers.map((layer) => layer.y + layer.graphic.height));
            const scale = Math.min((width - 8) / Math.max(1, maxX - minX), (height - 8) / Math.max(1, maxY - minY), 3);
            const offsetX = (width - (maxX - minX) * scale) / 2 - minX * scale;
            const offsetY = (height - (maxY - minY) * scale) / 2 - minY * scale;

            for (const layer of layers) {
                const graphic = layer.graphic;
                context.drawImage(
                    layer.image,
                    graphic.sX,
                    graphic.sY,
                    graphic.width,
                    graphic.height,
                    Math.round(layer.x * scale + offsetX),
                    Math.round(layer.y * scale + offsetY),
                    Math.round(graphic.width * scale),
                    Math.round(graphic.height * scale),
                );
            }
        }).catch(() => undefined);

        return () => { cancelled = true; };
    }, [bodyId, headId, height, width]);

    return (
        <div className="relative shrink-0 overflow-hidden border border-amber-200/15 bg-[radial-gradient(circle_at_center,rgba(151,101,32,.16),rgba(8,6,4,.96)_70%)]" style={{ width, height }} aria-label={`Sprite de ${name}`}>
            <canvas ref={canvasRef} className="h-full w-full [image-rendering:pixelated]" />
        </div>
    );
}
