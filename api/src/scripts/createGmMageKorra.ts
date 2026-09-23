import pool from "../db";
import { sanitizeName } from "../lib/text";
import {
    CLASS_ID_MAP,
    RACE_ID_MAP,
    GENDER_ID_MAP,
    getAllowedAppearance,
    getBaseStats,
    getFactionForRace,
    MAX_LEVEL,
    getLegacyExpNextLevelForLevel,
    getMinHitForLevel,
    getMaxHitForLevel,
    getMaxHpForLevel,
    getMaxManaForLevel,
} from "../lib/characterCreation";

const ACCOUNT_NAME = process.env.GM_ACCOUNT_NAME ?? "lebnov";
const CHARACTER_NAME = process.env.GM_CHARACTER_NAME ?? "Korra";
const NUM_SKILLS = 31;
const MAX_SKILL_POINTS = 200;

// Set de Mago del Caido (LEGENDARIO): baculo, tunica (variante alta), capucha, anillo.
const EQUIPPED_ITEMS = [1512, 1406, 1475, 1451];

// Todos los hechizos existentes (ids 1-75, no existe el 54).
const ALL_SPELL_IDS = Array.from({ length: 75 }, (_, i) => i + 1).filter(
    (id) => id !== 54,
);

async function main() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const accountResult = await client.query<{ id: string; name: string }>(
            `SELECT id, name FROM accounts WHERE LOWER(name) = LOWER($1) OR name_sanitized = $2 LIMIT 1`,
            [ACCOUNT_NAME, sanitizeName(ACCOUNT_NAME)],
        );

        const account = accountResult.rows[0];
        if (!account) {
            throw new Error(`No se encontro la cuenta "${ACCOUNT_NAME}"`);
        }

        const existing = await client.query(
            `SELECT id FROM characters WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND deleted_at IS NULL LIMIT 1`,
            [CHARACTER_NAME],
        );
        if (existing.rowCount) {
            throw new Error(`Ya existe un personaje llamado "${CHARACTER_NAME}"`);
        }

        const raceKey = "humano" as const;
        const genderKey = "female" as const;
        const classKey = "mago" as const;

        const idClase = CLASS_ID_MAP[classKey];
        const idRaza = RACE_ID_MAP[raceKey];
        const idGenero = GENDER_ID_MAP[genderKey];
        const appearance = getAllowedAppearance(raceKey, genderKey);
        const headId = Math.floor(
            (appearance.startHeadId + appearance.endHeadId) / 2,
        );
        const baseStats = getBaseStats(classKey, raceKey);

        const level = MAX_LEVEL;
        const expNextLevel = getLegacyExpNextLevelForLevel(level);
        const maxHp = getMaxHpForLevel(idClase, baseStats.constitucion, level);
        const maxMana = getMaxManaForLevel(
            idClase,
            baseStats.inteligencia,
            level,
        );
        const minHit = getMinHitForLevel(idClase, level);
        const maxHit = getMaxHitForLevel(idClase, level);
        const skills = Array.from({ length: NUM_SKILLS }, () => MAX_SKILL_POINTS);

        const characterResult = await client.query<{ id: string }>(
            `
      INSERT INTO characters (
        account_id,
        name,
        id_clase,
        map_id,
        pos_x,
        pos_y,
        gold,
        id_head,
        id_last_head,
        id_last_body,
        id_body,
        spells_acertados,
        spells_errados,
        hp,
        max_hp,
        mana,
        max_mana,
        id_raza,
        id_genero,
        muerto,
        min_hit,
        max_hit,
        attr_fuerza,
        attr_agilidad,
        attr_inteligencia,
        attr_constitucion,
        privileges,
        count_killed,
        count_die,
        exp,
        exp_next_level,
        level,
        dead,
        criminal,
        faction,
        navegando,
        home_map,
        home_x,
        home_y,
        connected,
        skills,
        skill_pts
      )
      VALUES (
        $1, $2, $3, 37, 78, 87, 0,
        $4, $4, $5, $5,
        0, 0,
        $6, $6, $7, $7,
        $8, $9, FALSE,
        $10, $11,
        $12, $13, $14, $15,
        1,
        0, 0, 0, $16, $17,
        FALSE, FALSE, $18, FALSE,
        37, 78, 87, FALSE,
        $19, 0
      )
      RETURNING id
    `,
            [
                account.id,
                CHARACTER_NAME,
                idClase,
                headId,
                appearance.bodyId,
                maxHp,
                maxMana,
                idRaza,
                idGenero,
                minHit,
                maxHit,
                baseStats.fuerza,
                baseStats.agilidad,
                baseStats.inteligencia,
                baseStats.constitucion,
                expNextLevel,
                level,
                getFactionForRace(raceKey),
                JSON.stringify(skills),
            ],
        );

        const characterId = characterResult.rows[0]?.id;
        if (!characterId) {
            throw new Error("No se pudo crear el personaje");
        }

        const itemValues: Array<string | number | boolean> = [];
        const itemPlaceholders = EQUIPPED_ITEMS.map((itemId, index) => {
            const base = index * 5;
            itemValues.push(characterId, index + 1, itemId, 1, true);
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
        });
        await client.query(
            `INSERT INTO character_items (character_id, id_pos, id_item, cant, equipped) VALUES ${itemPlaceholders.join(", ")}`,
            itemValues,
        );

        const spellValues: Array<string | number> = [];
        const spellPlaceholders = ALL_SPELL_IDS.map((spellId, index) => {
            const base = index * 3;
            spellValues.push(characterId, index, spellId);
            return `($${base + 1}, $${base + 2}, $${base + 3})`;
        });
        await client.query(
            `INSERT INTO character_spells (character_id, id_pos, id_spell) VALUES ${spellPlaceholders.join(", ")}`,
            spellValues,
        );

        await client.query("COMMIT");

        console.log(
            `Personaje "${CHARACTER_NAME}" creado (id=${characterId}) en la cuenta "${account.name}". Nivel ${level}, GM, ${ALL_SPELL_IDS.length} hechizos, set legendario de mago equipado.`,
        );
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(async (error) => {
    console.error(error);
    await pool.end().catch(() => undefined);
    process.exit(1);
});
