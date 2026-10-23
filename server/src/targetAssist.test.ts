// Apuntado asistido (targetAssist.ts).
//   npx tsx --test src/targetAssist.test.ts
import assert from "node:assert/strict";
import test from "node:test";

const vars = require("./vars");
const targetAssist = require("./targetAssist");

const MAGE = vars.clases.mago;
const WARRIOR = vars.clases.guerrero;

function makeTarget(id: number, x: number, y: number, extra: Record<string, unknown> = {}) {
    const target: Record<string, any> = { id, map: 1, pos: { x, y }, hp: 300, ...extra };
    vars.personajes[String(id)] = target;
    return target;
}

test("acepta al que está en la baldosa o la dejó dentro de la ventana", () => {
    const now = 1_000_000;
    const target = makeTarget(9001, 50, 50);
    assert.ok(targetAssist.resolveAssistedTarget({ map: 1, idClase: WARRIOR }, 9001, 1, 50, 50, now));

    // Da un paso: la baldosa vieja vale 600 ms para el resto y 300 ms para el mago.
    targetAssist.recordTileLeft(target, 1, 50, 50, now);
    target.pos = { x: 51, y: 50 };
    assert.ok(targetAssist.resolveAssistedTarget({ map: 1, idClase: WARRIOR }, 9001, 1, 50, 50, now + 550));
    assert.equal(targetAssist.resolveAssistedTarget({ map: 1, idClase: WARRIOR }, 9001, 1, 50, 50, now + 650), undefined);
    assert.ok(targetAssist.resolveAssistedTarget({ map: 1, idClase: MAGE }, 9001, 1, 50, 50, now + 250));
    assert.equal(targetAssist.resolveAssistedTarget({ map: 1, idClase: MAGE }, 9001, 1, 50, 50, now + 350), undefined);
});

test("guarda las últimas baldosas aunque haya caminado varias", () => {
    const now = 2_000_000;
    const target = makeTarget(9002, 10, 10);
    for (let step = 0; step < 3; step++) {
        targetAssist.recordTileLeft(target, 1, 10 + step, 10, now + step * 200);
        target.pos = { x: 11 + step, y: 10 };
    }
    // Pasó por 10,10 hace 500 ms (ahora está en 13,10): todavía vale para el guerrero.
    assert.ok(targetAssist.resolveAssistedTarget({ map: 1, idClase: WARRIOR }, 9002, 1, 10, 10, now + 500));
    // Nunca estuvo en 20,20.
    assert.equal(targetAssist.resolveAssistedTarget({ map: 1, idClase: WARRIOR }, 9002, 1, 20, 20, now + 500), undefined);
});

test("no asiste contra invisibles, ocultos ni muertos", () => {
    const now = 3_000_000;
    makeTarget(9003, 5, 5, { invisibleSpell: true });
    makeTarget(9004, 6, 6, { hiddenSkill: true });
    makeTarget(9005, 7, 7, { hp: 0 });
    for (const [id, x] of [[9003, 5], [9004, 6], [9005, 7]]) {
        assert.equal(targetAssist.resolveAssistedTarget({ map: 1, idClase: WARRIOR }, id, 1, x, x, now), undefined);
    }
    assert.equal(targetAssist.resolveAssistedTarget({ map: 1, idClase: WARRIOR }, 0, 1, 5, 5, now), undefined);
});
