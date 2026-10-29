import { useSyncExternalStore } from "react";

// FPS y ping que mide el render (MapRendererCore, onPerformanceSample) para el panel de la derecha. Van por acá y no
// por el estado de la página: cambian cada segundo y redibujar /play entero por eso sale caro.

export type PerformanceReadout = { fps: number | null; pingMs: number | null };

const EMPTY_READOUT: PerformanceReadout = { fps: null, pingMs: null };

let currentReadout: PerformanceReadout = EMPTY_READOUT;
const listeners = new Set<() => void>();

export function publishPerformanceSample(sample: PerformanceReadout) {
    if (sample.fps === currentReadout.fps && sample.pingMs === currentReadout.pingMs) {
        return;
    }

    currentReadout = { fps: sample.fps, pingMs: sample.pingMs };
    for (const listener of listeners) {
        listener();
    }
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function usePerformanceReadout(): PerformanceReadout {
    return useSyncExternalStore(
        subscribe,
        () => currentReadout,
        () => EMPTY_READOUT,
    );
}
