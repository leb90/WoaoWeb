# Arena: todos contra todos

La Arena (`/arenas`) es un modo PvP aparte del mundo abierto, al estilo de argentumonline.io:
- se entra al toque eligiendo una clase, sin crear personaje;
- el personaje se llama como la cuenta y está en nivel 50, con el mejor equipo de su clase;
- todos pelean contra todos en un mapa de torneo;
- en vez de subir de nivel se sube en el ranking de la partida, y el Top 3 se ve en pantalla.

Reemplazó a las salas de arena (con contraseña, link y plantillas viejas), que se borraron.

## Cómo funciona

- **Mapa:** una instancia del torneo 115 (`30000 + 115 × 50 = 35750`). Tiene unas 76 × 44 baldosas abiertas, sin criaturas ni salidas. Se aparece en un lugar al azar del área de pelea, lo más lejos posible de los demás.
- **Personaje:** `login.connectCharacterPvP` con `{ arena: true }` arma el personaje de la clase con `buildArenaTemplate`:
  - skills de combate y meditar en 200;
  - el bono del set sumado a la vida y al maná.
- **Reglas de .io:**
  - las pociones y las flechas no se gastan;
  - no se pueden tirar items y no se pierde nada al morir;
  - no hay zona segura, experiencia, oro, puntos de facción, hambre ni sed.
- **Hechizos:** como en argentumonline.io, van en los últimos casilleros de la lista (del 50 para arriba). El que tiene hechizos entra con la pestaña abierta y la lista ya al final.
  - De abajo para arriba van: Remover Parálisis (el último de todos), Paralizar, el hechizo más poderoso, el que le sigue y la curación más poderosa. Van los que la clase tenga.
  - El resto va arriba de esos cinco.
  - `server/src/arenaClasses.test.ts` controla el orden con el daño y la curación de `spells.json`.
- **Mobile:** los accesos rápidos vienen puestos con lo de la clase (`accesos` en `arenaClasses.ts`, mandado en `arenaState`). No se guardan.
  - El arco de hechizos lleva Remover Parálisis, Paralizar, el más poderoso y la mejor curación (o el segundo de daño si la clase no cura).
  - Los dos items llevan Poción Roja y Azul. El arquero y el cazador llevan el arco, que es con lo que disparan; el guerrero, la Poción de Fuerza.
  - Las cantidades de pociones y flechas se muestran como ∞. El Top 3 va arriba al centro, fijo a la pantalla.
  - Mochila, lista de hechizos y editar van en fila encima del arco: en columna pisaban los botones de arriba en pantallas de unos 340 de alto (Safari con sus barras).
  - El chat queda casi transparente (30 %) y deja tocar lo que hay debajo; se ve entero solo con el chat abierto para escribir. Es igual en el mundo abierto.
- **Panel:** Transfigurar, Tienda, Party, Clanes, Misiones, Montura, Premios, Ranked, Viajes, WoAO, los castillos y la montura quedan deshabilitados (`arenaMode` en `InventoryFloatingPanel`).
- **Salir:** es instantáneo, aunque estés paralizado. En el mundo abierto se sale al instante en zona segura o muerto; en el resto hay que esperar 10 segundos.
- **Muerte:** no se pasa al mundo de los muertos. A los 5 segundos se revive solo, con vida y maná llenos, en otro lugar del mapa. El cliente muestra quién te mató y la cuenta regresiva.
- **Puntaje** (`server/src/arenaScore.ts`):
  - cada muerte te saca la mitad de tus puntos;
  - quien te mata se los lleva, más 10 de base;
  - matar dos veces a la misma persona en menos de un minuto no suma ni le saca nada.
  - Desempata quién llegó primero a ese puntaje.
- **Top 3:** el server manda el paquete `arenaState` (105) a cada jugador de la arena cuando algo cambia. El cliente lo dibuja arriba a la derecha (`components/game/ArenaScoreboard.tsx`) como una lista chica de texto, sin caja: puesto, nombre y puntos, y tu puesto abajo si no estás en el Top 3.
- **Ranking por cuenta:** el server manda a la API, cada 5 segundos si hubo cambios:
  - quién está jugando;
  - lo que hizo cada cuenta (`POST /internal/arenas/estado`).

  La tabla `arena_stats` acumula kills y muertes, y guarda el mejor puntaje y la mejor racha de una partida. `/arenas` lo muestra como Salón de la fama (`GET /arenas`).

## Entrenamiento contra el bot

En `/arenas`, además de entrar al todos contra todos, se puede entrenar uno contra uno con un bot. Se elige la clase propia y la del bot. Pedido de Leandro: que el bot sea "muy bueno y no algo hecho así nomás", que suba de dificultad cada vez que le ganás y que los mejores puntajes queden en una lista.

- **Dónde:** cada entrenamiento es una copia privada del mapa de la arena (`30000 + 115 × 50 + 1` a `+ 49`; la `+ 0` es el todos contra todos). El jugador y el bot tienen las mismas reglas de la arena (`arenaFfa`) y además `arenaEntrenamiento`. `arena.ts` le pasa sus conexiones, muertes y desconexiones a `server/src/arenaTraining.ts`.
- **Rondas:** los dos aparecen a 7 baldosas, con la vida y el maná llenos. Hay una cuenta regresiva de 3 segundos en la que nadie se mueve ni pega: es el mismo bloqueo que las rondas de ranked (`rankedLockedUntil`), con el aviso "[Entrenamiento]".
  - Si le ganás, sumás puntos, el bot sube un nivel y a los 2,5 segundos arranca la ronda siguiente.
  - Si te gana, la racha se anota en el ranking y a los 5 segundos volvés a empezar del nivel 1.
- **Puntaje** (`arenaTrainingRules.puntosPorVictoria`): ganarle al nivel N da 100 × N, más hasta la mitad de eso según la vida que te quedó.
- **El bot** (`server/src/arenaBot.ts`) es un personaje de arena de verdad, con el equipo y los hechizos de su clase. Juega mandando los mismos paquetes que el cliente (caminar, girar, golpear, disparar, hechizos y pociones), así que el server le aplica las mismas reglas que a cualquiera: intervalos, maná, parálisis y visión.
  - Según su clase pelea de cerca (guerrero, paladín, asesino, pirata), a distancia (arquero, cazador) o con hechizos (mago, clérigo, bardo, druida, chamán).
  - Sabe sacarse la parálisis con Remover, tomar rojas y azules intercaladas, paralizar para que no lo alcancen o para alcanzar, mantener la distancia de tiro, curarse con hechizos, ponerse Fuerza y Celeridad y elegir el hechizo que remata.
  - No ve a los invisibles y con ceguera no apunta.
- **Dificultad** (`arenaTrainingRules.botProfile`):
  - Del nivel 1 al 10 aprende a jugar:
    - la reacción baja de 1,1 s a 0,15 s;
    - la demora para usar cada intervalo baja de 0,7 s a 0,03 s;
    - toma pociones antes y más seguido;
    - comete menos errores;
    - suma tácticas: paraliza desde el 2, mantiene la distancia desde el 3, se pone buffs desde el 4, combina desde el 5, elige el mejor hechizo desde el 6, vuelve a paralizar apenas lo sacás desde el 7 y se cura antes de estar bajo desde el 8.
  - Se mueve al pelear para que cueste apuntarle (pedido de Leandro: "a medida que más veces lo derrotás, se mueve con patrones más erráticos"):
    - `esquiva`: cuánto se mueve en vez de quedarse quieto. Es 0 en el nivel 1, 0,15 en el 2 y llega a 0,85 en el 10.
    - `erratico`: qué tan impredecible es. Con poco va y viene de costado, fácil de leer; con mucho cambia de dirección al azar, encadena pasos y amaga. Arranca en el nivel 3 y llega a 0,7 en el 10.
    - Los lanzadores y los de distancia esquivan de costado sin salirse de su distancia de tiro ni de la visión.
    - Los de cuerpo a cuerpo zigzaguean al acercarse.
    - Desde el nivel 4 (`rodea`), los de cuerpo a cuerpo, después de pegar, se pasan a otro lado del rival para que tenga que girar. El asesino va a la espalda, donde apuñala más fuerte.
    - En duelos: 0 pasos por segundo en el nivel 1, unos 0,7 en el 5 y 1,7 en el 10.
  - Desde el 11 juega igual y suma 8 % de vida y 4 % de daño por nivel, hasta +150 % y +80 %. La esquiva y lo errático siguen subiendo hasta 1. El daño de más lo lee `game.ts` (`arenaBotDanoPct`), solo contra jugadores.
  - En los duelos de prueba, el bot con 2 niveles más le gana al otro entre el 80 % y el 100 % de las veces, con magos y con guerreros.
- **HUD:** el paquete `arenaState` trae `entrenamiento` (nivel, puntaje, récord, clase del bot, estado y cuenta regresiva). `ArenaScoreboard.tsx` lo muestra:
  - como texto chico arriba a la derecha, o arriba al centro en mobile;
  - con carteles en el centro para la cuenta regresiva, la ronda ganada y la derrota.
- **Ranking:** al terminar una racha (o al salir), el server la manda a `POST /internal/arenas/entrenamiento`.
  - La tabla `arena_training_records` guarda la mejor de cada cuenta: puntaje, niveles ganados y clases.
  - `/arenas` la muestra en "Mejores contra el bot".
  - El ticket de la arena lleva la clase del bot (`game_tickets.arena_bot_class_id`) y, al consumirlo, el récord de la cuenta.
- **Probar un nivel:** fuera de producción, `GET /debug/arena-bots/nivel?nivel=8&nombre=<cuenta>` en el server de juego pasa el entrenamiento de esa cuenta al nivel pedido y arranca la ronda.
- **Duelos de prueba:** fuera de producción, `GET /debug/arena-bots/duelo?a=1&na=10&b=3&nb=8&n=5&ms=60000` en el server de juego hace pelear a dos bots. Los parámetros son la clase y el nivel de cada uno, cuántos duelos en paralelo y el tiempo máximo. Devuelve quién ganó, cuánto duró, la vida que les quedó y qué hizo cada uno.

## Clases

Cada clase va con la raza que mejor le rinde según `docs/balance/RAZAS.md`. La excepción son mago y clérigo: van con Humano, porque Gnomo y Goblin son razas bajas y no pueden ponerse las túnicas, armaduras ni escudos de tier.

| Clase | Raza | Equipo |
|---|---|---|
| Mago | Humano | Set Arcano y Anillo de Energía |
| Clérigo | Humano | Set Templario |
| Guerrero | Licántropo | Set del Verdugo |
| Asesino | Humano | Set del Umbral |
| Bardo | Elfo | Set Bardo |
| Druida | Elfo | Set Silvestre y Anillo de Energía |
| Paladín | Humano | Set Paladín |
| Cazador | Orco | Arco, casco y escudo del Caído (legendarios), Placas Doradas y Flecha Del Diablo |
| Pirata | Elfo Oscuro | Espada, casco y escudo del Caído (legendarios) y Placas Azules |
| Arquero | Orco | Set Silvano y Flecha De Los Dioses |
| Chamán | Elfo | Set Elemental y Anillo de Energía |

Los datos están en dos lugares que hay que cambiar juntos:
- `server/src/arenaClasses.ts`: equipo, hechizos, raza y cabezas.
- `frontend/lib/arenas.ts`: textos y apariencia de la página.

`server/src/arenaClasses.test.ts` comprueba que cada clase pueda ponerse su equipo y aprender sus hechizos.

## Cómo probar en local

1. Aplicar el esquema: `npx tsx src/migrate.ts` en `api/`.
2. Abrir dos navegadores con cuentas distintas.
3. Entrar a `/arenas`, elegir clase y "Entrar a la arena".

Los tests:
- `npx tsx --test src/arenaClasses.test.ts src/arenaScore.test.ts src/arenaTrainingRules.test.ts` en `server/`;
- `npx vitest run src/tests/arenas.integration.test.ts` en `api/`, con la API levantada.
