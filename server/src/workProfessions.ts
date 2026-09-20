export {};

const vars = require("./vars");

function getClassId(user: { idClase?: number } | null | undefined) {
    return Number(user?.idClase ?? 0);
}

function randomAmount(maxAmount: number) {
    return Math.floor(Math.random() * Math.max(1, maxAmount)) + 1;
}

function getWorkSkill(user: { skills?: unknown; skillPts?: unknown; level?: number; idClase?: number } | null | undefined, skillId: number) {
    return require("./skills").getSkill(user, skillId);
}

function isPescador(user: { idClase?: number } | null | undefined) {
    return getClassId(user) === vars.clases.pescador;
}

function isLenador(user: { idClase?: number } | null | undefined) {
    return getClassId(user) === vars.clases.lenador;
}

function isMinero(user: { idClase?: number } | null | undefined) {
    return getClassId(user) === vars.clases.minero;
}

function isHerrero(user: { idClase?: number } | null | undefined) {
    return getClassId(user) === vars.clases.herrero;
}

function isCarpintero(user: { idClase?: number } | null | undefined) {
    return getClassId(user) === vars.clases.carpintero;
}

function getNavegacionMod(idClase: number) {
    if (idClase === vars.clases.pirata) {
        return 1;
    }

    if (idClase === vars.clases.pescador) {
        return 1.2;
    }

    return 2.3;
}

function getRequiredNavegacionSkill(minSkill: number, idClase: number) {
    return Math.ceil(Math.max(0, minSkill) * getNavegacionMod(idClase));
}

function getFishingCatchAmount(user: { idClase?: number; level?: number } | null | undefined) {
    if (!isPescador(user)) {
        return 1;
    }

    return randomAmount(Math.max(1, Math.floor(Number(user?.level ?? 0) / 4)));
}

function getWoodcuttingAmount(user: { idClase?: number; level?: number } | null | undefined) {
    if (!isLenador(user)) {
        return 1;
    }

    return randomAmount(Math.max(1, Number(user?.level ?? 0) * 2));
}

function getMiningAmount(user: { idClase?: number; level?: number } | null | undefined) {
    if (!isMinero(user)) {
        return 1;
    }

    return randomAmount(Math.max(1, Number(user?.level ?? 0) * 2));
}

module.exports = {
    getWorkSkill,
    isPescador,
    isLenador,
    isMinero,
    isHerrero,
    isCarpintero,
    getNavegacionMod,
    getRequiredNavegacionSkill,
    getFishingCatchAmount,
    getWoodcuttingAmount,
    getMiningAmount,
};
