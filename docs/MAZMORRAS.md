# Mazmorras (PvE instanciado)

Fecha: 2026-10-25. Estado: **etapa 1 (motor) hecha**; faltan las mecánicas, la Gruta y el balance (sección 4). La primera mazmorra está en [mazmorras/01-GRUTA_DEL_ABISAL.md](mazmorras/01-GRUTA_DEL_ABISAL.md).

Una serie de mazmorras al estilo Zelda para el PvE del juego: puzzle, exploración, llaves y un jefe. Cada una da un **ítem de mazmorra** que se usa en las siguientes.

## 1. Lo pedido

1. Mazmorras a nivel Zelda; cada una da un ítem de mazmorra.
2. Se entra solo o con un grupo que se arma al querer entrar, al estilo World of Warcraft.
3. Se entra solo por una **piedra de invocación**; de otra forma, no.
4. Cada grupo (o jugador solo) tiene **su propia instancia**: adentro no hay PvP.
   - Con tu grupo no te podés atacar.
   - Si salís del grupo, te expulsa de la instancia.
5. La dificultad se ajusta según si vas solo o en grupo.
6. Los ítems de mazmorra se ven en un **menú arriba del de los ítems**. Ahí solo hay ítems de mazmorra, y solo se usan en las mazmorras.
7. La primera mazmorra recrea el Túnel del Pez Abisal de *Link's Awakening* con gráficos de AO e igual jugabilidad (ticket de Trello).

## 2. Lo que ya existe y se reutiliza

| Pieza | Dónde | Para qué sirve |
|---|---|---|
| Instancias de mapa | `server/src/mapInstanceManager.ts` | Clona un mapa base a un número dinámico (30000 + base × 50 + n) con sus propias criaturas. Lo destruye cuando no queda nadie. |
| Mapas de instancia en el cliente | `frontend/utils/gameLoader.ts` | Para esos números, el cliente ya dibuja el mapa base. |
| Party | `server/src/game.ts` (`partyId`, `memberIds`, hasta 10) | Base del grupo de la mazmorra. |
| Puertas que se abren y cierran | `game.ts` (objeto puerta, bloquea 2 baldosas) | Puertas de sala y puertas con llave. |
| Salidas y teleports | `specials.json` (`exits`), objeto teleport (tipo 19) | Escaleras a túneles y portales. |
| Criaturas grandes | Leviatán (548), Tortuga gigante (539), Elemental de agua (92) | Jefe, minijefe y enemigos de agua. |

**Límites que hay que tener en cuenta:**
- El número de mapa viaja como entero de 16 bits, así que el mapa base de una mazmorra no puede pasar de 709. Los mapas libres van del 507 al 599: se propone reservar **510-519 para la mazmorra 1, 520-529 para la 2**, y así.
- El server solo carga los mapas 1-309 y 500-506: hay que sumarle los de mazmorras.

## 3. Cómo funciona (propuesta)

### 3.1 Entrada por la piedra de invocación
- Cada mazmorra tiene una piedra en el mundo (una criatura fija que no se ataca). Para la Mazmorra 1 se propone la playa de Lindos, por el tema del agua.
- Al hacerle clic se abre un panel con la mazmorra, el nivel recomendado, si ya cobraste la recompensa de hoy y dos botones: **Entrar solo** y **Entrar con mi grupo**.
- **Con grupo** (como la piedra de encuentro de WoW) **[confirmado: con la party actual, hasta 5]**:
  - el líder de la party la usa;
  - a cada miembro online le aparece "Leandro te invoca a la Gruta del Abisal" con 30 segundos para aceptar;
  - los que aceptan son invocados a la instancia desde donde estén, siempre que estén vivos y no en otra actividad (arena, Hunters, Blood Castle).
- **No hay otra forma de entrar:** los mapas de mazmorra no tienen salidas al mundo y `/telepme` de un GM a un mapa base de mazmorra avisa en lugar de dejarte adentro.

### 3.2 La instancia
- Una corrida crea la instancia de **todos los mapas de la mazmorra** a la vez (en la 1, los tres), con sus criaturas, puertas y cofres en el estado inicial.
- Pertenece al grupo con el que se entró: nadie más entra.
- **Sin PvP:** adentro no se puede atacar a otro jugador ni con hechizos de daño. Los de ayuda (curar, resucitar) sí.
- **Expulsión:**
  - si un jugador sale de la party (o lo echan), vuelve a la piedra;
  - si el líder cambia, la instancia sigue;
  - si alguien se desconecta y vuelve dentro de 10 minutos, vuelve a la instancia; si no, aparece en la piedra.
- Se destruye a los 15 minutos de quedar vacía.

### 3.3 Dificultad según el grupo
Se calcula al crear la instancia, con la cantidad de jugadores que entraron (n):

| | Solo (n = 1) | Por cada jugador más |
|---|---|---|
| Vida de las criaturas | × 1 | + 70 % |
| Daño de las criaturas | × 1 | + 15 % |
| Experiencia y oro | normal | se reparte como en una party |

El jefe escala igual. Si alguien entra después (invocado por el líder mientras la instancia vive), no se recalcula.

### 3.4 Muerte y salida
- **[confirmado]** Si morís adentro quedás fantasma, como en el resto del juego, hasta que alguien te resucite (un clérigo del grupo, por ejemplo). La instancia sigue.
- Un fantasma puede salir por el portal de la entrada, así nadie queda trabado si muere todo el grupo. Afuera se revive como siempre.
- Para salir hay un portal en la entrada y otro después del jefe. También te saca salir de la party.

### 3.5 Recompensas y repetición
- **[confirmado]** La recompensa del jefe se cobra **una vez por día por personaje**. Se puede repetir la mazmorra; sin esa recompensa, pero con las criaturas.
- El **ítem de mazmorra** (en la 1, las Patas de rana) se gana una sola vez y queda para siempre en el personaje.

### 3.6 Ítems de mazmorra y el menú "Mazmorra"
- Son una categoría aparte: no van al inventario común, no se tiran, no se venden ni se comercian.
- En el panel de la derecha, arriba de la grilla del inventario, aparece una franja **Mazmorra** solo cuando estás en una:
  - **Permanentes de la serie (inventario de mazmorra):** las Patas de rana (Mazmorra 1) y los que den las siguientes. Se guardan porque las mazmorras siguientes pueden necesitarlos.
  - **De la corrida** (como en Zelda): las llaves chicas (con contador), la llave del jefe, el mapa y la brújula. Solo existen adentro: afuera no se tienen.
  - **Las llaves** las lleva el que abrió el cofre y desaparecen al abrir la puerta. Si el que la lleva sale de la mazmorra (por ejemplo, expulsado al dejar la party) o se desconecta, pasa a otro del grupo que siga adentro.
- **Solo se usan en mazmorras.** Afuera no hacen nada y la franja no se ve.

### 3.7 Mecánicas de mazmorra
Todas por datos del mapa, para que las mazmorras siguientes se armen sin código nuevo. Cómo quedó cada una está en la sección 7.

| Mecánica | Cómo funciona en AO |
|---|---|
| Llave chica / puerta con llave | Cofre o criatura que da una llave de la corrida. Cualquier llave abre cualquier puerta con llave de esa mazmorra y se gasta. La lleva el que abrió el cofre; si sale o se desconecta, pasa a otro del grupo. |
| Llave del jefe | Abre solo la puerta del jefe y también se gasta. |
| Sala que se cierra | Al entrar el primero, las puertas se traban hasta matar a todas las criaturas de la sala. Puede dar un cofre al terminar. |
| Pozo | Caer quita vida y te deja en la entrada de esa sala. |
| Pinchos / aplastadores | Baldosas que dañan al pisarlas o cada cierto tiempo. |
| Placa | Se activa mientras alguien (o un bloque) está encima: abre una puerta o hace aparecer un cofre. |
| Bloque empujable | Al caminar contra él se corre una baldosa si está libre. Sirve para dejar una placa apretada jugando solo. |
| Agua profunda | No se puede pisar sin el ítem de mazmorra que deja nadar (las Patas de rana): con ellas se nada bajo el mar. Nadando no se ataca. |
| Escalera a túnel (warp) | Lleva a otra parte o a otro mapa de la mazmorra; una vez recorrida queda como atajo. |
| Cofre de mazmorra | Mapa, brújula, llave, oro u objeto. Lo abre uno: el mapa y la brújula valen para todo el grupo; la llave la lleva él. |
| Losa de piedra | Texto con una pista o lore al hacerle clic. |
| Mapa / brújula | El mapa muestra todas las salas en el minimapa. La brújula marca cofres y la sala del jefe. |

## 4. Plan por etapas (un PR por etapa)

1. **Motor de mazmorras. [hecho]** Ver la sección 6.
   - Definición por datos (`jsons/dungeons.json`) y piedra de invocación.
   - Entrar solo o con la party, instancia de todos los mapas, sin PvP.
   - Expulsión, muerte, salida y escalado.
   - Generador de mapas desde un plano en texto y una mazmorra de prueba de dos mapas.
   - El bloqueo diario de la recompensa pasa a la etapa 3, junto con el cofre del jefe.
2. **Mecánicas. [hecho]** Ver la sección 7.
   - Las de la tabla 3.7, el menú "Mazmorra" y el mapa y la brújula en el minimapa.
   - Los túneles que quedan como atajo pasan a la etapa 3, si la Gruta los necesita.
3. **Gruta del Abisal.**
   - Un generador de mapas desde un plano en texto, con gráficos de AO, así las salas se editan fácil.
   - Los mapas 510-512, criaturas por sala, minijefe, jefe con fases, Patas de rana y recompensas.
4. **Prueba y balance.** En vivo solo y en grupo de 5, ajuste de números y página de la wiki.

## 5. Decisiones

| Tema | Decisión |
|---|---|
| Cómo se arma el grupo | **Confirmado:** con la party actual, invocada desde la piedra |
| Tamaño máximo del grupo | **Confirmado:** 5 |
| Muerte adentro | **Confirmado:** fantasma como afuera, hasta que te resuciten; el fantasma puede salir por el portal |
| Repetición | **Confirmado:** recompensa del jefe una vez por día por personaje |
| Escalado | Propuesta: vida + 70 % y daño + 15 % por jugador extra (se ajusta en la etapa 4) |
| Piedra de la Mazmorra 1 | Propuesta: playa de Lindos |
| Trofeo del jefe | Propuesta: "Escama del Abisal", un coleccionable de la serie como los instrumentos de Zelda, más un cofre con oro y un objeto |

## 6. Etapa 1: el motor

### Qué hace
- **Piedra de invocación:** una criatura fija con `dungeonId` en su plantilla. Al tocarla (a 4 baldosas o menos) se abre su panel: descripción, nivel, "Entrar solo" y "Con mi grupo (n)".
- **Solo:** crea la corrida y te deja en la entrada.
- **Con grupo:**
  - lo usa el líder de la party (hasta 5);
  - entra él y a los demás les llega una invocación de 30 segundos para aceptar;
  - aceptan desde donde estén, si siguen en la party, vivos y fuera de otra actividad (arena, Hunters, otra instancia).
- **Corrida:** copia todos los mapas de la mazmorra con sus criaturas, en el mismo lugar libre (`30000 + mapa × 50 + lugar`, hasta 50 corridas a la vez por mazmorra). Las criaturas de una corrida **no reaparecen**, y en los mapas base no aparece ninguna.
- **Dificultad:** se calcula al crear la corrida con los miembros conectados de la party: vida + 70 % y daño + 15 % por cada uno además del primero.
- **Sin PvP:** adentro no se puede atacar a otro jugador, ni cuerpo a cuerpo ni con hechizos. Con la party ya lo frenaba el fuego amigo; esto cubre a los que quedan adentro sin party (por ejemplo, si se desconecta el líder y la party se disuelve).
- **Salir:**
  - por el portal de salida, o con "Salir" en el cartel de arriba (`/mazmorra salir`);
  - un fantasma también puede salir;
  - se aparece junto a la piedra (`regreso`).
- **Expulsión:** salir de la party o que te echen te saca. Desconectarse no: el server te saca de la party al desconectarte, pero eso no cuenta.
- **Reconexión:** si te desconectás adentro y volvés mientras la corrida sigue viva, aparecés donde estabas. Una corrida sin nadie conectado adentro se borra a los 15 minutos, y una de la que salieron todos, enseguida. Si la corrida ya no existe, aparecés junto a la piedra.
- **Escaleras:** las salidas entre mapas de la mazmorra llevan al mapa de la misma corrida.

### Cómo se arma una mazmorra
1. Se agrega a `server/jsons/dungeons.json`:
   - `id`, `nombre`, `descripcion`, `nivelMinimo` y `maxJugadores`;
   - `regreso`: dónde aparecés al salir, junto a la piedra;
   - `piedraNpc`: número libre para la plantilla de la piedra (`piedraCuerpo` cambia su cuerpo);
   - `escalado` y, si no se tiene que abrir en producción, `soloDesarrollo: true`.
2. Se dibujan los planos en `server/mazmorras/<id>/mapa_<N>.txt` (N entre 507 y 599). El formato está al principio de `server/src/scripts/buildDungeonMaps.ts`:
   - `#` pared, `.` piso, `~` agua, `E` entrada, `S` portal de salida;
   - `1`-`9` escaleras que se unen de a pares;
   - letras para criaturas, con su número en `leyenda.json`.
3. Se corre `pnpm --dir server exec tsx src/scripts/buildDungeonMaps.ts <id>`. El generador:
   - escribe los mapas en el server, la API y el cliente (`static/maps_local` y el minimapa en `imgs_maps`);
   - anota en `dungeons.json` la entrada, las salidas y los mapas;
   - crea la plantilla de la piedra.
4. Se reinicia el server de juego.

Las paredes usan las texturas del mapa 116: la cara de la pared en el lado norte de cada sala y piedra oscura en el resto. La etapa 3 suma las paredes laterales para la Gruta.

### Mazmorra de prueba
- `prueba`, mapas 590 y 591, con `soloDesarrollo: true`: en producción solo entra un GM, solo o llevando a su party (los demás entran aceptando su invocación). Para el resto, la piedra dice que está en desarrollo.
- Sus mapas están marcados "GM", así que no aparecen en la wiki.
- La piedra (NPC 9720) no está puesta en ningún mapa. Para probar, un GM la invoca con `/invocarnpc 9720`.

### Archivos
- `server/src/dungeons.ts`: el motor.
- Enganches en el server:
  - `protocol.ts`: paso por el portal y las escaleras, clic en la piedra, `/mazmorra` como comando de panel;
  - `commands.ts`: `/mazmorra`;
  - `game.ts`: sin PvP y expulsión al salir de la party;
  - `npcs.ts`: sin reaparecer;
  - `loadNpcs.ts`: nada en los mapas base;
  - `loadMaps.ts`: carga los mapas de mazmorra;
  - `login.ts`: vuelta a la corrida;
  - `mapInstanceManager.ts`: no borra las corridas al desconectarse;
  - `handleProtocol.ts` y `package.ts`: paquete `dungeonState` (100).
- Cliente:
  - `aowProtocol.ts` lee el paquete;
  - `components/DungeonOverlay.tsx` muestra el panel, la invocación y el cartel de adentro.
- `server/src/dungeons.test.ts`: cuentas de instancias y escalado, lugares libres, datos de cada mazmorra (mapas en las tres copias, entrada, portal de salida, piedra) y escaleras que no salen de la mazmorra.

## 7. Etapa 2: las mecánicas

### Cómo quedó cada una
Todas salen del plano: el generador las guarda en la clave `dungeon` de `specials.json` y `dungeons.ts` las lee al crear la corrida. Cada corrida tiene su propio estado (puertas abiertas, cofres abiertos, bloques, salas cerradas). Las llaves las lleva el que abre el cofre; el mapa y la brújula valen para todo el grupo.

| Símbolo | Mecánica | Cómo funciona |
|---|---|---|
| `L` | Puerta con llave chica | Clic a 2 baldosas o menos: si llevás una llave chica, la gasta y abre. Si la lleva otro, la puerta dice quién. |
| `J` | Puerta del jefe | Igual, con la llave del jefe, que también se gasta. |
| `!` | Sala que se cierra | Al entrar con criaturas adentro, sus puertas `+` se cierran. Al morir la última se abren y aparecen los cofres de la sala, que hasta ahí no se ven (tampoco en el minimapa). Si alguien está parado en una puerta, se cierra cuando quede libre. |
| `+` | Puerta de sala | Abierta; se cierra cuando se cierra una sala a la que da. |
| `O` | Pozo | Caer quita el 10 % de la vida y te deja donde entraste a la sala. |
| `^` | Lava | Quema el 8 % de la vida al pisarla y cada segundo que te quedás. |
| `%` | Lava periódica | Erupciona 1 de cada 3 segundos (se ve el fuego de la Llamarada): mientras erupciona quema el 12 % cada medio segundo. |
| `_` | Placa | Apretada con un jugador o un bloque encima. Con todas las placas del mapa apretadas a la vez se abren las puertas `=`, y quedan abiertas. |
| `B` | Bloque | Clic estando al lado: se corre una baldosa hacia el otro lado si hay piso libre de la misma sala (no pozo, lava, agua ni otro objeto; sí una placa). Así se resuelve una placa jugando solo. |
| `?` | Losa | Clic a 2 baldosas o menos: muestra su texto (`losas` en `leyenda.json`, en orden de lectura). |
| `~` | Agua profunda | Solo se nada con las Patas de rana: el personaje se ve medio sumergido y nadando no se puede atacar ni lanzar hechizos. Sin ellas el cliente no deja pisarla. |
| `K` `N` `M` `X` | Cofres de llave chica, llave del jefe, mapa y brújula | Clic al lado. Las llaves quedan en la franja del que abrió el cofre; el mapa y la brújula, en la de todos. |
| `$` | Cofre de oro | El oro (`oro` en `leyenda.json`, 250 si no está) es para el que lo abre. |
| `R` | Cofre principal | Da el ítem de la mazmorra (`itemMazmorra` en `dungeons.json`) a todos los que están en la corrida, para siempre. |
| `T` | Cofre trampa | Suelta las criaturas de `trampa` en `leyenda.json` (con el escalado del grupo) y cierra la sala hasta matarlas. |

Las criaturas no pisan pozos, lava ni puertas (trigger 2): no salen de su sala, así que la sala que se cierra las encierra a todas. Los cofres abiertos quedan como cofre abierto.

### Menú "Mazmorra" y minimapa
- **Franja "Mazmorra":** arriba de la grilla del inventario, solo adentro. Muestra las Patas de rana, las llaves chicas (con contador), la llave del jefe, el mapa y la brújula; lo que falta se ve apagado. Una llave que lleva otro del grupo se ve a media luz, con su nombre al pasar el mouse.
- **Minimapa:**
  - lo que no se visitó queda tapado; con el mapa, las salas sin visitar se ven a media luz;
  - con la brújula se marcan los cofres (dorados si están cerrados) y la puerta del jefe.

### Ítems de mazmorra
Son el inventario de mazmorra: quedan en el progreso del personaje (`dungeonItems` en `data/woaoProgress.json`), no en el inventario común. No se tiran, no se venden y solo hacen algo adentro, pero se guardan para las mazmorras siguientes. Las Patas de rana (`patas_de_rana`) son las que dejan nadar.

### Llaves en grupo
- La llave la lleva el que abrió el cofre y solo él abre la puerta. A los demás la franja les muestra quién la tiene.
- Al abrir la puerta, la llave desaparece.
- Si el que la lleva sale de la mazmorra (portal, "Salir" o expulsado al dejar la party) o se desconecta, pasa al primero del grupo que siga adentro, y se avisa a todos.
- Afuera nadie tiene llaves, mapa ni brújula: son de la corrida. Al volver a entrar se arranca sin ellas, pero con las Patas de rana.

### Mazmorra de prueba
Recorre todas las mecánicas en dos mapas:
- **Mapa 590:**
  - **Entrada:** una losa, un cofre con llave, lava y un pozo. La puerta con llave lleva a la sala de las placas y una puerta de sala, a la sala que se cierra (tres criaturas y la brújula oculta).
  - **Sala de las placas:** dos placas y un bloque. La puerta de cristal que abren lleva al tesoro: el mapa, las Patas de rana, la escalera y un lago con un cofre de oro en una isla.
- **Mapa 591:** una franja de lava periódica, la llave del jefe del otro lado, una sala con un cofre trampa y la puerta del jefe con el portal de salida.

### Archivos
- `server/src/dungeons.ts`: las mecánicas.
- `server/src/scripts/buildDungeonMaps.ts`: los símbolos nuevos, las salas, los objetos de mazmorra (1832-1840 en `objs.json`) y los colores del minimapa.
- Enganches en el server:
  - `protocol.ts`: pozos y agua al moverse, sala, lava y placas después del paso, clic en cofres, losas, puertas y bloques, y nada de ataques nadando;
  - `game.ts`: las criaturas no pisan el trigger 2, y la foto del área manda el bloqueo actual de puertas, cofres y bloques;
  - `npcs.ts`: abrir la sala al morir la última criatura;
  - `login.ts`: el estado de la mazmorra al reconectar;
  - `socket.ts`: pasar las llaves del que se desconecta;
  - `woaoProgress.ts`: `dungeonItems`.
- Cliente:
  - `Engine.ts`: nadar con las Patas de rana, no embarcar adentro y el personaje medio sumergido;
  - `DungeonOverlay.tsx`: la losa, la franja y la niebla del minimapa;
  - `InventoryFloatingPanel.tsx`: dónde van la franja y la niebla.
- `server/src/dungeons.test.ts` suma los objetos de mazmorra y que las mecánicas de cada mapa estén bien armadas: puertas con su objeto, cofres ocultos solo en salas que se cierran, llaves suficientes, llave del jefe si hay puerta del jefe y criaturas que no pisan pozos, lava ni puertas. También el traspaso de llaves al que sigue adentro.
