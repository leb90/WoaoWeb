import fs from "node:fs";
import path from "node:path";

// Matriz objetivo de balance PvP: cuántos aciertos hacen falta para matar.
// Ancla del pedido: mago contra mago del mismo nivel y equipo = 2 (nivel 30), 2-3 (nivel 40), 3 (nivel 50).
// Ejemplo del pedido: mago 50 con set contra guerrero sin set 2-3; contra guerrero con set 4-5.
// El resto (identidad de clase y aguante del defensor) es propuesta y está en docs/balance/BALANCE_PVP.md.
export type SimResult = {
    level: number;
    atkClass: number;
    atkProfile: string;
    mode: string;
    defClass: number;
    defProfile: string;
    mean: number;
};

export const BASE_HITS: Record<number, number> = { 30: 2, 40: 2.5, 50: 3 };

// Cuánto más le cuesta matar a cada atacante que al mago con magia (en aciertos).
export const ATTACKER_OFFSET: Record<string, number> = {
    "1|magia": 0, // Mago: el que más pega con magia, nada físico
    "7|magia": 1, "7|melee": 1, // Druida: menos magia que el mago, arma útil
    "2|melee": 0.5, "2|magia": 1.5, // Clérigo: más arma que magia
    "8|melee": 0, "8|magia": 2.5, // Paladín: mucho arma, poca magia
    "3|melee": -0.5, // Guerrero: el que más pega físico, nada de magia
    "6|magia": 1, "6|melee": 1, // Bardo: mixto
    "4|melee": 0.5, "4|magia": 2.5, // Asesino: golpe común por debajo del guerrero; su fuerte es la apuñalada
    "9|rango": 0.5, "9|melee": 1.5, // Cazador: arco
};

// Aguante del defensor según el tipo de daño que recibe.
export const DEFENDER_OFFSET: Record<"magia" | "fisico", Record<number, number>> = {
    magia: { 1: 0, 7: 0, 6: 0, 2: 0, 4: 0.5, 9: 0.5, 8: 0.5, 3: 1 },
    fisico: { 1: -0.5, 7: 0, 6: 0, 4: 0, 2: 0.5, 9: 0.5, 8: 1, 3: 1 },
};

// Efecto del equipo. "comun" = mejor equipo común, "tier" = set de premios. Los cruces con "venta" son informativos.
export const GEAR_FACTOR: Record<string, number> = { "comun|comun": 1, "tier|tier": 1, "tier|comun": 0.75, "comun|tier": 1.3 };

// Nadie muere de un acierto contra alguien de su nivel con el mismo equipo.
export const MIN_HITS = 2;
export const TOLERANCE = 0.5;

// Clases con set de tier (jsons/sets.json). Para las que no tienen, "con set" es su equipo común y se
// las mide como tal (por ejemplo, el cazador: el set Silvano es solo del arquero).
const CLASSES_WITH_SET = new Set<number>(
    (() => {
        try {
            const file = path.resolve(__dirname, "../../../jsons/sets.json");
            return (JSON.parse(fs.readFileSync(file, "utf8")).sets ?? []).flatMap((set: { classes: number[] }) => set.classes);
        } catch {
            return [];
        }
    })(),
);
const effectiveProfile = (classId: number, profile: string) => (profile === "tier" && !CLASSES_WITH_SET.has(classId) ? "comun" : profile);

export function targetHits(result: SimResult): number | null {
    const offset = ATTACKER_OFFSET[`${result.atkClass}|${result.mode}`];
    const factor = GEAR_FACTOR[`${effectiveProfile(result.atkClass, result.atkProfile)}|${effectiveProfile(result.defClass, result.defProfile)}`];
    const base = BASE_HITS[result.level];
    if (offset === undefined || factor === undefined || base === undefined) return null;
    const kind = result.mode === "magia" ? "magia" : "fisico";
    const equal = Math.max(MIN_HITS, base + offset + (DEFENDER_OFFSET[kind][result.defClass] ?? 0));
    return factor === 1 ? equal : Math.max(factor < 1 ? 1.5 : MIN_HITS, equal * factor);
}

export function scoreResults(results: SimResult[]) {
    let total = 0;
    let within = 0;
    let squared = 0;
    for (const result of results) {
        const target = targetHits(result);
        if (target === null || !Number.isFinite(result.mean)) continue;
        total++;
        squared += (result.mean - target) ** 2;
        if (Math.abs(result.mean - target) <= TOLERANCE) within++;
    }
    return { total, within, meanSquaredError: total ? squared / total : 0 };
}
