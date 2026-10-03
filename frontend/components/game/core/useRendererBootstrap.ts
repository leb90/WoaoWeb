/* eslint-disable react-hooks/immutability */
import { useEffect, type RefObject } from "react";
import {
    Application,
    Container,
    FederatedPointerEvent,
    Rectangle,
    Text,
    TextStyle,
} from "pixi.js";
import {
    createAttackMeleePacket,
    createAttackRangePacket,
    createAttackSpellPacket,
    createChangeHeadingPacket,
    createClickPacket,
    createPositionPacket,
} from "../../../lib/aowProtocol";
import {
    getViewportRotation,
    screenDeltaToLocal,
} from "../../../lib/viewportRotation";
import { createDebugGrid } from "../rendering/debugGrid";
import {
    BACKGROUND_FRAME_BUDGET_MS,
    markMapRendered,
} from "../world/worldStreaming";
import {
    createEntityFXRowContainers,
    createMapRowLayerContainers,
    createRoofRowContainers,
} from "../rendering/rowLayerContainers";
import { destroySharedTextureCaches } from "../rendering/textureCaches";
import { createWeatherOverlay } from "../rendering/weatherFx";
import {
    getHudStatusTextStyle,
    setTextIfChanged,
} from "../rendering/textStyles";
import { Engine } from "../engine/Engine";
import {
    isAdminInspector,
    buildInspectableNpc,
    canInspectNpc,
    findVisibleEntityAtExactTile,
    findInspectableNpcAtTile,
    findRevivableCharacterAtTile,
} from "../admin/npcInspector";

// Medio lado, en píxeles, del área clickeable del mundo (sobra para 3x3 mapas).
const WORLD_HIT_AREA_HALF_SIZE = 1_000_000;

type ManualConnectionConfig = {
    wsUrl: string;
    ticket: string;
    typeGame?: number;
    idChar?: number;
    sessionKey: string;
};

type UseRendererBootstrapOptions = {
    isMounted: boolean;
    canvasRef: RefObject<HTMLDivElement | null>;
    rendererRootRef: RefObject<HTMLDivElement | null>;
    connection?: ManualConnectionConfig | null;
    mapNumber: number;
    screenSize: { width: number; height: number };
    sharedTextureCachesRef: RefObject<any>;
    runtimeTimingRef: RefObject<any>;
    partyMemberIdsRef: RefObject<Set<string>>;
    engineRef: RefObject<any>;
    pendingUserSnapshotRef: RefObject<any>;
    websocketRef: RefObject<WebSocket | null>;
    nextMoveIdRef: RefObject<number>;
    localPendingMovesRef: RefObject<any[]>;
    playerHudRef: RefObject<any>;
    pingTextRef: RefObject<any>;
    seguroTextRef: RefObject<any>;
    clanSeguroTextRef: RefObject<any>;
    debugCombatTextRef: RefObject<any>;
    fpsDisplayTextRef: RefObject<string>;
    pingDisplayTextRef: RefObject<string>;
    onFpsSample?: (fps: number | null) => void;
    activeDialogMessagesRef: RefObject<Map<number, any>>;
    activeCastBarsRef: RefObject<Map<number, any>>;
    latestStatusRef: RefObject<any>;
    currentMapRef: RefObject<number>;
    lastWorldPointerTileRef: RefObject<any>;
    targetingModeRef: RefObject<any>;
    isMapChangeTransitionRef: RefObject<boolean>;
    movementInputLockedUntilRef: RefObject<number>;
    movementInputResumeTimeoutRef: RefObject<number | null>;
    setNpcContextMenu: (value: any) => void;
    setDeadCharacterContextMenu: (value: any) => void;
    npcContextMenuOpenedAtRef: RefObject<number>;
    setIsSceneReady: (value: boolean) => void;
    setError: (value: string | null) => void;
    setIsLoading: (value: boolean) => void;
    setHasCompletedInitialLoad: (value: boolean) => void;
    setClientReadySessionKey: (value: string | null) => void;
    preloadInitialVisibleMapAssets: (
        engine: any,
        snapshot: any,
    ) => Promise<any>;
    preloadCurrentSceneAssets: (engine: any, snapshot: any) => Promise<void>;
    applyPendingTileStates: (engine: any) => void;
    updateLoadingProgress: (
        stage: any,
        progress: number,
        detail: string,
    ) => void;
    clearLoadingProgress: () => void;
    renderMap: (engine: any, options?: any) => Promise<void>;
    flushBufferedRemoteEntities: (engine: any, bounds?: any) => Promise<void>;
    renderPlayer: (engine: any) => Promise<void>;
    setWorldVisibility: (engine: any, visible: boolean) => void;
    updateSeguroIndicators: (hud: any) => void;
    updateDebugCombatText: () => void;
    warmCommonCharacterAssets: (engine: any) => Promise<void>;
    prepareWorldLayout: (engine: any) => Promise<boolean>;
    streamWorldNeighbors: (engine: any, clipBounds?: any) => Promise<void>;
    applyOwnCharacterSnapshot: (engine: any, snapshot: any) => Promise<void>;
    syncMovementState: (engine: any) => void;
    mergeHud: (patch: any) => void;
    playStepSound: (engine: any, entityId: number) => void;
    renderRemoteEntity: (engine: any, entity: any) => Promise<void>;
    canProcessMovementInput: () => boolean;
    recordClientGameAction: (
        action: string,
        details?: Record<string, unknown>,
    ) => void;
    canStartLocalCombatAction: (action: "melee" | "range" | "spell") => boolean;
    registerLocalCombatAction: (action: "melee" | "range" | "spell") => void;
    updateCanvasCursor: () => void;
    clearTargetingMode: () => void;
    getEquippedWeaponItem: () => any;
    pushSystemMessage: (text: string, color?: string) => void;
    resolveCombatReleaseTarget: (
        engine: any,
        event: any,
        interaction: any,
    ) => any;
    resolveSpellReleaseTarget: (
        engine: any,
        event: any,
        interaction: any,
    ) => any;
    recordSpellTargetSnap: (sample: any) => void;
    registerDebugSpellAttempt: () => void;
    clearUseItemQueues: () => void;
    resetMovementSyncState: () => void;
    updateActiveDialogBubblePositions: (engine: any) => void;
    updateActiveCastBarPositions: (engine: any) => void;
    updateEntityFXPositions: (engine: any) => void;
    debugCombatOverlayTextRef: RefObject<string>;
    setInspectedNpc: (value: any) => void;
};

// Pixi mapea el toque usando getBoundingClientRect del canvas, que con la
// vista rotada por CSS (bloqueo de orientación en mobile) devuelve la caja
// ya rotada. Se deshace la rotación alrededor del centro del canvas antes
// de escalar a coordenadas internas.
function installRotationAwarePointerMapping(app: Application) {
    const events = app.renderer.events;
    const originalMap = events.mapPositionToPoint.bind(events);

    events.mapPositionToPoint = (point, x, y) => {
        const rotation = getViewportRotation();
        const canvas = events.domElement as HTMLCanvasElement | null;

        if (!rotation || !canvas || !canvas.isConnected) {
            originalMap(point, x, y);
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const layoutWidth = canvas.offsetWidth || rect.height;
        const layoutHeight = canvas.offsetHeight || rect.width;
        const local = screenDeltaToLocal(
            x - (rect.left + rect.width / 2),
            y - (rect.top + rect.height / 2),
            rotation,
        );
        const resolutionMultiplier = 1 / events.resolution;

        point.x =
            (local.x + layoutWidth / 2) *
            (canvas.width / layoutWidth) *
            resolutionMultiplier;
        point.y =
            (local.y + layoutHeight / 2) *
            (canvas.height / layoutHeight) *
            resolutionMultiplier;
    };
}

export function useRendererBootstrap(options: UseRendererBootstrapOptions) {
    useEffect(() => {
        if (!options.isMounted || !options.canvasRef.current) return;

        let isDisposed = false;

        const initialize = async () => {
            try {
                options.setIsSceneReady(false);
                options.setError(null);

                if (!options.connection) {
                    options.setIsLoading(false);
                    options.clearLoadingProgress();
                    return;
                }

                options.setIsLoading(true);
                options.updateLoadingProgress(
                    "Preparando cliente",
                    6,
                    "Inicializando renderer y recursos base...",
                );

                const engine = new Engine(
                    options.mapNumber,
                    options.sharedTextureCachesRef.current,
                );
                engine.timeWalkMS = options.runtimeTimingRef.current.walkStepMs;
                engine.runtimeTiming = options.runtimeTimingRef.current;
                engine.isServerDriven = Boolean(options.connection);
                engine.partyMemberIds = options.partyMemberIdsRef.current;
                engine.canProcessMovementInput =
                    options.canProcessMovementInput;
                options.engineRef.current = engine;
                options.syncMovementState(engine);
                if (process.env.NODE_ENV !== "production") {
                    // Solo en desarrollo: permite inspeccionar el motor desde
                    // la consola o desde pruebas automatizadas.
                    (window as unknown as { __woaoEngine?: Engine }).__woaoEngine =
                        engine;
                }

                engine.sendPositionPacket = (heading: number) => {
                    const socket = options.websocketRef.current;
                    if (!socket || socket.readyState !== WebSocket.OPEN) {
                        return;
                    }

                    const moveId = options.nextMoveIdRef.current++;
                    options.localPendingMovesRef.current.push({
                        moveId,
                        heading,
                    });
                    socket.send(createPositionPacket(heading, moveId));
                    options.recordClientGameAction("move", { heading, moveId });
                };

                engine.onPlayerPositionChange = (pos) => {
                    options.mergeHud({ pos });
                };

                engine.onCharacterStep = (entityId) => {
                    options.playStepSound(engine, entityId);
                };

                engine.requestCharacterRerender = (entityId) => {
                    const entity = engine.personajes[entityId];
                    if (!entity) {
                        return;
                    }

                    if (entityId === engine.user?.id) {
                        void options.renderPlayer(engine).catch((error) => {
                            console.error(
                                "Error re-rendering player after deferred heading:",
                                error,
                            );
                        });
                        return;
                    }

                    void options
                        .renderRemoteEntity(engine, entity)
                        .catch((error) => {
                            console.error(
                                `Error re-rendering entity ${entityId} after deferred heading:`,
                                error,
                            );
                        });
                };

                const getMeleeCombatTarget = () => {
                    const user = engine.user;
                    if (!user) {
                        return null;
                    }

                    let offsetX = 0;
                    let offsetY = 0;

                    switch (user.heading) {
                        case engine.DIRECTIONS.RIGHT:
                            offsetX = 1;
                            break;
                        case engine.DIRECTIONS.LEFT:
                            offsetX = -1;
                            break;
                        case engine.DIRECTIONS.DOWN:
                            offsetY = 1;
                            break;
                        case engine.DIRECTIONS.UP:
                            offsetY = -1;
                            break;
                        default:
                            break;
                    }

                    return findVisibleEntityAtExactTile(
                        engine,
                        user.pos.x + offsetX,
                        user.pos.y + offsetY,
                    );
                };

                engine.sendHeadingPacket = (heading: number) => {
                    const socket = options.websocketRef.current;
                    if (!socket || socket.readyState !== WebSocket.OPEN) {
                        return;
                    }

                    socket.send(createChangeHeadingPacket(heading));
                    options.recordClientGameAction("change_heading", {
                        heading,
                    });
                };

                engine.sendMeleeAttackPacket = () => {
                    const socket = options.websocketRef.current;
                    if (!socket || socket.readyState !== WebSocket.OPEN) {
                        return;
                    }

                    socket.send(createAttackMeleePacket());

                    const meleeTarget = getMeleeCombatTarget();
                    if (meleeTarget?.isNpc) {
                        engine.addHealthBarEntity(meleeTarget.id);
                    }

                    if (!options.canStartLocalCombatAction("melee")) {
                        return;
                    }

                    engine.playLocalCombatSwing();
                    options.recordClientGameAction("melee_attack");
                    options.registerLocalCombatAction("melee");
                };

                options.updateLoadingProgress(
                    "Preparando cliente",
                    12,
                    `Descargando init y mapa ${options.mapNumber}...`,
                );

                await engine.initResources(
                    options.pendingUserSnapshotRef.current?.map ===
                        options.mapNumber
                        ? options.pendingUserSnapshotRef.current
                        : undefined,
                );
                // El vecindario se arma antes de dibujar: así el borde del
                // mapa actual que queda debajo de un vecino no se dibuja nunca.
                await options.prepareWorldLayout(engine);
                if (isDisposed || engine.isDestroyed) {
                    return;
                }
                const initialSnapshot =
                    options.pendingUserSnapshotRef.current?.map ===
                    options.mapNumber
                        ? options.pendingUserSnapshotRef.current
                        : null;
                const initialVisibleBounds =
                    await options.preloadInitialVisibleMapAssets(
                        engine,
                        initialSnapshot,
                    );
                await options.preloadCurrentSceneAssets(
                    engine,
                    initialSnapshot,
                );
                options.applyPendingTileStates(engine);

                if (isDisposed || engine.isDestroyed) {
                    return;
                }

                const createPixiApp = async (attempt: number) => {
                    options.updateLoadingProgress(
                        "Renderizando mundo",
                        72,
                        attempt === 0
                            ? "Creando canvas del juego..."
                            : "Reintentando renderer del juego...",
                    );

                    const app = new Application();

                    try {
                        await app.init({
                            width: options.screenSize.width,
                            height: options.screenSize.height,
                            backgroundColor: 0x000000,
                            antialias: false,
                            resolution: 1,
                            autoDensity: false,
                            roundPixels: true,
                        });
                        return app;
                    } catch (error) {
                        app.destroy({ removeView: true }, { children: true });

                        const isWebGLContextFailure =
                            error instanceof Error &&
                            error.message.includes(
                                "This browser does not support WebGL",
                            );

                        if (attempt === 0 && isWebGLContextFailure) {
                            destroySharedTextureCaches(
                                options.sharedTextureCachesRef.current,
                            );
                            await new Promise<void>((resolve) => {
                                window.setTimeout(resolve, 0);
                            });
                            return createPixiApp(1);
                        }

                        throw error;
                    }
                };

                const app = await createPixiApp(0);
                app.canvas.style.opacity = "0";
                installRotationAwarePointerMapping(app);

                if (isDisposed) {
                    app.destroy({ removeView: true }, { children: true });
                    return;
                }

                if (!options.canvasRef.current) {
                    throw new Error("Canvas ref is not available");
                }
                options.canvasRef.current.appendChild(app.canvas);
                app.canvas.style.width = "100%";
                app.canvas.style.height = "100%";
                app.canvas.style.display = "block";
                app.canvas.style.borderRadius = "0";
                app.canvas.style.imageRendering = "pixelated";
                engine.app = app;
                options.updateCanvasCursor();

                const mapContainer = new Container();
                mapContainer.interactiveChildren = false;
                // El mundo continuo dibuja vecinos alrededor del mapa actual, así
                // que el área clickeable no puede limitarse a 100x100 tiles.
                mapContainer.hitArea = new Rectangle(
                    -WORLD_HIT_AREA_HALF_SIZE,
                    -WORLD_HIT_AREA_HALF_SIZE,
                    WORLD_HIT_AREA_HALF_SIZE * 2,
                    WORLD_HIT_AREA_HALF_SIZE * 2,
                );
                app.stage.addChild(mapContainer);
                engine.mapContainer = mapContainer;
                mapContainer.eventMode = "static";
                createMapRowLayerContainers(engine);

                const getInteractionContext = (
                    event: FederatedPointerEvent,
                ) => {
                    if (!engine.user) {
                        return null;
                    }

                    const socket = options.websocketRef.current;
                    if (!socket || socket.readyState !== WebSocket.OPEN) {
                        return null;
                    }

                    const localPos = mapContainer.toLocal(event.global);
                    // Tile en el marco del mapa actual; con mundo continuo puede
                    // caer fuera de 1..100 (sobre un vecino) y se traduce al
                    // mandar el paquete.
                    const tile = engine.worldToCurrentMapTile(
                        localPos.x,
                        localPos.y,
                    );

                    return {
                        socket,
                        targetTileX: tile.x,
                        targetTileY: tile.y,
                    };
                };

                const sendInteractionClickPacket = (
                    socket: WebSocket,
                    x: number,
                    y: number,
                    button = 0,
                ) => {
                    const now = Date.now();

                    if (now < options.movementInputLockedUntilRef.current) {
                        return;
                    }

                    const mapTile = engine.viewerTileToMapTile(x, y);
                    if (!mapTile) {
                        return;
                    }

                    socket.send(
                        createClickPacket(
                            mapTile.x,
                            mapTile.y,
                            button,
                            mapTile.map,
                        ),
                    );
                    options.recordClientGameAction("interaction_click", {
                        map: mapTile.map,
                        x: mapTile.x,
                        y: mapTile.y,
                        button,
                    });
                };

                mapContainer.on("pointerdown", (event) => {
                    const interaction = getInteractionContext(event);
                    if (!interaction) {
                        return;
                    }

                    options.lastWorldPointerTileRef.current = {
                        at: Date.now(),
                        x: interaction.targetTileX,
                        y: interaction.targetTileY,
                        button: Number(event.button ?? 0),
                        trusted: event.isTrusted !== false,
                    };

                    const isRightClick = event.button === 2;

                    if (isRightClick) {
                        const clickedNpc = findInspectableNpcAtTile(
                            engine,
                            interaction.targetTileX,
                            interaction.targetTileY,
                        );
                        const clickedDeadCharacter =
                            findRevivableCharacterAtTile(
                                engine,
                                interaction.targetTileX,
                                interaction.targetTileY,
                            );
                        const allowAdminNpcInspect = isAdminInspector(
                            engine,
                            options.playerHudRef.current,
                        );

                        if (allowAdminNpcInspect && clickedDeadCharacter) {
                            const containerRect =
                                options.rendererRootRef.current?.getBoundingClientRect();
                            const rawX =
                                event.clientX - (containerRect?.left ?? 0);
                            const rawY =
                                event.clientY - (containerRect?.top ?? 0);
                            options.setDeadCharacterContextMenu({
                                x: Math.max(12, rawX),
                                y: Math.max(12, rawY),
                                character: {
                                    entityId: clickedDeadCharacter.id,
                                    name:
                                        clickedDeadCharacter.nameCharacter?.trim() ||
                                        `Entity-${clickedDeadCharacter.id}`,
                                },
                            });
                            options.setNpcContextMenu(null);
                            options.npcContextMenuOpenedAtRef.current =
                                event.timeStamp;
                            return;
                        }

                        if (
                            clickedNpc &&
                            canInspectNpc(
                                engine,
                                clickedNpc,
                                allowAdminNpcInspect,
                            )
                        ) {
                            const containerRect =
                                options.rendererRootRef.current?.getBoundingClientRect();
                            const rawX =
                                event.clientX - (containerRect?.left ?? 0);
                            const rawY =
                                event.clientY - (containerRect?.top ?? 0);
                            options.setNpcContextMenu({
                                x: Math.max(12, rawX),
                                y: Math.max(12, rawY),
                                npc: buildInspectableNpc(engine, clickedNpc),
                            });
                            options.setDeadCharacterContextMenu(null);
                            options.npcContextMenuOpenedAtRef.current =
                                event.timeStamp;
                            return;
                        }

                        sendInteractionClickPacket(
                            interaction.socket,
                            interaction.targetTileX,
                            interaction.targetTileY,
                            2,
                        );
                        return;
                    }

                    if (options.targetingModeRef.current) {
                        return;
                    }

                    sendInteractionClickPacket(
                        interaction.socket,
                        interaction.targetTileX,
                        interaction.targetTileY,
                    );
                });

                mapContainer.on("pointerup", (event) => {
                    const targetingMode = options.targetingModeRef.current;
                    if (!targetingMode || event.button === 2) {
                        return;
                    }

                    const interaction = getInteractionContext(event);
                    if (!interaction) {
                        return;
                    }

                    if (
                        targetingMode.type === "fishing" ||
                        targetingMode.type === "woodcutting" ||
                        targetingMode.type === "mining" ||
                        targetingMode.type === "smelting" ||
                        targetingMode.type === "blacksmith"
                    ) {
                        sendInteractionClickPacket(
                            interaction.socket,
                            interaction.targetTileX,
                            interaction.targetTileY,
                        );
                        options.clearTargetingMode();
                        return;
                    }

                    if (targetingMode.type === "range") {
                        if (!options.canStartLocalCombatAction("range")) {
                            options.clearTargetingMode();
                            return;
                        }

                        const resolvedCombatTarget =
                            options.resolveCombatReleaseTarget(
                                engine,
                                event,
                                interaction,
                            );
                        const targetEntity =
                            typeof resolvedCombatTarget.entityId === "number"
                                ? engine.personajes[resolvedCombatTarget.entityId]
                                : null;

                        if (targetEntity?.isNpc) {
                            engine.addHealthBarEntity(targetEntity.id);
                        }

                        interaction.socket.send(
                            createAttackRangePacket(
                                resolvedCombatTarget.x,
                                resolvedCombatTarget.y,
                                resolvedCombatTarget.map,
                            ),
                        );
                        engine.playLocalCombatSwing();
                        options.recordClientGameAction("range_attack", {
                            map: resolvedCombatTarget.map,
                            x: resolvedCombatTarget.x,
                            y: resolvedCombatTarget.y,
                        });
                        options.registerLocalCombatAction("range");
                        options.clearTargetingMode();
                        return;
                    }

                    options.registerDebugSpellAttempt();
                    const currentMana = options.playerHudRef.current?.mana ?? 0;
                    if (currentMana < targetingMode.manaRequired) {
                        options.clearTargetingMode();
                        options.pushSystemMessage(
                            "No tienes mana suficiente para lanzar ese hechizo.",
                            "#fca5a5",
                        );
                        return;
                    }

                    if (!options.canStartLocalCombatAction("spell")) {
                        options.clearTargetingMode();
                        return;
                    }

                    const resolvedSpellTarget =
                        options.resolveSpellReleaseTarget(
                            engine,
                            event,
                            interaction,
                        );
                    if (
                        resolvedSpellTarget.resolvedEntityType !== "self" &&
                        resolvedSpellTarget.resolvedEntityType === "npc" &&
                        typeof resolvedSpellTarget.resolvedEntityId === "number"
                    ) {
                        engine.addHealthBarEntity(
                            resolvedSpellTarget.resolvedEntityId,
                        );
                    }
                    options.recordSpellTargetSnap({
                        at: Date.now(),
                        clickedTileX: interaction.targetTileX,
                        clickedTileY: interaction.targetTileY,
                        resolvedX: resolvedSpellTarget.x,
                        resolvedY: resolvedSpellTarget.y,
                        tileDistance:
                            Math.abs(
                                interaction.targetTileX - resolvedSpellTarget.x,
                            ) +
                            Math.abs(
                                interaction.targetTileY - resolvedSpellTarget.y,
                            ),
                        resolvedEntityId: resolvedSpellTarget.resolvedEntityId,
                        resolvedEntityType:
                            resolvedSpellTarget.resolvedEntityType,
                        resolvedSource: resolvedSpellTarget.resolvedSource,
                    });
                    interaction.socket.send(
                        createAttackSpellPacket(
                            targetingMode.slot,
                            resolvedSpellTarget.x,
                            resolvedSpellTarget.y,
                            resolvedSpellTarget.preferSelfIfEmpty,
                            resolvedSpellTarget.map,
                        ),
                    );
                    options.recordClientGameAction("spell_attack", {
                        slot: targetingMode.slot,
                        map: resolvedSpellTarget.map,
                        x: resolvedSpellTarget.x,
                        y: resolvedSpellTarget.y,
                        preferSelfIfEmpty:
                            resolvedSpellTarget.preferSelfIfEmpty,
                    });
                    options.registerLocalCombatAction("spell");
                    options.clearTargetingMode();
                });

                const playerContainer = new Container();
                playerContainer.sortableChildren = true;
                engine.playerContainer = playerContainer;

                const roofContainer = new Container();
                app.stage.addChild(roofContainer);
                engine.roofContainer = roofContainer;
                createRoofRowContainers(engine);

                const entityFXOverlayContainer = new Container();
                app.stage.addChild(entityFXOverlayContainer);
                engine.entityFXOverlayContainer = entityFXOverlayContainer;
                createEntityFXRowContainers(engine);

                const dialogOverlayContainer = new Container();
                dialogOverlayContainer.sortableChildren = true;
                app.stage.addChild(dialogOverlayContainer);
                engine.dialogOverlayContainer = dialogOverlayContainer;

                const weatherOverlayContainer = createWeatherOverlay(engine);
                app.stage.addChild(weatherOverlayContainer);
                engine.weatherOverlayContainer = weatherOverlayContainer;

                options.setWorldVisibility(engine, false);
                options.updateLoadingProgress(
                    "Renderizando mundo",
                    78,
                    "Dibujando ventana inicial ...",
                );
                await options.renderMap(engine, {
                    includeLayers: ["1", "2", "3", "4"],
                    includeObjects: true,
                    bounds: initialVisibleBounds ?? undefined,
                });

                if (isDisposed || engine.isDestroyed || !engine.app) {
                    return;
                }

                // Si la ventana inicial toca un borde, el pedazo visible del
                // vecino se dibuja antes de mostrar la escena para no arrancar
                // con un hueco negro donde antes estaba el borde del mapa.
                if (initialVisibleBounds) {
                    await options.streamWorldNeighbors(
                        engine,
                        initialVisibleBounds,
                    );
                    if (isDisposed || engine.isDestroyed || !engine.app) {
                        return;
                    }
                }

                (engine as any).renderPlayerFn = options.renderPlayer;

                if (engine.user) {
                    engine.updateCamera();
                    engine.updateCulling();
                    if (initialVisibleBounds) {
                        options.updateLoadingProgress(
                            "Renderizando mundo",
                            88,
                            "Renderizando entidades cercanas...",
                        );
                        await options.flushBufferedRemoteEntities(
                            engine,
                            initialVisibleBounds,
                        );
                        if (isDisposed || engine.isDestroyed) {
                            return;
                        }
                    }
                    options.updateLoadingProgress(
                        "Renderizando mundo",
                        90,
                        "Armando personaje principal...",
                    );
                    await options.renderPlayer(engine);
                    if (isDisposed || engine.isDestroyed) {
                        return;
                    }
                    options.setWorldVisibility(engine, true);
                    options.setIsSceneReady(true);
                    app.canvas.style.opacity = "1";
                    options.setIsLoading(false);
                    options.setHasCompletedInitialLoad(true);
                    options.setClientReadySessionKey(
                        options.connection.sessionKey,
                    );
                }

                const debugGrid = createDebugGrid(engine.mapDimensions);
                debugGrid.x = mapContainer.x;
                debugGrid.y = mapContainer.y;
                engine.debugGrid = debugGrid;
                debugGrid.visible = false;
                app.stage.addChild(debugGrid);

                app.ticker.add(engine.loop);
                const dialogBubbleTicker = () => {
                    options.updateActiveDialogBubblePositions(engine);
                    options.updateActiveCastBarPositions(engine);
                    options.updateEntityFXPositions(engine);
                };
                app.ticker.add(dialogBubbleTicker);
                engine.dialogBubbleTicker = dialogBubbleTicker;

                const fpsStyle = new TextStyle({
                    fontFamily: "Arial",
                    fontSize: 11,
                    fill: 0xffffff,
                    stroke: { color: 0x000000, width: 1.5 },
                });
                const fpsText = new Text({
                    text: options.fpsDisplayTextRef.current,
                    style: fpsStyle,
                });
                fpsText.resolution = 1;
                fpsText.x = 10;
                fpsText.y = 8;
                fpsText.zIndex = 1000;
                app.stage.addChild(fpsText);

                const pingText = new Text({
                    text: options.pingDisplayTextRef.current,
                    style: fpsStyle,
                });
                pingText.resolution = 1;
                pingText.x = 10;
                pingText.y = 22;
                pingText.zIndex = 1000;
                app.stage.addChild(pingText);

                const seguroText = new Text({
                    text: "",
                    style: getHudStatusTextStyle(0xff3b30),
                });
                seguroText.resolution = 1;
                seguroText.x = 10;
                seguroText.y = 36;
                seguroText.zIndex = 1000;
                app.stage.addChild(seguroText);

                const clanSeguroText = new Text({
                    text: "",
                    style: getHudStatusTextStyle(0xff3b30),
                });
                clanSeguroText.resolution = 1;
                clanSeguroText.x = 10;
                clanSeguroText.y = 50;
                clanSeguroText.zIndex = 1000;
                app.stage.addChild(clanSeguroText);

                const debugCombatText = new Text({
                    text: "Combat Debug [OFF]",
                    style: new TextStyle({
                        fontFamily: "Arial",
                        fontSize: 11,
                        fill: 0x93c5fd,
                        stroke: { color: 0x000000, width: 1.5 },
                    }),
                });
                debugCombatText.resolution = 1;
                debugCombatText.x = 10;
                debugCombatText.y = 50;
                debugCombatText.zIndex = 1000;
                debugCombatText.visible = false;
                app.stage.addChild(debugCombatText);

                (engine as any).fpsText = fpsText;
                options.pingTextRef.current = pingText;
                options.seguroTextRef.current = seguroText;
                options.clanSeguroTextRef.current = clanSeguroText;
                options.updateSeguroIndicators(options.playerHudRef.current);
                options.debugCombatTextRef.current = debugCombatText;
                options.updateDebugCombatText();

                let frameCount = 0;
                let lastTime = performance.now();
                const fpsTicker = () => {
                    frameCount++;
                    options.updateDebugCombatText();
                    const currentTime = performance.now();
                    if (currentTime - lastTime >= 1000) {
                        const fps = Math.round(
                            (frameCount * 1000) / (currentTime - lastTime),
                        );
                        options.fpsDisplayTextRef.current = `FPS: ${fps}`;
                        options.onFpsSample?.(fps);
                        setTextIfChanged(
                            fpsText,
                            options.fpsDisplayTextRef.current,
                        );
                        frameCount = 0;
                        lastTime = currentTime;
                    }
                };
                app.ticker.add(fpsTicker);
                engine.fpsTicker = fpsTicker;

                engine.updateCamera();
                engine.updateCulling();

                if (isDisposed) {
                    engine.destroy();
                    if (options.engineRef.current === engine) {
                        options.engineRef.current = null;
                    }
                    return;
                }

                if (!engine.user) {
                    app.canvas.style.opacity = "1";
                    options.setIsLoading(false);
                    options.setHasCompletedInitialLoad(true);
                    options.setClientReadySessionKey(
                        options.connection.sessionKey,
                    );
                }

                window.setTimeout(() => {
                    if (!engine.isDestroyed) {
                        const pendingSnapshot =
                            options.pendingUserSnapshotRef.current?.map ===
                            options.mapNumber
                                ? options.pendingUserSnapshotRef.current
                                : null;

                        if (pendingSnapshot) {
                            void options
                                .applyOwnCharacterSnapshot(
                                    engine,
                                    pendingSnapshot,
                                )
                                .catch((error) => {
                                    console.warn(
                                        "Failed to sync own character snapshot after base scene render:",
                                        error,
                                    );
                                });
                        }

                        options.updateLoadingProgress(
                            "Renderizando mundo",
                            82,
                            "Completando resto del mapa actual...",
                        );

                        // Si el jugador cruza a un vecino mientras esto corre,
                        // el mapa actual del motor cambia: el resto se dibuja
                        // igual para el mapa con el que arrancó la escena.
                        const bootstrapMapNumber = engine.mapNumber;

                        options
                            .renderMap(engine, {
                                mapNumber: bootstrapMapNumber,
                                includeLayers: ["1", "2"],
                                includeObjects: false,
                                excludeBounds:
                                    initialVisibleBounds ?? undefined,
                                frameBudgetMs: BACKGROUND_FRAME_BUDGET_MS,
                            })
                            .then(() =>
                                options.renderMap(engine, {
                                    mapNumber: bootstrapMapNumber,
                                    includeLayers: ["3", "4"],
                                    includeObjects: true,
                                    excludeBounds:
                                        initialVisibleBounds ?? undefined,
                                    frameBudgetMs: BACKGROUND_FRAME_BUDGET_MS,
                                }),
                            )
                            .then(() => {
                                markMapRendered(engine, bootstrapMapNumber);
                                return options.warmCommonCharacterAssets(
                                    engine,
                                );
                            })
                            .then(() => options.streamWorldNeighbors(engine))
                            .catch((error) => {
                                console.warn(
                                    "Failed to finish deferred scene enhancement:",
                                    error,
                                );
                            })
                            .finally(() => {
                                if (!engine.isDestroyed) {
                                    options.clearLoadingProgress();
                                }
                            });
                    }
                }, 0);
            } catch (err) {
                if (isDisposed) {
                    return;
                }
                console.error("Error initializing:", err);
                options.setError(
                    err instanceof Error ? err.message : "Failed to initialize",
                );
                options.setClientReadySessionKey(null);
                options.setIsLoading(false);
                options.clearLoadingProgress();
            }
        };

        initialize();

        return () => {
            isDisposed = true;
            options.pingTextRef.current = null;
            options.seguroTextRef.current = null;
            options.clanSeguroTextRef.current = null;
            options.debugCombatTextRef.current = null;
            if (options.engineRef.current) {
                options.engineRef.current.destroy();
                options.engineRef.current = null;
            }
        };
        // Renderer bootstrap should restart when mount, session, or map changes.
        // The rest of the mutable runtime state is read from refs or handled by
        // more targeted effects inside the renderer tree.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.isMounted, options.connection?.sessionKey, options.mapNumber]);
}
