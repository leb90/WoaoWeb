// Los volúmenes del juego por tipo de sonido, cada uno de 0 a 1 (Configuración, en el juego):
// - musica: los temas de las mazmorras (lib/dungeonMusic.ts);
// - ambiente: el clima (lluvia, tormenta, nieve, niebla y truenos, lib/weatherAmbience.ts);
// - efectos: hechizos, golpes y todo lo demás que suena en el mapa (lib/sound.ts);
// - pisadas: los pasos de todos los personajes y criaturas.

export type SoundCategory = "musica" | "ambiente" | "efectos" | "pisadas";
export type SoundVolumes = Record<SoundCategory, number>;

export const DEFAULT_SOUND_VOLUMES: SoundVolumes = {
    musica: 0.1,
    ambiente: 0.5,
    efectos: 1,
    pisadas: 1,
};

export const SOUND_VOLUMES_STORAGE_KEY = "ao-play-sound-volumes";
// El volumen único de antes: si alguien lo había bajado (o silenciado), los nuevos arrancan en esa proporción.
const LEGACY_SOUND_VOLUME_STORAGE_KEY = "ao-play-sound-volume";

function clampVolume(value: unknown, fallback: number): number {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : fallback;
}

export function loadSoundVolumes(): SoundVolumes {
    try {
        const stored = window.localStorage.getItem(SOUND_VOLUMES_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as Partial<SoundVolumes>;
            return {
                musica: clampVolume(parsed.musica, DEFAULT_SOUND_VOLUMES.musica),
                ambiente: clampVolume(parsed.ambiente, DEFAULT_SOUND_VOLUMES.ambiente),
                efectos: clampVolume(parsed.efectos, DEFAULT_SOUND_VOLUMES.efectos),
                pisadas: clampVolume(parsed.pisadas, DEFAULT_SOUND_VOLUMES.pisadas),
            };
        }

        const legacy = window.localStorage.getItem(LEGACY_SOUND_VOLUME_STORAGE_KEY);
        if (legacy != null) {
            const factor = clampVolume(Number.parseFloat(legacy), 1);
            return {
                musica: DEFAULT_SOUND_VOLUMES.musica * factor,
                ambiente: DEFAULT_SOUND_VOLUMES.ambiente * factor,
                efectos: DEFAULT_SOUND_VOLUMES.efectos * factor,
                pisadas: DEFAULT_SOUND_VOLUMES.pisadas * factor,
            };
        }
    } catch {
        // Sin almacenamiento (modo privado, pruebas): los valores por defecto.
    }

    return { ...DEFAULT_SOUND_VOLUMES };
}

export function saveSoundVolumes(volumes: SoundVolumes): void {
    try {
        window.localStorage.setItem(SOUND_VOLUMES_STORAGE_KEY, JSON.stringify(volumes));
    } catch {
        // Ignore storage failures in restricted/browser test contexts.
    }
}
