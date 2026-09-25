# Rediseño del editor de NPCs

Fecha: 2026-09-25  
Fuente: `api/src/jsons/npcs.json`  
Catálogo canónico: `server/src/vars.ts` (`npcType`, `clanNpc`)

## 1. npcTypes reales (`vars.npcType`)

| ID | Clave | Label UI | Rol runtime |
|----|-------|----------|-------------|
| 0 | comun | Común | Default / mayoría |
| 1 | sacerdote | Sacerdote | Click: revivir/curar |
| 2 | guardia | Guardia | Clan label |
| 3 | entrenador | Entrenador | Anti-spell ciudad |
| 4 | banquero | Banquero | Click: banco |
| 5 | noble | Noble | Anti-spell ciudad |
| 6 | dragon | Dragón | Inmune área/paralizar |
| 7 | timbero | Timbero | Anti-spell ciudad |
| 8 | guardiaCaos | Guardia del Caos | Clan |
| 9 | sacerdoteNewbie | Sacerdote newbie | Igual sacerdote |
| 10 | comerciante | Comerciante | Click: trade (`npc.objs`) |
| 12 | subastador | Subastador | Click: mercado |
| 33 | reyCastillo | Rey de castillo | Clan castles |
| 43 | viajero | Viajero | Fast travel |
| 45 | crafter | Crafter | Crafting |
| 61 | defensorFortaleza | Defensor fortaleza | Clan castles |
| 77 | ettinCastillo | Ettin castillo | Clan castles |
| 78 | puertaCastillo | Puerta castillo | Clan castles |

Tipos en JSON fuera de vars (11, 13–32, 60 monturas, etc.): label `Tipo N` / categoría Especiales o Monturas.

**Dato crítico comercio:** ~140 NPCs tienen `comercia=1` con `npcType=0`. Solo 1 tiene `npcType=10`. El runtime de trade exige `npcType === comerciante (10)`, pero el inventario shop se lee de `objs`. La UI trata “comerciante efectivo” = `npcType===10 || comercia===1 || objs.length>0`.

## 2. Categorías de filtro (presentación)

Derivadas de tipos + flags reales (no inventar “Animal” sin tipo):

| Chip | Criterio |
|------|----------|
| Todos | — |
| Comerciantes | `npcType===10 \|\| comercia===1 \|\| objs.length>0` |
| Ciudadanos | tipos servicio 1,3,4,5,7,9 |
| Guardias | 2, 8 |
| Monstruos | `npcType===6 \|\| (npcType===0 && (hostile\|\|movement===3\|\|exp>0))` |
| Monturas | `npcType===60` (plantillas montura en datos) |
| Especiales | castle / viajero / crafter / subastador / tipos fuera de mapa |
| Comunes | resto `npcType===0` pacíficos |

## 3. Campos por rol / tabs

| Tab | Cuándo |
|-----|--------|
| Comercio | comerciante efectivo |
| Drops | siempre disponible; priorizar monstruos |
| Diálogo | `desc` |
| Atributos | combate/stats (priorizar monstruos/guardias) |
| Hechizos | si tiene o puede tener spells |
| Apariencia | siempre |
| Avanzado | siempre |

## 4. Movement

Único valor con semántica clara en server: **`3` = AI combate/persecución**.  
Otros (0,1,2,4,5,10,11) existen en datos sin documentación → UI: `Combate / persecución` para 3, `Movimiento N` para el resto.

## 5. Flags (0/1)

- `hostile`, `attackable`, `comercia`, `aguaValida`, `tierraInvalida`
- Switches en UI; storage numérico

## 6. `objs` (comercio)

`{ item: number, cant: number }` — **sin precio**. Mostrar `valor` del objeto como referencia de precio de catálogo (solo lectura).

## 7. `drop`

`{ item, cant, chancePercent? }` (+ aliases chance/probabilidad en server). UI: 0–100%.

## 8. `spells`

`[{ idSpell: number }]` (+ `cooldownSeconds?` tipado, raro en datos).

## 9. Body / Head

`frontend/public/init/bodies.json`, `heads.json` vía `developer/lib/graphics/sprites.ts`. Preview: GRH heading `"2"` (Down), igual que `Engine.DIRECTIONS.DOWN` (1=Up, 2=Down, 3=Right, 4=Left).

## 10. Referencias

- `server/mapas_source/*/npcs.json` y `api/.../mapas_source`
- `specials.json` clave npcs
- `quests.json` / `questGivers.json`

## 11. Round-trip

Igual que objetos: merge superficial, no borrar keys ocultas, draft create/duplicate sin write hasta Guardar, `findNpcReferences` antes de DELETE.

## 12. Archivos

- `developer/docs/NPC_EDITOR_REDESIGN.md`
- `developer/lib/game-data/npcs/*` (sin fs en barrel)
- `developer/components/npcs/{NpcList,NpcEditor,NpcCreateWizard,NpcSpritePreview,NpcTypeBadge}`
- `developer/components/pickers/{ObjectPicker,SpellPicker,BodyHeadPicker}`
- APIs: `/api/npcs`, `/api/npcs/[id]`, `/api/npcs/meta`, `/api/npcs/[id]/references`, `/api/npcs/sprite`
- Rutas UI: `/npcs`, `/npcs/new`, `/npcs/[id]`
- `developer/components/pickers/ObjectPicker`, `SpellPicker`
- `developer/components/npcs/*`
- APIs `npcs/meta`, `npcs/[id]/references`
