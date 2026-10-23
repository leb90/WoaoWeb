// Rarezas por instancia de ítem (las decide el server, server/src/itemRarity.ts): mismos nombres y colores
// que leb90/_Argentum y _React-Argentum.
export const RARITY_NAMES = ["Normal", "Mejorado", "Épico", "Legendario"] as const;
export const RARITY_COLORS = ["#9da3ae", "#35c76d", "#8a56e2", "#d8a729"] as const;

const clampRarity = (rarity: number | null | undefined) =>
    Math.max(0, Math.min(3, Math.floor(Number(rarity) || 0)));

export function getRarityName(rarity: number | null | undefined): string {
    return RARITY_NAMES[clampRarity(rarity)];
}

// Color del nombre: los normales quedan con el color de siempre.
export function getRarityTextColor(rarity: number | null | undefined): string | undefined {
    const value = clampRarity(rarity);
    return value > 0 ? RARITY_COLORS[value] : undefined;
}

// "+N" al final del nombre (Mejorado +1, Épico +2, Legendario +3), salvo que el nombre ya traiga su nivel
// (las piezas de los sets de tier se llaman "+1", "+2" o "LEGENDARIO").
export function formatItemNameWithRarity(name: string, rarity: number | null | undefined): string {
    const value = clampRarity(rarity);
    if (value === 0 || /(\+\s*\d|legendari[oa])\s*$/i.test(name.trim())) {
        return name;
    }
    return `${name} +${value}`;
}

// Borde y brillo del lugar del inventario (mismos colores que GameHUD.css del repo original).
export function getRaritySlotClasses(rarity: number | null | undefined, options?: { selected?: boolean }): string {
    const selected = Boolean(options?.selected);
    switch (clampRarity(rarity)) {
        case 1:
            return selected
                ? "border-[#35c76d] bg-[#16261b] shadow-[0_0_9px_rgba(53,199,109,0.6)] ring-1 ring-[#35c76d]/50"
                : "border-[#2a8f43] bg-[#132017] shadow-[0_0_5px_rgba(53,199,109,0.35)] hover:border-[#35c76d]";
        case 2:
            return selected
                ? "border-[#8a56e2] bg-[#21172f] shadow-[0_0_10px_rgba(138,86,226,0.62)] ring-1 ring-[#8a56e2]/50"
                : "border-[#6e43b8] bg-[#1a1326] shadow-[0_0_5px_rgba(138,86,226,0.38)] hover:border-[#8a56e2]";
        case 3:
            return selected
                ? "border-[#e8bd47] bg-[#33270f] shadow-[0_0_12px_rgba(216,167,41,0.7)] ring-1 ring-[#d8a729]/60"
                : "border-[#c69720] bg-[#261d0c] shadow-[0_0_6px_rgba(216,167,41,0.45)] hover:border-[#d8a729]";
        default:
            return "";
    }
}
