"use client";

import React from "react";
import { Droplets } from "lucide-react";

type Props = {
    bleedUntil?: number;
    dead?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

/**
 * Cartel "Te estás desangrando" con la cuenta de 10 a 0 mientras dura el desangrado de una apuñalada
 * (server/src/game.ts, startBleeding). Cada 2 segundos la herida saca lo mismo que el golpe: hay que
 * curarse muy rápido.
 */
export default function BleedBanner({ bleedUntil, dead, className, style }: Props) {
    const until = Number(bleedUntil ?? 0);
    const tracking = until > 0 && !dead;
    const [now, setNow] = React.useState(0);

    // La hora sale del intervalo (no del render): arranca al recibir el desangrado y corta al terminar.
    React.useEffect(() => {
        if (!tracking) return;
        const tick = () => setNow(Date.now());
        tick();
        const timer = window.setInterval(tick, 100);
        return () => window.clearInterval(timer);
    }, [tracking, until]);

    const remainingMs = now > 0 ? Math.max(0, until - now) : 0;
    if (!tracking || remainingMs <= 0) {
        return null;
    }

    // Redondeado: arranca en 10 y llega a 0 en el último medio segundo.
    const seconds = Math.round(remainingMs / 1000);

    // Sin cuadro: solo las letras, y el número late (corazón herido) cada vez que cambia.
    return (
        <div
            data-bleed-banner="true"
            role="alert"
            className={`bleed-banner-text pointer-events-none z-40 flex items-center gap-3 text-red-200 ${className ?? ""}`}
            style={style}
        >
            <Droplets className="h-5 w-5 shrink-0 text-red-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.95)]" aria-hidden />
            <span className="text-base font-black uppercase tracking-[0.18em]">Te estás desangrando</span>
            <span
                key={seconds}
                data-bleed-seconds={seconds}
                className="bleed-heartbeat min-w-[2ch] text-center font-mono text-3xl font-black tabular-nums"
            >
                {seconds}
            </span>
        </div>
    );
}
