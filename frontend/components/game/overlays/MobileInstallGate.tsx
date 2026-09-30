"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Share, Menu as MenuIcon } from "lucide-react";
import { isIosDevice } from "../../../lib/pwa";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type MobileInstallGateProps = {
    onCancel: () => void;
};

export function MobileInstallGate({ onCancel }: MobileInstallGateProps) {
    const [isIos, setIsIos] = useState(false);
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        setIsIos(isIosDevice());

        if (window.__woaoDeferredPrompt) {
            setDeferredPrompt(window.__woaoDeferredPrompt);
        }

        const handleStoredPrompt = () => {
            if (window.__woaoDeferredPrompt) {
                setDeferredPrompt(window.__woaoDeferredPrompt);
            }
        };

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            const promptEvent = event as BeforeInstallPromptEvent;
            window.__woaoDeferredPrompt = promptEvent;
            setDeferredPrompt(promptEvent);
        };

        window.addEventListener(
            "woao:beforeinstallprompt",
            handleStoredPrompt,
        );
        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt,
        );

        return () => {
            window.removeEventListener(
                "woao:beforeinstallprompt",
                handleStoredPrompt,
            );
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return;
        }

        setInstalling(true);
        try {
            await deferredPrompt.prompt();
            await deferredPrompt.userChoice;
        } finally {
            window.__woaoDeferredPrompt = null;
            setDeferredPrompt(null);
            setInstalling(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-[28px] border border-amber-200/20 bg-[linear-gradient(180deg,rgba(28,18,12,0.98),rgba(14,10,8,0.98))] p-6 text-center text-stone-100 shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
                <Image
                    src="/static/imgs/woaoicon-192.png"
                    alt=""
                    width={72}
                    height={72}
                    className="mx-auto h-[72px] w-[72px] rounded-2xl"
                />

                <h2 className="mt-4 text-xl font-semibold text-[#f3e7c8]">
                    Instalá World of AO
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                    Para jugar desde el celular necesitás agregar la app a tu
                    pantalla de inicio. Se instala en segundos y después
                    jugás como si fuera una app.
                </p>

                {isIos ? (
                    <ol className="mt-5 space-y-3 text-left text-sm text-stone-200">
                        <li className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200/15 text-xs font-semibold text-amber-200">
                                1
                            </span>
                            <span className="pt-0.5">
                                Tocá el botón{" "}
                                <Share className="inline h-4 w-4 -translate-y-0.5" />{" "}
                                de compartir en Safari.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200/15 text-xs font-semibold text-amber-200">
                                2
                            </span>
                            <span className="pt-0.5">
                                Elegí{" "}
                                <span className="font-semibold text-amber-100">
                                    Agregar a pantalla de inicio
                                </span>
                                .
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200/15 text-xs font-semibold text-amber-200">
                                3
                            </span>
                            <span className="pt-0.5">
                                Tocá{" "}
                                <span className="font-semibold text-amber-100">
                                    Agregar
                                </span>{" "}
                                para confirmar.
                            </span>
                        </li>
                    </ol>
                ) : deferredPrompt ? (
                    <button
                        type="button"
                        onClick={handleInstallClick}
                        disabled={installing}
                        className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold text-stone-950 transition disabled:opacity-60"
                        style={{
                            background:
                                "linear-gradient(135deg, #f8d47b 0%, #d6a546 100%)",
                        }}
                    >
                        {installing ? "Instalando..." : "Instalar ahora"}
                    </button>
                ) : (
                    <div className="mt-5 flex items-start gap-3 text-left text-sm text-stone-200">
                        <MenuIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                        <span>
                            Abrí el menú de tu navegador y elegí{" "}
                            <span className="font-semibold text-amber-100">
                                Instalar aplicación
                            </span>{" "}
                            o{" "}
                            <span className="font-semibold text-amber-100">
                                Agregar a pantalla de inicio
                            </span>
                            .
                        </span>
                    </div>
                )}

                <button
                    type="button"
                    onClick={onCancel}
                    className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300 transition hover:bg-white/10"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}
