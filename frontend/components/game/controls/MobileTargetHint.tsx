"use client";

type MobileTargetHintProps = {
    label: string;
    onCancel: () => void;
};

export function MobileTargetHint({ label, onCancel }: MobileTargetHintProps) {
    return (
        <div
            className="pointer-events-none fixed top-3 z-40 flex items-center gap-2 rounded-lg bg-black/65 py-1 pl-3 pr-1"
            style={{ left: "calc(env(safe-area-inset-left, 0px) + 240px)" }}
        >
            <span className="text-sm font-semibold uppercase tracking-[0.06em] text-amber-200">
                {label}
            </span>
            <button
                type="button"
                onClick={onCancel}
                className="pointer-events-auto rounded-md border border-stone-600 px-2 py-1 text-xs text-stone-200"
            >
                Cancelar
            </button>
        </div>
    );
}
