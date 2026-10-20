import type { GameApi } from "./game";
import type {
    DataObject,
    EntityId,
    PyramidChallengeState,
    RuntimeCharacter,
    RuntimeClient,
    RuntimeNpc,
} from "./types/runtime";

export {};

const vars = require("./vars");
const handleProtocol = require("./handleProtocol");

export const PYRAMID_CONFIG = Object.freeze({
    puzzleMap: 180,
    guideNpcTemplateId: 136,
    guideNpcType: Number(vars.npcType.estatuaEgipto),
    statueObjectType: Number(vars.objType.estatuasEgipto),
    interactionRange: 5,
    correctDestination: Object.freeze({ map: 182, x: 47, y: 50 }),
    wrongDestination: Object.freeze({ map: 181, x: 42, y: 66 }),
    successSound: 138,
});

export type PyramidRiddle = Readonly<{
    id: number;
    deity: string;
    text: string;
    answerItemId: number;
}>;

export const PYRAMID_RIDDLES: readonly PyramidRiddle[] = Object.freeze([
    {
        id: 1,
        deity: "Anubis",
        text: "Oh Mortal!, ruega a Anubis por tu salvación...",
        answerItemId: 873,
    },
    {
        id: 2,
        deity: "Isis",
        text: "Ser inmundo... sólo con la ayuda de Isis sobrevivirás!...",
        answerItemId: 874,
    },
    {
        id: 3,
        deity: "Horus",
        text: "Vil criatura!...Pide que Horus te proteja y no serás destruido...",
        answerItemId: 875,
    },
    {
        id: 4,
        deity: "Thoth",
        text: "Sólo Thoth te librará de ser exterminado como la alimaña que eres...",
        answerItemId: 876,
    },
    {
        id: 5,
        deity: "Seth",
        text: "Profanas nuestro descanso y pagarás por ello...que Seth te acoja!",
        answerItemId: 877,
    },
    {
        id: 6,
        deity: "Sekhmeth",
        text: "Haz una ofrenda a Sekhmeth y ruega por tu alma mortal",
        answerItemId: 878,
    },
    {
        id: 7,
        deity: "Bastet",
        text: "Te destruiremos por perturbar nuestro descanso...sólo Bastet te ayudará",
        answerItemId: 879,
    },
]);

const PYRAMID_STATUE_ITEM_IDS = new Set(PYRAMID_RIDDLES.map((riddle) => riddle.answerItemId));

type PyramidCharacter = RuntimeCharacter & {
    pyramidChallenge?: PyramidChallengeState | null;
};

function getGameApi() {
    return require("./game") as GameApi;
}

function getCharacter(clientId: EntityId): PyramidCharacter | undefined {
    return (vars.personajes as Record<string, PyramidCharacter | undefined>)[String(clientId)];
}

function getNpc(npcId: EntityId): RuntimeNpc | undefined {
    return (vars.npcs as Record<string, RuntimeNpc | undefined>)[String(npcId)];
}

function isInsideInteractionRange(user: RuntimeCharacter, npc: RuntimeNpc): boolean {
    return Math.round(Math.hypot(user.pos.x - npc.pos.x, user.pos.y - npc.pos.y)) <= PYRAMID_CONFIG.interactionRange;
}

export function pickPyramidRiddle(random: () => number = Math.random): PyramidRiddle {
    const roll = Number(random());
    const normalizedRoll = Number.isFinite(roll) ? Math.min(Math.max(roll, 0), 0.999999999) : 0;
    return PYRAMID_RIDDLES[Math.floor(normalizedRoll * PYRAMID_RIDDLES.length)];
}

export function isPyramidGuideNpc(npc: RuntimeNpc | undefined | null): boolean {
    if (!npc) {
        return false;
    }

    const hasExpectedTemplate =
        typeof npc.templateNpcIndex === "undefined" ||
        Number(npc.templateNpcIndex) === PYRAMID_CONFIG.guideNpcTemplateId;

    return (
        Number(npc.map) === PYRAMID_CONFIG.puzzleMap &&
        Number(npc.npcType) === PYRAMID_CONFIG.guideNpcType &&
        hasExpectedTemplate
    );
}

export function isPyramidStatueItemId(itemId: number): boolean {
    return PYRAMID_STATUE_ITEM_IDS.has(Number(itemId));
}

export function resolvePyramidAnswer(
    challenge: Pick<PyramidChallengeState, "answerItemId">,
    clickedItemId: number,
): "correct" | "wrong" {
    return Number(challenge.answerItemId) === Number(clickedItemId) ? "correct" : "wrong";
}

export function handleNpcInteraction(ws: RuntimeClient, npcId: EntityId): boolean {
    if (typeof ws.id === "undefined") {
        return false;
    }

    const user = getCharacter(ws.id);
    const npc = getNpc(npcId);

    if (!user || !isPyramidGuideNpc(npc)) {
        return false;
    }

    if (Number(user.map) !== PYRAMID_CONFIG.puzzleMap || !npc || !isInsideInteractionRange(user, npc)) {
        handleProtocol.console("Te encontrás muy lejos para escuchar a la Estatua Aodrag.", "white", 1, 0, ws);
        return true;
    }

    if (user.dead) {
        handleProtocol.console("Los muertos no pueden enfrentar el acertijo de la pirámide.", "white", 1, 0, ws);
        return true;
    }

    const riddle = pickPyramidRiddle();
    user.pyramidChallenge = {
        riddleId: riddle.id,
        answerItemId: riddle.answerItemId,
        startedAt: Date.now(),
    };

    handleProtocol.dialog(npcId, riddle.text, "Estatua Aodrag", "#f6d365", 0, ws);
    handleProtocol.console("Pirámide> Elegí la estatua correcta según el acertijo.", "#f6d365", 1, 0, ws);
    return true;
}

export function handleStatueInteraction(
    ws: RuntimeClient,
    targetMap: number,
    objectItemId: number,
    objectData: DataObject | null | undefined,
): boolean {
    if (
        Number(targetMap) !== PYRAMID_CONFIG.puzzleMap ||
        !isPyramidStatueItemId(objectItemId) ||
        Number(objectData?.objType ?? 0) !== PYRAMID_CONFIG.statueObjectType
    ) {
        return false;
    }

    if (typeof ws.id === "undefined") {
        return true;
    }

    const user = getCharacter(ws.id);

    if (!user || Number(user.map) !== PYRAMID_CONFIG.puzzleMap) {
        return true;
    }

    if (user.dead) {
        handleProtocol.console("Los muertos no pueden responder el acertijo de la pirámide.", "white", 1, 0, ws);
        return true;
    }

    const challenge = user.pyramidChallenge;

    if (!challenge) {
        handleProtocol.console("Primero escuchá el acertijo de la Estatua Aodrag.", "#f6d365", 1, 0, ws);
        return true;
    }

    user.pyramidChallenge = null;
    const outcome = resolvePyramidAnswer(challenge, objectItemId);

    if (outcome === "correct") {
        const destination = PYRAMID_CONFIG.correctDestination;
        handleProtocol.console(
            "Pirámide> Respuesta correcta. La cámara del Faraón se abre ante vos.",
            "#64d98b",
            1,
            0,
            ws,
        );
        handleProtocol.playSound(user.id, PYRAMID_CONFIG.successSound, ws);
        getGameApi().telep(ws, destination.map, destination.x, destination.y, "pyramid.correct-answer");
        return true;
    }

    const destination = PYRAMID_CONFIG.wrongDestination;
    handleProtocol.console("Pirámide> Respuesta incorrecta. Has sido enviado a los desagües.", "#ef6b61", 1, 0, ws);
    getGameApi().telep(ws, destination.map, destination.x, destination.y, "pyramid.wrong-answer");
    return true;
}
