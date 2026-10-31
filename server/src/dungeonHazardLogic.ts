// Cada corrida elige lugares distintos, sin repetir una baldosa ni depender del orden del plano.
export function pickTrapTiles(candidates: string[], count: number, random: () => number = Math.random): string[] {
    const available = [...new Set(candidates)];
    for (let index = available.length - 1; index > 0; index--) {
        const other = Math.floor(random() * (index + 1));
        [available[index], available[other]] = [available[other], available[index]];
    }
    return available.slice(0, Math.max(0, count));
}
