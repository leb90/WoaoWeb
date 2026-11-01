import type { CharacterFaction } from "../factions";

export type Position = {
    x: number;
    y: number;
};

export type FishingState = {
    active?: boolean;
    pendingTarget?: boolean;
    slot?: number;
    itemId?: number;
    power?: number;
    target?: Position;
    origin?: Position;
    startedAt?: number;
    nextTickAt?: number;
};

export type HarvestingSkill = "woodcutting" | "mining";

export type HarvestingState = {
    active?: boolean;
    pendingTarget?: boolean;
    skill?: HarvestingSkill;
    slot?: number;
    itemId?: number;
    target?: Position;
    origin?: Position;
    nextTickAt?: number;
};

export type SmeltingState = {
    active?: boolean;
    pendingTarget?: boolean;
    slot?: number;
    itemId?: number;
    target?: Position;
    origin?: Position;
    nextTickAt?: number;
};

export type CraftingTargetState = {
    pendingTarget?: boolean;
    source?: "tool" | "npc";
    profession?: "blacksmith";
    slot?: number;
    itemId?: number;
    npcId?: EntityId;
};

export type TimedTracker = {
    tiempoTotal: number;
    startTimer: number;
};

export type SpellTracker = TimedTracker & {
    lanzados: number;
};

export type HitTracker = TimedTracker & {
    hits: number;
};

export type WalkTracker = TimedTracker & {
    pasos: number;
};

export type PendingMoveCommand = {
    heading: number;
    moveId: number;
};

export type UseItemTracker = TimedTracker & {
    usos: number;
    adv: number;
};

export type EntityId = string | number;

export type NumericFlag = number | boolean;

export type RuntimeCallback<T = void> = (value: T) => void;

export type PendingReviveCast = {
    targetId: EntityId;
    spellId: number;
    startedAt: number;
    endsAt: number;
    timeoutId?: ReturnType<typeof setTimeout>;
};

export type WorldSaveResult = {
    ok: boolean;
    durationMs: number;
    savedCharacters: number;
};

export type InventoryRecord = Record<string, InventoryItem>;

export type SpellRecord = Record<string, SpellSlot>;

export type SpellEffect = "Paraliza" | "Inmoviliza" | "Envenena";

export type UserSpellEffect =
    | SpellEffect
    | "Remueve"
    | "Agilidad"
    | "Fuerza"
    | "Invisibilidad"
    | "RemueveInvisibilidad"
    | "CuraVeneno"
    | "Ceguera"
    | "Estupidez"
    | "Mana"
    | "Hambre"
    | "Sed"
    | "Morph"
    | "Protec"
    | "Elemental";

export type CombatResult = number | string;

// rarity: 0 Normal, 1 Mejorado, 2 Épico, 3 Legendario (itemRarity.ts). Ausente = 0.
export type InventoryItem = {
    idItem: number;
    cant: number;
    equipped?: number | boolean;
    rarity?: number;
};

export type SerializedInventoryItem = {
    idPos: string;
    idItem: number;
    cant: number;
    equipped: number;
    rarity?: number;
};

export type SerializedBankItem = {
    idPos: string;
    idItem: number;
    cant: number;
    rarity?: number;
};

export type SpellSlot = {
    idSpell: number;
};

export type SerializedSpellSlot = {
    idPos: string;
    idSpell: number;
};

export type MapTile = {
    id: number;
    objIndex?: number;
    amount?: number;
    trigger?: number;
    exit?: {
        map: number;
        x: number;
        y: number;
    };
};

export type MapObjectInfo = {
    objIndex: number;
    amount: number;
    rarity?: number;
    cleanupSource?: "drop";
    cleanupRegisteredAt?: number;
};

export type TradeItem = {
    item: number;
    cant: number;
    // Precio en esta tienda, si no es el del objeto (por ejemplo, un arco que se fabrica y vale 1).
    valor?: number;
};

export type BankTab = "character" | "account" | "clan";

export type RouteCoord = [number, number];

export type RespawnPosition = {
    posNewX: number;
    posNewY: number;
};

export type DataObject = {
    name: string;
    objType: number;
    newbie?: number;
    valor: number;
    grhIndex?: number;
    minDef?: number;
    maxDef?: number;
    minDefMag?: number;
    maxDefMag?: number;
    resistenciaMagica?: number;
    porcentaje?: number;
    minModificador?: number;
    maxModificador?: number;
    tipoPocion?: number;
    magicDamageBonus?: number;
    magicDamagePercent?: number;
    magicPenetration?: number;
    objetoEspecial?: number;
    mataHobbits?: number;
    subtipo?: number;
    spellIndex?: number;
    item?: number;
    amount?: number;
    minHit?: number;
    maxHit?: number;
    apu?: boolean;
    proyectil?: boolean;
    agarrable?: boolean;
    clasesNoPermitidas?: number[];
    razaEnana?: boolean;
    razaElfa?: boolean;
    razaVampiro?: boolean;
    razaHumana?: boolean;
    razaOrca?: boolean;
    abriga?: boolean;
    manaRequired?: number;
    [key: string]: unknown;
};

export type DataSpell = {
    name: string;
    manaRequired: number;
    type?: number;
    target?: number;
    minSkill?: number;
    subeHp?: number;
    minHp?: number;
    maxHp?: number;
    paraliza?: boolean;
    inmoviliza?: boolean;
    invisibilidad?: boolean;
    staffAffected?: boolean;
    fxGrh?: number;
    wav?: number;
    palabrasMagicas?: string;
    numNpc?: number;
    [key: string]: unknown;
};

export type NpcSpellSlot = {
    idSpell: number;
    cooldownSeconds?: number;
    lastUsedAt?: number;
};

export type PyramidChallengeState = {
    riddleId: number;
    answerItemId: number;
    startedAt: number;
};

export type RuntimeCharacter = {
    id: EntityId;
    _id?: string;
    idAccount?: string;
    /** Personaje del modo Arena (todos contra todos, arena.ts). */
    arenaFfa?: boolean;
    /** Entrenamiento contra el bot (arenaTraining.ts): el jugador y el bot, en una copia privada de la arena. */
    arenaEntrenamiento?: {
        map: number;
        idClaseBot: number;
        record?: number;
        esBot?: boolean;
        jugadorId?: string;
    } | null;
    /** Daño de más (en %) del bot de entrenamiento desde el nivel 11. */
    arenaBotDanoPct?: number;
    spawnMap?: number;
    spawnPos?: Position;
    homeMap?: number;
    homeX?: number;
    homeY?: number;
    nameCharacter: string;
    map: number;
    pos: Position;
    heading: number;
    pendingMoveQueue?: PendingMoveCommand[];
    pendingMoveTimerId?: ReturnType<typeof setTimeout> | null;
    lastProcessedMoveId?: number;
    stateVersion?: number;
    ignoreMovementUntil?: number;
    nextWalkAt?: number;
    dead?: NumericFlag;
    deadWorldActive?: boolean;
    deadWorldTransitionEndsAt?: number;
    deadWorldTimeoutId?: ReturnType<typeof setTimeout> | null;
    meditar?: boolean;
    meditarFx?: number;
    mana?: number;
    maxMana?: number;
    hp?: number;
    maxHp?: number;
    gold?: number;
    privileges?: number;
    invisibleAdmin?: boolean;
    invisibleSpell?: boolean;
    hiddenSkill?: boolean;
    hiddenSkillStartedAt?: number;
    hiddenSkillExpiresAt?: number;
    hiddenSkillCooldownUntil?: number;
    cooldownInvisibleSpell?: number;
    criminal?: NumericFlag;
    faction?: CharacterFaction;
    factionScoreArmada?: number;
    factionScoreCaos?: number;
    factionRankArmada?: number;
    factionRankCaos?: number;
    factionRewardsArmada?: number;
    factionRewardsCaos?: number;
    jailMinutes?: number;
    jailReason?: string | null;
    color?: string;
    clan?: string;
    clanId?: string | null;
    clanAlignment?: "citizen" | "criminal" | null;
    clanMinJoinLevel?: number | null;
    clanRole?: "leader" | "co_leader" | "member" | null;
    pvpChar?: boolean;
    connected?: boolean;
    cerrado?: boolean;
    level?: number;
    exp?: number;
    expNextLevel?: number;
    idClase?: number;
    idRaza?: number;
    idGenero?: number;
    idHead?: number;
    idHelmet?: number;
    idWeapon?: number;
    idShield?: number;
    idBody?: number;
    idLastHead?: number;
    idLastHelmet?: number;
    idLastWeapon?: number;
    idLastShield?: number;
    idLastBody?: number;
    idItemWeapon?: number | string;
    idItemBody?: number | string;
    idItemShield?: number | string;
    idItemHelmet?: number | string;
    idItemArrow?: number | string;
    idItemRing?: number | string;
    // Transfiguración: objeto puesto en cada espacio cosmético (ver transmog.ts).
    transmog?: Partial<Record<"casco" | "escudo" | "arma" | "cuerpo", number>>;
    attrFuerza?: number;
    attrAgilidad?: number;
    attrInteligencia?: number;
    attrConstitucion?: number;
    bkAttrFuerza?: number;
    bkAttrAgilidad?: number;
    cooldownFuerza?: number;
    cooldownAgilidad?: number;
    envenenado?: number;
    cooldownVeneno?: number;
    // Efectos del chamán elemental (elementalEffects.ts).
    elemental?: import("../elementalEffects").ElementalState | null;
    ceguera?: NumericFlag;
    cooldownCeguera?: number;
    estupidez?: NumericFlag;
    cooldownEstupidez?: number;
    // Último estado de veneno/ceguera/estupidez mandado al cliente (server.ts, sendAfflictionStateIfChanged).
    afflictionStateSent?: string;
    // Lo último que clickeó (criatura o usuario) para el marco del objetivo, y lo último que se le mandó (protocol.ts).
    targetFrame?: { kind: "npc" | "user"; id: EntityId };
    targetFrameSent?: string;
    sta?: number;
    maxSta?: number;
    hambre?: number;
    maxHambre?: number;
    sed?: number;
    maxSed?: number;
    lastHungerDrainAt?: number;
    lastStaRegenAt?: number;
    lastHpRegenAt?: number;
    // Frío sin vestimenta (game.ts, tickSurvivalVitals): 0 nada, 1 frío (hambre y sed bajan más rápido), 2 bajo cero
    // (pierde vida). Va en el paquete afflictionState para el ícono del HUD.
    coldExposure?: 0 | 1 | 2;
    lastFreezingDamageAt?: number;
    starvationPenaltyApplied?: boolean;
    starvationPenaltyAmount?: number;
    protec?: number;
    cooldownProtec?: number;
    morphBody?: number;
    cooldownMorph?: number;
    inmovilizado?: NumericFlag;
    zonaSegura?: NumericFlag;
    navegando?: NumericFlag;
    mounted?: NumericFlag;
    mountBodyId?: number;
    mountTypeId?: number;
    mountInstanceId?: string;
    mountSuspendedByBoat?: {
        bodyId: number;
        typeId: number;
        instanceId: string;
    } | null;
    targetNpcId?: EntityId;
    puntosCanje?: number;
    puntosDonacion?: number;
    elo?: number;
    pClan?: number;
    seguroActivado?: boolean;
    seguroClanActivado?: boolean;
    logoutRequestedAt?: number;
    logoutExpiresAt?: number;
    pvpMapChangeBlockedUntil?: number;
    // Fin de la ventana de combate PvP (para revelar invisibles) y último reenvío del personaje.
    pvpCombatUntil?: number;
    pvpRevealSyncedAt?: number;
    disconnectOnDeath?: boolean;
    nextDialogAt?: number;
    nextUiCommandAt?: number;
    queuedUiCommand?: string;
    nextMeleeAt?: number;
    nextRangeAt?: number;
    nextSpellAt?: number;
    nextSpellAfterMeleeAt?: number;
    nextMeleeAfterSpellAt?: number;
    nextUseItemAt?: number;
    nextUseItemAfterMeleeAt?: number;
    nextResyncPositionAt?: number;
    fishing?: FishingState;
    harvesting?: HarvestingState;
    smelting?: SmeltingState;
    craftingTarget?: CraftingTargetState;
    pyramidChallenge?: PyramidChallengeState | null;
    useObj?: UseItemTracker;
    spell?: SpellTracker;
    hit?: HitTracker;
    walk?: WalkTracker;
    inv?: InventoryRecord | Array<SerializedInventoryItem>;
    bank?: InventoryRecord | Array<SerializedBankItem>;
    spells?: SpellRecord | Array<SerializedSpellSlot>;
    learnedCraftingRecipes?: number[];
    items?: Array<SerializedInventoryItem>;
    bankItems?: Array<SerializedBankItem>;
    tradeMode?: "merchant" | "bank" | "market";
    tradeBankTab?: BankTab;
    tradeBankGold?: number;
    tradeHasClanVault?: boolean;
    tradeClanName?: string | null;
    summons?: EntityId[];
    summonTargetNpcId?: EntityId;
    partyId?: string | null;
    partyLeaderId?: EntityId | null;
    partyInvitationFrom?: EntityId | null;
    partyInvitationExpiresAt?: number;
    pendingReviveCast?: PendingReviveCast | null;
    lastMovementActivityAt?: number;
    lastCombatActivityAt?: number;
    lastAttackerId?: EntityId;
    lastAttackedAt?: number;
    challengeMatchId?: string | null;
    challengeTeam?: 1 | 2 | null;
    challengeLockedUntil?: number;
    rankedArena?: boolean;
    rankedMatchId?: string | null;
    rankedTeam?: "A" | "B" | null;
    rankedLockedUntil?: number;
    adminSummonedBot?: boolean;
    adminSummonedBotOwnerId?: EntityId;
    gmBotState?: GmBotState | null;
    gmBotNextSummonAt?: number;
    gmBotStuckTeleportNextAt?: number;
    gmBotReportCooldowns?: Record<string, number>;
    populationBot?: boolean;
    populationBotHomeMap?: number;
    populationBotNextThinkAt?: number;
    populationBotWaypoint?: Position | null;
    populationBotNextChatAt?: number;
    [key: string]: unknown;
};

export type GmBotState = {
    step:
        | "menu"
        | "reportar_nombre"
        | "reportar_motivo"
        | "bug_texto"
        | "faq_pregunta";
    context?: {
        reportedName?: string;
    };
};

export type PartyRuntimeMember = {
    id: EntityId;
    nameCharacter: string;
    map: number;
    pos: Position;
    online: boolean;
    isLeader: boolean;
};

export type ClanRuntimeMember = {
    id: EntityId;
    nameCharacter: string;
    map: number;
    pos: Position;
    online: boolean;
};

export type PartyRuntimeStateDelta = {
    upsert: PartyRuntimeMember[];
    remove: EntityId[];
};

export type ClanRuntimeStateDelta = {
    upsert: ClanRuntimeMember[];
    remove: EntityId[];
};

export type PartyRuntimeState = {
    id: string;
    leaderId: EntityId;
    memberIds: EntityId[];
};

export type RuntimeNpc = {
    id: EntityId;
    templateNpcIndex?: number;
    questNumber?: number;
    spawnMapNum?: number;
    spawnOrigin?: Position;
    nameCharacter?: string;
    // Texto debajo del cuerpo en el cliente (los entrenadores de clase).
    etiqueta?: string;
    map: number;
    pos: Position;
    heading?: number;
    movement?: number;
    rute?: Array<RouteCoord>;
    pathTargetId?: EntityId;
    pathTargetPos?: Position;
    nextPathfindAt?: number;
    lastChasePos?: Position;
    currentTargetId?: EntityId;
    currentTargetLockedUntil?: number;
    // Correa: dónde estaba al empezar a perseguir y en qué estado está.
    leashHome?: Position;
    leashHomeMap?: number;
    leashState?: "idle" | "chasing" | "returning";
    leashReturnBlockedTicks?: number;
    // Paseo sin objetivo: zona donde nació y destino actual (npcs.ts, wanderNpc).
    wanderHome?: Position;
    // Radio del paseo (las criaturas de mazmorra pasean en 3×3); sin él, el del juego.
    wanderRadius?: number;
    // Mazmorras: la mueve dungeonHazards.ts o dungeonBoss.ts, no la IA (chispas, cuchillas, rodillo, Ciempiés).
    customMotion?: boolean;
    wanderHomeMap?: number;
    wanderTarget?: Position | null;
    wanderPauseUntil?: number;
    wanderBlockedTicks?: number;
    lastReachedTargetAt?: number;
    lastAggressorId?: EntityId;
    lastAggressedAt?: number;
    reservedAttackTargetId?: EntityId;
    reservedAttackPos?: Position;
    attackReservationExpiresAt?: number;
    isNpc?: boolean;
    hp?: number;
    maxHp?: number;
    minHit?: number;
    maxHit?: number;
    def?: number;
    defM?: number;
    magicResistance?: number;
    magicDef?: number;
    poderAtaque?: number;
    poderEvasion?: number;
    inmovilizado?: NumericFlag;
    paralizado?: NumericFlag;
    cooldownAtaque?: number;
    cooldownParalizado?: number;
    nextThinkAt?: number;
    aguaValida?: NumericFlag;
    tierraInvalida?: NumericFlag;
    npcType?: number;
    snd1?: number;
    snd2?: number;
    soundClose?: number;
    spellCastIntervalMs?: number;
    lastSpellCastAt?: number;
    spellRange?: number;
    spells?: NpcSpellSlot[];
    summonedByUserId?: EntityId;
    summonExpiresAt?: number;
    summonCreatedAt?: number;
    color?: string;
    clan?: string;
    comercia?: number;
    objs?: Record<string, TradeItem> | TradeItem[];
    drop?: DropItem[];
    [key: string]: unknown;
};

export type DropItem = {
    item: number;
    cant: number;
    chancePercent?: number;
    chance?: number;
    probabilityPercent?: number;
    probabilidad?: number;
};

export type RuntimeClient = {
    id?: EntityId;
    clientIp?: string;
    connectedAt?: number;
    outboundQueue?: Array<{
        frame: Buffer;
        bytes: number;
    }>;
    outboundQueueBytes?: number;
    outboundFlushTimerId?: ReturnType<typeof setTimeout> | null;
    outboundFlushGroupDepth?: number;
    outboundPendingImmediateAfterGroup?: boolean;
    packetCount?: number;
    packetCountNonPing?: number;
    recentPacketIntervalsMs?: number[];
    recentPacketTimestamps?: number[];
    recentPacketTimestamps60s?: number[];
    lastPacketAt?: number;
    lastPacketIntervalMs?: number;
    minPacketIntervalMs?: number;
    lastActivityAt?: number;
    packetTypeCounts?: Record<string, number>;
    nextMapClickAt?: number;
    nextDoorToggleAt?: number;
    nextDropItemAt?: number;
    nextBuyItemAt?: number;
    nextSellItemAt?: number;
    nextEquipToggleAt?: number;
    nextReorderBankAt?: number;
    nextMarketBrowseAt?: number;
    nextMarketWriteAt?: number;
    nextMarketNoticeAt?: number;
    marketActionInFlight?: boolean;
    OPEN: number;
    readyState: number;
    on: (event: string, listener: (...args: unknown[]) => void) => void;
    send: (data: unknown) => void;
    close: () => void;
    _socket?: {
        remoteAddress?: string;
    };
    [key: string]: unknown;
};

export type RuntimeConnectionRequest = {
    headers?: Record<string, string | string[] | undefined>;
    socket?: {
        remoteAddress?: string;
    };
};

export type RuntimeCharacters = Record<string, RuntimeCharacter | undefined>;
export type RuntimeNpcs = Record<string, RuntimeNpc | undefined>;
export type RuntimeClients = Record<string, RuntimeClient | undefined>;
export type AreaNpcMap = Record<string, EntityId[] | undefined>;
