# Muñecos de entrenamiento

Seis muñecos en Nix para practicar golpes, flechas y hechizos. Están en el pasto entre la pared este del salón de los entrenadores de clase y la calle, en (77,58), (80,58), (77,61), (80,61), (77,64) y (80,64). Quedan lejos de la fuente (25,58) y no cortan ningún camino.

## Cómo son

- **No se mueven, no pegan y no se rompen.** Tienen 50.000 de vida. En cada golpe, `respawn.muere` le pasa el muñeco a `server/src/trainingDummies.ts`, que anota el daño y le devuelve la vida en vez de matarlo. Lo que saquen venenos o hechizos de área lo cura una revisión cada segundo.
- **Se les puede pegar dentro de la ciudad segura:** la plantilla tiene `hostile: 1`, como las criaturas.
- **No dan experiencia, oro ni objetos.**
- **Se tambalean con cada golpe.** El server manda `characterSwing` con la marca de cuerpo, como cuando pega una criatura, y el cliente pasa un momento al cuerpo de golpe (`"ataque": 601` en `bodies.json`; `engine/creatureAttack.ts`).
- **Dicen el daño.** Cuando dejás de pegarle 4 segundos, el muñeco te avisa por consola: *"Muñeco> 12 golpes: 1.234 de daño en 8,2 s (150 por segundo; el más fuerte, 210)."* Cuenta por separado a cada jugador y a cada muñeco.

## Datos

`server/src/scripts/applyTrainingDummiesData.ts` arma todo y se puede volver a correr:

- la plantilla 9845 en `server/jsons/npcs.json` y `api/src/jsons/npcs.json`, y su copia en `frontend/public/init/npcs*.json`;
- el gráfico (`330050.png`, gráficos 43265 a 43270) en los dos índices del cliente;
- los cuerpos 600 y 601;
- los lugares en las cuatro copias del mapa 34 (`npcs.json` y la clave `npcs` de `specials.json`).

La plantilla es nueva, así que la API la siembra sola en `game_npcs`. El arte es de wulax (OGA-BY 3.0): ver [CREDITOS_GRAFICOS.md](CREDITOS_GRAFICOS.md).
