# HUNTERS GAME

Documento de migracion para el evento automatico Hunters Game.

## Lectura del sistema actual

- El servidor ya tiene eventos automaticos y semiautomaticos: `factionWars`, `tournamentAuto`, `bloodCastle` y el viejo `hungerGames`.
- El viejo `hungerGames` usa una arena fija, inventario normal y una logica simple de participantes. No sirve como base final porque mezcla items reales con items del evento.
- `factionWars` es la mejor referencia para estado en vivo, comandos, muerte y envio de HUD por protocolo.
- El frontend centraliza eventos en `frontend/components/WoaoHubModal.tsx` y los overlays de combate en `frontend/components/InventoryFloatingPanel.tsx`.

## Mapas

Se usan los mapas 260, 261, 262 y 263 como arena del evento. Ya existen en el proyecto y el usuario confirmo que no se usan en el juego normal.

- 260: Conquista.
- 261: Aldea Vampiros.
- 262: Aldea Vampiros.
- 263: Quest.

Tienen datos heredados, salidas, NPCs, objetos y triggers. Por eso la implementacion debe tratarlos como arena cerrada: durante Hunters se bloquean salidas a mapas externos y mas adelante conviene limpiarlos/disenarlos desde el editor.

La arena logica queda compuesta por:

- 260: cuadrante superior izquierdo.
- 261: cuadrante superior derecho.
- 262: cuadrante inferior izquierdo.
- 263: cuadrante inferior derecho.

## Arquitectura deseada

Estados:

- `CLOSED`
- `REGISTRATION`
- `PREPARING`
- `ACTIVE`
- `FINISHING`
- `REWARDING`
- `CLEANUP`
- `COMPLETED`
- `ABORTED`

El jugador nunca debe usar inventario real dentro del evento. Al entrar:

- se desmonta,
- se desactiva mascota/montura,
- se guarda su posicion de retorno,
- se lo marca como participante,
- se prepara un inventario/equipamiento aislado de evento.

Tipos separados:

- `HunterEventInventory`
- `HunterEventEquipment`
- `HunterEventItemInstance`
- `HunterChest`
- `HunterZoneState`

Los items del evento deben destruirse en cleanup. No se pueden tradear, guardar en banco, publicar en subasta, enviar por correo ni sacar del evento.

## Reglas actuales

- Minimo para iniciar: 4 jugadores.
- Maximo por partida: 20 jugadores. Si la cola llega a 20, nuevas inscripciones se rechazan como evento completo.
- Los jugadores se distribuyen balanceados entre mapas 260, 261, 262 y 263. La diferencia maxima buscada es 1 jugador entre mapas.
- Fase segura inicial: 120 segundos exactos desde el inicio de la partida. Durante esta fase se puede mover, abrir cofres, equipar y usar items Hunters, pero no se puede danar a otros jugadores.
- No hay circulo, cierre de zona ni dano ambiental por reduccion de area.
- Al terminar la fase segura se habilita PvP total entre participantes en los 4 mapas, sin restricciones por faccion, clan, party o seguro.
- Los participantes ven a otros participantes como `Jugador`, sin clan ni indicadores sociales. El servidor conserva las identidades reales para rewards y logs.
- El chat saliente queda bloqueado durante la partida con el mensaje `No puedes hablar durante Hunters Game.`

## Cofres

Cada partida genera cofres nuevos con posiciones aleatorias validas. La apertura es atomica servidor-side para evitar doble loot.

- Cantidad: `ceil(jugadores * 1.5)`, minimo 4, maximo 30.
- Distribucion: balanceada entre mapas, con diferencia maxima buscada de 1 cofre entre mapas.
- Validacion de posicion: tile caminable, sin bloqueo, sin `tileExit`, sin NPC, sin jugador y sin otro cofre cercano.
- Apertura: click sobre el `Cofre Hunters` en el mapa o `/hunters cofre` como comando de prueba.
- Loot garantizado por cofre: 1 equipo + 10 a 20 pociones Hunters + 10 a 20 `Flecha Hunters`.

Objetos reservados:

- 1720: `Cofre Hunters`
- 1721: `Pocion Roja Hunters`
- 1722: `Pocion Azul Hunters`
- 1723: `Flecha Hunters`

## Muerte y HUD

No hay respawn. Cuando un jugador muere:

- se elimina de la partida,
- se envia a ciudad,
- se actualiza `Vivos`,
- se agrega un feed `Killer mato a Victima`,
- si queda un solo jugador vivo, se cierra la partida.

HUD minimo:

- HUNTERS GAME
- Fase segura / combate activo
- Countdown servidor de fase segura o fin de partida
- Vivos X/Y
- Kills del jugador
- Feed compacto de kills recientes.

Recompensas:

- Cada kill valida durante PvP entrega puntos de canje y oro una sola vez.
- El ganador recibe recompensa escalada por `initialParticipantCount`, no por vivos al final.
- Si no llega al minimo de jugadores, se cancela sin recompensas y se restaura a los anotados.

## Agenda

Horarios de Argentina:

- 10:00
- 22:00

La inscripcion abre 10 minutos antes. El modulo servidor debe calcularlo por timezone y no depender del timezone del host.

## Fases de implementacion

1. Base servidor: estado, registro, scheduler, comandos admin, HUD, muerte y kill feed.
2. Mapas 260-263: limpieza/diseno desde editor, sin decorar manualmente en codigo.
3. Inventario/equipamiento aislado y bloqueo de inventario real.
4. Cofres atomicos con loot por partida.
5. Fase segura inicial sin PvP.
6. Recompensas, recovery tras reinicio y panel dinamico de eventos.

## Comandos de prueba

- `/hunters`: anotarse si la inscripcion esta abierta.
- `/hunters start`: abre inscripcion manual durante 30 segundos (admin).
- `/hunters stop`: cancela la partida/inscripcion (admin).
- `/hunters status`: muestra fase, jugadores, vivos y mapas (admin).
- `/hunters players`: lista participantes (admin).
- `/hunters chests`: muestra cofres totales/cerrados (admin).
- `/hunters cofre`: abre un cofre cerrado cercano durante la partida.
