"use client";

import React from "react";
import { Crosshair } from "lucide-react";
import type { AggroStatePayload } from "../lib/aowProtocol";
import type { BodiesDB, GraphicData, HeadsDB } from "../types/game";
import { getTexturePath, loadBodiesDB, loadGraphicsDB, loadHeadsDB } from "../utils/gameLoader";

type Props = {
    aggro: AggroStatePayload | null | undefined;
    // Las primeras que ya muestra la tira de arriba (AggroStrip): el panel arranca después.
    skip?: number;
    className?: string;
    style?: React.CSSProperties;
};

type Databases = { graphics: Record<string, GraphicData>; bodies: BodiesDB; heads: HeadsDB };

const MAX_ROWS = 5;
const ICON_SIZE = 34;
const SOUTH = "4";
// Casillas de la tira compacta que va debajo del marco del personaje.
export const AGGRO_STRIP_SLOTS = 4;

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
export function CreatureIcon({
    body,
    head,
    dbs,
    size = ICON_SIZE,
    boxClassName = "rounded border border-rose-300/25 bg-black/45",
}: {
    body: number;
    head: number;
    dbs: Databases | null;
    size?: number;
    // El marco del ícono; el retrato del marco del objetivo lo usa sin borde, adentro del círculo.
    boxClassName?: string;
}) {
    const bodyData = dbs?.bodies[String(body)];
    const bodyFrame = dbs && bodyData ? firstFrame(dbs.graphics, Number(bodyData[SOUTH])) : null;
    const headData = head > 0 ? dbs?.heads[String(head)] : undefined;
    const headFrame = dbs && headData ? firstFrame(dbs.graphics, Number(headData[SOUTH])) : null;

    if (!bodyFrame) {
        return <div className={`shrink-0 ${boxClassName}`} style={{ width: size, height: size }} />;
    }

    // Caja virtual: el cuerpo apoyado abajo y la cabeza con el offset del cuerpo.
    const headTop = headFrame ? bodyFrame.height - headFrame.height + Number(bodyData?.headOffsetY ?? 0) : 0;
    const top = Math.min(0, headTop);
    const boxHeight = bodyFrame.height - top;
    const boxWidth = Math.max(bodyFrame.width, headFrame?.width ?? 0);
    const scale = Math.min(1, size / Math.max(boxWidth, boxHeight, 1));
    const offsetX = (size - boxWidth * scale) / 2;
    const offsetY = (size - boxHeight * scale) / 2;

    return (
        <div
            className={`relative shrink-0 overflow-hidden ${boxClassName}`}
            style={{ width: size, height: size }}
        >
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

// Los gráficos de los cuerpos y las cabezas, cargados la primera vez que hay una criatura para mostrar.
export function useCreatureDatabases(enabled: boolean) {
    const [dbs, setDbs] = React.useState<Databases | null>(null);

    React.useEffect(() => {
        if (!enabled || dbs) return;
        let cancelled = false;
        void Promise.all([loadGraphicsDB(), loadBodiesDB(), loadHeadsDB()]).then(([graphics, bodies, heads]) => {
            if (!cancelled) setDbs({ graphics, bodies, heads });
        });
        return () => {
            cancelled = true;
        };
    }, [enabled, dbs]);

    return dbs;
}

/**
 * La tira compacta de aggro debajo del marco del personaje (escritorio): hasta cuatro criaturas en una grilla de 2 × 2.
 * Las que pasan de cuatro se ven en el panel del render (AggroPanel con skip).
 */
export function AggroStrip({ aggro, className }: { aggro: AggroStatePayload | null | undefined; className?: string }) {
    const entries = (aggro?.npcs ?? []).slice(0, AGGRO_STRIP_SLOTS);
    const dbs = useCreatureDatabases(entries.length > 0);

    if (!entries.length) {
        return null;
    }

    const slots = Array.from({ length: AGGRO_STRIP_SLOTS }, (_, index) => entries[index] ?? null);

    return (
        <div data-aggro-strip="true" className={`grid grid-cols-2 gap-[3px] ${className ?? ""}`}>
            {slots.map((entry, index) => {
                if (!entry) {
                    return <div key={`vacio-${index}`} className="h-[22px] rounded-sm border border-[#3a2a1e]/70 bg-black/25" />;
                }

                const ratio = Math.max(0, Math.min(1, entry.hp / Math.max(1, entry.maxHp)));
                return (
                    <div
                        key={entry.id}
                        data-aggro-npc={entry.id}
                        title={`${entry.name}: ${entry.hp}/${entry.maxHp}. Te tiene de objetivo.`}
                        className="flex h-[22px] min-w-0 items-center gap-[3px] rounded-sm border border-rose-300/30 bg-[#1a0d0d]/90 pr-[3px]"
                    >
                        <CreatureIcon body={entry.body} head={entry.head} dbs={dbs} size={20} />
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-[9px] font-semibold leading-[10px] text-stone-100">{entry.name}</div>
                            <div className="mt-[2px] h-[3px] overflow-hidden rounded-sm bg-[#3f0f17]">
                                <div className="h-full bg-[#ef4444] transition-[width] duration-200" style={{ width: `${ratio * 100}%` }} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/** Criaturas que te tienen de objetivo: ícono, nombre, vida y la marca de aggro. Se van solas al perderlo. */
export default function AggroPanel({ aggro, skip = 0, className, style }: Props) {
    const entries = (aggro?.npcs ?? []).slice(skip);
    const hasEntries = entries.length > 0;
    const dbs = useCreatureDatabases(hasEntries);

    if (!hasEntries) {
        return null;
    }

    const extra = Math.max(0, Number(aggro?.total ?? entries.length + skip) - skip - Math.min(entries.length, MAX_ROWS));

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
