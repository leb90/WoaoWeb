import type { GmBotState, RuntimeCharacter, RuntimeCharacters } from "./types/runtime";

export {};
const funct = require("./functions");
const vars = require("./vars");
const game = require("./game");
const handleProtocol = require("./handleProtocol");
const socket = require("./socket");

const BOT_NAME = "GM-Aris";
const BOT_COLOR = "#8be9fd";

const HOME_MAP = 37;
const HOME_X = 78;
const HOME_Y = 87;
const JAIL_MAP = 66;

const SUMMON_COOLDOWN_MS = 3000;
const STUCK_TELEPORT_COOLDOWN_MS = 10 * 60 * 1000;
const COMBAT_LOCKOUT_MS = 15 * 1000;
const REPORT_COOLDOWN_MS = 10 * 60 * 1000;

type BotCharacter = RuntimeCharacter & {
    id: string;
    nameCharacter?: string;
    level?: number;
    idClase?: number;
    map?: number;
    pos?: { x: number; y: number };
    dead?: boolean;
    challengeMatchId?: string | null;
};

const FAQ: Array<{ keywords: string[]; answer: string }> = [
    {
        keywords: ["skill", "habilidad", "subir", "puntos"],
        answer:
            "Los puntos de skill se reparten peleando, trabajando o con /entrenar según la habilidad. Se ven con /skills.",
    },
    {
        keywords: ["clan", "gremio"],
        answer:
            "Para unirte a un clan necesitás que un líder te acepte, o crear el tuyo con /crearclan si cumplís el nivel mínimo.",
    },
    {
        keywords: ["hogar", "casa", "spawn"],
        answer: "Con /hogar volvés a tu punto de origen si estás muerto o en zona segura.",
    },
    {
        keywords: ["mercado", "vender", "comprar"],
        answer: "El mercado entre jugadores se abre con /mercado.",
    },
    {
        keywords: ["clase", "cambiar clase"],
        answer: "La clase se elige al crear el personaje y no se puede cambiar después.",
    },
    {
        keywords: ["mascota", "montura", "domar"],
        answer: "Se doman criaturas con /domar cerca de una domable, y se maneja desde el panel de monturas.",
    },
    {
        keywords: ["donacion", "donar", "puntos de donacion"],
        answer: "Podés donar desde la web en /donaciones y canjear los puntos con /canjeardonacion.",
    },
];

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(message, BOT_COLOR, 1, 0, client, "gmbot", BOT_NAME);
    }
}

function getUser(idUser: string): BotCharacter | undefined {
    return (vars.personajes as RuntimeCharacters)[idUser] as BotCharacter | undefined;
}

function setState(user: BotCharacter, state: GmBotState | null) {
    user.gmBotState = state;
}

function findOnlineByName(name: string): BotCharacter | undefined {
    const normalized = name.trim().toLowerCase();
    if (!normalized) {
        return undefined;
    }

    for (const idUser in vars.personajes as RuntimeCharacters) {
        const target = (vars.personajes as RuntimeCharacters)[idUser] as BotCharacter | undefined;
        if (target?.nameCharacter?.trim().toLowerCase() === normalized) {
            return target;
        }
    }

    return undefined;
}

function buildSnapshot(user: BotCharacter) {
    return {
        level: Number(user.level ?? 0),
        idClase: Number(user.idClase ?? 0),
        map: Number(user.map ?? 0),
        pos: user.pos ? { x: Number(user.pos.x ?? 0), y: Number(user.pos.y ?? 0) } : null,
    };
}

async function createTicket(params: {
    type: "report_player" | "bug" | "general";
    reporter: BotCharacter;
    targetCharacterId?: string;
    targetName?: string;
    message: string;
    context?: Record<string, unknown>;
}) {
    return funct.fetchUrl("/internal/gm-tickets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: vars.tokenAuth,
        },
        body: JSON.stringify({
            type: params.type,
            reporterCharacterId: params.reporter.id,
            reporterName: params.reporter.nameCharacter ?? "?",
            targetCharacterId: params.targetCharacterId ?? null,
            targetName: params.targetName ?? null,
            message: params.message,
            context: params.context ?? {},
        }),
    });
}

function showMenu(idUser: string) {
    tell(
        idUser,
        `Hola, soy ${BOT_NAME}. ¿En qué te ayudo?\n1) Estoy atascado\n2) Reportar a un jugador\n3) Reportar un bug/ítem\n4) Preguntas frecuentes\n5) Salir`,
    );
}

function handleStuck(idUser: string, user: BotCharacter) {
    const now = Date.now();

    if (user.dead) {
        tell(idUser, "Estás muerto — usá /hogar o resucitá primero, no puedo moverte así.");
        showMenu(idUser);
        return;
    }

    if (user.map === JAIL_MAP) {
        tell(idUser, "Estás en la cárcel, no puedo sacarte de ahí.");
        showMenu(idUser);
        return;
    }

    if (user.challengeMatchId) {
        tell(idUser, "Estás en un desafío/arena, no puedo moverte ahora.");
        showMenu(idUser);
        return;
    }

    const lastCombatAt = Number(user.lastCombatActivityAt ?? 0);
    if (now - lastCombatAt < COMBAT_LOCKOUT_MS) {
        tell(idUser, "Recién estuviste en combate, esperá unos segundos y volvé a intentar.");
        showMenu(idUser);
        return;
    }

    const nextAllowedAt = Number(user.gmBotStuckTeleportNextAt ?? 0);
    if (now < nextAllowedAt) {
        const remaining = Math.ceil((nextAllowedAt - now) / 1000);
        tell(idUser, `Ya te ayudé con esto hace poco, esperá ${remaining}s.`);
        showMenu(idUser);
        return;
    }

    const homeMap = Number(user.homeMap ?? 0) > 0 ? Number(user.homeMap) : HOME_MAP;
    const homeX = Number(user.homeX ?? 0) > 0 ? Number(user.homeX) : HOME_X;
    const homeY = Number(user.homeY ?? 0) > 0 ? Number(user.homeY) : HOME_Y;

    const client = vars.clients[idUser];
    if (client) {
        game.telep(client, homeMap, homeX, homeY, "gmbot atascado");
    }

    user.gmBotStuckTeleportNextAt = now + STUCK_TELEPORT_COOLDOWN_MS;
    tell(idUser, "Listo, te llevé a tu hogar. ¡Cuidado la próxima!");
    setState(user, null);
}

function startReport(idUser: string, user: BotCharacter) {
    setState(user, { step: "reportar_nombre" });
    tell(idUser, "¿Cómo se llama el personaje que querés reportar? Escribí el nombre.");
}

function receiveReportName(idUser: string, user: BotCharacter, text: string) {
    const name = text.trim();
    if (!name) {
        tell(idUser, "Necesito un nombre. Escribilo de nuevo.");
        return;
    }

    const cooldowns = user.gmBotReportCooldowns ?? {};
    const key = name.toLowerCase();
    const nextAllowedAt = Number(cooldowns[key] ?? 0);
    if (Date.now() < nextAllowedAt) {
        tell(idUser, "Ya reportaste a ese jugador hace poco. Probá con otro caso o esperá un rato.");
        setState(user, { step: "menu" });
        showMenu(idUser);
        return;
    }

    setState(user, { step: "reportar_motivo", context: { reportedName: name } });
    tell(idUser, `Contame en pocas palabras qué pasó con ${name}.`);
}

async function receiveReportMotivo(idUser: string, user: BotCharacter, text: string) {
    const reason = text.trim();
    if (!reason) {
        tell(idUser, "Necesito una descripción. Escribila de nuevo.");
        return;
    }

    const targetName = user.gmBotState?.context?.reportedName ?? "?";
    const target = findOnlineByName(targetName);

    try {
        await createTicket({
            type: "report_player",
            reporter: user,
            targetCharacterId: target?.id,
            targetName,
            message: reason,
            context: {
                reporterSnapshot: buildSnapshot(user),
                targetSnapshot: target ? buildSnapshot(target) : null,
                targetOnline: Boolean(target),
            },
        });

        const cooldowns = user.gmBotReportCooldowns ?? {};
        cooldowns[targetName.toLowerCase()] = Date.now() + REPORT_COOLDOWN_MS;
        user.gmBotReportCooldowns = cooldowns;

        tell(idUser, "Listo, quedó reportado. El staff lo va a revisar.");
    } catch (error) {
        funct.dumpError(error);
        tell(idUser, "No pude guardar el reporte, intentá de nuevo en un rato.");
    }

    setState(user, { step: "menu" });
    showMenu(idUser);
}

async function receiveBugText(idUser: string, user: BotCharacter, text: string) {
    const description = text.trim();
    if (!description) {
        tell(idUser, "Necesito una descripción del bug/ítem. Escribila de nuevo.");
        return;
    }

    try {
        await createTicket({
            type: "bug",
            reporter: user,
            message: description,
            context: { reporterSnapshot: buildSnapshot(user) },
        });
        tell(idUser, "Listo, quedó cargado. Gracias por avisar.");
    } catch (error) {
        funct.dumpError(error);
        tell(idUser, "No pude guardar el reporte, intentá de nuevo en un rato.");
    }

    setState(user, { step: "menu" });
    showMenu(idUser);
}

async function receiveFaqQuestion(idUser: string, user: BotCharacter, text: string) {
    const question = text.trim().toLowerCase();
    const match = FAQ.find((entry) => entry.keywords.some((keyword) => question.includes(keyword)));

    if (match) {
        tell(idUser, match.answer);
        setState(user, { step: "menu" });
        showMenu(idUser);
        return;
    }

    try {
        await createTicket({
            type: "general",
            reporter: user,
            message: question,
            context: { reporterSnapshot: buildSnapshot(user) },
        });
        tell(idUser, "No tengo una respuesta para eso, lo dejé cargado como consulta para el staff.");
    } catch (error) {
        funct.dumpError(error);
        tell(idUser, "No tengo una respuesta para eso y no pude cargar la consulta, intentá de nuevo.");
    }

    setState(user, { step: "menu" });
    showMenu(idUser);
}

function handleMenuChoice(idUser: string, user: BotCharacter, choice: string) {
    switch (choice.trim()) {
        case "1":
            handleStuck(idUser, user);
            return;
        case "2":
            startReport(idUser, user);
            return;
        case "3":
            setState(user, { step: "bug_texto" });
            tell(idUser, "Contame qué bug o ítem roto encontraste.");
            return;
        case "4":
            setState(user, { step: "faq_pregunta" });
            tell(idUser, "Preguntame lo que quieras saber.");
            return;
        case "5":
        case "salir":
            setState(user, null);
            tell(idUser, "¡Listo! Cualquier cosa volvé a llamarme con /gm.");
            return;
        default:
            tell(idUser, "No entendí. Elegí un número del 1 al 5.");
            showMenu(idUser);
    }
}

export function handleCommand(idUser: string, rawText: string): void {
    const user = getUser(idUser);
    if (!user) {
        return;
    }

    const text = (rawText ?? "").trim();
    const state = user.gmBotState ?? null;

    if (!state) {
        const now = Date.now();
        const nextAllowedAt = Number(user.gmBotNextSummonAt ?? 0);
        if (now < nextAllowedAt) {
            return;
        }
        user.gmBotNextSummonAt = now + SUMMON_COOLDOWN_MS;

        setState(user, { step: "menu" });
        showMenu(idUser);
        return;
    }

    switch (state.step) {
        case "menu":
            handleMenuChoice(idUser, user, text);
            return;
        case "reportar_nombre":
            receiveReportName(idUser, user, text);
            return;
        case "reportar_motivo":
            void receiveReportMotivo(idUser, user, text);
            return;
        case "bug_texto":
            void receiveBugText(idUser, user, text);
            return;
        case "faq_pregunta":
            void receiveFaqQuestion(idUser, user, text);
            return;
        default:
            setState(user, null);
    }
}
