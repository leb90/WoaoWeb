"use client";

import { focusRing, panelClass } from "./styles";
import { STARTING_ZONE_NAME } from "../../lib/characterCreation";

export default function CreationActions({
    creating,
    error,
    onBack,
    onCreate,
}: {
    creating: boolean;
    error: string | null;
    onBack: () => void;
    onCreate: () => void;
}) {
    return (
        <div className="flex flex-col items-stretch gap-2">
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onBack}
                    className={`border border-[#3a3428] bg-[#141414] px-5 py-2 text-[12px] tracking-[0.22em] text-[#cbb892] transition duration-150 hover:border-[#8a7040] ${focusRing}`}
                >
                    ATRÁS
                </button>
                <button
                    type="button"
                    onClick={onCreate}
                    disabled={creating}
                    className={`border border-[#d6a62d] bg-[linear-gradient(180deg,#3a2e12,#1c160b)] px-6 py-2 text-[12px] tracking-[0.22em] text-[#f6e7c1] transition duration-150 hover:brightness-110 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
                >
                    {creating ? "CREANDO PERSONAJE..." : "CREAR"}
                </button>
            </div>
            <p
                className="min-h-[1.125rem] text-right text-[12px] leading-[1.125rem] text-[#e23b3b]"
                role={error ? "alert" : undefined}
            >
                {error || "\u00a0"}
            </p>
            <section className={`${panelClass} px-3 py-2`} aria-label="Zona inicial">
                <p className="text-[10px] tracking-[0.22em] text-[#9f9587]">ZONA INICIAL</p>
                <p className="mt-1 text-[13px] tracking-[0.08em] text-[#eee5d3]">⚔ {STARTING_ZONE_NAME}</p>
            </section>
        </div>
    );
}
