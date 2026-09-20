"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import {
    MAX_SKILL_POINTS,
    NUM_SKILLS,
    type SkillsState,
} from "../lib/aowProtocol";

type SkillsModalProps = {
    isOpen: boolean;
    skillsState?: SkillsState | null;
    onAssignSkill?: (skillId: number) => void;
    onClose: () => void;
};

const SKILL_NAMES = [
    "Suerte",
    "Aprendizaje de Magias",
    "Robar",
    "Esquivar Cuerpo/Cuerpo",
    "Golpear Cuerpo/Cuerpo",
    "Meditar",
    "Apuñalar",
    "Ocultarse",
    "Supervivencia",
    "Talar arboles",
    "Comercio",
    "Defensa con escudos",
    "Pesca",
    "Mineria",
    "Carpinteria",
    "Herreria",
    "Liderazgo",
    "Domar Criaturas",
    "Golpeo con Proyectiles",
    "Golpeo con Armas Dobles",
    "Navegacion",
    "Daños en Magia",
    "Defensa en Magias",
    "Esquivar Magias",
    "Daño en Armas",
    "Defensa en Armas",
    "Aprendizaje de Armas",
    "Daño de Proyectiles",
    "Defensa de Proyectiles",
    "Aprendizaje de Proyectiles",
    "Esquivar Proyectiles",
] as const;

function getSkillValues(skillsState?: SkillsState | null) {
    const values = Array.from({ length: NUM_SKILLS }, (_, index) =>
        Math.max(0, Math.min(MAX_SKILL_POINTS, Number(skillsState?.values?.[index]) || 0)),
    );

    return values;
}

export default function SkillsModal({
    isOpen,
    skillsState,
    onAssignSkill,
    onClose,
}: SkillsModalProps) {
    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const values = getSkillValues(skillsState);
    const remainingPoints = Math.max(0, Math.floor(Number(skillsState?.skillPts) || 0));

    return (
        <div className="fixed inset-0 z-[84] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[3px]">
            <div className="flex max-h-[min(86vh,640px)] w-full max-w-lg flex-col overflow-hidden border border-amber-200/20 bg-[#120c08]/95 text-stone-100 shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
                <div className="flex items-start justify-between gap-4 border-b border-amber-200/10 bg-[linear-gradient(180deg,rgba(127,78,35,0.28),rgba(18,12,8,0))] px-5 py-4">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/72">
                            Habilidades
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-[#f2e5ca]">
                            Skills
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-amber-200">
                            Puntos: {remainingPoints}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center border border-stone-700 bg-black/20 text-stone-300 transition hover:border-stone-500 hover:text-white"
                        aria-label="Cerrar habilidades"
                    >
                        <X
                            aria-hidden="true"
                            className="h-4 w-4"
                            strokeWidth={1.8}
                        />
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
                    <div className="divide-y divide-white/6">
                        {SKILL_NAMES.map((name, index) => {
                            const skillId = index + 1;
                            const skillValue = values[index] ?? 0;
                            const canAssign =
                                remainingPoints > 0 && skillValue < MAX_SKILL_POINTS;

                            return (
                                <div
                                    key={name}
                                    className="flex items-center justify-between gap-3 py-1.5"
                                >
                                    <span className="text-sm text-stone-300">
                                        {name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="w-16 text-right text-sm font-semibold tabular-nums text-amber-100">
                                            {skillValue}/{MAX_SKILL_POINTS}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={!canAssign}
                                            onClick={() => onAssignSkill?.(skillId)}
                                            className="flex h-6 w-6 items-center justify-center border border-amber-200/20 bg-black/25 text-amber-100 disabled:text-amber-100/40"
                                            aria-label={`Sumar ${name}`}
                                            title={
                                                canAssign
                                                    ? `Asignar 1 punto a ${name}`
                                                    : remainingPoints < 1
                                                      ? "No tienes puntos de skill libres"
                                                      : "Este skill ya está al máximo"
                                            }
                                        >
                                            <Plus
                                                aria-hidden="true"
                                                className="h-3.5 w-3.5"
                                                strokeWidth={2}
                                            />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
