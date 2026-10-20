# Tienda de donaciones y Transfiguración

Fecha: 2026-10-20.

## Qué es

- **Tienda** (botón dorado "Tienda" del panel derecho, o `/tienda`): se paga con puntos de donación (`puntosDonacion`, los mismos que se compran en `/donaciones` con Mercado Pago). Tiene categorías estilo tienda de WoW: Destacados, Transfiguración, Personaje, Objetos y Diseño personalizado. Cada producto se puede "probar" en el personaje antes de comprarlo.
- **Transfigurar** (botón violeta "Transfigurar", o `/transmog`): cuatro espacios cosméticos (casco, escudo, arma y cuerpo completo) que cambian el dibujo del personaje sin cambiar stats ni equipo.
- **Diseño personalizado**: el jugador pide un casco, escudo, arma o disfraz hecho a medida (con descripción e imagen de referencia). Se cobra al pedirlo; el staff lo dibuja, lo entrega o lo rechaza con reembolso desde `/gm/disenos`.

## Editar el catálogo

`server/jsons/tienda.json` (se carga al arrancar el game server: después de editarlo hay que reiniciarlo).

- `categories`: claves y textos de las secciones.
- `products`: cada uno con `id` (único, sin espacios), `category`, `price` (puntos; 100 puntos = 1 USD) y `kind`:
  - `item`: `objIndex` y opcional `amount`. Si el objeto es de apariencia, la tienda lo muestra con vista previa y lo vende de a uno.
  - `levelUp`: `levels` y `maxLevel` (se puede comprar mientras el nivel sea menor a `maxLevel`).
  - `customDesign`: `slot` (`casco`, `escudo`, `arma` o `cuerpo`).
  - Opcionales: `name` (si no, usa el nombre del objeto), `desc`, `subcategory` (filtro de Transfiguración), `featured` (aparece en Destacados), `badge` (etiqueta en la tarjeta).
- La categoría **Objetos** se arma sola con `server/jsons/donaciones.json` (el catálogo de canje por donación que ya existía), así no hay dos listas para mantener.

## Objetos de apariencia

Viven en `server/jsons/objs.json` (y sus copias `api/src/jsons/objs.json` y `frontend/public/init/objs.json`). Hoy: 1781 a 1805 (cascos, escudos y armas de los sets Silvestre, Templario, Paladín, Bardo, Verdugo, Silvano y Umbral, más cuatro armas legendarias) y 1806 a 1813 (disfraces).

- **Apariencia** (`cosmetico: 1`): copia de un casco, escudo o arma con stats en 0. No se equipa; con doble click va directo a Transfigurar. El dibujo sale de `anim`, igual que el original.
- **Disfraz** (`disfraz: <número de cuerpo>`, `objType` 0): reemplaza todo el dibujo con ese cuerpo (por ejemplo 12 Esqueleto, 83 Demonio). Conviene usar cuerpos de NPC de tamaño humano.
- Ambos llevan `nonTradeable`, `noAuction` y `noSeCae` en 1 (quedan para quien los compra y no se pierden al morir).

## Reglas de la Transfiguración

- Sirve cualquier casco, escudo o arma del inventario que no esté equipado, además de las apariencias y disfraces de la tienda. El objeto sale del inventario y queda guardado en el espacio hasta que se quita (vuelve al inventario).
- Con un disfraz de cuerpo completo puesto, los otros tres espacios quedan desactivados.
- No se ve mientras el personaje está muerto, navegando, montado, transformado o en el Hunters Game; vuelve sola.
- Los diseños del set Arcano (el del aura) no se pueden transfigurar: prestarían el aura sin tener el set completo.
- Técnica: el server no toca el equipo real (`idHead`, `idBody`, `idHelmet`, `idWeapon`, `idShield`); aplica la transfiguración al serializar la apariencia (`server/src/transmog.ts` y `handleProtocol.ts`). Se guarda en `characters.transmog` (JSONB) en la misma escritura que el inventario.

## Diseños personalizados (circuito del staff)

1. El jugador pide el diseño en la Tienda. Se cobra en el momento y queda **Pendiente** en `/gm/disenos` (staff: personajes con privilegios 1 o 2).
2. El staff lo pasa a **En producción**, dibuja el sprite y lo carga con la herramienta `developer/` (importar sprites), creando un objeto nuevo como los de arriba (`cosmetico: 1` o `disfraz`, con `nonTradeable` y `noAuction` en 1). Se despliega.
3. En `/gm/disenos`, **Entregar** con el número de objeto: si el jugador está conectado lo recibe al instante; si no, al entrar.
4. Si no se puede hacer, **Rechazar y reembolsar** con un motivo: el jugador recibe los puntos y el motivo en la consola.

## Configuración

- La api necesita `GAME_SERVER_URL` apuntando al game server (en producción `http://game-server:7666`, que es el valor por defecto) para cobrar, entregar y reembolsar.
- Comandos: `/tienda`, `/tiendacomprar <id> [cantidad]`, `/transmog`, `/transmogponer <slot del inventario> [casco|escudo|arma|cuerpo]`, `/transmogquitar <casco|escudo|arma|cuerpo>`.
