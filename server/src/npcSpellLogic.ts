import type { DataSpell } from "./types/runtime";

export type NpcSpellEffect = "heal" | "damage" | "paraliza" | "inmoviliza" | "envenena" | "ceguera" | "estupidez";

export type NpcSpellTargetState = {
    dead?: number | boolean;
    paralizado?: number | boolean;
    inmovilizado?: number | boolean;
    envenenado?: number | boolean;
    ceguera?: number | boolean;
    estupidez?: number | boolean;
    mounted?: number | boolean;
    idClase?: number;
    morphBody?: number;
};

function isActive(value: unknown): boolean {
    return value === true || Number(value ?? 0) > 0;
}

export function getNpcSpellEffect(datSpell: DataSpell | undefined): NpcSpellEffect | undefined {
    if (!datSpell) {
        return undefined;
    }

    const subeHp = Number(datSpell.subeHp ?? 0);

    if (subeHp === 1) {
        return "heal";
    }

    if (isActive(datSpell.paraliza)) {
        return "paraliza";
    }

    if (isActive(datSpell.inmoviliza)) {
        return "inmoviliza";
    }

    if (subeHp === 2 || subeHp === 3 || subeHp === 4) {
        return "damage";
    }

    if (Number(datSpell.envenena ?? 0) > 0) {
        return "envenena";
    }

    if (isActive(datSpell.ceguera)) {
        return "ceguera";
    }

    if (isActive(datSpell.estupidez)) {
        return "estupidez";
    }

    return undefined;
}

export function isNpcOffensiveSpell(datSpell: DataSpell | undefined): boolean {
    const effect = getNpcSpellEffect(datSpell);

    return effect !== undefined && effect !== "heal";
}

/**
 * Replica las inmunidades de estados del servidor viejo y evita gastar un
 * lanzamiento en un efecto que ya está activo sobre el objetivo.
 */
export function shouldSkipNpcSpellForTarget(datSpell: DataSpell | undefined, target: NpcSpellTargetState): boolean {
    const effect = getNpcSpellEffect(datSpell);

    if (!effect || effect === "heal" || isActive(target.dead)) {
        return true;
    }

    if (effect === "paraliza") {
        return isActive(target.paralizado);
    }

    if (effect === "inmoviliza") {
        return isActive(target.inmovilizado);
    }

    if (effect === "envenena") {
        return isActive(target.envenenado) || Number(target.idClase ?? 0) === 6;
    }

    if (effect === "ceguera") {
        return isActive(target.ceguera) || Number(target.idClase ?? 0) === 6;
    }

    if (effect === "estupidez") {
        return (
            isActive(target.estupidez) ||
            Number(target.idClase ?? 0) === 6 ||
            isActive(target.mounted) ||
            Number(target.morphBody ?? 0) === 214
        );
    }

    return false;
}
