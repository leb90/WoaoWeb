// Equipo de referencia por clase para el simulador de balance.
// Elige el mejor ítem por lugar entre tres perfiles, siempre para razas altas:
// - "venta": lo que venden los comerciantes.
// - "comun": lo mejor que no es premio (comerciante, crafteo, drop o misión).
// - "tier": el set de tier de la clase (jsons/sets.json); donde no tiene pieza, lo mejor común.
import fs from "node:fs";
import path from "node:path";

export type GearProfile = "venta" | "comun" | "tier";
export type GearRole = "magia" | "fisico";
export type GearSlot = "arma" | "arco" | "armadura" | "casco" | "escudo" | "anillo";

type ObjectData = Record<string, any>;

const JSONS = path.resolve(__dirname, "../../../jsons");
const readJson = (name: string) => JSON.parse(fs.readFileSync(path.join(JSONS, name), "utf8"));

const objects: Record<string, ObjectData> = readJson("objs.json");
const npcs: Record<string, ObjectData> = readJson("npcs.json");
const premios: ObjectData[] = Object.values(readJson("premios.json"));
const recipes: ObjectData[] = Object.values(readJson("craftingRecipes.json"));
const quests: ObjectData[] = Object.values(readJson("quests.json"));
const tierSets: Array<{ classes: number[]; pieces: Record<string, number[]> }> = fs.existsSync(path.join(JSONS, "sets.json"))
    ? readJson("sets.json").sets
    : [];

// De dónde se puede sacar cada objeto.
export const sources = new Map<number, Set<string>>();
const addSource = (id: unknown, source: string) => {
    const itemId = Number(id);
    if (!itemId) return;
    if (!sources.has(itemId)) sources.set(itemId, new Set());
    sources.get(itemId)!.add(source);
};
for (const npc of Object.values(npcs)) {
    if (npc.comercia && Array.isArray(npc.objs)) for (const item of npc.objs) addSource(item.item, "venta");
    if (Array.isArray(npc.drop)) for (const drop of npc.drop) addSource(drop.item, "drop");
}
for (const recipe of recipes) if (!recipe.deleted) addSource(recipe.itemId, "crafteo");
for (const quest of quests) for (const reward of quest.rewardObjs || []) addSource(reward.index, "mision");
for (const premio of premios) addSource(premio.objIndex, "premio");

// Las versiones +1/+2/LEGENDARIA de un premio comparten el nombre base.
const baseName = (name: unknown) => String(name ?? "").replace(/\s*(\+\s*\d|legendari[oa])\s*$/i, "").trim();
const premioBases = new Set(premios.map((premio) => baseName(objects[premio.objIndex]?.name)));
for (const [id, item] of Object.entries(objects)) if (premioBases.has(baseName(item.name))) addSource(id, "tier");

export function slotOf(item: ObjectData): GearSlot | "flecha" | null {
    const type = Number(item.objType);
    const subtipo = Number(item.subtipo || 0);
    if (type === 2) return item.proyectil ? "arco" : "arma";
    if (type === 17 || (type === 3 && subtipo === 1)) return "casco";
    if (type === 16 || (type === 3 && subtipo === 2)) return "escudo";
    if (type === 3 && subtipo !== 3) return "armadura";
    if (type === 41) return "anillo";
    if (type === 32) return "flecha";
    return null;
}

const avg = (min: unknown, max: unknown) => (Number(min || 0) + Number(max || 0)) / 2;
// Mismas tablas que getObjectSpecialBonuses (game.ts).
const OE_STR: Record<number, number> = { 2: 5, 3: 2, 4: 3, 12: 1, 13: 2, 14: 5, 15: 3, 16: 1 };
const OE_MANA: Record<number, number> = { 8: 100, 9: 200, 10: 300, 17: 200, 19: 55 };

// Puntaje del ítem según el rol de la clase.
function score(item: ObjectData, slot: GearSlot, role: GearRole): number {
    const def = avg(item.minDef, item.maxDef);
    const magicDef = avg(item.minDefMag, item.maxDefMag);
    const dm = Number(item.magicDamageBonus || 0);
    const rm = Number(item.resistenciaMagica || 0);
    const str = OE_STR[Number(item.objetoEspecial)] || 0;
    const mana = OE_MANA[Number(item.objetoEspecial)] || 0;
    const hit = avg(item.minHit, item.maxHit);
    if (slot === "arma") return role === "magia" ? dm * 10 + hit + mana / 50 : hit * 3 + (Number(item.maxHit || 0) / 5) * 15 + str * 9;
    if (slot === "arco") return hit * 3 + (Number(item.maxHit || 0) / 5) * 15;
    if (slot === "anillo") return role === "magia" ? dm * 10 + rm * 5 + magicDef * 3 : rm * 5 + magicDef * 3 + dm;
    return def + magicDef * 2 + rm * 3 + (role === "magia" ? dm * 10 + mana / 20 : str * 6);
}

const usableBy = (item: ObjectData, classId: number) =>
    !(item.clasesNoPermitidas || []).includes(classId) &&
    !item.razaEnana &&
    !item.cosmetico &&
    !item.newbie &&
    !item.eventOnly &&
    !item.disfraz;

const isSold = (id: number) => Boolean(sources.get(id)?.has("venta"));
const isCommon = (id: number) => {
    const from = sources.get(id);
    return Boolean(from && !from.has("tier") && (from.has("venta") || from.has("crafteo") || from.has("drop") || from.has("mision")));
};
const isTier = (id: number) => Boolean(sources.get(id)?.has("tier"));
const FILTERS: Record<GearProfile, (id: number) => boolean> = { venta: isSold, comun: isCommon, tier: isTier };

function best(classId: number, role: GearRole, slot: GearSlot, filter: (id: number) => boolean): number {
    let top: { id: number; value: number } | null = null;
    for (const [rawId, item] of Object.entries(objects)) {
        const id = Number(rawId);
        if (slotOf(item) !== slot || !usableBy(item, classId) || !filter(id)) continue;
        const value = score(item, slot, role);
        // Un ítem sin efecto en combate (por ejemplo, el Anillo de Magia #1242) no se equipa.
        if (value <= 0) continue;
        if (!top || value > top.value) top = { id, value };
    }
    return top?.id ?? 0;
}

// Piezas del set de tier de la clase (jsons/sets.json): con perfil "tier" se prefieren, así se arma el set
// completo y el motor aplica su bono.
const ownSetItems = (classId: number) =>
    new Set(tierSets.filter((set) => set.classes.includes(classId)).flatMap((set) => Object.values(set.pieces).flat()));

// El set de la clase trae pieza para ese lugar (por ejemplo, el escudo de los sets de mago y druida).
export const hasOwnSetPiece = (classId: number, slot: GearSlot) =>
    [...ownSetItems(classId)].some((id) => objects[String(id)] && slotOf(objects[String(id)]) === slot);

// Si el set de tier no tiene pieza para ese lugar (o la clase no tiene set), se completa con lo mejor común.
export function pickGear(classId: number, role: GearRole, slot: GearSlot, profile: GearProfile): number {
    if (profile === "tier") {
        const own = ownSetItems(classId);
        return best(classId, role, slot, (id) => own.has(id)) || best(classId, role, slot, isCommon);
    }
    return best(classId, role, slot, FILTERS[profile]);
}

// Flechas: tienda 480 (1-3); común y tier 607 Flecha de los Dioses (8-10, crafteo).
export const BEST_ARROW: Record<GearProfile, number> = { venta: 480, comun: 607, tier: 607 };
