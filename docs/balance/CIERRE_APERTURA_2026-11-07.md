# Seguimiento de apertura — 7 de noviembre de 2026

Continuación del [informe inicial](VALIDACION_APERTURA_2026-11-06.md), en `feat/prioridad-1-apertura` / PR 135. Este registro distingue los recorridos ejecutados de la cobertura automática.

## Correcciones reproducidas

| Problema | Corrección y evidencia |
| --- | --- |
| Oro de NPC duplicado | La muerte completa pagaba 630 por un NPC de oro base 100 y drop monetario 10 con multiplicador ×3; debe pagar 330. Se conserva un único reparto en `npcs.tirarItems`. Regresión sobre `respawn.muere`, incluida la segunda notificación de muerte. |
| NPC 570 en mapa 159 | Referencia sin definición en las tres fuentes originales de NPC. Se retira la colocación 46,67 de servidor, API y cliente. El importador descarta referencias sin plantilla para evitar reintroducirla. Arranque sin esa advertencia. |
| Entrada mientras carga el mundo | El servidor descartaba el login y dejaba un socket abierto sin personaje. Ahora cierra con 1013; el cliente reintenta con límite. Navegador: dos cierres durante una ventana de arranque de 3,5 s y conexión posterior sin recarga manual. |
| Torneo entre miembros de clan/party | Se permite el combate entre los dos rivales de turno. Quienes esperan no pueden intervenir. La derrota del torneo no genera drops, oro/EXP PvP ni penalización por traición. |
| Primera muerte terminaba el 2v2 | La ronda continúa hasta eliminar a ambos miembros. Notificaciones repetidas no suman rondas y un compañero resucitado vuelve a contar como vivo. |
| Bajas de Hunters sin premio | La eliminación se procesaba antes que la baja y descartaba el premio. La muerte informa ahora el atacante antes de resolver la eliminación y la victoria. Dos bajas reales acreditaron sus dos premios; también se permite combatir contra miembros del mismo clan durante la fase activa. |
| Restauración competitiva sobreescrita | La vida se ponía en cero y las referencias del equipo se borraban después del cierre. La limpieza y transmisión de muerte preceden a la restauración. Un eliminado de ranked permanece en la arena, sin transición al mundo de muertos. |
| Búsqueda de objetos en mercado/subastas | El filtro sólo consultaba vendedor/ID, aunque la interfaz pedía nombre del objeto. Ahora consulta también `game_objects.name`, antes de paginar. Regresión PostgreSQL y búsqueda de «Poción Azul» en navegador. |
| Ruido y temporales | Se retiran logs/snapshots/controles locales versionados, se ignoran `.run-logs/` y `.playwright-mcp/`, y se elimina el log por cada paquete recibido y el mensaje genérico de carga de recursos. Se mantienen errores, advertencias y diagnósticos habilitados expresamente. |

No se modifican tablas de vida, daño, hechizos, atributos ni clases de jugadores. El arreglo económico corrige un doble pago; no cambia el multiplicador de oro ni el valor base de los NPCs.

## Partidas observadas

Base PostgreSQL exclusiva `woao_opening_followup_test`, API 3101, juego 7766 y almacenamiento de progreso aislado. Cuentas de prueba, movimiento/ataques/pociones por el protocolo real. Los controles temporales sólo escuchan en localhost y no se entregan. Se posicionan los actores para acortar desplazamientos, sin reducir la vida de los objetivos de estos combates. Las sesiones de caza, el 2v2, el torneo y la guerra no aceleran el reloj.

| Recorrido | Resultado |
| --- | --- |
| Ranked 2v2 | Dos parties, confirmaciones y serie BO3 completa. La primera baja deja 0–0 con el compañero vivo; la segunda cierra la ronda. Victoria 2–0; +20 Quest para cada ganador y +2 para cada rival activo. Los cuatro vuelven al mapa 34 vivos y con HP máximo. |
| Torneo automático | Cuatro cuentas, semifinal entre miembros del mismo clan y final. Campeón +108 Quest y objeto 1245; finalista +30. El campeón no gana oro/EXP PvP en el torneo. |
| Guerra de facciones | Cinco minutos completos, cuatro participantes y resurrecciones. Alianza 15–7 Horda. +40 Quest por ganador, +10 por rival activo y +15 al MVP de daño. Salida al mapa 34. Se conservan las recompensas anteriores de facción. |
| Hunters Game | Inscripción, 120 s seguros, cofres aleatorios, equipamiento del evento, combate contra un miembro del clan y último superviviente. Dos bajas: +6 Quest / +2.000 oro; campeón con tres cuentas: +21 Quest / +8.000 oro. Saldo 303→330, inventario original restaurado, cofres retirados y estado COMPLETED sin participantes. Las ejecuciones previas interrumpidas durante el diagnóstico no se cuentan como ediciones completadas. |
| Restauración después del último arreglo | Serie 1v1 adicional, dos navegadores, 2–0. Ganador 388/388 y rival 535/535, vivos, en mapa 34. Ambos conservan arma, armadura y casco en sus slots y no tienen transición pendiente al mundo de muertos. [Captura del rival](../../screenshots/apertura-cierre-2026-11-06/ranked-equipo-restaurado.png). |

Capturas: [primera baja 2v2](../../screenshots/apertura-cierre-2026-11-06/ranked-2v2-primera-baja.png), [premio 2v2](../../screenshots/apertura-cierre-2026-11-06/ranked-2v2-premio.png), [torneo](../../screenshots/apertura-cierre-2026-11-06/torneo-premio.png), [guerra](../../screenshots/apertura-cierre-2026-11-06/guerra-premio.png).

## Medición de leveleo

Las [sesiones iniciales](sesiones/2026-11-07-inicial.json) conservan tiempos, bajas, EXP, oro, pociones y estado final de cuatro clases en niveles 10, 30 y 50. Son sesiones controladas sobre el mundo en ejecución, no estimaciones de daño de una planilla. Cada celda dura 180 segundos reales e incluye tiempo sin objetivos, agotamiento de pociones y tiempo muerto.

La densidad de los mapas, los rangos aleatorios y la estrategia de hechizos influyen mucho. Estas rutas no permiten ordenar clases por fuerza ni extrapolar tres minutos a una hora garantizada. La columna EXP/h expresa la tasa de esa muestra. El saldo de oro observado no descuenta pociones entregadas como fixture; su coste de reposición se informa por separado.

Medusa mantiene los 300–650 de daño de `old/Nuevo Motor Graf/Servidor 7.0/Dat/NPCs-HOSTILES.dat`, NPC 553. Las cuatro clases de venta mueren en la muestra de enfrentamiento directo. No se reduce a partir de esa prueba: no demuestra que un encuentro de alto riesgo deba convertirse en un campamento para jugar solo. La ruta de progresión se contrasta con criaturas de menor daño y con uso de magia eficiente.

Se registran **23 sesiones de tres minutos: 69 minutos de personajes**. [Tablas de EXP/h, oro y consumibles](SESIONES_PVE_2026-11-07.md). Nivel 50 es el máximo actual: las mediciones de ese nivel sirven para oro y supervivencia, no para EXP/h. Se añade nivel 45 antes del tope. Una comprobación adicional en navegador muestra combate real contra un Treant, sin modificar su vida: [captura](../../screenshots/apertura-cierre-2026-11-06/pve-nivel45.png).

## Sistemas y mazmorras en navegador

- Banco personal: de 100 pociones se guardan 25 y retiran 10; quedan 85 en mochila y 15 en banco. Banco de cuenta: guardar y retirar 10 mantiene las 85. [Captura](../../screenshots/apertura-cierre-2026-11-06/banco-personal.png).
- Bóveda de clan: guardar/retirar 10 pociones conserva la pila. Depositar 1.000 oro y retirar 500 deja 300.500 en bóveda y descuenta exactamente 500 al jugador. [Captura](../../screenshots/apertura-cierre-2026-11-06/boveda-clan.png).
- Comerciante: comprar dos redes a 25 y vender una a 16 deja una red y saldo 2.000.000→1.999.966. [Captura](../../screenshots/apertura-cierre-2026-11-06/comerciante.png).
- Subastas: publicar cinco pociones, compra directa por 150 y reclamos en ambos navegadores. El comprador pasa de 100 a 105 pociones y paga 150; el vendedor recibe 150 una sola vez. La búsqueda por nombre se comprueba con otra publicación de tres pociones azules. [Búsqueda](../../screenshots/apertura-cierre-2026-11-06/subasta-busqueda.png), [cobro](../../screenshots/apertura-cierre-2026-11-06/subasta-cobro.png).
- Misión 2: aceptación y entrega en el NPC universal desde la interfaz, +250 oro, +3 Quest y sus dos objetos. Se preparan los contadores de 8 arañas/10 trogloditas mediante el handler de bajas; no se presenta como una sesión de caza manual de esos 18 objetivos. [Captura](../../screenshots/apertura-cierre-2026-11-06/mision-entregada.png).
- Mazmorra de prueba: entrada desde la piedra, dos mapas instanciados y salida por el tile 26,29 del segundo mapa. Primera pisada en 24,31: objeto 1842; al volver: objeto 1843, caída y daño. [Primera pisada](../../screenshots/apertura-cierre-2026-11-06/piso-primera-pisada.png), [segunda](../../screenshots/apertura-cierre-2026-11-06/piso-segunda-pisada.png).
- Aplastador aleatorio en 20,29: oculto al recorrer los tiles anteriores; al pisarlo se activa y resta 80 HP. [Oculto](../../screenshots/apertura-cierre-2026-11-06/trampa-oculta.png), [activado](../../screenshots/apertura-cierre-2026-11-06/trampa-activada.png).
- Reja del segundo mapa, 61,15: cerrada con objeto 1840 / gráfico 330048; una vasija arrojada con el brazalete la abre y deja el arco vacío, objeto 1835. [Antes](../../screenshots/apertura-cierre-2026-11-06/reja-cerrada.png), [después](../../screenshots/apertura-cierre-2026-11-06/reja-rota.png).
- Calamar: conserva 100 HP tras hechizo, golpe, gancho y bomba desde suelo. Al entrar caminando al agua con Patas de rana, Misil mágico le resta 76. Otra bomba explota junto al calamar y conserva sus 24 HP. [Desde tierra](../../screenshots/apertura-cierre-2026-11-06/agua-ataque-desde-tierra.png), [nadando](../../screenshots/apertura-cierre-2026-11-06/agua-ataque-nadando.png), [bomba](../../screenshots/apertura-cierre-2026-11-06/agua-bomba-sin-dano.png).
- Caverna, Cueva, Botella, Rostro, Fauces y Torre: entrada, carga de la instancia y salida verificadas. Se crean piedras de fixture y se preparan herramientas para acceder a estas seis mazmorras de desarrollo; no se publican nuevas entradas ni se quita su restricción de producción. Capturas `mazmorra-*.png` en la misma carpeta. No es una partida completa de todas sus salas y jefes.

## Verificación y alcance

Servidor: **139 pruebas**, 0 fallos. API/PostgreSQL: **103 pruebas en 18 archivos**, 0 fallos. TypeScript y builds de servidor, API y frontend aprobados. ESLint de todos los archivos TypeScript modificados del servidor y del frontend sin errores. API no tiene comando ESLint instalado; se verifica con tipos, build y pruebas.

Wiki: se amplían Competitivo y Eventos con cuatro imágenes y las reglas de 2v2, torneo, Hunters y guerra. Las seis imágenes de estas dos páginas se cargan correctamente en navegador; las dos de Combate también. Se mantienen las guías previas de clanes, donaciones y rangos.

Las cifras de caza cubren Guerrero, Mago, Druida y Asesino, con equipo de venta y ventanas cortas. **No certifican el balance integral de todas las clases**, rutas, equipos ni grupos. Se conserva el balance numérico de jugadores y de NPCs: el cambio económico elimina el pago duplicado. Sigue pendiente ampliar la muestra de partidas y completar las campañas de las mazmorras de desarrollo. Los resultados anteriores no se convierten en una certificación global de preparación de apertura.

Limpieza final: se detienen los servicios locales de prueba, se elimina exclusivamente `woao_opening_followup_test` y se retiran las sesiones y archivos con tokens. Los puertos 3000, 3101, 7766 y 7998 quedan sin esos servicios. No se restaura ni modifica la base habitual del proyecto. El progreso local de `server/data/woaoProgress.json` y la configuración previa de `server/jsons/bossEvents.json` no forman parte de este cambio.
