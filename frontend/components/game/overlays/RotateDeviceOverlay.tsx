"use client";

import { Smartphone } from "lucide-react";

type RotateDeviceOverlayProps = {
    onBack: () => void;
};

export function RotateDeviceOverlay({ onBack }: RotateDeviceOverlayProps) {
    return (
        <div className="fixed inset-0 z-[85] flex flex-col items-center justify-center gap-4 bg-black/92 px-6 text-center backdrop-blur-sm">
            <Smartphone
                className="h-16 w-16 animate-[woao-rotate-hint_1.6s_ease-in-out_infinite] text-amber-200"
                strokeWidth={1.5}
            />
            <style jsx>{`
                @keyframes woao-rotate-hint {
                    0%,
                    100% {
                        transform: rotate(0deg);
                    }
                    50% {
                        transform: rotate(90deg);
                    }
                }
            `}</style>
            <h2 className="text-lg font-semibold text-[#f3e7c8]">
                Girá tu teléfono para jugar
            </h2>
            <p className="max-w-xs text-sm leading-6 text-stone-300">
                World of AO se juega en horizontal.
            </p>
            <button
                type="button"
                onClick={onBack}
                className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-400 underline underline-offset-4 hover:text-stone-200"
            >
                Volver
            </button>
        </div>
    );
}
