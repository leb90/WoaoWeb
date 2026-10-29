"use client";

import React from "react";
import {
    BicepsFlexed,
    Brain,
    Droplets,
    EyeClosed,
    EyeOff,
    Flame,
    Ghost,
    Link,
    MicOff,
    Rabbit,
    Shield,
    ShieldPlus,
    Skull,
    Snail,
    Snowflake,
    WandSparkles,
    Wind,
    type LucideIcon,
} from "lucide-react";
import type { PlayerHudState, SkillsState } from "../lib/aowProtocol";
import type { RuntimeTimingConfig } from "../lib/runtime-config";

// Los estados del propio personaje (perjudiciales y beneficiosos) con lo que les falta, para la fila de estados del
// marco del personaje (PlayerUnitFrame) y la columna de mobile (BuffStatusSidebar).

const HUNTER_CLASS_ID = 9;
export const OCULTARSE_SKILL_INDEX = 7;

// Duraciones del server para la barrita de progreso: desangrado (game.ts, BLEED_DURATION_MS), ceguera y estupidez
// (server.ts) y los efectos del chamán que dejan sus hechizos (spells.json: Descarga eléctrica, Ráfaga de viento,
// Rayo Eléctrico y Prisión de agua).
const BLEED_DURATION_MS = 10_000;
const AFFLICTION_DURATION_MS = 10_000;
const ELEMENTAL_SLOW_MS = 6_000;
const ELEMENTAL_MAGIC_SILENCE_MS = 4_000;
const ELEMENTAL_FULL_SILENCE_MS = 3_000;

// Efectos del chamán (server/src/elementalEffects.ts): escudo propio (mágico y físico 10 s, energía 30 s),
// escudos de aliados (60 s), Evasión de viento (10 s) y su recarga (30 s desde que se tiró).
const ELEMENTAL_SHIELD_MS = { magico: 10_000, fisico: 10_000, energia: 30_000 } as const;
const ELEMENTAL_ALLY_SHIELD_MS = 60_000;
const ELEMENTAL_EVASION_MS = 10_000;
const ELEMENTAL_EVASION_COOLDOWN_MS = 30_000;

export type PlayerStatusKind = "buff" | "debuff" | "neutral";

export type PlayerStatusEntry = {
    key: string;
    name: string;
    // Nombre corto para la columna de mobile.
    label: string;
    // Segundos que faltan; null si no vence solo (el veneno y la quemadura duran hasta que se curan).
    seconds: number | null;
    progress: number;
    kind: PlayerStatusKind;
    icon: LucideIcon;
    // Color del ícono (clase de Tailwind) y el mismo en rgba para el texto de mobile.
    tone: string;
    accent: string;
    // El ícono pintado que ya usaba la columna de mobile.
    iconSrc?: string;
    detail?: string;
};

type TimedStatusKey = "invisibleSpell" | "hiddenSkill" | "paralizado" | "inmovilizado";
type TimedStatusFlags = Record<TimedStatusKey, boolean>;
type TimedStatusExpiry = Record<TimedStatusKey, number>;
type BuffStatusKey = "fuerza" | "agilidad";
type BuffStatusExpiry = Record<BuffStatusKey, number>;

const NO_TIMED_FLAGS: TimedStatusFlags = {
    invisibleSpell: false,
    hiddenSkill: false,
    paralizado: false,
    inmovilizado: false,
};
const NO_TIMED_EXPIRY: TimedStatusExpiry = {
    invisibleSpell: 0,
    hiddenSkill: 0,
    paralizado: 0,
    inmovilizado: 0,
};

function clampProgress(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.min(1, Math.max(0, value));
}

// Misma fórmula que el server (protocol.ts, getHiddenSkillDurationMs): el server no manda la duración.
export function getHiddenSkillDurationMs(skill: number, classId?: number): number {
    const normalizedSkill = Math.max(0, Number(skill) || 0);
    const interval = 500;
    const missingSkill = 100 - normalizedSkill;
    let durationCounter =
        (-0.000001 * missingSkill ** 3 +
            0.00009229 * missingSkill ** 2 +
            -0.0088 * missingSkill +
            0.9571) *
        interval;

    if (classId === HUNTER_CLASS_ID) {
        durationCounter = Math.floor(durationCounter / 2);
    } else {
        durationCounter = Math.floor(durationCounter / 3);
    }

    return Math.max(1000, durationCounter * 40);
}

/** Cuenta para mostrar: "12s" debajo del minuto y "1:05" arriba. */
export function formatStatusCountdown(seconds: number | null): string {
    if (seconds === null) {
        return "";
    }

    const safeSeconds = Math.max(0, seconds);
    if (safeSeconds < 60) {
        return `${safeSeconds}s`;
    }

    const minutes = Math.floor(safeSeconds / 60);
    return `${minutes}:${(safeSeconds % 60).toString().padStart(2, "0")}`;
}

const ELEMENTAL_SHIELD_ENTRIES = {
    magico: { name: "Escudo mágico", label: "Esc M", tone: "text-violet-300", accent: "rgba(167, 139, 250, 0.98)", iconSrc: "/imgs/spells/escudo-magico.png" },
    fisico: { name: "Escudo físico", label: "Esc F", tone: "text-amber-200", accent: "rgba(214, 178, 122, 0.98)", iconSrc: "/imgs/spells/escudo-fisico.png" },
    energia: { name: "Escudo de energía", label: "Energ", tone: "text-yellow-300", accent: "rgba(251, 191, 36, 0.98)", iconSrc: "/imgs/spells/escudo-energia.png" },
} as const;

function timed(
    seconds: number,
    totalMs: number,
    entry: Omit<PlayerStatusEntry, "seconds" | "progress">,
): PlayerStatusEntry {
    return { ...entry, seconds, progress: clampProgress((seconds * 1000) / Math.max(1, totalMs)) };
}

function untimed(entry: Omit<PlayerStatusEntry, "seconds" | "progress">): PlayerStatusEntry {
    return { ...entry, seconds: null, progress: 1 };
}

export function usePlayerStatusEntries({
    hud,
    runtimeTiming,
    skillsState,
}: {
    hud: PlayerHudState | null;
    runtimeTiming: RuntimeTimingConfig;
    skillsState?: SkillsState | null;
}): PlayerStatusEntry[] {
    const hasHud = Boolean(hud);
    const [now, setNow] = React.useState(() => Date.now());
    const [buffExpiryAt, setBuffExpiryAt] = React.useState<BuffStatusExpiry>({
        fuerza: 0,
        agilidad: 0,
    });
    const [timedStatusExpiryAt, setTimedStatusExpiryAt] = React.useState<TimedStatusExpiry>(NO_TIMED_EXPIRY);
    const previousTimedFlagsRef = React.useRef<TimedStatusFlags>(NO_TIMED_FLAGS);

    React.useEffect(() => {
        const interval = window.setInterval(() => {
            setNow(Date.now());
        }, 500);

        return () => window.clearInterval(interval);
    }, []);

    React.useEffect(() => {
        const currentNow = Date.now();

        setBuffExpiryAt({
            fuerza: (hud?.buffFuerzaSeconds ?? 0) > 0 ? currentNow + (hud?.buffFuerzaSeconds ?? 0) * 1000 : 0,
            agilidad: (hud?.buffAgilidadSeconds ?? 0) > 0 ? currentNow + (hud?.buffAgilidadSeconds ?? 0) * 1000 : 0,
        });
    }, [hud?.buffAgilidadSeconds, hud?.buffAgilidadUpdatedAt, hud?.buffFuerzaSeconds, hud?.buffFuerzaUpdatedAt]);

    React.useEffect(() => {
        if (!hasHud || !hud || hud.dead) {
            previousTimedFlagsRef.current = NO_TIMED_FLAGS;
            setBuffExpiryAt({ fuerza: 0, agilidad: 0 });
            setTimedStatusExpiryAt(NO_TIMED_EXPIRY);
            return;
        }

        const nextFlags: TimedStatusFlags = {
            invisibleSpell: Boolean(hud.invisibleSpell),
            hiddenSkill: Boolean(hud.hiddenSkill),
            paralizado: Boolean(hud.paralizado),
            inmovilizado: Boolean(hud.inmovilizado),
        };
        const hiddenSkillDurationMs = getHiddenSkillDurationMs(
            Math.min(100, Number(skillsState?.values?.[OCULTARSE_SKILL_INDEX] ?? 0)),
            hud.idClase,
        );
        const reportedInvisibilityRemainingMs = Math.max(0, Number(hud.invisibleSpellRemainingMs ?? 0));
        const reportedInvisibilityUpdatedAt = Math.max(0, Number(hud.invisibleSpellUpdatedAt ?? 0));
        const reportedInvisibilityExpiryAt =
            reportedInvisibilityRemainingMs > 0 && reportedInvisibilityUpdatedAt > 0
                ? reportedInvisibilityUpdatedAt + reportedInvisibilityRemainingMs
                : 0;
        const nextDurations = {
            invisibleSpell: runtimeTiming.statusDurations.invisibilitySpellMs,
            hiddenSkill: hiddenSkillDurationMs,
            paralizado: runtimeTiming.statusDurations.crowdControlUserMs,
            inmovilizado: runtimeTiming.statusDurations.crowdControlUserMs,
        };
        const currentFlags = previousTimedFlagsRef.current;
        const currentNow = Date.now();

        setTimedStatusExpiryAt((currentExpiryAt) => {
            let changed = false;
            const nextExpiryAt = { ...currentExpiryAt };

            for (const key of Object.keys(nextFlags) as TimedStatusKey[]) {
                if (!nextFlags[key]) {
                    if (nextExpiryAt[key] !== 0) {
                        nextExpiryAt[key] = 0;
                        changed = true;
                    }
                    continue;
                }

                // Start the estimated timer only on the inactive -> active edge.
                // If the server clears the flag a tick later than our estimate,
                // rearming here causes the icon to flash back for a moment.
                if (!currentFlags[key]) {
                    nextExpiryAt[key] =
                        key === "invisibleSpell" && reportedInvisibilityExpiryAt > 0
                            ? reportedInvisibilityExpiryAt
                            : currentNow + nextDurations[key];
                    changed = true;
                    continue;
                }

                if (key === "invisibleSpell" && reportedInvisibilityExpiryAt > 0) {
                    // Rearm only when a fresh server sync pushes the expiry farther
                    // into the future, which is what happens on invisibility recast.
                    if (reportedInvisibilityExpiryAt > nextExpiryAt.invisibleSpell + 750) {
                        nextExpiryAt.invisibleSpell = reportedInvisibilityExpiryAt;
                        changed = true;
                    }
                }
            }

            return changed ? nextExpiryAt : currentExpiryAt;
        });

        previousTimedFlagsRef.current = nextFlags;
    }, [
        hasHud,
        hud?.dead,
        hud?.inmovilizado,
        hud?.hiddenSkill,
        hud?.idClase,
        hud?.invisibleSpell,
        hud?.invisibleSpellRemainingMs,
        hud?.invisibleSpellUpdatedAt,
        hud?.paralizado,
        runtimeTiming.statusDurations.crowdControlUserMs,
        runtimeTiming.statusDurations.invisibilitySpellMs,
        skillsState?.values,
    ]);

    return React.useMemo<PlayerStatusEntry[]>(() => {
        if (!hud || hud.dead) {
            return [];
        }

        const secondsUntil = (until: number) => (until > 0 ? Math.max(0, Math.ceil((until - now) / 1000)) : 0);
        // La parálisis y la inmovilización usan lo que manda el server; si no llegó, la estimación.
        const crowdControlUntil = Number(hud.crowdControlUntil ?? 0);
        const crowdControlMs = runtimeTiming.statusDurations.crowdControlUserMs;
        const buffMs = runtimeTiming.statusDurations.fuerzaAgilidadBuffMs;
        const invisibilityMs = runtimeTiming.statusDurations.invisibilitySpellMs;
        const hiddenSkillDurationMs = getHiddenSkillDurationMs(
            Math.min(100, Number(skillsState?.values?.[OCULTARSE_SKILL_INDEX] ?? 0)),
            hud.idClase,
        );
        const elemental = hud.elemental;
        const afflictions = hud.afflictions;
        const entries: PlayerStatusEntry[] = [];

        // Perjudiciales primero: son los que hay que atender.
        if (hud.paralizado) {
            entries.push(
                timed(secondsUntil(crowdControlUntil || timedStatusExpiryAt.paralizado), crowdControlMs, {
                    key: "paralizado",
                    name: "Paralizado",
                    label: "Paral",
                    kind: "debuff",
                    icon: Snowflake,
                    tone: "text-sky-200",
                    accent: "rgba(244, 114, 182, 0.98)",
                    iconSrc: "/imgs/spells/paralisis.png",
                    detail: "No te podés mover ni atacar.",
                }),
            );
        }
        if (hud.inmovilizado) {
            entries.push(
                timed(secondsUntil(crowdControlUntil || timedStatusExpiryAt.inmovilizado), crowdControlMs, {
                    key: "inmovilizado",
                    name: "Inmovilizado",
                    label: "Inmo",
                    kind: "debuff",
                    icon: Link,
                    tone: "text-amber-200",
                    accent: "rgba(250, 204, 21, 0.98)",
                    iconSrc: "/imgs/spells/inmovilizar.png",
                    detail: "No te podés mover, pero sí atacar.",
                }),
            );
        }
        const bleedSeconds = secondsUntil(Number(hud.bleedUntil ?? 0));
        if (bleedSeconds > 0) {
            entries.push(
                timed(bleedSeconds, BLEED_DURATION_MS, {
                    key: "desangrado",
                    name: "Desangrado",
                    label: "Sangra",
                    kind: "debuff",
                    icon: Droplets,
                    tone: "text-red-400",
                    accent: "rgba(248, 113, 113, 0.98)",
                    detail: "Cada segundo la herida te saca lo mismo que la apuñalada.",
                }),
            );
        }
        if (Number(afflictions?.venenoDmg ?? 0) > 0) {
            entries.push(
                untimed({
                    key: "veneno",
                    name: "Envenenado",
                    label: "Veneno",
                    kind: "debuff",
                    icon: Skull,
                    tone: "text-lime-300",
                    accent: "rgba(190, 242, 100, 0.98)",
                    detail: `Te saca ${afflictions?.venenoDmg} de vida cada 3 s hasta que te cures.`,
                }),
            );
        }
        if (elemental?.burning) {
            entries.push(
                untimed({
                    key: "quemado",
                    name: "Quemado",
                    label: "Quema",
                    kind: "debuff",
                    icon: Flame,
                    tone: "text-orange-300",
                    accent: "rgba(253, 186, 116, 0.98)",
                    detail: "El fuego te va sacando vida. Curar efectos lo apaga.",
                }),
            );
        }
        const fullSilenceSeconds = secondsUntil(Number(elemental?.fullSilenceUntil ?? 0));
        if (fullSilenceSeconds > 0) {
            entries.push(
                timed(fullSilenceSeconds, ELEMENTAL_FULL_SILENCE_MS, {
                    key: "silencio",
                    name: "Silenciado",
                    label: "Silen",
                    kind: "debuff",
                    icon: MicOff,
                    tone: "text-cyan-200",
                    accent: "rgba(165, 243, 252, 0.98)",
                    detail: "No podés lanzar hechizos ni usar habilidades.",
                }),
            );
        }
        const magicSilenceSeconds = secondsUntil(Number(elemental?.magicSilenceUntil ?? 0));
        if (magicSilenceSeconds > 0) {
            entries.push(
                timed(magicSilenceSeconds, ELEMENTAL_MAGIC_SILENCE_MS, {
                    key: "sin-magia",
                    name: "Sin magia",
                    label: "S/Mag",
                    kind: "debuff",
                    icon: WandSparkles,
                    tone: "text-violet-300",
                    accent: "rgba(196, 181, 253, 0.98)",
                    detail: "No podés lanzar hechizos.",
                }),
            );
        }
        const blindSeconds = secondsUntil(Number(afflictions?.cegueraUntil ?? 0));
        if (blindSeconds > 0) {
            entries.push(
                timed(blindSeconds, AFFLICTION_DURATION_MS, {
                    key: "ceguera",
                    name: "Ciego",
                    label: "Ciego",
                    kind: "debuff",
                    icon: EyeClosed,
                    tone: "text-stone-200",
                    accent: "rgba(231, 229, 228, 0.98)",
                }),
            );
        }
        const dumbSeconds = secondsUntil(Number(afflictions?.estupidezUntil ?? 0));
        if (dumbSeconds > 0) {
            entries.push(
                timed(dumbSeconds, AFFLICTION_DURATION_MS, {
                    key: "estupidez",
                    name: "Estupidez",
                    label: "Estup",
                    kind: "debuff",
                    icon: Brain,
                    tone: "text-pink-300",
                    accent: "rgba(249, 168, 212, 0.98)",
                }),
            );
        }
        const slowSeconds = secondsUntil(Number(elemental?.slowUntil ?? 0));
        if (slowSeconds > 0) {
            entries.push(
                timed(slowSeconds, ELEMENTAL_SLOW_MS, {
                    key: "lentitud",
                    name: "Lento",
                    label: "Lento",
                    kind: "debuff",
                    icon: Snail,
                    tone: "text-teal-200",
                    accent: "rgba(153, 246, 228, 0.98)",
                    detail: "Caminás a la mitad de velocidad.",
                }),
            );
        }

        if (hud.invisibleSpell) {
            entries.push(
                timed(secondsUntil(timedStatusExpiryAt.invisibleSpell), invisibilityMs, {
                    key: "invisibilidad",
                    name: "Invisible",
                    label: "Invi",
                    kind: "buff",
                    icon: Ghost,
                    tone: "text-sky-300",
                    accent: "rgba(96, 165, 250, 0.98)",
                    iconSrc: "/imgs/spells/invisibilidad.png",
                }),
            );
        }
        if (hud.hiddenSkill) {
            entries.push(
                timed(secondsUntil(timedStatusExpiryAt.hiddenSkill), hiddenSkillDurationMs, {
                    key: "ocultar",
                    name: "Oculto",
                    label: "Ocult",
                    kind: "buff",
                    icon: EyeOff,
                    tone: "text-violet-300",
                    accent: "rgba(167, 139, 250, 0.98)",
                    iconSrc: "/imgs/spells/invisibilidad.png",
                }),
            );
        }
        entries.push(
            timed(secondsUntil(buffExpiryAt.fuerza), buffMs, {
                key: "fuerza",
                name: "Fuerza",
                label: "Fza",
                kind: "buff",
                icon: BicepsFlexed,
                tone: "text-red-300",
                accent: "rgba(248, 113, 113, 0.98)",
                iconSrc: "/imgs/spells/fuerza.png",
            }),
            timed(secondsUntil(buffExpiryAt.agilidad), buffMs, {
                key: "agilidad",
                name: "Agilidad",
                label: "Agi",
                kind: "buff",
                icon: Rabbit,
                tone: "text-emerald-300",
                accent: "rgba(74, 222, 128, 0.98)",
                iconSrc: "/imgs/spells/agilidad.png",
            }),
        );

        if (elemental?.shield) {
            entries.push(
                timed(secondsUntil(elemental.shieldUntil), ELEMENTAL_SHIELD_MS[elemental.shield], {
                    key: "elemental-shield",
                    kind: "buff",
                    icon: Shield,
                    ...ELEMENTAL_SHIELD_ENTRIES[elemental.shield],
                }),
            );
        }
        entries.push(
            timed(secondsUntil(Number(elemental?.allyMagicUntil ?? 0)), ELEMENTAL_ALLY_SHIELD_MS, {
                key: "elemental-ally-magic",
                name: "Escudo aliado: +5% de defensa mágica",
                label: "+5% M",
                kind: "buff",
                icon: ShieldPlus,
                tone: "text-sky-300",
                accent: "rgba(125, 211, 252, 0.98)",
                iconSrc: "/imgs/spells/escudo-aliado.png",
            }),
            timed(secondsUntil(Number(elemental?.allyPhysicalUntil ?? 0)), ELEMENTAL_ALLY_SHIELD_MS, {
                key: "elemental-ally-physical",
                name: "Escudo aliado: +5% de defensa física",
                label: "+5% F",
                kind: "buff",
                icon: ShieldPlus,
                tone: "text-amber-200",
                accent: "rgba(214, 178, 122, 0.98)",
                iconSrc: "/imgs/spells/escudo-aliado.png",
            }),
        );
        const evasionSeconds = secondsUntil(Number(elemental?.evasionUntil ?? 0));
        if (evasionSeconds > 0) {
            entries.push(
                timed(evasionSeconds, ELEMENTAL_EVASION_MS, {
                    key: "elemental-evasion",
                    name: "Evasión de viento",
                    label: "Evas",
                    kind: "buff",
                    icon: Wind,
                    tone: "text-cyan-200",
                    accent: "rgba(165, 243, 252, 0.98)",
                    iconSrc: "/imgs/spells/evasion-viento.png",
                }),
            );
        } else if (elemental) {
            // Cuánto falta para poder volver a tirarla.
            entries.push(
                timed(secondsUntil(elemental.evasionCooldownUntil), ELEMENTAL_EVASION_COOLDOWN_MS, {
                    key: "elemental-evasion-cooldown",
                    name: "Recarga de Evasión de viento",
                    label: "Recarga",
                    kind: "neutral",
                    icon: Wind,
                    tone: "text-stone-400",
                    accent: "rgba(148, 163, 184, 0.98)",
                    iconSrc: "/imgs/spells/evasion-viento.png",
                }),
            );
        }

        return entries.filter((entry) => entry.seconds === null || entry.seconds > 0);
    }, [buffExpiryAt, hud, now, runtimeTiming, skillsState, timedStatusExpiryAt]);
}
