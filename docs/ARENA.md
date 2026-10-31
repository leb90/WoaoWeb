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
- **Panel:** Transfigurar, Tienda, Party, Clanes, Misiones, Montura, Premios, Ranked, Viajes, WoAO, los castillos y la montura quedan deshabilitados (`arenaMode` en `InventoryFloatingPanel`).
- **Salir:** es instantáneo, aunque estés paralizado. En el mundo abierto se sale al instante en zona segura o muerto; en el resto hay que esperar 10 segundos.
- **Muerte:** no se pasa al mundo de los muertos. A los 5 segundos se revive solo, con vida y maná llenos, en otro lugar del mapa. El cliente muestra quién te mató y la cuenta regresiva.
- **Puntaje** (`server/src/arenaScore.ts`):
  - cada muerte te saca la mitad de tus puntos;
  - quien te mata se los lleva, más 10 de base;
  - matar dos veces a la misma persona en menos de un minuto no suma ni le saca nada.
  - Desempata quién llegó primero a ese puntaje.
- **Top 3:** el server manda el paquete `arenaState` (105) a cada jugador de la arena cuando algo cambia. El cliente lo dibuja arriba a la derecha (`components/game/ArenaScoreboard.tsx`).
- **Ranking por cuenta:** el server manda a la API, cada 5 segundos si hubo cambios:
  - quién está jugando;
  - lo que hizo cada cuenta (`POST /internal/arenas/estado`).

  La tabla `arena_stats` acumula kills y muertes, y guarda el mejor puntaje y la mejor racha de una partida. `/arenas` lo muestra como Salón de la fama (`GET /arenas`).

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
- `npx tsx --test src/arenaClasses.test.ts src/arenaScore.test.ts` en `server/`;
- `npx vitest run src/tests/arenas.integration.test.ts` en `api/`, con la API levantada.
