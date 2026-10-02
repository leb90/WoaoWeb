import fs from "node:fs";
import path from "node:path";
import type { InventoryRecord } from "./types/runtime";
import { getCharacterKey, getProgress, saveProgress, type MountProgress } from "./woaoProgress";
import {
    createMountInstance,
    deleteMountInstance,
    findMigratedMount,
    getMountInstance,
    listMountInstancesByOwner,
    saveMountInstance,
    transferMountInstance,
    type MountInstance,
    type MountRoll,
} from "./mountRepository";
import {
    applyMountIncomingDamage,
    applyMountNpcDamageReduction,
    applyMountOutgoingPvpDamage,
    describeTalentId,
    getActiveMountTalentBonuses,
    getMountEvasionChance,
    PVE_DAMAGE_CAP,
    PVP_DAMAGE_CAP,
    DEFENSE_CAP,
    EVASION_CAP,
    NPC_DAMAGE_REDUCTION_CAP,
} from "./mountTalentEffects";

const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const funct = require("./functions");

const MOUNT_EXP_NPC_REWARD_RATIO = 0.01;

type MountType = {
    id: number;
    name: string;
    topeLevel: number;
    vidaPorLevel: number;
    golpePorLevel: number;
    aumentoCuerpo: number;
    aumentoFlecha: number;
    aumentoMagia: number;
    aumentoEvasion: number;
    expStep?: number;
    itemId?: number;
    eggItemId?: number;
    bodyId?: number;
};

type MountUser = {
    _id?: unknown;
    id?: unknown;
    inv?: unknown;
    mounted?: number | boolean;
    mountTypeId?: number;
    mountInstanceId?: string;
};

const ASSIGNABLE_STATS = [
    "meleeAttack",
    "meleeDefense",
    "rangedAttack",
    "rangedDefense",
    "magicAttack",
    "magicDefense",
    "evasion",
] as const;
type AssignableMountStat = typeof ASSIGNABLE_STATS[number];

const STAT_ALIASES: Record<string, AssignableMountStat> = {
    cuerpo: "meleeAttack",
    ataque_cuerpo: "meleeAttack",
    melee: "meleeAttack",
    meleeattack: "meleeAttack",
    defcuerpo: "meleeDefense",
    defensa_cuerpo: "meleeDefense",
    meleedefense: "meleeDefense",
    flecha: "rangedAttack",
    proyectil: "rangedAttack",
    proyectiles: "rangedAttack",
    ranged: "rangedAttack",
    rangedattack: "rangedAttack",
    defflecha: "rangedDefense",
    defproyectil: "rangedDefense",
    defproyectiles: "rangedDefense",
    rangeddefense: "rangedDefense",
    magia: "magicAttack",
    ataque_magico: "magicAttack",
    magic: "magicAttack",
    magicattack: "magicAttack",
    defmagia: "magicDefense",
    defensa_magica: "magicDefense",
    magicdefense: "magicDefense",
    evasion: "evasion",
    evasión: "evasion",
};

export const MAX_OWNED_MOUNTS = null;
export {
    PVP_DAMAGE_CAP,
    PVE_DAMAGE_CAP,
    DEFENSE_CAP,
    EVASION_CAP,
    NPC_DAMAGE_REDUCTION_CAP,
};

export function getMountPvpDamageBonus(value: number) {
    return Math.max(0, Math.min(PVP_DAMAGE_CAP, value));
}

export function getMountPveDamageBonus(value: number) {
    return Math.max(0, Math.min(PVE_DAMAGE_CAP, value));
}

export function getMountDefenseBonus(value: number) {
    return Math.max(0, Math.min(DEFENSE_CAP, value));
}

export function getMountEvasionBonus(value: number) {
    return Math.max(0, Math.min(EVASION_CAP, value));
}

export function getMountNpcDamageReductionBonus(value: number) {
    return Math.max(0, Math.min(NPC_DAMAGE_REDUCTION_CAP, value));
}

const MOUNT_MIGRATION_VERSION = 1;
const mountTypes = new Map<number, MountType>();
const eggItemsToType = new Map<number, number>();
let talentTable: Record<string, Record<string, string[]>> = {};

const DRAGON_TYPE_ID = 5;
const DONATION_POWER_TYPE_IDS = new Set([7, 8]);

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(message, "#E69500", 1, 0, client);
    }
}

function randomInt(min: number, max: number) {
    return funct.randomIntFromInterval(Math.ceil(min), Math.floor(max));
}

function normalizeStatRef(statRef: string): AssignableMountStat | null {
    const normalized = String(statRef ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s-]+/g, "_");

    return STAT_ALIASES[normalized] ?? null;
}

function assignRandomStatPoint(instance: MountInstance) {
    const stat = ASSIGNABLE_STATS[randomInt(0, ASSIGNABLE_STATS.length - 1)];
    instance[stat] = Math.max(0, Number(instance[stat] ?? 0)) + 1;
}

function rollNpcDamageDelta(mountType: MountType) {
    const base = Number(mountType.golpePorLevel ?? 13);
    const tunedBase = DONATION_POWER_TYPE_IDS.has(mountType.id)
        ? Math.max(base, 16)
        : mountType.id === DRAGON_TYPE_ID
          ? Math.max(base, 15)
          : base;

    return randomInt(Math.max(1, Math.floor(tunedBase / 2)), tunedBase);
}

export function getMountExpRequired(level: number) {
    return Math.max(1, Math.floor(Math.max(1, level) * 400));
}

function getMountExpFromNpcReward(npcRewardExp: number) {
    const exp = Math.floor(Math.max(0, Number(npcRewardExp) || 0) * MOUNT_EXP_NPC_REWARD_RATIO);
    return exp > 0 ? exp : 0;
}

function ownerKey(user: MountUser) {
    return getCharacterKey(user);
}

function getType(typeId: number) {
    return mountTypes.get(Number(typeId)) ?? null;
}

function createRoll(mountType: MountType, level: number, kind: MountRoll["kind"]): MountRoll {
    return {
        level,
        kind,
        npcDamageDelta: rollNpcDamageDelta(mountType),
        vidaDelta: 0,
        meleeAttackDelta: 0,
        meleeDefenseDelta: 0,
        rangedAttackDelta: 0,
        rangedDefenseDelta: 0,
        magicAttackDelta: 0,
        magicDefenseDelta: 0,
        evasionDelta: 0,
        createdAt: new Date().toISOString(),
    };
}

function applyRoll(instance: MountInstance, roll: MountRoll) {
    instance.npcDamage = Math.max(0, Number(instance.npcDamage ?? 0)) + Math.max(0, Number(roll.npcDamageDelta ?? 0));
    instance.vida = Math.max(0, Number(instance.vida ?? 0)) + Math.max(0, Number(roll.vidaDelta ?? 0));
    instance.freeStatPoints = Math.max(0, Number(instance.freeStatPoints ?? 0)) + 2;
    instance.rollHistory.push(roll);
}

function pickTalent(typeId: number, milestone: 10 | 20 | 30) {
    const options = talentTable[String(typeId)]?.[String(milestone)] ?? [];
    if (!options.length) {
        return undefined;
    }

    return options[randomInt(0, options.length - 1)];
}

function assignMissingPerks(instance: MountInstance) {
    if (instance.level >= 10 && !instance.perks.level10) {
        instance.perks.level10 = pickTalent(instance.typeId, 10);
    }

    if (instance.level >= 20 && !instance.perks.level20) {
        instance.perks.level20 = pickTalent(instance.typeId, 20);
    }

    if (instance.level >= 30 && !instance.perks.level30) {
        instance.perks.level30 = pickTalent(instance.typeId, 30);
    }
}

function createFreshMount(ownerCharacterId: string, mountType: MountType): MountInstance {
    const initialRoll = createRoll(mountType, 1, "create");
    const instance = createMountInstance({
        typeId: mountType.id,
        ownerCharacterId,
        name: mountType.name,
        level: 1,
        exp: 0,
        npcDamage: 0,
        vida: 0,
        meleeAttack: 0,
        meleeDefense: 0,
        rangedAttack: 0,
        rangedDefense: 0,
        magicAttack: 0,
        magicDefense: 0,
        evasion: 0,
        freeStatPoints: 0,
        perks: {},
        rollHistory: [],
        previousOwners: [],
    });
    applyRoll(instance, initialRoll);
    for (let i = 0; i < 2; i += 1) {
        if (instance.freeStatPoints <= 0) {
            break;
        }
        assignRandomStatPoint(instance);
        instance.freeStatPoints -= 1;
    }
    saveMountInstance(instance);
    return instance;
}

function migrateLegacyMount(ownerCharacterId: string, typeId: number, legacy: MountProgress) {
    const mountType = getType(typeId);
    if (!mountType || findMigratedMount(ownerCharacterId, typeId)) {
        return;
    }

    const level = Math.max(1, Math.min(30, Math.floor(Number(legacy.nivel ?? 1))));
    const instance = createMountInstance({
        typeId,
        ownerCharacterId,
        name: legacy.name || mountType.name,
        level,
        exp: Math.max(0, Math.floor(Number(legacy.exp ?? 0))),
        npcDamage: 0,
        vida: 0,
        meleeAttack: 0,
        meleeDefense: 0,
        rangedAttack: 0,
        rangedDefense: 0,
        magicAttack: 0,
        magicDefense: 0,
        evasion: 0,
        freeStatPoints: level * 2,
        perks: {},
        rollHistory: [],
        previousOwners: [],
        migratedFromTypeId: typeId,
    });
    assignMissingPerks(instance);
    saveMountInstance(instance);
}

function ensureLegacyMigration(user: MountUser) {
    const progress = getProgress(user);
    const ownerCharacterId = ownerKey(user);

    if (!ownerCharacterId || progress.mountMigrationVersion >= MOUNT_MIGRATION_VERSION) {
        return;
    }

    for (const [typeIdRaw, legacy] of Object.entries(progress.mounts ?? {})) {
        const typeId = Number(typeIdRaw);
        if (!Number.isFinite(typeId) || Number(legacy?.nivel ?? 0) <= 0) {
            continue;
        }

        migrateLegacyMount(ownerCharacterId, typeId, legacy);
    }

    progress.mountMigrationVersion = MOUNT_MIGRATION_VERSION;
    saveProgress(user);
}

function listOwned(user: MountUser) {
    ensureLegacyMigration(user);
    const key = ownerKey(user);
    return key ? listMountInstancesByOwner(key) : [];
}

export function getOwnedMountCount(user: MountUser) {
    return listOwned(user).length;
}

export function ownsMountType(user: MountUser, typeId: number) {
    return listOwned(user).some((instance) => instance.typeId === Number(typeId));
}

function setActiveMount(user: MountUser, instance: MountInstance | null) {
    const progress = getProgress(user);

    if (!instance) {
        user.mountTypeId = 0;
        user.mountInstanceId = "";
        progress.activeMountInstanceId = "";
        saveProgress(user);
        return;
    }

    user.mountTypeId = instance.typeId;
    user.mountInstanceId = instance.id;
    progress.activeMountInstanceId = instance.id;
    saveProgress(user);
}

function resolveActiveMount(user: MountUser) {
    ensureLegacyMigration(user);
    const progress = getProgress(user);
    const ownerCharacterId = ownerKey(user);
    const activeId = user.mountInstanceId || progress.activeMountInstanceId;
    const active = activeId ? getMountInstance(activeId) : null;

    if (active && active.ownerCharacterId === ownerCharacterId) {
        return active;
    }

    if (user.mountTypeId) {
        return listOwned(user).find((instance) => instance.typeId === Number(user.mountTypeId)) ?? null;
    }

    return null;
}

export function getMountTypeIdFromItem(itemId: number): number {
    const obj = vars.datObj?.[itemId];
    return Number(obj?.subtipo ?? 0);
}

export function isMountItem(itemId: number): boolean {
    const mountTypeId = getMountTypeIdFromItem(itemId);
    const obj = vars.datObj?.[itemId];

    return mountTypeId > 0 && Number(obj?.objType ?? 0) === vars.objType.mascotas && mountTypes.has(mountTypeId);
}

function hasInventoryItem(user: MountUser, itemId: number): boolean {
    const inv = getInventoryRecord(user);

    return Object.values(inv ?? {}).some((item) => Number(item?.idItem ?? 0) === itemId && Number(item?.cant ?? 0) > 0);
}

function getInventoryRecord(user: MountUser): InventoryRecord | null {
    if (!user.inv || typeof user.inv !== "object" || Array.isArray(user.inv)) {
        return null;
    }

    return user.inv as InventoryRecord;
}

function findFreeInventorySlot(record: InventoryRecord, maxSlots = 21): string | null {
    for (let slot = 1; slot <= maxSlots; slot += 1) {
        if (!record[String(slot)]) {
            return String(slot);
        }
    }

    return null;
}

function addSingleMountItemToInventory(user: MountUser, itemId: number): string | null {
    const inv = getInventoryRecord(user);

    if (!inv) {
        return null;
    }

    // Los items de montura no stackean: siempre ocupan un slot libre.
    const freeSlot = findFreeInventorySlot(inv);

    if (!freeSlot) {
        return null;
    }

    inv[freeSlot] = {
        idItem: itemId,
        cant: 1,
        equipped: 0,
    };

    return freeSlot;
}

export function ensureMountItemInInventory(user: MountUser, mount: MountInstance | null | undefined) {
    if (!mount) {
        return { ok: false, added: false, message: "No se encontro esa mascota." };
    }

    const mountType = getType(mount.typeId);
    const itemId = Number(mountType?.itemId ?? 0);

    if (!mountType || !itemId || !isMountItem(itemId)) {
        return { ok: false, added: false, message: "Esa mascota no tiene un item de montura configurado." };
    }

    if (hasInventoryItem(user, itemId)) {
        return { ok: true, added: false, itemId, message: "" };
    }

    const slot = addSingleMountItemToInventory(user, itemId);

    if (!slot) {
        return {
            ok: false,
            added: false,
            itemId,
            message: "No tienes espacio en el inventario para recibir el item de montura.",
        };
    }

    const client = vars.clients[String(user.id ?? "")];
    if (client) {
        handleProtocol.agregarUserInvItem(user.id, slot, client);
    }

    return {
        ok: true,
        added: true,
        itemId,
        slot,
        message: `Recibiste el item de montura: ${vars.datObj?.[itemId]?.name ?? mountType.name}.`,
    };
}

export function prepareMount(user: MountUser, itemId: number) {
    const mountTypeId = getMountTypeIdFromItem(itemId);
    if (mountTypeId <= 0) {
        setActiveMount(user, null);
        return { ok: false, message: "Ese item no corresponde a una mascota." };
    }

    const mountType = getType(mountTypeId);
    if (!mountType) {
        setActiveMount(user, null);
        return { ok: false, message: "No se encontro la especie de esa mascota." };
    }

    const owned = listOwned(user);
    let instance = owned.find((candidate) => candidate.typeId === mountTypeId) ?? null;

    if (!instance) {
        instance = createFreshMount(ownerKey(user), mountType);
        tell(String(user.id ?? ""), `Has vinculado una nueva mascota: ${instance.name}.`);
    }

    setActiveMount(user, instance);
    return { ok: true, message: "", mount: instance };
}

export function isMountEggItem(itemId: number) {
    return eggItemsToType.has(Number(itemId));
}

export function hatchMountEgg(user: MountUser, itemId: number) {
    if (!isMountEggItem(itemId)) {
        return { ok: false, message: "Ese item no es un huevo de montura.", mountItemAdded: false };
    }

    const ownerCharacterId = ownerKey(user);
    if (!ownerCharacterId) {
        return { ok: false, message: "No se pudo identificar el personaje.", mountItemAdded: false };
    }

    const mountTypeId = eggItemsToType.get(Number(itemId)) ?? 0;
    const mountType = getType(mountTypeId);
    if (!mountType) {
        return { ok: false, message: "Ese huevo no tiene una especie configurada.", mountItemAdded: false };
    }

    const mountItemId = Number(mountType.itemId ?? 0);
    if (!mountItemId || !isMountItem(mountItemId)) {
        return {
            ok: false,
            message: "Esa mascota no tiene un item de montura configurado.",
            mountItemAdded: false,
        };
    }

    if (ownsMountType(user, mountTypeId)) {
        return {
            ok: false,
            message: `Ya tenes una mascota de especie ${mountType.name}.`,
            mountItemAdded: false,
        };
    }

    if (!hasInventoryItem(user, mountItemId)) {
        const inv = getInventoryRecord(user);
        if (!inv || !findFreeInventorySlot(inv)) {
            return {
                ok: false,
                message: "Necesitas un espacio libre en el inventario para recibir el item de montura.",
                mountItemAdded: false,
            };
        }
    }

    const instance = createFreshMount(ownerCharacterId, mountType);
    setActiveMount(user, instance);

    const mountItemResult = ensureMountItemInInventory(user, instance);
    if (!mountItemResult.ok) {
        deleteMountInstance(instance.id, ownerCharacterId);
        setActiveMount(user, null);
        return {
            ok: false,
            message: mountItemResult.message || "No se pudo entregar el item de montura.",
            mountItemAdded: false,
        };
    }

    const itemName = vars.datObj?.[mountItemId]?.name ?? mountType.name;
    return {
        ok: true,
        message: `El huevo eclosiono: obtuviste ${instance.name} #${instance.id.slice(0, 6)} y el item ${itemName}.`,
        mount: instance,
        mountItemAdded: Boolean(mountItemResult.added),
        mountItemMessage: mountItemResult.message,
    };
}

export function transferMountForItem(fromUser: MountUser, toUser: MountUser, itemId: number) {
    const mountTypeId = getMountTypeIdFromItem(itemId);
    const mountType = getType(mountTypeId);
    if (!mountType) {
        return { ok: true, message: "" };
    }

    return { ok: false, message: "Las mascotas vinculadas no se pueden comerciar." };
}

export function validateMountTransferForItem(fromUser: MountUser, toUser: MountUser, itemId: number) {
    const mountTypeId = getMountTypeIdFromItem(itemId);
    if (!getType(mountTypeId)) {
        return { ok: true, message: "" };
    }

    return { ok: false, message: "Los items de montura no se pueden comerciar." };
}

export function applyOutgoingDamage(
    user: MountUser,
    damage: number,
    kind: "melee" | "ranged" | "magic" = "melee",
    targetIsNpc = false,
): number {
    if (!user?.mounted) {
        return damage;
    }

    const mount = resolveActiveMount(user);
    if (!mount) {
        return damage;
    }

    const bonuses = getActiveMountTalentBonuses(mount);

    if (targetIsNpc) {
        return damage;
    }

    // PvP: percentage talents + tiny legacy stat contribution (capped together via pvp cap)
    const legacyStat =
        kind === "ranged" ? mount.rangedAttack : kind === "magic" ? mount.magicAttack : mount.meleeAttack;
    const withLegacy = Math.max(1, Math.floor(damage * (1 + getMountPvpDamageBonus(Math.max(0, legacyStat) / 1000))));
    return applyMountOutgoingPvpDamage(withLegacy, bonuses, kind);
}

export function rollNpcAttackDamage(
    user: MountUser,
    baseDamage: number,
    kind: "melee" | "ranged" | "magic" = "melee",
) {
    if (!user?.mounted) {
        return { damage: 0, mount: null as MountInstance | null };
    }

    const mount = resolveActiveMount(user);
    if (!mount) {
        return { damage: 0, mount };
    }

    const stat = kind === "ranged" ? mount.rangedAttack : kind === "magic" ? mount.magicAttack : mount.meleeAttack;
    if (Math.max(0, Number(stat ?? 0)) <= 0) {
        return { damage: 0, mount };
    }

    const bonuses = getActiveMountTalentBonuses(mount);
    const percent = kind === "magic" ? Math.max(bonuses.pveMagic, bonuses.pve) : bonuses.pve;
    const talentDamage = Math.floor(Math.max(0, Number(baseDamage ?? 0)) * getMountPveDamageBonus(percent));
    const damage = Math.max(0, Math.floor(Number(mount.npcDamage ?? 0)) + talentDamage);

    return {
        damage,
        mount,
    };
}

export function applyIncomingMountDamage(
    user: MountUser,
    damage: number,
    kind: "melee" | "ranged" | "magic",
    fromNpc = false,
): number {
    if (!user?.mounted) {
        return damage;
    }
    const mount = resolveActiveMount(user);
    if (!mount) {
        return damage;
    }
    const bonuses = getActiveMountTalentBonuses(mount);
    const evasion = getMountEvasionChance(bonuses);
    if (evasion > 0 && Math.random() < evasion) {
        return 0;
    }
    let next = applyMountIncomingDamage(damage, bonuses, kind);
    if (fromNpc) {
        next = applyMountNpcDamageReduction(next, bonuses);
    }
    return next;
}

export function resolveMountReference(user: MountUser, ref: string): MountInstance | null {
    const owned = listOwned(user);
    const raw = String(ref ?? "").trim().toLowerCase();
    if (!raw) {
        return null;
    }
    const byIndex = Number(raw);
    if (Number.isInteger(byIndex) && byIndex >= 1 && byIndex <= owned.length) {
        return owned[byIndex - 1] ?? null;
    }
    return (
        owned.find(
            (mount) =>
                mount.id.toLowerCase() === raw ||
                mount.id.toLowerCase().startsWith(raw) ||
                mount.name.toLowerCase() === raw,
        ) ?? null
    );
}

export function rideMountByRef(user: MountUser, ref: string) {
    const mount = resolveMountReference(user, ref);
    if (!mount) {
        return { ok: false, message: "No encontré esa mascota." };
    }
    setActiveMount(user, mount);
    const mountType = getType(mount.typeId);
    const bodyId = Number(mountType?.bodyId ?? 0);
    const itemId = Number(mountType?.itemId ?? 0);
    const hasItem = itemId > 0 && hasInventoryItem(user, itemId);
    return {
        ok: true,
        message: hasItem
            ? `Mascota activa: ${mount.name} #${mount.id.slice(0, 6)}. Usa el item de montura del inventario para montarte.`
            : `Mascota activa: ${mount.name} #${mount.id.slice(0, 6)}. No tenes el item de montura en el inventario.`,
        mount,
        bodyId,
        itemId,
    };
}

export function renameMount(user: MountUser, ref: string, newName: string) {
    const mount = resolveMountReference(user, ref);
    if (!mount) {
        return { ok: false, message: "No encontré esa mascota." };
    }
    const name = String(newName ?? "").trim().slice(0, 24);
    if (name.length < 2) {
        return { ok: false, message: "El nombre debe tener al menos 2 caracteres." };
    }
    mount.name = name;
    saveMountInstance(mount);
    return { ok: true, message: `Mascota renombrada a ${name}.`, mount };
}

export function releaseMount(user: MountUser, ref: string) {
    const mount = resolveMountReference(user, ref);
    if (!mount) {
        return { ok: false, message: "No encontré esa mascota." };
    }
    const owner = ownerKey(user);
    if (!owner) {
        return { ok: false, message: "No se pudo identificar el personaje." };
    }
    if (user.mounted && (user.mountInstanceId === mount.id || getProgress(user).activeMountInstanceId === mount.id)) {
        return { ok: false, message: "Desmontate antes de liberar esta mascota." };
    }
    deleteMountInstance(mount.id, owner);
    const progress = getProgress(user);
    if (progress.activeMountInstanceId === mount.id || user.mountInstanceId === mount.id) {
        setActiveMount(user, null);
    }
    return { ok: true, message: `Liberaste a ${mount.name}.`, mount };
}

export function assignStatPoint(user: MountUser, ref: string, statRef: string) {
    const stat = normalizeStatRef(statRef);
    if (!stat) {
        return {
            ok: false,
            message: "Stat invalida. Usa cuerpo, defcuerpo, proyectiles, defproyectiles, magia, defmagia o evasion.",
        };
    }

    const mount = resolveMountReference(user, ref);
    if (!mount) {
        return { ok: false, message: "No encontre esa mascota." };
    }

    const freePoints = Math.max(0, Math.floor(Number(mount.freeStatPoints ?? 0)));
    if (freePoints <= 0) {
        return { ok: false, message: `${mount.name} no tiene puntos libres.` };
    }

    mount[stat] = Math.max(0, Number(mount[stat] ?? 0)) + 1;
    mount.freeStatPoints = freePoints - 1;
    saveMountInstance(mount);
    return {
        ok: true,
        message: `Asignaste 1 punto a ${describeStat(stat)} de ${mount.name}.`,
        mount,
    };
}

function describeStat(stat: AssignableMountStat) {
    switch (stat) {
        case "meleeAttack":
            return "Ataque cuerpo";
        case "meleeDefense":
            return "Defensa cuerpo";
        case "rangedAttack":
            return "Ataque proyectiles";
        case "rangedDefense":
            return "Defensa proyectiles";
        case "magicAttack":
            return "Ataque magico";
        case "magicDefense":
            return "Defensa magica";
        case "evasion":
            return "Evasion";
        default:
            return stat;
    }
}

export function transferMountByInstanceId(
    fromUser: MountUser,
    toUser: MountUser,
    instanceId: string,
) {
    return { ok: false, message: "Las mascotas vinculadas no se pueden comerciar." };
}

export function validateMountTransferByInstanceId(
    fromUser: MountUser,
    toUser: MountUser,
    instanceId: string,
) {
    return { ok: false, message: "Las mascotas vinculadas no se pueden comerciar." };
}

export type MountStateEntry = {
    id: string;
    shortId: string;
    typeId: number;
    name: string;
    speciesName: string;
    level: number;
    exp: number;
    expRequired: number;
    maxLevel: number;
    npcDamage: number;
    vida: number;
    freeStatPoints: number;
    meleeAttack: number;
    meleeDefense: number;
    rangedAttack: number;
    rangedDefense: number;
    magicAttack: number;
    magicDefense: number;
    evasion: number;
    bodyId: number;
    itemId: number;
    active: boolean;
    mounted: boolean;
    perks: Array<{ milestone: number; id: string; label: string }>;
};

export function buildMountState(user: MountUser) {
    const owned = listOwned(user);
    const activeId = user.mountInstanceId || getProgress(user).activeMountInstanceId;
    const entries: MountStateEntry[] = owned.map((mount) => {
        const mountType = getType(mount.typeId);
        const maxLevel = mountType?.topeLevel ?? 30;
        return {
            id: mount.id,
            shortId: mount.id.slice(0, 6).toUpperCase(),
            typeId: mount.typeId,
            name: mount.name,
            speciesName: mountType?.name ?? `Tipo ${mount.typeId}`,
            level: mount.level,
            exp: mount.exp,
            expRequired: mount.level >= maxLevel ? 0 : getMountExpRequired(mount.level),
            maxLevel,
            npcDamage: mount.npcDamage,
            vida: mount.vida,
            freeStatPoints: Math.max(0, Number(mount.freeStatPoints ?? 0)),
            meleeAttack: mount.meleeAttack,
            meleeDefense: mount.meleeDefense,
            rangedAttack: mount.rangedAttack,
            rangedDefense: mount.rangedDefense,
            magicAttack: mount.magicAttack,
            magicDefense: mount.magicDefense,
            evasion: mount.evasion,
            bodyId: Number(mountType?.bodyId ?? 0),
            itemId: Number(mountType?.itemId ?? 0),
            active: mount.id === activeId,
            mounted: Boolean(user.mounted) && mount.id === activeId,
            perks: (
                [
                    [10, mount.perks.level10],
                    [20, mount.perks.level20],
                    [30, mount.perks.level30],
                ] as const
            )
                .filter(([, id]) => Boolean(id))
                .map(([milestone, id]) => ({
                    milestone,
                    id: String(id),
                    label: describeTalentId(String(id)),
                })),
        };
    });

    return {
        maxOwned: MAX_OWNED_MOUNTS,
        mounts: entries,
        hatchPool: Array.from(mountTypes.values()).map((mountType) => ({
            typeId: mountType.id,
            weight: 1,
            name: mountType.name,
            bodyId: mountType.bodyId ?? 0,
            eggItemId: mountType.eggItemId ?? 0,
        })),
    };
}

export function sendMountState(idUser: string) {
    const user = vars.personajes[idUser] as MountUser | undefined;
    const client = vars.clients[idUser];
    if (!user || !client || typeof handleProtocol.mountState !== "function") {
        return;
    }
    handleProtocol.mountState(buildMountState(user), client);
}

export function onNpcKilled(idUser: string, npcRewardExp = 0) {
    const user = vars.personajes[idUser] as MountUser | undefined;
    if (!user?.mounted) {
        return;
    }

    const mount = resolveActiveMount(user);
    const mountType = mount ? getType(mount.typeId) : null;
    if (!mount || !mountType || mount.level >= mountType.topeLevel) {
        return;
    }

    const gainedExp = getMountExpFromNpcReward(npcRewardExp);

    if (!gainedExp) {
        return;
    }

    mount.exp += gainedExp;
    tell(idUser, `Tu mascota ${mount.name} ha conseguido ${gainedExp} puntos de experiencia.`);

    while (mount.level < mountType.topeLevel && mount.exp >= getMountExpRequired(mount.level)) {
        mount.exp -= getMountExpRequired(mount.level);
        mount.level += 1;
        applyRoll(mount, createRoll(mountType, mount.level, "level"));
        assignMissingPerks(mount);
        tell(idUser, `Has subido de nivel tu mascota ${mount.name} al nivel ${mount.level}.`);
    }

    saveMountInstance(mount);
    sendMountState(idUser);
}

export function describeMount(idUser: string) {
    const user = vars.personajes[idUser] as MountUser | undefined;
    if (!user) {
        return;
    }

    const entries = listOwned(user);
    if (!entries.length) {
        tell(idUser, "Aun no tienes mascotas. Doma una criatura o abre un huevo de montura.");
        sendMountState(idUser);
        return;
    }

    for (const mount of entries) {
        const mountType = getType(mount.typeId);
        const active = mount.id === (user.mountInstanceId || getProgress(user).activeMountInstanceId) && user.mounted ? " [activa]" : "";
        const nextExp = mount.level >= (mountType?.topeLevel ?? 30) ? 0 : getMountExpRequired(mount.level);
        const perks = [mount.perks.level10, mount.perks.level20, mount.perks.level30]
            .filter(Boolean)
            .map((id) => describeTalentId(String(id)))
            .join(", ");
        tell(
            idUser,
            `${mount.name} #${mount.id.slice(0, 6)}${active}: nivel ${mount.level}/${mountType?.topeLevel ?? 30} exp ${mount.exp}/${nextExp} puntos libres ${Math.max(0, Number(mount.freeStatPoints ?? 0))}${perks ? ` talentos ${perks}` : ""}`,
        );
    }
    sendMountState(idUser);
}

export function initialize() {
    const loaded = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, "../jsons/mountTypes.json"), "utf8"),
    ) as Record<string, MountType>;
    talentTable = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, "../jsons/mountTalentTable.json"), "utf8"),
    ) as Record<string, Record<string, string[]>>;
    mountTypes.clear();
    eggItemsToType.clear();
    for (const mountType of Object.values(loaded)) {
        mountTypes.set(Number(mountType.id), { ...mountType, topeLevel: 30, expStep: 400 });
        if (mountType.eggItemId) {
            eggItemsToType.set(Number(mountType.eggItemId), Number(mountType.id));
        }
    }

    console.log(`[Monturas] Cargados ${mountTypes.size} tipos de mascota.`);
}
