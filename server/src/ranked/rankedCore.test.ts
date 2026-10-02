import assert from "node:assert/strict";
import { RankedArenaService } from "./rankedArenaService";
import { calculateRankedEloChange, calculateTeamEloAverage } from "./rankedEloService";
import { getMatchmakingEloRange, selectBestMatchCandidate } from "./rankedMatchmakingService";
import { RankedQueueService } from "./rankedQueueService";
import { getRankFromElo } from "./rankedRankService";

function run() {
    assert.equal(getRankFromElo(0).label, "Bronce V");
    assert.equal(getRankFromElo(99).label, "Bronce V");
    assert.equal(getRankFromElo(100).label, "Bronce IV");
    assert.equal(getRankFromElo(200).label, "Bronce III");
    assert.equal(getRankFromElo(300).label, "Bronce II");
    assert.equal(getRankFromElo(400).label, "Bronce I");
    assert.equal(getRankFromElo(500).label, "Plata V");
    assert.equal(getRankFromElo(1400).label, "Oro I");
    assert.equal(getRankFromElo(3500).label, "King");
    assert.equal(getRankFromElo(3500).divisionLabel, null);

    const equal = calculateRankedEloChange(1000, 1000);
    assert.equal(equal.winnerDelta, 16);
    assert.equal(equal.loserDelta, -16);

    const favoriteWins = calculateRankedEloChange(3500, 500);
    assert.equal(favoriteWins.winnerDelta, 1);
    assert.equal(favoriteWins.loserDelta, -1);

    const underdogWins = calculateRankedEloChange(500, 3500);
    assert.ok(underdogWins.winnerDelta >= 31);
    assert.ok(underdogWins.loserDelta <= -31);
    assert.equal(underdogWins.winnerEloAfter, 500 + underdogWins.winnerDelta);
    assert.ok(underdogWins.loserEloAfter >= 0);

    const floor = calculateRankedEloChange(1, 0);
    assert.equal(floor.loserEloAfter, 0);

    assert.equal(calculateTeamEloAverage([1000, 1201]), 1101);

    assert.equal(getMatchmakingEloRange(0), 100);
    assert.equal(getMatchmakingEloRange(15), 200);
    assert.equal(getMatchmakingEloRange(30), 350);
    assert.equal(getMatchmakingEloRange(90), 1000);

    const now = 1_000_000;
    const request = {
        id: "a",
        mode: "RANKED_1V1" as const,
        leaderCharacterId: "a1",
        memberCharacterIds: ["a1"],
        teamElo: 1000,
        enqueuedAt: now - 20_000,
        status: "QUEUED" as const,
    };
    const best = selectBestMatchCandidate(
        request,
        [
            {
                id: "b",
                mode: "RANKED_1V1",
                leaderCharacterId: "b1",
                memberCharacterIds: ["b1"],
                teamElo: 1180,
                enqueuedAt: now - 30_000,
                status: "QUEUED",
            },
            {
                id: "c",
                mode: "RANKED_1V1",
                leaderCharacterId: "c1",
                memberCharacterIds: ["c1"],
                teamElo: 1040,
                enqueuedAt: now - 5_000,
                status: "QUEUED",
            },
        ],
        now,
    );
    assert.equal(best?.entry.id, "c");

    const queue = new RankedQueueService();
    queue.join({
        id: "queue-a",
        mode: "RANKED_1V1",
        leaderCharacterId: "a1",
        memberCharacterIds: ["a1"],
        teamElo: 1000,
        now,
    });
    queue.join({
        id: "queue-b",
        mode: "RANKED_1V1",
        leaderCharacterId: "a1",
        memberCharacterIds: ["a1"],
        teamElo: 1000,
        now,
    });
    assert.equal(queue.list().length, 1);
    assert.equal(queue.getByCharacterId("a1")?.id, "queue-b");

    const arenaService = new RankedArenaService([
        {
            map: 9001,
            teamA: [{ x: 1, y: 1 }],
            teamB: [{ x: 2, y: 2 }],
        },
    ]);
    assert.equal(arenaService.reserveFreeArena("match-1")?.map, 9001);
    assert.equal(arenaService.reserveFreeArena("match-2"), null);
    assert.equal(arenaService.releaseArena(9001)?.state, "FREE");
}

run();
