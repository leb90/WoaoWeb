# Créditos de sonidos de terceros

Sonidos que no son del Argentum original. Los de clima son todos CC0: no exigen atribución, pero se listan para saber de dónde salió cada uno.

## Meditación (`frontend/public/sounds/meditacion/`)

"Ki sereno", elegido por Leandro entre tres tandas de opciones: un aire que respira (sube y baja cada 6 s) con un acorde grave y cálido muy bajito por debajo (La2, Mi3, La3), como energía que se va juntando. Está hecho para el juego con numpy (ruido filtrado entre 150 y 1200 Hz, con la respiración y un barrido suave del filtro), así que no tiene autor externo ni licencia que cumplir. Un solo archivo de 11 s: el arranque (el aire que se levanta, 0-3 s), un ciclo de respiración (3-9 s) y 2 s más del ciclo siguiente; se repite del segundo 10 al 4 para que la vuelta caiga lejos de los bordes, donde el códec deforma las muestras. Está a −26 LUFS (más bajo que el clima), en OGG y MP3. Lo usa `frontend/lib/meditationSound.ts`, que lo apaga despacio al terminar de meditar.

| Archivo | Uso | Original | Autor | Licencia |
|---|---|---|---|---|
| meditacion-ki-sereno | Arranque y bucle mientras se medita | Sintetizado para el juego | WoAO | Propio |

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

Para el Polvo de Fuego, el Gancho, el Brazalete de Fuerza, el Campo de Protección, las Bombas y el Arco, del mismo paquete y con el mismo criterio de volumen (entre −19 y −20 dB):

| Número | Uso | Original | Autor | Licencia |
|---|---|---|---|---|
| 222 | Llamarada del Polvo de Fuego | `sfx_exp_short_soft5.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 223 | Cadena del Gancho | `sfx_movement_ladder2loop.wav` (con un corte suave al final) | Juhani Junkala (SubspaceAudio) | CC0 |
| 224 | Se rompe una vasija o una piedra tirada con el Brazalete de Fuerza | `sfx_exp_shortest_soft3.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 225 | El Brazalete de Fuerza levanta algo | `sfx_sounds_interaction5.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 226 | Explota una bomba | `sfx_exp_medium1.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 227 | Se pone una bomba | `sfx_movement_jump10_landing.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 228 | Se tira una flecha con el Arco | `sfx_wpn_sword2.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 229 | Se levanta el Campo de Protección | `sfx_sounds_high1.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
| 230 | El Campo de Protección frena un golpe | `sfx_sounds_impact3.wav` | Juhani Junkala (SubspaceAudio) | CC0 |
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
| `botella/1.mp3` | Gruta de la Botella, tema 1 | "Mirage", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100877 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `botella/2.mp3` | Gruta de la Botella, tema 2 | "Mystery Bazaar", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700005 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `botella/3.mp3` | Gruta de la Botella, tema 3 | "Hidden Wonders", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700006 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `botella/combate.mp3` | Gruta de la Botella, combate | "Ibn Al-Noor", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100706 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `rostro/1.mp3` | Santuario del Rostro, tema 1 | "Temple of the Manes", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100053 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `rostro/2.mp3` | Santuario del Rostro, tema 2 | "Vulcan", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100525 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `rostro/3.mp3` | Santuario del Rostro, tema 3 | "Shamanistic", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100353 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `rostro/combate.mp3` | Santuario del Rostro, combate | "Grim Idol", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700043 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `fauces/1.mp3` | Fauces del Bagre, tema 1 | "Water Prelude", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100017 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `fauces/2.mp3` | Fauces del Bagre, tema 2 | "Floating Cities", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600018 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `fauces/3.mp3` | Fauces del Bagre, tema 3 | "Immersed", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600010 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `fauces/combate.mp3` | Fauces del Bagre, combate | "Eternal Terminal", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700047 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `torre/1.mp3` | Torre del Águila, tema 1 | "Thunderbird", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600017 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `torre/2.mp3` | Torre del Águila, tema 2 | "Ascending the Vale", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600064 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `torre/3.mp3` | Torre del Águila, tema 3 | "The Sky of our Ancestors", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700056 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |
| `torre/combate.mp3` | Torre del Águila, combate | "Crossing the Chasm", https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700026 | Kevin MacLeod (incompetech.com) | CC-BY 4.0 |

Atribución que piden las licencias CC-BY:
- "RPG Exploration - (The Black Temple)", de Hitctrl, CC-BY 3.0, convertido y nivelado.
- "8bit Dungeon Level" y "Video Dungeon Crawl", de Kevin MacLeod (incompetech.com), con licencia Creative Commons: By Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/), convertidos y nivelados.
- "Dubious Dungeon", de Bogart VGM, CC-BY 4.0, convertido y nivelado.
- "Mirage", "Mystery Bazaar", "Hidden Wonders" e "Ibn Al-Noor", de Kevin MacLeod (incompetech.com), con licencia Creative Commons: By Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/), convertidos, nivelados y con los silencios de las puntas recortados.
- "Temple of the Manes", "Vulcan", "Shamanistic" y "Grim Idol", de Kevin MacLeod (incompetech.com), con licencia Creative Commons: By Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/), recortados, normalizados y recodificados a MP3 (a "Shamanistic" también se le limitaron los picos).
- "Water Prelude", "Floating Cities", "Immersed" y "Eternal Terminal", de Kevin MacLeod (incompetech.com), con licencia Creative Commons: By Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/), recortados, normalizados y recodificados a MP3 ("Water Prelude" se cortó en 4:37 con un fundido de salida, porque el original termina de golpe, y a "Immersed" se le limitaron los picos).

## Música del mundo y del menú (`frontend/public/music/mundo/` y `frontend/public/music/menu/`)

Cada ciudad tiene su canción y cada tipo de lugar dos temas que se turnan con un silencio de 30 a 75 s entre uno y otro, como en Skyrim (`lib/worldMusic.ts`). El server decide qué música le toca a cada mapa (`server/src/environment.ts`, `getMusicForMap`). Se pasaron a MP3 de 96 kbps, se igualaron a −18 LUFS y se recortaron los silencios de las puntas. Ninguno tiene letra. Los créditos también se ven en la wiki (Créditos), porque las licencias CC BY lo piden.

| Archivo | Uso | Original | Autor | Licencia |
|---|---|---|---|---|
| `mundo/ciudades/ullathorpe.mp3` | Ullathorpe | "Townsong", https://www.free-stock-music.com/alexander-nakarada-townsong.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/ciudades/nix.mp3` | Nix | "Tam Lin", https://www.free-stock-music.com/alexander-nakarada-tam-lin.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/ciudades/banderbill.mp3` | Banderbill | "Medieval Chateau", https://www.free-stock-music.com/alexander-nakarada-medieval-chateau.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/ciudades/lindos.mp3` | Lindos | "The Streets of Prague", https://www.free-stock-music.com/alexander-nakarada-the-streets-of-prague.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/ciudades/caos.mp3` | Ciudad Caos | "Balefire", https://www.scottbuckley.com.au/library/balefire/ | Scott Buckley | CC BY 4.0 |
| `mundo/bosque/1.mp3` | Bosques | "Woods of Imagination", https://www.free-stock-music.com/alexander-nakarada-woods-of-imagination.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/bosque/2.mp3` | Bosques | "Spirits of the Greenwood", https://www.free-stock-music.com/alexander-nakarada-spirits-of-the-greenwood.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/campo/1.mp3` | Campos | "Tranquil Fields (Peaceful)", https://www.free-stock-music.com/alexander-nakarada-tranquil-fields-peaceful.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/campo/2.mp3` | Campos | "Pathfinder", https://www.free-stock-music.com/alexander-nakarada-pathfinder.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/mar/1.mp3` | Mar e islas | "The Great Sea", https://www.scottbuckley.com.au/library/the-great-sea/ | Scott Buckley | CC BY 4.0 |
| `mundo/mar/2.mp3` | Mar e islas | "Seven Seas", https://www.free-stock-music.com/alexander-nakarada-seven-seas.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/desierto/1.mp3` | Desierto | "The Desert (The Grand Score)", https://www.free-stock-music.com/alexander-nakarada-the-desert.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/desierto/2.mp3` | Desierto | "Tranquil Fields (Eastern)", https://www.free-stock-music.com/alexander-nakarada-tranquil-fields-eastern.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/nieve/1.mp3` | Nieve | "Traversing the White Peaks", https://www.free-stock-music.com/alexander-nakarada-traversing-the-white-peaks.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/nieve/2.mp3` | Nieve | "Frost", https://www.free-stock-music.com/alexander-nakarada-frost.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/terror/1.mp3` | Bosque del terror | "Headless Horseman", https://www.free-stock-music.com/alexander-nakarada-headless-horseman.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/terror/2.mp3` | Bosque del terror | "Dark Hollows", https://www.free-stock-music.com/alexander-nakarada-dark-hollows.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/cueva/1.mp3` | Cuevas y minas | "Mysterious Adventure", https://www.free-stock-music.com/alexander-nakarada-mysterious-adventure.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/cueva/2.mp3` | Cuevas y minas | "Odin’s Blessing", https://www.free-stock-music.com/alexander-nakarada-odins-blessing.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/castillo/1.mp3` | Castillos y fortalezas | "Song of the Forge", https://www.scottbuckley.com.au/library/song-of-the-forge/ | Scott Buckley | CC BY 4.0 |
| `mundo/castillo/2.mp3` | Castillos y fortalezas | "Might & Magic", https://www.free-stock-music.com/alexander-nakarada-might-magic.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/aldea/1.mp3` | Aldeas | "Village Ambiance", https://www.free-stock-music.com/alexander-nakarada-village-ambiance.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `mundo/aldea/2.mp3` | Aldeas | "Farm", https://www.free-stock-music.com/alexander-nakarada-farm.html | Alexander Nakarada (CreatorChords) | CC BY 4.0 |
| `menu/inicio.mp3` | Inicio, cuenta y personajes | "Shoulders of Giants", https://www.scottbuckley.com.au/library/shoulders-of-giants/ | Scott Buckley | CC BY 4.0 |
| `menu/creacion.mp3` | Creación de personaje | "Shop Theme (Buy Something)", https://opengameart.org/content/shop-theme | CleytonKauffman | CC0 |

Atribución que piden las licencias CC BY:
- Los temas de Alexander Nakarada (CreatorChords, https://creatorchords.com), publicados en https://www.free-stock-music.com con licencia Creative Commons Attribution 4.0 International (https://creativecommons.org/licenses/by/4.0/), convertidos, nivelados y con los silencios de las puntas recortados.
- "Balefire", "The Great Sea", "Song of the Forge" y "Shoulders of Giants", de Scott Buckley, released under CC-BY 4.0, www.scottbuckley.com.au; convertidos, nivelados y con los silencios de las puntas recortados.
- "Shop Theme", de CleytonKauffman, es CC0 (no pide atribución).
