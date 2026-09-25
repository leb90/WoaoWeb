# World of Argentum — Developer Tools Architecture

App interna de desarrollo/administración. **No** forma parte del frontend público.
Solo localhost: `http://127.0.0.1:3200`.

Alcance: recursos del stack **nuevo** (JSON / mapas_source / init gráficos).  
No se editan formatos legacy (`old/`, `.dat`, WorldEditor MAPVER) excepto como referencia de diseño para el mapper futuro (`Recursos/indices.ini`).

---

## 1. Fuentes de datos encontradas

### 1.1 Catálogos de juego (seed JSON)

| Recurso | Ruta canónica (seed) | Runtime real |
|---------|----------------------|--------------|
| Objetos | `api/src/jsons/objs.json` | Postgres `game_objects` → game server vía `/internal/game-data/objects` |
| NPCs | `api/src/jsons/npcs.json` | Postgres `game_npcs` → `/internal/game-data/npcs` |
| Crafting | `api/src/jsons/craftingRecipes.json` | Postgres → `/internal/game-data/crafting-recipes` |
| Smelting | `api/src/jsons/smeltingRecipes.json` | Postgres → `/internal/game-data/smelting-recipes` |
| Balance | `api/src/jsons/balance.json` | Postgres → `/internal/game-data/balance` |
| Spells | `api/src/jsons/spells.json` **y** `server/jsons/spells.json` | Game server carga **solo** `server/jsons/spells.json` al startup |

Tipos / normalización: `api/src/lib/gameData.ts`  
(`GameObjectRecordData`, `GameNpcRecordData`, crafting/smelting).

### 1.2 Mapas

| Copia | Ruta | Consumidor |
|-------|------|------------|
| **Runtime juego** | `server/mapas_source/mapa_N/` (~313) | `server/src/loadMaps.ts`, `mapNpcStorage.ts` |
| Wiki / API | `api/src/mapas_source/mapa_N/` (~294) | `api/src/repositories/wiki.ts` |
| Cliente | `frontend/public/maps*` / `maps_optimized` | `frontend/utils/gameLoader.ts` (exportados, no editables) |

Por mapa (fuente editable):

- `meta.json` — id, name, music, zona, pk, flags
- `terrain.json` — `width`/`height` (100×100), `palette` (id → graphics capas + blocked), `rows` matriz de palette ids
- `specials.json` — exits, objects, npcs (inline), triggers (keys `"x,y"` 1-based)
- `npcs.json` — placements canónicos `[{ mapNum, x, y, npcIndex, movement? }]`

**Decisión developer:** editar **`server/mapas_source`** como fuente de verdad del juego.  
Opcionalmente sincronizar a `api/src/mapas_source` más adelante (wiki). No crear `developer/maps/`.

### 1.3 Gráficos e índices

| Asset | Ruta | Uso |
|-------|------|-----|
| GRH DB | `frontend/public/init/graficos_optimized.json` (+ legacy `graficos.json`) | Resolve `grhIndex` → `{numFile,sX,sY,w,h}` |
| Atlases | `frontend/public/graphics/{numFile}.png` | Textura real |
| Bodies/Heads/… | `frontend/public/init/{bodies,heads,armas,cascos,escudos}.json` | Preview NPC / personaje |
| Objs/NPCs slim cliente | `frontend/public/init/objs.json`, `npcs.json` | HUD; regenerar con scripts de export |
| **Presets mapper** | `Recursos/indices.ini` | Paleta de stamps (Nombre, GrhIndice, Ancho, Alto). **No** lo carga el runtime. Migrar/usar en FASE 2 del mapeador. |

Pipeline: `grhIndex` → `graphicsDB[id]` → `/graphics/{numFile}.png` (+ crop).  
Código a reutilizar: `frontend/utils/gameLoader.ts`, `frontend/types/game.ts`.

### 1.4 Otros

- Quests: `server/jsons/quests.json`, `questGivers.json` (no en `api/src/jsons/`).
- No existe carpeta `developer/` previa a este documento.

---

## 2. Loaders actuales

### API (`api/`)

- Seed: `api/src/lib/gameData.ts` → `loadSeedObjectsJson` / Npcs / Crafting / Smelting.
- Persistencia: `api/src/repositories/game*.ts` + `game_data_revisions`.
- Admin CRUD: `/admin/game-data/*`.
- Sync server: `/internal/game-data/*/changes?sinceVersion=N`.
- Import forzado: `pnpm -C api import-game-data`.

### Game server (`server/`)

| Loader | Fuente | Hot reload |
|--------|--------|------------|
| `loadObjs` | API sync | `/recargarobjs` |
| `loadNpcs` | API + placements mapa | `/recargarnpcs` |
| `loadBalance` | API | `/recargarbalance` |
| `loadCraftingRecipes` | local + API overlay | `/recargarcrafting` |
| `loadSmeltingRecipes` | API | **sin** comando dedicado |
| `loadSpells` | `server/jsons/spells.json` | **reinicio** |
| `loadMaps` | `server/mapas_source` | **reinicio** |
| Quests | `server/jsons/*` | **reinicio** |

Sync: `server/src/gameDataSync.ts`.

### Frontend

- `loadGraphicsDB`, `getTexturePath`, decompress maps/objs: `frontend/utils/gameLoader.ts`.
- Tras cambios visibles: `exportClientObjs` / `exportFrontendNpcs` + hard refresh.

---

## 3. Formato real de mapas (resumen)

```
terrain.palette["1"] = { graphics: [grhCapa1, grhCapa2, ...] | number, blocked?: boolean }
terrain.rows[y][x] = paletteId   // 0-based indices; coords UI 1-based
specials.exits["9,7"] = { map, x, y } | { destinations: [...] }
specials.objects["15,12"] = { objIndex, amount }
specials.triggers["29,21"] = number
npcs.json[] = { mapNum, x, y, npcIndex }
```

Capas gráficas = IDs de GRH (no IDs de `indices.ini`).  
`indices.ini` aporta **presets** multi-tile: GrhIndice base + Ancho×Alto → rango consecutivo de GRHs.

---

## 4. Dependencias entre entidades

```
objs.grhIndex ──────────────► graficos[grhIndex]
objs.spellIndex ────────────► spells[id]
objs indexAbierta/Cerrada ──► objs[id]

npcs.objs[].item / drop[].item ► objs[id]
npcs.spells[].idSpell ────────► spells[id]
npcs.idBody / idHead ─────────► bodies.json / heads.json

crafting / smelting *ItemId ──► objs[id]

map palette.graphics ─────────► grh indices
map specials.objects ─────────► objs[id]
map npcs placements ──────────► npcs[id]
map exits.map ────────────────► mapa existente
```

Reglas de validación (FASE 1+) se derivan de estas referencias; no inventar campos.

---

## 5. Qué requiere reinicio / recarga

| Cambio | Seed JSON | Runtime | Cliente |
|--------|-----------|---------|---------|
| objs / npcs / crafting / balance | Editar `api/src/jsons/*` | `import-game-data` + `/recargar*` (o reinicio server) | Export slim + refresh si afecta HUD |
| smelting | idem | import + reinicio o sync API (sin `/recargar` dedicado) | — |
| spells | Escribir **ambos** `api` + `server` jsons (mantener sync) | **Reiniciar game server** | Refresh si usa `init/spells.json` |
| mapas (`server/mapas_source`) | — | **Reiniciar game server** | Re-export maps + refresh |
| gráficos / bodies | — | — | Refresh / bump `?v=` |

La UI developer muestra el aviso correspondiente al guardar.  
No se implementa hot-reload ficticio.

---

## 6. Arquitectura propuesta `developer/`

```
developer/
  ARCHITECTURE.md          ← este documento
  package.json             ← Next.js + TS, puerto 3200, host 127.0.0.1
  .env / .env.example      ← DEVELOPER_* (gitignored .env)
  .backups/                ← copias pre-write (gitignored)
  .data/                   ← admins hasheados, audit log (gitignored secrets)
  app/                     ← App Router UI + Route Handlers
  lib/
    game-data/             ← read/write whitelist a api/src/jsons (+ spells server)
    maps/                  ← FASE 2: server/mapas_source
    graphics/              ← resolve GRH vía frontend/public/init
    security/              ← auth, sessions, path allowlist
    validation/            ← reglas derivadas del consumo real
  components/
```

### Principios

1. **Una fuente de verdad:** editar los JSON/mapas del repo; nunca `developer/data/objs.json` duplicado.
2. **Escritura solo en servidor** (Route Handlers). Whitelist de rutas absolutas resueltas bajo el repo.
3. **Backups atómicos:** `.backups/<timestamp>_<resource>/` → write temp → validate → rename.
4. **Auth obligatoria** en páginas y APIs. Password con bcrypt; sesión httpOnly firmada.
5. **Bind:** `next dev --hostname 127.0.0.1 --port 3200`. Sin docker-compose / Caddy / dominio.
6. **Gráficos:** leer `graficos_optimized.json` + servir PNG desde `frontend/public/graphics` (rewrite/static), reutilizando la semántica de `getTexturePath`.
7. **Mapper FASE 2:** paleta desde `Recursos/indices.ini`; canvas sobre `server/mapas_source`.

### Stack

- Next.js (misma familia que `frontend/`) + TypeScript estricto + Tailwind.
- Sin dependencia de runtime a la API/Postgres para editar seeds (lectura/escritura FS).  
  Nota en UI: para probar en juego hay que importar/recargar.

### Fases

| Fase | Entrega |
|------|---------|
| **0** | Este documento + análisis |
| **1** | App + auth + dashboard + objs + NPCs + validación básica + backups + spells/crafting/balance lectura-edición básica + git status |
| **2** | Editor visual de mapas (capas, tools, undo/redo, indices.ini) — **implementado** en `/maps/[id]` |

---

## 7. Seguridad (resumen)

- Host `127.0.0.1` únicamente.
- `DEVELOPER_ADMIN_USER` / `DEVELOPER_ADMIN_PASSWORD` → hash bcrypt en `.data/admins.json` al primer boot.
- Cookie de sesión firmada (`DEVELOPER_SESSION_SECRET`).
- Allowlist: solo paths bajo `api/src/jsons`, `server/jsons/spells.json`, `server/mapas_source`, lecturas de `frontend/public/init|graphics`, `Recursos/indices.ini`.
- Audit log: usuario, acción, tipo, id, fecha, archivo.

---

## 8. Comando de arranque

```bash
corepack pnpm -C developer install
# configurar developer/.env (ver .env.example)
corepack pnpm -C developer dev
```

URL: **http://127.0.0.1:3200**

No agregar a `docker-compose.hostinger.yml` ni Caddyfile.
