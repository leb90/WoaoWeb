# Premios ranked, eventos y apertura Implementation Plan

> Estado de ejecuci�n: cambios implementados en `feat/prioridad-1-apertura`. La evidencia y las limitaciones de los recorridos est�n en [VALIDACION_APERTURA](../../balance/VALIDACION_APERTURA_2026-11-06.md). Este documento conserva el plan original; sus listas no reemplazan ese registro.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar premios útiles, impedir cobros duplicados y dejar evidencia de los recorridos necesarios para abrir.
**Architecture:** Configuración única de premios, IDs de partida/edición persistentes y monedero Quest del plan de clanes. Ranked persiste resultado y premios juntos; UI muestra sólo saldos confirmados.
**Tech Stack:** TypeScript/tsx, PostgreSQL/Vitest, frontend Next y Playwright.
**Spec:** [Prioridad 1](../specs/2026-11-06-prioridad-1-apertura.md), sección 4 y aceptación.

## Global Constraints

- Premios exactos de la tabla propuesta; conservar oro/objetos actuales de eventos y separar moneda premium.
- Tope80Quest/día ranked, ambos modos, fecha Argentina; tres encuentros premiados por cuentas rivales.
- No cobrar por abandono propio, cancelación o cuentas propias en equipos rivales.
- Restaurar estado de arena antes de actualizar espejos personales de los premios persistidos.

## Review Focus

- API confirma pago pero respuesta se pierde; reintento tras reinicio paga cero adicional.
- Dos cierres simultáneos cruzan tope diario o primera victoria del día.
- Desconexión durante restauración deja saldo nuevo disponible al relogin.
- Premio de objeto con mochila llena no desaparece.
- Un evento termina con pocos participantes, AFK, abandono o cancelación.

### Task 1: Premios ranked y cierre repetible

**Files:** Crear `api/src/lib/gameRewardConfig.ts`, `api/src/tests/ranked-rewards.integration.test.ts`, `server/src/ranked/rankedRewards.test.ts`; modificar `api/src/repositories/ranked.ts`, `api/schema.sql`, `server/src/ranked/rankedRepository.ts`, `rankedArena.ts`, estado ranked y presentación en `frontend/components/WoaoHubModal.tsx`.
**Interfaces:** `completeRankedMatch` conserva ID estable y devuelve resultados/recibos por personaje; metadata de actividad se valida contra participantes. API calcula `questPoints`, `dailyAwarded`, `firstWinBonus` y `applied`. El servidor no envía montos autoritativos.

- [ ] Pruebas rojas: victoria8+primera12; derrota2; repetir ID conserva ELO, contadores y saldo; mismo ID con otro ganador se rechaza. Validar tamaños/equipos únicos de1v1/2v2.
- [ ] Probar partida<60s, cero acciones, sin ronda completa, abandono propio y misma cuenta en ambos equipos: cero puntos. Repetición cuarta contra misma cuenta: cero premio y ELO normal.
- [ ] Implementar cierre idempotente y saldo Quest en una transacción; bloquear registros de límite por personaje/fecha para que dos primeras victorias simultáneas den un solo bonus y no superen80.
- [ ] Persistir cierre pendiente antes de enviar a API; reintentos con mismo ID tras caída/reinicio. No anunciar premio confirmado si API falla; al reconectar leer saldo persistido.
- [ ] Probar fecha Argentina alrededor de medianoche y límite compartido entre modos. Validar navegador 1v1/2v2, scoreboard y relogin.

### Task 2: Premios de eventos

**Files:** Crear `server/src/eventRewards.ts`, `eventRewards.test.ts`, `api/src/repositories/eventRewards.ts`, `api/src/tests/event-rewards.integration.test.ts`; modificar `tournamentAuto.ts`, `hungerGames.ts`, `huntersGame.ts`, `bloodCastle.ts`, `factionWars.ts`, `woaoProgress.ts`, `api/src/server.ts`, `api/schema.sql`.
**Interfaces:** `grantEventReward({eventRunId, eventType, characterId, rewardKind, participation})` devuelve recibo idempotente. `participation` usa cuentas distintas al iniciar, acciones y resultado; montos calculados desde la configuración de API. El mismo recibo gobierna las llamadas existentes de oro/objetos para impedir doble cierre.

- [ ] Escribir pruebas rojas para cada fila de premios de eventos, cantidad de cuentas mínima y exclusión de AFK/cancelación/derrota. Una baja repetida de la misma cuenta en Hunters paga una vez.
- [ ] Crear ID persistente por edición y recibos por personaje/tipo. Migrar todos los escritores Quest a monedero; conservar puntos faccionarios actuales y bonus de MVP sin duplicaciones.
- [ ] Añadir campeón/finalista de torneo y fórmulas según N; el objeto1245 pasa a entrega pendiente si no cabe, con clave de premio estable. Probar cierre doble sin segundo oro, puntos ni objeto.
- [ ] Probar desconexión entre commit y confirmación: saldo recuperable y premio de objeto recuperable al relogin; si los premios existentes de oro no sobreviven ese corte, integrar su entrega pendiente con la misma clave antes de cerrar la tarea.
- [ ] Ejecutar una edición de cada evento cambiado y guardar evidencia de participantes efectivos, premiados y saldos antes/después.

### Task 3: Validación de apertura y entrega

**Files:** Crear `docs/balance/VALIDACION_APERTURA_2026-11-06.md`, capturas en `screenshots/apertura-2026-11-06/`; corregir sólo los nuevos fallos reproducidos, cada uno con su regresión.
**Interfaces:** Informe por sistema con resultado, comando/pasos, evidencia, dato de prueba retirado y pendientes. No usar una única marca verde para sistemas no recorridos.

- [ ] Preparar base y servicios exclusivos de pruebas; verificar destino antes de migraciones/fixtures. Ejecutar suite completa de API y servidor, tipos, lint de código modificado y builds.
- [ ] Hacer recorridos reales: login/relogin, movimiento, recoger/equipar, físico/magia, party y loot, aceptar/entregar/canjear, banco/bóveda, mercado, ranked y eventos.
- [ ] Repetir regresiones de mazmorra: puerta lateral, trampa exacta, segunda pisada, combate acuático, pared y reja. Capturar clanes y rangos, revisar errores de consola/servidor.
- [ ] Documentar hallazgos críticos nuevos con reproducción y corregirlos mediante prueba roja/verde. Revisar recompensas previstas frente a las observadas y ajustar sólo con evidencia registrada.
- [ ] Retirar personajes/recursos de prueba, comprobar diff final y marcar cada ítem original sólo si está implementado y probado. Dejar explícito cualquier bloqueo de apertura.
