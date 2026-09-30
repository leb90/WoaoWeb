"use client";

import React from "react";
import { X } from "lucide-react";
import type { PlayerHudState, SpellEntry } from "../../../lib/aowProtocol";
import { getSpellVisual } from "../../../lib/spellVisual";
import { loadSpellsDB } from "../../../utils/gameLoader";
import type { SpellData, SpellsDB } from "../../../types/game";

let spellsDBPromise: Promise<SpellsDB> | null = null;

function SpellIcon({
    spellData,
    name,
}: {
    spellData?: SpellData;
    name: string;
}) {
    const { Icon, color } = getSpellVisual(spellData, name);

    return (
        <Icon className="h-4 w-4 shrink-0" style={{ color }} strokeWidth={2.2} />
    );
}

type MobileSpellsModalProps = {
    hud: PlayerHudState | null;
    onClose: () => void;
    onCast: (spell: SpellEntry) => void;
};

export function MobileSpellsModal({
    hud,
    onClose,
    onCast,
}: MobileSpellsModalProps) {
    const [spellsDB, setSpellsDB] = React.useState<SpellsDB | null>(null);

    React.useEffect(() => {
        let isActive = true;
        spellsDBPromise ??= loadSpellsDB();
        spellsDBPromise
            .then((data) => {
                if (isActive) {
                    setSpellsDB(data);
                }
            })
            .catch(() => {
                spellsDBPromise = null;
            });

        return () => {
            isActive = false;
        };
    }, []);

    const spells = (hud?.spells ?? [])
        .filter((spell) => spell.idSpell > 0)
        .slice()
        .sort((a, b) => a.slot - b.slot);
    const mana = hud?.mana ?? 0;

    return (
        <div
            className="pointer-events-auto fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-full w-[min(460px,100%)] flex-col overflow-hidden rounded-2xl border border-amber-200/20 bg-[linear-gradient(180deg,rgba(28,18,12,0.98),rgba(14,10,8,0.98))] text-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                <div className="flex shrink-0 items-center justify-between border-b border-amber-200/10 px-4 py-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">
                        Hechizos
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-700 bg-black/30 text-stone-300"
                        aria-label="Cerrar hechizos"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div
                    className="min-h-0 overflow-y-auto overscroll-contain p-2"
                    style={{ touchAction: "pan-y" }}
                >
                    {spells.length ? (
                        <div className="grid grid-cols-2 gap-1.5">
                            {spells.map((spell) => {
                                const hasMana = mana >= spell.manaRequired;

                                return (
                                    <button
                                        key={spell.slot}
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onCast(spell);
                                        }}
                                        className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
                                            hasMana
                                                ? "border-amber-500/25 bg-[#2b2016] text-stone-100"
                                                : "border-stone-700 bg-black/30 text-stone-500"
                                        }`}
                                    >
                                        <span className="flex min-w-0 items-center gap-2">
                                            <SpellIcon
                                                spellData={
                                                    spellsDB?.[
                                                        spell.idSpell.toString()
                                                    ]
                                                }
                                                name={spell.name}
                                            />
                                            <span className="truncate">
                                                {spell.name}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-[11px] text-sky-300/90">
                                            {spell.manaRequired} mp
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="px-2 py-6 text-center text-sm text-stone-400">
                            Este personaje no tiene hechizos.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
