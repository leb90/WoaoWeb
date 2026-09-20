import fs from "node:fs";
import path from "node:path";
import { getProgress, saveProgress, type MountProgress } from "./woaoProgress";

const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const funct = require("./functions");

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
    expStep: number;
};

const mountTypes = new Map<number, MountType>();

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(message, "#E69500", 1, 0, client);
    }
}

function expForLevel(mountType: MountType, level: number) {
    return Math.max(1, mountType.expStep * Math.max(1, level));
}

function ensureMount(user: { _id?: unknown; id?: unknown }, mountTypeId: number, name: string): MountProgress {
    const progress = getProgress(user);
    const key = String(mountTypeId);
    const mountType = mountTypes.get(mountTypeId);
    const existing = progress.mounts[key];
    if (existing) {
        return existing;
    }

    const created: MountProgress = {
        nivel: 1,
        exp: 0,
        elu: mountType ? expForLevel(mountType, 1) : 400,
        vida: mountType?.vidaPorLevel ?? 20,
        golpe: mountType?.golpePorLevel ?? 8,
        name,
    };
    progress.mounts[key] = created;
    saveProgress(user);
    return created;
}

export function getMountTypeIdFromItem(itemId: number): number {
    const obj = vars.datObj?.[itemId];
    return Number(obj?.subtipo ?? 0);
}

export function prepareMount(user: { _id?: unknown; id?: unknown; mountTypeId?: number }, itemId: number) {
    const mountTypeId = getMountTypeIdFromItem(itemId);
    if (mountTypeId <= 0) {
        user.mountTypeId = 0;
        return;
    }

    const mountType = mountTypes.get(mountTypeId);
    ensureMount(user, mountTypeId, mountType?.name ?? vars.datObj?.[itemId]?.name ?? "Montura");
    user.mountTypeId = mountTypeId;
}

export function applyOutgoingDamage(
    user: { mounted?: number; mountTypeId?: number; _id?: unknown; id?: unknown },
    damage: number,
    kind: "melee" | "ranged",
): number {
    if (!user?.mounted || !user.mountTypeId) {
        return damage;
    }

    const mountType = mountTypes.get(Number(user.mountTypeId));
    const mount = getProgress(user).mounts[String(user.mountTypeId)];
    if (!mountType || !mount) {
        return damage;
    }

    const bonus =
        mount.golpe +
        (kind === "ranged" ? mountType.aumentoFlecha : mountType.aumentoCuerpo);
    return Math.max(1, damage + Math.floor(bonus / 2));
}

export function onNpcKilled(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user?.mounted || !user.mountTypeId) {
        return;
    }

    const mountType = mountTypes.get(Number(user.mountTypeId));
    const progress = getProgress(user);
    const mount = progress.mounts[String(user.mountTypeId)];
    if (!mountType || !mount) {
        return;
    }

    if (mount.nivel >= mountType.topeLevel) {
        return;
    }

    mount.exp += 15;
    if (mount.exp >= mount.elu) {
        mount.nivel += 1;
        mount.exp = 0;
        mount.elu = expForLevel(mountType, mount.nivel);
        mount.vida += funct.randomIntFromInterval(
            Math.ceil(mountType.vidaPorLevel / 2),
            mountType.vidaPorLevel,
        );
        mount.golpe += funct.randomIntFromInterval(
            Math.ceil(mountType.golpePorLevel / 2),
            mountType.golpePorLevel,
        );
        tell(idUser, `Has subido de nivel tu mascota ${mount.name} al nivel ${mount.nivel}.`);
    }

    saveProgress(user);
}

export function describeMount(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return;
    }

    const progress = getProgress(user);
    const entries = Object.entries(progress.mounts);
    if (!entries.length) {
        tell(idUser, "Aun no tienes mascotas entrenadas. Usa un item de montura para comenzar.");
        return;
    }

    for (const [typeId, mount] of entries) {
        const mountType = mountTypes.get(Number(typeId));
        const active = Number(user.mountTypeId) === Number(typeId) && user.mounted ? " [montada]" : "";
        tell(
            idUser,
            `${mount.name}${active}: nivel ${mount.nivel}/${mountType?.topeLevel ?? "?"} exp ${mount.exp}/${mount.elu} golpe ${mount.golpe} vida ${mount.vida}`,
        );
    }

    tell(idUser, `Puntos de canje: ${progress.puntosCanje}`);
}

export function initialize() {
    const loaded = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, "../jsons/mountTypes.json"), "utf8"),
    ) as Record<string, MountType>;

    mountTypes.clear();
    for (const mountType of Object.values(loaded)) {
        mountTypes.set(Number(mountType.id), mountType);
    }

    console.log(`[Monturas] Cargados ${mountTypes.size} tipos de mascota.`);
}
