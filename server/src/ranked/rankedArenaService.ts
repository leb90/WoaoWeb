import { RANKED_ARENAS, type RankedArenaConfig } from "./rankedConfig";
import type { RankedArenaReservation, RankedArenaState } from "./rankedTypes";

export class RankedArenaService {
    private readonly reservations = new Map<number, RankedArenaReservation>();

    constructor(private readonly arenas: readonly RankedArenaConfig[] = RANKED_ARENAS) {
        for (const arena of arenas) {
            this.reservations.set(arena.map, {
                map: arena.map,
                state: "FREE",
                reservedByMatchId: null,
                reservedAt: null,
            });
        }
    }

    reserveFreeArena(matchId: string, now = Date.now()): RankedArenaReservation | null {
        const freeArena = this.arenas.find((arena) => this.reservations.get(arena.map)?.state === "FREE");
        if (!freeArena) {
            return null;
        }

        const reservation: RankedArenaReservation = {
            map: freeArena.map,
            state: "RESERVED",
            reservedByMatchId: matchId,
            reservedAt: now,
        };
        this.reservations.set(freeArena.map, reservation);
        return reservation;
    }

    setArenaState(mapId: number, state: RankedArenaState) {
        const current = this.reservations.get(mapId);
        if (!current) {
            return null;
        }

        const nextReservation = { ...current, state };
        this.reservations.set(mapId, nextReservation);
        return nextReservation;
    }

    releaseArena(mapId: number) {
        const current = this.reservations.get(mapId);
        if (!current) {
            return null;
        }

        const nextReservation: RankedArenaReservation = {
            map: mapId,
            state: "FREE",
            reservedByMatchId: null,
            reservedAt: null,
        };
        this.reservations.set(mapId, nextReservation);
        return nextReservation;
    }

    getArenaConfig(mapId: number) {
        return this.arenas.find((arena) => arena.map === mapId) ?? null;
    }

    listReservations() {
        return [...this.reservations.values()];
    }

    reset() {
        for (const arena of this.arenas) {
            this.releaseArena(arena.map);
        }
    }
}

