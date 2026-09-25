# Rediseño del editor de Hechizos

Fecha: 2026-09-25  
Fuentes: `api/src/jsons/spells.json` + `server/jsons/spells.json` (escritura dual)  
Runtime: `server/src/protocol.ts`, `server/src/game.ts`, `server/src/npcs.ts`  
Cliente FX: `frontend/components/game/rendering/entityOverlays.ts` + `frontend/public/init/fxs.json`

## 1. Conteos (spells.json)

| Métrica | Valor |
|---------|-------|
| Total | **74** |
| `type` | 0→3, 1→43, 2→19, 4→9 |
| `target` | 0→3, 1→21, 2→6, 3→34, 4→10 |
| `fxGrh ≠ 0` | 62 (todos existen en `fxs.json`) |
| `type===4` / invocación | 9 |
| `wav` | todos tienen valor |

## 2. `type` (campo JSON)

| ID | Uso real en server | Ejemplos |
|----|--------------------|----------|
| **0** | Sin rama especial; auras / FX especiales | Aura Protectora, Arco Iris |
| **1** | Hechizos “activos” mayoritarios (daño/cura/buffs) | Dardo Mágico, Curar Heridas |
| **2** | Utilidad / estados | Curar veneno, Paralizar, Resucitar |
| **4** | Invocación: `type===4 && numNpc>0` → spawn en tile (`protocol.ts`) | Invocar Zombies, Elementales |

La wiki API solo etiqueta 1=Activo, 2=Utilidad. **No hay enum named en vars.**  
La UI de categorías semánticas **no debe basarse sólo en `type`**: usar efectos (`subeHp`, flags, `invoca`).

## 3. `target` (validación en `protocol.ts`)

| ID | Comportamiento real | Label UI |
|----|---------------------|----------|
| **1** | Rechaza si el tile es NPC (“solo sobre usuarios”) | Usuarios |
| **2** | Rechaza si no es NPC (“solo afecta a los npcs”) | NPCs |
| **3** | Default; sin filtro 1/2 → usuarios y NPCs | Personaje o NPC |
| **0** | Sin check explícito 1/2; datos: auras (`Aura Protectora*`, `Arco Iris`) | Especial / aura |
| **4** | Invocaciones + Detectar invisibilidad (cast por posición; summons no pasan por check 1/2) | Posición / invocación |

Default en código: `Number(datSpell.target ?? 3)`.

## 4. `subeHp` / `subeMana` / `subeAg` / `subeFz` / `subeHam` / `subeSed`

Patrón AO clásico confirmado en `game.ts` / `isSupportSpell` / `isOffensiveSpellData`:

| Valor | Significado |
|-------|-------------|
| **0** | No modifica ese recurso |
| **1** | **Aumenta / cura** usando `min*`–`max*` |
| **2** | **Reduce / daño** usando `min*`–`max*` (single target para HP) |
| **3** | HP: daño en **área cercana** (±2 tiles) — `getSpellAreaRange` |
| **4** | HP: daño en **área pantalla** (±11×7) |

Conteos `subeHp`: 0→41, 1→6, 2→24, 3→1, 4→2.  
`subeMana`: casi todo 0; un spell con 1.

Soporte (`isSupportSpell`): `subeHp===1`, `revivir`, `removerParalisis`, `invisibilidad`, `curaVeneno`, `subeAg/Fz/Mana/Ham/Sed===1`, `protec>0`.  
Ofensivo (`isOffensiveSpellData`): paraliza/inmoviliza/paralizaarea/envenena/ceguera/estupidez, `subeHp` 2|3|4, `sube*===2`, nombre especial “remover invisibilidad”.

## 5. Flags y valores intensivos

| Campo | Valores reales | Runtime |
|-------|----------------|---------|
| `paraliza` / `paralizaarea` | 0/1 | Paraliza / área NPCs |
| `inmoviliza` | todos 0 en JSON; código existe | Rama viva sin datos |
| `envenena` | **5, 15** (no booleano) | `envenenado = Number(envenena)` |
| `curaVeneno` | 0/1 | Quita veneno |
| `ceguera` / `estupidez` | 0/1 | Flags + cooldowns |
| `invisibilidad` | 0/1 | Invisible |
| `removerParalisis` | 0/1 | Limpia para/inmo |
| `remueveInvisibilidadParcial` | 0/1 | Rama AOE dedicada |
| `revivir` | 0/1 | Revive usuario muerto |
| `protec` | **10** (no booleano) | % reducción dmg mágico; self |
| `morph` | 0/1 | Morph |
| `invoca` | 0/1 | Dato; gate real `type===4 && numNpc>0` |
| `noesquivar` / `staffAffected` / `staRequired` / `loops` | en JSON | **No leídos** (o loops no afecta FX) en runtime actual |

UI: toggles 0/1 para flags booleanos. **`envenena` y `protec`**: input de intensidad (no forzar a 1).

## 6. Invocación

Condición cast: `type === 4 && numNpc > 0`.  
Campos: `numNpc`, `cant` (≥1), `invoca: 1`, `target: 4`.  
Spawn en tile (`npcs.spawnSummon`).

## 7. FX (`fxGrh`) — crítico

`fxGrh` **no es un índice GRH directo**. Es ID de catálogo:

`frontend/public/init/fxs.json` → `{ grh, offsetX, offsetY }`

Ejemplo: spell `fxGrh: 107` → `fxs["107"].grh = 3531`.

Server envía ese ID en `animFX`; cliente: `entityOverlays.renderEntityFX` → `fxsDB` → GRH animado (`speed * numFrames`, offsets).

`loops` del hechizo **no** multiplica la animación en cliente. Preview del tool puede repetir ciclos para inspección.

## 8. `wav`

ID numérico → `playSound`. Archivos en `frontend/public/sounds/{id}.*`.  
IDs usados: 16,17,18,19,20,23,26,27,47,107,108,109.

## 9. Restart / sync

- Escritura developer: **api + server** `spells.json`
- Runtime: `server/jsons/spells.json` al boot
- Cliente: `frontend/public/init/spells.json` — **el editor no lo escribe** (puede desfasarse)
- **No hay** `/recargarspells`. Hints: reiniciar Game Server
- `import-game-data` no incluye spells

## 10. Categorías de presentación (derivadas, no inventadas)

| Chip | Criterio |
|------|----------|
| Invocación | `type===4` o `invoca===1` o `numNpc>0` |
| Daño | `subeHp` ∈ {2,3,4} u ofensivo HP |
| Curación | `subeHp===1` o `curaVeneno` o `revivir` (sin daño) |
| Control | paraliza / inmoviliza / ceguera / estupidez / envenena / paralizaarea (sin daño HP primario) |
| Soporte | `isSupportSpell` excluyendo curación pura ya clasificada |
| Otros | resto |

Un spell puede tener varias señales; prioridad: Invocación → Daño → Curación → Control → Soporte → Otros.

## 11. Round-trip

Igual que objetos/NPCs: draft completo, no borrar keys ocultas, no renormalizar `sube*` al abrir, merge sólo campos editados implícitamente vía objeto completo intacto.

## 12. Archivos

- `developer/docs/SPELL_EDITOR_REDESIGN.md`
- `developer/lib/game-data/spells/*` (client-safe)
- `developer/lib/graphics/fxs.ts` (fxId → GRH + frames)
- `developer/components/spells/{SpellList,SpellEditor,SpellCreateWizard,FxAnimatedPreview,SpellTypeBadge}`
- `developer/components/pickers/FxPicker.tsx`
- APIs: `/api/spells`, `/api/spells/meta`, `/api/fxs`
- Rutas: `/spells`, `/spells/new`, `/spells/[id]`
