CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_sanitized TEXT,
    password TEXT,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    id_clase INTEGER NOT NULL DEFAULT 0,
    map_id INTEGER NOT NULL DEFAULT 1,
    pos_x INTEGER NOT NULL DEFAULT 50,
    pos_y INTEGER NOT NULL DEFAULT 50,
    gold INTEGER NOT NULL DEFAULT 0,
    id_head INTEGER NOT NULL DEFAULT 0,
    id_last_head INTEGER NOT NULL DEFAULT 0,
    id_last_body INTEGER NOT NULL DEFAULT 0,
    id_last_helmet INTEGER NOT NULL DEFAULT 0,
    id_last_weapon INTEGER NOT NULL DEFAULT 0,
    id_last_shield INTEGER NOT NULL DEFAULT 0,
    id_helmet INTEGER NOT NULL DEFAULT 0,
    id_weapon INTEGER NOT NULL DEFAULT 0,
    id_shield INTEGER NOT NULL DEFAULT 0,
    id_body INTEGER NOT NULL DEFAULT 0,
    id_item_weapon INTEGER NOT NULL DEFAULT 0,
    id_item_body INTEGER NOT NULL DEFAULT 0,
    id_item_shield INTEGER NOT NULL DEFAULT 0,
    id_item_helmet INTEGER NOT NULL DEFAULT 0,
    id_item_arrow INTEGER NOT NULL DEFAULT 0,
    spells_acertados INTEGER NOT NULL DEFAULT 0,
    spells_errados INTEGER NOT NULL DEFAULT 0,
    hp INTEGER NOT NULL DEFAULT 0,
    max_hp INTEGER NOT NULL DEFAULT 0,
    mana INTEGER NOT NULL DEFAULT 0,
    max_mana INTEGER NOT NULL DEFAULT 0,
    id_raza INTEGER NOT NULL DEFAULT 0,
    id_genero INTEGER NOT NULL DEFAULT 0,
    muerto BOOLEAN NOT NULL DEFAULT FALSE,
    min_hit INTEGER NOT NULL DEFAULT 0,
    max_hit INTEGER NOT NULL DEFAULT 0,
    attr_fuerza INTEGER NOT NULL DEFAULT 0,
    attr_agilidad INTEGER NOT NULL DEFAULT 0,
    attr_inteligencia INTEGER NOT NULL DEFAULT 0,
    attr_constitucion INTEGER NOT NULL DEFAULT 0,
    privileges INTEGER NOT NULL DEFAULT 0,
    count_killed INTEGER NOT NULL DEFAULT 0,
    count_die INTEGER NOT NULL DEFAULT 0,
    exp INTEGER NOT NULL DEFAULT 0,
    exp_next_level INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0,
    banned TIMESTAMPTZ,
    ip TEXT,
    dead BOOLEAN NOT NULL DEFAULT FALSE,
    criminal BOOLEAN NOT NULL DEFAULT FALSE,
    faction TEXT NOT NULL DEFAULT 'none' CHECK (faction IN ('none', 'armada', 'caos')),
    navegando BOOLEAN NOT NULL DEFAULT FALSE,
    npc_matados INTEGER NOT NULL DEFAULT 0,
    ciudadanos_matados INTEGER NOT NULL DEFAULT 0,
    criminales_matados INTEGER NOT NULL DEFAULT 0,
    fianza INTEGER NOT NULL DEFAULT 0,
    home_map INTEGER NOT NULL DEFAULT 1,
    home_x INTEGER NOT NULL DEFAULT 54,
    home_y INTEGER NOT NULL DEFAULT 60,
    faction_score_armada INTEGER NOT NULL DEFAULT 0,
    faction_score_caos INTEGER NOT NULL DEFAULT 0,
    faction_rank_armada INTEGER NOT NULL DEFAULT 0,
    faction_rank_caos INTEGER NOT NULL DEFAULT 0,
    faction_rewards_armada INTEGER NOT NULL DEFAULT 0,
    faction_rewards_caos INTEGER NOT NULL DEFAULT 0,
    connected BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_normalized TEXT NOT NULL UNIQUE,
    leader_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE RESTRICT,
    alignment TEXT NOT NULL CHECK (alignment IN ('citizen', 'criminal')),
    min_join_level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clans
    DROP CONSTRAINT IF EXISTS clans_alignment_check;

UPDATE clans cl
SET alignment = CASE
    WHEN leader.faction = 'caos' OR (COALESCE(leader.criminal, FALSE) = TRUE AND COALESCE(leader.faction, 'none') = 'none') THEN 'criminal'
    ELSE 'citizen'
END,
updated_at = NOW()
FROM characters leader
WHERE leader.id = cl.leader_character_id
  AND cl.alignment NOT IN ('citizen', 'criminal');

WITH incompatible_members AS (
    SELECT cm.clan_id, cm.character_id
    FROM clan_members cm
    JOIN clans cl ON cl.id = cm.clan_id
    JOIN characters c ON c.id = cm.character_id
    WHERE NOT (
        (cl.alignment = 'citizen' AND (COALESCE(c.faction, 'none') = 'armada' OR (COALESCE(c.criminal, FALSE) = FALSE AND COALESCE(c.faction, 'none') = 'none')))
        OR
        (cl.alignment = 'criminal' AND (COALESCE(c.faction, 'none') = 'caos' OR (COALESCE(c.criminal, FALSE) = TRUE AND COALESCE(c.faction, 'none') = 'none')))
    )
)
UPDATE characters c
SET clan_id = NULL,
    updated_at = NOW()
FROM incompatible_members im
WHERE c.id = im.character_id;

WITH incompatible_members AS (
    SELECT cm.clan_id, cm.character_id
    FROM clan_members cm
    JOIN clans cl ON cl.id = cm.clan_id
    JOIN characters c ON c.id = cm.character_id
    WHERE NOT (
        (cl.alignment = 'citizen' AND (COALESCE(c.faction, 'none') = 'armada' OR (COALESCE(c.criminal, FALSE) = FALSE AND COALESCE(c.faction, 'none') = 'none')))
        OR
        (cl.alignment = 'criminal' AND (COALESCE(c.faction, 'none') = 'caos' OR (COALESCE(c.criminal, FALSE) = TRUE AND COALESCE(c.faction, 'none') = 'none')))
    )
)
DELETE FROM clan_members cm
USING incompatible_members im
WHERE cm.clan_id = im.clan_id
  AND cm.character_id = im.character_id;

ALTER TABLE clans
    ADD CONSTRAINT clans_alignment_check
    CHECK (alignment IN ('citizen', 'criminal'));

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS clan_id UUID REFERENCES clans(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS clan_members (
    clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'co_leader', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (clan_id, character_id),
    UNIQUE (character_id)
);

ALTER TABLE clan_members
    DROP CONSTRAINT IF EXISTS clan_members_role_check;

ALTER TABLE clan_members
    ADD CONSTRAINT clan_members_role_check
    CHECK (role IN ('leader', 'co_leader', 'member'));

ALTER TABLE clans
    ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;

ALTER TABLE clan_members
    ADD COLUMN IF NOT EXISTS season_points_won INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS season_points_lost INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS lifetime_points_won INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS lifetime_points_lost INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS clan_point_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN ('CASTLE_REWARD', 'PVP_TRANSFER', 'ADMIN_ADJUSTMENT', 'SEASON_RESET')),
    clan_id UUID REFERENCES clans(id) ON DELETE SET NULL,
    opposing_clan_id UUID REFERENCES clans(id) ON DELETE SET NULL,
    killer_character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    victim_character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    castle_id TEXT,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    reason TEXT NOT NULL DEFAULT '',
    validation JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clan_pvp_pair_cooldowns (
    killer_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    victim_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    last_transfer_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (killer_character_id, victim_character_id)
);

CREATE TABLE IF NOT EXISTS clan_castle_states (
    castle_id TEXT PRIMARY KEY,
    owner_clan_id UUID REFERENCES clans(id) ON DELETE SET NULL,
    owner_clan_name TEXT NOT NULL DEFAULT '',
    captured_at TIMESTAMPTZ,
    next_reward_at TIMESTAMPTZ,
    points_per_reward INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO clan_castle_states (castle_id, points_per_reward)
VALUES
    ('norte', 3),
    ('sur', 3),
    ('este', 3),
    ('oeste', 3),
    ('fortaleza', 4)
ON CONFLICT (castle_id) DO UPDATE
SET points_per_reward = EXCLUDED.points_per_reward,
    updated_at = NOW();

CREATE TABLE IF NOT EXISTS clan_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    message TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (character_id)
);

CREATE INDEX IF NOT EXISTS idx_clans_leader_character_id ON clans(leader_character_id);
CREATE INDEX IF NOT EXISTS idx_characters_clan_id ON characters(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_clan_id ON clan_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_requests_clan_id ON clan_requests(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_point_events_clan_id ON clan_point_events(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_point_events_created_at ON clan_point_events(created_at);
CREATE INDEX IF NOT EXISTS idx_clan_point_events_event_type ON clan_point_events(event_type);
CREATE INDEX IF NOT EXISTS idx_clan_castle_states_owner_clan_id ON clan_castle_states(owner_clan_id);

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS jail_minutes INTEGER NOT NULL DEFAULT 0;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS jail_reason TEXT;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS ip_banned_until TIMESTAMPTZ;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS home_map INTEGER NOT NULL DEFAULT 1;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS home_x INTEGER NOT NULL DEFAULT 54;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS home_y INTEGER NOT NULL DEFAULT 60;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS faction TEXT NOT NULL DEFAULT 'none';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'characters_faction_check'
    ) THEN
        ALTER TABLE characters
            ADD CONSTRAINT characters_faction_check CHECK (faction IN ('none', 'armada', 'caos'));
    END IF;
END $$;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS faction_score_armada INTEGER NOT NULL DEFAULT 0;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS faction_score_caos INTEGER NOT NULL DEFAULT 0;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS faction_rank_armada INTEGER NOT NULL DEFAULT 0;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS faction_rank_caos INTEGER NOT NULL DEFAULT 0;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS faction_rewards_armada INTEGER NOT NULL DEFAULT 0;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS faction_rewards_caos INTEGER NOT NULL DEFAULT 0;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS skills JSONB;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS skill_pts INTEGER;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS faction_treachery INTEGER NOT NULL DEFAULT 0;

ALTER TABLE characters
    ALTER COLUMN gold TYPE INTEGER USING LEAST(GREATEST(gold, 0), 2147483647)::INTEGER;

CREATE TABLE IF NOT EXISTS character_items (
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    id_pos INTEGER NOT NULL,
    id_item INTEGER NOT NULL,
    cant INTEGER NOT NULL DEFAULT 0,
    equipped BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (character_id, id_pos)
);

CREATE TABLE IF NOT EXISTS character_bank_items (
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    id_pos INTEGER NOT NULL,
    id_item INTEGER NOT NULL,
    cant INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (character_id, id_pos)
);

CREATE TABLE IF NOT EXISTS account_vaults (
    account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    gold INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account_vault_items (
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    id_pos INTEGER NOT NULL,
    id_item INTEGER NOT NULL,
    cant INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (account_id, id_pos)
);

CREATE TABLE IF NOT EXISTS clan_vaults (
    clan_id UUID PRIMARY KEY REFERENCES clans(id) ON DELETE CASCADE,
    gold INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clan_vault_items (
    clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
    id_pos INTEGER NOT NULL,
    id_item INTEGER NOT NULL,
    cant INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (clan_id, id_pos)
);

CREATE TABLE IF NOT EXISTS character_spells (
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    id_pos INTEGER NOT NULL,
    id_spell INTEGER NOT NULL,
    PRIMARY KEY (character_id, id_pos)
);

CREATE TABLE IF NOT EXISTS character_crafting_recipes (
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL,
    learned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (character_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS character_settings (
    character_id UUID PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
    hotkeys JSONB NOT NULL DEFAULT '{}'::jsonb,
    macros JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    seller_name TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price INTEGER NOT NULL CHECK (price > 0),
    publication_fee INTEGER NOT NULL DEFAULT 0 CHECK (publication_fee >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'cancelled')),
    buyer_character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    buyer_name TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    claim_type TEXT NOT NULL CHECK (claim_type IN ('gold', 'item')),
    gold_amount INTEGER NOT NULL DEFAULT 0 CHECK (gold_amount >= 0),
    item_id INTEGER,
    item_quantity INTEGER,
    source_listing_id UUID REFERENCES market_listings(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (claim_type = 'gold' AND gold_amount > 0 AND item_id IS NULL AND item_quantity IS NULL)
        OR (claim_type = 'item' AND gold_amount = 0 AND item_id IS NOT NULL AND item_quantity IS NOT NULL AND item_quantity > 0)
    )
);

CREATE INDEX IF NOT EXISTS idx_market_listings_status_price_created
    ON market_listings(status, price ASC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_market_listings_active_price_created
    ON market_listings(price ASC, created_at ASC)
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_market_listings_item_status_price
    ON market_listings(item_id, status, price ASC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_market_listings_seller_status
    ON market_listings(seller_character_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_listings_seller_active_created
    ON market_listings(seller_character_id, created_at DESC)
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_market_listings_expires_at_active
    ON market_listings(expires_at)
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_market_claims_owner_created
    ON market_claims(owner_character_id, created_at ASC);

CREATE TABLE IF NOT EXISTS auction_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_type TEXT NOT NULL DEFAULT 'ITEM' CHECK (auction_type IN ('ITEM', 'MOUNT')),
    seller_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    seller_name TEXT NOT NULL,
    asset_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    item_id INTEGER,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    start_price INTEGER NOT NULL CHECK (start_price > 0),
    buyout_price INTEGER CHECK (buyout_price IS NULL OR buyout_price > 0),
    current_bid_amount INTEGER,
    current_bidder_character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    current_bidder_name TEXT,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SOLD_BY_BID', 'SOLD_BY_BUYOUT', 'EXPIRED', 'CANCELLED')),
    version INTEGER NOT NULL DEFAULT 1,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (auction_type = 'ITEM' AND item_id IS NOT NULL)
        OR (auction_type = 'MOUNT' AND item_id IS NULL)
    ),
    CHECK (buyout_price IS NULL OR buyout_price >= start_price),
    CHECK (
        (current_bid_amount IS NULL AND current_bidder_character_id IS NULL)
        OR (current_bid_amount IS NOT NULL AND current_bidder_character_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS auction_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auction_listings(id) ON DELETE CASCADE,
    bidder_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    bidder_name TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auction_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    auction_id UUID REFERENCES auction_listings(id) ON DELETE SET NULL,
    claim_type TEXT NOT NULL CHECK (claim_type IN ('ITEM_WON', 'ITEM_RETURN', 'GOLD_SALE')),
    asset_type TEXT NOT NULL DEFAULT 'ITEM' CHECK (asset_type IN ('ITEM', 'MOUNT', 'GOLD')),
    item_id INTEGER,
    quantity INTEGER,
    asset_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    gold_amount INTEGER NOT NULL DEFAULT 0 CHECK (gold_amount >= 0),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLAIMED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    CHECK (
        (claim_type IN ('ITEM_WON', 'ITEM_RETURN') AND asset_type = 'ITEM' AND item_id IS NOT NULL AND quantity IS NOT NULL AND quantity > 0 AND gold_amount = 0)
        OR (claim_type = 'GOLD_SALE' AND asset_type = 'GOLD' AND gold_amount > 0 AND item_id IS NULL AND quantity IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS auction_mail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('AUCTION_SOLD', 'AUCTION_EXPIRED', 'AUCTION_WON', 'AUCTION_OUTBID', 'AUCTION_BID_RECEIVED', 'SYSTEM')),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    claim_id UUID REFERENCES auction_claims(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_auction_listings_status_ends_at
    ON auction_listings(status, ends_at ASC);
CREATE INDEX IF NOT EXISTS idx_auction_listings_active_ends_at
    ON auction_listings(ends_at ASC)
    WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_auction_listings_item_status
    ON auction_listings(item_id, status, ends_at ASC);
CREATE INDEX IF NOT EXISTS idx_auction_listings_seller_status
    ON auction_listings(seller_character_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auction_listings_bidder_status
    ON auction_listings(current_bidder_character_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_auction_bids_bidder_created
    ON auction_bids(bidder_character_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auction_bids_auction_created
    ON auction_bids(auction_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auction_claims_character_status_created
    ON auction_claims(character_id, status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_auction_mail_recipient_created
    ON auction_mail(recipient_character_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS auth_sessions (
    token TEXT PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    selected_character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    requested_ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_hash TEXT NOT NULL,
    requested_ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_tickets (
    ticket TEXT PRIMARY KEY,
    auth_token TEXT NOT NULL REFERENCES auth_sessions(token) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'world',
    arena_room_id UUID,
    pvp_template_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS arena_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    password_hash TEXT,
    join_token TEXT NOT NULL UNIQUE,
    map_id INTEGER NOT NULL DEFAULT 272,
    capacity INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arena_room_members (
    room_id UUID NOT NULL REFERENCES arena_rooms(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    selected_pvp_template_id INTEGER,
    connected BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (room_id, account_id)
);

CREATE TABLE IF NOT EXISTS user_online_stats (
    sampled_minute TIMESTAMPTZ PRIMARY KEY,
    total_users INTEGER NOT NULL,
    pve_users INTEGER NOT NULL,
    pvp_users INTEGER NOT NULL,
    fishing_users INTEGER NOT NULL,
    mining_users INTEGER NOT NULL DEFAULT 0,
    woodcutting_users INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_online_stats
    ADD COLUMN IF NOT EXISTS mining_users INTEGER NOT NULL DEFAULT 0;

ALTER TABLE user_online_stats
    ADD COLUMN IF NOT EXISTS woodcutting_users INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS challenge_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id TEXT NOT NULL UNIQUE,
    team_size INTEGER NOT NULL CHECK (team_size IN (1, 2)),
    instance_map_id INTEGER NOT NULL,
    winner_side INTEGER NOT NULL CHECK (winner_side IN (1, 2)),
    finish_reason TEXT,
    team_one_score INTEGER NOT NULL DEFAULT 0 CHECK (team_one_score >= 0),
    team_two_score INTEGER NOT NULL DEFAULT 0 CHECK (team_two_score >= 0),
    participants JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS runtime_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_objects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    obj_type INTEGER NOT NULL,
    data JSONB NOT NULL,
    checksum TEXT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    updated_by_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_npcs (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    npc_type INTEGER NOT NULL,
    id_head INTEGER NOT NULL,
    id_body INTEGER NOT NULL,
    movement INTEGER NOT NULL,
    data JSONB NOT NULL,
    checksum TEXT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    updated_by_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_crafting_recipes (
    id INTEGER PRIMARY KEY,
    profession TEXT NOT NULL,
    category TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    skill INTEGER NOT NULL,
    data JSONB NOT NULL,
    checksum TEXT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    updated_by_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS character_crafting_recipes (
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES game_crafting_recipes(id) ON DELETE CASCADE,
    learned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (character_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_character_crafting_recipes_recipe_id
    ON character_crafting_recipes(recipe_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'character_crafting_recipes_recipe_id_fkey'
    ) THEN
        ALTER TABLE character_crafting_recipes
            ADD CONSTRAINT character_crafting_recipes_recipe_id_fkey
            FOREIGN KEY (recipe_id) REFERENCES game_crafting_recipes(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS game_smelting_recipes (
    id INTEGER PRIMARY KEY,
    mineral_item_id INTEGER NOT NULL,
    ingot_item_id INTEGER NOT NULL,
    required_skill INTEGER NOT NULL,
    minerals_per_ingot INTEGER NOT NULL,
    data JSONB NOT NULL,
    checksum TEXT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    updated_by_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_balance (
    id INTEGER PRIMARY KEY,
    data JSONB NOT NULL,
    checksum TEXT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    updated_by_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_data_revisions (
    id BIGSERIAL PRIMARY KEY,
    kind TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('upsert')),
    checksum TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE game_data_revisions DROP CONSTRAINT IF EXISTS game_data_revisions_kind_check;
ALTER TABLE game_data_revisions
    ADD CONSTRAINT game_data_revisions_kind_check
    CHECK (kind IN ('objs', 'npcs', 'crafting_recipes', 'smelting_recipes', 'balance'));

CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_characters_account_id ON characters(account_id);
CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_name_active_unique
    ON characters (LOWER(BTRIM(name)))
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_characters_account_id_active
    ON characters(account_id)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_auth_sessions_account_id ON auth_sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_account_id ON password_reset_tokens(account_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_email_hash_created_at ON password_reset_requests(email_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_ip_created_at ON password_reset_requests(requested_ip, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_tickets_auth_token ON game_tickets(auth_token);
CREATE INDEX IF NOT EXISTS idx_game_tickets_expires_at ON game_tickets(expires_at);
CREATE INDEX IF NOT EXISTS idx_game_tickets_arena_room_id ON game_tickets(arena_room_id);
CREATE INDEX IF NOT EXISTS idx_arena_rooms_owner_account_id ON arena_rooms(owner_account_id);
CREATE INDEX IF NOT EXISTS idx_arena_rooms_is_public ON arena_rooms(is_public);
CREATE INDEX IF NOT EXISTS idx_arena_room_members_account_id ON arena_room_members(account_id);
CREATE INDEX IF NOT EXISTS idx_user_online_stats_created_at ON user_online_stats(created_at);
CREATE INDEX IF NOT EXISTS idx_game_objects_updated_at ON game_objects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_objects_obj_type ON game_objects(obj_type);
CREATE INDEX IF NOT EXISTS idx_game_objects_name_lower ON game_objects(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_game_npcs_updated_at ON game_npcs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_npcs_npc_type ON game_npcs(npc_type);
CREATE INDEX IF NOT EXISTS idx_game_npcs_name_lower ON game_npcs(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_game_crafting_recipes_updated_at ON game_crafting_recipes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_crafting_recipes_profession ON game_crafting_recipes(profession);
CREATE INDEX IF NOT EXISTS idx_game_crafting_recipes_item_id ON game_crafting_recipes(item_id);
CREATE INDEX IF NOT EXISTS idx_game_smelting_recipes_updated_at ON game_smelting_recipes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_smelting_recipes_mineral_item_id ON game_smelting_recipes(mineral_item_id);
CREATE INDEX IF NOT EXISTS idx_game_balance_updated_at ON game_balance(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_data_revisions_kind_id ON game_data_revisions(kind, id DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_history_finished_at ON challenge_history(finished_at DESC);

CREATE TABLE IF NOT EXISTS ranked_ratings (
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('RANKED_1V1', 'RANKED_2V2')),
    elo INTEGER NOT NULL DEFAULT 0 CHECK (elo >= 0),
    wins INTEGER NOT NULL DEFAULT 0 CHECK (wins >= 0),
    losses INTEGER NOT NULL DEFAULT 0 CHECK (losses >= 0),
    win_streak INTEGER NOT NULL DEFAULT 0 CHECK (win_streak >= 0),
    best_win_streak INTEGER NOT NULL DEFAULT 0 CHECK (best_win_streak >= 0),
    matches_played INTEGER NOT NULL DEFAULT 0 CHECK (matches_played >= 0),
    highest_elo INTEGER NOT NULL DEFAULT 0 CHECK (highest_elo >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (character_id, mode)
);

CREATE TABLE IF NOT EXISTS ranked_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mode TEXT NOT NULL CHECK (mode IN ('RANKED_1V1', 'RANKED_2V2')),
    arena_map_id INTEGER,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    team_a_elo_before INTEGER NOT NULL DEFAULT 0 CHECK (team_a_elo_before >= 0),
    team_b_elo_before INTEGER NOT NULL DEFAULT 0 CHECK (team_b_elo_before >= 0),
    team_a_elo_after INTEGER NOT NULL DEFAULT 0 CHECK (team_a_elo_after >= 0),
    team_b_elo_after INTEGER NOT NULL DEFAULT 0 CHECK (team_b_elo_after >= 0),
    winner_team TEXT CHECK (winner_team IN ('A', 'B')),
    score_a INTEGER NOT NULL DEFAULT 0 CHECK (score_a >= 0),
    score_b INTEGER NOT NULL DEFAULT 0 CHECK (score_b >= 0),
    status TEXT NOT NULL DEFAULT 'CREATED' CHECK (
        status IN (
            'CREATED',
            'RESERVING_ARENA',
            'PREPARING',
            'ROUND_COUNTDOWN',
            'ROUND_ACTIVE',
            'ROUND_END',
            'MATCH_END',
            'RETURNING_PLAYERS',
            'COMPLETED',
            'ABORTED'
        )
    ),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS ranked_match_participants (
    match_id UUID NOT NULL REFERENCES ranked_matches(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    team TEXT NOT NULL CHECK (team IN ('A', 'B')),
    elo_before INTEGER NOT NULL DEFAULT 0 CHECK (elo_before >= 0),
    elo_after INTEGER NOT NULL DEFAULT 0 CHECK (elo_after >= 0),
    elo_delta INTEGER NOT NULL DEFAULT 0,
    result TEXT NOT NULL DEFAULT 'pending' CHECK (result IN ('win', 'loss', 'draw', 'abandoned', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (match_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_ranked_ratings_mode_elo ON ranked_ratings(mode, elo DESC, wins DESC, character_id);
CREATE INDEX IF NOT EXISTS idx_ranked_matches_mode_started_at ON ranked_matches(mode, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ranked_matches_status ON ranked_matches(status);
CREATE INDEX IF NOT EXISTS idx_ranked_match_participants_character_id ON ranked_match_participants(character_id);

CREATE TABLE IF NOT EXISTS donation_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'nowpayments',
    provider_payment_id TEXT,
    order_id TEXT NOT NULL UNIQUE,
    package_id TEXT NOT NULL,
    price_amount NUMERIC NOT NULL,
    price_currency TEXT NOT NULL DEFAULT 'usd',
    pay_amount NUMERIC,
    pay_currency TEXT,
    points INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    credited BOOLEAN NOT NULL DEFAULT FALSE,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donation_payments_character_id ON donation_payments(character_id);
CREATE INDEX IF NOT EXISTS idx_donation_payments_order_id ON donation_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_donation_payments_provider_payment_id ON donation_payments(provider_payment_id);

-- Tickets del bot de soporte GM. No confundir con game_tickets (eso es el
-- handshake de login/conexion al juego, algo totalmente distinto).
CREATE TABLE IF NOT EXISTS gm_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    reporter_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    reporter_name TEXT NOT NULL,
    target_character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    target_name TEXT,
    message TEXT NOT NULL,
    context JSONB,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_gm_tickets_status_created_at ON gm_tickets(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gm_tickets_reporter_character_id ON gm_tickets(reporter_character_id);
CREATE INDEX IF NOT EXISTS idx_gm_tickets_target_character_id ON gm_tickets(target_character_id);
