# Balance PvP: análisis, propuesta e implementación

Fecha: 2026-10-23. Estado: **implementado en el PR #54** (rama `docs-balance-combate`), salvo lo que figura como pendiente en la sección 0. Las secciones 1 a 7 son el análisis original; la 0 y la 8 tienen los valores finales.

Este documento sirve para retomar el trabajo en cualquier momento. Tiene:
- qué se pidió;
- cómo funciona hoy el combate y dónde está cada fórmula;
- qué se midió y con qué herramienta;
- qué cambiar, por qué y en qué archivo.

**Para leer rápido** (gráficos y, por clase, qué ítems usa, cuánto pega y en cuántos aciertos mata, antes y ahora): [NIVELACION_POR_CLASE.md](NIVELACION_POR_CLASE.md).

Las tablas completas están en [BALANCE_PVP_TABLAS.md](BALANCE_PVP_TABLAS.md). El simulador está en `server/src/scripts/balanceSim/`.

Documento previo de referencia: [combat-balance.md](combat-balance.md), del PR #52, con el modelo de balance de Eze (ezesaraniti22).

---

## 0. Estado de la implementación

### Qué quedó en el juego

| Punto | Qué hace | Dónde |
|---|---|---|
| 7.1 Tope de atributos | Fuerza y agilidad efectivas con tope 40 (buff + objetos), **solo en PvP** | `game.ts`: `getCombatFuerza`, `getCombatAgilidad`, `PVP_ATTRIBUTE_CAP` |
| 7.2 Factores PvP | Daño contra jugadores por clase: `modDmgPvpArmas`, `modDmgPvpProyectiles`, `modDmgPvpMagia` | `balanceData.ts`, `api/src/jsons/balance.json`, `game.ts` (`getPvpDamageFactor`, `calcularDmg`, `applyUserSpellDamage`) |
| 7.4 Bonos del set | 2 piezas: +10 % de vida. 4 piezas: +20 % de vida y +25 % de daño contra jugadores. Se aplica el escalón más alto, sin acumular | `server/jsons/sets.json`, `tierSets.ts`, `game.ts` (`refreshEquipmentVitals`, `getEquippedSetBonus`) |
| 7.6 Rarezas | Normal, Mejorado, Épico y Legendario por instancia de ítem (+1/+2/+3 al golpe y a la defensa, +2/+4/+6 al daño mágico). El Legendario no se cae al morir. **Las piezas de set son siempre Legendarias.** Mercado y subastas no aceptan ítems con rareza | `itemRarity.ts`, columna `rarity` en `character_items`, `character_bank_items`, `account_vault_items` y `clan_vault_items`, cliente `lib/itemRarity.ts` |
| 7.7 Bugs | Maná de los ítems con "+maná" (OE) ahora suma; túnicas especiales leen el equipo en juego; pirata | `game.ts`, `equipmentRewardBonuses.ts`, `balanceData.ts` |
| 7.8 Pociones | Intervalo de usar ítem 50 → 160 ms (como AoDrag) | `vars.ts` (`actionCooldowns.useItemMs`) |

La rareza **no** suma a `resistenciaMagica`: es un porcentaje de reducción y +3 por pieza llevaba el set de guerrero de 17 % a 26 %, lo que descalibraba la magia contra cualquiera con set.

Capturas de cada cosa en el juego: [capturas/](capturas/).

### Resultado en el simulador

- Cruces dentro de ±0,5 aciertos del objetivo: **900 de 1344 (67 %)**, error cuadrático medio **0,40**. En `main`: 306 de 1344 (23 %) y 3,38.
- Lo pedido: mago contra mago **2 / 2 / 3** aciertos a nivel 30 / 40 / 50. Mago 50 con set contra guerrero sin set: **3** (pedido 2-3). Contra guerrero con set: **5** (pedido 4-5).
- Efecto del set a nivel 50 (promedio): con set contra sin set mata en ×0,80 de los aciertos (objetivo ×0,75); sin set contra uno con set tarda ×1,42 (objetivo ×1,3).

### Qué hay que hacer en producción al desplegar

1. **Perfil de balance (`game_balance`).** Las tablas PvP nuevas se completan solas con el seed si el perfil no las tiene, pero el cambio del pirata (maná 2,5/1 y `modDmgMagia` 0,5) está en tablas que ya existen. Actualizar el perfil con `/admin/game-data/balance` (PUT) o `pnpm --dir api import-game-data`, como dice 7.9.
2. **Intervalo de pociones.** `runtime_settings` guarda `actionCooldowns.useItemMs = 50` y pisa el valor nuevo del código. Un admin tiene que correr `/intervalo useitem 160` en el juego.
3. **Migración de la base.** Las columnas `rarity` se crean solas: `pnpm start` de la API corre `migrate` (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`). En local hay que correr `npx tsx src/migrate.ts` en `api/`.
4. **Cliente.** `frontend/public/init/objs.json` ya trae `anim` de las armaduras (lo usa la adaptación de armaduras a la raza); se regenera con `pnpm --dir server export-client-objs`.

### Pendiente

- **7.5 Normalizar las piezas de tier.** Algunas piezas de set pegan menos que la mejor común (por ejemplo, el Puñal Desterrado del asesino), así que el set no les sirve. Hay que normalizarlas y volver a calibrar.
- **Cazador:** la flecha sigue rápida contra todos (⚠ en las tablas); hace falta bajar `modDmgPvpProyectiles` del cazador o revisar su objetivo.
- **Clases fuera de la matriz** (bardo como identidad final, pirata, ladrón, bandido, arquero) y **razas** distintas de la humana.
- **Temporadas:** qué set es el de la temporada actual y qué pasa con el anterior (decisión 6).

---

## 1. Qué se pidió

Pedido de Leandro (resumido, con sus números):

1. **Cuántos aciertos hacen falta para matar a alguien del mismo nivel, mago contra mago:**
   - nivel 30: 2 aciertos;
   - nivel 40: a veces 2, a veces 3;
   - nivel 50 (el máximo): 3.

   Entre otras clases tiene que variar según el cruce.
2. **Identidad de cada clase:**
   - **Mago:** el que más daño hace con magia; nada físico.
   - **Druida:** menos magia que el mago y más daño con armas (hoy está orientado a la magia).
   - **Clérigo:** como el druida, pero puede usar más armas, así que pega más cuerpo a cuerpo que con magia.
   - **Paladín:** mucho más cuerpo a cuerpo y menos magia.
   - **Guerrero:** mucho físico y nada de magia.
   - El resto de las clases, con el mismo criterio.
3. **Ítems de tier por temporada:** tienen que dar un **% extra** de maná, vida, daño cuerpo a cuerpo o daño mágico, para que tenerlos valga la pena. Ejemplo pedido, a nivel 50:
   - mago con set completo contra guerrero sin set: **2-3 aciertos**;
   - mago con set completo contra guerrero con set completo: **4-5 aciertos**.

   Eze no está de acuerdo con los porcentajes porque "desnivelan todo". Este análisis mide cuánto mueven y propone topes (sección 7.4).
4. **Rarezas por colores estilo WoW** (normal, raro o mejorado, épico), como en los repos `leb90/_React-Argentum` y `leb90/_Argentum`: que sean "+1, +2" y sumen un poco de daño al arma.
5. **Estilo de combate:** tomar como base AoDrag, porque su PvP es más dinámico y frenético.
6. **Antes de cambiar nada:** validar todo de punta a punta, usando ítems y midiendo daño real, y dejarlo por escrito.

---

## 2. Resumen

### Lo que está mal hoy

- **El daño físico está roto.** A nivel 50, con set y buffs, un guerrero pega 592-628 por golpe y mata a cualquiera de un golpe, a cualquier nivel desde el 30. Un paladín pega 457-477.
  - Causa: la fuerza buffeada al doble no tiene tope (el AO clásico corta en 40) y encima se le suman los "+5F" del equipo. El guerrero llega a 51 de fuerza.
  - Agravante: las armas top llegan a 48 de golpe máximo, el doble que en el AO clásico.
- **La magia del mago ya está bien.** Mago contra mago da 2 / 3 / 3 aciertos a nivel 30 / 40 / 50. Es casi exactamente lo pedido, gracias al ajuste de hechizos de Eze.
- **El set de tier no da ventaja.**
  - Las piezas del Caído o Desterrado son iguales o peores que ítems comunes crafteables. Por ejemplo, Placas Doradas +5F tienen defensa 50-70 y la Armadura del Caído 20-30; la Espada MataDragones pega lo mismo que la Espada del Caído LEGENDARIA.
  - Los sets no dan nada de defensa mágica.
  - Las versiones +1, +2 y LEGENDARIA tienen casi los mismos stats que la base.
  - Resultado: mago con set contra guerrero sin set son 4 aciertos, y contra guerrero con set también 4.
- **Bugs encontrados:**
  - El "+100 / +200 / +300 Maná" de los ítems no se aplica.
  - Los hechizos del pirata pegan 1.
  - Los bonos de oro, experiencia y drop de las túnicas especiales del PR #52 dan 0.
- **Las pociones son 3 veces más rápidas que en AoDrag** (cada 50 ms contra 160 ms). Entre un hechizo y el siguiente, el rival puede tomar 11 rojas (330 de vida). Eso le quita sentido a "matar en 3 aciertos".
- **El balance que corre en producción puede no ser el del repo.** El perfil guardado en la base pisa los valores del código, y la api solo lo siembra cuando la tabla está vacía (sección 3.8).

### La propuesta en una línea por punto

1. Tope de 40 a fuerza y agilidad efectivas (buff más equipo) en PvP.
2. Un factor de daño **solo PvP** por clase, para golpe, flecha y magia. No cambia nada del PvE.
3. La identidad de clase pedida, codificada en esos factores.
4. Bonos de set en %: +25 % de daño (físico o mágico según la clase) y +20 % de vida con el set completo, con tope y aplicados una sola vez.
5. Piezas de tier que sean las mejores de su lugar, con defensa mágica.
6. Rarezas +1 / +2 / +3 con colores.
7. Arreglar los bugs.
8. Intervalo de pociones como en AoDrag.

### Lo que da la propuesta en el simulador

Las celdas son combinaciones de nivel, atacante, modo, defensor y equipo; la vara es la matriz objetivo de la sección 6.

| | Estado actual | Propuesta |
|---|---:|---:|
| Celdas a ±0,5 aciertos del objetivo | 23 % | 64 % |
| Error cuadrático medio | 3,38 | 0,46 |

Las anclas que pidió Leandro, una por una:

| Caso | Pedido | Hoy | Propuesta |
|---|---|---:|---:|
| Mago contra mago, nivel 30, equipo común | 2 | 2,0 | 2,0 |
| Mago contra mago, nivel 40, equipo común | 2-3 | 3,0 | 2,0 |
| Mago contra mago, nivel 50, equipo común | 3 | 3,0 | 3,0 |
| Mago con set contra guerrero sin set, nivel 50 | 2-3 | 4,0 | 3,0 |
| Mago con set contra guerrero con set, nivel 50 | 4-5 | 4,0 | 4,0 |
| Guerrero contra mago, nivel 50, equipo común | (no pedido) | 1,0 | 2,0 |
| Guerrero contra guerrero, nivel 50, equipo común | (no pedido) | 1,5 | 3,7 |

![Lo pedido: hoy y con la propuesta](graficos/anclas-del-pedido.svg)

El daño por acierto también sigue la identidad pedida (nivel 50, equipo común contra mago, en el simulador):

| Tipo de daño | Orden |
|---|---|
| Físico | Guerrero 224-240 > Paladín 214-229 > Asesino 203-217 > Clérigo 186-201 > Druida 175-182 > Bardo 161-174 |
| Mágico | Mago 168-180 > Bardo 120-130 > Clérigo 111-121 ≈ Druida 112-119 > Asesino 97-106 > Paladín 93-101 |

---

## 3. Cómo funciona hoy el combate

Todo está en `server/src/`. Están verificadas la versión de `main` en el commit `eaa6dd0e` (PR #52 mergeado) y el server local corriendo ese código.

### 3.1 Golpe físico

`game.ts` → `calcularDmg(idUser, targetIsNpc)`:

```
daño = floor((3 * golpeArma + (maxArma / 5) * max(0, fuerzaEfectiva - 15) + golpePersonaje) * modClase)
```

- `golpeArma` es un valor al azar entre `minHit` y `maxHit` del arma. Con arco se suma la flecha.
- `modClase` sale de `vars.modDmgArmas`, `modDmgProyectiles` o `modDmgWrestling` (sin arma).
- `golpePersonaje` sale de `minHit`/`maxHit` del personaje: `balance.getMinHitForLevel`. Sube `hitPre36` por nivel hasta el 36 y `hitPost36` después. Un guerrero nivel 50 tiene 134-135.
- `fuerzaEfectiva` es `attrFuerza` más el bono de equipo de objetoEspecial (`getEffectiveFuerza`, `getObjectSpecialBonuses`). El buff de fuerza llega al doble del atributo base (`refreshStrengthBuff`) **y no tiene tope de 40**.
- Después: `racialPassives.modifyOutgoingPhysicalDamage`, por ejemplo Enano ×1,5 con menos de 33 % de vida, y `mounts.applyOutgoingDamage`.
- `calcularDmg` se usa contra NPC y contra jugadores. El parámetro `targetIsNpc` ya existe, y es el lugar natural para un factor solo PvP.

`userDmgUser(idUser, idUserAttacked)` hace el resto:

- **Acierto:** `clamp(5, 95, 50 + (poderAtaqueArma - evasión) * 0,4)`.
  - `poderAtaqueArma` y `poderEvasion` usan agilidad efectiva, skill (armas, proyectiles, apuñalar o tácticas), `skill/66 * agilidad` y `2,5 * (nivel - 12)`.
  - Con escudo, la evasión suma `poderEvasionEscudo`.
  - Los skills llegan a **200**, no a 100 como en el AO clásico.
- **Absorción:** se sortea una parte del cuerpo. En la cabeza absorbe el casco; en el resto, armadura más escudo, al azar entre la defensa mínima y la máxima. El daño mínimo es 1.
- Después: `racialPassives.applyIncomingHit` (Tauros −5 %, No-Muerto −10 % contra flechas, montura, Abisario) y apuñalar (`apuUser`, ×2 si el golpe viene de atrás).

### 3.2 Hechizos

`game.ts` → `applyUserSpellDamage` → `applyMagicBonuses`, y después `combatBalance.ts` → `calculateMagicDamage`:

```
porNivel   = base + round(base * 2% * nivel)
conEquipo  = porNivel + round(min(90, DM del equipo) * 50%)      # arma, casco, armadura y anillo; el escudo no cuenta
conPorc    = conEquipo + round(conEquipo * min(15%, magicDamagePercent))
daño       = floor(conPorc * modDmgMagia[clase])
```

Después, en orden:
1. Montura.
2. Resistencia del objetivo (`applyMagicResistanceToUser`): % de los ítems más % de clase (`modResistenciaMagica`) más % de raza (Humano y Tauros +5) más 2 × (diferencia de skill si el defensor tiene más), menos penetración, con tope de 60 %.
3. Anillo de RM (subtipo 4): −1/30.
4. Defensa mágica plana del equipo (`minDefMag..maxDefMag`).
5. `protec`.
6. Mínimo 1.
7. `applyIncomingHit`.

Requisitos para lanzar (`protocol.ts`): `minNivel` **y** `minSkill` de magia. Como el skill tiene tope por nivel, quedan así:

| Hechizo | Nivel | Skill |
|---|---|---|
| Llama de Dragón (mago) | 40 | 200 |
| Lluvia de Sangre | 30 | 150 |
| Incinerar (druida) | 30 | 150 |
| Purificar (clérigo) | 30 | 200, así que recién se usa desde el nivel 39 |

### 3.3 Vida, maná y skills

`balance.ts` y `balanceData.ts`:

- **Vida:** `CON + promedio * (nivel - 1)`. El promedio por nivel es `(vidaMin + vidaMax) / 2 + (CON - 21) * 0,5`.
  - Humano a nivel 50: Mago 388, Druida y Clérigo 412, Bardo y Asesino 437, Paladín y Cazador 486, Guerrero 535.
  - Coincide casi exacto con AoDrag Oficial a nivel 50 (Mago 398, Guerrero 562 con CON 21).
- **Maná:** `INT * manaInicial + multMana * INT * (nivel - 1)`. Mago humano a nivel 50: 2487, que alcanza para **2** Llamas de Dragón de 1000.
- **Atributos:** `18 + bono de raza`. Al entrar se recalculan (`login.ts`).
- **Skills:**
  - 10 al crear y +5 por nivel (255 a nivel 50); además suben con el uso.
  - Tope por nivel (`skills.getLevelSkillCap`): 155 a nivel 30, 195 a nivel 38 y 200 desde el 39.
  - Ojo: si `skill_pts` es `null`, al entrar se reinician todos los skills (`skills.ensureSkills`).
- **Equipo:** no tiene requisito de nivel ni de skill. Un nivel 30 puede usar lo mismo que un 50.

### 3.4 Intervalos y pociones

`vars.timing.actionCooldowns`:

| Acción | Este server | AoDrag 7.0 |
|---|---|---|
| Golpe | 650 ms | 650 ms |
| Flecha | 450 ms | — |
| Hechizo | 560 ms | 200 ms |
| Golpe → hechizo y hechizo → golpe | 0 ms | sin intervalo cruzado (combo libre) |
| Usar ítem / poción | **50 ms** | 160 ms |

- La roja cura 30 (`getHealthPotionRecovery`, con tope de 30).
- La azul devuelve `4 % del maná máximo + nivel/2 + 40/nivel`: unos 136 a nivel 50.
- Las ventanas anti-spam `rateLimitWindows` (`vars.ts`) **están definidas pero nadie las usa**.

### 3.5 Bonos de objetoEspecial (OE)

`game.ts` → `getObjectSpecialBonuses`:

| OE | Bono |
|---|---|
| 2 / 3 / 4 | +5 / +2 / +3 Fuerza |
| 5 / 6 / 7 | +5 / +2 / +3 Agilidad |
| 8 / 9 / 10 | +100 / +200 / +300 maná |
| 12 a 16, 18 | combinaciones de Fuerza y Agilidad |
| 17 | +2 Agilidad y +200 maná |
| 19 | +55 maná |

**El maná no se aplica:** `getEquippedSpecialBonuses().maxMana` se calcula, pero ninguna parte lo suma a `maxMana`. Se confirmó en el juego: un mago con la Túnica Desterrada "+300 maná" tiene 2487/2487.

Otros códigos, según la auditoría que pasó Leandro, confirmada en el código:

| OE | Qué dice el nombre | Qué hace |
|---|---|---|
| 1, 53, 54 | Ahorro de flechas | Nada, no está implementado |
| 11 | Daño mágico | El valor real viene de `magicDamageBonus` |
| 55 | Espada de Cristal, habilidad especial | Nada |
| 50, 51, 52 | Efectos especiales | Están implementados; ningún objeto tiene el 52 |

### 3.6 Sets de tier

**No hay campos de "tier" ni de "temporada" en los objetos.** El sistema de temporadas del código (`environment.ts`) es solo del clima.

Los sets que funcionan como tier son los **premios de canje** (`server/jsons/premios.json`): 40 piezas a 650 puntos de canje, de las familias **Desterrado** y **del Caído**, una por clase. En `objs.json` existen además sus versiones **+1, +2 y LEGENDARIA**. No se venden ni dropean.

| Familia | Qué tiene | Problema |
|---|---|---|
| Desterrado (asesino, mago, druida, bardo) | Armadura o túnica, casco, escudo, arma | Mismas defensas en +1, +2 y LEGENDARIA (20-30). El Puñal Desterrado LEGENDARIO (19-22) es peor que la MataDragones común (35-48). |
| Del Caído (clérigo, bardo, guerrero/pirata, paladín, arquero/cazador, mago y druida en casco y anillo) | Armadura, casco, escudo, arma, anillo | La armadura (20-30) es peor que las Placas Doradas +5F crafteables (50-70). La espada LEGENDARIA (35-48) es igual a la MataDragones. |
| Ónice (69 ítems) | Versiones encantadas de armas comunes | En AoDrag Oficial, "Ónice" es el encantamiento (+2 al arma, 50 % de éxito). Acá no se consiguen por ninguna vía conocida (solo aparecen en una misión). |

Ningún set de tier da resistencia ni defensa mágica. Ladrón y Bandido no tienen set.

### 3.7 Pasivas de raza

`racialPassives.ts`:

| Raza | Pasiva |
|---|---|
| Humano y Tauros | +5 % de resistencia mágica |
| Gnomo | +10 % de evasión |
| Drow | +3 % de evasión |
| Enano | ×1,5 de daño físico con menos de 33 % de vida |
| Licántropo | Crítico de +20 % (10-15 % de probabilidad) |
| Orco | 10 % de ignorar un hechizo |
| Abisario | 10 % de sobrevivir a un golpe mortal |
| Vampiro | Robo de vida |
| Elfo | Recupera maná |

El simulador usa Humano en todos los cruces.

### 3.8 De dónde salen los valores en producción

- **Objetos y hechizos:** de los JSON del repo (`GAME_DATA_SOURCE` sin definir es `local`).
- **Balance** (modificadores de clase, vida por nivel, atributos de raza):
  - El server lo hidrata al arrancar desde la api (`gameDataSync.initializeBalanceFromApi`), con el perfil de la tabla `game_balance`, y **ese perfil pisa los valores por defecto de `balanceData.ts`**.
  - La api solo siembra `game_balance` desde `api/src/jsons/balance.json` **cuando la tabla está vacía** (`api/src/repositories/gameBalance.ts` → `ensureSeededInternal`).
  - En la base local el perfil es de mayo y **no coincide** con el código. Por ejemplo:

| Valor | Base local | Código |
|---|---|---|
| Magia del mago | 1,0 | 1,05 |
| Vida por nivel | `vida: 7,5`, sin `vidaMin`/`vidaMax` | tirada entre mínimo y máximo |
| Evasión | otros valores | otros valores |

**Antes de cualquier cambio hay que mirar `select data from game_balance` en producción.** Si quedó un perfil viejo, el balance del PR #52 no está corriendo.

### 3.9 Otros bugs encontrados

- **Pirata:** "Disparo de Salva" (90-98) y "Disparo Certero" (105-115) pegan **1**, porque `modDmgMagia` del pirata es 0 y `calculateMagicDamage` multiplica por 0. Verificado con el motor.
- **Túnicas especiales** (PR #52, `equipmentRewardBonuses.ts`): `getEquippedBodyObject` busca el ítem en `user.items[slot]`, pero el personaje en juego tiene el inventario en `user.inv`. La Túnica Dorada (+50 % de oro) da 0 %. Verificado con el motor.
  - Es el mismo error que marca `tsc` en `npcs.ts:3440`.

---

## 4. Herramienta: el simulador

`server/src/scripts/balanceSim/`:

| Archivo | Qué hace |
|---|---|
| `simulate.ts` | Carga el motor real del server sin levantarlo ni tocar la base. Arma personajes en memoria y llama a `game.userDmgUser` y `game.userSpellUser` miles de veces por cruce. |
| `gear.ts` | Elige el mejor equipo por clase y lugar en tres perfiles (`venta`, `comun`, `tier`). Indexa de dónde sale cada objeto: venta, drop, crafteo, misión o premio. |
| `targets.ts` | La matriz objetivo de la sección 6 y el puntaje (celdas a ±0,5, error cuadrático). |
| `report.ts` | Tablas markdown (`tabla`, `comparar`). |
| `tune.ts` | Barrido de factores PvP por fila de atacante contra la matriz objetivo. |
| `charts.ts` | Gráficos de barras SVG en `docs/balance/graficos/`. |
| `guide.ts` | Genera [NIVELACION_POR_CLASE.md](NIVELACION_POR_CLASE.md) con el equipo de cada clase y sus números. |
| `wiki.ts` | Genera `frontend/lib/wiki-pvp-balance.json`, los datos de la guía PvP de la Wiki (`/wiki/pvp`). |
| `propuestas/` | Cambios a probar sobre el código actual, sin tocar el juego. Claves: `pvpMelee`, `pvpRanged` y `pvpMagic` (pisan `modDmgPvp*`; clave = id de clase o `default`), `balance` (tablas de `balanceData`), `spells` y `objects` (campos de `spells.json` y `objs.json`). La propuesta original (`propuesta-v1.json`) ya está implementada y se borró; `ejemplo-cazador.json` prueba bajar la flecha del cazador (pendiente de la sección 0). |

Uso:

```bash
pnpm --dir server balance-sim --salida /tmp/actual.json                    # estado actual
pnpm --dir server balance-sim --propuesta src/scripts/balanceSim/propuestas/ejemplo-cazador.json --salida /tmp/prop.json
pnpm --dir server balance-sim --perfil-balance /tmp/game_balance.json ...  # con el perfil exportado de producción
npx tsx server/src/scripts/balanceSim/report.ts comparar /tmp/actual.json /tmp/prop.json 50 comun comun
npx tsx server/src/scripts/balanceSim/tune.ts <propuesta-base.json> comun,tier <salida.json>
```

### Qué asume el simulador

- **Personaje:** raza Humana, atributos `18 + raza`, fuerza y agilidad buffeadas al doble (con `--sin-buff` no se buffean), skills de combate al tope del nivel y vida promedio de la tirada.
- **Hechizo:** el de más daño individual que la clase puede aprender y pagar a ese nivel.
- **Combate:** se simula como arena, con `rankedMatchId` de equipos distintos, para saltear zona segura, facciones y fuego amigo.
- **Medida:** "aciertos para matar" es el promedio de golpes o hechizos que **conectan** hasta bajar la vida del defensor, sin curarse. Los golpes fallados no cuentan, pero la tabla de daño muestra la probabilidad de acertar.
- **Lo que hoy no existe en el motor** se emula en el mismo punto donde iría el código: el factor PvP físico, envolviendo `game.calcularDmg`; el factor PvP mágico, sobre el daño final del hechizo; los bonos de set; el tope de atributo y el maná OE.

### Validación en vivo

Hecha el 2026-10-23 con el server local corriendo `main`, usando Playwright y el mismo perfil de balance de la base local en los dos lados:

| Cruce (nivel 50, Humano, sin buff) | Simulador | Juego real |
|---|---|---|
| Guerrero (Espada del Caído LEGENDARIA, set Caído) golpea a Mago (set Desterrado y Caído) | 392-449 por golpe, mediana 419, 95 % de acierto | 12 golpes de 398 a 439, 0 fallos |
| Mago lanza Llama de Dragón al Guerrero | 137-145 | 12 lanzamientos de 137 a 145 |

El simulador reproduce el server. Script de la prueba (fuera del repo): `run-balance-live.mjs` y `run-balance-live-magia.mjs`. Para repetirla:
- crear dos cuentas;
- por SQL: clase, `level=50`, `max_hp=5000`, `hp=5000`, `mana=99999`, `criminal=true`, mapa 10 en (50,46) y (51,46), `skills` en 200 y **`skill_pts=0`**, `character_items` equipados y `character_spells`;
- pegar con Espacio mirando al rival, o lanzar con Hechizos → Lanzar → click en la baldosa;
- leer "Le has pegado a … por N" y "Le has quitado N puntos de vida a …".

---

## 5. Estado actual medido

Nivel 50, todos con set y buffs. Daño por acierto y aciertos para matar (tabla completa en el anexo):

| Atacante | Daño contra mago | Aciertos contra mago (388) | Contra guerrero (535) |
|---|---|---:|---:|
| Mago, Llama de Dragón | 164-173 | 3,0 | 4,0 |
| Druida, Incinerar | 140-149 | 3,0 | 5,0 |
| Clérigo, Purificar | 97-105 | 4,0 | 6,7 |
| Paladín, golpe | 458-477 | 1,0 | 2,0 |
| Guerrero, golpe | 592-628 | 1,0 | 1,0 |
| Asesino, golpe | 285-298 | 2,0 | 2,7 |
| Cazador, flecha | 232-248 | 2,0 | 3,0 |

- Con equipo común contra común, el guerrero mata de **1 golpe** a todas las clases en los niveles 30, 40 y 50. Paladín y clérigo, casi igual.
- Sin buffs (`--sin-buff`) el físico baja, pero el guerrero sigue matando en 1-2 golpes a nivel 50.
- El cazador pega más cuerpo a cuerpo (MataDragones) que con el arco: los arcos tienen golpe máximo bajo (15) y la fuerza multiplica por golpe máximo / 5.

---

## 6. Matriz objetivo

Es la vara contra la que se mide todo (`targets.ts`). Los números del pedido son anclas fijas; el resto es **propuesta para confirmar** (sección 9).

**Base, mismo nivel y mismo equipo** (ancla: mago contra mago):

| Nivel | Aciertos |
|---|---|
| 30 | 2 |
| 40 | 2,5 |
| 50 | 3 |

**Identidad del atacante**, en aciertos de más (+) o de menos (−) respecto de la base:

| Atacante | Ajuste | Por qué |
|---|---|---|
| Mago, magia | 0 | La referencia. |
| Guerrero, golpe | −0,5 | El que más pega físico. |
| Paladín, golpe | 0 | Casi como el guerrero. |
| Clérigo, golpe | +0,5 | Más arma que magia. |
| Asesino, golpe | +0,5 | Su fuerte es la apuñalada por la espalda. |
| Cazador, flecha | +0,5 | |
| Druida, magia y golpe | +1 cada uno | Menos magia que el mago y arma útil. |
| Bardo, magia y golpe | +1 cada uno | Mixto. |
| Clérigo, magia | +1,5 | |
| Cazador, golpe | +1,5 | |
| Paladín, magia | +2,5 | Poca magia. |
| Asesino, magia | +2,5 | |

**Aguante del defensor:**

| Defensor | Contra magia | Contra físico |
|---|---|---|
| Mago | 0 | −0,5 (sin armadura) |
| Druida, Bardo | 0 | 0 |
| Clérigo | 0 | +0,5 |
| Asesino | +0,5 | 0 |
| Cazador | +0,5 | +0,5 |
| Paladín | +0,5 | +1 |
| Guerrero | +1 (12 % de resistencia mágica de clase) | +1 |

**Piso:** nadie muere de un acierto contra alguien de su nivel con el mismo equipo (mínimo 2).

**Equipo:**
- Con set contra sin set: ×0,75 aciertos.
- Sin set contra con set: ×1,3.
- Con el mismo equipo de los dos lados: ×1.

A nivel 50 eso es "el set vale más o menos un acierto". Con la matriz, el ejemplo del pedido queda así:

| Mago contra guerrero, nivel 50 | Objetivo |
|---|---:|
| Mismo equipo (3 + 1) | 4 |
| Mago con set contra guerrero sin set | 3 (pedido: 2-3) |
| Mago con set contra guerrero con set | 4 (pedido: 4-5) |

---

## 7. Propuesta de cambios

Cada punto tiene qué cambiar, por qué, dónde y con qué número arrancar. Los números salieron del barrido del simulador (`tune.ts`); los valores finales están en `balanceData.ts` (sección 0).

### 7.1 Tope de fuerza y agilidad efectivas: 40, solo en PvP

- **Por qué:** es la regla clásica de AO (`MAXATRIBUTOS = 40`). Hoy el buff duplica sin tope y los "+F/+A" del equipo se suman encima, así que el guerrero con set llega a 51 de fuerza. El término `(maxArma/5) * (fuerza - 15)` es la mitad del golpe.
- **Dónde:** en `calcularDmg`, `poderAtaqueArma` y `poderEvasion` usar `min(40, atributo + equipo)` cuando el objetivo es un jugador. `calcularDmg` ya recibe `targetIsNpc`. A `poderAtaqueArma` y `poderEvasion` hay que pasarles el dato.
- **Impacto si fuera global:** el golpe contra NPC bajaría 18 % en el guerrero, 11 % en el paladín y 9 % en el clérigo (medido con el motor). Por eso se propone solo para PvP en la primera etapa.
- Por sí solo no alcanza: con tope, el guerrero sigue pegando 481-517 a nivel 50.

### 7.2 Factor de daño solo PvP por clase

- **Por qué:** el físico en PvP está unas 2 veces por encima de la vida de los personajes y de lo que pide la matriz. Bajar `modDmgArmas` arreglaría el PvP pero rompería el PvE, porque los NPC están ajustados al daño actual. Un factor que solo se aplique contra jugadores separa las dos cosas.
- **Dónde:**
  - Tablas nuevas en `server/src/balanceData.ts` (`RuntimeBalanceData`, valores por defecto, `normalizeBalanceData`) y en el esquema de la api (`api/src/repositories/gameBalance.ts`, `numericMapSchema`), así se editan igual que el resto del balance: `modDmgPvpArmas`, `modDmgPvpProyectiles`, `modDmgPvpMagia`.
  - Físico: en `calcularDmg`, si `!targetIsNpc`, multiplicar al final.
  - Magia: en `applyUserSpellDamage`, sobre el daño después de resistencias y antes de `applyIncomingHit`.
- **Valores iniciales** (barrido contra la matriz con equipo común y set). El asesino quedó en 0,45 a mano para que no pegue más que el guerrero.

| Clase | Golpe | Flecha | Magia |
|---|---:|---:|---:|
| Mago | 1 | 1 | 1,10 |
| Druida | 1,05 | 1 | 0,85 |
| Clérigo | 0,50 | 1 | 1,10 |
| Bardo | 0,45 | 1 | 1,35 |
| Paladín | 0,45 | 1 | 1,25 |
| Asesino | 0,45 | 1 | 1,25 |
| Guerrero | 0,45 | 1 | — |
| Cazador | 0,35 | 0,75 | — |
| Ladrón, Bandido, Pirata, Arquero | sin medir | | |

- Los valores de magia mayores a 1 compensan que los híbridos casi no tienen maná ni hechizos fuertes. Por ejemplo, el paladín nivel 50 tiene 927 de maná, que no le alcanza para un Apocalipsis (950); con el arreglo del maná de ítems (7.7) llega a 1127.

### 7.3 Identidad de clase

Lo pedido ya queda reflejado con los factores de 7.2; el orden de daño está en la sección 2. Dos pendientes:

- **Druida "más daño con armas":** el druida solo puede usar báculos (golpe 8-14). El factor 1,05 lo deja útil en PvP: 175-182 contra mago, 3 golpes.
  - Si además se quiere en PvE: subir `modDmgArmas` del druida de 0,75 a 0,9 y bajar su factor PvP a la par. Otra opción es darle un arma o báculo de golpe propio.
- **Bardo:** no estaba en el pedido. Con la matriz queda mixto, con más magia que el druida (120-130 contra 112-119). Confirmar si se quiere así.

### 7.4 Bonos porcentuales del set de tier

- **Por qué:** el pedido de Leandro es que el set sea un incentivo real. La medición muestra que hoy no da ventaja (sección 3.6). El miedo de Eze ("desnivela todo") se controla con tres reglas:
  - el bono se suma **una sola vez** por personaje y tiene **tope**;
  - se aplica al final, como un multiplicador;
  - su tamaño se valida en el simulador contra la regla "el set vale más o menos un acierto".
- **Valores** (barrido de `% daño` × `% vida`): con el set completo, **+25 % de daño** del tipo principal de la clase (físico o mágico) y **+20 % de vida máxima**. Es lo que mejor ajustó.
  - Set contra común queda cerca de ×0,75.
  - Común contra set todavía queda corto de ×1,3: el lado defensivo falla por la falta de defensa mágica, que se arregla en 7.5.
  - Mago contra mago con los dos con set queda un poco más rápido que con común (2,6 contra 3 a nivel 50). Hay que subir la defensa de las piezas de mago.
- **Estructura propuesta** (no existe nada parecido hoy):
  - Campo nuevo en los objetos: `setId` (por ejemplo `"caido-guerrero"`). Copiar en las tres copias de `objs.json` y en `scripts/exportClientObjs.ts` para el tooltip.
  - Archivo nuevo `server/jsons/sets.json` con, por set: nombre, temporada y bonos por cantidad de piezas, por ejemplo 2 piezas +5 % de vida, 4 piezas +10 % de daño, set completo +25 % de daño y +20 % de vida. Las piezas +1, +2 y LEGENDARIA cuentan como el mismo set y multiplican el bono (+1 ×1,1, +2 ×1,2, LEGENDARIA ×1,35, con el tope arriba de todo).
  - Cálculo:
    - una función `getSetBonuses(user)` en un módulo nuevo `setBonuses.ts`, que cuente las piezas equipadas y devuelva `{ hpPct, manaPct, physPct, magicPct }`;
    - se recalcula al equipar o desequipar (`protocol.ts`, caso de equipar) y al entrar;
    - vida y maná máximos: base × (1 + %), recortando la vida actual al nuevo máximo;
    - daño: `physPct` en `calcularDmg` y `magicPct` en `applyUserSpellDamage`, los dos solo PvP en la primera etapa.
  - Topes: daño +25 %, vida +20 %, maná +20 %.
  - El tope de 15 % de `magicDamagePercent` (`combatBalance.ts`) queda como está, para ítems sueltos. El bono de set va por afuera.
- **Temporadas:**
  - Cada temporada trae un set nuevo con un `season` en `sets.json`.
  - Propuesta para decidir: el set de la temporada anterior mantiene sus stats pero su bono % baja a la mitad cuando empieza la temporada siguiente. Así el nuevo vale la pena sin borrar el esfuerzo anterior.
  - Hoy no hay ningún concepto de temporada competitiva en el código.

### 7.5 Normalizar las piezas de tier

- **Por qué:** sin esto, el bono % está compensando ítems que son peores que lo común.
- **Qué:**
  - cada pieza de tier tiene que ser la mejor de su lugar para su clase (defensa, golpe o daño mágico al menos 10 % por encima de lo mejor común);
  - las piezas de clases físicas suman resistencia mágica (campo `resistenciaMagica`, que ya existe; por ejemplo 5-10 por pieza) y las de lanzadores, defensa física;
  - +1, +2 y LEGENDARIA tienen que subir de verdad: +5 %, +10 % y +15 % de stats sobre la base.
- **Dónde:** datos en las tres copias de `objs.json`: `server/jsons/objs.json`, `api/src/jsons/objs.json` y `frontend/public/init/objs.json`, que hay que regenerar con `exportClientObjs`.
- **Casos a corregir:**
  - asesino: Puñal Desterrado 19-22 contra MataDragones 35-48;
  - druida: báculos solo de daño mágico;
  - ladrón y bandido: sin set;
  - armaduras del Caído (20-30) contra Placas Doradas (50-70).
- Después de cambiar datos, volver a correr el simulador.

### 7.6 Rarezas (normal, mejorado, épico, legendario)

- **Qué había en los repos de Leandro** (`_Argentum`, `elementalSystem.js` y `game.js`; `_React-Argentum`, `elementalMeta.js`):
  - 4 rarezas: Normal `#9da3ae`, Mejorado `#35c76d`, Épico `#8a56e2`, Legendario `#d8a729`;
  - probabilidades 66,9 %, 30 %, 3 % y 0,1 %, sorteadas al crear o levantar el ítem;
  - **no sumaban daño plano**: sorteaban 1 a 3 modificadores **elementales porcentuales** (1-4 %, 3-8 %, 6-14 %);
  - el legendario no se pierde al morir;
  - la rareza viajaba al cliente como texto dentro del tooltip.
- **Qué se pidió ahora:** "+1, +2" que sumen un poco de daño al arma.
- **Propuesta:**
  - La rareza se guarda por **instancia** del ítem, porque hoy el inventario guarda `idItem`, `cant` y `equipped`. Columna nueva `rarity` en `character_items`, `character_bank_items`, la bóveda y la subasta, y campo en `user.inv[slot]`. Viaja como campo propio en el paquete de inventario, no como texto.
  - Efecto **plano y chico**:

| Rareza | Arma | Casco, escudo, armadura | Báculos, sombreros, anillos |
|---|---|---|---|
| Mejorado | +1 al golpe mínimo y máximo | +1 de defensa | +2 de daño mágico |
| Épico | +2 | +2 | +4 |
| Legendario | +3, y no se cae | +3 | +6 |

  - Peso calculado: +1 de golpe máximo suma unos 3 + 0,2 × 25 = 8 de daño bruto (40 de fuerza). Con el factor PvP son unos 4 por golpe: **alrededor de 2 % por cada +1**.
  - Sortear al dropear y al craftear. **No** sortear en la compra a NPC: en el repo original, comprar y vender servía para "pescar" legendarios.
  - Cliente: color del nombre y del borde del lugar, y "+N" en el nombre (por ejemplo "Espada Larga +2").
  - Ónice puede quedar como el encantamiento de AoDrag (+2, 50 % de éxito). Es una decisión aparte.

### 7.7 Arreglar los bugs

1. **Maná de objetoEspecial (+100/+200/+300):** sumar `getEquippedSpecialBonuses(user).maxMana` al maná máximo donde se calcula:
   - `login.ts` (cálculo de `maxMana` al entrar);
   - `game.ts` (subida de nivel, cerca de `getMaxManaForLevel`);
   - `gameDataSync.ts` (recarga de balance);
   - al equipar o desequipar.

   Cambia balance: el mago pasa de 2 a 3 Llamas de Dragón con el maná lleno, y hay que tenerlo en cuenta.
2. **Pirata:** darle `modDmgMagia` (por ejemplo 0,8) o hacer que "Disparo" use daño físico de proyectil. Decisión de diseño.
3. **Túnicas especiales:** `equipmentRewardBonuses.getEquippedBodyObject` tiene que leer `user.inv`. Así también se arregla el error de `tsc` en `npcs.ts:3440`.
4. **OE 1, 53 y 54 (ahorro de flechas) y OE 55:** implementar o sacar la promesa del nombre.

### 7.8 Pociones e intervalos

- **Por qué:** con pociones cada 50 ms se pueden tomar 20 rojas por segundo (600 de vida por segundo). Entre dos hechizos (560 ms) entran 11 rojas (330 de vida), y entre dos golpes (650 ms), 13.

| Intervalo de pociones | Pociones entre hechizos | Vida curada |
|---|---:|---:|
| 50 ms (hoy) | 11 | 330 |
| 160 ms (AoDrag) | 3 | 105 |

  Con 160 ms, "2-3 aciertos" vuelve a significar algo.
- **Qué:** `useItemMs` de 50 a **160 ms**, como AoDrag. Se edita en `/intervalos` o en `vars.timing.actionCooldowns`. El cliente repite cada `useItemMs / 5`, y conviene que repita al mismo intervalo.
- El hechizo de AoDrag sale cada 200 ms y acá cada 560 ms. No se toca ahora: más rápido haría el combate todavía más explosivo.

### 7.9 Verificar el perfil de balance de producción

Es lo primero, antes de todo lo demás:
1. `select data, version, updated_at from game_balance` en producción.
2. Si no coincide con `api/src/jsons/balance.json`, actualizarlo con `/admin/game-data/balance` (PUT) o con `pnpm --dir api import-game-data`.

Sin esto, cualquier cambio de `balanceData.ts` no llega al juego.

---

## 8. Resultado implementado (resumen)

Tablas completas en [BALANCE_PVP_TABLAS.md](BALANCE_PVP_TABLAS.md) y, por clase, en [NIVELACION_POR_CLASE.md](NIVELACION_POR_CLASE.md).

Nivel 50, equipo común contra común. Celda: aciertos `antes (main) → ahora (objetivo)`:

| Atacante | Mago | Clérigo | Paladín | Guerrero |
|---|---|---|---|---|
| Mago, magia | 3,0 → **3,0** (3,0) | 3,0 → **3,0** (3,0) | 4,0 → **3,1** (3,5) | 4,0 → **4,0** (4,0) |
| Druida, magia | 3,0 → **3,0** (4,0) ⚠ | 4,0 → **4,0** (4,0) | 4,0 → **4,0** (4,5) | 5,0 → **5,0** (5,0) |
| Clérigo, golpe | 1,0 → **2,5** (3,0) | 1,9 → **3,8** (4,0) | 2,0 → **4,5** (4,5) | 2,0 → **4,6** (4,5) |
| Paladín, golpe | 1,0 → **2,0** (2,5) | 1,0 → **3,1** (3,5) | 1,8 → **3,8** (4,0) | 1,9 → **3,9** (4,0) |
| Asesino, golpe | 1,0 → **3,0** (3,0) | 1,6 → **4,0** (4,0) | 2,0 → **4,6** (4,5) | 2,0 → **4,8** (4,5) |
| Guerrero, golpe | 1,0 → **2,0** (2,0) | 1,0 → **2,8** (3,0) | 1,0 → **3,0** (3,5) ⚠ | 1,5 → **3,0** (3,5) |
| Cazador, flecha | 2,0 → **2,0** (3,0) ⚠ | 2,9 → **3,3** (4,0) ⚠ | 3,0 → **3,9** (4,5) ⚠ | 3,4 → **3,9** (4,5) ⚠ |

Lo que todavía queda lejos del objetivo:
- **Cazador con flecha:** mata más rápido que lo pedido contra todos.
- **Druida con magia contra mago:** 3 en vez de 4 (el druida queda igual que el mago contra un mago).
- **Guerrero contra paladín:** 3 en vez de 3,5.
- **Lado defensivo del set:** sin set contra uno con set da ×1,42 (objetivo ×1,3). Con las piezas normalizadas (7.5) hay que volver a ajustar.
- **Sin buffs** el físico queda lento. La matriz está pensada para el estado normal de PvP, con los dos buffeados; es el incentivo clásico de AO para buffearse.

---

## 9. Decisiones abiertas (para Leandro)

Tomadas al implementar: rarezas con "+N" plano y piezas de set siempre Legendarias (pedido de Leandro); tope de 40 solo en PvP; ventaja del set de "un acierto" (+25 % de daño y +20 % de vida); pociones a 160 ms; bug del maná OE arreglado. Siguen abiertas la 6 (temporadas), la 7 (resto de las clases) y Ónice (5).

1. **Matriz objetivo:** ¿se aprueban los ajustes de identidad y aguante de la sección 6, que son propuesta, y el piso de 2 aciertos?
2. **Tamaño de la ventaja del set:** ¿"más o menos un acierto a nivel 50" (×0,75 / ×1,3, con +25 % de daño y +20 % de vida), o algo más moderado (×0,85 / ×1,15)?
3. **Tope de 40:** ¿solo en PvP (recomendado, no toca el PvE) o global, como en el AO clásico (−9 % a −18 % de daño contra NPC)?
4. **Pociones:** ¿50 → 160 ms como AoDrag, o un valor intermedio?
5. **Rarezas:** ¿"+N" plano (lo pedido ahora) o los modificadores elementales en % de los repos viejos? ¿Se porta Ónice como encantamiento?
6. **Temporadas:** ¿qué set corresponde a la temporada actual (Desterrado, Caído o uno nuevo) y qué pasa con el anterior?
7. **Bardo, pirata, ladrón, bandido y arquero:** definir su identidad. La matriz solo cubre las 8 clases principales.
8. **Bug del maná OE:** arreglarlo cambia el balance (el mago tira 3 Llamas en vez de 2). ¿Se arregla junto con el resto?

---

## 10. Plan de implementación por etapas

Cada etapa va en su PR, con tests y una corrida del simulador en el "Test plan".

| Etapa | Qué | Archivos principales | Cómo se valida |
|---|---|---|---|
| 0 | Verificar `game_balance` en producción (7.9) | — | Captura del perfil. Si hay diferencias, exportarlo y correr el simulador con `--perfil-balance`. |
| 1 | Bugs (7.7): maná OE, túnicas especiales, pirata | `login.ts`, `game.ts`, `gameDataSync.ts`, `protocol.ts` (equipar), `equipmentRewardBonuses.ts` | Tests unitarios. En vivo: túnica "+300 maná" muestra 2787. |
| 2 | Núcleo PvP: tope 40 y factores PvP (7.1, 7.2) | `game.ts` (`calcularDmg`, `poderAtaqueArma`, `poderEvasion`, `applyUserSpellDamage`), `balanceData.ts`, `api/src/repositories/gameBalance.ts`, `api/src/jsons/balance.json` | `pnpm --dir server balance-sim` sin `--propuesta` tiene que dar lo mismo que la propuesta original (sin el bono de set). Repetir la validación en vivo de la sección 4. |
| 3 | Sets: `setId`, `sets.json`, `setBonuses.ts`, normalización de piezas (7.4, 7.5) | `objs.json` (3 copias), `scripts/exportClientObjs.ts`, `setBonuses.ts`, `protocol.ts`, tooltip del cliente | Simulador con set contra común a ×0,75 ±0,1 y común contra set a ×1,3 ±0,1. En vivo: vida máxima +20 % con el set puesto. |
| 4 | Rarezas (7.6) | Inventario, banco y bóveda (DB y `user.inv`), paquete de inventario, drops y crafteo, cliente | Tests de sorteo. En vivo: un arma Épica pega +2 en el rango. |
| 5 | Pociones (7.8) | `vars.timing` o `/intervalos`, repetición del cliente | Prueba en vivo de tomar pociones. |
| 6 | Resto de las clases y de las razas | `targets.ts`, factores | Simulador con `--clases` ampliado y con `--raza`. |

Estado: las etapas 1 a 5 están en el PR #54; la normalización de piezas (parte de la 3) y la 6 quedan pendientes. La 0 se hace al desplegar (sección 0).

Al terminar cada etapa, actualizar este documento: estado, valores finales y resultados.

---

## 11. Referencias

- **AoDrag** (investigación del 2026-10-23):
  - AODrag Oficial: https://aodragoficial.com/wiki, con datos en `/data/wiki/balance.json`, `hechizos.json` y `armas.json`, y calculadora de vida en `/wiki/calculadora-vida`.
  - Código público de AoDrag 7.0: https://github.com/scorpio21/Aodrag-Server-7.0 (`SistemaCombate.bas`, `modHechizos.bas`).
  - Datos clave de AoDrag:
    - Fórmula física igual a la de acá, con modificador de daño con armas del guerrero 1,2.
    - Hechizos +3 % por nivel; acá es +2 %.
    - Vida a nivel 50 con CON 21: Mago 398, Guerrero 562.
    - Nivel máximo 67.
    - Encantamiento Ónice: 50 % de éxito.
    - Intervalos: golpe 650 ms, hechizo 200 ms, poción 160 ms, combo libre.
  - Lo que se calculó con sus fórmulas a nivel 50: guerrero contra mago, 2 golpes; mago contra mago, 2 Apocalipsis; mago contra guerrero, 3.
- **Repos de Leandro** (rarezas): `leb90/_Argentum`, rama `develop` (`elementalSystem.js`, `game.js` líneas 132-605), y `leb90/_React-Argentum`, rama `SoloAo` (`elementalMeta.js`, `InventoryPanel.js`, `GameHUD.css` 950-953). Commits `caf30cc` y `80b486d` del 12/02/2026.
- **Modelo de Eze:** [combat-balance.md](combat-balance.md), `server/src/combatBalance.ts`, `server/src/scripts/reportCombatBalance.ts` y `applyCombatBalanceData.ts`.

---

## 12. Datos de referencia

**Equipo que usa el simulador a nivel 50** (`gear.ts`; ids de `objs.json`):

| Clase | Común | Set |
|---|---|---|
| Mago | Báculo Mago 753 (+28 DM), Túnica Lujosa Azul 732, Sombrero Hechizado 1223, Anillo de Energía 1221 | Báculo Desterrado (MAGO) LEGENDARIO 1512, Túnica Desterrada (Mago) 1341, Capucha Mágica del Caído +2 1474, Anillo Mago del Caído 1357 |
| Guerrero | Espada MataDragones 402, Placas Doradas +5F 729, Casco Centurión 832, Escudo Sajón 824 (sin anillo útil: el Anillo de Resistencia Mágica 988 no se consigue) | Espada del Caído LEGENDARIA 1503, Armadura del Caído 1347, Casco del Caído +2 1489, Escudo del Caído +2 1465 |
| Druida | Báculo de la Naturaleza 1225, Túnica Legendaria 519, Sombrero Hechizado 1223, Anillo de Energía 1221 | Báculo Desterrado (DRUIDA) LEGENDARIO 1515, Túnica Desterrada (Druida) 1342, Corona de Plumas del Caído 1356 o 1477, Anillo Naturaleza del Caído LEGENDARIO 1454 |
| Clérigo, Paladín, Bardo, Asesino, Cazador | Ver [NIVELACION_POR_CLASE.md](NIVELACION_POR_CLASE.md) | Ver [NIVELACION_POR_CLASE.md](NIVELACION_POR_CLASE.md) |

**Hechizo principal por nivel** (el mejor que la clase puede aprender, lanzar y pagar):

| Clase | Nivel 30 | Nivel 40 | Nivel 50 |
|---|---|---|---|
| Mago | Lluvia de Sangre | Llama de Dragón | Llama de Dragón |
| Druida | Incinerar | Incinerar | Incinerar |
| Clérigo | Ventisca | Ventisca | Purificar |
| Bardo | Apocalipsis | Apocalipsis | Apocalipsis |
| Paladín y Asesino | Descarga Eléctrica | Descarga Eléctrica | Descarga Eléctrica (Apocalipsis o Destello si el maná alcanza) |
