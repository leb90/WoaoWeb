"use client";

import React from "react";
import { Shield, Skull } from "lucide-react";
import type { PlayerHudState, SkillsState } from "../lib/aowProtocol";
import type { RuntimeTimingConfig } from "../lib/runtime-config";
import CharacterSpritePreview from "./CharacterSpritePreview";
import {
    formatStatusCountdown,
    usePlayerStatusEntries,
    type PlayerStatusEntry,
} from "./playerStatusEntries";

// El marco del personaje (escritorio), al estilo del de WoW: nivel y nombre, energía, vida y maná, el retrato con el
// escudo del bando y, debajo, los estados con lo que les falta. Va a la izquierda del chat; toma el ancho de su caja.

type PlayerUnitFrameProps = {
    hud: PlayerHudState | null;
    runtimeTiming: RuntimeTimingConfig;
    skillsState?: SkillsState | null;
    className?: string;
    style?: React.CSSProperties;
    // Lo que va debajo de los estados (el aggro), para que se apile sin pisarse.
    children?: React.ReactNode;
    // Fuera del render (a la izquierda del chat) acepta el mouse para los tooltips; adentro no tapa clics del mapa.
    interactive?: boolean;
};

// La cabeza queda en el tercio superior del lienzo de CharacterSpritePreview (72px * escala): se agranda y se sube el
// lienzo para centrarla en el círculo.
const PORTRAIT_SCALE = 2.4;
const PORTRAIT_TOP_OFFSET = -21;

// El color del nombre que manda el server (game.ts, getDefaultCharacterColor) dice el bando.
const STANDING_BY_COLOR: Record<string, { name: string; tone: string }> = {
    "#3b5bdb": { name: "Alianza", tone: "text-blue-400" },
    "#9b0000": { name: "Horda", tone: "text-red-600" },
    "#3333ff": { name: "Ciudadano", tone: "text-blue-500" },
    red: { name: "Criminal", tone: "text-red-500" },
    "#419900": { name: "Staff", tone: "text-lime-500" },
};

function Bar({
    value,
    max,
    fromColor,
    toColor,
    heightClass,
    showText,
    textClass = "text-[11px]",
    gloss = "from-white/25 via-white/5 to-black/20",
    title,
    testId,
}: {
    value: number;
    max: number;
    fromColor: string;
    toColor: string;
    heightClass: string;
    showText: boolean;
    textClass?: string;
    // El brillo de arriba; en la barra fina de energía lo blanqueaba entera.
    gloss?: string;
    title?: string;
    testId: string;
}) {
    const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;

    return (
        <div
            data-testid={testId}
            title={title}
            data-value={value}
            data-max={max}
            className={`relative ${heightClass} overflow-hidden rounded-[2px] border border-black/70 bg-black/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]`}
        >
            <div
                className="absolute inset-y-0 left-0 transition-[width] duration-200"
                style={{
                    width: `${ratio * 100}%`,
                    background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
                }}
            />
            <div className={`pointer-events-none absolute inset-0 bg-linear-to-b ${gloss}`} />
            {showText ? (
                <span
                    className={`absolute inset-0 flex items-center justify-center font-bold leading-none tabular-nums text-[#fbf5e8] [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_2px_rgba(0,0,0,0.9)] ${textClass}`}
                >
                    {value} / {max}
                </span>
            ) : null}
        </div>
    );
}

function StatusIcon({ entry }: { entry: PlayerStatusEntry }) {
    const Icon = entry.icon;
    const border =
        entry.kind === "debuff"
            ? "border-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.35)]"
            : entry.kind === "buff"
              ? "border-amber-300/55"
              : "border-stone-500/50";

    return (
        <div
            data-testid={`player-status-${entry.key}`}
            data-kind={entry.kind}
            data-seconds={entry.seconds ?? ""}
            title={`${entry.name}${entry.detail ? `: ${entry.detail}` : ""}`}
            className="pointer-events-auto flex w-[28px] flex-col items-center gap-[2px]"
        >
            <div className={`relative flex h-[24px] w-[24px] items-center justify-center overflow-hidden rounded-[5px] border bg-[#2a1b12] ${border}`}>
                <Icon className={`h-[15px] w-[15px] ${entry.tone}`} strokeWidth={2.2} />
                {/* Lo que ya pasó se oscurece desde arriba, como el reloj de los íconos de WoW. */}
                {entry.seconds !== null ? (
                    <div
                        className="pointer-events-none absolute inset-x-0 top-0 bg-black/55"
                        style={{ height: `${(1 - entry.progress) * 100}%` }}
                    />
                ) : null}
            </div>
            <span
                className={`min-w-[26px] rounded-sm border border-black/60 bg-black/80 px-[3px] py-[1px] text-center text-[9px] font-bold leading-none tabular-nums ${
                    entry.kind === "debuff" ? "text-red-100" : "text-amber-100"
                }`}
            >
                {/* Sin vencimiento (veneno, quemadura): dura hasta que te curás. */}
                {entry.seconds === null ? <span className="text-[11px] leading-[9px]">∞</span> : formatStatusCountdown(entry.seconds)}
            </span>
        </div>
    );
}

export default function PlayerUnitFrame({
    hud,
    runtimeTiming,
    skillsState,
    className,
    style,
    children,
    interactive = false,
}: PlayerUnitFrameProps) {
    const entries = usePlayerStatusEntries({ hud, runtimeTiming, skillsState });

    if (!hud) {
        return null;
    }

    const hp = hud.hp ?? 0;
    const maxHp = hud.maxHp ?? 0;
    const mana = hud.mana ?? 0;
    const maxMana = hud.maxMana ?? 0;
    const sta = hud.sta ?? 0;
    const maxSta = hud.maxSta ?? 0;
    const level = hud.level ?? 0;
    const dead = Boolean(hud.dead);
    // Hambre y sed en 0 a la vez: el personaje está perdiendo vida y estamina. La vida se pinta bordó.
    const isStarving = (hud.hambre ?? 100) <= 0 && (hud.sed ?? 100) <= 0;
    const standing = STANDING_BY_COLOR[String(hud.color ?? "").toLowerCase()];

    return (
        <div
            data-testid="player-unit-frame"
            className={`${interactive ? "pointer-events-auto" : "pointer-events-none"} z-30 flex flex-col items-stretch gap-[5px] ${className ?? ""}`}
            style={style}
        >
            <div className="relative flex items-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                {/* Como el de WoW: el retrato a la izquierda, montado sobre las barras, con el escudo del bando abajo. */}
                <div className="relative z-10 h-[54px] w-[54px] shrink-0">
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_210deg,#f5d58a,#9a6a24,#f0c766,#7a4f16,#f5d58a)] p-[2px] shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                        <div
                            className={`relative h-full w-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_35%,#3a2a1c_0%,#120c08_75%)] ${
                                dead ? "grayscale" : ""
                            }`}
                        >
                            {hud.idBody || hud.idHead ? (
                                <span className="absolute left-1/2 -translate-x-1/2" style={{ top: PORTRAIT_TOP_OFFSET }}>
                                    <CharacterSpritePreview
                                        bodyId={hud.idBody ?? 0}
                                        headId={hud.idHead ?? 0}
                                        mode="head"
                                        scale={PORTRAIT_SCALE}
                                        framed={false}
                                    />
                                </span>
                            ) : null}
                        </div>
                    </div>
                    {standing ? (
                        <span
                            data-testid="player-frame-standing"
                            title={standing.name}
                            className="absolute -bottom-0.5 -left-1 flex h-[19px] w-[19px] items-center justify-center rounded-full border border-[#c9a45c] bg-[#1a110b] shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
                        >
                            <Shield className={`h-[12px] w-[12px] fill-current ${standing.tone}`} strokeWidth={1.6} />
                        </span>
                    ) : null}
                </div>
                <div className="-ml-8 min-w-0 flex-1 overflow-hidden rounded-[4px] border border-[#8b6b3e] bg-[linear-gradient(180deg,#23160e_0%,#110b08_100%)] shadow-[inset_0_1px_0_rgba(255,230,180,0.12)]">
                    <div className="flex h-[16px] items-center gap-1 border-b border-[#8b6b3e]/70 bg-[linear-gradient(180deg,#4d3419_0%,#2a1b10_100%)] pl-9 pr-1.5">
                        <span data-testid="player-frame-name" className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-none text-[#f4ead6] [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
                            {hud.nameCharacter}
                        </span>
                        {dead ? (
                            <span className="flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-stone-300">
                                <Skull className="h-2.5 w-2.5" /> Muerto
                            </span>
                        ) : null}
                        <span data-testid="player-frame-level" className="text-[11px] font-bold leading-none tabular-nums text-amber-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
                            {level}
                        </span>
                    </div>
                    <div className="space-y-[2px] py-[3px] pl-9 pr-1.5">
                        <Bar
                            testId="player-frame-energy"
                            title={`Energía: ${sta}/${maxSta}`}
                            value={sta}
                            max={maxSta}
                            fromColor="#8a6514"
                            toColor="#f2cf5b"
                            heightClass="h-[4px]"
                            showText={false}
                            gloss="from-white/10 to-black/25"
                        />
                        <Bar
                            testId="player-frame-hp"
                            title={`Vida: ${hp}/${maxHp}`}
                            value={hp}
                            max={maxHp}
                            fromColor={isStarving ? "#4a0a12" : "#951212"}
                            toColor={isStarving ? "#7a1224" : "#f06b34"}
                            heightClass="h-[14px]"
                            showText
                            textClass="text-[10px]"
                        />
                        <Bar
                            testId="player-frame-mana"
                            title={`Maná: ${mana}/${maxMana}`}
                            value={mana}
                            max={maxMana}
                            fromColor="#0e436f"
                            toColor="#2fb8ed"
                            heightClass="h-[10px]"
                            showText
                            textClass="text-[8.5px]"
                        />
                    </div>
                </div>
            </div>

            {entries.length ? (
                <div data-testid="player-status-row" className="flex flex-wrap gap-[3px]">
                    {entries.map((entry) => (
                        <StatusIcon key={entry.key} entry={entry} />
                    ))}
                </div>
            ) : null}

            {children}
        </div>
    );
}
