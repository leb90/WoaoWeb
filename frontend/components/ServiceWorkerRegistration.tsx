"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (
            typeof window === "undefined" ||
            !("serviceWorker" in navigator) ||
            process.env.NODE_ENV !== "production"
        ) {
            return;
        }

        navigator.serviceWorker.register("/sw.js").catch(() => {
            // Si falla el registro, el sitio sigue funcionando normal, solo sin PWA.
        });
    }, []);

    return null;
}
