# Rediseño del editor de Quests

Fecha: 2026-09-25  
Fuentes canónicas: `server/jsons/quests.json`, `server/jsons/questGivers.json`, `api/src/jsons/npcs.json`  
Espejo cliente: `frontend/public/init/woao/quests.json` (debe permanecer idéntico a server)  
Runtime: `server/src/quests.ts`, progreso en `woaoProgress` (`progress.done`, `progress.quests`)

## 1. Ubicación real de Quest.json

| Archivo | Rol |
|---------|-----|
| `server/jsons/quests.json` | **Fuente de verdad del Game Server** (`require` en `quests.ts`) |
| `frontend/public/init/woao/quests.json` | Copia espejo (hoy idéntica; el convertidor histórico escribe ambas) |
| `api/src/jsons/quests.json` | **No existe** (referencias del editor de NPCs lo miran por si aparece) |

**No hay DB.** No migrar a Postgres.

Conteo actual: **31** quests. Todas tienen `requiredLevel: 1`. IDs 1–31, `key === id` en todos los casos.

## 2. Loader actual

```ts
const jsonQuests = require("../jsons/quests.json");
const jsonQuestGivers = require("../jsons/questGivers.json");

export function initialize() {
  quests.clear();
  for (const quest of Object.values(jsonQuests)) {
    quests.set(Number(quest.id), quest);
  }
  questGivers.clear();
  for (const [npcId, questNumber] of Object.entries(jsonQuestGivers)) {
    questGivers.set(Number(npcId), Number(questNumber));
  }
}
```

- Carga al arranque del proceso Node del Game Server.
- **No existe** comando `/recargarquests` ni hot-reload.
- Tras editar JSON → **reiniciar Game Server**.
- El frontend consumirá su copia al recargar assets/cliente.

## 3. Modelo Quest actual

```json
{
  "24": {
    "id": 24,
    "name": "Caza de Gollum",
    "desc": "Debes matar 3 Gollum, serás recompensado.",
    "requiredLevel": 1,
    "requiredNpcs": [{ "index": 594, "amount": 3 }],
    "requiredObjs": [],
    "rewardGold": 20000,
    "rewardExp": 3000000,
    "rewardPoints": 50,
    "rewardObjs": []
  }
}
```

Campos reales: `id`, `name`, `desc`, `requiredLevel`, `requiredNpcs`, `requiredObjs`, `rewardGold`, `rewardExp`, `rewardPoints`, `rewardObjs`.

**No existen** en datos ni runtime: `type`, `category`, `active`, `sortOrder`, `trainerNpcId`, Principal/Secundaria/Evento.

**Único campo nuevo autorizado:** `repeatable: boolean`.

## 4. requiredNpcs

Array de `{ index: number, amount: number }` donde `index` es el **ID de plantilla NPC** en `npcs.json` (ej. Gollum = 594).

Server: al matar, `onNpcKilled(idUser, npcTemplateIndex)` incrementa `progress.quests[].npcsKilled[i]` alineado por índice en el array.

## 5. requiredObjs

Array de `{ index, amount }` — IDs de objeto en `objs.json`. Al terminar se restan del inventario.

## 6. Rewards

- `rewardGold` → `user.gold`
- `rewardExp` → `user.exp` + `checkUserLevel`
- `rewardPoints` → `progress.puntosCanje` / `user.puntosCanje`
- `rewardObjs[]` → `putItemToInv` (valida slots libres)

## 7. Progreso de quest

En progreso del personaje (`getProgress` / `saveProgress`):

- `quests[]`: activas — `{ questIndex, npcsKilled: number[] }`
- `done: number[]`: IDs de quests **completadas** (no repetibles)
- `lastQuestOffer`: última oferta vía `/quest`

Flujo: `/quest` cerca del NPC → oferta → `/questaceptar` → progreso → `/quest` de nuevo cuando ready → `finishQuest`.

## 8. Finalización

`finishQuest`: valida objetivos, quita objetos requeridos, entrega recompensas, **saca** la quest de `progress.quests` y **empuja** el id a `progress.done` (si no estaba).

Hoy eso **bloquea** re-aceptar (`handleQuest` y `getNpcQuestStatusForUser` miran `done.includes`).

## 9. Relación NPC ↔ Quest (mecanismo REAL)

Dos capas sincronizadas en datos actuales:

1. **`npc.questNumber`** en `api/src/jsons/npcs.json` (campo numérico; 1 NPC → **una** quest).
2. **`questGivers.json`**: mapa `npcId → questNumber` (34 entradas). Algunas quests tienen **varios** givers (ej. quest 3 → NPCs 24, 36, 327).

Runtime (`getNpcQuestNumber`):

```ts
const fromNpc = Number(npc?.questNumber ?? 0);
if (fromNpc > 0) return fromNpc;
return questGivers.get(Number(npc?.templateNpcIndex ?? 0)) ?? 0;
```

**Prioridad:** `questNumber` del NPC vivo/plantilla; fallback `questGivers` por `templateNpcIndex`.

**NO inventar** `trainerNpcId` dentro de Quest.json.

El Developer Tool debe al asignar/desasignar:

- set/clear `npc.questNumber`
- set/delete entrada en `questGivers.json`

Un NPC solo puede entregar **una** quest. Si ya tiene otra → advertir reemplazo.

## 10. Comportamiento del NPC entrenador / entregador

- NPCs de quest tipicamente `npcType: 0`, `attackable: 0`, `hostile: 0`, `questNumber: N`, `desc` con texto de misión.
- Ubicación en mapa: spawns en `server/mapas_source/mapa_*/npcs.json` (`npcIndex`, `x`, `y`, `mapNum`). Ej. NPC 367 (Quest 24) → mapa 34 @ 29,61.
- Developer puede mostrar ubicación vía scan de mapas (ya usado en referencias de NPCs) y link `/maps/{id}`.

## 11. Estrategia `repeatable`

- Ausente en JSON → interpretar **`false`** (sin migración masiva).
- Al guardar una quest editada → persistir `repeatable` explícito.
- Server:
  - `repeatable !== true` → comportamiento actual (`done`).
  - `repeatable === true` → en `finishQuest` **no** agregar a `done` (y limpiar si estuviera); en oferta/status tratar como disponible tras completar.

## 12. Reload / restart

| Cambio | Acción |
|--------|--------|
| `quests.json` / `questGivers.json` | Reiniciar **Game Server** |
| `npcs.json` | Reiniciar / recargar NPCs según pipeline actual |
| `frontend/.../quests.json` | Recarga cliente / assets |

Hints UI: “Reiniciar Game Server para aplicar quests”.

## 13. Guardado atómico

Operaciones que tocan quests + givers + (opcional) npcs:

1. Validar en memoria  
2. `createBackup` de todos los paths  
3. Preparar JSON finales  
4. Escribir temporales  
5. Validar parse  
6. Rename a originales  
7. Si falla → restore desde backup  

Paths:

- `server/jsons/quests.json`
- `frontend/public/init/woao/quests.json`
- `server/jsons/questGivers.json`
- `api/src/jsons/npcs.json` (si cambia relación o se crea NPC)

## 14. requiredLevel legacy

- **UI:** no mostrar, no editar, no filtrar.
- **Quests nuevas:** siempre `requiredLevel: 1`.
- **Quests existentes:** conservar valor al round-trip.
- Server sigue chequeando nivel (hoy todas son 1).
- Solo visible en tab Avanzado / vista JSON.

## 15. Alcance UI (sin inventar)

Sí: listado, búsqueda, filtros repetible / con-sin NPC, CRUD, duplicar, requisitos NPC/obj, recompensas, pickers, NPC giver, crear NPC coordinado, resumen, JSON read-only.

No: Principal/Secundaria, Estado Activa, Nivel, categorías inventadas.
