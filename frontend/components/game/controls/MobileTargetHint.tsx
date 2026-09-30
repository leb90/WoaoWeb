"use client";

type MobileTargetHintProps = {
    label: string;
};

export function MobileTargetHint({ label }: MobileTargetHintProps) {
    return (
        <div
            className="pointer-events-none fixed top-3 z-30 rounded-lg bg-black/55 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.06em] text-amber-200"
            style={{ left: "calc(env(safe-area-inset-left, 0px) + 240px)" }}
        >
            {label}
        </div>
    );
}
