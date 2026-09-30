"use client";

type MobileTargetHintProps = {
    label: string;
};

export function MobileTargetHint({ label }: MobileTargetHintProps) {
    return (
        <div className="pointer-events-none fixed left-[236px] top-3 z-30 rounded-lg bg-black/55 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.06em] text-amber-200 backdrop-blur-sm">
            {label}
        </div>
    );
}
