"use client";

import { Swords } from "lucide-react";

type MobileAttackButtonProps = {
    onAttack: () => void;
    size?: number;
};

export function MobileAttackButton({
    onAttack,
    size = 64,
}: MobileAttackButtonProps) {
    return (
        <button
            type="button"
            onPointerDown={(event) => {
                event.preventDefault();
                onAttack();
            }}
            className="pointer-events-auto flex select-none items-center justify-center rounded-full border-2 border-rose-300/35 bg-[linear-gradient(180deg,#5a2020,#200a0a)] text-rose-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95"
            style={{ width: size, height: size }}
            aria-label="Atacar"
        >
            <Swords style={{ width: size * 0.45, height: size * 0.45 }} />
        </button>
    );
}
