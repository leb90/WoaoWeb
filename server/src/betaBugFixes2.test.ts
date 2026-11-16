import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

// Segunda lista de bugs de la beta: crafteo con madera y navegación con barca.
const root = path.resolve(__dirname, "../..");
const WOOD_ITEM_ID = 58; // Leña (la que se tala)
const MADERA_ITEM_ID = 1709; // Madera (la que dejan los Treants y las misiones)

type Recipe = { id: number; profession: string; materials: Array<{ itemId: number; amount: number }> };

function readRecipes(relativePath: string): Recipe[] {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

test("las recetas piden Madera y no Leña", () => {
    const recipes = readRecipes("server/jsons/craftingRecipes.json");
    const usingWood = recipes.filter((recipe) => recipe.materials.some((m) => m.itemId === WOOD_ITEM_ID));
    const usingMadera = recipes.filter((recipe) => recipe.materials.some((m) => m.itemId === MADERA_ITEM_ID));

    assert.deepEqual(
        usingWood.map((recipe) => recipe.id),
        [],
    );
    assert.equal(usingMadera.length, 24);
    // La Barca sigue pidiendo la misma cantidad, ahora de Madera.
    const barca = recipes.find((recipe) => recipe.id === 9);
    assert.deepEqual(barca?.materials, [{ itemId: MADERA_ITEM_ID, amount: 10000 }]);
});

test("el servidor y la API comparten las mismas recetas", () => {
    const server = fs.readFileSync(path.join(root, "server/jsons/craftingRecipes.json"), "utf8");
    const api = fs.readFileSync(path.join(root, "api/src/jsons/craftingRecipes.json"), "utf8");
    assert.equal(server, api);
});

test("en la beta viajar a ciudades y dungeons es gratis", () => {
    const fastTravel = require("./fastTravel");
    assert.equal(fastTravel.BETA_FREE_TRAVEL, true);
});

test("sin guerra en curso, quien entra en un mapa de guerra va a Nix", () => {
    const factionWars = require("./factionWars");
    for (const map of [203, 204]) {
        const user = { id: "x", map, pos: { x: 45, y: 88 }, posX: 45, posY: 88, guerra: true };
        const message = factionWars.relocateFromWarMapIfNeeded(user);
        assert.match(message, /Nix/);
        assert.deepEqual([user.map, user.posX, user.posY, user.guerra], [34, 50, 50, false]);
    }

    const elsewhere = { id: "y", map: 1, pos: { x: 50, y: 50 }, posX: 50, posY: 50 };
    assert.equal(factionWars.relocateFromWarMapIfNeeded(elsewhere), "");
    assert.equal(elsewhere.map, 1);
});

test("el rey de la guerra solo se ataca estando en la guerra", () => {
    const factionWars = require("./factionWars");
    const user = { id: "z", map: 204 };
    assert.match(factionWars.getKingAttackDeniedMessage(user, { factionWarKing: true }), /participantes/);
    assert.equal(factionWars.getKingAttackDeniedMessage(user, { factionWarKing: false }), "");
    // El rey no reaparece aunque muera fuera de una guerra.
    assert.equal(factionWars.onKingRuntimeDeath({ id: 1, factionWarKing: true }), true);
    assert.equal(factionWars.onKingRuntimeDeath({ id: 2 }), false);
});

test("la Barca pide 40 de navegación; Galera y Galeón siguen igual", () => {
    const vars = require("./vars");
    const workProfessions = require("./workProfessions");
    const objs = JSON.parse(fs.readFileSync(path.join(root, "server/jsons/objs.json"), "utf8"));
    const barca = Number(objs["474"].minSkill);
    const galera = Number(objs["475"].minSkill);
    const galeon = Number(objs["476"].minSkill);

    assert.equal(workProfessions.getRequiredNavegacionSkill(barca, vars.clases.bardo), 40);
    assert.equal(workProfessions.getRequiredNavegacionSkill(barca, vars.clases.guerrero), 40);
    assert.equal(workProfessions.getRequiredNavegacionSkill(barca, vars.clases.pirata), 20);
    assert.equal(workProfessions.getRequiredNavegacionSkill(barca, vars.clases.pescador), 24);
    assert.equal(workProfessions.getRequiredNavegacionSkill(galera, vars.clases.bardo), 69);
    assert.equal(workProfessions.getRequiredNavegacionSkill(galeon, vars.clases.bardo), 92);
});
