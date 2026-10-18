import assert from "node:assert/strict";
import { resolveMapPool } from "./mountEggDrops";

const vars = require("./vars");

type TestTile = {
    blocked?: number;
    graphics?: Record<number, number>;
    tileExit?: { map: number; x: number; y: number };
};

function mapWithTiles(tiles: Array<{ x: number; y: number; tile: TestTile }>) {
    const map: Record<number, Record<number, TestTile>> = {};

    for (const { x, y, tile } of tiles) {
        map[y] ??= {};
        map[y][x] = tile;
    }

    return map;
}

function dryTile(): TestTile {
    return { graphics: { 1: 1 } };
}

function edgeExit(map: number): TestTile {
    return { graphics: { 1: 1 }, tileExit: { map, x: 10, y: 50 } };
}

function run() {
    const originalMaps = vars.mapa;
    const originalMapData = vars.mapData;

    try {
        vars.mapa = {
            2: mapWithTiles([
                { x: 50, y: 50, tile: dryTile() },
                { x: 90, y: 50, tile: edgeExit(3) },
                { x: 90, y: 51, tile: edgeExit(4) },
                { x: 90, y: 52, tile: edgeExit(5) },
                { x: 90, y: 53, tile: edgeExit(6) },
                { x: 90, y: 54, tile: edgeExit(7) },
                { x: 50, y: 51, tile: { ...dryTile(), tileExit: { map: 8, x: 50, y: 50 } } },
            ]),
            3: mapWithTiles([{ x: 50, y: 50, tile: dryTile() }]),
            4: mapWithTiles([{ x: 50, y: 50, tile: dryTile() }]),
            5: mapWithTiles([{ x: 50, y: 50, tile: dryTile() }]),
            6: mapWithTiles([{ x: 50, y: 50, tile: { graphics: { 1: 1505 } } }]),
            7: mapWithTiles([{ x: 50, y: 50, tile: dryTile() }]),
            8: mapWithTiles([{ x: 50, y: 50, tile: dryTile() }]),
            34: mapWithTiles([
                { x: 50, y: 50, tile: dryTile() },
                { x: 90, y: 50, tile: edgeExit(2) },
            ]),
        };
        vars.mapData = {
            2: { terreno: "BOSQUE", zona: "BOSQUE" },
            3: { terreno: "DUNGEON", zona: "DUNGEON" },
            4: { terreno: "BOSQUE", zona: "BOSQUE" },
            5: { terreno: "ISLA", zona: "ISLA" },
            6: { terreno: "BOSQUE", zona: "BOSQUE" },
            7: { terreno: "BOSQUE", zona: "BOSQUE" },
            8: { terreno: "BOSQUE", zona: "BOSQUE" },
            34: { terreno: "CIUDAD", zona: "CIUDAD" },
        };

        const maps = resolveMapPool("test-continent", {
            rootMap: 34,
            excludedMapIds: [4],
            excludedTags: ["DUNGEON", "ISLA", "MAR", "EVENTO"],
        });

        assert.deepEqual(maps, [2, 7]);
    } finally {
        vars.mapa = originalMaps;
        vars.mapData = originalMapData;
    }
}

run();
console.log("Mount egg map pool tests passed.");
