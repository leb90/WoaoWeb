export function isStandaloneDisplayMode(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    return (
        window.matchMedia?.("(display-mode: standalone)").matches ||
        // iOS Safari
        (window.navigator as unknown as { standalone?: boolean })
            .standalone === true
    );
}

export function isIosDevice(): boolean {
    if (typeof navigator === "undefined") {
        return false;
    }

    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
