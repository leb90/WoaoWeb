// Forma de los hechizos de área (campo `aoe` de spells.json). Tiene que coincidir con server/src/spellArea.ts:
//   aoe 1: cruz de 5 baldosas (el centro y sus cuatro vecinas).
export function getSpellAreaOffsets(aoe: number): Array<{ dx: number; dy: number }> {
    if (Number(aoe) !== 1) {
        return [];
    }
    return [
        { dx: 0, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
    ];
}
