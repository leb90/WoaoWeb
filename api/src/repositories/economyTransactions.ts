import crypto from "node:crypto";
import type { PoolClient } from "pg";
import pool from "../db";

export async function economyTransaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const value = await run(client);
        await client.query("COMMIT");
        return value;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
export async function onceInTransaction<T>(
    client: PoolClient,
    operationId: string,
    payload: unknown,
    run: () => Promise<T>,
): Promise<{ value: T; applied: boolean }> {
    const hash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [operationId]);
    const existing = await client.query("SELECT payload_hash,result FROM economy_operations WHERE operation_id=$1", [
        operationId,
    ]);
    if (existing.rowCount) {
        if (existing.rows[0].payload_hash !== hash)
            throw new Error("El identificador de operación ya se usó con otros datos");
        return { value: existing.rows[0].result as T, applied: false };
    }
    const value = await run();
    await client.query(
        "INSERT INTO economy_operations(operation_id,payload_hash,payload,result) VALUES($1,$2,$3::jsonb,$4::jsonb)",
        [operationId, hash, JSON.stringify(payload), JSON.stringify(value)],
    );
    return { value, applied: true };
}
