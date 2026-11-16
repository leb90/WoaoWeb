import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

// Correcciones de la lista de bugs de la beta (equipo, gráficos y tiempos de combate).
const root = path.resolve(__dirname, "../..");

function readJson(relativePath: string) {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const objs = readJson("server/jsons/objs.json") as Record<string, { name: string; objType: number; subtipo?: number; anim?: number }>;
const cascos = readJson("frontend/public/init/cascos.json") as Record<string, unknown>;
const escudos = readJson("frontend/public/init/escudos.json") as Record<string, unknown>;

function isHelmet(obj: { objType: number; subtipo?: number }) {
    return Number(obj.objType) === 17 || (Number(obj.objType) === 3 && Number(obj.subtipo) === 1);
}

function isShield(obj: { objType: number; subtipo?: number }) {
    return Number(obj.objType) === 16 || (Number(obj.objType) === 3 && Number(obj.subtipo) === 2);
}

test("los sombreros de mago y los cascos clásicos tienen un gráfico que el cliente sabe dibujar", () => {
    assert.equal(objs["833"].name, "Sombrero Mago (+2 Agilidad)");
    assert.equal(objs["833"].anim, 25);

    // Quedan afuera los cascos nuevos que todavía no tienen gráfico propio (Newbie y Hunters).
    const withoutGraphic = Object.entries(objs)
        .filter(([, obj]) => obj && isHelmet(obj) && !cascos[String(obj.anim)])
        .map(([id, obj]) => `${id} ${obj.name}`);

    assert.deepEqual(withoutGraphic, [
        "1051 Casco Simple (Newbie)",
        "1728 Casco Hunters (2-6)",
        "1729 Casco Hunters Superior (6-12)",
    ]);
});

test("los escudos clásicos tienen un gráfico que el cliente sabe dibujar", () => {
    assert.equal(objs["128"].name, "Escudo de hierro (1-6)");
    assert.ok(escudos[String(objs["128"].anim)], "Escudo de hierro");

    const fixedShields = Object.values(objs).filter((obj) => obj && isShield(obj) && escudos[String(obj.anim)]);
    assert.ok(fixedShields.length >= 60, `escudos con gráfico: ${fixedShields.length}`);
});

test("el servidor y la API comparten los mismos objetos", () => {
    const server = fs.readFileSync(path.join(root, "server/jsons/objs.json"), "utf8");
    const api = fs.readFileSync(path.join(root, "api/src/jsons/objs.json"), "utf8");
    assert.equal(server, api);
});

test("la regla de ropa para altos o bajos solo aplica a la armadura del cuerpo", () => {
    const itemKinds = require("./itemKinds");
    const findId = (name: string) => Object.keys(objs).find((id) => objs[id]?.name === name)!;

    const shieldId = findId("Escudo de hierro (1-6)");
    const verdugoArmorId = findId("Armadura del Verdugo");
    const verdugoShieldId = findId("Escudo del Verdugo");
    const helmetId = findId("Sombrero Mago (+2 Agilidad)");
    const classicArmorId = findId("Coraza (Bajo/as)");

    assert.equal(itemKinds.isRaceSizedBodyArmor(objs[shieldId], Number(shieldId)), false, "escudo");
    assert.equal(itemKinds.isRaceSizedBodyArmor(objs[verdugoShieldId], Number(verdugoShieldId)), false, "escudo del set");
    assert.equal(itemKinds.isRaceSizedBodyArmor(objs[verdugoArmorId], Number(verdugoArmorId)), false, "armadura del set");
    assert.equal(itemKinds.isRaceSizedBodyArmor(objs[helmetId], Number(helmetId)), false, "sombrero");
    assert.equal(itemKinds.isRaceSizedBodyArmor(objs[classicArmorId], Number(classicArmorId)), true, "armadura clásica");
});

test("pegar y lanzar hechizos no se frenan entre sí aunque el panel tenga otro valor", () => {
    const runtimeTiming = require("./runtimeTiming");
    const timing = runtimeTiming.applyRuntimeTimingConfig({
        actionCooldowns: { meleeToSpellMs: 900, spellToMeleeMs: 700 },
    });

    assert.equal(timing.actionCooldowns.meleeToSpellMs, 0);
    assert.equal(timing.actionCooldowns.spellToMeleeMs, 0);
    assert.ok(timing.actionCooldowns.meleeMs > 0, "el intervalo entre golpes sigue");
    assert.ok(timing.actionCooldowns.spellMs > 0, "el intervalo entre hechizos sigue");
});
