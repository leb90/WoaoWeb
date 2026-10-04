# Historia principal "El Soñador": qué tenemos y qué nos falta

Fecha: 2026-10-04. Base: la historia propuesta (El Soñador, los 8 fragmentos/sellos, El Despertador, Nix como centro secreto) contra el estado real del repo en `main` + rama `feat-npc-aggro-entre-mapas`.

Resumen en tres líneas:

- **Capítulo I se puede armar HOY sin tocar código**: NPC nuevos, misiones de matar/entregar y el Faraón como "jefe de dungeon" ya existen como piezas. Lo que no existe es la *cadena* ni el *dungeon instanciado*; se pueden emular (ver §4).
- **Lo grande que falta es un motor de dungeon** (instancia por party, portal con requisitos, jefe con fases, botín, bloqueo) y una **v2 de misiones** (cadenas, hablar con NPC, facción, items de misión, elecciones). Hay buenas bases para las dos cosas: `mapInstanceManager`, `summonRoom`, `bloodCastle`, `bossEvents`, party y facciones.
- **Mapas**: 5 de los 8 dungeons se pueden montar reutilizando mapas existentes sin NPC (catacumbas, minas, catedral, Egipto); 3 piden mapas nuevos (Torre del Cielo, Reino Invertido, Corazón del Sueño). Hay editor visual de mapas en `developer/`.

---

## 1. La historia mapeada al mundo que ya existe

| Historia | Hoy en el juego | Comentario |
|---|---|---|
| Nix, ciudad neutral | Mapa 34 **Nix** (zona segura). Debajo: Dungeon oeste de Nix (33), Catacumbas Nix (43-45) | Encaja perfecto: "Nix fue construida sobre el Soñador" → las Catacumbas de Nix pueden ser la antesala del dungeon VIII. La Sala de Invocación (165) sale a Nix. |
| Ulla, pueblo de paso | Mapa 1 **Ullathorpe** | Los nuevos nacen en el Newbie Dungeon (37); Ullathorpe es la primera ciudad real. Las Catacumbas Ullathorpe (40-42) están vacías de NPC: candidatas a Dungeon I. |
| Bander, ciudad de la Alianza | Mapas 58-60 **Banderbill**; NPC 72 "Alarnick, Duque de Banderbill" (mapa 84) ya enlista a la Armada | La facción se llama internamente `armada` y se muestra "Alianza". |
| Ciudad de la Horda | Mapa 170 **"ciudad caos"**; NPC 98 "Demonio" enlista al Caos | Facción `caos`, se muestra "Horda". Requiere ser criminal. |
| Adalides | No existe el término. Hay rangos de facción (Soldado…Campeón de la Luz / Acólito…Devorador de Almas) | "Adalid" puede ser el título narrativo de quien completa "El llamado del Adalid"; no hace falta sistema nuevo. |
| Consejo de Nix | No existe | Son NPC nuevos (plantillas). |
| El Despertador / El Soñador | No existen | Jefe final + "presencia" (estatua/NPC no atacable). |

### Los 8 dungeons contra los mapas disponibles

| Dungeon | Mapa propuesto | Estado |
|---|---|---|
| Piloto: **Faraón** | EGIPTO 178-182 (laberinto 178-181 con trampas, Faraón NPC 611 en 182) | Existe como evento de mundo cada 6 h. **Ojo**: ningún `specials.json` tiene salida hacia el 182: hoy no se puede llegar caminando. Hay que arreglar el laberinto o poner el portal del dungeon. |
| I Las Ruinas del Eco | Catacumbas Ullathorpe 40-42 (41 sin NPC) o Dungeon oeste de Nix (33) | Reutilizable. Falta la "estatua" (NPC decorativo) y el jefe. |
| II El Bosque que Camina | Bosque terror 172-176 / casa terror 171, 177 | Reutilizable como mapa; "los árboles cambian de lugar" se emula con 2-3 variantes del mapa elegidas al azar al instanciar. |
| III Las Minas del Abismo | Minas Rapajik 50-52, mina 184 (sin NPC) | Reutilizable. |
| IV El Templo Sumergido | dungeon atlantis 162 o Catedral 188 (sin NPC, terreno Templo) | Reutilizable. |
| V La Torre del Cielo | No hay torre. Opción: Sala de los dioses 187 (sin NPC) como "cima" | Mapa nuevo (o 187 reambientado). |
| VI El Santuario de las Sombras | Catacumbas Nix 43-45 o Aldea Vampiros 261/262/264 | Reutilizable. |
| VII El Reino Invertido | **Copia instanciada de Nix (34)** con otros NPC y diálogos | Encaja con `mapInstanceManager` (clona mapa + NPC). Mapa nuevo solo si se quiere invertir el terreno. |
| VIII El Corazón del Sueño | Nuevo, "dentro del sueño": fragmentos de Nix, Banderbill, lugares destruidos | Mapa(s) nuevo(s). Se pueden componer con copias de mapas existentes encadenadas por portales. |

Hay 90 mapas sin NPC; los más útiles además de los listados: 9, 10, 92, 115, 117, 118 (DUNGEON), 190, 191, 195, 206/207/211-215 (EVENTO), 209, 223, 273/275, 301/302, 305/306.

---

## 2. Lo que tenemos (inventario honesto)

### Misiones (`server/jsons/quests.json`, `questGivers.json`, `server/src/quests.ts`)
- 31 misiones, todas `requiredLevel: 1`. Modelo: `requiredNpcs` (matar N de una plantilla), `requiredObjs` (tener N items, se quitan al entregar), `rewardGold/Exp/Points/Objs`.
- Un NPC entrega **una** sola misión (campo `questNumber` en la plantilla o `questGivers.json`); la recibe y la entrega el mismo NPC. Máximo 15 activas. Cada misión se hace una vez (`progress.done`).
- Cliente: marcador "!"/"?" sobre el NPC, modal de oferta/entrega, diario en el Hub. Progreso en `server/data/woaoProgress.json`.
- **No hay**: cadenas/prerrequisitos, fases, "hablar con", "ir a", "completar dungeon", filtro por facción/clase, items de misión, elecciones, repetibles, kills compartidos en party, texto narrativo más allá de `desc`.
- Pipeline de datos: editar JSON → reiniciar Game Server (no hay hot reload). Hay editor de misiones en `developer/` (doc: `developer/docs/QUEST_EDITOR_REDESIGN.md`).

### NPC (`server/jsons/npcs.json`, 649 plantillas)
- Campos: nombre, `idHead`/`idBody` (gráficos existentes), `movement`, `hostile`, `attackable`, vida, daño, defensa, `spells`, `drop`, `comercia`+`objs`, `desc` (texto fijo al clickear), `questNumber`.
- Índices libres cómodos: **780-899** y 907+ (y huecos sueltos). Se ubican en `server/mapas_source/mapa_N/npcs.json`.
- Limitación: los cuerpos/cabezas son los que ya existen en `graficos`; un "Despertador" visualmente nuevo pide gráficos nuevos. Hay plantillas sin uso aprovechables: 737 "Faraon Nuevo", 744 "Faraon Dorado".
- Diálogo: una burbuja fija (`desc`). No hay árbol ni páginas.

### Eventos PvE que ya funcionan (las piezas de un dungeon)
- **bossEvents.ts**: jefes por temporizador (Faraón cada 6 h en 182, Gollum cada 4 h en 175), anuncio global, comando `/boss`.
- **summonRoom.ts** (mapa 165): 4 jugadores parados en 4 baldosas → aparece el jefe (585); quien muere sale a 110@50,50. Es el "ritual de entrada" cooperativo.
- **bloodCastle.ts** (mapa 205): inscripción con cupo, oleadas cada 8 s, puerta destructible (NPC 779) que abre zona, jefe final (778), 10 min de límite, derrota si mueren todos, recompensa 150 puntos de canje a los sobrevivientes. Lo arranca un admin; un evento a la vez. **Es el esqueleto más cercano a un dungeon.**
- **tileEvents.ts**: trampas que quitan vida (178-179).
- **mapInstanceManager.ts**: clona un mapa con sus NPC (`30000 + base*50 + n`, 50 copias por mapa), se destruye al quedar vacío. Lo usan arenas/retos con su propia lógica. **No hay** asignación a un grupo, dueño, temporizador ni progreso.
- **Party**: hasta 10, invitar/aceptar/echar, exp compartida en el mismo mapa (+15% si son 2+). Oro y drops no se reparten. Solo misma alineación (ciudadano/criminal).
- **Facciones**: `armada`/`caos` con 5 rangos por puntos (PvP y guerras), guerra automática cada 90 min (mapas 203/204), templo del ganador (210), conquista de ciudades 251-260 (solo anuncio). Portales restringidos por facción: 151@18,65 (Caos), 60@79,24 (Armada).
- **Avisos**: `globalNotice` en pantalla con duración (hoy solo admin), burbujas, consola.
- **Entrada a mapas**: `minLevel`/`maxLevel` por `meta.json` (ningún mapa lo usa aún), tope de clan en castillos, prohibición por item (273). No hay "portal que pide misión".

---

## 3. Lo que falta (lista de trabajo)

### A. Motor de dungeon PvE instanciado (lo más grande; no existe)
1. **Instancia por party**: crear copia con `mapInstanceManager.ensureInstance`, asignarla a la party (líder), teletransportar a los miembros, destruir al vaciarse. Base: arenas/retos ya lo hacen por sala.
2. **Portal de entrada con requisitos**: nivel, misión previa, party de N (mín/máx), facción opcional, cupo. Hoy `getMapEntryDeniedMessage` solo mira nivel/clan/item.
3. **Script del dungeon**: secuencia de salas/puertas (patrón puerta NPC 779 de Blood Castle), oleadas (`spawnWaves`), jefe con **fases** (cambiar hechizos/daño por % de vida, invocar adds, mensaje en pantalla), "estatua con inscripción" (NPC no atacable con `desc` o `globalNotice`).
4. **Botín de dungeon**: hoy el drop va al piso y lo levanta uno. Falta reparto (cofre por jugador o roll) y reparto de oro.
5. **Bloqueo/cooldown por personaje** (diario o semanal) y "completado" registrado en `woaoProgress` para que las misiones puedan pedir "completá Las Ruinas del Eco".
6. **Muerte y salida**: patrón `summonRoom` (salir al morir) o permitir resucitar en la entrada; límite de tiempo (`bloodCastle`).
7. **Kills de party para misiones**: hoy solo cuenta quien da el último golpe (`respawn.ts:262`). En un dungeon es indispensable compartir.
8. **Horario vs instancia**: el Faraón hoy es evento de mundo cada 6 h. Para "dungeon" hay que decidir si pasa a instancia por party (recomendado) o sigue siendo mundo abierto con reglas.

### B. Misiones v2
1. Prerrequisitos: misión previa, nivel real, facción, dungeon completado.
2. Nuevos objetivos: hablar con NPC X (en otro mapa), llegar a un lugar (tile/mapa), completar dungeon, matar jefe de dungeon, usar/tocar objeto.
3. Entregar en un NPC distinto del que la da (ir de Ulla a Bander).
4. Varias misiones por NPC (hoy una) y misiones por facción con textos distintos (la misma misión "El fragmento robado" con versión Alianza y Horda).
5. Items de misión: flag "no se tira/vende/subasta/cae" (hoy lo más parecido es `newbie: 1`, que no sirve) para los **Fragmentos del Sueño**.
6. Texto narrativo: páginas de diálogo al aceptar/entregar, "visiones" (pantalla con texto e imagen; `globalNotice` es el embrión).
7. Elección con consecuencias (Final A/B/C): decisión por personaje guardada en progreso; si es por servidor, votación.
8. Repetibles/diarias (ya diseñado en el editor: `repeatable`).

### C. NPC y diálogos
1. Plantillas nuevas (ver §4) usando cuerpos existentes; gráficos nuevos solo para los jefes emblemáticos (Despertador, criatura del sueño).
2. Sistema de diálogo con opciones y varias páginas; hoy es una burbuja fija.
3. NPC "que saben cosas del jugador" (Dungeon VI/VIII): necesita plantillas con texto dinámico (nombre, clase, kills) → mecánica nueva en `handleProtocol.dialog`.

### D. Mapas
1. Nuevos: Torre del Cielo, Corazón del Sueño (y opcionalmente Reino Invertido). Herramienta: editor visual en `developer/` (`developer/docs/MAP_EDITOR_REDESIGN.md`); también hay que duplicar en `frontend/public/maps_optimized` (ver `exportFrontendOptimizedMaps`).
2. Arreglar el acceso a EGIPTO 182 (sin salidas de entrada hoy) o hacer que el portal del dungeon lo reemplace.
3. Mapas instanciados con **variantes** (Bosque que Camina).
4. Mundo continuo: los dungeons instanciados deben quedar fuera de la adyacencia (sin exits recíprocos), si no se verían desde afuera.

### E. Facciones
1. Misiones con versión por facción (B.4) y contradicción narrativa ("la Horda robó el fragmento" vs "la Alianza robó el fragmento").
2. Sub-facciones (tradicionalista/expansionista, conservadora/radical): solo narrativa en Capítulos I-V; como sistema, para temporadas futuras.
3. Nix neutral ya es real (zona segura, sin facción).

---

## 4. Lo que podemos hacer YA con lo que hay (Capítulo I completo, cero código)

### 4.1 Truco para encadenar misiones sin código
`requiredObjs` + `rewardObjs`: la misión A entrega un item único ("Carta sellada del Consejo") y la misión B lo exige. Nadie puede hacer B sin A. Limitaciones: el item ocupa un slot y es tirable/vendible (hasta tener el flag de item de misión); conviene ponerle `valor: 0` y `noSeCae: 1`.

### 4.2 NPC nuevos propuestos para el Capítulo I (índices 780+)

| Índice | Nombre | Dónde | Rol | Cuerpo sugerido |
|---|---|---|---|---|
| 780 | Erion, el Vigía | Newbie Dungeon 37 (al lado del inicio) | El "primer NPC irrelevante": da la primera misión trivial; al final de la historia resulta Guardián del Soñador | `idBody` de viajero (ej. 47 como los NPC "Quest") |
| 781 | Maese Orlan, posadero de Ulla | Ullathorpe 1 | "Los animales desaparecen": matar lobos/serpientes alteradas | Tabernero (33) |
| 782 | Cazadora Ysolde | Ullathorpe 1 | "Voces en los caminos": matar criaturas en 53/54 y traer "Garra Soñadora" (drop nuevo) | cuerpo de cazadora existente |
| 783 | Thamar, el que vio la estrella | Camino 53 | Pista: "una estrella cayó al sur". Entrega "Esquirla Opaca" (item nuevo) | aldeano |
| 784 | Consejera Veyra | Nix 34 | Consejo de Nix: compra la Esquirla, te manda a Bander/Horda según facción. Guarda el secreto | noble (npcType 5 o cuerpo de noble) |
| 785 | Comandante Rodrik | Banderbill 58-60 | "El llamado del Adalid" (Alianza). Requiere Carta del Consejo | guardia/caballero |
| 786 | Vhael, Voz del Caos | ciudad caos 170 | "El llamado del Adalid" (Horda). Mismo esquema, texto contrario | cuerpo de guerrero oscuro |
| 787 | Archivista Nemo | Nix 34 | Lore: inscripciones de los fragmentos; recibe los Fragmentos del Sueño | sacerdote |
| 788 | Estatua del Primer Sueño | Dungeon I | NPC no atacable, `desc`: "El primer sueño nunca murió." | estatua existente (si hay grh) o cuerpo quieto |
| 789 | Eco de las Ruinas (jefe Dungeon I) | Dungeon I | Jefe con hechizos (`spells`), drop "Fragmento del Sueño I" | cuerpo de jefe existente (p. ej. golem/espectro) |
| 790-793 | Reserva: adds del Dungeon I | Dungeon I | Oleadas | — |

Items nuevos (índices libres en `objs.json` desde 1720): Esquirla Opaca, Carta sellada del Consejo, Garra Soñadora, Fragmento del Sueño I-VIII, Llave de las Ruinas.

### 4.3 Misiones del Capítulo I expresables hoy

| # | Nombre | NPC | Objetivo (modelo actual) | Qué queda afuera |
|---|---|---|---|---|
| 32 | Un sueño repetido | Erion (37) | Matar 3 ratas/arañas del newbie | El texto "soñaste una isla" solo cabe en `desc` |
| 33 | Los animales de Ulla | Orlan (1) | Matar 5 Lobos (501) + 5 Serpientes (504) | — |
| 34 | Voces en el camino | Ysolde (1) | Traer 3 Garra Soñadora (drop de un NPC nuevo hostil en 53/54) | Hace falta la plantilla hostil con el drop |
| 35 | La estrella caída | Thamar (53) | Traer 1 Esquirla Opaca (drop de un jefe menor en 54) | "Ir a un lugar" no existe: se reemplaza por matar algo ahí |
| 36 | El Consejo escucha | Veyra (34) | Entregar Esquirla Opaca → recibís Carta sellada del Consejo | La misma misión para ambas facciones (sin texto por facción) |
| 37 | El llamado del Adalid (Alianza) | Rodrik (58) | Entregar Carta → recompensa + "Salvoconducto de Bander" | No podemos impedir que un Horda la haga (sin filtro de facción). Mitigación: ubicar al NPC detrás del portal 60@79,24 (solo Armada) |
| 38 | El llamado del Adalid (Horda) | Vhael (170) | Igual | Ídem, detrás del portal 151@18,65 (solo Caos) |
| 39 | Las Ruinas del Eco | Nemo (34) | Matar 1 Eco de las Ruinas (789) y traer Fragmento del Sueño I | Sin dungeon instanciado: el jefe es un spawn fijo en el mapa 41 con respawn largo (o evento tipo Faraón) |

Mientras no exista el flag de item de misión, los Fragmentos pueden ser `newbie: 0`, `valor: 0`, `noSeCae: 1` y la misión los consume al entregarlos (así no se acumulan).

### 4.4 Faraón como primer dungeon "piloto" sin motor nuevo
- Hoy: Faraón cada 6 h en 182, laberinto 178-181 con trampas, misión 30 "Mucha Sed II" pide matarlo.
- Con lo que hay: arreglar la entrada al 182, poner la Estatua (788) y un NPC narrador en 178, usar `/boss momia spawn` o acortar el intervalo para probar, y encadenar misiones por item como en 4.1.
- Lo que no se puede sin código: instanciar por party, fases del jefe, botín repartido, bloqueo. Por eso conviene que el Faraón sea el caso de prueba del motor (§5, etapa 1).

---

## 5. Plan por etapas (orden recomendado)

| Etapa | Qué | Depende de | Tamaño |
|---|---|---|---|
| 0 | **Capítulo I con datos**: NPC 780-789, items, misiones 32-39, arreglo del acceso a EGIPTO. Todo por JSON + editor `developer/` + reinicio del server | Nada | Chico (datos) |
| 1 | **Motor de dungeon mínimo** sobre `mapInstanceManager` + patrones de Blood Castle/Sala de Invocación: portal con requisitos, instancia por party, jefe con 2 fases, puerta, botín por jugador, bloqueo, salida al morir, kills compartidos en party. Piloto: **Faraón** | Decisiones de §6 | Grande (server + algo de cliente para avisos) |
| 2 | **Misiones v2**: prerrequisitos, "hablar con", "completar dungeon", entrega en otro NPC, varias misiones por NPC, facción, items de misión, repetibles. Migrar el Capítulo I a cadenas reales | Etapa 1 parcial | Mediano/grande (server + Hub del cliente + editor) |
| 3 | **Diálogo narrativo y visiones**: páginas de texto, opciones, pantalla de visión (reutilizar `globalNotice`), NPC que mencionan al jugador | — | Mediano (cliente + protocolo) |
| 4 | **Dungeons I-VI** sobre mapas reutilizados con el motor; Capítulos II-IV con misiones por facción y guerra (ya existe `factionWars`) | 1, 2 | Mediano por dungeon (datos + scripts) |
| 5 | **Mapas nuevos**: Torre del Cielo, Reino Invertido (copia de Nix), Corazón del Sueño; jefe final El Despertador con gráficos nuevos; finales A/B/C | 1, 2, 3 | Grande (arte + mapas + script) |

---

## Estado

- **2026-10-04, Etapa 0 implementada** en la rama `feat-historia-capitulo-1` (solo datos): NPC 780-792, items 1720-1725, misiones 32-39 con sus entregadores, ubicaciones en los mapas 37, 1, 53, 54, 34, 60, 170 y 41, y el acceso al Faraón (fondo del laberinto 181 → cámara 182; el 180, que no tenía salida, ahora devuelve al 21). Probado en local de punta a punta.
- Decisiones tomadas con el usuario: nombres del juego en los textos (Ullathorpe, Banderbill), Capítulo I para niveles 1 a 15.
- Limitaciones conocidas de esta etapa (se resuelven en las etapas 1 y 2): el jefe reaparece enseguida en otro punto del mapa 41 como cualquier NPC; los items de la cadena se pueden tirar o vender (no existe el flag de item de misión); "El llamado del Adalid" de cada bando no filtra por facción (la exclusividad la dan los guardias de cada ciudad); la Carta se consume al entregarla, así que solo se puede completar uno de los dos llamados.

## 6. Decisiones que necesito antes de empezar la etapa 1

1. **Tamaño de party para dungeons**: ¿3-5 como WoW o hasta 10 (el máximo actual)? Afecta cupo, botín y balance.
2. **Faraón**: ¿pasa a ser instanciado por party (deja de ser evento de mundo cada 6 h) o conviven las dos cosas?
3. **Bloqueo**: ¿uno por día por personaje, o libre con cooldown corto?
4. **Botín**: cofre por jugador al matar al jefe (recomendado: evita peleas por el drop del piso) o drop clásico.
5. **Facciones y la historia**: misiones espejo (misma misión, texto distinto) o misiones distintas por facción. Lo primero es mucho más barato.
6. **Finales A/B/C**: ¿decisión por personaje (cada uno ve "su" final) o evento de servidor con votación que cambia el mundo para todos? Lo segundo es espectacular pero mucho más caro (mapas que cambian).
7. **Gráficos nuevos**: ¿hay arte disponible para El Despertador y las criaturas del sueño, o reciclamos cuerpos existentes con otro nombre y color de hechizo?
8. **Nombres in-game**: la historia dice "Bander" y "Ulla"; el juego dice "Banderbill" y "Ullathorpe". Propongo mantener los nombres del juego en los textos.

Con las respuestas a 1-5 puedo arrancar la etapa 0 (datos del Capítulo I) y diseñar la etapa 1 en detalle.
