# Arte de las mazmorras: inventario para rehacerlo de cero

Hoy las mazmorras mezclan gráficos de Argentum Online, paquetes libres de otros estilos (LPC, Kenney, 0x72) y cosas que el cliente dibuja con formas (la Anguila, el Campo de Protección, los rayos). Estos documentos listan **todo** lo que se ve en cada mazmorra (baldosas, puertas, botones, cofres, criaturas, jefes y efectos) con el gráfico actual de ejemplo, qué hace y qué hay que entregar para rehacerlo de forma profesional y coherente. Cada uno termina con el prompt completo para que Claude Opus 5.5 lo haga.

## Los documentos

| # | Documento | Ítem | Estado | Baldosas | Puertas y mecánicas | Criaturas | Jefes | Efectos | Piezas propias |
|---|---|---|---|---|---|---|---|---|---|
| — | [Lo común a todas](00-COMUNES.md) | — | — | — | 24 | — | — | 10 | **51** (con los íconos) |
| 1 | [Gruta del Abisal](01-GRUTA_DEL_ABISAL.md) | Patas de rana | banco de pruebas | 4 | 11 | 5 | 2 | 2 | **17** |
| 2 | [Cueva de la Cola](02-CUEVA_DE_LA_COLA.md) | Pluma de Roc | hecha | 3 | 10 | 11 | 2 | 1 | **21** |
| 3 | [Gruta de la Botella](03-GRUTA_DE_LA_BOTELLA.md) | Brazalete de Fuerza | hecha | 3 | 15 | 12 | 2 | 5 | **26** |
| 4 | [Caverna de las Llaves](04-CAVERNA_DE_LAS_LLAVES.md) | Botas de Pegaso | hecha | 4 | 14 | 6 | 2 | 3 | **20** |
| 5 | [Fauces del Bagre](05-FAUCES_DEL_BAGRE.md) | Gancho | hecha | 5 | 18 | 13 | 3 | 5 | **32** |
| 6 | [Santuario del Rostro](06-SANTUARIO_DEL_ROSTRO.md) | Brazalete de Fuerza nivel 2 | hecha | 4 | 22 | 8 | 3 | 5 | **25** |
| 7 | [Torre del Águila](07-TORRE_DEL_AGUILA.md) | Campo de Protección | hecha | 4 | 25 | 15 | 3 | 6 | **34** |
| 8 | [Roca de la Tortuga](08-ROCA_DE_LA_TORTUGA.md) | Polvo de Fuego | diseñada | 4 | 22 | 8 | 4 | 4 | **27** |

**Cómo se leen:**
- **Cada fila es una pieza:** tiene un código (por ejemplo `TA-12` o `CO-03`), la imagen actual, qué hace en el juego, los estados o animaciones que necesita, la medida de hoy y la que se pide.
- **Lo común:** lo que se repite en varias mazmorras tiene código `CO-` y se dibuja una sola vez (00-COMUNES.md). En el documento de cada mazmorra figura igual, para que su lista esté completa.
- **Las puertas y las paredes:** se dibujan una vez por mazmorra, para que combinen con su pared.
- **Las imágenes:** son del juego tal como está hoy (las capturas, de las pruebas en vivo). Las de los cuerpos muestran el primer cuadro mirando arriba, abajo, derecha e izquierda.

**El orden recomendado:**
1. Correr el prompt de [00-COMUNES.md](00-COMUNES.md): fija el estilo de toda la serie.
2. Correr el de cada mazmorra, de a una. Cada prompt pide primero una hoja de estilo y espera la aprobación antes de hacer todo.
3. Indexar en el juego lo aprobado (cada prompt explica cómo) y probarlo en vivo.

## Dirección de arte

**Dirección de arte (para todas las mazmorras):**
- **Perspectiva y escala:** vista desde arriba levemente inclinada (la de Argentum Online): se ve el frente de las paredes y el techo de los objetos. La baldosa mide 32 × 32 y un personaje humano mide 1,5 baldosas de alto.
- **Estilo:** pintado, con volumen y sombreado suave, que combine con los personajes y los mapas de AO. Nada de pixel art de 8 bits ni de formas planas.
- **Luz:** desde arriba a la izquierda, igual en todas las piezas. Cada cosa que toca el piso lleva una sombra de contacto suave.
- **Contorno:** oscuro y fino donde ayude a leer la forma contra el piso, no alrededor de todo.
- **Paleta:** una por mazmorra (la del tema), con un color de acento para lo interactivo (lo que se toca, se levanta o se abre) y rojo o naranja para lo peligroso.
- **Legibilidad:** lo que se puede usar se distingue del decorado a primera vista, y cada estado se distingue del otro (cerrado o abierto, apagado o encendido, entero o roto).
- **Original:** se toma la estructura de *Link's Awakening*, no su arte. Nada copiado de Nintendo ni de otros juegos. Si se parte de algo libre (CC0 o CC-BY), se anota el autor, la licencia y el enlace.

**Reglas técnicas (las del motor del juego):**
- **Archivos:** PNG con transparencia (RGBA), sin fondo, sin halos claros alrededor y sin texto ni marcas de agua.
- **Baldosas de piso:** un bloque de 4 × 4 baldosas (128 × 128) que se repite sin costura en las dos direcciones; el juego elige la baldosa por la posición en el mapa.
- **Paredes:** un bloque de 4 × 4. Cada fila es la cara de la pared vista a 1, 2, 3 y 4 baldosas del piso (la última fila toca el piso). Tiene que repetirse sin costura a lo ancho.
- **Agua y lava:** bloque de 4 × 4 animado (4 cuadros en bucle, que empalmen).
- **Objetos:** una baldosa (32 × 32), anclados abajo al centro. Si son altos (estatuas, puertas, pilares), el dibujo puede subir (32 × 64, 32 × 96) o ensancharse (96 × 96 las puertas); la base sigue en la baldosa.
- **Cuerpos (criaturas y jefes):** una hoja por cuerpo, con 4 filas en este orden: mirando arriba, abajo, derecha e izquierda. Las columnas son los cuadros, todos de la misma medida. Mínimo 6 cuadros de caminata por dirección, que entren en bucle. Los pies van abajo al centro del cuadro: el juego lo apoya sobre la baldosa.
- **Animaciones aparte** (ataques, poses, efectos): una tira horizontal por animación, con cuadros de la misma medida.
- **Numeración del juego:** al día de este documento, el próximo grh libre es el 42484, el próximo archivo de gráficos el 330041 y el próximo cuerpo el 586. Verificalos antes de indexar.

## Cómo entra al juego

**Cómo entra al juego (solo después de que Leandro apruebe el arte):**
1. Cada hoja va a `frontend/public/graphics/<archivo>.png`, numeradas desde el próximo archivo libre.
2. Cada cuadro es un grh. Se agrega como texto al final de `frontend/public/init/graficos.json` y `graficos_optimized.json`, sin reescribir los JSON:
   - estático: `"<grh>":{"numFrames":1,"numFile":<archivo>,"sX":<x>,"sY":<y>,"width":<w>,"height":<h>,"frames":{"1":<grh>}}` y, en el optimizado, `"<grh>":[<archivo>,<x>,<y>,<w>,<h>]`;
   - animado: `"<grh>":{"numFrames":<n>,"frames":{"1":<g1>,"2":<g2>,…},"speed":<ms>}` y `"<grh>":{"f":<n>,"r":[<g1>,<g2>,…],"s":<ms>}`.
3. Cada cuerpo se agrega a `frontend/public/init/bodies.json`: `"<cuerpo>":{"1":<grh arriba>,"2":<grh abajo>,"3":<grh derecha>,"4":<grh izquierda>,"headOffsetX":0,"headOffsetY":0}`. El cuerpo de cada criatura se cambia con `idBody` en su plantilla de `server/mazmorras/<mazmorra>/leyenda.json`.
4. Los objetos del mapa toman su grh de `DUNGEON_OBJECTS` en `server/src/scripts/buildDungeonMaps.ts`, y las baldosas de piso y pared, de `graficos` en `leyenda.json`. Después se regeneran los mapas con `pnpm --dir server exec tsx src/scripts/buildDungeonMaps.ts <mazmorra>`.
5. Lo que hoy se dibuja con formas o con sprites sueltos vive en `frontend/components/game/engine/` (el módulo de cada mazmorra; ver la tabla de efectos). Ahí se cargan las hojas nuevas.
6. Se sube la versión de las cachés en `frontend/utils/gameLoader.ts` (graficos, bodies, objs y npcs) para que los jugadores bajen lo nuevo.
7. Se prueba en vivo y se sacan capturas de cada cosa, comparadas con la imagen actual de este documento.

## Cómo se armaron estos documentos

Los generó un script a partir de los datos reales del juego:
- **Los mapas de cada mazmorra:** qué objetos y criaturas tiene cada uno (`server/mapas_source/mapa_N/specials.json`).
- **Las leyendas:** las plantillas de criaturas, incluidas las que aparecen en juego, como los murciélagos del Flautista (`server/mazmorras/<mazmorra>/leyenda.json`).
- **Los índices de gráficos:** de ahí salen las imágenes actuales (`graficos.json`, `bodies.json` y `objs.json`).
- **Los módulos de dibujo del cliente:** lo que no es un gráfico indexado (`frontend/components/game/engine/`).

La Gruta del Abisal y la Roca de la Tortuga no están construidas como mapas definitivos: su lista sale de sus diseños ([01-GRUTA_DEL_ABISAL.md](../01-GRUTA_DEL_ABISAL.md) y [04-ROCA_DE_LA_TORTUGA.md](../04-ROCA_DE_LA_TORTUGA.md)).
