# Torre del Águila

Fecha: 2026-10-28. Estado: **hecha en un solo PR** (pedido de Leandro: la última mazmorra, entera de una). El sistema (instancias, grupo, ítems de mazmorra, mecánicas) está en [../MAZMORRAS.md](../MAZMORRAS.md); el patrón de la serie, en [00-PATRON_LINKS_AWAKENING.md](00-PATRON_LINKS_AWAKENING.md).

**Lugar en la serie: a definir.** En el original es la séptima.
- **Ítem:** da el **Campo de Protección** (el *Espejito Rebotín* del pedido: el Escudo Espejo de Zelda). No es un escudo que se equipa, porque hay personajes que no usan escudo: es un ítem de mazmorra que se **usa** (3 s levantado) y **cualquier clase** lo puede usar. Ya existía como "Escudo Espejo" en `dungeonTools.ts`; esta mazmorra lo renombra, lo dibuja como un campo de energía y le suma el **rebote**.
- **Para entrar:** pide la **Pluma** (los pozos), el **Brazalete de Fuerza** (el Orbe y las vasijas) y el **Gancho** (las cornisas y las Máscaras), como el original pide la Pluma, la Pulsera y el Gancho.
- **Básicos:** las **bombas** (dos paredes rajadas) y el **arco** (el Águila, opcional).

Adaptación de la **Torre del Águila** (*Eagle's Tower*), el nivel 7 de *Link's Awakening*. No se copia baldosa por baldosa; se respeta la estructura jugable:
- **Una torre de cuatro pisos** más la terraza: la planta baja (16 salas), el primer piso (14), el segundo (12) y, arriba de todo, el piso que se derrumba y la terraza del Águila. Cada piso es un mapa, y los pozos de un piso te tiran al de abajo.
- **El Campo de Protección se consigue temprano** (primer piso), como en el original, y desde ahí sirve para frenar y **rebotar**: los rayos de los ojos de piedra (y romperlos), las bolas de los hechiceros, el viento y las plumas del Águila.
- **Los cuatro pilares y el Orbe:** en el primer piso hay cuatro pilares que sostienen el piso de arriba. Se levanta el Orbe con el Brazalete, se lo lleva y se lo tira contra cada pilar. Con los cuatro rotos, **la torre tiembla y el último piso se derrumba sobre el segundo**: ahí aparece la escalera a lo alto.
- **Los minijefes:** el **Cíclope rojo** (el Hinox) en el primer piso (da una llave) y el **Flautista** (el Grim Creeper) en el segundo: no se lo puede lastimar; hay que vencer a sus murciélagos y huye.
- **El jefe:** el **Águila Malvada** (el Evil Eagle), en la terraza, con el Flautista montado. Pasa bajo (ahí se la golpea), aletea para tirarte de la torre y tira plumas: con el Campo de frente el viento no empuja, y la pluma rebota, la lastima y la tira a la terraza.

## 1. Cómo funciona el original

Lo leímos con el mapa del pedido (VinnyVideo, 2008) y lo cruzamos con el código del juego (el desensamblado [zladx/LADX-Disassembly](https://github.com/zladx/LADX-Disassembly): grilla, salas, cofres, enemigos y eventos) y con la lógica del randomizer [LADXR](https://github.com/daid/LADXR/blob/master/logic/dungeon7.py). El análisis sala por sala está en el scratchpad (`dungeon8/original.md`, `salas.txt` y `grillas.txt`).

- **La grilla:** la planta baja (F1) es un cuadrado de 4 × 4 salas; el primer piso (F2), 4 × 4 sin dos esquinas; el segundo (F3), 4 × 4 sin las cuatro esquinas; el último (F4), 2 × 2 arriba del centro del F3; y la terraza, dos pantallas.
- **Cuatro escaleras** entre F1 y F2 (las A-D del dibujo) y una entre F2 y F3. Del F3 se sube al F4 por una escalera que recién sirve después del derrumbe.
- **Llaves:** 3 chicas (una la sueltan los Like Like de la entrada, otra está en una cornisa del este y otra la suelta el Hinox) y la de Pesadilla (detrás del Grim Creeper, empujando dos bloques).
- **El Escudo Espejo** está en el F2, enseguida después de la primera puerta con llave. En el original solo frena (el rayo del Beamos, las bolas, las plumas del Águila); nosotros le sumamos el rebote, que el pedido pide como mecánica central.
- **Los pilares:** cuatro, en las cuatro salas del centro del F2. La **bola** (el Orb) está en la sala del Escudo. Al tirar el cuarto pilar hay una escena: el F4 se cae sobre el centro del F3 y las salas se fusionan.
- **Minijefes:** el **Hinox** (tira bombas y agarra) suelta una llave; el **Grim Creeper** toca la flauta y llama a seis Keese; vencidos los seis, dice que te las va a hacer pagar y se va. Después aparece montado en el Águila.
- **Jefe:** el **Evil Eagle**, en lo alto de la torre: pasa volando a baja altura (ahí se lo golpea), aletea para empujarte al vacío mientras tira plumas (el Escudo Espejo las frena) y se te tira encima. Si te caés, aparecés en el piso de abajo.

## 2. Mapas de AO

| Mapa | Nombre | Qué entra |
|---|---|---|
| **580** | Planta baja | Las 16 salas del F1 (4 × 4 celdas de 11 × 9 baldosas, salas de 10 × 8 adentro) |
| **581** | Primer piso | Las 14 salas del F2, con los cuatro pilares y el Orbe. Sus pozos tiran a la planta baja |
| **582** | Segundo piso | Las 12 salas del F3. Las tres del centro son abismos con cornisas de piso flojo. Sus pozos tiran al primer piso |
| **583** | Lo alto de la torre | El piso derrumbado (4 salas: la llegada, la puerta del jefe, la escalera a la terraza y la Sala del Órgano) y la **terraza** del Águila, rodeada de vacío: el que se cae va a parar a la sala de la escalera |

- **Salas de 10 × 8,** como en Zelda y las otras mazmorras grandes.
- **Un mapa por piso:** así el mapa grande tiene una pestaña por piso y se siente la subida. Las escaleras A-D del dibujo son las escaleras 1-4; la E es la 5; la 6 aparece con el derrumbe y la 7 sube a la terraza. El portal Ⅰ es el atajo del Flautista a la Entrada.
- **El F4 no se visita antes del derrumbe** (en el original se puede, pero no hace falta): simplifica sin perder la idea. Después del derrumbe sus salas están "caídas" sobre el centro del segundo piso: se llega por la escalera que aparece en la Sala del derrumbe.
- **Gráficos:** piso de losas de piedra (9688) y paredes de ladrillo gris (7812), distintos de las otras mazmorras: una torre de piedra. Los pilares, el Orbe y el ojo roto son gráficos nuevos (sección 10).

## 3. Salas

Celdas (columna, fila) de cada mapa, desde arriba a la izquierda. Entre corchetes, la sala del original. El número de sector es el del pedido (sección 9). "Cierra" es una sala que se cierra al entrar y se abre al vencer a todos; "persiana" es una puerta que se abre con el evento de la sala.

### Mapa 580 (Planta baja)

| Sala | Celda | Sector | Contenido | Criaturas | Trampas |
|---|---|---|---|---|---|
| Entrada [0E] | (1,3) | 1 | Aparecés acá; portal de salida; **portal-atajo** Ⅰ desde el Flautista (aparece al vencerlo) | — | — |
| Hechicero [0D] | (0,3) | 1 | Cuatro vasijas en el medio | Hechicero | — |
| Púas [0F] | (2,3) | 1 | Una banda de cristales en el medio | 2 cuchillas | Cuchillas |
| Tragones de la llave [10] | (3,3) | 10 | Al vaciarla aparece el cofre de la **llave K1**. **Puerta con llave** al norte | 2 Tragones, chispa | Cierra |
| Cuchillas [0C] | (3,2) | 2 | **Escalera 1** (al primer piso, la Sala del Campo). Una columna de pozos parte la sala, con un paso abajo | Momia, 2 cuchillas | Pozos |
| La Cruz [0B] | (2,2) | 2 | El núcleo: cuatro puertas, cuatro antorchas y la **losa** con la pista de los pilares | — | — |
| Momias [0A] | (1,2) | 9 | Al vaciarla aparece un **cofre de 50** | 2 momias, chispa | Cierra |
| El Pico [09] | (0,2) | 8 | Cofre del **Pico de Piedra** entre cristales; **escalera 3** (al primer piso, las Chispas) | — | — |
| Zigzag [05] | (0,1) | 6 | Dos filas de cristales que se rompen de un golpe | — | — |
| Pozos del oro [06] | (1,1) | 9 | Un **cofre de 50** en una isla rodeada de pozos: se salta con la Pluma | — | Pozos |
| Tragones del norte [07] | (2,1) | 2 | — | 2 Tragones, esqueleto esquivo | — |
| Lanzallamas [08] | (3,1) | 5 | Un lanzallamas, contra la pared oeste, barre la sala hacia el este (el Campo lo frena). Un bloque azul tapa la puerta del norte hasta golpear el **cristal** | — | Lanzallamas, lava |
| Cornisa de la caracola [01] | (0,0) | 9 | La **Caracola secreta** en la cornisa del oeste, del otro lado de una columna de pozos: se cruza enganchando la estatua (y se vuelve enganchando la otra) | Tragón, hongo | Pozos |
| Gusano [02] | (1,0) | 9 | **Escalera 2** (al primer piso, la Brújula) | Mini gusano, 2 cuervos | — |
| Ojo del norte [03] | (2,0) | 9 | **Escalera 4** (al primer piso, el Mapa) | 2 cuervos | Ojo de piedra |
| Cornisa de la llave [04] | (3,0) | 6 | La **llave K2** en la cornisa del este, con el Gancho (estatuas de los dos lados). **Búho:** la pista del Orbe | Chispa | Ojo de piedra, pozos |

### Mapa 581 (Primer piso)

| Sala | Celda | Sector | Contenido | Criaturas | Trampas |
|---|---|---|---|---|---|
| Sala del Campo [1A] | (3,2) | 4 | Llega la **escalera 1**. El cofre del **Campo de Protección** está rodeado de bloques azules: el **cristal** los baja. Al lado, el **Orbe** | — | Pozos |
| Cerradura [1E] | (3,3) | 7 | Seis vasijas. **Bloque cerradura** (K2) al oeste | — | Ojo de piedra |
| Cristal de la escalera [1D] | (2,3) | 7 | **Escalera 5** (al segundo piso) rodeada de bloques azules: el cristal los baja. Puerta de un solo sentido al oeste | 2 mocos escondidos | — |
| Naipes [1C] | (1,3) | 8 | Tres **Naipes** que hay que vencer **en orden** (I, II, III); al terminar aparece un **cofre de 50**. **Búho** con la pista. Pared rajada al norte | 3 Naipes | — |
| Cíclope [1B] | (0,3) | 10 | **Minijefe: el Cíclope rojo.** Al vencerlo aparece la **llave K3**. Dos lanzallamas | Cíclope rojo | Cierra, pozos, lanzallamas |
| Chispas [17] | (0,2) | 6 | Llega la **escalera 3**. Dos puertas de un solo sentido con las Baldosas | 2 mocos escondidos, 2 chispas | — |
| Pilar SO [18] | (1,2) | 3 | **Pilar.** Paredes rajadas al norte y al sur | 2 mocos escondidos | — |
| Pilar SE [19] | (2,2) | 3 | **Pilar.** Un **cofre de 50** entre pozos | Moco escondido | Pozos |
| Baldosas [13] | (0,1) | 6 | **Baldosas voladoras:** romperlas todas abre la persiana al Pilar NO | Chispa | Baldosas |
| Pilar NO [14] | (1,1) | 3 | **Pilar.** Persiana al oeste; pared rajada al sur | Cuchilla | Pozos |
| Pilar NE [15] | (2,1) | 3 | **Pilar** | 2 mocos escondidos, moco | Pozos |
| Búho de los pilares [16] | (3,1) | 8 | **Búho:** la pista del Orbe y los pilares. Un **bloque** sobre una **placa** hace aparecer un **cofre de 200** | — | — |
| Brújula [11] | (1,0) | 9 | Tres Naipes en orden: aparece la **Brújula**. **Escalera 2** (a la planta baja) | 3 Naipes | — |
| Mapa [12] | (2,0) | 9 | Dos **cabezas de caballo**: con las dos paradas aparece el **Mapa**. **Escalera 4** | Chispa | — |

### Mapa 582 (Segundo piso)

| Sala | Celda | Sector | Contenido | Criaturas | Trampas |
|---|---|---|---|---|---|
| Máscaras [2A] | (2,3) | 7 | Llega la **escalera 5** | 2 Máscaras de Hierro, cuervo | — |
| Serpiente [29] | (1,3) | 7 | — | Serpiente, 2 cuervos, chispa | — |
| Abismo sur [26] | (1,2) | 3 | Casi todo vacío: una **cornisa de piso flojo** une las puertas (si te quedás quieto, se hunde y caés al primer piso) | — | Pozos, piso flojo |
| Ojos de piedra [25] | (0,2) | 5 | **El puzzle del Campo:** dos ojos de piedra tiran rayos; con el Campo de frente, el rayo **rebota y rompe el ojo**. Rotos los dos, se abre la persiana al norte | 2 hechiceros | 2 ojos de piedra |
| Cerradura del norte [21] | (0,1) | 7 | **Bloque cerradura** (K3) al este | Cuervo | Ojo de piedra |
| Abismo oeste [22] | (1,1) | 3 | Otra cornisa de piso flojo, en T | — | Pozos, piso flojo |
| Sala del derrumbe [23] | (2,1) | 3 | Vacía… hasta que caen los cuatro pilares: ahí aparece la **escalera 6** a lo alto | — | — |
| Ojo de las cuchillas [1F] | (1,0) | 11 | — | 2 cuervos, 2 cuchillas | Ojo de piedra |
| Cintas [20] | (2,0) | 9 | **Cintas transportadoras** en anillo y dos **cabezas de caballo**: paradas las dos, aparece un **cofre de 200** | Moco | Cintas |
| Abismo este [27] | (2,2) | 3 | Cornisa de piso flojo hacia el Flautista | — | Pozos, piso flojo |
| Flautista [28] | (3,2) | 10 | **Minijefe: el Flautista.** Al vencerlo aparece el **portal-atajo** Ⅰ a la Entrada | Flautista y sus 6 murciélagos | Cierra |
| Llave de Pesadilla [24] | (3,1) | 11 | Dos **bloques** sobre dos **placas**: aparece la **Llave del jefe** | 3 chispas | — |

### Mapa 583 (Lo alto de la torre)

| Sala | Celda | Sector | Contenido | Criaturas | Trampas |
|---|---|---|---|---|---|
| Escombros [2B] | (0,0) | 11 | Llega la **escalera 6**. La **losa** del Águila. **Puerta del jefe** al sur | 3 hongos | — |
| Puerta del jefe [2D] | (0,1) | 11 | — | 4 hongos | — |
| Escalera a la terraza [2E] | (1,1) | 11 | **Escalera 7** a la terraza. Acá cae el que se cae de la terraza. La persiana al norte se abre al vencer al Águila | — | — |
| Sala del Órgano [2C] | (1,0) | 11 | El **cofre del jefe** (trofeo y oro, una vez por día) y el portal de salida | — | — |
| Terraza | (3,0)-(4,1) | 11 | **Jefe: el Águila Malvada.** Una terraza de 13 × 7 rodeada de vacío | Águila Malvada (con el Flautista encima) | Vacío |

## 4. Recorrido

1. **La planta baja:** Entrada → Púas → Tragones de la llave: **K1**. Puerta con llave → Cuchillas: **escalera 1**.
2. **El Campo:** Sala del Campo: golpear el cristal baja los bloques: **Campo de Protección**. Al lado, el **Orbe**.
3. **Los pilares:** con el Orbe, Pilar SE → Pilar NE → Pilar NO → Pilar SO (las paredes rajadas se vuelan con bombas). Si el Orbe cae a un pozo, vuelve a la Sala del Campo. Con el cuarto, **el derrumbe**.
4. **K2:** Cornisa de la llave (planta baja), con el Gancho. Bloque cerradura de la Cerradura (K2) → Cristal de la escalera → **escalera 5**.
5. **K3:** El Pico → escalera 3 → Chispas → **Cíclope rojo**: **K3**.
6. **El segundo piso:** Máscaras → Serpiente → Abismo sur → **Ojos de piedra** (el Campo rebota los rayos) → Cerradura del norte (K3) → Abismo oeste → Sala del derrumbe: **escalera 6** (si ya cayeron los pilares).
7. **La Llave del jefe:** Máscaras → Abismo este → **Flautista** → Llave de Pesadilla: **Llave del jefe**. El portal Ⅰ vuelve a la Entrada.
8. **Lo alto:** Escombros → **puerta del jefe** → Puerta del jefe → Escalera a la terraza → **Águila Malvada** → Sala del Órgano: **trofeo**.
9. **Opcional:** la Caracola (Gancho), el Pico y las pistas de los búhos, la Brújula (Naipes) y el Mapa (cabezas), los cofres de oro.

**No hay forma de trabarse:**
- 3 llaves para 3 cerraduras, y cada llave sale antes de su cerradura y después de la anterior (K1 en la Entrada; K2 con el Gancho, que es requisito; K3 del Cíclope, en la rama de la escalera 3).
- El Orbe vuelve solo a su lugar si cae a un pozo o si quien lo lleva muere, cambia de mapa o sale.
- Si alguien se cae de un abismo, va a parar al piso de abajo (y de la terraza, a la sala de la escalera 7).
- El cofre del Campo pide golpear un cristal (cualquier golpe sirve).

## 5. Ubicaciones

### Llaves y cerraduras
| Llave | Dónde | Cómo |
|---|---|---|
| K1 | Tragones de la llave | Vaciar la sala |
| K2 | Cornisa de la llave | Engancharse a la estatua de la cornisa |
| K3 | Cíclope | Vencer al Cíclope rojo |
| Llave del jefe | Llave de Pesadilla | Empujar los dos bloques a las placas |

Cerraduras: la puerta de las Cuchillas (K1), el bloque de la Cerradura (K2), el bloque de la Cerradura del norte (K3) y la puerta del jefe en Escombros.

### Escaleras y portales
| Número | Une | Para qué |
|---|---|---|
| 1 | Cuchillas ↔ Sala del Campo | El Campo y el Orbe |
| 2 | Gusano ↔ Brújula | La Brújula |
| 3 | El Pico ↔ Chispas | El Cíclope y la K3 |
| 4 | Ojo del norte ↔ Mapa | El Mapa |
| 5 | Cristal de la escalera ↔ Máscaras | El segundo piso |
| 6 | Sala del derrumbe ↔ Escombros | Aparece con el derrumbe |
| 7 | Escalera a la terraza ↔ Terraza | El jefe (siempre visible) |
| Ⅰ | Flautista → Entrada | Atajo; aparece al vencerlo |

### Recompensas
- **Ítem:** el **Campo de Protección**, en la Sala del Campo.
- **Orientación:** el Mapa (Mapa), la Brújula (Brújula) y el Pico de Piedra (El Pico; con él hablan los tres búhos).
- **Oro:** 50 en Momias, Pozos del oro, Pilar SE y Naipes; 200 en Búho de los pilares y Cintas.
- **La Caracola secreta**, en la Cornisa de la caracola.
- **Del jefe:** el trofeo de la serie (**Garra del Águila**; en el original, el Órgano de la Calma Vespertina) y oro, una vez por día por personaje. Ocupa la casilla "Séptima mazmorra" de la Mochila.

### Minijefes

**El Cíclope rojo** (Hinox, `05_hinox.asm`): el Cíclope de la Gruta de la Botella (`ciclope` en la plantilla), con el mismo cuerpo rojizo y más vida. Tira bombas y arremete. Al vencerlo aparece el cofre de la K3.

**El Flautista** (Grim Creeper, `grim_creeper.asm`). Cuerpo del Fantasma encapuchado de AO (251).
- **No se lo lastima** nunca: se escurre entre sus murciélagos.
- **Toca la flauta** y llama a **seis murciélagos**, de a uno. Si se tarda, toca otra vez y vuelven los que faltan.
- **Vencidos los seis** dice "¡Mis murciélagos! ¡Me las vas a pagar!" y huye volando. La sala se abre y aparece el portal-atajo.
- **Vuelve** montado en el Águila.

### Jefe: el Águila Malvada (Evil Eagle, `evil_eagle.asm`)
| En el original | En AO |
|---|---|
| Vuela fuera de alcance y pasa a baja altura por la pantalla: ahí se la golpea | Igual: cruza la terraza por la fila de alguien y lo atropella (12 %, empuja). Mientras vuela bajo le entran los golpes, las flechas y el Gancho |
| Aletea desde un costado: el viento empuja a Link hacia el borde; el que se cae aparece abajo | Igual: 4 s de ráfagas. **Con el Campo levantado mirándola, no te mueve.** El que se cae va a parar a la sala de la escalera (y vuelve a subir) |
| Tira plumas; el Escudo Espejo las frena | Las plumas vuelan por tu fila. **Con el Campo de frente rebotan, vuelven, la lastiman y la tiran a la terraza 4 s**, donde se la golpea de cualquier lado |
| Se te tira encima | La picada: se para alto sobre alguien (crece su sombra) y cae: 15 % y empujón. Saltando con la Pluma se esquiva |
| Unos 8 espadazos (según la espada) | 12 golpes, más 3 por cada jugador extra |
| Al morir aparece el contenedor de corazón | Cae girando y suelta plumas; se abre la Sala del Órgano |

- **Pista de la losa:** "Dicen que el Águila solo cae cuando sus propias plumas se le vuelven en contra."
- **Si nadie queda en la terraza** (se cayeron todos), ronda alto hasta que vuelvan.

### Criaturas
Plantillas nuevas con cuerpos de AO, con los roles del original:
- **Tragones** (Like Like): mocos grandes que se arrastran hacia vos y **te tragan** un momento (no podés moverte ni atacar, 6 %) y te escupen. **Si tenías el Campo levantado, se lo comen:** 15 s sin poder levantarlo. Custodian la K1 y aparecen en la planta baja.
- **De presión:** momias (Gibdo), cuervos (Peahat, vuelan), hongos (Goomba), mini gusano (Mini-Moldorm), serpiente, esqueleto esquivo, mocos y mocos escondidos.
- **Hechiceros** (Wizzrobe, el del Santuario): aparecen, tiran una bola y desaparecen. **Rebotada, la bola vuelve y les saca la mitad de la vida.**
- **Naipes** (Three-of-a-Kind): tres que hay que vencer en orden (la mecánica "orden" de la Gruta de la Botella).
- **Máscaras de Hierro** (las de las Fauces): el Gancho les arranca la máscara.
- **Trampas:** chispas, cuchillas, ojos de piedra, lanzallamas, baldosas voladoras, cintas y piso flojo.

## 6. El ítem: el Campo de Protección

Lo que ya hacía (como Escudo Espejo): 3 s levantado delante del personaje, 1,5 s de espera; lo que llega de frente no entra: golpes de criaturas, rayos, bolas de fuego, el hueso, la bola del Machacador.

**Lo que esta mazmorra le suma** (lo que pide el pedido: que rebotar, bloquear o reflejar haga falta para avanzar):

| Uso nuevo | Cómo | Dónde |
|---|---|---|
| **Rebotar el rayo del ojo de piedra** | El rayo vuelve al ojo y lo rompe (queda de piedra rota). En las salas de "ojos" (`ojosAbrenPuertas` de la leyenda), romperlos todos abre sus persianas | Ojos de piedra (obligatorio); los demás ojos, para sacárselos de encima |
| **Rebotar la bola del hechicero** | Vuelve y le saca la mitad de la vida | Hechicero, Ojos de piedra |
| **Plantarse contra el viento** | Con el Campo mirando al Águila, las ráfagas no te mueven | La Terraza |
| **Rebotar las plumas** | La pluma vuelve, lastima al Águila y la tira a la terraza unos segundos | La Terraza (es la forma de pegarle "en el piso") |
| **Que te lo coman** | Un Tragón se lo come si te traga con el Campo levantado | Tragones (tres salas) |
| **Frenar el lanzallamas** | De frente, la llamarada no entra | Lanzallamas, Cíclope |

En la Mochila pasa a decir "Torre del Águila" y "rebota los rayos, las bolas de fuego y las plumas".

## 7. Qué cambia respecto del original

| En el original | Acá |
|---|---|
| Espada | Cualquier golpe cuerpo a cuerpo (el cristal, el Águila baja, los Naipes) |
| El F4 se visita antes del derrumbe y después se fusiona con el F3 | El F4 solo existe caído, como mapa de lo alto; el centro del F3 son abismos con cornisas |
| La bola cae al piso de abajo por los agujeros | El Orbe vuelve solo a su lugar |
| Three-of-a-Kind (tres cartas iguales) | Tres Naipes que se vencen en orden |
| La llave del este se alcanza cayendo de un agujero del F2 | Se alcanza con el Gancho |
| El Escudo Espejo solo frena | El Campo frena y rebota |
| El Hinox agarra y tira | El Cíclope de la Gruta de la Botella (bombas y embestidas) |
| Medicina secreta | Un cofre de 200 |

## 8. Mecánicas que necesita

**Ya hechas:** llaves, bloques cerradura, salas que se cierran, pozos que tiran al piso de abajo, placas, cofres y escaleras que aparecen, puertas de un solo sentido, paredes rajadas, portal-atajo, cristales y bloques de color, búhos y pico, losas, mocos escondidos, chispas y cuchillas, ojos de piedra y lanzallamas, baldosas voladoras, cintas y cabezas de caballo, matar en orden, piso flojo, Máscaras de Hierro, el Cíclope, y los ítems: Pluma, Brazalete, Gancho, bombas, arco y el Escudo Espejo.

**Nuevas** (`dungeonTower.ts`, `dungeonTowerBosses.ts`, `dungeonTools.ts` y `dungeonShrine.ts`):

| Mecánica | Para qué |
|---|---|
| El Campo de Protección rebota (`mirrorReflects`) | Ojos de piedra que se rompen, bolas de los hechiceros, plumas del Águila |
| Los pilares y el Orbe (`¶`, `●`) | El derrumbe que abre lo alto |
| Escaleras que aparecen con el derrumbe (`escalerasTrasPilares`) | La escalera 6 |
| Salas de ojos (`ojosAbrenPuertas`) | Persianas que abren los ojos rotos |
| Tragones | Se comen el Campo |
| El Flautista y sus murciélagos | Minijefe |
| El Águila Malvada | Jefe: pasadas, viento, plumas, picada, posada |
| Caerse de la terraza | Los pozos de un mapa que tiran al mismo mapa |

## 9. Los 11 sectores del pedido

| Sector del pedido | Dónde queda |
|---|---|
| 1. Entrada / hub inicial | La Entrada con tres ramas (Hechicero, Púas, y la Cruz por arriba): desde ahí se ve que hay pisos (las escaleras 1-4 están en la planta baja) |
| 2. Sector central | La Cruz y las salas de alrededor: el núcleo del ir y volver de la planta baja |
| 3. Progresión vertical | Las escaleras entre pisos, los abismos (caerse te baja un piso), los pilares y el derrumbe que abre lo alto |
| 4. Ítem principal | La Sala del Campo, enseguida después de la primera puerta con llave |
| 5. Puzzle con el Campo | Ojos de piedra (rebotar los rayos abre la persiana), el Lanzallamas y los hechiceros |
| 6. Rama izquierda | El Pico, el Zigzag, la Caracola (Gancho), las Chispas y las Baldosas |
| 7. Rama derecha | Las cornisas, la Cerradura, el Cristal de la escalera y el segundo piso hasta la Cerradura del norte |
| 8. Lore / pista | Las losas (la Cruz: los pilares; Escombros: las plumas) y los tres búhos (Cornisa de la llave, Búho de los pilares, Naipes) |
| 9. Reward secundaria | Mapa, Brújula, Pico, la Caracola, 50 × 4 y 200 × 2 |
| 10. Encuentro importante | El Cíclope rojo (K3) y el Flautista (Llave del jefe y el atajo) |
| 11. Tramo final | Lo alto: Escombros, la puerta del jefe, la Terraza y la Sala del Órgano |

## 10. Cómo se construye

Todo en un PR (pedido de Leandro):
1. **Mecánicas y el Campo:** el rebote, los pilares y el Orbe, los Tragones, las salas de ojos, el derrumbe (**hecho**, ver [../MAZMORRAS.md](../MAZMORRAS.md), sección 23).
2. **Mapas 580-583, criaturas y música:** cuatro temas libres (**hecho**, sección 24).
3. **Jefes:** el Flautista y el Águila Malvada (**hecho**, sección 25).

**Números:**
- Mapas 580-583. Piedra de invocación: NPC 9727.
- Plantillas de criaturas: desde 9822.
- Objetos de mazmorra: 1891 (pilar), 1892 (pilar roto), 1893 (Orbe) y 1894 (ojo roto).
- Gráficos: grh 42448-42483 y archivos 330037-330040. Cuerpos 584 (Águila en vuelo) y 585 (posada).
- Va como `soloDesarrollo`. Pide la Pluma, el Brazalete de Fuerza y el Gancho.

## 11. Para confirmar

| Tema | Propuesta |
|---|---|
| Nombre | Torre del Águila |
| Ítem | Campo de Protección (renombra al Escudo Espejo, que ya existía sin mazmorra) |
| Jefe | Águila Malvada (con el Flautista montado) |
| Minijefes | Cíclope rojo y el Flautista |
| Trofeo | Garra del Águila |
| El F4 | Solo caído, después del derrumbe |
| Requisitos | Pluma, Brazalete de Fuerza y Gancho |

## Fuentes
- El mapa del pedido (VinnyVideo, 2008), con la leyenda de llaves, warps y objetos.
- [zladx/LADX-Disassembly](https://github.com/zladx/LADX-Disassembly): la grilla, las salas, las entidades y los eventos del nivel 7; el Grim Creeper, el Evil Eagle, el Hinox y el Like Like.
- [LADXR, `logic/dungeon7.py`](https://github.com/daid/LADXR/blob/master/logic/dungeon7.py): la lógica de llaves y salas.
- [Zelda Wiki: Eagle's Tower](https://zelda.fandom.com/wiki/Eagle%27s_Tower), [Evil Eagle](https://zelda.fandom.com/wiki/Evil_Eagle) y [Grim Creeper](https://zelda.fandom.com/wiki/Grim_Creeper).
