"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, RotateCw } from "lucide-react";
import CharacterSpritePreview from "../CharacterSpritePreview";
import RacePortrait from "./RacePortrait";
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

// Caras que se ven a la vez en la tira de rostros; con más, la ventana se corre con las flechas.
const FACE_WINDOW = 7;

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
    headIds,
    headIndex,
    bonus,
    canRender,
    onRotate,
    onCycleHead,
    onSelectHead,
}: {
    bodyId: number;
    headId: number;
    weaponId: number;
    shieldId: number;
    helmetId: number;
    scale: number;
    heading: PreviewHeading;
    headIds: number[];
    headIndex: number;
    bonus: RaceBonus;
    canRender: boolean;
    onRotate: (direction: "prev" | "next") => void;
    onCycleHead: (direction: "prev" | "next") => void;
    onSelectHead: (index: number) => void;
}) {
    const headCount = headIds.length;
    const faceWindowSize = Math.min(FACE_WINDOW, headCount);
    // La ventana solo se corre si la cara elegida queda fuera de vista: un clic no la mueve debajo del mouse.
    const [faceStart, setFaceStart] = useState(0);
    const visibleStart = Math.min(
        Math.max(0, headCount - faceWindowSize),
        headIndex < faceStart
            ? headIndex
            : headIndex >= faceStart + faceWindowSize
              ? headIndex - faceWindowSize + 1
              : faceStart,
    );
    useEffect(() => {
        if (visibleStart !== faceStart) setFaceStart(visibleStart);
    }, [faceStart, visibleStart]);
    const rotateButtonClass = `flex flex-col items-center gap-1 px-2 text-[#d6a62d] transition duration-150 hover:text-[#f3e6b8] ${focusRing}`;
    const faceArrowClass = `flex h-11 w-8 shrink-0 items-center justify-center border border-[#41351f] bg-black/60 text-[#d6a62d] transition duration-150 hover:border-[#d6a62d] hover:text-[#f3e6b8] disabled:opacity-30 ${focusRing}`;

    return (
        <section
            className={`${panelClass} flex min-h-0 flex-col bg-[radial-gradient(ellipse_at_center,rgba(48,36,18,0.45),rgba(5,5,5,0.2)_62%),linear-gradient(180deg,#100e0c,#070707)]`}
            aria-label="Vista del personaje"
        >
            {/* El rostro va arriba y con las caras a la vista: abajo, chico, no lo encontraba nadie. */}
            <div className="border-b border-[#41351f]/70 px-3 pb-2.5 pt-2" role="group" aria-label="Rostro">
                <p className="mb-1.5 text-center text-[11px] tracking-[0.28em] text-[#d6a62d]">
                    ELEGÍ TU ROSTRO
                    <span className="ml-2 tracking-[0.12em] text-[#9f9587]">
                        {headCount === 0 ? 0 : headIndex + 1} / {headCount}
                    </span>
                </p>
                <div className="flex items-center justify-center gap-1.5">
                    <button
                        type="button"
                        aria-label="Rostro anterior"
                        onClick={() => onCycleHead("prev")}
                        disabled={headCount < 2}
                        className={faceArrowClass}
                    >
                        <ChevronLeft size={20} aria-hidden="true" />
                    </button>
                    {Array.from({ length: faceWindowSize }, (_, offset) => visibleStart + offset).map((index) => {
                        const selected = index === headIndex;
                        return (
                            <button
                                key={headIds[index]}
                                type="button"
                                aria-label={`Rostro ${index + 1}`}
                                aria-pressed={selected}
                                onClick={() => onSelectHead(index)}
                                className={`flex h-11 w-11 shrink-0 items-center justify-center border bg-black/60 transition duration-150 ${focusRing} ${
                                    selected
                                        ? "border-[#d6a62d] bg-[#2a2010] shadow-[0_0_10px_rgba(214,166,45,0.45)]"
                                        : "border-[#41351f] opacity-75 hover:border-[#9c7a2a] hover:opacity-100"
                                }`}
                            >
                                <RacePortrait headId={headIds[index]} label={String(index + 1)} size={38} />
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        aria-label="Rostro siguiente"
                        onClick={() => onCycleHead("next")}
                        disabled={headCount < 2}
                        className={faceArrowClass}
                    >
                        <ChevronRight size={20} aria-hidden="true" />
                    </button>
                </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 pt-2">
                <button
                    type="button"
                    aria-label="Girar a la izquierda"
                    title="Girar"
                    onClick={() => onRotate("prev")}
                    className={rotateButtonClass}
                >
                    <RotateCcw size={22} aria-hidden="true" />
                    <span className="text-[9px] tracking-[0.2em] text-[#9f9587]">GIRAR</span>
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
                    title="Girar"
                    onClick={() => onRotate("next")}
                    className={rotateButtonClass}
                >
                    <RotateCw size={22} aria-hidden="true" />
                    <span className="text-[9px] tracking-[0.2em] text-[#9f9587]">GIRAR</span>
                </button>
            </div>
            <p className="mb-1 text-center text-[10px] tracking-[0.28em] text-[#9f9587]">
                {PREVIEW_HEADING_LABEL[heading]}
            </p>
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
