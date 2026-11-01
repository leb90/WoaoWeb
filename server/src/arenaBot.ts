// Bot de entrenamiento de la arena (arenaTraining.ts). Juega con las mismas reglas que una persona: no toca su
// personaje, manda los mismos paquetes que el cliente (caminar, girar, golpear, disparar, hechizos y pociones) y el
// server los valida igual que a cualquiera (intervalos, maná, parálisis, visión). Lo que cambia con el nivel
// (arenaTrainingRules.ts) es cuánto tarda en reaccionar, cuánto aprovecha cada intervalo y qué tácticas usa.
import type { EntityId, Position, RuntimeCharacter, RuntimeClient } from "./types/runtime";
import {
    botProfile,
    distanciaDeseada,
    estiloDeClase,
    type BotEstilo,
    type BotProfile,
} from "./arenaTrainingRules";

export {};

const vars = require("./vars");
const funct = require("./functions");
const ByteBuffer = require("bytebuffer");

// protocol.ts y game.ts cargan login.ts, que carga la arena: se piden recién al usarlos.
function getProtocol() {
    return require("./protocol");
}

function getPkg() {
    return require("./package");
}

function getGame() {
    return require("./game");
}

const PIENSA_CADA_MS = 90;
// Lo que ve el cliente alrededor del personaje (CLIENT_VIEW_RANGE de protocol.ts): un poco menos, para no tirarle a
// alguien que justo sale de la pantalla.
const VISION_X = 9;
const VISION_ARRIBA = 9;
const VISION_ABAJO = 10;
const BUSQUEDA_RADIO = 24;
const DURACION_BUFF_MS = 90_000;
const RENOVAR_BUFF_ANTES_MS = 12_000;

const POCION_ROJA = 38;
const POCION_AZUL = 37;
const POCION_AGILIDAD = 1090;
const POCION_FUERZA = 1093;
const CLASES_SIN_HECHIZOS = new Set([3, 9, 20]);

type Hechizo = {
    slot: number;
    id: number;
    mana: number;
    danoMedio: number;
    cura: number;
};

type Kit = {
    dano: Hechizo[];
    cura: Hechizo | null;
    paraliza: Hechizo | null;
    remover: Hechizo | null;
    fuerza: Hechizo | null;
    celeridad: Hechizo | null;
    pocionRoja: number | null;
    pocionAzul: number | null;
    pocionFuerza: number | null;
    pocionAgilidad: number | null;
    cuerpoACuerpo: boolean;
    distancia: boolean;
};

type Memoria = {
    proximoPensarAt: number;
    proximoHechizoAt: number;
    proximoGolpeAt: number;
    proximoDisparoAt: number;
    proximaPocionAt: number;
    proximoPasoAt: number;
    paralizadoDesde: number;
    vidaBajaDesde: number;
    rivalLibreDesde: number;
    rivalParalizado: boolean;
    ultimaPocion: "roja" | "azul" | null;
    ultimaPos: Position | null;
    pasosTrabado: number;
    destino: Position | null;
    destinoHasta: number;
};

export type ArenaBot = {
    id: EntityId;
    rivalId: EntityId;
    client: RuntimeClient;
    nivel: number;
    perfil: BotProfile;
    estilo: BotEstilo;
    kit: Kit;
    memoria: Memoria;
    /** Hasta cuándo se queda quieto (cuenta regresiva de la ronda). */
    quietoHasta: number;
    random: () => number;
    /** Lo que intentó hacer (para el duelo de prueba y los tests). */
    acciones: {
        hechizos: number;
        golpes: number;
        disparos: number;
        pociones: number;
        removidas: number;
        paralisis: number;
        pasos: number;
        porHechizo: Record<number, number>;
    };
};

export function createBotClient(): RuntimeClient {
    const OPEN = 1;
    const CLOSED = 3;
    const client: RuntimeClient = {
        id: 0,
        OPEN,
        readyState: OPEN,
        bot: true,
        on: () => undefined,
        send: () => undefined,
        close: () => undefined,
        _socket: { remoteAddress: "127.0.0.1" },
    };
    client.close = () => {
        client.readyState = CLOSED;
    };
    return client;
}

// --- Paquetes: los mismos bytes que manda el cliente (lib/aowProtocol.ts del frontend) ---

type Escritor = {
    writeUint8: (value: number) => void;
    writeUint16: (value: number) => void;
    writeUint32: (value: number) => void;
    writeDouble: (value: number) => void;
};

function mandar(bot: ArenaBot, escribir: (buffer: Escritor) => void) {
    const buffer = new ByteBuffer(32, true);
    escribir(buffer);
    buffer.flip();
    const pkg = getPkg();
    pkg.setData(buffer.toBuffer());
    const packageId = pkg.getPackageID();
    getProtocol().handleData(bot.client, packageId);
}

function paqueteCaminar(bot: ArenaBot, heading: number) {
    const id = getPkg().serverPacketID.position;
    mandar(bot, (buffer) => {
        buffer.writeUint8(id);
        buffer.writeUint8(heading);
        buffer.writeUint32(0);
    });
}

function paqueteGirar(bot: ArenaBot, heading: number) {
    const id = getPkg().serverPacketID.changeHeading;
    mandar(bot, (buffer) => {
        buffer.writeUint8(id);
        buffer.writeUint8(heading);
    });
}

function paqueteGolpe(bot: ArenaBot) {
    const id = getPkg().serverPacketID.attackMele;
    mandar(bot, (buffer) => buffer.writeUint8(id));
}

function paqueteDisparo(bot: ArenaBot, objetivo: RuntimeCharacter) {
    const id = getPkg().serverPacketID.attackRange;
    mandar(bot, (buffer) => {
        buffer.writeUint8(id);
        buffer.writeUint8(objetivo.pos.x);
        buffer.writeUint8(objetivo.pos.y);
        buffer.writeUint16(Number(objetivo.map));
        buffer.writeDouble(Number(objetivo.id));
    });
}

function paqueteHechizo(bot: ArenaBot, slot: number, objetivo: RuntimeCharacter, sobreSiMismo: boolean) {
    const id = getPkg().serverPacketID.attackSpell;
    mandar(bot, (buffer) => {
        buffer.writeUint8(id);
        buffer.writeUint8(slot);
        buffer.writeUint8(objetivo.pos.x);
        buffer.writeUint8(objetivo.pos.y);
        buffer.writeUint8(sobreSiMismo ? 1 : 0);
        buffer.writeUint16(Number(objetivo.map));
        buffer.writeDouble(Number(objetivo.id));
    });
}

function paqueteUsarItem(bot: ArenaBot, slot: number) {
    const id = getPkg().serverPacketID.useItemU;
    mandar(bot, (buffer) => {
        buffer.writeUint8(id);
        buffer.writeUint32(slot);
    });
}

// --- Lo que sabe usar ---

function armarKit(user: RuntimeCharacter): Kit {
    const kit: Kit = {
        dano: [],
        cura: null,
        paraliza: null,
        remover: null,
        fuerza: null,
        celeridad: null,
        pocionRoja: null,
        pocionAzul: null,
        pocionFuerza: null,
        pocionAgilidad: null,
        cuerpoACuerpo: false,
        distancia: false,
    };

    const spells = (user.spells ?? {}) as Record<string, { idSpell?: number } | undefined>;
    if (!CLASES_SIN_HECHIZOS.has(Number(user.idClase))) {
        for (const [slot, entry] of Object.entries(spells)) {
            const id = Number(entry?.idSpell ?? 0);
            const datos = vars.datSpell[id];
            if (!datos) {
                continue;
            }
            const hechizo: Hechizo = {
                slot: Number(slot),
                id,
                mana: Number(datos.manaRequired ?? 0),
                danoMedio: (Number(datos.minHp ?? 0) + Number(datos.maxHp ?? 0)) / 2,
                cura: (Number(datos.minHp ?? 0) + Number(datos.maxHp ?? 0)) / 2,
            };
            if (Number(datos.removerParalisis ?? 0) === 1) {
                kit.remover = hechizo;
            } else if (Number(datos.paraliza ?? 0) === 1 || Number(datos.inmoviliza ?? 0) === 1) {
                // Entre dos que paralizan, el más barato (Enredar del druida no gasta maná).
                if (!kit.paraliza || hechizo.mana < kit.paraliza.mana) {
                    kit.paraliza = hechizo;
                }
            } else if (Number(datos.subeHp ?? 0) === 2 && hechizo.danoMedio > 0) {
                kit.dano.push(hechizo);
            } else if (Number(datos.subeHp ?? 0) === 1 && hechizo.cura > 0) {
                if (!kit.cura || hechizo.cura > kit.cura.cura) {
                    kit.cura = hechizo;
                }
            } else if (Number(datos.subeFz ?? 0) === 1) {
                kit.fuerza = hechizo;
            } else if (Number(datos.subeAg ?? 0) === 1) {
                kit.celeridad = hechizo;
            }
        }
        kit.dano.sort((a, b) => b.danoMedio - a.danoMedio);
    }

    const inventario = (user.inv ?? {}) as Record<string, { idItem?: number } | undefined>;
    for (const [slot, item] of Object.entries(inventario)) {
        const idItem = Number(item?.idItem ?? 0);
        if (idItem === POCION_ROJA) kit.pocionRoja = Number(slot);
        if (idItem === POCION_AZUL) kit.pocionAzul = Number(slot);
        if (idItem === POCION_FUERZA) kit.pocionFuerza = Number(slot);
        if (idItem === POCION_AGILIDAD) kit.pocionAgilidad = Number(slot);
    }

    const arma = vars.datObj[Number(inventario[String(user.idItemWeapon)]?.idItem ?? 0)];
    kit.distancia = Boolean(arma?.proyectil);
    kit.cuerpoACuerpo = !kit.distancia && Number(user.idClase) !== Number(vars.clases?.arquero ?? 20);
    return kit;
}

export function createArenaBot(
    id: EntityId,
    rivalId: EntityId,
    client: RuntimeClient,
    nivel: number,
    random: () => number = Math.random,
): ArenaBot | null {
    const user = vars.personajes[id] as RuntimeCharacter | undefined;
    if (!user) {
        return null;
    }

    return {
        id,
        rivalId,
        client,
        nivel,
        perfil: botProfile(nivel),
        estilo: estiloDeClase(Number(user.idClase)),
        kit: armarKit(user),
        memoria: memoriaNueva(),
        quietoHasta: 0,
        random,
        acciones: { hechizos: 0, golpes: 0, disparos: 0, pociones: 0, removidas: 0, paralisis: 0, pasos: 0, porHechizo: {} },
    };
}

function memoriaNueva(): Memoria {
    return {
        proximoPensarAt: 0,
        proximoHechizoAt: 0,
        proximoGolpeAt: 0,
        proximoDisparoAt: 0,
        proximaPocionAt: 0,
        proximoPasoAt: 0,
        paralizadoDesde: 0,
        vidaBajaDesde: 0,
        rivalLibreDesde: 0,
        rivalParalizado: false,
        ultimaPocion: null,
        ultimaPos: null,
        pasosTrabado: 0,
        destino: null,
        destinoHasta: 0,
    };
}

/** Cambia de nivel entre rondas: perfil nuevo y memoria limpia. */
export function setBotLevel(bot: ArenaBot, nivel: number) {
    bot.nivel = nivel;
    bot.perfil = botProfile(nivel);
    bot.memoria = memoriaNueva();
}

// --- Geometría ---

function distancia(a: Position, b: Position) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function loVe(desde: Position, hacia: Position) {
    const dy = hacia.y - desde.y;
    return Math.abs(hacia.x - desde.x) <= VISION_X && dy <= VISION_ABAJO && dy >= -VISION_ARRIBA;
}

const DIRECCIONES = [
    { dx: 0, dy: -1, heading: 1 },
    { dx: 0, dy: 1, heading: 2 },
    { dx: 1, dy: 0, heading: 3 },
    { dx: -1, dy: 0, heading: 4 },
];

/** Dirección para mirar al rival si está pegado en cruz (los golpes van solo a la baldosa de enfrente). */
function headingHacia(desde: Position, hacia: Position): number | null {
    const dx = hacia.x - desde.x;
    const dy = hacia.y - desde.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) {
        return null;
    }
    return DIRECCIONES.find((dir) => dir.dx === dx && dir.dy === dy)?.heading ?? null;
}

/**
 * Busca, a lo ancho, la baldosa a la que conviene ir y devuelve el primer paso. `puntaje` dice qué tan buena es cada
 * baldosa (más bajo, mejor); a igual puntaje gana la más cercana.
 */
export function primerPaso(
    desde: Position,
    caminable: (x: number, y: number) => boolean,
    puntaje: (pos: Position, pasos: number) => number,
    radio = BUSQUEDA_RADIO,
): { heading: number; destino: Position } | null {
    const clave = (x: number, y: number) => x * 1000 + y;
    const visitado = new Map<number, number | null>([[clave(desde.x, desde.y), null]]);
    const primero = new Map<number, number>();
    const cola: Array<{ x: number; y: number; pasos: number }> = [{ ...desde, pasos: 0 }];
    let mejor: { pos: Position; valor: number } = { pos: desde, valor: puntaje(desde, 0) };

    for (let i = 0; i < cola.length; i++) {
        const actual = cola[i]!;
        if (actual.pasos >= radio) {
            continue;
        }
        for (const dir of DIRECCIONES) {
            const x = actual.x + dir.dx;
            const y = actual.y + dir.dy;
            const k = clave(x, y);
            if (visitado.has(k) || !caminable(x, y)) {
                continue;
            }
            visitado.set(k, clave(actual.x, actual.y));
            primero.set(k, actual.pasos === 0 ? dir.heading : primero.get(clave(actual.x, actual.y))!);
            const pasos = actual.pasos + 1;
            cola.push({ x, y, pasos });
            const valor = puntaje({ x, y }, pasos);
            if (valor < mejor.valor) {
                mejor = { pos: { x, y }, valor };
            }
        }
    }

    if (mejor.pos.x === desde.x && mejor.pos.y === desde.y) {
        return null;
    }
    const heading = primero.get(clave(mejor.pos.x, mejor.pos.y));
    return heading ? { heading, destino: mejor.pos } : null;
}

// --- Cerebro ---

type Mirada = {
    yo: RuntimeCharacter;
    rival: RuntimeCharacter;
    ahora: number;
    vidaPct: number;
    manaPct: number;
    rivalVidaPct: number;
    dist: number;
    veoAlRival: boolean;
    estoyQuieto: boolean;
    rivalQuieto: boolean;
    estiloRival: BotEstilo;
};

function listoHechizo(bot: ArenaBot, m: Mirada) {
    return (
        m.ahora >= bot.memoria.proximoHechizoAt &&
        Number(m.yo.nextSpellAt ?? 0) <= m.ahora &&
        Number(m.yo.nextSpellAfterMeleeAt ?? 0) <= m.ahora
    );
}

function listoGolpe(bot: ArenaBot, m: Mirada) {
    return (
        m.ahora >= bot.memoria.proximoGolpeAt &&
        Number(m.yo.nextMeleeAt ?? 0) <= m.ahora &&
        Number(m.yo.nextMeleeAfterSpellAt ?? 0) <= m.ahora
    );
}

function listoDisparo(bot: ArenaBot, m: Mirada) {
    return m.ahora >= bot.memoria.proximoDisparoAt && Number(m.yo.nextRangeAt ?? 0) <= m.ahora;
}

function listaPocion(bot: ArenaBot, m: Mirada) {
    return (
        m.ahora >= bot.memoria.proximaPocionAt &&
        Number(m.yo.nextUseItemAt ?? 0) <= m.ahora &&
        Number(m.yo.nextUseItemAfterMeleeAt ?? 0) <= m.ahora
    );
}

/** Lo que tarda una persona en volver a usar el intervalo: la demora del nivel con algo de azar. */
function demora(bot: ArenaBot) {
    return bot.perfil.demoraAccionMs * (0.5 + bot.random());
}

function intervalo(nombre: "spellMs" | "meleeMs" | "rangeMs") {
    return Number(vars.timing?.actionCooldowns?.[nombre] ?? 500);
}

function lanzar(bot: ArenaBot, m: Mirada, hechizo: Hechizo, sobreSiMismo: boolean) {
    paqueteHechizo(bot, hechizo.slot, sobreSiMismo ? m.yo : m.rival, sobreSiMismo);
    bot.acciones.hechizos += 1;
    bot.acciones.porHechizo[hechizo.id] = (bot.acciones.porHechizo[hechizo.id] ?? 0) + 1;
    if (hechizo === bot.kit.remover) bot.acciones.removidas += 1;
    if (hechizo === bot.kit.paraliza) bot.acciones.paralisis += 1;
    bot.memoria.proximoHechizoAt = m.ahora + intervalo("spellMs") + demora(bot);
}

function tomar(bot: ArenaBot, m: Mirada, slot: number) {
    paqueteUsarItem(bot, slot);
    bot.acciones.pociones += 1;
    bot.memoria.proximaPocionAt = m.ahora + bot.perfil.pocionCadaMs * (0.85 + bot.random() * 0.3);
}

function buffActivo(desde: unknown, valor: unknown, base: unknown, ahora: number) {
    return (
        Number(desde ?? 0) > 0 &&
        Number(valor ?? 0) > Number(base ?? 0) &&
        ahora - Number(desde) < DURACION_BUFF_MS - RENOVAR_BUFF_ANTES_MS
    );
}

/** Remover Parálisis apenas se da cuenta de que lo paralizaron. */
function pensarRemover(bot: ArenaBot, m: Mirada): boolean {
    const { kit, memoria, perfil } = bot;
    if (!m.estoyQuieto) {
        memoria.paralizadoDesde = 0;
        return false;
    }
    if (!memoria.paralizadoDesde) {
        memoria.paralizadoDesde = m.ahora;
    }
    if (!kit.remover || Number(m.yo.mana ?? 0) < kit.remover.mana || !listoHechizo(bot, m)) {
        return false;
    }
    // Un cuerpo a cuerpo pegado al rival no necesita moverse: sigue pegando.
    if (bot.estilo === "cuerpoACuerpo" && m.dist <= 1 && headingHacia(m.yo.pos, m.rival.pos)) {
        return false;
    }
    if (m.ahora - memoria.paralizadoDesde < perfil.reaccionMs * (0.8 + bot.random() * 0.4)) {
        return false;
    }
    lanzar(bot, m, kit.remover, true);
    return true;
}

function pensarPociones(bot: ArenaBot, m: Mirada) {
    const { kit, memoria, perfil } = bot;
    if (!listaPocion(bot, m)) {
        return;
    }

    const umbral = perfil.anticipaCuras
        ? Math.max(perfil.pocionVidaPct, 1 - 35 / Math.max(1, Number(m.yo.maxHp ?? 1)))
        : perfil.pocionVidaPct;
    let necesitaVida = false;
    if (kit.pocionRoja && m.vidaPct < umbral) {
        if (!memoria.vidaBajaDesde) {
            memoria.vidaBajaDesde = m.ahora;
        }
        necesitaVida = m.ahora - memoria.vidaBajaDesde >= perfil.reaccionMs * 0.6;
    } else {
        memoria.vidaBajaDesde = 0;
    }

    const usaMana = Number(m.yo.maxMana ?? 0) > 0 && (kit.dano.length > 0 || Boolean(kit.remover));
    const manaParaPegar = kit.dano.length ? Math.min(...kit.dano.map((h) => h.mana)) + (kit.remover?.mana ?? 0) : 0;
    const necesitaMana =
        Boolean(kit.pocionAzul) &&
        usaMana &&
        (m.manaPct < perfil.pocionManaPct || Number(m.yo.mana ?? 0) < manaParaPegar);

    // Si le faltan las dos cosas y la vida no está en peligro, alterna (si no, se queda sin maná para pegar).
    if (necesitaVida && (!necesitaMana || m.vidaPct < 0.5 || memoria.ultimaPocion !== "roja")) {
        tomar(bot, m, kit.pocionRoja!);
        memoria.ultimaPocion = "roja";
        return;
    }
    if (necesitaMana) {
        tomar(bot, m, kit.pocionAzul!);
        memoria.ultimaPocion = "azul";
        return;
    }

    if (perfil.usaBuffs && m.vidaPct > 0.6) {
        const yo = m.yo as RuntimeCharacter & Record<string, unknown>;
        if (
            kit.pocionFuerza &&
            bot.estilo !== "lanzador" &&
            !buffActivo(yo.cooldownFuerza, yo.attrFuerza, yo.bkAttrFuerza, m.ahora)
        ) {
            tomar(bot, m, kit.pocionFuerza);
            return;
        }
        if (kit.pocionAgilidad && !buffActivo(yo.cooldownAgilidad, yo.attrAgilidad, yo.bkAttrAgilidad, m.ahora)) {
            tomar(bot, m, kit.pocionAgilidad);
        }
    }
}

/** El hechizo de daño que conviene: el que remata si alcanza, si no el más fuerte (o el más rendidor si queda poco maná). */
function elegirDano(bot: ArenaBot, m: Mirada, reserva: number): Hechizo | null {
    const mana = Number(m.yo.mana ?? 0);
    const posibles = bot.kit.dano.filter((h) => h.mana + reserva <= mana);
    if (!posibles.length) {
        return null;
    }
    if (!bot.perfil.eligeMejorHechizo || bot.random() < bot.perfil.errorPct) {
        // Sin experiencia: el que le sale, con preferencia por los fuertes.
        const indice = Math.floor(Math.pow(bot.random(), 1.6) * posibles.length);
        return posibles[Math.min(indice, posibles.length - 1)]!;
    }

    const vidaRival = Number(m.rival.hp ?? 0);
    const rematan = posibles.filter((h) => h.danoMedio * 1.6 >= vidaRival).sort((a, b) => a.mana - b.mana);
    if (rematan.length && vidaRival < 160) {
        return rematan[0]!;
    }
    if (m.manaPct < 0.35) {
        return [...posibles].sort((a, b) => b.danoMedio / Math.max(1, b.mana) - a.danoMedio / Math.max(1, a.mana))[0]!;
    }
    return posibles[0]!;
}

function debeParalizar(bot: ArenaBot, m: Mirada): boolean {
    const { kit, perfil, memoria } = bot;
    if (!perfil.paraliza || !kit.paraliza || m.rivalQuieto || !m.veoAlRival) {
        return false;
    }
    if (Number(m.yo.mana ?? 0) < kit.paraliza.mana + (kit.remover?.mana ?? 0) * 0.5) {
        return false;
    }
    // Recién se sacó la parálisis: espera lo que tarda en darse cuenta (o mucho más si todavía no aprendió).
    if (memoria.rivalLibreDesde) {
        const espera = perfil.reparaliza ? perfil.reaccionMs : perfil.reaccionMs * 3;
        if (m.ahora - memoria.rivalLibreDesde < espera) {
            return false;
        }
    }
    if (bot.estilo === "cuerpoACuerpo") {
        // Para alcanzarlo: si se escapa o está lejos.
        return m.dist >= (perfil.combos ? 2 : 3);
    }
    if (m.estiloRival === "cuerpoACuerpo") {
        // Que no llegue a pegarle. Si el rival se la saca con Remover, solo cuando ya está encima: si no, es cambiar
        // un hechizo de daño por uno suyo.
        const alcance = rivalTieneRemover(m.rival) ? 2 : perfil.combos ? 5 : 3;
        return m.dist <= alcance;
    }
    // A los lanzadores y a los de distancia la parálisis no les corta el ataque: mejor pegarles.
    return false;
}

function rivalTieneRemover(rival: RuntimeCharacter) {
    const spells = (rival.spells ?? {}) as Record<string, { idSpell?: number } | undefined>;
    return Object.values(spells).some((entry) => Number(vars.datSpell[Number(entry?.idSpell ?? 0)]?.removerParalisis ?? 0) === 1);
}

function pensarHechizos(bot: ArenaBot, m: Mirada) {
    const { kit, perfil } = bot;
    if (!listoHechizo(bot, m) || CLASES_SIN_HECHIZOS.has(Number(m.yo.idClase))) {
        return;
    }
    const mana = Number(m.yo.mana ?? 0);
    const reserva = perfil.nivel >= 3 && kit.remover ? kit.remover.mana : 0;

    // Error de novato: deja pasar el intervalo.
    if (bot.random() < perfil.errorPct * 0.5) {
        bot.memoria.proximoHechizoAt = m.ahora + 250 + bot.random() * 400;
        return;
    }

    const umbralCura = perfil.anticipaCuras ? 0.6 : 0.45;
    if (perfil.curaConHechizo && kit.cura && m.vidaPct < umbralCura && mana >= kit.cura.mana + reserva * 0.5) {
        lanzar(bot, m, kit.cura, true);
        return;
    }

    if (debeParalizar(bot, m)) {
        lanzar(bot, m, kit.paraliza!, false);
        return;
    }

    if (perfil.usaBuffs && m.vidaPct > 0.7 && (m.dist >= 3 || m.rivalQuieto)) {
        const yo = m.yo as RuntimeCharacter & Record<string, unknown>;
        if (
            kit.fuerza &&
            bot.estilo === "cuerpoACuerpo" &&
            !buffActivo(yo.cooldownFuerza, yo.attrFuerza, yo.bkAttrFuerza, m.ahora)
        ) {
            lanzar(bot, m, kit.fuerza, true);
            return;
        }
        if (kit.celeridad && !buffActivo(yo.cooldownAgilidad, yo.attrAgilidad, yo.bkAttrAgilidad, m.ahora)) {
            lanzar(bot, m, kit.celeridad, true);
            return;
        }
    }

    if (!m.veoAlRival || Number(m.yo.ceguera ?? 0) > 0) {
        return;
    }
    const dano = elegirDano(bot, m, reserva);
    if (dano) {
        lanzar(bot, m, dano, false);
    }
}

function pensarGolpe(bot: ArenaBot, m: Mirada) {
    if (!bot.kit.cuerpoACuerpo || !listoGolpe(bot, m) || bot.estilo === "lanzador") {
        return;
    }
    const heading = headingHacia(m.yo.pos, m.rival.pos);
    if (!heading) {
        return;
    }
    if (Number(m.yo.heading) !== heading) {
        paqueteGirar(bot, heading);
    }
    paqueteGolpe(bot);
    bot.acciones.golpes += 1;
    bot.memoria.proximoGolpeAt = m.ahora + intervalo("meleeMs") + demora(bot);
}

function pensarDisparo(bot: ArenaBot, m: Mirada) {
    if (!bot.kit.distancia || !listoDisparo(bot, m) || !m.veoAlRival || Number(m.yo.ceguera ?? 0) > 0) {
        return;
    }
    paqueteDisparo(bot, m.rival);
    bot.acciones.disparos += 1;
    bot.memoria.proximoDisparoAt = m.ahora + intervalo("rangeMs") + demora(bot);
}

function caminable(map: number, propio: EntityId) {
    const game = getGame();
    return (x: number, y: number) => x >= 1 && y >= 1 && x <= 100 && y <= 100 && game.legalPos(x, y, map, false, propio);
}

function pensarMovimiento(bot: ArenaBot, m: Mirada) {
    const { memoria, perfil } = bot;
    if (m.estoyQuieto || m.ahora < memoria.proximoPasoAt || Number(m.yo.nextWalkAt ?? 0) > m.ahora) {
        return;
    }
    if (Array.isArray(m.yo.pendingMoveQueue) && m.yo.pendingMoveQueue.length > 0) {
        return;
    }

    let banda = distanciaDeseada(bot.estilo, m.estiloRival);
    if (bot.estilo !== "cuerpoACuerpo" && !perfil.mantieneDistancia) {
        // Sin experiencia: se queda donde está mientras lo vea, sin escaparse de los que pegan.
        banda = { min: 1, max: 7 };
    }
    if (bot.estilo !== "cuerpoACuerpo" && m.rivalQuieto) {
        // Con el rival paralizado no hace falta moverse, salvo que esté encima.
        banda = { min: Math.min(banda.min, 2), max: 8 };
    }

    // Invisible no se lo ve: no lo persigue (como una persona, espera a que aparezca).
    if (!m.veoAlRival && loVe(m.yo.pos, m.rival.pos)) {
        return;
    }

    const enCruz = headingHacia(m.yo.pos, m.rival.pos) !== null;
    if (bot.estilo === "cuerpoACuerpo" && enCruz) {
        return;
    }
    if (bot.estilo !== "cuerpoACuerpo" && m.dist >= banda.min && m.dist <= banda.max && m.veoAlRival) {
        memoria.destino = null;
        return;
    }

    const rival = m.rival.pos;
    const puntaje = (pos: Position, pasos: number) => {
        const d = distancia(pos, rival);
        if (bot.estilo === "cuerpoACuerpo") {
            // Cualquier camino que llegue al lado le gana a acercarse en línea recta contra una pared.
            const cruz = Math.abs(pos.x - rival.x) + Math.abs(pos.y - rival.y) === 1;
            return (cruz ? 0 : 1000 + d * 10) + pasos;
        }
        const fuera = d < banda.min ? (banda.min - d) * 12 : d > banda.max ? (d - banda.max) * 10 : 0;
        const ve = loVe(pos, rival) ? 0 : 30;
        // Lejos de las paredes para no quedar acorralado.
        return fuera + ve + pasos * 0.6;
    };

    const paso = primerPaso(m.yo.pos, caminable(Number(m.yo.map), m.yo.id), puntaje);
    if (!paso) {
        return;
    }

    const anterior = memoria.ultimaPos;
    memoria.pasosTrabado = anterior && anterior.x === m.yo.pos.x && anterior.y === m.yo.pos.y ? memoria.pasosTrabado + 1 : 0;
    memoria.ultimaPos = { ...m.yo.pos };
    let heading = paso.heading;
    if (memoria.pasosTrabado >= 4) {
        // Trabado contra algo: un paso al costado.
        const libres = DIRECCIONES.filter((dir) => caminable(Number(m.yo.map), m.yo.id)(m.yo.pos.x + dir.dx, m.yo.pos.y + dir.dy));
        if (libres.length) {
            heading = libres[Math.floor(bot.random() * libres.length)]!.heading;
        }
        memoria.pasosTrabado = 0;
    }

    paqueteCaminar(bot, heading);
    bot.acciones.pasos += 1;
    memoria.destino = paso.destino;
    // Los novatos no caminan todo el tiempo: se toman un respiro entre paso y paso.
    memoria.proximoPasoAt = m.ahora + Number(vars.timing?.walkStepMs ?? 200) + perfil.demoraAccionMs * 0.25 * bot.random();
}

function mirar(bot: ArenaBot, ahora: number): Mirada | null {
    const yo = vars.personajes[bot.id] as RuntimeCharacter | undefined;
    const rival = vars.personajes[bot.rivalId] as RuntimeCharacter | undefined;
    if (!yo || !rival || yo.dead || yo.cerrado || rival.cerrado || Number(yo.map) !== Number(rival.map)) {
        return null;
    }

    const rivalQuieto = Boolean(rival.paralizado || rival.inmovilizado);
    if (bot.memoria.rivalParalizado && !rivalQuieto) {
        bot.memoria.rivalLibreDesde = ahora;
    }
    bot.memoria.rivalParalizado = rivalQuieto;

    const invisible = Boolean(rival.invisibleSpell || rival.hiddenSkill);
    return {
        yo,
        rival,
        ahora,
        vidaPct: Number(yo.hp ?? 0) / Math.max(1, Number(yo.maxHp ?? 1)),
        manaPct: Number(yo.mana ?? 0) / Math.max(1, Number(yo.maxMana ?? 1)),
        rivalVidaPct: Number(rival.hp ?? 0) / Math.max(1, Number(rival.maxHp ?? 1)),
        dist: distancia(yo.pos, rival.pos),
        veoAlRival: !rival.dead && !invisible && loVe(yo.pos, rival.pos),
        estoyQuieto: Boolean(yo.paralizado || yo.inmovilizado),
        rivalQuieto,
        estiloRival: estiloDeClase(Number(rival.idClase)),
    };
}

/** Un turno del bot: lo llama arenaTraining en cada vuelta del bucle del server. */
export function thinkArenaBot(bot: ArenaBot, ahora: number) {
    if (ahora < bot.memoria.proximoPensarAt) {
        return;
    }
    bot.memoria.proximoPensarAt = ahora + PIENSA_CADA_MS;

    try {
        const m = mirar(bot, ahora);
        if (!m || ahora < bot.quietoHasta) {
            return;
        }

        // Las pociones van aparte: tienen su propio intervalo y se toman entre hechizo y hechizo.
        pensarPociones(bot, m);
        if (Number(m.rival.dead ?? 0)) {
            return;
        }
        if (!pensarRemover(bot, m)) {
            pensarHechizos(bot, m);
        }
        pensarGolpe(bot, m);
        pensarDisparo(bot, m);
        pensarMovimiento(bot, m);
    } catch (error) {
        funct.dumpError(error);
    }
}
