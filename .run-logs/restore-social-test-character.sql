BEGIN;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM characters c JOIN accounts a ON a.id = c.account_id
    WHERE c.id = 'c974657a-173c-4dad-9e45-d809848049b1'
      AND c.name = 'InvoAlpha' AND a.name = 'SummonGM' AND NOT c.connected
  ) THEN
    RAISE EXCEPTION 'El personaje de pruebas no coincide o sigue conectado';
  END IF;
END $$;
DELETE FROM character_items WHERE character_id = 'c974657a-173c-4dad-9e45-d809848049b1';
INSERT INTO character_items (character_id, id_pos, id_item, cant, equipped, rarity)
SELECT 'c974657a-173c-4dad-9e45-d809848049b1'::uuid, p, item, amount, FALSE, 0
FROM (VALUES (1,38,500),(2,37,500),(3,36,200),(4,39,200),(5,467,200),(6,468,200),(7,1211,50),(8,1212,50)) AS original(p,item,amount);
UPDATE characters
SET map_id=165, pos_x=18, pos_y=20, hp=363, max_hp=363, mana=2487, max_mana=2487,
    id_head=1, id_body=1, id_weapon=0, id_shield=0, id_helmet=0,
    id_last_head=1, id_last_body=1, id_last_weapon=0, id_last_shield=0, id_last_helmet=0,
    id_item_body=0, id_item_weapon=0, id_item_shield=0, id_item_helmet=0, id_item_arrow=0
WHERE id='c974657a-173c-4dad-9e45-d809848049b1';
COMMIT;
