"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { MENU_MUSIC, MusicPlaylist } from "../lib/worldMusic";

// La música de las páginas de afuera del juego: el inicio, la cuenta y la lista de personajes tienen un tema épico
// (al estilo Baldur's Gate 3) y la creación de personaje uno de tienda de Zelda. Las demás páginas (wiki, ranking…)
// no tienen música. Arranca con el primer clic o tecla (los navegadores no dejan sonar audio antes). Suena al 30%,
// aparte del volumen de música del juego (que arranca al 10%); el botón la silencia y se recuerda.

const MUTED_STORAGE_KEY = "ao-menu-music-muted";
const MENU_MUSIC_VOLUME = 0.3;
const HOME_ROUTES = new Set(["/", "/login", "/register", "/characters"]);

function musicForPath(pathname: string): "inicio" | "creacion" | null {
    if (pathname === "/createcharacter") return "creacion";
    return HOME_ROUTES.has(pathname) ? "inicio" : null;
}

export default function MenuMusic({ pathname }: { pathname: string }) {
    const playlistRef = React.useRef<MusicPlaylist | null>(null);
    const [muted, setMuted] = React.useState(false);
    const [unlocked, setUnlocked] = React.useState(false);
    const kind = musicForPath(pathname);

    React.useEffect(() => {
        try {
            setMuted(window.localStorage.getItem(MUTED_STORAGE_KEY) === "1");
        } catch {
            // Sin almacenamiento: con música.
        }
    }, []);

    // Recién con un gesto de la persona se puede reproducir.
    React.useEffect(() => {
        if (unlocked) return;
        const unlock = () => setUnlocked(true);
        const events = ["pointerdown", "keydown", "touchstart"] as const;
        events.forEach((name) => window.addEventListener(name, unlock, { once: true, passive: true }));
        return () => events.forEach((name) => window.removeEventListener(name, unlock));
    }, [unlocked]);

    React.useEffect(() => {
        playlistRef.current ??= new MusicPlaylist();
        const playlist = playlistRef.current;
        playlist.setVolume(MENU_MUSIC_VOLUME);
        if (!unlocked || muted || !kind) {
            playlist.play(null, null);
            return;
        }
        // La creación se repite sin cortes (como la tienda de Zelda); el inicio, con un respiro corto.
        playlist.play(kind, [MENU_MUSIC[kind]], {
            restMs: kind === "creacion" ? [0, 0] : [4_000, 8_000],
            startDelayMs: 300,
        });
    }, [kind, muted, unlocked]);

    React.useEffect(() => () => playlistRef.current?.stop(), []);

    if (!kind) {
        return null;
    }

    const Icon = muted ? VolumeX : Volume2;
    return (
        <button
            type="button"
            data-menu-music={muted ? "off" : "on"}
            onClick={() => {
                const next = !muted;
                setMuted(next);
                setUnlocked(true);
                try {
                    window.localStorage.setItem(MUTED_STORAGE_KEY, next ? "1" : "0");
                } catch {
                    // Ignorar fallas de almacenamiento.
                }
            }}
            className="inline-flex items-center justify-center rounded-full p-2 text-stone-400 transition hover:bg-amber-200/10 hover:text-amber-200"
            aria-label={muted ? "Activar la música" : "Silenciar la música"}
            title={muted ? "Activar la música" : "Silenciar la música"}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
}
