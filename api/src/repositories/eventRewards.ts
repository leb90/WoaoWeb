import crypto from "node:crypto";
import { z } from "zod";
import { economyTransaction, onceInTransaction } from "./economyTransactions";
import { applyWalletDelta } from "./questWallets";
import config from "../jsons/openingRewards.json";
const types = z.enum(["tournament", "hungerGames", "huntersGame", "bloodCastle", "factionWar"]);
const registerSchema = z.object({
    runId: z.string().uuid(),
    type: types,
    startedAt: z.string().datetime(),
    characterIds: z.array(z.string().uuid()).max(100),
});
const grantSchema = z.object({
    runId: z.string().uuid(),
    characterId: z.string().uuid(),
    operationId: z.string().min(3).max(200),
    kind: z.enum([
        "champion",
        "finalist",
        "kill",
        "survivor",
        "win",
        "loss",
        "mvp-damage",
        "mvp-removeParalysis",
        "mvp-paralyze",
        "mvp-healing",
    ]),
    activity: z.boolean(),
    victimCharacterId: z.string().uuid().optional(),
    completed: z.boolean().optional(),
});
export async function registerEventRun(payload: unknown) {
    const p = registerSchema.parse(payload);
    const ids = [...new Set(p.characterIds)].sort();
    const key = crypto.createHash("sha256").update(ids.join(",")).digest("hex");
    return economyTransaction(async (client) => {
        return onceInTransaction(client, `event:${p.runId}:register:${key}`, p, async () => {
            await client.query(
                "INSERT INTO reward_event_runs(id,type,started_at) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
                [p.runId, p.type, p.startedAt],
            );
            const run = (
                await client.query("SELECT type,started_at FROM reward_event_runs WHERE id=$1 FOR UPDATE", [p.runId])
            ).rows[0];
            if (run.type !== p.type || run.started_at.toISOString() !== p.startedAt)
                throw new Error("La edición de evento tiene otros datos");
            await client.query(
                "INSERT INTO reward_event_participants(run_id,character_id,account_id) SELECT $1,id,account_id FROM characters WHERE id=ANY($2::uuid[]) AND deleted_at IS NULL ON CONFLICT DO NOTHING",
                [p.runId, ids],
            );
            return { registered: ids.length };
        });
    });
}
export async function grantEventReward(payload: unknown) {
    const p = grantSchema.parse(payload);
    return economyTransaction(async (client) => {
        const result = await onceInTransaction(client, p.operationId, { type: "event-reward", ...p }, async () => {
            await client.query("SELECT id FROM characters WHERE id=$1 FOR UPDATE", [p.characterId]);
            const run = (await client.query("SELECT type FROM reward_event_runs WHERE id=$1 FOR UPDATE", [p.runId]))
                .rows[0];
            if (!run) throw new Error("Evento sin registrar");
            const participants = (
                await client.query("SELECT character_id,account_id FROM reward_event_participants WHERE run_id=$1", [
                    p.runId,
                ])
            ).rows;
            const player = participants.find((c) => c.character_id === p.characterId);
            if (!player) throw new Error("El personaje no participó de esta edición");
            const count = new Set(participants.map((c) => c.account_id)).size;
            let points = 0;
            if (p.activity) {
                if (run.type === "tournament" && count >= config.tournament.minimumAccounts) {
                    if (p.kind === "champion")
                        points =
                            config.tournament.championBase +
                            Math.min(config.tournament.maximumBonus, count * config.tournament.perAccount);
                    if (p.kind === "finalist") points = config.tournament.finalist;
                }
                if (run.type === "hungerGames" && count >= config.hungerGames.minimumAccounts && p.kind === "champion")
                    points =
                        config.hungerGames.championBase +
                        Math.min(config.hungerGames.maximumBonus, count * config.hungerGames.perAccount);
                if (run.type === "huntersGame" && count >= config.huntersGame.minimumAccounts) {
                    if (p.kind === "champion")
                        points = config.huntersGame.championBase + count * config.huntersGame.perAccount;
                    if (p.kind === "kill") {
                        const victim = participants.find((c) => c.character_id === p.victimCharacterId);
                        if (victim && victim.account_id !== player.account_id) {
                            const killed = await client.query(
                                "INSERT INTO event_kill_rewards(run_id,killer_character_id,victim_account_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING run_id",
                                [p.runId, p.characterId, victim.account_id],
                            );
                            if (killed.rowCount) points = config.huntersGame.kill;
                        }
                    }
                }
                if (run.type === "bloodCastle" && p.kind === "survivor")
                    points = config.bloodCastle.survivor + (p.completed ? config.bloodCastle.completionBonus : 0);
                if (run.type === "factionWar") {
                    if (p.kind === "win") points = config.factionWar.win;
                    if (p.kind === "loss") points = config.factionWar.loss;
                    if (p.kind.startsWith("mvp-")) points = config.factionWar.mvp;
                }
            }
            if (points && p.kind !== "kill") {
                const grant = await client.query(
                    "INSERT INTO event_reward_awards(run_id,character_id,kind) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING run_id",
                    [p.runId, p.characterId, p.kind],
                );
                if (!grant.rowCount) points = 0;
            }
            const balance = points
                ? await applyWalletDelta(client, p.characterId, points)
                : Number(
                      (
                          await client.query("SELECT balance FROM character_quest_wallets WHERE character_id=$1", [
                              p.characterId,
                          ])
                      ).rows[0]?.balance ?? 0,
                  );
            const version = Number(
                (
                    await client.query("SELECT version FROM character_quest_wallets WHERE character_id=$1", [
                        p.characterId,
                    ])
                ).rows[0]?.version ?? 0,
            );
            return {
                points,
                balance,
                version,
                ...(run.type === "tournament" && p.kind === "champion" && points
                    ? { item: { objIndex: 1245, amount: 1 } }
                    : {}),
            };
        });
        return { ...result.value, applied: result.applied };
    });
}
