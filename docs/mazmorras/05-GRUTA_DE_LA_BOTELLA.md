# Gruta de la Botella

Fecha: 2026-10-27. Estado: **diseño, para confirmar**. El sistema (instancias, grupo, ítems de mazmorra, mecánicas) está en [../MAZMORRAS.md](../MAZMORRAS.md); el patrón de la serie, en [00-PATRON_LINKS_AWAKENING.md](00-PATRON_LINKS_AWAKENING.md).

**Lugar en la serie: a definir.** Leandro pasa las mazmorras sin orden y el orden se decide cuando estén todas. Esta da el **Brazalete de Fuerza** (la *Power Bracelet*), que ya está hecho; la Roca de la Tortuga lo pide. Usa la **Pluma de Roc** (Cueva de la Cola), las bombas y el arco (los básicos) y, como en el original, el **Polvo mágico** para las antorchas (sección 6.2). En el original es la segunda.

Adaptación de la **Gruta de la Botella** (*Bottle Grotto*), el nivel 2 de *Link's Awakening*. No se copia baldosa por baldosa; se respeta la estructura jugable:
- **Arranque:** dos antorchas que se encienden con el polvo abren el camino.
- **Primera parte, sin el ítem:** cuatro llaves chicas, la brújula y el pico de piedra, entre esqueletos, imitadores y cristales que suben y bajan bloques azules en toda la mazmorra.
- **Hacia el ítem:**
  - un pasaje lleva al **Cíclope** (el Hinox), que abre un portal a la entrada;
  - de ahí se sube a la fila de arriba y, en una sala oscura, dos fantasmas guardan el **Brazalete de Fuerza**.
- **Con el Brazalete:**
  - se levantan las vasijas que tapan pasillos y escaleras;
  - se mata a los orejudos a vasijazos;
  - se baja una plataforma cargando algo;
  - se llega a la **llave del jefe** matando en orden;
  - y se pelea con el **Genio de la Botella**: su botella se levanta y se estrella contra la pared.

![Plano de la Gruta de la Botella](05-gruta-de-la-botella.png)

## 1. Cómo funciona el original

Lo leímos con el mapa del pedido y lo cruzamos con el código del juego (el desensamblado [zladx/LADX-Disassembly](https://github.com/zladx/LADX-Disassembly): grilla, cofres, enemigos y eventos de cada sala), la lógica del randomizer [LADXR](https://github.com/daid/LADXR/blob/master/logic/dungeon2.py) y varias guías. Es una grilla de 6 × 7 celdas con tres pasajes de costado en el medio.

- **Fila de abajo y la de arriba de ella, sin el ítem:**
  - **Entrada:** vasijas (una tapa un cofre de 50 rupias, que se saca al final) y un teletransportador que se activa al vencer al Hinox.
  - **Al norte, una sala oscura:** se prenden dos antorchas con polvo mágico y se abre el este.
  - **Esqueletos (llave 1)** y un imitador que guarda la **brújula**.
  - **Un cristal:** al golpearlo suben y bajan los **bloques azules de toda la mazmorra**. Detrás, un anillo de bloques azules con la **llave 2**.
  - Las salas oscuras de las cuchillas y del **pico de piedra** (detrás de pozos, con la pluma).
  - **Un botón** que hace aparecer la **llave 3** y dos imitadores con la **llave 4** (cae en un nicho al que se llega dando la vuelta).
  - Una sala con dos bloques para juntar: abre la escalera al **pasaje A-B** (pinchos y plataformas, con la pluma).
- **El Hinox:**
  - El pasaje sale a una sala oscura con una isla y, por una puerta de un solo sentido, al **Hinox**.
  - Al vencerlo se activa el teletransportador.
  - Siguen las estatuas (búho y escalera C entre vasijas), el **mapa** (con una "aspiradora" que te devuelve a la entrada), 20 rupias y la sala oscura de los fantasmas (Boo Buddies).
  - Esos fantasmas no reciben daño hasta encender una antorcha. Al vencerlos aparece la **Power Bracelet**.
- **Con la pulsera:**
  - **Fila de arriba:** se levantan las vasijas que tapan el pasillo. Siguen el cristal norte (**llave 5**), los pozos y el cristal del nicho.
  - **Sala de 20 vasijas:** dos Pols Voice, que solo mueren con algo tirado; al vencerlos aparece la escalera E.
  - **Sala de matar en orden:** un Pols Voice preso, un murciélago y un esqueleto. Matados en ese orden, aparece la **llave de la Pesadilla**.
- **El final:**
  - El **pasaje E-F** tiene dos plataformas de peso: la segunda solo baja si Link carga algo.
  - Lleva a un puente con dos huecos (con la pluma) y a la puerta del jefe.
  - El **Genie** sale de su botella, que hay que aturdir, levantar y estrellar tres veces contra la pared.
- **Contenido:**
  - 5 llaves chicas y 5 puertas con llave, más la llave de la Pesadilla;
  - mapa, brújula y pico de piedra;
  - 50 rupias y 20 rupias. El mapa del pedido dice 200: la versión de Game Boy y la DX difieren en esto;
  - la pulsera y las escaleras A-F.

## 2. Mapas de AO

| Mapa | Nombre | Qué entra |
|---|---|---|
| **550** | Gruta de la Botella | La grilla del original en un mapa: 6 × 7 celdas de 16 × 12 baldosas (91 × 78), con 24 salas. Las celdas vacías, las de los pasajes y las del jefe son roca |
| **551** | Pasajes | Los 3 pasajes de costado, como túneles vistos desde arriba |
| **552** | Guarida del Genio | La sala del jefe y la del trofeo. Va aparte por el combate de hasta 5 jugadores |

- **Salas de 16 × 12,** como en la Cueva de la Cola: la grilla entra en un mapa y el mapa grande de la Mochila la muestra entera.
- **Gráficos (propuesta):** piso de baldosas claras y paredes de piedra con musgo, para diferenciarla de las otras cuatro. Las vasijas, los cristales, los bloques azules y las antorchas son los objetos de mazmorra que ya existen o que se suman en el PR de mecánicas.

## 3. Salas

Celdas (columna, fila) desde arriba a la izquierda, de 0 a 5 y de 0 a 6. El número de sector es el del pedido (sección 9).

### Mapa 550

**Abajo** (sin el Brazalete)
| Sala | Celda | Sector | Contenido | Criaturas | Trampas |
|---|---|---|---|---|---|
| Entrada | (1,6) | 1 | Aparecés acá; portal de salida; **portal-atajo** al Cíclope (al vencerlo); cofre de **50 de oro** tapado por vasijas (Brazalete) | — | Vasijas |
| Antorchas | (1,5) | 1 | Dos antorchas apagadas: encendidas con el **polvo**, se abre el este. Puerta con llave al oeste | Chispa | Oscura |
| Esqueletos | (2,5) | 2 | **K1** al vaciarla. Puerta con llave al sur | 2 esqueletos | — |
| Brújula | (2,6) | 9 | **Brújula** al vencer al imitador; vasijas | Imitador | — |
| Cristal central | (3,5) | 2 | **Cristal**: sube y baja los bloques azules de toda la mazmorra. Búho ("parte del piso está levantada: tocá el cristal azul") | Chispa | Bloques azules |
| Anillo azul | (3,6) | 2 | **K2** en un cofre dentro de un anillo de bloques azules, con su propio cristal adentro (se golpea a distancia) | Esqueleto | Bloques azules |
| Botón | (4,6) | 7 | Pisar el **botón** hace aparecer el cofre de la **K3**. Cristal | Murciélago | Pozos (pluma), bloques azules |
| Imitadores | (4,5) | 7 | Al vencerlos cae la **K4** en un nicho del oeste, al que se llega por el Cristal central | 2 imitadores | — |
| Escarabajos | (5,5) | 7 | Puerta con llave al norte | 2 escarabajos de púas | — |
| Bloques | (5,4) | 7 | Juntar los dos bloques sobre las baldosas marcadas hace aparecer la **escalera A**. Búho ("dejá todos los dibujos iguales") | Chispa | Vasijas |
| Cuchillas | (0,5) | 6 | Se cierra hasta matar a los murciélagos | 2 murciélagos | Oscura, 4 cuchillas |
| Pico de piedra | (0,4) | 8 | **Pico de piedra** detrás de una fila de pozos (pluma). Se cierra hasta tirar al escarabajo al pozo | Escarabajo que se empuja | Oscura, pozos |

**Izquierda y medio** (camino al Brazalete)
| Sala | Celda | Sector | Contenido | Criaturas | Trampas |
|---|---|---|---|---|---|
| Isla oscura | (0,3) | 6 | Llega la **escalera B**. Una isla con un corazón (vida), saltando; al norte, puerta de un solo sentido | Murciélago, chispa | Oscura, pozos |
| Cíclope | (0,2) | 10 | **Minijefe: Cíclope** (el Hinox). Al vencerlo se abre el este y aparece el **portal-atajo** a la Entrada | Minijefe | Se cierra |
| Estatuas | (1,2) | 8 | Búho ("primero, el orejudo preso; al final, el esqueleto"), entre pozos; **escalera C** rodeada de vasijas (Brazalete) | 2 murciélagos | Pozos (pluma) |
| Mapa y remolino | (1,1) | 9 | **Mapa**; **remolino** que te lleva a la Entrada | 3 murciélagos | Pozos |
| Vasijas y pozos | (1,0) | 5 | Cofre de **200 de oro**. Al este, cuatro vasijas tapan el pasillo (Brazalete). Puerta con llave al oeste | 2 murciélagos | Pozos |
| Fantasmas | (0,0) | 4 | **Brazalete de Fuerza**: el cofre aparece al vencer a los dos fantasmas, que no reciben daño mientras la sala esté a oscuras. Hay que encender una antorcha (polvo, Polvo de Fuego o una flecha) | 2 fantasmas | Oscura |

**Arriba y el final** (con el Brazalete)
| Sala | Celda | Sector | Contenido | Criaturas | Trampas |
|---|---|---|---|---|---|
| Cristal norte | (2,0) | 3 | **K5** arriba; cristal entre bloques fijos; vasijas con vida abajo | — | Pozos, bloques azules |
| Pozos azules | (3,0) | 3 | Paso entre pozos y bloques azules | Escarabajo que se empuja, babosa, murciélago | Pozos |
| Cristal del nicho | (4,0) | 3 | Cristal en un nicho; puerta con llave al este; al sur, Matar en orden | 4 murciélagos, esqueleto | — |
| Veinte vasijas | (5,0) | 11 | Una columna de vasijas tapa la entrada; al vencer a los dos orejudos (a vasijazos) aparece la **escalera E**. Debajo de una vasija hay un hada | 2 orejudos, babosa que se parte | Se cierra |
| Matar en orden | (4,1) | 11 | Un orejudo preso en un corral (se empuja un bloque y se le tira una vasija), un murciélago y un esqueleto: **matados en ese orden**, aparece el cofre de la **llave del jefe**. **Escalera D** | Orejudo, murciélago, esqueleto | — |
| Puente | (5,3) | 11 | Llega la **escalera F**. Puente sobre un foso con dos huecos de una baldosa (pluma) hasta la **puerta del jefe** | — | Pozos |

### Mapa 551 (Pasajes)
| Pasaje | Une | Contenido | Hace falta |
|---|---|---|---|
| A → B | Bloques → Isla oscura | Pinchos en el piso y plataformas, saltando | Pluma |
| C ↔ D | Estatuas ↔ Matar en orden | Plantas carnívoras y criaturas | Pluma (y el Brazalete para llegar a la C) |
| E → F | Veinte vasijas → Puente | **Dos placas de peso**: la primera baja con cualquiera; la segunda, solo si el que la pisa **carga algo** con el Brazalete (hay vasijas en el pasaje) | Brazalete |

### Mapa 552 (Guarida del Genio)
| Sala | Sector | Contenido |
|---|---|---|
| Guarida | 11 | Sala de unas 20 × 15. **Jefe: Genio de la Botella** (sección 6.1) |
| Sala del trofeo | 11 | Cofre del jefe (trofeo y oro, una vez por día) y portal de salida |

## 4. Recorrido

1. **Abajo, sin el Brazalete** (K1 a K4, brújula, pico):
   - Entrada → Antorchas (encender las dos con el polvo) → Esqueletos (**K1**) → Brújula (**L**: **brújula**) y Cristal central (golpear el cristal).
   - Anillo azul (golpear su cristal: **K2**) → Botón (**K3**) → Imitadores (la **K4** cae en el nicho; se busca por el Cristal central).
   - Antorchas → Cuchillas (**L**) → Pico de piedra (tirar al escarabajo al pozo y saltar: **pico**).
   - Escarabajos → Bloques (**L**: juntar los bloques, **escalera A**).
2. **El Cíclope y el camino al Brazalete:**
   - Escalera A → pasaje → Isla oscura → (un solo sentido) **Cíclope**. Al vencerlo queda el portal-atajo a la Entrada.
   - Estatuas → (saltando) Mapa y remolino (**mapa**) → Vasijas y pozos (**200 de oro**) → Fantasmas (**L**: encender una antorcha y vencerlos) → **Brazalete de Fuerza**.
3. **Con el Brazalete** (K5 y llave del jefe):
   - Vasijas y pozos: levantar las vasijas → Cristal norte (**K5**) → Pozos azules → Cristal del nicho → Veinte vasijas (**L**: vasijazos a los orejudos, **escalera E**).
   - Cristal del nicho → Matar en orden: el orejudo, el murciélago y el esqueleto → **llave del jefe**. La escalera D y las vasijas de las Estatuas (C) son el atajo de vuelta.
4. **El final:**
   - Escalera E → pasaje: la segunda placa baja cargando una vasija → Puente (saltar los dos huecos) → **puerta del jefe** → Guarida.
   - Después vale la pena volver por el cofre de 50 de oro de la Entrada.

**No hay forma de trabarse:**
- Antes del Brazalete hay cuatro llaves (K1-K4) para las cuatro cerraduras de abajo y la de los Fantasmas. Una llave chica abre cualquier cerradura.
- La K5 sale después del Brazalete, para la de Veinte vasijas.
- Si alguien sube los bloques azules de más, alcanza con volver a golpear un cristal.

## 5. Ubicaciones

### Llaves y cerraduras
| Llave | Dónde | Cómo |
|---|---|---|
| K1 | Esqueletos | Vaciar la sala |
| K2 | Anillo azul | Bajar el anillo golpeando su cristal |
| K3 | Botón | Pisar el botón |
| K4 | Imitadores | Vencerlos; cae en el nicho |
| K5 | Cristal norte | Con el Brazalete |
| Llave del jefe | Matar en orden | El orejudo, el murciélago y el esqueleto, en ese orden |

Cerraduras: Esqueletos → Brújula, Antorchas → Cuchillas, Escarabajos → Bloques, Vasijas y pozos → Fantasmas, Cristal del nicho → Veinte vasijas. La puerta del jefe está en el Puente.

### Escaleras (los warps) y portales
| Letra | Une | Para qué |
|---|---|---|
| A → B | Bloques → Isla oscura | El camino al Cíclope; la A aparece al juntar los bloques |
| C ↔ D | Estatuas ↔ Matar en orden | Atajo entre el medio y la fila de arriba |
| E → F | Veinte vasijas → Puente | El jefe; la E aparece al vencer a los orejudos |
| Portal | Entrada ↔ Cíclope | Atajo; aparece al vencerlo |
| Remolino | Mapa y remolino → Entrada | Atajo de un solo sentido |

### Recompensas
- **Principal: Brazalete de Fuerza** (sección 6), en Fantasmas.
- **Secundarias:**
  - mapa, brújula y pico de piedra;
  - **200 de oro** (Vasijas y pozos) y **50 de oro** (la Entrada, detrás de las vasijas);
  - vida en la Isla y en las vasijas.
- **Del jefe:** el trofeo de la serie (propuesta: **Lámpara del Genio**; en el original, la Caracola, *Conch Horn*) y oro, una vez por día por personaje.

### Minijefe y jefe

![Cuerpos de AO propuestos: Genio, Cíclope y Fantasma](jefes/gruta-de-la-botella.png)

No hace falta ningún sprite nuevo de jefe: AO tiene un **Genio azul** (NPC 130) casi igual al de Zelda. Falta solo la **botella**, que se busca o se indexa al armar al jefe.

- **Minijefe: Cíclope** (el Hinox), en Cíclope, con el cuerpo del Cíclope de AO (582). Es el mismo Cíclope de la revancha en la Roca de la Tortuga. Sale del código del original (`06_hinox.asm`):
  - **Movimiento:** camina en direcciones al azar (una de cada cuatro, hacia vos), se para y, de vez en cuando, **embiste**.
  - **Agarre:** si la embestida te alcanza, te **levanta**, te **tira** contra el centro de la sala y te deja aturdido un momento.
  - **Represalia:** cada vez que recibe un golpe, se frena y **te tira una bomba**.
  - **Al vencerlo:** se abre el paso a las Estatuas y aparece el portal-atajo.
- **Jefe: Genio de la Botella**, en la Guarida (552), con el cuerpo del Genio (130). Cómo se pelea, en la sección 6.1.

### Trampas
| Tipo | Dónde | Rol (igual que en Zelda) |
|---|---|---|
| Salas oscuras | Antorchas, Cuchillas, Pico de piedra, Isla oscura, Fantasmas | Avanzar viendo poco; las antorchas iluminan |
| Antorchas | Antorchas (abren el este), Fantasmas (vuelven vulnerables a los fantasmas), Isla oscura | El polvo como llave |
| Cristales y bloques azules | Cristal central, Anillo azul, Botón, Cristal norte, Cristal del nicho | Puzzle de toda la mazmorra: cada cristal invierte los bloques |
| Pozos | Vasijas y pozos, Cristal norte, Pozos azules, Mapa y remolino, Estatuas, Isla oscura, Puente, Pico de piedra, Botón | Saltar con la pluma |
| Vasijas | Entrada, Vasijas y pozos, Estatuas, Veinte vasijas, Matar en orden, pasaje E-F | Lo que abre el Brazalete |
| Cuchillas | Cuchillas | Las de la Cueva |
| Remolino | Mapa y remolino | Te arrastra; si llegás al centro, volvés a la Entrada |
| Botón y bloques | Botón, Bloques | Cofre y escalera que aparecen |
| Salas que se cierran | Cuchillas, Pico de piedra, Cíclope, Veinte vasijas | Combate obligatorio |
| Placas de peso | Pasaje E-F | La segunda solo baja cargando algo |

### Criaturas
Plantillas nuevas con cuerpos de AO, con los roles del original:
- **De presión:** murciélagos, chispas, babosas que se parten y escarabajos de púas.
- **Guardianes:** esqueletos (dos con espada) e **imitadores**, que se mueven al revés que vos (los mismos de la Roca de la Tortuga).
- **Fantasmas** (los Boo Buddies, cuerpo del Fantasma 607): no reciben daño mientras la sala está a oscuras; con una antorcha encendida se vuelven débiles y escapan.
- **Orejudos** (los Pols Voice): no les entran golpes ni hechizos; mueren con algo tirado con el Brazalete, con bombas o con flechas.
- **Escarabajo que se empuja:** no se lo puede matar; cada golpe lo corre una baldosa, y en un pozo, cae.

Pasean en 3 × 3 cuando no persiguen a nadie, y la dificultad escala con el tamaño del grupo, como en las otras.

## 6. El ítem: Brazalete de Fuerza

**Ya está hecho** (PR del Brazalete y el Escudo Espejo): es la Pulsera de Zelda.
- **Qué hace:** levanta lo que tiene adelante (vasijas y piedras), lo lleva sobre la cabeza y lo tira hasta 4 baldosas. Lo que tapaba queda a la vista.
- **No toca la fuerza del personaje:** el hechizo Fuerza es parte del meta de AO (pedido de Leandro). El Brazalete de Fuerza II, de otra mazmorra, además levanta las piedras pesadas.
- **Usos en esta mazmorra:**
  - **Abrir paso:** las vasijas de Vasijas y pozos (la fila de arriba), las de las Estatuas (la escalera C) y la columna de Veinte vasijas.
  - **Matar a los orejudos:** solo mueren con algo tirado o con bombas o flechas. Los de Veinte vasijas abren la escalera E y el de Matar en orden la llave del jefe.
  - **Cargar algo** para que baje la segunda placa del pasaje E-F: el camino al jefe.
  - **Contra el jefe:** levantar la botella aturdida del Genio y estrellarla contra la pared.
  - **Recompensas:** el cofre de 50 de oro de la Entrada y las vasijas con vida.
- **Uso real:** sin el Brazalete no se llega a la llave del jefe, al jefe ni a la segunda mitad.

### 6.1 Cómo se pelea el Genio de la Botella (Genie)

Lo sacamos del código del original (`04_genie.asm`):

| En el original | En AO |
|---|---|
| La botella salta hacia el centro; a los ~4 s sale el Genio en una nube de humo | Igual |
| El Genio flota y es **invulnerable** mientras tiene la botella | Igual. Avisa: "¡No me podés lastimar mientras tenga mi botella!" |
| Tira **8 bolas de fuego** apuntadas, alternando las manos, en arco (una cada ~0,8 s) | Igual. Las bolas las frena el **Escudo Espejo** si llegan de frente |
| Vuelve a la botella, que **persigue a saltos** | Igual |
| Un golpe de espada **aturde la botella** ~3 s (tiembla al final) | Un golpe cualquiera la aturde ~3 s |
| Aturdida, se la **levanta con la pulsera** y se la tira contra una pared: **3 impactos** la rompen | Igual, con el Brazalete. En grupo, cualquiera puede levantarla |
| Fase 2: sin botella, el Genio persigue; cada golpe lo hace huir ~2 s, a veces reaparece del otro lado y tira una bola de fuego. Vida: 8 | Igual, con la vida escalada para hasta 5 jugadores |
| Al morir cae el contenedor de corazón | Se abre la sala del trofeo |

- **Cómo se dibuja:** el Genio es una criatura de AO, con la botella dibujada aparte (un objeto que salta y que el Brazalete levanta).
- **Pista del búho:** "Aturdí la botella y estrellala contra la pared."

### 6.2 El Polvo mágico (propuesta de un tercer básico)

En el original la segunda sala pide **encender dos antorchas con el polvo mágico**, que en Zelda se consigue afuera, como las bombas. Acá el fuego es el **Polvo de Fuego**, pero lo da la Roca de la Tortuga, y la Roca pide el Brazalete que da esta mazmorra: si las antorchas pidieran el Polvo de Fuego, ninguna de las dos se podría terminar.

**Propuesta: el Polvo mágico como tercer básico,** que tiene todo el mundo desde la primera mazmorra, como las bombas y el arco:
- **Qué hace:** espolvorea la baldosa de adelante, con alcance 1. Enciende antorchas y le saca un poco a la criatura que toque.
- **El Polvo de Fuego** de la Roca sigue siendo el fuerte: llamarada a distancia, derrite hielo y es la única forma de apagar a la Cabeza Ardiente.

## 7. Qué cambia respecto del original

| En el original | Acá |
|---|---|
| Polvo mágico | Un básico nuevo (sección 6.2) |
| Espada | Cualquier golpe o hechizo (los cristales, la botella del Genio) |
| Estatuas búho y pico de piedra | Igual: los búhos de la Roca de la Tortuga |
| Corazones flotantes | Vida que se agarra saltando |
| Plataformas móviles de los pasajes | Islas y saltos con la pluma |
| Teletransportador del Hinox | El portal-atajo de la Cueva |
| Aspiradora | El remolino de la Roca de la Tortuga |

## 8. Mecánicas que necesita

**Ya hechas:**
- llaves, salas que se cierran, pozos, placas, bloques, cofres y escaleras que aparecen, puertas de un solo sentido, portal-atajo;
- chispas, cuchillas, criaturas que se parten y losas;
- el salto, las bombas, el arco y el Brazalete.

**Compartidas con la Roca de la Tortuga** (van en el mismo PR de mecánicas):

| Mecánica | Para qué |
|---|---|
| Salas oscuras y antorchas | Se ve poco hasta encender las antorchas de la sala |
| Cristales y bloques de color | Golpear un cristal sube o baja los bloques de toda la corrida (azules acá, naranjas en la Roca) |
| Remolino | Arrastra hacia el centro; el centro lleva a la Entrada |
| Imitadores | Criaturas que se mueven al revés que el jugador más cercano |
| Pico de piedra y búhos | Sin el pico, los búhos no hablan |

**Nuevas:**

| Mecánica | Para qué |
|---|---|
| Polvo mágico | El tercer básico (sección 6.2) |
| Fantasmas | Invulnerables a oscuras; débiles con una antorcha encendida |
| Orejudos | Solo mueren con algo tirado, bombas o flechas |
| Escarabajo que se empuja | Cada golpe lo corre; en un pozo, cae |
| Matar en orden | Si se mata fuera de orden, reviven; en orden, aparece el cofre |
| Bloques que abren una escalera | Dos bloques sobre baldosas marcadas hacen aparecer la escalera A |
| Placa de peso | Solo se aprieta si el que la pisa carga algo con el Brazalete |
| Cíclope | Embestida, agarre y tiro al centro, bombas al recibir golpes |
| Genio de la Botella | La botella que salta, se aturde, se levanta y se estrella; las dos fases |

## 9. Los 11 sectores del pedido

| Sector del pedido | Dónde queda |
|---|---|
| 1. Entrada / hub inicial | Entrada (vasijas, portal-atajo) y Antorchas: la lógica de la mazmorra (antorchas y bloqueos físicos) desde la primera sala |
| 2. Sector central principal | Esqueletos, Cristal central y Anillo azul: el cristal cambia los bloques de toda la mazmorra y es el punto al que se vuelve |
| 3. Rama superior de exploración | La fila de arriba: Cristal norte, Pozos azules y Cristal del nicho |
| 4. Sector del ítem principal | Fantasmas: la sala oscura con el Brazalete, a mitad de mazmorra |
| 5. Puzzle con fuerza | Las vasijas que tapan paso, los orejudos a vasijazos, la escalera C y la placa de peso del pasaje E-F |
| 6. Rama izquierda secundaria | Cuchillas, Pico de piedra e Isla oscura |
| 7. Rama derecha de progresión | Botón (K3), Imitadores (K4), Escarabajos y Bloques (escalera A) |
| 8. Lore / pista | Pico de piedra y los búhos (Cristal central, Bloques y Estatuas) |
| 9. Reward secundaria | Brújula, Mapa, 200 y 50 de oro |
| 10. Encuentro importante | Cíclope: abre el camino al Brazalete y el portal-atajo |
| 11. Tramo final | Veinte vasijas, Matar en orden (llave del jefe), el pasaje E-F, el Puente y la Guarida |

## 10. Cómo se construye

Muchas mecánicas son las mismas que pide la Roca de la Tortuga, así que se arman juntas:
1. **Mecánicas compartidas** (un PR para las dos mazmorras):
   - salas oscuras y antorchas;
   - cristales y bloques de color;
   - remolino, imitadores, pico de piedra y búhos;
   - el Polvo mágico.
2. **Mecánicas propias de esta mazmorra:** fantasmas, orejudos, escarabajo que se empuja, matar en orden, bloques que abren una escalera y placa de peso.
3. **Mapas 550-552, criaturas y música:** tres temas y uno de combate, a buscar libres y adecuados (cueva húmeda y misteriosa).
4. **Jefes:** el Cíclope y el Genio de la Botella, con la botella. La prueba completa en vivo va acá.

**Números:**
- Mapas 550-552.
- Piedra de invocación: NPC 9724. Por ahora la invoca un GM, y el lugar fijo se define después.
- Plantillas de criaturas: desde 9760; las de la Roca usan del 9744 al 9759.
- Va como `soloDesarrollo` y pide la pluma.

## 11. Para confirmar

| Tema | Propuesta |
|---|---|
| Nombre de la mazmorra | Gruta de la Botella |
| Jefe | Genio de la Botella, con el cuerpo del Genio de AO |
| Minijefe | Cíclope, el mismo de la revancha de la Roca |
| Trofeo | Lámpara del Genio |
| Polvo mágico | Tercer básico, de corto alcance, para las antorchas (sección 6.2) |
| Gráficos | Baldosas claras y paredes de piedra con musgo |
| Dependencias | Pide la pluma; da el Brazalete que pide la Roca |

## Fuentes
- El mapa del pedido (VinnyVideo, 2008), con la leyenda de llaves, warps y objetos.
- [zladx/LADX-Disassembly](https://github.com/zladx/LADX-Disassembly):
  - la grilla (`src/data/maps/layouts.asm`) y los minimapas;
  - salas, entidades, cofres y eventos (`src/data/rooms`, `entities`, `chests` y `events`);
  - el código del Hinox (`06_hinox.asm`), del Genie (`04_genie.asm` y `bank3.asm`), de los Boo Buddies (`06_boo_buddy.asm`), de la aspiradora (`04_tractordevice.asm`), de las plataformas de peso (`07_sideviewplatform.asm`) y de los búhos (`18_owl_statue.asm`).
- [LADXR, lógica de la mazmorra 2](https://github.com/daid/LADXR/blob/master/logic/dungeon2.py).
- [VGMaps: Bottle Grotto (Revned)](https://www.vgmaps.com/Atlas/GB-GBC/LegendOfZelda-Link'sAwakeningDX-BottleGrotto.png).
- [Zelda's Palace](https://www.zeldaspalace.com/linksawakening/soluce.php?p=4), [Zelda Universe](https://zeldauniverse.net/guides/links-awakening/walkthrough/chapter-4-bottle-grotto/) y [Wikibooks](https://en.wikibooks.org/wiki/The_Legend_of_Zelda:_Link%27s_Awakening/Walkthrough/Bottle_Grotto).
- [ZeldaSpeedRuns: diferencias entre versiones](https://www.zeldaspeedruns.com/ladx/general/version-differences).
