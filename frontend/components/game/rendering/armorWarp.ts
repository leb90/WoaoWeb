// La armadura se adapta al cuerpo de la raza (como en leb90/_React-Argentum, rama SoloAo, commit d7781a0
// "change items body": characterRenderer.js, buildSilhouetteProfile / buildWarpedArmorCanvas).
// Las armaduras están dibujadas para el cuerpo humano. Para las razas con otra silueta (orco, goblin,
// abisario, no muerto, tauros, licántropo) se deforma cada cuadro de la armadura, fila por fila, hasta la
// silueta del cuerpo desnudo de la raza. Cabeza, casco, arma y escudo no se deforman: se ubican con el
// cuerpo de la raza (sus headOffset), así quedan a la altura natural del personaje.
import { Rectangle, Texture } from "pixi.js";
import type { BodyData, BodiesDB, ObjectsDB } from "../../../types/game";
import type { Character } from "../engine/Engine";

// Cuerpos desnudos de las razas que se adaptan (hombre / mujer). Humano, elfo, drow y vampiro usan el
// cuerpo humano y enano / gnomo tienen armaduras propias, así que ahí la deformación no aporta.
const WARP_RACE_BODY_IDS = new Set([215, 217, 178, 212, 486, 488, 526, 527, 528, 529, 530, 531]);
// Enano y gnomo (hombre / mujer). Con su ropa "(Bajo/as)" se dibujan tal cual; con una ropa de altos (las piezas
// de los sets de clase, que existen en una sola versión) la armadura se achica a la altura y el ancho del cuerpo
// bajo, así no queda un cuerpo de humano con cabeza de enano.
const SMALL_RACE_BODY_IDS = new Set([53, 60]);

const ALPHA_THRESHOLD = 16;
const MAX_CACHED_WARPS = 400;

type Pixels = { data: Uint8ClampedArray; width: number; height: number };
type RowProfile = { center: number; width: number } | null;

const pixelCache = new WeakMap<Texture, Pixels | null>();
const warpCache = new Map<string, Texture[]>();
let armorBodyIds: Set<number> | null = null;
let armorBodyIdsSource: ObjectsDB | null = null;

// Cuerpos de armadura (objType 3 sin subtipo): deja afuera monturas, barcos, el cuerpo de muerto y disfraces.
function getArmorBodyIds(objectsDB: ObjectsDB | null | undefined): Set<number> {
    if (armorBodyIds && armorBodyIdsSource === objectsDB) return armorBodyIds;
    armorBodyIds = new Set();
    armorBodyIdsSource = objectsDB ?? null;
    for (const object of Object.values(objectsDB ?? {})) {
        const anim = Number(object?.anim ?? 0);
        if (Number(object?.objType) === 3 && !object?.subtipo && anim > 0) armorBodyIds.add(anim);
    }
    return armorBodyIds;
}

/** Cuerpo desnudo de la raza al que hay que adaptar la armadura, o null si se dibuja tal cual. */
export function resolveWarpRaceBodyId(
    entity: Character,
    objectsDB: ObjectsDB | null | undefined,
    resolveNakedBodyIdFromHeadId: (headId: number) => number | null,
    bodiesDB?: BodiesDB | null,
): number | null {
    if (entity.isNpc || entity.dead || entity.navegando) return null;
    const raceBodyId = resolveNakedBodyIdFromHeadId(entity.idHead);
    if (!raceBodyId || raceBodyId === entity.idBody) return null;
    if (!getArmorBodyIds(objectsDB).has(entity.idBody)) return null;
    if (WARP_RACE_BODY_IDS.has(raceBodyId)) return raceBodyId;
    if (SMALL_RACE_BODY_IDS.has(raceBodyId) && isTallArmorBody(entity.idBody, bodiesDB)) return raceBodyId;
    return null;
}

/** Enano o gnomo: la armadura se achica también en altura (ver SMALL_RACE_BODY_IDS). */
export function isSmallRaceBodyId(bodyId: number | null | undefined): boolean {
    return SMALL_RACE_BODY_IDS.has(Number(bodyId));
}

// Las ropas de altos llevan la cabeza arriba del cuadro (headOffsetY negativo, -4 en el cuerpo humano) y las de
// bajos más abajo (+6 en el cuerpo de enano). Los cuadros miden lo mismo (46 px), así que se distinguen por esto.
function isTallArmorBody(bodyId: number, bodiesDB: BodiesDB | null | undefined): boolean {
    const headOffsetY = Number(bodiesDB?.[String(bodyId)]?.headOffsetY ?? 0);
    return headOffsetY < 0;
}

function readPixels(texture: Texture): Pixels | null {
    if (pixelCache.has(texture)) return pixelCache.get(texture) ?? null;
    let pixels: Pixels | null = null;
    const resource = texture.source?.resource as CanvasImageSource | undefined;
    const { x, y, width, height } = texture.frame;
    if (resource && width > 0 && height > 0) {
        try {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            if (context) {
                context.imageSmoothingEnabled = false;
                context.drawImage(resource, x, y, width, height, 0, 0, width, height);
                pixels = { data: context.getImageData(0, 0, width, height).data, width, height };
            }
        } catch {
            // Imagen de otro origen o lienzo bloqueado: se dibuja la armadura sin adaptar.
            pixels = null;
        }
    }
    pixelCache.set(texture, pixels);
    return pixels;
}

// Centro y ancho de la parte opaca de cada fila.
function buildRowProfile(pixels: Pixels): RowProfile[] {
    const rows: RowProfile[] = [];
    for (let rowY = 0; rowY < pixels.height; rowY++) {
        let left = pixels.width;
        let right = -1;
        for (let rowX = 0; rowX < pixels.width; rowX++) {
            if (pixels.data[(rowY * pixels.width + rowX) * 4 + 3] > ALPHA_THRESHOLD) {
                if (rowX < left) left = rowX;
                right = rowX;
            }
        }
        rows.push(right >= left ? { center: (left + right) / 2, width: right - left + 1 } : null);
    }
    return rows;
}

// Primera y última fila con algo dibujado.
function getOpaqueRowRange(rows: RowProfile[]): { top: number; bottom: number } | null {
    let top = -1;
    let bottom = -1;
    rows.forEach((row, index) => {
        if (!row) return;
        if (top < 0) top = index;
        bottom = index;
    });
    return top < 0 ? null : { top, bottom };
}

// Por cada fila del cuerpo de la raza toma la fila proporcional de la armadura y la estira o encoge
// al ancho de la raza, centrada. Escribe en `out` (el atlas) a partir de la columna offsetX.
// Con fitHeight la armadura además se achica a la altura de la silueta (enano y gnomo con ropa de altos): la parte
// dibujada de la armadura, de los hombros a los pies, se reparte entre la primera y la última fila de la raza.
function warpFrame(armor: Pixels, race: Pixels, out: ImageData, offsetX: number, fitHeight = false) {
    const armorRows = buildRowProfile(armor);
    const raceRows = buildRowProfile(race);
    const armorRange = fitHeight ? getOpaqueRowRange(armorRows) : null;
    const raceRange = fitHeight ? getOpaqueRowRange(raceRows) : null;
    for (let targetY = 0; targetY < race.height; targetY++) {
        const raceRow = raceRows[targetY];
        if (!raceRow) continue;
        const sourceY =
            armorRange && raceRange
                ? Math.min(
                      Math.round(
                          armorRange.top +
                              ((targetY - raceRange.top) / Math.max(1, raceRange.bottom - raceRange.top)) *
                                  (armorRange.bottom - armorRange.top),
                      ),
                      armor.height - 1,
                  )
                : Math.min(
                      Math.round((race.height > 1 ? targetY / (race.height - 1) : 0) * (armor.height - 1)),
                      armor.height - 1,
                  );
        const armorRow = armorRows[sourceY];
        if (!armorRow) continue;
        const widthRatio = armorRow.width / (raceRow.width || 1);
        for (let targetX = 0; targetX < race.width; targetX++) {
            const sourceX = Math.round(armorRow.center + (targetX - raceRow.center) * widthRatio);
            if (sourceX < 0 || sourceX >= armor.width) continue;
            const from = (sourceY * armor.width + sourceX) * 4;
            const to = (targetY * out.width + offsetX + targetX) * 4;
            out.data[to] = armor.data[from];
            out.data[to + 1] = armor.data[from + 1];
            out.data[to + 2] = armor.data[from + 2];
            out.data[to + 3] = armor.data[from + 3];
        }
    }
}

/**
 * Cuadros de la armadura adaptados a la silueta de la raza, uno por cuadro de la raza.
 * Se guardan por `${armorGraphicId}>${raceGraphicId}`: todos los cuadros van en un solo lienzo.
 */
export function getWarpedBodyTextures(
    key: string,
    armorTextures: Texture[],
    raceTextures: Texture[],
    fitHeight = false,
): Texture[] | null {
    const cached = warpCache.get(key);
    if (cached) return cached;
    if (armorTextures.length === 0 || raceTextures.length === 0) return null;

    const frames: Array<{ armor: Pixels; race: Pixels; x: number }> = [];
    let atlasWidth = 0;
    let atlasHeight = 0;
    for (let index = 0; index < raceTextures.length; index++) {
        const armor = readPixels(armorTextures[Math.min(index, armorTextures.length - 1)]);
        const race = readPixels(raceTextures[index]);
        if (!armor || !race) return null;
        frames.push({ armor, race, x: atlasWidth });
        atlasWidth += race.width;
        atlasHeight = Math.max(atlasHeight, race.height);
    }

    const canvas = document.createElement("canvas");
    canvas.width = atlasWidth;
    canvas.height = atlasHeight;
    const context = canvas.getContext("2d");
    if (!context) return null;
    const image = context.createImageData(atlasWidth, atlasHeight);
    for (const frame of frames) warpFrame(frame.armor, frame.race, image, frame.x, fitHeight);
    context.putImageData(image, 0, 0);

    const atlas = Texture.from(canvas);
    atlas.source.scaleMode = "nearest";
    const textures = frames.map(
        (frame) =>
            new Texture({
                source: atlas.source,
                frame: new Rectangle(frame.x, 0, frame.race.width, frame.race.height),
            }),
    );
    // Sin destroy al vaciar: alguna textura puede seguir en pantalla; las libera el GC de texturas de Pixi.
    if (warpCache.size >= MAX_CACHED_WARPS) warpCache.clear();
    warpCache.set(key, textures);
    return textures;
}

type LayoutHolder = { layoutBody?: { bodyId: number; data: BodyData } };

/** Guarda en el contenedor con qué cuerpo se ubicaron cabeza y casco (el de la raza si se adaptó). */
export function setLayoutBodyData(container: object, bodyId: number, data: BodyData) {
    (container as LayoutHolder).layoutBody = { bodyId, data };
}

/** Cuerpo para ubicar cabeza / casco y animar: el de la raza si la armadura se adaptó en el último dibujo. */
export function getLayoutBodyData(
    container: object | null | undefined,
    bodyId: number,
    bodiesDB: BodiesDB,
): BodyData | undefined {
    const layout = (container as LayoutHolder | null | undefined)?.layoutBody;
    if (layout && layout.bodyId === bodyId) return layout.data;
    return bodiesDB[bodyId.toString()];
}
