"use client";

import { useTapHandlers } from "./useTapHandlers";

type TapButtonProps = Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onClick" | "onPointerDown" | "onPointerUp" | "onPointerCancel" | "type"
> & {
    onTap: () => void;
};

// Botón para el HUD táctil que responde aunque haya otro dedo apoyado
// (ver useTapHandlers).
export function TapButton({ onTap, ...buttonProps }: TapButtonProps) {
    const handlers = useTapHandlers(onTap);

    return <button type="button" {...buttonProps} {...handlers} />;
}
