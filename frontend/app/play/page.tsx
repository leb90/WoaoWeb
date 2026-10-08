"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Map, Maximize2, Minimize2 } from "lucide-react";
import React, {
    Suspense,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { MapRenderer } from "../../components/game";
import {
    DEFAULT_AURA_OPACITY,
    getEquipmentAuraOpacity,
    setEquipmentAuraOpacity,
} from "../../components/game/rendering/equipmentAuras";
import AdminIntervalsModal from "../../components/AdminIntervalsModal";
import BuffStatusSidebar from "../../components/BuffStatusSidebar";
import MacroBar from "../../components/MacroBar";
import BailModal from "../../components/BailModal";
import CharacterStatsModal from "../../components/CharacterStatsModal";
import CraftingModal from "../../components/CraftingModal";
import AuctionHouseModal from "../../components/AuctionHouseModal";
import MarketModal from "../../components/MarketModal";
import RetosModal from "../../components/RetosModal";
import TradeModal from "../../components/TradeModal";
import {
    GmBotCompanionBadge,
    GmBotPanel,
} from "../../components/game/overlays/GmBotPanel";
import { MobileHud } from "../../components/game/controls/MobileHud";
import type { JoystickDirection } from "../../components/game/controls/TouchJoystick";
import { MobileStatusPanel } from "../../components/game/controls/MobileStatusPanel";
import { MobileInventoryModal } from "../../components/game/controls/MobileInventoryModal";
import { MobileSpellsModal } from "../../components/game/controls/MobileSpellsModal";
import SkillsModal from "../../components/SkillsModal";
import { MobileTargetHint } from "../../components/game/controls/MobileTargetHint";
import type { TargetingMode } from "../../components/game/core/useCombatController";
import { MobileInstallGate } from "../../components/game/overlays/MobileInstallGate";
import { RotateDeviceOverlay } from "../../components/game/overlays/RotateDeviceOverlay";
import { useIsMobile } from "../../hooks/useIsMobile";
import { isStandaloneDisplayMode } from "../../lib/pwa";
import {
    setViewportRotation,
    type ViewportRotation,
} from "../../lib/viewportRotation";
import {
    createEmptyMacros,
    normalizeCharacterSettings,
    type CharacterSettingsResponse,
    type StoredMacro,
} from "../../lib/character-settings";
import {
    DEFAULT_HOTKEY_SETTINGS,
    formatHotkeyBinding,
    type HotkeySettings,
} from "../../lib/hotkeys";
import { formatNumber } from "../../lib/number-format";
import type {
    BailOffer,
    CraftingState,
    CharacterStatsSnapshot,
    SkillsState,
    EnvironmentState,
    ChatChannel,
    MarketPriceSort,
    PanelSnapshot,
    MarketPanelState,
    MarketState,
    PlayerHudState,
    QuestProgressNoticePayload,
    RetosState,
    TradeItem,
    TradeState,
} from "../../lib/aowProtocol";
import type { AuthErrorResponse } from "../../lib/auth";
import type {
    ArenaGameTicketResponse,
    ArenaRoomDetails,
} from "../../lib/arenas";
import {
    applyRuntimeTimingEnvironmentOverrides,
    mergeClientRuntimeTiming,
    type ClientRuntimeConfigResponse,
    DEFAULT_RUNTIME_TIMING,
    type RuntimeConfigResponse,
    type RuntimeTimingConfig,
} from "../../lib/runtime-config";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import {
    VIEWPORT_PIXEL_HEIGHT,
    VIEWPORT_PIXEL_WIDTH,
} from "../../lib/viewport";

const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:7666";
const OverviewModal = dynamic(() => import("../../components/OverviewModal"), {
    ssr: false,
});
const InventoryFloatingPanel = dynamic(
    () => import("../../components/InventoryFloatingPanel"),
    { ssr: false },
);
const CANVAS_BASE_WIDTH = VIEWPORT_PIXEL_WIDTH;
const CANVAS_BASE_HEIGHT = VIEWPORT_PIXEL_HEIGHT;
const HUD_GAP = 0;
const RIGHT_PANEL_WIDTH = 320;
const DESKTOP_CONSOLE_HEIGHT = 110;
const CHAT_TABS_ESTIMATED_HEIGHT = 32;
const CHAT_INPUT_ROW_HEIGHT = 36;
const EXP_BAR_ESTIMATED_HEIGHT = 34;
const RIGHT_COLUMN_ACTIONS_ESTIMATED_HEIGHT = 112;
const SHELL_VERTICAL_PADDING = 16;
const SHELL_TOP_PADDING = 64;
const SHELL_TOP_PADDING_FULLSCREEN = 0;
const SHELL_BOTTOM_PADDING_FULLSCREEN = 0;
const SHELL_HORIZONTAL_PADDING = 12;
const SHELL_HORIZONTAL_PADDING_FULLSCREEN = 0;
const COLUMN_SECTION_GAP = 6;
const EXP_SECTION_GAP = 0;
const MAX_HUD_SCALE = 2.5;
const FULLSCREEN_HINT_DURATION_MS = 2600;
const FULLSCREEN_PROMPT_MAX_WIDTH = 1200;
const FULLSCREEN_PROMPT_MAX_HEIGHT = 900;
const PLAY_HOTKEYS_HINT_STORAGE_KEY = "ao-play-hotkeys-hint-dismissed";
const PLAY_SOUND_VOLUME_STORAGE_KEY = "ao-play-sound-volume";
const PLAY_MINIMAP_VISIBLE_STORAGE_KEY = "ao-play-minimap-visible";
const PLAY_ORIENTATION_LOCK_STORAGE_KEY = "ao-play-orientation-locked";
const MOBILE_RECOVERY_STORAGE_KEY = "ao-play-mobile-recovery-at";
const MOBILE_RECOVERY_COOLDOWN_MS = 30_000;

function readLandscapeRotation(): 90 | -90 | null {
    if (typeof window === "undefined") {
        return null;
    }

    const legacyAngle = (window as unknown as { orientation?: number })
        .orientation;
    const angle =
        typeof legacyAngle === "number"
            ? legacyAngle
            : window.screen?.orientation?.angle;

    if (angle === 90) {
        return 90;
    }

    if (angle === -90 || angle === 270) {
        return -90;
    }

    return null;
}

function readStoredOrientationLock(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    return (
        window.localStorage.getItem(PLAY_ORIENTATION_LOCK_STORAGE_KEY) === "1"
    );
}
const LOGOUT_STARTED_MESSAGE =
    "[Servidor] Debes permanecer quieto durante 10 segundos para salir. Si te mueves, la salida se cancelará.";
const LOGOUT_CANCELLED_PATTERN = /^\[Servidor\] La salida se canceló porque /;
const LOGOUT_DENIED_PATTERN = /^\[Servidor\] No puedes salir /;
const LOGOUT_CLOSING_MESSAGE = "[Servidor] Cerrando sesión...";
const LOGOUT_DELAY_MS = 10000;
const CHALLENGE_INSTANCE_MAP_START = 2000;
const RETOS_INFO_MESSAGES = new Set([
    "[Retos] Reto publicado.",
    "[Retos] Reto cancelado.",
    "[Retos] Reto aceptado.",
]);
const RETOS_ERROR_MESSAGES = new Set([
    "Solo puedes usar retos en Mundo Abierto.",
    "No puedes usar retos mientras estás muerto.",
    "Solo puedes usar retos estando en zona segura.",
    "Ese personaje ya está participando en otro reto.",
    "Para crear o unirte a un reto 2vs2 debes estar en una party de 2.",
    "Solo el líder de la party puede crear o aceptar retos 2vs2.",
    "El reto 2vs2 requiere una party exacta de 2 personajes.",
    "Todos los miembros de la party deben estar conectados para el reto 2vs2.",
    "Debes estar conectado para usar retos.",
    "El modo de reto es inválido.",
    "El reto ya no está disponible.",
    "Solo puedes cancelar tu propio reto.",
    "El retador ya no está disponible.",
    "No puedes aceptar tu propio reto.",
]);
const CONSOLE_DISCORD_URL = "https://discord.gg/YpJ9XrMdg";
const CONSOLE_FEEDBACK_FORM_URL = "https://forms.gle/Df2cmGExTBjjJhAR8";
const WELCOME_CONSOLE_MESSAGES = {
    discord:
        "Bienvenido a AOWeb. Si quieres enterarte de las últimas actualizaciones del juego, puedes ingresar a nuestro Discord.",
    feedback:
        "- Si quieres reportar erorres o sugerir cambios, puedes hacerlo en: https://forms.gle/Df2cmGExTBjjJhAR8",
    rules: "- Está completamente prohibido el uso de personajes cámara, cheats o cualquier programa externo que modifique el juego, como auto tomar pociones o auto removerse. El uso de los mismos terminará en un ban permanente, sin previo aviso.",
} as const;
const CONSOLE_COLOR_TAG_PATTERN =
    /\[\[color=(#[0-9a-fA-F]{3,8})\]\]([\s\S]*?)\[\[\/color\]\]/g;
const CHALLENGE_OVERLAY_PATTERN = /^\[Reto\]\s+(10|[0-9]|YA)$/;

function isPrivateHostname(hostname: string): boolean {
    return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "0.0.0.0" ||
        hostname.startsWith("10.") ||
        hostname.startsWith("192.168.") ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
}

function resolveWebSocketUrl(configuredUrl: string): string {
    if (typeof window === "undefined") {
        return configuredUrl;
    }

    const pageProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    try {
        const configured = new URL(configuredUrl);
        const currentHost = window.location.hostname;

        if (configured.hostname === currentHost) {
            configured.protocol = pageProtocol;
            return configured.toString();
        }

        if (
            isPrivateHostname(configured.hostname) &&
            !isPrivateHostname(currentHost)
        ) {
            configured.protocol = pageProtocol;
            configured.hostname = currentHost;
            return configured.toString();
        }

        return configuredUrl;
    } catch {
        return `${pageProtocol}//${window.location.hostname}:7666`;
    }
}

type HudLayout = {
    canvasWidth?: number;
    canvasHeight?: number;
};

type RendererStatus = {
    connected: boolean;
    connecting: boolean;
    worldName?: string;
    error?: string;
    consoleLine?: string;
};

type ConnectionForm = {
    wsUrl: string;
    ticket: string;
    typeGame?: number;
    idChar?: number;
};

type GameTicketResponse = {
    ticket: string;
    expiresAt: string;
};

type MeasuredHudSize = {
    width: number;
    height: number;
};

type ScaledHudFrameProps = {
    scale: number;
    baseWidth?: number;
    onMeasure?: (size: MeasuredHudSize) => void;
    children: React.ReactNode;
    hidden?: boolean;
};

function hudSizesMatch(left: MeasuredHudSize, right: MeasuredHudSize) {
    return (
        Math.abs(left.width - right.width) <= 1 &&
        Math.abs(left.height - right.height) <= 1
    );
}

type EquipRequest = {
    slot: number;
    token: number;
};

type UseRequest = {
    slot: number;
    token: number;
};

type DropRequest = {
    slot: number;
    amount: number;
    token: number;
};

type BuyRequest = {
    slot: number;
    amount: number;
    token: number;
};

type SellRequest = {
    slot: number;
    amount: number;
    token: number;
};

type ChangeBankTabRequest = {
    tab: "character" | "account" | "clan";
    token: number;
};

type BankGoldRequest = {
    amount: number;
    token: number;
};

type CloseTradeRequest = {
    token: number;
};

type MarketActionRequest = {
    action:
        | "refresh"
        | "create"
        | "buy"
        | "cancel"
        | "claim"
        | "auctionCreate"
        | "auctionBid"
        | "auctionBuyout"
        | "auctionCancel"
        | "auctionClaim"
        | "auctionMailRead";
    payload?: Record<string, unknown>;
    token: number;
};

type MarketBrowseRequest = {
    listingLimit: number;
    search?: string;
    objType?: number | null;
    sortPrice?: MarketPriceSort;
};

type CraftRequest = {
    profession: "carpentry" | "blacksmith" | "tailoring";
    itemId: number;
    amount: number;
    token: number;
};

type ReorderInventoryRequest = {
    sourceSlot: number;
    targetSlot: number;
    token: number;
};

type ReorderSpellRequest = {
    sourceSlot: number;
    targetSlot: number;
    token: number;
};

type ReorderBankRequest = {
    sourceSlot: number;
    targetSlot: number;
    token: number;
};

type RangeAttackRequest = {
    token: number;
};

type MeleeAttackRequest = {
    token: number;
};

type SpellTargetRequest = {
    slot: number;
    manaRequired: number;
    name: string;
    token: number;
};

type ChatRequest = {
    message?: string;
    messages?: Array<{ text: string; id: number }>;
    token: number;
};

type ConsoleEntry = {
    id: number;
    text: string;
    color?: string;
    source: "console" | "dialog" | "system";
    speakerType?: "npc" | "user";
    channel?: ChatChannel;
    senderName?: string;
};

type GlobalCanvasNotice = {
    id: number;
    text: string;
    durationMs: number;
};

type QuestProgressCanvasNotice = QuestProgressNoticePayload & {
    id: number;
    visible: boolean;
};

type ChatTab = Exclude<ChatChannel, "gmbot">;
type NotifiableChatTab = Extract<ChatTab, "party" | "clan" | "whisper">;
type ChatEntriesByTab = Record<ChatTab, ConsoleEntry[]>;

const CHAT_TABS: Array<{ id: ChatTab; label: string }> = [
    { id: "console", label: "Consola" },
    { id: "global", label: "Global" },
    { id: "party", label: "Party" },
    { id: "clan", label: "Clan" },
    { id: "whisper", label: "Privados" },
];

function parseWhisperPartnerFromEntry(
    text: string,
    currentUserName?: string | null,
): string | null {
    const sentMatch = text.match(/^\[Privado\]\s+(.+?)\s+->\s+(.+?):\s+/i);

    if (sentMatch) {
        const from = sentMatch[1]?.trim();
        const to = sentMatch[2]?.trim();

        if (currentUserName && from === currentUserName) {
            return to || null;
        }

        if (currentUserName && to === currentUserName) {
            return from || null;
        }
    }

    const compactMatch = text.match(/^\[Privado\]\s+(.+?):\s+/i);

    if (compactMatch) {
        const visibleName = compactMatch[1]?.trim();

        if (!visibleName) {
            return null;
        }

        if (
            currentUserName &&
            visibleName.toLocaleLowerCase() ===
                currentUserName.trim().toLocaleLowerCase()
        ) {
            return null;
        }

        return visibleName;
    }

    return null;
}

function parseWhisperTargetFromCommand(message: string): string | null {
    const match = message.match(/^\/w\s+"(.+?)"\s+.+$/i);
    return match?.[1]?.trim() || null;
}

function isOwnChatEntry(
    entryText: string,
    channel: ChatTab,
    currentUserName?: string | null,
    senderName?: string,
): boolean {
    if (!currentUserName) {
        return false;
    }

    const normalizedUserName = currentUserName.trim().toLocaleLowerCase();

    if (channel === "whisper" && senderName) {
        return senderName.trim().toLocaleLowerCase() === normalizedUserName;
    }

    const matchesSender = (sender: string | null) =>
        Boolean(
            sender && sender.trim().toLocaleLowerCase() === normalizedUserName,
        );

    if (channel === "party") {
        const match = entryText.match(/^\[Party\]\s+(.+?):\s+/i);
        return matchesSender(match?.[1] ?? null);
    }

    if (channel === "clan") {
        const match = entryText.match(/^\[Clan\]\s+(.+?):\s+/i);
        return matchesSender(match?.[1] ?? null);
    }

    if (channel === "whisper") {
        const legacyMatch = entryText.match(/^\[Privado\]\s+(.+?)\s+->\s+/i);

        if (legacyMatch) {
            return matchesSender(legacyMatch?.[1] ?? null);
        }

        const compactMatch = entryText.match(/^\[Privado\]\s+(.+?):\s+/i);
        return matchesSender(compactMatch?.[1] ?? null);
    }

    return false;
}

function buildChatMessageForTab(
    tab: ChatTab,
    rawMessage: string,
    lastWhisperTarget: string | null,
): {
    message: string | null;
    nextWhisperTarget: string | null;
    error: string | null;
} {
    const trimmedMessage = rawMessage.trim();

    if (trimmedMessage.startsWith("/")) {
        const whisperTarget = parseWhisperTargetFromCommand(trimmedMessage);

        return {
            message: trimmedMessage.length === 0 ? " " : trimmedMessage,
            nextWhisperTarget: whisperTarget,
            error: null,
        };
    }

    if (trimmedMessage.length === 0) {
        return { message: " ", nextWhisperTarget: null, error: null };
    }

    switch (tab) {
        case "global":
            return {
                message: trimmedMessage,
                nextWhisperTarget: null,
                error: null,
            };
        case "party":
            return {
                message: `/p ${trimmedMessage}`,
                nextWhisperTarget: null,
                error: null,
            };
        case "clan":
            return {
                message: `/c ${trimmedMessage}`,
                nextWhisperTarget: null,
                error: null,
            };
        case "whisper":
            if (!lastWhisperTarget) {
                return {
                    message: null,
                    nextWhisperTarget: null,
                    error: 'Usa /w "usuario" mensaje una vez para elegir destinatario.',
                };
            }

            return {
                message: `/w "${lastWhisperTarget}" ${trimmedMessage}`,
                nextWhisperTarget: lastWhisperTarget,
                error: null,
            };
        default:
            return {
                message: trimmedMessage,
                nextWhisperTarget: null,
                error: null,
            };
    }
}

function renderConsoleEntryText(text: string) {
    if (text === WELCOME_CONSOLE_MESSAGES.discord) {
        const suffix = "Discord";
        const prefix = text.slice(0, -`${suffix}.`.length);

        return (
            <>
                {prefix}
                <a
                    href={CONSOLE_DISCORD_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-sky-300 underline underline-offset-2 hover:text-sky-200"
                >
                    {suffix}
                </a>
                .
            </>
        );
    }

    if (text === WELCOME_CONSOLE_MESSAGES.feedback) {
        const url = CONSOLE_FEEDBACK_FORM_URL;
        const prefix = text.slice(0, -url.length);

        return (
            <>
                {prefix}
                <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-semibold text-sky-300 underline underline-offset-2 hover:text-sky-200"
                >
                    {url}
                </a>
            </>
        );
    }

    if (!text.includes("[[color=")) {
        return text;
    }

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    CONSOLE_COLOR_TAG_PATTERN.lastIndex = 0;
    while ((match = CONSOLE_COLOR_TAG_PATTERN.exec(text)) !== null) {
        const [fullMatch, color, content] = match;

        if (match.index > lastIndex) {
            nodes.push(text.slice(lastIndex, match.index));
        }

        nodes.push(
            <span key={`console-color-${match.index}`} style={{ color }}>
                {content}
            </span>,
        );
        lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex === 0) {
        return text;
    }

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }

    return <>{nodes}</>;
}

function createEmptyUnreadChatCounts(): Record<NotifiableChatTab, number> {
    return {
        party: 0,
        clan: 0,
        whisper: 0,
    };
}

function createEmptyChatEntriesByTab(): ChatEntriesByTab {
    return {
        console: [],
        local: [],
        global: [],
        party: [],
        clan: [],
        whisper: [],
    };
}

const MAX_CONSOLE_ENTRIES = 75;

function setTimingValueByPath(
    timing: RuntimeTimingConfig,
    path: string,
    value: number,
): RuntimeTimingConfig {
    const clone = JSON.parse(JSON.stringify(timing)) as RuntimeTimingConfig;
    const segments = path.split(".");
    let current: Record<string, unknown> = clone as Record<string, unknown>;

    for (let index = 0; index < segments.length - 1; index += 1) {
        current = current[segments[index]] as Record<string, unknown>;
    }

    current[segments[segments.length - 1]] = value;
    return clone;
}

function ScaledHudFrame({
    scale,
    baseWidth,
    onMeasure,
    children,
    hidden = false,
}: ScaledHudFrameProps) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const lastReportedSizeRef = useRef<MeasuredHudSize | null>(null);
    const onMeasureRef = useRef(onMeasure);
    const [measuredSize, setMeasuredSize] = useState({
        width: baseWidth ?? 0,
        height: 0,
    });

    useEffect(() => {
        onMeasureRef.current = onMeasure;
    }, [onMeasure]);

    useEffect(() => {
        const element = innerRef.current;
        if (!element) {
            return;
        }

        const updateSize = () => {
            const nextSize = {
                width: baseWidth ?? Math.round(element.offsetWidth),
                height: Math.round(element.offsetHeight),
            };

            const lastReportedSize = lastReportedSizeRef.current;
            if (lastReportedSize && hudSizesMatch(lastReportedSize, nextSize)) {
                return;
            }

            lastReportedSizeRef.current = nextSize;
            onMeasureRef.current?.(nextSize);
            setMeasuredSize((current) =>
                hudSizesMatch(current, nextSize) ? current : nextSize,
            );
        };

        updateSize();

        const observer = new ResizeObserver(() => {
            updateSize();
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [baseWidth]);

    const frameWidth = (measuredSize.width || baseWidth || 0) * scale;
    const frameHeight = measuredSize.height * scale;

    return (
        <div
            className="relative overflow-visible"
            style={{
                width: frameWidth || undefined,
                height: frameHeight || undefined,
                flexShrink: 0,
                display: hidden ? "none" : undefined,
            }}
        >
            <div
                ref={innerRef}
                style={{
                    width: baseWidth ? `${baseWidth}px` : undefined,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
            >
                {children}
            </div>
        </div>
    );
}

function HomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const arenaRoomId = searchParams.get("room")?.trim() || "";
    const arenaTicket = searchParams.get("ticket")?.trim() || "";
    const arenaMode = searchParams.get("mode") === "arena";
    const arenaTemplateId = Number(searchParams.get("idChar") || "0");
    const [status, setStatus] = useState<RendererStatus>({
        connected: false,
        connecting: false,
    });
    const { session: authSession } = useAuthRedirect({
        redirectTo: "/login",
        when: "unauthenticated",
        preserveRedirect: true,
    });
    const selectedCharacter = useMemo(
        () =>
            authSession?.characters.find(
                (character) =>
                    character._id === authSession.selectedCharacterId,
            ) ?? null,
        [authSession],
    );
    const [selectedMap, setSelectedMap] = useState(
        () => selectedCharacter?.map ?? 1,
    );
    const [form, setForm] = useState<ConnectionForm>({
        wsUrl: DEFAULT_WS_URL,
        ticket: "",
    });
    const [connectionSeed, setConnectionSeed] = useState(0);
    const [activeConnection, setActiveConnection] =
        useState<ConnectionForm | null>(null);
    const [hud, setHud] = useState<PlayerHudState | null>(null);
    const [equipRequest, setEquipRequest] = useState<EquipRequest | null>(null);
    const [useItemClickRequest, setUseItemClickRequest] =
        useState<UseRequest | null>(null);
    const [useItemURequest, setUseItemURequest] = useState<UseRequest | null>(
        null,
    );
    const [assignSkillRequest, setAssignSkillRequest] = useState<{
        skillId: number;
        token: number;
    } | null>(null);
    const [skillsState, setSkillsState] = useState<SkillsState | null>(null);
    const [environmentState, setEnvironmentState] = useState<EnvironmentState | null>(null);
    const [dropRequest, setDropRequest] = useState<DropRequest | null>(null);
    const [buyRequest, setBuyRequest] = useState<BuyRequest | null>(null);
    const [sellRequest, setSellRequest] = useState<SellRequest | null>(null);
    const [changeBankTabRequest, setChangeBankTabRequest] =
        useState<ChangeBankTabRequest | null>(null);
    const [depositBankGoldRequest, setDepositBankGoldRequest] =
        useState<BankGoldRequest | null>(null);
    const [withdrawBankGoldRequest, setWithdrawBankGoldRequest] =
        useState<BankGoldRequest | null>(null);
    const [closeTradeRequest, setCloseTradeRequest] =
        useState<CloseTradeRequest | null>(null);
    const [marketActionRequest, setMarketActionRequest] =
        useState<MarketActionRequest | null>(null);
    const [craftRequest, setCraftRequest] = useState<CraftRequest | null>(null);
    const [reorderInventoryRequest, setReorderInventoryRequest] =
        useState<ReorderInventoryRequest | null>(null);
    const [reorderSpellRequest, setReorderSpellRequest] =
        useState<ReorderSpellRequest | null>(null);
    const [reorderBankRequest, setReorderBankRequest] =
        useState<ReorderBankRequest | null>(null);
    const { isMobile, isPortrait } = useIsMobile();
    // Inicializador perezoso (mismo patrón que useIsMobile) para no mostrar
    // el juego sin instalar durante un instante antes de que un efecto corra.
    const [isStandalonePwa] = useState(isStandaloneDisplayMode);
    const [rangeAttackRequest, setRangeAttackRequest] =
        useState<RangeAttackRequest | null>(null);
    const [meleeAttackRequest, setMeleeAttackRequest] =
        useState<MeleeAttackRequest | null>(null);
    const [touchMovementDirection, setTouchMovementDirection] =
        useState<JoystickDirection | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openSettingsRequest, setOpenSettingsRequest] = useState<{
        token: number;
    } | null>(null);
    // Lazy init desde localStorage (mismo patrón que isStandalonePwa) para
    // que el primer render mobile ya respete la preferencia guardada.
    const [isOrientationLocked, setIsOrientationLocked] = useState(
        readStoredOrientationLock,
    );
    const [targetingHint, setTargetingHint] = useState<TargetingMode | null>(
        null,
    );
    const [cancelTargetingRequest, setCancelTargetingRequest] = useState<{
        token: number;
    } | null>(null);
    const [isQuickSlotEditMode, setIsQuickSlotEditMode] = useState(false);
    const [isMobileSpellsOpen, setIsMobileSpellsOpen] = useState(false);
    const [isMobileSkillsOpen, setIsMobileSkillsOpen] = useState(false);
    // El jugador pidió salir: el cierre del socket que sigue no es un corte
    // a recuperar. Se marca al pedir /salir (el servidor puede cerrar antes
    // de que se procese su mensaje "Cerrando sesión...").
    const exitRequestedRef = useRef(false);
    const closeMobileSkills = useCallback(
        () => setIsMobileSkillsOpen(false),
        [],
    );
    const isMobileTargeting = isMobile && targetingHint !== null;

    // Hacia qué lado estaba girado el teléfono la última vez que estuvo en
    // horizontal: si se bloquea la orientación y después queda en vertical,
    // la vista se rota para seguir "pegada" a ese horizontal.
    const [lastLandscapeRotation, setLastLandscapeRotation] = useState<
        90 | -90
    >(() => readLandscapeRotation() ?? 90);

    useEffect(() => {
        const update = () => {
            const rotation = readLandscapeRotation();
            if (rotation !== null) {
                setLastLandscapeRotation(rotation);
            }
        };

        update();
        window.addEventListener("orientationchange", update);
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("orientationchange", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(
                PLAY_ORIENTATION_LOCK_STORAGE_KEY,
                isOrientationLocked ? "1" : "0",
            );
        } catch {
            // Ignore storage failures in restricted/browser test contexts.
        }
    }, [isOrientationLocked]);

    // Android (PWA instalada) soporta el bloqueo nativo de orientación: el
    // juego se pide siempre en horizontal, así entra girado solo aunque el
    // teléfono esté en vertical o tenga la auto-rotación apagada. Con el
    // candado activo se fija además el lado actual. iOS no lo soporta (lock
    // rechaza la promesa) y ahí siguen el cartel / la rotación por CSS.
    // Nunca se llama unlock() mientras se juega: en Android eso vuelve a la
    // orientación del manifest.
    useEffect(() => {
        if (!isMobile) {
            return;
        }

        const orientation = window.screen?.orientation as
            | (ScreenOrientation & {
                  lock?: (orientation: string) => Promise<void>;
              })
            | undefined;

        const currentType = orientation?.type ?? "";
        const target =
            isOrientationLocked && currentType.startsWith("landscape")
                ? currentType
                : "landscape";

        orientation?.lock?.(target).catch(() => {});
    }, [isMobile, isOrientationLocked]);

    useEffect(() => {
        if (!isMobile) {
            return;
        }

        return () => {
            window.screen?.orientation?.unlock?.();
        };
    }, [isMobile]);
    const [selectedSpellSlot, setSelectedSpellSlot] = useState<number | null>(
        null,
    );
    const [spellTargetRequest, setSpellTargetRequest] =
        useState<SpellTargetRequest | null>(null);
    const [chatRequest, setChatRequest] = useState<ChatRequest | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState("");
    const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);
    const [lastWhisperTarget, setLastWhisperTarget] = useState<string | null>(
        null,
    );
    const [unreadChatCounts, setUnreadChatCounts] = useState<
        Record<NotifiableChatTab, number>
    >(createEmptyUnreadChatCounts);
    const [tradeState, setTradeState] = useState<TradeState | null>(null);
    const [marketState, setMarketState] = useState<MarketPanelState | null>(null);
    const [auctionHousePresentation, setAuctionHousePresentation] = useState<"modal" | "hub">("modal");
    const [retosState, setRetosState] = useState<RetosState | null>(null);
    const [tradeStatusMessage, setTradeStatusMessage] = useState<string | null>(
        null,
    );
    const [retosOpen, setRetosOpen] = useState(false);
    const [retosLoading, setRetosLoading] = useState(false);
    const [retosActionKey, setRetosActionKey] = useState<string | null>(null);
    const [retosError, setRetosError] = useState<string | null>(null);
    const [retosInfo, setRetosInfo] = useState<string | null>(null);
    const [retosActionRequest, setRetosActionRequest] = useState<{
        action: "refresh" | "create" | "join" | "cancel";
        payload?: Record<string, unknown>;
        token: number;
    } | null>(null);
    const [challengeOverlayText, setChallengeOverlayText] = useState<
        string | null
    >(null);
    const [globalCanvasNotice, setGlobalCanvasNotice] =
        useState<GlobalCanvasNotice | null>(null);
    const [questProgressNotice, setQuestProgressNotice] =
        useState<QuestProgressCanvasNotice | null>(null);
    const [bailState, setBailState] = useState<BailOffer | null>(null);
    const [craftingState, setCraftingState] = useState<CraftingState | null>(
        null,
    );
    const [chatEntriesByTab, setChatEntriesByTab] = useState<ChatEntriesByTab>(
        createEmptyChatEntriesByTab,
    );
    const [activeChatTab, setActiveChatTab] = useState<ChatTab>("console");
    const [gmBotMessages, setGmBotMessages] = useState<ConsoleEntry[]>([]);
    const [gmBotOpen, setGmBotOpen] = useState(false);
    const [logoutPending, setLogoutPending] = useState(false);
    const [logoutDeadline, setLogoutDeadline] = useState<number | null>(null);
    const [logoutSecondsRemaining, setLogoutSecondsRemaining] = useState(0);
    const [pendingExitHref, setPendingExitHref] = useState<string | null>(null);
    const [hotkeySettings, setHotkeySettings] = useState<HotkeySettings>(
        DEFAULT_HOTKEY_SETTINGS,
    );
    const [macros, setMacros] =
        useState<Array<StoredMacro | null>>(createEmptyMacros());
    const tradeStateRef = useRef<TradeState | null>(null);
    const globalCanvasNoticeTimeoutRef = useRef<number | null>(null);
    const questProgressFadeTimeoutRef = useRef<number | null>(null);
    const questProgressClearTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        tradeStateRef.current = tradeState;
    }, [tradeState]);

    useEffect(() => {
        return () => {
            if (globalCanvasNoticeTimeoutRef.current !== null) {
                window.clearTimeout(globalCanvasNoticeTimeoutRef.current);
            }
            if (questProgressFadeTimeoutRef.current !== null) {
                window.clearTimeout(questProgressFadeTimeoutRef.current);
            }
            if (questProgressClearTimeoutRef.current !== null) {
                window.clearTimeout(questProgressClearTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (globalCanvasNoticeTimeoutRef.current !== null) {
            window.clearTimeout(globalCanvasNoticeTimeoutRef.current);
            globalCanvasNoticeTimeoutRef.current = null;
        }

        if (!globalCanvasNotice) {
            return;
        }

        globalCanvasNoticeTimeoutRef.current = window.setTimeout(() => {
            setGlobalCanvasNotice((current) =>
                current?.id === globalCanvasNotice.id ? null : current,
            );
            globalCanvasNoticeTimeoutRef.current = null;
        }, globalCanvasNotice.durationMs);
    }, [globalCanvasNotice]);

    useEffect(() => {
        if (!tradeState) {
            setTradeStatusMessage(null);
            return;
        }

        setMarketState(null);
    }, [tradeState]);
    useEffect(() => {
        if (!marketState) {
            return;
        }

        setTradeState(null);
        setTradeStatusMessage(null);
    }, [marketState]);
    useEffect(() => {
        if (!retosState) {
            return;
        }

        setRetosLoading(false);
        setRetosActionKey(null);
    }, [retosState]);
    const [soundVolume, setSoundVolume] = useState(1);
    const [auraOpacity, setAuraOpacity] = useState(DEFAULT_AURA_OPACITY);
    const hasInitializedSoundVolumeRef = useRef(false);
    const hasSkippedInitialSoundVolumePersistRef = useRef(false);
    const [runtimeTiming, setRuntimeTiming] = useState<RuntimeTimingConfig>(
        DEFAULT_RUNTIME_TIMING,
    );
    const useItemRepeatMs = Math.max(
        1,
        Math.round(runtimeTiming.actionCooldowns.useItemMs / 5),
    );
    const [adminIntervalsOpen, setAdminIntervalsOpen] = useState(false);
    const [adminIntervalsSavingPath, setAdminIntervalsSavingPath] = useState<
        string | null
    >(null);
    const [overviewOpen, setOverviewOpen] = useState(false);
    const [overviewRefreshing, setOverviewRefreshing] = useState(false);
    const [overviewSnapshot, setOverviewSnapshot] =
        useState<PanelSnapshot | null>(null);
    const [characterStatsOpen, setCharacterStatsOpen] = useState(false);
    const [characterStatsSnapshot, setCharacterStatsSnapshot] =
        useState<CharacterStatsSnapshot | null>(null);
    const [characterStatsLoading, setCharacterStatsLoading] = useState(false);
    const [isHotkeyIntroOpen, setIsHotkeyIntroOpen] = useState(false);
    const [deathHomePromptOpen, setDeathHomePromptOpen] = useState(false);
    const [isMinimapVisible, setIsMinimapVisible] = useState(true);
    const [minimapHost, setMinimapHost] = useState<HTMLElement | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenError, setFullscreenError] = useState<string | null>(null);
    const [showFullscreenHint, setShowFullscreenHint] = useState(false);
    const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
    const [topHudSectionSize, setTopHudSectionSize] = useState<MeasuredHudSize>(
        {
            width: CANVAS_BASE_WIDTH,
            height:
                CHAT_TABS_ESTIMATED_HEIGHT +
                DESKTOP_CONSOLE_HEIGHT +
                CHAT_INPUT_ROW_HEIGHT,
        },
    );
    const [rightColumnSize, setRightColumnSize] = useState<MeasuredHudSize>({
        width: RIGHT_PANEL_WIDTH,
        height: CANVAS_BASE_HEIGHT + RIGHT_COLUMN_ACTIONS_ESTIMATED_HEIGHT,
    });
    const [viewport, setViewport] = useState({
        width: 0,
        height: 0,
    });
    const lastConsoleEntryIdRef = useRef(0);
    const autoConnectKeyRef = useRef<string | null>(null);
    const activeChatTabRef = useRef<ChatTab>("console");
    const playerNameRef = useRef<string | null>(null);
    const chatInputRef = useRef<HTMLInputElement | null>(null);
    const chatFormRef = useRef<HTMLFormElement | null>(null);
    const consoleScrollRef = useRef<HTMLDivElement | null>(null);
    const loadedCharacterSettingsIdRef = useRef<string | null>(null);
    const lastSavedCharacterSettingsRef = useRef<string | null>(null);
    const previousDeadRef = useRef<boolean | null>(null);
    const gameShellRef = useRef<HTMLDivElement | null>(null);
    const [gameShellElement, setGameShellElement] =
        useState<HTMLDivElement | null>(null);
    const fullscreenPromptWasEvaluatedRef = useRef(false);
    const statusRef = useRef(status);
    const hudRef = useRef(hud);
    const selectedMapRef = useRef(selectedMap);
    const selectedCharacterRef = useRef(selectedCharacter ?? null);
    const setGameShellNode = useCallback((node: HTMLDivElement | null) => {
        gameShellRef.current = node;
        setGameShellElement(node);
    }, []);

    const setMinimapHostNode = useCallback((node: HTMLDivElement | null) => {
        setMinimapHost(node);
    }, []);

    const persistMinimapVisible = useCallback((visible: boolean) => {
        setIsMinimapVisible(visible);
        try {
            window.localStorage.setItem(
                PLAY_MINIMAP_VISIBLE_STORAGE_KEY,
                visible ? "1" : "0",
            );
        } catch {
            // Ignore storage failures in restricted/browser test contexts.
        }
    }, []);

    const switchCharacterHref = arenaMode
        ? arenaRoomId
            ? `/arenas?room=${encodeURIComponent(arenaRoomId)}`
            : "/arenas"
        : "/characters";
    const deathHomeTitle = arenaMode
        ? "Volver al sacerdote"
        : "Volver a la ciudad";
    const deathHomeDescription = arenaMode
        ? "También puedes volver al sacerdote con el comando /hogar"
        : "También puedes volver con el comando /hogar";

    useEffect(() => {
        activeChatTabRef.current = activeChatTab;
    }, [activeChatTab]);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    useEffect(() => {
        hudRef.current = hud;
    }, [hud]);

    useEffect(() => {
        selectedMapRef.current = selectedMap;
    }, [selectedMap]);

    useEffect(() => {
        selectedCharacterRef.current = selectedCharacter ?? null;
    }, [selectedCharacter]);

    useEffect(() => {
        playerNameRef.current = hud?.nameCharacter ?? null;
    }, [hud?.nameCharacter]);

    useEffect(() => {
        if (status.connected || status.connecting) {
            return;
        }

        if (
            selectedCharacter?.map != null &&
            selectedCharacter.map !== selectedMap
        ) {
            setSelectedMap(selectedCharacter.map);
        }
    }, [
        selectedCharacter?.map,
        selectedMap,
        status.connected,
        status.connecting,
    ]);

    const connection = useMemo(() => {
        if (!activeConnection) {
            return null;
        }

        return {
            ...activeConnection,
            sessionKey: `${connectionSeed}`,
            typeGame: activeConnection.typeGame ?? 1,
            idChar: activeConnection.idChar ?? 0,
        };
    }, [activeConnection, connectionSeed]);

    const handleMobileAttack = useCallback(() => {
        setMeleeAttackRequest((current) => ({
            token: (current?.token ?? 0) + 1,
        }));
    }, []);

    const sendChatMessage = useCallback(
        (message: string) => {
            const trimmedMessage = message.trim();
            const normalizedMessage =
                trimmedMessage.length === 0 ? message : trimmedMessage;

            if (normalizedMessage.length === 0) {
                return false;
            }

            const commandText = trimmedMessage
                .split(/\s+/, 1)[0]
                ?.toLowerCase();

            if (commandText === "/estadisticas" || commandText === "/stats") {
                setCharacterStatsOpen(true);
                setCharacterStatsLoading(true);
                setCharacterStatsSnapshot(null);
            }

            if (
                commandText === "/retos" &&
                trimmedMessage.localeCompare("/retos", "es", {
                    sensitivity: "base",
                }) === 0
            ) {
                setRetosOpen(true);
                return true;
            }

            setChatRequest((current) => {
                const nextId = (current?.token ?? 0) + 1;
                const previous =
                    current?.messages ??
                    (current?.message ? [{ text: current.message, id: current.token }] : []);
                return {
                    messages: [...previous, { text: normalizedMessage, id: nextId }],
                    token: nextId,
                };
            });
            return true;
        },
        [],
    );

    const requestRetosState = useCallback(
        (
            action: "refresh" | "create" | "join" | "cancel",
            payload?: Record<string, unknown>,
        ) => {
            setRetosError(null);
            setRetosInfo(null);
            setRetosLoading(true);
            setRetosActionRequest((current) => ({
                action,
                payload,
                token: (current?.token ?? 0) + 1,
            }));
        },
        [],
    );

    useEffect(() => {
        if (!retosOpen) {
            return;
        }

        requestRetosState("refresh");
    }, [requestRetosState, retosOpen]);

    useEffect(() => {
        let cancelled = false;

        const loadRuntimeTiming = async () => {
            try {
                const response = await fetch("/api/runtime-config", {
                    cache: "no-store",
                });
                const result = (await response.json()) as
                    | ClientRuntimeConfigResponse
                    | AuthErrorResponse;

                if (!response.ok || cancelled || "error" in result) {
                    return;
                }

                setRuntimeTiming(mergeClientRuntimeTiming(result.timing));
            } catch {
                return;
            }
        };

        void loadRuntimeTiming();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const isTypingOnTouchDevice = () => {
            const active = document.activeElement;
            return (
                (active instanceof HTMLInputElement ||
                    active instanceof HTMLTextAreaElement) &&
                window.matchMedia?.("(pointer: coarse)").matches
            );
        };

        const updateViewport = () => {
            // El teclado virtual achica el viewport: si se recalculara la
            // escala del canvas con eso, todo el HUD se reacomoda mientras se
            // escribe. Se congela hasta que el input pierde el foco.
            if (isTypingOnTouchDevice()) {
                return;
            }

            setViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            });

            // Tras girar, iOS puede dejar la página desplazada unos px; con
            // el HUD en position:fixed eso corre la zona táctil respecto de
            // lo que se ve y algunos botones parecen no responder.
            if (window.scrollX || window.scrollY) {
                window.scrollTo(0, 0);
            }
        };

        let focusOutTimer: number | null = null;
        const handleFocusOut = () => {
            if (focusOutTimer !== null) {
                window.clearTimeout(focusOutTimer);
            }
            focusOutTimer = window.setTimeout(updateViewport, 350);
        };

        updateViewport();
        window.addEventListener("resize", updateViewport);
        document.addEventListener("focusout", handleFocusOut);
        return () => {
            window.removeEventListener("resize", updateViewport);
            document.removeEventListener("focusout", handleFocusOut);
            if (focusOutTimer !== null) {
                window.clearTimeout(focusOutTimer);
            }
        };
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const shellElement = gameShellRef.current;
            const nextIsFullscreen =
                !!shellElement && document.fullscreenElement === shellElement;

            setIsFullscreen(nextIsFullscreen);
            if (nextIsFullscreen) {
                setFullscreenError(null);
            }
        };

        const handleFullscreenError = () => {
            setFullscreenError(
                "No se pudo activar pantalla completa en este navegador.",
            );
        };

        handleFullscreenChange();
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("fullscreenerror", handleFullscreenError);

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
            document.removeEventListener(
                "fullscreenerror",
                handleFullscreenError,
            );
        };
    }, []);

    useEffect(() => {
        if (!isFullscreen) {
            setShowFullscreenHint(false);
            return;
        }

        setShowFullscreenHint(true);
        const timeoutId = window.setTimeout(() => {
            setShowFullscreenHint(false);
        }, FULLSCREEN_HINT_DURATION_MS);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isFullscreen]);

    useEffect(() => {
        if (!status.connected) {
            fullscreenPromptWasEvaluatedRef.current = false;
            setShowFullscreenPrompt(false);
            return;
        }

        // El landscape ya se resuelve solo por CSS en mobile, y la API de
        // pantalla completa no funciona sobre un <div> en varios navegadores
        // mobile (Safari de iPhone entre ellos) - el cartel no aporta nada
        // ahí y solo muestra un error confuso.
        if (isMobile) {
            fullscreenPromptWasEvaluatedRef.current = true;
            setShowFullscreenPrompt(false);
            return;
        }

        if (isFullscreen) {
            fullscreenPromptWasEvaluatedRef.current = true;
            setShowFullscreenPrompt(false);
            return;
        }

        if (fullscreenPromptWasEvaluatedRef.current) {
            return;
        }

        if (!viewport.width || !viewport.height) {
            return;
        }

        fullscreenPromptWasEvaluatedRef.current = true;

        const shouldSuggestFullscreen =
            viewport.width <= FULLSCREEN_PROMPT_MAX_WIDTH ||
            viewport.height <= FULLSCREEN_PROMPT_MAX_HEIGHT;

        if (shouldSuggestFullscreen) {
            setShowFullscreenPrompt(true);
        }
    }, [isFullscreen, isMobile, status.connected, viewport.height, viewport.width]);

    useEffect(() => {
        setForm((current) => {
            const nextWsUrl = resolveWebSocketUrl(current.wsUrl);

            if (nextWsUrl === current.wsUrl) {
                return current;
            }

            return {
                ...current,
                wsUrl: nextWsUrl,
            };
        });
    }, []);

    useEffect(() => {
        if (!authSession) {
            setForm((current) => ({
                ...current,
                ticket: "",
            }));
            return;
        }

        const selectedCharacterId = authSession.selectedCharacterId || "";

        if (!arenaMode && !selectedCharacterId) {
            autoConnectKeyRef.current = null;
            setActiveConnection(null);
            setHud(null);
            setChatEntriesByTab(createEmptyChatEntriesByTab());
            setStatus({
                connected: false,
                connecting: false,
                worldName: undefined,
                error: undefined,
                consoleLine: undefined,
            });
            router.replace("/characters");
            return;
        }

        setForm((current) => ({
            ...current,
            ticket: "",
        }));
    }, [arenaMode, authSession, router]);

    useEffect(() => {
        if (!authSession) {
            return;
        }

        void fetch("/api/auth/session", { cache: "no-store" }).catch(
            () => null,
        );
    }, [authSession]);

    useEffect(() => {
        if (
            !arenaMode ||
            !!arenaRoomId ||
            !arenaTicket ||
            status.connecting ||
            status.connected
        ) {
            return;
        }

        const nextKey = `arena:${arenaTicket}:${arenaTemplateId}`;

        if (autoConnectKeyRef.current === nextKey) {
            return;
        }

        autoConnectKeyRef.current = nextKey;
        setHud(null);
        setChatEntriesByTab(createEmptyChatEntriesByTab());
        setStatus({
            connected: false,
            connecting: true,
            worldName: undefined,
            error: undefined,
            consoleLine: undefined,
        });
        setForm((current) => ({
            ...current,
            ticket: arenaTicket,
        }));
        setConnectionSeed((current) => current + 1);
        setActiveConnection({
            wsUrl: form.wsUrl,
            ticket: arenaTicket,
            typeGame: 2,
            idChar: Number.isFinite(arenaTemplateId) ? arenaTemplateId : 0,
        });
    }, [
        arenaMode,
        arenaRoomId,
        arenaTemplateId,
        arenaTicket,
        form.wsUrl,
        status.connected,
        status.connecting,
    ]);

    useEffect(() => {
        if (
            !arenaMode ||
            !arenaRoomId ||
            status.connecting ||
            status.connected
        ) {
            return;
        }

        const nextKey = `arena-room:${arenaRoomId}`;

        if (autoConnectKeyRef.current === nextKey) {
            return;
        }

        autoConnectKeyRef.current = nextKey;

        const startArenaConnection = async () => {
            setHud(null);
            setChatEntriesByTab(createEmptyChatEntriesByTab());
            setStatus({
                connected: false,
                connecting: true,
                worldName: undefined,
                error: undefined,
                consoleLine: undefined,
            });

            try {
                const roomResponse = await fetch(
                    `/api/arenas/rooms/${arenaRoomId}`,
                    {
                        cache: "no-store",
                    },
                );
                const roomResult = (await roomResponse.json()) as
                    | ArenaRoomDetails
                    | AuthErrorResponse;

                if (!roomResponse.ok || "error" in roomResult) {
                    throw new Error(
                        "error" in roomResult
                            ? roomResult.error
                            : "No se pudo recuperar la sala",
                    );
                }

                const templateId = roomResult.member?.selectedPvpTemplateId;

                if (templateId === null || templateId === undefined) {
                    router.replace(
                        `/arenas?room=${encodeURIComponent(arenaRoomId)}`,
                    );
                    return;
                }

                const ticketResponse = await fetch(
                    `/api/arenas/rooms/${arenaRoomId}/select-template`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ templateId }),
                    },
                );
                const ticketResult = (await ticketResponse.json()) as
                    | ArenaGameTicketResponse
                    | AuthErrorResponse;

                if (!ticketResponse.ok || "error" in ticketResult) {
                    throw new Error(
                        "error" in ticketResult
                            ? ticketResult.error
                            : "No se pudo regenerar el ticket de arena",
                    );
                }

                setForm((current) => ({
                    ...current,
                    ticket: ticketResult.ticket,
                }));
                setConnectionSeed((current) => current + 1);
                setActiveConnection({
                    wsUrl: form.wsUrl,
                    ticket: ticketResult.ticket,
                    typeGame: 2,
                    idChar: templateId,
                });
            } catch (error) {
                autoConnectKeyRef.current = null;
                setStatus({
                    connected: false,
                    connecting: false,
                    worldName: undefined,
                    error:
                        error instanceof Error
                            ? error.message
                            : "No se pudo reingresar a la arena",
                });
                router.replace(
                    `/arenas?room=${encodeURIComponent(arenaRoomId)}`,
                );
            }
        };

        void startArenaConnection();
    }, [
        arenaMode,
        arenaRoomId,
        form.wsUrl,
        router,
        status.connected,
        status.connecting,
    ]);

    useEffect(() => {
        if (
            arenaMode ||
            !authSession?.selectedCharacterId ||
            !authSession ||
            status.connecting ||
            status.connected
        ) {
            return;
        }

        const nextKey = `${authSession.account._id}:${authSession.selectedCharacterId}`;

        if (autoConnectKeyRef.current === nextKey) {
            return;
        }

        autoConnectKeyRef.current = nextKey;

        const startConnection = async () => {
            setHud(null);
            setChatEntriesByTab(createEmptyChatEntriesByTab());
            setStatus({
                connected: false,
                connecting: true,
                worldName: undefined,
                error: undefined,
                consoleLine: undefined,
            });

            try {
                const response = await fetch("/api/auth/game-ticket", {
                    method: "POST",
                });

                const result = (await response.json()) as
                    | GameTicketResponse
                    | AuthErrorResponse;

                if (!response.ok || "error" in result) {
                    throw new Error(
                        "error" in result
                            ? result.error
                            : "No se pudo crear el ticket de juego",
                    );
                }

                setForm((current) => ({
                    ...current,
                    ticket: result.ticket,
                }));
                setConnectionSeed((current) => current + 1);
                setActiveConnection({
                    wsUrl: form.wsUrl,
                    ticket: result.ticket,
                });
            } catch (error) {
                autoConnectKeyRef.current = null;
                setStatus({
                    connected: false,
                    connecting: false,
                    worldName: undefined,
                    error:
                        error instanceof Error
                            ? error.message
                            : "No se pudo iniciar la conexion",
                });
            }
        };

        void startConnection();
    }, [
        arenaMode,
        authSession,
        form.wsUrl,
        status.connected,
        status.connecting,
    ]);

    // En mobile nunca se usa el layout de escritorio, sin importar el ancho
    // real del viewport - un celular en horizontal físico puede medir más de
    // 768px y antes activaba por error la barra de consola/HUD de escritorio
    // al mismo tiempo que el HUD táctil, generando íconos duplicados.
    const isDesktopConsoleLayout = !isMobile && viewport.width > 768;

    // En mobile el canvas tiene que llenar toda la pantalla sin bordes -
    // nada de padding fijo pensado para el shell de escritorio.
    const shellTopPadding = isMobile
        ? 0
        : isFullscreen
          ? SHELL_TOP_PADDING_FULLSCREEN
          : SHELL_TOP_PADDING;
    const shellBottomPadding = isMobile
        ? 0
        : isFullscreen
          ? SHELL_BOTTOM_PADDING_FULLSCREEN
          : SHELL_VERTICAL_PADDING;
    const shellHorizontalPadding = isMobile
        ? 0
        : isFullscreen
          ? SHELL_HORIZONTAL_PADDING_FULLSCREEN
          : SHELL_HORIZONTAL_PADDING;

    const handleTopHudSectionMeasure = useCallback((size: MeasuredHudSize) => {
        setTopHudSectionSize((current) =>
            hudSizesMatch(current, size) ? current : size,
        );
    }, []);

    const handleRightColumnMeasure = useCallback((size: MeasuredHudSize) => {
        setRightColumnSize((current) =>
            hudSizesMatch(current, size) ? current : size,
        );
    }, []);

    const lockedRotation: ViewportRotation =
        isMobile && isPortrait && isOrientationLocked
            ? lastLandscapeRotation
            : 0;

    useEffect(() => {
        setViewportRotation(lockedRotation);
        return () => setViewportRotation(0);
    }, [lockedRotation]);

    // Con la vista rotada, lo que el jugador ve como ancho es el alto real.
    const effectiveViewportWidth = lockedRotation
        ? viewport.height
        : viewport.width;
    const effectiveViewportHeight = lockedRotation
        ? viewport.width
        : viewport.height;

    const hudScale = useMemo(() => {
        if (!effectiveViewportWidth || !effectiveViewportHeight) {
            return 1;
        }

        const centerColumnBaseHeight =
            (isDesktopConsoleLayout ? topHudSectionSize.height : 0) +
            CANVAS_BASE_HEIGHT +
            (isFullscreen ? 0 : EXP_SECTION_GAP + EXP_BAR_ESTIMATED_HEIGHT);
        const totalBaseHeight = centerColumnBaseHeight;
        // La columna derecha (inventario) está oculta en mobile salvo que
        // se abra a pedido - no le tiene que seguir robando ancho al canvas.
        const totalBaseWidth =
            CANVAS_BASE_WIDTH +
            (isMobile ? 0 : HUD_GAP + rightColumnSize.width);
        const availableWidth =
            effectiveViewportWidth - shellHorizontalPadding * 2;
        const availableHeight =
            effectiveViewportHeight -
            shellTopPadding -
            shellBottomPadding -
            (isFullscreen ? 2 : 0);
        const widthScale = availableWidth / totalBaseWidth;
        const heightScale = availableHeight / totalBaseHeight;
        // En mobile se usa "cover" (llenar toda la pantalla, recortando lo
        // que sobre) en vez de "contain" (ajustar sin recortar, que es lo
        // que deja franjas negras a los costados en un celular en
        // horizontal, más ancho en proporción que el canvas base).
        const nextScale = isMobile
            ? Math.max(widthScale, heightScale)
            : Math.min(widthScale, heightScale);

        if (!Number.isFinite(nextScale) || nextScale <= 0) {
            return 1;
        }

        const maxScale = MAX_HUD_SCALE;
        return Math.min(maxScale, nextScale);
    }, [
        isDesktopConsoleLayout,
        isFullscreen,
        isMobile,
        rightColumnSize.width,
        shellHorizontalPadding,
        shellBottomPadding,
        shellTopPadding,
        topHudSectionSize.height,
        effectiveViewportHeight,
        effectiveViewportWidth,
    ]);

    const hudLayout = useMemo<HudLayout>(() => {
        if (!viewport.width || !viewport.height || hudScale === 1) {
            return {
                canvasWidth: CANVAS_BASE_WIDTH,
                canvasHeight: CANVAS_BASE_HEIGHT,
            };
        }

        return {
            canvasWidth: Math.max(1, Math.floor(CANVAS_BASE_WIDTH * hudScale)),
            canvasHeight: Math.max(1, Math.floor(CANVAS_BASE_HEIGHT * hudScale)),
        };
    }, [hudScale, viewport.height, viewport.width]);

    const toggleFullscreen = useCallback(async () => {
        const shellElement = gameShellRef.current;
        if (!shellElement) {
            return;
        }

        try {
            if (document.fullscreenElement === shellElement) {
                await document.exitFullscreen();
                return;
            }

            setFullscreenError(null);
            await shellElement.requestFullscreen({ navigationUI: "hide" });
        } catch {
            setFullscreenError(
                "No se pudo activar pantalla completa en este navegador.",
            );
        }
    }, []);

    const dismissFullscreenPrompt = useCallback(() => {
        setShowFullscreenPrompt(false);
    }, []);

    const resetConnectionState = useCallback(() => {
        autoConnectKeyRef.current = null;
        setLogoutPending(false);
        setLogoutDeadline(null);
        setLogoutSecondsRemaining(0);
        setPendingExitHref(null);
        setActiveConnection(null);
        setHud(null);
        setEquipRequest(null);
        setChatRequest(null);
        setIsChatOpen(false);
        setChatMessage("");
        setIsChatMenuOpen(false);
        setIsConsoleOpen(false);
        setLastWhisperTarget(null);
        setUnreadChatCounts(createEmptyUnreadChatCounts());
        setDeathHomePromptOpen(false);
        setTradeState(null);
        setTradeStatusMessage(null);
        setRetosState(null);
        setRetosOpen(false);
        setRetosLoading(false);
        setRetosActionKey(null);
        setRetosActionRequest(null);
        setChallengeOverlayText(null);
        setBailState(null);
        setAdminIntervalsOpen(false);
        setAdminIntervalsSavingPath(null);
        setOverviewOpen(false);
        setOverviewRefreshing(false);
        setOverviewSnapshot(null);
        setChatEntriesByTab(createEmptyChatEntriesByTab());
        setActiveChatTab("console");
        activeChatTabRef.current = "console";
        playerNameRef.current = null;
        setStatus({
            connected: false,
            connecting: false,
            worldName: undefined,
            error: undefined,
            consoleLine: undefined,
        });
    }, []);

    const disconnect = useCallback(
        (nextHref?: string) => {
            resetConnectionState();

            if (arenaMode) {
                router.replace(
                    nextHref ??
                        (arenaRoomId
                            ? `/arenas?room=${encodeURIComponent(arenaRoomId)}`
                            : "/arenas"),
                );
            }
        },
        [arenaMode, arenaRoomId, resetConnectionState, router],
    );

    const appendConsoleEntry = useCallback(
        (entry: Omit<ConsoleEntry, "id">) => {
            if (entry.channel === "gmbot") {
                setGmBotOpen(true);
                setGmBotMessages((current) => {
                    const nextId = Math.max(
                        Date.now(),
                        lastConsoleEntryIdRef.current + 1,
                    );
                    lastConsoleEntryIdRef.current = nextId;
                    return [...current.slice(-19), { id: nextId, ...entry }];
                });
                return;
            }

            if (entry.source === "console") {
                const challengeOverlayMatch = entry.text.match(
                    CHALLENGE_OVERLAY_PATTERN,
                );

                if (challengeOverlayMatch) {
                    const overlayText = challengeOverlayMatch[1] ?? null;

                    setChallengeOverlayText(overlayText);
                    window.setTimeout(
                        () => {
                            setChallengeOverlayText((current) =>
                                current === overlayText ? null : current,
                            );
                        },
                        overlayText === "YA" ? 1300 : 900,
                    );

                    return;
                }

                if (entry.text === LOGOUT_STARTED_MESSAGE) {
                    setLogoutPending(true);
                    setLogoutDeadline(Date.now() + LOGOUT_DELAY_MS);
                } else if (LOGOUT_CANCELLED_PATTERN.test(entry.text)) {
                    exitRequestedRef.current = false;
                    setLogoutPending(false);
                    setLogoutDeadline(null);
                    setLogoutSecondsRemaining(0);
                    setPendingExitHref(null);
                } else if (LOGOUT_DENIED_PATTERN.test(entry.text)) {
                    exitRequestedRef.current = false;
                    setLogoutPending(false);
                    setLogoutDeadline(null);
                    setLogoutSecondsRemaining(0);
                    setPendingExitHref(null);
                } else if (entry.text === LOGOUT_CLOSING_MESSAGE) {
                    setLogoutPending(true);
                    setLogoutDeadline(null);
                    setLogoutSecondsRemaining(0);
                }

                if (RETOS_INFO_MESSAGES.has(entry.text)) {
                    setRetosLoading(false);
                    setRetosActionKey(null);
                    setRetosError(null);
                    setRetosInfo(entry.text);
                } else if (RETOS_ERROR_MESSAGES.has(entry.text)) {
                    setRetosLoading(false);
                    setRetosActionKey(null);
                    setRetosInfo(null);
                    setRetosError(entry.text);
                }
            }

            if (entry.source !== "console" && entry.source !== "system") {
                if (entry.source !== "dialog" || entry.speakerType === "npc") {
                    return;
                }
            }

            if (
                entry.source !== "console" &&
                entry.source !== "dialog" &&
                entry.source !== "system"
            ) {
                return;
            }

            if (
                tradeStateRef.current?.mode === "bank" &&
                entry.source === "console" &&
                /boveda/i.test(entry.text)
            ) {
                setTradeStatusMessage(entry.text);
            }

            if (entry.channel === "whisper") {
                const whisperPartner =
                    entry.senderName &&
                    playerNameRef.current &&
                    entry.senderName.trim().toLocaleLowerCase() !==
                        playerNameRef.current.trim().toLocaleLowerCase()
                        ? entry.senderName
                        : parseWhisperPartnerFromEntry(
                              entry.text,
                              playerNameRef.current,
                          );

                if (whisperPartner) {
                    setLastWhisperTarget(whisperPartner);
                }
            }

            const nextChannel = entry.channel ?? "console";

            if (
                (nextChannel === "party" ||
                    nextChannel === "clan" ||
                    nextChannel === "whisper") &&
                nextChannel !== activeChatTabRef.current &&
                !isOwnChatEntry(
                    entry.text,
                    nextChannel,
                    playerNameRef.current,
                    entry.senderName,
                )
            ) {
                setUnreadChatCounts((current) => ({
                    ...current,
                    [nextChannel]: current[nextChannel] + 1,
                }));
            }

            setChatEntriesByTab((current) => {
                const nextId = Math.max(
                    Date.now(),
                    lastConsoleEntryIdRef.current + 1,
                );
                lastConsoleEntryIdRef.current = nextId;
                const nextEntry = {
                    id: nextId,
                    channel: nextChannel,
                    ...entry,
                };

                return {
                    ...current,
                    [nextChannel]: [
                        ...current[nextChannel].slice(
                            -(MAX_CONSOLE_ENTRIES - 1),
                        ),
                        nextEntry,
                    ],
                };
            });
        },
        [],
    );

    const refreshRuntimeTiming = useCallback(async () => {
        try {
            const response = await fetch("/api/runtime-config", {
                cache: "no-store",
            });
            const result = (await response.json()) as
                | RuntimeConfigResponse
                | AuthErrorResponse;

            if (!response.ok || "error" in result) {
                throw new Error(
                    "error" in result
                        ? result.error
                        : "No se pudo cargar la configuracion de intervalos",
                );
            }

            setRuntimeTiming(
                applyRuntimeTimingEnvironmentOverrides(result.timing),
            );
        } catch (error) {
            appendConsoleEntry({
                text:
                    error instanceof Error
                        ? error.message
                        : "No se pudo cargar la configuracion de intervalos",
                color: "#fca5a5",
                source: "system",
            });
        }
    }, [appendConsoleEntry]);

    useEffect(() => {
        if (!logoutPending || !logoutDeadline) {
            setLogoutSecondsRemaining(0);
            return;
        }

        const updateRemaining = () => {
            const remainingMs = Math.max(0, logoutDeadline - Date.now());
            setLogoutSecondsRemaining(Math.ceil(remainingMs / 1000));
        };

        updateRemaining();
        const intervalId = window.setInterval(updateRemaining, 200);
        return () => window.clearInterval(intervalId);
    }, [logoutDeadline, logoutPending]);

    useEffect(() => {
        if (
            arenaMode ||
            !status.connected ||
            logoutPending ||
            hud?.zonaSegura !== 0 ||
            hud?.dead
        ) {
            return;
        }

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue =
                "Para salir en zona insegura usa /salir y espera 10 segundos sin moverte.";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [
        arenaMode,
        hud?.dead,
        hud?.zonaSegura,
        logoutPending,
        status.connected,
    ]);

    // Mobile: al bloquear la pantalla, iOS suele cortar el websocket y/o
    // descartar el contexto WebGL, dejando el canvas en negro. Se recarga
    // /play una vez (reconecta solo con el personaje ya seleccionado); si
    // eso vuelve a fallar enseguida, se vuelve a la selección de personajes.
    const wasConnectedRef = useRef(false);
    const webglContextLostRef = useRef(false);
    const statusConnectedRef = useRef(status.connected);
    const logoutPendingRef = useRef(logoutPending);

    useEffect(() => {
        statusConnectedRef.current = status.connected;
        logoutPendingRef.current = logoutPending;
    }, [logoutPending, status.connected]);

    const recoverMobileSession = useCallback(() => {
        let lastAttemptAt = 0;
        try {
            lastAttemptAt = Number(
                window.sessionStorage.getItem(MOBILE_RECOVERY_STORAGE_KEY) ??
                    0,
            );
        } catch {
            // sessionStorage bloqueado: se intenta la recarga igual.
        }

        if (Date.now() - lastAttemptAt < MOBILE_RECOVERY_COOLDOWN_MS) {
            disconnect();
            router.replace("/characters");
            return;
        }

        try {
            window.sessionStorage.setItem(
                MOBILE_RECOVERY_STORAGE_KEY,
                String(Date.now()),
            );
        } catch {
            // Ignorado: solo evita reintentos en loop.
        }
        window.location.reload();
    }, [disconnect, router]);

    useEffect(() => {
        if (status.connected) {
            wasConnectedRef.current = true;
            return;
        }

        if (
            !isMobile ||
            !wasConnectedRef.current ||
            status.connecting ||
            logoutPending ||
            exitRequestedRef.current
        ) {
            return;
        }

        // Si la pestaña está oculta se espera al visibilitychange (que
        // revisa este mismo flag) para no recargar en segundo plano.
        if (document.visibilityState === "visible") {
            wasConnectedRef.current = false;
            recoverMobileSession();
        }
    }, [
        isMobile,
        logoutPending,
        recoverMobileSession,
        status.connected,
        status.connecting,
    ]);

    useEffect(() => {
        if (!isMobile) {
            return;
        }

        const handleContextLost = (event: Event) => {
            // Solo importa el canvas del juego, no otros (ej. el retrato).
            if (
                event.target instanceof HTMLElement &&
                event.target.closest(".map-renderer")
            ) {
                webglContextLostRef.current = true;
            }
        };

        let resumeTimer: number | null = null;
        const handleVisibilityChange = () => {
            if (document.visibilityState !== "visible") {
                return;
            }

            if (resumeTimer !== null) {
                window.clearTimeout(resumeTimer);
            }

            // Se da un momento para que el socket reporte su estado real.
            resumeTimer = window.setTimeout(() => {
                resumeTimer = null;
                if (logoutPendingRef.current || exitRequestedRef.current) {
                    return;
                }

                if (
                    webglContextLostRef.current ||
                    (wasConnectedRef.current && !statusConnectedRef.current)
                ) {
                    wasConnectedRef.current = false;
                    recoverMobileSession();
                }
            }, 1500);
        };

        // webglcontextlost no burbujea; se captura en fase de captura.
        window.addEventListener("webglcontextlost", handleContextLost, true);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            window.removeEventListener(
                "webglcontextlost",
                handleContextLost,
                true,
            );
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            if (resumeTimer !== null) {
                window.clearTimeout(resumeTimer);
            }
        };
    }, [isMobile, recoverMobileSession]);

    useEffect(() => {
        if (
            (!logoutPending && !exitRequestedRef.current) ||
            status.connected ||
            status.connecting ||
            !wasConnectedRef.current
        ) {
            return;
        }

        // disconnect() reinicia el estado de salida; sin esto el efecto de
        // reconexión mobile vería "estaba conectado y se cortó" y recargaría
        // /play antes de que termine la navegación.
        wasConnectedRef.current = false;
        exitRequestedRef.current = true;
        disconnect();
        router.replace(
            pendingExitHref ??
                (arenaMode ? switchCharacterHref : "/characters"),
        );
    }, [
        arenaMode,
        disconnect,
        logoutPending,
        pendingExitHref,
        router,
        status.connected,
        status.connecting,
        switchCharacterHref,
    ]);

    const handleStatusChange = useCallback((nextStatus: RendererStatus) => {
        const nextWorldName =
            typeof nextStatus.worldName === "string" &&
            nextStatus.worldName.trim().length > 0
                ? nextStatus.worldName
                : undefined;

        setStatus((current) => ({
            ...current,
            ...nextStatus,
            worldName: nextWorldName ?? current.worldName,
        }));
    }, []);

    const handleGlobalNotice = useCallback(
        (notice: { text: string; durationMs: number }) => {
            setGlobalCanvasNotice({
                id: Date.now(),
                text: notice.text,
                durationMs: Math.max(1000, notice.durationMs),
            });
        },
        [],
    );

    const handleQuestProgressNotice = useCallback(
        (notice: QuestProgressNoticePayload) => {
            const message = notice.message?.trim();
            if (!message) {
                return;
            }

            if (questProgressFadeTimeoutRef.current !== null) {
                window.clearTimeout(questProgressFadeTimeoutRef.current);
                questProgressFadeTimeoutRef.current = null;
            }
            if (questProgressClearTimeoutRef.current !== null) {
                window.clearTimeout(questProgressClearTimeoutRef.current);
                questProgressClearTimeoutRef.current = null;
            }

            const id = Date.now();
            setQuestProgressNotice({
                ...notice,
                id,
                message,
                visible: true,
            });

            questProgressFadeTimeoutRef.current = window.setTimeout(() => {
                setQuestProgressNotice((current) =>
                    current?.id === id ? { ...current, visible: false } : current,
                );
                questProgressFadeTimeoutRef.current = null;
            }, 2400);

            questProgressClearTimeoutRef.current = window.setTimeout(() => {
                setQuestProgressNotice((current) =>
                    current?.id === id ? null : current,
                );
                questProgressClearTimeoutRef.current = null;
            }, 3000);
        },
        [],
    );

    useEffect(() => {
        if (!marketState) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            setMarketState(null);
            setCloseTradeRequest((current) => ({
                token: (current?.token ?? 0) + 1,
            }));
        };

        document.addEventListener("keydown", handleKeyDown, true);
        return () =>
            document.removeEventListener("keydown", handleKeyDown, true);
    }, [marketState]);

    useLayoutEffect(() => {
        let nextVolume = 1;

        try {
            const storedVolume = window.localStorage.getItem(
                PLAY_SOUND_VOLUME_STORAGE_KEY,
            );

            if (storedVolume != null) {
                const parsedVolume = Number.parseFloat(storedVolume);

                if (Number.isFinite(parsedVolume)) {
                    nextVolume = Math.min(1, Math.max(0, parsedVolume));
                }
            }
        } catch {
            nextVolume = 1;
        }

        hasInitializedSoundVolumeRef.current = true;
        setSoundVolume(nextVolume);
        setAuraOpacity(getEquipmentAuraOpacity());
    }, []);

    useEffect(() => {
        try {
            const storedMinimapVisible = window.localStorage.getItem(
                PLAY_MINIMAP_VISIBLE_STORAGE_KEY,
            );

            if (storedMinimapVisible === "0") {
                setIsMinimapVisible(false);
            }
        } catch {
            setIsMinimapVisible(true);
        }
    }, []);

    useEffect(() => {
        // En mobile se juega con el HUD tactil, no con teclado - este aviso
        // de hotkeys de escritorio no aplica y no tiene sentido mostrarlo.
        if (isMobile) {
            setIsHotkeyIntroOpen(false);
            return;
        }

        try {
            const hasSeenIntro = window.localStorage.getItem(
                PLAY_HOTKEYS_HINT_STORAGE_KEY,
            );

            if (!hasSeenIntro) {
                setIsHotkeyIntroOpen(true);
            }
        } catch {
            setIsHotkeyIntroOpen(true);
        }
    }, [isMobile]);

    useEffect(() => {
        if (!hasInitializedSoundVolumeRef.current) {
            return;
        }

        if (!hasSkippedInitialSoundVolumePersistRef.current) {
            hasSkippedInitialSoundVolumePersistRef.current = true;
            return;
        }

        try {
            window.localStorage.setItem(
                PLAY_SOUND_VOLUME_STORAGE_KEY,
                soundVolume.toString(),
            );
        } catch {
            // Ignore storage failures in restricted/browser test contexts.
        }
    }, [soundVolume]);

    useEffect(() => {
        if (!isChatOpen) {
            return;
        }

        chatInputRef.current?.focus();
        chatInputRef.current?.select();
    }, [isChatOpen]);

    useEffect(() => {
        // En mobile no se re-enfoca el input al tocar la pantalla: dejaría el
        // teclado abierto tapando el juego mientras se usa el joystick.
        if (!isChatOpen || isMobile) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) {
                return;
            }

            if (chatFormRef.current?.contains(target)) {
                return;
            }

            const activeElement = document.activeElement;
            if (activeElement === chatInputRef.current) {
                event.preventDefault();
            }

            window.requestAnimationFrame(() => {
                const input = chatInputRef.current;
                if (!input || !isChatOpen) {
                    return;
                }

                input.focus();
                const cursorPosition = input.value.length;
                input.setSelectionRange(cursorPosition, cursorPosition);
            });
        };

        document.addEventListener("pointerdown", handlePointerDown, true);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown,
                true,
            );
        };
    }, [isChatOpen, isMobile]);

    // Al cerrarse el teclado de iOS la página puede quedar desplazada; se
    // vuelve al origen para que el HUD fijo quede donde corresponde.
    useEffect(() => {
        if (!isMobile || isChatOpen) {
            return;
        }

        window.scrollTo(0, 0);
    }, [isChatOpen, isMobile]);

    useEffect(() => {
        if (!status.connected && isChatOpen) {
            setIsChatOpen(false);
            setChatMessage("");
        }
    }, [isChatOpen, status.connected]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!status.connected) {
                return;
            }

            const target = event.target;
            const isTypingTarget =
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement ||
                (target instanceof HTMLElement && target.isContentEditable);

            if (event.key === "Enter" && !isTypingTarget && !isChatOpen) {
                event.preventDefault();
                setIsChatOpen(true);
                return;
            }

            if (event.key === "Escape" && isChatOpen) {
                setIsChatOpen(false);
                setChatMessage("");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isChatOpen, status.connected]);

    const submitChatMessage = useCallback(() => {
        const result = buildChatMessageForTab(
            activeChatTab,
            chatMessage,
            lastWhisperTarget,
        );

        if (result.error) {
            appendConsoleEntry({
                text: result.error,
                color: "#fca5a5",
                source: "system",
                channel: activeChatTab === "whisper" ? "whisper" : "console",
            });
            return;
        }

        if (result.nextWhisperTarget) {
            setLastWhisperTarget(result.nextWhisperTarget);
        }

        sendChatMessage(result.message ?? " ");
        setIsChatOpen(false);
        setChatMessage("");
    }, [
        activeChatTab,
        appendConsoleEntry,
        chatMessage,
        lastWhisperTarget,
        sendChatMessage,
    ]);

    // Botón "Salir": misma desconexión que /salir (con la espera en zona
    // insegura), pero al terminar vuelve al home en vez de a personajes.
    // En arena se respeta el destino propio de ese modo.
    const handleLogoutRequest = useCallback(() => {
        exitRequestedRef.current = true;
        if (!arenaMode) {
            setPendingExitHref("/");
        }
        sendChatMessage("/salir");
    }, [arenaMode, sendChatMessage]);

    const handlePayBail = useCallback(() => {
        sendChatMessage("/fianza pagar");
    }, [sendChatMessage]);

    const handleMoveInventoryItem = useCallback(
        (sourceSlot: number, targetSlot: number) => {
            setHud((currentHud) => {
                if (!currentHud) {
                    return currentHud;
                }

                const sourceItem =
                    currentHud.inventory.find(
                        (item) => item.slot === sourceSlot,
                    ) ?? null;

                if (!sourceItem) {
                    return currentHud;
                }

                const nextInventory = currentHud.inventory.flatMap((item) => {
                    if (item.slot === sourceSlot) {
                        return [{ ...item, slot: targetSlot }];
                    }

                    if (item.slot === targetSlot) {
                        return [{ ...item, slot: sourceSlot }];
                    }

                    return [item];
                });

                setReorderInventoryRequest((current) => ({
                    sourceSlot,
                    targetSlot,
                    token: (current?.token ?? 0) + 1,
                }));

                return {
                    ...currentHud,
                    inventory: nextInventory,
                };
            });
        },
        [],
    );

    const handleDeathHomeConfirm = useCallback(() => {
        setDeathHomePromptOpen(false);
        sendChatMessage("/hogar");
    }, [sendChatMessage]);

    const handleAdminIntervalSave = useCallback(
        (path: string, value: number) => {
            setRuntimeTiming((current) =>
                setTimingValueByPath(current, path, value),
            );
            setAdminIntervalsSavingPath(path);
            setChatRequest((current) => ({
                message: `/intervalo ${path} ${value}`,
                token: (current?.token ?? 0) + 1,
            }));

            window.setTimeout(() => {
                setAdminIntervalsSavingPath((current) =>
                    current === path ? null : current,
                );
                void refreshRuntimeTiming();
            }, 500);
        },
        [refreshRuntimeTiming],
    );

    const refreshOverview = useCallback(() => {
        setOverviewRefreshing(true);
        setChatRequest((current) => ({
            message: "/paquetes",
            token: (current?.token ?? 0) + 1,
        }));
    }, []);

    useEffect(() => {
        if (
            selectedSpellSlot !== null &&
            !hud?.spells.some((spell) => spell.slot === selectedSpellSlot)
        ) {
            setSelectedSpellSlot(null);
        }
    }, [hud?.spells, selectedSpellSlot]);

    useEffect(() => {
        if (!hud) {
            previousDeadRef.current = null;
            setDeathHomePromptOpen(false);
            return;
        }

        const isDead = Boolean(hud.dead);
        const isInChallengeInstance = hud.map >= CHALLENGE_INSTANCE_MAP_START;
        const isFactionWarDeath = Boolean(
            hud.factionWarState?.active &&
                Number(hud.map) === Number(hud.factionWarState.map),
        );

        if (
            previousDeadRef.current !== true &&
            isDead &&
            !isInChallengeInstance &&
            !isFactionWarDeath
        ) {
            setDeathHomePromptOpen(true);
        }

        if (!isDead || isInChallengeInstance || isFactionWarDeath) {
            setDeathHomePromptOpen(false);
        }

        previousDeadRef.current = isDead;
    }, [hud]);

    const tradePlayerItems = useMemo<TradeItem[]>(() => {
        if (!tradeState) {
            return [];
        }

        const tradeItemsBySlot = new globalThis.Map<number, TradeItem>(
            tradeState.playerItems.map((item) => [item.slot, item]),
        );

        return (hud?.inventory ?? []).map((item) => {
            const tradeItem = tradeItemsBySlot.get(item.slot);

            return {
                slot: item.slot,
                name: item.name,
                grhIndex: item.grhIndex,
                amount: item.amount,
                value: tradeItem?.value ?? item.value,
                validForUser: tradeItem?.validForUser ?? item.validForUser,
                details: tradeItem?.details ?? item.details,
                equipped: item.equipped,
            };
        });
    }, [hud?.inventory, tradeState]);

    const visibleConsoleEntries = useMemo(
        () => chatEntriesByTab[activeChatTab] ?? [],
        [activeChatTab, chatEntriesByTab],
    );
    const activeChatTabLabel =
        CHAT_TABS.find((tab) => tab.id === activeChatTab)?.label ?? "Consola";
    const totalUnreadChatCount =
        unreadChatCounts.party +
        unreadChatCounts.clan +
        unreadChatCounts.whisper;
    const whisperPlaceholder = lastWhisperTarget
        ? `Mensaje privado para ${lastWhisperTarget}`
        : 'Usa /w "usuario" mensaje';

    useEffect(() => {
        if (
            activeChatTab === "party" ||
            activeChatTab === "clan" ||
            activeChatTab === "whisper"
        ) {
            setUnreadChatCounts((current) => ({
                ...current,
                [activeChatTab]: 0,
            }));
        }
    }, [activeChatTab]);

    useEffect(() => {
        if (!isDesktopConsoleLayout && !isConsoleOpen) {
            return;
        }

        const container = consoleScrollRef.current;

        if (!container) {
            return;
        }

        container.scrollTop = container.scrollHeight;
    }, [isDesktopConsoleLayout, isConsoleOpen, visibleConsoleEntries]);

    useEffect(() => {
        if (arenaMode || !authSession?.selectedCharacterId) {
            loadedCharacterSettingsIdRef.current = null;
            lastSavedCharacterSettingsRef.current = null;
            setHotkeySettings(DEFAULT_HOTKEY_SETTINGS);
            setMacros(createEmptyMacros());
            return;
        }

        const characterId = authSession.selectedCharacterId;
        let cancelled = false;

        loadedCharacterSettingsIdRef.current = null;
        lastSavedCharacterSettingsRef.current = null;
        const loadCharacterSettings = async () => {
            for (let attempt = 0; attempt < 2; attempt += 1) {
                try {
                    const response = await fetch(
                        "/api/auth/character-settings",
                        {
                            cache: "no-store",
                        },
                    );
                    const result = (await response.json()) as
                        | CharacterSettingsResponse
                        | AuthErrorResponse;

                    if (cancelled) {
                        return;
                    }

                    if (!response.ok || "error" in result) {
                        continue;
                    }

                    const normalized = normalizeCharacterSettings(result);

                    if (!normalized || normalized.characterId !== characterId) {
                        continue;
                    }

                    setHotkeySettings(normalized.hotkeys);
                    setMacros(normalized.macros);
                    loadedCharacterSettingsIdRef.current = characterId;
                    lastSavedCharacterSettingsRef.current = JSON.stringify({
                        hotkeys: normalized.hotkeys,
                        macros: normalized.macros,
                    });
                    return;
                } catch {
                    continue;
                }
            }

            if (!cancelled) {
                setHotkeySettings(DEFAULT_HOTKEY_SETTINGS);
                setMacros(createEmptyMacros());
            }
        };

        void loadCharacterSettings();

        return () => {
            cancelled = true;
        };
    }, [arenaMode, authSession?.selectedCharacterId]);

    useEffect(() => {
        if (arenaMode || !authSession?.selectedCharacterId) {
            return;
        }

        if (
            loadedCharacterSettingsIdRef.current !==
            authSession.selectedCharacterId
        ) {
            return;
        }

        const payload = {
            hotkeys: hotkeySettings,
            macros,
        };
        const serializedPayload = JSON.stringify(payload);

        if (lastSavedCharacterSettingsRef.current === serializedPayload) {
            return;
        }

        const selectedCharacterId = authSession.selectedCharacterId;
        const timeoutId = window.setTimeout(() => {
            void fetch("/api/auth/character-settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: serializedPayload,
            })
                .then(async (response) => {
                    if (!response.ok) {
                        return;
                    }

                    const result = (await response.json()) as
                        | CharacterSettingsResponse
                        | AuthErrorResponse;

                    if ("error" in result) {
                        return;
                    }

                    const normalized = normalizeCharacterSettings(result);

                    if (
                        !normalized ||
                        loadedCharacterSettingsIdRef.current !==
                            selectedCharacterId ||
                        normalized.characterId !== selectedCharacterId
                    ) {
                        return;
                    }

                    lastSavedCharacterSettingsRef.current = JSON.stringify({
                        hotkeys: normalized.hotkeys,
                        macros: normalized.macros,
                    });
                })
                .catch(() => undefined);
        }, 400);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [arenaMode, authSession?.selectedCharacterId, hotkeySettings, macros]);

    const dismissHotkeyIntro = useCallback(() => {
        setIsHotkeyIntroOpen(false);

        try {
            window.localStorage.setItem(PLAY_HOTKEYS_HINT_STORAGE_KEY, "1");
        } catch {
            return;
        }
    }, []);

    const defaultHotkeyIntroItems = useMemo(
        () => [
            {
                label: "Mover arriba",
                value: formatHotkeyBinding(DEFAULT_HOTKEY_SETTINGS.moveUp),
            },
            {
                label: "Mover izquierda",
                value: formatHotkeyBinding(DEFAULT_HOTKEY_SETTINGS.moveLeft),
            },
            {
                label: "Mover abajo",
                value: formatHotkeyBinding(DEFAULT_HOTKEY_SETTINGS.moveDown),
            },
            {
                label: "Mover derecha",
                value: formatHotkeyBinding(DEFAULT_HOTKEY_SETTINGS.moveRight),
            },
            {
                label: "Abrir / cerrar mapa",
                value: formatHotkeyBinding(
                    DEFAULT_HOTKEY_SETTINGS.toggleWorldMap,
                ),
            },
            {
                label: "Activar / desactivar seguro",
                value: formatHotkeyBinding(
                    DEFAULT_HOTKEY_SETTINGS.toggleSeguro,
                ),
            },
            {
                label: "Activar / desactivar seguro de clan",
                value: formatHotkeyBinding(
                    DEFAULT_HOTKEY_SETTINGS.toggleClanSeguro,
                ),
            },
            {
                label: "Agarrar item",
                value: formatHotkeyBinding(DEFAULT_HOTKEY_SETTINGS.pickupItem),
            },
            {
                label: "Atacar / apuntar",
                value: formatHotkeyBinding(
                    DEFAULT_HOTKEY_SETTINGS.attackOrTarget,
                ),
            },
            {
                label: "Meditar",
                value: formatHotkeyBinding(DEFAULT_HOTKEY_SETTINGS.meditate),
            },
            {
                label: "Equipar item",
                value: formatHotkeyBinding(DEFAULT_HOTKEY_SETTINGS.equipItem),
            },
            {
                label: "Usar item",
                value: formatHotkeyBinding(DEFAULT_HOTKEY_SETTINGS.useItem),
            },
            {
                label: "Tirar item",
                value: formatHotkeyBinding(DEFAULT_HOTKEY_SETTINGS.dropItem),
            },
            { label: "Chat", value: "Enter" },
            { label: "Cancelar / cerrar", value: "Esc" },
        ],
        [],
    );

    const chatTabsMenu = (
        <div className="flex h-full flex-col gap-1 rounded-2xl border border-cyan-200/20 bg-stone-950/72 p-2 shadow-2xl backdrop-blur-[2px]">
            {CHAT_TABS.map((tab) => {
                const isActive = tab.id === activeChatTab;
                const unreadCount =
                    tab.id === "party" ||
                    tab.id === "clan" ||
                    tab.id === "whisper"
                        ? unreadChatCounts[tab.id]
                        : 0;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={(event) => {
                            setActiveChatTab(tab.id);
                            setIsChatMenuOpen(false);
                            event.currentTarget.blur();
                        }}
                        className={`relative flex min-h-0 flex-1 items-center justify-center rounded-full px-3 py-1 text-center text-[10px] font-medium uppercase tracking-[0.2em] transition focus:outline-none focus-visible:outline-none ${
                            isActive
                                ? "bg-cyan-300/18 text-cyan-100"
                                : "bg-stone-900/70 text-stone-400 hover:text-stone-200"
                        }`}
                    >
                        {tab.label}
                        {unreadCount > 0 ? (
                            <span className="absolute right-1.5 top-1/2 flex min-w-3.5 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-semibold leading-3 text-white">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );

    const fullscreenToggleButton = (
        <button
            type="button"
            onClick={(event) => {
                void toggleFullscreen();
                event.currentTarget.blur();
            }}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-cyan-200/25 bg-stone-950/78 text-cyan-100/85 shadow-xl backdrop-blur-md transition hover:border-cyan-200/45 hover:bg-stone-900/85 hover:text-white focus:outline-none focus-visible:outline-none"
            aria-label={
                isFullscreen
                    ? "Salir de pantalla completa"
                    : "Entrar en pantalla completa"
            }
            title={
                isFullscreen
                    ? "Salir de pantalla completa"
                    : "Entrar en pantalla completa"
            }
        >
            {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
            ) : (
                <Maximize2 className="h-5 w-5" />
            )}
        </button>
    );

    const fullscreenToggleControl = (
        <div className="pointer-events-none flex flex-col items-end gap-2">
            {showFullscreenHint ? (
                <div className="rounded-full border border-white/10 bg-stone-950/70 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-stone-300/85 shadow-xl backdrop-blur-md">
                    Esc para salir
                </div>
            ) : null}
            {fullscreenToggleButton}
        </div>
    );

    const chatTabsHorizontal = (
        <div className="flex gap-px border-b border-[#6f5734] bg-[#1a120c]">
            {CHAT_TABS.map((tab) => {
                const isActive = tab.id === activeChatTab;
                const unreadCount =
                    tab.id === "party" ||
                    tab.id === "clan" ||
                    tab.id === "whisper"
                        ? unreadChatCounts[tab.id]
                        : 0;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={(event) => {
                            setActiveChatTab(tab.id);
                            event.currentTarget.blur();
                        }}
                        className={`relative min-w-0 flex-1 px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-[0.14em] transition focus:outline-none focus-visible:outline-none ${
                            isActive
                                ? "bg-[#2a1c12] text-amber-100"
                                : "text-stone-400 hover:bg-[#24180f] hover:text-stone-200"
                        }`}
                    >
                        {tab.label}
                        {unreadCount > 0 ? (
                            <span className="absolute -right-0.5 -top-0.5 flex min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-semibold leading-3 text-white">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        ) : null}
                    </button>
                );
            })}
            <button
                type="button"
                onClick={(event) => {
                    persistMinimapVisible(!isMinimapVisible);
                    event.currentTarget.blur();
                }}
                className={`inline-flex w-9 shrink-0 items-center justify-center border-l border-[#6f5734] transition focus:outline-none focus-visible:outline-none ${
                    isMinimapVisible
                        ? "bg-[#2a1c12] text-amber-200"
                        : "text-stone-500 hover:bg-[#24180f] hover:text-amber-100"
                }`}
                aria-pressed={isMinimapVisible}
                aria-label={
                    isMinimapVisible ? "Ocultar minimapa" : "Mostrar minimapa"
                }
                title={
                    isMinimapVisible ? "Ocultar minimapa" : "Mostrar minimapa"
                }
            >
                <Map className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
        </div>
    );

    const consoleMessages = (
        <>
            {visibleConsoleEntries.length ? (
                visibleConsoleEntries.map((entry) => (
                    <div
                        key={entry.id}
                        className="min-w-0 break-all [overflow-wrap:anywhere]"
                        style={{
                            color: entry.color || "rgba(231, 229, 228, 0.92)",
                        }}
                    >
                        {renderConsoleEntryText(entry.text)}
                    </div>
                ))
            ) : (
                <div className="text-stone-300/55">
                    No hay mensajes en {activeChatTabLabel.toLowerCase()}{" "}
                    todavía.
                </div>
            )}
        </>
    );

    const activeFactionWarState = hud?.factionWarState?.active
        ? hud.factionWarState
        : null;

    if (isMobile && !isStandalonePwa) {
        return (
            <MobileInstallGate
                onCancel={() => router.push("/characters")}
            />
        );
    }

    return (
        <div
            ref={setGameShellNode}
            className="game-shell"
            style={
                lockedRotation
                    ? {
                          // Orientación bloqueada con el teléfono en vertical:
                          // la vista sigue en horizontal respecto al teléfono,
                          // como una app nativa bloqueada en landscape. Todo el
                          // HUD fijo vive adentro, así que rota junto con ella.
                          position: "fixed",
                          top: "50%",
                          left: "50%",
                          width: `${viewport.height}px`,
                          height: `${viewport.width}px`,
                          transform: `translate(-50%, -50%) rotate(${lockedRotation}deg)`,
                      }
                    : undefined
            }
            onContextMenu={(event) => {
                event.preventDefault();
            }}
            onDragStart={(event) => {
                event.preventDefault();
            }}
        >
            <div
                className={`pointer-events-none fixed inset-0 z-20 flex justify-center overflow-hidden ${
                    isMobile ? "items-center" : "items-start"
                }`}
                style={{
                    padding: `${shellTopPadding}px ${shellHorizontalPadding}px ${shellBottomPadding}px`,
                }}
            >
                <div
                    className="pointer-events-auto relative flex flex-col"
                    style={{ gap: `${HUD_GAP}px` }}
                >
                    {isDesktopConsoleLayout && !isFullscreen ? (
                        <div
                            className="pointer-events-none absolute right-0 z-40"
                            style={{ bottom: "100%", marginBottom: "8px" }}
                        >
                            {fullscreenToggleControl}
                        </div>
                    ) : null}
                    <div
                        className="flex items-start"
                        style={{ gap: `${HUD_GAP}px` }}
                    >
                        <div
                            className="flex flex-col"
                            style={{
                                width: `${hudLayout.canvasWidth ?? CANVAS_BASE_WIDTH}px`,
                                gap: `${EXP_SECTION_GAP}px`,
                            }}
                        >
                            <div className="overflow-hidden bg-[#0c0907]">
                            {isDesktopConsoleLayout ? (
                                <ScaledHudFrame
                                    scale={hudScale}
                                    baseWidth={CANVAS_BASE_WIDTH}
                                    onMeasure={handleTopHudSectionMeasure}
                                >
                                    <div className="pointer-events-auto isolate flex w-full min-w-0 flex-col overflow-hidden bg-[#0c0907]">
                                        <div className="flex w-full min-w-0 items-stretch overflow-hidden border-b border-[#6f5734]">
                                            <div className="flex min-w-0 w-0 flex-1 flex-col overflow-hidden">
                                            {chatTabsHorizontal}
                                            <div
                                                ref={consoleScrollRef}
                                                className="min-w-0 overflow-y-auto overflow-x-hidden break-all px-3 py-1.5 text-[11px] leading-4 text-stone-200/90 [overflow-wrap:anywhere]"
                                                style={{
                                                    height: `${DESKTOP_CONSOLE_HEIGHT}px`,
                                                }}
                                            >
                                                {consoleMessages}
                                            </div>
                                            </div>
                                            {isMinimapVisible ? (
                                                <div
                                                    ref={setMinimapHostNode}
                                                    className="relative z-[1] flex w-[100px] shrink-0 items-center justify-center self-stretch border-l border-[#6f5734] bg-[#0b0705] p-1"
                                                />
                                            ) : null}
                                        </div>
                                        <div
                                            className="h-9 shrink-0 border-t border-[#6f5734] bg-black"
                                            style={{ height: `${CHAT_INPUT_ROW_HEIGHT}px` }}
                                        >
                                            {isChatOpen ? (
                                                <form
                                                    ref={chatFormRef}
                                                    className="pointer-events-auto flex h-full w-full items-center px-4"
                                                    onSubmit={(event) => {
                                                        event.preventDefault();
                                                        submitChatMessage();
                                                    }}
                                                >
                                                    <input
                                                        ref={chatInputRef}
                                                        type="text"
                                                        autoComplete="off"
                                                        value={chatMessage}
                                                        maxLength={120}
                                                        onChange={(event) =>
                                                            setChatMessage(
                                                                event.target.value,
                                                            )
                                                        }
                                                        onKeyDown={(event) => {
                                                            if (
                                                                event.key ===
                                                                "Escape"
                                                            ) {
                                                                event.preventDefault();
                                                                setIsChatOpen(
                                                                    false,
                                                                );
                                                                setChatMessage(
                                                                    "",
                                                                );
                                                            }
                                                        }}
                                                        placeholder={
                                                            activeChatTab ===
                                                            "global"
                                                                ? "/global para mandar un mensaje global"
                                                                : activeChatTab ===
                                                                    "party"
                                                                  ? "Mensaje para la party"
                                                                  : activeChatTab ===
                                                                      "clan"
                                                                    ? "Mensaje para el clan"
                                                                    : activeChatTab ===
                                                                        "whisper"
                                                                      ? whisperPlaceholder
                                                                      : "Escribi tu mensaje y presiona Enter"
                                                        }
                                                        className="min-w-0 flex-1 bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
                                                    />
                                                </form>
                                            ) : null}
                                        </div>
                                    </div>
                                </ScaledHudFrame>
                            ) : null}
                            </div>
                            <div
                                className="relative overflow-hidden rounded-none bg-black"
                                style={{
                                    width: `${hudLayout.canvasWidth ?? CANVAS_BASE_WIDTH}px`,
                                    height: `${hudLayout.canvasHeight ?? CANVAS_BASE_HEIGHT}px`,
                                }}
                            >
                                <BuffStatusSidebar
                                    hud={hud}
                                    runtimeTiming={runtimeTiming}
                                    skillsState={skillsState}
                                />
                                <MapRenderer
                                    embedded
                                    mapNumber={selectedMap}
                                    width={hudLayout.canvasWidth}
                                    height={hudLayout.canvasHeight}
                                    connection={connection}
                                    isMobile={isMobile}
                                    touchMovementDirection={
                                        touchMovementDirection
                                    }
                                    meleeAttackRequest={meleeAttackRequest}
                                    equipRequest={equipRequest}
                                    useItemClickRequest={useItemClickRequest}
                                    useItemURequest={useItemURequest}
                                    assignSkillRequest={assignSkillRequest}
                                    dropRequest={dropRequest}
                                    buyRequest={buyRequest}
                                    sellRequest={sellRequest}
                                    changeBankTabRequest={changeBankTabRequest}
                                    depositBankGoldRequest={
                                        depositBankGoldRequest
                                    }
                                    withdrawBankGoldRequest={
                                        withdrawBankGoldRequest
                                    }
                                    closeTradeRequest={closeTradeRequest}
                                    marketActionRequest={marketActionRequest}
                                    retosActionRequest={retosActionRequest}
                                    craftRequest={craftRequest}
                                    reorderInventoryRequest={
                                        reorderInventoryRequest
                                    }
                                    reorderSpellRequest={reorderSpellRequest}
                                    reorderBankRequest={reorderBankRequest}
                                    rangeAttackRequest={rangeAttackRequest}
                                    spellTargetRequest={spellTargetRequest}
                                    chatRequest={chatRequest}
                                    runtimeTiming={runtimeTiming}
                                    hotkeySettings={hotkeySettings}
                                    macros={macros}
                                    soundVolume={soundVolume}
                                    onMapChange={setSelectedMap}
                                    onStatusChange={handleStatusChange}
                                    onHudChange={setHud}
                                    onConsoleMessage={appendConsoleEntry}
                                    onTargetingModeChange={setTargetingHint}
                                    cancelTargetingRequest={
                                        cancelTargetingRequest
                                    }
                                    onGlobalNotice={handleGlobalNotice}
                                    onQuestProgressNotice={
                                        handleQuestProgressNotice
                                    }
                                    onTradeStateChange={setTradeState}
                                    onMarketStateChange={setMarketState}
                                    onRetosStateChange={setRetosState}
                                    onBailStateChange={setBailState}
                                    onCraftingStateChange={setCraftingState}
                                    onAdminIntervalsOpen={() =>
                                        setAdminIntervalsOpen(true)
                                    }
                                    onAdminOverviewSnapshot={(snapshot) => {
                                        setOverviewSnapshot(snapshot);
                                        setOverviewRefreshing(false);
                                        setOverviewOpen(true);
                                    }}
                                    onCharacterStatsSnapshot={(snapshot) => {
                                        setCharacterStatsSnapshot(snapshot);
                                        setCharacterStatsLoading(false);
                                        setCharacterStatsOpen(true);
                                    }}
                                    onSkillsState={setSkillsState}
                                    onEnvironmentUpdate={setEnvironmentState}
                                />

                                {activeFactionWarState ? (
                                    <div className="pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2">
                                        <div className="flex items-center overflow-hidden rounded-md border border-stone-200/15 bg-stone-950/80 font-serif shadow-2xl backdrop-blur-md">
                                            <div className="min-w-[92px] px-3 py-1.5 text-right">
                                                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-300/85">
                                                    Hordas
                                                </div>
                                                <div className="text-2xl font-black leading-none text-red-400 tabular-nums">
                                                    {formatNumber(
                                                        activeFactionWarState.hordeKills,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border-x border-stone-200/12 px-3 py-1.5 text-center">
                                                <div className="text-[10px] uppercase tracking-[0.22em] text-amber-200/80">
                                                    Guerra
                                                </div>
                                                <div className="text-sm font-bold leading-none text-stone-100">
                                                    Kills
                                                </div>
                                            </div>
                                            <div className="min-w-[92px] px-3 py-1.5 text-left">
                                                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-300/85">
                                                    Alianzas
                                                </div>
                                                <div className="text-2xl font-black leading-none text-sky-400 tabular-nums">
                                                    {formatNumber(
                                                        activeFactionWarState.allianceKills,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {!arenaMode &&
                                logoutPending &&
                                logoutSecondsRemaining > 0 &&
                                !hud?.dead ? (
                                    <div className="pointer-events-none absolute left-4 top-4 z-30 rounded-2xl border border-amber-300/45 bg-stone-950/88 px-4 py-3 text-stone-100 shadow-2xl backdrop-blur-md">
                                        <div className="text-[11px] uppercase tracking-[0.28em] text-amber-300/85">
                                            Salida en progreso
                                        </div>
                                        <div className="mt-1 text-2xl font-semibold text-amber-100">
                                            {logoutSecondsRemaining}s
                                        </div>
                                        <div className="mt-1 text-xs text-stone-300/85">
                                            No te muevas, no ataques y no
                                            castees.
                                        </div>
                                    </div>
                                ) : null}

                                {challengeOverlayText ? (
                                    <div className="pointer-events-none absolute right-3 top-3 z-30">
                                        <div className="rounded-2xl border border-cyan-200/30 bg-stone-950/84 px-4 py-2 text-center shadow-xl backdrop-blur-md">
                                            <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-200/70">
                                                Reto
                                            </div>
                                            <div className="mt-0.5 text-2xl font-semibold leading-none text-cyan-100">
                                                {challengeOverlayText}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {questProgressNotice ? (
                                    <div
                                        className={`pointer-events-none absolute left-1/2 z-30 w-[min(420px,calc(100%-2rem))] -translate-x-1/2 transition-all duration-700 ease-out ${
                                            questProgressNotice.visible
                                                ? "translate-y-0 opacity-100"
                                                : "-translate-y-2 opacity-0"
                                        }`}
                                        style={{
                                            top: activeFactionWarState
                                                ? "74px"
                                                : challengeOverlayText
                                                  ? "88px"
                                                  : "16px",
                                        }}
                                    >
                                        <div className="rounded-md border border-amber-200/35 bg-stone-950/82 px-4 py-3 text-center shadow-2xl backdrop-blur-md">
                                            <div className="truncate text-xs font-medium text-amber-200/90">
                                                {questProgressNotice.questName}
                                            </div>
                                            <div className="mt-1 text-sm font-semibold leading-5 text-stone-50">
                                                {questProgressNotice.message}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <div
                                    className="pointer-events-none absolute right-2 z-30 rounded-md border border-stone-200/12 bg-stone-950/72 px-2.5 py-1.5 font-mono text-[11px] leading-none text-amber-100/90 shadow-xl backdrop-blur-sm"
                                    style={{
                                        bottom: isFullscreen ? 42 : 8,
                                    }}
                                >
                                    <span className="inline-grid grid-cols-[auto_4ch_auto_3ch_auto_3ch] items-baseline gap-x-1 tabular-nums">
                                        <span>Map:</span>
                                        <span className="text-right">
                                            {hud?.map ?? selectedMap ?? "—"}
                                        </span>
                                        <span>X:</span>
                                        <span className="text-right">
                                            {hud?.pos?.x ?? "—"}
                                        </span>
                                        <span>Y:</span>
                                        <span className="text-right">
                                            {hud?.pos?.y ?? "—"}
                                        </span>
                                    </span>
                                </div>

                                {globalCanvasNotice ? (
                                    <div
                                        className="absolute right-4 z-30 max-w-[min(360px,calc(100%-2rem))]"
                                        style={{
                                            top: challengeOverlayText
                                                ? "88px"
                                                : "16px",
                                        }}
                                    >
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() =>
                                                setGlobalCanvasNotice(null)
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter" ||
                                                    event.key === " "
                                                ) {
                                                    event.preventDefault();
                                                    setGlobalCanvasNotice(null);
                                                }
                                            }}
                                            className="pointer-events-auto block w-full rounded-2xl border border-stone-200/15 bg-stone-950/72 px-4 py-3 text-left text-stone-100 shadow-xl backdrop-blur-md"
                                            aria-label="Cerrar aviso global"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[10px] uppercase tracking-[0.24em] text-stone-300/65">
                                                        Servidor
                                                    </div>
                                                    <div className="mt-1 break-words text-sm leading-5 text-stone-100/90">
                                                        {
                                                            globalCanvasNotice.text
                                                        }
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setGlobalCanvasNotice(
                                                            null,
                                                        );
                                                    }}
                                                    className="rounded-full px-2 py-1 text-xs text-stone-400 transition hover:bg-white/5 hover:text-stone-200"
                                                    aria-label="Cerrar aviso global"
                                                >
                                                    x
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <div
                                    className="pointer-events-none absolute right-4 z-30"
                                    style={{
                                        top: globalCanvasNotice
                                            ? challengeOverlayText
                                                ? "172px"
                                                : "112px"
                                            : challengeOverlayText
                                              ? "88px"
                                              : "16px",
                                    }}
                                >
                                    {!isDesktopConsoleLayout &&
                                    !isFullscreen &&
                                    !isMobile
                                        ? fullscreenToggleControl
                                        : null}
                                </div>

                                <div className="pointer-events-none absolute bottom-3 right-16 z-30 flex w-[594px] max-w-[calc(100vw-9rem)] flex-col items-center gap-3">
                                    {!isDesktopConsoleLayout &&
                                    !isMobile &&
                                    isChatOpen ? (
                                        <form
                                            ref={chatFormRef}
                                            className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-amber-300/35 bg-stone-950/88 px-4 py-3 shadow-2xl backdrop-blur-md"
                                            onSubmit={(event) => {
                                                event.preventDefault();
                                                submitChatMessage();
                                            }}
                                        >
                                            <input
                                                ref={chatInputRef}
                                                type="text"
                                                autoComplete="off"
                                                value={chatMessage}
                                                maxLength={120}
                                                onChange={(event) =>
                                                    setChatMessage(
                                                        event.target.value,
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Escape"
                                                    ) {
                                                        event.preventDefault();
                                                        setIsChatOpen(false);
                                                        setChatMessage("");
                                                    }
                                                }}
                                                placeholder={
                                                    activeChatTab === "global"
                                                        ? "/global para mandar un mensaje global"
                                                        : activeChatTab ===
                                                            "party"
                                                          ? "Mensaje para la party"
                                                          : activeChatTab ===
                                                              "clan"
                                                            ? "Mensaje para el clan"
                                                            : activeChatTab ===
                                                                "whisper"
                                                              ? whisperPlaceholder
                                                              : "Escribi tu mensaje y presiona Enter"
                                                }
                                                className="min-w-0 flex-1 bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
                                            />
                                        </form>
                                    ) : null}

                                    {!isDesktopConsoleLayout &&
                                    isConsoleOpen ? (
                                        <div className="pointer-events-auto flex w-full flex-col overflow-hidden rounded-2xl border border-cyan-200/20 bg-stone-950/45 shadow-2xl backdrop-blur-[2px]">
                                            <div
                                                ref={consoleScrollRef}
                                                className="h-[126px] overflow-y-auto px-4 py-3 text-xs leading-5 text-stone-200/90"
                                            >
                                                {visibleConsoleEntries.length ? (
                                                    visibleConsoleEntries.map(
                                                        (entry) => (
                                                            <div
                                                                key={entry.id}
                                                                className="break-words"
                                                                style={{
                                                                    color:
                                                                        entry.color ||
                                                                        "rgba(231, 229, 228, 0.92)",
                                                                }}
                                                            >
                                                                {renderConsoleEntryText(
                                                                    entry.text,
                                                                )}
                                                            </div>
                                                        ),
                                                    )
                                                ) : (
                                                    <div className="text-stone-300/55">
                                                        No hay mensajes en{" "}
                                                        {activeChatTabLabel.toLowerCase()}{" "}
                                                        todavía.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {!isDesktopConsoleLayout && !isMobile ? (
                                    <div className="pointer-events-none absolute bottom-3 right-3 z-40">
                                        {isChatMenuOpen ? (
                                            <div className="pointer-events-auto absolute bottom-28 right-0 w-[156px]">
                                                {chatTabsMenu}
                                            </div>
                                        ) : null}

                                        <div className="flex flex-col items-end gap-3">
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    setIsChatMenuOpen(
                                                        (current) => !current,
                                                    );
                                                    event.currentTarget.blur();
                                                }}
                                                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-cyan-200/25 bg-stone-950/38 text-cyan-100/82 shadow-xl backdrop-blur-[2px] transition hover:border-cyan-200/45 hover:bg-stone-900/50 hover:text-white focus:outline-none focus-visible:outline-none"
                                                aria-label={
                                                    isChatMenuOpen
                                                        ? "Ocultar canales"
                                                        : "Mostrar canales"
                                                }
                                                title={
                                                    isChatMenuOpen
                                                        ? "Ocultar canales"
                                                        : "Mostrar canales"
                                                }
                                                style={{
                                                    WebkitTapHighlightColor:
                                                        "transparent",
                                                }}
                                            >
                                                {!isChatMenuOpen &&
                                                totalUnreadChatCount > 0 ? (
                                                    <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-semibold leading-4 text-white">
                                                        {totalUnreadChatCount >
                                                        9
                                                            ? "9+"
                                                            : totalUnreadChatCount}
                                                    </span>
                                                ) : null}

                                                <svg
                                                    aria-hidden="true"
                                                    viewBox="0 0 24 24"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M8 6h12" />
                                                    <path d="M8 12h12" />
                                                    <path d="M8 18h12" />
                                                    <circle
                                                        cx="4"
                                                        cy="6"
                                                        r="1"
                                                    />
                                                    <circle
                                                        cx="4"
                                                        cy="12"
                                                        r="1"
                                                    />
                                                    <circle
                                                        cx="4"
                                                        cy="18"
                                                        r="1"
                                                    />
                                                </svg>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    setIsConsoleOpen(
                                                        (current) => !current,
                                                    );
                                                    event.currentTarget.blur();
                                                }}
                                                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-cyan-200/25 bg-stone-950/38 text-cyan-100/82 shadow-xl backdrop-blur-[2px] transition hover:border-cyan-200/45 hover:bg-stone-900/50 hover:text-white focus:outline-none focus-visible:outline-none"
                                                aria-label={
                                                    isConsoleOpen
                                                        ? "Ocultar chat"
                                                        : "Mostrar chat"
                                                }
                                                title={
                                                    isConsoleOpen
                                                        ? "Ocultar chat"
                                                        : "Mostrar chat"
                                                }
                                                style={{
                                                    WebkitTapHighlightColor:
                                                        "transparent",
                                                }}
                                            >
                                                <svg
                                                    aria-hidden="true"
                                                    viewBox="0 0 24 24"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M4 6h16" />
                                                    <path d="M4 12h10" />
                                                    <path d="M4 18h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                                {isFullscreen ? (
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
                                        <div className="border-t border-[#6f5734] bg-[#0c0907] px-3 py-1.5">
                                            <div className="mb-1 flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-stone-400/90">
                                                <span>Experiencia</span>
                                                <span className="tabular-nums tracking-normal text-amber-100">
                                                    {hud
                                                        ? `${Math.round(
                                                              Math.max(
                                                                  0,
                                                                  Math.min(
                                                                      100,
                                                                      ((hud.exp ||
                                                                          0) /
                                                                          Math.max(
                                                                              1,
                                                                              hud.expNextLevel ||
                                                                                  1,
                                                                          )) *
                                                                          100,
                                                                  ),
                                                              ),
                                                          )}% (${formatNumber(hud.exp || 0)} / ${formatNumber(hud.expNextLevel || 0)})`
                                                        : "-"}
                                                </span>
                                            </div>
                                            <div className="relative h-[7px] overflow-hidden rounded-[2px] border border-[#8b6b3e]/80 bg-black/55">
                                                <div
                                                    className="h-full bg-linear-to-r from-[#547a24] via-[#7cb63b] to-[#b6e05a]"
                                                    style={{
                                                        width: `${
                                                            hud?.expNextLevel
                                                                ? Math.max(
                                                                      0,
                                                                      Math.min(
                                                                          100,
                                                                          ((hud.exp ||
                                                                              0) /
                                                                              hud.expNextLevel) *
                                                                              100,
                                                                      ),
                                                                  )
                                                                : 0
                                                        }%`,
                                                    }}
                                                />
                                                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/20 to-transparent" />
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            {!isFullscreen ? (
                            <ScaledHudFrame
                                scale={hudScale}
                                baseWidth={CANVAS_BASE_WIDTH}
                            >
                                <div className="border-t border-[#6f5734] bg-[#0c0907] px-3 py-1.5">
                                        <div className="mb-1 flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-stone-400/90">
                                            <span>Experiencia</span>
                                            <span className="tabular-nums tracking-normal text-amber-100">
                                                {hud
                                                    ? `${Math.round(
                                                          Math.max(
                                                              0,
                                                              Math.min(
                                                                  100,
                                                                  ((hud.exp ||
                                                                      0) /
                                                                      Math.max(
                                                                          1,
                                                                          hud.expNextLevel ||
                                                                              1,
                                                                      )) *
                                                                      100,
                                                              ),
                                                          ),
                                                      )}% (${formatNumber(hud.exp || 0)} / ${formatNumber(hud.expNextLevel || 0)})`
                                                    : "-"}
                                            </span>
                                        </div>
                                        <div className="relative h-[7px] overflow-hidden rounded-[2px] border border-[#8b6b3e]/80 bg-black/55">
                                            <div
                                                className="h-full bg-linear-to-r from-[#547a24] via-[#7cb63b] to-[#b6e05a]"
                                                style={{
                                                    width: `${
                                                        hud?.expNextLevel
                                                            ? Math.max(
                                                                  0,
                                                                  Math.min(
                                                                      100,
                                                                      ((hud.exp ||
                                                                          0) /
                                                                          hud.expNextLevel) *
                                                                          100,
                                                                  ),
                                                              )
                                                            : 0
                                                    }%`,
                                                }}
                                            />
                                            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/20 to-transparent" />
                                        </div>
                                    </div>
                                </ScaledHudFrame>
                            ) : null}

                            <MacroBar
                                hidden
                                hud={hud}
                                connected={status.connected}
                                hotkeySettings={hotkeySettings}
                                macros={macros}
                                useItemRepeatMs={useItemRepeatMs}
                                onMacrosChange={setMacros}
                                onUseItem={(slot) =>
                                    setUseItemURequest((current) => ({
                                        slot,
                                        token: (current?.token ?? 0) + 1,
                                    }))
                                }
                                onRangeAttackRequest={() =>
                                    setRangeAttackRequest((current) => ({
                                        token: (current?.token ?? 0) + 1,
                                    }))
                                }
                                onCastSpell={(spell) =>
                                    setSpellTargetRequest((current) => ({
                                        slot: spell.slot,
                                        manaRequired: spell.manaRequired,
                                        name: spell.name,
                                        token: (current?.token ?? 0) + 1,
                                    }))
                                }
                                onSendCommand={sendChatMessage}
                            />

                            {isMobile ? (
                                <MobileHud
                                    hud={hud}
                                    connected={status.connected}
                                    hotkeySettings={hotkeySettings}
                                    macros={macros}
                                    useItemRepeatMs={useItemRepeatMs}
                                    onMacrosChange={setMacros}
                                    onUseItem={(slot) =>
                                        setUseItemURequest((current) => ({
                                            slot,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onRangeAttackRequest={() =>
                                        setRangeAttackRequest((current) => ({
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onCastSpell={(spell) =>
                                        setSpellTargetRequest((current) => ({
                                            slot: spell.slot,
                                            manaRequired: spell.manaRequired,
                                            name: spell.name,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onSendCommand={sendChatMessage}
                                    onDirectionChange={
                                        setTouchMovementDirection
                                    }
                                    onAttack={handleMobileAttack}
                                    onOpenInventory={() =>
                                        setIsMobileMenuOpen((current) => !current)
                                    }
                                    onOpenSpellList={() =>
                                        setIsMobileSpellsOpen(true)
                                    }
                                    isTargeting={isMobileTargeting}
                                    onToggleChat={() =>
                                        setIsChatOpen((current) => !current)
                                    }
                                    onOpenSettings={() =>
                                        setOpenSettingsRequest((current) => ({
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    isQuickSlotEditMode={isQuickSlotEditMode}
                                    onToggleQuickSlotEditMode={() =>
                                        setIsQuickSlotEditMode(
                                            (current) => !current,
                                        )
                                    }
                                    isOrientationLocked={isOrientationLocked}
                                    onToggleOrientationLock={() =>
                                        setIsOrientationLocked(
                                            (current) => !current,
                                        )
                                    }
                                />
                            ) : null}

                            {isMobile ? (
                                <MobileStatusPanel
                                    hud={hud}
                                    consoleLog={consoleMessages}
                                    skillPoints={Math.max(
                                        0,
                                        Math.floor(
                                            Number(skillsState?.skillPts) || 0,
                                        ),
                                    )}
                                    isTargeting={isMobileTargeting}
                                    onOpenSkills={() =>
                                        setIsMobileSkillsOpen(true)
                                    }
                                />
                            ) : null}

                            {isMobile ? (
                                <SkillsModal
                                    compact
                                    isOpen={isMobileSkillsOpen}
                                    skillsState={skillsState}
                                    onAssignSkill={(skillId) =>
                                        setAssignSkillRequest((current) => ({
                                            skillId,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onClose={closeMobileSkills}
                                />
                            ) : null}

                            {isMobile && isMobileSpellsOpen ? (
                                <MobileSpellsModal
                                    hud={hud}
                                    onClose={() => setIsMobileSpellsOpen(false)}
                                    onCast={(spell) =>
                                        setSpellTargetRequest((current) => ({
                                            slot: spell.slot,
                                            manaRequired: spell.manaRequired,
                                            name: spell.name,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                />
                            ) : null}

                            {isMobile && isMobileMenuOpen ? (
                                <MobileInventoryModal
                                    hud={hud}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                    onUse={(slot) =>
                                        setUseItemClickRequest((current) => ({
                                            slot,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onEquip={(slot) =>
                                        setEquipRequest((current) => ({
                                            slot,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onRangeAttack={() => {
                                        setIsMobileMenuOpen(false);
                                        setRangeAttackRequest((current) => ({
                                            token: (current?.token ?? 0) + 1,
                                        }));
                                    }}
                                    onMove={handleMoveInventoryItem}
                                />
                            ) : null}

                            {isMobile && isChatOpen ? (
                                <form
                                    ref={chatFormRef}
                                    className="pointer-events-auto fixed left-1/2 top-2 z-50 flex w-[min(460px,60%)] -translate-x-1/2 items-center gap-2 rounded-xl border border-amber-300/35 bg-stone-950/92 px-2 py-1.5 shadow-2xl"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        submitChatMessage();
                                    }}
                                >
                                    <input
                                        ref={chatInputRef}
                                        type="text"
                                        autoComplete="off"
                                        enterKeyHint="send"
                                        value={chatMessage}
                                        maxLength={120}
                                        onChange={(event) =>
                                            setChatMessage(event.target.value)
                                        }
                                        placeholder={
                                            activeChatTab === "global"
                                                ? "/global para mensaje global"
                                                : "Escribí tu mensaje"
                                        }
                                        // 16px evita el zoom automático de Safari de iOS al enfocar.
                                        className="min-w-0 flex-1 bg-transparent px-1 text-base text-stone-100 outline-none placeholder:text-stone-500"
                                    />
                                    <button
                                        type="submit"
                                        className="shrink-0 rounded-lg bg-amber-300 px-3 py-1 text-sm font-semibold text-stone-950"
                                    >
                                        Enviar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsChatOpen(false);
                                            setChatMessage("");
                                        }}
                                        className="shrink-0 rounded-lg border border-stone-700 px-2 py-1 text-sm text-stone-300"
                                        aria-label="Cerrar chat"
                                    >
                                        ✕
                                    </button>
                                </form>
                            ) : null}

                            {isMobile &&
                            (targetingHint?.type === "spell" ||
                                targetingHint?.type === "range") ? (
                                <MobileTargetHint
                                    label="Toca al objetivo"
                                    onCancel={() =>
                                        setCancelTargetingRequest(
                                            (current) => ({
                                                token:
                                                    (current?.token ?? 0) + 1,
                                            }),
                                        )
                                    }
                                />
                            ) : null}
                        </div>

                        <ScaledHudFrame
                            scale={hudScale}
                            baseWidth={RIGHT_PANEL_WIDTH}
                            onMeasure={handleRightColumnMeasure}
                            hidden={isMobile}
                        >
                            <div
                                className="relative flex w-[320px] flex-col"
                                style={{ gap: `${COLUMN_SECTION_GAP}px` }}
                            >
                                <InventoryFloatingPanel
                                    hud={hud}
                                    mapName={status.worldName}
                                    connected={status.connected}
                                    characterStatsSnapshot={
                                        characterStatsSnapshot
                                    }
                                    skillsState={skillsState}
                                    environment={environmentState}
                                    onAssignSkill={(skillId) =>
                                        setAssignSkillRequest((current) => ({
                                            skillId,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    panelHeight={`${Math.max(
                                        CANVAS_BASE_HEIGHT,
                                        (isDesktopConsoleLayout
                                            ? topHudSectionSize.height
                                            : DESKTOP_CONSOLE_HEIGHT) +
                                            CANVAS_BASE_HEIGHT +
                                            (isFullscreen
                                                ? 0
                                                : EXP_SECTION_GAP +
                                                  EXP_BAR_ESTIMATED_HEIGHT) -
                                            COLUMN_SECTION_GAP,
                                    )}px`}
                                    portalTarget={gameShellElement}
                                    minimapHost={minimapHost}
                                    minimapVisible={isMinimapVisible}
                                    onMinimapVisibleChange={
                                        persistMinimapVisible
                                    }
                                    selectedSpellSlot={selectedSpellSlot}
                                    hotkeySettings={hotkeySettings}
                                    useItemRepeatMs={useItemRepeatMs}
                                    soundVolume={soundVolume}
                                    auraOpacity={auraOpacity}
                                    onHotkeySettingsChange={setHotkeySettings}
                                    onSoundVolumeChange={setSoundVolume}
                                    onAuraOpacityChange={(value) => {
                                        setAuraOpacity(value);
                                        setEquipmentAuraOpacity(value);
                                    }}
                                    onSelectSpell={setSelectedSpellSlot}
                                    onCastSpell={(spell) =>
                                        setSpellTargetRequest((current) => ({
                                            slot: spell.slot,
                                            manaRequired: spell.manaRequired,
                                            name: spell.name,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onEquipRequest={(slot) =>
                                        setEquipRequest((current) => ({
                                            slot,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onUseItemClickRequest={(slot) =>
                                        setUseItemClickRequest((current) => ({
                                            slot,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onUseItemURequest={(slot) =>
                                        setUseItemURequest((current) => ({
                                            slot,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onMoveInventoryItem={handleMoveInventoryItem}
                                    onRangeAttackRequest={() =>
                                        setRangeAttackRequest((current) => ({
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onReorderSpell={(sourceSlot, targetSlot) => {
                                        if (
                                            sourceSlot === targetSlot ||
                                            sourceSlot < 1 ||
                                            targetSlot < 1 ||
                                            sourceSlot > 50 ||
                                            targetSlot > 50
                                        ) {
                                            return;
                                        }

                                        setSelectedSpellSlot(targetSlot);
                                        setReorderSpellRequest((current) => ({
                                            sourceSlot,
                                            targetSlot,
                                            token: (current?.token ?? 0) + 1,
                                        }));
                                    }}
                                    onDropRequest={(slot, amount) =>
                                        setDropRequest((current) => ({
                                            slot,
                                            amount,
                                            token: (current?.token ?? 0) + 1,
                                        }))
                                    }
                                    onSendCommand={sendChatMessage}
                                    auctionPanel={
                                        auctionHousePresentation === "hub" &&
                                        marketState &&
                                        "kind" in marketState &&
                                        marketState.kind === "auctionHouse" ? (
                                            <AuctionHouseModal
                                                embedded
                                                state={marketState}
                                                inventory={hud?.inventory ?? []}
                                                gold={hud?.gold ?? 0}
                                                onClose={() => {
                                                    setMarketState(null);
                                                    setAuctionHousePresentation("modal");
                                                    setCloseTradeRequest((current) => ({
                                                        token: (current?.token ?? 0) + 1,
                                                    }));
                                                }}
                                                onRefresh={(browse) =>
                                                    setMarketActionRequest((current) => ({
                                                        action: "refresh",
                                                        payload: browse,
                                                        token: (current?.token ?? 0) + 1,
                                                    }))
                                                }
                                                onCreate={(slot, quantity, startPrice, buyoutPrice, durationHours, browse) =>
                                                    setMarketActionRequest((current) => ({
                                                        action: "auctionCreate",
                                                        payload: {
                                                            slot,
                                                            quantity,
                                                            startPrice,
                                                            buyoutPrice,
                                                            durationHours,
                                                            ...browse,
                                                        },
                                                        token: (current?.token ?? 0) + 1,
                                                    }))
                                                }
                                                onBid={(auctionId, bidAmount, browse) =>
                                                    setMarketActionRequest((current) => ({
                                                        action: "auctionBid",
                                                        payload: { auctionId, bidAmount, ...browse },
                                                        token: (current?.token ?? 0) + 1,
                                                    }))
                                                }
                                                onBuyout={(auctionId, browse) =>
                                                    setMarketActionRequest((current) => ({
                                                        action: "auctionBuyout",
                                                        payload: { auctionId, ...browse },
                                                        token: (current?.token ?? 0) + 1,
                                                    }))
                                                }
                                                onClaim={(claimId, browse) =>
                                                    setMarketActionRequest((current) => ({
                                                        action: "auctionClaim",
                                                        payload: { claimId, ...browse },
                                                        token: (current?.token ?? 0) + 1,
                                                    }))
                                                }
                                                onReadMail={(mailId, browse) =>
                                                    setMarketActionRequest((current) => ({
                                                        action: "auctionMailRead",
                                                        payload: { mailId, ...browse },
                                                        token: (current?.token ?? 0) + 1,
                                                    }))
                                                }
                                            />
                                        ) : null
                                    }
                                    onOpenAuctionHouse={() => {
                                        setAuctionHousePresentation("hub");
                                        sendChatMessage("/subastas");
                                    }}
                                    onCloseAuctionHouse={() => {
                                        if (auctionHousePresentation !== "hub") {
                                            return;
                                        }

                                        setMarketState(null);
                                        setAuctionHousePresentation("modal");
                                        setCloseTradeRequest((current) => ({
                                            token: (current?.token ?? 0) + 1,
                                        }));
                                    }}
                                    selectedCharacterId={
                                        authSession?.selectedCharacterId ?? null
                                    }
                                    openSettingsRequest={openSettingsRequest}
                                    compactSettings={isMobile}
                                    onLogoutRequest={handleLogoutRequest}
                                />
                            </div>
                        </ScaledHudFrame>
                    </div>
                </div>
            </div>

            {marketState && "kind" in marketState && marketState.kind === "auctionHouse" && auctionHousePresentation !== "hub" ? (
                <AuctionHouseModal
                    state={marketState}
                    inventory={hud?.inventory ?? []}
                    gold={hud?.gold ?? 0}
                    onClose={() => {
                        setMarketState(null);
                        setAuctionHousePresentation("modal");
                        setCloseTradeRequest((current) => ({
                            token: (current?.token ?? 0) + 1,
                        }));
                    }}
                    onRefresh={(browse) =>
                        setMarketActionRequest((current) => ({
                            action: "refresh",
                            payload: browse,
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onCreate={(
                        slot,
                        quantity,
                        startPrice,
                        buyoutPrice,
                        durationHours,
                        browse,
                    ) =>
                        setMarketActionRequest((current) => ({
                            action: "auctionCreate",
                            payload: {
                                slot,
                                quantity,
                                startPrice,
                                buyoutPrice,
                                durationHours,
                                ...browse,
                            },
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onBid={(auctionId, bidAmount, browse) =>
                        setMarketActionRequest((current) => ({
                            action: "auctionBid",
                            payload: { auctionId, bidAmount, ...browse },
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onBuyout={(auctionId, browse) =>
                        setMarketActionRequest((current) => ({
                            action: "auctionBuyout",
                            payload: { auctionId, ...browse },
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onClaim={(claimId, browse) =>
                        setMarketActionRequest((current) => ({
                            action: "auctionClaim",
                            payload: { claimId, ...browse },
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onReadMail={(mailId, browse) =>
                        setMarketActionRequest((current) => ({
                            action: "auctionMailRead",
                            payload: { mailId, ...browse },
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                />
            ) : marketState && (!("kind" in marketState) || marketState.kind !== "auctionHouse") ? (
                <MarketModal
                    marketState={marketState as MarketState}
                    inventory={hud?.inventory ?? []}
                    gold={hud?.gold ?? 0}
                    currentCharacterName={hud?.nameCharacter ?? null}
                    onClose={() => {
                        setMarketState(null);
                        setCloseTradeRequest((current) => ({
                            token: (current?.token ?? 0) + 1,
                        }));
                    }}
                    onRefresh={(browse: MarketBrowseRequest) =>
                        setMarketActionRequest((current) => ({
                            action: "refresh",
                            payload: browse,
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onCreateListing={(
                        slot,
                        quantity,
                        price,
                        durationHours,
                        browse: MarketBrowseRequest,
                    ) =>
                        setMarketActionRequest((current) => ({
                            action: "create",
                            payload: {
                                slot,
                                quantity,
                                price,
                                durationHours,
                                ...browse,
                            },
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onBuyListing={(
                        listingId,
                        expected,
                        browse: MarketBrowseRequest,
                    ) =>
                        setMarketActionRequest((current) => ({
                            action: "buy",
                            payload: {
                                listingId,
                                expectedItemId: expected.itemId,
                                expectedQuantity: expected.quantity,
                                expectedPrice: expected.price,
                                ...browse,
                            },
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onCancelListing={(listingId, browse: MarketBrowseRequest) =>
                        setMarketActionRequest((current) => ({
                            action: "cancel",
                            payload: { listingId, ...browse },
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onClaim={(browse: MarketBrowseRequest) =>
                        setMarketActionRequest((current) => ({
                            action: "claim",
                            payload: browse,
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                />
            ) : null}

            {tradeState ? (
                <TradeModal
                    mode={tradeState.mode}
                    merchantItems={tradeState.merchantItems}
                    playerItems={tradePlayerItems}
                    gold={hud?.gold ?? 0}
                    bankTab={tradeState.bankTab}
                    vaultGold={tradeState.vaultGold}
                    hasClanVault={tradeState.hasClanVault}
                    clanName={tradeState.clanName}
                    bankStatusMessage={tradeStatusMessage}
                    onClose={() => {
                        setTradeState(null);
                        setTradeStatusMessage(null);
                        setCloseTradeRequest((current) => ({
                            token: (current?.token ?? 0) + 1,
                        }));
                    }}
                    onBankTabChange={(tab) => {
                        setTradeStatusMessage(null);
                        setChangeBankTabRequest((current) => ({
                            tab,
                            token: (current?.token ?? 0) + 1,
                        }));
                    }}
                    onBuyRequest={(slot, amount) =>
                        setBuyRequest((current) => ({
                            slot,
                            amount,
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onSellRequest={(slot, amount) =>
                        setSellRequest((current) => ({
                            slot,
                            amount,
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onDepositGoldRequest={(amount) =>
                        setDepositBankGoldRequest((current) => ({
                            amount,
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onWithdrawGoldRequest={(amount) =>
                        setWithdrawBankGoldRequest((current) => ({
                            amount,
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onEquipRequest={(slot) =>
                        setEquipRequest((current) => ({
                            slot,
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                    onMoveBankItem={(sourceSlot, targetSlot) =>
                        setReorderBankRequest((current) => ({
                            sourceSlot,
                            targetSlot,
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                />
            ) : null}

            {bailState ? (
                <BailModal
                    kills={bailState.kills}
                    citizensKilled={bailState.citizensKilled}
                    fianzaCount={bailState.fianza}
                    goldRequired={bailState.goldRequired}
                    goldAvailable={hud?.gold ?? bailState.goldAvailable}
                    canPay={
                        (hud?.gold ?? bailState.goldAvailable) >=
                        bailState.goldRequired
                    }
                    onClose={() => setBailState(null)}
                    onPay={handlePayBail}
                />
            ) : null}

            {craftingState ? (
                <CraftingModal
                    title={craftingState.title}
                    recipes={craftingState.recipes}
                    inventory={hud?.inventory ?? []}
                    goldAvailable={hud?.gold ?? craftingState.goldAvailable ?? 0}
                    onClose={() => setCraftingState(null)}
                    onCraftRequest={(profession, itemId, amount) =>
                        setCraftRequest((current) => ({
                            profession,
                            itemId,
                            amount,
                            token: (current?.token ?? 0) + 1,
                        }))
                    }
                />
            ) : null}

            {retosOpen ? (
                <RetosModal
                    challenges={retosState?.challenges ?? []}
                    currentCharacterId={hud?.id ?? null}
                    currentCharacterName={hud?.nameCharacter ?? null}
                    loading={retosLoading}
                    error={retosError}
                    info={retosInfo}
                    actionKey={retosActionKey}
                    onClose={() => {
                        setRetosOpen(false);
                        setRetosError(null);
                        setRetosInfo(null);
                    }}
                    onRefresh={() => {
                        setRetosActionKey("refresh");
                        requestRetosState("refresh");
                    }}
                    onCreateChallenge={(teamSize) => {
                        setRetosActionKey(`create-${teamSize}`);
                        requestRetosState("create", { teamSize });
                    }}
                    onJoinChallenge={(challengeId) => {
                        setRetosActionKey(`join-${challengeId}`);
                        requestRetosState("join", { challengeId });
                        setRetosOpen(false);
                    }}
                    onCancelChallenge={(challengeId) => {
                        setRetosActionKey(`cancel-${challengeId}`);
                        requestRetosState("cancel", { challengeId });
                    }}
                />
            ) : null}

            <CharacterStatsModal
                hud={hud}
                snapshot={characterStatsSnapshot}
                isOpen={characterStatsOpen}
                isLoading={characterStatsLoading}
                onClose={() => {
                    setCharacterStatsOpen(false);
                    setCharacterStatsLoading(false);
                }}
            />

            {deathHomePromptOpen ? (
                <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6">
                    <div className="w-full max-w-sm rounded-2xl border border-amber-200/20 bg-[linear-gradient(180deg,rgba(28,18,12,0.96),rgba(14,10,8,0.96))] p-4 text-stone-100 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-md">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/75">
                            Personaje muerto
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-[#f3e7c8]">
                            {deathHomeTitle}
                        </h2>
                        <p className="mt-2 text-sm text-stone-300">
                            {deathHomeDescription}
                        </p>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setDeathHomePromptOpen(false)}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition hover:bg-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDeathHomeConfirm}
                                className="rounded-xl px-4 py-2 text-sm font-semibold text-stone-950 transition"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #f8d47b 0%, #d6a546 100%)",
                                }}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {isMobile && isPortrait && !isOrientationLocked ? (
                <RotateDeviceOverlay
                    onBack={() => router.push("/characters")}
                />
            ) : null}

            {showFullscreenPrompt ? (
                <div className="fixed inset-0 z-[88] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[28px] border border-cyan-200/20 bg-[linear-gradient(180deg,rgba(16,19,28,0.96),rgba(8,10,18,0.98))] p-6 text-stone-100 shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/75">
                            Recomendacion
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-cyan-50">
                            Esta pantalla se ve mejor en pantalla completa
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-stone-300">
                            Detectamos una ventana chica para el juego. Si
                            queres, podemos abrirlo en pantalla completa para
                            que entren mejor la consola, el HUD y las macros.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    dismissFullscreenPrompt();
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition hover:bg-white/10"
                            >
                                Seguir asi
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    void toggleFullscreen();
                                    dismissFullscreenPrompt();
                                    event.currentTarget.blur();
                                }}
                                className="rounded-xl px-4 py-2 text-sm font-semibold text-stone-950 transition"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)",
                                }}
                            >
                                Abrir en pantalla completa
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {adminIntervalsOpen && hud?.privileges === 1 ? (
                <AdminIntervalsModal
                    timing={runtimeTiming}
                    isOpen={adminIntervalsOpen}
                    savingPath={adminIntervalsSavingPath}
                    onClose={() => {
                        setAdminIntervalsOpen(false);
                        setAdminIntervalsSavingPath(null);
                    }}
                    onRefresh={refreshRuntimeTiming}
                    onSave={handleAdminIntervalSave}
                />
            ) : null}

            {overviewOpen && hud?.privileges === 1 ? (
                <OverviewModal
                    snapshot={overviewSnapshot}
                    isOpen={overviewOpen}
                    isRefreshing={overviewRefreshing}
                    onClose={() => {
                        setOverviewOpen(false);
                        setOverviewRefreshing(false);
                    }}
                    onRefresh={refreshOverview}
                />
            ) : null}

            <GmBotCompanionBadge visible={gmBotOpen} />
            <GmBotPanel
                open={gmBotOpen}
                messages={gmBotMessages}
                onSendCommand={sendChatMessage}
                onClose={() => setGmBotOpen(false)}
            />

            {status.error || fullscreenError ? (
                <div className="fixed left-4 top-24 z-50 max-w-sm rounded-2xl bg-stone-950/88 px-4 py-3 text-sm text-rose-300 shadow-2xl backdrop-blur-md">
                    {status.error || fullscreenError}
                </div>
            ) : null}

            {isHotkeyIntroOpen ? (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
                    <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-amber-200/20 bg-[linear-gradient(180deg,rgba(28,18,12,0.98),rgba(14,10,8,0.98))] p-6 text-stone-100 shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/75">
                                    Bienvenido
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-[#f3e7c8]">
                                    Teclas predeterminadas
                                </h2>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-stone-300">
                                    Estas son las teclas base del juego. Despues
                                    podes cambiarlas desde el panel derecho.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={dismissHotkeyIntro}
                                className="rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-stone-300 transition hover:border-amber-300/35 hover:text-white"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {defaultHotkeyIntroItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-black/20 px-4 py-3"
                                >
                                    <span className="text-sm text-stone-300">
                                        {item.label}
                                    </span>
                                    <span className="rounded-xl border border-amber-300/20 bg-amber-200/10 px-3 py-1 text-sm font-semibold text-amber-100">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={dismissHotkeyIntro}
                                className="rounded-2xl border border-amber-300/35 bg-amber-200/10 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-300/60 hover:bg-amber-200/15"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<main className="min-h-screen bg-black" />}>
            <HomeContent />
        </Suspense>
    );
}
