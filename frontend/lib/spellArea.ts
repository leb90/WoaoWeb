// Forma de los hechizos de área (campo `aoe` de spells.json). Tiene que coincidir con server/src/spellArea.ts:
//   aoe 1: cruz de 5 baldosas (el centro y sus cuatro vecinas).
//   aoe 2: cuadrado de 3x3 baldosas (Ventisca y Llamarada).
export function getSpellAreaOffsets(aoe: number): Array<{ dx: number; dy: number }> {
    if (Number(aoe) === 1) {
        return [
            { dx: 0, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
        ];
    }
    if (Number(aoe) === 2) {
        const offsets: Array<{ dx: number; dy: number }> = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) offsets.push({ dx, dy });
        }
        return offsets;
    }
    return [];
}
