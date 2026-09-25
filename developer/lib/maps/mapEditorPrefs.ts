import type { MapTool, MapViewMode } from "./types";

const KEY = "woao.dev.mapEditor.prefs.v1";

export type OverlayPrefs = {
  blocked: boolean;
  triggers: boolean;
  npcs: boolean;
  objects: boolean;
  exits: boolean;
  spawns: boolean;
  especiales: boolean;
  grid: boolean;
  coordinates: boolean;
  grhIds: boolean;
};

export type LayerPrefs = {
  visible: [boolean, boolean, boolean, boolean];
  locked: [boolean, boolean, boolean, boolean];
  opacity: [number, number, number, number];
};

export type MapEditorPrefs = {
  zoom: number;
  view: MapViewMode;
  tool: MapTool;
  activeLayer: 0 | 1 | 2 | 3;
  overlays: OverlayPrefs;
  layers: LayerPrefs;
  leftWidth: number;
  rightWidth: number;
  showMinimap: boolean;
  collapsed: {
    tools: boolean;
    layers: boolean;
    overlays: boolean;
    triggers: boolean;
  };
  triggerVisibility: Record<string, boolean>;
};

export const DEFAULT_PREFS: MapEditorPrefs = {
  zoom: 1,
  view: "normal",
  tool: "brush",
  activeLayer: 0,
  overlays: {
    blocked: true,
    triggers: true,
    npcs: true,
    objects: true,
    exits: true,
    spawns: false,
    especiales: false,
    grid: true,
    coordinates: false,
    grhIds: false,
  },
  layers: {
    visible: [true, true, true, true],
    locked: [false, false, false, false],
    opacity: [1, 1, 1, 1],
  },
  leftWidth: 220,
  rightWidth: 300,
  showMinimap: true,
  collapsed: {
    tools: false,
    layers: false,
    overlays: false,
    triggers: false,
  },
  triggerVisibility: {
    "1": true,
    "2": true,
    "3": true,
    "4": true,
    "5": true,
    "6": true,
  },
};

export function loadMapEditorPrefs(): MapEditorPrefs {
  if (typeof window === "undefined") return structuredClone(DEFAULT_PREFS);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_PREFS);
    const parsed = JSON.parse(raw) as Partial<MapEditorPrefs>;
    return {
      ...structuredClone(DEFAULT_PREFS),
      ...parsed,
      overlays: { ...DEFAULT_PREFS.overlays, ...parsed.overlays },
      layers: {
        visible: parsed.layers?.visible ?? DEFAULT_PREFS.layers.visible,
        locked: parsed.layers?.locked ?? DEFAULT_PREFS.layers.locked,
        opacity: parsed.layers?.opacity ?? DEFAULT_PREFS.layers.opacity,
      },
      collapsed: { ...DEFAULT_PREFS.collapsed, ...parsed.collapsed },
      triggerVisibility: {
        ...DEFAULT_PREFS.triggerVisibility,
        ...parsed.triggerVisibility,
      },
    };
  } catch {
    return structuredClone(DEFAULT_PREFS);
  }
}

export function saveMapEditorPrefs(prefs: MapEditorPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota */
  }
}
