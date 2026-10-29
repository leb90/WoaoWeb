// Respiración en reposo, como en leb90/_React-Argentum (src/engine/legacy/getEngine/characterRenderer.js,
// getBreathingState y drawBreathingBodySegment): el pecho sube y baja en un ciclo de unos 4,7 s, desfasado por
// personaje, y el arma y el escudo acompañan subiendo hasta 1 px. Allá se estiraba solo el torso (el 58 % de arriba del
// cuerpo) un 3 %; acá se estira el cuerpo entero lo mismo en píxeles (≈1,7 %) con los pies quietos.
// La cabeza no se mueve, como allá, y los nombres tampoco: salen de las medidas guardadas del cuerpo
// (renderMetrics), no del sprite estirado. El contorno al pasar el mouse copia la escala del cuerpo en cada cuadro,
// así que respira con él; el click y el hover buscan por baldosa y no cambian.
// Respiran los humanoides vivos y quietos: usuarios y NPC con cabeza y con cuerpo de proporción humana. Quedan afuera
// las criaturas (no tienen cabeza aparte), las monturas y las barcas (por tamaño, y navegando) y los fantasmas.
import type { AnimatedSprite, Container, Sprite } from "pixi.js";
import type { Character, Engine } from "../engine/Engine";
import type { BodyRenderMetrics } from "./characterLayout";

const BREATH_SPEED = 0.00135; // radianes por milisegundo: un ciclo cada ~4,65 s
const BREATH_PHASE_PER_ID = 0.61;
const BREATH_STRETCH = 0.0174;
const BREATH_GEAR_LIFT = 0.75;
// Un cuerpo humano mide 26 × 46; una montura con jinete, 32 × 69, y una barca, 66 × 94.
const HUMANOID_MAX_BODY_WIDTH = 40;
const HUMANOID_MAX_BODY_HEIGHT = 56;
// Al caminar hay uno o dos cuadros quietos entre baldosa y baldosa: la respiración espera un momento y entra de a poco,
// así el cuerpo no salta respecto de la cabeza en medio de la caminata.
const BREATH_START_DELAY_MS = 350;
const BREATH_RAMP_MS = 900;

type BreathingSprite = (Sprite | AnimatedSprite) & {
    breathBaseY?: number;
    breathApplied?: boolean;
    renderMetrics?: BodyRenderMetrics;
};
type BreathingHost = Container & {
    breathStillSince?: number;
    bodySprite?: BreathingSprite;
    headSprite?: Sprite;
    weaponSprite?: BreathingSprite;
    shieldSprite?: BreathingSprite;
};

// El render llama a esto después de ubicar el arma y el escudo: la respiración los sube desde ahí.
export function rememberBreathBase(sprite: Sprite | AnimatedSprite | undefined) {
    if (sprite) (sprite as BreathingSprite).breathBaseY = sprite.y;
}

// Cuánto aire tiene el personaje ahora, de 0 a 1, con la curva suave de allá (smoothstep sobre un seno).
function getInhale(entity: Character, now: number): number {
    const inhale = (Math.sin(now * BREATH_SPEED + (Number(entity.id) || 0) * BREATH_PHASE_PER_ID) + 1) * 0.5;
    return inhale * inhale * (3 - 2 * inhale);
}

function canBreathe(host: BreathingHost, entity: Character, metrics: BodyRenderMetrics): boolean {
    const head = host.headSprite;
    return (
        host.visible &&
        !entity.dead &&
        !entity.navegando &&
        !entity.moving &&
        entity.moveOffsetX === 0 &&
        entity.moveOffsetY === 0 &&
        Boolean(head && !head.destroyed && head.visible) &&
        metrics.width <= HUMANOID_MAX_BODY_WIDTH &&
        metrics.height <= HUMANOID_MAX_BODY_HEIGHT
    );
}

function applyBreathing(host: BreathingHost, entity: Character, now: number) {
    const body = host.bodySprite;
    const metrics = body?.renderMetrics;
    if (!body || body.destroyed || !metrics) return;

    let amount = 0;
    if (canBreathe(host, entity, metrics)) {
        host.breathStillSince ??= now;
        const ramp = Math.min(1, Math.max(0, (now - host.breathStillSince - BREATH_START_DELAY_MS) / BREATH_RAMP_MS));
        amount = getInhale(entity, now) * ramp;
    } else {
        host.breathStillSince = undefined;
    }
    if (amount === 0 && !body.breathApplied) return;

    const stretch = 1 + amount * BREATH_STRETCH;
    body.scale.y = stretch;
    body.y = metrics.y - metrics.height * (stretch - 1);
    const lift = Math.round(amount * BREATH_GEAR_LIFT);
    for (const gear of [host.weaponSprite, host.shieldSprite]) {
        if (gear && !gear.destroyed && gear.breathBaseY !== undefined) gear.y = gear.breathBaseY - lift;
    }
    body.breathApplied = amount > 0;
}

// Se llama en cada cuadro, después de mover y animar a los personajes (Engine.loop).
export function updateBreathing(engine: Engine, now: number) {
    if (engine.user && engine.playerContainer) {
        applyBreathing(engine.playerContainer as BreathingHost, engine.user, now);
    }
    for (const [id, container] of engine.remoteEntities) {
        const entity = engine.personajes[id];
        if (entity && !container.destroyed) applyBreathing(container as BreathingHost, entity, now);
    }
}
