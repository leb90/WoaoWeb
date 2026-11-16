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
