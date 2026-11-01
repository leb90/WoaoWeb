// Entrenamiento contra el bot de la arena: dificultad por nivel y puntaje (arenaTrainingRules.ts), y el camino que
// busca el bot (primerPaso de arenaBot.ts).
//   npx tsx --test src/arenaTrainingRules.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { primerPaso } from "./arenaBot";
import { ARENA_CLASSES } from "./arenaClasses";
import {
    NIVEL_MAXIMO_DE_JUEGO,
    botProfile,
    distanciaDeseada,
    estiloDeClase,
    puntosPorVictoria,
} from "./arenaTrainingRules";

test("del nivel 1 al 10 el bot reacciona más rápido, aprovecha más los intervalos y se cura antes", () => {
    for (let nivel = 1; nivel < NIVEL_MAXIMO_DE_JUEGO; nivel++) {
        const actual = botProfile(nivel);
        const siguiente = botProfile(nivel + 1);
        assert.ok(siguiente.reaccionMs < actual.reaccionMs, `reacción ${nivel}→${nivel + 1}`);
        assert.ok(siguiente.demoraAccionMs < actual.demoraAccionMs, `demora ${nivel}→${nivel + 1}`);
        assert.ok(siguiente.pocionVidaPct > actual.pocionVidaPct, `pociones ${nivel}→${nivel + 1}`);
        assert.ok(siguiente.pocionCadaMs < actual.pocionCadaMs, `ritmo de pociones ${nivel}→${nivel + 1}`);
        assert.ok(siguiente.errorPct <= actual.errorPct, `errores ${nivel}→${nivel + 1}`);
    }
});

test("el nivel 1 es de novato y el 10 juega con todo, sin errores ni ventajas de vida o daño", () => {
    const novato = botProfile(1);
    assert.equal(novato.paraliza, false);
    assert.equal(novato.mantieneDistancia, false);
    assert.equal(novato.combos, false);
    assert.ok(novato.reaccionMs >= 1000);
    assert.ok(novato.errorPct > 0.2);

    const experto = botProfile(NIVEL_MAXIMO_DE_JUEGO);
    for (const tactica of ["paraliza", "mantieneDistancia", "curaConHechizo", "usaBuffs", "combos", "eligeMejorHechizo", "reparaliza", "anticipaCuras"] as const) {
        assert.equal(experto[tactica], true, tactica);
    }
    assert.equal(experto.errorPct, 0);
    assert.ok(experto.reaccionMs <= 200);
    assert.equal(experto.vidaExtraPct, 0);
    assert.equal(experto.danoExtraPct, 0);
});

test("desde el nivel 11 lo que sube es la vida y el daño, con tope", () => {
    assert.deepEqual([botProfile(11).vidaExtraPct, botProfile(11).danoExtraPct], [8, 4]);
    assert.deepEqual([botProfile(15).vidaExtraPct, botProfile(15).danoExtraPct], [40, 20]);
    assert.equal(botProfile(100).vidaExtraPct, 150);
    assert.equal(botProfile(100).danoExtraPct, 80);
    assert.equal(botProfile(15).reaccionMs, botProfile(NIVEL_MAXIMO_DE_JUEGO).reaccionMs);
});

test("ganarle da 100 por nivel más hasta la mitad según la vida que te quedó", () => {
    assert.equal(puntosPorVictoria(1, 0), 100);
    assert.equal(puntosPorVictoria(1, 1), 150);
    assert.equal(puntosPorVictoria(3, 0.5), 375);
    assert.equal(puntosPorVictoria(4, 2), 600);
    assert.equal(puntosPorVictoria(4, -1), 400);
});

test("cada clase de la arena tiene su forma de pelear", () => {
    for (const clase of ARENA_CLASSES) {
        assert.ok(["lanzador", "cuerpoACuerpo", "distancia"].includes(estiloDeClase(clase.idClase)), clase.nombre);
    }
    assert.equal(estiloDeClase(1), "lanzador");
    assert.equal(estiloDeClase(3), "cuerpoACuerpo");
    assert.equal(estiloDeClase(20), "distancia");
    assert.deepEqual(distanciaDeseada("cuerpoACuerpo", "lanzador"), { min: 1, max: 1 });
    // Fuera del alcance de un golpe y dentro de lo que ve el cliente (10 baldosas).
    const kite = distanciaDeseada("lanzador", "cuerpoACuerpo");
    assert.ok(kite.min >= 2 && kite.max <= 9);
});

test("el bot rodea las paredes para llegar al lado del rival", () => {
    // Pared vertical en x = 5 con un hueco en y = 9: para ir de (2,2) al lado de (8,2) hay que pasar por el hueco.
    const caminable = (x: number, y: number) => x >= 1 && y >= 1 && x <= 10 && y <= 10 && (x !== 5 || y === 9) && !(x === 8 && y === 2);
    const rival = { x: 8, y: 2 };
    // El mismo puntaje que usa el bot cuerpo a cuerpo (pensarMovimiento).
    const puntaje = (pos: { x: number; y: number }, pasos: number) =>
        (Math.abs(pos.x - rival.x) + Math.abs(pos.y - rival.y) === 1
            ? 0
            : 1000 + Math.max(Math.abs(pos.x - rival.x), Math.abs(pos.y - rival.y)) * 10) + pasos;

    let pos = { x: 2, y: 2 };
    for (let i = 0; i < 30; i++) {
        const paso = primerPaso(pos, caminable, puntaje);
        if (!paso) break;
        pos = { x: pos.x + (paso.heading === 3 ? 1 : paso.heading === 4 ? -1 : 0), y: pos.y + (paso.heading === 2 ? 1 : paso.heading === 1 ? -1 : 0) };
        assert.ok(caminable(pos.x, pos.y), `pisó una pared en ${pos.x},${pos.y}`);
    }
    assert.equal(Math.abs(pos.x - rival.x) + Math.abs(pos.y - rival.y), 1);
});

test("si ya está en el mejor lugar no se mueve", () => {
    assert.equal(primerPaso({ x: 3, y: 3 }, () => true, (pos) => (pos.x === 3 && pos.y === 3 ? 0 : 5)), null);
});
