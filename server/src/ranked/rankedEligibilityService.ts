import type { RuntimeCharacter } from "../types/runtime";
import { isSafeZonePosition } from "../safeZone";
import { RANKED_QUEUE_ALLOWED_MAPS, type RankedMode } from "./rankedConfig";

export type RankedEligibilityCode =
    | "OK"
    | "NOT_CONNECTED"
    | "DEAD"
    | "NOT_IN_SAFE_ZONE"
    | "MAP_NOT_ALLOWED"
    | "IN_PVP_ARENA"
    | "IN_CHALLENGE"
    | "IN_RANKED"
    | "IN_EVENT"
    | "TRANSFERRING_MAP"
    | "PARTY_REQUIRED";

export type RankedEligibility = {
    ok: boolean;
    code: RankedEligibilityCode;
    message: string;
};

export type RankedEligibilityContext = {
    mode: RankedMode;
    partySize?: number;
    isQueued?: boolean;
    isInMatch?: boolean;
};

function isMapAllowed(mapId: number) {
    return RANKED_QUEUE_ALLOWED_MAPS.length === 0 || RANKED_QUEUE_ALLOWED_MAPS.includes(mapId);
}

function result(code: RankedEligibilityCode, message: string): RankedEligibility {
    return {
        ok: code === "OK",
        code,
        message,
    };
}

export function getRankedEligibility(
    user: RuntimeCharacter | undefined,
    context: RankedEligibilityContext,
): RankedEligibility {
    if (!user || user.connected === false) {
        return result("NOT_CONNECTED", "El personaje no esta conectado.");
    }

    if (Number(user.dead ?? 0) > 0) {
        return result("DEAD", "Debes estar vivo para buscar Ranked.");
    }

    if (context.mode === "RANKED_2V2" && context.partySize !== 2) {
        return result("PARTY_REQUIRED", "Tu party debe tener exactamente 2 jugadores.");
    }

    if (context.isQueued || context.isInMatch || user.rankedArena || user.rankedMatchId) {
        return result("IN_RANKED", "Ya estas participando en Ranked.");
    }

    if (user.pvpChar || user.arenaRoomId) {
        return result("IN_PVP_ARENA", "No puedes buscar Ranked desde una arena PvP.");
    }

    if (user.challengeMatchId) {
        return result("IN_CHALLENGE", "No puedes buscar Ranked durante un reto.");
    }

    if (user.bloodCastle || user.hungerGames || user.tournamentMatchId || user.factionWarMatchId) {
        return result("IN_EVENT", "No puedes buscar Ranked durante otro evento.");
    }

    if (user.transferingMap || user.teleporting) {
        return result("TRANSFERRING_MAP", "Espera a terminar el cambio de mapa.");
    }

    const mapId = Number(user.map ?? 0);
    if (!isMapAllowed(mapId)) {
        return result("MAP_NOT_ALLOWED", "Este mapa no permite buscar Ranked.");
    }

    if (!isSafeZonePosition(mapId, user.pos)) {
        return result("NOT_IN_SAFE_ZONE", "Debes estar en una ciudad o zona segura para buscar Ranked.");
    }

    return result("OK", "Estas en condiciones de anotarte.");
}

