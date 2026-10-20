import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
    PYRAMID_CONFIG,
    PYRAMID_RIDDLES,
    handleNpcInteraction,
    handleStatueInteraction,
    isPyramidGuideNpc,
    isPyramidStatueItemId,
    pickPyramidRiddle,
    resolvePyramidAnswer,
} from "./pyramid";
import type { DataObject, RuntimeCharacter, RuntimeClient, RuntimeNpc } from "./types/runtime";

function readJson(relativePath: string) {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, relativePath), "utf8")) as any;
}

function pyramidNpc(overrides: Partial<RuntimeNpc> = {}): RuntimeNpc {
    return {
        id: "pyramid-npc",
        templateNpcIndex: 136,
        map: 180,
        pos: { x: 45, y: 77 },
        npcType: 16,
        ...overrides,
    };
}

assert.deepEqual(PYRAMID_CONFIG.correctDestination, { map: 182, x: 47, y: 50 });
assert.deepEqual(PYRAMID_CONFIG.wrongDestination, { map: 181, x: 42, y: 66 });
assert.equal(PYRAMID_CONFIG.guideNpcType, 16);
assert.equal(PYRAMID_CONFIG.statueObjectType, 57);

assert.deepEqual(
    PYRAMID_RIDDLES.map(({ deity, answerItemId }) => ({ deity, answerItemId })),
    [
        { deity: "Anubis", answerItemId: 873 },
        { deity: "Isis", answerItemId: 874 },
        { deity: "Horus", answerItemId: 875 },
        { deity: "Thoth", answerItemId: 876 },
        { deity: "Seth", answerItemId: 877 },
        { deity: "Sekhmeth", answerItemId: 878 },
        { deity: "Bastet", answerItemId: 879 },
    ],
);

assert.equal(pickPyramidRiddle(() => 0).answerItemId, 873);
assert.equal(pickPyramidRiddle(() => 0.999999).answerItemId, 879);
assert.equal(pickPyramidRiddle(() => -1).answerItemId, 873);
assert.equal(pickPyramidRiddle(() => 2).answerItemId, 879);
assert.equal(pickPyramidRiddle(() => Number.NaN).answerItemId, 873);

assert.equal(isPyramidGuideNpc(pyramidNpc()), true);
assert.equal(isPyramidGuideNpc(pyramidNpc({ map: 179 })), false);
assert.equal(isPyramidGuideNpc(pyramidNpc({ npcType: 0 })), false);
assert.equal(isPyramidGuideNpc(pyramidNpc({ templateNpcIndex: 135 })), false);

for (const riddle of PYRAMID_RIDDLES) {
    assert.equal(isPyramidStatueItemId(riddle.answerItemId), true);
    assert.equal(resolvePyramidAnswer(riddle, riddle.answerItemId), "correct");
    assert.equal(resolvePyramidAnswer(riddle, riddle.answerItemId === 879 ? 873 : 879), "wrong");
}

assert.equal(isPyramidStatueItemId(872), false);
assert.equal(isPyramidStatueItemId(880), false);

const objects = readJson("../jsons/objs.json");
for (const riddle of PYRAMID_RIDDLES) {
    assert.equal(objects[String(riddle.answerItemId)]?.objType, PYRAMID_CONFIG.statueObjectType);
}

const npcTemplates = readJson("../jsons/npcs.json");
assert.equal(npcTemplates[String(PYRAMID_CONFIG.guideNpcTemplateId)]?.npcType, PYRAMID_CONFIG.guideNpcType);

const puzzleNpcs = readJson("../mapas_source/mapa_180/npcs.json");
assert.deepEqual(puzzleNpcs, [{ mapNum: 180, x: 45, y: 77, npcIndex: 136 }]);

const puzzleSpecials = readJson("../mapas_source/mapa_180/specials.json");
assert.deepEqual(
    Object.values(puzzleSpecials.objects)
        .map((entry: any) => Number(entry.objIndex))
        .sort((left: number, right: number) => left - right),
    PYRAMID_RIDDLES.map((riddle) => riddle.answerItemId),
);

for (const destination of [PYRAMID_CONFIG.correctDestination, PYRAMID_CONFIG.wrongDestination]) {
    const terrain = readJson(`../mapas_source/mapa_${destination.map}/terrain.json`);
    const paletteId = terrain.rows[destination.y - 1][destination.x - 1];
    assert.notEqual(terrain.palette[String(paletteId)]?.blocked, true);
}

const vars = require("./vars");
const game = require("./game");
const handleProtocol = require("./handleProtocol");
const testClientId = "pyramid-test-user";
const testNpcId = "pyramid-test-npc";
const testClient = {
    id: testClientId,
    OPEN: 1,
    readyState: 1,
    on: () => undefined,
    send: () => undefined,
    close: () => undefined,
} as RuntimeClient;
const testCharacter = {
    id: testClientId,
    nameCharacter: "Pyramid Tester",
    map: 180,
    pos: { x: 45, y: 76 },
    heading: 1,
    dead: 0,
} as RuntimeCharacter;
const testNpc = pyramidNpc({ id: testNpcId });
const pyramidObject = { objType: 57 } as DataObject;
const calls = {
    dialogs: [] as string[],
    consoles: [] as string[],
    sounds: [] as number[],
    teleports: [] as Array<{ map: number; x: number; y: number; source?: string }>,
};
const originalDialog = handleProtocol.dialog;
const originalConsole = handleProtocol.console;
const originalPlaySound = handleProtocol.playSound;
const originalTelep = game.telep;

try {
    vars.personajes[testClientId] = testCharacter;
    vars.npcs[testNpcId] = testNpc;
    handleProtocol.dialog = (_id: unknown, message: string) => calls.dialogs.push(message);
    handleProtocol.console = (message: string) => calls.consoles.push(message);
    handleProtocol.playSound = (_id: unknown, soundId: number) => calls.sounds.push(soundId);
    game.telep = (_client: RuntimeClient, map: number, x: number, y: number, source?: string) => {
        calls.teleports.push({ map, x, y, source });
    };

    assert.equal(handleNpcInteraction(testClient, testNpcId), true);
    assert.equal(calls.dialogs.length, 1);
    assert.equal(
        PYRAMID_RIDDLES.some((riddle) => riddle.text === calls.dialogs[0]),
        true,
    );

    const firstChallenge = testCharacter.pyramidChallenge;
    assert.ok(firstChallenge);
    assert.equal(handleStatueInteraction(testClient, 180, firstChallenge.answerItemId, pyramidObject), true);
    assert.deepEqual(calls.teleports.at(-1), {
        ...PYRAMID_CONFIG.correctDestination,
        source: "pyramid.correct-answer",
    });
    assert.equal(calls.sounds.at(-1), PYRAMID_CONFIG.successSound);
    assert.equal(testCharacter.pyramidChallenge, null);

    assert.equal(handleNpcInteraction(testClient, testNpcId), true);
    const secondChallenge = (vars.personajes[testClientId] as RuntimeCharacter).pyramidChallenge;
    assert.ok(secondChallenge);
    const wrongItemId = secondChallenge.answerItemId === 873 ? 874 : 873;
    assert.equal(handleStatueInteraction(testClient, 180, wrongItemId, pyramidObject), true);
    assert.deepEqual(calls.teleports.at(-1), {
        ...PYRAMID_CONFIG.wrongDestination,
        source: "pyramid.wrong-answer",
    });
    assert.equal(testCharacter.pyramidChallenge, null);

    const teleportCount = calls.teleports.length;
    assert.equal(handleStatueInteraction(testClient, 180, 873, pyramidObject), true);
    assert.equal(calls.teleports.length, teleportCount);
    assert.equal(calls.consoles.at(-1), "Primero escuchá el acertijo de la Estatua Aodrag.");
} finally {
    handleProtocol.dialog = originalDialog;
    handleProtocol.console = originalConsole;
    handleProtocol.playSound = originalPlaySound;
    game.telep = originalTelep;
    delete vars.personajes[testClientId];
    delete vars.npcs[testNpcId];
}

console.log("Pyramid riddle tests passed.");
