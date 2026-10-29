"use client";

import React from "react";
import { MusicPlaylist, WORLD_MUSIC } from "../lib/worldMusic";

/** La música del lugar donde está el personaje (lib/worldMusic.ts). Con null no suena nada. */
export default function WorldMusicPlayer({ musicKey, volume }: { musicKey: string | null | undefined; volume: number }) {
    const playlistRef = React.useRef<MusicPlaylist | null>(null);

    React.useEffect(() => {
        playlistRef.current ??= new MusicPlaylist();
        const key = musicKey && WORLD_MUSIC[musicKey] ? musicKey : null;
        playlistRef.current.play(key, key ? WORLD_MUSIC[key] : null);
    }, [musicKey]);

    React.useEffect(() => {
        playlistRef.current?.setVolume(volume);
    }, [volume]);

    React.useEffect(() => () => playlistRef.current?.stop(), []);

    return null;
}
