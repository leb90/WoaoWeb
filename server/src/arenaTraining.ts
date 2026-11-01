// Entrenamiento de la arena: uno contra un bot (arenaBot.ts) en una copia privada del mapa de la arena. Se elige la
// clase propia y la del bot en /arenas. Cada vez que le ganás, el bot sube de nivel (arenaTrainingRules.ts) y sumás
// puntos; cuando te gana, se anota el puntaje de la racha en el ranking de /arenas y arrancás de nuevo en el nivel 1.
// Usa las mismas reglas de la arena (arenaFfa): no se pierde nada al morir, las pociones no se gastan, no hay zona
// segura. arena.ts le pasa las conexiones, muertes y desconexiones de estos personajes.
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";
import { createArenaBot, createBotClient, setBotLevel, thinkArenaBot, type ArenaBot } from "./arenaBot";
import { getArenaClass } from "./arenaClasses";
import { botProfile, puntosPorVictoria } from "./arenaTrainingRules";

export {};

const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const funct = require("./functions");
const mapInstanceManager = require("./mapInstanceManager");

function getGame() {
    return require("./game");
}

function getLogin() {
    return require("./login");
}

function getSocket() {
    return require("./socket");
}

// Copias privadas del mapa de la arena (115): el lugar 0 es el todos contra todos (arena.ts).
const BASE_MAP = 115;
const PRIMER_LUGAR = 1;
const ULTIMO_LUGAR = 49;
const NOMBRE_MAPA = "Arena: entrenamiento";
const LUGAR_JUGADOR = { x: 46, y: 47 };
const LUGAR_BOT = { x: 53, y: 47 };

const CUENTA_REGRESIVA_MS = 3_000;
const ENTRE_RONDAS_MS = 2_500;
const REVIVIR_MS = 5_000;
const API_FLUSH_MS = 5_000;
const VITALES_CADA_MS = 150;
const REENVIAR_ESTADO_MS = 2_000;

type Resultado = { accountId: string; puntaje: number; nivel: number; idClase: number; idClaseBot: number };

type Sesion = {
    jugadorId: string;
    accountId: string;
    nombre: string;
    idClase: number;
    idClaseBot: number;
    map: number;
    bot: ArenaBot | null;
    nivel: number;
    puntaje: number;
    ganados: number;
    record: number;
    estado: "preparando" | "peleando" | "entreRondas" | "perdiste";
    empiezaAt: number;
    reviveAt: number;
    ultimo: { tipo: "victoria" | "derrota"; nivel: number; puntos: number } | null;
    timers: Set<ReturnType<typeof setTimeout>>;
    vitalesEnviados: string;
    proximosVitalesAt: number;
    cerrando: boolean;
};

const state = {
    sesiones: new Map<string, Sesion>(),
    /** Lugares reservados entre que el jugador se conecta y arranca la sesión. */
    lugares: new Set<number>(),
    pendientes: [] as Resultado[],
    flushTimer: null as ReturnType<typeof setInterval> | null,
};

type Entrenamiento = { map: number; idClaseBot: number; record?: number; esBot?: boolean; jugadorId?: string };

type TrainingCharacter = RuntimeCharacter & { arenaEntrenamiento?: Entrenamiento };

function getUser(id: EntityId): TrainingCharacter | undefined {
    return vars.personajes[id] as TrainingCharacter | undefined;
}

function getClient(id: EntityId): RuntimeClient | undefined {
    return vars.clients[id] as RuntimeClient | undefined;
}

export function isTrainingCharacter(user: { arenaEntrenamiento?: unknown } | null | undefined): boolean {
    return Boolean(user?.arenaEntrenamiento);
}

function instanceMap(lugar: number) {
    return 30_000 + BASE_MAP * 50 + lugar;
}

function libre(map: number, x: number, y: number) {
    const tile = vars.mapa[map]?.[y]?.[x];
    const occupant = vars.mapData[map]?.[y]?.[x];
    if (!tile || !occupant || occupant.id || typeof tile.tileExit !== "undefined") {
        return false;
    }
    return getGame().validPosRespawn({ x, y }, map, false);
}

/** La baldosa libre más cercana a la pedida (en espiral). */
function lugarLibre(map: number, pedido: { x: number; y: number }) {
    for (let radio = 0; radio <= 6; radio++) {
        for (let dy = -radio; dy <= radio; dy++) {
            for (let dx = -radio; dx <= radio; dx++) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) !== radio) {
                    continue;
                }
                if (libre(map, pedido.x + dx, pedido.y + dy)) {
                    return { x: pedido.x + dx, y: pedido.y + dy };
                }
            }
        }
    }
    return { ...pedido };
}

/**
 * Lo llama login.connectCharacterPvP antes de crear al jugador: reserva una copia del mapa de la arena y devuelve
 * dónde aparece. Null si están todas ocupadas.
 */
export function reserveInstance(): { map: number; x: number; y: number } | null {
    const usados = new Set([...state.lugares, ...[...state.sesiones.values()].map((sesion) => sesion.map)]);
    for (let lugar = PRIMER_LUGAR; lugar <= ULTIMO_LUGAR; lugar++) {
        const map = instanceMap(lugar);
        if (usados.has(map) || mapInstanceManager.countPlayers(map) > 0) {
            continue;
        }
        if (!mapInstanceManager.ensureInstance(map)) {
            return null;
        }
        // El clon de la instancia no copia el nombre del mapa base (ver arena.ensureArenaMap).
        const mapData = vars.mapData[map];
        if (mapData) {
            mapData.name = NOMBRE_MAPA;
        }
        state.lugares.add(map);
        return { map, ...lugarLibre(map, LUGAR_JUGADOR) };
    }
    return null;
}

/** Si el jugador no llegó a conectarse, la copia reservada vuelve a quedar libre. */
export function releaseInstance(map: number) {
    if (!state.lugares.delete(map)) {
        return;
    }
    if (mapInstanceManager.countPlayers(map) === 0) {
        mapInstanceManager.destroyInstance(map);
    }
}

/** Para el bot: dónde aparece en la copia de su rival. */
export function botSpawn(map: number) {
    return lugarLibre(map, LUGAR_BOT);
}

function nombreClase(idClase: number) {
    return getArenaClass(idClase)?.nombre ?? "Bot";
}

function consola(sesion: Sesion, mensaje: string, color = "#E69500") {
    const client = getClient(sesion.jugadorId);
    if (client) {
        handleProtocol.console(mensaje, color, 1, 0, client);
    }
}

function botDice(sesion: Sesion, frases: string[]) {
    const client = getClient(sesion.jugadorId);
    const bot = sesion.bot ? getUser(sesion.bot.id) : undefined;
    if (!client || !bot || !frases.length) {
        return;
    }
    const frase = frases[Math.floor(Math.random() * frases.length)]!;
    handleProtocol.dialog(bot.id, frase, bot.nameCharacter, "#c9c9c9", 0, client);
}

function programar(sesion: Sesion, ms: number, accion: () => void) {
    const timer = setTimeout(() => {
        sesion.timers.delete(timer);
        if (!sesion.cerrando) {
            try {
                accion();
            } catch (error) {
                funct.dumpError(error);
            }
        }
    }, ms);
    sesion.timers.add(timer);
}

// --- Estado para el HUD (paquete arenaState, como la arena) ---

function payload(sesion: Sesion) {
    const ahora = Date.now();
    const clase = getArenaClass(sesion.idClase);
    return {
        jugadores: 1,
        top: [],
        yo: null,
        reviveEn: sesion.estado === "perdiste" ? Math.max(0, sesion.reviveAt - ahora) : 0,
        muerte:
            sesion.estado === "perdiste"
                ? { asesino: `${nombreClase(sesion.idClaseBot)} nivel ${sesion.ultimo?.nivel ?? sesion.nivel}`, perdidos: 0 }
                : null,
        accesos: clase?.accesos ?? null,
        entrenamiento: {
            nivel: sesion.nivel,
            puntaje: sesion.puntaje,
            record: Math.max(sesion.record, sesion.puntaje),
            ganados: sesion.ganados,
            idClaseBot: sesion.idClaseBot,
            estado: sesion.estado,
            empiezaEn: Math.max(0, sesion.empiezaAt - ahora),
            ultimo: sesion.ultimo,
        },
    };
}

function enviarEstado(sesion: Sesion) {
    const client = getClient(sesion.jugadorId);
    if (client && typeof handleProtocol.arenaState === "function") {
        handleProtocol.arenaState(payload(sesion), client);
    }
}

/** La vida y el maná del bot cambian con sus pociones: el jugador los ve en la barra de su objetivo. */
function enviarVitalesDelBot(sesion: Sesion, ahora: number, forzar = false) {
    if (!sesion.bot || (!forzar && ahora < sesion.proximosVitalesAt)) {
        return;
    }
    sesion.proximosVitalesAt = ahora + VITALES_CADA_MS;
    const bot = getUser(sesion.bot.id);
    const client = getClient(sesion.jugadorId);
    if (!bot || !client) {
        return;
    }
    const firma = `${bot.hp}|${bot.maxHp}|${bot.mana}|${bot.maxMana}`;
    if (!forzar && firma === sesion.vitalesEnviados) {
        return;
    }
    sesion.vitalesEnviados = firma;
    handleProtocol.entityVitalsDelta(
        bot.id,
        Number(bot.hp ?? 0),
        Number(bot.maxHp ?? 0),
        Number(bot.mana ?? 0),
        Number(bot.maxMana ?? 0),
        client,
    );
}

// --- Rondas ---

/** Vida, maná y estados como al entrar, en su lugar de salida. */
function prepararPersonaje(id: EntityId, map: number, lugar: { x: number; y: number }) {
    const user = getUser(id);
    const client = getClient(id);
    if (!user || !client) {
        return;
    }
    const game = getGame();
    game.forceDismount(id);
    const destino = lugarLibre(map, lugar);
    if (user.pos.x !== destino.x || user.pos.y !== destino.y || Number(user.map) !== map) {
        game.telep(client, map, destino.x, destino.y, "arena-entrenamiento");
    }
    if (user.dead) {
        game.revivirUsuario(id, { full: true });
    }
    user.hp = Number(user.maxHp ?? user.hp);
    user.mana = Number(user.maxMana ?? user.mana);
    user.sta = Number(user.maxSta ?? user.sta ?? 0);
    // La parálisis se saca igual que cuando se termina o con Remover: avisándole al cliente. Si no, el cliente sigue
    // creyendo que está paralizado y no deja caminar (el server ya no la ve, así que tampoco la saca por tiempo).
    const estabaQuieto = Boolean(user.paralizado || user.inmovilizado);
    user.paralizado = 0;
    user.inmovilizado = 0;
    user.cooldownParalizado = 0;
    handleProtocol.inmo(id, 0, client);
    if (estabaQuieto) {
        game.broadcastCharacterSnapshot(user);
    }
    handleProtocol.updateHP(user.hp, client);
    handleProtocol.updateMana(user.mana, client);
}

/** Vida de más del bot desde el nivel 11; el daño de más lo lee game.ts (arenaBotDanoPct). */
function aplicarNivelAlBot(sesion: Sesion) {
    const bot = sesion.bot ? (getUser(sesion.bot.id) as TrainingCharacter & Record<string, unknown>) : undefined;
    if (!bot || !sesion.bot) {
        return;
    }
    const perfil = botProfile(sesion.nivel);
    setBotLevel(sesion.bot, sesion.nivel);
    getGame().refreshEquipmentVitals(bot, false);
    bot.maxHp = Math.round(Number(bot.maxHp ?? 0) * (1 + perfil.vidaExtraPct / 100));
    bot.hp = bot.maxHp;
    bot.mana = Number(bot.maxMana ?? 0);
    bot.arenaBotDanoPct = perfil.danoExtraPct;
}

function empezarRonda(sesion: Sesion) {
    if (!sesion.bot) {
        return;
    }
    prepararPersonaje(sesion.jugadorId, sesion.map, LUGAR_JUGADOR);
    prepararPersonaje(sesion.bot.id, sesion.map, LUGAR_BOT);
    aplicarNivelAlBot(sesion);

    const ahora = Date.now();
    sesion.estado = "peleando";
    sesion.empiezaAt = ahora + CUENTA_REGRESIVA_MS;
    // Como una persona, tarda en arrancar lo que tarda en reaccionar (en el nivel 1, un segundo largo).
    sesion.bot.quietoHasta = sesion.empiezaAt + botProfile(sesion.nivel).reaccionMs * (0.8 + Math.random() * 0.4);
    // Nadie se mueve ni pega hasta que termina la cuenta (el mismo bloqueo que las rondas de ranked).
    for (const id of [sesion.jugadorId, sesion.bot.id]) {
        const user = getUser(id);
        if (user) {
            user.rankedLockedUntil = sesion.empiezaAt;
        }
    }

    const perfil = botProfile(sesion.nivel);
    const extra = perfil.vidaExtraPct ? ` Tiene ${perfil.vidaExtraPct}% más de vida y ${perfil.danoExtraPct}% más de daño.` : "";
    consola(sesion, `Entrenamiento> Nivel ${sesion.nivel}: ${nombreClase(sesion.idClaseBot)}.${extra}`);
    enviarEstado(sesion);
    enviarVitalesDelBot(sesion, ahora, true);
    programar(sesion, 400, () =>
        botDice(sesion, sesion.nivel === 1 ? ["Dale, a ver qué tenés.", "Cuando quieras."] : ["Otra vez.", "Ahora va en serio.", "Esta no te la llevás."]),
    );
}

function terminarRacha(sesion: Sesion) {
    if (sesion.puntaje > 0 && sesion.accountId && !sesion.accountId.startsWith("bot:")) {
        state.pendientes.push({
            accountId: sesion.accountId,
            puntaje: sesion.puntaje,
            nivel: sesion.ganados,
            idClase: sesion.idClase,
            idClaseBot: sesion.idClaseBot,
        });
        void flushToApi();
    }
    sesion.record = Math.max(sesion.record, sesion.puntaje);
}

/** El jugador le ganó al bot: suma, el bot sube de nivel y arranca la ronda siguiente. */
function ganoElJugador(sesion: Sesion) {
    const jugador = getUser(sesion.jugadorId);
    const vidaPct = jugador ? Number(jugador.hp ?? 0) / Math.max(1, Number(jugador.maxHp ?? 1)) : 0;
    const puntos = puntosPorVictoria(sesion.nivel, vidaPct);
    sesion.puntaje += puntos;
    sesion.ganados += 1;
    sesion.ultimo = { tipo: "victoria", nivel: sesion.nivel, puntos };
    sesion.estado = "entreRondas";
    sesion.empiezaAt = Date.now() + ENTRE_RONDAS_MS;
    consola(
        sesion,
        `Entrenamiento> ¡Le ganaste al nivel ${sesion.nivel}! +${puntos} puntos (${Math.round(vidaPct * 100)}% de vida). Puntaje: ${sesion.puntaje}.`,
        "#9FE29F",
    );
    sesion.nivel += 1;
    enviarEstado(sesion);
    programar(sesion, ENTRE_RONDAS_MS, () => empezarRonda(sesion));
}

/** El bot le ganó al jugador: se anota la racha y a los 5 segundos se vuelve a empezar del nivel 1. */
function ganoElBot(sesion: Sesion) {
    const ahora = Date.now();
    sesion.ultimo = { tipo: "derrota", nivel: sesion.nivel, puntos: sesion.puntaje };
    const recordAnterior = sesion.record;
    terminarRacha(sesion);
    sesion.estado = "perdiste";
    sesion.reviveAt = ahora + REVIVIR_MS;
    if (sesion.bot) {
        sesion.bot.quietoHasta = Number.MAX_SAFE_INTEGER;
    }
    const nuevoRecord = sesion.puntaje > recordAnterior && sesion.puntaje > 0 ? " ¡Nuevo récord!" : "";
    consola(
        sesion,
        `Entrenamiento> Te ganó el nivel ${sesion.nivel}. Le ganaste a ${sesion.ganados} y sumaste ${sesion.puntaje} puntos.${nuevoRecord} En 5 segundos empezás de nuevo.`,
        "#FF9F9F",
    );
    programar(sesion, 900, () => botDice(sesion, ["GG.", "Buena pelea.", "Casi, eh.", "Otra vez será."]));
    enviarEstado(sesion);
    programar(sesion, REVIVIR_MS, () => {
        sesion.nivel = 1;
        sesion.puntaje = 0;
        sesion.ganados = 0;
        sesion.ultimo = null;
        empezarRonda(sesion);
    });
}

// --- Conexiones (las llama arena.ts) ---

export function onConnected(idUser: EntityId) {
    const user = getUser(idUser);
    const entrenamiento = user?.arenaEntrenamiento;
    if (!user || !entrenamiento || entrenamiento.esBot) {
        return;
    }

    const id = String(idUser);
    state.lugares.delete(entrenamiento.map);
    const sesion: Sesion = {
        jugadorId: id,
        accountId: String(user.idAccount ?? ""),
        nombre: String(user.nameCharacter ?? ""),
        idClase: Number(user.idClase),
        idClaseBot: Number(entrenamiento.idClaseBot),
        map: entrenamiento.map,
        bot: null,
        nivel: 1,
        puntaje: 0,
        ganados: 0,
        record: Number(entrenamiento.record ?? 0),
        estado: "preparando",
        empiezaAt: 0,
        reviveAt: 0,
        ultimo: null,
        timers: new Set(),
        vitalesEnviados: "",
        proximosVitalesAt: 0,
        cerrando: false,
    };
    state.sesiones.set(id, sesion);

    const client = getClient(idUser);
    if (client) {
        handleProtocol.console(
            `Entrenamiento> Uno contra uno con un bot ${nombreClase(sesion.idClaseBot)}. Cada vez que le ganás sube de nivel y sumás puntos; si te gana, tu puntaje queda en el ranking de /arenas y volvés al nivel 1.`,
            "#E69500",
            1,
            0,
            client,
        );
    }
    void conectarBot(sesion);
}

async function conectarBot(sesion: Sesion) {
    const client = createBotClient();
    const spawn = botSpawn(sesion.map);
    try {
        await getLogin().connectCharacterPvP(
            client,
            `Bot ${nombreClase(sesion.idClaseBot)}`,
            `bot:entrenamiento:${sesion.jugadorId}`,
            sesion.idClaseBot,
            {
                arena: true,
                entrenamiento: { map: sesion.map, idClaseBot: sesion.idClaseBot, esBot: true, jugadorId: sesion.jugadorId },
                spawn: { mapId: sesion.map, x: spawn.x, y: spawn.y },
            },
        );
    } catch (error) {
        funct.dumpError(error);
    }

    if (sesion.cerrando || !client.id || !getUser(client.id)) {
        if (client.id) {
            void getSocket().closePjById(client.id);
        }
        return;
    }

    sesion.bot = createArenaBot(client.id, sesion.jugadorId, client, sesion.nivel);
    empezarRonda(sesion);
    programar(sesion, REENVIAR_ESTADO_MS, () => enviarEstado(sesion));
}

function sesionDelBot(idBot: string): Sesion | undefined {
    for (const sesion of state.sesiones.values()) {
        if (sesion.bot && String(sesion.bot.id) === idBot) {
            return sesion;
        }
    }
    return undefined;
}

export function onUserDied(idUser: EntityId) {
    const id = String(idUser);
    const sesion = state.sesiones.get(id);
    if (sesion) {
        if (sesion.estado === "peleando") {
            ganoElBot(sesion);
        }
        return;
    }
    const delBot = sesionDelBot(id);
    if (delBot && delBot.estado === "peleando") {
        ganoElJugador(delBot);
    }
}

export function onDisconnected(user: RuntimeCharacter | undefined) {
    if (!user || !isTrainingCharacter(user)) {
        return;
    }
    const id = String(user.id);
    const sesion = state.sesiones.get(id);
    if (sesion) {
        cerrarSesion(sesion);
        return;
    }
    // El bot se fue solo (no debería): la sesión sigue sin él hasta que el jugador salga.
    const delBot = sesionDelBot(id);
    if (delBot && !delBot.cerrando) {
        delBot.bot = null;
    }
}

function cerrarSesion(sesion: Sesion) {
    sesion.cerrando = true;
    for (const timer of sesion.timers) {
        clearTimeout(timer);
    }
    sesion.timers.clear();
    if (sesion.estado !== "perdiste") {
        terminarRacha(sesion);
    }
    state.sesiones.delete(sesion.jugadorId);
    const botId = sesion.bot?.id;
    sesion.bot = null;
    void (async () => {
        if (botId) {
            await getSocket().closePjById(botId);
        }
        if (mapInstanceManager.countPlayers(sesion.map) === 0) {
            mapInstanceManager.destroyInstance(sesion.map);
        }
    })();
}

/** Muerte en el entrenamiento: el cartel del cliente muestra cuándo vuelve a empezar. */
export function getReviveDelayMs(idUser: EntityId): number {
    const sesion = state.sesiones.get(String(idUser));
    return sesion ? Math.max(0, sesion.reviveAt - Date.now()) : REVIVIR_MS;
}

export function sendState(idUser: EntityId) {
    const sesion = state.sesiones.get(String(idUser));
    if (sesion) {
        enviarEstado(sesion);
    }
}

// --- Duelo de bot contra bot (solo fuera de producción, para medir la dificultad) ---

type Duelo = {
    map: number;
    bots: [ArenaBot, ArenaBot];
    empezo: number;
    hasta: number;
    terminar: (resultado: ResultadoDuelo) => void;
};

export type ResultadoDuelo = {
    ganador: "a" | "b" | "empate";
    ms: number;
    vidaPct: [number, number];
    acciones: [ArenaBot["acciones"], ArenaBot["acciones"]];
};

const duelos = new Set<Duelo>();

async function conectarBotDeDuelo(map: number, idClase: number, lugar: { x: number; y: number }) {
    const client = createBotClient();
    const spawn = lugarLibre(map, lugar);
    await getLogin().connectCharacterPvP(client, `Bot ${nombreClase(idClase)}`, `bot:duelo:${Date.now()}`, idClase, {
        arena: true,
        entrenamiento: { map, idClaseBot: idClase, esBot: true },
        spawn: { mapId: map, x: spawn.x, y: spawn.y },
    });
    return client;
}

/** Dos bots pelean en una copia de la arena hasta que uno muere o se acaba el tiempo. */
export async function runBotDuel(opciones: {
    claseA: number;
    nivelA: number;
    claseB: number;
    nivelB: number;
    maxMs?: number;
}): Promise<ResultadoDuelo | null> {
    const reserva = reserveInstance();
    if (!reserva) {
        return null;
    }
    const map = reserva.map;
    const clientA = await conectarBotDeDuelo(map, opciones.claseA, LUGAR_JUGADOR);
    const clientB = await conectarBotDeDuelo(map, opciones.claseB, LUGAR_BOT);
    state.lugares.delete(map);
    const a = clientA.id ? createArenaBot(clientA.id, clientB.id!, clientA, opciones.nivelA) : null;
    const b = clientB.id ? createArenaBot(clientB.id, clientA.id!, clientB, opciones.nivelB) : null;
    if (!a || !b) {
        return null;
    }

    for (const [bot, nivel] of [[a, opciones.nivelA], [b, opciones.nivelB]] as const) {
        const user = getUser(bot.id) as (TrainingCharacter & Record<string, unknown>) | undefined;
        const perfil = botProfile(nivel);
        if (user) {
            user.maxHp = Math.round(Number(user.maxHp ?? 0) * (1 + perfil.vidaExtraPct / 100));
            user.hp = user.maxHp;
            user.arenaBotDanoPct = perfil.danoExtraPct;
        }
        bot.quietoHasta = Date.now() + 500;
    }

    return new Promise((resolve) => {
        const ahora = Date.now();
        duelos.add({
            map,
            bots: [a, b],
            empezo: ahora,
            hasta: ahora + (opciones.maxMs ?? 90_000),
            terminar: (resultado) => {
                void (async () => {
                    await getSocket().closePjById(a.id);
                    await getSocket().closePjById(b.id);
                    if (mapInstanceManager.countPlayers(map) === 0) {
                        mapInstanceManager.destroyInstance(map);
                    }
                    resolve(resultado);
                })();
            },
        });
    });
}

function tickDuelos(ahora: number) {
    for (const duelo of [...duelos]) {
        const [a, b] = duelo.bots;
        const userA = getUser(a.id);
        const userB = getUser(b.id);
        const vida = (user?: TrainingCharacter) =>
            user && !user.dead ? Number(user.hp ?? 0) / Math.max(1, Number(user.maxHp ?? 1)) : 0;
        const muertoA = !userA || Boolean(userA.dead);
        const muertoB = !userB || Boolean(userB.dead);
        if (muertoA || muertoB || ahora >= duelo.hasta) {
            duelos.delete(duelo);
            duelo.terminar({
                ganador: muertoA && !muertoB ? "b" : muertoB && !muertoA ? "a" : "empate",
                ms: ahora - duelo.empezo,
                vidaPct: [vida(userA), vida(userB)],
                acciones: [a.acciones, b.acciones],
            });
            continue;
        }
        thinkArenaBot(a, ahora);
        thinkArenaBot(b, ahora);
    }
}

/** Una vuelta del bucle del server: piensan los bots. */
export function tick(ahora: number) {
    tickDuelos(ahora);
    for (const sesion of state.sesiones.values()) {
        if (!sesion.bot || sesion.cerrando) {
            continue;
        }
        if (sesion.estado === "peleando") {
            thinkArenaBot(sesion.bot, ahora);
        }
        enviarVitalesDelBot(sesion, ahora);
    }
}

// --- Ranking ---

async function flushToApi() {
    if (!state.pendientes.length) {
        return;
    }
    const resultados = state.pendientes.splice(0);
    try {
        await funct.fetchUrl("/internal/arenas/entrenamiento", {
            method: "POST",
            headers: {
                Authorization: vars.tokenAuth,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ resultados }),
        });
    } catch (error) {
        // Si la API no contestó, vuelven a la cola para el próximo intento.
        state.pendientes.unshift(...resultados);
        funct.dumpError(error);
    }
}

export function initialize() {
    if (state.flushTimer) {
        return;
    }
    state.flushTimer = setInterval(() => void flushToApi(), API_FLUSH_MS);
}

/** Solo fuera de producción (server.ts, /debug/arena-bots/nivel): pasa las sesiones al nivel pedido y arranca la ronda. */
export function setTrainingLevel(nivel: number, nombre?: string) {
    let cambiadas = 0;
    for (const sesion of state.sesiones.values()) {
        if (nombre && sesion.nombre !== nombre) {
            continue;
        }
        for (const timer of sesion.timers) {
            clearTimeout(timer);
        }
        sesion.timers.clear();
        sesion.nivel = Math.max(1, Math.floor(nivel));
        sesion.ultimo = null;
        if (sesion.bot) {
            empezarRonda(sesion);
            cambiadas += 1;
        }
    }
    return cambiadas;
}

/** Para los tests y el comando de GM. */
export function getSessions() {
    return [...state.sesiones.values()].map((sesion) => ({
        jugadorId: sesion.jugadorId,
        nombre: sesion.nombre,
        nivel: sesion.nivel,
        puntaje: sesion.puntaje,
        ganados: sesion.ganados,
        estado: sesion.estado,
        map: sesion.map,
        botId: sesion.bot?.id ?? null,
    }));
}
