import type { ObjectData } from "@/types/game";

export type SpecialItemAccent = "suerte" | "experiencia" | "dorada" | "default";

/** Ítems de donación con marco + aura (túnicas creadas). */
const DONATION_TUNIC_ACCENTS: Record<number, SpecialItemAccent> = {
    1814: "suerte",
    1815: "experiencia",
    1816: "dorada",
};

/** Bodies de esas túnicas → mismo acento para el aura en el mapa. */
export const DONATION_TUNIC_BODY_ACCENTS: Record<number, SpecialItemAccent> = {
    573: "suerte",
    576: "experiencia",
    575: "dorada",
};

export function getSpecialItemAccent(
    itemId: number | string | undefined,
    objectData?: ObjectData | null,
): SpecialItemAccent | null {
    const id = Number(itemId);
    if (Number.isFinite(id) && DONATION_TUNIC_ACCENTS[id]) {
        return DONATION_TUNIC_ACCENTS[id];
    }

    if (!objectData) return null;
    if (Number(objectData.itemEspecial ?? 0) > 0) {
        if (Number(objectData.bonusDropNpcPct ?? 0) > 0) return "suerte";
        if (Number(objectData.bonusExpNpcPct ?? 0) > 0) return "experiencia";
        if (Number(objectData.bonusGoldNpcPct ?? 0) > 0) return "dorada";
        return "default";
    }

    if (
        Number(objectData.bonusDropNpcPct ?? 0) > 0 ||
        Number(objectData.bonusExpNpcPct ?? 0) > 0 ||
        Number(objectData.bonusGoldNpcPct ?? 0) > 0
    ) {
        if (Number(objectData.bonusDropNpcPct ?? 0) > 0) return "suerte";
        if (Number(objectData.bonusExpNpcPct ?? 0) > 0) return "experiencia";
        if (Number(objectData.bonusGoldNpcPct ?? 0) > 0) return "dorada";
    }

    return null;
}

export function isSpecialInventoryItem(
    itemId: number | string | undefined,
    objectData?: ObjectData | null,
): boolean {
    return getSpecialItemAccent(itemId, objectData) != null;
}

export type SpecialRewardBonus = {
    key: "exp" | "gold" | "drop";
    label: string;
    value: number;
};

/** Textos de recompensa de NPCs para tooltips / mejoras del equipo. */
export function getSpecialRewardBonuses(
    objectData?: ObjectData | null,
): SpecialRewardBonus[] {
    if (!objectData) return [];

    const bonuses: SpecialRewardBonus[] = [];
    const exp = Number(objectData.bonusExpNpcPct ?? 0);
    const gold = Number(objectData.bonusGoldNpcPct ?? 0);
    const drop = Number(objectData.bonusDropNpcPct ?? 0);

    if (exp > 0) {
        bonuses.push({
            key: "exp",
            label: "Experiencia extra",
            value: exp,
        });
    }
    if (gold > 0) {
        bonuses.push({
            key: "gold",
            label: "Oro extra",
            value: gold,
        });
    }
    if (drop > 0) {
        bonuses.push({
            key: "drop",
            label: "Chance de drop",
            value: drop,
        });
    }

    return bonuses;
}

export function formatSpecialRewardBonusLine(
    objectData?: ObjectData | null,
): string {
    return getSpecialRewardBonuses(objectData)
        .map((bonus) => `+${bonus.value}% de ${bonus.label.toLowerCase()}`)
        .join(" | ");
}

/**
 * Marco DOM del slot (inventario / equipo). Colores acordes a cada túnica.
 */
export function getSpecialItemSlotClasses(
    accent: SpecialItemAccent | null,
    options?: { selected?: boolean },
): string {
    if (!accent) return "";
    const selected = Boolean(options?.selected);

    switch (accent) {
        case "suerte":
            return selected
                ? "border-emerald-300/90 bg-[#1a2b1c] shadow-[0_0_10px_rgba(52,211,153,0.55)] ring-1 ring-emerald-300/50"
                : "border-emerald-400/55 bg-[#152218] shadow-[inset_0_0_8px_rgba(16,185,129,0.28)] hover:border-emerald-300/80";
        case "experiencia":
            return selected
                ? "border-sky-300/90 bg-[#172433] shadow-[0_0_10px_rgba(56,189,248,0.55)] ring-1 ring-sky-300/50"
                : "border-sky-400/55 bg-[#121c2a] shadow-[inset_0_0_8px_rgba(56,189,248,0.28)] hover:border-sky-300/80";
        case "dorada":
            return selected
                ? "border-amber-200/95 bg-[#3a2a12] shadow-[0_0_12px_rgba(251,191,36,0.65)] ring-1 ring-amber-200/60"
                : "border-amber-300/60 bg-[#2a1f0e] shadow-[inset_0_0_8px_rgba(245,158,11,0.35)] hover:border-amber-200/85";
        default:
            return selected
                ? "border-violet-300/90 bg-[#2a1b33] shadow-[0_0_10px_rgba(167,139,250,0.55)] ring-1 ring-violet-300/50"
                : "border-violet-400/55 bg-[#1c1424] shadow-[inset_0_0_8px_rgba(139,92,246,0.28)] hover:border-violet-300/80";
    }
}
