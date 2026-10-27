import { Howl } from "howler";

// Música de las mazmorras (server/jsons/dungeons.json, "musica"): tres temas que suenan uno detrás del otro y vuelven
// a empezar, y el de combate mientras dura la pelea con un jefe o un minijefe (vuelve al siguiente tema al terminar).
// No tiene un botón propio para silenciarla: sigue al volumen general del juego. Archivos en public/music/mazmorras
// (ver docs/CREDITOS_SONIDOS.md).

const FADE_MS = 1500;
// Volumen de la música respecto del volumen general (los efectos tienen que seguir oyéndose).
const MUSIC_LEVEL = 0.45;

export type DungeonMusicSpec = { pistas: string[]; combate?: string } | null | undefined;

export class DungeonMusic {
    private pistas: string[] = [];
    private combate: string | null = null;
    private index = 0;
    private current: Howl | null = null;
    private mode: "exploracion" | "combate" | null = null;
    private masterVolume = 1;

    /** Se llama cada vez que cambia el estado de la mazmorra (y con la música nula, al salir). */
    update(musica: DungeonMusicSpec, enCombate: boolean) {
        const pistas = musica?.pistas ?? [];
        if (!pistas.length) {
            this.stop();
            this.pistas = [];
            return;
        }
        if (pistas.join("|") !== this.pistas.join("|")) {
            // Otra mazmorra: arranca desde el primer tema.
            this.stop();
            this.pistas = pistas;
            this.index = 0;
        }
        this.combate = musica?.combate ?? null;
        const mode = enCombate && this.combate ? "combate" : "exploracion";
        if (mode === this.mode && this.current) return;
        if (this.mode === "combate" && mode === "exploracion") this.index = (this.index + 1) % this.pistas.length;
        this.mode = mode;
        this.play(mode === "combate" ? this.combate! : this.pistas[this.index], mode === "combate");
    }

    setMasterVolume(volume: number) {
        this.masterVolume = Math.max(0, Math.min(1, Number(volume) || 0));
        this.current?.volume(this.targetVolume());
    }

    stop() {
        this.fadeOut(this.current);
        this.current = null;
        this.mode = null;
    }

    private targetVolume() {
        return MUSIC_LEVEL * this.masterVolume;
    }

    private fadeOut(howl: Howl | null) {
        if (!howl) return;
        howl.off("end");
        howl.fade(howl.volume(), 0, FADE_MS);
        window.setTimeout(() => howl.unload(), FADE_MS + 100);
    }

    // HTML5 (streaming): los temas son largos y no hace falta que empalmen sin hueco.
    private play(src: string, loop: boolean) {
        this.fadeOut(this.current);
        const howl = new Howl({ src: [src], html5: true, loop, volume: 0 });
        this.current = howl;
        howl.once("play", () => howl.fade(0, this.targetVolume(), FADE_MS));
        if (!loop) {
            howl.on("end", () => {
                if (this.current !== howl || this.mode !== "exploracion") return;
                this.index = (this.index + 1) % this.pistas.length;
                this.play(this.pistas[this.index], false);
            });
        }
        howl.play();
    }
}
