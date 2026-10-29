import { Howl } from "howler";

// Música del mundo, al estilo de Skyrim: cada ciudad tiene su canción y cada tipo de lugar dos temas que se turnan,
// con un silencio entre uno y otro. La música que le toca a cada mapa la decide el server
// (server/src/environment.ts, getMusicForMap) y llega con el clima. Las mazmorras de la serie tienen la suya
// (lib/dungeonMusic.ts) y tienen prioridad. Archivos en public/music/mundo y public/music/menu
// (ver docs/CREDITOS_SONIDOS.md).

const FADE_IN_MS = 2500;
const FADE_OUT_MS = 2000;
// El silencio entre un tema y el siguiente (como en Skyrim, la música no suena todo el tiempo).
const REST_MIN_MS = 30_000;
const REST_MAX_MS = 75_000;
// Al llegar a un lugar nuevo, un respiro corto antes del primer tema.
const ARRIVAL_DELAY_MS = 1_500;

const WORLD = "/music/mundo";

export const WORLD_MUSIC: Record<string, string[]> = {
    "ciudad:ullathorpe": [`${WORLD}/ciudades/ullathorpe.mp3`],
    "ciudad:nix": [`${WORLD}/ciudades/nix.mp3`],
    "ciudad:banderbill": [`${WORLD}/ciudades/banderbill.mp3`],
    "ciudad:lindos": [`${WORLD}/ciudades/lindos.mp3`],
    "ciudad:caos": [`${WORLD}/ciudades/caos.mp3`],
    bosque: [`${WORLD}/bosque/1.mp3`, `${WORLD}/bosque/2.mp3`],
    campo: [`${WORLD}/campo/1.mp3`, `${WORLD}/campo/2.mp3`],
    mar: [`${WORLD}/mar/1.mp3`, `${WORLD}/mar/2.mp3`],
    desierto: [`${WORLD}/desierto/1.mp3`, `${WORLD}/desierto/2.mp3`],
    nieve: [`${WORLD}/nieve/1.mp3`, `${WORLD}/nieve/2.mp3`],
    terror: [`${WORLD}/terror/1.mp3`, `${WORLD}/terror/2.mp3`],
    cueva: [`${WORLD}/cueva/1.mp3`, `${WORLD}/cueva/2.mp3`],
    castillo: [`${WORLD}/castillo/1.mp3`, `${WORLD}/castillo/2.mp3`],
    aldea: [`${WORLD}/aldea/1.mp3`, `${WORLD}/aldea/2.mp3`],
};

export const MENU_MUSIC = {
    // El inicio, la cuenta y la lista de personajes.
    inicio: "/music/menu/inicio.mp3",
    // La creación de personaje (una tienda de Zelda).
    creacion: "/music/menu/creacion.mp3",
};

type PlaylistOptions = {
    // Silencio entre temas; [0, 0] = sin descanso (la música del menú se repite sin cortes).
    restMs?: [number, number];
    startDelayMs?: number;
};

/** Toca una lista de temas uno detrás del otro, con un descanso entre ellos, y cambia de lista con fundidos. */
export class MusicPlaylist {
    private key: string | null = null;
    private tracks: string[] = [];
    private index = 0;
    private current: Howl | null = null;
    private timer: number | null = null;
    private volume = 0.3;
    private options: Required<PlaylistOptions> = { restMs: [REST_MIN_MS, REST_MAX_MS], startDelayMs: ARRIVAL_DELAY_MS };

    /** Cambia de lugar. Con la misma clave no hace nada (la música sigue donde iba). */
    play(key: string | null, tracks: string[] | null | undefined, options: PlaylistOptions = {}) {
        if (key === this.key) return;
        this.stop();
        this.key = key;
        this.tracks = tracks ?? [];
        this.options = {
            restMs: options.restMs ?? [REST_MIN_MS, REST_MAX_MS],
            startDelayMs: options.startDelayMs ?? ARRIVAL_DELAY_MS,
        };
        if (!key || this.tracks.length === 0) return;
        // Cada vez que se llega a un lugar arranca con un tema al azar.
        this.index = Math.floor(Math.random() * this.tracks.length);
        this.schedule(this.options.startDelayMs);
    }

    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, Number(volume) || 0));
        this.current?.volume(this.volume);
    }

    stop() {
        this.clearTimer();
        this.fadeOut(this.current);
        this.current = null;
        this.key = null;
    }

    private schedule(delayMs: number) {
        this.clearTimer();
        this.timer = window.setTimeout(() => {
            this.timer = null;
            this.playCurrent();
        }, delayMs);
    }

    private clearTimer() {
        if (this.timer !== null) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
    }

    private playCurrent() {
        const src = this.tracks[this.index];
        if (!src) return;
        const key = this.key;
        // HTML5 (streaming): los temas son largos y no hace falta que empalmen sin hueco.
        const howl = new Howl({ src: [src], html5: true, volume: 0 });
        this.current = howl;
        const next = () => {
            if (this.current !== howl || this.key !== key) return;
            howl.unload();
            this.current = null;
            this.index = (this.index + 1) % this.tracks.length;
            const [min, max] = this.options.restMs;
            this.schedule(min + Math.random() * Math.max(0, max - min));
        };
        howl.once("play", () => howl.fade(0, this.volume, FADE_IN_MS));
        howl.once("end", next);
        // Si un archivo no carga, se sigue con el próximo tema en vez de quedar en silencio.
        howl.once("loaderror", next);
        // El navegador todavía no deja sonar audio (no hubo un clic): se toca apenas lo permite.
        howl.once("playerror", () => howl.once("unlock", () => howl.play()));
        howl.play();
    }

    private fadeOut(howl: Howl | null) {
        if (!howl) return;
        howl.off("end");
        howl.off("loaderror");
        howl.off("playerror");
        howl.off("unlock");
        howl.fade(howl.volume(), 0, FADE_OUT_MS);
        window.setTimeout(() => howl.unload(), FADE_OUT_MS + 100);
    }
}
