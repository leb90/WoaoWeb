# Créditos de gráficos de terceros

Gráficos que no son del Argentum original y que se usan en el juego. Los CC-BY exigen nombrar al autor y la licencia; los CC0 no, pero se listan igual para saber de dónde salió cada cosa.

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

## Roca de la Tortuga: lo que tocan el Polvo de Fuego, el Gancho y la Pulsera

Objetos de mazmorra 1852-1857 (gráficos 38215-38229, archivos `frontend/public/graphics/320255.png` a `320260.png`). Ver [docs/mazmorras/04-ROCA_DE_LA_TORTUGA.md](mazmorras/04-ROCA_DE_LA_TORTUGA.md).

| Archivo | Uso en el juego | Original | Autor | Licencia |
|---|---|---|---|---|
| `320255.png` | Vasija (se levanta con la Pulsera) | La primera vasija redonda de `pint_brown.png`, "Free ceramic jars", https://opengameart.org/content/free-ceramic-jars, achicada a 28 px | Clodo | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `320256.png` | Piedra suelta (se levanta con la Pulsera) | Una piedra de los escombros de "[LPC] Jungle Ruins", https://opengameart.org/content/lpc-jungle-ruins | bluecarrot16 (encargo de Pierre Vigier) | CC-BY 3.0+ / OGA-BY 3.0+ |
| `320258.png` | Estatua de piedra (se engancha con el Gancho) | Una estatua de "[LPC] Jungle Ruins" | bluecarrot16 | CC-BY 3.0+ / OGA-BY 3.0+ |
| `320259.png`, `320260.png` | Antorcha apagada y encendida (9 cuadros) | "[LPC] Animated Torch", https://opengameart.org/content/lpc-animated-torch; la apagada es el primer cuadro sin la llama | William.Thompsonj | CC-BY 3.0+ / OGA-BY 3.0 |

Hecho con gráficos del propio juego: **`320257.png`, el bloque de hielo**, es el bloque de piedra (grh 8623) pasado a celeste y aclarado, con un par de brillos.
