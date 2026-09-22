import type { HandleProtocolApi } from "./handleProtocol";
import type { SocketApi } from "./socket";
import type { EntityId, Position, RuntimeCharacter, RuntimeNpc } from "./types/runtime";

const vars = require("./vars");
const game = require("./game");
const handleProtocol = require("./handleProtocol") as HandleProtocolApi;
const socket = require("./socket") as SocketApi;

export const SUMMON_ROOM_MAP = 165;
export const SUMMON_ROOM_EXIT = { map: 110, x: 50, y: 50 };

const DEMON_NPC_INDEX = 585;
const TRIGGER_POSITIONS: Position[] = [
    { x: 18, y: 20 },
    { x: 24, y: 16 },
    { x: 24, y: 25 },
    { x: 29, y: 20 },
];

type SummonRoomState = {
    activeNpcId: EntityId | null;
};

const state: SummonRoomState = {
    activeNpcId: null,
};

function sameEntityId(left: EntityId | undefined, right: EntityId | undefined): boolean {
    return String(left ?? "") === String(right ?? "");
}

function isConnectedAliveUserAt(pos: Position): boolean {
    const occupantId = vars.mapData[SUMMON_ROOM_MAP]?.[pos.y]?.[pos.x]?.id;

    if (!occupantId) {
        return false;
    }

    const user = vars.personajes[occupantId] as RuntimeCharacter | undefined;
    const client = vars.clients[occupantId];

    return Boolean(
        user &&
            client &&
            !user.cerrado &&
            !user.dead &&
            Number(user.map) === SUMMON_ROOM_MAP &&
            Number(user.pos?.x) === pos.x &&
            Number(user.pos?.y) === pos.y,
    );
}

function allTriggerPositionsOccupied(): boolean {
    return TRIGGER_POSITIONS.every(isConnectedAliveUserAt);
}

function getActiveDemon(): RuntimeNpc | undefined {
    if (!state.activeNpcId) {
        return undefined;
    }

    const npc = vars.npcs[state.activeNpcId] as RuntimeNpc | undefined;

    if (
        npc &&
        Number(npc.map) === SUMMON_ROOM_MAP &&
        Number(npc.templateNpcIndex ?? 0) === DEMON_NPC_INDEX &&
        Number(npc.hp ?? 0) > 0
    ) {
        return npc;
    }

    state.activeNpcId = null;
    return undefined;
}

function findExistingDemon(): RuntimeNpc | undefined {
    for (const npc of Object.values(vars.npcs) as RuntimeNpc[]) {
        if (
            npc &&
            Number(npc.map) === SUMMON_ROOM_MAP &&
            Number(npc.templateNpcIndex ?? 0) === DEMON_NPC_INDEX &&
            Number(npc.hp ?? 0) > 0
        ) {
            state.activeNpcId = npc.id;
            return npc;
        }
    }

    return undefined;
}

function isValidDemonSpawn(pos: Position, datNpc: { aguaValida?: unknown; tierraInvalida?: unknown; movement?: unknown }) {
    return game.validInitialNpcSpawn(
        pos,
        SUMMON_ROOM_MAP,
        Boolean(datNpc.aguaValida),
        Number(datNpc.movement ?? 0),
        Boolean(datNpc.tierraInvalida),
    );
}

function resolveDemonSpawnPosition(datNpc: {
    aguaValida?: unknown;
    tierraInvalida?: unknown;
    movement?: unknown;
}): Position {
    const origin = TRIGGER_POSITIONS[0];

    for (let radius = 1; radius <= 8; radius++) {
        for (let y = origin.y - radius; y <= origin.y + radius; y++) {
            for (let x = origin.x - radius; x <= origin.x + radius; x++) {
                if (Math.max(Math.abs(x - origin.x), Math.abs(y - origin.y)) !== radius) {
                    continue;
                }

                const pos = { x, y };

                if (isValidDemonSpawn(pos, datNpc)) {
                    return pos;
                }
            }
        }
    }

    const respawn = game.respawnNpc(SUMMON_ROOM_MAP, Boolean(datNpc.aguaValida), Boolean(datNpc.tierraInvalida));
    return { x: Number(respawn.posNewX), y: Number(respawn.posNewY) };
}

function spawnDemon(): RuntimeNpc | undefined {
    const datNpc = vars.datNpc[DEMON_NPC_INDEX];

    if (!datNpc) {
        return undefined;
    }

    const loadNpcs = require("./loadNpcs");
    const loader = new loadNpcs();
    const beforeIds = new Set(Object.keys(vars.npcs));
    const spawnPos = resolveDemonSpawnPosition(datNpc);

    loader.createNpcInMap(
        {
            mapNum: SUMMON_ROOM_MAP,
            x: spawnPos.x,
            y: spawnPos.y,
            npcIndex: DEMON_NPC_INDEX,
            movement: datNpc.movement,
        },
        true,
    );

    const createdNpc = (Object.entries(vars.npcs) as Array<[string, RuntimeNpc]>).find(
        ([id, npc]) =>
            !beforeIds.has(id) &&
            npc &&
            Number(npc.map) === SUMMON_ROOM_MAP &&
            Number(npc.templateNpcIndex ?? 0) === DEMON_NPC_INDEX,
    )?.[1];

    if (!createdNpc) {
        return undefined;
    }

    state.activeNpcId = createdNpc.id;
    game.loopAreaPos(SUMMON_ROOM_MAP, createdNpc.pos, (target: RuntimeCharacter) => {
        const client = vars.clients[target.id];

        if (!client) {
            return;
        }

        handleProtocol.sendNpc(createdNpc as any);
        socket.send(client);
    });

    handleProtocol.consoleToAll("La sala de invocacion ha despertado.", "#E69500", 1, 0);
    return createdNpc;
}

export function tickSummonRoom(): void {
    if (getActiveDemon() || findExistingDemon()) {
        return;
    }

    if (!allTriggerPositionsOccupied()) {
        return;
    }

    spawnDemon();
}

export function onNpcDied(npc: RuntimeNpc | undefined): void {
    if (
        npc &&
        Number(npc.map) === SUMMON_ROOM_MAP &&
        Number(npc.templateNpcIndex ?? 0) === DEMON_NPC_INDEX &&
        (!state.activeNpcId || sameEntityId(npc.id, state.activeNpcId))
    ) {
        state.activeNpcId = null;
    }
}

export function getActiveDemonId(): EntityId | null {
    return getActiveDemon()?.id ?? null;
}

export function freezeActiveDemonForDebug() {
    const npc = getActiveDemon() ?? findExistingDemon();

    if (!npc) {
        return { ok: false, error: "No active summon room demon" };
    }

    npc.movement = 0;
    npc.inmovilizado = 1;
    npc.paralizado = 1;
    npc.cooldownParalizado = Date.now();
    npc.nextThinkAt = Date.now() + 60_000;
    npc.toPos = undefined;
    npc.pathTargetId = undefined;
    npc.pathTargetPos = undefined;
    npc.currentTargetId = undefined;

    return { ok: true, npcId: npc.id, pos: npc.pos };
}

export function scheduleDeadUserExit(idUser: EntityId): void {
    const user = vars.personajes[idUser] as RuntimeCharacter | undefined;

    if (!user || Number(user.map) !== SUMMON_ROOM_MAP) {
        return;
    }

    setTimeout(() => {
        const currentUser = vars.personajes[idUser] as RuntimeCharacter | undefined;
        const client = vars.clients[idUser];

        if (!currentUser || !client || !currentUser.dead || Number(currentUser.map) !== SUMMON_ROOM_MAP) {
            return;
        }

        game.telep(
            client,
            SUMMON_ROOM_EXIT.map,
            SUMMON_ROOM_EXIT.x,
            SUMMON_ROOM_EXIT.y,
            "summonRoom.deadUserExit",
        );
    }, 0);
}

export function getDebugSnapshot() {
    return {
        map: SUMMON_ROOM_MAP,
        triggers: TRIGGER_POSITIONS.map((pos) => {
            const occupantId = vars.mapData[SUMMON_ROOM_MAP]?.[pos.y]?.[pos.x]?.id;
            const user = occupantId ? (vars.personajes[occupantId] as RuntimeCharacter | undefined) : undefined;

            return {
                pos,
                occupantId: occupantId || 0,
                user: user
                    ? {
                          id: user.id,
                          name: user.nameCharacter,
                          map: user.map,
                          pos: user.pos,
                          dead: Boolean(user.dead),
                          connected: Boolean(vars.clients[occupantId]),
                          cerrado: Boolean(user.cerrado),
                      }
                    : null,
            };
        }),
        activeNpcId: state.activeNpcId,
        users: (Object.values(vars.personajes) as RuntimeCharacter[])
            .filter((user) => user?.nameCharacter)
            .map((user) => ({
                id: user.id,
                name: user.nameCharacter,
                map: user.map,
                pos: user.pos,
                dead: Boolean(user.dead),
                connected: Boolean(vars.clients[user.id]),
                cerrado: Boolean(user.cerrado),
            })),
        demons: (Object.values(vars.npcs) as RuntimeNpc[])
            .filter(
                (npc) =>
                    npc &&
                    Number(npc.map) === SUMMON_ROOM_MAP &&
                    Number(npc.templateNpcIndex ?? 0) === DEMON_NPC_INDEX,
            )
            .map((npc) => ({
                id: npc.id,
                name: npc.nameCharacter,
                map: npc.map,
                pos: npc.pos,
                hp: npc.hp,
                maxHp: npc.maxHp,
            })),
    };
}
