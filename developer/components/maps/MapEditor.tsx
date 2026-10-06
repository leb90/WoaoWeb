"use client";

import "@/app/map-editor.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GrhPreview } from "@/components/ui/GrhPreview";
import {
  findCoveringGraphics,
  paintMinimapGraphics,
  renderMapFrame,
  renderMinimap,
  type GrhMeta,
  type NeighborOverlay,
} from "@/lib/maps/mapCanvasRenderer";
import {
  DEFAULT_PREFS,
  loadMapEditorPrefs,
  saveMapEditorPrefs,
  type MapEditorPrefs,
} from "@/lib/maps/mapEditorPrefs";
import { applyBorderExits, AO_BORDER } from "@/lib/maps/borderExits";
import { cloneEditorState, floodFillLayer } from "@/lib/maps/terrain";
import {
  WOAO_TRIGGERS,
  triggerLabel,
} from "@/lib/maps/triggerCatalog";
import type {
  EditorMapState,
  EditorTile,
  IndexReferencia,
  MapTool,
  MapViewMode,
  TileExit,
} from "@/lib/maps/types";
import { TILE_SIZE, expandStampGrhs, tileKey } from "@/lib/maps/types";

type CatalogNpc = {
  id: number;
  name: string;
  idBody?: number;
  idHead?: number;
  bodyGrh?: number;
  headGrh?: number;
  headOffsetX?: number;
  headOffsetY?: number;
};
type CatalogObj = { id: number; name: string; grhIndex: number };
type PlaceMode =
  | "blocked"
  | "npc"
  | "object"
  | "exit"
  | "trigger"
  | "erase-npc"
  | "erase-object"
  | "erase-trigger"
  | null;
type RightTab = "tile" | "palette" | "npcs" | "objects" | "triggers";
type ClipSpecial = {
  npc?: number;
  object?: { objIndex: number; amount: number };
  exit?: TileExit;
  trigger?: number;
};

type TileClipboard = {
  width: number;
  height: number;
  tiles: EditorTile[][];
  specials: ClipSpecial[][];
};

type SelectionRect = { x1: number; y1: number; x2: number; y2: number };

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.5, 2] as const;

function exitDestination(
  exit: TileExit | undefined,
): { map: number; x: number; y: number } | null {
  if (!exit || typeof exit !== "object") return null;
  const raw = "destinations" in exit ? exit.destinations?.[0] : exit;
  if (!raw || typeof raw.map !== "number" || raw.map < 1) return null;
  const x = Number(raw.x);
  const y = Number(raw.y);
  return {
    map: raw.map,
    x: Number.isFinite(x) ? x : 1,
    y: Number.isFinite(y) ? y : 1,
  };
}

const BASE_TOOLS: Array<{ id: MapTool; label: string; ico: string }> = [
  { id: "select", label: "Seleccionar", ico: "⬚" },
  { id: "brush", label: "Pincel", ico: "✎" },
  { id: "eraser", label: "Borrador", ico: "⌫" },
  { id: "fill", label: "Relleno", ico: "▩" },
  { id: "stamp", label: "Stamp", ico: "▣" },
  { id: "rect", label: "Rectángulo", ico: "▭" },
  { id: "line", label: "Línea", ico: "╱" },
];

export function MapEditor({ mapId }: { mapId: number }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<MapEditorPrefs>(() =>
    typeof window !== "undefined" ? loadMapEditorPrefs() : DEFAULT_PREFS,
  );
  const [state, setState] = useState<EditorMapState | null>(null);
  const [neighbors, setNeighbors] = useState<NeighborOverlay[]>([]);
  const [neighborInterior, setNeighborInterior] = useState<
    { minX: number; maxX: number; minY: number; maxY: number } | undefined
  >();
  const [baseline, setBaseline] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [npcs, setNpcs] = useState<CatalogNpc[]>([]);
  const [objects, setObjects] = useState<CatalogObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [hoverScreen, setHoverScreen] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [selectedGrh, setSelectedGrh] = useState(6000);
  const [selectedStamp, setSelectedStamp] = useState<IndexReferencia | null>(
    null,
  );
  const [placeMode, setPlaceMode] = useState<PlaceMode>(null);
  const [selectedNpcId, setSelectedNpcId] = useState(1);
  const [selectedObjId, setSelectedObjId] = useState(1);
  const [exitTarget, setExitTarget] = useState({ map: 1, x: 50, y: 50 });
  const [triggerValue, setTriggerValue] = useState(1);
  const [rightTab, setRightTab] = useState<RightTab>("tile");
  const [indices, setIndices] = useState<IndexReferencia[]>([]);
  const [indicesQ, setIndicesQ] = useState("");
  const [npcQ, setNpcQ] = useState("");
  const [objQ, setObjQ] = useState("");
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [clipboard, setClipboard] = useState<TileClipboard | null>(null);
  const [borderModalOpen, setBorderModalOpen] = useState(false);
  const [borderForm, setBorderForm] = useState({
    north: "",
    south: "",
    east: "",
    west: "",
    replaceExisting: true,
  });

  const historyRef = useRef<EditorMapState[]>([]);
  const futureRef = useRef<EditorMapState[]>([]);
  const strokeActiveRef = useRef(false);
  const stateRef = useRef<EditorMapState | null>(null);
  stateRef.current = state;
  const shapeStartRef = useRef<{ x0: number; y0: number } | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const selectionRectRef = useRef<SelectionRect | null>(null);
  selectionRectRef.current = selectionRect;
  const stampAnchorRef = useRef<{ x0: number; y0: number } | null>(null);
  const lastPaintKeyRef = useRef<string | null>(null);
  const dirtyAtClickRef = useRef(false);
  const focusTileRef = useRef<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const miniBaseRef = useRef<HTMLCanvasElement | null>(null);
  const [miniRev, setMiniRev] = useState(0);
  const dragRef = useRef<{
    mode: "pan" | "paint" | "select" | null;
    lastX: number;
    lastY: number;
  }>({ mode: null, lastX: 0, lastY: 0 });
  const imageCache = useRef(new Map<number, HTMLImageElement>());
  const grhCache = useRef(new Map<number, GrhMeta | null>());
  const [cacheTick, setCacheTick] = useState(0);
  const resizeSide = useRef<"left" | "right" | null>(null);

  const dirty = state != null && JSON.stringify(state) !== baseline;
  const changeCount = useMemo(() => {
    if (!dirty) return 0;
    return Math.max(1, historyRef.current.length);
  }, [dirty, state]);

  // Persist prefs
  useEffect(() => {
    const t = window.setTimeout(() => saveMapEditorPrefs(prefs), 300);
    return () => window.clearTimeout(t);
  }, [prefs]);

  const pushHistory = useCallback((current: EditorMapState) => {
    historyRef.current.push(cloneEditorState(current));
    if (historyRef.current.length > 80) historyRef.current.shift();
    futureRef.current = [];
  }, []);

  /** One undo step per stroke / discrete action (not per tile). */
  const beginStroke = useCallback(() => {
    if (strokeActiveRef.current) return;
    const cur = stateRef.current;
    if (!cur) return;
    pushHistory(cur);
    strokeActiveRef.current = true;
  }, [pushHistory]);

  const endStroke = useCallback(() => {
    strokeActiveRef.current = false;
  }, []);

  const undo = useCallback(() => {
    endStroke();
    setState((prev) => {
      if (!prev || historyRef.current.length === 0) return prev;
      futureRef.current.push(cloneEditorState(prev));
      return historyRef.current.pop()!;
    });
  }, [endStroke]);

  const redo = useCallback(() => {
    endStroke();
    setState((prev) => {
      if (!prev || futureRef.current.length === 0) return prev;
      historyRef.current.push(cloneEditorState(prev));
      return futureRef.current.pop()!;
    });
  }, [endStroke]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/maps/${mapId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Error");
        return data as {
          state: EditorMapState;
          catalogs: { npcs: CatalogNpc[]; objects: CatalogObj[] };
          hints: string[];
        };
      })
      .then((data) => {
        setState(data.state);
        setBaseline(JSON.stringify(data.state));
        setNpcs(data.catalogs.npcs);
        setObjects(data.catalogs.objects);
        setHints(data.hints ?? []);
        if (data.catalogs.npcs[0]) setSelectedNpcId(data.catalogs.npcs[0].id);
        if (data.catalogs.objects[0])
          setSelectedObjId(data.catalogs.objects[0].id);
        const params = new URLSearchParams(window.location.search);
        const fx = Number(params.get("x"));
        const fy = Number(params.get("y"));
        if (Number.isInteger(fx) && Number.isInteger(fy) && fx > 0 && fy > 0) {
          setSelected({ x: fx, y: fy });
          focusTileRef.current = { x: fx, y: fy };
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [mapId]);

  useEffect(() => {
    const focus = focusTileRef.current;
    const wrap = wrapRef.current;
    if (!state || loading || !focus || !wrap) return;
    focusTileRef.current = null;
    const z = prefs.zoom;
    setPan({
      x: wrap.clientWidth / 2 - (focus.x - 0.5) * TILE_SIZE * z,
      y: wrap.clientHeight / 2 - (focus.y - 0.5) * TILE_SIZE * z,
    });
  }, [state, loading, mapId, prefs.zoom]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/maps/${mapId}/neighbors`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Error");
        return data as {
          neighbors: NeighborOverlay[];
          interior?: { minX: number; maxX: number; minY: number; maxY: number };
        };
      })
      .then((data) => {
        if (cancelled) return;
        setNeighbors(data.neighbors ?? []);
        setNeighborInterior(data.interior);
      })
      .catch(() => {
        if (cancelled) return;
        setNeighbors([]);
        setNeighborInterior(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [mapId]);

  useEffect(() => {
    const q = encodeURIComponent(indicesQ);
    fetch(`/api/maps/indices?q=${q}&limit=100`)
      .then((r) => r.json())
      .then((d: { items: IndexReferencia[] }) => setIndices(d.items ?? []));
  }, [indicesQ]);

  const ensureGrhs = useCallback(async (indexes: number[]) => {
    const missing = indexes.filter((i) => i > 0 && !grhCache.current.has(i));
    if (!missing.length) return;
    const res = await fetch("/api/graphics/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ grhIndexes: missing }),
    });
    if (!res.ok) {
      console.error("[map-editor] graphics/batch failed", res.status);
      return;
    }
    const data = (await res.json()) as {
      entries: Record<string, GrhMeta | null>;
    };
    for (const [key, value] of Object.entries(data.entries ?? {})) {
      grhCache.current.set(Number(key), value);
      if (value && !imageCache.current.has(value.numFile)) {
        const numFile = value.numFile;
        const img = new Image();
        img.decoding = "async";
        // Keep slot reserved so parallel ensureGrhs calls don't double-fetch
        imageCache.current.set(numFile, img);
        img.onload = () => setCacheTick((t) => t + 1);
        img.onerror = () => {
          imageCache.current.delete(numFile);
          // Don't null the whole GRH — other GRHs may share this file later
          setCacheTick((t) => t + 1);
        };
        // Fetch with session cookies, then blob URL (more reliable than img.src
        // against /api/assets that requires auth).
        void fetch(value.textureUrl, { credentials: "same-origin" })
          .then(async (r) => {
            if (!r.ok) throw new Error(`asset ${numFile} HTTP ${r.status}`);
            return r.blob();
          })
          .then((blob) => {
            img.src = URL.createObjectURL(blob);
          })
          .catch((err) => {
            console.error("[map-editor] texture load failed", numFile, err);
            imageCache.current.delete(numFile);
            setCacheTick((t) => t + 1);
          });
      }
    }
    setCacheTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!state) return;
    const need = new Set<number>();
    for (const row of state.tiles) {
      for (const tile of row) {
        for (const g of tile.layers) if (g > 0) need.add(g);
      }
    }
    for (const obj of Object.values(state.specials.objects)) {
      const f = objects.find((o) => o.id === obj.objIndex);
      if (f?.grhIndex) need.add(f.grhIndex);
    }
    for (const npcId of Object.values(state.specials.npcs)) {
      const n = npcs.find((x) => x.id === npcId);
      if (n?.bodyGrh) need.add(n.bodyGrh);
      if (n?.headGrh) need.add(n.headGrh);
    }
    if (selectedGrh > 0) need.add(selectedGrh);
    if (selectedStamp) {
      for (const row of expandStampGrhs(selectedStamp))
        for (const g of row) need.add(g);
    }
    if (prefs.overlays.neighbors) {
      for (const neighbor of neighbors) {
        for (const tile of neighbor.tiles) {
          for (const g of tile.layers) if (g > 0) need.add(g);
        }
      }
    }
    void ensureGrhs([...need]);
  }, [
    state,
    objects,
    npcs,
    selectedGrh,
    selectedStamp,
    ensureGrhs,
    neighbors,
    prefs.overlays.neighbors,
  ]);

  const screenToTile = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !state) return null;
      const rect = canvas.getBoundingClientRect();
      const px = (clientX - rect.left - pan.x) / prefs.zoom;
      const py = (clientY - rect.top - pan.y) / prefs.zoom;
      const x0 = Math.floor(px / TILE_SIZE);
      const y0 = Math.floor(py / TILE_SIZE);
      if (x0 < 0 || y0 < 0 || x0 >= state.width || y0 >= state.height)
        return null;
      return { x0, y0, x: x0 + 1, y: y0 + 1 };
    },
    [pan, prefs.zoom, state],
  );

  const layerLocked = prefs.layers.locked[prefs.activeLayer];

  const paintTerrainAt = useCallback(
    (
      next: EditorMapState,
      x0: number,
      y0: number,
      mode: "brush" | "eraser" | "fill" | "stamp",
    ) => {
      if (layerLocked && (mode === "brush" || mode === "eraser" || mode === "fill" || mode === "stamp")) {
        return;
      }
      const layer = prefs.activeLayer;
      const tile = next.tiles[y0]![x0]!;
      if (mode === "eraser") {
        tile.layers[layer] = 0;
        return;
      }
      if (mode === "fill") {
        const pattern = selectedStamp ? expandStampGrhs(selectedStamp) : undefined;
        const fillLayer =
          selectedStamp && selectedStamp.capa >= 1 && selectedStamp.capa <= 4
            ? ((selectedStamp.capa - 1) as 0 | 1 | 2 | 3)
            : layer;
        if (prefs.layers.locked[fillLayer]) return;
        floodFillLayer(
          next.tiles,
          next.width,
          next.height,
          x0,
          y0,
          fillLayer,
          selectedGrh,
          pattern,
        );
        return;
      }
      if ((mode === "stamp" || mode === "brush") && selectedStamp && mode === "stamp") {
        const grid = expandStampGrhs(selectedStamp);
        for (let dy = 0; dy < grid.length; dy++) {
          for (let dx = 0; dx < grid[dy]!.length; dx++) {
            const tx = x0 + dx;
            const ty = y0 + dy;
            if (tx < 0 || ty < 0 || tx >= next.width || ty >= next.height) continue;
            const t = next.tiles[ty]![tx]!;
            const L =
              selectedStamp.capa >= 1 && selectedStamp.capa <= 4
                ? ((selectedStamp.capa - 1) as 0 | 1 | 2 | 3)
                : layer;
            if (prefs.layers.locked[L]) continue;
            t.layers[L] = grid[dy]![dx]!;
            if (selectedStamp.bloquear) t.blocked = true;
          }
        }
        return;
      }
      if (mode === "brush" && selectedStamp) {
        // brush with stamp selected acts as stamp
        const grid = expandStampGrhs(selectedStamp);
        for (let dy = 0; dy < grid.length; dy++) {
          for (let dx = 0; dx < grid[dy]!.length; dx++) {
            const tx = x0 + dx;
            const ty = y0 + dy;
            if (tx < 0 || ty < 0 || tx >= next.width || ty >= next.height) continue;
            if (prefs.layers.locked[layer]) continue;
            next.tiles[ty]![tx]!.layers[layer] = grid[dy]![dx]!;
          }
        }
        return;
      }
      tile.layers[layer] = selectedGrh;
    },
    [layerLocked, prefs.activeLayer, prefs.layers.locked, selectedGrh, selectedStamp],
  );

  const applyAt = useCallback(
    (x0: number, y0: number) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = cloneEditorState(prev);
        const key = tileKey(x0 + 1, y0 + 1);

        if (placeMode === "blocked") {
          next.tiles[y0]![x0]!.blocked = !next.tiles[y0]![x0]!.blocked;
        } else if (placeMode === "npc") {
          next.specials.npcs[key] = selectedNpcId;
        } else if (placeMode === "object") {
          next.specials.objects[key] = {
            objIndex: selectedObjId,
            amount: 1,
          };
        } else if (placeMode === "exit") {
          next.specials.exits[key] = { ...exitTarget };
        } else if (placeMode === "trigger") {
          next.specials.triggers[key] = triggerValue;
        } else if (placeMode === "erase-npc") {
          delete next.specials.npcs[key];
        } else if (placeMode === "erase-object") {
          delete next.specials.objects[key];
        } else if (placeMode === "erase-trigger") {
          delete next.specials.triggers[key];
        } else if (prefs.tool === "brush" || prefs.tool === "stamp") {
          paintTerrainAt(
            next,
            x0,
            y0,
            prefs.tool === "stamp" ? "stamp" : "brush",
          );
        } else if (prefs.tool === "eraser") {
          paintTerrainAt(next, x0, y0, "eraser");
        } else if (prefs.tool === "fill") {
          paintTerrainAt(next, x0, y0, "fill");
        }
        return next;
      });
    },
    [
      placeMode,
      selectedNpcId,
      selectedObjId,
      exitTarget,
      triggerValue,
      prefs.tool,
      paintTerrainAt,
    ],
  );

  const paintFromCursor = useCallback(
    (x0: number, y0: number) => {
      let px = x0;
      let py = y0;
      const stamp = selectedStamp;
      const anchor = stampAnchorRef.current;
      const tiled =
        !!stamp &&
        (stamp.ancho > 1 || stamp.alto > 1) &&
        (prefs.tool === "stamp" || prefs.tool === "brush") &&
        !placeMode &&
        !!anchor;
      if (tiled && stamp && anchor) {
        px = anchor.x0 + Math.floor((x0 - anchor.x0) / stamp.ancho) * stamp.ancho;
        py = anchor.y0 + Math.floor((y0 - anchor.y0) / stamp.alto) * stamp.alto;
      }
      const key = `${px},${py}`;
      if (lastPaintKeyRef.current === key) return;
      lastPaintKeyRef.current = key;
      applyAt(px, py);
    },
    [applyAt, placeMode, prefs.tool, selectedStamp],
  );

  const fillShape = useCallback(
    (x0a: number, y0a: number, x0b: number, y0b: number, asLine: boolean) => {
      setState((prev) => {
        if (!prev || layerLocked) return prev;
        const next = cloneEditorState(prev);
        const layer = prefs.activeLayer;
        if (asLine) {
          let x0 = x0a;
          let y0 = y0a;
          const x1 = x0b;
          const y1 = y0b;
          const dx = Math.abs(x1 - x0);
          const dy = Math.abs(y1 - y0);
          const sx = x0 < x1 ? 1 : -1;
          const sy = y0 < y1 ? 1 : -1;
          let err = dx - dy;
          for (;;) {
            next.tiles[y0]![x0]!.layers[layer] = selectedGrh;
            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
              err -= dy;
              x0 += sx;
            }
            if (e2 < dx) {
              err += dx;
              y0 += sy;
            }
          }
        } else {
          const minX = Math.min(x0a, x0b);
          const maxX = Math.max(x0a, x0b);
          const minY = Math.min(y0a, y0b);
          const maxY = Math.max(y0a, y0b);
          for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
              next.tiles[y]![x]!.layers[layer] = selectedGrh;
            }
          }
        }
        return next;
      });
    },
    [layerLocked, prefs.activeLayer, selectedGrh],
  );

  const eraseSpecialAt = useCallback(
    (x: number, y: number) => {
      const key = tileKey(x, y);
      beginStroke();
      setState((prev) => {
        if (!prev) return prev;
        const next = cloneEditorState(prev);
        delete next.specials.npcs[key];
        delete next.specials.objects[key];
        delete next.specials.exits[key];
        delete next.specials.triggers[key];
        return next;
      });
      endStroke();
    },
    [beginStroke, endStroke],
  );

  const readClipSpecial = useCallback(
    (cur: EditorMapState, x: number, y: number): ClipSpecial => {
      const key = tileKey(x, y);
      const cell: ClipSpecial = {};
      if (cur.specials.npcs[key] != null) cell.npc = cur.specials.npcs[key];
      if (cur.specials.objects[key]) {
        cell.object = { ...cur.specials.objects[key] };
      }
      if (cur.specials.exits[key]) {
        cell.exit = structuredClone(cur.specials.exits[key]);
      }
      if (cur.specials.triggers[key] != null) {
        cell.trigger = cur.specials.triggers[key];
      }
      return cell;
    },
    [],
  );

  const copySelectionToClipboard = useCallback(
    (rect: SelectionRect) => {
      const cur = stateRef.current;
      if (!cur) return;
      const minX = Math.min(rect.x1, rect.x2);
      const maxX = Math.max(rect.x1, rect.x2);
      const minY = Math.min(rect.y1, rect.y2);
      const maxY = Math.max(rect.y1, rect.y2);
      const tiles: EditorTile[][] = [];
      const specials: ClipSpecial[][] = [];
      for (let y = minY; y <= maxY; y++) {
        const row: EditorTile[] = [];
        const specialRow: ClipSpecial[] = [];
        for (let x = minX; x <= maxX; x++) {
          const t = cur.tiles[y - 1]?.[x - 1];
          row.push(
            t
              ? {
                  layers: [...t.layers] as [number, number, number, number],
                  blocked: t.blocked,
                }
              : { layers: [0, 0, 0, 0], blocked: false },
          );
          specialRow.push(readClipSpecial(cur, x, y));
        }
        tiles.push(row);
        specials.push(specialRow);
      }
      setClipboard({
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        tiles,
        specials,
      });
      setMessage(
        `Copiado ${maxX - minX + 1}×${maxY - minY + 1} (Ctrl+V pega en el cursor)`,
      );
    },
    [readClipSpecial],
  );

  const clearSelectionTiles = useCallback((next: EditorMapState, rect: SelectionRect) => {
    const minX = Math.min(rect.x1, rect.x2);
    const maxX = Math.max(rect.x1, rect.x2);
    const minY = Math.min(rect.y1, rect.y2);
    const maxY = Math.max(rect.y1, rect.y2);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const tile = next.tiles[y - 1]?.[x - 1];
        if (tile) {
          tile.layers = [0, 0, 0, 0];
          tile.blocked = false;
        }
        const key = tileKey(x, y);
        delete next.specials.npcs[key];
        delete next.specials.objects[key];
        delete next.specials.exits[key];
        delete next.specials.triggers[key];
      }
    }
  }, []);

  const cutSelection = useCallback(
    (rect: SelectionRect) => {
      copySelectionToClipboard(rect);
      beginStroke();
      setState((prev) => {
        if (!prev) return prev;
        const next = cloneEditorState(prev);
        clearSelectionTiles(next, rect);
        return next;
      });
      endStroke();
      setMessage("Cortado. Ctrl+V pega en el cursor");
    },
    [beginStroke, clearSelectionTiles, copySelectionToClipboard, endStroke],
  );

  const writeClipSpecial = (
    next: EditorMapState,
    x: number,
    y: number,
    cell: ClipSpecial | undefined,
  ) => {
    const key = tileKey(x, y);
    delete next.specials.npcs[key];
    delete next.specials.objects[key];
    delete next.specials.exits[key];
    delete next.specials.triggers[key];
    if (!cell) return;
    if (cell.npc != null) next.specials.npcs[key] = cell.npc;
    if (cell.object) next.specials.objects[key] = { ...cell.object };
    if (cell.exit) next.specials.exits[key] = structuredClone(cell.exit);
    if (cell.trigger != null) next.specials.triggers[key] = cell.trigger;
  };

  const pasteClipboardAt = useCallback(
    (x1: number, y1: number) => {
      const cur = stateRef.current;
      if (!cur || !clipboard) return;
      beginStroke();
      setState((prev) => {
        if (!prev) return prev;
        const next = cloneEditorState(prev);
        for (let dy = 0; dy < clipboard.height; dy++) {
          for (let dx = 0; dx < clipboard.width; dx++) {
            const x = x1 + dx;
            const y = y1 + dy;
            const tx = x - 1;
            const ty = y - 1;
            if (tx < 0 || ty < 0 || tx >= next.width || ty >= next.height)
              continue;
            const src = clipboard.tiles[dy]![dx]!;
            next.tiles[ty]![tx] = {
              layers: [...src.layers] as [number, number, number, number],
              blocked: src.blocked,
            };
            writeClipSpecial(next, x, y, clipboard.specials[dy]?.[dx]);
          }
        }
        return next;
      });
      endStroke();
      setMessage(`Pegado ${clipboard.width}×${clipboard.height}`);
    },
    [clipboard, beginStroke, endStroke],
  );

  const applyAutoBorders = useCallback(() => {
    const parse = (s: string) => {
      const n = Number.parseInt(s.trim(), 10);
      return Number.isFinite(n) && n > 0 ? n : null;
    };
    const form = {
      north: parse(borderForm.north),
      south: parse(borderForm.south),
      east: parse(borderForm.east),
      west: parse(borderForm.west),
      replaceExisting: borderForm.replaceExisting,
    };
    const cur = stateRef.current;
    if (!cur) return;
    beginStroke();
    const { state: next, placed, cleared, blocked } = applyBorderExits(cur, form);
    setState(next);
    setMessage(
      `Bordes: ${placed} traslados y ${blocked} bloqueos` +
        (cleared ? ` (${cleared} traslados previos reemplazados)` : ""),
    );
    endStroke();
    setBorderModalOpen(false);
  }, [borderForm, beginStroke, endStroke]);

  const placementPreview = useMemo(() => {
    if (!cursor) return null;
    if (placeMode) return null;
    if (
      prefs.tool !== "brush" &&
      prefs.tool !== "stamp" &&
      prefs.tool !== "eraser" &&
      prefs.tool !== "fill" &&
      prefs.tool !== "rect" &&
      prefs.tool !== "line"
    ) {
      return null;
    }
    if (prefs.tool === "eraser") {
      return {
        x: cursor.x,
        y: cursor.y,
        cells: [{ dx: 0, dy: 0, grh: 0, layer: prefs.activeLayer }],
      };
    }
    if (selectedStamp && (prefs.tool === "stamp" || prefs.tool === "brush")) {
      const grid = expandStampGrhs(selectedStamp);
      const layer =
        selectedStamp.capa >= 1 && selectedStamp.capa <= 4
          ? selectedStamp.capa - 1
          : prefs.activeLayer;
      const cells: Array<{
        dx: number;
        dy: number;
        grh: number;
        layer: number;
      }> = [];
      for (let dy = 0; dy < grid.length; dy++) {
        for (let dx = 0; dx < grid[dy]!.length; dx++) {
          cells.push({ dx, dy, grh: grid[dy]![dx]!, layer });
        }
      }
      return { x: cursor.x, y: cursor.y, cells };
    }
    if (selectedGrh > 0) {
      return {
        x: cursor.x,
        y: cursor.y,
        cells: [
          { dx: 0, dy: 0, grh: selectedGrh, layer: prefs.activeLayer },
        ],
      };
    }
    return null;
  }, [
    cursor,
    placeMode,
    prefs.tool,
    prefs.activeLayer,
    selectedStamp,
    selectedGrh,
  ]);

  // Main canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !state) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    renderMapFrame({
      ctx,
      canvasW: w,
      canvasH: h,
      state,
      pan,
      zoom: prefs.zoom,
      view: prefs.view,
      layerVisible: prefs.layers.visible,
      layerOpacity: prefs.layers.opacity,
      overlays: prefs.overlays,
      triggerVisibility: prefs.triggerVisibility,
      showTriggerNumbers: prefs.view === "triggers" || prefs.view === "debug",
      cursor,
      selected,
      stampPreview: selectedStamp,
      stampTool: prefs.tool === "stamp" || (prefs.tool === "brush" && !!selectedStamp),
      placementPreview,
      selectionRect,
      objects,
      npcs,
      grhCache: grhCache.current,
      imageCache: imageCache.current,
      neighbors,
      showNeighbors: prefs.overlays.neighbors,
      neighborInterior,
    });

    // rulers / debug overlay text on selected
    if (prefs.view === "debug" && selected) {
      const tile = state.tiles[selected.y - 1]?.[selected.x - 1];
      if (tile) {
        ctx.save();
        ctx.fillStyle = "rgba(10,14,20,0.85)";
        ctx.fillRect(8, 8, 220, 120);
        ctx.fillStyle = "#dce3ee";
        ctx.font = "11px ui-monospace";
        const key = tileKey(selected.x, selected.y);
        const lines = [
          `Map ${state.id}  X:${selected.x} Y:${selected.y}`,
          `L1 ${tile.layers[0]}  L2 ${tile.layers[1]}`,
          `L3 ${tile.layers[2]}  L4 ${tile.layers[3]}`,
          `Blocked ${tile.blocked ? "yes" : "no"}`,
          `Trigger ${state.specials.triggers[key] ?? "-"}`,
          `NPC ${state.specials.npcs[key] ?? "-"}  Obj ${state.specials.objects[key]?.objIndex ?? "-"}`,
        ];
        lines.forEach((l, i) => ctx.fillText(l, 14, 26 + i * 16));
        ctx.restore();
      }
    }
  }, [
    state,
    pan,
    prefs,
    cursor,
    selected,
    selectedStamp,
    placementPreview,
    selectionRect,
    objects,
    npcs,
    cacheTick,
    neighbors,
    neighborInterior,
  ]);

  // Minimap graphics (debounced so painting doesn't redraw every tile)
  useEffect(() => {
    if (!state || !prefs.showMinimap) return;
    const timer = window.setTimeout(() => {
      const base = miniBaseRef.current ?? document.createElement("canvas");
      miniBaseRef.current = base;
      if (base.width !== state.width || base.height !== state.height) {
        base.width = state.width;
        base.height = state.height;
      }
      const bctx = base.getContext("2d");
      if (!bctx) return;
      paintMinimapGraphics(
        bctx,
        state,
        grhCache.current,
        imageCache.current,
      );
      setMiniRev((n) => n + 1);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [state, cacheTick, prefs.showMinimap]);

  // Minimap viewport frame
  useEffect(() => {
    const mini = miniRef.current;
    const wrap = wrapRef.current;
    if (!mini || !wrap || !state || !prefs.showMinimap) return;
    const ctx = mini.getContext("2d");
    if (!ctx) return;
    const size = 200;
    mini.width = size;
    mini.height = size;
    renderMinimap(
      ctx,
      state,
      pan,
      prefs.zoom,
      wrap.clientWidth,
      wrap.clientHeight,
      size,
      size,
      miniBaseRef.current,
    );
  }, [state, pan, prefs.zoom, prefs.showMinimap, miniRev]);

  async function save() {
    const current = stateRef.current;
    if (!current) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/maps/${mapId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: current }),
      });
      const body = (await res.json()) as { error?: string; hints?: string[] };
      if (!res.ok) throw new Error(body.error ?? "Error");
      setBaseline(JSON.stringify(current));
      setHints(body.hints ?? hints);
      setMessage("Guardado");
      historyRef.current = [];
      futureRef.current = [];
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  const saveRef = useRef(save);
  saveRef.current = save;

  function discard() {
    if (!baseline) return;
    if (dirty && !confirm("¿Descartar cambios sin guardar?")) return;
    setState(JSON.parse(baseline) as EditorMapState);
    historyRef.current = [];
    futureRef.current = [];
  }

  function fitMap() {
    if (!state || !wrapRef.current) return;
    const w = wrapRef.current.clientWidth;
    const h = wrapRef.current.clientHeight;
    const zx = w / (state.width * TILE_SIZE);
    const zy = h / (state.height * TILE_SIZE);
    const z =
      ZOOM_LEVELS.reduce((best, cur) =>
        Math.abs(cur - Math.min(zx, zy)) < Math.abs(best - Math.min(zx, zy))
          ? cur
          : best,
      ) ?? 0.5;
    setPrefs((p) => ({ ...p, zoom: z }));
    setPan({
      x: (w - state.width * TILE_SIZE * z) / 2,
      y: (h - state.height * TILE_SIZE * z) / 2,
    });
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.repeat) return;
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        if (e.repeat) return;
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveRef.current();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        e.preventDefault();
        const rect = selectionRectRef.current;
        if (!rect) {
          setMessage("Seleccioná con Shift o Ctrl y arrastrá. Después Ctrl+C.");
          return;
        }
        copySelectionToClipboard(rect);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x") {
        e.preventDefault();
        const rect = selectionRectRef.current;
        if (!rect) {
          setMessage("Seleccioná con Shift o Ctrl y arrastrá. Después Ctrl+X.");
          return;
        }
        cutSelection(rect);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (!clipboard || !cursor) {
          setMessage(clipboard ? "Pará el cursor donde querés pegar" : "Nada en el portapapeles");
          return;
        }
        pasteClipboardAt(cursor.x, cursor.y);
      }
      if (e.key === "Escape") {
        setPlaceMode(null);
        setSelectionRect(null);
        setBorderModalOpen(false);
        setPrefs((p) => ({ ...p, tool: "select" }));
      }
      if (e.key.toLowerCase() === "b" && !e.ctrlKey) {
        setPrefs((p) => ({
          ...p,
          overlays: { ...p.overlays, blocked: !p.overlays.blocked },
        }));
      }
      if (e.key.toLowerCase() === "t" && !e.ctrlKey) {
        setPrefs((p) => ({
          ...p,
          overlays: { ...p.overlays, triggers: !p.overlays.triggers },
        }));
      }
      if (e.key.toLowerCase() === "g" && !e.ctrlKey) {
        setPrefs((p) => ({
          ...p,
          overlays: { ...p.overlays, grid: !p.overlays.grid },
        }));
      }
      if (e.key.toLowerCase() === "n" && !e.ctrlKey) {
        setPrefs((p) => ({
          ...p,
          overlays: { ...p.overlays, npcs: !p.overlays.npcs },
        }));
      }
      if (e.key.toLowerCase() === "o" && !e.ctrlKey) {
        setPrefs((p) => ({
          ...p,
          overlays: { ...p.overlays, objects: !p.overlays.objects },
        }));
      }
      if (e.key.toLowerCase() === "f" && !e.ctrlKey) {
        fitMap();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo, clipboard, cursor, pasteClipboardAt, copySelectionToClipboard, cutSelection]);

  // Panel resize
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!resizeSide.current) return;
      if (resizeSide.current === "left") {
        setPrefs((p) => ({
          ...p,
          leftWidth: Math.min(360, Math.max(160, e.clientX - 200)),
        }));
      } else {
        const fromRight = window.innerWidth - e.clientX;
        setPrefs((p) => ({
          ...p,
          rightWidth: Math.min(420, Math.max(240, fromRight)),
        }));
      }
    }
    function onUp() {
      resizeSide.current = null;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const filteredNpcs = useMemo(() => {
    const q = npcQ.toLowerCase();
    return npcs
      .filter(
        (n) =>
          !q ||
          String(n.id).includes(q) ||
          n.name.toLowerCase().includes(q),
      )
      .slice(0, 80);
  }, [npcs, npcQ]);

  const filteredObjs = useMemo(() => {
    const q = objQ.toLowerCase();
    return objects
      .filter(
        (o) =>
          !q ||
          String(o.id).includes(q) ||
          o.name.toLowerCase().includes(q),
      )
      .slice(0, 80);
  }, [objects, objQ]);

  const selTile =
    state && selected
      ? state.tiles[selected.y - 1]?.[selected.x - 1]
      : null;
  const selKey = selected ? tileKey(selected.x, selected.y) : "";
  const selectedExit = state ? exitDestination(state.specials.exits[selKey]) : null;
  // cacheTick: recompute when GRH sizes finish loading
  const covering = useMemo(() => {
    if (!state || !selected) return [];
    return findCoveringGraphics(
      state,
      selected.x,
      selected.y,
      grhCache.current,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cacheTick invalidates grh sizes
  }, [state, selected, cacheTick]);

  if (loading) {
    return <p style={{ color: "var(--me-muted)", padding: 20 }}>Cargando mapa…</p>;
  }
  if (error || !state) {
    return (
      <div style={{ padding: 20 }}>
        <Link href="/maps">← Mapas</Link>
        <p style={{ color: "var(--me-danger)" }}>{error ?? "Error"}</p>
      </div>
    );
  }

  return (
    <div
      className="map-editor"
      style={
        {
          "--me-left": `${prefs.leftWidth}px`,
          "--me-right": `${prefs.rightWidth}px`,
        } as React.CSSProperties
      }
    >
      {/* TOP */}
      <div className="me-top">
        <Link href="/maps" title="Volver al listado">
          ← Mapas
        </Link>
        <strong>
          #{state.id} {state.meta.name}
        </strong>
        {dirty && <span className="me-dirty">● Hay cambios sin guardar</span>}
        <span style={{ color: "var(--me-muted)" }}>
          X: {cursor?.x ?? "—"} Y: {cursor?.y ?? "—"}
        </span>
        <span style={{ color: "var(--me-muted)" }}>
          Capa: {prefs.activeLayer + 1}
          {layerLocked ? " 🔒" : ""}
        </span>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          Vista
          <select
            className="me-select"
            style={{ width: 120 }}
            value={prefs.view}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                view: e.target.value as MapViewMode,
              }))
            }
            title="Modo de vista"
          >
            <option value="normal">Normal</option>
            <option value="layers">Capas</option>
            <option value="collisions">Colisiones</option>
            <option value="gameplay">Gameplay</option>
            <option value="triggers">Triggers</option>
            <option value="debug">Debug</option>
          </select>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          Zoom
          <select
            className="me-select"
            style={{ width: 80 }}
            value={prefs.zoom}
            onChange={(e) =>
              setPrefs((p) => ({ ...p, zoom: Number(e.target.value) }))
            }
          >
            {ZOOM_LEVELS.map((z) => (
              <option key={z} value={z}>
                {Math.round(z * 100)}%
              </option>
            ))}
          </select>
        </label>
        <div style={{ flex: 1 }} />
        <button
          className="me-btn"
          onClick={() => {
            const rect = selectionRectRef.current;
            if (!rect) {
              setMessage("Mantené Shift o Ctrl y arrastrá con el click izquierdo");
              return;
            }
            copySelectionToClipboard(rect);
          }}
          title="Shift/Ctrl + arrastrar selecciona. Ctrl+C copia, Ctrl+X corta"
        >
          Copiar selección
        </button>
        <button
          className="me-btn"
          onClick={() => setBorderModalOpen(true)}
          title="Auto-colocar traslados de borde"
        >
          Bordes / traslados
        </button>
        <button className="me-btn" onClick={undo} title="Ctrl+Z">
          Undo
        </button>
        <button className="me-btn" onClick={redo} title="Ctrl+Y">
          Redo
        </button>
        <button
          className="me-btn danger"
          onClick={discard}
          disabled={!dirty}
          title="Descartar"
        >
          Descartar
        </button>
        <button
          className="me-btn primary"
          onClick={() => void save()}
          disabled={!dirty || saving}
          title="Ctrl+S"
        >
          {saving ? "…" : "Guardar"}
        </button>
      </div>

      <div className="me-body">
        {/* LEFT */}
        <aside className="me-side">
          <Section
            title="Herramientas"
            collapsed={prefs.collapsed.tools}
            onToggle={() =>
              setPrefs((p) => ({
                ...p,
                collapsed: { ...p.collapsed, tools: !p.collapsed.tools },
              }))
            }
          >
            <div className="me-tools">
              {BASE_TOOLS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`me-tool ${prefs.tool === t.id && !placeMode ? "active" : ""}`}
                  onClick={() => {
                    setPlaceMode(null);
                    setPrefs((p) => ({ ...p, tool: t.id }));
                    if (t.id !== "stamp" && t.id !== "fill" && t.id !== "brush") {
                      setSelectedStamp(null);
                    }
                  }}
                  title={t.label}
                >
                  <span className="ico">{t.ico}</span>
                  {t.label}
                </button>
              ))}
            </div>
            {placeMode && (
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--me-warn)" }}>
                {placeMode === "erase-npc"
                  ? "Quitando solo NPCs. El traslado queda. Esc cancela."
                  : placeMode === "erase-object"
                    ? "Quitando solo objetos. El traslado queda. Esc cancela."
                    : placeMode === "erase-trigger"
                      ? "Quitando solo triggers. El traslado queda. Esc cancela."
                      : `Modo colocación: ${placeMode} (Esc cancela)`}
              </div>
            )}
          </Section>

          <Section
            title="Capas"
            collapsed={prefs.collapsed.layers}
            onToggle={() =>
              setPrefs((p) => ({
                ...p,
                collapsed: { ...p.collapsed, layers: !p.collapsed.layers },
              }))
            }
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`me-layer-row ${prefs.activeLayer === i ? "active" : ""}`}
                onClick={() =>
                  setPrefs((p) => ({
                    ...p,
                    activeLayer: i as 0 | 1 | 2 | 3,
                  }))
                }
              >
                <button
                  type="button"
                  className={prefs.layers.visible[i] ? "on" : ""}
                  title="Visible"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrefs((p) => {
                      const visible = [...p.layers.visible] as MapEditorPrefs["layers"]["visible"];
                      visible[i] = !visible[i];
                      return { ...p, layers: { ...p.layers, visible } };
                    });
                  }}
                >
                  {prefs.layers.visible[i] ? "👁" : "👁‍🗨"}
                </button>
                <span>Capa {i + 1}</span>
                <button
                  type="button"
                  className={
                    prefs.layers.visible.every((v, idx) =>
                      idx === i ? v : !v,
                    )
                      ? "on"
                      : ""
                  }
                  title="Solo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrefs((p) => ({
                      ...p,
                      activeLayer: i as 0 | 1 | 2 | 3,
                      layers: {
                        ...p.layers,
                        visible: [false, false, false, false].map((_, idx) =>
                          idx === i,
                        ) as MapEditorPrefs["layers"]["visible"],
                      },
                    }));
                  }}
                >
                  S
                </button>
                <button
                  type="button"
                  className={prefs.layers.locked[i] ? "on" : ""}
                  title="Bloquear edición"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrefs((p) => {
                      const locked = [...p.layers.locked] as MapEditorPrefs["layers"]["locked"];
                      locked[i] = !locked[i];
                      return { ...p, layers: { ...p.layers, locked } };
                    });
                  }}
                >
                  {prefs.layers.locked[i] ? "🔒" : "🔓"}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={prefs.layers.opacity[i]}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const opacity = [...prefs.layers.opacity] as MapEditorPrefs["layers"]["opacity"];
                    opacity[i] = Number(e.target.value);
                    setPrefs((p) => ({
                      ...p,
                      layers: { ...p.layers, opacity },
                    }));
                  }}
                />
              </div>
            ))}
            <div className="me-row-btns">
              <button
                type="button"
                className="me-btn"
                onClick={() =>
                  setPrefs((p) => ({
                    ...p,
                    layers: {
                      ...p.layers,
                      visible: [true, true, true, true],
                    },
                  }))
                }
              >
                Mostrar todas
              </button>
              <button
                type="button"
                className="me-btn"
                onClick={() =>
                  setPrefs((p) => ({
                    ...p,
                    layers: {
                      ...p.layers,
                      visible: [false, false, false, false],
                    },
                  }))
                }
              >
                Ocultar todas
              </button>
              <button
                type="button"
                className="me-btn"
                onClick={() =>
                  setPrefs((p) => ({
                    ...p,
                    layers: {
                      ...p.layers,
                      visible: [0, 1, 2, 3].map(
                        (i) => i === p.activeLayer,
                      ) as MapEditorPrefs["layers"]["visible"],
                    },
                  }))
                }
              >
                Solo activa
              </button>
            </div>
          </Section>

          <Section
            title="Overlays"
            collapsed={prefs.collapsed.overlays}
            onToggle={() =>
              setPrefs((p) => ({
                ...p,
                collapsed: {
                  ...p.collapsed,
                  overlays: !p.collapsed.overlays,
                },
              }))
            }
          >
            {(
              [
                ["blocked", "Bloqueos", "B"],
                ["triggers", "Triggers", "T"],
                ["npcs", "NPCs (sprites)", "N"],
                ["objects", "Objetos (sprites)", "O"],
                ["exits", "Salidas / TileExit", ""],
                ["spawns", "Spawns", ""],
                ["especiales", "Etiquetas N/O", ""],
                ["grid", "Grilla", "G"],
                ["coordinates", "Coordenadas", ""],
                ["grhIds", "GRH IDs", ""],
                ["neighbors", "Mapas vecinos", ""],
              ] as const
            ).map(([key, label, shortcut]) => (
              <label key={key} className="me-check">
                <input
                  type="checkbox"
                  checked={prefs.overlays[key]}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      overlays: { ...p.overlays, [key]: e.target.checked },
                    }))
                  }
                />
                {label}
                {shortcut ? (
                  <span style={{ color: "var(--me-muted)", marginLeft: "auto" }}>
                    {shortcut}
                  </span>
                ) : null}
              </label>
            ))}
            <div className="me-row-btns">
              <button
                type="button"
                className="me-btn"
                onClick={() =>
                  setPrefs((p) => ({
                    ...p,
                    overlays: {
                      blocked: true,
                      triggers: true,
                      npcs: true,
                      objects: true,
                      exits: true,
                      spawns: true,
                      especiales: true,
                      grid: true,
                      coordinates: true,
                      grhIds: true,
                      neighbors: true,
                    },
                  }))
                }
              >
                Mostrar todo
              </button>
              <button
                type="button"
                className="me-btn"
                onClick={() =>
                  setPrefs((p) => ({
                    ...p,
                    overlays: {
                      blocked: false,
                      triggers: false,
                      npcs: false,
                      objects: false,
                      exits: false,
                      spawns: false,
                      especiales: false,
                      grid: false,
                      coordinates: false,
                      grhIds: false,
                      neighbors: false,
                    },
                  }))
                }
              >
                Ocultar todo
              </button>
            </div>
          </Section>

          <Section
            title="Triggers"
            collapsed={prefs.collapsed.triggers}
            onToggle={() =>
              setPrefs((p) => ({
                ...p,
                collapsed: {
                  ...p.collapsed,
                  triggers: !p.collapsed.triggers,
                },
              }))
            }
          >
            {WOAO_TRIGGERS.map((t) => (
              <label key={t.value} className="me-check">
                <input
                  type="checkbox"
                  checked={prefs.triggerVisibility[String(t.value)] !== false}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      triggerVisibility: {
                        ...p.triggerVisibility,
                        [String(t.value)]: e.target.checked,
                      },
                    }))
                  }
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: t.color,
                    display: "inline-block",
                  }}
                />
                {t.value} — {t.label}
              </label>
            ))}
          </Section>

          {message && (
            <div style={{ fontSize: 11, color: "var(--me-ok)" }}>{message}</div>
          )}
          {hints.slice(0, 2).map((h) => (
            <div key={h} style={{ fontSize: 10, color: "var(--me-warn)" }}>
              {h}
            </div>
          ))}
        </aside>

        <div
          className={`me-resizer ${resizeSide.current === "left" ? "active" : ""}`}
          onMouseDown={() => {
            resizeSide.current = "left";
          }}
        />

        {/* CANVAS */}
        <div className="me-canvas-wrap" ref={wrapRef}>
          <canvas
            ref={canvasRef}
            className="map"
            onContextMenu={(e) => {
              e.preventDefault();
              const t = screenToTile(e.clientX, e.clientY);
              if (t) eraseSpecialAt(t.x, t.y);
            }}
            onPointerDown={(e) => {
              canvasRef.current?.setPointerCapture(e.pointerId);
              if (e.button === 1) {
                e.preventDefault();
                dragRef.current = {
                  mode: "pan",
                  lastX: e.clientX,
                  lastY: e.clientY,
                };
                return;
              }
              if (e.button !== 0) return;
              const t = screenToTile(e.clientX, e.clientY);
              if (!t) return;
              if (e.detail <= 1) dirtyAtClickRef.current = dirty;
              if (e.detail >= 2) {
                const dest = exitDestination(
                  stateRef.current?.specials.exits[tileKey(t.x, t.y)],
                );
                if (dest) {
                  e.preventDefault();
                  if (
                    dirtyAtClickRef.current &&
                    !confirm("Hay cambios sin guardar. ¿Ir al mapa destino igual?")
                  ) {
                    return;
                  }
                  if (dest.map === mapId) {
                    setSelected({ x: dest.x, y: dest.y });
                    const wrap = wrapRef.current;
                    if (wrap) {
                      setPan({
                        x: wrap.clientWidth / 2 - (dest.x - 0.5) * TILE_SIZE * prefs.zoom,
                        y: wrap.clientHeight / 2 - (dest.y - 0.5) * TILE_SIZE * prefs.zoom,
                      });
                    }
                    return;
                  }
                  router.push(`/maps/${dest.map}?x=${dest.x}&y=${dest.y}`);
                  return;
                }
              }

              if (e.shiftKey || e.ctrlKey || e.metaKey) {
                e.preventDefault();
                selectionStartRef.current = { x: t.x, y: t.y };
                setSelectionRect({ x1: t.x, y1: t.y, x2: t.x, y2: t.y });
                setSelected({ x: t.x, y: t.y });
                dragRef.current = {
                  mode: "select",
                  lastX: e.clientX,
                  lastY: e.clientY,
                };
                return;
              }

              setSelectionRect(null);
              setSelected({ x: t.x, y: t.y });
              if (prefs.tool === "select" && !placeMode) return;
              if (prefs.tool === "rect" || prefs.tool === "line") {
                shapeStartRef.current = { x0: t.x0, y0: t.y0 };
                return;
              }
              stampAnchorRef.current = { x0: t.x0, y0: t.y0 };
              lastPaintKeyRef.current = null;
              beginStroke();
              paintFromCursor(t.x0, t.y0);
              dragRef.current = {
                mode: "paint",
                lastX: e.clientX,
                lastY: e.clientY,
              };
            }}
            onPointerMove={(e) => {
              setHoverScreen({ x: e.clientX, y: e.clientY });
              const t = screenToTile(e.clientX, e.clientY);
              setCursor(t ? { x: t.x, y: t.y } : null);
              const drag = dragRef.current;
              if (drag.mode === "pan") {
                const dx = e.clientX - drag.lastX;
                const dy = e.clientY - drag.lastY;
                drag.lastX = e.clientX;
                drag.lastY = e.clientY;
                setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
              } else if (drag.mode === "select" && selectionStartRef.current && t) {
                setSelectionRect({
                  x1: selectionStartRef.current.x,
                  y1: selectionStartRef.current.y,
                  x2: t.x,
                  y2: t.y,
                });
              } else if (
                drag.mode === "paint" &&
                t &&
                (prefs.tool === "brush" ||
                  prefs.tool === "eraser" ||
                  prefs.tool === "stamp" ||
                  placeMode)
              ) {
                paintFromCursor(t.x0, t.y0);
              }
            }}
            onPointerUp={(e) => {
              if (dragRef.current.mode === "select" && selectionStartRef.current) {
                const t = screenToTile(e.clientX, e.clientY);
                const start = selectionStartRef.current;
                const end = t ? { x: t.x, y: t.y } : start;
                setSelectionRect({
                  x1: start.x,
                  y1: start.y,
                  x2: end.x,
                  y2: end.y,
                });
                selectionStartRef.current = null;
                dragRef.current.mode = null;
                setMessage("Selección lista. Ctrl+C copia, Ctrl+X corta, Ctrl+V pega");
                return;
              }
              if (
                (prefs.tool === "rect" || prefs.tool === "line") &&
                shapeStartRef.current
              ) {
                const t = screenToTile(e.clientX, e.clientY);
                if (t) {
                  beginStroke();
                  fillShape(
                    shapeStartRef.current.x0,
                    shapeStartRef.current.y0,
                    t.x0,
                    t.y0,
                    prefs.tool === "line",
                  );
                  endStroke();
                }
                shapeStartRef.current = null;
              }
              dragRef.current.mode = null;
              stampAnchorRef.current = null;
              lastPaintKeyRef.current = null;
              endStroke();
            }}
            onPointerLeave={() => {
              setCursor(null);
              setHoverScreen(null);
              if (dragRef.current.mode !== "select") {
                dragRef.current.mode = null;
                endStroke();
              }
            }}
            onAuxClick={(e) => e.preventDefault()}
            onWheel={(e) => {
              e.preventDefault();
              // Ctrl+rueda = zoom; rueda sola = pan vertical; Shift = pan horizontal
              if (e.ctrlKey || e.metaKey) {
                const idx = ZOOM_LEVELS.indexOf(
                  prefs.zoom as (typeof ZOOM_LEVELS)[number],
                );
                if (e.deltaY < 0 && idx < ZOOM_LEVELS.length - 1) {
                  setPrefs((p) => ({ ...p, zoom: ZOOM_LEVELS[idx + 1]! }));
                } else if (e.deltaY > 0 && idx > 0) {
                  setPrefs((p) => ({ ...p, zoom: ZOOM_LEVELS[idx - 1]! }));
                }
                return;
              }
              const speed = e.deltaMode === 1 ? 24 : 1;
              const dx = e.shiftKey ? -e.deltaY * speed : -e.deltaX * speed;
              const dy = e.shiftKey ? 0 : -e.deltaY * speed;
              setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
            }}
          />
          {cursor && hoverScreen && wrapRef.current && (
            <div
              className="me-hover-tip"
              style={{
                left: Math.min(
                  hoverScreen.x -
                    wrapRef.current.getBoundingClientRect().left +
                    12,
                  wrapRef.current.clientWidth - 80,
                ),
                top:
                  hoverScreen.y -
                  wrapRef.current.getBoundingClientRect().top +
                  12,
              }}
            >
              X: {cursor.x} Y: {cursor.y}
            </div>
          )}
          {prefs.showMinimap ? (
            <div className="me-minimap">
              <button
                type="button"
                onClick={() =>
                  setPrefs((p) => ({ ...p, showMinimap: false }))
                }
              >
                ×
              </button>
              <canvas
                ref={miniRef}
                onClick={(e) => {
                  if (!wrapRef.current || !state) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mx = (e.clientX - rect.left) / rect.width;
                  const my = (e.clientY - rect.top) / rect.height;
                  const tx = mx * state.width;
                  const ty = my * state.height;
                  setPan({
                    x:
                      wrapRef.current.clientWidth / 2 -
                      tx * TILE_SIZE * prefs.zoom,
                    y:
                      wrapRef.current.clientHeight / 2 -
                      ty * TILE_SIZE * prefs.zoom,
                  });
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              className="me-btn"
              style={{ position: "absolute", right: 10, bottom: 10, zIndex: 6 }}
              onClick={() => setPrefs((p) => ({ ...p, showMinimap: true }))}
            >
              Minimapa
            </button>
          )}
        </div>

        <div
          className="me-resizer"
          onMouseDown={() => {
            resizeSide.current = "right";
          }}
        />

        {/* RIGHT */}
        <aside className="me-side right">
          <div className="me-tabs">
            {(
              [
                ["tile", "Tile"],
                ["palette", "Paleta"],
                ["npcs", "NPCs"],
                ["objects", "Objetos"],
                ["triggers", "Triggers"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={rightTab === id ? "active" : ""}
                onClick={() => setRightTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {rightTab === "tile" && (
            <div>
              <div style={{ fontSize: 10, color: "var(--me-muted)", marginBottom: 6 }}>
                INFORMACIÓN DEL TILE
              </div>
              {selected && selTile ? (
                <>
                  <div>
                    Coordenadas: <strong>{selected.x}</strong>,{" "}
                    <strong>{selected.y}</strong>
                  </div>
                  <div style={{ margin: "8px 0", color: "var(--me-muted)" }}>
                    Capa activa: {prefs.activeLayer + 1}
                  </div>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <GrhPreview grhIndex={selTile.layers[i]} size={36} />
                      <div>
                        <div>Capa {i + 1}</div>
                        <div style={{ color: "var(--me-muted)" }}>
                          GRH {selTile.layers[i] || "(vacío)"}
                        </div>
                      </div>
                    </div>
                  ))}
                  {covering.length > 0 && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 8,
                        background: "var(--me-panel-2, #1a222d)",
                        borderRadius: 6,
                        border: "1px solid var(--me-border)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--me-muted)",
                          marginBottom: 6,
                        }}
                      >
                        GRÁFICOS QUE CUBREN ESTE TILE
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--me-muted)",
                          marginBottom: 8,
                          lineHeight: 1.35,
                        }}
                      >
                        Capas 2+ se anclan en un solo tile pero dibujan grande.
                        Para borrar, andá al tile ancla.
                      </div>
                      {covering.map((c) => (
                        <div
                          key={`${c.x},${c.y},${c.layer},${c.grh}`}
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <GrhPreview grhIndex={c.grh} size={36} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div>
                              {c.x},{c.y} · Capa {c.layer} · GRH {c.grh}
                            </div>
                            <div style={{ color: "var(--me-muted)", fontSize: 10 }}>
                              {c.width}×{c.height}px
                            </div>
                          </div>
                          <button
                            type="button"
                            className="me-btn"
                            title="Seleccionar tile ancla"
                            onClick={() => {
                              setSelected({ x: c.x, y: c.y });
                              const layer = (c.layer - 1) as 0 | 1 | 2 | 3;
                              setPrefs((p) => ({
                                ...p,
                                activeLayer: layer,
                              }));
                            }}
                          >
                            Ir
                          </button>
                          <button
                            type="button"
                            className="me-btn"
                            title="Borrar ese GRH"
                            onClick={() => {
                              beginStroke();
                              setState((prev) => {
                                if (!prev) return prev;
                                const next = cloneEditorState(prev);
                                next.tiles[c.y - 1]![c.x - 1]!.layers[
                                  c.layer - 1
                                ] = 0;
                                return next;
                              });
                              endStroke();
                            }}
                          >
                            Borrar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: 10, fontSize: 10, color: "var(--me-muted)" }}>
                    PROPIEDADES
                  </div>
                  <PropRow
                    label="Bloqueado"
                    value={selTile.blocked ? "Sí" : "No"}
                    onEdit={() => {
                      beginStroke();
                      setState((prev) => {
                        if (!prev || !selected) return prev;
                        const next = cloneEditorState(prev);
                        const t =
                          next.tiles[selected.y - 1]![selected.x - 1]!;
                        t.blocked = !t.blocked;
                        return next;
                      });
                      endStroke();
                    }}
                    onClear={() => {
                      beginStroke();
                      setState((prev) => {
                        if (!prev || !selected) return prev;
                        const next = cloneEditorState(prev);
                        next.tiles[selected.y - 1]![selected.x - 1]!.blocked =
                          false;
                        return next;
                      });
                      endStroke();
                    }}
                  />
                  <PropRow
                    label="Trigger"
                    value={
                      state.specials.triggers[selKey] != null
                        ? `${state.specials.triggers[selKey]} (${triggerLabel(state.specials.triggers[selKey]!)})`
                        : "—"
                    }
                    onEdit={() => {
                      setRightTab("triggers");
                      setPlaceMode("trigger");
                    }}
                    onClear={() => {
                      beginStroke();
                      setState((prev) => {
                        if (!prev || !selected) return prev;
                        const next = cloneEditorState(prev);
                        delete next.specials.triggers[selKey];
                        return next;
                      });
                      endStroke();
                    }}
                  />
                  <PropRow
                    label="NPC"
                    value={
                      state.specials.npcs[selKey] != null
                        ? String(state.specials.npcs[selKey])
                        : "—"
                    }
                    onEdit={() => {
                      setRightTab("npcs");
                      setPlaceMode("npc");
                    }}
                    onClear={() => {
                      beginStroke();
                      setState((prev) => {
                        if (!prev) return prev;
                        const next = cloneEditorState(prev);
                        delete next.specials.npcs[selKey];
                        return next;
                      });
                      endStroke();
                    }}
                  />
                  <PropRow
                    label="Objeto"
                    value={
                      state.specials.objects[selKey]
                        ? String(state.specials.objects[selKey]!.objIndex)
                        : "—"
                    }
                    onEdit={() => {
                      setRightTab("objects");
                      setPlaceMode("object");
                    }}
                    onClear={() => {
                      beginStroke();
                      setState((prev) => {
                        if (!prev) return prev;
                        const next = cloneEditorState(prev);
                        delete next.specials.objects[selKey];
                        return next;
                      });
                      endStroke();
                    }}
                  />
                  <PropRow
                    label="TileExit"
                    value={
                      state.specials.exits[selKey]
                        ? JSON.stringify(state.specials.exits[selKey])
                        : "—"
                    }
                    onEdit={() => setPlaceMode("exit")}
                    onClear={() => {
                      beginStroke();
                      setState((prev) => {
                        if (!prev) return prev;
                        const next = cloneEditorState(prev);
                        delete next.specials.exits[selKey];
                        return next;
                      });
                      endStroke();
                    }}
                  />
                  {selectedExit && (
                      <Link
                        className="me-btn"
                        href={`/maps/${selectedExit.map}?x=${selectedExit.x}&y=${selectedExit.y}`}
                        style={{ display: "inline-block", marginTop: 6 }}
                        onClick={(e) => {
                          if (
                            dirty &&
                            !confirm("Hay cambios sin guardar. ¿Ir al mapa destino igual?")
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Ir al destino
                      </Link>
                    )}
                </>
              ) : (
                <p style={{ color: "var(--me-muted)" }}>
                  Seleccioná un tile en el mapa
                </p>
              )}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: "var(--me-muted)" }}>
                  Colocar contenido
                </div>
                <div className="me-row-btns">
                  <button
                    type="button"
                    className="me-btn"
                    onClick={() => setPlaceMode("blocked")}
                  >
                    Bloqueo
                  </button>
                  <button
                    type="button"
                    className="me-btn"
                    onClick={() => {
                      setPlaceMode("exit");
                    }}
                  >
                    Salida
                  </button>
                </div>
                {placeMode === "exit" && (
                  <div style={{ display: "grid", gap: 4, marginTop: 6 }}>
                    <input
                      className="me-input"
                      type="number"
                      value={exitTarget.map}
                      onChange={(e) =>
                        setExitTarget((t) => ({
                          ...t,
                          map: Number(e.target.value),
                        }))
                      }
                      placeholder="Mapa"
                    />
                    <input
                      className="me-input"
                      type="number"
                      value={exitTarget.x}
                      onChange={(e) =>
                        setExitTarget((t) => ({
                          ...t,
                          x: Number(e.target.value),
                        }))
                      }
                      placeholder="X"
                    />
                    <input
                      className="me-input"
                      type="number"
                      value={exitTarget.y}
                      onChange={(e) =>
                        setExitTarget((t) => ({
                          ...t,
                          y: Number(e.target.value),
                        }))
                      }
                      placeholder="Y"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {rightTab === "palette" && (
            <div>
              <input
                className="me-input"
                placeholder="Buscar ID / nombre / GRH…"
                value={indicesQ}
                onChange={(e) => setIndicesQ(e.target.value)}
              />
              <div style={{ margin: "8px 0" }}>
                <GrhPreview grhIndex={selectedGrh} size={48} />
                <div style={{ fontSize: 11, marginTop: 4 }}>
                  GRH {selectedGrh}
                  {selectedStamp
                    ? ` · stamp ${selectedStamp.ancho}×${selectedStamp.alto}`
                    : ""}
                </div>
              </div>
              <div style={{ maxHeight: "60vh", overflow: "auto" }}>
                {indices.map((ref) => (
                  <button
                    key={ref.id}
                    type="button"
                    className={`me-list-item ${selectedStamp?.id === ref.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedStamp(ref);
                      setSelectedGrh(ref.grhIndice);
                      setPlaceMode(null);
                      setPrefs((p) => ({ ...p, tool: "stamp" }));
                    }}
                    onDoubleClick={() => {
                      setSelectedStamp(ref);
                      setSelectedGrh(ref.grhIndice);
                      setPrefs((p) => ({ ...p, tool: "stamp" }));
                    }}
                  >
                    <GrhPreview grhIndex={ref.grhIndice} size={32} />
                    <span>
                      <strong>{ref.nombre}</strong>
                      <br />
                      <span style={{ color: "var(--me-muted)" }}>
                        GRH {ref.grhIndice} · {ref.ancho}×{ref.alto}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {rightTab === "npcs" && (
            <div>
              <button
                type="button"
                className={`me-btn ${placeMode === "erase-npc" ? "danger" : ""}`}
                style={{ width: "100%", marginBottom: 8 }}
                onClick={() => {
                  setPlaceMode((mode) => (mode === "erase-npc" ? null : "erase-npc"));
                  setPrefs((p) => ({ ...p, tool: "select" }));
                }}
              >
                Quitar
              </button>
              <input
                className="me-input"
                placeholder="Buscar NPC…"
                value={npcQ}
                onChange={(e) => setNpcQ(e.target.value)}
              />
              <div style={{ maxHeight: "65vh", overflow: "auto", marginTop: 8 }}>
                {filteredNpcs.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={`me-list-item ${selectedNpcId === n.id && placeMode === "npc" ? "active" : ""}`}
                    onClick={() => {
                      setSelectedNpcId(n.id);
                      setPlaceMode("npc");
                      setPrefs((p) => ({ ...p, tool: "select" }));
                    }}
                  >
                    <span>
                      [{n.id}] {n.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {rightTab === "objects" && (
            <div>
              <button
                type="button"
                className={`me-btn ${placeMode === "erase-object" ? "danger" : ""}`}
                style={{ width: "100%", marginBottom: 8 }}
                onClick={() => {
                  setPlaceMode((mode) =>
                    mode === "erase-object" ? null : "erase-object",
                  );
                  setPrefs((p) => ({ ...p, tool: "select" }));
                }}
              >
                Quitar
              </button>
              <input
                className="me-input"
                placeholder="Buscar objeto…"
                value={objQ}
                onChange={(e) => setObjQ(e.target.value)}
              />
              <div style={{ maxHeight: "65vh", overflow: "auto", marginTop: 8 }}>
                {filteredObjs.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`me-list-item ${selectedObjId === o.id && placeMode === "object" ? "active" : ""}`}
                    onClick={() => {
                      setSelectedObjId(o.id);
                      setPlaceMode("object");
                      setPrefs((p) => ({ ...p, tool: "select" }));
                    }}
                  >
                    <GrhPreview grhIndex={o.grhIndex} size={28} />
                    <span>
                      [{o.id}] {o.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {rightTab === "triggers" && (
            <div>
              <button
                type="button"
                className={`me-btn ${placeMode === "erase-trigger" ? "danger" : ""}`}
                style={{ width: "100%", marginBottom: 8 }}
                onClick={() => {
                  setPlaceMode((mode) =>
                    mode === "erase-trigger" ? null : "erase-trigger",
                  );
                  setPrefs((p) => ({ ...p, tool: "select" }));
                }}
              >
                Quitar
              </button>
              {WOAO_TRIGGERS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`me-list-item ${triggerValue === t.value && placeMode === "trigger" ? "active" : ""}`}
                  onClick={() => {
                    setTriggerValue(t.value);
                    setPlaceMode("trigger");
                    setPrefs((p) => ({ ...p, tool: "select" }));
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      background: t.color,
                      borderRadius: 2,
                    }}
                  />
                  <span>
                    <strong>
                      {t.value} — {t.label}
                    </strong>
                    <br />
                    <span style={{ color: "var(--me-muted)", fontSize: 10 }}>
                      {t.description}
                      {t.confirmed ? "" : " (sin confirmar en server)"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>

      <div className="me-status">
        <span>
          Mapa:{" "}
          <strong>
            #{state.id} {state.meta.name}
          </strong>
        </span>
        <span>
          X: <strong>{cursor?.x ?? "—"}</strong> Y:{" "}
          <strong>{cursor?.y ?? "—"}</strong>
        </span>
        <span>
          Capa: <strong>{prefs.activeLayer + 1}</strong>
        </span>
        <span>
          GRH: <strong>{selectedGrh}</strong>
        </span>
        <span>
          Zoom: <strong>{Math.round(prefs.zoom * 100)}%</strong>
        </span>
        <span>
          Vecinos:{" "}
          <strong>
            {prefs.overlays.neighbors && neighbors.length
              ? neighbors.map((n) => `#${n.id}`).join(" ")
              : "—"}
          </strong>
        </span>
        <span>
          Cambios: <strong>{changeCount}</strong>
        </span>
        {selTile && selected && (
          <>
            <span>
              Blocked: <strong>{selTile.blocked ? "Sí" : "No"}</strong>
            </span>
            <span>
              Trigger:{" "}
              <strong>{state.specials.triggers[selKey] ?? "—"}</strong>
            </span>
            <span>
              NPC: <strong>{state.specials.npcs[selKey] ?? "—"}</strong>
            </span>
            <span>
              Obj:{" "}
              <strong>
                {state.specials.objects[selKey]?.objIndex ?? "—"}
              </strong>
            </span>
          </>
        )}
        {selectionRect && (
          <span style={{ color: "#7dd3fc" }}>
            Selección {Math.abs(selectionRect.x2 - selectionRect.x1) + 1}×
            {Math.abs(selectionRect.y2 - selectionRect.y1) + 1} — Ctrl+C / Ctrl+X
          </span>
        )}
        {clipboard && (
          <span>
            Portapapeles: {clipboard.width}×{clipboard.height}
          </span>
        )}
      </div>

      {borderModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setBorderModalOpen(false)}
        >
          <div
            className="me-side"
            style={{
              width: 420,
              maxWidth: "92vw",
              padding: 16,
              borderRadius: 8,
              border: "1px solid var(--me-border)",
              background: "var(--me-bg, #121820)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>
              Auto-colocar bordes / traslados
            </h3>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 12,
                color: "var(--me-muted)",
                lineHeight: 1.4,
              }}
            >
              Escribí el ID del mapa vecino solo en los lados con salida.
              Los cuatro bordes se bloquean. El lado vacío queda cerrado, sin
              traslado. El lado con mapa deja libre la línea de salida. Layout
              clásico AO: N y=
              {AO_BORDER.northY}→{AO_BORDER.northDestY}, S y={AO_BORDER.southY}→
              {AO_BORDER.southDestY}, O x={AO_BORDER.westX}→{AO_BORDER.westDestX}, E
              x={AO_BORDER.eastX}→{AO_BORDER.eastDestX}.
            </p>
            {(
              [
                ["north", "Norte"],
                ["south", "Sur"],
                ["west", "Oeste"],
                ["east", "Este"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  fontSize: 13,
                }}
              >
                <span style={{ width: 56 }}>{label}</span>
                <input
                  className="me-input"
                  type="number"
                  min={1}
                  placeholder="mapa #"
                  value={borderForm[key]}
                  onChange={(e) =>
                    setBorderForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  style={{ flex: 1 }}
                />
              </label>
            ))}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "10px 0 14px",
                fontSize: 12,
              }}
            >
              <input
                type="checkbox"
                checked={borderForm.replaceExisting}
                onChange={(e) =>
                  setBorderForm((f) => ({
                    ...f,
                    replaceExisting: e.target.checked,
                  }))
                }
              />
              Reemplazar traslados previos en esos bordes
            </label>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="me-btn"
                onClick={() => setBorderModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="me-btn primary"
                onClick={applyAutoBorders}
              >
                Colocar bordes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="me-section">
      <div className="me-section-h" onClick={onToggle}>
        <span>{title}</span>
        <span>{collapsed ? "+" : "−"}</span>
      </div>
      {!collapsed && <div className="me-section-b">{children}</div>}
    </div>
  );
}

function PropRow({
  label,
  value,
  onEdit,
  onClear,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  onClear: () => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "70px 1fr auto auto",
        gap: 4,
        alignItems: "center",
        marginBottom: 4,
        fontSize: 11,
      }}
    >
      <span style={{ color: "var(--me-muted)" }}>{label}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </span>
      <button type="button" className="me-btn" onClick={onEdit}>
        Editar
      </button>
      <button type="button" className="me-btn" onClick={onClear}>
        ×
      </button>
    </div>
  );
}
