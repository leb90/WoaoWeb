"use client";

import { HandGrab, Swords } from "lucide-react";

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

// Botoncito de agarrar que sale del de ataque (arriba a la izquierda, hacia el centro del arco de hechizos). Solo
// aparece cuando hay algo para agarrar bajo los pies. El botón de ataque está en la esquina del grupo de acciones,
// con el centro en (170, 170) de un cuadro de 210.
const PICKUP_BUTTON_SIZE = 32;
const PICKUP_CENTER = 170 - 32;

export function MobilePickupButton({
    itemName,
    onPickup,
}: {
    itemName: string;
    onPickup: () => void;
}) {
    return (
        <button
            type="button"
            onPointerDown={(event) => {
                event.preventDefault();
                onPickup();
            }}
            className="pointer-events-auto absolute flex animate-[woao-pop_160ms_ease-out] select-none items-center justify-center rounded-full border-2 border-emerald-300/60 bg-[linear-gradient(180deg,#1f4a35,#0b1d14)] text-emerald-100 shadow-[0_6px_16px_rgba(0,0,0,0.55)] active:scale-90"
            style={{
                width: PICKUP_BUTTON_SIZE,
                height: PICKUP_BUTTON_SIZE,
                left: PICKUP_CENTER - PICKUP_BUTTON_SIZE / 2,
                top: PICKUP_CENTER - PICKUP_BUTTON_SIZE / 2,
            }}
            aria-label={`Agarrar ${itemName}`}
            title={`Agarrar ${itemName}`}
        >
            <HandGrab className="h-4 w-4" />
        </button>
    );
}
