# Chamán elemental

Fecha: 2026-10-23. Estado: **en desarrollo** (rama `feat-chaman-elemental`).

Clase nueva inspirada en el Avatar (Aang, Korra): solo ataca con los elementos (fuego, agua, tierra, aire y rayo), depende de sus escudos y no usa daño mágico sino un tipo nuevo: **daño elemental**.

Este documento junta lo pedido, las decisiones que hubo que tomar donde el pedido no da un número (marcadas con **[decisión]**), dónde está cada cosa en el código y qué falta.

## 1. Lo pedido

1. Clase nueva, el Chamán, con su set de tier hecho con gráficos que hoy no usa nadie.
2. Depende de sus escudos. Tiene tres:
   - mágico: 50 % de defensa mágica;
   - físico: 50 % de defensa física;
   - de energía: ataca solo, tirando piedras.
3. Solo usa ataques elementales. Los hechizos elementales pasan a ser exclusivos del chamán y pegan parecido a Llama de Dragón, pero con daño elemental, no mágico.
4. Hechizos distintos:
   - uno eléctrico que además ralentiza 6 segundos;
   - Petrificar pasa a ser del chamán (quienes lo usaban se quedan con Paralizar);
   - la "lluvia de fuego" pasa a ser del chamán y el druida usa LLuvia de Sangre;
   - un poder de viento que hace daño y no deja usar magia durante 4 segundos;
   - uno de agua que silencia: no deja atacar ni usar magia.
5. Los clásicos: Remover Parálisis, Invisibilidad y Resucitar.
5b. El clérigo suma un hechizo nuevo de luz, "Martillo de luz celestial": el mismo daño que LLuvia de Sangre (55-60) y el efecto de un martillo de luz que cae. Si no hay un gráfico así, se busca uno y se indexa.
6. Escudos elementales para otros jugadores, mucho más débiles: 5 % de defensa mágica y 5 % de defensa física, por 60 segundos.
7. Evasión de viento, durante 10 segundos:
   - esquiva el 90 % de todo el daño (solo hay un 10 % de que le entre un ataque físico o mágico);
   - mientras dura no puede atacar de ninguna forma ni hacerse invisible.

## 2. Decisiones

| Tema | Decisión | Por qué |
|---|---|---|
| Id de la clase | **[decisión]** 22, la primera libre | — |
| Qué es "elemental" | **[decisión]** Rayo y electricidad (Flecha eléctrica 7, Descarga eléctrica 23, Rayo Eléctrico 64), fuego (Tormenta de fuego 15, Llamarada 51, Incinerar 61, Rayo de Fuego 63), hielo y viento (Ventisca 62) y tierra (Petrificar 65). No son elementales: Llama de Dragón (queda del mago, es la referencia de daño), Apocalipsis, LLuvia de Sangre, Destello infernal y Purificar | Llama de Dragón es la referencia que diste y es el hechizo del mago |
| "Lluvia de fuego" | **[decisión]** Es Incinerar (61): el hechizo de fuego principal del druida a nivel 50 | No hay ningún hechizo que se llame así |
| Druida | Pierde Incinerar y aprende LLuvia de Sangre (44), que hoy es solo del mago | Pedido |
| Petrificar | Pasa a ser del chamán. Bardo, druida y paladín ya tienen Paralizar, así que alcanza con sacárselo | Pedido |
| Otras clases que pierden hechizos | Clérigo: Ventisca (su principal sigue siendo Purificar). Asesino, bardo y paladín: Descarga eléctrica y Tormenta de fuego (les quedan Misil mágico, MINIApocalipsis y Apocalipsis; al asesino, también Destello infernal). Mago, clérigo y druida: Rayo de Fuego, Rayo Eléctrico y Flecha eléctrica | Son elementales |
| Reemplazo de Llamarada | Mago y druida aprenden **Lluvia Arcana** (84): mismo daño (50-56) y maná (900), magia común, efecto 122 (rayas mágicas que caen) | Pedido |
| Quien ya aprendió un hechizo elemental | **[decisión]** Lo conserva en la lista pero no lo puede lanzar ("Solo el Chamán puede usar la magia elemental"). Las criaturas los siguen tirando como hoy | Exclusivos de verdad, sin tocar la base de datos |
| Qué más aprende el chamán | **[decisión]** Solo lo elemental, sus hechizos nuevos y los clásicos pedidos: Curar efectos, Remover Parálisis, Invisibilidad y Resucitar. Nada de otra magia de ataque ni de curación | "Que solo use ataques elementales" |
| Ventisca y Llamarada | De área: cruz de 5 baldosas centrada en el clic, que se pinta en verde mientras se apunta (campo `aoe`, como en el _Argentum viejo). El maná se cobra una vez si le pegó a alguien | Pedido. En los repos viejos la de área era "Llamarada de Área" (HECHIZO76); Ventisca y Llamarada eran de un objetivo |
| Tormenta de fuego | Solo contra criaturas (como Onda de Luz) y gasta 120 de maná en vez de 250 | Pedido: "los que hacen poco daño" |
| Rayo de Fuego | Además quema: 10 de daño elemental cada 3 s, con fuego sobre el que se quema, hasta que se cure o muera (como el veneno). En zona segura se apaga | Pedido |
| Curar veneno | Pasa a llamarse **Curar efectos** y cura veneno y quemadura | Pedido |
| Rayo Eléctrico | Además silencia 3 s (no ataca ni lanza) con contador en pantalla. No se acumula: mientras dura no se renueva y al terminar hay 1 s de respiro | Pedido |
| Daño elemental | **[decisión]** Se calcula como el mágico (base del hechizo, nivel y equipo de daño mágico del chamán), pero **no lo reducen** la resistencia mágica ni la defensa mágica del equipo del que recibe. Lo reducen el escudo mágico del chamán y el escudo elemental de los aliados | Es lo que lo hace un tipo distinto |
| Escudos propios | **[decisión]** Uno a la vez: tirar otro reemplaza al anterior. Duran 30 s | "Depende de sus escudos": hay que ir cambiando según la pelea |
| Escudo mágico | −50 % al daño mágico **y elemental** que recibe | Pedido; el elemental también, para que sirva contra otro chamán |
| Escudo físico | −50 % al daño físico que recibe (golpes y flechas) | Pedido |
| Escudo de energía | **[decisión]** Cada 2 s tira una piedra al enemigo más cercano a 4 baldosas o menos, con daño elemental de un tercio de una Llama | Pedido ("que ataque, que sean piedras") |
| Rayo que ralentiza | **[decisión]** Descarga eléctrica: daño elemental y el que la recibe camina a la mitad de velocidad durante 6 s | Pedido |
| Viento que silencia magia | **[decisión]** Hechizo nuevo "Ráfaga de viento": daño elemental y 4 s sin poder lanzar hechizos | Pedido |
| Agua que silencia todo | **[decisión]** Hechizo nuevo "Prisión de agua": sin daño; durante 3 s no puede atacar ni lanzar hechizos | El pedido no da duración: 3 s, un poco menos que el silencio de viento, porque bloquea más |
| Escudos para aliados | Dos hechizos: 5 % menos de daño mágico y elemental, y 5 % menos de daño físico. 60 s, se pueden tener los dos | Pedido |
| Evasión de viento | 10 s, 90 % de esquiva a todo, sin atacar ni lanzar ni hacerse invisible. **[decisión]** 30 s de enfriamiento | Sin enfriamiento podría estar siempre activa |
| Daño | **[decisión]** Factor PvP mágico 1,0 y cuerpo a cuerpo 0,5. Medido con el simulador, con set contra set: mata a un mago en 2 / 3 / 3 a nivel 30 / 40 / 50 (el mago a otro mago: 2 / 2-3 / 3) y a un guerrero en 3 / 3 / 4 (el mago necesita 5 a nivel 50: el elemental no lo frena la resistencia). Con el bastón necesita 8 golpes para un mago | Pedido: "similar a Llama de Dragón" |

## 3. Gráficos

Láminas: [set y clase](chaman/chaman-set-y-clase.png) y [capturas del juego](chaman/chaman-en-el-juego.png).

**Set de tier "Set Elemental" (ítems 1817 a 1820).** Gráficos que no usaba ningún ítem:
- Corona de Plumas Elemental: casco 38, con el desplazamiento corregido de 10,10 a 0,0.
- Bastón Elemental: arma 85 nueva, indexada desde la planilla 16100 (bastón de gema verde).
- Caparazón Elemental: escudo 3 (caparazón de tortuga).
- Túnica Elemental: cuerpo 403 (blanca con faja). Su ícono es nuevo (grh 37995).
- Descartados:
  - cuerpo 570: casi igual a la Túnica Suerte de donación;
  - cuerpos 565 a 572: importaciones viejas que se dibujan mal;
  - cuerpo 528: tribal;
  - casco 13: el "Sombrero Chamán".

**Efectos.** Nada se recicla de la meditación ni de la subida de nivel (pedido de Leandro). Los efectos de internet tienen licencia libre; los créditos están en [CREDITOS_GRAFICOS.md](CREDITOS_GRAFICOS.md).

| Qué | Efecto | De dónde sale |
|---|---|---|
| Aura del Escudo mágico | 147 | Anillo violeta con haces de luz (JoesAlotofthings, CC-BY 4.0) |
| Aura del Escudo físico | 148 | Aro dorado de chispas (para, CC0) |
| Prisión de agua, mientras dura | 149 | Esfera de agua (Cethiel, CC0) |
| Aura de la Evasión de viento | 150 | Remolino blanco a los pies (JoesAlotofthings, CC-BY 4.0) |
| Aura del Escudo de energía | 151 | Anillo de piedras que orbitan detrás del chamán, hecho con la roca del efecto 80 |
| Aura de los escudos para aliados | 152 | Aro azul suave a los pies (JoesAlotofthings, CC-BY 4.0) |
| Llama de cada golpe de la quemadura | 153 | Llama pintada (mikodrak, CC0) |
| Silenciado por el Rayo Eléctrico | 154 | Chispas violetas en la cabeza (reactorcore, CC0) |
| Martillo de luz celestial | 146 | El ícono de la Maza pintado de dorado cae del cielo y estalla en el anillo de luz de la planilla 3096 |
| Piedra que vuela | grh 38035 | Roca del efecto 80 achicada |
| Ráfaga de viento | 87 | Tornado del juego que no usaba nadie |
| Lluvia Arcana | 122 | Rayas mágicas que caen, del juego, sin uso |

Los escudos y la evasión no tienen efecto al lanzar: el aura aparece enseguida, queda mientras duran (`frontend/components/game/rendering/elementalAuras.ts`) y la ven todos. Las auras van dentro del contenedor del personaje: se mueven con él y respetan la invisibilidad. El anillo de piedras y el de aliados van detrás del cuerpo; el resto, delante.

## 4. Dónde está cada cosa

| Parte | Archivos |
|---|---|
| Reglas de los efectos (escudos, evasión, silencios, lentitud, quemadura, piedras) | `server/src/elementalEffects.ts` y su test |
| Daño elemental, hechizos nuevos, tick de quemadura y piedras, paquete `elementalState` (98) | `server/src/game.ts` |
| Bloqueos al atacar o lanzar, lentitud al caminar, solo el chamán lanza lo elemental | `server/src/protocol.ts` |
| Escudos en todo golpe que entra; evasión contra hechizos | `server/src/racialPassives.ts` (`applyIncomingHit`, `shouldIgnoreHarmfulSpell`) |
| Área en cruz centrada en el clic | `server/src/spellArea.ts`, `castAreaSpell` en `protocol.ts`; cliente `frontend/lib/spellArea.ts` y `rendering/spellAreaPreview.ts` |
| Datos: hechizos, pergaminos, quién aprende qué, tiendas y piezas del set | `server/src/scripts/applyShamanData.ts` (se puede correr de nuevo) y `applyTierSetData.ts` |
| Cliente: estado, auras, lentitud de los demás, carteles y barra | `frontend/lib/elementalState.ts`, `rendering/elementalAuras.ts`, `components/ElementalStatusBanner.tsx`, `components/BuffStatusSidebar.tsx` |

## 5. Pruebas

- `server/src/elementalEffects.test.ts`: 8 tests de reglas. Están en `pnpm --dir server test-combat-balance`.
- En vivo con Playwright, un chamán contra un mago y un clérigo: 22 de 22 comprobaciones.
  - Auras que ven los dos.
  - Silencio con contador, sin acumular.
  - Lentitud: 4 pasos contra 8.
  - Quemadura cada 3 s, que se cura con Curar efectos.
  - Cruz verde que pega.
  - Piedras que vuelan y pegan.
  - Evasión que esquiva y no deja atacar.
  - Prisión de agua, escudo para aliados y Martillo.
