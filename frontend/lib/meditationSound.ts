import { Howler } from "howler";

// "Ki sereno" mientras el propio personaje medita: un aire que respira con un acorde grave y cálido muy bajito por
// debajo, como energía que se va juntando. Al empezar suena el arranque (el aire que se levanta, 3 s) y sigue el
// bucle; al terminar se apaga despacio. Lo prende y lo apaga el efecto de meditación que manda el server
// (server/src/game.ts, getMeditationFx). Va con el volumen de efectos de Configuración. Archivo en
// public/sounds/meditacion (ver docs/CREDITOS_SONIDOS.md).
//
// El archivo trae el arranque (0-3 s), un ciclo de respiración (3-9 s) y 2 s más del ciclo siguiente. Se repite del
// segundo 10 al 4, que caen en la misma fase de la respiración y lejos de los bordes, donde OGG y MP3 deforman las
// muestras: así no hay tic en la vuelta ni en el paso del arranque al bucle, aunque el navegador le sume silencio al
// principio. Va por Web Audio directo (sobre la salida de Howler, así respeta el volumen general) porque un Howl no
// deja repetir solo un tramo del archivo.
const SOUND_URL = "/sounds/meditacion/meditacion-ki-sereno";

// Efectos de meditación del server, por nivel y facción (getMeditationFx). Ningún hechizo usa estos números.
const MEDITATION_FX = new Set([18, 21, 69, 70, 130, 131, 135, 136, 137, 138, 139, 140, 142, 143]);

// El tramo que se repite: un ciclo de respiración entero, empezando 1 s después del arranque.
const LOOP_START_SECONDS = 4;
const LOOP_SECONDS = 6;

// Volumen respecto del volumen de efectos (los archivos ya están a −26 LUFS, más bajos que el clima).
const VOLUME = 0.5;
// Si vuelve a meditar mientras se apagaba, sube de nuevo desde donde estaba.
const RESUME_MS = 1500;
// Al terminar se apaga despacio: baja en curva (como se apaga un sonido real) y a los 5 s ya no se oye.
const FADE_OUT_MS = 5000;

export const isMeditationFx = (fx: number) => MEDITATION_FX.has(Number(fx));

function getAudioContext(): AudioContext | null {
    return Howler.usingWebAudio && Howler.ctx ? Howler.ctx : null;
}

async function loadBuffer(ctx: AudioContext): Promise<AudioBuffer> {
    const ext = Howler.codecs("ogg") ? "ogg" : "mp3";
    const response = await fetch(`${SOUND_URL}.${ext}`);
    if (!response.ok) throw new Error(`No se pudo cargar ${SOUND_URL}.${ext}`);
    return ctx.decodeAudioData(await response.arrayBuffer());
}

export class MeditationSound {
    private buffer: Promise<AudioBuffer | null> | null = null;
    private gain: GainNode | null = null;
    private source: AudioBufferSourceNode | null = null;
    private playing = false;
    private volume = 1;
    private stopTimer: number | null = null;
    // Cada start/stop la sube: un arranque que terminó de cargar tarde no suena si ya dejó de meditar.
    private generation = 0;

    private load(ctx: AudioContext) {
        this.buffer ??= loadBuffer(ctx).catch(() => {
            // Se reintenta la próxima vez que medite.
            this.buffer = null;
            return null;
        });
        return this.buffer;
    }

    private clearStopTimer() {
        if (this.stopTimer !== null) {
            window.clearTimeout(this.stopTimer);
            this.stopTimer = null;
        }
    }

    private play(ctx: AudioContext, buffer: AudioBuffer) {
        const gain = ctx.createGain();
        gain.gain.value = VOLUME * this.volume;
        gain.connect(Howler.masterGain ?? ctx.destination);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopStart = LOOP_START_SECONDS;
        source.loopEnd = LOOP_START_SECONDS + LOOP_SECONDS;
        source.connect(gain);
        source.start();

        this.gain = gain;
        this.source = source;
    }

    private release() {
        try {
            this.source?.stop();
        } catch {
            // Ya estaba parada.
        }
        this.source?.disconnect();
        this.source = null;
        this.gain?.disconnect();
        this.gain = null;
    }

    start() {
        if (this.playing) return;
        this.playing = true;
        this.clearStopTimer();
        const ctx = getAudioContext();
        if (!ctx) return;
        if (ctx.state === "suspended") void ctx.resume().catch(() => {});

        // Si todavía se estaba apagando, vuelve a subir sin repetir el arranque.
        if (this.gain && this.source) {
            const now = ctx.currentTime;
            this.gain.gain.cancelScheduledValues(now);
            this.gain.gain.setValueAtTime(this.gain.gain.value, now);
            this.gain.gain.linearRampToValueAtTime(VOLUME * this.volume, now + RESUME_MS / 1000);
            return;
        }

        const generation = ++this.generation;
        void this.load(ctx).then((buffer) => {
            if (buffer && this.playing && generation === this.generation) this.play(ctx, buffer);
        });
    }

    stop() {
        if (!this.playing) return;
        this.playing = false;
        this.generation++;
        const gain = this.gain;
        if (!gain) return;
        const now = gain.context.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.setTargetAtTime(0, now, FADE_OUT_MS / 5 / 1000);
        this.clearStopTimer();
        this.stopTimer = window.setTimeout(() => {
            this.stopTimer = null;
            if (!this.playing) this.release();
        }, FADE_OUT_MS + 100);
    }

    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, Number(volume) || 0));
        if (!this.playing || !this.gain) return;
        const now = this.gain.context.currentTime;
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        this.gain.gain.linearRampToValueAtTime(VOLUME * this.volume, now + 0.1);
    }

    destroy() {
        this.playing = false;
        this.generation++;
        this.clearStopTimer();
        this.release();
        this.buffer = null;
    }
}
