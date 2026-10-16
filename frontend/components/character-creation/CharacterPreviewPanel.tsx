"use client";

import CharacterSpritePreview from "../CharacterSpritePreview";
import { focusRing, panelClass } from "./styles";
import {
    ATTRIBUTE_GUIDE,
    BASE_ATTRIBUTE,
    PREVIEW_HEADING_LABEL,
    type PreviewHeading,
    type RaceBonus,
} from "../../lib/characterCreation";

const ATTRIBUTE_ORDER: (keyof RaceBonus)[] = [
    "fuerza",
    "agilidad",
    "inteligencia",
    "carisma",
    "constitucion",
];

function bonusClass(value: number) {
    if (value > 0) {
        return "text-[#7dce82]";
    }
    if (value < 0) {
        return "text-[#e23b3b]";
    }
    return "text-[#9f9587]";
}

function formatBonus(value: number) {
    if (value > 0) {
        return `+${value}`;
    }
    return String(value);
}

export default function CharacterPreviewPanel({
    bodyId,
    headId,
    weaponId,
    shieldId,
    helmetId,
    scale,
    heading,
    headIndex,
    headCount,
    bonus,
    canRender,
    onRotate,
    onCycleHead,
}: {
    bodyId: number;
    headId: number;
    weaponId: number;
    shieldId: number;
    helmetId: number;
    scale: number;
    heading: PreviewHeading;
    headIndex: number;
    headCount: number;
    bonus: RaceBonus;
    canRender: boolean;
    onRotate: (direction: "prev" | "next") => void;
    onCycleHead: (direction: "prev" | "next") => void;
}) {
    return (
        <section
            className={`${panelClass} flex min-h-0 flex-col bg-[radial-gradient(ellipse_at_center,rgba(48,36,18,0.45),rgba(5,5,5,0.2)_62%),linear-gradient(180deg,#100e0c,#070707)]`}
            aria-label="Vista del personaje"
        >
            <div className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 pt-2">
                <button
                    type="button"
                    aria-label="Girar a la izquierda"
                    onClick={() => onRotate("prev")}
                    className={`px-2 text-3xl leading-none text-[#d6a62d] transition duration-150 hover:text-[#f3e6b8] ${focusRing}`}
                >
                    ‹
                </button>
                {canRender && headId ? (
                    <CharacterSpritePreview
                        bodyId={bodyId}
                        headId={headId}
                        weaponId={weaponId}
                        shieldId={shieldId}
                        helmetId={helmetId}
                        direction={heading}
                        scale={scale}
                        framed={false}
                        className="bg-transparent"
                    />
                ) : (
                    <div className="flex h-[220px] w-[180px] items-center justify-center text-xs text-[#9f9587]">
                        Sin gráfico
                    </div>
                )}
                <button
                    type="button"
                    aria-label="Girar a la derecha"
                    onClick={() => onRotate("next")}
                    className={`px-2 text-3xl leading-none text-[#d6a62d] transition duration-150 hover:text-[#f3e6b8] ${focusRing}`}
                >
                    ›
                </button>
            </div>
            <p className="text-center text-[10px] tracking-[0.28em] text-[#9f9587]">
                {PREVIEW_HEADING_LABEL[heading]}
            </p>
            <div className="mb-1 flex items-center justify-center gap-3 text-[11px] text-[#9f9587]">
                <button
                    type="button"
                    aria-label="Cabeza anterior"
                    onClick={() => onCycleHead("prev")}
                    className={`px-2 text-[#d6a62d] ${focusRing}`}
                >
                    ‹
                </button>
                <span>
                    Cabeza {headCount === 0 ? 0 : headIndex + 1} / {headCount}
                </span>
                <button
                    type="button"
                    aria-label="Cabeza siguiente"
                    onClick={() => onCycleHead("next")}
                    className={`px-2 text-[#d6a62d] ${focusRing}`}
                >
                    ›
                </button>
            </div>
            <dl className="mx-auto w-full max-w-[280px] space-y-0.5 px-4 pb-3 text-[13px]">
                {ATTRIBUTE_ORDER.map((key) => {
                    const guide = ATTRIBUTE_GUIDE[key];
                    const value = bonus[key];
                    return (
                        <div
                            key={key}
                            title={guide.hint}
                            className="grid grid-cols-[1fr_2.5rem_2rem] items-baseline gap-2"
                        >
                            <dt className="tracking-[0.12em] text-[#eee5d3]">{guide.label.toUpperCase()}</dt>
                            <dd className="text-right text-[#eee5d3]">{BASE_ATTRIBUTE}</dd>
                            <dd className={`text-right ${bonusClass(value)}`}>{formatBonus(value)}</dd>
                        </div>
                    );
                })}
            </dl>
        </section>
    );
}
