export {};

// Sistema de clima / estación / día-noche.
// - Estación y hora del día son GLOBALES y salen del reloj real, en la hora de
//   Argentina (hemisferio sur, ver getSeason/getDayPhase), como en el server
//   viejo: el VPS corre en UTC y sin esto la noche llegaba 3 horas antes.
// - El clima (lluvia/tormenta/nieve/niebla) es POR REGIÓN: se agrupa por el
//   campo `zona` que ya traen los mapas (server/src/loadMaps.ts), así que
//   mapas del mismo bioma comparten clima en vez de tener 300 climas sueltos.
// - Los mapas interiores (mazmorras, minas, casas, instancias) no tienen
//   clima nunca, aunque sí "sienten" la temperatura de la estación.
// - El clima cambia de a poco (baja probabilidad por tick) para que se
//   sostenga en el tiempo en vez de parpadear mientras caminás.

const vars = require("./vars");

const SEASON = {
    verano: 0,
    otono: 1,
    invierno: 2,
    primavera: 3,
} as const;

const DAY_PHASE = {
    manana: 0,
    mediodia: 1,
    tarde: 2,
    noche: 3,
} as const;

const WEATHER = {
    despejado: 0,
    lluvia: 1,
    tormenta: 2,
    nieve: 3,
    niebla: 4,
} as const;

type SeasonId = (typeof SEASON)[keyof typeof SEASON];
type DayPhaseId = (typeof DAY_PHASE)[keyof typeof DAY_PHASE];
type WeatherId = (typeof WEATHER)[keyof typeof WEATHER];

// Zonas al aire libre que reciben clima. Todo lo que no está acá (mazmorras,
// minas, casas, torneos, eventos, clanes, "") queda siempre despejado.
const EXTERIOR_ZONES = new Set([
    "BOSQUE",
    "MAR",
    "CAMPO",
    "CIUDAD",
    "ISLA",
    "DESIERTO",
    "BOSQUE TERROR",
    "ALDEA",
    "CASTILLO",
]);

const WEATHER_WEIGHTS_BY_SEASON: Record<SeasonId, Partial<Record<WeatherId, number>>> = {
    [SEASON.verano]: { [WEATHER.despejado]: 55, [WEATHER.lluvia]: 15, [WEATHER.tormenta]: 20, [WEATHER.niebla]: 10 },
    [SEASON.otono]: {
        [WEATHER.despejado]: 45,
        [WEATHER.lluvia]: 25,
        [WEATHER.tormenta]: 10,
        [WEATHER.nieve]: 5,
        [WEATHER.niebla]: 15,
    },
    [SEASON.invierno]: {
        [WEATHER.despejado]: 40,
        [WEATHER.lluvia]: 15,
        [WEATHER.tormenta]: 5,
        [WEATHER.nieve]: 30,
        [WEATHER.niebla]: 10,
    },
    [SEASON.primavera]: { [WEATHER.despejado]: 50, [WEATHER.lluvia]: 25, [WEATHER.tormenta]: 10, [WEATHER.niebla]: 15 },
};

// El desierto no recibe lluvia/nieve nunca, sea cual sea la estación.
const DESERT_WEATHER_WEIGHTS: Partial<Record<WeatherId, number>> = {
    [WEATHER.despejado]: 80,
    [WEATHER.tormenta]: 15,
    [WEATHER.niebla]: 5,
};

const SEASON_BASE_TEMP_C: Record<SeasonId, number> = {
    [SEASON.verano]: 28,
    [SEASON.otono]: 18,
    [SEASON.invierno]: 8,
    [SEASON.primavera]: 20,
};

const DAY_PHASE_TEMP_DELTA_C: Record<DayPhaseId, number> = {
    [DAY_PHASE.manana]: -2,
    [DAY_PHASE.mediodia]: 3,
    [DAY_PHASE.tarde]: 0,
    [DAY_PHASE.noche]: -5,
};

// Los mapas de nieve (Polo, bosques nevados y sus cuevas) son mucho más fríos que el resto, y la nieve o la lluvia
// enfrían un poco más. Así el frío bajo cero (game.ts, tickSurvivalVitals) solo aparece en la nieve o en una noche
// de invierno nevando.
const SNOW_TERRAIN_TEMP_DELTA_C = -18;
const WEATHER_TEMP_DELTA_C: Partial<Record<WeatherId, number>> = {
    [WEATHER.lluvia]: -2,
    [WEATHER.tormenta]: -2,
    [WEATHER.nieve]: -4,
};

const WEATHER_CHANGE_CHANCE = 0.05;

// zona -> clima actual de esa región.
const regionWeather = new Map<string, WeatherId>();

const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires";
const argentinaClock = new Intl.DateTimeFormat("en-US", {
    timeZone: ARGENTINA_TIMEZONE,
    hour12: false,
    month: "numeric",
    hour: "numeric",
});

// Mes (0-11) y hora (0-23) en Argentina.
function getArgentinaClock(date: Date): { month: number; hour: number } {
    const parts = argentinaClock.formatToParts(date);
    const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? NaN);
    const month = value("month") - 1;
    // Algunos motores devuelven "24" para la medianoche.
    const hour = value("hour") % 24;

    if (!Number.isFinite(month) || !Number.isFinite(hour)) {
        // Argentina es UTC-3 sin horario de verano.
        const shifted = new Date(date.getTime() - 3 * 60 * 60 * 1000);
        return { month: shifted.getUTCMonth(), hour: shifted.getUTCHours() };
    }

    return { month, hour };
}

// Lo que fija un GM con /clima, /estacion y /momento (null = automático).
const overrides: { season: SeasonId | null; dayPhase: DayPhaseId | null; weather: WeatherId | null } = {
    season: null,
    dayPhase: null,
    weather: null,
};

function getSeason(date: Date): SeasonId {
    if (overrides.season !== null) {
        return overrides.season;
    }

    const { month } = getArgentinaClock(date);

    if (month === 11 || month === 0 || month === 1) {
        return SEASON.verano;
    }

    if (month >= 2 && month <= 4) {
        return SEASON.otono;
    }

    if (month >= 5 && month <= 7) {
        return SEASON.invierno;
    }

    return SEASON.primavera;
}

function getDayPhase(date: Date): DayPhaseId {
    if (overrides.dayPhase !== null) {
        return overrides.dayPhase;
    }

    const { hour } = getArgentinaClock(date);

    if (hour >= 6 && hour < 12) {
        return DAY_PHASE.manana;
    }

    if (hour >= 12 && hour < 15) {
        return DAY_PHASE.mediodia;
    }

    if (hour >= 15 && hour < 20) {
        return DAY_PHASE.tarde;
    }

    return DAY_PHASE.noche;
}

function pickWeightedWeather(weights: Partial<Record<WeatherId, number>>): WeatherId {
    const entries = Object.entries(weights) as Array<[string, number]>;
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Math.random() * total;

    for (const [weatherId, weight] of entries) {
        roll -= weight;
        if (roll <= 0) {
            return Number(weatherId) as WeatherId;
        }
    }

    return WEATHER.despejado;
}

function getZoneForMap(mapId: number): string {
    return String(vars.mapData?.[mapId]?.zona ?? "");
}

function isExteriorZone(zone: string): boolean {
    return EXTERIOR_ZONES.has(zone);
}

function tickRegionWeather(season: SeasonId): void {
    for (const zone of EXTERIOR_ZONES) {
        const current = regionWeather.get(zone);

        if (current !== undefined && Math.random() > WEATHER_CHANGE_CHANCE) {
            continue;
        }

        const weights = zone === "DESIERTO" ? DESERT_WEATHER_WEIGHTS : WEATHER_WEIGHTS_BY_SEASON[season];
        regionWeather.set(zone, pickWeightedWeather(weights));
    }
}

function getWeatherForZone(zone: string): WeatherId {
    if (!isExteriorZone(zone)) {
        return WEATHER.despejado;
    }

    if (overrides.weather !== null) {
        return overrides.weather;
    }

    return regionWeather.get(zone) ?? WEATHER.despejado;
}

function getTemperatureC(season: SeasonId, dayPhase: DayPhaseId, mapId: number, weather: WeatherId): number {
    const terreno = String(vars.mapData?.[mapId]?.terreno ?? "").trim().toUpperCase();
    const terrainDelta = terreno === "NIEVE" ? SNOW_TERRAIN_TEMP_DELTA_C : 0;

    return SEASON_BASE_TEMP_C[season] + DAY_PHASE_TEMP_DELTA_C[dayPhase] + terrainDelta + (WEATHER_TEMP_DELTA_C[weather] ?? 0);
}

// La temperatura que siente un personaje en ese mapa (la misma que muestra el HUD).
export function getTemperatureForMap(mapId: number, now: Date = new Date()): number {
    return getTemperatureC(getSeason(now), getDayPhase(now), mapId, getWeatherForZone(getZoneForMap(mapId)));
}

// La música de cada mapa (el cliente la busca en frontend/lib/worldMusic.ts): las ciudades tienen su canción y el
// resto suena según el tipo de lugar, con dos temas cada uno. Las mazmorras de la serie tienen su propia música
// (dungeons.json) y el cliente le da prioridad. Torneos, arenas, salas de clan, eventos y mapas de GM: sin música.
// Las ciudades se reconocen por la música que tenían en el AO original (musicNum del mapa): así también suenan sus
// afueras, que están marcadas como ciudad (los bosques de Ciudad Caos, el puerto de Banderbill, etc.).
const CITY_MUSIC_BY_ORIGINAL_MUSIC: Record<number, string> = {
    4: "ullathorpe",
    5: "nix",
    11: "banderbill",
    12: "banderbill",
    13: "lindos",
    16: "lindos",
    53: "caos",
    54: "caos",
};

export function getMusicForMap(mapId: number): string {
    const data = vars.mapData?.[mapId] ?? {};
    const zona = String(data.zona ?? "").trim().toUpperCase();
    const terreno = String(data.terreno ?? "").trim().toUpperCase();
    const name = String(data.name ?? "").trim().toLowerCase();

    if (zona === "CIUDAD") {
        const city = CITY_MUSIC_BY_ORIGINAL_MUSIC[Number(data.musicNum ?? 0)];
        if (city) return `ciudad:${city}`;
        if (name.includes("mar")) return "mar";
        if (name.includes("sotano")) return "cueva";
        return "";
    }

    if (zona === "BOSQUE TERROR" || name.includes("terror")) return "terror";
    if (terreno === "NIEVE") return zona === "DUNGEON" ? "cueva" : "nieve";
    if (zona === "DUNGEON" || zona === "MINA") return "cueva";
    if (zona === "DESIERTO" || terreno === "DESIERTO") return "desierto";
    if (zona === "MAR" || zona === "ISLA") return "mar";
    if (zona === "BOSQUE" || (zona === "CAMPO" && terreno === "BOSQUE") || (!zona && name.startsWith("bosque"))) return "bosque";
    if (zona === "CAMPO") return "campo";
    if (zona === "ALDEA") return "aldea";
    if (zona === "CASTILLO" || zona === "CONQUISTA") return "castillo";
    return "";
}

export function getEnvironmentForMap(mapId: number, now: Date = new Date()) {
    const season = getSeason(now);
    const dayPhase = getDayPhase(now);
    const weather = getWeatherForZone(getZoneForMap(mapId));

    return {
        mapId,
        season,
        dayPhase,
        weather,
        temperatureC: getTemperatureC(season, dayPhase, mapId, weather),
        music: getMusicForMap(mapId),
    };
}

// Se llama periódicamente desde server.ts. Hace avanzar el clima por región;
// estación y hora del día no necesitan estado propio, salen del reloj.
export function tickEnvironment(now: Date = new Date()): void {
    tickRegionWeather(getSeason(now));
}

export function setWeatherOverride(weather: WeatherId | null): void {
    overrides.weather = weather;
}

export function setSeasonOverride(season: SeasonId | null): void {
    overrides.season = season;
}

export function setDayPhaseOverride(dayPhase: DayPhaseId | null): void {
    overrides.dayPhase = dayPhase;
}

export function resetOverrides(): void {
    overrides.weather = null;
    overrides.season = null;
    overrides.dayPhase = null;
}

module.exports = {
    SEASON,
    DAY_PHASE,
    WEATHER,
    getEnvironmentForMap,
    getMusicForMap,
    getTemperatureForMap,
    tickEnvironment,
    setWeatherOverride,
    setSeasonOverride,
    setDayPhaseOverride,
    resetOverrides,
};
