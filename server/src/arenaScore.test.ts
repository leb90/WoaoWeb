// Puntaje del modo Arena (arenaScore.ts).
//   npx tsx --test src/arenaScore.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import {
    ARENA_KILL_POINTS,
    ARENA_REKILL_WINDOW_MS,
    applyDeath,
    applyKill,
    createScore,
    pruneLastKills,
    standings,
} from "./arenaScore";

const player = (id: string, now = 0) => createScore(id, `cuenta-${id}`, `Jugador ${id}`, 1, now);

function kill(
    killer: ReturnType<typeof player>,
    victim: ReturnType<typeof player>,
    lastKills: Map<string, number>,
    now: number,
) {
    applyDeath(victim, now);
    return applyKill(killer, victim, lastKills, now);
}

test("matar suma 10 más la mitad de los puntos de la víctima, que los pierde", () => {
    const lastKills = new Map<string, number>();
    const a = player("a");
    const b = player("b");
    b.puntos = 41;

    const result = kill(a, b, lastKills, 1_000);

    assert.deepEqual(result, { ganados: ARENA_KILL_POINTS + 20, repetida: false });
    assert.equal(a.puntos, 30);
    assert.equal(b.puntos, 21);
    assert.equal(a.kills, 1);
    assert.equal(b.muertes, 1);
    assert.equal(a.racha, 1);
    assert.equal(b.botin, 0);
});

test("morir corta la racha pero guarda la mejor y el mejor puntaje", () => {
    const lastKills = new Map<string, number>();
    const a = player("a");
    const b = player("b");
    const c = player("c");

    kill(a, b, lastKills, 1_000);
    kill(a, c, lastKills, 2_000);
    assert.equal(a.racha, 2);
    assert.equal(a.puntos, 20);

    kill(b, a, lastKills, 3_000);
    assert.equal(a.racha, 0);
    assert.equal(a.mejorRacha, 2);
    assert.equal(a.puntos, 10);
    assert.equal(a.mejorPuntaje, 20);
    assert.equal(b.puntos, 20);
});

test("matar dos veces a la misma persona en menos de un minuto no suma ni le saca", () => {
    const lastKills = new Map<string, number>();
    const a = player("a");
    const b = player("b");

    kill(a, b, lastKills, 1_000);
    b.puntos = 30;
    const repeated = kill(a, b, lastKills, 1_000 + ARENA_REKILL_WINDOW_MS - 1);

    assert.deepEqual(repeated, { ganados: 0, repetida: true });
    assert.equal(a.puntos, 10);
    assert.equal(a.kills, 1);
    assert.equal(b.puntos, 30, "recupera lo que había perdido");
    assert.equal(b.muertes, 2, "la muerte cuenta igual");

    const later = kill(a, b, lastKills, 1_000 + ARENA_REKILL_WINDOW_MS);
    assert.equal(later.repetida, false);
    assert.equal(a.puntos, 10 + ARENA_KILL_POINTS + 15);
});

test("una muerte sin asesino solo le saca la mitad", () => {
    const b = player("b");
    b.puntos = 9;
    assert.equal(applyDeath(b, 5), 4);
    assert.equal(b.puntos, 5);
});

test("el ranking va por puntos, después por kills y después por quién llegó primero", () => {
    const a = player("a", 10);
    const b = player("b", 20);
    const c = player("c", 30);
    a.puntos = 50;
    b.puntos = 50;
    b.kills = 3;
    c.puntos = 50;
    c.kills = 3;
    c.puntosDesde = 5;
    b.puntosDesde = 8;

    assert.deepEqual(
        standings([a, b, c]).map((score) => score.id),
        ["c", "b", "a"],
    );
});

test("las muertes viejas se olvidan", () => {
    const lastKills = new Map([
        ["a>b", 0],
        ["a>c", ARENA_REKILL_WINDOW_MS],
    ]);
    pruneLastKills(lastKills, ARENA_REKILL_WINDOW_MS + 1);
    assert.deepEqual([...lastKills.keys()], ["a>c"]);
});
