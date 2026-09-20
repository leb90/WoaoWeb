const WOAO_ANIMATION_FPS = 18;
const WOAO_MS_PER_FRAME = 1000 / WOAO_ANIMATION_FPS;

export function normalizeGraphicAnimationSpeed(
    speed: number | undefined,
    numFrames: number,
): number {
    const frames = Math.max(1, Number(numFrames) || 1);
    const raw = Number(speed);

    if (frames <= 1) {
        return Number.isFinite(raw) && raw > 0 ? raw : 500;
    }

    if (!Number.isFinite(raw) || raw <= 10) {
        return WOAO_MS_PER_FRAME;
    }

    const expectedCycleMs = frames * WOAO_MS_PER_FRAME;
    if (raw >= 150 && Math.abs(raw - expectedCycleMs) / expectedCycleMs <= 0.25) {
        return WOAO_MS_PER_FRAME;
    }

    if (raw >= 200) {
        return raw / frames;
    }

    return raw;
}
