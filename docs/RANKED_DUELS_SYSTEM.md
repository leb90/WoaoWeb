# Sistema Ranked de Duelos

Este documento describe la arquitectura actual encontrada en WoaoWeb y la propuesta para migrar el Ranked a un sistema server authoritative, persistente y separado por modo. La fuente de verdad para rangos, ELO, divisiones y calculos es el prompt de Ranked, no los numeros visibles en la imagen de referencia.

## Arquitectura Existente

El proyecto esta dividido en tres areas principales:

- `server/`: game server WebSocket y logica authoritative de juego.
- `api/`: API Express y esquema PostgreSQL.
- `frontend/`: cliente Next.js/Pixi y UI del juego.

El server mantiene el estado runtime en `server/src/vars.ts` y las acciones de juego se concentran principalmente en `server/src/game.ts`, `server/src/commands.ts`, `server/src/handleProtocol.ts` y modulos auxiliares. El cliente renderiza y envia comandos; no debe decidir resultados competitivos.

## Flujo PvP Actual

El combate entre jugadores pasa por `server/src/game.ts`. Hay controles para PvP normal, arenas PvP (`pvpChar`/`arenaRoomId`) y retos (`challengeMatchId`/`challengeTeam`). El helper `isArenaCombat` permite combate dentro de arenas y retos, y `challengeManager.getCombatRelation` evita atacar aliados.

Para Ranked no conviene crear otra via paralela de danio. Debe integrarse en el mismo criterio authoritative de combate, agregando una relacion de equipo/match similar a Retos para permitir enemigos y bloquear aliados.

## Muerte

La muerte de usuario se procesa en `server/src/game.ts`. Actualmente notifica a varios sistemas:

- `bloodCastle.onUserDied`
- `hungerGames.onUserDied`
- `tournamentAuto.onUserDied`
- `rankedArena.onUserDied`
- `factionWars.onUserDied`

El `rankedArena` actual es un prototipo 1v1 y no debe ser la base final sin cambios. El nuevo Ranked debe interceptar la muerte de participantes en match para cerrar rondas BO3 sin aplicar ELO por ronda. En 2v2 la ronda termina cuando mueren ambos miembros de un equipo.

## Safe Zones y Ciudades

`server/src/safeZone.ts` expone `isSafeZonePosition(mapId, pos)`. El juego considera segura una posicion si el metadata del mapa indica `pk === 1` o si el tile tiene trigger `6`. Este servicio debe ser la primera fuente para validar si un jugador puede entrar a cola.

Si mas adelante se quiere limitar Ranked solo a algunas ciudades, la extension debe estar centralizada como `rankedQueueAllowedMaps`, no dispersa ni hardcodeada en el matchmaking.

## Mapas y Arenas

El prototipo `server/src/rankedArena.ts` usa mapas 211 a 215 con spawns fijos. El sistema de Retos (`server/src/challengeManager.ts`) ya tiene una solucion mas robusta con:

- mapa base de arena (`CHALLENGE_BASE_MAP_ID`)
- instancias dinamicas desde `CHALLENGE_INSTANCE_MAP_START`
- posiciones por equipo
- snapshot/restauracion de equipo
- retorno al punto original

Ranked debe reutilizar ese patron de reservas e instancias o extraerlo a un servicio comun. La reserva de arena debe tener estados `FREE`, `RESERVED`, `IN_MATCH` y `RESETTING`, evitando que dos matches compartan mapa.

## Party y 2v2

El sistema de party existe en `server/src/game.ts` y `server/src/commands.ts`. Los retos ya validan equipos de 2 usando la party actual y su lider. Para Ranked 2v2 se debe reutilizar esa infraestructura:

- party exactamente de 2 jugadores
- ambos online
- ambos vivos
- ambos en safe zone/ciudad
- ninguno en cola, match, evento o transferencia
- el lider solicita la cola

El ELO de equipo para matchmaking es el promedio del ELO de ambos miembros en modo `RANKED_2V2`. El cambio de ELO se calcula una vez contra el promedio rival y se aplica a cada integrante del equipo.

## Monturas y Mascotas

Las monturas se gestionan en `server/src/mounts.ts` y se activan/desactivan desde `game.useMount`/`game.forceDismount`. Al entrar a Ranked el server debe desmontar automaticamente, sin borrar ni liberar la mascota/montura. Mientras dure la serie, el server debe rechazar montar o invocar mascotas si aplica.

## Persistencia

La persistencia principal usa PostgreSQL en `api/schema.sql`. El prototipo viejo de Ranked usa `server/src/woaoProgress.ts` y el campo `elo` legacy; eso no cumple el prompt porque:

- mezcla modos
- arranca en 300
- no tiene historial ni ranking persistente por modo
- no tiene divisiones ni calculo ELO matematico

El Ranked nuevo debe guardar ratings por personaje y modo en PostgreSQL:

- `ranked_ratings`
- `ranked_matches`
- `ranked_match_participants`

El rango no se guarda duplicado; se deriva del ELO con `getRankFromElo`.

## Protocolo Cliente-Servidor

El server envia paquetes desde `server/src/handleProtocol.ts`. Ya existen paquetes JSON para estados complejos como quests, monturas, castillos y retos. El frontend consume esos estados en `frontend/lib/aowProtocol.ts` y los muestra en `frontend/components/InventoryFloatingPanel.tsx` y `frontend/components/WoaoHubModal.tsx`.

Ranked debe seguir el mismo estilo:

- el cliente solicita entrar/salir de cola
- el server devuelve perfil, estado de cola, match encontrado, estado de ronda, resultado y ranking
- el frontend solo renderiza estado y botones

La pestaña `Ranked` ya existe en el Panel WOAO, pero hoy muestra un boton simple que ejecuta `/ranked` contra el prototipo.

## Ranked Actual

`server/src/rankedArena.ts` es un prototipo minimo:

- solo 1v1
- cola en memoria con `Set`
- primer jugador contra segundo jugador
- mapas 211-215 hardcodeados
- `rankName` hardcodeado con pocos rangos
- usa `woaoProgress.elo`
- ELO aleatorio `10 + random(0..30)`
- mensaje dice Bo2 aunque opera como primero a 2 rondas

Debe ser reemplazado progresivamente por servicios separados.

## Arquitectura Propuesta

Crear modulos bajo `server/src/ranked/`:

- `rankedConfig.ts`: modos, rangos, divisiones, K factor, ELO inicial, ventanas de matchmaking, arenas y tiempos.
- `rankedRankService.ts`: `getRankFromElo`, progresos de division y labels.
- `rankedEloService.ts`: expected score, delta por victoria/derrota, promedio de equipo.
- `rankedEligibilityService.ts`: validacion server authoritative para entrar a cola y permanecer en ella.
- `rankedRepository.ts`: lectura/escritura PostgreSQL de ratings, matches, participantes y leaderboard.
- `rankedQueueService.ts`: alta/baja de cola y estado `NONE`, `QUEUED`, `MATCH_FOUND`, `IN_MATCH`.
- `rankedMatchmakingService.ts`: seleccion por menor diferencia de ELO y expansion por tiempo.
- `rankedArenaService.ts`: reserva/liberacion de arenas.
- `rankedMatchService.ts`: state machine BO3 y retorno de jugadores.
- `rankedLeaderboardService.ts`: ranking paginado por modo.

La state machine de match debe usar estados claros:

- `CREATED`
- `RESERVING_ARENA`
- `PREPARING`
- `ROUND_COUNTDOWN`
- `ROUND_ACTIVE`
- `ROUND_END`
- `MATCH_END`
- `RETURNING_PLAYERS`
- `COMPLETED`
- `ABORTED`

## Fases de Implementacion

1. Documentacion, modelo DB, RankService, EloService y Eligibility.
2. Cola 1v1, matchmaking, expansion ELO, arena pool y BO3 1v1.
3. Persistencia de resultado, ranking, consola, reconexion y cancelaciones.
4. Ranked 2v2 con party, promedio de equipo y muerte por equipo.
5. UI del Panel WOAO para matchmaking y ranking global.
6. Tests integrales, race conditions, recuperacion al restart, anti abuse y polish.
