export {};

const vars = require("./vars");

const LEGACY_RING_OBJECT_TYPE = 41;
const HELMET_ARMOR_SUBTYPE = 1;
const SHIELD_ARMOR_SUBTYPE = 2;

type EquipObject = {
    objType?: number;
    subtipo?: number;
} | null | undefined;

function isHelmetObject(obj: EquipObject): boolean {
    if (!obj) {
        return false;
    }

    return (
        Number(obj.objType) === vars.objType.cascos ||
        (Number(obj.objType) === vars.objType.armaduras &&
            Number(obj.subtipo) === HELMET_ARMOR_SUBTYPE)
    );
}

function isRingObject(obj: EquipObject): boolean {
    if (!obj) {
        return false;
    }

    return (
        Number(obj.objType) === vars.objType.anillos ||
        Number(obj.objType) === LEGACY_RING_OBJECT_TYPE
    );
}

function isShieldObject(obj: EquipObject): boolean {
    if (!obj) {
        return false;
    }

    return (
        Number(obj.objType) === vars.objType.escudos ||
        (Number(obj.objType) === vars.objType.armaduras &&
            Number(obj.subtipo) === SHIELD_ARMOR_SUBTYPE)
    );
}

function getEquipObjectType(obj: EquipObject): number {
    if (isHelmetObject(obj)) {
        return vars.objType.cascos;
    }

    if (isShieldObject(obj)) {
        return vars.objType.escudos;
    }

    if (isRingObject(obj)) {
        return vars.objType.anillos;
    }

    return Number(obj?.objType ?? 0);
}

module.exports = {
    isHelmetObject,
    isShieldObject,
    isRingObject,
    getEquipObjectType,
};
