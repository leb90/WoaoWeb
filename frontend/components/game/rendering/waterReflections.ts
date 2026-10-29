// Reflejos en el agua, como en leb90/_React-Argentum (src/engine/legacy/getEngine/characterRenderer.js,
// getCoastReflectionInfo y drawCharacterReflection): si hay agua en la baldosa del personaje o en una de las dos de
// abajo, debajo de los pies se dibuja la figura espejada, un poco más angosta y achatada, transparente (24 %) y cada vez
// más tenue hacia abajo. Va en tiras de 3 px que ondulan de costado como el agua.
// Cómo se arma acá: las partes visibles (cuerpo, cabeza, casco, arma y escudo) se copian espejadas a una textura propia
// del personaje y esa textura se dibuja en tiras dentro de su contenedor, debajo del cuerpo. Así el reflejo hereda la
// transparencia del personaje (un invisible no se delata) y lo tapa lo que esté más adelante.
// Lo tienen todos los personajes vivos (usuarios y NPC, como allá); los fantasmas no.
import { Container, Rectangle, RenderTexture, Sprite, Texture } from "pixi.js";
import type { Character, Engine } from "../engine/Engine";
import { TILE_SIZE } from "../../../lib/viewport";

const REFLECTION_ALPHA = 0.24;
const REFLECTION_FADE_POWER = 1.18;
const REFLECTION_MAX_ROWS = 3;
const REFLECTION_STRIP_HEIGHT = 3;
const REFLECTION_MAX_RIPPLE = 8;
const REFLECTION_WIDTH_RATIO = 0.94;
const REFLECTION_HEIGHT_RATIO = 0.92;
// La superficie del agua va 8 px arriba de los pies (no más arriba que el borde de la primera baldosa de agua).
const REFLECTION_SURFACE_OFFSET = 8;
const PARTS = ["bodySprite", "headSprite", "helmetSprite", "weaponSprite", "shieldSprite"] as const;

type WaterInfo = { firstOffset: number; rows: number };
type ReflectionRig = {
    host: ReflectionHost;
    layer: Container;
    source: Container;
    copies: Sprite[];
    renderTexture: RenderTexture | null;
    strips: Sprite[];
    // Las texturas de las tiras, aparte: si el contenedor del personaje se destruye con sus hijos, las tiras quedan
    // destruidas y sin textura, pero las texturas hay que liberarlas igual.
    stripTextures: Texture[];
    stripsKey: string;
    waterKey: string;
    water: WaterInfo | null;
};
type ReflectionHost = Container & Partial<Record<(typeof PARTS)[number], Sprite>> & { waterReflection?: ReflectionRig };
type EngineWithReflections = Engine & { waterReflectionRigs?: Set<ReflectionRig> };

// Agua en la baldosa del personaje o en una de las dos de abajo, y cuántas filas seguidas de agua se ven (hasta 3).
function findWaterBelow(engine: Engine, tileX: number, tileY: number): WaterInfo | null {
    let firstOffset = -1;
    for (let offset = 0; offset <= 2; offset++) {
        if (engine.isWaterSurfaceTile(tileX, tileY + offset)) {
            firstOffset = offset;
            break;
        }
    }
    if (firstOffset < 0) return null;
    let rows = 0;
    while (rows < REFLECTION_MAX_ROWS && engine.isWaterSurfaceTile(tileX, tileY + firstOffset + rows)) rows++;
    return rows > 0 ? { firstOffset, rows } : null;
}

function getRig(engine: EngineWithReflections, host: ReflectionHost): ReflectionRig {
    let rig = host.waterReflection;
    if (rig && !rig.layer.destroyed) return rig;
    const layer = new Container();
    layer.eventMode = "none";
    // Debajo del cuerpo y de su contorno (0.05): el reflejo cae sobre el agua, por debajo de los pies.
    layer.zIndex = 0.01;
    host.addChild(layer);
    const source = new Container();
    source.scale.y = -1;
    rig = {
        host,
        layer,
        source,
        copies: [],
        renderTexture: null,
        strips: [],
        stripTextures: [],
        stripsKey: "",
        waterKey: "",
        water: null,
    };
    host.waterReflection = rig;
    (engine.waterReflectionRigs ??= new Set()).add(rig);
    return rig;
}

function destroyStrips(rig: ReflectionRig) {
    for (const strip of rig.strips) {
        if (!strip.destroyed) strip.destroy();
    }
    for (const texture of rig.stripTextures) texture.destroy(false);
    rig.strips = [];
    rig.stripTextures = [];
    rig.stripsKey = "";
}

function destroyRig(rig: ReflectionRig) {
    destroyStrips(rig);
    rig.source.destroy({ children: true });
    rig.renderTexture?.destroy(true);
    rig.renderTexture = null;
}

function hide(rig: ReflectionRig | undefined) {
    if (rig && !rig.layer.destroyed) rig.layer.visible = false;
}

function updateCharacterReflection(engine: EngineWithReflections, host: ReflectionHost, entity: Character, now: number) {
    const body = host.bodySprite;
    if (entity.dead || !host.visible || host.alpha < 0.05 || !body || body.destroyed || !body.visible) {
        hide(host.waterReflection);
        return;
    }

    // Baldosa del personaje en el marco del mapa actual (puede estar en un mapa vecino del mundo continuo).
    const origin = engine.getMapWorldOrigin(entity.map);
    const current = engine.getMapWorldOrigin();
    const tileX = entity.pos.x + origin.x - current.x;
    const tileY = entity.pos.y + origin.y - current.y;
    const waterKey = `${engine.mapNumber}:${tileX}:${tileY}`;
    let water = host.waterReflection?.waterKey === waterKey ? host.waterReflection.water : undefined;
    if (water === undefined) {
        water = findWaterBelow(engine, tileX, tileY);
        if (!water && !host.waterReflection) return;
    }
    const rig = getRig(engine, host);
    rig.waterKey = waterKey;
    rig.water = water;
    if (!water) {
        rig.layer.visible = false;
        return;
    }

    // Bordes de lo que se ve del personaje, en coordenadas de su contenedor.
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let index = 0;
    for (const key of PARTS) {
        const part = host[key];
        if (!part || part.destroyed || !part.visible || !part.texture) continue;
        const width = Math.abs(part.width);
        const height = Math.abs(part.height);
        minX = Math.min(minX, part.x);
        minY = Math.min(minY, part.y);
        maxX = Math.max(maxX, part.x + width);
        maxY = Math.max(maxY, part.y + height);
        let copy = rig.copies[index++];
        if (!copy) {
            copy = new Sprite();
            rig.source.addChild(copy);
            rig.copies.push(copy);
        }
        copy.texture = part.texture;
        copy.anchor.copyFrom(part.anchor);
        copy.scale.copyFrom(part.scale);
        copy.zIndex = part.zIndex;
        copy.visible = true;
        copy.position.set(part.x, part.y);
    }
    for (let i = index; i < rig.copies.length; i++) rig.copies[i].visible = false;
    if (!Number.isFinite(minX)) {
        rig.layer.visible = false;
        return;
    }
    minX = Math.floor(minX);
    minY = Math.floor(minY);
    const sourceWidth = Math.ceil(maxX) - minX;
    const sourceHeight = Math.ceil(maxY) - minY;
    for (let i = 0; i < index; i++) rig.copies[i].position.set(rig.copies[i].x - minX, rig.copies[i].y - minY);
    rig.source.sortableChildren = true;
    // Espejada: los pies quedan arriba de la textura, que es donde toca el agua.
    rig.source.y = sourceHeight;

    // La textura crece de a 16 px y se rehace solo si no alcanza.
    let renderTexture = rig.renderTexture;
    if (!renderTexture || renderTexture.width < sourceWidth || renderTexture.height < sourceHeight) {
        destroyStrips(rig);
        renderTexture?.destroy(true);
        renderTexture = RenderTexture.create({
            width: Math.ceil(sourceWidth / 16) * 16,
            height: Math.ceil(sourceHeight / 16) * 16,
            resolution: 1,
            scaleMode: "nearest",
        });
        rig.renderTexture = renderTexture;
    }
    engine.app?.renderer.render({ container: rig.source, target: renderTexture, clear: true });

    // Dónde toca el agua y cuánto se ve hacia abajo (de 16 a 84 px), como allá.
    const bodyMetrics = (body as Sprite & { renderMetrics?: { y: number; height: number } }).renderMetrics;
    const bodyBottom = bodyMetrics ? bodyMetrics.y + bodyMetrics.height : body.y + Math.abs(body.height);
    const waterlineY = water.firstOffset * TILE_SIZE;
    const surfaceY = Math.max(waterlineY, Math.round(bodyBottom - REFLECTION_SURFACE_OFFSET));
    const visibleHeight = Math.max(
        16,
        Math.min(84, water.rows * TILE_SIZE - Math.max(0, surfaceY - waterlineY)),
    );
    const drawHeight = Math.max(18, Math.min(visibleHeight, Math.round(sourceHeight * REFLECTION_HEIGHT_RATIO)));
    const drawWidth = Math.max(12, Math.round(sourceWidth * REFLECTION_WIDTH_RATIO));
    const destX = minX + (sourceWidth - drawWidth) / 2;

    // Las tiras: cada una toma su franja de la textura (todo el alto, achatado al alto visible).
    const stripsKey = `${sourceWidth}x${sourceHeight}:${drawHeight}`;
    if (rig.stripsKey !== stripsKey) {
        destroyStrips(rig);
        for (let dy = 0; dy < drawHeight; dy += REFLECTION_STRIP_HEIGHT) {
            const stripHeight = Math.min(REFLECTION_STRIP_HEIGHT, drawHeight - dy);
            const frameY = Math.floor((dy / drawHeight) * sourceHeight);
            const frameHeight = Math.max(1, Math.min(sourceHeight - frameY, Math.ceil((stripHeight / drawHeight) * sourceHeight)));
            const stripTexture = new Texture({
                source: renderTexture.source,
                frame: new Rectangle(0, frameY, sourceWidth, frameHeight),
            });
            rig.stripTextures.push(stripTexture);
            const strip = new Sprite(stripTexture);
            strip.eventMode = "none";
            strip.scale.set(drawWidth / sourceWidth, stripHeight / frameHeight);
            strip.y = surfaceY + dy;
            strip.alpha = REFLECTION_ALPHA * Math.pow(1 - dy / drawHeight, REFLECTION_FADE_POWER);
            rig.layer.addChild(strip);
            rig.strips.push(strip);
        }
        rig.stripsKey = stripsKey;
    }

    // Ondulación de costado, distinta por fila y por personaje (los que navegan, un poco corridos).
    const seed = (Number(entity.id) || 0) * 0.61 + (entity.navegando ? 0.95 : 0);
    for (let i = 0; i < rig.strips.length; i++) {
        const dy = i * REFLECTION_STRIP_HEIGHT;
        const ripple =
            Math.sin(now * 0.005 + dy * 0.34 + seed) * 1.15 + Math.sin(now * 0.0024 + dy * 0.17 + seed * 0.63) * 0.55;
        const strip = rig.strips[i];
        strip.x = Math.round(destX + Math.max(-REFLECTION_MAX_RIPPLE, Math.min(REFLECTION_MAX_RIPPLE, ripple)));
        strip.y = surfaceY + dy;
    }
    rig.layer.visible = true;
}

// Se llama en cada cuadro, después de mover, animar y hacer respirar a los personajes (Engine.loop).
export function updateWaterReflections(engine: Engine, now: number) {
    const withRigs = engine as EngineWithReflections;
    // Los contenedores que ya no están (el personaje se fue de la vista) se llevan su textura.
    for (const rig of withRigs.waterReflectionRigs ?? []) {
        if (rig.host.destroyed || rig.layer.destroyed) {
            destroyRig(rig);
            withRigs.waterReflectionRigs?.delete(rig);
        }
    }
    if (engine.user && engine.playerContainer) {
        updateCharacterReflection(withRigs, engine.playerContainer as ReflectionHost, engine.user, now);
    }
    for (const [id, container] of engine.remoteEntities) {
        const entity = engine.personajes[id];
        if (entity && !container.destroyed) {
            updateCharacterReflection(withRigs, container as ReflectionHost, entity, now);
        }
    }
}
