"use client";

import "@/app/map-editor.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GrhPreview } from "@/components/ui/GrhPreview";
import {
  findCoveringGraphics,
  renderMapFrame,
  renderMinimap,
  type GrhMeta,
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
type PlaceMode = "blocked" | "npc" | "object" | "exit" | "trigger" | null;
type RightTab = "tile" | "palette" | "npcs" | "objects" | "triggers";
type TileClipboard = {
  width: number;
  height: number;
  tiles: EditorTile[][];
};

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.5, 2] as const;

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
  const [prefs, setPrefs] = useState<MapEditorPrefs>(() =>
    typeof window !== "undefined" ? loadMapEditorPrefs() : DEFAULT_PREFS,
  );
  const [state, setState] = useState<EditorMapState | null>(null);
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
  const [spaceDown, setSpaceDown] = useState(false);
  const [massSelectMode, setMassSelectMode] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
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
  const massSelectStartRef = useRef<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{
    mode: "pan" | "paint" | null;
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
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
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
    void ensureGrhs([...need]);
  }, [state, objects, npcs, selectedGrh, selectedStamp, ensureGrhs]);

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
        floodFillLayer(
          next.tiles,
          next.width,
          next.height,
          x0,
          y0,
          layer,
          selectedGrh,
        );
        return;
      }
      if ((mode === "stamp" || mode === "brush") && selectedStamp && mode === "stamp") {
        const grid = expandStampGrhs(selectedStamp);
        for (let dy = 0; dy < grid.length; dy++) {
          for (let dx = 0; dx < grid[dy]!.length; dx++) {
            const tx = x0 + dx;
            const ty = y0 + dy;
            if (tx >= next.width || ty >= next.height) continue;
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
            if (tx >= next.width || ty >= next.height) continue;
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

  const copySelectionToClipboard = useCallback(
    (rect: { x1: number; y1: number; x2: number; y2: number }) => {
      const cur = stateRef.current;
      if (!cur) return;
      const minX = Math.min(rect.x1, rect.x2);
      const maxX = Math.max(rect.x1, rect.x2);
      const minY = Math.min(rect.y1, rect.y2);
      const maxY = Math.max(rect.y1, rect.y2);
      const tiles: EditorTile[][] = [];
      for (let y = minY; y <= maxY; y++) {
        const row: EditorTile[] = [];
        for (let x = minX; x <= maxX; x++) {
          const t = cur.tiles[y - 1]![x - 1]!;
          row.push({
            layers: [...t.layers] as [number, number, number, number],
            blocked: t.blocked,
          });
        }
        tiles.push(row);
      }
      setClipboard({
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        tiles,
      });
      setMessage(
        `Copiado ${maxX - minX + 1}×${maxY - minY + 1} tiles (Ctrl+V para pegar)`,
      );
    },
    [],
  );

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
            const tx = x1 - 1 + dx;
            const ty = y1 - 1 + dy;
            if (tx < 0 || ty < 0 || tx >= next.width || ty >= next.height)
              continue;
            const src = clipboard.tiles[dy]![dx]!;
            next.tiles[ty]![tx] = {
              layers: [...src.layers] as [number, number, number, number],
              blocked: src.blocked,
            };
          }
        }
        return next;
      });
      endStroke();
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
    if (!form.north && !form.south && !form.east && !form.west) {
      setMessage("Indicá al menos un mapa vecino");
      return;
    }
    const cur = stateRef.current;
    if (!cur) return;
    beginStroke();
    const { state: next, placed, cleared } = applyBorderExits(cur, form);
    setState(next);
    setMessage(
      `Bordes: ${placed} traslados` +
        (cleared ? ` (${cleared} previos reemplazados)` : ""),
    );
    endStroke();
    setBorderModalOpen(false);
  }, [borderForm, beginStroke, endStroke]);

  const placementPreview = useMemo(() => {
    if (!cursor) return null;
    if (placeMode) return null;
    if (massSelectMode) return null;
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
    massSelectMode,
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
  ]);

  // Minimap
  useEffect(() => {
    const mini = miniRef.current;
    const wrap = wrapRef.current;
    if (!mini || !wrap || !state || !prefs.showMinimap) return;
    const ctx = mini.getContext("2d");
    if (!ctx) return;
    mini.width = 140;
    mini.height = 140;
    renderMinimap(
      ctx,
      state,
      pan,
      prefs.zoom,
      wrap.clientWidth,
      wrap.clientHeight,
      140,
      140,
    );
  }, [state, pan, prefs.zoom, prefs.showMinimap]);

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

      if (e.code === "Space") setSpaceDown(true);
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
        setMassSelectMode(true);
        setPlaceMode(null);
        setPrefs((p) => ({ ...p, tool: "select" }));
        setMessage("Selección en masa: arrastrá un rectángulo (Ctrl+V pega)");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        if (!clipboard || !cursor) return;
        e.preventDefault();
        pasteClipboardAt(cursor.x, cursor.y);
      }
      if (e.key === "Escape") {
        setPlaceMode(null);
        setMassSelectMode(false);
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
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") setSpaceDown(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo, clipboard, cursor, pasteClipboardAt]);

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
            setMassSelectMode(true);
            setPlaceMode(null);
            setPrefs((p) => ({ ...p, tool: "select" }));
            setMessage("Selección en masa: arrastrá un rectángulo");
          }}
          title="Ctrl+C — selección en masa"
          style={
            massSelectMode
              ? { outline: "1px solid var(--me-accent, #3d8bfd)" }
              : undefined
          }
        >
          Selección
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
                    if (t.id !== "stamp") setSelectedStamp(null);
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
                Modo colocación: {placeMode} (Esc cancela)
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
              if (
                e.button === 1 ||
                e.button === 2 ||
                spaceDown ||
                (e.button === 0 && e.shiftKey)
              ) {
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

              if (massSelectMode) {
                massSelectStartRef.current = { x: t.x, y: t.y };
                setSelectionRect({ x1: t.x, y1: t.y, x2: t.x, y2: t.y });
                dragRef.current = {
                  mode: "paint",
                  lastX: e.clientX,
                  lastY: e.clientY,
                };
                return;
              }

              if (prefs.tool === "select" && !placeMode) {
                setSelected({ x: t.x, y: t.y });
                dragRef.current = {
                  mode: "pan",
                  lastX: e.clientX,
                  lastY: e.clientY,
                };
                return;
              }

              setSelected({ x: t.x, y: t.y });
              if (prefs.tool === "rect" || prefs.tool === "line") {
                shapeStartRef.current = { x0: t.x0, y0: t.y0 };
                return;
              }
              beginStroke();
              applyAt(t.x0, t.y0);
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
              } else if (
                drag.mode === "paint" &&
                massSelectMode &&
                massSelectStartRef.current &&
                t
              ) {
                setSelectionRect({
                  x1: massSelectStartRef.current.x,
                  y1: massSelectStartRef.current.y,
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
                applyAt(t.x0, t.y0);
              }
            }}
            onPointerUp={(e) => {
              if (massSelectMode && massSelectStartRef.current) {
                const t = screenToTile(e.clientX, e.clientY);
                const start = massSelectStartRef.current;
                const end = t ? { x: t.x, y: t.y } : start;
                const rect = {
                  x1: start.x,
                  y1: start.y,
                  x2: end.x,
                  y2: end.y,
                };
                setSelectionRect(rect);
                copySelectionToClipboard(rect);
                massSelectStartRef.current = null;
                setMassSelectMode(false);
                dragRef.current.mode = null;
                endStroke();
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
              endStroke();
            }}
            onPointerLeave={() => {
              setCursor(null);
              setHoverScreen(null);
              dragRef.current.mode = null;
              endStroke();
            }}
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
                    onClear={() => eraseSpecialAt(selected.x, selected.y)}
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
                    onClear={() => eraseSpecialAt(selected.x, selected.y)}
                  />
                  <PropRow
                    label="TileExit"
                    value={
                      state.specials.exits[selKey]
                        ? JSON.stringify(state.specials.exits[selKey])
                        : "—"
                    }
                    onEdit={() => setPlaceMode("exit")}
                    onClear={() => eraseSpecialAt(selected.x, selected.y)}
                  />
                  {state.specials.exits[selKey] &&
                    "map" in (state.specials.exits[selKey] as object) && (
                      <Link
                        className="me-btn"
                        href={`/maps/${(state.specials.exits[selKey] as { map: number }).map}`}
                        style={{ display: "inline-block", marginTop: 6 }}
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
        {massSelectMode && (
          <span style={{ color: "#7dd3fc" }}>
            Selección en masa activa — arrastrá
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
              Escribí el ID del mapa vecino en cada lado (vacío = no tocar).
              Usa el layout clásico AO: N y={AO_BORDER.northY}→{AO_BORDER.northDestY},
              S y={AO_BORDER.southY}→{AO_BORDER.southDestY}, O x={AO_BORDER.westX}→
              {AO_BORDER.westDestX}, E x={AO_BORDER.eastX}→{AO_BORDER.eastDestX}.
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
                Colocar traslados
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
