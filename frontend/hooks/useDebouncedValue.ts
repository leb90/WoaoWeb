"use client";

import { useEffect, useState } from "react";

// El valor recién se actualiza cuando deja de cambiar durante `delayMs` (buscadores que filtran mientras se escribe).
export function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => setDebounced(value), delayMs);
        return () => window.clearTimeout(timeoutId);
    }, [value, delayMs]);

    return debounced;
}
