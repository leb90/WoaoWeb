export {};

const vars = require("./vars");
const config = require("./config");
const { loadDefaultCraftingRecipesData } = require("./craftingRecipeData");
const { initializeCraftingRecipesFromApi } = require("./gameDataSync");

class LoadCraftingRecipes {
    async initialize() {
        await this.load();
        console.log("Recetas de crafting cargadas.");
    }

    async load() {
        vars.craftingRecipes = loadDefaultCraftingRecipesData();
        vars.gameDataVersions.craftingRecipes = 0;

        if (config.gameDataSource !== "api" && config.gameDataSource !== "db") {
            console.log(`[GAME DATA] Crafting cargado desde archivos locales: ${vars.craftingRecipes.length}.`);
            return;
        }

        const result = await initializeCraftingRecipesFromApi();
        console.log(
            `[GAME DATA] Crafting hidratado desde DB: ${result.loadedRecipes}. Version aplicada: ${result.currentVersion}.`,
        );
    }
}

module.exports = LoadCraftingRecipes;
