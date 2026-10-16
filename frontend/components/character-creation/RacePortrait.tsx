"use client";

import { useEffect, useRef, useState } from "react";

type HeadWithFile = [file: string, sX: number, sY: number, width: number, height: number];

const portraitImageCache = new Map<string, Promise<HTMLImageElement>>();
let headsWithFilePromise: Promise<Record<string, HeadWithFile>> | null = null;

function loadHeadsWithFile() {
    headsWithFilePromise ??= fetch("/init/headswithfile.json?v=3.0").then(
        (response) => response.json() as Promise<Record<string, HeadWithFile>>,
    );
    return headsWithFilePromise;
}

function loadPortraitImage(file: string) {
    const cached = portraitImageCache.get(file);
    if (cached) {
        return cached;
    }

    const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`No se pudo cargar ${file}`));
        image.src = `/graphics/${file}.png`;
    });
    portraitImageCache.set(file, loaded);
    return loaded;
}

function trimOpaquePixels(pixels: Uint8ClampedArray, width: number, height: number) {
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            if (pixels[(y * width + x) * 4 + 3] < 24) {
                continue;
            }
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }
    }

    if (maxX < minX || maxY < minY) {
        return null;
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
    };
}

export default function RacePortrait({
    headId,
    label,
    size = 52,
}: {
    headId: number;
    label: string;
    size?: number;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setFailed(false);

        loadHeadsWithFile()
            .then(async (data) => {
                const frame = data[String(headId)];
                const canvas = canvasRef.current;
                if (!frame || !canvas) {
                    throw new Error("Sin retrato");
                }

                const [file, sX, sY, width, height] = frame;
                const image = await loadPortraitImage(file);
                if (cancelled) {
                    return;
                }

                const source = document.createElement("canvas");
                source.width = width;
                source.height = height;
                const sourceContext = source.getContext("2d");
                const destContext = canvas.getContext("2d");
                if (!sourceContext || !destContext) {
                    throw new Error("Sin canvas");
                }

                sourceContext.clearRect(0, 0, width, height);
                sourceContext.drawImage(image, sX, sY, width, height, 0, 0, width, height);
                const bounds = trimOpaquePixels(
                    sourceContext.getImageData(0, 0, width, height).data,
                    width,
                    height,
                ) ?? { x: 0, y: 0, width, height };
                const scale = Math.min(
                    (size - 8) / bounds.width,
                    (size - 8) / bounds.height,
                );
                const drawWidth = Math.max(1, Math.round(bounds.width * scale));
                const drawHeight = Math.max(1, Math.round(bounds.height * scale));

                destContext.imageSmoothingEnabled = false;
                destContext.clearRect(0, 0, size, size);
                destContext.drawImage(
                    source,
                    bounds.x,
                    bounds.y,
                    bounds.width,
                    bounds.height,
                    Math.floor((size - drawWidth) / 2),
                    Math.floor((size - drawHeight) / 2),
                    drawWidth,
                    drawHeight,
                );
            })
            .catch(() => {
                if (!cancelled) {
                    setFailed(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [headId, size]);

    if (failed) {
        return (
            <span className="px-1 text-center text-[9px] leading-tight text-[#eee5d3]">
                {label}
            </span>
        );
    }

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            aria-hidden="true"
            className="block"
            style={{
                width: size,
                height: size,
                imageRendering: "pixelated",
            }}
        />
    );
}
