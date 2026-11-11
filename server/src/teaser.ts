// Teaser del juego (teaser/README.md): arma cada escena del video. Lleva al personaje que graba a su lugar y pone
// bots con nombres de jugador que caminan, charlan, meditan, cazan y asedian un castillo, y las criaturas con las
// que pelean. Los bots juegan como un cliente: mandan los mismos paquetes que el juego (girar, golpear, hechizos,
// chat) y el server los valida igual que a cualquiera. Solo existe fuera de producción: lo usan los /debug/teaser/*
// de server.ts, que llama la grabación (teaser/grabar.ts).
import type { EntityId, Position, RuntimeCharacter, RuntimeClient } from "./types/runtime";
import { ARENA_SKILLS, ARENA_SKILL_VALUE, buildArenaTemplate } from "./arenaClasses";
import { createArenaBot, createBotClient, thinkArenaBot, type ArenaBot } from "./arenaBot";
import { localBfsHeadings } from "./populationBots";
import { getClientById } from "./runtimeRegistry";

export {};

const vars = require("./vars");
const game = require("./game");
const funct = require("./functions");
const handleProtocol = require("./handleProtocol");
const balance = require("./balance");
const ByteBuffer = require("bytebuffer");

// Se piden al usarlos: login.ts y protocol.ts cargan medio server.
const getLogin = () => require("./login");
const getProtocol = () => require("./protocol");
const getPkg = () => require("./package");
const getSocket = () => require("./socket");
const getNpcs = () => require("./npcs");

type Zona = { x1: number; y1: number; x2: number; y2: number };
type Rumbo = "arriba" | "abajo" | "derecha" | "izquierda";

type Accion =
    /** Camina entre lugares al azar de la zona, con un descanso al llegar. */
    | { tipo: "pasea"; zona: Zona }
    | { tipo: "quieto" }
    | { tipo: "medita" }
    /** Pelea con las criaturas de la zona: se acerca y golpea, o les tira hechizos de lejos. */
    | { tipo: "caza"; zona: Zona }
    /** Pelea con otro bot como en el entrenamiento de la arena (arenaBot.ts). */
    | { tipo: "duelo"; rival: string; nivel?: number }
    /** Le pega a lo que esté en esa baldosa (la puerta del castillo). */
    | { tipo: "asedia"; objetivo: Position };

type BotDef = {
    nombre: string;
    clase: number;
    x: number;
    y: number;
    mira?: Rumbo;
    accion: Accion;
    /** Lo que dice cada tanto, en orden. */
    frases?: string[];
    clan?: string;
    /** Cuántas veces su vida normal (la víctima de la vitrina aguanta un desangrado entero). */
    vida?: number;
    /** Sin el seguro, para poder atacar a otro jugador. */
    sinSeguro?: boolean;
};

type CriaturaDef = { npc: number; x: number; y: number; mira?: Rumbo };

type Escena = {
    mapa: number;
    jugador: { x: number; y: number; mira?: Rumbo; clan?: string };
    momento?: string;
    clima?: string;
    bots: BotDef[];
    criaturas?: CriaturaDef[];
    /** Cuánto tarda en volver una criatura muerta, en su mismo lugar. */
    reaparecenMs?: number;
    /** Saca las criaturas del mapa que andan cerca, así en la toma pelean solo las de la escena. */
    despejar?: number;
    /** Al llegar el jugador (la mazmorra: entra desde la piedra de invocación). */
    alLlegar?: (jugadorId: EntityId) => void;
};

type BotVivo = {
    def: BotDef;
    id: EntityId;
    client: RuntimeClient;
    mapa: number;
    arena: ArenaBot | null;
    proximoAt: number;
    proximoGolpeAt: number;
    proximoHechizoAt: number;
    pausaHasta: number;
    destino: Position | null;
    frase: number;
    proximaFraseAt: number;
    muertoDesde: number;
};

type CriaturaViva = { def: CriaturaDef; mapa: number };

const PIENSA_CADA_MS = 150;
const REVIVE_MS = 2500;
const RANGO_HECHIZO = 6;
const VIDA_BOT = 4;
const VIDA_DUELO = 8;

const state = {
    escena: null as Escena | null,
    jugadorId: null as EntityId | null,
    bots: new Map<string, BotVivo>(),
    criaturas: new Map<string, CriaturaViva>(),
    reapariciones: [] as Array<{ def: CriaturaDef; mapa: number; at: number }>,
};

// --- Las escenas del video, en el orden en que aparecen (teaser/README.md) ---

const CLASE = { mago: 1, clerigo: 2, guerrero: 3, asesino: 4, bardo: 6, druida: 7, paladin: 8, arquero: 20, chaman: 22 };
const NPC = { soldadoOrco: 522, capitanOrco: 523, loboArtico: 658, osoPolar: 656 };

// Alrededor de la fuente de Nix.
const PLAZA: Zona = { x1: 29, y1: 52, x2: 36, y2: 63 };
const CALLE: Zona = { x1: 37, y1: 50, x2: 40, y2: 64 };
// El bosque de pinos del mapa 54, junto al camino.
const BOSQUE: Zona = { x1: 33, y1: 26, x2: 48, y2: 36 };

const ESCENAS: Record<string, Escena> = {
    // Nix con gente: unos caminan, otros charlan o meditan.
    ciudad: {
        mapa: 34,
        jugador: { x: 31, y: 58, mira: "izquierda" },
        momento: "mediodia",
        clima: "despejado",
        bots: [
            { nombre: "Kaiser", clase: CLASE.clerigo, x: 34, y: 56, mira: "izquierda", accion: { tipo: "quieto" }, frases: ["buenas gente!", "alguien para la gruta?", "hoy hay asedio en el castillo norte"] },
            { nombre: "Sombra", clase: CLASE.asesino, x: 32, y: 55, mira: "derecha", accion: { tipo: "quieto" }, frases: ["yo voy!", "dale, armemos party", "traigan pociones rojas"] },
            { nombre: "Tincho", clase: CLASE.guerrero, x: 30, y: 61, accion: { tipo: "pasea", zona: PLAZA }, frases: ["vendo espada +3", "compro pociones azules"] },
            { nombre: "Valkiria", clase: CLASE.paladin, x: 35, y: 61, accion: { tipo: "pasea", zona: PLAZA }, frases: ["vieron la clase nueva?", "el chaman congela todo"] },
            { nombre: "Juanchi", clase: CLASE.bardo, x: 38, y: 53, accion: { tipo: "pasea", zona: CALLE }, frases: ["jaja", "que lindo esta el server"] },
            { nombre: "Ragnar", clase: CLASE.arquero, x: 39, y: 62, accion: { tipo: "pasea", zona: CALLE } },
            { nombre: "Morgana", clase: CLASE.mago, x: 33, y: 62, accion: { tipo: "medita" } },
            { nombre: "Lunita", clase: CLASE.druida, x: 29, y: 63, accion: { tipo: "medita" } },
        ],
    },
    // Una party cazando orcos en el bosque.
    caza: {
        mapa: 54,
        jugador: { x: 37, y: 31, mira: "derecha" },
        momento: "tarde",
        clima: "despejado",
        reaparecenMs: 4000,
        despejar: 16,
        criaturas: [
            { npc: NPC.capitanOrco, x: 42, y: 31 },
            { npc: NPC.soldadoOrco, x: 43, y: 29 },
            { npc: NPC.soldadoOrco, x: 44, y: 32 },
            { npc: NPC.soldadoOrco, x: 42, y: 34 },
            { npc: NPC.soldadoOrco, x: 45, y: 30 },
        ],
        bots: [
            { nombre: "Tincho", clase: CLASE.guerrero, x: 39, y: 30, accion: { tipo: "caza", zona: BOSQUE } },
            { nombre: "Valkiria", clase: CLASE.paladin, x: 39, y: 33, accion: { tipo: "caza", zona: BOSQUE } },
            { nombre: "Morgana", clase: CLASE.mago, x: 36, y: 29, accion: { tipo: "caza", zona: BOSQUE } },
            { nombre: "Ragnar", clase: CLASE.arquero, x: 36, y: 33, accion: { tipo: "caza", zona: BOSQUE } },
        ],
    },
    // El chamán solo contra una manada, en la nieve.
    chaman: {
        mapa: 89,
        jugador: { x: 44, y: 45, mira: "derecha" },
        // De noche la nieve queda azul y los hechizos se lucen más.
        momento: "noche",
        clima: "nieve",
        reaparecenMs: 1500,
        despejar: 16,
        criaturas: [
            { npc: NPC.loboArtico, x: 49, y: 43 },
            { npc: NPC.loboArtico, x: 50, y: 46 },
            { npc: NPC.loboArtico, x: 51, y: 44 },
            { npc: NPC.loboArtico, x: 49, y: 48 },
            { npc: NPC.loboArtico, x: 52, y: 47 },
            { npc: NPC.osoPolar, x: 53, y: 45 },
            { npc: NPC.osoPolar, x: 52, y: 42 },
        ],
        bots: [],
    },
    // El asedio: un clan entra a la sala del trono del Castillo Norte y pelea con el rey y con los que lo defienden.
    castillo: {
        mapa: 166,
        jugador: { x: 45, y: 24, mira: "arriba", clan: "Los Inmortales" },
        momento: "noche",
        clima: "tormenta",
        bots: [
            { nombre: "Tincho", clase: CLASE.guerrero, x: 44, y: 18, clan: "Los Inmortales", accion: { tipo: "asedia", objetivo: { x: 45, y: 16 } } },
            { nombre: "Valkiria", clase: CLASE.paladin, x: 46, y: 18, clan: "Los Inmortales", accion: { tipo: "asedia", objetivo: { x: 45, y: 16 } } },
            { nombre: "Morgana", clase: CLASE.mago, x: 43, y: 21, clan: "Los Inmortales", accion: { tipo: "asedia", objetivo: { x: 45, y: 16 } } },
            { nombre: "Kaiser", clase: CLASE.clerigo, x: 47, y: 21, clan: "Los Inmortales", accion: { tipo: "duelo", rival: "Draven" } },
            { nombre: "Sombra", clase: CLASE.asesino, x: 41, y: 24, clan: "Los Inmortales", accion: { tipo: "duelo", rival: "Freya" } },
            { nombre: "Draven", clase: CLASE.paladin, x: 49, y: 24, clan: "Guardia de Plata", accion: { tipo: "duelo", rival: "Kaiser" } },
            { nombre: "Freya", clase: CLASE.druida, x: 38, y: 26, clan: "Guardia de Plata", accion: { tipo: "duelo", rival: "Sombra" } },
            { nombre: "Ragnar", clase: CLASE.arquero, x: 50, y: 27, clan: "Guardia de Plata", accion: { tipo: "duelo", rival: "Tincho" } },
        ],
    },
    // La mazmorra nueva (todavía en desarrollo): entra desde la piedra de invocación de Nix.
    mazmorra: {
        mapa: 34,
        jugador: { x: 49, y: 52, mira: "arriba" },
        momento: "mediodia",
        clima: "despejado",
        bots: [],
        alLlegar: (jugadorId) => {
            // La Pluma, para saltar la lava; las Patas de rana las saca del cofre en la toma.
            itemsDeMazmorra(jugadorId, ["pluma"], ["patas_de_rana"]);
            require("./dungeons").enter(jugadorId, "solo");
        },
    },
};

// --- Paquetes: los mismos bytes que manda el cliente (lib/aowProtocol.ts del frontend, como arenaBot.ts) ---

type Escritor = {
    writeUint8: (value: number) => void;
    writeUint16: (value: number) => void;
    writeUint32: (value: number) => void;
    writeInt32: (value: number) => void;
    writeDouble: (value: number) => void;
    writeString: (value: string) => void;
};

function mandar(client: RuntimeClient, escribir: (buffer: Escritor) => void) {
    const buffer = new ByteBuffer(64, true);
    escribir(buffer);
    buffer.flip();
    const pkg = getPkg();
    pkg.setData(buffer.toBuffer());
    getProtocol().handleData(client, pkg.getPackageID());
}

function paqueteGirar(client: RuntimeClient, heading: number) {
    mandar(client, (buffer) => {
        buffer.writeUint8(getPkg().serverPacketID.changeHeading);
        buffer.writeUint8(heading);
    });
}

function paqueteGolpe(client: RuntimeClient) {
    mandar(client, (buffer) => buffer.writeUint8(getPkg().serverPacketID.attackMele));
}

function paqueteDisparo(client: RuntimeClient, objetivo: { pos: Position; map: number; id: EntityId }) {
    mandar(client, (buffer) => {
        buffer.writeUint8(getPkg().serverPacketID.attackRange);
        buffer.writeUint8(objetivo.pos.x);
        buffer.writeUint8(objetivo.pos.y);
        buffer.writeUint16(Number(objetivo.map));
        buffer.writeDouble(Number(objetivo.id));
    });
}

function paqueteHechizo(client: RuntimeClient, slot: number, objetivo: { pos: Position; map: number; id: EntityId }) {
    mandar(client, (buffer) => {
        buffer.writeUint8(getPkg().serverPacketID.attackSpell);
        buffer.writeUint8(slot);
        buffer.writeUint8(objetivo.pos.x);
        buffer.writeUint8(objetivo.pos.y);
        buffer.writeUint8(0);
        buffer.writeUint16(Number(objetivo.map));
        buffer.writeDouble(Number(objetivo.id));
    });
}

// El chat: lo que no es comando sale en un globo arriba del personaje, como cuando habla una persona.
function paqueteChat(client: RuntimeClient, texto: string) {
    mandar(client, (buffer) => {
        buffer.writeUint8(getPkg().serverPacketID.dialog);
        buffer.writeUint16(Array.from(texto).length);
        buffer.writeString(texto);
    });
}

function paqueteUsarItem(client: RuntimeClient, slot: number) {
    mandar(client, (buffer) => {
        buffer.writeUint8(getPkg().serverPacketID.useItemU);
        buffer.writeUint32(slot);
    });
}

function paqueteEquipar(client: RuntimeClient, slot: number) {
    mandar(client, (buffer) => {
        buffer.writeUint8(getPkg().serverPacketID.equiparItem);
        buffer.writeInt32(slot);
    });
}

// --- Cuentas ---

const RUMBOS: Record<Rumbo, () => number> = {
    arriba: () => vars.direcciones.up,
    abajo: () => vars.direcciones.down,
    derecha: () => vars.direcciones.right,
    izquierda: () => vars.direcciones.left,
};

function rumboHacia(desde: Position, hacia: Position): number {
    const dx = hacia.x - desde.x;
    const dy = hacia.y - desde.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx >= 0 ? vars.direcciones.right : vars.direcciones.left;
    }
    return dy >= 0 ? vars.direcciones.down : vars.direcciones.up;
}

const distancia = (a: Position, b: Position) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const alAzar = (desde: number, hasta: number) => desde + Math.random() * (hasta - desde);
const dentro = (zona: Zona, pos: Position) => pos.x >= zona.x1 && pos.x <= zona.x2 && pos.y >= zona.y1 && pos.y <= zona.y2;

function usuario(id: EntityId): RuntimeCharacter | undefined {
    return vars.personajes?.[id] as RuntimeCharacter | undefined;
}

function buscarJugador(nombre: string): RuntimeCharacter | undefined {
    const buscado = nombre.trim().toLowerCase();
    return (Object.values(vars.personajes ?? {}) as RuntimeCharacter[]).find(
        (user) =>
            user &&
            !user.botLoad &&
            String(user.nameCharacter ?? "").toLowerCase() === buscado &&
            // Al salir, el personaje queda un rato sin cliente: el que vale es el que está conectado.
            Boolean(getClientById(user.id)),
    );
}

function conectados(): string {
    return (Object.values(vars.personajes ?? {}) as RuntimeCharacter[])
        .map((user) => `${user?.nameCharacter}${getClientById(user?.id) ? "" : " (sin cliente)"}`)
        .join(", ");
}

function lugarLibre(mapa: number, x: number, y: number): boolean {
    return Boolean(game.legalPos(x, y, mapa, false)) && !vars.mapData[mapa]?.[y]?.[x]?.id;
}

// --- Criaturas ---

function crearCriatura(def: CriaturaDef, mapa: number) {
    if (!lugarLibre(mapa, def.x, def.y)) {
        console.warn(`[Teaser] No entra la criatura ${def.npc} en ${mapa}@${def.x},${def.y}: la baldosa está ocupada o bloqueada.`);
        return null;
    }
    const antes = new Set(Object.keys(vars.npcs ?? {}));
    const LoadNpcs = require("./loadNpcs");
    new LoadNpcs().createNpcInMap({ mapNum: mapa, x: def.x, y: def.y, npcIndex: def.npc }, true, false, true);
    const id = Object.keys(vars.npcs ?? {}).find((key) => !antes.has(key));
    const npc = id ? vars.npcs[id] : null;
    if (!npc) {
        return null;
    }
    // Las del teaser no vuelven solas al morir (las repone esta escena en su lugar) ni dejan nada en el piso.
    delete npc.spawnMapNum;
    delete npc.spawnOrigin;
    Object.assign(npc, { teaser: true, ephemeralSummon: 1, drop: [], gold: 0 });
    if (def.mira) {
        npc.heading = RUMBOS[def.mira]();
    }
    state.criaturas.set(String(npc.id), { def, mapa });
    mostrarCriatura(npc);
    return npc;
}

// Como /invocarnpc (commands.ts): la criatura nueva les llega a los que la tienen a la vista.
function mostrarCriatura(npc: any) {
    getNpcs().loopArea(npc.id, (target: RuntimeCharacter) => {
        const client = getClientById(target.id);
        if (!client) {
            return;
        }
        if (vars.areaNpc[npc.id] && !vars.areaNpc[npc.id].includes(target.id)) {
            vars.areaNpc[npc.id].push(target.id);
        }
        handleProtocol.sendNpc(npc);
        getSocket().send(client);
    });
}

function sacarCriatura(id: string) {
    const npc = vars.npcs?.[id];
    state.criaturas.delete(id);
    if (!npc) {
        return;
    }
    getNpcs().loopArea(npc.id, (target: RuntimeCharacter) => {
        const client = getClientById(target.id);
        if (client) {
            handleProtocol.deleteCharacter(npc.id, client);
            getSocket().send(client);
        }
    });
    const tile = vars.mapData[npc.map]?.[npc.pos.y]?.[npc.pos.x];
    if (tile?.id === npc.id) {
        tile.id = 0;
    }
    delete vars.npcs[id];
    delete vars.areaNpc[id];
}

// Las criaturas hostiles del mapa que andan cerca se van (hasta que se reinicie el server: esto es solo para grabar).
function despejar(mapa: number, centro: Position, radio: number) {
    for (const [id, npc] of Object.entries(vars.npcs ?? {}) as Array<[string, any]>) {
        if (npc?.teaser || Number(npc?.map) !== mapa || Number(npc?.hostile ?? 0) !== 1 || !npc.pos || distancia(npc.pos, centro) > radio) {
            continue;
        }
        sacarCriatura(id);
    }
}

function criaturaMasCercana(desde: RuntimeCharacter, zona: Zona) {
    let mejor: any = null;
    let mejorDistancia = Infinity;
    for (const id of state.criaturas.keys()) {
        const npc = vars.npcs?.[id];
        if (!npc || Number(npc.hp ?? 0) <= 0 || Number(npc.map) !== Number(desde.map) || !dentro(zona, npc.pos)) {
            continue;
        }
        const d = distancia(desde.pos, npc.pos);
        if (d < mejorDistancia) {
            mejor = npc;
            mejorDistancia = d;
        }
    }
    return mejor;
}

// --- Bots ---

function hechizosDeDano(user: RuntimeCharacter): number[] {
    const spells = (user.spells ?? {}) as Record<string, { idSpell?: number } | undefined>;
    return Object.entries(spells)
        .map(([slot, entry]) => ({ slot: Number(slot), datos: vars.datSpell[Number(entry?.idSpell ?? 0)] }))
        .filter(({ datos }) => datos && Number(datos.subeHp ?? 0) === 2 && Number(datos.maxHp ?? 0) > 0)
        .sort((a, b) => Number(b.datos.maxHp) - Number(a.datos.maxHp))
        .slice(0, 3)
        .map(({ slot }) => slot);
}

function usaArco(user: RuntimeCharacter): boolean {
    const inventario = (user.inv ?? {}) as Record<string, { idItem?: number } | undefined>;
    return Boolean(vars.datObj[Number(inventario[String(user.idItemWeapon)]?.idItem ?? 0)]?.proyectil);
}

async function conectarBot(def: BotDef, mapa: number): Promise<BotVivo | null> {
    const client = createBotClient();
    try {
        await getLogin().connectCharacterPvP(client, def.nombre, `bot:teaser:${def.nombre}`, def.clase, {
            spawn: { mapId: mapa, x: def.x, y: def.y },
            teaserBot: true,
            pvpChar: false,
        });
    } catch (error) {
        funct.dumpError(error);
        return null;
    }
    const user = client.id ? usuario(client.id) : undefined;
    if (!user) {
        return null;
    }

    // Aguantan más que un jugador, así la pelea dura lo que dura la escena.
    const vida = def.vida ?? (def.accion.tipo === "duelo" ? VIDA_DUELO : VIDA_BOT);
    user.maxHp = Number(user.maxHp ?? 1) * vida;
    user.hp = user.maxHp;
    if (def.clan) {
        Object.assign(user, { clan: def.clan, clanId: `teaser:${def.clan}` });
    }
    // Sin el seguro, que no deja atacar a otros ciudadanos: en el castillo pelean entre clanes.
    if (def.accion.tipo === "duelo" || def.sinSeguro) {
        user.seguroActivado = false;
    }
    if (def.mira) {
        user.heading = RUMBOS[def.mira]();
    }

    const ahora = Date.now();
    return {
        def,
        id: client.id!,
        client,
        mapa,
        arena: null,
        proximoAt: ahora + alAzar(0, PIENSA_CADA_MS),
        proximoGolpeAt: 0,
        proximoHechizoAt: ahora + alAzar(400, 1500),
        pausaHasta: ahora + alAzar(0, 2500),
        destino: null,
        frase: 0,
        proximaFraseAt: ahora + alAzar(1500, 6000),
        muertoDesde: 0,
    };
}

function caminarHacia(bot: BotVivo, user: RuntimeCharacter, destino: Position, pasos = 4) {
    if (Array.isArray(user.pendingMoveQueue) && user.pendingMoveQueue.length > 0) {
        return;
    }
    const rumbos = localBfsHeadings(Number(user.map), user.pos, destino, pasos);
    // Los pasos los da el bucle del server, al ritmo de cualquiera que camina (protocol.processPendingMovements).
    user.pendingMoveQueue = rumbos.map((heading) => ({ heading, moveId: 0 }));
}

function pasear(bot: BotVivo, user: RuntimeCharacter, zona: Zona, ahora: number) {
    if (ahora < bot.pausaHasta || (Array.isArray(user.pendingMoveQueue) && user.pendingMoveQueue.length > 0)) {
        return;
    }
    if (bot.destino && distancia(user.pos, bot.destino) > 0) {
        const antes = { ...user.pos };
        caminarHacia(bot, user, bot.destino);
        // Si no hay camino, busca otro lugar la próxima vez.
        if (!user.pendingMoveQueue?.length && antes.x === user.pos.x && antes.y === user.pos.y) {
            bot.destino = null;
        }
        return;
    }
    if (bot.destino) {
        // Llegó: descansa un rato antes de ir a otro lado.
        bot.destino = null;
        bot.pausaHasta = ahora + alAzar(1500, 5000);
        return;
    }
    for (let intento = 0; intento < 30; intento++) {
        const x = Math.round(alAzar(zona.x1, zona.x2));
        const y = Math.round(alAzar(zona.y1, zona.y2));
        if (lugarLibre(Number(user.map), x, y) && distancia(user.pos, { x, y }) >= 3) {
            bot.destino = { x, y };
            return;
        }
    }
}

// Golpea o tira un hechizo a una criatura (o a la puerta del castillo), acercándose si hace falta.
function atacar(bot: BotVivo, user: RuntimeCharacter, objetivo: any, ahora: number) {
    const d = distancia(user.pos, objetivo.pos);
    const hechizos = hechizosDeDano(user);
    if (hechizos.length > 0 && d <= RANGO_HECHIZO && d >= 2) {
        if (ahora >= bot.proximoHechizoAt) {
            const slot = hechizos[Math.floor(Math.random() * hechizos.length)]!;
            paqueteGirar(bot.client, rumboHacia(user.pos, objetivo.pos));
            paqueteHechizo(bot.client, slot, objetivo);
            bot.proximoHechizoAt = ahora + alAzar(1100, 1900);
        }
        return;
    }
    if (usaArco(user) && d <= RANGO_HECHIZO && d >= 2) {
        if (ahora >= bot.proximoGolpeAt) {
            paqueteGirar(bot.client, rumboHacia(user.pos, objetivo.pos));
            paqueteDisparo(bot.client, objetivo);
            bot.proximoGolpeAt = ahora + alAzar(900, 1400);
        }
        return;
    }
    const pegado = Math.abs(user.pos.x - objetivo.pos.x) + Math.abs(user.pos.y - objetivo.pos.y) === 1;
    if (pegado) {
        if (ahora >= bot.proximoGolpeAt) {
            paqueteGirar(bot.client, rumboHacia(user.pos, objetivo.pos));
            paqueteGolpe(bot.client);
            bot.proximoGolpeAt = ahora + alAzar(750, 1100);
        }
        return;
    }
    caminarHacia(bot, user, objetivo.pos, 3);
}

function pensar(bot: BotVivo, ahora: number) {
    const user = usuario(bot.id);
    if (!user || user.cerrado) {
        return;
    }

    if (user.dead) {
        bot.muertoDesde ||= ahora;
        if (ahora - bot.muertoDesde >= REVIVE_MS) {
            bot.muertoDesde = 0;
            game.revivirUsuario(bot.id, { full: true });
            user.hp = user.maxHp;
            game.telep(bot.client, bot.mapa, bot.def.x, bot.def.y, "teaser.revivir");
        }
        return;
    }

    // Tampoco se quedan sin maná: la toma dura más que lo que aguanta una pelea de verdad (con medio tanque, un paladín
    // ya no llega a Apocalipsis).
    if (Number(user.mana ?? 0) < Number(user.maxMana ?? 0)) {
        user.mana = user.maxMana;
    }

    if (bot.def.frases?.length && ahora >= bot.proximaFraseAt) {
        paqueteChat(bot.client, bot.def.frases[bot.frase % bot.def.frases.length]!);
        bot.frase += 1;
        bot.proximaFraseAt = ahora + alAzar(6000, 10000);
    }

    const accion = bot.def.accion;
    switch (accion.tipo) {
        case "pasea":
            return pasear(bot, user, accion.zona, ahora);
        case "medita":
            if (!user.meditar && ahora >= bot.pausaHasta) {
                paqueteChat(bot.client, "/meditar");
                bot.pausaHasta = ahora + 4000;
            }
            return;
        case "caza": {
            const presa = criaturaMasCercana(user, accion.zona);
            return presa ? atacar(bot, user, presa, ahora) : pasear(bot, user, accion.zona, ahora);
        }
        case "asedia": {
            const id = vars.mapData[user.map]?.[accion.objetivo.y]?.[accion.objetivo.x]?.id;
            const puerta = id ? vars.npcs?.[id] : null;
            if (puerta) {
                atacar(bot, user, puerta, ahora);
            }
            return;
        }
        case "duelo": {
            if (!bot.arena) {
                const rival = state.bots.get(accion.rival.toLowerCase());
                if (!rival) {
                    return;
                }
                bot.arena = createArenaBot(bot.id, rival.id, bot.client, accion.nivel ?? 6);
            }
            if (bot.arena) {
                thinkArenaBot(bot.arena, ahora);
            }
            return;
        }
        case "quieto":
            return;
    }
}

/** Una vuelta: la llama el bucle del server (server.ts). Sin escena armada no hace nada. */
export function tick(ahora: number) {
    if (state.bots.size === 0 && state.criaturas.size === 0 && state.reapariciones.length === 0) {
        return;
    }
    try {
        for (const bot of state.bots.values()) {
            if (ahora >= bot.proximoAt) {
                bot.proximoAt = ahora + PIENSA_CADA_MS;
                pensar(bot, ahora);
            }
        }

        // Las criaturas muertas vuelven a su lugar al rato.
        for (const [id, criatura] of state.criaturas) {
            const npc = vars.npcs?.[id];
            if (!npc || Number(npc.hp ?? 0) <= 0) {
                state.criaturas.delete(id);
                state.reapariciones.push({ ...criatura, at: ahora + (state.escena?.reaparecenMs ?? 6000) });
            }
        }
        // El que graba no se queda sin maná en medio de una toma.
        const jugador = state.jugadorId ? usuario(state.jugadorId) : undefined;
        const client = jugador ? getClientById(jugador.id) : null;
        if (jugador && client && Number(jugador.mana ?? 0) < Number(jugador.maxMana ?? 0) * 0.6) {
            jugador.mana = jugador.maxMana;
            handleProtocol.updateMana(jugador.mana, client);
        }

        state.reapariciones = state.reapariciones.filter((pendiente) => {
            if (ahora < pendiente.at) {
                return true;
            }
            return !crearCriatura(pendiente.def, pendiente.mapa) && ahora - pendiente.at < 20_000;
        });
    } catch (error) {
        funct.dumpError(error);
    }
}

// --- El personaje que graba ---

// Nivel 50 con el equipo y los hechizos de su clase, los de la arena (arenaClasses.ts): el teaser muestra a alguien
// que ya juega hace rato. El equipo se pone con el mismo paquete que manda el cliente.
function prepararJugador(user: RuntimeCharacter, client: RuntimeClient) {
    if ((user as { teaserListo?: boolean }).teaserListo) {
        return;
    }
    const plantilla = buildArenaTemplate(Number(user.idClase));
    if (!plantilla) {
        return;
    }
    const nivel = Number(balance.MAX_LEVEL ?? 50);
    Object.assign(user, {
        teaserListo: true,
        level: nivel,
        maxHp: balance.getMaxHpForLevel(user.idClase, user.attrConstitucion, nivel),
        maxMana: balance.getMaxManaForLevel(user.idClase, user.attrInteligencia, nivel),
        minHit: balance.getMinHitForLevel(user.idClase, nivel),
        maxHit: balance.getMaxHitForLevel(user.idClase, nivel),
        spells: plantilla.spells,
        skillPts: 0,
    });
    const skills = require("./skills");
    const valores = skills.ensureSkills(user) as number[];
    for (const name of ARENA_SKILLS) {
        valores[skills.SKILLS[name] - 1] = ARENA_SKILL_VALUE;
    }

    // Todo a la mochila y después se equipa de a una cosa (equipar tiene su intervalo).
    const inventario: Record<string, { idItem: number; cant: number; equipped: number }> = {};
    const aEquipar: number[] = [];
    Object.values(plantilla.inv).forEach((item, index) => {
        inventario[String(index + 1)] = { ...item, equipped: 0 };
        if (item.equipped) {
            aEquipar.push(index + 1);
        }
    });
    Object.assign(user, { inv: inventario, idItemWeapon: 0, idItemBody: 0, idItemShield: 0, idItemHelmet: 0, idItemArrow: 0, idItemRing: 0 });

    const intervalo = Number(vars.timing?.actionCooldowns?.equipToggleMs ?? 300) + 80;
    aEquipar.forEach((slot, index) => {
        setTimeout(() => paqueteEquipar(client, slot), (index + 1) * intervalo);
    });
    setTimeout(() => curar(user, client), (aEquipar.length + 1) * intervalo);
}

function curar(user: RuntimeCharacter, client: RuntimeClient) {
    game.refreshEquipmentVitals?.(user, false);
    // El que graba no se puede morir en medio de una toma.
    user.maxHp = Number(user.maxHp ?? 1) * VIDA_BOT;
    user.hp = user.maxHp;
    user.mana = user.maxMana;
    handleProtocol.updateHP(user.hp, client);
    handleProtocol.updateMana(user.mana, client);
}

// Los ítems de mazmorra se guardan en el progreso del personaje (dungeons.ts los lee de ahí).
function itemsDeMazmorra(jugadorId: EntityId, dar: string[], sacar: string[]) {
    const clave = (usuario(jugadorId) as { _id?: unknown } | undefined)?._id;
    if (!clave) {
        return;
    }
    const progreso = require("./woaoProgress");
    const datos = progreso.getProgress({ _id: String(clave) }) as { dungeonItems?: string[] };
    const items = new Set(datos.dungeonItems ?? []);
    dar.forEach((item) => items.add(item));
    sacar.forEach((item) => items.delete(item));
    datos.dungeonItems = [...items];
    progreso.saveProgress({ _id: String(clave) });
}

// --- Armar y desarmar ---

export async function limpiar() {
    const bots = [...state.bots.values()];
    state.bots.clear();
    state.escena = null;
    state.jugadorId = null;
    for (const bot of bots) {
        await getSocket().closePjById(bot.id);
    }
    for (const id of [...state.criaturas.keys()]) {
        sacarCriatura(id);
    }
    state.reapariciones = [];
}

function ambiente(escena: Escena) {
    const environment = require("./environment");
    const momento = escena.momento ? environment.DAY_PHASE[escena.momento] : undefined;
    const clima = escena.clima ? environment.WEATHER[escena.clima] : undefined;
    if (momento !== undefined) environment.setDayPhaseOverride(momento);
    if (clima !== undefined) environment.setWeatherOverride(clima);
}

function llevarJugador(user: RuntimeCharacter, client: RuntimeClient, mapa: number, x: number, y: number, mira?: Rumbo) {
    if (user.dead) {
        game.revivirUsuario(user.id, { full: true });
    }
    if (user.meditar) {
        paqueteChat(client, "/meditar");
    }
    game.telep(client, mapa, x, y, "teaser");
    if (mira) {
        paqueteGirar(client, RUMBOS[mira]());
    }
}

// La vitrina de las clases (teaser/habilidades.ts): un bot de la clase y un muñeco en un claro del bosque, para grabar
// de cerca cada habilidad que muestra la creación de personaje. El que graba queda entre los dos y no se dibuja (lo
// esconde el modo grabación), así la cámara queda centrada en la acción.
const VITRINA = { mapa: 54, jugador: { x: 38, y: 31 }, bot: { x: 36, y: 31 }, muneco: { x: 40, y: 31 } };
const MUNECO = 9845;

// Con `victima`, en lugar del muñeco hay otro jugador mirando para el mismo lado (para apuñalarlo por la espalda y
// que se desangre).
function escenaVitrina(clase: number, nombre: string, victima: boolean): Escena {
    return {
        mapa: VITRINA.mapa,
        jugador: { ...VITRINA.jugador, mira: "derecha" },
        momento: "mediodia",
        clima: "despejado",
        despejar: 16,
        reaparecenMs: 500,
        // El muñeco mira para el mismo lado que el bot: así la apuñalada es por la espalda.
        criaturas: victima ? [] : [{ npc: MUNECO, ...VITRINA.muneco, mira: "derecha" }],
        bots: [
            { nombre, clase, ...VITRINA.bot, mira: "derecha", accion: { tipo: "quieto" }, sinSeguro: victima },
            ...(victima ? [{ nombre: "Rival", clase: 3, ...VITRINA.muneco, mira: "derecha" as Rumbo, accion: { tipo: "quieto" as const }, vida: 30 }] : []),
        ],
    };
}

function muneco() {
    for (const id of state.criaturas.keys()) {
        const npc = vars.npcs?.[id];
        if (npc && Number(npc.templateNpcIndex) === MUNECO) {
            return npc;
        }
    }
    return null;
}

// Una acción del bot de la vitrina, cuando la pide la grabación: un hechizo (al muñeco o a sí mismo), un golpe, un
// flechazo, una poción, caminar hasta una baldosa o mirar para un lado.
function hacer(param: (name: string) => string) {
    const bot = state.bots.get(param("bot").toLowerCase());
    const user = bot ? usuario(bot.id) : undefined;
    const blanco = muneco();
    if (!bot || !user) {
        return { ok: false, error: `${param("bot")} no está en escena.` };
    }
    const rival = state.bots.get("rival");
    const rivalUser = rival && rival !== bot ? usuario(rival.id) : undefined;
    const objetivo =
        param("a") === "yo" || (!blanco && !rivalUser)
            ? { pos: user.pos, map: Number(user.map), id: user.id }
            : param("a") === "rival" || !blanco
              ? { pos: rivalUser!.pos, map: Number(rivalUser!.map), id: rivalUser!.id }
              : blanco;
    switch (param("que")) {
        case "hechizo": {
            const spells = (user.spells ?? {}) as Record<string, { idSpell?: number } | undefined>;
            const slot = Object.entries(spells).find(([, entry]) => Number(entry?.idSpell) === Number(param("id")))?.[0];
            if (!slot) {
                return { ok: false, error: `${bot.def.nombre} no sabe el hechizo ${param("id")}.` };
            }
            paqueteHechizo(bot.client, Number(slot), objetivo);
            return { ok: true };
        }
        case "golpe":
            paqueteGirar(bot.client, rumboHacia(user.pos, objetivo.pos));
            paqueteGolpe(bot.client);
            return { ok: true };
        case "disparo":
            paqueteGirar(bot.client, rumboHacia(user.pos, objetivo.pos));
            paqueteDisparo(bot.client, objetivo);
            return { ok: true };
        case "pocion": {
            const inventario = (user.inv ?? {}) as Record<string, { idItem?: number } | undefined>;
            const slot = Object.entries(inventario).find(([, item]) => Number(item?.idItem) === Number(param("id")))?.[0];
            if (slot) {
                paqueteUsarItem(bot.client, Number(slot));
            }
            return { ok: Boolean(slot) };
        }
        case "ir":
            user.pendingMoveQueue = [];
            caminarHacia(bot, user, { x: Number(param("x")), y: Number(param("y")) }, 12);
            return { ok: true };
        case "mirar":
            paqueteGirar(bot.client, RUMBOS[param("rumbo") as Rumbo]?.() ?? vars.direcciones.down);
            return { ok: true };
        // Para mostrar una curación: con la vida llena no se ve cuánto cura.
        case "herir":
            user.hp = Math.round(Number(user.maxHp ?? 1) * 0.5);
            return { ok: true };
        // Ocultarse, como la tecla del juego. Con la habilidad al máximo casi siempre sale.
        case "ocultar": {
            const skills = require("./skills");
            (skills.ensureSkills(user) as number[])[skills.SKILLS.ocultarse - 1] = 100;
            mandar(bot.client, (buffer) => buffer.writeUint8(getPkg().serverPacketID.toggleHiddenSkill));
            return { ok: true };
        }
        default:
            return { ok: false, error: `No sé hacer "${param("que")}".` };
    }
}

export async function armarEscena(id: string, nombreJugador: string, escena: Escena | undefined = ESCENAS[id]) {
    if (!escena) {
        return { ok: false, error: `No existe la escena ${id}. Hay: ${Object.keys(ESCENAS).join(", ")}` };
    }
    const jugador = buscarJugador(nombreJugador);
    const client = jugador ? getClientById(jugador.id) : null;
    if (!jugador || !client) {
        return { ok: false, error: `${nombreJugador} no está conectado. Conectados: ${conectados()}` };
    }

    await limpiar();
    state.escena = escena;
    prepararJugador(jugador, client);
    ambiente(escena);
    // Si quedó adentro de la mazmorra de la toma anterior, sale (si no, no puede volver a entrar).
    if (Number(jugador.map) !== escena.mapa) {
        require("./dungeons").handleCommand(jugador.id, "salir");
    }

    if (escena.despejar) {
        despejar(escena.mapa, escena.jugador, escena.despejar);
    }
    // Primero las criaturas y los bots; después llega el jugador y ve a todos de una vez.
    for (const def of escena.criaturas ?? []) {
        crearCriatura(def, escena.mapa);
    }
    for (const def of escena.bots) {
        const bot = await conectarBot(def, escena.mapa);
        if (bot) {
            state.bots.set(def.nombre.toLowerCase(), bot);
        }
    }
    Object.assign(jugador, { clan: "", clanId: null });
    llevarJugador(jugador, client, escena.mapa, escena.jugador.x, escena.jugador.y, escena.jugador.mira);
    // El clan va después de llegar: con un clan que no existe, el castillo no lo dejaría entrar.
    if (escena.jugador.clan) {
        Object.assign(jugador, { clan: escena.jugador.clan, clanId: `teaser:${escena.jugador.clan}` });
    }
    escena.alLlegar?.(jugador.id);
    curar(jugador, client);
    state.jugadorId = jugador.id;

    return { ok: true, escena: id, mapa: escena.mapa, ...escena.jugador, bots: state.bots.size, criaturas: state.criaturas.size };
}

// --- Lo que pide la grabación (server.ts, /debug/teaser/*) ---

export async function handleDebugRequest(url: URL) {
    const accion = url.pathname.replace("/debug/teaser/", "");
    const param = (name: string) => url.searchParams.get(name) ?? "";

    switch (accion) {
        case "escena":
            return armarEscena(param("id"), param("jugador"));
        case "vitrina":
            return armarEscena(
                "vitrina",
                param("jugador"),
                escenaVitrina(Number(param("clase")), param("nombre") || "Demo", param("victima") === "1"),
            );
        case "hacer":
            return hacer(param);
        case "limpiar":
            await limpiar();
            return { ok: true };
        case "decir": {
            const bot = state.bots.get(param("bot").toLowerCase());
            const jugador = bot ? null : buscarJugador(param("bot"));
            const client = bot?.client ?? (jugador ? getClientById(jugador.id) : null);
            if (!client) {
                return { ok: false, error: `${param("bot")} no está en escena.` };
            }
            paqueteChat(client, param("texto"));
            return { ok: true };
        }
        // Lo que hay en escena ahora: para revisar una escena sin mirar el video.
        case "estado": {
            const jugador = param("jugador") ? buscarJugador(param("jugador")) : undefined;
            const hechizos = Object.fromEntries(
                Object.entries((jugador?.spells ?? {}) as Record<string, { idSpell?: number }>).map(([slot, entry]) => [entry?.idSpell, Number(slot)]),
            );
            return {
                ok: true,
                jugador: jugador ? { mapa: jugador.map, pos: jugador.pos, vida: jugador.hp, hechizos } : null,
                bots: [...state.bots.values()].map((bot) => {
                    const user = usuario(bot.id);
                    return {
                        nombre: bot.def.nombre,
                        mapa: user?.map,
                        pos: user?.pos,
                        vida: user?.hp,
                        mana: user ? `${user.mana}/${user.maxMana}` : null,
                        muerto: Boolean(user?.dead),
                        sangra: Boolean((user as { bleed?: unknown } | undefined)?.bleed),
                    };
                }),
                criaturas: [...state.criaturas.keys()].map((id) => {
                    const npc = vars.npcs?.[id];
                    return { id, nombre: npc?.nameCharacter, pos: npc?.pos, vida: npc?.hp };
                }),
                reapariciones: state.reapariciones.length,
            };
        }
        // Para buscar lugares: lleva al jugador a un punto de cualquier mapa.
        case "ir": {
            const jugador = buscarJugador(param("jugador"));
            const client = jugador ? getClientById(jugador.id) : null;
            if (!jugador || !client) {
                return { ok: false, error: `${param("jugador")} no está conectado. Conectados: ${conectados()}` };
            }
            prepararJugador(jugador, client);
            llevarJugador(jugador, client, Number(param("mapa")), Number(param("x")), Number(param("y")));
            return { ok: true };
        }
        default:
            return { ok: false, error: `No existe /debug/teaser/${accion}.` };
    }
}
