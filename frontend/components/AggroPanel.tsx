"use client";

import React from "react";
import { Crosshair } from "lucide-react";
import type { AggroStatePayload } from "../lib/aowProtocol";
import type { BodiesDB, GraphicData, HeadsDB } from "../types/game";
import { getTexturePath, loadBodiesDB, loadGraphicsDB, loadHeadsDB } from "../utils/gameLoader";

type Props = {
    aggro: AggroStatePayload | null | undefined;
    className?: string;
    style?: React.CSSProperties;
};

type Databases = { graphics: Record<string, GraphicData>; bodies: BodiesDB; heads: HeadsDB };

const MAX_ROWS = 5;
const ICON_SIZE = 34;
const SOUTH = "4";

// Primer cuadro de un gráfico (si es una animación, su cuadro 1).
function firstFrame(graphics: Record<string, GraphicData>, grhId: number | undefined): GraphicData | null {
    const graphic = grhId ? graphics[String(grhId)] : undefined;
    if (!graphic) return null;
    if (Number(graphic.numFrames) > 1 && graphic.frames?.["1"]) {
        return graphics[String(graphic.frames["1"])] ?? null;
    }
    return graphic.numFile ? graphic : null;
}

function SpriteFrame({ frame, left, top, scale }: { frame: GraphicData; left: number; top: number; scale: number }) {
    return (
        <div
            className="absolute bg-no-repeat"
            style={{
                left,
                top,
                width: frame.width,
                height: frame.height,
                backgroundImage: `url(${getTexturePath(frame)})`,
                backgroundPosition: `-${frame.sX}px -${frame.sY}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                imageRendering: "pixelated",
            }}
        />
    );
}

// Ícono de la criatura: cuerpo mirando al frente y, si tiene, la cabeza encima (como en el mapa).
function CreatureIcon({ body, head, dbs }: { body: number; head: number; dbs: Databases | null }) {
    const bodyData = dbs?.bodies[String(body)];
    const bodyFrame = dbs && bodyData ? firstFrame(dbs.graphics, Number(bodyData[SOUTH])) : null;
    const headData = head > 0 ? dbs?.heads[String(head)] : undefined;
    const headFrame = dbs && headData ? firstFrame(dbs.graphics, Number(headData[SOUTH])) : null;

    if (!bodyFrame) {
        return <div className="h-[34px] w-[34px] shrink-0 rounded border border-rose-300/20 bg-black/40" />;
    }

    // Caja virtual: el cuerpo apoyado abajo y la cabeza con el offset del cuerpo.
    const headTop = headFrame ? bodyFrame.height - headFrame.height + Number(bodyData?.headOffsetY ?? 0) : 0;
    const top = Math.min(0, headTop);
    const boxHeight = bodyFrame.height - top;
    const boxWidth = Math.max(bodyFrame.width, headFrame?.width ?? 0);
    const scale = Math.min(1, ICON_SIZE / Math.max(boxWidth, boxHeight, 1));
    const offsetX = (ICON_SIZE - boxWidth * scale) / 2;
    const offsetY = (ICON_SIZE - boxHeight * scale) / 2;

    return (
        <div className="relative h-[34px] w-[34px] shrink-0 overflow-hidden rounded border border-rose-300/25 bg-black/45">
            <SpriteFrame
                frame={bodyFrame}
                left={offsetX + ((boxWidth - bodyFrame.width) / 2) * scale}
                top={offsetY + (0 - top) * scale}
                scale={scale}
            />
            {headFrame ? (
                <SpriteFrame
                    frame={headFrame}
                    left={offsetX + ((boxWidth - headFrame.width) / 2 + Number(bodyData?.headOffsetX ?? 0)) * scale}
                    top={offsetY + (headTop - top) * scale}
                    scale={scale}
                />
            ) : null}
        </div>
    );
}

/** Criaturas que te tienen de objetivo: ícono, nombre, vida y la marca de aggro. Se van solas al perderlo. */
export default function AggroPanel({ aggro, className, style }: Props) {
    const [dbs, setDbs] = React.useState<Databases | null>(null);
    const entries = aggro?.npcs ?? [];
    const hasEntries = entries.length > 0;

    React.useEffect(() => {
        if (!hasEntries || dbs) return;
        let cancelled = false;
        void Promise.all([loadGraphicsDB(), loadBodiesDB(), loadHeadsDB()]).then(([graphics, bodies, heads]) => {
            if (!cancelled) setDbs({ graphics, bodies, heads });
        });
        return () => {
            cancelled = true;
        };
    }, [hasEntries, dbs]);

    if (!hasEntries) {
        return null;
    }

    const extra = Math.max(0, Number(aggro?.total ?? entries.length) - Math.min(entries.length, MAX_ROWS));

    return (
        <div
            data-aggro-panel="true"
            className={`pointer-events-none z-30 w-[190px] rounded-md border border-rose-300/20 bg-stone-950/80 px-2 py-1.5 text-[11px] text-stone-100 shadow-xl backdrop-blur-sm ${className ?? ""}`}
            style={style}
        >
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-200/90">
                <Crosshair className="h-3.5 w-3.5 text-rose-400" />
                Te persiguen
            </div>
            <ul className="flex flex-col gap-1">
                {entries.slice(0, MAX_ROWS).map((entry) => {
                    const ratio = Math.max(0, Math.min(1, entry.hp / Math.max(1, entry.maxHp)));
                    return (
                        <li key={entry.id} data-aggro-npc={entry.id} className="flex items-center gap-1.5">
                            <CreatureIcon body={entry.body} head={entry.head} dbs={dbs} />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                    <span className="truncate font-semibold">{entry.name}</span>
                                    <span title="Tenés el aggro de esta criatura" className="ml-auto flex shrink-0 items-center rounded-sm bg-rose-500/20 px-1 text-[9px] font-bold uppercase text-rose-300">
                                        Aggro
                                    </span>
                                </div>
                                <div className="mt-0.5 h-2 overflow-hidden rounded-sm bg-[#3f0f17]">
                                    <div className="h-full bg-[#ef4444] transition-[width] duration-200" style={{ width: `${ratio * 100}%` }} />
                                </div>
                                <div className="mt-0.5 text-[9px] tabular-nums text-stone-400">
                                    {entry.hp}/{entry.maxHp}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            {extra > 0 ? <div className="mt-1 text-[10px] text-stone-400">+{extra} más</div> : null}
        </div>
    );
}
