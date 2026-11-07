import pool from "./db";
import {
    getGameBalance,
    loadSeedBalanceJson,
    upsertGameBalance,
} from "./repositories/gameBalance";
import { getGameObjectById, upsertGameObject } from "./repositories/gameObjects";
import { getGameNpcById, upsertGameNpc } from "./repositories/gameNpcs";
import { loadSeedNpcsJson } from "./lib/gameData";

// Cambios de datos que tienen que llegar una sola vez a la base de producción: el deploy no corre importGameData y
// `game_balance` solo se siembra con la tabla vacía. Corren en `migrate` (al arrancar la api) y quedan anotados en
// `data_migrations` para no repetirse, así un cambio posterior desde el panel de admin no se pisa.
type DataMigration = {
    id: string;
    run: () => Promise<void>;
};

const DATA_MIGRATIONS: DataMigration[] = [
    {
        id: "2026-11-06-misiones-npc-universal",
        run: async () => {
            const template = loadSeedNpcsJson().find((row) => row.id === 9601);
            if (template && !(await getGameNpcById(9601))) await upsertGameNpc(9601, template.data);
        },
    },
    {
        id: "2026-11-06-materiales-clan",
        run: async () => {
            for (const [id, item, chancePercent] of [
                [739, 1095, 5],
                [754, 1095, 10],
                [761, 1096, 5],
                [726, 1096, 10],
                [585, 1241, 5],
                [726, 1241, 5],
            ]) {
                const current = await getGameNpcById(id);
                if (!current) continue;
                const drop = (current.data.drop ?? []).filter((entry) => entry.item !== item);
                drop.push({ item, cant: 1, chancePercent });
                await upsertGameNpc(id, { ...current.data, drop });
            }
        },
    },
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
    {
        // Las cabezas de enano (301-315 y 370-373) y las de gnomo (401-411 y 470-476) estaban cruzadas: cada
        // personaje pasa a la cabeza equivalente de su raza, por posición y recortando al largo del rango.
        id: "2026-10-29-cabezas-enano-gnomo",
        run: async () => {
            const remap = [
                // [raza, desde, hasta, nuevo inicio, nuevo fin]
                [4, 401, 411, 301, 315],
                [4, 470, 476, 370, 373],
                [5, 301, 315, 401, 411],
                [5, 370, 373, 470, 476],
            ];
            for (const [race, from, to, start, end] of remap) {
                for (const column of ["id_head", "id_last_head"]) {
                    await pool.query(
                        `UPDATE characters SET ${column} = LEAST($4 + (${column} - $2), $5)
                         WHERE id_raza = $1 AND ${column} BETWEEN $2 AND $3`,
                        [race, from, to, start, end],
                    );
                }
            }
        },
    },
    {
        // Gruta (mazmorra de prueba): el arte de Ezequiel. Las plantillas que ya estaban en la base pasan a los cuerpos
        // nuevos (esqueletos, murciélago, pulga y calamar); las nuevas (9835-9838) y los objetos de la piel entran solos
        // porque faltan.
        id: "2026-10-30-gruta-cuerpos-nuevos",
        run: async () => {
            const seed = new Map(loadSeedNpcsJson().map((row) => [row.id, row.data]));
            for (const id of [9794, 9795, 9799, 9841, 9842, 9843, 9844]) {
                const data = seed.get(id);
                if (data) await upsertGameNpc(id, data);
            }
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
