// Consola del personaje que un GM mira desde /online (gmSpectateFeed.ts): solo se guarda mientras alguien mira, cada
// GM recibe lo nuevo desde su última lectura y los diálogos quedan para los globos.
//   npx tsx --test src/gmSpectateFeed.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import {
    feedLinesSince,
    isFeedWatched,
    lastFeedSeq,
    recentSpeech,
    recordFeedLine,
    unwatchFeed,
    watchFeed,
} from "./gmSpectateFeed";

test("sin nadie mirando no se guarda nada", () => {
    recordFeedLine("sin-mirar", "Le pegaste al lobo", "white");
    assert.equal(isFeedWatched("sin-mirar"), false);
    assert.deepEqual(feedLinesSince("sin-mirar", 0), []);
});

test("cada GM lee lo nuevo desde su última lectura, sin robarle líneas a otro", () => {
    watchFeed("objetivo");
    watchFeed("objetivo");
    const inicio = lastFeedSeq("objetivo");
    recordFeedLine("objetivo", "Primera", "red");
    recordFeedLine("objetivo", "  ", "red");
    recordFeedLine("objetivo", "Segunda", "");

    const primerGm = feedLinesSince("objetivo", inicio);
    assert.deepEqual(
        primerGm.map((line) => [line.text, line.color]),
        [
            ["Primera", "red"],
            ["Segunda", "white"],
        ],
    );
    assert.equal(feedLinesSince("objetivo", inicio).length, 2, "el segundo GM también las ve");
    assert.deepEqual(feedLinesSince("objetivo", lastFeedSeq("objetivo")), []);

    unwatchFeed("objetivo");
    assert.equal(isFeedWatched("objetivo"), true, "sigue mirando el otro GM");
    unwatchFeed("objetivo");
    assert.equal(isFeedWatched("objetivo"), false);
    assert.deepEqual(feedLinesSince("objetivo", 0), []);
});

test("guarda solo las últimas 60 líneas", () => {
    watchFeed("charlatan");
    for (let index = 1; index <= 75; index++) {
        recordFeedLine("charlatan", `Línea ${index}`, "white");
    }
    const lines = feedLinesSince("charlatan", 0);
    assert.equal(lines.length, 60);
    assert.equal(lines[0].text, "Línea 16");
    assert.equal(lines[59].text, "Línea 75");
    unwatchFeed("charlatan");
});

test("los diálogos guardan quién habló y qué dijo, para el globo", () => {
    watchFeed("oyente");
    recordFeedLine("oyente", "Lobo te mordió", "red");
    recordFeedLine("oyente", "Pepe: hola", "white", { id: 42, text: " hola " });
    const speech = recentSpeech("oyente", Date.now() - 1000);
    assert.equal(speech.length, 1);
    assert.equal(speech[0].speakerId, "42");
    assert.equal(speech[0].speech, "hola");
    assert.equal(speech[0].text, "Pepe: hola");
    assert.deepEqual(recentSpeech("oyente", Date.now() + 1000), []);
    unwatchFeed("oyente");
});
