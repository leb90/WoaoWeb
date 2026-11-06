# Prioridad 1 para la apertura

Estado: diagnóstico inicial y propuesta para revisión; implementación pendiente.
Fecha de revisión: 6 de noviembre de 2026. Base inspeccionada: `main`, `2ef0564b`.

## Resultado solicitado

Corregir errores que comprometan inventarios, monedas, combate y progresión; revisar EXP, oro, misiones, NPCs y drops; agregar rangos de NPCs; agregar niveles comprables de clan, donaciones de puntos Quest y beneficios de `old`; mejorar premios ranked y eventos. Ejecutar pruebas automáticas y recorridos reales en el navegador antes de marcar la apertura como validada.

## Evidencia actual

| Área | Resultado observado | Fuente |
| --- | --- | --- |
| Pruebas habituales de balance | Dos ejecutables de aserciones y 91 pruebas pasan | `server/package.json`, `test-combat-balance` |
| Todas las pruebas del servidor | 106 pasan, 4 fallan | Descubrimiento de todos los `server/src/**/*.test.ts`, ejecutados con `tsx --test` |
| Apilado | Una pila de mejora igual conserva 1 unidad cuando se esperan 4; también fallan desborde, mochila llena y entrega múltiple | `server/src/inventoryStacking.test.ts` |
| Causa del apilado | `canStackWith` sólo admite rareza efectiva 0; una prueba vieja exige que las mejoras NO se apilen | `server/src/itemRarity.ts`, `server/src/itemRarity.test.ts` |
| Oro PvE | Un NPC de prueba con `gold: 100` y `drop: []` produce cero llamadas al reparto de oro | Reproducción aislada de `npcs.tirarItems`, sin escribir datos |
| Causa del oro | El reparto está dentro del bucle de drops y sólo procesa objetos de tipo dinero; `npc.gold` se carga pero no se reparte | `server/src/npcs.ts`, `server/src/loadNpcs.ts` |
| Misiones | Las 36 tienen `requiredLevel: 1`; sus NPCs y objetos referenciados existen | `server/jsons/quests.json`, comparación con NPCs y objetos |
| Entrega de misiones | Se comprueba cantidad de tipos de premio contra huecos libres antes de consumir requisitos; luego se sortea rareza por unidad | `server/src/quests.ts:738` |
| Clan actual | Cupo fijo 50; nivel local automático por reputación, sin tope 6; existe un registro local con nivel 43 | `api/src/repositories/clans.ts`, `server/src/clanMeta.ts`, `server/data/clanMeta.json` |
| Puntos Quest | Saldo personal en `woaoProgress.json`, distinto del ranking de clanes en PostgreSQL | `server/src/woaoProgress.ts`, `api/src/repositories/clanPoints.ts` |
| Materiales de clan | Existen los objetos 1095, 1096 y 1241, sin entradas en las listas actuales de drop de NPCs | Comparación de `server/jsons/objs.json` y `npcs.json` |
| Ranked | El cierre actual persiste ELO/resultados y no otorga un premio Quest; el INSERT principal no acepta reintentos del mismo ID | `server/src/rankedArena.ts`, `api/src/repositories/ranked.ts` |
| Tipos | API, servidor y frontend pasan `tsc --noEmit` | Ejecuciones locales; frontend después de regenerar tipos de rutas obsoletos de `.next` |

Fallos de pruebas que deben quedar corregidos, por nombre:

- `recoger sucesivamente la misma mejora actualiza una sola pila`.
- `recoger otra mejora la separa y una pila llena distribuye el sobrante`.
- `con la mochila llena se recoge la misma mejora; si no cabe queda en el piso`.
- `entregar varias unidades mejoradas usa pilas de 10000 y conserva la rareza`.

No se ejecutó la suite de integración de API ni una sesión de navegador en esta revisión. No había listeners en 3000, 3001, 5434 ni 7666 al comprobar servicios. Esta revisión no certifica la apertura ni afirma que se hayan encontrado todos los errores críticos.

## 1. Estabilidad y economía PvE

- Clave de apilado: ID del objeto más rareza efectiva; máximo 10.000 por pila. Conservar cantidad, rareza y equipo en recogida, entrega, equipar, desequipar y carga. Una operación sin capacidad no modifica inventario ni borra el objeto del suelo.
- Entrega de misión: planificar inventario completo después de consumir requisitos y después de sortear las rarezas. Si no cabe, no consumir requisitos, pagar monedas ni finalizar la misión. No volver a sortear dentro de la aplicación del plan.
- Oro NPC: repartir `floor(npc.gold * multiplicadorGold)` una sola vez al morir, además de los drops de dinero explícitos existentes. Registrar en el informe ambos componentes; no eliminar automáticamente drops que representan un premio adicional. Probar un NPC con ambos componentes y repetición del procesamiento de muerte.
- Mantener inicialmente multiplicadores globales EXP 5 y oro 3, curva actual y separación de balance PvP. Primero corregir pagos efectivos y medir el resultado.
- Misiones: niveles mínimos propuestos por ID: `1:1, 2:10, 3:25, 4:25, 5:25, 6:30, 7:40, 8:35, 9:35, 10:40, 11:30, 12:25, 13:30, 14:40, 15:35, 16:45, 17:40, 18:45, 19:1, 20:10, 21:45, 22:20, 23:15, 24:40, 25:30, 26:35, 27:35, 28:40, 29:30, 30:45, 31:45, 32:25, 33:30, 34:40, 35:10, 36:15`.
- Conservar misiones activas anteriores aunque aumente el requisito para nuevas aceptaciones. Mantener la repetibilidad actual; no convertir todas las misiones en diarias o únicas como efecto lateral.
- Recompensa EXP propuesta de misiones no iniciales: `floor(suma(EXP base de cada objetivo * cantidad) * 0.5)`. Misiones iniciales 1 y 19 conservan 5.000 EXP, pociones y un punto. La EXP de misión no vuelve a multiplicarse por 5. Esto elimina excepciones que premian varios múltiplos del combate base; publicar una tabla completa antes/después antes de aplicar los datos.
- Mantener inicialmente oro, puntos y objetos de misión salvo errores de referencias/capacidad. El informe incluye EXP por HP, oro por baja, coste de pociones y ganancia prevista por ruta y clase; estimaciones identificadas como tales, con semilla y supuestos.
- Añadir fuentes explícitas de los materiales de clan: Huevo Dragón 1095 en Dragón Infernal 739 (5%) y Dragon Legendario 754 (10%); Diamante Sangre 1096 en Rey Mago 761 (5%) y Caballero De la Muerte 726 (10%); Corazon Oscuro 1241 en Demonio de Fuego 585 (5%) y Caballero De la Muerte 726 (5%). Una unidad por éxito. Comprobar que esos NPCs tienen apariciones accesibles; si una fuente no aparece, resolver su colocación antes de considerar el material obtenible.

## 2. Rangos de NPCs

Referencia original: `old/Nuevo Motor Graf/Servidor 7.0/Codigo/MODULO_NPCs.bas`, líneas 2231–2303. El VB6 tiene Normal, Mejorado, Líder, Especial y Legendario; el último aparece condicionado por el evento del día. Sus factores de combate son 1/2/3/4/5 y de EXP/oro 1/3/5/7/10. La propuesta inicial reduce esos saltos para medirlos antes de abrir:

| Rango | Frecuencia | Vida | Daño físico y mágico | EXP | Oro | Probabilidad de drop |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Normal | 96,5% | x1 | x1 | x1 | x1 | x1 |
| Mejorado | 1,5% | x1,5 | x1,2 | x2 | x2 | x1,25 |
| Líder | 1% | x2 | x1,4 | x3 | x3 | x1,5 |
| Especial | 0,9% | x3 | x1,7 | x5 | x5 | x2 |
| Legendario | 0,1% | x4 | x2 | x7 | x7 | x3 |

Selección por aparición y respawn natural de criaturas hostiles atacables con EXP positiva. Excluir mapas seguros y de principiantes, invocaciones, entrenadores, comerciantes, muñecos, NPCs de eventos, castillos, raids y mazmorras. Conservar también las exclusiones explícitas del VB6: 699, 692, 666, 667, 587, 594, 633, 611, 585, 621, 778, 676 y 726, además de `npcType` 6 y 60.

No modificar plantillas compartidas. Aplicar el rango a una copia de stats base y mantenerlo al recargar datos de un NPC vivo, sin multiplicarlo dos veces. La recarga no cura un NPC dañado. El rango no cambia el ID usado por objetivos de misión. Mostrar sufijo y color propios en el nombre y marco de objetivo. Los drops conservan cantidad y rareza de objeto; sólo aumenta su probabilidad, con tope 100%, incluyendo fuentes de materiales. Recetas/monturas usan umbrales del NPC base; si reciben el bono de probabilidad, se aplica una sola vez. El aumento de HP no habilita por sí solo recetas de otro tramo.

## 3. Niveles de clan

Referencias: `ModClanes.bas:6–128` (costes), `ModClanes.bas:649–679` (miembros), `Modulo_UsUaRiOs.bas:5965–6003` (ocupación de castillos), `SistemaCombate.bas:2600` y `modHechizos.bas:1822` (Fortaleza).

| Nivel alcanzado | Cupo de miembros | Cupo simultáneo en castillo | Oro para subir desde el anterior | Huevo Dragón | Diamante Sangre | Corazon Oscuro | Puntos Quest propuestos |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 30 | 3 | Creación actual | 0 | 0 | 0 | 0 |
| 2 | 33 | 4 | 300.000 | 1 | 0 | 0 | 50 |
| 3 | 36 | 5 | 1.500.000 | 3 | 1 | 0 | 150 |
| 4 | 39 | 6 | 7.500.000 | 5 | 3 | 0 | 350 |
| 5 | 42 | 7 | 15.000.000 | 10 | 3 | 1 | 700 |
| 6 | 45 | 8 | 20.000.000 | 12 | 5 | 3 | 1.200 |

- Nivel inicial 1; máximo 6. Conservar creación actual de 150.000 oro y nivel personal 30. El coste de creación no se vuelve a cobrar al subir.
- Recuperar cantidades que el VB6 comprueba y describe: en nivel 4 pide 3 diamantes pero descuenta 2; en 5 pide 3 y descuenta 5; en 6 pide 5 y descuenta 8. La implementación nueva valida y descuenta la misma cantidad de la tabla.
- Beneficios iniciales: cupos anteriores y habilitar el ataque a la Fortaleza desde nivel 2, manteniendo los demás requisitos actuales de conquista. La lógica actual de castillos ya calcula cupos: se conecta al nuevo nivel persistido.
- Botón exacto **Subir de nivel** visible únicamente al líder. Mostrar nivel, miembros/cupo, beneficios y requisitos disponibles/faltantes; en 6 mostrar Nivel máximo.
- Oro y materiales se consumen de la bóveda compartida del clan. Esto permite aportes de los miembros y evita descontar un inventario personal antiguo guardado en la API. El panel explica de dónde salen los recursos.
- Cada miembro, incluido el líder, puede **Donar puntos Quest** desde su saldo personal. Cantidad entera positiva, hasta el saldo; el saldo del clan es independiente de reputación/PvP. Donación irreversible; no retirable como moneda personal. No reutilizar puntos de donación premium.
- Las donaciones y subidas tienen un ID de operación estable. Un reintento devuelve el resultado anterior. Un doble clic no compra dos niveles: incluir nivel esperado.
- Nivel y saldo de clan en PostgreSQL. Importar una vez el nivel local existente, limitado a 1–6 y elevado al mínimo necesario para miembros existentes. No expulsar miembros: si hay más de 45, mantenerlos e impedir altas mientras el cupo esté excedido. Conservar reputación e historial original de migración. No reinicializar ni reducir balances personales.
- Eliminar el ascenso automático por reputación, conservando sus puntos de ranking.

### Persistencia de puntos y concurrencia

El saldo personal Quest pasa a un monedero PostgreSQL. La importación de `woaoProgress.json` ocurre una vez por UUID, antes de aceptar movimientos: una reconexión no vuelve a importar saldo viejo. Todas las fuentes y gastos Quest deben usar ese monedero (misiones, premios, eventos y ranked); el JSON y el personaje en memoria quedan como espejos, no como escritores independientes. `puntosDonacion`, misiones y monturas conservan sus sistemas actuales.

Cada movimiento lleva clave única, saldo no negativo, motivo y personaje. Donar hace débito personal y crédito de clan en una transacción. Subir consume puntos de clan, oro y materiales de bóveda junto con el incremento de nivel en otra transacción. Bloquear filas en orden uniforme y verificar rol/membresía dentro de la transacción; no hacer llamadas HTTP con locks abiertos.

La bóveda actual mantiene sesiones y snapshots en memoria. No basta bloquear PostgreSQL: serializar adquisición, guardado de bóveda y subida en el servidor; rechazar subida si la bóveda tiene un usuario activo. Agregar revisión de bóveda a la API para rechazar snapshots antiguos después de una subida. El acceso a esos comandos se mantiene por la sesión real y endpoints internos autenticados.

## 4. Ranked y eventos

Propuesta de premios Quest, configurable y con recibo persistido:

| Actividad | Premio propuesto | Condiciones |
| --- | --- | --- |
| Ranked 1v1 y 2v2 | Ganador 8; perdedor 2; primera victoria del día +12 | Una ronda completa, duración total >=60 s y acciones de combate válidas de cada premiado; abandonante no cobra |
| Ranked, límites | 80 puntos/día por personaje, entre ambos modos; máximo 3 encuentros premiados/día contra la misma cuenta rival | Mismo ID de partida no vuelve a pagar; cuentas propias en ambos equipos no cobran |
| Torneo automático | Campeón `100 + min(60, 2*N)`; finalista 30 | N = cuentas distintas al iniciar; mínimo 4; conservar el objeto existente 1245 y su entrega pendiente si no cabe |
| Hunger Games | Campeón `100 + min(60, 2*N)` | Mínimo 4 cuentas distintas y combate efectivo |
| Hunters Game | Baja 3; campeón `15 + 2*N` | Conservar oro actual, mínimo 3 cuentas, no repetir baja premiada de una cuenta en la misma edición |
| Blood Castle | Supervivientes 150; sumar 20 sólo al completar todos los objetivos dentro del tiempo | Sin premio en cancelación/derrota; participación efectiva registrada |
| Guerra de facciones | Ganadores 40; perdedores activos 10; MVP 15 | Mantener puntos faccionarios actuales; excluir AFK/expulsados y no premiar el mismo MVP varias veces por un fallo de cierre |

Se amplían puntos Quest, no la moneda premium. El tope diario se calcula por fecha de `America/Argentina/Buenos_Aires`. ELO se calcula igual; agotar el tope de premio no bloquea jugar. Un cierre fallido de API no anuncia puntos confirmados: se conserva como operación pendiente con el mismo ID para reintentar. Un ID reutilizado con participantes o resultado distinto se rechaza.

Los premios se entregan después de restaurar el estado temporal de arena/evento, o como saldo persistido que esa restauración no puede pisar. Los eventos que ya entregan oro/objetos conservan esos premios y deben pasar pruebas de cierre duplicado y mochila llena. No agregar premios a FFA o entrenamiento como parte de ranked.

## Aceptación de apertura

- Suite completa de servidor verde, incluida la regresión de apilado; integración de API verde sobre base exclusiva de pruebas; tipos y build de los tres componentes.
- Pruebas de transacciones concurrentes: donaciones contra el último saldo, dos subidas del mismo nivel, última plaza de clan, baja/cambio de líder durante una operación y guardado obsoleto de bóveda.
- Comparación pública de valores anteriores/propuestos; simulación reproducible por clase y tramo, con costes de consumibles y bonus de party/equipo. No afirmar que una simulación demuestra el balance humano.
- Navegador: login/relogin, inventario, equipamiento, PvE físico/mágico, party/loot, misiones, canje, banco/bóveda, mercado, ranked 1v1/2v2 y cada evento modificado. Capturas de rangos de NPC y panel de clan con donación, requisitos y subida real.
- Verificar que siguen pasando las pruebas y recorridos de mazmorras anteriores. Registrar cualquier sistema no probado como pendiente de apertura.
- No dejar cuentas, monedas, progreso ni objetos de prueba en los personajes existentes.

## Orden de ejecución

1. [Estabilidad y balance](../plans/2026-11-06-01-estabilidad-balance.md).
2. [Rangos de NPCs](../plans/2026-11-06-02-rangos-npc.md).
3. [Clanes y monedero Quest](../plans/2026-11-06-03-clanes.md).
4. [Premios ranked/eventos y validación](../plans/2026-11-06-04-premios-validacion.md).

Las tablas de economía son propuestas concretas para revisar, no cambios ya aplicados. Estado de los siete puntos originales: pendientes de implementación y validación.
