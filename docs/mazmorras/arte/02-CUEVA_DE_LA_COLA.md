# Arte: Cueva de la Cola

Inventario de todos los gráficos de la mazmorra **Cueva de la Cola** para rehacerlos de cero. Cada fila tiene el gráfico actual (de ejemplo), qué hace en el juego y qué hay que entregar. Al final está el prompt completo para Claude Opus 5.5. El índice y la dirección de arte común están en [README.md](README.md).

| | |
|---|---|
| **Mazmorra** | 2 de 8 de la serie |
| **Estado** | Hecha (mapas 530-532). |
| **Ítem que da** | Pluma de Roc |
| **Mapas** | 530, 531, 532 |
| **Tema** | Una cueva de tierra con raíces que cuelgan del techo, piedras sueltas y musgo; antorchas en las paredes. Cálida y polvorienta. |
| **Paleta** | marrón tierra, ocre, verde musgo apagado y naranja de antorcha |
| **Gráficos** | 3 baldosas, 10 puertas y mecánicas (+ la piedra de invocación), 11 criaturas, 2 minijefes y jefes, 1 efectos. **21 piezas propias** de esta mazmorra; el resto es común. |

**El plano:**

<img src="../03-cueva-de-la-cola.png" width="720">

## 1. Baldosas

| Código | Actual | Qué es y qué hace | Hoy | Para el nuevo |
|---|---|---|---|---|
| CC-01 | <img src="img/piso-8151.png" width="128"> | **Piso.** El piso de todas las salas. | bloque de 4 × 4 desde el grh 8151 | Bloque de 4 × 4 (128 × 128) que se repite sin costura; con dos o tres variantes de baldosa sueltas (rajada, con musgo o arena) para romper la repetición. |
| CC-02 | <img src="img/pared-7812.png" width="128"> | **Pared.** El frente de las paredes; arriba de la cuarta fila se ve negro (el techo). | bloque de 4 × 4 desde el grh 7812 (cada fila, a 1-4 baldosas del piso) | Bloque de 4 × 4: cada fila es la cara de la pared a 1, 2, 3 y 4 baldosas del piso, sin costura a lo ancho; y el techo (lo que hoy es negro) como bloque de 4 × 4 aparte. |
| CC-03 | — | **Pozo.** Caer saca vida y te devuelve a la entrada de la sala (o al piso de abajo). Se salta con la Pluma. | baldosa negra (grh 1) | El pozo con su borde y profundidad: autotile de 47 piezas (o el juego de 16 de bordes y esquinas), 32 × 32. |

## 2. Puertas, cofres y mecánicas

Las marcadas **común** se dibujan una sola vez para todas las mazmorras (están en [00-COMUNES.md](00-COMUNES.md)); acá figuran para que la lista de esta mazmorra esté completa. Las de **esta mazmorra** van en su prompt.

| Código | Actual | Qué es y qué hace | Estados que hacen falta | Hoy | Para el nuevo |
|---|---|---|---|---|---|
| CC-04 | <img src="img/familia-escalera.png"> | **Escalera.** Une las salas de distintos mapas o pisos (los atajos A, B, C… de Zelda). Se pisa y te lleva a la otra punta. Las de las salas que se cierran aparecen al vaciarlas. | una que baja y una que sube; la de la zambullida va bajo el agua y no se ve | 1198 (Escalera Grande, 32 × 96) | 32 × 64 (ocupa una baldosa, el dibujo puede subir una más), anclada abajo |
| CO-01 (común) | <img src="img/familia-portal.png"> | **Portal.** La salida de la mazmorra y los portales-atajo que aparecen al vencer a un minijefe (llevan a la entrada). | portal de salida y portal-atajo (dos colores distintos), animados en bucle | 378 (Teleport, 60 × 90, 24 cuadros) | 64 × 96, 8 a 12 cuadros en bucle, anclado abajo al centro |
| CO-02 (común) | <img src="img/familia-cofre.png"> | **Cofre.** Guarda llaves, el mapa, la brújula, oro, el pico de piedra, la caracola o el ítem de la mazmorra. Muchos aparecen al resolver la sala (salen de la nada con un brillo). | cerrado, abierto | 1832 (Cofre de mazmorra, 32 × 32); 1833 (Cofre de mazmorra abierto, 32 × 32) | 32 × 32 (el dibujo puede tener hasta 32 × 40), cerrado y abierto |
| CO-03 (común) | <img src="img/familia-cofre_jefe.png"> | **Cofre del jefe.** El cofre del trofeo, en la sala del final. Una vez por día por personaje da el trofeo de la serie y oro. Hoy es el mismo dibujo que el cofre común. | cerrado, abierto | 1849 (Cofre del jefe, 32 × 32) | 48 × 40 a 64 × 48, anclado abajo al centro: tiene que verse más importante que el común |
| CC-05 | <img src="img/familia-puerta.png"> | **Puerta (pared horizontal).** Hoy las puertas cerradas (con llave, del jefe, la persiana que abre la sala y el bloque cerradura) usan el mismo dibujo, y las abiertas o de un solo sentido, otro. En el nuevo cada tipo tiene que distinguirse a la vista. | común abierta y cerrada; con cerradura de llave chica; del jefe (cerradura grande); persiana (reja); de un solo sentido (con flecha); bloque cerradura | 1834 (Puerta de piedra, 96 × 96); 1835 (Puerta de piedra abierta, 96 × 96) | 96 × 96 como hoy (el arco ocupa la baldosa de la puerta y el muro de los costados), anclada abajo al centro |
| CC-06 | <img src="img/familia-barrera.png"> | **Puerta (pared vertical).** Las puertas en las paredes de los costados. Hoy es un cristal que tapa el paso. | los mismos tipos que la horizontal, vistos de costado; abierta no se dibuja | 1840 (Barrera de cristal, 32 × 32) | 32 × 64, anclada abajo |
| CO-04 (común) | <img src="img/familia-bloque.png"> | **Bloque que se empuja.** Se empuja una baldosa con un clic. Tapa pasos, aprieta placas y corta el camino de las cuchillas. | uno solo | 1836 (Bloque de piedra, 32 × 32) | 32 × 32 (el dibujo puede tener 32 × 40 para mostrar el alto) |
| CO-05 (común) | <img src="img/familia-placa.png"> | **Placa (botón del piso).** Se aprieta con un jugador o un bloque encima. Abre puertas o hace aparecer cofres y escaleras. La de peso solo baja si el que la pisa carga algo con el Brazalete. | suelta y apretada; la placa de peso (Gruta de la Botella) distinta | 1837 (Runa del suelo, 32 × 32); 1838 (Runa del suelo encendida, 32 × 32) | 32 × 32 |
| CO-06 (común) | <img src="img/familia-losa.png"> | **Losa de piedra.** Una losa con un texto grabado (pistas del jefe o de la mazmorra). Se lee con un clic. | una sola | 1839 (Losa de piedra, 32 × 32) | 32 × 48, anclada abajo |
| CC-07 | <img src="img/familia-rodillo.png"> | **Rodillo de púas.** Lo empuja el Ogro del Rodillo de punta a punta de la sala. Se salta con la Pluma. | una pieza que se repite en columna; opcional: 2 cuadros de giro | 1851 (Rodillo de púas, 32 × 32) | 32 × 32 por pieza |
| CO-PI (común) | <img src="img/cuerpo-256.png"> | **Piedra de invocación.** Está en el mundo: con un clic se entra a la mazmorra, solo o en grupo. Hoy es una estatua dorada que no tiene que ver con las mazmorras. | Una por mazmorra (con el símbolo de su ítem), con un brillo en bucle | cuerpo 256 | 64 × 96, anclada abajo; 6 cuadros de brillo |

## 3. Criaturas

Las imágenes muestran el primer cuadro mirando arriba, abajo, derecha e izquierda. "Hoy" dice cuántos cuadros por dirección tiene el cuerpo actual y de qué medida.

| Código | Actual (4 direcciones) | Qué es y qué hace | Rol | Hoy | Para el nuevo |
|---|---|---|---|---|---|
| CC-08 | <img src="img/cuerpo-12.png"> | **Esqueleto** (plantilla 503). Un esqueleto con espada. | criatura | cuerpo 12: 5 cuadros de 53 × 70 | 4 direcciones × 6 cuadros de caminata, 64 × 64 |
| CC-09 | <img src="img/cuerpo-9.png"> | **Murciélago** (plantilla 566). Un murciélago que vuela en zigzag. | criatura | cuerpo 9: 5 cuadros de 59 × 64 | 4 direcciones × 6 cuadros de caminata, 64 × 64 |
| CC-10 | <img src="img/cuerpo-141.png"> | **Estatua guardiana** (plantilla 9730). Una estatua de piedra. Parece que te mira. | criatura | cuerpo 141: 5 cuadros de 165 × 144 | 4 direcciones × 6 cuadros de caminata, 128 × 128 |
| CC-11 | <img src="img/cuerpo-74.png"> | **Escarabajo** (plantilla 9734). Un escarabajo de caparazón duro: te empuja. | criatura | cuerpo 74: 6 cuadros de 64 × 64 | 4 direcciones × 6 cuadros de caminata, 64 × 64 |
| CC-12 | <img src="img/cuerpo-412.png"> | **Babosa** (plantilla 9735). Una babosa negra que se arrastra por la cueva. | criatura | cuerpo 412: 4 cuadros de 90 × 60 | 4 direcciones × 6 cuadros de caminata, 96 × 96 |
| CC-13 | <img src="img/cuerpo-413.png"> | **Chispa** (plantilla 9736). Una chispa que da vueltas y quema al que toca. | trampa | cuerpo 413: 10 cuadros de 80 × 60 | 4 direcciones × 4 cuadros (si gira o se mueve), 48 × 48 |
| CC-14 | <img src="img/cuerpo-244.png"> | **Cuchilla** (plantilla 9737). Una trampa de cuchillas: sale disparada si te ve en su fila. | trampa | cuerpo 244: 2 cuadros de 75 × 75 | 4 direcciones × 4 cuadros (si gira o se mueve), 48 × 48 |
| CC-15 | <img src="img/cuerpo-51.png"> | **Escarabajo de púas** (plantilla 9738). Un escarabajo cubierto de púas. | criatura | cuerpo 51: 5 cuadros de 50 × 40 | 4 direcciones × 6 cuadros de caminata, 64 × 64 |
| CC-16 | <img src="img/cuerpo-375.png"> | **Mini gusano** (plantilla 9739). Un gusano anillado que se mueve rápido. | criatura | cuerpo 375: 5 cuadros de 64 × 42 | 4 direcciones × 6 cuadros de caminata, 64 × 64 |
| CC-17 | <img src="img/cuerpo-153.png"> | **Fuego del palo** (plantilla 9740). Tres fuegos del mismo palo: si no caen juntos, vuelven. | criatura | cuerpo 153: 5 cuadros de 72 × 54 | 4 direcciones × 6 cuadros de caminata, 64 × 64 |
| CC-18 | <img src="img/cuerpo-75.png"> | **Duende de la cueva** (plantilla 9741). Un duende que vive en los túneles. | criatura | cuerpo 75: 5 cuadros de 65 × 57 | 4 direcciones × 6 cuadros de caminata, 64 × 64 |

## 4. Minijefes y jefe

| Código | Actual | Qué es y qué hace | Hoy | Para el nuevo |
|---|---|---|---|---|
| CC-19 | <img src="img/cuerpo-159.png"><br><img src="../cueva/rodillo.png" width="240"> | **Ogro del Rodillo** (minijefe). Empuja un rodillo de púas de punta a punta de la sala; al llegar, salta al otro lado y lo empuja de vuelta. Se salta con la Pluma. | cuerpo 159: 5 cuadros de 128 × 107 | Caminata en 4 direcciones (6 cuadros), empujando el rodillo (4 cuadros) y el salto al otro lado (3 cuadros). El rodillo va aparte (ver Rodillo de púas). |
| CC-20 | <img src="../cueva/ciempies.png" width="240"> | **Ciempiés Colosal** (jefe). Da vueltas por la arena como el Moldorm: la cabeza, dos segmentos y la cola siguen el rastro de la cabeza. Solo siente los golpes en la cola. Hoy es "[LPC] Centipede" recortado en partes. | "[LPC] Centipede" (sprites/ciempies.png) recortado en cabeza, segmentos y cola; la criatura de AO no tiene cuerpo | Cuatro piezas vistas desde arriba que se giran por código: cabeza con tenazas (2 cuadros de mordida), segmento (2 cuadros de patas), cola con el punto débil (titila al recibir daño). Cada pieza 48 × 48, mirando hacia arriba. |

## 5. Efectos que se dibujan aparte

Lo que no es una baldosa, un objeto ni un cuerpo: lo dibuja el cliente (con formas o con sprites sueltos) en `frontend/components/game/engine/`.

| Código | Actual | Qué es y qué hace | Para el nuevo |
|---|---|---|---|
| CC-21 | <img src="../cueva/pluma.png" width="240"> | **El salto de la Pluma.** El personaje salta en arco por encima de un pozo, con su sombra en el piso; al caer levanta polvo. | Sombra ovalada (2 tamaños) y una nube de polvo al caer (4 cuadros, 32 × 16). Común a todas las mazmorras. |

## 6. Prompt para Claude Opus 5.5

Copiar entero y pegarlo en una sesión nueva de Claude Code abierta en el repo. Hace el arte de esta mazmorra; lo común sale del prompt de [00-COMUNES.md](00-COMUNES.md), que conviene correr antes.

```text
Sos un artista técnico de videojuegos y trabajás en el repo de WoAO (/Users/leandrobisceglie/AoWeb/aoweb): un MMORPG web (Next.js + PixiJS) basado en Argentum Online. Tiene una serie de 8 mazmorras PvE con la estructura de las de *The Legend of Zelda: Link's Awakening* (llaves, puertas que se cierran, puzzles, un ítem por mazmorra, minijefe y jefe).

Tu trabajo: rehacer de cero TODOS los gráficos de la mazmorra "Cueva de la Cola" (2 de 8; ítem: Pluma de Roc), para que se vea profesional y coherente. Hoy es una mezcla de gráficos de AO, paquetes libres de otros estilos y cosas dibujadas con formas por código. El inventario completo, con la imagen actual de cada cosa, está en docs/mazmorras/arte/02-CUEVA_DE_LA_COLA.md. Leelo entero antes de empezar y mirá cada imagen de referencia.

TEMA DE ESTA MAZMORRA
Una cueva de tierra con raíces que cuelgan del techo, piedras sueltas y musgo; antorchas en las paredes. Cálida y polvorienta.
Paleta: marrón tierra, ocre, verde musgo apagado y naranja de antorcha.

DIRECCIÓN DE ARTE (PARA TODAS LAS MAZMORRAS)
- Perspectiva y escala: vista desde arriba levemente inclinada (la de Argentum Online): se ve el frente de las paredes y el techo de los objetos. La baldosa mide 32 × 32 y un personaje humano mide 1,5 baldosas de alto.
- Estilo: pintado, con volumen y sombreado suave, que combine con los personajes y los mapas de AO. Nada de pixel art de 8 bits ni de formas planas.
- Luz: desde arriba a la izquierda, igual en todas las piezas. Cada cosa que toca el piso lleva una sombra de contacto suave.
- Contorno: oscuro y fino donde ayude a leer la forma contra el piso, no alrededor de todo.
- Paleta: una por mazmorra (la del tema), con un color de acento para lo interactivo (lo que se toca, se levanta o se abre) y rojo o naranja para lo peligroso.
- Legibilidad: lo que se puede usar se distingue del decorado a primera vista, y cada estado se distingue del otro (cerrado o abierto, apagado o encendido, entero o roto).
- Original: se toma la estructura de *Link's Awakening*, no su arte. Nada copiado de Nintendo ni de otros juegos. Si se parte de algo libre (CC0 o CC-BY), se anota el autor, la licencia y el enlace.

REGLAS TÉCNICAS (LAS DEL MOTOR DEL JUEGO)
- Archivos: PNG con transparencia (RGBA), sin fondo, sin halos claros alrededor y sin texto ni marcas de agua.
- Baldosas de piso: un bloque de 4 × 4 baldosas (128 × 128) que se repite sin costura en las dos direcciones; el juego elige la baldosa por la posición en el mapa.
- Paredes: un bloque de 4 × 4. Cada fila es la cara de la pared vista a 1, 2, 3 y 4 baldosas del piso (la última fila toca el piso). Tiene que repetirse sin costura a lo ancho.
- Agua y lava: bloque de 4 × 4 animado (4 cuadros en bucle, que empalmen).
- Objetos: una baldosa (32 × 32), anclados abajo al centro. Si son altos (estatuas, puertas, pilares), el dibujo puede subir (32 × 64, 32 × 96) o ensancharse (96 × 96 las puertas); la base sigue en la baldosa.
- Cuerpos (criaturas y jefes): una hoja por cuerpo, con 4 filas en este orden: mirando arriba, abajo, derecha e izquierda. Las columnas son los cuadros, todos de la misma medida. Mínimo 6 cuadros de caminata por dirección, que entren en bucle. Los pies van abajo al centro del cuadro: el juego lo apoya sobre la baldosa.
- Animaciones aparte (ataques, poses, efectos): una tira horizontal por animación, con cuadros de la misma medida.
- Numeración del juego: al día de este documento, el próximo grh libre es el 42484, el próximo archivo de gráficos el 330041 y el próximo cuerpo el 586. Verificalos antes de indexar.

LO QUE HAY QUE ENTREGAR (21 piezas, todas de esta mazmorra)
- [CC-01] Piso. Reemplaza: bloque de 4 × 4 desde el grh 8151. Qué hace: El piso de todas las salas. Entregar: Bloque de 4 × 4 (128 × 128) que se repite sin costura; con dos o tres variantes de baldosa sueltas (rajada, con musgo o arena) para romper la repetición. Referencia actual: docs/mazmorras/arte/img/piso-8151.png
- [CC-02] Pared. Reemplaza: bloque de 4 × 4 desde el grh 7812 (cada fila, a 1-4 baldosas del piso). Qué hace: El frente de las paredes; arriba de la cuarta fila se ve negro (el techo). Entregar: Bloque de 4 × 4: cada fila es la cara de la pared a 1, 2, 3 y 4 baldosas del piso, sin costura a lo ancho; y el techo (lo que hoy es negro) como bloque de 4 × 4 aparte. Referencia actual: docs/mazmorras/arte/img/pared-7812.png
- [CC-03] Pozo. Reemplaza: baldosa negra (grh 1). Qué hace: Caer saca vida y te devuelve a la entrada de la sala (o al piso de abajo). Se salta con la Pluma. Entregar: El pozo con su borde y profundidad: autotile de 47 piezas (o el juego de 16 de bordes y esquinas), 32 × 32. Referencia actual: (no tiene imagen: se dibuja por código)
- [CC-04] Escalera. Reemplaza: objetos 1198 (Escalera Grande, 32 × 96). Qué hace: Une las salas de distintos mapas o pisos (los atajos A, B, C… de Zelda). Se pisa y te lleva a la otra punta. Las de las salas que se cierran aparecen al vaciarlas. Entregar: una que baja y una que sube; la de la zambullida va bajo el agua y no se ve; 32 × 64 (ocupa una baldosa, el dibujo puede subir una más), anclada abajo. Referencia actual: docs/mazmorras/arte/img/familia-escalera.png
- [CC-05] Puerta (pared horizontal). Reemplaza: objetos 1834 (Puerta de piedra, 96 × 96); 1835 (Puerta de piedra abierta, 96 × 96). Qué hace: Hoy las puertas cerradas (con llave, del jefe, la persiana que abre la sala y el bloque cerradura) usan el mismo dibujo, y las abiertas o de un solo sentido, otro. En el nuevo cada tipo tiene que distinguirse a la vista. Entregar: común abierta y cerrada; con cerradura de llave chica; del jefe (cerradura grande); persiana (reja); de un solo sentido (con flecha); bloque cerradura; 96 × 96 como hoy (el arco ocupa la baldosa de la puerta y el muro de los costados), anclada abajo al centro. Referencia actual: docs/mazmorras/arte/img/familia-puerta.png
- [CC-06] Puerta (pared vertical). Reemplaza: objetos 1840 (Barrera de cristal, 32 × 32). Qué hace: Las puertas en las paredes de los costados. Hoy es un cristal que tapa el paso. Entregar: los mismos tipos que la horizontal, vistos de costado; abierta no se dibuja; 32 × 64, anclada abajo. Referencia actual: docs/mazmorras/arte/img/familia-barrera.png
- [CC-07] Rodillo de púas. Reemplaza: objetos 1851 (Rodillo de púas, 32 × 32). Qué hace: Lo empuja el Ogro del Rodillo de punta a punta de la sala. Se salta con la Pluma. Entregar: una pieza que se repite en columna; opcional: 2 cuadros de giro; 32 × 32 por pieza. Referencia actual: docs/mazmorras/arte/img/familia-rodillo.png
- [CC-08] Esqueleto (criatura). Reemplaza: cuerpo 12: 5 cuadros de 53 × 70 (plantilla 503). Qué hace: Un esqueleto con espada. Entregar: 4 direcciones × 6 cuadros de caminata, 64 × 64. Referencia actual: docs/mazmorras/arte/img/cuerpo-12.png
- [CC-09] Murciélago (criatura). Reemplaza: cuerpo 9: 5 cuadros de 59 × 64 (plantilla 566). Qué hace: Un murciélago que vuela en zigzag. Entregar: 4 direcciones × 6 cuadros de caminata, 64 × 64. Referencia actual: docs/mazmorras/arte/img/cuerpo-9.png
- [CC-10] Estatua guardiana (criatura). Reemplaza: cuerpo 141: 5 cuadros de 165 × 144 (plantilla 9730). Qué hace: Una estatua de piedra. Parece que te mira. Entregar: 4 direcciones × 6 cuadros de caminata, 128 × 128. Referencia actual: docs/mazmorras/arte/img/cuerpo-141.png
- [CC-11] Escarabajo (criatura). Reemplaza: cuerpo 74: 6 cuadros de 64 × 64 (plantilla 9734). Qué hace: Un escarabajo de caparazón duro: te empuja. Entregar: 4 direcciones × 6 cuadros de caminata, 64 × 64. Referencia actual: docs/mazmorras/arte/img/cuerpo-74.png
- [CC-12] Babosa (criatura). Reemplaza: cuerpo 412: 4 cuadros de 90 × 60 (plantilla 9735). Qué hace: Una babosa negra que se arrastra por la cueva. Entregar: 4 direcciones × 6 cuadros de caminata, 96 × 96. Referencia actual: docs/mazmorras/arte/img/cuerpo-412.png
- [CC-13] Chispa (criatura, trampa). Reemplaza: cuerpo 413: 10 cuadros de 80 × 60 (plantilla 9736). Qué hace: Una chispa que da vueltas y quema al que toca. Entregar: 4 direcciones × 4 cuadros (si gira o se mueve), 48 × 48. Referencia actual: docs/mazmorras/arte/img/cuerpo-413.png
- [CC-14] Cuchilla (criatura, trampa). Reemplaza: cuerpo 244: 2 cuadros de 75 × 75 (plantilla 9737). Qué hace: Una trampa de cuchillas: sale disparada si te ve en su fila. Entregar: 4 direcciones × 4 cuadros (si gira o se mueve), 48 × 48. Referencia actual: docs/mazmorras/arte/img/cuerpo-244.png
- [CC-15] Escarabajo de púas (criatura). Reemplaza: cuerpo 51: 5 cuadros de 50 × 40 (plantilla 9738). Qué hace: Un escarabajo cubierto de púas. Entregar: 4 direcciones × 6 cuadros de caminata, 64 × 64. Referencia actual: docs/mazmorras/arte/img/cuerpo-51.png
- [CC-16] Mini gusano (criatura). Reemplaza: cuerpo 375: 5 cuadros de 64 × 42 (plantilla 9739). Qué hace: Un gusano anillado que se mueve rápido. Entregar: 4 direcciones × 6 cuadros de caminata, 64 × 64. Referencia actual: docs/mazmorras/arte/img/cuerpo-375.png
- [CC-17] Fuego del palo (criatura). Reemplaza: cuerpo 153: 5 cuadros de 72 × 54 (plantilla 9740). Qué hace: Tres fuegos del mismo palo: si no caen juntos, vuelven. Entregar: 4 direcciones × 6 cuadros de caminata, 64 × 64. Referencia actual: docs/mazmorras/arte/img/cuerpo-153.png
- [CC-18] Duende de la cueva (criatura). Reemplaza: cuerpo 75: 5 cuadros de 65 × 57 (plantilla 9741). Qué hace: Un duende que vive en los túneles. Entregar: 4 direcciones × 6 cuadros de caminata, 64 × 64. Referencia actual: docs/mazmorras/arte/img/cuerpo-75.png
- [CC-19] Ogro del Rodillo (minijefe). Reemplaza: cuerpo 159: 5 cuadros de 128 × 107. Qué hace: Empuja un rodillo de púas de punta a punta de la sala; al llegar, salta al otro lado y lo empuja de vuelta. Se salta con la Pluma. Entregar: Caminata en 4 direcciones (6 cuadros), empujando el rodillo (4 cuadros) y el salto al otro lado (3 cuadros). El rodillo va aparte (ver Rodillo de púas). Referencia actual: docs/mazmorras/arte/img/cuerpo-159.png
- [CC-20] Ciempiés Colosal (jefe). Reemplaza: "[LPC] Centipede" (sprites/ciempies.png) recortado en cabeza, segmentos y cola; la criatura de AO no tiene cuerpo. Qué hace: Da vueltas por la arena como el Moldorm: la cabeza, dos segmentos y la cola siguen el rastro de la cabeza. Solo siente los golpes en la cola. Hoy es "[LPC] Centipede" recortado en partes. Entregar: Cuatro piezas vistas desde arriba que se giran por código: cabeza con tenazas (2 cuadros de mordida), segmento (2 cuadros de patas), cola con el punto débil (titila al recibir daño). Cada pieza 48 × 48, mirando hacia arriba. Referencia actual: docs/mazmorras/cueva/ciempies.png
- [CC-21] El salto de la Pluma. Reemplaza: lo que hoy dibuja el cliente. Qué hace: El personaje salta en arco por encima de un pozo, con su sombra en el piso; al caer levanta polvo. Entregar: Sombra ovalada (2 tamaños) y una nube de polvo al caer (4 cuadros, 32 × 16). Común a todas las mazmorras. Referencia actual: docs/mazmorras/cueva/pluma.png

Lo común a todas las mazmorras (cofres, placas, escaleras, portal, búho, bloques y cristales de color, vasijas y piedras, herramientas e íconos) NO va en este trabajo: sale del prompt de docs/mazmorras/arte/00-COMUNES.md. Esta mazmorra usa estos: CO-01 Portal, CO-02 Cofre, CO-03 Cofre del jefe, CO-04 Bloque que se empuja, CO-05 Placa (botón del piso), CO-06 Losa de piedra. Tus piezas tienen que combinar con ellos (si ya existen, miralos; si no, respetá la dirección de arte de arriba).

CÓMO TRABAJAR
1. Primero, una hoja de estilo: la paleta, el piso, la pared, una puerta y una criatura de esta mazmorra, apoyados sobre el piso nuevo. Mostrala y esperá la aprobación de Leandro antes de seguir.
2. Después, el resto, en este orden: baldosas, puertas y mecánicas, criaturas, minijefes y jefe, efectos.
3. Revisá cada pieza a tamaño real (1×) y al doble sobre el piso de la mazmorra, y al lado de un personaje de AO para la escala.
4. Si tenés una herramienta de generación de imágenes, usala con estas especificaciones y después llevá cada pieza a la grilla exacta (medida, transparencia, cuadros alineados) con un script. Si no, dibujalo por código (Python con Pillow) cuidando la calidad: volumen, luz y sombra, no formas planas.

QUÉ ENTREGAR
- Una carpeta arte/mazmorras/cueva/ con un PNG por pieza, con el código como nombre (por ejemplo CC-01.png).
- arte/mazmorras/cueva/manifest.json con una entrada por pieza: código, archivo, qué reemplaza, medida del cuadro, cantidad de cuadros, filas o direcciones, ancla, velocidad de la animación (ms por cuadro) y origen (propio, o autor + licencia + enlace).
- arte/mazmorras/cueva/preview.png: una hoja de contacto con todas las piezas sobre el piso de la mazmorra, con su código abajo.

CÓMO ENTRA AL JUEGO (SOLO DESPUÉS DE QUE LEANDRO APRUEBE EL ARTE)
1. Cada hoja va a `frontend/public/graphics/<archivo>.png`, numeradas desde el próximo archivo libre.
2. Cada cuadro es un grh. Se agrega como texto al final de `frontend/public/init/graficos.json` y `graficos_optimized.json`, sin reescribir los JSON:
   - estático: `"<grh>":{"numFrames":1,"numFile":<archivo>,"sX":<x>,"sY":<y>,"width":<w>,"height":<h>,"frames":{"1":<grh>}}` y, en el optimizado, `"<grh>":[<archivo>,<x>,<y>,<w>,<h>]`;
   - animado: `"<grh>":{"numFrames":<n>,"frames":{"1":<g1>,"2":<g2>,…},"speed":<ms>}` y `"<grh>":{"f":<n>,"r":[<g1>,<g2>,…],"s":<ms>}`.
3. Cada cuerpo se agrega a `frontend/public/init/bodies.json`: `"<cuerpo>":{"1":<grh arriba>,"2":<grh abajo>,"3":<grh derecha>,"4":<grh izquierda>,"headOffsetX":0,"headOffsetY":0}`. El cuerpo de cada criatura se cambia con `idBody` en su plantilla de `server/mazmorras/<mazmorra>/leyenda.json`.
4. Los objetos del mapa toman su grh de `DUNGEON_OBJECTS` en `server/src/scripts/buildDungeonMaps.ts`, y las baldosas de piso y pared, de `graficos` en `leyenda.json`. Después se regeneran los mapas con `pnpm --dir server exec tsx src/scripts/buildDungeonMaps.ts <mazmorra>`.
5. Lo que hoy se dibuja con formas o con sprites sueltos vive en `frontend/components/game/engine/` (el módulo de cada mazmorra; ver la tabla de efectos). Ahí se cargan las hojas nuevas.
6. Se sube la versión de las cachés en `frontend/utils/gameLoader.ts` (graficos, bodies, objs y npcs) para que los jugadores bajen lo nuevo.
7. Se prueba en vivo y se sacan capturas de cada cosa, comparadas con la imagen actual de este documento.

CRITERIOS PARA DAR UNA PIEZA POR TERMINADA
- Tiene la medida, los cuadros, el orden de las direcciones y el ancla pedidos.
- Se lee a 1× sobre el piso de la mazmorra: se entiende qué es y en qué estado está.
- Combina con el resto de la mazmorra y con los personajes de AO: misma luz, misma escala, misma paleta.
- Las animaciones entran en bucle sin saltos, y los bloques de piso, pared, agua y lava se repiten sin costura.
- Es arte original, o tiene anotado el origen y la licencia en el manifest.
```
