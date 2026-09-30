"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { screenDeltaToLocal } from "../../../lib/viewportRotation";

export type JoystickDirection = "up" | "down" | "left" | "right";

type TouchJoystickProps = {
    onDirectionChange: (direction: JoystickDirection | null) => void;
    size?: number;
};

const DEADZONE_PX = 14;

function resolveDirection(dx: number, dy: number): JoystickDirection | null {
    const distance = Math.hypot(dx, dy);
    if (distance < DEADZONE_PX) {
        return null;
    }

    // Angulo en grados, 0 = derecha, 90 = abajo (Y crece hacia abajo en pantalla).
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    if (angle >= -45 && angle < 45) return "right";
    if (angle >= 45 && angle < 135) return "down";
    if (angle >= -135 && angle < -45) return "up";
    return "left";
}

export function TouchJoystick({
    onDirectionChange,
    size = 128,
}: TouchJoystickProps) {
    const baseRef = useRef<HTMLDivElement | null>(null);
    const pointerIdRef = useRef<number | null>(null);
    const currentDirectionRef = useRef<JoystickDirection | null>(null);
    const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });

    const radius = size / 2;
    const knobMaxOffset = radius * 0.55;

    const updateDirection = useCallback(
        (next: JoystickDirection | null) => {
            if (currentDirectionRef.current === next) {
                return;
            }
            currentDirectionRef.current = next;
            onDirectionChange(next);
        },
        [onDirectionChange],
    );

    const resetKnob = useCallback(() => {
        setKnobOffset({ x: 0, y: 0 });
        updateDirection(null);
    }, [updateDirection]);

    const handlePointerDown = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            event.preventDefault();
            const base = baseRef.current;
            if (!base) {
                return;
            }

            base.setPointerCapture(event.pointerId);
            pointerIdRef.current = event.pointerId;
        },
        [],
    );

    const handlePointerMove = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (pointerIdRef.current !== event.pointerId) {
                return;
            }

            const base = baseRef.current;
            if (!base) {
                return;
            }

            const bounds = base.getBoundingClientRect();
            const centerX = bounds.left + bounds.width / 2;
            const centerY = bounds.top + bounds.height / 2;
            const { x: dx, y: dy } = screenDeltaToLocal(
                event.clientX - centerX,
                event.clientY - centerY,
            );
            const distance = Math.hypot(dx, dy);
            const clampedDistance = Math.min(distance, knobMaxOffset);
            const angle = Math.atan2(dy, dx);

            setKnobOffset({
                x: Math.cos(angle) * clampedDistance,
                y: Math.sin(angle) * clampedDistance,
            });

            updateDirection(resolveDirection(dx, dy));
        },
        [knobMaxOffset, updateDirection],
    );

    const handlePointerUp = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (pointerIdRef.current !== event.pointerId) {
                return;
            }
            pointerIdRef.current = null;
            resetKnob();
        },
        [resetKnob],
    );

    return (
        <div
            ref={baseRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="pointer-events-auto relative select-none rounded-full border border-amber-200/20 bg-black/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm touch-none"
            style={{ width: size, height: size }}
        >
            <ArrowUp className="pointer-events-none absolute left-1/2 top-2 h-4 w-4 -translate-x-1/2 text-amber-100/50" />
            <ArrowDown className="pointer-events-none absolute bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 text-amber-100/50" />
            <ArrowLeft className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-100/50" />
            <ArrowRight className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-100/50" />
            <div
                className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-amber-200/40 bg-[linear-gradient(180deg,#4a3826,#1c140c)] shadow-[0_6px_16px_rgba(0,0,0,0.6)]"
                style={{
                    width: size * 0.4,
                    height: size * 0.4,
                    transform: `translate(-50%, -50%) translate(${knobOffset.x}px, ${knobOffset.y}px)`,
                }}
            />
        </div>
    );
}
