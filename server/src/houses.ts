const vars = require("./vars");
const { getProgress, saveProgress } = require("./woaoProgress");

function keyItems(user: { inv?: Record<string, { idItem?: number }> }) {
    const keys: number[] = [];
    for (const item of Object.values(user.inv ?? {})) {
        const obj = vars.datObj?.[Number(item?.idItem ?? 0)];
        if (Number(obj?.objType) === vars.objType.llaves) {
            keys.push(Number(item.idItem));
        }
    }
    return keys;
}

export function canOpenLockedDoor(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return false;
    }

    const owned = new Set(getProgress(user).houseKeys ?? []);
    const carried = keyItems(user);
    if (!carried.length && !owned.size) {
        return false;
    }

    let changed = false;
    for (const key of carried) {
        if (!owned.has(key)) {
            owned.add(key);
            changed = true;
        }
    }

    if (changed) {
        const progress = getProgress(user);
        progress.houseKeys = [...owned];
        saveProgress(user);
    }

    return true;
}

export function describeHouses(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return { ok: false, message: "No se pudieron listar las casas." };
    }

    const progress = getProgress(user);
    const keys = [...new Set([...(progress.houseKeys ?? []), ...keyItems(user)])];
    if (!keys.length) {
        return { ok: true, message: "No tenes llaves de casa. Compralas a un vendedor de propiedades." };
    }

    const names = keys.map((id) => vars.datObj?.[id]?.name ?? `Llave ${id}`);
    return { ok: true, message: `Casas: ${names.join(", ")}` };
}
