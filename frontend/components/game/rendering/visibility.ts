import { AnimatedSprite, Sprite } from "pixi.js";
import type { ObjectData } from "../../../types/game";
import { OBJECT_TYPE, type PlayerHudState } from "../../../lib/aowProtocol";
import type { RuntimeTimingConfig } from "../../../lib/runtime-config";
import type { Character } from "../engine/Engine";

const GHOST_ALPHA = 0.45;
const PARTY_INVISIBLE_ALPHA = 0.4;
// Invisible peleando contra jugadores: mientras dura la ventana de combate hace fade in / fade out
// completos (de invisible del todo a visible del todo y vuelta), así el rival lo sigue. Al terminar la
// ventana se apaga suave.
const PVP_REVEAL_PERIOD_MS = 1400;
const PVP_REVEAL_FADE_OUT_MS = 500;

export type TreeFadeSource = "object" | "layer3";

export type TreeSpriteEntry = {
    tileKey: string;
    x: number;
    y: number;
    sprite: Sprite | AnimatedSprite;
    source: TreeFadeSource;
    isFaded: boolean;
};

function clampAlpha(value: number): number {
    return Math.max(0, Math.min(1, value));
}

function lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
}

function normalizeClanTag(value: string | null | undefined): string {
    return String(value ?? "")
        .replace(/[<>]/g, "")
        .trim()
        .toLowerCase();
}

export function hasPulsingInvisibility(
    character: Character | null | undefined,
): boolean {
    return Boolean(character?.invisibleSpell || character?.hiddenSkill);
}

export function isInvisiblePartyMember(
    character: Character | null | undefined,
    localPartyMemberIds?: ReadonlySet<string>,
): boolean {
    if (!character || !hasPulsingInvisibility(character)) {
        return false;
    }

    return Boolean(
        character.isPartyMember ||
        localPartyMemberIds?.has(String(character.id)),
    );
}

export function isInvisibleClanMember(
    character: Character | null | undefined,
    localClanTag?: string,
): boolean {
    if (!character || !hasPulsingInvisibility(character)) {
        return false;
    }

    if (character.isClanMember) {
        return true;
    }

    const normalizedLocalClanTag = normalizeClanTag(localClanTag);
    const normalizedCharacterClanTag = normalizeClanTag(character.clan);

    return Boolean(
        normalizedLocalClanTag &&
            normalizedCharacterClanTag &&
            normalizedLocalClanTag === normalizedCharacterClanTag,
    );
}

export function canRenderInvisibleAsTransparent(
    character: Character | null | undefined,
    options?: {
        isLocalCharacter?: boolean;
        localPartyMemberIds?: ReadonlySet<string>;
        localClanTag?: string;
        isAdminViewer?: boolean;
    },
): boolean {
    if (!hasPulsingInvisibility(character)) {
        return false;
    }

    if (options?.isLocalCharacter || options?.isAdminViewer) {
        return true;
    }

    if (isInvisiblePartyMember(character, options?.localPartyMemberIds)) {
        return true;
    }

    return isInvisibleClanMember(character, options?.localClanTag);
}

export function getCharacterNameLabel(
    character: Character | null | undefined,
): string {
    return character?.nameCharacter || "Jugador";
}

export function getCharacterClanLabel(
    character: Character | null | undefined,
): string | null {
    return character?.clan ?? null;
}

export function shouldHighlightClanTag(
    character: Character | null | undefined,
    localClanTag: string | null | undefined,
    playerHud: Pick<PlayerHudState, "zonaSegura"> | null | undefined,
): boolean {
    if (!character?.clan || !localClanTag || character.clan !== localClanTag) {
        return false;
    }

    return (playerHud?.zonaSegura ?? character?.zonaSegura) === 0;
}

// Arranca invisible, aparece del todo a mitad del ciclo y vuelve a desaparecer (coseno).
export function getPvpRevealAlpha(
    startedAt: number,
    revealUntil: number,
    hiddenAlpha: number,
    now = Date.now(),
): number {
    const phase =
        (Math.max(0, now - startedAt) % PVP_REVEAL_PERIOD_MS) /
        PVP_REVEAL_PERIOD_MS;
    const wave = (1 - Math.cos(phase * Math.PI * 2)) / 2;
    const alpha = lerp(hiddenAlpha, 1, wave);
    const remainingMs = revealUntil - now;
    if (remainingMs < PVP_REVEAL_FADE_OUT_MS) {
        return lerp(hiddenAlpha, alpha, Math.max(0, remainingMs) / PVP_REVEAL_FADE_OUT_MS);
    }
    return alpha;
}

export function isTreeObjectData(objectData: ObjectData | undefined): boolean {
    if (!objectData) {
        return false;
    }

    if (objectData.objType === OBJECT_TYPE.arboles) {
        return true;
    }

    const normalizedName = objectData.name
        .normalize("NFD")
        .replace(/[^\x00-\x7F]/g, "")
        .trim()
        .toLowerCase();

    return normalizedName === "arbol" || normalizedName.startsWith("arbol ");
}

export function getCharacterRenderAlpha(
    character: Character | null | undefined,
    timing: RuntimeTimingConfig,
    options?: {
        isLocalCharacter?: boolean;
        localPartyMemberIds?: ReadonlySet<string>;
        localClanTag?: string;
        isAdminViewer?: boolean;
    },
): number {
    if (!character) {
        return 1;
    }

    if (character.invisibleAdmin || character.dead) {
        return GHOST_ALPHA;
    }

    if (hasPulsingInvisibility(character)) {
        if (canRenderInvisibleAsTransparent(character, options)) {
            return PARTY_INVISIBLE_ALPHA;
        }

        // Para los enemigos solo parpadea mientras pelea contra jugadores (el server manda la ventana);
        // fuera de eso queda invisible del todo y la invisibilidad sirve para escapar.
        const now = Date.now();
        const hiddenAlpha = Math.min(
            clampAlpha(timing.visualEffects.invisibilityMinAlpha),
            clampAlpha(timing.visualEffects.invisibilityMaxAlpha),
        );
        const revealUntil = character.pvpRevealUntil ?? 0;
        if (revealUntil <= now) {
            return hiddenAlpha;
        }

        return getPvpRevealAlpha(
            character.invisibilityCycleStartedAt ?? now,
            revealUntil,
            hiddenAlpha,
            now,
        );
    }

    return 1;
}

export function shouldHideRemoteCharacterName(
    character: Character | null | undefined,
    localPartyMemberIds?: ReadonlySet<string>,
    localClanTag?: string,
    isAdminViewer?: boolean,
): boolean {
    if (
        canRenderInvisibleAsTransparent(character, {
            localPartyMemberIds,
            localClanTag,
            isAdminViewer,
        })
    ) {
        return false;
    }

    return hasPulsingInvisibility(character);
}
