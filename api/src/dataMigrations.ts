import pool from "./db";
import {
    getGameBalance,
    loadSeedBalanceJson,
    upsertGameBalance,
} from "./repositories/gameBalance";
import { getGameObjectById, upsertGameObject } from "./repositories/gameObjects";

// Cambios de datos que tienen que llegar una sola vez a la base de producción: el deploy no corre importGameData y
// `game_balance` solo se siembra con la tabla vacía. Corren en `migrate` (al arrancar la api) y quedan anotados en
// `data_migrations` para no repetirse, así un cambio posterior desde el panel de admin no se pisa.
type DataMigration = {
    id: string;
    run: () => Promise<void>;
};

const DATA_MIGRATIONS: DataMigration[] = [
    {
        // Razas espejadas por arquetipo (Alianza ↔ Horda), docs/balance/RAZAS.md. Los personajes toman los atributos
        // nuevos al entrar y la vida se corre con la diferencia de constitución (server/src/login.ts).
        id: "2026-10-29-razas-espejo",
        run: async () => {
            const current = await getGameBalance();
            await upsertGameBalance({
                ...current.data,
                balanceRazas: loadSeedBalanceJson().balanceRazas,
            });
        },
    },
    {
        // El pergamino 200 enseña el hechizo 1, que ya se llamaba "Curar efectos" (cura veneno y quemadura).
        id: "2026-10-29-pergamino-curar-efectos",
        run: async () => {
            const scroll = await getGameObjectById(200).catch(() => null);
            if (!scroll || scroll.data.name !== "Curar veneno") return;
            await upsertGameObject(200, { ...scroll.data, name: "Curar efectos" });
        },
    },
];

export async function runDataMigrations(): Promise<void> {
    for (const migration of DATA_MIGRATIONS) {
        const applied = await pool.query(
            "SELECT 1 FROM data_migrations WHERE id = $1",
            [migration.id],
        );
        if (applied.rowCount) continue;

        await migration.run();
        await pool.query(
            "INSERT INTO data_migrations (id) VALUES ($1) ON CONFLICT (id) DO NOTHING",
            [migration.id],
        );
        console.log(`Data migration applied: ${migration.id}`);
    }
}
