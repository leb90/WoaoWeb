# Cómo integrar el arte nuevo de una mazmorra

Con el arte de Ezequiel para la Gruta (`Recursos/Mazmorras/1/`) hicieron falta tres vueltas: PR #114 y el de esquinas y puertas. Esta lista junta lo que salió mal, para que la próxima mazmorra entre bien de una. Cada punto dice qué hacer y qué error evita.

## 1. Antes de tocar nada

- **Inventario de la carpeta completa.** Se arma una tabla con cada archivo de `Recursos/Mazmorras/<n>/` y la pieza del juego a la que va.
  - Lo que no se usa (duplicados, versiones viejas) se anota con el motivo.
  - Lo que falta se anota aparte, para pedirlo.
  - *Error que evita:* en la primera vuelta quedaron sin usar las animaciones de ataque, el cofre que se abre, el aplastador y el portal violeta de los atajos.
- **Mirar cada pieza ampliada antes de decidir dónde va.** Hay que fijarse en tres cosas:
  - dónde está el borde claro de roca;
  - de qué lado está la franja transparente: es el lado de la sala;
  - si es la versión de la izquierda o la de la derecha.
  - *Error que evita:* la puerta de "pared izquierda" quedó puesta en una pared que se veía como derecha.
- **Los números libres se buscan en los archivos, no en un documento.** Hay que tomar el máximo de:
  - `graficos.json` (grh);
  - `frontend/public/graphics/` (archivo);
  - `bodies.json` (cuerpo);
  - `objs.json` (objeto);
  - las plantillas de `npcs.json`.

## 2. Paredes

**El formato que entiende el generador** (`graficos.paredes` en `server/mazmorras/<id>/leyenda.json`) es el de Ezequiel. Cada pieza se corta en baldosas de 32 × 32, fila por fila, desde su `grh`.

| Pieza | Medida (baldosas) | Qué es |
|---|---|---|
| `arriba` | 11 × 3 | Cara norte de una sala (la sala está abajo). Fila 0 el borde, fila 2 la que toca el piso |
| `abajo` | 11 × 3 | Pared sur (la sala está arriba). Fila 0 la que toca la sala |
| `izquierda` | 3 × 10 | Pared oeste. La columna 2 toca la sala |
| `derecha` | 3 × 10 | Pared este. La columna 0 toca la sala |
| `no`, `ne`, `so`, `se` | 6 × 6 | Las cuatro esquinas en L, **enteras** |

El piso (`graficos.piso`) es un bloque de 4 × 4.

- **Las L van enteras, con sus dos brazos.** El borde de roca dobla en los brazos, no en el cuadrado de la esquina. El generador sigue cada tramo recto con el brazo de la L hasta tres baldosas antes de la esquina.
  - *Error que evita:* "falta el giro de las esquinas" (antes se usaba solo el cuadrado de 3 × 3).
- **Los muros entre salas tienen tres baldosas de grosor en el plano.** Los más finos se dibujan como un borde bajo y no combinan con piezas de tres de grosor.
  - Para engrosar se come la fila de piso de cada lado, solo en ese tramo.
  - Hay que cuidar las distancias que miden los acertijos. Los tests de `server/src/dungeons.test.ts` lo controlan: por ejemplo, la lava del Gancho tiene que estar a 7 baldosas o menos del poste.
- **Una pared vertical entre dos salas es entera de una sola: la primera a la que se llega** desde la entrada o desde la escalera del mapa anterior. Se ve con su cara hacia esa sala y el borde contra la otra. Su puerta lateral usa la misma versión y abre hacia esa sala. Las dos cosas las hace el generador (`sharedWallSide`).
  - *Error que evita:* el borde quedaba en el medio de la pared y la puerta quedaba al revés.
  - Las paredes horizontales no tienen este problema: "Horizontal Superior" e "Inferior" son el mismo dibujo, con el borde arriba (vista de tres cuartos).
  - En las uniones en T, el borde del muro vertical continúa en la misma columna por encima y por debajo del encuentro.
- **Las puertas metidas en una pared, y el pasillo que la cruza con ellas, cuentan como pared al dibujar.** La pared sigue de largo y el dibujo de la puerta tapa el pasillo.
  - *Error que evita:* alrededor de cada puerta se armaba un marco de caras que cruzaba la pared.
- **Las piezas traen unos 7 px transparentes del lado de la sala.** Se corren hacia la sala para que la pared toque el piso, y el otro lado se completa con el reflejo del borde.
  - Si se estira el borde, quedan rayas; si se completa con negro, quedan costuras entre tramos.
  - Las L se corren de una sola vez, en los dos sentidos, para que la esquina y los brazos sigan encajando entre sí.

## 3. Puertas, cofres y objetos (la piel)

- **Los objetos de mazmorra son los mismos para todas** (cofre 1832, puerta 1834…). Los dibujos propios se cargan como "piel" en `piel` de la leyenda:
  - el server sigue usando los de siempre y traduce al mandar (`dungeons.skinObject`);
  - los mapas del cliente salen ya traducidos.
- **`dungeons.ts` termina con un `module.exports` armado a mano.** Una función exportada nueva hay que sumarla ahí.
  - *Error que evita:* `require("./dungeons").x` daba undefined y rompía el `renderItem` de todo el juego.
- **Al entrar a un mapa, los objetos llegan en `areaItemsSnapshot`, no en `renderItem`.** La traducción de la piel tiene que estar en los dos.
- **Las puertas laterales van giradas 90° a propósito,** para encajar con las paredes: miden 3 de ancho y 2 de alto.
  - Su índice lleva un desplazamiento vertical de 16 px para centrar la abertura en la baldosa de paso; el renderizador respeta el `offset` del gráfico.
  - Abiertas también se ven (`puertaAbierta`), no desaparecen.
  - Cada una tiene versión izquierda y derecha (ver el punto de la pared entre dos salas).
- **Las animaciones de una sola vez** (el cofre que se abre, el aplastador) llevan `unaVez` en el gráfico, que es `"u":1` en el índice compacto. Si no, se repiten en bucle.

## 4. Criaturas y jefes

- **Las hojas hechas con ChatGPT no tienen grilla pareja,** y algunas dejan márgenes vacíos. El recorte se hace en dos pasos:
  1. se corta cada hoja a lo dibujado;
  2. se divide por las líneas con menos dibujo.

  Después se revisa cuadro por cuadro.
- **El orden de las filas en el juego es arriba, abajo, derecha, izquierda.** Hay que comprobarlo en cada hoja.
  - En algunas la cuarta fila repite la izquierda: la derecha es la izquierda espejada.
- **Escala y apoyo.** Un humano mide 1,5 baldosas. Los pies van abajo al centro del cuadro, sin contar el polvo ni los efectos.
- **El ataque es un cuerpo aparte.** En `bodies.json`, el cuerpo de caminar lleva `"ataque": <cuerpo de la animación>`.
  - El server manda `characterSwing` con la marca 4 en cada golpe de criatura.
  - El cliente cambia al cuerpo de ataque mientras dura la animación (`engine/creatureAttack.ts`).
- **El server toma las plantillas de la base de la API** (`game_npcs` y `game_objects`), no de los JSON:
  - los números nuevos se siembran solos;
  - cambiar el `idBody` u otro dato de una plantilla que ya existe necesita una migración en `api/src/dataMigrations.ts`. En desarrollo se corre a mano: `npx tsx src/migrate.ts` en `api/`.

## 5. Para cerrar

1. **Regenerar los mapas:** `pnpm --dir server exec tsx src/scripts/buildDungeonMaps.ts <id>`.
2. **Reiniciar el server de juego.** Si no, su `areaItemsSnapshot` con los mapas viejos pisa lo que dibuja el cliente.
3. **Subir las versiones de caché en `frontend/utils/gameLoader.ts`:**
   - `graficos_optimized`, `bodies`, `objs` y `npcs`;
   - si cambió un PNG que ya existía, su versión en `getTexturePath`.
4. **Recorrer el mapa entero, esquina por esquina,** con el GM (`/telepme <corrida>@x@y`) o con un render del mapa. Hay que mirar cada esquina, cada cruce de paredes, cada pared entre dos salas y cada puerta, y compararlos con la pieza original del artista.
5. **Probar en vivo entrando por la piedra.** Eso crea la corrida, que es una instancia (por ejemplo, 59500).
   - El GM entra invisible y las criaturas no lo atacan: `/invi` para ver los ataques.
   - Hay que sacar capturas de cada parte.
6. **Anotar los créditos y la lista de lo que falta** en `docs/CREDITOS_GRAFICOS.md`.
