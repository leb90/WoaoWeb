import { z } from "zod";
import type { PoolClient } from "pg";
import pool from "../db";
import { economyTransaction, onceInTransaction } from "./economyTransactions";
const MAX = 2147483647;
const initSchema = z.object({ characterId: z.string().uuid(), legacyBalance: z.number().int().min(0).max(MAX) });
const mutationSchema = z.object({
    characterId: z.string().uuid(),
    operationId: z.string().min(3).max(200),
    delta: z
        .number()
        .int()
        .min(-MAX)
        .max(MAX)
        .refine((v) => v !== 0),
    reason: z.string().min(1).max(100),
});

export async function initializeQuestWallet(payload: unknown): Promise<{ balance: number; version: number }> {
    const p = initSchema.parse(payload);
    return economyTransaction(async (client) => {
        await client.query(
            "INSERT INTO character_quest_wallets(character_id,balance) VALUES($1,$2) ON CONFLICT(character_id) DO NOTHING",
            [p.characterId, p.legacyBalance],
        );
        const state = (
            await client.query("SELECT balance,version FROM character_quest_wallets WHERE character_id=$1", [
                p.characterId,
            ])
        ).rows[0];
        return { balance: Number(state.balance), version: Number(state.version) };
    });
}
export async function applyWalletDelta(client: PoolClient, characterId: string, delta: number): Promise<number> {
    if (!Number.isSafeInteger(delta)) throw new Error("Cantidad de puntos inválida");
    const result = await client.query(
        "UPDATE character_quest_wallets SET balance=(balance::bigint+$2)::integer,version=version+1,updated_at=NOW() WHERE character_id=$1 AND balance::bigint+$2 BETWEEN 0 AND 2147483647 RETURNING balance",
        [characterId, delta],
    );
    if (!result.rowCount) throw new Error("Saldo Quest insuficiente o monedero sin inicializar");
    return Number(result.rows[0].balance);
}
export async function mutateQuestWallet(payload: unknown) {
    const p = mutationSchema.parse(payload);
    return economyTransaction(async (client) => {
        const result = await onceInTransaction(client, p.operationId, { type: "quest-wallet", ...p }, async () => ({
            balance: await applyWalletDelta(client, p.characterId, p.delta),
        }));
        const current = await client.query(
            "SELECT balance,version FROM character_quest_wallets WHERE character_id=$1",
            [p.characterId],
        );
        return {
            balance: Number(current.rows[0].balance),
            version: Number(current.rows[0].version),
            applied: result.applied,
        };
    });
}
export async function getQuestWallet(characterId: string) {
    const result = await pool.query("SELECT balance FROM character_quest_wallets WHERE character_id=$1", [characterId]);
    return { balance: Number(result.rows[0]?.balance ?? 0) };
}
