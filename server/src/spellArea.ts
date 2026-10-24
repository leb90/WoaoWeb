// Hechizos de área centrados en la baldosa clickeada (campo `aoe` de spells.json), como en el _Argentum viejo:
// el cliente pinta en verde las mismas baldosas mientras se apunta (frontend/lib/spellArea.ts).
//   aoe 1: cruz de 5 baldosas (el centro y sus cuatro vecinas).
export {};

export type AreaTile = { x: number; y: number };

export function getAreaTiles(centerX: number, centerY: number, aoe: number): AreaTile[] {
    if (Number(aoe) !== 1) {
        return [];
    }
    return [
        { x: centerX, y: centerY },
        { x: centerX, y: centerY - 1 },
        { x: centerX, y: centerY + 1 },
        { x: centerX - 1, y: centerY },
        { x: centerX + 1, y: centerY },
    ].filter((tile) => tile.x >= 1 && tile.x <= 100 && tile.y >= 1 && tile.y <= 100);
}

export function isAreaSpell(spell: { aoe?: unknown } | undefined) {
    return Number(spell?.aoe ?? 0) > 0;
}

module.exports = { getAreaTiles, isAreaSpell };
