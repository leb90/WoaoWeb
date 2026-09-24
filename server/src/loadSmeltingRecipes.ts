export {};

const vars = require("./vars");
const config = require("./config");
const { loadDefaultSmeltingRecipesData } = require("./smeltingRecipeData");
const { initializeSmeltingRecipesFromApi } = require("./gameDataSync");

class LoadSmeltingRecipes {
    async initialize() {
        await this.load();
        console.log("Recetas de fundicion cargadas.");
    }

    async load() {
        vars.smeltingRecipes = loadDefaultSmeltingRecipesData();
        vars.gameDataVersions.smeltingRecipes = 0;

        if (config.gameDataSource !== "api" && config.gameDataSource !== "db") {
            console.log(`[GAME DATA] Fundicion cargada desde archivos locales: ${vars.smeltingRecipes.length}.`);
            return;
        }

        const result = await initializeSmeltingRecipesFromApi();
        console.log(
            `[GAME DATA] Fundicion hidratada desde DB: ${result.loadedRecipes}. Version aplicada: ${result.currentVersion}.`,
        );
    }
}

module.exports = LoadSmeltingRecipes;
