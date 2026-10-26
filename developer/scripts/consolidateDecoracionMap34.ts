/**
 * Consolida en mapa_34 las decoraciones que quedaron pintadas como stamp
 * multi-tile, dejando solo el GRH ancla (ya convertido a tamaño real).
 *
 * Uso (desde developer/):
 *   npx --yes tsx scripts/consolidateDecoracionMap34.ts
 */
import { loadMapEditorState, saveMapEditorState } from "../lib/maps/io";

/** Dimensiones originales (pre-migracion) tomadas del log de conversion. */
const ORIGINAL_STAMPS: Array<{ grhIndice: number; ancho: number; alto: number }> = [
  { grhIndice: 40631, ancho: 3, alto: 4 },
  { grhIndice: 40643, ancho: 4, alto: 5 },
  { grhIndice: 40663, ancho: 3, alto: 5 },
  { grhIndice: 40678, ancho: 3, alto: 7 },
  { grhIndice: 40699, ancho: 3, alto: 2 },
  { grhIndice: 40705, ancho: 3, alto: 6 },
  { grhIndice: 40723, ancho: 4, alto: 8 },
  { grhIndice: 40755, ancho: 3, alto: 7 },
  { grhIndice: 40776, ancho: 4, alto: 3 },
  { grhIndice: 40788, ancho: 3, alto: 4 },
  { grhIndice: 40800, ancho: 3, alto: 5 },
  { grhIndice: 40815, ancho: 4, alto: 4 },
  { grhIndice: 40831, ancho: 3, alto: 5 },
  { grhIndice: 40846, ancho: 4, alto: 4 },
  { grhIndice: 40862, ancho: 2, alto: 4 },
  { grhIndice: 40870, ancho: 3, alto: 3 },
  { grhIndice: 40879, ancho: 5, alto: 6 },
  { grhIndice: 40909, ancho: 3, alto: 4 },
  { grhIndice: 40921, ancho: 7, alto: 4 },
  { grhIndice: 40949, ancho: 4, alto: 4 },
  { grhIndice: 40965, ancho: 9, alto: 5 },
  { grhIndice: 41010, ancho: 2, alto: 3 },
  { grhIndice: 41016, ancho: 3, alto: 6 },
  { grhIndice: 41034, ancho: 4, alto: 3 },
  { grhIndice: 41046, ancho: 2, alto: 3 },
  { grhIndice: 41052, ancho: 2, alto: 3 },
  { grhIndice: 41058, ancho: 4, alto: 14 },
  { grhIndice: 41114, ancho: 3, alto: 7 },
  { grhIndice: 41135, ancho: 4, alto: 3 },
  { grhIndice: 41147, ancho: 3, alto: 3 },
  { grhIndice: 41156, ancho: 6, alto: 3 },
  { grhIndice: 41174, ancho: 3, alto: 4 },
  { grhIndice: 41186, ancho: 2, alto: 4 },
  { grhIndice: 41194, ancho: 2, alto: 3 },
  { grhIndice: 41200, ancho: 2, alto: 4 },
  { grhIndice: 41208, ancho: 2, alto: 5 },
  { grhIndice: 41218, ancho: 3, alto: 5 },
  { grhIndice: 41233, ancho: 2, alto: 6 },
  { grhIndice: 41245, ancho: 8, alto: 4 },
  { grhIndice: 41277, ancho: 2, alto: 4 },
  { grhIndice: 41285, ancho: 4, alto: 4 },
  { grhIndice: 41301, ancho: 3, alto: 4 },
  { grhIndice: 41313, ancho: 3, alto: 6 },
  { grhIndice: 41331, ancho: 2, alto: 4 },
  { grhIndice: 41339, ancho: 4, alto: 6 },
  { grhIndice: 41363, ancho: 3, alto: 5 },
  { grhIndice: 41378, ancho: 8, alto: 6 },
  { grhIndice: 41426, ancho: 4, alto: 5 },
  { grhIndice: 41446, ancho: 3, alto: 5 },
  { grhIndice: 41461, ancho: 5, alto: 4 },
  { grhIndice: 41481, ancho: 4, alto: 4 },
  { grhIndice: 41497, ancho: 3, alto: 4 },
  { grhIndice: 41509, ancho: 3, alto: 5 },
  { grhIndice: 41524, ancho: 3, alto: 3 },
  { grhIndice: 41533, ancho: 6, alto: 4 },
  { grhIndice: 41557, ancho: 3, alto: 4 },
  { grhIndice: 41569, ancho: 3, alto: 4 },
  { grhIndice: 41581, ancho: 3, alto: 5 },
  { grhIndice: 41596, ancho: 3, alto: 4 },
  { grhIndice: 41608, ancho: 3, alto: 4 },
  { grhIndice: 41620, ancho: 6, alto: 2 },
  { grhIndice: 41632, ancho: 4, alto: 4 },
  { grhIndice: 41648, ancho: 4, alto: 8 },
  { grhIndice: 41680, ancho: 5, alto: 5 },
  { grhIndice: 41705, ancho: 4, alto: 5 },
  { grhIndice: 41725, ancho: 1, alto: 4 },
  { grhIndice: 41729, ancho: 3, alto: 5 },
  { grhIndice: 41744, ancho: 4, alto: 5 },
  { grhIndice: 41764, ancho: 3, alto: 4 },
  { grhIndice: 41776, ancho: 5, alto: 5 },
  { grhIndice: 41801, ancho: 3, alto: 4 },
  { grhIndice: 41813, ancho: 3, alto: 3 },
  { grhIndice: 41822, ancho: 4, alto: 5 },
  { grhIndice: 41842, ancho: 2, alto: 2 },
  { grhIndice: 41846, ancho: 2, alto: 3 },
  { grhIndice: 41852, ancho: 5, alto: 4 },
  { grhIndice: 41872, ancho: 3, alto: 3 },
  { grhIndice: 41881, ancho: 2, alto: 5 },
  { grhIndice: 41891, ancho: 2, alto: 4 },
  { grhIndice: 41899, ancho: 2, alto: 6 },
  { grhIndice: 41911, ancho: 4, alto: 6 },
  { grhIndice: 41935, ancho: 3, alto: 5 },
  { grhIndice: 41950, ancho: 2, alto: 5 },
  { grhIndice: 41960, ancho: 4, alto: 5 },
  { grhIndice: 41980, ancho: 3, alto: 4 },
  { grhIndice: 41992, ancho: 2, alto: 3 },
  { grhIndice: 41998, ancho: 3, alto: 4 },
  { grhIndice: 42010, ancho: 3, alto: 4 },
  { grhIndice: 42022, ancho: 6, alto: 4 },
];

function main() {
  const state = loadMapEditorState(34);
  let changes = 0;
  for (const stamp of ORIGINAL_STAMPS) {
    const tileCount = stamp.ancho * stamp.alto;
    if (tileCount <= 1) continue;
    for (let layerIndex = 0; layerIndex < 4; layerIndex += 1) {
      const origins = new Set<string>();
      for (let y = 0; y < state.height; y += 1) {
        for (let x = 0; x < state.width; x += 1) {
          const grh = state.tiles[y]![x]!.layers[layerIndex];
          if (grh < stamp.grhIndice || grh >= stamp.grhIndice + tileCount) continue;
          const offset = grh - stamp.grhIndice;
          const dx = offset % stamp.ancho;
          const dy = Math.floor(offset / stamp.ancho);
          origins.add(`${x - dx},${y - dy}`);
        }
      }
      if (origins.size === 0) continue;
      console.log(
        `GRH ${stamp.grhIndice} capa${layerIndex + 1}: ${origins.size} origen(es)`,
      );
      for (const key of origins) {
        const [ox, oy] = key.split(",").map(Number);
        for (let dy = 0; dy < stamp.alto; dy += 1) {
          for (let dx = 0; dx < stamp.ancho; dx += 1) {
            const x = ox! + dx;
            const y = oy! + dy;
            if (x < 0 || y < 0 || x >= state.width || y >= state.height) continue;
            const tile = state.tiles[y]![x]!;
            const expected = stamp.grhIndice + dy * stamp.ancho + dx;
            if (tile.layers[layerIndex] !== expected) continue;
            if (dx === 0 && dy === 0) continue;
            tile.layers[layerIndex] = 0;
            changes += 1;
          }
        }
        if (ox! >= 0 && oy! >= 0 && ox! < state.width && oy! < state.height) {
          const anchor = state.tiles[oy!]![ox!]!;
          if (anchor.layers[layerIndex] !== stamp.grhIndice) {
            anchor.layers[layerIndex] = stamp.grhIndice;
            changes += 1;
          }
        }
      }
    }
  }

  if (changes === 0) {
    console.log("Sin cambios en mapa_34.");
    return;
  }

  saveMapEditorState(state, {
    adminId: "migration",
    username: "migration",
    exp: Date.now() + 60_000,
  });
  console.log(`mapa_34 guardado: ${changes} celdas ajustadas.`);
}

main();
