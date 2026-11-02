// Panel /online de los GM: la lista de conectados, la ficha completa de un personaje y una vista en vivo de lo que
// está haciendo (el mapa a su alrededor, quién tiene cerca y su consola). El cliente lo muestra en GmOnlineModal.tsx.
// Mientras el panel está abierto el server manda la lista cada pocos segundos y, si el GM eligió a alguien, un cuadro
// cada FRAME_MS con las posiciones de todo lo que lo rodea; el cliente dibuja el mapa con sus propios gráficos.
import type { EntityId, Position, RuntimeCharacter, RuntimeClient, RuntimeNpc } from "./types/runtime";
import { feedLinesSince, lastFeedSeq, recentSpeech, unwatchFeed, watchFeed } from "./gmSpectateFeed";

export {};

const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const funct = require("./functions");
const worldLayout = require("./worldLayout");

function getGame() {
    return require("./game");
}

const FRAME_MS = 200;
const LIST_REFRESH_MS = 3_000;
const DETAIL_REFRESH_MS = 1_000;
// Alrededor del personaje: un poco más que lo que se ve en el panel para que el que entra caminando no aparezca de golpe.
const VIEW_RANGE_X = 10;
const VIEW_RANGE_Y = 8;
const SPEECH_MS = 4_000;
const COMBAT_RECENT_MS = 6_000;
const WALK_RECENT_MS = 2_500;
const IDLE_AFTER_MS = 120_000;

type Watcher = {
    targetId: string | null;
    targetOffline: boolean;
    feedSeq: number;
    nextListAt: number;
    nextDetailAt: number;
};

type Character = RuntimeCharacter & Record<string, unknown>;
type Npc = RuntimeNpc & Record<string, unknown>;

const watchers = new Map<string, Watcher>();
let timer: ReturnType<typeof setInterval> | null = null;

function getClient(id: EntityId | string | null | undefined): RuntimeClient | undefined {
    return id === null || id === undefined ? undefined : vars.clients[String(id)];
}

function getCharacter(id: EntityId | string | null | undefined): Character | undefined {
    return id === null || id === undefined ? undefined : vars.personajes[String(id)];
}

function mapName(map: number): string {
    return String(vars.mapData[map]?.name ?? "").trim() || `Mapa ${map}`;
}

function isBot(user: Character): boolean {
    return Boolean(user.arenaEntrenamiento?.esBot || user.adminSummonedBot);
}

function entityName(id: EntityId | undefined): string {
    if (id === undefined || id === null) {
        return "";
    }
    const npc = vars.npcs[String(id)] as Npc | undefined;
    return String(npc?.nameCharacter ?? getCharacter(id)?.nameCharacter ?? "");
}

/** Con quién pelea: lo que tiene enfrente (a quien le pega cuerpo a cuerpo), lo último que clickeó o quien le pegó. */
function combatRival(user: Character, now: number): string {
    const heading = Number(user.heading);
    const dx = heading === vars.direcciones.right ? 1 : heading === vars.direcciones.left ? -1 : 0;
    const dy = heading === vars.direcciones.down ? 1 : heading === vars.direcciones.up ? -1 : 0;
    const inFront = vars.mapData[user.map]?.[user.pos.y + dy]?.[user.pos.x + dx]?.id;
    if ((dx || dy) && inFront) {
        return entityName(inFront);
    }
    if (user.targetFrame) {
        return entityName(user.targetFrame.id);
    }
    return now - Number(user.lastAttackedAt ?? 0) < COMBAT_RECENT_MS ? entityName(user.lastAttackerId) : "";
}

/** Qué está haciendo, en pocas palabras, para la lista y la cabecera de la vista en vivo. */
function describeActivity(user: Character, now: number): string {
    if (user.dead) {
        return "Muerto";
    }
    if (Number(user.jailMinutes ?? 0) > 0) {
        return "En la cárcel";
    }
    if (user.meditar) {
        return "Meditando";
    }
    if (user.fishing?.active) {
        return "Pescando";
    }
    if (user.harvesting?.active) {
        return user.harvesting.skill === "mining" ? "Minando" : "Talando";
    }
    if (user.smelting?.active) {
        return "Fundiendo";
    }
    if (user.tradeMode === "bank") {
        return "En el banco";
    }
    if (user.tradeMode === "market") {
        return "En el mercado";
    }
    if (user.tradeMode === "merchant") {
        return "Comerciando";
    }

    const lastCombat = Number(user.lastCombatActivityAt ?? 0);
    if (now - lastCombat < COMBAT_RECENT_MS) {
        const rival = combatRival(user, now);
        return rival ? `Peleando con ${rival}` : "En combate";
    }
    if (user.navegando) {
        return "Navegando";
    }

    const lastMove = Number(user.lastMovementActivityAt ?? 0);
    if (now - lastMove < WALK_RECENT_MS) {
        return "Caminando";
    }

    const idleMs = now - Math.max(lastMove, lastCombat, Number(getClient(user.id)?.lastActivityAt ?? 0));
    if (lastMove > 0 && idleMs > IDLE_AFTER_MS) {
        return `Inactivo hace ${Math.floor(idleMs / 60_000)} min`;
    }
    return "Quieto";
}

/** Marcas cortas: dónde está metido y estados que importan para moderar. */
function describeTags(user: Character, now: number): string[] {
    const tags: string[] = [];
    if (Number(user.privileges ?? 0) > 0) tags.push("GM");
    if (isBot(user)) tags.push("Bot");
    if (user.arenaEntrenamiento) tags.push("Entrenamiento");
    else if (user.arenaFfa) tags.push("Arena");
    if (user.rankedArena) tags.push("Ranked");
    if (user.challengeMatchId) tags.push("Reto");
    if (user.huntersGame) tags.push("Hunters");
    if (user.pvpChar) tags.push("PvP");
    if (user.invisibleAdmin || user.invisibleSpell) tags.push("Invisible");
    if (user.hiddenSkill) tags.push("Oculto");
    if (Number(user.pvpCombatUntil ?? 0) > now) tags.push("En pelea PvP");
    if (user.partyId) tags.push("En party");
    return tags;
}

function connectedMinutes(user: Character, now: number): number {
    const since = Number(getClient(user.id)?.connectedAt ?? 0);
    return since > 0 ? Math.max(0, Math.floor((now - since) / 60_000)) : 0;
}

function onlineCharacters(): Character[] {
    return (Object.values(vars.personajes) as Array<Character | undefined>).filter(
        (user): user is Character => Boolean(user && user.nameCharacter && getClient(user.id) && user.pos),
    );
}

function buildList(now: number) {
    const users = onlineCharacters()
        .map((user) => ({
            id: String(user.id),
            name: String(user.nameCharacter),
            level: Number(user.level ?? 1),
            clase: String(vars.nameClases[Number(user.idClase)] ?? ""),
            raza: String(vars.nameRazas[Number(user.idRaza)] ?? ""),
            map: Number(user.map),
            mapName: mapName(Number(user.map)),
            x: Number(user.pos.x),
            y: Number(user.pos.y),
            dead: Boolean(user.dead),
            gm: Number(user.privileges ?? 0) > 0,
            bot: isBot(user),
            clan: String(user.clan ?? ""),
            faction: String(user.faction ?? "none"),
            criminal: Boolean(user.criminal),
            activity: describeActivity(user, now),
            tags: describeTags(user, now),
            minutes: connectedMinutes(user, now),
        }))
        .sort((a, b) => Number(a.bot) - Number(b.bot) || b.level - a.level || a.name.localeCompare(b.name));

    return {
        kind: "list" as const,
        users,
        pve: Number(vars.usuariosOnline ?? 0),
        pvp: Number(vars.usuariosOnlinePvP ?? 0),
    };
}

function itemName(idItem: unknown): string | null {
    const id = Number(idItem ?? 0);
    return id > 0 ? String(vars.datObj[id]?.name ?? `Objeto ${id}`) : null;
}

/** Lo que tiene puesto: idItemWeapon y los demás guardan el casillero del inventario, no el objeto. */
function equippedName(user: Character, slot: unknown): string | null {
    const inventory = (user.inv ?? {}) as Record<string, { idItem?: number } | undefined>;
    return Number(slot ?? 0) > 0 ? itemName(inventory[String(slot)]?.idItem) : null;
}

function buildDetail(user: Character, now: number) {
    const game = getGame();
    const id = user.id;
    const inventory = Object.entries((user.inv ?? {}) as Record<string, { idItem?: number; cant?: number; equipped?: unknown }>)
        .filter(([, item]) => Number(item?.idItem ?? 0) > 0)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([slot, item]) => ({
            slot: Number(slot),
            name: itemName(item.idItem) ?? "",
            amount: Number(item.cant ?? 0),
            equipped: Boolean(item.equipped),
        }));
    const spells = Object.entries((user.spells ?? {}) as Record<string, { idSpell?: number }>)
        .filter(([, spell]) => Number(spell?.idSpell ?? 0) > 0)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, spell]) => String(vars.datSpell[Number(spell.idSpell)]?.name ?? `Hechizo ${spell.idSpell}`));

    return {
        kind: "detail" as const,
        id: String(id),
        online: true,
        name: String(user.nameCharacter),
        level: Number(user.level ?? 1),
        exp: Number(user.exp ?? 0),
        expNextLevel: Number(user.expNextLevel ?? 0),
        clase: String(vars.nameClases[Number(user.idClase)] ?? ""),
        raza: String(vars.nameRazas[Number(user.idRaza)] ?? ""),
        genero: Number(user.idGenero) === 2 ? "Mujer" : "Hombre",
        activity: describeActivity(user, now),
        tags: describeTags(user, now),
        minutes: connectedMinutes(user, now),
        map: Number(user.map),
        mapName: mapName(Number(user.map)),
        x: Number(user.pos.x),
        y: Number(user.pos.y),
        vitals: {
            hp: Number(user.hp ?? 0),
            maxHp: Number(user.maxHp ?? 0),
            mana: Number(user.mana ?? 0),
            maxMana: Number(user.maxMana ?? 0),
            sta: Number(user.sta ?? 0),
            maxSta: Number(user.maxSta ?? 0),
            hambre: Number(user.hambre ?? 0),
            maxHambre: Number(user.maxHambre ?? 0),
            sed: Number(user.sed ?? 0),
            maxSed: Number(user.maxSed ?? 0),
        },
        gold: Number(user.gold ?? 0),
        attributes: {
            fuerza: Number(user.attrFuerza ?? 0),
            agilidad: Number(user.attrAgilidad ?? 0),
            inteligencia: Number(user.attrInteligencia ?? 0),
            constitucion: Number(user.attrConstitucion ?? 0),
        },
        skills: {
            tacticasCombate: Number(game.getSkillTacticasCombate(id) ?? 0),
            defensa: Number(game.getSkillDefensa(id) ?? 0),
            armas: Number(game.getSkillArmas(id) ?? 0),
            proyectiles: Number(game.getSkillProyectiles(id) ?? 0),
            wrestling: Number(game.getSkillWrestling(id) ?? 0),
            ocultarse: Number(game.getSkillOcultarse(id) ?? 0),
            apunalar: Number(game.getSkillApu(id) ?? 0),
        },
        kills: {
            npcs: Number(user.npcMatados ?? 0),
            ciudadanos: Number(user.ciudadanosMatados ?? 0),
            criminales: Number(user.criminalesMatados ?? 0),
        },
        faction: String(user.faction ?? "none"),
        factionScore: { armada: Number(user.factionScoreArmada ?? 0), caos: Number(user.factionScoreCaos ?? 0) },
        criminal: Boolean(user.criminal),
        clan: String(user.clan ?? ""),
        clanRole: String(user.clanRole ?? ""),
        elo: Number(user.elo ?? 0),
        jailMinutes: Number(user.jailMinutes ?? 0),
        equipment: {
            arma: equippedName(user, user.idItemWeapon),
            armadura: equippedName(user, user.idItemBody),
            escudo: equippedName(user, user.idItemShield),
            casco: equippedName(user, user.idItemHelmet),
            anillo: equippedName(user, user.idItemRing),
            municion: equippedName(user, user.idItemArrow),
        },
        status: {
            paralizado: Boolean(user.inmovilizado),
            envenenado: Number(user.envenenado ?? 0) > 0,
            ciego: Boolean(user.ceguera),
            estupido: Boolean(user.estupidez),
            navegando: Boolean(user.navegando),
            montado: Boolean(user.mounted),
            zonaSegura: Boolean(user.zonaSegura),
        },
        inventory,
        spells,
    };
}

type FrameEntity = {
    id: string;
    name: string;
    npc: boolean;
    x: number;
    y: number;
    heading: number;
    body: number;
    head: number;
    weapon: number;
    shield: number;
    helmet: number;
    hp: number;
    maxHp: number;
    dead: boolean;
    invisible: boolean;
    color: string;
};

function describeEntity(id: EntityId, x: number, y: number): FrameEntity | null {
    const npc = vars.npcs[String(id)] as Npc | undefined;

    if (npc) {
        return {
            id: String(id),
            name: String(npc.nameCharacter ?? ""),
            npc: true,
            x,
            y,
            heading: Number(npc.heading ?? 3),
            body: Number(npc.idBody ?? 0),
            head: Number(npc.idHead ?? 0),
            weapon: Number(npc.idWeapon ?? 0),
            shield: Number(npc.idShield ?? 0),
            helmet: Number(npc.idHelmet ?? 0),
            hp: Number(npc.hp ?? 0),
            maxHp: Number(npc.maxHp ?? 0),
            dead: false,
            invisible: false,
            color: String(npc.color ?? ""),
        };
    }

    const user = getCharacter(id);

    if (!user) {
        return null;
    }

    const appearance = require("./transmog").getVisibleAppearance(user) as {
        head: number;
        body: number;
        helmet: number;
        weapon: number;
        shield: number;
    };

    return {
        id: String(id),
        name: String(user.nameCharacter),
        npc: false,
        x,
        y,
        heading: Number(user.heading ?? 3),
        body: Number(appearance.body ?? 0),
        head: Number(appearance.head ?? 0),
        weapon: Number(appearance.weapon ?? 0),
        shield: Number(appearance.shield ?? 0),
        helmet: Number(appearance.helmet ?? 0),
        hp: Number(user.hp ?? 0),
        maxHp: Number(user.maxHp ?? 0),
        dead: Boolean(user.dead),
        invisible: Boolean(user.invisibleAdmin || user.invisibleSpell || user.hiddenSkill),
        color: String(user.color ?? ""),
    };
}

function buildFrame(user: Character, watcher: Watcher, now: number) {
    const game = getGame();
    const dungeons = require("./dungeons");
    const map = Number(user.map);
    const layout = worldLayout.getWorldLayout(map);
    const placements = Array.from(
        layout.placements.values() as Iterable<{ map: number; originX: number; originY: number; interior: unknown }>,
    ).map((placement) => ({
        map: placement.map,
        originX: placement.originX,
        originY: placement.originY,
        interior: placement.interior,
    }));
    const entities: FrameEntity[] = [];
    const items: Array<{ x: number; y: number; obj: number }> = [];

    worldLayout.forEachAreaTile(
        map,
        user.pos.x - VIEW_RANGE_X,
        user.pos.x + VIEW_RANGE_X,
        user.pos.y - VIEW_RANGE_Y,
        user.pos.y + VIEW_RANGE_Y,
        (tileMap: number, x: number, y: number) => {
            const placement = layout.placements.get(tileMap);
            const viewX = x + Number(placement?.originX ?? 0);
            const viewY = y + Number(placement?.originY ?? 0);
            const tile = vars.mapData[tileMap]?.[y]?.[x];

            if (tile?.id) {
                const entity = describeEntity(tile.id, viewX, viewY);
                if (entity) {
                    entities.push(entity);
                }
            }

            const pos: Position = { x, y };
            if (game.hayObj(tileMap, pos)) {
                const item = game.objMap(tileMap, pos);
                if (item?.objIndex) {
                    items.push({ x: viewX, y: viewY, obj: Number(dungeons.skinObject(tileMap, pos, Number(item.objIndex))) });
                }
            }
        },
    );

    const feed = feedLinesSince(user.id, watcher.feedSeq).map((line) => ({ text: line.text, color: line.color }));
    watcher.feedSeq = lastFeedSeq(user.id);
    const speech = recentSpeech(user.id, now - SPEECH_MS).map((line) => ({ id: line.speakerId, text: line.speech }));

    return {
        kind: "frame" as const,
        id: String(user.id),
        online: true,
        map,
        mapName: mapName(map),
        x: Number(user.pos.x),
        y: Number(user.pos.y),
        activity: describeActivity(user, now),
        hp: Number(user.hp ?? 0),
        maxHp: Number(user.maxHp ?? 0),
        mana: Number(user.mana ?? 0),
        maxMana: Number(user.maxMana ?? 0),
        placements,
        entities,
        items,
        feed,
        speech,
    };
}

function send(gmId: string, payload: unknown): boolean {
    const client = getClient(gmId);
    if (!client) {
        return false;
    }
    handleProtocol.gmOnline(payload, client);
    return true;
}

function setTarget(watcher: Watcher, targetId: string | null): void {
    if (watcher.targetId && !watcher.targetOffline) {
        unwatchFeed(watcher.targetId);
    }
    watcher.targetId = targetId;
    watcher.targetOffline = false;
    watcher.feedSeq = 0;
    watcher.nextDetailAt = 0;
    if (targetId) {
        watchFeed(targetId);
        watcher.feedSeq = lastFeedSeq(targetId);
    }
}

function forget(gmId: string): void {
    const watcher = watchers.get(gmId);
    if (watcher) {
        setTarget(watcher, null);
        watchers.delete(gmId);
    }
    if (watchers.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
    }
}

function updateWatcher(gmId: string, watcher: Watcher, now: number): void {
    const gm = getCharacter(gmId);
    if (!gm || !getClient(gmId) || Number(gm.privileges ?? 0) !== 1) {
        forget(gmId);
        return;
    }

    if (now >= watcher.nextListAt) {
        watcher.nextListAt = now + LIST_REFRESH_MS;
        send(gmId, buildList(now));
    }

    if (!watcher.targetId || watcher.targetOffline) {
        return;
    }

    const target = getCharacter(watcher.targetId);
    if (!target || !getClient(watcher.targetId) || !target.pos) {
        unwatchFeed(watcher.targetId);
        watcher.targetOffline = true;
        send(gmId, { kind: "offline", id: watcher.targetId });
        return;
    }

    if (now >= watcher.nextDetailAt) {
        watcher.nextDetailAt = now + DETAIL_REFRESH_MS;
        send(gmId, buildDetail(target, now));
    }
    send(gmId, buildFrame(target, watcher, now));
}

function tick(): void {
    const now = Date.now();

    for (const [gmId, watcher] of watchers) {
        try {
            updateWatcher(gmId, watcher, now);
        } catch (error) {
            funct.dumpError(error);
        }
    }
}

function getWatcher(gmId: string): Watcher {
    const watcher = watchers.get(gmId) ?? { targetId: null, targetOffline: false, feedSeq: 0, nextListAt: 0, nextDetailAt: 0 };
    watchers.set(gmId, watcher);
    timer ??= setInterval(tick, FRAME_MS);
    return watcher;
}

/** /online de un GM: abre el panel y desde ahí la lista se actualiza sola. */
export function openOnlinePanel(gmId: EntityId): void {
    const key = String(gmId);
    const watcher = getWatcher(key);
    watcher.nextListAt = 0;
    updateWatcher(key, watcher, Date.now());
}

/** Elegir a quién mirar (id del personaje, o su nombre). Devuelve un error para la consola, o null. */
export function watchCharacter(gmId: EntityId, target: string): string | null {
    const key = String(gmId);
    const wanted = target.trim();
    const byId = getCharacter(wanted);
    const user =
        byId && getClient(byId.id)
            ? byId
            : onlineCharacters().find((candidate) => String(candidate.nameCharacter).toLowerCase() === wanted.toLowerCase());

    if (!user) {
        return "Ese personaje no está conectado.";
    }

    const watcher = getWatcher(key);
    setTarget(watcher, String(user.id));
    updateWatcher(key, watcher, Date.now());
    return null;
}

/** Volver a la lista: deja de mirar al personaje pero el panel sigue abierto. */
export function stopWatching(gmId: EntityId): void {
    const watcher = watchers.get(String(gmId));
    if (watcher) {
        setTarget(watcher, null);
    }
}

export function closeOnlinePanel(gmId: EntityId): void {
    forget(String(gmId));
}

export function isOnlinePanelOpen(gmId: EntityId): boolean {
    return watchers.has(String(gmId));
}
