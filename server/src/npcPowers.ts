import type { EntityId, Position, RuntimeClient, RuntimeNpc } from "./types/runtime";

export {};

const vars = require("./vars");
const funct = require("./funct");
const socket = require("./socket");

const DARK_KNIGHT_TEMPLATE = 726;
const DARK_KNIGHT_MAP = 279;
const DARK_KNIGHT_MINIONS = [727, 728, 729, 730];
const DARK_KNIGHT_THRESHOLDS = [500000, 400000, 200000, 20000];
const MEND_AMOUNT = 300;
const WARP_FX_ID = 1;
const MEND_FX_ID = 31;

type PowerNpc = RuntimeNpc & {
    templateNpcIndex?: number;
    darkKnightWaves?: number;
    ephemeralSummon?: number;
    bossEventKey?: string;
    idBody?: number;
    idHead?: number;
    heading?: number;
};

type PowerAttacker = {
    id: EntityId;
    map: number;
    pos: Position;
    isNpc?: boolean;
};

function gameApi() {
    return require("./game");
}

function protocolApi() {
    return require("./handleProtocol");
}

function npcApi() {
    return require("./npcs");
}

function loginApi() {
    return require("./login");
}

function templateOf(npc: PowerNpc | undefined) {
    const templateIndex = Number(npc?.templateNpcIndex ?? 0);
    return vars.datNpc?.[templateIndex] ?? null;
}

function hasSpecialPower(npc: PowerNpc | undefined, power: number) {
    const template = templateOf(npc);
    const templateValue = Number(template?.[`poderEspecial${power}`] ?? 0);
    const runtimeValue = Number((npc as Record<string, unknown> | undefined)?.[`poderEspecial${power}`] ?? 0);

    return templateValue > 0 || runtimeValue > 0;
}

function randomInt(min: number, max: number) {
    return Number(funct.randomIntFromInterval(min, max));
}

function viewersAt(map: number, pos: Position) {
    const ids = new Set<string>();

    gameApi().loopAreaPos(map, pos, (target: { id: EntityId }) => {
        ids.add(String(target.id));
    });

    return ids;
}

function clientById(id: string) {
    return vars.clients?.[id] as RuntimeClient | undefined;
}

function sendNpcTo(ids: Set<string>, npc: PowerNpc) {
    const protocol = protocolApi();

    for (const id of ids) {
        const client = clientById(id);

        if (!client) {
            continue;
        }

        protocol.sendNpc(npc);
        socket.send(client);
    }
}

function deleteNpcFrom(ids: Set<string>, npcId: EntityId) {
    const protocol = protocolApi();

    for (const id of ids) {
        const client = clientById(id);

        if (!client) {
            continue;
        }

        protocol.deleteCharacter(npcId, client);
    }
}

function playFx(npc: PowerNpc, fxId: number) {
    const protocol = protocolApi();

    gameApi().loopAreaPos(npc.map, npc.pos, (target: { id: EntityId }) => {
        const client = clientById(String(target.id));

        if (!client) {
            return;
        }

        protocol.animFX(npc.id, fxId, client);
    });
}

function broadcastVitals(npc: PowerNpc) {
    const protocol = protocolApi();

    gameApi().loopAreaPos(npc.map, npc.pos, (target: { id: EntityId }) => {
        const client = clientById(String(target.id));

        if (!client) {
            return;
        }

        protocol.entityVitalsDelta(npc.id, Number(npc.hp ?? 0), Number(npc.maxHp ?? 0), 0, 0, client);
    });
}

function broadcastAppearance(npc: PowerNpc) {
    const ids = viewersAt(npc.map, npc.pos);

    for (const id of (vars.areaNpc?.[npc.id] ?? []) as EntityId[]) {
        ids.add(String(id));
    }

    sendNpcTo(ids, npc);
}

function tileOccupied(map: number, x: number, y: number) {
    return Number(vars.mapData?.[map]?.[y]?.[x]?.id ?? 0) > 0;
}

function adjacentTilesOccupied(npc: PowerNpc) {
    return (
        tileOccupied(npc.map, npc.pos.x, npc.pos.y - 1) ||
        tileOccupied(npc.map, npc.pos.x, npc.pos.y + 1) ||
        tileOccupied(npc.map, npc.pos.x - 1, npc.pos.y) ||
        tileOccupied(npc.map, npc.pos.x + 1, npc.pos.y)
    );
}

function chebyshev(left: Position, right: Position) {
    return Math.max(Math.abs(left.x - right.x), Math.abs(left.y - right.y));
}

function isLegalNpcTile(npc: PowerNpc, map: number, pos: Position) {
    const template = templateOf(npc);

    return Boolean(
        gameApi().legalPosNpc(
            pos.x,
            pos.y,
            map,
            Boolean(npc.aguaValida ?? template?.aguaValida),
            Boolean(npc.tierraInvalida ?? template?.tierraInvalida),
        ),
    );
}

function findLegalNear(npc: PowerNpc, map: number, origin: Position) {
    if (isLegalNpcTile(npc, map, origin) && !tileOccupied(map, origin.x, origin.y)) {
        return origin;
    }

    for (let radius = 1; radius <= 6; radius++) {
        for (let y = origin.y - radius; y <= origin.y + radius; y++) {
            for (let x = origin.x - radius; x <= origin.x + radius; x++) {
                if (Math.abs(origin.x - x) !== radius && Math.abs(origin.y - y) !== radius) {
                    continue;
                }

                const pos = { x, y };

                if (isLegalNpcTile(npc, map, pos) && !tileOccupied(map, x, y)) {
                    return pos;
                }
            }
        }
    }

    return null;
}

function teleportNpc(npc: PowerNpc, map: number, pos: Position) {
    if (npc.map === map && npc.pos.x === pos.x && npc.pos.y === pos.y) {
        return;
    }

    const oldMap = npc.map;
    const oldPos = { ...npc.pos };
    const previousViewers = viewersAt(oldMap, oldPos);

    for (const id of (vars.areaNpc?.[npc.id] ?? []) as EntityId[]) {
        previousViewers.add(String(id));
    }

    const oldTile = vars.mapData?.[oldMap]?.[oldPos.y]?.[oldPos.x];

    if (oldTile?.id === npc.id) {
        oldTile.id = 0;
    }

    npc.map = map;
    npc.pos = { ...pos };

    if (!vars.mapData?.[map]?.[pos.y]?.[pos.x]) {
        npc.map = oldMap;
        npc.pos = oldPos;

        if (oldTile) {
            oldTile.id = npc.id;
        }

        return;
    }

    vars.mapData[map][pos.y][pos.x].id = npc.id;
    const nextViewers = viewersAt(map, pos);

    for (const id of previousViewers) {
        if (!nextViewers.has(id)) {
            deleteNpcFrom(new Set([id]), npc.id);
        }
    }

    sendNpcTo(nextViewers, npc);
    playFx(npc, WARP_FX_ID);
}

function blinkNextToAttacker(npc: PowerNpc, attacker: PowerAttacker) {
    const farAway = attacker.map !== npc.map || chebyshev(attacker.pos, npc.pos) > 1;

    if (!farAway && !adjacentTilesOccupied(npc)) {
        return;
    }

    const destination = findLegalNear(npc, attacker.map, attacker.pos);

    if (!destination) {
        return;
    }

    teleportNpc(npc, attacker.map, destination);
}

function mend(npc: PowerNpc) {
    if (Number(npc.hp ?? 0) <= 0 || randomInt(1, 100) <= 70) {
        return;
    }

    const maxHp = Number(npc.maxHp ?? npc.hp ?? 0);
    npc.hp = Math.min(maxHp, Number(npc.hp ?? 0) + MEND_AMOUNT);
    playFx(npc, MEND_FX_ID);
    broadcastVitals(npc);
}

function spawnTemplateNpc(templateIndex: number, map: number, origin: Position) {
    const datNpc = vars.datNpc?.[templateIndex];

    if (!datNpc || !vars.mapData?.[map]) {
        return null;
    }

    const probe = {
        templateNpcIndex: templateIndex,
        aguaValida: datNpc.aguaValida,
        tierraInvalida: datNpc.tierraInvalida,
        map,
        pos: origin,
    } as PowerNpc;
    const pos = findLegalNear(probe, map, origin);

    if (!pos) {
        return null;
    }

    const npc = npcApi().createNpc() as PowerNpc;
    const currentTime = Date.now();

    npc.id = loginApi().createId();
    npc.templateNpcIndex = templateIndex;
    npc.ephemeralSummon = 1;
    npc.spawnMapNum = map;
    npc.spawnOrigin = { ...pos };
    npc.map = map;
    npc.pos = { ...pos };
    npc.nameCharacter = datNpc.name;
    npc.color = "white";
    npc.isNpc = true;
    npc.idBody = datNpc.idBody;
    npc.idHead = datNpc.idHead;
    npc.movement = datNpc.movement;
    npc.hostile = Number(datNpc.hostile ?? 1);
    npc.attackable = Number(datNpc.attackable ?? 1);
    npc.npcType = Number.parseInt(String(datNpc.npcType ?? 0), 10);
    npc.exp = datNpc.exp ?? 0;
    npc.gold = datNpc.gold ?? 0;
    npc.hp = datNpc.hp ?? datNpc.maxHp ?? 1;
    npc.maxHp = datNpc.maxHp ?? datNpc.hp ?? 1;
    npc.minHit = datNpc.minHit ?? 0;
    npc.maxHit = datNpc.maxHit ?? 0;
    npc.def = datNpc.def ?? 0;
    npc.defM = datNpc.defM ?? datNpc.magicDef ?? 0;
    npc.magicDef = datNpc.magicDef ?? datNpc.defM ?? 0;
    npc.magicResistance = datNpc.magicResistance ?? 0;
    npc.poderAtaque = datNpc.poderAtaque ?? 0;
    npc.poderEvasion = datNpc.poderEvasion ?? 0;
    npc.snd1 = datNpc.snd1 ?? 0;
    npc.snd2 = datNpc.snd2 ?? 0;
    npc.soundClose = datNpc.soundClose ?? 0;
    npc.spellCastIntervalMs = datNpc.spellCastIntervalMs ?? 0;
    npc.spellRange = datNpc.spellRange ?? 0;
    npc.spells = Array.isArray(datNpc.spells)
        ? datNpc.spells
              .filter((spell: { idSpell?: number }) => Number(spell?.idSpell ?? 0) > 0)
              .map((spell: { idSpell?: number; cooldownSeconds?: number }) => ({
                  idSpell: Number(spell.idSpell),
                  cooldownSeconds: Math.max(0, Number(spell.cooldownSeconds ?? 0)),
                  lastUsedAt: 0,
              }))
        : [];
    npc.drop = Array.isArray(datNpc.drop) ? datNpc.drop : [];
    npc.objs = datNpc.objs ?? [];
    npc.comercia = Number(datNpc.comercia ?? 0);
    npc.aguaValida = datNpc.aguaValida ?? 0;
    npc.tierraInvalida = datNpc.tierraInvalida ?? 0;
    npc.desc = datNpc.desc ?? "";
    npc.cooldownAtaque = currentTime + 4000;
    npc.nextThinkAt = currentTime + vars.timing.npcThinkMs;

    const clan = vars.clanNpc?.[npc.npcType as number];

    if (clan) {
        npc.clan = clan;
    }

    vars.npcs[npc.id] = npc;
    vars.areaNpc[npc.id] = [];
    vars.mapData[map][pos.y][pos.x].id = npc.id;
    sendNpcTo(viewersAt(map, pos), npc);
    return npc;
}

function summonDarkKnightMinions(npc: PowerNpc, previousHp: number) {
    const templateIndex = Number(npc.templateNpcIndex ?? 0);
    const isDarkKnight = templateIndex === DARK_KNIGHT_TEMPLATE;
    const onEventMap = Number(npc.map) === DARK_KNIGHT_MAP || String(npc.bossEventKey ?? "") === "darkKnight";

    if (!isDarkKnight || !onEventMap) {
        return;
    }

    const currentHp = Number(npc.hp ?? 0);
    let waves = Number(npc.darkKnightWaves ?? 0);

    DARK_KNIGHT_THRESHOLDS.forEach((threshold, index) => {
        const bit = 1 << index;

        if ((waves & bit) !== 0 || previousHp <= threshold || currentHp > threshold) {
            return;
        }

        waves |= bit;

        for (const minionIndex of DARK_KNIGHT_MINIONS) {
            spawnTemplateNpc(minionIndex, npc.map, npc.pos);
        }
    });

    npc.darkKnightWaves = waves;
}

function applyHitPowers(npc: PowerNpc, attacker: PowerAttacker, previousHp: number) {
    summonDarkKnightMinions(npc, previousHp);

    if (hasSpecialPower(npc, 2)) {
        blinkNextToAttacker(npc, attacker);
    }

    if (hasSpecialPower(npc, 5)) {
        mend(npc);
    }
}

function onDamagedByUser(npc: PowerNpc | undefined, user: PowerAttacker | undefined, previousHp: number) {
    if (!npc || !user || Number(npc.hp ?? 0) >= previousHp) {
        return;
    }

    applyHitPowers(npc, user, previousHp);
}

function onDamagedByNpc(npc: PowerNpc | undefined, attacker: PowerNpc | undefined, previousHp: number) {
    if (!npc || !attacker || Number(npc.hp ?? 0) >= previousHp) {
        return false;
    }

    applyHitPowers(npc, attacker, previousHp);
    return hasSpecialPower(npc, 6);
}

function onChaseUser(npc: PowerNpc | undefined, user: { idBody?: number; idHead?: number; hp?: number } | undefined) {
    if (!npc || !user || !hasSpecialPower(npc, 3) || Number(npc.paralizado ?? 0) > 0 || Number(npc.inmovilizado ?? 0) > 0) {
        return;
    }

    if (Number(user.hp ?? 1) <= 0) {
        return;
    }

    const nextBody = Number(user.idBody ?? 0);
    const nextHead = Number(user.idHead ?? 0);

    if (Number(npc.idBody ?? 0) === nextBody && Number(npc.idHead ?? 0) === nextHead) {
        return;
    }

    npc.idBody = nextBody;
    npc.idHead = nextHead;
    broadcastAppearance(npc);
}

function onNpcMoved(npc: PowerNpc | undefined) {
    if (!npc || !hasSpecialPower(npc, 1)) {
        return;
    }

    const roll = randomInt(1, 10);

    if (roll > 4) {
        return;
    }

    let body = Number(npc.idBody ?? 0);

    if (body >= 330 && roll === 1) {
        body = 331;
    } else if (body >= 330 && roll === 2) {
        body = 330;
    }

    if (randomInt(1, 100) < 98) {
        npc.idBody = body;
        return;
    }

    if (body < 330) {
        body = 331;
    } else {
        const variant = randomInt(1, 100);

        if (variant > 20) {
            body = 10;
        }

        if (variant > 40) {
            body = 13;
        }

        if (variant > 60) {
            body = 9;
        }

        if (variant > 80) {
            body = 51;
        }
    }

    npc.idBody = body;
    broadcastAppearance(npc);
    playFx(npc, WARP_FX_ID);
}

function tryBreakParalysis(npc: PowerNpc | undefined) {
    if (!npc || !hasSpecialPower(npc, 4) || (Number(npc.paralizado ?? 0) <= 0 && Number(npc.inmovilizado ?? 0) <= 0)) {
        return false;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
        if (randomInt(1, 1000) > 998) {
            npc.paralizado = 0;
            npc.inmovilizado = 0;
            npc.cooldownParalizado = 0;
            return true;
        }
    }

    return false;
}

module.exports = {
    hasSpecialPower,
    onDamagedByUser,
    onDamagedByNpc,
    onChaseUser,
    onNpcMoved,
    tryBreakParalysis,
};
