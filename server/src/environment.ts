export {};

// Sistema de clima / estación / día-noche.
// - Estación y hora del día son GLOBALES y salen del reloj real del server
//   (hemisferio sur, ver getSeason/getDayPhase).
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

const WEATHER_CHANGE_CHANCE = 0.05;

// zona -> clima actual de esa región.
const regionWeather = new Map<string, WeatherId>();

function getSeason(date: Date): SeasonId {
    const month = date.getMonth();

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
    const hour = date.getHours();

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

    return regionWeather.get(zone) ?? WEATHER.despejado;
}

function getTemperatureC(season: SeasonId, dayPhase: DayPhaseId): number {
    return SEASON_BASE_TEMP_C[season] + DAY_PHASE_TEMP_DELTA_C[dayPhase];
}

export function getEnvironmentForMap(mapId: number, now: Date = new Date()) {
    const season = getSeason(now);
    const dayPhase = getDayPhase(now);
    const zone = getZoneForMap(mapId);

    return {
        mapId,
        season,
        dayPhase,
        weather: getWeatherForZone(zone),
        temperatureC: getTemperatureC(season, dayPhase),
    };
}

// Se llama periódicamente desde server.ts. Hace avanzar el clima por región;
// estación y hora del día no necesitan estado propio, salen del reloj.
export function tickEnvironment(now: Date = new Date()): void {
    tickRegionWeather(getSeason(now));
}

module.exports = {
    SEASON,
    DAY_PHASE,
    WEATHER,
    getEnvironmentForMap,
    tickEnvironment,
};
