"use client";

import { useEffect, useState } from "react";
import { MonitorDown } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
    if (typeof window === "undefined") {
        return false;
    }

    return (
        window.matchMedia?.("(display-mode: standalone)").matches ||
        // iOS Safari
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
}

export default function InstallAppButton() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        setInstalled(isStandalone());

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setInstalled(true);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt,
        );
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    if (installed || !deferredPrompt) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={async () => {
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === "accepted") {
                    setDeferredPrompt(null);
                }
            }}
            className="hidden items-center gap-2 rounded-[4px] border border-amber-200/25 bg-white/5 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-200 transition hover:border-amber-200/50 hover:bg-amber-200/10 hover:text-amber-100 sm:inline-flex"
            title="Instalar World of AO como aplicación"
        >
            <MonitorDown className="h-4 w-4" />
            Instalar app
        </button>
    );
}
