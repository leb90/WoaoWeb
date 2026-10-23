"use client";

import React from "react";
import type {
    CharacterStatsSnapshot,
    InventoryItem,
    PlayerHudState,
} from "../lib/aowProtocol";
import { formatNumber as formatLocalizedNumber } from "../lib/number-format";
import {
    getInventoryItemEquipmentKind,
    type EquipmentKind,
} from "../lib/equipmentKinds";
import type { GraphicData, ObjectData, ObjectsDB } from "../types/game";
import { loadGraphicsDB, loadObjectsDB } from "../utils/gameLoader";
import CharacterSpritePreview from "./CharacterSpritePreview";
import { ItemGraphic } from "./MacroBar";

type CharacterStatsModalProps = {
    hud: PlayerHudState | null;
    snapshot: CharacterStatsSnapshot | null;
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
};

const classLabels: Record<number, string> = {
    1: "Mago",
    2: "Clerigo",
    3: "Guerrero",
    4: "Asesino",
    6: "Bardo",
    7: "Druida",
    8: "Paladin",
    9: "Cazador",
};

const EQUIPMENT_SLOT_LABELS: Record<EquipmentKind, string> = {
    casco: "Casco",
    armadura: "Armadura",
    accesorio: "Accesorio",
    arma: "Arma",
    escudo: "Escudo",
    flechas: "Flechas",
};

const LEFT_EQUIPMENT_SLOTS: EquipmentKind[] = ["casco", "armadura", "arma"];
const RIGHT_EQUIPMENT_SLOTS: EquipmentKind[] = [
    "escudo",
    "accesorio",
    "flechas",
];

function getSpecialBonuses(objectData?: ObjectData) {
    switch (Number(objectData?.objetoEspecial ?? 0)) {
        case 2:
            return { strength: 5, agility: 0, maxMana: 0 };
        case 3:
            return { strength: 2, agility: 0, maxMana: 0 };
        case 4:
            return { strength: 3, agility: 0, maxMana: 0 };
        case 5:
            return { strength: 0, agility: 5, maxMana: 0 };
        case 6:
            return { strength: 0, agility: 2, maxMana: 0 };
        case 7:
            return { strength: 0, agility: 3, maxMana: 0 };
        case 8:
            return { strength: 0, agility: 0, maxMana: 100 };
        case 9:
            return { strength: 0, agility: 0, maxMana: 200 };
        case 10:
            return { strength: 0, agility: 0, maxMana: 300 };
        case 12:
            return { strength: 1, agility: 3, maxMana: 0 };
        case 13:
            return { strength: 2, agility: 2, maxMana: 0 };
        case 14:
            return { strength: 5, agility: 2, maxMana: 0 };
        case 15:
            return { strength: 3, agility: 2, maxMana: 0 };
        case 16:
            return { strength: 1, agility: 1, maxMana: 0 };
        case 17:
            return { strength: 0, agility: 2, maxMana: 200 };
        case 18:
            return { strength: 0, agility: 1, maxMana: 0 };
        case 19:
            return { strength: 0, agility: 0, maxMana: 55 };
        default:
            return { strength: 0, agility: 0, maxMana: 0 };
    }
}

function formatSignedNumber(value?: number | null, suffix = "") {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "-";
    }

    if (value === 0) {
        return `0${suffix}`;
    }

    return `${value > 0 ? "+" : ""}${formatNumber(value)}${suffix}`;
}

function formatNumber(value?: number | null) {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "-";
    }

    return formatLocalizedNumber(value);
}

function formatRange(min?: number | null, max?: number | null) {
    if (typeof min !== "number" || typeof max !== "number") {
        return "-";
    }

    return `${formatNumber(min)}/${formatNumber(max)}`;
}

function formatSignedRange(min: number, max: number) {
    return `${formatSignedNumber(min)} / ${formatSignedNumber(max)}`;
}

function getActiveFactionSnapshot(snapshot: CharacterStatsSnapshot) {
    if (snapshot.factions.activeFaction === "armada") {
        return {
            label: "Alianza",
            data: snapshot.factions.armada,
        };
    }

    if (snapshot.factions.activeFaction === "caos") {
        return {
            label: "Horda",
            data: snapshot.factions.caos,
        };
    }

    return null;
}

function StatCard({
    label,
    value,
    tone = "default",
}: {
    label: string;
    value: React.ReactNode;
    tone?: "default" | "accent";
}) {
    return (
        <div
            className={`rounded-2xl border px-4 py-3 ${tone === "accent" ? "border-amber-300/20 bg-amber-200/10" : "border-white/8 bg-black/20"}`}
        >
            <div className="text-[11px] uppercase tracking-[0.24em] text-stone-400">
                {label}
            </div>
            <div className="mt-2 text-xl font-semibold text-stone-100">
                {value}
            </div>
        </div>
    );
}

function DetailRow({
    label,
    value,
    description,
}: {
    label: string;
    value: React.ReactNode;
    description?: string;
}) {
    return (
        <div className="border-b border-white/6 py-2 first:pt-0 last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-stone-400">
                    <span>{label}</span>
                    {description ? (
                        <span className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[10px] font-semibold leading-none text-stone-300 transition hover:border-white/25 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                                aria-label={`Info sobre ${label}`}
                            >
                                i
                            </button>
                            <span className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-64 max-w-[calc(100vw-3rem)] rounded-xl border border-white/10 bg-stone-950/95 px-3 py-2 text-left text-xs leading-5 text-stone-200 shadow-2xl group-hover:block group-focus-within:block">
                                {description}
                            </span>
                        </span>
                    ) : null}
                </span>
                <span className="text-sm font-medium text-stone-100">
                    {value}
                </span>
            </div>
        </div>
    );
}

function EquipmentSlotCard({
    kind,
    item,
    graphicData,
}: {
    kind: EquipmentKind;
    item?: InventoryItem;
    graphicData?: GraphicData;
}) {
    return (
        <div
            title={item?.name ?? EQUIPMENT_SLOT_LABELS[kind]}
            className={`flex h-[54px] min-w-0 items-center gap-2 border px-2 ${
                item
                    ? "border-amber-300/30 bg-[#21170f]"
                    : "border-white/8 bg-black/20"
            }`}
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-amber-200/15 bg-black/35 [image-rendering:pixelated]">
                {item ? (
                    <ItemGraphic
                        graphicData={graphicData}
                        name={item.name}
                        size={34}
                    />
                ) : (
                    <span className="text-lg text-stone-700">-</span>
                )}
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase text-amber-200/70">
                    {EQUIPMENT_SLOT_LABELS[kind]}
                </p>
                <p className="truncate text-[10px] text-stone-300">
                    {item?.name ?? "Vacío"}
                </p>
            </div>
        </div>
    );
}

export default function CharacterStatsModal({
    hud,
    snapshot,
    isOpen,
    isLoading,
    onClose,
}: CharacterStatsModalProps) {
    const [objectsDB, setObjectsDB] = React.useState<ObjectsDB | null>(null);
    const [graphicsDB, setGraphicsDB] = React.useState<Record<
        string,
        GraphicData
    > | null>(null);
    const activeFactionSnapshot = React.useMemo(
        () => (snapshot ? getActiveFactionSnapshot(snapshot) : null),
        [snapshot],
    );

    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    React.useEffect(() => {
        if (!isOpen || objectsDB) {
            return;
        }

        let active = true;

        loadObjectsDB()
            .then((data) => {
                if (active) {
                    setObjectsDB(data);
                }
            })
            .catch(() => {
                if (active) {
                    setObjectsDB({});
                }
            });

        return () => {
            active = false;
        };
    }, [isOpen, objectsDB]);

    React.useEffect(() => {
        if (!isOpen || graphicsDB) {
            return;
        }

        let active = true;

        loadGraphicsDB()
            .then((data) => {
                if (active) {
                    setGraphicsDB(data);
                }
            })
            .catch(() => {
                if (active) {
                    setGraphicsDB({});
                }
            });

        return () => {
            active = false;
        };
    }, [graphicsDB, isOpen]);

    const equippedByKind = React.useMemo(() => {
        const result: Partial<Record<EquipmentKind, InventoryItem>> = {};
        if (!hud) {
            return result;
        }

        for (const item of hud.inventory) {
            if (!item.equipped) {
                continue;
            }

            const kind = getInventoryItemEquipmentKind(item, objectsDB);
            if (kind && !result[kind]) {
                result[kind] = item;
            }
        }

        return result;
    }, [hud, objectsDB]);

    const equipmentStats = React.useMemo(() => {
        if (!hud || !objectsDB) {
            return null;
        }

        const equippedWeapon = equippedByKind.arma;
        const hasProjectileWeapon = Boolean(
            equippedWeapon &&
                objectsDB[equippedWeapon.idItem.toString()]?.proyectil,
        );

        return hud.inventory.reduce(
            (total, item) => {
                if (!item.equipped) {
                    return total;
                }

                const objectData = objectsDB[item.idItem.toString()];

                if (!objectData) {
                    return total;
                }

                total.equippedCount += 1;
                const kind = getInventoryItemEquipmentKind(item, objectsDB);

                if (
                    kind === "armadura" ||
                    kind === "accesorio" ||
                    kind === "escudo" ||
                    kind === "casco"
                ) {
                    total.minDef += objectData.minDef ?? 0;
                    total.maxDef += objectData.maxDef ?? 0;
                    total.minDefMag += objectData.minDefMag ?? 0;
                    total.maxDefMag += objectData.maxDefMag ?? 0;
                    total.resistenciaMagica +=
                        objectData.resistenciaMagica ?? 0;
                }

                if (
                    kind === "arma" ||
                    (kind === "flechas" && hasProjectileWeapon)
                ) {
                    total.minWeaponHit += objectData.minHit ?? 0;
                    total.maxWeaponHit += objectData.maxHit ?? 0;
                }

                total.magicDamageBonus += objectData.magicDamageBonus ?? 0;
                total.magicDamagePercent += objectData.magicDamagePercent ?? 0;
                total.bonusExpNpcPct += Number(
                    objectData.bonusExpNpcPct ?? 0,
                );
                total.bonusGoldNpcPct += Number(
                    objectData.bonusGoldNpcPct ?? 0,
                );
                total.bonusDropNpcPct += Number(
                    objectData.bonusDropNpcPct ?? 0,
                );

                const specialBonuses = getSpecialBonuses(objectData);
                total.strengthBonus += specialBonuses.strength;
                total.agilityBonus += specialBonuses.agility;
                total.maxManaBonus += specialBonuses.maxMana;

                if (kind === "arma" && !total.weaponName) {
                    total.weaponName = item.name;
                    total.isProjectileWeapon = Boolean(objectData.proyectil);
                    total.isStabWeapon = Boolean(objectData.apu);
                }

                return total;
            },
            {
                equippedCount: 0,
                weaponName: "",
                isProjectileWeapon: false,
                isStabWeapon: false,
                minDef: 0,
                maxDef: 0,
                minDefMag: 0,
                maxDefMag: 0,
                resistenciaMagica: 0,
                minWeaponHit: 0,
                maxWeaponHit: 0,
                magicDamageBonus: 0,
                magicDamagePercent: 0,
                bonusExpNpcPct: 0,
                bonusGoldNpcPct: 0,
                bonusDropNpcPct: 0,
                strengthBonus: 0,
                agilityBonus: 0,
                maxManaBonus: 0,
            },
        );
    }, [equippedByKind.arma, hud, objectsDB]);

    const equipmentImprovements = React.useMemo(() => {
        if (!equipmentStats) {
            return [];
        }

        const improvements: Array<{
            key: string;
            label: string;
            value: string;
            direction: number;
        }> = [];
        const addRange = (key: string, label: string, min: number, max: number) => {
            if (min === 0 && max === 0) {
                return;
            }
            improvements.push({
                key,
                label,
                value: formatSignedRange(min, max),
                direction: min < 0 || max < 0 ? -1 : 1,
            });
        };
        const addValue = (
            key: string,
            label: string,
            value: number,
            suffix = "",
        ) => {
            if (value === 0) {
                return;
            }
            improvements.push({
                key,
                label,
                value: formatSignedNumber(value, suffix),
                direction: Math.sign(value),
            });
        };

        addRange(
            "damage",
            "Daño físico",
            equipmentStats.minWeaponHit,
            equipmentStats.maxWeaponHit,
        );
        addRange(
            "defense",
            "Defensa física",
            equipmentStats.minDef,
            equipmentStats.maxDef,
        );
        addRange(
            "magic-defense",
            "Defensa mágica",
            equipmentStats.minDefMag,
            equipmentStats.maxDefMag,
        );
        addValue(
            "magic-resistance",
            "Resistencia mágica",
            equipmentStats.resistenciaMagica,
            "%",
        );
        addValue(
            "magic-damage",
            "Ataque mágico",
            equipmentStats.magicDamageBonus,
        );
        addValue(
            "magic-damage-percent",
            "Daño mágico",
            equipmentStats.magicDamagePercent,
            "%",
        );
        addValue("strength", "Fuerza", equipmentStats.strengthBonus);
        addValue("agility", "Agilidad", equipmentStats.agilityBonus);
        addValue("max-mana", "Maná máximo", equipmentStats.maxManaBonus);
        addValue(
            "bonus-exp-npc",
            "Experiencia extra",
            equipmentStats.bonusExpNpcPct,
            "%",
        );
        addValue(
            "bonus-gold-npc",
            "Oro extra",
            equipmentStats.bonusGoldNpcPct,
            "%",
        );
        addValue(
            "bonus-drop-npc",
            "Chance de drop",
            equipmentStats.bonusDropNpcPct,
            "%",
        );

        return improvements;
    }, [equipmentStats]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-[#8d7044] bg-[radial-gradient(circle_at_top,#3b2917_0%,#1b130d_42%,#0b0907_100%)] text-stone-100 shadow-[0_35px_140px_rgba(0,0,0,0.62)]">
                <div className="border-b border-amber-200/12 bg-black/20 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.34em] text-amber-300/78">
                                Personaje
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-[#f5ead2]">
                                Estadísticas
                            </h2>
                            <p className="mt-2 text-sm text-stone-300/85">
                                Equipo, atributos y progreso del personaje.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-200 transition hover:border-white/20 hover:bg-white/10"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto px-6 py-6">
                    {!hud ? (
                        <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-6 text-sm text-stone-300">
                            Todavia no hay datos del personaje conectados.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
                                <section className="border border-amber-300/20 bg-black/25 p-4">
                                    <div className="flex items-start justify-between gap-3 border-b border-amber-200/10 pb-3">
                                        <div>
                                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-300/85">
                                                Equipamiento
                                            </h3>
                                            <p className="mt-1 text-lg font-semibold text-stone-100">
                                                {hud.nameCharacter || "Personaje"}
                                            </p>
                                        </div>
                                        <div className="text-right text-xs leading-5 text-stone-400">
                                            <p>
                                                {classLabels[hud.idClase ?? 0] ??
                                                    `Clase ${hud.idClase ?? "-"}`}
                                            </p>
                                            <p>Nivel {formatNumber(hud.level)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-[minmax(0,1fr)_128px_minmax(0,1fr)] items-center gap-3">
                                        <div className="space-y-2">
                                            {LEFT_EQUIPMENT_SLOTS.map((kind) => {
                                                const item = equippedByKind[kind];
                                                return (
                                                    <EquipmentSlotCard
                                                        key={kind}
                                                        kind={kind}
                                                        item={item}
                                                        graphicData={
                                                            item
                                                                ? graphicsDB?.[
                                                                      item.grhIndex.toString()
                                                                  ]
                                                                : undefined
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>

                                        <div className="flex h-[190px] items-center justify-center border border-amber-300/20 bg-[radial-gradient(circle_at_center,rgba(170,111,32,0.18),rgba(0,0,0,0.18)_68%)]">
                                            <CharacterSpritePreview
                                                bodyId={hud.idBody ?? 0}
                                                headId={hud.idHead ?? 0}
                                                helmetId={hud.idHelmet ?? 0}
                                                weaponId={hud.idWeapon ?? 0}
                                                shieldId={hud.idShield ?? 0}
                                                scale={1.08}
                                                framed={false}
                                                className="bg-transparent"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            {RIGHT_EQUIPMENT_SLOTS.map((kind) => {
                                                const item = equippedByKind[kind];
                                                return (
                                                    <EquipmentSlotCard
                                                        key={kind}
                                                        kind={kind}
                                                        item={item}
                                                        graphicData={
                                                            item
                                                                ? graphicsDB?.[
                                                                      item.grhIndex.toString()
                                                                  ]
                                                                : undefined
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>

                                <section className="border border-amber-300/20 bg-black/25 p-4">
                                    <div className="flex items-center justify-between gap-3 border-b border-amber-200/10 pb-3">
                                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-300/85">
                                            Mejoras del equipo
                                        </h3>
                                        <span className="text-xs text-stone-500">
                                            {equipmentStats?.equippedCount ?? 0} piezas
                                        </span>
                                    </div>

                                    {equipmentImprovements.length > 0 ? (
                                        <div className="mt-3 grid gap-x-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                            {equipmentImprovements.map(
                                                (improvement) => (
                                                    <div
                                                        key={improvement.key}
                                                        className="flex min-h-9 items-center justify-between gap-3 border-b border-white/8 py-2"
                                                    >
                                                        <span className="text-xs text-stone-400">
                                                            {improvement.label}
                                                        </span>
                                                        <span
                                                            className={`whitespace-nowrap text-xs font-semibold ${
                                                                improvement.direction < 0
                                                                    ? "text-rose-300"
                                                                    : "text-emerald-300"
                                                            }`}
                                                        >
                                                            {improvement.value}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex min-h-[160px] items-center justify-center px-5 text-center text-sm leading-6 text-stone-500">
                                            El equipo actual no aporta mejoras de
                                            combate registradas.
                                        </div>
                                    )}
                                </section>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <section className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-amber-300/78">
                                        Base de combate
                                    </h3>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <StatCard
                                            label="Vida"
                                            value={formatRange(
                                                hud.hp,
                                                hud.maxHp,
                                            )}
                                        />
                                        <StatCard
                                            label="Mana"
                                            value={formatRange(
                                                hud.mana,
                                                hud.maxMana,
                                            )}
                                        />
                                        <StatCard
                                            label="Golpe base"
                                            value={formatRange(
                                                hud.minHit,
                                                hud.maxHit,
                                            )}
                                        />
                                        <StatCard
                                            label="Arma"
                                            value={
                                                equipmentStats?.weaponName ||
                                                "Sin arma"
                                            }
                                        />
                                    </div>
                                </section>

                                <section className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-amber-300/78">
                                        Atributos
                                    </h3>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <StatCard
                                            label="Fuerza"
                                            value={formatNumber(hud.attrFuerza)}
                                        />
                                        <StatCard
                                            label="Agilidad"
                                            value={formatNumber(
                                                hud.attrAgilidad,
                                            )}
                                        />
                                        <StatCard
                                            label="Inteligencia"
                                            value={formatNumber(
                                                hud.attrInteligencia,
                                            )}
                                        />
                                        <StatCard
                                            label="Constitucion"
                                            value={formatNumber(
                                                hud.attrConstitucion,
                                            )}
                                        />
                                    </div>
                                </section>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <section className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-amber-300/78">
                                        Ofensiva
                                    </h3>
                                    <div className="mt-4">
                                        <DetailRow
                                            label="Daño equipado"
                                            value={formatRange(
                                                equipmentStats?.minWeaponHit,
                                                equipmentStats?.maxWeaponHit,
                                            )}
                                            description="Daño base que aporta tu arma o municion equipada."
                                        />
                                        <DetailRow
                                            label="Tipo de arma"
                                            value={
                                                equipmentStats?.isProjectileWeapon
                                                    ? "Distancia"
                                                    : equipmentStats?.isStabWeapon
                                                      ? "Apuñala"
                                                      : equipmentStats?.weaponName
                                                        ? "Cuerpo a cuerpo"
                                                        : "Sin arma"
                                            }
                                            description="Define si atacas de cerca, a distancia o con un arma apta para apuñalar."
                                        />
                                        <DetailRow
                                            label="Ataque mágico equipado"
                                            value={formatSignedNumber(
                                                equipmentStats?.magicDamageBonus,
                                            )}
                                            description="Daño mágico plano otorgado por arma, casco, armadura o anillo equipado."
                                        />
                                        {equipmentStats?.magicDamagePercent ? (
                                            <DetailRow
                                                label="Bonus mágico %"
                                                value={formatSignedNumber(
                                                    equipmentStats.magicDamagePercent,
                                                    "%",
                                                )}
                                                description="Porcentaje extra de daño mágico otorgado por equipo especial."
                                            />
                                        ) : null}
                                    </div>
                                </section>

                                <section className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-amber-300/78">
                                        Defensa
                                    </h3>
                                    <div className="mt-4">
                                        <DetailRow
                                            label="Defensa equipada"
                                            value={formatRange(
                                                equipmentStats?.minDef,
                                                equipmentStats?.maxDef,
                                            )}
                                            description="Rango de defensa física que suma el equipo que llevas puesto."
                                        />
                                        <DetailRow
                                            label="Defensa mágica"
                                            value={formatRange(
                                                equipmentStats?.minDefMag,
                                                equipmentStats?.maxDefMag,
                                            )}
                                            description="Rango de defensa mágica aportado por cascos, armaduras, escudos y anillos equipados."
                                        />
                                        <DetailRow
                                            label="Resistencia mágica"
                                            value={formatSignedNumber(
                                                equipmentStats?.resistenciaMagica,
                                                "%",
                                            )}
                                            description="Reducción porcentual adicional frente a daño mágico, si tu equipo la otorga."
                                        />
                                    </div>
                                </section>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                {snapshot ? (
                                    <section className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                                        <h3 className="text-[11px] uppercase tracking-[0.3em] text-amber-300/78">
                                            Faccion
                                        </h3>
                                        <div className="mt-4">
                                            {isLoading ? (
                                                <div className="text-sm text-stone-400">
                                                    Cargando progreso
                                                    faccionario...
                                                </div>
                                            ) : activeFactionSnapshot ? (
                                                <>
                                                    <DetailRow
                                                        label="Alineacion"
                                                        value={
                                                            activeFactionSnapshot.label
                                                        }
                                                    />
                                                    <DetailRow
                                                        label="Puntos de faccion"
                                                        value={formatNumber(
                                                            activeFactionSnapshot
                                                                .data.score,
                                                        )}
                                                        description="Los puntos de faccion se suman con bajas validas. No cuentan newbies, peleas seguras ni objetivos a los que les sacas mas de 10 niveles, salvo que la victima sea nivel 25 o mas. Los re-kills recientes tampoco suman."
                                                    />
                                                    <DetailRow
                                                        label="Rango"
                                                        value={
                                                            activeFactionSnapshot
                                                                .data
                                                                .currentTitle ??
                                                            "Sin rango"
                                                        }
                                                    />
                                                    <DetailRow
                                                        label="Falta para el siguiente"
                                                        value={
                                                            activeFactionSnapshot
                                                                .data.nextTitle
                                                                ? `${formatNumber(activeFactionSnapshot.data.scoreToNextRank)} puntos de faccion para ${activeFactionSnapshot.data.nextTitle}`
                                                                : "Rango maximo"
                                                        }
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <DetailRow
                                                        label="Puntos de Alianza"
                                                        value={formatNumber(
                                                            snapshot.factions
                                                                .armada.score,
                                                        )}
                                                    />
                                                    <DetailRow
                                                        label="Puntos de Horda"
                                                        value={formatNumber(
                                                            snapshot.factions
                                                                .caos.score,
                                                        )}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </section>
                                ) : null}

                                <section className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-amber-300/78">
                                        Skills
                                    </h3>
                                    <div className="mt-4">
                                        {isLoading ? (
                                            <div className="text-sm text-stone-400">
                                                Cargando skills del personaje...
                                            </div>
                                        ) : snapshot ? (
                                            <>
                                                <DetailRow
                                                    label="Tacticas de combate"
                                                    value={formatNumber(
                                                        snapshot.skills
                                                            .tacticasCombate,
                                                    )}
                                                    description="Skill base usada para calcular evasión y desempeño general en combate."
                                                />
                                                <DetailRow
                                                    label="Defensa"
                                                    value={formatNumber(
                                                        snapshot.skills.defensa,
                                                    )}
                                                    description="Skill vinculada al uso defensivo del personaje, especialmente con escudo."
                                                />
                                                <DetailRow
                                                    label="Armas"
                                                    value={formatNumber(
                                                        snapshot.skills.armas,
                                                    )}
                                                    description="Dominio de armas cuerpo a cuerpo que no son de proyectil ni de apuñalar."
                                                />
                                                <DetailRow
                                                    label="Proyectiles"
                                                    value={formatNumber(
                                                        snapshot.skills
                                                            .proyectiles,
                                                    )}
                                                    description="Skill usada cuando atacas con armas de distancia y munición."
                                                />
                                                <DetailRow
                                                    label="Combate sin armas"
                                                    value={formatNumber(
                                                        snapshot.skills
                                                            .wrestling,
                                                    )}
                                                    description="Representa tu capacidad ofensiva cuando peleas sin arma equipada."
                                                />
                                                <DetailRow
                                                    label="Ocultarse"
                                                    value={formatNumber(
                                                        snapshot.skills
                                                            .ocultarse,
                                                    )}
                                                    description="Skill relacionada con esconderte y sostener estados de ocultamiento."
                                                />
                                                <DetailRow
                                                    label="Apuñalar"
                                                    value={formatNumber(
                                                        snapshot.skills
                                                            .apunalar,
                                                    )}
                                                    description="Skill usada para armas de apuñalar y sus chequeos asociados."
                                                />
                                            </>
                                        ) : (
                                            <div className="text-sm text-stone-400">
                                                Usa <code>/estadisticas</code>{" "}
                                                para pedir estas metricas al
                                                servidor.
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-amber-300/78">
                                        Muertes
                                    </h3>
                                    <div className="mt-4">
                                        {isLoading ? (
                                            <div className="text-sm text-stone-400">
                                                Cargando bajas del personaje...
                                            </div>
                                        ) : snapshot ? (
                                            <>
                                                <DetailRow
                                                    label="NPC matados"
                                                    value={formatNumber(
                                                        snapshot.kills
                                                            .npcMatados,
                                                    )}
                                                />
                                                <DetailRow
                                                    label="Ciudadanos matados"
                                                    value={formatNumber(
                                                        snapshot.kills
                                                            .ciudadanosMatados,
                                                    )}
                                                />
                                                <DetailRow
                                                    label="Criminales matados"
                                                    value={formatNumber(
                                                        snapshot.kills
                                                            .criminalesMatados,
                                                    )}
                                                />
                                            </>
                                        ) : (
                                            <div className="text-sm text-stone-400">
                                                Usa <code>/estadisticas</code>{" "}
                                                para pedir estas metricas al
                                                servidor.
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
