# Rediseño del editor de Objetos

Fecha: 2026-09-25  
Fuente de verdad: `api/src/jsons/objs.json` (vía `developer/lib/game-data/catalog.ts`)  
Catálogo canónico de tipos/clases: `server/src/vars.ts`

## 1. objTypes encontrados

Mapa completo en `vars.objType` (valores numéricos → clave):

| ID | Clave server | Label UI |
|----|--------------|----------|
| 1 | comida | Comida |
| 2 | armas | Arma |
| 3 | armaduras | Armadura |
| 4 | arboles | Árbol |
| 5 | dinero | Dinero |
| 6 | puerta | Puerta |
| 7 | objetoContenedor | Contenedor |
| 8 | carteles | Cartel |
| 9 | llaves | Llave |
| 10 | foros | Foro |
| 11 | pociones | Poción |
| 12 | libros | Libro |
| 13 | bebidas | Bebida |
| 14 | lenia | Leña |
| 15 | fogata | Fogata |
| 16 | escudos | Escudo |
| 17 | cascos | Casco |
| 18 | anillos | Anillo |
| 19 | teleport | Teleport |
| 20 | muebles | Mueble |
| 21 | joyas | Joya |
| 22 | yacimientos | Yacimiento |
| 23 | metales | Metal |
| 24 | pergaminos | Pergamino |
| 25 | aura | Aura |
| 26 | instrumentosMusicales | Instrumento |
| 27 | yunque | Yunque |
| 28 | fraguas | Fragua |
| 29 | gemas | Gema |
| 30 | flores | Flor |
| 31 | barcos | Barco |
| 32 | flechas | Flecha |
| 33 | botellasVacias | Botella vacía |
| 34 | botellasLlenas | Botella llena |
| 35 | manchas | Mancha |
| 36 | lingotes | Lingote |
| 46 | recetas | Receta |
| 60 | mascotas | Mascota / Montura |

**También en objs.json** (sin entrada en `vars.objType`): 0, 37–45, 50 (capa hobbit hardcodeada en `game.ts`), 57–72, 77.  
UI: `Tipo N` + badge “Desconocido / Especial”.

**Nota:** casi no hay `objType=16` (escudos) ni `17` (cascos) puros: el runtime trata armaduras con `subtipo===1` como casco y `subtipo===2` como escudo (`server/src/itemKinds.ts`).

Conteos aproximados (objs.json ~1697): armaduras 437, puertas 341, armas 213, recetas 101, llaves 93, …

## 2. Significado real por tipo (runtime)

Derivado de `server/src/protocol.ts` (equipar) y `server/src/game.ts` (usar / puertas):

- **Arma (2):** `minHit`/`maxHit`, `proyectil`, `apu`, `anim`, `clasesNoPermitidas`, `newbie`
- **Armadura (3):** `minDef`/`maxDef`, `minDefMag`/`maxDefMag`, `anim`, `razaEnana`, `abriga`; `subtipo` 1→casco, 2→escudo
- **Escudo (16) / Casco (17):** defensa + `anim`; escudo también `porcentaje` (evasión)
- **Anillo (18):** `subtipo===4` → resistencia mágica; `resistenciaMagica`
- **Flecha (32):** `minHit`/`maxHit` (con arma proyectil)
- **Poción (11):** `tipoPocion` (1 agilidad, 2 fuerza, 3 vida, 4 mana, 5 curaVeneno), `minModificador`/`maxModificador`, `porcentaje`
- **Comida (1):** `minHam`/`maxHam`
- **Bebida (13):** sed (`minAgu`/`minSed`/`maxSed`)
- **Puerta (6):** `indexAbierta`, `indexCerrada`, `llave` (truthy = requiere llave de casa); `cerrada` se guarda pero **no se lee** en `openDoor`
- **Pergamino (24):** `spellIndex` (aprende hechizo)
- **Contenedor (7):** presente en datos; sin handler de apertura claro en server
- **Teleport (19):** `travelTicketDestination`
- **Receta (46):** crafting
- **Mascota (60):** `anim` (body), `subtipo` (mount type)

## 3. Campos usados por tipo → secciones UI

Ver `objectTypeDefinitions.ts` / `schema.ts`. Resumen:

| Tipo | Secciones |
|------|-----------|
| Arma | general, combate, clases, propiedades, avanzado |
| Armadura / Escudo / Casco | general, defensa, clases, propiedades, avanzado |
| Poción | general, efecto poción, propiedades, avanzado |
| Comida / Bebida | general, consumo, propiedades, avanzado |
| Puerta | general, puerta, propiedades, avanzado |
| Pergamino | general, hechizo, propiedades, avanzado |
| Contenedor | general, contenedor, propiedades, avanzado |
| Flecha | general, combate (hit), propiedades, avanzado |
| Anillo | general, defensa/magia, clases, propiedades, avanzado |
| Otros | general, propiedades, avanzado (+ aviso campos desconocidos) |

## 4. Catálogo de clases

De `vars.clases` / `nameClases`:

1 Mago, 2 Clérigo, 3 Guerrero, 4 Asesino, 5 Ladrón, 6 Bardo, 7 Druida, 8 Paladín, 9 Cazador,  
12 Bandido, 13 Pescador, 14 Herrero, 15 Leñador, 16 Minero, 17 Carpintero, 18 Pirata,  
19 Ermitaño, 20 Arquero, 21 Domador.

(IDs 10–11 no existen en el mapa.)

JSON guarda **`clasesNoPermitidas`**. UI muestra “Clases permitidas” = complemento del set conocido.

Categorías UI (presentación, no del server):

- Combatientes: 3, 4, 8, 9, 12, 20  
- Mágicas: 1, 2, 6, 7  
- Trabajadores: 5, 13, 14, 15, 16, 17, 18, 19, 21  

## 5. Subtipos

- Armadura: 1 = casco efectivo, 2 = escudo efectivo (`itemKinds`)
- Anillo: 4 = anillo de resist magia
- Armas: valores 0,1,5,6,7,8 en datos **sin switch de combate** → UI muestra número + hint libre
- Mascotas: ID de tipo de montura

## 6. Spells

`spellIndex` en pergaminos (y a veces otros). Resolver nombre vía `api/src/jsons` hechizos / `listSpellSummaries()`.

## 7. Relaciones con otros objetos

- `indexAbierta` / `indexCerrada` → IDs de objeto (pares de puerta)
- `llave` → flag truthy (casas), no necesariamente ID de llave en openDoor actual
- Referencias externas: `npcs.json` drops/shops, `craftingRecipes.json`, `smeltingRecipes.json`, `mapas_source/*/specials.json` `objIndex`

## 8. Flags / legacy

Almacenamiento **numérico 0/1** (no boolean JSON). UI: switches ↔ 0/1.

Avanzado / poco usados: `objetoEspecial`, `mataHobbits` (sin lógica de combate), `cerrada`, `staffDamageBonus`, `magicDamage*`, `magicPenetration`, tipos fuera de vars.

## 9. Estrategia round-trip

1. Cargar objeto como `Record<string, unknown>` intacto.
2. Editar solo keys tocadas; merge superficial `{ ...original, ...edited }`.
3. Keys no mostradas en UI **permanecen**.
4. Guardar **solo** la entrada `objs[id]` (el archivo se reescribe completo pero otras entradas no se normalizan).
5. No aplicar `OBJECT_DEFAULTS` al guardar objetos existentes.
6. Crear nuevo: draft en cliente; POST solo al Guardar.
7. Duplicar: draft en cliente (`nombre - copia`, nextId); no escribe hasta Guardar.
8. Abrir + Guardar sin cambios → mismo JSON del objeto (comparación estable de keys propias).

## 10. Componentes / archivos

**Nuevos**

- `developer/docs/OBJECT_EDITOR_REDESIGN.md` (este)
- `developer/lib/game-data/objects/*` (types, presentation, schema, validation, references, defaults)
- `developer/components/objects/ObjectList.tsx`, `ObjectEditor.tsx`, `ObjectCreateWizard.tsx`, `ObjectTypeBadge.tsx`, `objects.css`, sections/*
- `developer/app/api/objects/meta/route.ts`
- `developer/app/api/objects/[id]/references/route.ts`

**Modificados**

- `developer/lib/game-data/catalog.ts` — references, nextId gap, prepareDuplicate sin write opcional
- `developer/app/(app)/objects/page.tsx`, `[id]/page.tsx`, `new/page.tsx`
- `developer/components/objects/ObjectsBrowser.tsx` — reemplazado / reexport

**No tocar:** mapeador, frontend/, deploy, formato de objs.json.
