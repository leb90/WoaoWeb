# Implementación y validación de apertura

Rama: `feat/prioridad-1-apertura`, desde `main` (`2ef0564b`). Fecha: 6 de noviembre de 2026.

## Cambios entregados

| Sistema | Comportamiento implementado |
| --- | --- |
| Inventario | Mismo objeto y mejora efectiva comparten pila de hasta 10.000; otras mejoras quedan separadas. La carga consolida pilas de mochila y conserva el equipo. |
| PvE y misiones | Oro base de NPC, además de drops monetarios explícitos, una vez por muerte; entrega de misión planificada antes de consumir requisitos. 36 mínimos de nivel y premios EXP revisados. |
| Rangos de NPC | Normal, Mejorado, Líder, Especial y Legendario, con vida, daño, EXP, oro y probabilidades de drop propias. Se sortean en apariciones naturales elegibles y respawns; no se acumulan al recargar datos. |
| Clanes | Niveles comprables 1–6, cupos 30/33/36/39/42/45 y castillos 3–8. Requisitos de `old`, puntos Quest colectivos y botón exclusivo del líder. Donaciones de cualquier miembro; materiales y oro desde bóveda. |
| Economía Quest | Saldo persistido y versionado en PostgreSQL, importación del saldo previo una sola vez, débitos atómicos y recibos por operación. Journals locales para premios, resultados ranked y canjes pendientes. Moneda premium separada. |
| Ranked | Victoria 8, derrota activa 2, primera victoria +12; máximo 80 diarios entre ambos modos, fecha Argentina, tres encuentros premiados por cuenta rival. Duración mínima 60 segundos; sin premio por abandono propio, inactividad o rivales de la misma cuenta. |
| Eventos | Torneo: campeón 100 + min(60, 2N), finalista 30, al menos cuatro cuentas; Hunters: baja 3 y campeón 15 + 2N, al menos tres cuentas; Blood Castle: superviviente 150 + 20 por completar; guerra: victoria 40, derrota activa 10 y MVP 15. Los premios requieren actividad. |
| Estabilidad | Blood Castle valida mapa, orden de objetivos y tiempo; carga API de catálogos grandes sin ENOBUFS; NPC universal de misiones incluido en semillas API; esquema inicial sin referencia prematura a `clan_members`; builds compatibles con Windows. |
| Cliente y wiki | Vida de NPC transmitida en 32 bits; color de rango en objetivo; panel de clanes con scroll y cierre visible. Guías de comunidad, combate, competitivo y eventos con siete imágenes reales. |

Los costes y beneficios de clan se compararon con `ModClanes.bas`, `Modulo_UsUaRiOs.bas`, `SistemaCombate.bas` y `modHechizos.bas` de `old/Nuevo Motor Graf/Servidor 7.0/Codigo/`; las cantidades verificadas y descontadas coinciden. Los antiguos Juegos del Hambre continúan deshabilitados: el evento vigente es Hunters Game.

## Evidencia automática

| Verificación | Resultado observado |
| --- | --- |
| Servidor: `corepack pnpm test` | 129 aprobadas, 0 fallos, incluyendo regresiones de mazmorras. |
| API: Vitest contra servicios y base exclusivos de prueba | 102 aprobadas en 17 archivos, 0 fallos. |
| TypeScript API, servidor y frontend | Sin errores; también ejecutado durante los tres builds. |
| `corepack pnpm run build`, en cada paquete | API, servidor y frontend compilaron. Next generó sus 56 páginas estáticas. |
| ESLint de UI modificada y módulos nuevos/de economía/eventos | Sin errores. |
| Esquema/migraciones sobre base exclusiva | Aplicación inicial y reaplicación exitosas. |
| Informe de combate | 48 cruces del motor real, 500 intentos por cruce; semilla fija. Ver [APERTURA_COMBATE](APERTURA_COMBATE.md). |

Se verificaron doble cierre de ranked, recibos repetidos con datos distintos, cobros concurrentes, primera victoria concurrente, límite diario compartido, cuarta partida con la misma cuenta, autoenfrentamiento y fecha Argentina. En clanes: doble donación, dos subidas del mismo nivel, último lugar disputado, migración del nivel antiguo y bóveda obsoleta. En misiones: mochila llena, pila compatible, rechazo sin consumo y entrega real del handler sin duplicar EXP, oro ni Quest. Los tests de canje simulan respuesta perdida después del cobro y comprueban una sola entrega.

Para repetir API, preparar una base cuyo nombre termine en `_test`, aplicar `api/schema.sql`, iniciar la API contra esa base y configurar `DATABASE_URL`, `API_TEST_URL` y `API_TEST_AUTH` antes de `corepack pnpm test`. Los tests de transacciones nuevas rechazan expresamente una base sin ese sufijo. No usar datos de jugadores para esta validación.

## Recorridos reales en navegador

Se usó una base nueva `woao_opening_test`, API en 3101, servidor de juego en 7766 y almacenamiento aislado mediante `WOAO_DATA_DIR`. El control de fixtures estuvo limitado a localhost y no forma parte del código entregado. Se forzó el rango de una criatura para fotografiarlo y se redujo la vida de los objetivos de Blood Castle para acelerar la prueba; el combate, la interfaz y los cobros usaron los handlers reales.

| Recorrido | Resultado y captura |
| --- | --- |
| Login y reconexión | Saldo Quest recuperado desde PostgreSQL y pilas de equipo conservadas. |
| Donación al clan | 50 puntos menos en el jugador y 50 en el clan. [Imagen](../../frontend/public/wiki/apertura/clan-donacion.png). |
| Compra de nivel 2 | Consume 300.000 oro, un Huevo Dragón y 50 Quest. Nivel 2, cupo 33 y cuatro por castillo. [Imagen](../../frontend/public/wiki/apertura/clan-nivel-2.png). |
| Requisitos y ventana pequeña | Botón deshabilitado si faltan puntos; cierre permanece en pantalla y contenido tiene scroll. [Imagen](../../frontend/public/wiki/apertura/clan-requisitos.png). |
| Equipo mejorado | Cuatro Espadas MataDragones épicas juntas; otra mejora separada, equipar y desequipar desde UI sin crear unidades. [Imagen](../../frontend/public/wiki/apertura/inventario-mejoras.png). |
| Rango de criatura | Lobo Legendario, nombre/color y vida 75/300 en objetivo. [Imagen](../../frontend/public/wiki/apertura/npc-rangos.png). |
| Ranked 1v1 | Serie 2–1 de 52 segundos: sin monedas. Segunda serie 2–0 de más de 60 segundos: +20 al ganador, +2 al rival activo; saldo 50→70 confirmado en Premios. [Imagen](../../frontend/public/wiki/apertura/ranked-premio.png). |
| Blood Castle | Guardián antes del jefe, victoria, espera de tesoros y +170 Quest confirmados; saldo 70→240. [Imagen](../../frontend/public/wiki/apertura/evento-premio.png). |
| Canje Quest | Capa Hobbit por 100 puntos, entrega en inventario y saldo 190→90 tras otra donación de 50. [Imagen](../../screenshots/apertura-2026-11-06/canje-quest.png). |
| Wiki | Cuatro guías abiertas en navegador: comunidad (3 imágenes), combate (2), competitivo (1) y eventos (1); ninguna imagen rota. Capturas en `screenshots/apertura-2026-11-06/`. |

Al terminar se detuvieron los tres servicios de prueba, se eliminó exclusivamente `woao_opening_test` y se retiraron las sesiones y archivos con tokens de fixture. El control temporal de localhost ya no escucha. Los archivos locales previos `server/data/woaoProgress.json` y `server/jsons/bossEvents.json` se excluyen del commit.

## Despliegue y alcance de la validación

Desplegar API, servidor y frontend de esta rama juntos: el protocolo de vida de NPC pasa de 16 a 32 bits. El arranque de API aplica esquema y migraciones de datos; los cambios de drops se aplican una vez para respetar posteriores ajustes del administrador. Conservar el volumen `/app/data`: contiene progresión previa y journals de reintentos. No ejecutar el generador de balance con `--apply` sobre producción.

Las tablas de la wiki se generan desde la configuración con `corepack pnpm export-opening-guides` en `server`. `corepack pnpm balance-opening` vuelve a generar los informes. [APERTURA_PVE](APERTURA_PVE.md) detalla economía, misiones y fuentes de materiales.

El estado al 6 de noviembre dejaba pendientes las mediciones de EXP/hora, ranked 2v2, otros eventos, banco/mercado, recorridos de mazmorras y la advertencia del NPC 570. El [seguimiento del 7 de noviembre](CIERRE_APERTURA_2026-11-07.md) registra las correcciones posteriores, partidas, capturas, muestras PvE y límites actuales. Ninguno de estos informes equivale a una certificación global de apertura ni al balance integral de todas las clases.
