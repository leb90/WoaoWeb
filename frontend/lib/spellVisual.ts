import {
    ArrowDownCircle,
    ArrowUpCircle,
    Brain,
    EyeOff,
    Flame,
    FlaskConical,
    Ghost,
    HeartPulse,
    Heart,
    type LucideIcon,
    Skull,
    Snowflake,
    Sparkles,
    Unlock,
    Utensils,
    Wand2,
    Zap,
} from "lucide-react";
import type { SpellData } from "../types/game";

export type SpellVisual = {
    Icon: LucideIcon;
    color: string;
};

type SpellFlags = SpellData & Record<string, unknown>;

function flag(spell: SpellFlags, key: string) {
    return Number(spell[key] ?? 0);
}

// Los hechizos no traen un ícono propio en los datos del juego: se elige uno
// según lo que hace (campos de spells.json) y, para los de daño, según el
// nombre (fuego, eléctrico, proyectil mágico).
export function getSpellVisual(
    spell: SpellData | null | undefined,
    name = spell?.name ?? "",
): SpellVisual {
    if (!spell) {
        return { Icon: Wand2, color: "#e7c98a" };
    }

    const data = spell as SpellFlags;
    const lowerName = name.toLowerCase();

    if (flag(data, "revivir")) {
        return { Icon: HeartPulse, color: "#fde68a" };
    }
    if (flag(data, "paraliza") || flag(data, "inmoviliza") || flag(data, "paralizaarea")) {
        return { Icon: Snowflake, color: "#7dd3fc" };
    }
    if (flag(data, "removerParalisis")) {
        return { Icon: Unlock, color: "#5eead4" };
    }
    if (flag(data, "invisibilidad")) {
        return { Icon: EyeOff, color: "#cbd5e1" };
    }
    if (flag(data, "ceguera")) {
        return { Icon: EyeOff, color: "#a78bfa" };
    }
    if (flag(data, "estupidez")) {
        return { Icon: Brain, color: "#f0abfc" };
    }
    if (flag(data, "curaVeneno")) {
        return { Icon: FlaskConical, color: "#86efac" };
    }
    if (flag(data, "envenena")) {
        return { Icon: Skull, color: "#4ade80" };
    }
    if (flag(data, "invoca") || data.type === 4) {
        return { Icon: Ghost, color: "#c4b5fd" };
    }

    const subeHp = flag(data, "subeHp");
    if (subeHp === 1) {
        return { Icon: Heart, color: "#4ade80" };
    }
    if (subeHp >= 2) {
        if (/fuego|tormenta|apocalipsis|llama|infierno/.test(lowerName)) {
            return { Icon: Flame, color: "#fb923c" };
        }
        if (/el[eé]ctric|descarga|rayo|trueno/.test(lowerName)) {
            return { Icon: Zap, color: "#facc15" };
        }
        return { Icon: Sparkles, color: "#c084fc" };
    }

    const subeAg = flag(data, "subeAg");
    const subeFz = flag(data, "subeFz");
    if (subeAg === 1 || subeFz === 1) {
        return { Icon: ArrowUpCircle, color: "#38bdf8" };
    }
    if (subeAg >= 2 || subeFz >= 2) {
        return { Icon: ArrowDownCircle, color: "#f87171" };
    }
    if (flag(data, "subeHam") || flag(data, "subeSed")) {
        return { Icon: Utensils, color: "#fdba74" };
    }

    return { Icon: Wand2, color: "#e7c98a" };
}
