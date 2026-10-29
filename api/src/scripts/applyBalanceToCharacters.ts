import pool from "../db";
import type { CharacterRecord } from "../types";
import {
  clampLevel,
  getLegacyExpNextLevelForLevel,
  getMaxHitForLevel,
  getMaxHpForLevel,
  getMaxManaForLevel,
  getMinHitForLevel,
} from "../lib/characterCreation";

const RACE_BASE_STATS: Record<
  number,
  {
    fuerza: number;
    agilidad: number;
    inteligencia: number;
    constitucion: number;
  }
> = {
  1: { fuerza: 19, agilidad: 19, inteligencia: 20, constitucion: 20 },
  2: { fuerza: 18, agilidad: 20, inteligencia: 21, constitucion: 19 },
  3: { fuerza: 19, agilidad: 20, inteligencia: 19, constitucion: 19 },
  4: { fuerza: 20, agilidad: 19, inteligencia: 18, constitucion: 20 },
  5: { fuerza: 17, agilidad: 19, inteligencia: 22, constitucion: 20 },
  6: { fuerza: 20, agilidad: 19, inteligencia: 18, constitucion: 20 },
  7: { fuerza: 18, agilidad: 20, inteligencia: 21, constitucion: 19 },
  8: { fuerza: 20, agilidad: 20, inteligencia: 17, constitucion: 19 },
  9: { fuerza: 17, agilidad: 19, inteligencia: 22, constitucion: 20 },
  10: { fuerza: 19, agilidad: 20, inteligencia: 19, constitucion: 19 },
  11: { fuerza: 20, agilidad: 20, inteligencia: 17, constitucion: 19 },
  12: { fuerza: 19, agilidad: 19, inteligencia: 20, constitucion: 20 },
};

function getExpectedStats(character: CharacterRecord) {
  const base = RACE_BASE_STATS[character.id_raza];
  if (!base) {
    throw new Error(
      `Raza invalida para character ${character.id}: ${character.id_raza}`,
    );
  }

  const level = clampLevel(character.level || 1);
  const expectedMaxHp = getMaxHpForLevel(character.id_clase, base.constitucion, level);
  const storedMaxHp = Number(character.max_hp ?? 0);
  // Si cambió la constitución, la vida guardada se corre lo mismo que el promedio, como hace el server al entrar
  // (server/src/login.ts): sin esto, el login ya no vería la diferencia y la vida quedaría como estaba.
  const previousConstitucion = Number(character.attr_constitucion ?? 0);
  const hpShift = storedMaxHp > 0 && previousConstitucion > 0 && previousConstitucion !== base.constitucion
    ? getMaxHpForLevel(character.id_clase, base.constitucion, level) -
      getMaxHpForLevel(character.id_clase, previousConstitucion, level)
    : 0;
  const maxHp = storedMaxHp > 0 ? Math.max(1, storedMaxHp + hpShift) : expectedMaxHp;
  const maxMana = getMaxManaForLevel(
    character.id_clase,
    base.inteligencia,
    level,
  );

  return {
    level,
    expNextLevel: getLegacyExpNextLevelForLevel(level),
    attrFuerza: base.fuerza,
    attrAgilidad: base.agilidad,
    attrInteligencia: base.inteligencia,
    attrConstitucion: base.constitucion,
    maxHp,
    hp: character.dead
      ? 0
      : Math.min(Math.max(Number(character.hp ?? maxHp) + hpShift, 0), maxHp),
    maxMana,
    mana: Math.min(Math.max(Number(character.mana ?? maxMana), 0), maxMana),
    minHit: getMinHitForLevel(character.id_clase, level),
    maxHit: getMaxHitForLevel(character.id_clase, level),
  };
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<CharacterRecord>(
      "SELECT * FROM characters ORDER BY created_at ASC, id ASC",
    );

    let updatedCount = 0;

    for (const character of result.rows) {
      const next = getExpectedStats(character);

      await client.query(
        `
          UPDATE characters
          SET
            level = $2,
            exp_next_level = $3,
            attr_fuerza = $4,
            attr_agilidad = $5,
            attr_inteligencia = $6,
            attr_constitucion = $7,
            hp = $8,
            max_hp = $9,
            mana = $10,
            max_mana = $11,
            min_hit = $12,
            max_hit = $13,
            updated_at = NOW()
          WHERE id = $1
        `,
        [
          character.id,
          next.level,
          next.expNextLevel,
          next.attrFuerza,
          next.attrAgilidad,
          next.attrInteligencia,
          next.attrConstitucion,
          next.hp,
          next.maxHp,
          next.mana,
          next.maxMana,
          next.minHit,
          next.maxHit,
        ],
      );

      updatedCount += 1;
    }

    await client.query("COMMIT");

    console.log(`Characters actualizados: ${updatedCount}`);
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
