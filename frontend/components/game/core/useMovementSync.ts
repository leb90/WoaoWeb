import { useCallback, type RefObject } from "react";
import type { Engine } from "../engine/Engine";

export type LocalPendingMove = {
    moveId: number;
    heading: number;
};

type UseMovementSyncOptions = {
    engineRef: RefObject<Engine | null>;
    localPendingMovesRef: RefObject<LocalPendingMove[]>;
    nextMoveIdRef: RefObject<number>;
    latestServerStateVersionRef: RefObject<number>;
    movementInputLockedUntilRef: RefObject<number>;
    movementInputResumeTimeoutRef: RefObject<number | null>;
    isMapChangeTransitionRef: RefObject<boolean>;
    movementKeyMapRef: RefObject<Map<string, number>>;
    movementPressCountsRef: RefObject<Map<number, number>>;
    movementKeyPriorityRef: RefObject<number[]>;
    pendingRemoteSnapshotsRef: RefObject<Map<number, any>>;
    pendingUserSnapshotRef: RefObject<any>;
    lastServerConfirmedSelfPositionRef: RefObject<any>;
    runtimeTimingRef: RefObject<any>;
    startMapChangeTransition: (
        targetMap: number,
        engine: Engine | null,
        detail: string,
    ) => void;
    tryRebaseToMap: (engine: Engine | null, targetMap: number) => boolean;
    mergeHud: (patch: any) => void;
};

export function useMovementSync({
    engineRef,
    localPendingMovesRef,
    nextMoveIdRef,
    latestServerStateVersionRef,
    movementInputLockedUntilRef,
    movementInputResumeTimeoutRef,
    isMapChangeTransitionRef,
    movementKeyMapRef,
    movementPressCountsRef,
    movementKeyPriorityRef,
    pendingRemoteSnapshotsRef,
    pendingUserSnapshotRef,
    lastServerConfirmedSelfPositionRef,
    runtimeTimingRef,
    startMapChangeTransition,
    tryRebaseToMap,
    mergeHud,
}: UseMovementSyncOptions) {
    const syncMovementState = useCallback(
        (engine: Engine) => {
            if (isMapChangeTransitionRef.current) {
                engine.keydown = {};
                engine.movementKeyPriority = [];
                engine.clearScheduledMovementCheck();
                return;
            }

            engine.keydown = {};

            for (const [keyCode, count] of movementPressCountsRef.current) {
                if (count > 0) {
                    engine.keydown[keyCode] = true;
                }
            }

            engine.movementKeyPriority = movementKeyPriorityRef.current.filter(
                (keyCode) => engine.keydown[keyCode],
            );

            if (engine.movementKeyPriority.length === 0) {
                engine.clearScheduledMovementCheck();
                return;
            }

            engine.check();
        },
        [
            isMapChangeTransitionRef,
            movementKeyPriorityRef,
            movementPressCountsRef,
        ],
    );

    const clearMovementInputState = useCallback(
        (engine?: Engine | null) => {
            movementKeyMapRef.current.clear();
            movementPressCountsRef.current.clear();
            movementKeyPriorityRef.current = [];

            if (movementInputResumeTimeoutRef.current !== null) {
                window.clearTimeout(movementInputResumeTimeoutRef.current);
                movementInputResumeTimeoutRef.current = null;
            }

            if (!engine) {
                return;
            }

            engine.keydown = {};
            engine.movementKeyPriority = [];
            engine.clearScheduledMovementCheck();

            if (engine.user) {
                engine.resetMovement(engine.user);
            }
        },
        [
            movementInputResumeTimeoutRef,
            movementKeyMapRef,
            movementKeyPriorityRef,
            movementPressCountsRef,
        ],
    );

    const clearEngineMovementState = useCallback((engine?: Engine | null) => {
        if (!engine) {
            return;
        }

        engine.keydown = {};
        engine.movementKeyPriority = [];
        engine.clearScheduledMovementCheck();

        if (engine.user) {
            engine.resetMovement(engine.user);
        }
    }, []);

    const lockMovementInput = useCallback(
        (engine?: Engine | null, durationMs = 60) => {
            movementInputLockedUntilRef.current =
                performance.now() + Math.max(0, durationMs);
            clearEngineMovementState(engine);

            if (movementInputResumeTimeoutRef.current !== null) {
                window.clearTimeout(movementInputResumeTimeoutRef.current);
            }

            movementInputResumeTimeoutRef.current = window.setTimeout(
                () => {
                    movementInputResumeTimeoutRef.current = null;

                    const activeEngine = engineRef.current;

                    if (
                        !activeEngine ||
                        performance.now() < movementInputLockedUntilRef.current
                    ) {
                        return;
                    }

                    syncMovementState(activeEngine);
                },
                Math.max(0, durationMs),
            );
        },
        [
            clearEngineMovementState,
            engineRef,
            movementInputLockedUntilRef,
            movementInputResumeTimeoutRef,
            syncMovementState,
        ],
    );

    const canProcessMovementInput = useCallback(() => {
        return (
            !isMapChangeTransitionRef.current &&
            performance.now() >= movementInputLockedUntilRef.current
        );
    }, [isMapChangeTransitionRef, movementInputLockedUntilRef]);

    const clearPendingLocalMoves = useCallback(() => {
        localPendingMovesRef.current = [];
    }, [localPendingMovesRef]);

    const retainPendingRemoteSnapshotsForMap = useCallback(
        (targetMap: number) => {
            const engine = engineRef.current;
            for (const [
                entityId,
                snapshot,
            ] of pendingRemoteSnapshotsRef.current) {
                // Con mundo continuo también valen los vecinos cargados.
                const isVisibleMap =
                    snapshot.map === targetMap ||
                    Boolean(engine?.isMapLoadedInWorld(snapshot.map));
                if (!isVisibleMap) {
                    pendingRemoteSnapshotsRef.current.delete(entityId);
                }
            }
        },
        [engineRef, pendingRemoteSnapshotsRef],
    );

    const resetMovementSyncState = useCallback(() => {
        localPendingMovesRef.current = [];
        nextMoveIdRef.current = 1;
        latestServerStateVersionRef.current = 0;
        movementInputLockedUntilRef.current = 0;
        isMapChangeTransitionRef.current = false;

        if (movementInputResumeTimeoutRef.current !== null) {
            window.clearTimeout(movementInputResumeTimeoutRef.current);
            movementInputResumeTimeoutRef.current = null;
        }
    }, [
        isMapChangeTransitionRef,
        latestServerStateVersionRef,
        localPendingMovesRef,
        movementInputLockedUntilRef,
        movementInputResumeTimeoutRef,
        nextMoveIdRef,
    ]);

    const consumeAcknowledgedLocalMoves = useCallback(
        (lastProcessedMoveId: number) => {
            if (lastProcessedMoveId <= 0) {
                return;
            }

            localPendingMovesRef.current = localPendingMovesRef.current.filter(
                (move) => move.moveId > lastProcessedMoveId,
            );
        },
        [localPendingMovesRef],
    );

    const computePredictedPositionFromPendingMoves = useCallback(
        (
            engine: Engine,
            map: number,
            origin: { x: number; y: number },
        ): { map: number; x: number; y: number } => {
            let currentX = origin.x;
            let currentY = origin.y;

            if (map !== engine.mapNumber) {
                return { map, x: currentX, y: currentY };
            }

            if (engine.user?.tInmo || engine.user?.tParalizado) {
                return { map, x: currentX, y: currentY };
            }

            for (const move of localPendingMovesRef.current) {
                let nextX = currentX;
                let nextY = currentY;

                if (move.heading === engine.DIRECTIONS.RIGHT) {
                    nextX += 1;
                } else if (move.heading === engine.DIRECTIONS.LEFT) {
                    nextX -= 1;
                } else if (move.heading === engine.DIRECTIONS.DOWN) {
                    nextY += 1;
                } else if (move.heading === engine.DIRECTIONS.UP) {
                    nextY -= 1;
                }

                if (engine.legalPos(nextX, nextY, move.heading)) {
                    currentX = nextX;
                    currentY = nextY;
                }
            }

            return { map, x: currentX, y: currentY };
        },
        [localPendingMovesRef],
    );

    const reconcileOwnPositionWithServer = useCallback(
        async (
            engine: Engine,
            payload: {
                map: number;
                x: number;
                y: number;
                heading: number;
                lastProcessedMoveId: number;
                stateVersion: number;
            },
        ) => {
            const currentUser = engine.user;

            if (!currentUser) {
                return;
            }

            if (payload.stateVersion < latestServerStateVersionRef.current) {
                return;
            }

            latestServerStateVersionRef.current = payload.stateVersion;
            consumeAcknowledgedLocalMoves(payload.lastProcessedMoveId);
            lastServerConfirmedSelfPositionRef.current = {
                map: payload.map,
                x: payload.x,
                y: payload.y,
            };

            const isMovementRestricted = Boolean(
                currentUser.tInmo || currentUser.tParalizado,
            );
            // Mundo continuo: si el servidor confirma al jugador en un mapa
            // vecino ya dibujado, primero se cambia el marco del motor y recién
            // después se proyectan los pasos pendientes (ya en el mapa nuevo).
            if (payload.map !== engine.mapNumber) {
                tryRebaseToMap(engine, payload.map);
            }

            const predictedTarget = isMovementRestricted
                ? { map: payload.map, x: payload.x, y: payload.y }
                : computePredictedPositionFromPendingMoves(
                      engine,
                      payload.map,
                      {
                          x: payload.x,
                          y: payload.y,
                      },
                  );
            const targetHeading = isMovementRestricted
                ? payload.heading
                : (localPendingMovesRef.current.at(-1)?.heading ??
                  payload.heading);

            pendingUserSnapshotRef.current = pendingUserSnapshotRef.current
                ? {
                      ...pendingUserSnapshotRef.current,
                      map: predictedTarget.map,
                      pos: { x: predictedTarget.x, y: predictedTarget.y },
                      heading: targetHeading,
                      stateVersion: payload.stateVersion,
                  }
                : null;

            if (predictedTarget.map !== engine.mapNumber) {
                clearPendingLocalMoves();
                lockMovementInput(engine);
                mergeHud({
                    map: predictedTarget.map,
                    pos: { x: predictedTarget.x, y: predictedTarget.y },
                });
                startMapChangeTransition(
                    predictedTarget.map,
                    engine,
                    `Cambiando al mapa ${predictedTarget.map}...`,
                );
                return;
            }

            const currentMap = currentUser.map;
            const currentX = currentUser.pos.x;
            const currentY = currentUser.pos.y;
            // Las distancias se miden en el marco del mundo: el tile de exit del
            // mapa viejo y el primer tile del vecino son la misma posición.
            const currentViewerTile = engine.getViewerTile({
                map: currentMap,
                pos: { x: currentX, y: currentY },
            }) ?? { x: currentX, y: currentY };
            const predictedViewerTile = engine.getViewerTile({
                map: predictedTarget.map,
                pos: { x: predictedTarget.x, y: predictedTarget.y },
            }) ?? { x: predictedTarget.x, y: predictedTarget.y };
            const deltaX = predictedViewerTile.x - currentViewerTile.x;
            const deltaY = predictedViewerTile.y - currentViewerTile.y;
            const manhattanDistance = Math.abs(deltaX) + Math.abs(deltaY);
            const isSameWorldTile =
                engine.isEntityMapVisible(currentMap) &&
                manhattanDistance === 0;

            currentUser.heading = targetHeading;
            currentUser.stateVersion = payload.stateVersion;

            if (isSameWorldTile) {
                // Mismo lugar (quizá expresado en el mapa vecino): se actualizan
                // mapa y coordenadas sin tocar la animación del paso en curso.
                currentUser.map = predictedTarget.map;
                currentUser.pos.x = predictedTarget.x;
                currentUser.pos.y = predictedTarget.y;
                currentUser.pixelX = predictedTarget.x;
                currentUser.pixelY = predictedTarget.y;
                mergeHud({
                    map: predictedTarget.map,
                    pos: { x: predictedTarget.x, y: predictedTarget.y },
                });
                return;
            }

            currentUser.map = predictedTarget.map;

            if (manhattanDistance === 1) {
                engine.resetMovement(currentUser, {
                    preserveAnimationFrame: true,
                });
                engine.offsetCounterX = 0;
                engine.offsetCounterY = 0;
                engine.moveCharByPos(
                    currentUser.id,
                    predictedTarget.x,
                    predictedTarget.y,
                    {
                        heading: targetHeading,
                        durationMs: runtimeTimingRef.current.walkStepMs,
                        map: predictedTarget.map,
                    },
                );
                currentUser.heading = targetHeading;
            } else {
                engine.snapCharacter(
                    currentUser.id,
                    predictedTarget.x,
                    predictedTarget.y,
                    targetHeading,
                );
            }

            mergeHud({
                map: predictedTarget.map,
                pos: { x: predictedTarget.x, y: predictedTarget.y },
            });
        },
        [
            clearPendingLocalMoves,
            computePredictedPositionFromPendingMoves,
            consumeAcknowledgedLocalMoves,
            lastServerConfirmedSelfPositionRef,
            latestServerStateVersionRef,
            localPendingMovesRef,
            lockMovementInput,
            mergeHud,
            pendingUserSnapshotRef,
            runtimeTimingRef,
            startMapChangeTransition,
            tryRebaseToMap,
        ],
    );

    return {
        canProcessMovementInput,
        clearEngineMovementState,
        clearMovementInputState,
        clearPendingLocalMoves,
        computePredictedPositionFromPendingMoves,
        consumeAcknowledgedLocalMoves,
        lockMovementInput,
        reconcileOwnPositionWithServer,
        resetMovementSyncState,
        retainPendingRemoteSnapshotsForMap,
        syncMovementState,
    };
}
