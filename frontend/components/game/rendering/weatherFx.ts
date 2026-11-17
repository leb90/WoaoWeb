import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { DAY_PHASE, WEATHER, type EnvironmentState } from "../../../lib/aowProtocol";
import type { Engine } from "../engine/Engine";

// Efectos visuales de clima y día/noche, como en el cliente viejo (_React-Argentum,
// engine/legacy/getEngine/environment.js): el tinte de cada momento del día, la lluvia, la nieve, la niebla y los
// relámpagos. Acá se dibuja con Pixi en vez de Canvas2D.

const RAIN_COUNT = 140;
const RAIN_COUNT_STORM = 220;
const SNOW_COUNT = 110;
// Cada relámpago trae un trueno de unos 8 s: más espaciados para que no se pisen.
const LIGHTNING_MIN_INTERVAL_MS = 7000;
const LIGHTNING_MAX_INTERVAL_MS = 18000;
const LIGHTNING_FLASH_MS = 140;

// El tinte de cada momento del día (los mismos colores y opacidades que el cliente viejo).
const DAY_TINT_BY_PHASE: Record<number, { color: number; alpha: number }> = {
    [DAY_PHASE.manana]: { color: 0xb4dcff, alpha: 0.15 },
    [DAY_PHASE.mediodia]: { color: 0xffffff, alpha: 0 },
    [DAY_PHASE.tarde]: { color: 0xffaa5a, alpha: 0.12 },
    [DAY_PHASE.noche]: { color: 0x142850, alpha: 0.24 },
};

// El último clima que mandó el server. El motor se vuelve a crear al cambiar de mapa y el server solo manda el
// clima cuando cambia: sin esto, el render quedaba de día y despejado aunque el panel mostrara la noche o la lluvia.
let lastEnvironment: EnvironmentState | null = null;

export function rememberEnvironment(environment: EnvironmentState | null): void {
    lastEnvironment = environment;
}

// Texturas de la niebla, pintadas una sola vez: una nube difusa (redonda, que se estira al dibujarla) y el velo
// de arriba abajo. La nube se pinta en un lienzo cuadrado con el degradado terminando antes de los bordes, así
// nunca quedan cortes rectos (los bancos y franjas de antes dejaban bandas y rectángulos marcados).
type FogTextures = { puff: Texture; veil: Texture };
let fogTextures: FogTextures | null = null;

function paintTexture(width: number, height: number, paint: (ctx: CanvasRenderingContext2D) => void): Texture {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        paint(ctx);
    }
    return Texture.from(canvas);
}

const FOG_PUFF_SIZE = 256;

function getFogTextures(): FogTextures {
    if (!fogTextures) {
        fogTextures = {
            puff: paintTexture(FOG_PUFF_SIZE, FOG_PUFF_SIZE, (ctx) => {
                const center = FOG_PUFF_SIZE / 2;
                // Radio menor que medio lado: la nube llega a 0 antes de tocar cualquier borde.
                const gradient = ctx.createRadialGradient(center, center, 0, center, center, center * 0.96);
                gradient.addColorStop(0, "rgba(232, 237, 241, 0.62)");
                gradient.addColorStop(0.3, "rgba(230, 235, 239, 0.46)");
                gradient.addColorStop(0.6, "rgba(226, 232, 236, 0.2)");
                gradient.addColorStop(0.85, "rgba(224, 230, 234, 0.05)");
                gradient.addColorStop(1, "rgba(224, 230, 234, 0)");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, FOG_PUFF_SIZE, FOG_PUFF_SIZE);
            }),
            // Bruma pareja en toda la pantalla, apenas más densa arriba y abajo (el centro queda más limpio).
            veil: paintTexture(4, 256, (ctx) => {
                const gradient = ctx.createLinearGradient(0, 0, 0, 256);
                gradient.addColorStop(0, "rgba(222, 229, 234, 0.22)");
                gradient.addColorStop(0.5, "rgba(222, 229, 234, 0.12)");
                gradient.addColorStop(1, "rgba(222, 229, 234, 0.22)");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 4, 256);
            }),
        };
    }
    return fogTextures;
}

type Raindrop = { g: Graphics; speed: number };
type Snowflake = { g: Graphics; speed: number; swaySpeed: number; swayPhase: number };
// Una nube de niebla que cruza la pantalla de izquierda a derecha, muy despacio, meciéndose arriba y abajo.
type FogPiece = {
    sprite: Sprite;
    baseY: number;
    speedX: number;
    opacity: number;
    driftAmp: number;
    driftSpeed: number;
    seed: number;
};

type WeatherFxState = {
    rainLayer: Container;
    snowLayer: Container;
    fogLayer: Container;
    fogVeil: Sprite | null;
    fogWash: Graphics;
    dayTintLayer: Graphics;
    lightningLayer: Graphics;
    raindrops: Raindrop[];
    snowflakes: Snowflake[];
    fogPieces: FogPiece[];
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

    // Lo último de la niebla: un blanqueo parejo suave por encima de las nubes, que apaga un poco los colores.
    const fogWash = new Graphics();
    fogWash.eventMode = "none";
    fogWash.alpha = 0.06;

    const dayTintLayer = new Graphics();
    dayTintLayer.eventMode = "none";
    dayTintLayer.alpha = 0;

    const lightningLayer = new Graphics();
    lightningLayer.eventMode = "none";
    lightningLayer.alpha = 0;

    // Orden: el tinte del día abajo (como en el cliente viejo), después la lluvia, la nieve y la niebla, y el flash
    // del rayo arriba de todo.
    container.addChild(dayTintLayer, rainLayer, snowLayer, fogLayer, lightningLayer);

    const now = Date.now();
    const state: WeatherFxState = {
        rainLayer,
        snowLayer,
        fogLayer,
        fogVeil: null,
        fogWash,
        dayTintLayer,
        lightningLayer,
        raindrops: [],
        snowflakes: [],
        fogPieces: [],
        nextLightningAt: now + randomBetween(LIGHTNING_MIN_INTERVAL_MS, LIGHTNING_MAX_INTERVAL_MS),
        lightningUntil: 0,
        width: 0,
        height: 0,
    };

    stateByEngine.set(engine, state);

    return container;
}

function resizeLayers(state: WeatherFxState, width: number, height: number): void {
    if (state.width === width && state.height === height) {
        return;
    }

    state.width = width;
    state.height = height;

    // Blancos: el color sale del tinte de cada momento del día.
    state.dayTintLayer.clear().rect(0, 0, width, height).fill({ color: 0xffffff, alpha: 1 });
    state.fogWash.clear().rect(0, 0, width, height).fill({ color: 0xebf1f5, alpha: 1 });
    state.lightningLayer.clear().rect(0, 0, width, height).fill({ color: 0xffffff, alpha: 1 });
    if (state.fogVeil) {
        state.fogVeil.width = width;
        state.fogVeil.height = height;
    }
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

function randomFogPieceY(height: number, renderHeight: number): number {
    return randomBetween(-renderHeight * 0.45, height - renderHeight * 0.55);
}

function buildFogPiece(textures: FogTextures, width: number, height: number): FogPiece {
    // Nubes grandes y achatadas: de lejos se leen como un cielo cubierto, no como manchas sueltas.
    const renderWidth = Math.max(420, width * randomBetween(0.55, 0.95));
    const renderHeight = renderWidth * randomBetween(0.38, 0.55);
    const sprite = new Sprite(textures.puff);
    sprite.eventMode = "none";
    sprite.width = renderWidth;
    sprite.height = renderHeight;
    sprite.x = randomBetween(-renderWidth, width);
    const baseY = randomFogPieceY(height, renderHeight);
    sprite.y = baseY;

    return {
        sprite,
        baseY,
        speedX: randomBetween(0.03, 0.08),
        opacity: randomBetween(0.28, 0.5),
        driftAmp: randomBetween(4, 10),
        driftSpeed: randomBetween(0.00015, 0.0004),
        seed: Math.random() * Math.PI * 2,
    };
}

function startFog(state: WeatherFxState, width: number, height: number): void {
    if (state.fogPieces.length > 0) {
        return;
    }

    const textures = getFogTextures();
    if (!state.fogVeil) {
        state.fogVeil = new Sprite(textures.veil);
        state.fogVeil.eventMode = "none";
        state.fogVeil.width = width;
        state.fogVeil.height = height;
    }
    state.fogLayer.addChild(state.fogVeil);

    const pieces = 7 + Math.floor(Math.random() * 3);
    for (let index = 0; index < pieces; index++) {
        const piece = buildFogPiece(textures, width, height);
        state.fogPieces.push(piece);
        state.fogLayer.addChild(piece.sprite);
    }
    state.fogLayer.addChild(state.fogWash);
}

function stopFog(state: WeatherFxState): void {
    for (const piece of state.fogPieces) {
        piece.sprite.destroy();
    }
    state.fogPieces = [];
    state.fogLayer.removeChildren();
}

function updateFog(state: WeatherFxState, width: number, height: number, deltaMs: number, now: number): void {
    startFog(state, width, height);

    const speedFactor = Math.max(0.5, deltaMs / 16);
    const centerX = width * 0.5;
    const centerY = height * 0.52;

    for (const piece of state.fogPieces) {
        piece.sprite.x += piece.speedX * speedFactor;
        // Sale entera por la derecha y vuelve a entrar entera por la izquierda (nunca aparece de golpe).
        if (piece.sprite.x > width) {
            piece.sprite.x = -piece.sprite.width;
            piece.baseY = randomFogPieceY(height, piece.sprite.height);
        }
        piece.sprite.y = piece.baseY + Math.sin(now * piece.driftSpeed + piece.seed) * piece.driftAmp;

        // Alrededor del personaje (el centro) la niebla es más rala, para que se lo siga viendo.
        const normX = Math.abs(piece.sprite.x + piece.sprite.width * 0.5 - centerX) / (width * 0.5);
        const normY = Math.abs(piece.sprite.y + piece.sprite.height * 0.5 - centerY) / (height * 0.5);
        piece.sprite.alpha = piece.opacity * Math.max(0.45, Math.min(1, Math.sqrt(normX * normX + normY * normY)));
    }
}

function updateLightning(state: WeatherFxState, weather: number, now: number, onLightning?: (() => void) | null): void {
    if (weather !== WEATHER.tormenta) {
        state.lightningLayer.alpha = 0;
        state.lightningUntil = 0;
        return;
    }

    if (now >= state.nextLightningAt && state.lightningUntil === 0) {
        state.lightningUntil = now + LIGHTNING_FLASH_MS;
        state.nextLightningAt = now + randomBetween(LIGHTNING_MIN_INTERVAL_MS, LIGHTNING_MAX_INTERVAL_MS);
        onLightning?.();
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

export function updateWeatherFx(engine: Engine, deltaMs: number): void {
    const state = stateByEngine.get(engine);
    if (!state || !engine.app) {
        return;
    }

    const width = engine.app.screen.width;
    const height = engine.app.screen.height;
    resizeLayers(state, width, height);

    // Un motor recién creado (cambio de mapa) arranca con el último clima conocido.
    if (!engine.environmentState && lastEnvironment) {
        engine.environmentState = lastEnvironment;
    }

    const environment = engine.environmentState;
    const weather = environment?.weather ?? WEATHER.despejado;
    const dayPhase = environment?.dayPhase ?? DAY_PHASE.mediodia;
    const now = Date.now();

    const tint = DAY_TINT_BY_PHASE[dayPhase] ?? DAY_TINT_BY_PHASE[DAY_PHASE.mediodia];
    state.dayTintLayer.tint = tint.color;
    state.dayTintLayer.alpha = tint.alpha;

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
        updateFog(state, width, height, deltaMs, now);
    } else if (state.fogPieces.length > 0) {
        stopFog(state);
    }

    updateLightning(state, weather, now, engine.onLightning);
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
    for (const piece of state.fogPieces) {
        piece.sprite.destroy();
    }

    stateByEngine.delete(engine);
}
