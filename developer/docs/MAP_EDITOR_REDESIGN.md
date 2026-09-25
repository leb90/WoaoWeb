# Map Editor Redesign

Documento de rediseño del editor de mapas en `developer/`.  
**No reemplaza** `ARCHITECTURE.md`; lo complementa.

Fecha: 2026-09-24

---

## 1. Componentes actuales

| Pieza | Ruta | Rol |
|-------|------|-----|
| UI monolítica | `developer/components/maps/MapEditor.tsx` (~1100 líneas) | Estado + canvas + paneles + pintura |
| Listado | `developer/app/(app)/maps/page.tsx` | Tabla de mapas → `/maps/[id]` |
| Página editor | `developer/app/(app)/maps/[id]/page.tsx` | Monta `MapEditor` |
| API list/load/save | `developer/app/api/maps/route.ts`, `[id]/route.ts` | GET/PUT |
| Índices | `developer/app/api/maps/indices/route.ts` | Paleta `Recursos/indices.ini` |
| GRH batch | `developer/app/api/graphics/batch/route.ts` | Metadatos GRH para canvas |
| Tipos | `developer/lib/maps/types.ts` | `EditorMapState`, tools, specials |
| Terrain | `developer/lib/maps/terrain.ts` | Expand/collapse palette, flood fill |
| IO | `developer/lib/maps/io.ts` | Load/save `server/mapas_source` |
| Indices parser | `developer/lib/maps/indices.ts` | Parse INI |
| Preview UI | `developer/components/ui/GrhPreview.tsx` | Thumbnails |

Shell app: `AppShell` (nav global). El editor hoy vive *dentro* del main con paneles propios.

---

## 2. Renderer actual

- **Canvas 2D** único (`HTMLCanvasElement`), no React-por-tile.
- Tile size **32px**. Coords UI **1-based**; matriz interna **0-based**.
- Capas 1–2: ancla top-left.
- Capas 3–4 + objetos: ancla bottom + centrado X (`getBottomAnchoredGraphicPosition`).
- Overlay bloqueos (rojo), markers N/O/E/T.
- Viewport culling por pan/zoom.
- Cache: `grhCache` + `imageCache` (PNG por `numFile`).

---

## 3. Modelo de mapa (sin cambios)

Fuente de verdad runtime: **`server/mapas_source/mapa_N/`**  
(no `api/src/mapas_source`; esa copia es wiki).

| Archivo | Contenido |
|---------|-----------|
| `meta.json` | id, name, zona, pk, music… |
| `terrain.json` | width/height, palette, rows |
| `specials.json` | exits, objects, npcs, triggers (`"x,y"` 1-based) |
| `npcs.json` | placements canónicos sync con specials.npcs |

In-memory: `EditorMapState` (`tiles[][].layers[4]`, `blocked`, `specials`).

---

## 4. Capas

| Índice editor | Capa juego | Ancla |
|---------------|------------|-------|
| 0 | 1 Floor | tile |
| 1 | 2 | tile |
| 2 | 3 | bottom |
| 3 | 4 Roof | bottom |

Hoy: visibilidad por checkbox. Falta: Solo, Lock, Opacidad, “Mostrar/Ocultar todas”.

---

## 5. Overlays actuales

Bloqueos, grilla, markers NPC/Obj/Exit/Trigger (siempre on si hay datos).  
Falta: toggles independientes, spawns, especiales, coordenadas, GRH IDs, colores tipados.

---

## 6. Triggers reales (WoAO stack nuevo)

Valores presentes en `server/mapas_source` (~conteo global):

| Valor | Uso detectado en código nuevo | Notas |
|-------|-------------------------------|-------|
| **1** | Bajo techo / interior (`Engine.ts`: `trigger === 1` o capa 4) | Muy frecuente |
| **2** | Presente en mapas; en cliente viejo también “bajo techo” | Sin rama dedicada en server nuevo aún |
| **3** | Presente en mapas | En AO viejo anti-respawn NPC; **no inventar** semántica nueva |
| **4** | **Cárcel** (`game.ts` `isJailTile`) | También techo en cliente viejo |
| **5** | Presente en mapas | Sin handler dedicado encontrado |
| **6** | **Zona segura** (`safeZone.ts`) | Confirmado |
| **11** | Pesca inválida (`vars.fishing.invalidTrigger`) | No aparece en specials actuales |

El editor debe listar **1–6** (los usados en mapas) + permitir valor numérico libre, con labels solo donde el código nuevo lo confirma.

---

## 7. NPCs / Objetos / TileExit

- **NPCs**: `specials.npcs["x,y"] = npcIndex` + `npcs.json` al guardar.
- **Objetos**: `specials.objects["x,y"] = { objIndex, amount }`.
- **TileExit**: `specials.exits["x,y"] = { map, x, y }` o `{ destinations: [...] }`.
- Catálogos vía API al cargar el mapa (`listNpcSummaries` / `listObjectSummaries`).

Hoy se colocan con “herramientas” npc/object/exit/trigger. El rediseño mueve eso a **tabs del inspector**, no al grid de tools base.

---

## 8. Limitaciones actuales (UX)

- UI monolítica, poco “WorldEditor”.
- NPC/Obj/Exit/Trigger mezclados como tools de terreno.
- Sin modos de vista (Normal/Colisiones/Gameplay/…).
- Sin minimapa, rulers, status bar, prefs persistidas.
- Sin lock/solo/opacidad por capa.
- Sin rectángulo/línea (tools pedidas).
- Inspector pobre; paleta indices.ini básica.

---

## 9. Cambios propuestos (sin romper datos)

### Layout
```
[ App nav ] [ Tools/Layers/Overlays | Canvas + minimap | Inspector tabs ]
[ Status bar ]
```

### Reutilizar
- `EditorMapState`, IO, expand/collapse, flood fill, undo stack, batch GRH, anclas de dibujo, API maps.

### Extraer
- `mapCanvasRenderer.ts` — paint frame puro.
- `useMapEditorController` — load/save/history/paint.
- `mapEditorPrefs.ts` — localStorage (UI only).
- Paneles: `MapToolsPanel`, `MapLayersPanel`, `MapOverlaysPanel`, `MapInspector`, `MapStatusBar`, `MapMinimap`.

### Tools base
`select | brush | eraser | fill | stamp | rect | line`  
Placement content: modos desde tabs (npc/object/exit/trigger/blocked).

### Prefs (localStorage)
zoom, vista, overlays, capas visibles/lock/opacity, capa activa, anchos paneles, última tool.  
**Nunca** el mapa.

### Fuente mapas
Seguir escribiendo **`server/mapas_source`**.

---

## 10. Fases de implementación

| Fase | Entrega |
|------|---------|
| **1** | Layout + tools + capas (👁 S 🔒 opacity) + overlays + inspector tile + status bar |
| **2** | Vistas + minimapa + filtros trigger + shortcuts + resize paneles |
| **3** | Tabs Paleta/NPC/Obj/Triggers + rect/línea + debug hover + optimización draw |

---

## 11. No hacer

- No nuevo formato de mapas.
- No duplicar `developer/maps/` como fuente.
- No Pixi obligatorio (seguir canvas 2D).
- No deploy/docker/Caddy.
- No mocks de datos.
