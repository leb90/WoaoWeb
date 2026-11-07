# Estabilidad y balance Implementation Plan

> Estado de ejecuci�n: cambios implementados en `feat/prioridad-1-apertura`. La evidencia y las limitaciones de los recorridos est�n en [VALIDACION_APERTURA](../../balance/VALIDACION_APERTURA_2026-11-06.md). Este documento conserva el plan original; sus listas no reemplazan ese registro.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir los fallos de inventario y oro reproducidos, entregar misiones sin pérdidas y establecer un balance medible.
**Architecture:** Mantener módulos actuales; planificar los cambios de inventario antes de aplicarlos. Las reglas de recompensa y los informes se separan de transporte y persistencia.
**Tech Stack:** TypeScript, Node/tsx, Next/Pixi, API Express/PostgreSQL.
**Spec:** [Prioridad 1](../specs/2026-11-06-prioridad-1-apertura.md), secciones 1 y aceptación.

## Global Constraints

- Apilado por ID más rareza efectiva; máximo 10.000 por pila; no tocar el equipo al consolidar mochila.
- EXP global 5, oro global 3; conservar separación de balance PvP.
- No sobrescribir cambios locales de progreso ni capturas. Datos de prueba en entorno exclusivo.

## Review Focus

- Mochila llena con pila compatible o con hueco liberado por un requisito de misión.
- Sorteo de varias rarezas para un mismo premio y desborde de 10.000 unidades.
- Muerte de NPC procesada dos veces; NPC con oro base y drops monetarios adicionales.
- Misiones activas previas al nuevo mínimo de nivel.
- Datos cargados desde DB que pisan JSON de semillas al arrancar.

### Task 1: Apilado y cobertura habitual

**Files:** Modificar `server/src/itemRarity.ts`, `itemRarity.test.ts`, `equipmentStorage.ts`, `game.ts`, `server/package.json`; ampliar `equipmentStorage.test.ts` y `inventoryStacking.test.ts`.
**Interfaces:** Conservar `canStackWith(slotItem, idItem, rarity): boolean` y las interfaces públicas de `equipmentStorage`; usar rareza efectiva en todas las rutas de capacidad/traslado.

- [ ] Ejecutar `corepack pnpm exec tsx --test src/inventoryStacking.test.ts`; confirmar los cuatro fallos iniciales.
- [ ] Reemplazar la expectativa vieja de rarezas no apilables por casos que exijan igualdad de mejora y diferencia entre mejoras; agregar consolidación al cargar y equipar/desequipar sin crear unidades.
- [ ] Corregir regla y rutas de transferencia que fallen; conservar equipo en slots 22–27 y sumas por rareza.
- [ ] Agregar `test` de servidor que descubra todos los `.test.ts` de forma compatible con Windows, sin depender de expansión de glob del shell.
- [ ] Ejecutar suite completa; las cuatro regresiones y las pruebas de equipo deben pasar, y el comando habitual debe incluirlas.

### Task 2: Oro de NPC y entrega de misión

**Files:** Crear `server/src/npcRewards.test.ts`, `questRewards.ts`, `questRewards.test.ts`; modificar `npcs.ts`, `quests.ts` y los puntos de procesamiento de muerte en `game.ts`.
**Interfaces:** `planQuestInventory(inv, requiredItems, rolledRewards): {ok: true, inventory} | {ok: false, reason}` sin modificar la entrada; consumir exactamente ese resultado. Oro base se reparte por el flujo de muerte una sola vez mediante `distribuirOroNpc` existente.

- [ ] Escribir y ejecutar pruebas rojas: oro100/dropvacío paga300; oro100/dropmonetario10 al100% paga330; doble notificación de la misma muerte paga330 en total.
- [ ] Escribir y ejecutar pruebas rojas: misión con mochila llena y pila compatible cabe; requisito consume último objeto y libera hueco; dos rarezas diferentes no caben en un solo hueco; rechazo conserva inventario/oro/EXP/puntos y misión activa.
- [ ] Implementar pago de oro y preplan de inventario; incluir clamp de oro y validación de cantidades finitas. No sortear premios de nuevo al aplicar el plan.
- [ ] Verificar entrega/consumo reales mediante los handlers existentes, no sólo funciones auxiliares; pasar regresiones de party y equipo con bonus.

### Task 3: Datos de misiones y fuentes de materiales

**Files:** Crear `server/src/scripts/reportOpeningBalance.ts`, `server/src/openingBalance.test.ts`, `docs/balance/APERTURA_PVE.md`; modificar `server/jsons/quests.json`, copias en `frontend/public/init/`, semillas `api/src/jsons/npcs.json`, `server/jsons/npcs.json` y `api/src/dataMigrations.ts`.
**Interfaces:** Reporte sólo lectura con `--seed` y `--output`; consumir reglas y tablas exactas de la sección 1 de la spec. Migración versionada aplica una sola vez los cambios de drops a templates existentes.

- [ ] Escribir pruebas rojas de los 36 mínimos de nivel y fórmula EXP; validar referencias, fuentes de materiales con spawn accesible y probabilidades 0–100.
- [ ] Producir informe antes/después con EXP por objetivo/HP, oro base y monetario separado y precios de consumibles. Incluir las rutas de mapa de los cinco NPCs fuente y las seis entradas de materiales.
- [ ] Aplicar tabla de mínimos/EXP y nuevos drops; aceptar y terminar misiones usan el mismo criterio; conservar misiones ya activas.
- [ ] Probar migración dos veces en DB exclusiva: mismo resultado, no duplicar entradas de drop ni pisar cambios administrativos posteriores a su aplicación.
- [ ] Verificar suites, `tsc --noEmit` y recorrido de misión inicial más misión avanzada, con capturas y tabla de resultados.

## Comprobación final

- [ ] `corepack pnpm test` en servidor incluye todos los archivos; `corepack pnpm test` en API usa exclusivamente servicios/base de prueba; `corepack pnpm exec tsc --noEmit` en API, servidor y frontend.
- [ ] Registrar limitaciones observadas sin marcar como corregidos sistemas no ejecutados.
