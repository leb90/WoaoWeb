"use client";

import { Swords } from "lucide-react";

type MobileAttackButtonProps = {
    onAttack: () => void;
};

export function MobileAttackButton({ onAttack }: MobileAttackButtonProps) {
    return (
        <button
            type="button"
            onPointerDown={(event) => {
                event.preventDefault();
                onAttack();
            }}
            className="pointer-events-auto flex h-16 w-16 select-none items-center justify-center rounded-full border border-rose-300/30 bg-[linear-gradient(180deg,#5a2020,#200a0a)] text-rose-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95"
            aria-label="Atacar"
        >
            <Swords className="h-7 w-7" />
        </button>
    );
}
