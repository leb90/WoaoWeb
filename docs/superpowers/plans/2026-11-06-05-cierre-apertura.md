# Cierre de validación de apertura Implementation Plan

**Goal:** Retirar temporales del repositorio y completar las verificaciones pendientes solicitadas.
**Architecture:** Pruebas de juego en base y almacenamiento exclusivos; mediciones sobre handlers reales. Cambios productivos sólo al reproducir un fallo o justificar un ajuste de NPC.
**Tech Stack:** TypeScript, PostgreSQL, Next.js, Playwright.
**Spec:** Solicitud de seguimiento: logs, leveleo/oro/daño de NPC, ranked 2v2, eventos, sistemas, mazmorras y NPC 570.

## Global Constraints

- Conservar vida, daño, hechizos, atributos y tablas de balance de jugadores.
- Ajustes de balance autorizados: EXP, oro y daño de NPCs, con evidencia antes/después.
- Mantener capturas finales y documentación. Eliminar logs, snapshots y controles temporales; ignorar futuras ejecuciones locales.
- No tocar progreso real ni reutilizar cuentas de jugadores. Fixtures bajo base terminada en `_test` y `WOAO_DATA_DIR` aislado.
- Continuar en `feat/prioridad-1-apertura`, pushear y actualizar el PR 135 con resultados e imágenes.

## Review Focus

- Distinguir mediciones reales de estimaciones y aceleraciones de tiempo; documentar ambas.
- Validar resultados y recursos antes/después de 2v2 y cada evento; no confundir una llamada al cierre con una partida.
- NPC 570: recuperar definición legítima o corregir referencia tras comprobar el original; no inventar stats.
- Registrar problemas de sistemas/mazmorras encontrados y cubrir correcciones con regresiones.

### Task 1: Limpieza y reproducción

- [x] Eliminar `.run-logs/` y `.playwright-mcp/` del árbol entregado e ignorar nuevas ejecuciones; conservar evidencia final fuera de temporales.
- [x] Investigar NPC 570 en fuentes, colocaciones y datos migrados; reproducir referencia sin plantilla mediante test, corregir causa y verificar arranque.

### Task 2: Juego, leveleo y economía

- [x] Preparar personajes entrenados de distintas clases, niveles y equipos de venta en base exclusiva.
- [x] Medir bajas, EXP, oro, tiempo efectivo, daño recibido, consumibles y muertes: 23 sesiones / 69 minutos de personajes; cuatro clases. Ver `docs/balance/SESIONES_PVE_2026-11-07.md`.
- [x] Revisar progresión y fuentes de oro frente a costes. Corregir doble pago sin retocar números a partir de muestras cortas. Balance de jugadores intacto.
- [ ] Ampliar duración, clases, equipos y rutas antes de certificar balance integral.

### Task 3: Recorridos y publicación

- [x] Completar ranked 2v2, torneo, Hunters y guerra; verificar premios, salida y restauración. Blood Castle conserva la evidencia anterior, con vida de objetivos reducida, del informe del 6 de noviembre.
- [x] Recorrer misión, banco personal/cuenta/clan, comercio, subastas y mecánicas de prueba; party en 2v2 e inventario en recorridos previos. Capturas y resultados en el informe de cierre.
- [ ] Completar todas las salas y jefes de las seis campañas de desarrollo; se comprobaron entrada, carga de instancia y salida.
- [x] Ejecutar suites, tipos y builds; 139 pruebas de servidor y 103 de API, sin fallos. Wiki e informe actualizados y capturas comprobadas. Servicios, base y sesiones de fixture retirados.
- Publicación: commit, push de `feat/prioridad-1-apertura` y actualización del PR 135 con explicación, capturas y alcance de validación.
