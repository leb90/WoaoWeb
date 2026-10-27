# Créditos de sonidos de terceros

Sonidos que no son del Argentum original. Los de clima son todos CC0: no exigen atribución, pero se listan para saber de dónde salió cada uno.

## Clima (`frontend/public/sounds/clima/`)

Se recortaron, se les hizo un fundido cruzado para que los bucles empalmen sin clic, se normalizaron (−20 LUFS los bucles y −16 los truenos) y se guardaron en OGG y MP3. Los usa `frontend/lib/weatherAmbience.ts`.

| Archivo | Uso | Original | Autor | Licencia |
|---|---|---|---|---|
| clima-lluvia | Lluvia | "Rain_Loop.wav", https://freesound.org/people/Snoopy20111/sounds/399072/ | Snoopy20111 | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| clima-tormenta | Tormenta (lluvia fuerte) | "EXT_HardRainOnPatio-SMOOTH", https://freesound.org/people/jongrubbs/sounds/202899/ | jongrubbs | CC0 |
| clima-nieve | Nieve (viento frío) | `wind.ogg` del paquete "Icy Heights", https://opengameart.org/content/icy-heights | Écrivain | CC0 |
| clima-niebla | Niebla (viento suave) | "Looping Gentle Wind Ambience on an Open Desert Plain", https://freesound.org/people/dhallcomposer/sounds/697217/ | dhallcomposer | CC0 |
| clima-lluvia-techo | Lluvia bajo techo | "Rain from Indoors – Perfect loop", https://freesound.org/people/samesamesame/sounds/242889/ | samesamesame | CC0 |
| clima-trueno-1 | Trueno cercano | "sfx_thunder blast", https://freesound.org/people/bajko/sounds/399656/ | bajko | CC0 |
| clima-trueno-2 | Trueno cercano | "Thunder Clap", https://freesound.org/people/DaniloSFX/sounds/672776/ | DaniloSFX | CC0 |
| clima-trueno-3 | Trueno cercano con retumbo | "Thunder2", https://freesound.org/people/Yoyodaman234/sounds/267551/ | Yoyodaman234 | CC0 |
| clima-trueno-4 | Trueno lejano | "Thunder 12", https://freesound.org/people/LukaCafuka/sounds/795412/ | LukaCafuka | CC0 |
| clima-trueno-5 | Trueno lejano suave | "Distant Thunder Clap_Gentle", https://freesound.org/people/mikala_oidua/sounds/347562/ | mikala_oidua | CC0 |

## Mazmorras (`frontend/public/sounds/210.wav` a `215.wav`)

Sonidos al estilo de las mazmorras de Zelda, pero originales: ninguno copia melodías de Nintendo. Se pasaron a WAV mono de 44,1 kHz. Los jingles se suavizaron con un filtro de agudos para que no piquen, y al del secreto se le sumó un eco corto de mazmorra. Todos se igualaron en volumen: −16 LUFS los jingles, −17 y −18 las puertas y −19 el oro. Los usa `server/src/dungeons.ts` (`DUNGEON_SOUNDS`).

| Número | Uso | Original | Autor | Licencia |
|---|---|---|---|---|
| 210 | Encontrar una llave, la llave del jefe, el mapa o la brújula | `sfx_sounds_powerup12.wav` de "The Essential Retro Video Game Sound Effects Collection [512 sounds]", https://opengameart.org/content/512-sound-effects-8-bit-style | Juhani Junkala (SubspaceAudio) | CC0 |
| 211 | Encontrar el ítem de la mazmorra (Patas de rana) | `sfx_sounds_powerup16.wav`, del mismo paquete | Juhani Junkala (SubspaceAudio) | CC0 |
| 212 | Secreto: aparece un cofre oculto o se resuelve un puzzle | `jingles_NES12.ogg` de "85 Short music jingles", https://opengameart.org/content/85-short-music-jingles | Kenney (kenney.nl) | CC0 |
| 213 | Se abre una puerta | `rock_metal_slide_1.wav` de "Rock/Metal Slide", https://opengameart.org/node/107669 | Hansjörg Malthaner (Varkalandar), https://opengameart.org/users/varkalandar | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/): **pide atribución** |
| 214 | Se cierran las puertas de una sala (sala que se cierra o cofre trampa) | `rock_metal_slide_2.wav`, del mismo autor, acelerado ×1,5 | Hansjörg Malthaner (Varkalandar) | CC-BY 4.0: **pide atribución** |
| 215 | Cofre de oro | `sfx_coin_cluster3.wav` de "The Essential Retro Video Game Sound Effects Collection" | Juhani Junkala (SubspaceAudio) | CC0 |

Para la Caverna de las Llaves se sumaron sonidos del mismo paquete de Juhani Junkala (CC0). Se igualaron por volumen medio, porque son demasiado cortos para medirlos en LUFS: entre −19 y −22 dB.

| Número | Uso | Original | Autor | Licencia |
|---|---|---|---|---|
| 216 | La Carrera rompe un bloque de cristal | `sfx_sounds_impact9.wav` (recortado a 0,85 s) | Juhani Junkala (SubspaceAudio) | CC0 |
| 217 | Se cae un piso que se desmorona | `sfx_exp_shortest_soft9.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 218 | La Carrera se estrella contra una pared | `sfx_sounds_impact11.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 219 | Arranca la Carrera | `sfx_movement_jump11.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 220 | Salto con la Pluma | `sfx_movement_jump13.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 221 | Bajan los aplastadores | `sfx_exp_shortest_hard1.wav` | Juhani Junkala (SubspaceAudio) | CC0 |

Para el Polvo de Fuego, el Gancho, el Brazalete de Fuerza, el Escudo Espejo, las Bombas y el Arco, del mismo paquete y con el mismo criterio de volumen (entre −19 y −20 dB):

| Número | Uso | Original | Autor | Licencia |
|---|---|---|---|---|
| 222 | Llamarada del Polvo de Fuego | `sfx_exp_short_soft5.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 223 | Cadena del Gancho | `sfx_movement_ladder2loop.wav` (con un corte suave al final) | Juhani Junkala (SubspaceAudio) | CC0 |
| 224 | Se rompe una vasija o una piedra tirada con el Brazalete de Fuerza | `sfx_exp_shortest_soft3.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 225 | El Brazalete de Fuerza levanta algo | `sfx_sounds_interaction5.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 226 | Explota una bomba | `sfx_exp_medium1.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 227 | Se pone una bomba | `sfx_movement_jump10_landing.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 228 | Se tira una flecha con el Arco | `sfx_wpn_sword2.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 229 | Se levanta el Escudo Espejo | `sfx_sounds_high1.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 230 | El Escudo Espejo frena un golpe | `sfx_sounds_impact3.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 231 | El Polvo mágico | `sfx_sounds_high3.wav` | Juhani Junkala (SubspaceAudio) | CC0 |

Atribución que pide la licencia CC-BY de 213 y 214: "Rock/Metal Slide" de Hansjörg Malthaner (http://opengameart.org/users/varkalandar), CC-BY 4.0, modificado (recortado, normalizado y acelerado).

## Música de las mazmorras (`frontend/public/music/mazmorras/`)

Cada mazmorra tiene tres temas que suenan uno detrás del otro y uno de combate, para la pelea con un jefe o un minijefe (`lib/dungeonMusic.ts`). Se pasaron a MP3 de 96 kbps y se igualaron a −18 LUFS. Ninguno tiene voces.

| Archivo | Uso | Original | Autor | Licencia |
|---|---|---|---|---|
| `prueba/1.mp3` | Gruta (mazmorra de prueba), tema 1 | "Underwater Theme", https://opengameart.org/content/underwater-theme | CleytonKauffman | CC0 |
| `prueba/2.mp3` | Gruta, tema 2 | "Underwater Theme II", https://opengameart.org/content/underwater-theme-ii | CleytonKauffman | CC0 |
| `prueba/3.mp3` | Gruta, tema 3 | "Nautilus", https://opengameart.org/content/nautilus | poinl | CC0 |
| `prueba/combate.mp3` | Gruta, combate | "Epic Boss Battle", https://opengameart.org/content/boss-battle-music | Juhani Junkala (SubspaceAudio) | CC0 |
| `caverna/1.mp3` | Caverna de las Llaves, tema 1 | "Cave Theme", https://opengameart.org/content/cave-theme | Brandon75689 (publicado por HaelDB) | CC0 (también OGA-BY 3.0) |
| `caverna/2.mp3` | Caverna, tema 2 | "Dungeon Ambience", https://opengameart.org/content/dungeon-ambience | yd | CC0 |
| `caverna/3.mp3` | Caverna, tema 3 | "RPG Exploration - (The Black Temple)", https://opengameart.org/content/rpg-exploration-the-black-temple | Hitctrl | [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| `caverna/combate.mp3` | Caverna, combate | "Battle Theme A", https://opengameart.org/content/battle-theme-a | cynicmusic (cynicmusic.com, pixelsphere.org) | CC0 |
| `cueva/1.mp3` | Cueva de la Cola, tema 1 | "8bit Dungeon Level", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200066 | Kevin MacLeod (incompetech.com) | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `cueva/2.mp3` | Cueva, tema 2 | "Video Dungeon Crawl", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200064 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `cueva/3.mp3` | Cueva, tema 3 | "Dubious Dungeon", https://opengameart.org/content/dubious-dungeon | Bogart VGM | CC-BY 4.0 |
| `cueva/combate.mp3` | Cueva, combate | "Zelda Style 8-bit Boss Theme", https://opengameart.org/content/zelda-style-8-bit-boss-theme | HydroGene | CC0 |

Atribución que piden las licencias CC-BY:
- "RPG Exploration - (The Black Temple)", de Hitctrl, CC-BY 3.0, convertido y nivelado.
- "8bit Dungeon Level" y "Video Dungeon Crawl", de Kevin MacLeod (incompetech.com), con licencia Creative Commons: By Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/), convertidos y nivelados.
- "Dubious Dungeon", de Bogart VGM, CC-BY 4.0, convertido y nivelado.
