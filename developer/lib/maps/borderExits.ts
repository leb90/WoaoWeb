import type { EditorMapState, TileExitDestination } from "./types";
import { tileKey } from "./types";

/**
 * Classic Argentum / WorldEditor border warp rows for 100×100 maps.
 * Matches existing mapas_source conventions (e.g. mapa_1).
 */
export const AO_BORDER = {
  /** Local Y of northern exit row */
  northY: 10,
  /** Destination Y when walking north into another map */
  northDestY: 90,
  southY: 91,
  southDestY: 11,
  westX: 13,
  westDestX: 87,
  eastX: 88,
  eastDestX: 14,
  /** Inclusive X range for N/S strips */
  xMin: 12,
  xMax: 88,
  /** Inclusive Y range for E/W strips */
  yMin: 11,
  yMax: 90,
} as const;

export type BorderMapsForm = {
  north: number | null;
  south: number | null;
  east: number | null;
  west: number | null;
  /** If true, remove previous exits on those border rows/cols first */
  replaceExisting: boolean;
};

export type BorderExitPlan = {
  key: string;
  dest: TileExitDestination;
  edge: "north" | "south" | "east" | "west";
};

export function planBorderExits(
  width: number,
  height: number,
  form: BorderMapsForm,
): BorderExitPlan[] {
  const b = AO_BORDER;
  const xMin = Math.max(1, Math.min(width, b.xMin));
  const xMax = Math.max(1, Math.min(width, b.xMax));
  const yMin = Math.max(1, Math.min(height, b.yMin));
  const yMax = Math.max(1, Math.min(height, b.yMax));
  const northY = Math.max(1, Math.min(height, b.northY));
  const southY = Math.max(1, Math.min(height, b.southY));
  const westX = Math.max(1, Math.min(width, b.westX));
  const eastX = Math.max(1, Math.min(width, b.eastX));

  const out: BorderExitPlan[] = [];

  if (form.north && form.north > 0) {
    for (let x = xMin; x <= xMax; x++) {
      out.push({
        key: tileKey(x, northY),
        dest: { map: form.north, x, y: b.northDestY },
        edge: "north",
      });
    }
  }
  if (form.south && form.south > 0) {
    for (let x = xMin; x <= xMax; x++) {
      out.push({
        key: tileKey(x, southY),
        dest: { map: form.south, x, y: b.southDestY },
        edge: "south",
      });
    }
  }
  if (form.west && form.west > 0) {
    for (let y = yMin; y <= yMax; y++) {
      out.push({
        key: tileKey(westX, y),
        dest: { map: form.west, x: b.westDestX, y },
        edge: "west",
      });
    }
  }
  if (form.east && form.east > 0) {
    for (let y = yMin; y <= yMax; y++) {
      out.push({
        key: tileKey(eastX, y),
        dest: { map: form.east, x: b.eastDestX, y },
        edge: "east",
      });
    }
  }

  return out;
}

export function applyBorderExits(
  state: EditorMapState,
  form: BorderMapsForm,
): { state: EditorMapState; placed: number; cleared: number } {
  const plan = planBorderExits(state.width, state.height, form);
  const next: EditorMapState = {
    ...state,
    specials: {
      ...state.specials,
      exits: { ...state.specials.exits },
    },
  };

  let cleared = 0;
  if (form.replaceExisting) {
    const borderKeys = new Set(
      planBorderExits(state.width, state.height, {
        north: 1,
        south: 1,
        east: 1,
        west: 1,
        replaceExisting: false,
      }).map((p) => p.key),
    );
    for (const key of Object.keys(next.specials.exits)) {
      if (borderKeys.has(key)) {
        delete next.specials.exits[key];
        cleared++;
      }
    }
  }

  for (const p of plan) {
    next.specials.exits[p.key] = { ...p.dest };
  }

  return { state: next, placed: plan.length, cleared };
}
