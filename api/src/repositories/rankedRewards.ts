import type { PoolClient } from "pg";
import rewards from "../jsons/openingRewards.json";
import { applyWalletDelta } from "./questWallets";
export function argentinaRewardDay(date: Date) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}
export async function grantRankedRewards(client: PoolClient, match: any) {
    const cfg = rewards.ranked;
    const results: Array<{ characterId: string; points: number; balance?: number; version?: number }> = [];
    const characters = (
        await client.query("SELECT id,account_id FROM characters WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE", [
            match.participants.map((p: any) => p.characterId),
        ])
    ).rows;
    const accounts = new Map(characters.map((c) => [c.id, c.account_id]));
    const left = new Set(
        match.participants.filter((p: any) => p.team === "A").map((p: any) => accounts.get(p.characterId)),
    );
    const selfOpponent = match.participants.some((p: any) => p.team === "B" && left.has(accounts.get(p.characterId)));
    const day = argentinaRewardDay(new Date(match.finishedAt));
    const duration = new Date(match.finishedAt).getTime() - new Date(match.startedAt).getTime();
    for (const p of [...match.participants].sort((a, b) => a.characterId.localeCompare(b.characterId))) {
        const entry: { characterId: string; points: number; balance?: number; version?: number } = {
            characterId: p.characterId,
            points: 0,
        };
        results.push(entry);
        if (
            selfOpponent ||
            duration < cfg.minimumDurationSeconds * 1000 ||
            match.scoreA + match.scoreB < 1 ||
            !["win", "loss"].includes(p.result) ||
            Number(match.metadata?.activity?.[p.characterId] ?? 0) <= 0
        )
            continue;
        await client.query(
            "INSERT INTO ranked_reward_daily(character_id,reward_day) VALUES($1,$2) ON CONFLICT DO NOTHING",
            [p.characterId, day],
        );
        const daily = (
            await client.query(
                "SELECT points,first_win_awarded FROM ranked_reward_daily WHERE character_id=$1 AND reward_day=$2 FOR UPDATE",
                [p.characterId, day],
            )
        ).rows[0];
        const opponents = [
            ...new Set(
                match.participants
                    .filter((o: any) => o.team !== p.team)
                    .map((o: any) => String(accounts.get(o.characterId))),
            ),
        ].sort();
        let overLimit = false;
        for (const accountId of opponents) {
            const seen = (
                await client.query(
                    "SELECT rewarded_matches FROM ranked_reward_opponents WHERE character_id=$1 AND opponent_account_id=$2 AND reward_day=$3",
                    [p.characterId, accountId, day],
                )
            ).rows[0];
            if (Number(seen?.rewarded_matches ?? 0) >= cfg.opponentMatchesPerDay) overLimit = true;
        }
        if (overLimit) continue;
        const win = p.result === "win";
        const requested = (win ? cfg.win : cfg.loss) + (win && !daily.first_win_awarded ? cfg.firstWinBonus : 0);
        const wallet = (
            await client.query("SELECT balance FROM character_quest_wallets WHERE character_id=$1 FOR UPDATE", [
                p.characterId,
            ])
        ).rows[0];
        if (!wallet) continue;
        const points = Math.max(0, Math.min(requested, cfg.dailyCap - daily.points, 2147483647 - wallet.balance));
        if (!points) continue;
        entry.points = points;
        entry.balance = await applyWalletDelta(client, p.characterId, points);
        entry.version = Number(
            (await client.query("SELECT version FROM character_quest_wallets WHERE character_id=$1", [p.characterId]))
                .rows[0].version,
        );
        await client.query(
            "UPDATE ranked_reward_daily SET points=points+$3,first_win_awarded=first_win_awarded OR $4 WHERE character_id=$1 AND reward_day=$2",
            [p.characterId, day, points, win],
        );
        for (const accountId of opponents)
            await client.query(
                "INSERT INTO ranked_reward_opponents(character_id,opponent_account_id,reward_day,rewarded_matches) VALUES($1,$2,$3,1) ON CONFLICT(character_id,opponent_account_id,reward_day) DO UPDATE SET rewarded_matches=ranked_reward_opponents.rewarded_matches+1",
                [p.characterId, accountId, day],
            );
    }
    return results;
}
