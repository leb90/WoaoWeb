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

Atribución que pide la licencia CC-BY de 213 y 214: "Rock/Metal Slide" de Hansjörg Malthaner (http://opengameart.org/users/varkalandar), CC-BY 4.0, modificado (recortado, normalizado y acelerado).
