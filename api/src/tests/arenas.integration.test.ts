import assert from "node:assert/strict";
import { beforeAll, test } from "vitest";
import {
    type ConsumedGameTicketPayload,
    type GameTicketResponse,
    consumeGameTicket,
    createAccountFixture,
    createArenaTicket,
    ensureApiReady,
    expectErrorPayload,
    expectSuccessPayload,
    getArenaOverview,
    sendArenaState,
    sendArenaTrainingResults,
} from "./helpers/api";

beforeAll(async () => {
    await ensureApiReady();
});

test("an arena ticket carries the chosen class and the account name", async () => {
    const player = await createAccountFixture();

    const ticketResponse = await createArenaTicket(player.session.sessionToken, 22);
    assert.equal(ticketResponse.status, 200);
    const { ticket } = expectSuccessPayload<GameTicketResponse>(ticketResponse.data);

    const consumed = await consumeGameTicket(ticket, "127.0.0.1");
    assert.equal(consumed.status, 200);
    const consumedTicket = expectSuccessPayload<ConsumedGameTicketPayload>(consumed.data);
    assert.equal(consumedTicket.mode, "arena");
    assert.equal(consumedTicket.arena?.idClase, 22);
    assert.equal(consumedTicket.account?.name, player.name);
    assert.equal(consumedTicket.character, undefined);

    const consumedAgain = await consumeGameTicket(ticket, "127.0.0.1");
    assert.notEqual(consumedAgain.status, 200);
});

test("an arena ticket needs a session and a playable class", async () => {
    const player = await createAccountFixture();

    const noSession = await createArenaTicket("", 1);
    const thief = await createArenaTicket(player.session.sessionToken, 5);

    assert.equal(noSession.status, 401);
    assert.equal(thief.status, 400);
    assert.match(expectErrorPayload(thief.data).error ?? "", /Clase invalida/);
});

test("the game server reports who is playing and the account ranking keeps the best run", async () => {
    const first = await createAccountFixture();
    const second = await createAccountFixture();
    const top = [
        { nombre: first.name, idClase: 1, puntos: 9_000_040, kills: 3, muertes: 1 },
        { nombre: second.name, idClase: 3, puntos: 10, kills: 1, muertes: 2 },
    ];

    const denied = await sendArenaState({ jugadores: 2, top, resultados: [] }, "wrong-token");
    assert.equal(denied.status, 401);

    const sent = await sendArenaState({
        jugadores: 2,
        top,
        resultados: [
            { accountId: first.session.account._id, kills: 3, muertes: 1, mejorPuntaje: 9_000_040, mejorRacha: 3 },
            { accountId: second.session.account._id, kills: 1, muertes: 2, mejorPuntaje: 10, mejorRacha: 1 },
        ],
    });
    assert.equal(sent.status, 200);

    // Un envío posterior suma kills y muertes, pero el mejor puntaje solo sube.
    await sendArenaState({
        jugadores: 1,
        top: [top[0]],
        resultados: [
            { accountId: first.session.account._id, kills: 2, muertes: 4, mejorPuntaje: 25, mejorRacha: 2 },
        ],
    });

    const overview = await getArenaOverview();
    assert.equal(overview.status, 200);
    assert.equal(overview.data.enVivo.jugadores, 1);
    assert.deepEqual(overview.data.enVivo.top, [top[0]]);

    const firstRow = overview.data.ranking.find((row) => row.nombre === first.name);
    assert.deepEqual(firstRow, { nombre: first.name, kills: 5, muertes: 5, mejorPuntaje: 9_000_040, mejorRacha: 3 });
    assert.equal(overview.data.ranking[0]?.nombre, first.name);
});

test("a training ticket carries the bot class and the account's best training score", async () => {
    const player = await createAccountFixture();

    const invalid = await createArenaTicket(player.session.sessionToken, 1, 5);
    assert.equal(invalid.status, 400);

    await sendArenaTrainingResults({
        resultados: [{ accountId: player.session.account._id, puntaje: 750, nivel: 4, idClase: 1, idClaseBot: 3 }],
    });

    const ticketResponse = await createArenaTicket(player.session.sessionToken, 1, 3);
    assert.equal(ticketResponse.status, 200);
    const { ticket } = expectSuccessPayload<GameTicketResponse>(ticketResponse.data);
    const consumed = expectSuccessPayload<ConsumedGameTicketPayload>((await consumeGameTicket(ticket, "127.0.0.1")).data);
    assert.equal(consumed.arena?.idClase, 1);
    assert.equal(consumed.arena?.idClaseBot, 3);
    assert.equal(consumed.arena?.recordEntrenamiento, 750);

    // Sin la clase del bot es el todos contra todos.
    const ffaTicket = expectSuccessPayload<GameTicketResponse>((await createArenaTicket(player.session.sessionToken, 1)).data);
    const ffa = expectSuccessPayload<ConsumedGameTicketPayload>((await consumeGameTicket(ffaTicket.ticket, "127.0.0.1")).data);
    assert.equal(ffa.arena?.idClaseBot, null);
});

test("the training ranking keeps each account's best run with its classes", async () => {
    const first = await createAccountFixture();
    const second = await createAccountFixture();

    // Puntajes que suben en cada corrida, para quedar arriba de lo que dejaron las anteriores en la base.
    const base = Math.floor(Date.now() / 1000);

    const denied = await sendArenaTrainingResults({ resultados: [] }, "wrong-token");
    assert.equal(denied.status, 401);

    const sent = await sendArenaTrainingResults({
        resultados: [
            { accountId: first.session.account._id, puntaje: base + 100, nivel: 9, idClase: 3, idClaseBot: 1 },
            { accountId: second.session.account._id, puntaje: base + 50, nivel: 8, idClase: 20, idClaseBot: 22 },
        ],
    });
    assert.equal(sent.status, 200);
    // Una racha peor no pisa la mejor (ni sus clases); una mejor sí.
    await sendArenaTrainingResults({
        resultados: [
            { accountId: first.session.account._id, puntaje: 300, nivel: 2, idClase: 1, idClaseBot: 1 },
            { accountId: second.session.account._id, puntaje: base + 200, nivel: 10, idClase: 8, idClaseBot: 4 },
        ],
    });

    const overview = await getArenaOverview();
    assert.equal(overview.status, 200);
    const rows = overview.data.entrenamiento.filter((row) => row.nombre === first.name || row.nombre === second.name);
    assert.deepEqual(
        rows.map(({ fecha: _fecha, ...row }) => row),
        [
            { nombre: second.name, puntaje: base + 200, nivel: 10, idClase: 8, idClaseBot: 4 },
            { nombre: first.name, puntaje: base + 100, nivel: 9, idClase: 3, idClaseBot: 1 },
        ],
    );
    assert.equal(overview.data.entrenamiento[0]?.nombre, second.name);
});
