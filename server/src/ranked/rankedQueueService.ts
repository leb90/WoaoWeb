import type { RankedMode } from "./rankedConfig";
import type { RankedQueueEntry, RankedQueueJoinRequest, RankedQueueStatus } from "./rankedTypes";

export type RankedQueueLeaveReason = "manual" | "death" | "disconnect" | "left-safe-zone" | "match-found" | "admin";

export class RankedQueueService {
    private readonly entries = new Map<string, RankedQueueEntry>();
    private readonly characterIndex = new Map<string, string>();

    join(request: RankedQueueJoinRequest): RankedQueueEntry {
        const now = Number.isFinite(request.now) ? Number(request.now) : Date.now();
        const entry: RankedQueueEntry = {
            id: request.id,
            mode: request.mode,
            leaderCharacterId: request.leaderCharacterId,
            memberCharacterIds: [...request.memberCharacterIds],
            teamElo: Math.max(0, Math.floor(request.teamElo)),
            enqueuedAt: now,
            status: "QUEUED",
        };

        this.removeEntriesForCharacters(entry.memberCharacterIds);
        this.entries.set(entry.id, entry);

        for (const characterId of entry.memberCharacterIds) {
            this.characterIndex.set(characterId, entry.id);
        }

        return entry;
    }

    leaveByEntryId(entryId: string, reason: RankedQueueLeaveReason = "manual"): RankedQueueEntry | null {
        void reason;

        const entry = this.entries.get(entryId);
        if (!entry) {
            return null;
        }

        this.entries.delete(entry.id);
        for (const characterId of entry.memberCharacterIds) {
            this.characterIndex.delete(characterId);
        }

        return entry;
    }

    leaveByCharacterId(characterId: string, reason: RankedQueueLeaveReason = "manual"): RankedQueueEntry | null {
        const entryId = this.characterIndex.get(characterId);
        return entryId ? this.leaveByEntryId(entryId, reason) : null;
    }

    getByCharacterId(characterId: string): RankedQueueEntry | null {
        const entryId = this.characterIndex.get(characterId);
        return entryId ? (this.entries.get(entryId) ?? null) : null;
    }

    list(mode?: RankedMode): RankedQueueEntry[] {
        const values = [...this.entries.values()];
        return mode ? values.filter((entry) => entry.mode === mode) : values;
    }

    setStatus(entryId: string, status: RankedQueueStatus): RankedQueueEntry | null {
        const entry = this.entries.get(entryId);
        if (!entry) {
            return null;
        }

        const nextEntry = { ...entry, status };
        this.entries.set(entryId, nextEntry);
        return nextEntry;
    }

    clear() {
        this.entries.clear();
        this.characterIndex.clear();
    }

    private removeEntriesForCharacters(characterIds: readonly string[]) {
        for (const characterId of characterIds) {
            this.leaveByCharacterId(characterId, "manual");
        }
    }
}
