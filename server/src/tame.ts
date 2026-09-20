const game = require("./game");
const vars = require("./vars");

function nearbyDomable(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return null;
    }

    const targetId = user.targetNpcId;
    if (targetId && vars.npcs[targetId] && Number(vars.npcs[targetId].map) === Number(user.map)) {
        return vars.npcs[targetId];
    }

    let closest: { npc: any; distance: number } | null = null;
    for (const npc of Object.values(vars.npcs) as any[]) {
        if (!npc || Number(npc.map) !== Number(user.map) || !npc.pos) {
            continue;
        }

        const distance = Math.round(Math.hypot(user.pos.x - npc.pos.x, user.pos.y - npc.pos.y));
        if (distance > 3) {
            continue;
        }

        if (!closest || distance < closest.distance) {
            closest = { npc, distance };
        }
    }

    return closest?.npc ?? null;
}

function mountItemForNpc(npc: any) {
    const domable = Number(npc.domable ?? npc.flags?.domable ?? 0);
    const fromFlag = domable > 0 ? domable + 387 : 0;
    if (fromFlag && vars.datObj?.[fromFlag]) {
        return fromFlag;
    }

    const subtipo = Number(npc.subtipo ?? 0);
    if (subtipo > 0) {
        for (const [rawId, obj] of Object.entries(vars.datObj ?? {}) as Array<[string, any]>) {
            if (Number(obj?.objType) === vars.objType.mascotas && Number(obj?.subtipo) === subtipo) {
                return Number(rawId);
            }
        }
    }

    return 0;
}

export function doTame(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return { ok: false, message: "No se pudo domar." };
    }

    if (user.dead) {
        return { ok: false, message: "No puedes domar estando muerto." };
    }

    const npc = nearbyDomable(idUser);
    if (!npc) {
        return { ok: false, message: "Acercate a una criatura y usa /domar." };
    }

    const isMount = Number(npc.npcType ?? npc.NPCtype ?? 0) === vars.objType.mascotas || Number(npc.npcType) === 60;
    const domable = Number(npc.domable ?? npc.flags?.domable ?? 0);
    if (!isMount && domable <= 0) {
        return { ok: false, message: "Esa criatura no es domable." };
    }

    const isTamer = Number(user.idClase) === vars.clases.domador;
    if (!isTamer && Number(user.level ?? 0) < 20) {
        return { ok: false, message: "Necesitas ser Domador o tener nivel 20." };
    }

    const chance = isTamer ? 35 : 18;
    if (Math.floor(Math.random() * 100) + 1 > chance) {
        return { ok: false, message: "La criatura se resiste." };
    }

    const itemId = mountItemForNpc(npc);
    if (!itemId) {
        return { ok: false, message: "No hay un item de mascota para esa criatura." };
    }

    const already = Object.values(user.inv ?? {}).some((item: any) => Number(item?.idItem) === itemId);
    if (already) {
        return { ok: false, message: "Ya tienes esa clase de mascota." };
    }

    game.putItemToInv(idUser, itemId, 1);
    require("./mounts").prepareMount(user, itemId);
    require("./npcs").muereNpc(npc.id);
    const name = vars.datObj?.[itemId]?.name ?? npc.nameCharacter ?? "mascota";
    return { ok: true, message: `Has domado a ${name}.` };
}
