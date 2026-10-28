// Los jefes de las Fauces del Bagre (docs/mazmorras/07-FAUCES_DEL_BAGRE.md, sección 5), sacados del código del original
// (zladx/LADX-Disassembly):
//
// El Maestro Stalfos (07_master_stalfos.asm), cuatro encuentros en cuatro salas:
// - cada uno aparece solo si huyó del anterior (si no, su sala queda vacía y abierta); el que sigue aparece cuando el
//   anterior huye;
// - camina hacia el jugador más cercano, salta hacia él si está lejos y tira un espadazo que el Campo de Protección no frena
//   (saltar con la Pluma lo esquiva);
// - un golpe de costado o por la espalda lo desarma (de frente lo frena el escudo); desarmado, unos 4,5 s, solo le
//   entran las bombas. Al rearmarse, si ya recibió sus bombazos (3, 2 y 2) huye; el cuarto muere al tercero y deja el
//   cofre del Gancho.
//
// Las Gohma (05_ghoma.asm): caminan de lado a lado; si el jugador está en su fila, tiemblan y arremeten. Cada tanto
// abren el ojo (1,2 s; en el original 0,8) y escupen una bola de fuego: solo con el ojo abierto les entran las flechas
// (3) y el Gancho (6).
//
// La Anguila Viscosa (05_slime_eel.asm): al entrar se rompe el piso (un pozo en el medio) y se abren cuatro agujeros en
// las paredes de arriba y de abajo. Una cola gira desde el pozo barriendo la sala. La cabeza asoma por un agujero al
// azar; entera, se la engancha (mirando hacia el agujero, en su columna) y el Gancho la saca de la pared: queda el
// cuerpo afuera y el primer segmento detrás de la cabeza es el corazón, que se lastima con golpes (8, más con grupo).
// Desde el cuarto enganche, la mitad de las veces se suelta: vuela invulnerable por la sala y explota.
//
// Los tres son criaturas de AO que mueve el server (customMotion). Lo que se ve aparte (los huesos, el tajo, el ojo, los
// agujeros, la cola, la cabeza y el cuerpo de la Anguila) lo dibuja el cliente (paquete dungeonBoss con `tipo`,
// engine/dungeonMawBosses.ts); las bolas de fuego son las del Genio.
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";

export {};

const vars = require("./vars");

// Maestro Stalfos
const MS_STEP_MS = 420;
const MS_JUMP_FROM = 4;
const MS_JUMP_MS = 450;
const MS_JUMP_COOLDOWN_MS = 2_600;
const MS_WINDUP_MS = 450;
const MS_SLASH_DAMAGE = 0.15;
const MS_SLASH_COOLDOWN_MS = 1_400;
const MS_COLLAPSED_MS = 4_500;
// Después del espadazo y al caer de un salto queda abierto: ahí un golpe lo desarma aunque sea de frente.
const MS_OPEN_MS = 1_000;
const MS_REASSEMBLE_MS = 800;
const MS_INTRO_MS = 1_200;
const MS_FLEE_MS = 1_000;

// Gohma
const GOHMA_STEP_MS = 300;
const GOHMA_EYE_EVERY_MIN_MS = 2_600;
const GOHMA_EYE_EVERY_MAX_MS = 4_200;
const GOHMA_EYE_MS = 1_200;
// Con el ojo listo espera a pasar por la columna de un jugador para abrirlo; si nadie se pone, lo abre igual.
const GOHMA_EYE_WAIT_MS = 2_500;
const GOHMA_TREMBLE_MS = 800;
const GOHMA_CHARGE_STEP_MS = 120;
const GOHMA_CHARGE_COOLDOWN_MS = 3_000;
const GOHMA_FIRE_TILE_MS = 110;
const GOHMA_FIRE_DAMAGE = 0.08;
const GOHMA_TOUCH_DAMAGE = 0.1;
const GOHMA_ARROWS = 3;
const GOHMA_HOOKS = 6;

// Anguila Viscosa
const EEL_WAKE_MS = 2_000;
const EEL_BREAK_MS = 2_200;
const EEL_FIRST_HEAD_MS = 3_500;
const EEL_HEAD_EVERY_MS = 2_900;
const EEL_PEEK_MS = 700;
const EEL_OUT_MS = 1_000;
const EEL_HIDE_MS = 500;
const EEL_TURN_MS = 4_270;
const EEL_TAIL_RADII = [1.5, 2.3, 3.1, 3.9, 4.7];
const EEL_TAIL_DAMAGE = 0.06;
const EEL_TAIL_COOLDOWN_MS = 900;
const EEL_EXPOSED_MS = 2_200;
const EEL_RETRACT_STEP_MS = 160;
const EEL_HIT_COOLDOWN_MS = 400;
const EEL_HITS = 8;
const EEL_HITS_PER_EXTRA_PLAYER = 2;
const EEL_LOOSE_FROM = 4;
const EEL_LOOSE_CHANCE = 0.5;
const EEL_LOOSE_MS = 1_800;
const EEL_LOOSE_STEP_MS = 160;
const EEL_LOOSE_DAMAGE = 0.15;
const EEL_BLAST_DAMAGE = 0.12;
const EEL_SYNC_MS = 500;

const TOUCH_COOLDOWN_MS = 1_000;

type Pos = { x: number; y: number };
type Player = RuntimeCharacter & { dead?: boolean; heading?: number };

type Stalfos = {
    npcId: string;
    mapId: number;
    room: number;
    encounter: number;
    bombsToFlee: number;
    bombs: number;
    mode: "presenta" | "pelea" | "carga" | "desarmado" | "rearma" | "huye";
    modeUntil: number;
    nextAt: number;
    nextJumpAt: number;
    nextSlashAt: number;
    openUntil: number;
    introduced: boolean;
};
// Los encuentros que todavía no aparecieron, por corrida (mapa): dónde y con qué plantilla.
type Pending = { mapId: number; room: number; at: Pos; npcIndex: number; encounter: number };

type Gohma = {
    npcId: string;
    mapId: number;
    room: number;
    row: number;
    dir: number;
    mode: "camina" | "ojo" | "tiembla" | "arremete";
    modeUntil: number;
    nextAt: number;
    nextEyeAt: number;
    nextChargeAt: number;
    fired: boolean;
    touchedAt: Map<string, number>;
};

type Hole = Pos & { dir: number };
type Eel = {
    npcId: string;
    mapId: number;
    room: number;
    home: Pos;
    center: Pos;
    holes: Hole[];
    pit: Pos[];
    mode: "espera" | "despierta" | "rompe" | "pelea";
    modeUntil: number;
    angle: number;
    spin: number;
    tailFrozen: boolean;
    lastTickAt: number;
    head: null | {
        hole: Hole;
        stage: "asoma" | "fuera" | "esconde" | "tirada" | "vuelve" | "suelta";
        until: number;
        heart: Pos;
        headAt: Pos;
        body: Pos[];
        dir: Pos;
    };
    nextHeadAt: number;
    hooks: number;
    hitsNeeded: number;
    nextHitAt: number;
    blocked: Set<string>;
    touchedAt: Map<string, number>;
    nextSyncAt: number;
};

const stalfoses = new Map<string, Stalfos>();
const pending: Pending[] = [];
const fled = new Map<number, Set<number>>();
const gohmas = new Map<string, Gohma>();
const eels = new Map<string, Eel>();

function getDungeons() {
    return require("./dungeons");
}

function getGame() {
    return require("./game");
}

function getHandleProtocol() {
    return require("./handleProtocol");
}

function getMotion() {
    return require("./dungeonMotion");
}

function getTools() {
    return require("./dungeonTools");
}

const coordKey = (x: number, y: number) => `${x},${y}`;
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const chebyshev = (a: Pos, b: Pos) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const DIRS: Pos[] = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
];

type Template = { maestroStalfos?: number; bombazos?: number; gohma?: boolean; anguila?: boolean; hp?: number };
function templateOf(npc: { templateNpcIndex?: number } | undefined): Template {
    return (npc ? vars.datNpc?.[Number(npc.templateNpcIndex ?? 0)] : undefined) ?? {};
}

function playersInRoom(mapId: number, room: number): Player[] {
    const dungeons = getDungeons();
    return (Object.values(vars.personajes ?? {}) as Player[]).filter(
        (user) => user && !user.dead && Number(user.map) === mapId && dungeons.roomAt(mapId, user.pos.x, user.pos.y) === room,
    );
}

function nearest(players: Player[], from: Pos): Player | null {
    let best: Player | null = null;
    let bestDistance = Infinity;
    for (const user of players) {
        const distance = Math.hypot(user.pos.x - from.x, user.pos.y - from.y);
        if (distance < bestDistance) {
            best = user;
            bestDistance = distance;
        }
    }
    return best;
}

function axisToward(from: Pos, to: Pos): Pos {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) return { x: Math.sign(dx), y: 0 };
    return { x: 0, y: Math.sign(dy) || 1 };
}

function canStand(mapId: number, room: number, tile: Pos, ignoreId?: string): boolean {
    const dungeons = getDungeons();
    const cell = vars.mapa[mapId]?.[tile.y]?.[tile.x];
    if (!cell || cell.blocked) return false;
    if (dungeons.roomAt(mapId, tile.x, tile.y) !== room || dungeons.isHazard(mapId, tile.x, tile.y)) return false;
    const occupant = vars.mapData[mapId]?.[tile.y]?.[tile.x]?.id;
    return !occupant || String(occupant) === ignoreId;
}

function headingFrom(from: Pos, toward: Pos): number {
    const d = vars.direcciones;
    const dx = toward.x - from.x;
    const dy = toward.y - from.y;
    return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? d.right : d.left) : dy > 0 ? d.down : d.up;
}

function moveNpc(npc: any, mapId: number, to: Pos, occupy = true) {
    const cell = vars.mapData[mapId]?.[npc.pos.y]?.[npc.pos.x];
    if (cell && String(cell.id) === String(npc.id)) cell.id = 0;
    require("./targetAssist").recordTileLeft(npc, mapId, npc.pos.x, npc.pos.y);
    if (to.x !== npc.pos.x || to.y !== npc.pos.y) npc.heading = headingFrom(npc.pos, to);
    npc.pos.x = to.x;
    npc.pos.y = to.y;
    if (occupy) vars.mapData[mapId][to.y][to.x].id = npc.id;
    require("./npcs").npcToArea(npc.id, npc.heading);
}

// Escondida no ocupaba baldosa, así que los que entraron a la sala no la conocen: se la presenta entera (como el
// Santuario a sus criaturas escondidas).
function present(npc: any) {
    require("./npcs").loopArea(npc.id, (target: { id: EntityId; dead?: boolean }) => {
        const area = (vars.areaNpc[npc.id] ??= []) as EntityId[];
        if (!target.dead && !area.includes(target.id)) area.push(target.id);
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (!client) return;
        getHandleProtocol().sendNpc(npc);
        require("./socket").send(client);
    });
}

function face(npc: any, toward: Pos) {
    npc.heading = headingFrom(npc.pos, toward);
    require("./npcs").npcToArea(npc.id, npc.heading);
}

function eachClientNear(mapId: number, pos: Pos, send: (client: RuntimeClient) => void) {
    getGame().loopAreaPos(mapId, { x: Math.round(pos.x), y: Math.round(pos.y) }, (target: { id: EntityId }) => {
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (client) send(client);
    });
}

function bossPacket(mapId: number, pos: Pos, payload: Record<string, unknown>) {
    const handleProtocol = getHandleProtocol();
    eachClientNear(mapId, pos, (client) => handleProtocol.dungeonBoss(payload, client));
}

function sound(mapId: number, pos: Pos, soundId: number) {
    const handleProtocol = getHandleProtocol();
    eachClientNear(mapId, pos, (client) => handleProtocol.playSound(0, soundId, client));
}

function tellRoom(mapId: number, room: number, text: string, color = "#FFD24A") {
    const handleProtocol = getHandleProtocol();
    for (const user of playersInRoom(mapId, room)) {
        const client = vars.clients?.[user.id] as RuntimeClient | undefined;
        if (client) handleProtocol.console(text, color, 1, 0, client);
    }
}

function tell(user: RuntimeCharacter | null | undefined, text: string) {
    const client = user ? (vars.clients?.[user.id] as RuntimeClient | undefined) : undefined;
    if (client) getHandleProtocol().console(text, "white", 1, 0, client);
}

function hurt(user: Player, fraction: number, message: string) {
    getDungeons().hurtPlayer(user, fraction, message);
}

// Lo que sale de una criatura hacia el jugador: con el Campo de Protección de frente no entra (salvo `unblockable`).
function hit(user: Player, travel: Pos, fraction: number, message: string, unblockable = false): boolean {
    if (getMotion().isAirborne(user)) return false;
    const tools = getTools();
    const dir = Math.abs(travel.x) >= Math.abs(travel.y) ? { x: Math.sign(travel.x), y: 0 } : { x: 0, y: Math.sign(travel.y) };
    if (!unblockable && tools.mirrorBlocks(user, dir)) {
        sound(Number(user.map), user.pos, tools.TOOL_SOUNDS.bloqueo);
        tell(user, "¡El Campo de Protección lo frenó!");
        return true;
    }
    hurt(user, fraction, message);
    return true;
}

// Le saca vida sin pasar por la invulnerabilidad; si muere, cuenta para el que lo hizo.
function strike(npc: any, amount: number, killerId: string | null, room: number) {
    npc.hp = Math.max(0, Number(npc.hp ?? 0) - amount);
    const handleProtocol = getHandleProtocol();
    eachClientNear(Number(npc.map), npc.pos, (client) => handleProtocol.dialog(npc.id, `${amount}`, "", "red", 0, client));
    getDungeons().broadcastNpcVitals(npc);
    if (npc.hp > 0) return;
    const killer = (killerId ? vars.clients?.[killerId] : undefined) ?? playersInRoom(Number(npc.map), room).map((user) => vars.clients?.[user.id]).find(Boolean);
    if (killer) require("./respawn").muere(killer, npc.id);
}

function say(npc: any, mapId: number, text: string) {
    const handleProtocol = getHandleProtocol();
    eachClientNear(mapId, npc.pos, (client) => handleProtocol.dialog(npc.id, text, "", "#E8E0C8", 0, client));
}

// ¿El que pega está adelante de la criatura (hacia donde mira)?
function fromFront(npc: any, attacker: Pos): boolean {
    const facing = getMotion().headingOffset(Number(npc.heading ?? vars.direcciones.down));
    const dx = Math.sign(attacker.x - npc.pos.x);
    const dy = Math.sign(attacker.y - npc.pos.y);
    return (facing.x !== 0 && dx === facing.x) || (facing.y !== 0 && dy === facing.y);
}

// --- Registro ---

export function register(npc: any): boolean {
    const template = templateOf(npc);
    if (!template.maestroStalfos && !template.gohma && !template.anguila) return false;
    const mapId = Number(npc.map);
    const dungeons = getDungeons();
    const room = dungeons.roomAt(mapId, npc.pos.x, npc.pos.y);
    if (room === undefined) return false;
    const id = String(npc.id);
    const now = Date.now();
    npc.customMotion = true;
    if (template.maestroStalfos) {
        const encounter = Number(template.maestroStalfos);
        // Los encuentros que siguen se sacan: aparecen cuando el anterior huye.
        if (encounter > 1 && !fled.get(mapId)?.has(encounter - 1)) {
            pending.push({ mapId, room, at: { x: npc.pos.x, y: npc.pos.y }, npcIndex: Number(npc.templateNpcIndex), encounter });
            setImmediate(() => getDungeons().despawnRunNpc(npc));
            return true;
        }
        stalfoses.set(id, {
            npcId: id,
            mapId,
            room,
            encounter,
            bombsToFlee: Number(template.bombazos ?? 3),
            bombs: 0,
            mode: "presenta",
            modeUntil: 0,
            nextAt: now,
            nextJumpAt: now,
            nextSlashAt: now,
            openUntil: 0,
            introduced: false,
        });
        return true;
    }
    if (template.gohma) {
        gohmas.set(id, {
            npcId: id,
            mapId,
            room,
            row: npc.pos.y,
            dir: Math.random() < 0.5 ? 1 : -1,
            mode: "camina",
            modeUntil: 0,
            nextAt: now,
            nextEyeAt: now + randomBetween(GOHMA_EYE_EVERY_MIN_MS, GOHMA_EYE_EVERY_MAX_MS),
            nextChargeAt: now + GOHMA_CHARGE_COOLDOWN_MS,
            fired: false,
            touchedAt: new Map(),
        });
        return true;
    }
    const bounds = dungeons.roomBounds(mapId, room);
    if (!bounds) return false;
    const cx = Math.floor((bounds.x1 + bounds.x2) / 2);
    const cy = Math.floor((bounds.y1 + bounds.y2) / 2);
    const left = bounds.x1 + 4;
    const right = bounds.x2 - 4;
    eels.set(id, {
        npcId: id,
        mapId,
        room,
        home: { x: npc.pos.x, y: npc.pos.y },
        center: { x: cx + 1, y: cy + 1 },
        holes: [
            { x: left, y: bounds.y1, dir: 1 },
            { x: right, y: bounds.y1, dir: 1 },
            { x: left, y: bounds.y2, dir: -1 },
            { x: right, y: bounds.y2, dir: -1 },
        ],
        pit: [
            { x: cx, y: cy },
            { x: cx + 1, y: cy },
            { x: cx, y: cy + 1 },
            { x: cx + 1, y: cy + 1 },
        ],
        mode: "espera",
        modeUntil: 0,
        angle: -Math.PI / 2,
        spin: 1,
        tailFrozen: false,
        lastTickAt: now,
        head: null,
        nextHeadAt: 0,
        hooks: 0,
        hitsNeeded: EEL_HITS,
        nextHitAt: 0,
        blocked: new Set(),
        touchedAt: new Map(),
        nextSyncAt: 0,
    });
    // Escondida en la pared: no ocupa baldosa ni se ve.
    hideEel(eels.get(id)!, npc);
    return true;
}

export function onNpcDied(npc: { id?: EntityId; pos?: Pos } | undefined) {
    const id = String(npc?.id ?? "");
    const stalfos = stalfoses.get(id);
    if (stalfos) {
        stalfoses.delete(id);
        // El cuarto: aparece el cofre del Gancho.
        getDungeons().revealBossChests(stalfos.mapId, stalfos.room);
        tellRoom(stalfos.mapId, stalfos.room, "Maestro Stalfos: «¡No puede ser...! Llevate lo que había en el cofre...»", "#E8E0C8");
    }
    gohmas.delete(id);
    const eel = eels.get(id);
    if (eel) {
        unblockEel(eel);
        for (const tile of eel.pit) getDungeons().setBossPit(eel.mapId, tile.x, tile.y, false);
        bossPacket(eel.mapId, eel.center, { id: Number(id), tipo: "anguila", fin: true });
        tellRoom(eel.mapId, eel.room, "Anguila Viscosa: «¡Tsss, tsss! No sabés qué clase de lugar es este... ¡qué tonto! ¡Ji, ji, ji!»", "#9FE0B0");
        eels.delete(id);
    }
}

export function forgetMap(mapId: number) {
    for (const [id, boss] of stalfoses) if (boss.mapId === mapId) stalfoses.delete(id);
    for (let i = pending.length - 1; i >= 0; i--) if (pending[i].mapId === mapId) pending.splice(i, 1);
    fled.delete(mapId);
    for (const [id, boss] of gohmas) if (boss.mapId === mapId) gohmas.delete(id);
    for (const [id, boss] of eels) if (boss.mapId === mapId) eels.delete(id);
}

// --- El Maestro Stalfos ---

function stalfosPacket(boss: Stalfos, npc: any, estado: string, extra: Record<string, unknown> = {}) {
    bossPacket(boss.mapId, npc.pos, { id: Number(boss.npcId), tipo: "stalfos", x: npc.pos.x, y: npc.pos.y, estado, ...extra });
}

const STALFOS_GREETING: Record<number, string> = {
    2: "¡Uy! ¡Me encontraste! Sos un pesado, ¿sabías?",
    3: "¡Uy! ¡Me encontraste! Sos un pesado, ¿sabías?",
    4: "¿¡Otra vez vos!? No parás nunca... ¡no te aguanto más! ¡Está bien, peleemos!",
};

// El espadazo: carga y tajo hacia adelante. El Campo de Protección no lo frena; saltando se lo esquiva.
function slash(boss: Stalfos, npc: any, target: Player, now: number) {
    boss.mode = "carga";
    boss.modeUntil = now + MS_WINDUP_MS;
    boss.nextSlashAt = now + MS_WINDUP_MS + MS_SLASH_COOLDOWN_MS;
    face(npc, target.pos);
    stalfosPacket(boss, npc, "tajo", { ms: MS_WINDUP_MS });
    setTimeout(() => {
        const alive = vars.npcs?.[boss.npcId];
        if (!alive || !stalfoses.has(boss.npcId) || boss.mode !== "carga") return;
        boss.mode = "pelea";
        boss.openUntil = Date.now() + MS_OPEN_MS;
        boss.nextAt = boss.openUntil;
        sound(boss.mapId, alive.pos, getTools().TOOL_SOUNDS.gancho);
        const ahead = getMotion().headingOffset(Number(alive.heading ?? vars.direcciones.down));
        for (const user of playersInRoom(boss.mapId, boss.room)) {
            const dx = user.pos.x - alive.pos.x;
            const dy = user.pos.y - alive.pos.y;
            const inArc = chebyshev(user.pos, alive.pos) === 1 && (ahead.x ? Math.sign(dx) === ahead.x : Math.sign(dy) === ahead.y);
            if (!inArc) continue;
            if (hit(user, { x: dx, y: dy }, MS_SLASH_DAMAGE, "Te pegó el espadazo del Maestro Stalfos:", true) && !user.dead) {
                getMotion().push(user, ahead, 1);
            }
        }
    }, MS_WINDUP_MS);
}

function tickStalfos(boss: Stalfos, npc: any, players: Player[], now: number) {
    if (boss.mode === "presenta") {
        if (!boss.introduced) {
            boss.introduced = true;
            boss.modeUntil = now + MS_INTRO_MS;
            const greeting = STALFOS_GREETING[boss.encounter];
            if (greeting) say(npc, boss.mapId, greeting);
            stalfosPacket(boss, npc, "aparece");
        }
        if (now >= boss.modeUntil) boss.mode = "pelea";
        return;
    }
    if (boss.mode === "carga" || boss.mode === "huye") return;
    if (boss.mode === "desarmado") {
        if (now >= boss.modeUntil) {
            boss.mode = "rearma";
            boss.modeUntil = now + MS_REASSEMBLE_MS;
            stalfosPacket(boss, npc, "rearma", { ms: MS_REASSEMBLE_MS });
        }
        return;
    }
    if (boss.mode === "rearma") {
        if (now < boss.modeUntil) return;
        boss.mode = "pelea";
        stalfosPacket(boss, npc, "armado");
        if (boss.encounter < 4 && boss.bombs >= boss.bombsToFlee) flee(boss, npc);
        return;
    }
    if (now < boss.nextAt) return;
    boss.nextAt = now + MS_STEP_MS;
    const target = nearest(players, npc.pos);
    if (!target) return;
    const distance = chebyshev(target.pos, npc.pos);
    if (distance === 1 && now >= boss.nextSlashAt && (target.pos.x === npc.pos.x || target.pos.y === npc.pos.y)) return slash(boss, npc, target, now);
    // Lejos: salta hacia él (cae al lado).
    if (distance >= MS_JUMP_FROM && now >= boss.nextJumpAt) {
        const landing = [{ x: 0, y: 0 }, ...DIRS]
            .map((d) => ({ x: target.pos.x - Math.sign(target.pos.x - npc.pos.x) + d.x, y: target.pos.y - Math.sign(target.pos.y - npc.pos.y) + d.y }))
            .find((tile) => canStand(boss.mapId, boss.room, tile, boss.npcId));
        if (landing) {
            boss.nextJumpAt = now + MS_JUMP_COOLDOWN_MS;
            const from = { x: npc.pos.x, y: npc.pos.y };
            moveNpc(npc, boss.mapId, landing);
            face(npc, target.pos);
            bossPacket(boss.mapId, landing, { id: Number(boss.npcId), tipo: "salto", desde: from, hasta: landing, ms: MS_JUMP_MS });
            boss.openUntil = now + MS_JUMP_MS + MS_OPEN_MS;
            boss.nextAt = boss.openUntil;
            return;
        }
    }
    const main = axisToward(npc.pos, target.pos);
    const other = main.x ? { x: 0, y: Math.sign(target.pos.y - npc.pos.y) } : { x: Math.sign(target.pos.x - npc.pos.x), y: 0 };
    for (const dir of [main, other]) {
        if (!dir.x && !dir.y) continue;
        const next = { x: npc.pos.x + dir.x, y: npc.pos.y + dir.y };
        if (players.some((user) => user.pos.x === next.x && user.pos.y === next.y)) {
            face(npc, next);
            return;
        }
        if (canStand(boss.mapId, boss.room, next, boss.npcId)) return moveNpc(npc, boss.mapId, next);
    }
}

// Huye: dice su frase, se va volando y aparece el que sigue (en su sala).
function flee(boss: Stalfos, npc: any) {
    boss.mode = "huye";
    say(npc, boss.mapId, "¡Arrgh! ¡No te puedo ganar! ¡Me voy de acá!");
    tellRoom(boss.mapId, boss.room, "¡El Maestro Stalfos huyó!", "#E8E0C8");
    stalfosPacket(boss, npc, "huye", { ms: MS_FLEE_MS });
    const set = fled.get(boss.mapId) ?? new Set<number>();
    set.add(boss.encounter);
    fled.set(boss.mapId, set);
    setTimeout(() => {
        const alive = vars.npcs?.[boss.npcId];
        stalfoses.delete(boss.npcId);
        if (alive) getDungeons().despawnRunNpc(alive);
        getDungeons().releaseRoomIfEmpty(boss.mapId, boss.room);
        const next = pending.findIndex((p) => p.mapId === boss.mapId && p.encounter === boss.encounter + 1);
        if (next < 0) return;
        const [spot] = pending.splice(next, 1);
        getDungeons().spawnRunNpc(spot.mapId, spot.npcIndex, spot.at, spot.room);
    }, MS_FLEE_MS);
}

// --- Las Gohma ---

function gohmaPacket(boss: Gohma, npc: any, estado: string, ms = 0) {
    bossPacket(boss.mapId, npc.pos, { id: Number(boss.npcId), tipo: "gohma", estado, ms });
}

function gohmaTouch(boss: Gohma, npc: any, user: Player, dir: Pos, now: number) {
    if (now < (boss.touchedAt.get(String(user.id)) ?? 0)) return;
    boss.touchedAt.set(String(user.id), now + TOUCH_COOLDOWN_MS);
    if (getTools().mirrorBlocksNpcHit(user, npc)) return;
    hurt(user, GOHMA_TOUCH_DAMAGE, "Te embistió una Gohma:");
    if (!user.dead) getMotion().push(user, dir, 1);
}

// Una bola de fuego desde el ojo hacia donde está el jugador (la del Genio, en línea recta).
function spit(boss: Gohma, npc: any, target: Player) {
    const from = { x: npc.pos.x, y: npc.pos.y - 0.3 };
    const to = { x: target.pos.x, y: target.pos.y };
    const ms = Math.max(250, Math.round(Math.hypot(to.x - from.x, to.y - from.y) * GOHMA_FIRE_TILE_MS));
    bossPacket(boss.mapId, npc.pos, { id: Number(boss.npcId), tipo: "fuego", desde: from, hasta: to, ms, recto: true });
    sound(boss.mapId, npc.pos, getTools().TOOL_SOUNDS.fuego);
    setTimeout(() => {
        if (!gohmas.has(boss.npcId)) return;
        for (const user of playersInRoom(boss.mapId, boss.room)) {
            if (Math.hypot(user.pos.x - to.x, user.pos.y - to.y) > 0.75) continue;
            hit(user, { x: to.x - from.x, y: to.y - from.y }, GOHMA_FIRE_DAMAGE, "Te quemó la bola de fuego de una Gohma:");
        }
    }, ms);
}

function tickGohma(boss: Gohma, npc: any, players: Player[], now: number) {
    if (boss.mode === "ojo") {
        if (!boss.fired && now >= boss.modeUntil - GOHMA_EYE_MS / 2) {
            boss.fired = true;
            const target = nearest(players, npc.pos);
            if (target) spit(boss, npc, target);
        }
        if (now < boss.modeUntil) return;
        boss.mode = "camina";
        boss.nextEyeAt = now + randomBetween(GOHMA_EYE_EVERY_MIN_MS, GOHMA_EYE_EVERY_MAX_MS);
        gohmaPacket(boss, npc, "cierra");
        return;
    }
    if (boss.mode === "tiembla") {
        if (now < boss.modeUntil) return;
        boss.mode = "arremete";
        boss.nextAt = now;
    }
    if (now < boss.nextAt) return;
    if (boss.mode === "arremete") {
        boss.nextAt = now + GOHMA_CHARGE_STEP_MS;
        const next = { x: npc.pos.x + boss.dir, y: npc.pos.y };
        const victim = players.find((user) => user.pos.x === next.x && user.pos.y === next.y);
        if (victim) gohmaTouch(boss, npc, victim, { x: boss.dir, y: 0 }, now);
        if (victim || !canStand(boss.mapId, boss.room, next, boss.npcId)) {
            boss.mode = "camina";
            boss.dir = -boss.dir;
            boss.nextChargeAt = now + GOHMA_CHARGE_COOLDOWN_MS;
            return;
        }
        moveNpc(npc, boss.mapId, next);
        return;
    }
    boss.nextAt = now + GOHMA_STEP_MS;
    // Abre el ojo: se frena, mira al jugador y a la mitad escupe fuego.
    if (now >= boss.nextEyeAt && (players.some((user) => user.pos.x === npc.pos.x) || now >= boss.nextEyeAt + GOHMA_EYE_WAIT_MS)) {
        boss.mode = "ojo";
        boss.modeUntil = now + GOHMA_EYE_MS;
        boss.fired = false;
        const target = nearest(players, npc.pos);
        if (target) face(npc, target.pos);
        gohmaPacket(boss, npc, "ojo", GOHMA_EYE_MS);
        return;
    }
    // Alguien en su fila: tiembla y arremete hacia él.
    const lined = players.find((user) => user.pos.y === npc.pos.y && Math.abs(user.pos.x - npc.pos.x) <= 7);
    if (lined && now >= boss.nextChargeAt) {
        boss.mode = "tiembla";
        boss.dir = Math.sign(lined.pos.x - npc.pos.x) || boss.dir;
        boss.modeUntil = now + GOHMA_TREMBLE_MS;
        gohmaPacket(boss, npc, "tiembla", GOHMA_TREMBLE_MS);
        return;
    }
    // Camina de lado a lado por su fila.
    const next = { x: npc.pos.x + boss.dir, y: boss.row };
    const victim = players.find((user) => user.pos.x === next.x && user.pos.y === next.y);
    if (victim) return gohmaTouch(boss, npc, victim, { x: boss.dir, y: 0 }, now);
    if (!canStand(boss.mapId, boss.room, next, boss.npcId)) {
        boss.dir = -boss.dir;
        return;
    }
    moveNpc(npc, boss.mapId, next);
}

const gohmaOpen = (boss: Gohma | undefined) => Boolean(boss && boss.mode === "ojo");

// --- La Anguila Viscosa ---

function eelPacket(eel: Eel, extra: Record<string, unknown>) {
    bossPacket(eel.mapId, eel.center, { id: Number(eel.npcId), tipo: "anguila", ...extra });
}

// Escondida en la pared vuelve a su lugar del medio, sin ocupar baldosa.
function hideEel(eel: Eel, npc: any) {
    moveNpc(npc, eel.mapId, eel.home, false);
    bossPacket(eel.mapId, npc.pos, { id: Number(eel.npcId), tipo: "oculto", oculto: true });
}

function blockEel(eel: Eel, tiles: Pos[]) {
    for (const tile of tiles) {
        const key = coordKey(tile.x, tile.y);
        if (eel.blocked.has(key)) continue;
        eel.blocked.add(key);
        getDungeons().setDungeonBlocked(eel.mapId, tile.x, tile.y, true);
    }
}

function unblockEel(eel: Eel) {
    for (const key of eel.blocked) {
        const [x, y] = key.split(",").map(Number);
        getDungeons().setDungeonBlocked(eel.mapId, x, y, false);
    }
    eel.blocked.clear();
}

function sendTail(eel: Eel, now: number) {
    eelPacket(eel, {
        cola: eel.mode === "pelea" && !eel.tailFrozen ? { cx: eel.center.x, cy: eel.center.y, angulo: eel.angle, vel: (eel.spin * 2 * Math.PI) / EEL_TURN_MS } : { cx: eel.center.x, cy: eel.center.y, angulo: eel.angle, vel: 0 },
        agujeros: eel.mode === "pelea" || eel.mode === "rompe" ? eel.holes.map(({ x, y, dir }) => ({ x, y: y - dir, dir })) : [],
        pozo: eel.mode === "pelea" || eel.mode === "rompe" ? eel.pit : [],
        t: now,
    });
}

function sendHead(eel: Eel) {
    const head = eel.head;
    eelPacket(eel, {
        cabeza: head
            ? { estado: head.stage, x: head.headAt.x, y: head.headAt.y, dir: head.dir, corazon: head.heart, cuerpo: head.body, agujero: { x: head.hole.x, y: head.hole.y - head.hole.dir } }
            : null,
    });
}

// La cola: cinco segmentos que giran alrededor del pozo, meneándose como un látigo. Pega al que pisa.
function tailTiles(eel: Eel, now: number): Pos[] {
    const wiggle = Math.sin((now / 2_130) * 2 * Math.PI) * 0.785;
    return EEL_TAIL_RADII.map((r) => {
        const a = eel.angle + wiggle * (r / EEL_TAIL_RADII[EEL_TAIL_RADII.length - 1]);
        return { x: Math.floor(eel.center.x + r * Math.cos(a)), y: Math.floor(eel.center.y + r * Math.sin(a)) };
    });
}

function tickTail(eel: Eel, players: Player[], now: number) {
    const elapsed = now - eel.lastTickAt;
    eel.lastTickAt = now;
    if (eel.tailFrozen) return;
    eel.angle += (eel.spin * 2 * Math.PI * elapsed) / EEL_TURN_MS;
    const tiles = tailTiles(eel, now);
    const motion = getMotion();
    for (const user of players) {
        if (!tiles.some((tile) => tile.x === user.pos.x && tile.y === user.pos.y)) continue;
        if (now < (eel.touchedAt.get(String(user.id)) ?? 0)) continue;
        eel.touchedAt.set(String(user.id), now + EEL_TAIL_COOLDOWN_MS);
        hurt(user, EEL_TAIL_DAMAGE, "Te barrió la cola de la Anguila Viscosa:");
        if (!user.dead) motion.push(user, axisToward(eel.center, user.pos), 1);
    }
}

// La cabeza asoma por un agujero: punta, entera (es cuando se la engancha) y se esconde.
function peek(eel: Eel, npc: any, now: number) {
    const hole = eel.holes[Math.floor(Math.random() * eel.holes.length)];
    if (vars.mapData[eel.mapId]?.[hole.y]?.[hole.x]?.id) {
        eel.nextHeadAt = now + 600;
        return;
    }
    eel.head = { hole, stage: "asoma", until: now + EEL_PEEK_MS, heart: { x: hole.x, y: hole.y }, headAt: { x: hole.x, y: hole.y }, body: [], dir: { x: 0, y: hole.dir } };
    moveNpc(npc, eel.mapId, hole);
    present(npc);
    bossPacket(eel.mapId, hole, { id: Number(eel.npcId), tipo: "oculto", oculto: true });
    sendHead(eel);
    sound(eel.mapId, hole, getDungeons().DUNGEON_SOUNDS.derrumbe);
}

function retreat(eel: Eel, npc: any, now: number) {
    unblockEel(eel);
    hideEel(eel, npc);
    eel.head = null;
    eel.tailFrozen = false;
    eel.nextHeadAt = now + EEL_HEAD_EVERY_MS;
    sendHead(eel);
    sendTail(eel, now);
}

function tickHead(eel: Eel, npc: any, players: Player[], now: number) {
    const head = eel.head;
    if (!head) {
        if (now >= eel.nextHeadAt) peek(eel, npc, now);
        return;
    }
    if (head.stage === "asoma" && now >= head.until) {
        head.stage = "fuera";
        head.until = now + EEL_OUT_MS;
        sendHead(eel);
        return;
    }
    if (head.stage === "fuera" && now >= head.until) {
        head.stage = "esconde";
        head.until = now + EEL_HIDE_MS;
        sendHead(eel);
        return;
    }
    if (head.stage === "esconde" && now >= head.until) return retreat(eel, npc, now);
    if (head.stage === "tirada" && now >= head.until) {
        head.stage = "vuelve";
        head.until = now + EEL_RETRACT_STEP_MS;
        sendHead(eel);
        return;
    }
    if (head.stage === "vuelve" && now >= head.until) {
        // Vuelve hacia el agujero de a una baldosa.
        head.until = now + EEL_RETRACT_STEP_MS;
        if (head.headAt.x === head.hole.x && head.headAt.y === head.hole.y) return retreat(eel, npc, now);
        layOut(eel, npc, { x: head.headAt.x - head.dir.x, y: head.headAt.y - head.dir.y });
        return;
    }
    if (head.stage === "suelta") {
        if (now >= head.until) return explode(eel, npc, now);
        if (now < eel.nextHitAt) return;
        eel.nextHitAt = now + EEL_LOOSE_STEP_MS;
        // Vuela por la sala: sigue derecho y gira de a ratos; contra la pared se da vuelta.
        if (Math.random() < 0.3) head.dir = DIRS[Math.floor(Math.random() * DIRS.length)];
        let next = { x: npc.pos.x + head.dir.x, y: npc.pos.y + head.dir.y };
        const inside = (tile: Pos) => getDungeons().roomAt(eel.mapId, tile.x, tile.y) === eel.room && !vars.mapa[eel.mapId]?.[tile.y]?.[tile.x]?.blocked;
        if (!inside(next)) {
            head.dir = { x: -head.dir.x, y: -head.dir.y };
            next = { x: npc.pos.x + head.dir.x, y: npc.pos.y + head.dir.y };
            if (!inside(next)) return;
        }
        const victim = players.find((user) => user.pos.x === next.x && user.pos.y === next.y);
        if (victim) {
            if (now >= (eel.touchedAt.get(String(victim.id)) ?? 0)) {
                eel.touchedAt.set(String(victim.id), now + TOUCH_COOLDOWN_MS);
                hurt(victim, EEL_LOOSE_DAMAGE, "Te chocó la Anguila Viscosa:");
            }
            head.dir = { x: -head.dir.x, y: -head.dir.y };
            return;
        }
        moveNpc(npc, eel.mapId, next, false);
        head.headAt = next;
        head.heart = next;
        sendHead(eel);
    }
}

// Acomoda la anguila afuera con la cabeza en `headAt` (en la columna de su agujero): el corazón es el segmento de atrás
// de la cabeza (ahí está la criatura, que es lo que se golpea) y el resto del cuerpo llega hasta el agujero. La cabeza
// y el cuerpo tapan el paso.
function layOut(eel: Eel, npc: any, headAt: Pos) {
    const head = eel.head!;
    const dir = head.dir;
    const tiles: Pos[] = [];
    for (let y = headAt.y - dir.y; dir.y > 0 ? y >= head.hole.y : y <= head.hole.y; y -= dir.y) tiles.push({ x: head.hole.x, y });
    head.headAt = headAt;
    head.heart = tiles[0] ?? headAt;
    head.body = tiles.slice(1);
    unblockEel(eel);
    moveNpc(npc, eel.mapId, head.heart);
    blockEel(eel, [headAt, ...head.body].filter((tile) => tile.x !== head.heart.x || tile.y !== head.heart.y));
    bossPacket(eel.mapId, head.heart, { id: Number(eel.npcId), tipo: "oculto", oculto: true });
    sendHead(eel);
}

// La anguila suelta explota: lastima al que está al lado y vuelve a esconderse en la pared.
function explode(eel: Eel, npc: any, now: number) {
    const at = { x: npc.pos.x, y: npc.pos.y };
    eelPacket(eel, { explota: at });
    sound(eel.mapId, at, getTools().TOOL_SOUNDS.explosion);
    for (const user of playersInRoom(eel.mapId, eel.room)) {
        if (chebyshev(user.pos, at) <= 1) hurt(user, EEL_BLAST_DAMAGE, "Te alcanzó la explosión de la Anguila Viscosa:");
    }
    retreat(eel, npc, now);
}

function tickEel(eel: Eel, npc: any, players: Player[], now: number) {
    if (now >= eel.nextSyncAt) {
        eel.nextSyncAt = now + EEL_SYNC_MS;
        sendTail(eel, now);
        if (eel.head) sendHead(eel);
    }
    if (eel.mode === "espera") {
        eel.lastTickAt = now;
        if (!players.length) return;
        eel.mode = "despierta";
        eel.modeUntil = now + EEL_WAKE_MS;
        return;
    }
    if (eel.mode === "despierta") {
        eel.lastTickAt = now;
        if (now < eel.modeUntil) return;
        eel.mode = "rompe";
        eel.modeUntil = now + EEL_BREAK_MS;
        tellRoom(eel.mapId, eel.room, "Anguila Viscosa: «Asssí que vos sssos el de afuera... ¡Ji, ji, ji! ¡Te voy a comer!»", "#9FE0B0");
        sound(eel.mapId, eel.center, getDungeons().DUNGEON_SOUNDS.derrumbe);
        // El piso se rompe en el medio.
        for (const tile of eel.pit) getDungeons().setBossPit(eel.mapId, tile.x, tile.y, true);
        eelPacket(eel, { rompe: EEL_BREAK_MS });
        sendTail(eel, now);
        return;
    }
    if (eel.mode === "rompe") {
        eel.lastTickAt = now;
        if (now < eel.modeUntil) return;
        eel.mode = "pelea";
        eel.nextHeadAt = now + EEL_FIRST_HEAD_MS;
        eel.hitsNeeded = EEL_HITS + EEL_HITS_PER_EXTRA_PLAYER * Math.max(0, players.length - 1);
        sendTail(eel, now);
        return;
    }
    tickTail(eel, players, now);
    tickHead(eel, npc, players, now);
}

// El Gancho a la cabeza entera, desde su columna y mirando hacia el agujero: la saca de la pared hasta el jugador. Desde
// el cuarto enganche, la mitad de las veces se suelta.
function hookEel(eel: Eel, npc: any, user: Player): boolean {
    const head = eel.head;
    if (!head || head.stage !== "fuera" || user.pos.x !== head.hole.x) return false;
    eel.hooks++;
    const now = Date.now();
    sound(eel.mapId, head.hole, getTools().TOOL_SOUNDS.gancho);
    if (eel.hooks >= EEL_LOOSE_FROM && Math.random() < EEL_LOOSE_CHANCE) {
        head.stage = "suelta";
        head.until = now + EEL_LOOSE_MS;
        head.dir = { x: 0, y: head.hole.dir };
        eel.tailFrozen = true;
        tellRoom(eel.mapId, eel.room, "¡La Anguila se soltó! Alejate: va a explotar.", "#FF6B3D");
        sendHead(eel);
        return true;
    }
    // La cabeza queda al lado del jugador; el corazón, detrás; el resto del cuerpo, hasta el agujero.
    head.stage = "tirada";
    head.until = now + EEL_EXPOSED_MS;
    head.dir = { x: 0, y: head.hole.dir };
    eel.spin = -eel.spin;
    eel.tailFrozen = true;
    layOut(eel, npc, { x: user.pos.x, y: user.pos.y - head.hole.dir });
    tellRoom(eel.mapId, eel.room, "¡La sacaste de la pared! Pegale al corazón, de costado.");
    return true;
}

// --- Lo que llega de afuera ---

// El golpe cuerpo a cuerpo. Devuelve true si ya lo resolvió (no hace daño común).
export function onNpcStruck(npc: any, attacker: RuntimeCharacter): boolean {
    const id = String(npc?.id ?? "");
    const stalfos = stalfoses.get(id);
    if (stalfos) {
        if (stalfos.mode === "desarmado" || stalfos.mode === "rearma") {
            tell(attacker, "Desarmado no le entran los golpes: ¡ponele una bomba!");
            return true;
        }
        if (stalfos.mode !== "pelea" && stalfos.mode !== "carga") return true;
        if (fromFront(npc, attacker.pos) && Date.now() >= stalfos.openUntil) {
            sound(stalfos.mapId, npc.pos, getTools().TOOL_SOUNDS.bloqueo);
            tell(attacker, "El Maestro Stalfos frena el golpe con el escudo: pegale justo después de un espadazo, o de costado.");
            return true;
        }
        stalfos.mode = "desarmado";
        stalfos.modeUntil = Date.now() + MS_COLLAPSED_MS;
        sound(stalfos.mapId, npc.pos, getTools().TOOL_SOUNDS.romper);
        stalfosPacket(stalfos, npc, "desarmado", { ms: MS_COLLAPSED_MS });
        tellRoom(stalfos.mapId, stalfos.room, "¡El Maestro Stalfos se desarmó! Rápido, una bomba.");
        return true;
    }
    if (gohmas.has(id)) {
        tell(attacker, "Los golpes no le hacen nada a la Gohma: con el ojo abierto, flechas o el Gancho.");
        return true;
    }
    const eel = eels.get(id);
    if (eel) {
        const head = eel.head;
        if (!head || (head.stage !== "tirada" && head.stage !== "vuelve")) {
            tell(attacker, "La Anguila está en la pared: engánchala cuando asome entera.");
            return true;
        }
        const now = Date.now();
        if (now < eel.nextHitAt) return true;
        eel.nextHitAt = now + EEL_HIT_COOLDOWN_MS;
        sound(eel.mapId, npc.pos, getTools().TOOL_SOUNDS.romper);
        strike(npc, Math.max(1, Math.ceil(Number(npc.maxHp ?? npc.hp ?? 1) / eel.hitsNeeded)), String(attacker.id), eel.room);
        return true;
    }
    return false;
}

export function invulnerableReason(npc: any, source?: string): string | null {
    const id = String(npc?.id ?? "");
    if (stalfoses.has(id)) {
        const boss = stalfoses.get(id)!;
        if (source === "bomba" && boss.mode === "desarmado") return null;
        return source === "bomba" ? "Armado, las bombas no le hacen nada: primero desarmalo de un golpe." : "Al Maestro Stalfos hay que desarmarlo de un golpe y ponerle una bomba.";
    }
    const gohma = gohmas.get(id);
    if (gohma) {
        if (!gohmaOpen(gohma)) return "La Gohma tiene el ojo cerrado: esperá a que lo abra.";
        if (source !== "flecha" && source !== "gancho" && source !== "bomba") return "A la Gohma solo le entran las flechas y el Gancho, con el ojo abierto.";
        return null;
    }
    if (eels.has(id)) return "La Anguila está en la pared: engánchala cuando asome entera y pegale al corazón.";
    return null;
}

// Cuánto le saca a una Gohma (con el ojo abierto): una flecha o una bomba, un tercio; el Gancho, un sexto.
export function damageFor(npc: any, source: string, amount: number): number {
    const gohma = gohmas.get(String(npc?.id ?? ""));
    if (!gohma || !gohmaOpen(gohma)) return amount;
    const maxHp = Number(npc.maxHp ?? npc.hp ?? amount);
    if (source === "flecha" || source === "bomba") return Math.ceil(maxHp / GOHMA_ARROWS);
    if (source === "gancho") return Math.ceil(maxHp / GOHMA_HOOKS);
    return amount;
}

// El Gancho contra una criatura. Devuelve true si lo resolvió (la Anguila).
export function onHooked(npc: any, user: RuntimeCharacter): boolean {
    const eel = eels.get(String(npc?.id ?? ""));
    if (!eel) return false;
    hookEel(eel, npc, user as Player);
    return true;
}

// Una bomba explotó en (x, y): al Maestro Stalfos desarmado le cuenta un bombazo.
export function onExplosion(user: RuntimeCharacter, mapId: number, at: Pos): Set<string> {
    const handled = new Set<string>();
    for (const boss of stalfoses.values()) {
        const npc = vars.npcs?.[boss.npcId];
        if (boss.mapId !== mapId || !npc || chebyshev(at, npc.pos) > 1) continue;
        handled.add(boss.npcId);
        if (boss.mode !== "desarmado") {
            tell(user, "Armado, las bombas no le hacen nada: primero desarmalo de un golpe.");
            continue;
        }
        boss.bombs++;
        const finalOne = boss.encounter >= 4;
        const parts = finalOne ? boss.bombsToFlee : boss.bombsToFlee + 1;
        tellRoom(boss.mapId, boss.room, `¡Bombazo al Maestro Stalfos! (${boss.bombs} de ${boss.bombsToFlee})`);
        strike(npc, Math.max(1, Math.ceil(Number(npc.maxHp ?? npc.hp ?? 1) / parts)), String(user.id), boss.room);
        if (stalfoses.has(boss.npcId) && !finalOne && boss.bombs >= boss.bombsToFlee) boss.modeUntil = Math.min(boss.modeUntil, Date.now() + 600);
    }
    return handled;
}

// Cada 50 ms, por mapa de la corrida.
export function tick(mapId: number, now: number) {
    for (const boss of stalfoses.values()) {
        if (boss.mapId !== mapId) continue;
        const npc = vars.npcs?.[boss.npcId];
        if (!npc) {
            stalfoses.delete(boss.npcId);
            continue;
        }
        const players = playersInRoom(mapId, boss.room);
        if (players.length || boss.mode === "huye") tickStalfos(boss, npc, players, now);
    }
    for (const boss of gohmas.values()) {
        if (boss.mapId !== mapId) continue;
        const npc = vars.npcs?.[boss.npcId];
        if (!npc) {
            gohmas.delete(boss.npcId);
            continue;
        }
        const players = playersInRoom(mapId, boss.room);
        if (players.length) tickGohma(boss, npc, players, now);
    }
    for (const eel of eels.values()) {
        if (eel.mapId !== mapId) continue;
        const npc = vars.npcs?.[eel.npcId];
        if (!npc) {
            eels.delete(eel.npcId);
            continue;
        }
        tickEel(eel, npc, playersInRoom(mapId, eel.room), now);
    }
}

module.exports = {
    register,
    onNpcDied,
    forgetMap,
    onNpcStruck,
    invulnerableReason,
    damageFor,
    onHooked,
    onExplosion,
    tick,
};
