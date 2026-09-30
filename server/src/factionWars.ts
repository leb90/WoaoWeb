import type { CharacterFaction } from "./factions";
import type { EntityId, RuntimeCharacter } from "./types/runtime";

const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const socket = require("./socket");
const { getProgress, saveProgress } = require("./woaoProgress");

const REAL_MAP = 204;
const CAOS_MAP = 203;
const ATTACK_POS = { x: 77, y: 20 };
const DEFEND_POS = { x: 45, y: 88 };
const EXIT = { map: 34, x: 50, y: 50 };
const TEMPLE = { map: 210, x: 59, y: 24 };

const WAR_DURATION_MS = 5 * 60_000;
const INTERVAL_MS = 90 * 60_000;
const REVIVE_INTERVAL_MS = 10_000;
const AFK_LIMIT_MS = 60_000;
const TEAM_IMBALANCE_LIMIT = 2;
const SAFE_AREA_RADIUS = 8;

const WINNER_QUEST_POINTS = 30;
const MVP_QUEST_POINTS = 10;
const WINNER_FACTION_POINTS = 50;
const LOSER_FACTION_POINTS = 25;
const DRAW_FACTION_POINTS = 20;
const MVP_FACTION_POINTS = 10;
const AFK_FACTION_PENALTY = 20;

type WarFaction = Exclude<CharacterFaction, "none">;
type MvpCategory = "damage" | "removeParalysis" | "paralyze" | "healing";

type WarParticipant = {
    id: string;
    faction: WarFaction;
    joinedAt: number;
    lastActivityAt: number;
    kills: number;
    damage: number;
    removeParalysis: number;
    paralyze: number;
    healing: number;
};

type WarState = {
    active: boolean;
    automatic: boolean;
    map: number;
    temple: 0 | 1 | 2;
    startedAt: number;
    nextAt: number;
    lastReviveAt: number;
    participants: Map<string, WarParticipant>;
    reentryBlocked: Set<string>;
    kills: Record<WarFaction, number>;
    timer: ReturnType<typeof setInterval> | null;
    preStartAnnouncements: Set<number>;
    activeAnnouncements: Set<number>;
};

const state: WarState = {
    active: false,
    automatic: true,
    map: 0,
    temple: 0,
    startedAt: 0,
    nextAt: Date.now() + INTERVAL_MS,
    lastReviveAt: 0,
    participants: new Map(),
    reentryBlocked: new Set(),
    kills: { armada: 0, caos: 0 },
    timer: null,
    preStartAnnouncements: new Set(),
    activeAnnouncements: new Set(),
};

function normalizeFaction(value: unknown): CharacterFaction {
    return value === "armada" || value === "caos" ? value : "none";
}

function factionName(faction: CharacterFaction): string {
    if (faction === "armada") {
        return "Alianza";
    }

    if (faction === "caos") {
        return "Horda";
    }

    return "Neutral";
}

function announce(message: string) {
    handleProtocol.consoleToAll(`Guerra Faccionaria> ${message}`, "#E69500", 1, 0);
}

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(`Guerra Faccionaria> ${message}`, "#E69500", 1, 0, client);
    }
}

function tellParticipants(message: string) {
    for (const idUser of state.participants.keys()) {
        tell(idUser, message);
    }
}

function buildWarStatePayload(active = state.active) {
    return {
        active: Boolean(active && state.active),
        map: active && state.active ? state.map : 0,
        remainingSeconds:
            active && state.active
                ? Math.max(0, Math.ceil((state.startedAt + WAR_DURATION_MS - Date.now()) / 1000))
                : 0,
        hordeKills: state.kills.caos,
        allianceKills: state.kills.armada,
    };
}

function sendWarStateToClient(idUser: string, payload = buildWarStatePayload()) {
    const client = getClient(idUser);
    if (client && typeof handleProtocol.factionWarState === "function") {
        handleProtocol.factionWarState(payload, client);
    }
}

function sendWarStateToParticipants(payload = buildWarStatePayload()) {
    for (const idUser of state.participants.keys()) {
        sendWarStateToClient(idUser, payload);
    }
}

function getUser(idUser: string): RuntimeCharacter | undefined {
    return vars.personajes[idUser] as RuntimeCharacter | undefined;
}

function getClient(idUser: string) {
    return vars.clients[idUser];
}

function isAttackingFaction(faction: WarFaction): boolean {
    return (state.map === REAL_MAP && faction === "caos") || (state.map === CAOS_MAP && faction === "armada");
}

function getSpawnForFaction(faction: WarFaction) {
    return isAttackingFaction(faction) ? ATTACK_POS : DEFEND_POS;
}

function getTeamCount(faction: WarFaction): number {
    let count = 0;
    for (const participant of state.participants.values()) {
        if (participant.faction === faction) {
            count++;
        }
    }
    return count;
}

function getOpponentFaction(faction: WarFaction): WarFaction {
    return faction === "armada" ? "caos" : "armada";
}

function isOnlineParticipant(participant: WarParticipant): boolean {
    const user = getUser(participant.id);
    const client = getClient(participant.id);
    return Boolean(user && client && !user.cerrado);
}

function teleportUser(idUser: string, map: number, x: number, y: number, source: string) {
    const client = getClient(idUser);
    const user = getUser(idUser);

    if (!client || !user) {
        return;
    }

    game.forceDismount(idUser);
    game.telep(client, map, x, y, source);
}

function reviveIfDead(idUser: string) {
    const user = getUser(idUser);
    if (!user?.dead) {
        return;
    }

    game.revivirUsuario(idUser, {
        hp: Number(user.maxHp ?? 0),
        mana: Number(user.maxMana ?? user.mana ?? 0),
    });
}

function moveParticipantToWarSpawn(idUser: string) {
    const participant = state.participants.get(idUser);
    if (!participant) {
        return;
    }

    const spawn = getSpawnForFaction(participant.faction);
    teleportUser(idUser, state.map, spawn.x, spawn.y, "guerra-spawn");
}

function leaveWar(idUser: string, destination = EXIT) {
    const user = getUser(idUser);
    if (user) {
        user.guerra = false;
    }

    reviveIfDead(idUser);
    teleportUser(idUser, destination.map, destination.x, destination.y, "guerra-exit");
}

function awardQuestPoints(idUser: string, amount: number) {
    if (amount <= 0) {
        return;
    }

    const user = getUser(idUser);
    if (!user) {
        return;
    }

    const progress = getProgress(user);
    progress.puntosCanje = Number(progress.puntosCanje ?? 0) + amount;
    user.puntosCanje = progress.puntosCanje;
    saveProgress(user);

    const client = getClient(idUser);
    if (client) {
        handleProtocol.sendMyCharacter(user);
        socket.send(client);
    }
}

function awardFactionPoints(idUser: string, faction: WarFaction, amount: number) {
    if (!amount) {
        return;
    }

    game.addFactionScore(idUser, faction, amount);
}

function getTopParticipant(category: MvpCategory): WarParticipant | null {
    let top: WarParticipant | null = null;

    for (const participant of state.participants.values()) {
        if (!isOnlineParticipant(participant)) {
            continue;
        }

        if (participant[category] <= 0) {
            continue;
        }

        if (!top || participant[category] > top[category]) {
            top = participant;
        }
    }

    return top;
}

function awardMvp(category: MvpCategory, label: string) {
    const top = getTopParticipant(category);

    if (!top) {
        return;
    }

    awardQuestPoints(top.id, MVP_QUEST_POINTS);
    awardFactionPoints(top.id, top.faction, MVP_FACTION_POINTS);
    tell(top.id, `Has sido elegido MVP de ${label}. Recibes ${MVP_QUEST_POINTS} puntos quest extra.`);

    const user = getUser(top.id);
    if (user) {
        tellParticipants(
            `MVP de ${label}: ${user.nameCharacter} (${Math.floor(Number(top[category] ?? 0))}).`,
        );
    }
}

function resetWarRuntime() {
    state.active = false;
    state.map = 0;
    state.startedAt = 0;
    state.lastReviveAt = 0;
    state.participants.clear();
    state.reentryBlocked.clear();
    state.kills = { armada: 0, caos: 0 };
    state.preStartAnnouncements.clear();
    state.activeAnnouncements.clear();
}

function finish(winner: WarFaction | "none", rewardParticipants = true) {
    if (!state.active) {
        return;
    }

    const participants = Array.from(state.participants.values());
    const scoreLine = `Alianza ${state.kills.armada} - Horda ${state.kills.caos}.`;

    if (winner === "none") {
        announce(`La Guerra ha terminado empatada. ${scoreLine}`);
        state.temple = 0;
    } else {
        announce(`La Guerra ha terminado. Gano la ${factionName(winner)}. ${scoreLine}`);
        state.temple = winner === "armada" ? 1 : 2;
    }

    if (rewardParticipants) {
        for (const participant of participants) {
            if (!isOnlineParticipant(participant)) {
                continue;
            }

            const userWon = winner !== "none" && participant.faction === winner;
            const factionPoints =
                winner === "none" ? DRAW_FACTION_POINTS : userWon ? WINNER_FACTION_POINTS : LOSER_FACTION_POINTS;

            awardFactionPoints(participant.id, participant.faction, factionPoints);
            tell(participant.id, `Recibiste ${factionPoints} puntos de faccion por participar en la guerra.`);

            if (userWon) {
                awardQuestPoints(participant.id, WINNER_QUEST_POINTS);
                tell(participant.id, `Tu faccion gano la guerra. Recibiste ${WINNER_QUEST_POINTS} puntos quest.`);
            }
        }

        awardMvp("damage", "dano");
        awardMvp("removeParalysis", "remover paralisis");
        awardMvp("paralyze", "paralizar");
        awardMvp("healing", "curar aliados");
    }

    sendWarStateToParticipants(buildWarStatePayload(false));

    for (const participant of participants) {
        leaveWar(participant.id);
    }

    resetWarRuntime();
    state.nextAt = Date.now() + INTERVAL_MS;
}

function expelAfk(participant: WarParticipant) {
    state.reentryBlocked.add(participant.id);
    state.participants.delete(participant.id);

    const user = getUser(participant.id);
    if (user) {
        user.guerra = false;
    }

    awardFactionPoints(participant.id, participant.faction, -AFK_FACTION_PENALTY);
    tell(
        participant.id,
        `Fuiste expulsado por AFK. No podras volver a entrar en esta guerra y perdiste ${AFK_FACTION_PENALTY} puntos de faccion.`,
    );
    sendWarStateToClient(participant.id, buildWarStatePayload(false));
    leaveWar(participant.id);
}

function reviveDeadParticipants(now: number) {
    if (now - state.lastReviveAt < REVIVE_INTERVAL_MS) {
        return;
    }

    state.lastReviveAt = now;

    for (const participant of state.participants.values()) {
        const user = getUser(participant.id);
        if (!user || !user.dead) {
            continue;
        }

        if (Number(user.map) !== state.map) {
            moveParticipantToWarSpawn(participant.id);
        }

        reviveIfDead(participant.id);
        tell(participant.id, "Has sido revivido para volver a la guerra.");
    }
}

function processAfk(now: number) {
    for (const participant of Array.from(state.participants.values())) {
        const user = getUser(participant.id);

        if (!user || user.cerrado) {
            state.participants.delete(participant.id);
            continue;
        }

        const lastActivityAt = Math.max(
            participant.lastActivityAt,
            Number(user.lastMovementActivityAt ?? 0),
            Number(user.lastCombatActivityAt ?? 0),
        );

        if (now - lastActivityAt >= AFK_LIMIT_MS) {
            expelAfk(participant);
        }
    }
}

function tickActiveWar(now: number) {
    if (!state.active) {
        return;
    }

    processAfk(now);
    reviveDeadParticipants(now);

    const remaining = state.startedAt + WAR_DURATION_MS - now;

    if (remaining <= 60_000 && !state.activeAnnouncements.has(1)) {
        state.activeAnnouncements.add(1);
        tellParticipants("Queda 1 minuto de Guerra.");
    }

    if (remaining <= 0) {
        const winner =
            state.kills.armada === state.kills.caos
                ? "none"
                : state.kills.armada > state.kills.caos
                  ? "armada"
                  : "caos";

        finish(winner);
    }
}

function tickAutomaticWar(now: number) {
    if (state.active || !state.automatic) {
        return;
    }

    const remaining = state.nextAt - now;
    const remainingMinutes = Math.ceil(remaining / 60_000);

    if (remainingMinutes <= 5 && remainingMinutes > 0 && !state.preStartAnnouncements.has(remainingMinutes)) {
        state.preStartAnnouncements.add(remainingMinutes);
        announce(
            `Alianza y Horda pelearan una Guerra en ${remainingMinutes} minuto${remainingMinutes === 1 ? "" : "s"}.`,
        );
    }

    if (now >= state.nextAt) {
        startWar();
    }
}

export function startWar() {
    if (state.active) {
        return { ok: false, message: "Ya hay una Guerra Actualmente." };
    }

    state.active = true;
    state.map = Math.random() < 0.5 ? REAL_MAP : CAOS_MAP;
    state.startedAt = Date.now();
    state.lastReviveAt = state.startedAt;
    state.participants.clear();
    state.reentryBlocked.clear();
    state.kills = { armada: 0, caos: 0 };
    state.preStartAnnouncements.clear();
    state.activeAnnouncements.clear();

    announce(
        `La Guerra ha comenzado en mapa ${state.map}. Dura 5 minutos. Para participar envia /guerra.`,
    );

    return { ok: true, message: "Guerra faccionaria iniciada." };
}

export function joinWar(idUser: string) {
    const user = getUser(idUser);
    const client = getClient(idUser);

    if (!user || !client) {
        return { ok: false, message: "No se pudo entrar a la guerra." };
    }

    if (!state.active) {
        return { ok: false, message: describe() };
    }

    if (state.reentryBlocked.has(idUser)) {
        return { ok: false, message: "Fuiste expulsado de esta guerra y no puedes volver a entrar." };
    }

    if (state.participants.has(idUser) || user.guerra) {
        return { ok: false, message: "Ya estas participando de la Guerra." };
    }

    const faction = normalizeFaction(user.faction);
    if (faction !== "armada" && faction !== "caos") {
        return { ok: false, message: "No perteneces a ninguna faccion." };
    }

    const ownCount = getTeamCount(faction);
    const opponentCount = getTeamCount(getOpponentFaction(faction));
    if (ownCount >= opponentCount + TEAM_IMBALANCE_LIMIT) {
        return {
            ok: false,
            message: `Hay demasiados de ${factionName(faction)}. Espera a que entre la otra faccion.`,
        };
    }

    const now = Date.now();
    const participant: WarParticipant = {
        id: idUser,
        faction,
        joinedAt: now,
        lastActivityAt: now,
        kills: 0,
        damage: 0,
        removeParalysis: 0,
        paralyze: 0,
        healing: 0,
    };

    state.participants.set(idUser, participant);
    user.guerra = true;
    reviveIfDead(idUser);
    moveParticipantToWarSpawn(idUser);
    sendWarStateToClient(idUser);

    return {
        ok: true,
        message: `Entraste a la Guerra por la ${factionName(faction)}. Gana la faccion con mas kills.`,
    };
}

export function enterTemple(idUser: string) {
    const user = getUser(idUser);
    const client = getClient(idUser);

    if (!user || !client) {
        return { ok: false, message: "No se pudo entrar al templo." };
    }

    const faction = normalizeFaction(user.faction);
    if (faction !== "armada" && faction !== "caos") {
        return { ok: false, message: "No perteneces a ninguna faccion." };
    }

    if (Number(user.hp ?? 0) < Number(user.maxHp ?? 0)) {
        return { ok: false, message: "Tu salud debe estar completa." };
    }

    if (state.temple === 0) {
        return { ok: false, message: "El templo no esta en dominio de nadie." };
    }

    const owns = (faction === "armada" && state.temple === 1) || (faction === "caos" && state.temple === 2);
    if (!owns) {
        return {
            ok: false,
            message: state.temple === 1 ? "El templo esta en dominio de la Alianza." : "El templo esta en dominio de la Horda.",
        };
    }

    game.forceDismount(idUser);
    game.telep(client, TEMPLE.map, TEMPLE.x, TEMPLE.y, "templo");
    return { ok: true, message: "Has sido transportado al templo." };
}

export function onNpcDied(_templateNpcIndex: number) {
    // La guerra nueva se define por kills entre facciones, no por matar un NPC.
}

export function onUserLeft(idUser: string) {
    state.participants.delete(String(idUser));
    const user = getUser(idUser);
    if (user) {
        user.guerra = false;
    }
}

export function onUserDied(idUser: string) {
    if (!state.active || !state.participants.has(String(idUser))) {
        return;
    }

    moveParticipantToWarSpawn(String(idUser));
}

export function onUserKilled(attackerId: EntityId | string, victimId: EntityId | string): boolean {
    if (!state.active) {
        return false;
    }

    const attacker = state.participants.get(String(attackerId));
    const victim = state.participants.get(String(victimId));

    if (!victim) {
        return false;
    }

    onUserDied(String(victimId));

    if (!attacker || attacker.faction === victim.faction) {
        return true;
    }

    attacker.kills++;
    attacker.lastActivityAt = Date.now();
    state.kills[attacker.faction]++;
    tellParticipants(
        `Kill para ${factionName(attacker.faction)}. Alianza ${state.kills.armada} - Horda ${state.kills.caos}.`,
    );
    sendWarStateToParticipants();
    return true;
}

export function onUserDamage(attackerId: EntityId | string, victimId: EntityId | string, amount: number) {
    if (!state.active || amount <= 0) {
        return;
    }

    const attacker = state.participants.get(String(attackerId));
    const victim = state.participants.get(String(victimId));

    if (!attacker || !victim || attacker.faction === victim.faction) {
        return;
    }

    attacker.damage += Math.max(0, Math.floor(amount));
    attacker.lastActivityAt = Date.now();
}

export function onUserSpellEffect(
    casterId: EntityId | string,
    targetId: EntityId | string,
    effect: string | null,
    amount = 0,
) {
    if (!state.active) {
        return;
    }

    const caster = state.participants.get(String(casterId));
    const target = state.participants.get(String(targetId));

    if (!caster || !target) {
        return;
    }

    const sameFaction = caster.faction === target.faction;
    const now = Date.now();

    if (!sameFaction && amount > 0) {
        caster.damage += Math.max(0, Math.floor(amount));
        caster.lastActivityAt = now;
    }

    if (sameFaction && amount < 0 && String(casterId) !== String(targetId)) {
        caster.healing += Math.abs(Math.floor(amount));
        caster.lastActivityAt = now;
    }

    if (!sameFaction && (effect === "Paraliza" || effect === "Inmoviliza")) {
        caster.paralyze++;
        caster.lastActivityAt = now;
    }

    if (sameFaction && effect === "Remueve" && String(casterId) !== String(targetId)) {
        caster.removeParalysis++;
        caster.lastActivityAt = now;
    }
}

export function shouldPreventItemDrop(idUser: EntityId | string): boolean {
    return state.active && state.participants.has(String(idUser));
}

export function isWarParticipant(idUser: EntityId | string | undefined): boolean {
    return typeof idUser !== "undefined" && state.active && state.participants.has(String(idUser));
}

export function isWarCombat(leftId: EntityId | string | undefined, rightId: EntityId | string | undefined): boolean {
    if (typeof leftId === "undefined" || typeof rightId === "undefined") {
        return false;
    }

    const left = state.participants.get(String(leftId));
    const right = state.participants.get(String(rightId));

    return Boolean(state.active && left && right && left.faction !== right.faction);
}

export function isInSafeArea(userOrId: RuntimeCharacter | EntityId | string | undefined): boolean {
    if (!state.active || typeof userOrId === "undefined") {
        return false;
    }

    const idUser = typeof userOrId === "object" ? String(userOrId.id) : String(userOrId);
    const user = typeof userOrId === "object" ? userOrId : getUser(idUser);
    const participant = state.participants.get(idUser);

    if (!user || !participant || Number(user.map) !== state.map) {
        return false;
    }

    const spawn = getSpawnForFaction(participant.faction);
    return Math.abs(Number(user.pos?.x ?? 0) - spawn.x) <= SAFE_AREA_RADIUS &&
        Math.abs(Number(user.pos?.y ?? 0) - spawn.y) <= SAFE_AREA_RADIUS;
}

export function getAttackDeniedReason(
    attacker: RuntimeCharacter | undefined,
    victim: RuntimeCharacter | undefined,
): string | null {
    if (!state.active || !attacker || !victim) {
        return null;
    }

    const attackerParticipant = state.participants.get(String(attacker.id));
    const victimParticipant = state.participants.get(String(victim.id));

    if (!attackerParticipant && !victimParticipant) {
        return null;
    }

    if (!attackerParticipant || !victimParticipant) {
        return "Solo los participantes de la guerra pueden pelear dentro del evento.";
    }

    if (attackerParticipant.faction === victimParticipant.faction) {
        return "No puedes atacar a miembros de tu faccion en la guerra.";
    }

    if (isInSafeArea(attacker) || isInSafeArea(victim)) {
        return "No puedes atacar dentro de la zona segura de guerra.";
    }

    return null;
}

export function getSupportDeniedReason(
    caster: RuntimeCharacter | undefined,
    target: RuntimeCharacter | undefined,
): string | null {
    if (!state.active || !caster || !target || String(caster.id) === String(target.id)) {
        return null;
    }

    const casterParticipant = state.participants.get(String(caster.id));
    const targetParticipant = state.participants.get(String(target.id));

    if (!casterParticipant && !targetParticipant) {
        return null;
    }

    if (!casterParticipant || !targetParticipant) {
        return "Solo los participantes de la guerra pueden intervenir dentro del evento.";
    }

    if (casterParticipant.faction !== targetParticipant.faction) {
        return "No puedes ayudar a la faccion enemiga en la guerra.";
    }

    return null;
}

export function cancelWar() {
    if (!state.active) {
        return { ok: false, message: "No hay guerra en curso." };
    }

    finish("none", false);
    return { ok: true, message: "Guerra cancelada." };
}

export function setAutomatic(on: boolean) {
    state.automatic = on;
    return { ok: true, message: on ? "Las Guerras Automaticas han sido Activadas." : "Las Guerras Automaticas han sido Desactivadas." };
}

export function describe() {
    if (state.active) {
        const leftSeconds = Math.max(0, Math.ceil((state.startedAt + WAR_DURATION_MS - Date.now()) / 1000));
        return `Guerra activa en mapa ${state.map}. Alianza ${state.kills.armada} - Horda ${state.kills.caos}. Quedan ${leftSeconds}s. /guerra para entrar.`;
    }

    const temple = state.temple === 1 ? "Alianza" : state.temple === 2 ? "Horda" : "nadie";
    return `No hay guerra. Templo: ${temple}. Proxima automatica en ${Math.max(0, Math.ceil((state.nextAt - Date.now()) / 60_000))} min.`;
}

export function initialize() {
    if (state.timer) {
        return;
    }

    state.timer = setInterval(() => {
        const now = Date.now();
        tickActiveWar(now);
        tickAutomaticWar(now);
    }, 1000);

    console.log("[Guerras] Automaticas cada 90 minutos.");
}
