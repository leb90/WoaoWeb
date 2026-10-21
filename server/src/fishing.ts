import type { EntityId, FishingState, Position, RuntimeCharacter, RuntimeClient } from "./types/runtime";
import type { HandleProtocolApi } from "./handleProtocol";
import type { SocketApi } from "./socket";
import { getCharacterById, getClientById } from "./runtimeRegistry";
import {
    countOccupiedInventorySlots,
    findAvailableInventorySlot,
    isInventorySlot,
} from "./equipmentStorage";

export {};

const vars = require("./vars");
const handleProtocol = require("./handleProtocol") as HandleProtocolApi;
const socket = require("./socket") as SocketApi;
const workingLock = require("./workingLock");
const { isWaterGraphic } = require("./waterTiles");
const workProfessions = require("./workProfessions");

type FishingUser = RuntimeCharacter & {
    id: EntityId;
    nameCharacter: string;
    map: number;
    pos: Position;
    dead?: number | boolean;
    navegando?: number | boolean;
    level?: number;
    idClase?: number;
    hambre?: number;
    sed?: number;
    cerrado?: boolean;
    inv: Record<string, { idItem: number; cant: number; equipped?: number | boolean }>;
    idItemWeapon?: number | string;
    idItemRing?: number | string;
    fishing?: FishingState;
};

export type FishingApi = {
    isFishingRod: (idItem: number) => boolean;
    getRodPower: (idItem: number) => number;
    handleRodUse: (ws: RuntimeClient, idPos: number | string) => boolean;
    handleMapClick: (ws: RuntimeClient, x: number, y: number) => boolean;
    processTick: (now: number) => void;
    cancelFishing: (idUser: EntityId, reason?: string, keepTargeting?: boolean) => void;
};

function clonePosition(pos: Position): Position {
    return { x: pos.x, y: pos.y };
}

function getUser(idUser: EntityId) {
    return getCharacterById<FishingUser>(idUser);
}

function withUserClient(idUser: EntityId | null | undefined, callback: (client: RuntimeClient) => void) {
    const client = getClientById(idUser);

    if (!client) {
        return;
    }

    callback(client);
}

function clearFishingState(user: FishingUser, keepTargeting = false) {
    if (!keepTargeting) {
        user.fishing = undefined;
        return;
    }

    const state = user.fishing;

    if (!state) {
        return;
    }

    user.fishing = {
        pendingTarget: true,
        slot: state.slot,
        itemId: state.itemId,
        power: state.power,
    };
}

function isWithinMapBounds(x: number, y: number) {
    return x >= 1 && x <= 100 && y >= 1 && y <= 100;
}

function isWaterTile(idMap: number, pos: Position) {
    if (!isWithinMapBounds(pos.x, pos.y)) {
        return false;
    }

    const tile = vars.mapa[idMap]?.[pos.y]?.[pos.x];
    const graphicLayer1 = tile?.graphics?.[1] ?? 0;
    const graphicLayer2 = tile?.graphics?.[2] ?? 0;

    return isWaterGraphic(graphicLayer1) && !graphicLayer2;
}

function isAdjacentToWater(idMap: number, pos: Position) {
    return (
        isWaterTile(idMap, { x: pos.x + 1, y: pos.y }) ||
        isWaterTile(idMap, { x: pos.x - 1, y: pos.y }) ||
        isWaterTile(idMap, { x: pos.x, y: pos.y + 1 }) ||
        isWaterTile(idMap, { x: pos.x, y: pos.y - 1 })
    );
}

function hasInvalidFishingTrigger(idMap: number, pos: Position) {
    if (!isWithinMapBounds(pos.x, pos.y)) {
        return true;
    }

    return vars.mapa[idMap]?.[pos.y]?.[pos.x]?.trigger === vars.fishing.invalidTrigger;
}

function getEquippedFishingRod(user: FishingUser) {
    const slots = [Number(user.idItemRing ?? 0), Number(user.idItemWeapon ?? 0)];

    for (const slot of slots) {
        if (!slot) {
            continue;
        }

        const item = user.inv?.[slot];
        if (!item || !item.equipped || !fishing.isFishingRod(item.idItem)) {
            continue;
        }

        return {
            slot,
            itemId: item.idItem,
            power: fishing.getRodPower(item.idItem),
        };
    }

    return null;
}

function getSurvivalStopReason(user: FishingUser, starting = false) {
    if (Number(user.hambre ?? 0) <= 0) {
        return starting
            ? "No puedes pescar sin comida."
            : "La pesca se detuvo porque te quedaste sin comida.";
    }

    if (Number(user.sed ?? 0) <= 0) {
        return starting
            ? "No puedes pescar sin agua."
            : "La pesca se detuvo porque te quedaste sin agua.";
    }

    return null;
}

function pickOldFishingCatch() {
    const roll = Math.floor(Math.random() * 10) + 1;
    if (roll === 1) {
        return 1531;
    }
    if (roll === 2) {
        return 1534;
    }
    if (roll === 3) {
        return 1535;
    }
    if (roll === 4) {
        return 1532;
    }
    if (roll === 5) {
        return 1533;
    }
    return 1536;
}

function getFishingSkill(user: FishingUser) {
    return require("./skills").getSkill(user, require("./skills").SKILLS.pesca);
}

function getFishingRewardAmount(user: FishingUser) {
    return workProfessions.getFishingCatchAmount(user);
}

function addRewardToInventory(user: FishingUser, itemId: number, amount: number) {
    for (const [slot, item] of Object.entries(user.inv)) {
        if (
            isInventorySlot(slot) &&
            item.idItem === itemId &&
            item.cant + amount <= 10000
        ) {
            item.cant += amount;
            withUserClient(user.id, (userClient) => {
                handleProtocol.agregarUserInvItem(user.id, slot, userClient);
            });
            return true;
        }
    }

    if (countOccupiedInventorySlots(user.inv) >= 21) {
        return false;
    }

    const nextSlot = findAvailableInventorySlot(user.inv);

    user.inv[nextSlot] = {
        idItem: itemId,
        cant: amount,
        equipped: 0,
    };
    withUserClient(user.id, (userClient) => {
        handleProtocol.agregarUserInvItem(user.id, nextSlot, userClient);
    });
    return true;
}

function validateFishingStart(user: FishingUser, target: Position) {
    if (!getEquippedFishingRod(user)) {
        return "Debes tener equipada una caña de pescar.";
    }

    if (!isWaterTile(user.map, target)) {
        return "Zona de pesca no autorizada. Busca otro lugar para hacerlo.";
    }

    if (user.navegando) {
        if (!isWaterTile(user.map, user.pos)) {
            return "Debes estar navegando sobre el agua para pescar desde la barca.";
        }
    } else if (isWaterTile(user.map, user.pos) || !isAdjacentToWater(user.map, user.pos)) {
        return "Acércate a la costa para pescar.";
    }

    if (hasInvalidFishingTrigger(user.map, user.pos) || hasInvalidFishingTrigger(user.map, target)) {
        return "Zona de pesca no autorizada. Busca otro lugar para hacerlo.";
    }

    if (Math.abs(user.pos.x - target.x) > 1 || Math.abs(user.pos.y - target.y) > 1) {
        return "Debes seleccionar una casilla de agua cercana para pescar.";
    }

    return null;
}

const fishing: FishingApi = {
    isFishingRod(idItem) {
        return Boolean(vars.fishing.rods?.[idItem]);
    },

    getRodPower(idItem) {
        return vars.fishing.rods?.[idItem]?.power ?? 1;
    },

    handleRodUse(ws, idPos) {
        const user = getUser(ws.id!);

        if (!user) {
            return false;
        }

        const item = user.inv?.[idPos];

        if (!item || !this.isFishingRod(item.idItem)) {
            return false;
        }

        if (!item.equipped) {
            handleProtocol.console("Debes equiparte la caña de pescar para usarla.", "white", 0, 0, ws);
            return true;
        }

        if (user.fishing?.active) {
            this.cancelFishing(user.id, "Has dejado de pescar.");
            return true;
        }

        user.fishing = {
            pendingTarget: true,
            slot: Number(idPos),
            itemId: item.idItem,
            power: this.getRodPower(item.idItem),
        };
        handleProtocol.console("Selecciona una casilla de agua cercana para pescar.", "#fcd34d", 0, 0, ws);
        return true;
    },

    handleMapClick(ws, x, y) {
        const user = getUser(ws.id!);
        const state = user?.fishing;

        if (!user || !state?.pendingTarget) {
            return false;
        }

        const hungerError = getSurvivalStopReason(user, true);
        if (hungerError) {
            handleProtocol.console(hungerError, "white", 0, 0, ws);
            return true;
        }

        const validationError = validateFishingStart(user, { x, y });

        if (validationError) {
            handleProtocol.console(validationError, "white", 0, 0, ws);
            return true;
        }

        const equippedRod = getEquippedFishingRod(user);

        if (!equippedRod) {
            clearFishingState(user);
            handleProtocol.console("Debes tener equipada una caña de pescar.", "white", 0, 0, ws);
            return true;
        }

        if (workingLock.hasAnotherActiveWorkOnSameIp(user.id)) {
            handleProtocol.console("Ya tienes otro personaje trabajando desde esta IP.", "white", 0, 0, ws);
            return true;
        }

        const startedAt = Date.now();

        user.fishing = {
            active: true,
            pendingTarget: false,
            slot: equippedRod.slot,
            itemId: equippedRod.itemId,
            power: equippedRod.power,
            target: { x, y },
            origin: clonePosition(user.pos),
            startedAt,
            nextTickAt: startedAt + vars.timing.fishingTickMs,
        };

        socket.loopArea(user.id, (target) => {
            if (!target.isNpc) {
                withUserClient(target.id, (targetClient) => {
                    handleProtocol.playSound(user.id, vars.arSounds.SND_PESCAR, targetClient);
                });
            }
        });

        handleProtocol.console("Comienzas a pescar.", "#7dd3fc", 0, 0, ws);
        return true;
    },

    processTick(now) {
        for (const idUser in vars.personajes) {
            const user = getUser(idUser);
            const state = user?.fishing;

            if (!user || !state?.active || !state.nextTickAt || now < state.nextTickAt) {
                continue;
            }

            if (!getClientById(idUser) || user.cerrado) {
                this.cancelFishing(idUser);
                continue;
            }

            if (workingLock.shouldCancelForSameIpConflict(idUser)) {
                this.cancelFishing(
                    idUser,
                    "La pesca se canceló porque ya tienes otro personaje trabajando desde esta IP.",
                );
                continue;
            }

            const survivalStop = getSurvivalStopReason(user);
            if (survivalStop) {
                this.cancelFishing(idUser, survivalStop);
                continue;
            }

            if (
                user.dead ||
                !state.origin ||
                user.pos.x !== state.origin.x ||
                user.pos.y !== state.origin.y ||
                !state.target
            ) {
                this.cancelFishing(idUser, "La pesca se canceló.");
                continue;
            }

            const equippedRod = getEquippedFishingRod(user);

            if (!equippedRod || equippedRod.itemId !== state.itemId) {
                this.cancelFishing(idUser, "La pesca se canceló porque ya no tienes la caña equipada.");
                continue;
            }

            if (validateFishingStart(user, state.target)) {
                this.cancelFishing(idUser, "La pesca se canceló porque ya no estás en una posición válida.");
                continue;
            }

            state.nextTickAt = now + vars.timing.fishingTickMs;

            if (!require("./skills").rollOldGatherSuccess(getFishingSkill(user), "pesca")) {
                continue;
            }

            const rewardItemId = pickOldFishingCatch();
            const rewardAmount = getFishingRewardAmount(user);

            if (!addRewardToInventory(user, rewardItemId, rewardAmount)) {
                withUserClient(idUser, (userClient) => {
                    handleProtocol.console("Tienes el inventario lleno.", "white", 0, 0, userClient);
                });
                this.cancelFishing(idUser, "La pesca se detuvo porque no tienes espacio en el inventario.");
                continue;
            }

            require("./skills").applyTraining(user, require("./skills").SKILLS.pesca);

            withUserClient(idUser, (userClient) => {
                handleProtocol.console(
                    `Has pescado ${rewardAmount} ${vars.datObj[rewardItemId]?.name ?? "pez"}.`,
                    "#86efac",
                    0,
                    0,
                    userClient,
                );
            });
            socket.loopArea(idUser, (target) => {
                if (!target.isNpc) {
                    withUserClient(target.id, (targetClient) => {
                        handleProtocol.playSound(idUser, vars.arSounds.SND_PESCAR, targetClient);
                    });
                }
            });
        }
    },

    cancelFishing(idUser, reason, keepTargeting = false) {
        const user = getUser(idUser);
        const wasActive = Boolean(user?.fishing?.active);

        if (!user?.fishing) {
            return;
        }

        clearFishingState(user, keepTargeting);

        if (reason && wasActive) {
            withUserClient(idUser, (userClient) => {
                handleProtocol.console(reason, "white", 0, 0, userClient);
            });
        }
    },
};

module.exports = fishing;
