# Créditos de gráficos de terceros

Gráficos que no son del Argentum original y que se usan en el juego. Los CC-BY exigen nombrar al autor y la licencia; los CC0 no, pero se listan igual para saber de dónde salió cada cosa.

## Cursores del juego

`frontend/public/cursors/`, aplicados en `frontend/lib/gameCursors.ts` y `frontend/app/globals.css`. El guantelete brillante es la base; las variantes con borde se armaron pintando sobre él el contorno de las variantes oscuras del mismo pack.

| Archivo | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| `guantelete.png` | Cursor normal | "Gauntlet Cursor", `cursor_shiny`, https://opengameart.org/content/gauntlet-cursor (basado en "Pointers: part 5" de yd) | itsmars | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `guantelete-oro.png` | Botones y NPC con los que se habla o comercia | Ídem, contorno `cursor_outline_yellow` | itsmars | CC0 |
| `guantelete-rojo.png` | Criaturas hostiles y otros jugadores | Ídem, contorno `cursor_outline_red` | itsmars | CC0 |
| `guantelete-azul.png` | Uno mismo, el grupo y el clan | Ídem, contorno `cursor_outline_blue` | itsmars | CC0 |
| `guantelete-presionado.png` | Mientras se aprieta un botón o un enlace | Ídem, `cursor_outline_yellow` sin cambios (guantelete oscuro con borde dorado) | itsmars | CC0 |
| `cruceta.png` | Apuntar un hechizo o un ataque a distancia | "Cursor Pack", `target_round_b`, https://kenney.nl/assets/cursor-pack, repintado con el acero del guantelete y un punto rojo en el centro | Kenney | CC0 |
| `prohibido.png` | Botones deshabilitados | Ídem, `disabled`, repintado con el acero del guantelete y la barra en rojo | Kenney | CC0 |

## Chamán elemental (efectos 147 a 154)

Los efectos se recortaron, se escalaron al tamaño del personaje y se juntaron en planillas nuevas (`frontend/public/graphics/320247.png` a `320253.png`). Ver [docs/CHAMAN_ELEMENTAL.md](CHAMAN_ELEMENTAL.md).

| Efecto | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| 147 | Aura del Escudo mágico | "Alot of Particles #10, CircleFlamePurple", https://opengameart.org/content/alot-of-particles-circle-flame-special-effect-alotofparticles10 | JoesAlotofthings | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 148 | Aura del Escudo físico | "Animated particle effects #1, particlefx_13", https://opengameart.org/content/animated-particle-effects-1 | para | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| 149 | Prisión de agua (aura mientras dura) | "Water Magic Effect", variante 02, https://opengameart.org/content/water-magic-effect | Cethiel | CC0 |
| 150 | Aura de la Evasión de viento | "Alot of Particles Whirlpool #05, Grey", https://opengameart.org/content/alot-of-particles-whirlpool-special-effect-alotofparticles05 | JoesAlotofthings | CC-BY 4.0 |
| 152 | Aura de los escudos para aliados | "Alot of Particles Halo #03, Halo01DkBlue", https://opengameart.org/content/alot-of-particles-halo-special-effects-2-sets | JoesAlotofthings | CC-BY 4.0 |
| 153 | Llama de la quemadura del Rayo de Fuego | "Fire FX - Burning Fire Animation", https://opengameart.org/content/fire-fx-burning-fire-animation | mikodrak (Martin Jelinek) | CC0 |
| 154 | Chispas del silencio del Rayo Eléctrico | "Plasma Electric Effect Animations, Loop Electrical Charging", https://opengameart.org/content/plasma-electric-effect-animations | reactorcore | CC0 |

Hechos con gráficos del propio juego (sin terceros):

- **146, Martillo de luz celestial:** el ícono de la Maza (grh 28120) pintado de dorado y el anillo de luz de la planilla 3096.
- **151, anillo de piedras del Escudo de energía, y la piedra que vuela:** la roca del efecto 80.

## Cueva de la Cola: el Ciempiés Colosal

El jefe de la Cueva de la Cola se dibuja con la planilla original sin cambios (`frontend/public/sprites/ciempies.png`). El cliente recorta de los cuadros que miran hacia arriba la cabeza, dos segmentos y la cola, y los gira sobre el rastro de la cabeza (`frontend/components/game/engine/dungeonBoss.ts`). Ver [docs/mazmorras/03-CUEVA_DE_LA_COLA.md](mazmorras/03-CUEVA_DE_LA_COLA.md).

| Archivo | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| `sprites/ciempies.png` | Ciempiés Colosal (jefe) | "[LPC] Centipede", https://opengameart.org/content/lpc-centipede | FiveBrosStopMosYT (con agradecimiento a bluecarrot16, bzt y Ragnar Random) | [OGA-BY 3.0](https://static.opengameart.org/OGA-BY-3.0.txt) (también CC-BY-SA 3.0 y 4.0) |

## Roca de la Tortuga: lo que tocan el Polvo de Fuego, el Gancho y el Brazalete de Fuerza

Objetos de mazmorra 1852-1857 (gráficos 38215-38229, archivos `frontend/public/graphics/320255.png` a `320260.png`). Ver [docs/mazmorras/04-ROCA_DE_LA_TORTUGA.md](mazmorras/04-ROCA_DE_LA_TORTUGA.md).

| Archivo | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| `320255.png` | Vasija (se levanta con el Brazalete de Fuerza) | La primera vasija redonda de `pint_brown.png`, "Free ceramic jars", https://opengameart.org/content/free-ceramic-jars, achicada a 28 px | Clodo | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `320256.png` | Piedra suelta (se levanta con el Brazalete de Fuerza) | Una piedra de los escombros de "[LPC] Jungle Ruins", https://opengameart.org/content/lpc-jungle-ruins | bluecarrot16 (encargo de Pierre Vigier) | CC-BY 3.0+ / OGA-BY 3.0+ |
| `320258.png` | Estatua de piedra (se engancha con el Gancho) | Una estatua de "[LPC] Jungle Ruins" | bluecarrot16 | CC-BY 3.0+ / OGA-BY 3.0+ |
| `320259.png`, `320260.png` | Antorcha apagada y encendida (9 cuadros) | "[LPC] Animated Torch", https://opengameart.org/content/lpc-animated-torch; la apagada es el primer cuadro sin la llama | William.Thompsonj | CC-BY 3.0+ / OGA-BY 3.0 |

Hecho con gráficos del propio juego: **`320257.png`, el bloque de hielo**, es el bloque de piedra (grh 8623) pasado a celeste y aclarado, con un par de brillos.

## Bombas y pared rajada

| Archivo | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| `sprites/bomba.png` | La bomba con la mecha encendida (3 cuadros, al doble de tamaño) | "16-bit animated bomb", https://opengameart.org/content/16-bit-animated-bomb | victordelima | CC0 |
| `sprites/explosion.png` | La explosión de la bomba (12 cuadros de 96 × 96, sin cambios) | "Pixel Explosion (12 Frames)", https://opengameart.org/content/pixel-explosion-12-frames | JROB774 | [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| `graphics/320262.png` | Rocas sueltas: la pared rajada en una pared vertical | Escombros de "[LPC] Jungle Ruins", https://opengameart.org/content/lpc-jungle-ruins | bluecarrot16 | CC-BY 3.0+ / OGA-BY 3.0+ |

Hecho con gráficos del propio juego: **`graphics/320261.png`, la pared rajada en una pared horizontal**, es la puerta de piedra (grh 9193) con la abertura rellena de piedra y una grieta.

## Brazalete de Fuerza II y Campo de Protección

| Archivo | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| `graphics/320263.png` | Piedra pesada (solo la levanta el Brazalete de Fuerza II) | Un bloque de piedra de "[LPC] Jungle Ruins", https://opengameart.org/content/lpc-jungle-ruins | bluecarrot16 | CC-BY 3.0+ / OGA-BY 3.0+ |

El Campo de Protección (el Escudo Espejo de Zelda) se dibuja con formas en el cliente (`engine/dungeonTools.ts`): un arco de energía delante del personaje. Antes era el ícono del Escudo de Diamantes del juego (`sprites/escudo-espejo.png`, ya borrado).

## Mecánicas compartidas: búho, remolino y bloques de color

| Archivo | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| `graphics/330009.png` | Estatua búho (habla con el pico de piedra) | "OWL", https://opengameart.org/content/owl-0, pasado a gris piedra y achicado, sobre la base de una estatua de "[LPC] Jungle Ruins" | pechvogel; base: bluecarrot16 | CC-BY 3.0; CC-BY 3.0+ / OGA-BY 3.0+ |
| `graphics/330010.png` | Remolino (12 cuadros) | "Alot of Particles Whirlpool #01", variante celeste, https://opengameart.org/content/alot-of-particles-whirlpool-special-effect-alotofparticles01 (uno de cada tres cuadros, a 48 × 48) | JoesAlotofthings | CC-BY 4.0 |

Hechos con gráficos del propio juego:
- **`graphics/330005.png` a `330008.png`, los bloques de color:** levantados, el bloque de piedra (grh 8623) pasado a azul o a naranja; bajados, una baldosa con el borde del color.
- **Los cristales que los invierten:** los íconos de cristal azul y naranja del juego (grh 18543 y 18544).

## Gruta de la Botella

| Archivo | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| `graphics/330011.png` | Orejudo (cuerpo 577): el salto en 4 direcciones, 4 cuadros de 36 × 36 cada una | "Bunny Rabbit LPC style for PixelFarm", https://opengameart.org/content/bunny-rabbit-lpc-style-for-pixelfarm, en el reacomodo "Reorganised LPC rabbit" de Evert (https://opengameart.org/content/reorganised-lpc-rabbit), con cada cuadro centrado y apoyado abajo | Stephen "Redshrike" Challener, encargo de Tebruno99 para PixelFarm | [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/) / [OGA-BY 3.0](https://static.opengameart.org/OGA-BY-3.0.txt) (también CC-BY-SA 3.0) |
| `graphics/330012.png` | La botella del Genio, entera y rota (cuadros 42287 y 42288; objeto 1869) | Un ánfora y su versión rota de `pint_brown.png`, "Free ceramic jars", https://opengameart.org/content/free-ceramic-jars, sin el soporte, pasada a violeta y achicada a 46 px | Clodo | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |

Atribución que pide el autor: PixelFarm (https://bitbucket.org/tebruno99/pixelfarm) Stephen "Redshrike" Challener.

Hechos con gráficos del propio juego: el piso (bloque de grh 33847) y la cara de las paredes (bloque de grh 9683).


## Santuario del Rostro

Todos se pasaron a la paleta de piedra de "[LPC] Jungle Ruins", con alfa limpio y escalados con vecino más cercano.

| Archivo | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| `graphics/330013.png` | Estatua pesada (solo con el Brazalete nivel 2) | Una cabeza de ídolo y un pedestal de "[LPC] Jungle Ruins", https://opengameart.org/content/lpc-jungle-ruins, montados | bluecarrot16 (encargo de Pierre Vigier) | OGA-BY 3.0+ / CC-BY 3.0+ |
| `graphics/330014.png` | Cabeza de caballo parada y acostada | El caballo gris de "M484 Chess Set", https://opengameart.org/content/m484-chess-set (la acostada es la parada rotada) | Master484 (https://opengameart.org/users/master484) | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `graphics/330015.png` | Baldosa voladora | La losa con espiral de "[LPC] Jungle Ruins" | bluecarrot16 | OGA-BY 3.0+ / CC-BY 3.0+ |
| `graphics/330017.png` | Cinta transportadora (4 direcciones, 4 cuadros) | El tramo de cinta de "Tiny Factory", https://opengameart.org/content/tiny-factory, animado corriendo el dibujo, al doble y en piedra | Kenney | CC0 |
| `graphics/330018.png` | Lanzallamas | La cabeza con la boca abierta de "[LPC] Jungle Ruins" | bluecarrot16 | OGA-BY 3.0+ / CC-BY 3.0+ |
| `graphics/330019.png` | Ojo de piedra (cerrado, abierto, mirando y brillando) | "Jade Cyclops", https://opengameart.org/content/jade-cyclops, en piedra y sobre el pedestal de Jungle Ruins | IndigoFenix | CC0 / CC-BY 3.0 / CC-BY 4.0 |
| `graphics/330020.png` | Estrella (cuerpo 578, gira) | "Spinning heart and star trinkets items collectables", https://opengameart.org/node/125344, al doble | Haley Halcyon | CC0 |
| `graphics/330021.png` | Rostro de Piedra, el jefe (serena, con la boca abierta y enojada) | Tres cabezas de ídolo de "[LPC] Jungle Ruins", al triple | bluecarrot16 | OGA-BY 3.0+ / CC-BY 3.0+ |

Atribución que piden:
- "[LPC] Jungle Ruins" by bluecarrot16. Commissioned by Pierre Vigier (pvigier). Licenses: OGA-BY 3.0+, CC-BY 3.0+, GPL 2.0+. http://opengameart.org/content/lpc-jungle-ruins
- Master484 (https://opengameart.org/users/master484), "M484 Chess Set".
- IndigoFenix, "Jade Cyclops".

Hecho con gráficos propios: el pozo que deja una baldosa (`graphics/330016.png`) y la bola de hierro del Machacador (`graphics/330022.png`, una esfera sombreada).


## Fauces del Bagre

Los objetos van con alfa limpio. Las criaturas usan los originales a escala 1, menos la Máscara de Hierro, que está al doble con vecino más cercano.

| Archivo | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| `graphics/330026.png` | Piso flojo, firme y hundiéndose (42346 y 42347) | La losa lisa de "[LPC] Jungle Ruins", https://opengameart.org/content/lpc-jungle-ruins, con rajas dibujadas y una junta oscura; la hundida está achicada y más oscura | bluecarrot16 (encargo de Pierre Vigier) | OGA-BY 3.0+ / CC-BY 3.0+ |
| `graphics/330027.png` | Cristal que se rompe de un golpe (42348) | `crystal-red-small.png` de "Crystals", https://opengameart.org/content/crystals-0, pasado a celeste verdoso | Chris Fiedler (Chrisdesign), Iwan Gabovitch (qubodup) y Jordan Irwin (AntumDeluge) | CC0 |
| `graphics/330031.png` | Pulga de agua (cuerpo 579): 4 direcciones, 6 cuadros de 56 × 50 | `spider06.png` de "[LPC] Spider", https://opengameart.org/node/21036, pasada a celeste con un arco de agua debajo | Stephen "Redshrike" Challener (dibujo) y William.Thompsonj (colaborador) | [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/) / [OGA-BY 3.0](https://static.opengameart.org/OGA-BY-3.0.txt) (también CC-BY 4.0 y GPL) |
| `graphics/330032.png` | Calamar (cuerpo 580): 4 direcciones, 8 cuadros de 49 × 41 (la izquierda es la derecha espejada) | "Cugzilia II Prototype Squid", https://opengameart.org/node/122940, separado del GIF y pasado a blanco con los ojos oscuros | Spring Spring | CC0 |
| `graphics/330033.png` | Pez que salta (cuerpo 581): sube, arriba, baja y el salpicón, a la derecha y a la izquierda | El pez rojo de "Swimming Fish", https://opengameart.org/content/swimming-fish, menos saturado y girado; el salpicón está dibujado | Mepavi @ You're Perfect Studio | CC0 (también CC-BY 4.0 / OGA-BY 3.0) |
| `graphics/330034.png` | Máscara de Hierro (cuerpo 582): 4 cuadros, a la derecha y espejada | `masked_orc_run_anim` de "DungeonTileset II", https://0x72.itch.io/dungeontileset-ii, al doble, con la calavera pasada a hierro | 0x72 | CC0 |
| `graphics/330035.png` | La Máscara de Hierro sin la máscara (cuerpo 583) | `orc_warrior_run_anim` de "DungeonTileset II", al doble | 0x72 | CC0 |
| `graphics/330036.png` | La máscara suelta, la que arranca el Gancho (42447) | La máscara de `masked_orc_idle_anim_f0` de "DungeonTileset II", recortada y al doble | 0x72 | CC0 |

Atribución que piden:
- "[LPC] Jungle Ruins" by bluecarrot16. Commissioned by Pierre Vigier (pvigier). Licenses: OGA-BY 3.0+, CC-BY 3.0+, GPL 2.0+. http://opengameart.org/content/lpc-jungle-ruins
- "[LPC] Spider": Stephen "Redshrike" Challener, graphic artist; William.Thompsonj, contributor. https://opengameart.org/node/21036
- Los CC0 no la piden. Se nombra igual a Spring Spring, Mepavi @ You're Perfect Studio, 0x72, Chrisdesign, qubodup y AntumDeluge.

Hechos para el juego, sin gráficos de terceros:
- el agua baja: `graphics/330023.png` es una baldosa sola (42325) y `graphics/330024.png` es el bloque de 4 × 4 (42326-42341), con piedritas, arena y ondas que se repiten sin costura;
- el ancla del Gancho, en 4 orientaciones (`graphics/330025.png`, 42342-42345);
- la cabeza de dragón de piedra con su argolla (`graphics/330028.png`, 42349), con la paleta de Jungle Ruins;
- el hueso (`graphics/330030.png`, 42352).

El puente (`graphics/330029.png`, 42350 y 42351) está armado con la madera del muelle del propio juego (grh 5500-5503).

## Torre del Águila

| Archivo | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| `graphics/330039.png` | Águila Malvada en vuelo (cuerpo 584): 4 direcciones, 3 cuadros de 96 × 96 | `bird_2_eagle.png` de "[LPC] Birds", https://opengameart.org/content/lpc-birds, al triple con vecino más cercano (las filas de vuelo) | bluecarrot16 (encargo de castelonia) | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) (también CC-BY 3.0, CC-BY-SA, GPL y OGA-BY 3.0) |
| `graphics/330040.png` | Águila Malvada posada (cuerpo 585): 4 direcciones, 3 cuadros de 96 × 96 | Las filas de caminar del mismo `bird_2_eagle.png`, al triple | bluecarrot16 (encargo de castelonia) | CC-BY 4.0 |

Atribución que piden: "[LPC] Birds" by bluecarrot16, commissioned by castelonia. https://opengameart.org/content/lpc-birds

Hechos para el juego, sin gráficos de terceros:
- el pilar de la torre, entero y roto (`graphics/330037.png`, 42448 y 42449), dibujado con sombreado de cilindro;
- el ojo de piedra roto (`graphics/330038.png`, 42451), que es el ojo de piedra del Santuario (42299) apagado y con rajas;
- el Orbe (42450) es la bola de hierro del Machacador (`graphics/330022.png`), ahora como objeto del piso.
