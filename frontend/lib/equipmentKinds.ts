import type { InventoryItem } from "./aowProtocol";
import type { ObjectsDB } from "../types/game";

// Lugar de equipo de un objeto. Mismas reglas que el server (vars.objType e
// itemKinds.ts): los cascos y escudos nuevos son armaduras con subtipo 1 y 2,
// y las botas (subtipo 3) van en el lugar de la armadura. El inventario que
// manda el server trae el objType crudo, así que el subtipo sale de objs.json.
export type EquipmentKind =
    "casco" | "armadura" | "accesorio" | "arma" | "escudo" | "flechas";

// Mismos tipos que el server (vars.objType e itemKinds.ts): los cascos y
// escudos nuevos son armaduras con subtipo 1 y 2; las botas (subtipo 3) van
// en el lugar de la armadura.
const OBJ = {
    armas: 2,
    armaduras: 3,
    escudos: 16,
    cascos: 17,
    anillos: 18,
    flechas: 32,
    anillosLegacy: 41,
};

export function getEquipmentKind(
    objType: number | undefined,
    subtipo: number | undefined,
    cosmetico?: number,
): EquipmentKind | null {
    if (Number(cosmetico ?? 0) === 1) {
        return null;
    }

    const type = Number(objType ?? 0);
    const sub = Number(subtipo ?? 0);

    if (type === OBJ.cascos || (type === OBJ.armaduras && sub === 1)) {
        return "casco";
    }

    if (type === OBJ.escudos || (type === OBJ.armaduras && sub === 2)) {
        return "escudo";
    }

    if (type === OBJ.armaduras) {
        return "armadura";
    }

    if (type === OBJ.armas) {
        return "arma";
    }

    if (type === OBJ.flechas) {
        return "flechas";
    }

    if (type === OBJ.anillos || type === OBJ.anillosLegacy) {
        return "accesorio";
    }

    return null;
}

export function getInventoryItemEquipmentKind(
    item: InventoryItem | null | undefined,
    objectsDB: ObjectsDB | null,
): EquipmentKind | null {
    if (!item) {
        return null;
    }

    const definition = objectsDB?.[String(item.idItem)] as
        { objType?: number; subtipo?: number; cosmetico?: number } | undefined;

    return getEquipmentKind(
        definition?.objType ?? item.objType,
        definition?.subtipo,
        definition?.cosmetico,
    );
}

const KIND_BY_PACKET_OBJECT_TYPE: Record<number, EquipmentKind> = {
    2: "arma",
    3: "armadura",
    16: "escudo",
    17: "casco",
    18: "accesorio",
    32: "flechas",
};

/** Lugar que actualiza un paquete changeX del server (objType del paquete). */
export function getEquipmentKindForPacketObjectType(
    objType: number,
): EquipmentKind | null {
    return KIND_BY_PACKET_OBJECT_TYPE[objType] ?? null;
}

// Qué hace el doble click (o el botón de usar) sobre algo equipado: las armas
// a distancia disparan, las herramientas de trabajo se usan (con la caña se
// empieza a pescar) y el resto se saca. Las herramientas son objType 18 y el
// server las reconoce por nombre o id (fishing.ts, harvesting.ts y crafting.ts).
export type EquippedItemAction = "disparar" | "usar" | "sacar";

const WORK_TOOL_NAME =
    /caña de pescar|red de pesca|hacha de leñ|piquet[ea] de minero|pico de minero|serrucho|costurero|martillo de herrero/i;

export function getEquippedItemAction(
    item: InventoryItem,
    objectsDB: ObjectsDB | null,
): EquippedItemAction {
    const definition = objectsDB?.[String(item.idItem)] as
        { objType?: number; proyectil?: number } | undefined;

    if (Number(definition?.proyectil ?? 0) > 0) {
        return "disparar";
    }

    if (
        Number(definition?.objType ?? item.objType) === OBJ.anillos &&
        WORK_TOOL_NAME.test(item.name)
    ) {
        return "usar";
    }

    return "sacar";
}
