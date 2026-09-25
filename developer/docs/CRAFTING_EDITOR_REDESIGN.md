# Rediseño del editor de Crafting / Smelting

Fecha: 2026-09-25  
Fuentes: `api/src/jsons/craftingRecipes.json`, `smeltingRecipes.json`, `objs.json`  
Runtime: `server/src/crafting.ts`, `craftingRecipes.ts`, `craftingRecipeDrops.ts`, `smelting.ts`

## 1. Crafting — conteos

| Métrica | Valor |
|---------|-------|
| Total | **101** (array) |
| `profession` | `carpentry` 19, `blacksmith` 82 |
| `category` | Armas 43, Armaduras/Tunicas 25, Cascos 14, Escudos 14, Otros 5 |
| `level` | 10→16, 20→17, 30→29, 40→31, 50→8 |
| `skill` | **todos 0** |
| `deleted` | 0 activos |
| sin `recipeItemId` | 0 |

Tipo server: `CraftingProfession = "carpentry" | "blacksmith" | "tailoring"` — **tailoring no tiene recipes en JSON**.

## 2. Estructura crafting

```json
{
  "id": 1,
  "profession": "carpentry",
  "category": "Armas",
  "sortOrder": 1,
  "deleted": false,
  "itemId": 551,
  "skill": 0,
  "level": 10,
  "recipeItemId": 1600,
  "materials": [{ "itemId": 58, "amount": 3 }]
}
```

## 3. level vs skill (server)

- **Fabricar / aprender:** `getRecipeLevel(recipe) = level ?? skill` → compara con **nivel de personaje** (`user.level`).
- **Listado por profesión:** `recipe.skill <= skill` (skill de carpintería/herrería). Con `skill:0` siempre pasa.
- **Drops NPC:** pools por `recipe.level` ∈ {10,20,30,40,50} + tiers de exp (`craftingRecipeDrops.ts`).

UI: mostrar **Nivel requerido** (10–50). Persistir `level`; mantener `skill: 0` como en datos actuales (no inventar skill=level).

## 4. Item receta (`objType = 46`)

101 objetos. Ejemplo `1600`:

- `name`: `Receta: Flecha + 1 (1-4)`
- `objType`: 46
- `grhIndex`: según nivel
- `subtipo` === `recipeLevel` (siempre igual en datos)
- `recipeId` → crafting.id
- `recipeForItemId` → crafting.itemId
- `recipeLevel` → crafting.level
- `valor`: 1, `agarrable`: 1, resto campos default 0 / arrays vacíos

**Sync actual:** 0 inconsistencias crafting↔recipe.

## 5. level → GRH (100% consistente)

| Nivel | GRH |
|-------|-----|
| 10 | 36771 |
| 20 | 36772 |
| 30 | 36773 |
| 40 | 36774 |
| 50 | 36775 |

Centralizar en `RECIPE_LEVELS`.

## 6. deleted

Soft-delete: `deleted: true` en el array de crafting.  
- Developer UI oculta con `!deleted`.  
- Server: filtros `!recipe.deleted` en craft/learn/drops.  
- Tras `/recargarcrafting` / sync API: recipes con `deleted` **salen de memoria** runtime (`mergedRecipes.delete`).  
- El ítem receta en `objs.json` **no** se borra (puede existir en inventarios); al usarlo, learn falla si no hay crafting activo.

Smelting: **sin** soft-delete en schema.

## 7. Smelting

3 recipes. Campos: `id`, `mineralItemId`, `ingotItemId`, `requiredSkill` (25/50/100), `mineralsPerIngot`.  
Server: `getMiningSkill(user) < requiredSkill` (skill minería).  
**UI smelting: “Skill fundición”**, no niveles 10–50.

## 8. Sync / restart

| Archivo | Escritura developer |
|---------|---------------------|
| `api/.../craftingRecipes.json` | sí (única copia canónica) |
| `api/.../objs.json` | sí (junto al crafting, atómico) |
| `server/jsons/craftingRecipes.json` | **no** (fallback; overlay vía API) |
| smelting | solo `api/.../smeltingRecipes.json` |

Hints:
- Crafting: `import-game-data` + GM `/recargarcrafting`
- Smelting: `import-game-data` + **reiniciar Game Server** (no hay `/recargarsmelting`)

`upsertCraftingWithRecipe` escribe **craftingRecipes + objs** atómicamente (backup conjunto → temps → rename).

## 9. Operaciones de dominio

- `createCrafting` → nuevo id + nuevo recipeItemId + objs[recipe] + array craft
- `updateCrafting` → sync recipeLevel/subtipo/grh/name/recipeForItemId
- `duplicateCrafting` → nuevos ids ambos
- `softDeleteCrafting` → deleted:true
- `repairRecipeItem` → reconstruir desde crafting
- `createMissingRecipeItem`

## 10. Round-trip

No renormalizar materiales/order/skill si no se editaron. Soft-delete no reescribe resto del array innecesariamente más allá del registro tocado + objs sync.
