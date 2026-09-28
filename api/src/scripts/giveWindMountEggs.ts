const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5434/aoweb",
});

// Droppable eggs only. Kong (1526) and Grifo/Hipogrifo (1523) are donation-only.
const EGGS = [1519, 1520, 1521, 1522, 1524, 1525, 1527, 1528, 1529, 1530];

type InventoryRow = {
  id_pos: number;
  id_item: number;
  cant: number;
  equipped: number;
};

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const charRes = await client.query(
      `SELECT id, name, level FROM characters
       WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND deleted_at IS NULL
       LIMIT 1`,
      ["Wind"],
    );
    if (!charRes.rows[0]) {
      throw new Error('No se encontro el personaje "Wind"');
    }
    const character = charRes.rows[0];
    console.log("Personaje:", character);

    const itemsRes = await client.query(
      `SELECT id_pos, id_item, cant, equipped
       FROM character_items WHERE character_id = $1 ORDER BY id_pos`,
      [character.id],
    );
    console.log("Inventario actual:", itemsRes.rows.length, "slots");

    const rows = itemsRes.rows as InventoryRow[];
    const used = new Set(rows.map((row) => Number(row.id_pos)));
    const already = new Set(rows.map((row) => Number(row.id_item)));
    const pending = EGGS.filter((id) => !already.has(id));

    let nextSlot = 1;
    const inserts: Array<{ slot: number; itemId: number }> = [];
    for (const itemId of pending) {
      while (used.has(nextSlot) && nextSlot <= 21) {
        nextSlot++;
      }
      if (nextSlot > 21) {
        console.warn(
          "Inventario lleno; no se agregaron todos. Quedan:",
          pending.length - inserts.length,
        );
        break;
      }
      inserts.push({ slot: nextSlot, itemId });
      used.add(nextSlot);
      nextSlot++;
    }

    if (!inserts.length) {
      console.log("Ya tenia todos los huevos dropeables. Nada que agregar.");
      await client.query("ROLLBACK");
      return;
    }

    const values: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    for (const row of inserts) {
      values.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
      params.push(character.id, row.slot, row.itemId, 1, 0);
    }

    await client.query(
      `INSERT INTO character_items (character_id, id_pos, id_item, cant, equipped)
       VALUES ${values.join(", ")}`,
      params,
    );

    await client.query("COMMIT");
    console.log(
      "Agregados:",
      inserts.map((row) => `slot ${row.slot} -> item ${row.itemId}`).join(", "),
    );
    console.log("Nota: doble click / usar sobre el huevo para eclosionarlo.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
