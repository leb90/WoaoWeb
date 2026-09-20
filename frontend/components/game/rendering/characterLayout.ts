import { AnimatedSprite, Texture } from "pixi.js";

export type BodyRenderMetrics = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export function getBodySpritePosition(texture: Texture): {
    x: number;
    y: number;
} {
    return {
        x: 16 - Math.floor((texture.width * 16) / 32),
        y: 32 - Math.floor((texture.height * 32) / 32),
    };
}

export function getBottomAnchoredGraphicPosition(
    width: number,
    height: number,
): { x: number; y: number } {
    return {
        x: 16 - Math.floor((width * 16) / 32),
        y: 32 - Math.floor((height * 16) / 16),
    };
}

export function getFxSpritePosition(
    texture: Texture,
    offsetX = 0,
    offsetY = 0,
): { x: number; y: number } {
    const centered = getBodySpritePosition(texture);
    return {
        x: centered.x + offsetX,
        y: centered.y + offsetY,
    };
}

const DEFAULT_HEAD_FRAME_HEIGHT = 50;
const HELMET_HEAD_OFFSET_Y = -34;

export function getHeadSpritePosition(
    bodyMetrics: BodyRenderMetrics,
    bodyData: { headOffsetX?: number; headOffsetY?: number },
    headTexture: Texture,
): { x: number; y: number } {
    const headHeight = headTexture.height || DEFAULT_HEAD_FRAME_HEIGHT;
    return {
        x:
            bodyMetrics.x +
            bodyMetrics.width / 2 -
            headTexture.width / 2 +
            (bodyData.headOffsetX || 0),
        y:
            bodyMetrics.y +
            bodyMetrics.height -
            headHeight +
            (bodyData.headOffsetY || 0),
    };
}

export function getMountEquipmentLift(headOffsetY = 0): number {
    switch (headOffsetY) {
        case -71:
        case -69:
            return 68;
        case -59:
        case -61:
            return 58;
        case -38:
        case -39:
            return 34;
        case -40:
            return 36;
        case -42:
            return 35;
        case -45:
            return 39;
        case -30:
            return 30;
        case -24:
            return 20;
        case -9:
            return 8;
        default:
            return 0;
    }
}

export function getEquipmentSpritePosition(
    kind: "weapon" | "shield",
    texture: Texture,
    headOffsetY = 0,
): { x: number; y: number } {
    return {
        x: 16 - Math.floor((texture.width * 16) / 32),
        y:
            (kind === "weapon" ? 28 : 32) -
            Math.floor((texture.height * 32) / 32) -
            getMountEquipmentLift(headOffsetY),
    };
}

const DEFAULT_WALK_FRAME_MS = 1000 / 18;

function resolveWalkFrameMs(sprite: AnimatedSprite): number {
    const storedFrameMs = Number((sprite as { walkFrameMs?: number }).walkFrameMs);
    if (Number.isFinite(storedFrameMs) && storedFrameMs >= 20) {
        return storedFrameMs;
    }

    return DEFAULT_WALK_FRAME_MS;
}

export function syncCharacterLayerPlayback(
    sprite: AnimatedSprite | undefined,
    shouldAnimate: boolean,
    frameMs?: number,
): void {
    if (!sprite || sprite.destroyed || sprite.totalFrames <= 1) {
        return;
    }

    const walkFrameMs = frameMs ?? resolveWalkFrameMs(sprite);
    sprite.autoUpdate = true;
    sprite.loop = true;
    sprite.animationSpeed = 1000 / (walkFrameMs * 60);

    if (shouldAnimate) {
        if (!sprite.playing) {
            sprite.play();
        }
        return;
    }

    if (sprite.playing || sprite.currentFrame !== 0) {
        sprite.gotoAndStop(0);
    }
}

export function updateAnimatedCharacterLayer(
    sprite: AnimatedSprite | undefined,
    frameCounter: number,
): void {
    syncCharacterLayerPlayback(sprite, frameCounter > 1);
}

export function getHelmetSpritePosition(
    bodyMetrics: BodyRenderMetrics,
    bodyData: { headOffsetX?: number; headOffsetY?: number },
    helmetTexture: Texture,
    helmetData: { offsetX?: number; offsetY?: number },
    _headTexture?: Texture,
): { x: number; y: number } {
    return {
        x:
            bodyMetrics.x +
            bodyMetrics.width / 2 -
            helmetTexture.width / 2 +
            (bodyData.headOffsetX || 0) +
            (helmetData.offsetX || 0),
        y:
            bodyMetrics.y +
            bodyMetrics.height -
            helmetTexture.height +
            (bodyData.headOffsetY || 0) +
            HELMET_HEAD_OFFSET_Y +
            (helmetData.offsetY || 0),
    };
}

export function getNameLabelPosition(bodyMetrics: BodyRenderMetrics): {
    x: number;
    y: number;
} {
    return {
        x: bodyMetrics.x + bodyMetrics.width / 2,
        y: bodyMetrics.y + bodyMetrics.height + 2,
    };
}

export function getDebugPositionLabelPosition(bodyMetrics: BodyRenderMetrics): {
    x: number;
    y: number;
} {
    return {
        x: bodyMetrics.x + bodyMetrics.width / 2,
        y: bodyMetrics.y + bodyMetrics.height + 16,
    };
}

export function getDialogLabelPosition(bodyMetrics: BodyRenderMetrics): {
    x: number;
    y: number;
} {
    return {
        x: bodyMetrics.x + bodyMetrics.width / 2,
        y: bodyMetrics.y - 34,
    };
}
