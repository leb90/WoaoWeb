import { z } from "zod";
import type { PoolClient } from "pg";
import pool from "../db";
import { clanLevelConfig, clanLevelForMembers } from "../lib/clanLevelConfig";
import { economyTransaction, onceInTransaction } from "./economyTransactions";
import { applyWalletDelta } from "./questWallets";

const donationSchema = z.object({
    characterId: z.string().uuid(),
    clanId: z.string().uuid(),
    amount: z.number().int().positive().max(2147483647),
    operationId: z.string().uuid(),
});
const upgradeSchema = z.object({
    leaderCharacterId: z.string().uuid(),
    clanId: z.string().uuid(),
    expectedLevel: z.number().int().min(1).max(6),
    expectedVaultRevision: z.number().int().min(0),
    operationId: z.string().uuid(),
});

async function progressionWithClient(client: PoolClient, clanId: string) {
    const clan = (await client.query("SELECT level,quest_points FROM clans WHERE id=$1", [clanId])).rows[0];
    if (!clan) throw new Error("Clan inválido");
    const vault = (await client.query("SELECT gold,revision FROM clan_vaults WHERE clan_id=$1", [clanId])).rows[0];
    const rows = (
        await client.query(
            "SELECT id_item,SUM(cant)::integer AS amount FROM clan_vault_items WHERE clan_id=$1 GROUP BY id_item",
            [clanId],
        )
    ).rows;
    const cfg = clanLevelConfig(clan.level);
    return {
        level: Number(clan.level),
        questPoints: Number(clan.quest_points),
        maxMembers: cfg.maxMembers,
        castleLimit: cfg.castleLimit,
        vaultGold: Number(vault?.gold ?? 0),
        vaultRevision: Number(vault?.revision ?? 0),
        materials: Object.fromEntries(rows.map((r) => [Number(r.id_item), Number(r.amount)])) as Record<number, number>,
        nextLevelRequirements: clan.level < 6 ? clanLevelConfig(clan.level + 1) : null,
    };
}
export async function getClanProgression(clanId: string) {
    const client = await pool.connect();
    try {
        return await progressionWithClient(client, clanId);
    } finally {
        client.release();
    }
}
export type ClanProgressionState = Awaited<ReturnType<typeof getClanProgression>>;
async function lockMember(client: PoolClient, characterId: string, clanId: string, leader = false) {
    const character = (
        await client.query("SELECT clan_id FROM characters WHERE id=$1 AND deleted_at IS NULL FOR UPDATE", [
            characterId,
        ])
    ).rows[0];
    const clan = (await client.query("SELECT leader_character_id,level FROM clans WHERE id=$1 FOR UPDATE", [clanId]))
        .rows[0];
    const member = (
        await client.query("SELECT role FROM clan_members WHERE clan_id=$1 AND character_id=$2 FOR UPDATE", [
            clanId,
            characterId,
        ])
    ).rows[0];
    if (!clan || character?.clan_id !== clanId || !member) throw new Error("No perteneces a este clan");
    if (leader && (member.role !== "leader" || clan.leader_character_id !== characterId))
        throw new Error("Sólo el líder puede subir de nivel el clan");
    return clan;
}
export async function donateClanQuestPoints(payload: unknown) {
    const p = donationSchema.parse(payload);
    return economyTransaction(async (client) => {
        const result = await onceInTransaction(client, p.operationId, { type: "clan-donation", ...p }, async () => {
            await lockMember(client, p.characterId, p.clanId);
            await applyWalletDelta(client, p.characterId, -p.amount);
            const changed = await client.query(
                "UPDATE clans SET quest_points=(quest_points::bigint+$2)::integer,updated_at=NOW() WHERE id=$1 AND quest_points::bigint+$2<=2147483647 RETURNING id",
                [p.clanId, p.amount],
            );
            if (!changed.rowCount) throw new Error("El clan alcanzó su límite de puntos");
            return { donated: p.amount };
        });
        const wallet = (
            await client.query("SELECT balance,version FROM character_quest_wallets WHERE character_id=$1", [
                p.characterId,
            ])
        ).rows[0];
        return {
            ...(await progressionWithClient(client, p.clanId)),
            balance: Number(wallet.balance),
            version: Number(wallet.version),
            applied: result.applied,
        };
    });
}
export async function upgradeClan(payload: unknown) {
    const p = upgradeSchema.parse(payload);
    return economyTransaction(async (client) => {
        const result = await onceInTransaction(client, p.operationId, { type: "clan-upgrade", ...p }, async () => {
            const clan = await lockMember(client, p.leaderCharacterId, p.clanId, true);
            if (clan.level !== p.expectedLevel) throw new Error("El nivel cambió. Actualiza el panel del clan");
            if (clan.level >= 6) throw new Error("El clan alcanzó el nivel máximo");
            await client.query("INSERT INTO clan_vaults(clan_id) VALUES($1) ON CONFLICT DO NOTHING", [p.clanId]);
            const vault = (
                await client.query("SELECT gold,revision FROM clan_vaults WHERE clan_id=$1 FOR UPDATE", [p.clanId])
            ).rows[0];
            if (vault.revision !== p.expectedVaultRevision) throw new Error("La bóveda cambió. Actualiza el panel");
            const cfg = clanLevelConfig(clan.level + 1);
            const items = (
                await client.query(
                    "SELECT id_pos,id_item,cant FROM clan_vault_items WHERE clan_id=$1 ORDER BY id_pos FOR UPDATE",
                    [p.clanId],
                )
            ).rows;
            for (const req of cfg.items) {
                let needed = req.amount;
                for (const item of items.filter((i) => i.id_item === req.idItem)) {
                    const take = Math.min(needed, item.cant);
                    needed -= take;
                    item.cant -= take;
                }
                if (needed) throw new Error(`Faltan materiales del clan (objeto ${req.idItem})`);
            }
            if (vault.gold < cfg.gold) throw new Error("Falta oro en la bóveda del clan");
            const changed = await client.query(
                "UPDATE clans SET level=level+1,quest_points=quest_points-$2,updated_at=NOW(),progression_imported=TRUE WHERE id=$1 AND quest_points>=$2 RETURNING id",
                [p.clanId, cfg.questPoints],
            );
            if (!changed.rowCount) throw new Error("Faltan puntos Quest del clan");
            await client.query(
                "UPDATE clan_vaults SET gold=gold-$2,revision=revision+1,updated_at=NOW() WHERE clan_id=$1",
                [p.clanId, cfg.gold],
            );
            for (const item of items) {
                if (item.cant)
                    await client.query("UPDATE clan_vault_items SET cant=$3 WHERE clan_id=$1 AND id_pos=$2", [
                        p.clanId,
                        item.id_pos,
                        item.cant,
                    ]);
                else
                    await client.query("DELETE FROM clan_vault_items WHERE clan_id=$1 AND id_pos=$2", [
                        p.clanId,
                        item.id_pos,
                    ]);
            }
            return { level: clan.level + 1 };
        });
        return { ...(await progressionWithClient(client, p.clanId)), applied: result.applied };
    });
}
export async function importClanProgression(payload: unknown) {
    const p = z.object({ clanId: z.string().uuid(), legacyLevel: z.number().int().min(1).max(1000000) }).parse(payload);
    return economyTransaction(async (client) => {
        await client.query("SELECT id FROM clans WHERE id=$1 FOR UPDATE", [p.clanId]);
        const count = Number(
            (await client.query("SELECT COUNT(*)::integer AS count FROM clan_members WHERE clan_id=$1", [p.clanId]))
                .rows[0].count,
        );
        const level = Math.max(Math.min(6, p.legacyLevel), clanLevelForMembers(count));
        await client.query(
            "UPDATE clans SET level=$2,progression_imported=TRUE WHERE id=$1 AND progression_imported=FALSE",
            [p.clanId, level],
        );
        return progressionWithClient(client, p.clanId);
    });
}
