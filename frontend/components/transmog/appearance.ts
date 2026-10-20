import type { AppearanceIds, TransmogSlotKey } from "../../lib/aowProtocol";

export type PreviewDirection = "1" | "2" | "3" | "4";

export const TRANSMOG_SLOT_ORDER: TransmogSlotKey[] = [
    "casco",
    "escudo",
    "arma",
    "cuerpo",
];

export const TRANSMOG_SLOT_META: Record<
    TransmogSlotKey,
    { label: string; short: string; plural: string; empty: string }
> = {
    casco: {
        label: "Casco",
        short: "Casco",
        plural: "Cascos",
        empty: "Sin casco",
    },
    escudo: {
        label: "Escudo",
        short: "Escudo",
        plural: "Escudos",
        empty: "Sin escudo",
    },
    arma: { label: "Arma", short: "Arma", plural: "Armas", empty: "Sin arma" },
    cuerpo: {
        label: "Cuerpo completo",
        short: "Disfraz",
        plural: "Disfraces",
        empty: "Sin disfraz",
    },
};

const SLOT_FIELD: Record<
    Exclude<TransmogSlotKey, "cuerpo">,
    keyof AppearanceIds
> = {
    casco: "helmet",
    escudo: "shield",
    arma: "weapon",
};

/**
 * Apariencia con una pieza aplicada encima (para "probar" un objeto). Un
 * disfraz de cuerpo completo reemplaza todo y deja sin cabeza ni equipo; con
 * un disfraz puesto, las demás piezas no cambian nada.
 */
export function applyAppearancePiece(
    current: AppearanceIds,
    slot: TransmogSlotKey | null | undefined,
    graphic: number,
    bodyLocked = false,
): AppearanceIds {
    if (!slot || graphic <= 0) {
        return current;
    }

    if (slot === "cuerpo") {
        return { head: 0, body: graphic, helmet: 0, weapon: 0, shield: 0 };
    }

    if (bodyLocked || current.head <= 0) {
        return current;
    }

    return { ...current, [SLOT_FIELD[slot]]: graphic };
}

const DIRECTION_CYCLE: PreviewDirection[] = ["2", "3", "1", "4"];

export function rotateDirection(
    direction: PreviewDirection,
    step: 1 | -1,
): PreviewDirection {
    const index = DIRECTION_CYCLE.indexOf(direction);
    const next =
        (index + step + DIRECTION_CYCLE.length) % DIRECTION_CYCLE.length;
    return DIRECTION_CYCLE[next];
}

export const DIRECTION_LABEL: Record<PreviewDirection, string> = {
    "1": "Espalda",
    "2": "Frente",
    "3": "Derecha",
    "4": "Izquierda",
};

export function formatPoints(value: number): string {
    return new Intl.NumberFormat("es-AR").format(
        Math.max(0, Math.floor(value || 0)),
    );
}
