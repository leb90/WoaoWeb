import { Assets, Container, Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import { DAY_PHASE, WEATHER, type EnvironmentState } from "../../../lib/aowProtocol";
import type { Engine } from "../engine/Engine";

// Efectos visuales de clima/día-noche. Adaptados al renderer Pixi de este
// cliente (el cliente de referencia que inspiró este sistema dibuja todo con
// Canvas2D directo; acá se resuelve con Graphics/particles de Pixi). Las
// nubes de niebla reusan el mismo spritesheet y recorte que ya tenías
// funcionando en PixiBackgroundScene.js de tu otro cliente.

const RAIN_COUNT = 140;
const RAIN_COUNT_STORM = 220;
const SNOW_COUNT = 110;
const CLOUD_COUNT = 10;
const LIGHTNING_MIN_INTERVAL_MS = 4000;
const LIGHTNING_MAX_INTERVAL_MS = 12000;
const LIGHTNING_FLASH_MS = 140;

const CLOUD_IMAGE_PATH = "/imgs/weather/clouds.png";
const CLOUD_FRAMES = [
    { sx: 10, sy: 10, sw: 230, sh: 120 },
    { sx: 270, sy: 10, sw: 280, sh: 145 },
    { sx: 150, sy: 160, sw: 240, sh: 100 },
    { sx: 10, sy: 260, sw: 180, sh: 80 },
    { sx: 200, sy: 270, sw: 160, sh: 70 },
    { sx: 370, sy: 255, sw: 190, sh: 95 },
];

let cloudTexturesPromise: Promise<Texture[] | null> | null = null;

function loadCloudTextures(): Promise<Texture[] | null> {
    if (!cloudTexturesPromise) {
        cloudTexturesPromise = Assets.load(CLOUD_IMAGE_PATH)
            .then((baseTexture: Texture) =>
                CLOUD_FRAMES.map(
                    (frame) =>
                        new Texture({
                            source: baseTexture.source,
                            frame: new Rectangle(frame.sx, frame.sy, frame.sw, frame.sh),
                        }),
                ),
            )
            .catch(() => null);
    }

    return cloudTexturesPromise;
}

type Raindrop = { g: Graphics; speed: number };
type Snowflake = { g: Graphics; speed: number; swaySpeed: number; swayPhase: number };
type Cloud = { sprite: Sprite; speedX: number; driftSpeed: number; driftPhase: number; driftAmp: number };

type WeatherFxState = {
    rainLayer: Container;
    snowLayer: Container;
    fogLayer: Container;
    nightLayer: Graphics;
    lightningLayer: Graphics;
    raindrops: Raindrop[];
    snowflakes: Snowflake[];
    clouds: Cloud[];
    cloudTextures: Texture[] | null;
    nextLightningAt: number;
    lightningUntil: number;
    width: number;
    height: number;
};

const stateByEngine = new WeakMap<Engine, WeatherFxState>();

function randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function buildRaindrop(width: number, height: number): Raindrop {
    const length = randomBetween(10, 22);
    const g = new Graphics()
        .moveTo(0, 0)
        .lineTo(-length * 0.25, length)
        .stroke({ color: 0xaac8ff, width: 1.4, alpha: 0.55 });

    g.x = Math.random() * width;
    g.y = Math.random() * height;

    return { g, speed: randomBetween(9, 15) };
}

function buildSnowflake(width: number, height: number): Snowflake {
    const radius = randomBetween(1.4, 3.2);
    const g = new Graphics().circle(0, 0, radius).fill({ color: 0xffffff, alpha: randomBetween(0.6, 0.95) });

    g.x = Math.random() * width;
    g.y = Math.random() * height;

    return {
        g,
        speed: randomBetween(1.2, 2.6),
        swaySpeed: randomBetween(0.001, 0.003),
        swayPhase: Math.random() * Math.PI * 2,
    };
}

export function createWeatherOverlay(engine: Engine): Container {
    const container = new Container();
    container.eventMode = "none";

    const rainLayer = new Container();
    rainLayer.eventMode = "none";
    rainLayer.visible = false;

    const snowLayer = new Container();
    snowLayer.eventMode = "none";
    snowLayer.visible = false;

    const fogLayer = new Container();
    fogLayer.eventMode = "none";
    fogLayer.visible = false;

    const nightLayer = new Graphics();
    nightLayer.eventMode = "none";
    nightLayer.alpha = 0;

    const lightningLayer = new Graphics();
    lightningLayer.eventMode = "none";
    lightningLayer.alpha = 0;

    // Orden: lluvia/nieve/nubes de niebla por debajo de la oscuridad nocturna,
    // y el flash de rayo arriba de todo.
    container.addChild(rainLayer, snowLayer, fogLayer, nightLayer, lightningLayer);

    const now = Date.now();
    const state: WeatherFxState = {
        rainLayer,
        snowLayer,
        fogLayer,
        nightLayer,
        lightningLayer,
        raindrops: [],
        snowflakes: [],
        clouds: [],
        cloudTextures: null,
        nextLightningAt: now + randomBetween(LIGHTNING_MIN_INTERVAL_MS, LIGHTNING_MAX_INTERVAL_MS),
        lightningUntil: 0,
        width: 0,
        height: 0,
    };

    stateByEngine.set(engine, state);

    void loadCloudTextures().then((textures) => {
        state.cloudTextures = textures;
    });

    return container;
}

function resizeLayers(state: WeatherFxState, width: number, height: number): void {
    if (state.width === width && state.height === height) {
        return;
    }

    state.width = width;
    state.height = height;

    state.nightLayer.clear().rect(0, 0, width, height).fill({ color: 0x040420, alpha: 1 });
    state.lightningLayer.clear().rect(0, 0, width, height).fill({ color: 0xffffff, alpha: 1 });
}

function setRainCount(state: WeatherFxState, count: number, width: number, height: number): void {
    while (state.raindrops.length < count) {
        const drop = buildRaindrop(width, height);
        state.raindrops.push(drop);
        state.rainLayer.addChild(drop.g);
    }

    while (state.raindrops.length > count) {
        const drop = state.raindrops.pop();
        if (drop) {
            state.rainLayer.removeChild(drop.g);
            drop.g.destroy();
        }
    }
}

function setSnowCount(state: WeatherFxState, count: number, width: number, height: number): void {
    while (state.snowflakes.length < count) {
        const flake = buildSnowflake(width, height);
        state.snowflakes.push(flake);
        state.snowLayer.addChild(flake.g);
    }

    while (state.snowflakes.length > count) {
        const flake = state.snowflakes.pop();
        if (flake) {
            state.snowLayer.removeChild(flake.g);
            flake.g.destroy();
        }
    }
}

function updateRain(state: WeatherFxState, width: number, height: number, deltaMs: number, intense: boolean): void {
    setRainCount(state, intense ? RAIN_COUNT_STORM : RAIN_COUNT, width, height);

    const fallScale = deltaMs / 16.67;
    for (const drop of state.raindrops) {
        drop.g.y += drop.speed * fallScale;
        drop.g.x -= drop.speed * 0.25 * fallScale;

        if (drop.g.y > height + 20) {
            drop.g.y = -20;
            drop.g.x = Math.random() * width;
        }
        if (drop.g.x < -20) {
            drop.g.x = width + 20;
        }
    }
}

function updateSnow(state: WeatherFxState, width: number, height: number, deltaMs: number): void {
    setSnowCount(state, SNOW_COUNT, width, height);

    const fallScale = deltaMs / 16.67;
    for (const flake of state.snowflakes) {
        flake.g.y += flake.speed * fallScale;
        flake.swayPhase += flake.swaySpeed * deltaMs;
        flake.g.x += Math.sin(flake.swayPhase) * 0.4 * fallScale;

        if (flake.g.y > height + 10) {
            flake.g.y = -10;
            flake.g.x = Math.random() * width;
        }
    }
}

function buildCloud(textures: Texture[], width: number, height: number): Cloud {
    const texture = textures[Math.floor(Math.random() * textures.length)];
    const sprite = new Sprite(texture);
    const scale = randomBetween(0.7, 1.3);
    sprite.width = texture.frame.width * scale;
    sprite.height = texture.frame.height * scale;
    sprite.alpha = randomBetween(0.35, 0.65);
    sprite.x = Math.random() * (width + 400) - 200;
    sprite.y = Math.random() * Math.max(1, height - sprite.height);

    return {
        sprite,
        speedX: randomBetween(0.15, 0.45),
        driftSpeed: randomBetween(0.0006, 0.0016),
        driftPhase: Math.random() * Math.PI * 2,
        driftAmp: randomBetween(6, 18),
    };
}

function setCloudCount(state: WeatherFxState, count: number, width: number, height: number): void {
    if (count > 0 && !state.cloudTextures) {
        return;
    }

    while (state.clouds.length < count && state.cloudTextures) {
        const cloud = buildCloud(state.cloudTextures, width, height);
        state.clouds.push(cloud);
        state.fogLayer.addChild(cloud.sprite);
    }

    while (state.clouds.length > count) {
        const cloud = state.clouds.pop();
        if (cloud) {
            state.fogLayer.removeChild(cloud.sprite);
            cloud.sprite.destroy();
        }
    }
}

function updateFog(state: WeatherFxState, width: number, height: number, deltaMs: number): void {
    setCloudCount(state, CLOUD_COUNT, width, height);

    const scale = deltaMs / 16.67;
    for (const cloud of state.clouds) {
        cloud.sprite.x += cloud.speedX * scale;
        cloud.driftPhase += cloud.driftSpeed * deltaMs;
        cloud.sprite.y += Math.sin(cloud.driftPhase) * 0.05 * scale;

        if (cloud.sprite.x > width + 220) {
            cloud.sprite.x = -cloud.sprite.width - 20;
            cloud.sprite.y = Math.random() * Math.max(1, height - cloud.sprite.height);
        }
    }
}

function updateLightning(state: WeatherFxState, weather: number, now: number): void {
    if (weather !== WEATHER.tormenta) {
        state.lightningLayer.alpha = 0;
        state.lightningUntil = 0;
        return;
    }

    if (now >= state.nextLightningAt && state.lightningUntil === 0) {
        state.lightningUntil = now + LIGHTNING_FLASH_MS;
        state.nextLightningAt = now + randomBetween(LIGHTNING_MIN_INTERVAL_MS, LIGHTNING_MAX_INTERVAL_MS);
    }

    if (state.lightningUntil > 0) {
        if (now < state.lightningUntil) {
            const progress = 1 - (state.lightningUntil - now) / LIGHTNING_FLASH_MS;
            state.lightningLayer.alpha = Math.sin(progress * Math.PI) * 0.55;
        } else {
            state.lightningLayer.alpha = 0;
            state.lightningUntil = 0;
        }
    }
}

const NIGHT_ALPHA_BY_PHASE: Record<number, number> = {
    [DAY_PHASE.manana]: 0,
    [DAY_PHASE.mediodia]: 0,
    [DAY_PHASE.tarde]: 0.12,
    [DAY_PHASE.noche]: 0.45,
};

export function updateWeatherFx(engine: Engine, deltaMs: number): void {
    const state = stateByEngine.get(engine);
    if (!state || !engine.app) {
        return;
    }

    const width = engine.app.screen.width;
    const height = engine.app.screen.height;
    resizeLayers(state, width, height);

    const environment = engine.environmentState;
    const weather = environment?.weather ?? WEATHER.despejado;
    const dayPhase = environment?.dayPhase ?? DAY_PHASE.mediodia;
    const now = Date.now();

    state.nightLayer.alpha = NIGHT_ALPHA_BY_PHASE[dayPhase] ?? 0;

    const isRaining = weather === WEATHER.lluvia || weather === WEATHER.tormenta;
    state.rainLayer.visible = isRaining;
    if (isRaining) {
        updateRain(state, width, height, deltaMs, weather === WEATHER.tormenta);
    } else if (state.raindrops.length > 0) {
        setRainCount(state, 0, width, height);
    }

    const isSnowing = weather === WEATHER.nieve;
    state.snowLayer.visible = isSnowing;
    if (isSnowing) {
        updateSnow(state, width, height, deltaMs);
    } else if (state.snowflakes.length > 0) {
        setSnowCount(state, 0, width, height);
    }

    const isFoggy = weather === WEATHER.niebla;
    state.fogLayer.visible = isFoggy;
    if (isFoggy) {
        updateFog(state, width, height, deltaMs);
    } else if (state.clouds.length > 0) {
        setCloudCount(state, 0, width, height);
    }

    updateLightning(state, weather, now);
}

export function destroyWeatherFx(engine: Engine): void {
    const state = stateByEngine.get(engine);
    if (!state) {
        return;
    }

    for (const drop of state.raindrops) {
        drop.g.destroy();
    }
    for (const flake of state.snowflakes) {
        flake.g.destroy();
    }
    for (const cloud of state.clouds) {
        cloud.sprite.destroy();
    }

    stateByEngine.delete(engine);
}
