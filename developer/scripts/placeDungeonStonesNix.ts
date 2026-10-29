/**
 * Coloca en Nix (mapa 34) todas las piedras de invocación de mazmorras,
 * junto al punto de regreso compartido (50,52).
 *
 * Uso (desde developer/):
 *   npx --yes tsx scripts/placeDungeonStonesNix.ts
 */
import fs from "node:fs";
import path from "node:path";
import { loadMapEditorState, saveMapEditorState } from "../lib/maps/io";
import { tileKey } from "../lib/maps/types";
import { PATHS } from "../lib/security/paths";

const MAP_ID = 34;
/** Fila delante del regreso: el jugador sale en 50,52 y ve las estatuas al norte. */
const PLACEMENTS: Array<{ npcIndex: number; x: number; y: number; label: string }> = [
  { npcIndex: 9720, x: 46, y: 50, label: "Mazmorra de prueba" },
  { npcIndex: 9721, x: 48, y: 50, label: "Caverna de las Llaves" },
  { npcIndex: 9722, x: 50, y: 50, label: "Cueva de la Cola" },
  { npcIndex: 9724, x: 52, y: 50, label: "Gruta de la Botella" },
];

function main() {
  const dungeonsPath = path.join(PATHS.serverJsons(), "dungeons.json");
  const dungeons = JSON.parse(fs.readFileSync(dungeonsPath, "utf8")) as Array<{
    id: string;
    nombre: string;
    piedraNpc?: number;
  }>;
  const expected = dungeons
    .map((entry) => entry.piedraNpc)
    .filter((id): id is number => Number.isInteger(id) && id > 0);
  const missing = expected.filter((id) => !PLACEMENTS.some((p) => p.npcIndex === id));
  if (missing.length) {
    throw new Error(`Faltan posiciones para piedras NPC: ${missing.join(", ")}`);
  }

  const state = loadMapEditorState(MAP_ID);
  const stoneIds = new Set(PLACEMENTS.map((p) => p.npcIndex));

  // Quitar piedras viejas de mazmorra si ya estaban en otra celda.
  for (const [key, npcIndex] of Object.entries(state.specials.npcs ?? {})) {
    if (stoneIds.has(npcIndex)) delete state.specials.npcs[key];
  }

  for (const place of PLACEMENTS) {
    const key = tileKey(place.x, place.y);
    const existing = state.specials.npcs[key];
    if (existing && !stoneIds.has(existing)) {
      throw new Error(`La celda ${key} ya tiene el NPC ${existing} (${place.label}).`);
    }
    state.specials.npcs[key] = place.npcIndex;
    console.log(`${place.label}: NPC ${place.npcIndex} en ${place.x},${place.y}`);
  }

  saveMapEditorState(state, {
    adminId: "migration",
    username: "migration",
    exp: Date.now() + 60_000,
  });
  console.log(`Nix (mapa ${MAP_ID}): ${PLACEMENTS.length} piedras de invocación publicadas.`);
}

main();
