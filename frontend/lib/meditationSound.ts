import { Howl } from "howler";

// Viento suave mientras el propio personaje medita, como el aura que sube al juntar energía pero de aire: al empezar
// suena una ráfaga que crece y después queda el viento en bucle, con fundidos y bajito para que no moleste. Lo prende y
// lo apaga el efecto de meditación que manda el server (server/src/game.ts, getMeditationFx). Va con el volumen de
// efectos de Configuración. Archivos en public/sounds/meditacion (ver docs/CREDITOS_SONIDOS.md).
const BASE_PATH = "/sounds/meditacion";

// Efectos de meditación del server, por nivel y facción (getMeditationFx). Ningún hechizo usa estos números.
const MEDITATION_FX = new Set([18, 21, 69, 70, 130, 131, 135, 136, 137, 138, 139, 140, 142, 143]);

// Volumen respecto del volumen de efectos (los archivos ya están a −26 LUFS, más bajos que el clima).
const LOOP_VOLUME = 0.5;
const GUST_VOLUME = 0.6;
const FADE_IN_MS = 2500;
const FADE_OUT_MS = 1200;

export const isMeditationFx = (fx: number) => MEDITATION_FX.has(Number(fx));

// Web Audio (no HTML5) para que el bucle no deje hueco al repetirse.
function createHowl(name: string, loop: boolean) {
    return new Howl({
        src: [`${BASE_PATH}/${name}.ogg`, `${BASE_PATH}/${name}.mp3`],
        loop,
        volume: 0,
        html5: false,
        preload: true,
    });
}

export class MeditationSound {
    private loop: Howl | null = null;
    private gust: Howl | null = null;
    private playing = false;
    private volume = 1;
    private stopTimer: number | null = null;

    private ensureHowls() {
        this.loop ??= createHowl("meditacion-viento", true);
        this.gust ??= createHowl("meditacion-rafaga", false);
        return { loop: this.loop, gust: this.gust };
    }

    private clearStopTimer() {
        if (this.stopTimer !== null) {
            window.clearTimeout(this.stopTimer);
            this.stopTimer = null;
        }
    }

    start() {
        if (this.playing) return;
        this.playing = true;
        this.clearStopTimer();
        const { loop, gust } = this.ensureHowls();
        gust.stop();
        gust.volume(GUST_VOLUME * this.volume);
        gust.play();
        // Si todavía se estaba apagando, vuelve a subir desde donde estaba.
        if (!loop.playing()) {
            loop.volume(0);
            loop.play();
        }
        loop.fade(loop.volume(), LOOP_VOLUME * this.volume, FADE_IN_MS);
    }

    stop() {
        if (!this.playing) return;
        this.playing = false;
        const { loop, gust } = this.ensureHowls();
        loop.fade(loop.volume(), 0, FADE_OUT_MS);
        if (gust.playing()) gust.fade(gust.volume(), 0, FADE_OUT_MS);
        this.clearStopTimer();
        this.stopTimer = window.setTimeout(() => {
            this.stopTimer = null;
            if (!this.playing) {
                loop.stop();
                gust.stop();
            }
        }, FADE_OUT_MS + 50);
    }

    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, Number(volume) || 0));
        if (this.playing) this.loop?.volume(LOOP_VOLUME * this.volume);
    }

    destroy() {
        this.playing = false;
        this.clearStopTimer();
        this.loop?.unload();
        this.gust?.unload();
        this.loop = null;
        this.gust = null;
    }
}
