export {};
const vars = require("./vars");
const { loadDefaultObjectsData } = require("./objectData");

class LoadObjs {
    constructor() {}

    async initialize() {
        await this.load();

        console.log("Objs Cargados.");
    }

    load() {
        vars.datObj = loadDefaultObjectsData();
        vars.gameDataVersions.objs = 0;

        console.log(`[GAME DATA] Objs cargados desde fuente configurada: ${Object.keys(vars.datObj).length}.`);

        return Promise.resolve(true);
    }
}

module.exports = LoadObjs;
