"use client";

import React from "react";
import { Eye, Handshake, Link, Skull, Snowflake, Swords, Wand } from "lucide-react";
import type { TargetStatePayload } from "../lib/aowProtocol";
import { CreatureIcon, useCreatureDatabases } from "./AggroPanel";
import UnitFrameShell, { Bar, HeadPortrait, PortraitBadge, StandingBadge } from "./UnitFrameShell";

// El marco del objetivo (escritorio), del mismo tamaño que el del personaje: lo último que clickeaste. Va debajo del
// marco del personaje cuando nada te persigue (si hay aggro, ese lugar es de la grilla de criaturas).
// De una criatura: su vida y si es agresiva, neutral o amistosa. De un usuario: su vida y su maná, el bando con su
// rango, la clase y la liga de ranked.

const NPC_DISPOSITION = {
    agresivo: { label: "Agresivo", name: "text-red-300", tag: "text-red-400", icon: Swords },
    neutral: { label: "Neutral", name: "text-amber-200", tag: "text-amber-300", icon: Eye },
    amistoso: { label: "Amistoso", name: "text-emerald-200", tag: "text-emerald-300", icon: Handshake },
} as const;

function npcDisposition(target: Extract<TargetStatePayload, { kind: "npc" }>) {
    if (target.hostile) return NPC_DISPOSITION.agresivo;
    return target.attackable ? NPC_DISPOSITION.neutral : NPC_DISPOSITION.amistoso;
}

function Chip({ icon: Icon, label, tone }: { icon: typeof Swords; label: string; tone: string }) {
    return (
        <span className={`flex shrink-0 items-center gap-[2px] text-[9px] font-semibold leading-none ${tone}`}>
            <Icon className="h-2.5 w-2.5" aria-hidden="true" />
            {label}
        </span>
    );
}

function NpcTarget({ target }: { target: Extract<TargetStatePayload, { kind: "npc" }> }) {
    const dbs = useCreatureDatabases(target.head <= 0);
    const disposition = npcDisposition(target);
    const DispositionIcon = disposition.icon;

    return (
        <UnitFrameShell
            testId="target-frame"
            portrait={
                // Las humanoides (con cabeza) muestran la cara, como los usuarios; las demás, el cuerpo entero.
                target.head > 0 ? (
                    <HeadPortrait bodyId={target.body} headId={target.head} />
                ) : (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <CreatureIcon body={target.body} head={target.head} dbs={dbs} size={44} boxClassName="" />
                    </span>
                )
            }
            badge={
                <PortraitBadge title={disposition.label} testId="target-frame-disposition">
                    <DispositionIcon className={`h-[11px] w-[11px] ${disposition.tag}`} strokeWidth={2.4} />
                </PortraitBadge>
            }
            band={
                <>
                    <span data-testid="target-frame-name" className={`min-w-0 flex-1 truncate text-[11px] font-semibold leading-none [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] ${disposition.name}`}>
                        {target.name}
                    </span>
                    <span className={`shrink-0 text-[8px] font-bold uppercase leading-none tracking-[0.08em] ${disposition.tag}`}>
                        {disposition.label}
                    </span>
                </>
            }
        >
            {/* Los que no se pueden atacar (comerciantes, sacerdotes, misiones) no tienen una vida que importe. */}
            {!target.attackable ? (
                <div className="flex h-[14px] items-center text-[10px] font-semibold leading-none text-emerald-200/90">
                    No se puede atacar
                </div>
            ) : target.maxHp > 0 ? (
                <Bar
                    testId="target-frame-hp"
                    title={`Vida: ${target.hp}/${target.maxHp}`}
                    value={target.hp}
                    max={target.maxHp}
                    fromColor="#951212"
                    toColor="#f06b34"
                    heightClass="h-[14px]"
                    showText
                    textClass="text-[10px]"
                />
            ) : null}
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden pt-[2px]">
                {target.paralizado ? <Chip icon={Snowflake} label="Paralizado" tone="text-sky-200" /> : null}
                {target.inmovilizado ? <Chip icon={Link} label="Inmovilizado" tone="text-amber-200" /> : null}
                {target.owner ? (
                    <span className="min-w-0 truncate text-[9px] font-semibold leading-none text-violet-200">
                        <Wand className="mr-[2px] inline h-2.5 w-2.5 align-[-1px]" aria-hidden="true" />
                        Invocación de {target.owner}
                    </span>
                ) : null}
            </div>
        </UnitFrameShell>
    );
}

function UserTarget({ target }: { target: Extract<TargetStatePayload, { kind: "user" }> }) {
    const standingLine = target.factionRank ? `${target.standing} [${target.factionRank}]` : target.standing;

    return (
        <UnitFrameShell
            testId="target-frame"
            dead={target.dead}
            portrait={<HeadPortrait bodyId={target.body} headId={target.head} />}
            badge={<StandingBadge color={target.color} testId="target-frame-standing" />}
            band={
                <>
                    <span data-testid="target-frame-level" title="Nivel" className="shrink-0 text-[11px] font-bold leading-none tabular-nums text-amber-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
                        {target.level}
                    </span>
                    <span
                        data-testid="target-frame-name"
                        className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-none [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]"
                        style={{ color: target.color || "#f4ead6" }}
                    >
                        {target.name}
                    </span>
                    {/* El bando y su rango (o que está muerto), a la derecha de la banda. */}
                    {target.dead ? (
                        <span className="flex shrink-0 items-center gap-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-stone-300">
                            <Skull className="h-2.5 w-2.5" /> Muerto
                        </span>
                    ) : (
                        <span
                            data-testid="target-frame-standing-line"
                            className="max-w-[62%] shrink-0 truncate text-[8.5px] font-bold leading-none [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]"
                            style={{ color: target.color || "#d7c4a4" }}
                        >
                            {standingLine}
                        </span>
                    )}
                </>
            }
            bodyClassName="space-y-[2px] py-[2px]"
        >
            <Bar
                testId="target-frame-hp"
                title={`Vida: ${target.hp}/${target.maxHp}`}
                value={target.hp}
                max={target.maxHp}
                fromColor="#951212"
                toColor="#f06b34"
                heightClass="h-[13px]"
                showText
                textClass="text-[10px]"
            />
            {target.maxMana > 0 ? (
                <Bar
                    testId="target-frame-mana"
                    title={`Maná: ${target.mana}/${target.maxMana}`}
                    value={target.mana}
                    max={target.maxMana}
                    fromColor="#0e436f"
                    toColor="#2fb8ed"
                    heightClass="h-[9px]"
                    showText
                    textClass="text-[8px]"
                />
            ) : (
                <div data-testid="target-frame-mana" className="flex h-[9px] items-center text-[8px] font-semibold leading-none text-stone-500">
                    Sin maná
                </div>
            )}
            <div className="flex h-[8px] min-w-0 items-center gap-1 text-[8px] font-semibold leading-none text-[#e6d8bd]">
                <span className="shrink-0">{target.className}</span>
                {target.newbie ? <span className="shrink-0 font-bold uppercase text-emerald-300">Newbie</span> : null}
                {target.clan ? <span className="min-w-0 truncate text-[#cbb18e]">{target.clan}</span> : null}
                <span className="ml-auto shrink-0 font-bold" style={{ color: target.rankedColor }}>
                    &lt;{target.rankedLabel}&gt;
                </span>
            </div>
        </UnitFrameShell>
    );
}

export default function TargetUnitFrame({ target }: { target: TargetStatePayload | null | undefined }) {
    if (!target) {
        return null;
    }

    return target.kind === "npc" ? <NpcTarget target={target} /> : <UserTarget target={target} />;
}
