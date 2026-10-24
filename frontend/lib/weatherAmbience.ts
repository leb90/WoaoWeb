import { Howl } from "howler";
import { WEATHER } from "./aowProtocol";

// Sonido de ambiente del clima (lluvia, tormenta, nieve, niebla) en bucle mientras dura, con fundido al cambiar,
// y truenos que suenan con cada relámpago de la tormenta (rendering/weatherFx.ts). Los mapas interiores nunca
// tienen clima (lo decide el server); bajo un techo dentro de un mapa exterior la lluvia suena apagada.
// Archivos en public/sounds/clima (ver docs/CREDITOS_SONIDOS.md).

const BASE_PATH = "/sounds/clima";
const LOOP_FADE_IN_MS = 2000;
const LOOP_FADE_OUT_MS = 1500;
const INDOOR_FADE_MS = 600;
// Volumen de cada bucle respecto del volumen general del juego.
const LOOP_VOLUME: Record<AmbienceLoop, number> = {
    lluvia: 0.6,
    tormenta: 0.8,
    nieve: 0.5,
    niebla: 0.35,
    techo: 0.6,
};
const INDOOR_VOLUME_FACTOR = 0.35;
const THUNDER_VOLUME_MIN = 0.6;
const THUNDER_VOLUME_MAX = 1;
const THUNDER_INDOOR_FACTOR = 0.45;
// El trueno llega un poco después del relámpago, como en la realidad.
const THUNDER_DELAY_MIN_MS = 250;
const THUNDER_DELAY_MAX_MS = 1600;

type AmbienceLoop = "lluvia" | "tormenta" | "nieve" | "niebla" | "techo";

export const WEATHER_AMBIENCE_FILES: Record<AmbienceLoop, string | null> = {
    lluvia: "clima-lluvia",
    tormenta: "clima-tormenta",
    nieve: "clima-nieve",
    niebla: "clima-niebla",
    techo: "clima-lluvia-techo",
};

// Los cercanos (1 a 3) suenan menos seguido que los lejanos (4 y 5).
export const WEATHER_THUNDER_FILES: Array<{ file: string; weight: number }> = [
    { file: "clima-trueno-1", weight: 1 },
    { file: "clima-trueno-2", weight: 1 },
    { file: "clima-trueno-3", weight: 1 },
    { file: "clima-trueno-4", weight: 2 },
    { file: "clima-trueno-5", weight: 2 },
];

// Web Audio (no HTML5) para que los bucles no dejen hueco al repetirse. Los bucles arrancan en 0 y suben con fundido.
function createHowl(name: string, loop: boolean, volume = 0) {
    return new Howl({
        src: [`${BASE_PATH}/${name}.ogg`, `${BASE_PATH}/${name}.mp3`],
        loop,
        volume,
        html5: false,
        preload: true,
    });
}

export class WeatherAmbience {
    private readonly loops = new Map<AmbienceLoop, Howl>();
    private readonly thunders: Howl[] = [];
    private current: AmbienceLoop | null = null;
    private indoor = false;
    private masterVolume = 1;
    private destroyed = false;
    private readonly pendingTimers = new Set<number>();

    private getLoop(kind: AmbienceLoop) {
        const file = WEATHER_AMBIENCE_FILES[kind];
        if (!file) return null;
        let howl = this.loops.get(kind);
        if (!howl) {
            howl = createHowl(file, true);
            this.loops.set(kind, howl);
        }
        return howl;
    }

    private targetVolume(kind: AmbienceLoop) {
        // El bucle "techo" ya suena apagado; los demás bajan bajo techo.
        const indoorFactor = this.indoor && kind !== "techo" ? INDOOR_VOLUME_FACTOR : 1;
        return LOOP_VOLUME[kind] * indoorFactor * this.masterVolume;
    }

    private pickLoop(weather: number): AmbienceLoop | null {
        if (weather === WEATHER.lluvia || weather === WEATHER.tormenta) {
            if (this.indoor && WEATHER_AMBIENCE_FILES.techo) return "techo";
            return weather === WEATHER.tormenta ? "tormenta" : "lluvia";
        }
        if (weather === WEATHER.nieve) return "nieve";
        if (weather === WEATHER.niebla) return WEATHER_AMBIENCE_FILES.niebla ? "niebla" : null;
        return null;
    }

    /** Se llama seguido (cada medio segundo); solo hace algo cuando cambia el clima, el techo o el volumen. */
    update(weather: number | undefined, indoor: boolean) {
        if (this.destroyed) return;
        const indoorChanged = indoor !== this.indoor;
        this.indoor = indoor;
        const next = this.pickLoop(Number(weather ?? WEATHER.despejado));

        if (next !== this.current) {
            if (this.current) this.fadeOutAndStop(this.current);
            this.current = next;
            if (next) this.fadeIn(next);
            // Que el primer trueno no llegue tarde por estar cargándose.
            if (Number(weather) === WEATHER.tormenta) this.loadThunders();
            return;
        }

        if (indoorChanged && this.current) {
            const howl = this.getLoop(this.current);
            howl?.fade(howl.volume(), this.targetVolume(this.current), INDOOR_FADE_MS);
        }
    }

    private fadeIn(kind: AmbienceLoop) {
        const howl = this.getLoop(kind);
        if (!howl) return;
        if (!howl.playing()) howl.play();
        howl.fade(howl.volume(), this.targetVolume(kind), LOOP_FADE_IN_MS);
    }

    private fadeOutAndStop(kind: AmbienceLoop) {
        const howl = this.loops.get(kind);
        if (!howl) return;
        howl.fade(howl.volume(), 0, LOOP_FADE_OUT_MS);
        const timer = window.setTimeout(() => {
            this.pendingTimers.delete(timer);
            if (this.current !== kind) howl.stop();
        }, LOOP_FADE_OUT_MS + 50);
        this.pendingTimers.add(timer);
    }

    private loadThunders() {
        if (this.thunders.length) return;
        for (const { file } of WEATHER_THUNDER_FILES) this.thunders.push(createHowl(file, false, 1));
    }

    private pickThunder() {
        const total = WEATHER_THUNDER_FILES.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = Math.random() * total;
        for (let index = 0; index < WEATHER_THUNDER_FILES.length; index++) {
            roll -= WEATHER_THUNDER_FILES[index].weight;
            if (roll <= 0) return this.thunders[index];
        }
        return this.thunders[this.thunders.length - 1];
    }

    /** Un relámpago de la tormenta: el trueno suena un instante después. */
    thunder() {
        if (this.destroyed || this.masterVolume <= 0) return;
        this.loadThunders();
        const howl = this.pickThunder();
        const delay = THUNDER_DELAY_MIN_MS + Math.random() * (THUNDER_DELAY_MAX_MS - THUNDER_DELAY_MIN_MS);
        const volume = THUNDER_VOLUME_MIN + Math.random() * (THUNDER_VOLUME_MAX - THUNDER_VOLUME_MIN);
        const timer = window.setTimeout(() => {
            this.pendingTimers.delete(timer);
            if (this.destroyed) return;
            const id = howl.play();
            howl.volume(volume * (this.indoor ? THUNDER_INDOOR_FACTOR : 1) * this.masterVolume, id);
        }, delay);
        this.pendingTimers.add(timer);
    }

    setMasterVolume(volume: number) {
        this.masterVolume = Math.max(0, Math.min(1, Number(volume) || 0));
        if (this.current) this.getLoop(this.current)?.volume(this.targetVolume(this.current));
    }

    destroy() {
        this.destroyed = true;
        for (const timer of this.pendingTimers) window.clearTimeout(timer);
        this.pendingTimers.clear();
        for (const howl of [...this.loops.values(), ...this.thunders]) howl.unload();
        this.loops.clear();
        this.thunders.length = 0;
        this.current = null;
    }
}
