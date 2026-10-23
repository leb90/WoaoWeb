// Sets de tier: cuántas piezas de un set tiene equipadas un personaje y qué bono le dan.
// Los datos salen de jsons/sets.json (lo arma scripts/applyTierSetData.ts).
// Ver docs/balance/BALANCE_PVP.md, sección 7.4.
import fs from "node:fs";
import path from "node:path";

export {};

type SetBonusStep = { pieces: number; hpPct?: number; dmgPct?: number; manaPct?: number; paralysisResistPct?: number };
type TierSet = {
    id: string;
    name: string;
    season: number;
    classes: number[];
    pieces: Record<string, number[]>;
    bonuses: SetBonusStep[];
};

export type EquippedSetBonus = {
    setId: string | null;
    name: string | null;
    pieces: number;
    totalPieces: number;
    hpPct: number;
    dmgPct: number;
    manaPct: number;
    // Chance de que falle una parálisis o inmovilización sobre quien lo tiene (por ejemplo, Silvano completo).
    paralysisResistPct: number;
};

// Topes por si se edita sets.json a mano.
const MAX_HP_PCT = 20;
const MAX_DMG_PCT = 25;
const MAX_MANA_PCT = 20;
const MAX_PARALYSIS_RESIST_PCT = 30;

const EMPTY: EquippedSetBonus = { setId: null, name: null, pieces: 0, totalPieces: 0, hpPct: 0, dmgPct: 0, manaPct: 0, paralysisResistPct: 0 };

let sets: TierSet[] = [];
const pieceByItemId = new Map<number, { setId: string; slot: string }>();

function load() {
    const file = path.resolve(__dirname, "../jsons/sets.json");
    sets = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")).sets ?? []) : [];
    pieceByItemId.clear();
    for (const set of sets) {
        for (const [slot, ids] of Object.entries(set.pieces)) {
            for (const id of ids) pieceByItemId.set(Number(id), { setId: set.id, slot });
        }
    }
}
load();

export function isTierSetItem(itemId: number): boolean {
    return pieceByItemId.has(Number(itemId));
}

export function getTierSetForItem(itemId: number): { id: string; name: string } | null {
    const piece = pieceByItemId.get(Number(itemId));
    const set = piece ? sets.find((entry) => entry.id === piece.setId) : undefined;
    return set ? { id: set.id, name: set.name } : null;
}

// Cuenta lugares distintos (armadura, arma, casco, escudo, anillo) del mismo set y devuelve el bono
// del escalón más alto alcanzado. Si hay piezas de varios sets, gana el que tenga más.
export function getEquippedSetBonus(equippedItemIds: number[]): EquippedSetBonus {
    const slotsBySet = new Map<string, Set<string>>();
    for (const itemId of equippedItemIds) {
        const piece = pieceByItemId.get(Number(itemId));
        if (!piece) continue;
        if (!slotsBySet.has(piece.setId)) slotsBySet.set(piece.setId, new Set());
        slotsBySet.get(piece.setId)!.add(piece.slot);
    }
    let best: EquippedSetBonus = EMPTY;
    for (const [setId, slots] of slotsBySet) {
        const set = sets.find((entry) => entry.id === setId);
        if (!set) continue;
        const pieces = slots.size;
        if (pieces <= best.pieces) continue;
        const step = [...set.bonuses].filter((bonus) => pieces >= bonus.pieces).sort((a, b) => b.pieces - a.pieces)[0];
        best = {
            setId,
            name: set.name,
            pieces,
            totalPieces: Object.keys(set.pieces).length,
            hpPct: Math.min(MAX_HP_PCT, Number(step?.hpPct ?? 0)),
            dmgPct: Math.min(MAX_DMG_PCT, Number(step?.dmgPct ?? 0)),
            manaPct: Math.min(MAX_MANA_PCT, Number(step?.manaPct ?? 0)),
            paralysisResistPct: Math.min(MAX_PARALYSIS_RESIST_PCT, Number(step?.paralysisResistPct ?? 0)),
        };
    }
    return best;
}

export function reloadTierSets() {
    load();
}

module.exports = { isTierSetItem, getTierSetForItem, getEquippedSetBonus, reloadTierSets };
