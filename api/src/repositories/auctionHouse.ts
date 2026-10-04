import { z } from "zod";
import type { PoolClient } from "pg";
import pool from "../db";

const AUCTION_MAX_ACTIVE_LISTINGS_PER_CHARACTER = 3;
const AUCTION_MIN_DURATION_HOURS = 1;
const AUCTION_MAX_DURATION_HOURS = 48;
const AUCTION_MIN_BID_INCREMENT_PERCENT = 5;
const AUCTION_SALE_FEE_PERCENT = 0;

const characterItemSchema = z.object({
    idPos: z.coerce.number().int(),
    idItem: z.coerce.number().int().positive(),
    cant: z.coerce.number().int().positive(),
    equipped: z.union([z.boolean(), z.number().int()]).transform(Boolean),
});

const createAuctionSchema = z.object({
    sellerCharacterId: z.string().uuid(),
    sellerName: z.string().trim().min(1).max(50),
    itemId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
    startPrice: z.coerce.number().int().positive(),
    buyoutPrice: z.coerce.number().int().positive().nullable().optional(),
    durationHours: z.coerce.number().int().min(AUCTION_MIN_DURATION_HOURS).max(AUCTION_MAX_DURATION_HOURS),
    characterItems: z.array(characterItemSchema),
});

const listAuctionSchema = z.object({
    characterId: z.string().uuid().optional(),
    search: z.string().trim().max(80).optional(),
    category: z.string().trim().max(40).optional(),
    minLevel: z.coerce.number().int().min(1).max(255).optional(),
    maxLevel: z.coerce.number().int().min(1).max(255).optional(),
    buyoutOnly: z.union([z.boolean(), z.string(), z.number().int()]).transform((value) => value === true || value === "true" || value === 1).optional(),
    page: z.coerce.number().int().min(1).max(10000).optional(),
    pageSize: z.coerce.number().int().min(1).max(50).optional(),
});

const auctionBidSchema = z.object({
    bidderCharacterId: z.string().uuid(),
    bidderName: z.string().trim().min(1).max(50),
    auctionId: z.string().uuid(),
    amount: z.coerce.number().int().positive(),
    characterGold: z.coerce.number().int().min(0),
});

const auctionBuyoutSchema = z.object({
    buyerCharacterId: z.string().uuid(),
    buyerName: z.string().trim().min(1).max(50),
    auctionId: z.string().uuid(),
    characterGold: z.coerce.number().int().min(0),
});

const cancelAuctionSchema = z.object({
    sellerCharacterId: z.string().uuid(),
    auctionId: z.string().uuid(),
});

const claimAuctionSchema = z.object({
    characterId: z.string().uuid(),
    claimId: z.string().uuid(),
    characterGold: z.coerce.number().int().min(0),
    characterItems: z.array(characterItemSchema),
});

export type AuctionListingRecord = {
    id: string;
    auctionType: "ITEM" | "MOUNT";
    sellerCharacterId: string;
    sellerName: string;
    itemId: number | null;
    quantity: number;
    startPrice: number;
    buyoutPrice: number | null;
    currentBidAmount: number | null;
    currentBidderCharacterId: string | null;
    currentBidderName: string | null;
    startsAt: string;
    endsAt: string;
    status: "ACTIVE" | "SOLD_BY_BID" | "SOLD_BY_BUYOUT" | "EXPIRED" | "CANCELLED";
    version: number;
    createdAt: string;
};

export type AuctionClaimRecord = {
    id: string;
    characterId: string;
    auctionId: string | null;
    claimType: "ITEM_WON" | "ITEM_RETURN" | "GOLD_SALE";
    assetType: "ITEM" | "MOUNT" | "GOLD";
    itemId: number | null;
    quantity: number | null;
    goldAmount: number;
    status: "PENDING" | "CLAIMED";
    createdAt: string;
    claimedAt: string | null;
};

export type AuctionMailRecord = {
    id: string;
    recipientCharacterId: string;
    category: "AUCTION_SOLD" | "AUCTION_EXPIRED" | "AUCTION_WON" | "AUCTION_OUTBID" | "AUCTION_BID_RECEIVED" | "SYSTEM";
    subject: string;
    body: string;
    claimId: string | null;
    createdAt: string;
    readAt: string | null;
    deletedAt: string | null;
};

export type AuctionHouseStateRecord = {
    listings: AuctionListingRecord[];
    myAuctions: AuctionListingRecord[];
    myBids: AuctionListingRecord[];
    claims: AuctionClaimRecord[];
    mails: AuctionMailRecord[];
    totalListings: number;
    unreadMailCount: number;
    config: {
        minDurationHours: number;
        maxDurationHours: number;
        minBidIncrementPercent: number;
        saleFeePercent: number;
        maxActiveListingsPerCharacter: number;
    };
};

function ensureUniqueCharacterSlots(items: z.infer<typeof characterItemSchema>[]) {
    const seen = new Set<number>();
    for (const item of items) {
        if (seen.has(item.idPos)) {
            throw new Error("characterItems contiene slots repetidos");
        }
        seen.add(item.idPos);
    }
}

async function ensureCharacterExists(client: PoolClient, characterId: string) {
    const result = await client.query(
        "SELECT id FROM characters WHERE id = $1 AND deleted_at IS NULL LIMIT 1",
        [characterId],
    );
    if (!result.rowCount) {
        throw new Error("Personaje invalido");
    }
}

async function replaceCharacterItems(client: PoolClient, characterId: string, items: z.infer<typeof characterItemSchema>[]) {
    const currentResult = await client.query<{ id_pos: number }>(
        "SELECT id_pos FROM character_items WHERE character_id = $1",
        [characterId],
    );
    const nextSlots = new Set(items.map((item) => item.idPos));
    const deletedSlots = currentResult.rows
        .map((row) => row.id_pos)
        .filter((slot) => !nextSlots.has(slot));

    if (deletedSlots.length > 0) {
        await client.query(
            "DELETE FROM character_items WHERE character_id = $1 AND id_pos = ANY($2::int[])",
            [characterId, deletedSlots],
        );
    }

    if (!items.length) {
        return;
    }

    const values: Array<string | number | boolean> = [];
    const placeholders = items.map((item, index) => {
        const offset = index * 5;
        values.push(characterId, item.idPos, item.idItem, item.cant, item.equipped);
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    });

    await client.query(
        `
            INSERT INTO character_items (character_id, id_pos, id_item, cant, equipped)
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (character_id, id_pos)
            DO UPDATE SET id_item = EXCLUDED.id_item,
                          cant = EXCLUDED.cant,
                          equipped = EXCLUDED.equipped
        `,
        values,
    );
}

function calculateMinimumBid(listing: Pick<AuctionListingRecord, "startPrice" | "currentBidAmount">) {
    const current = listing.currentBidAmount ?? 0;
    if (current <= 0) {
        return listing.startPrice;
    }
    return current + Math.max(1, Math.ceil((current * AUCTION_MIN_BID_INCREMENT_PERCENT) / 100));
}

function mapListing(row: any): AuctionListingRecord {
    return {
        id: row.id,
        auctionType: row.auction_type,
        sellerCharacterId: row.seller_character_id,
        sellerName: row.seller_name,
        itemId: row.item_id,
        quantity: Number(row.quantity),
        startPrice: Number(row.start_price),
        buyoutPrice: row.buyout_price == null ? null : Number(row.buyout_price),
        currentBidAmount: row.current_bid_amount == null ? null : Number(row.current_bid_amount),
        currentBidderCharacterId: row.current_bidder_character_id,
        currentBidderName: row.current_bidder_name,
        startsAt: row.starts_at.toISOString(),
        endsAt: row.ends_at.toISOString(),
        status: row.status,
        version: Number(row.version),
        createdAt: row.created_at.toISOString(),
    };
}

function mapClaim(row: any): AuctionClaimRecord {
    return {
        id: row.id,
        characterId: row.character_id,
        auctionId: row.auction_id,
        claimType: row.claim_type,
        assetType: row.asset_type,
        itemId: row.item_id,
        quantity: row.quantity == null ? null : Number(row.quantity),
        goldAmount: Number(row.gold_amount ?? 0),
        status: row.status,
        createdAt: row.created_at.toISOString(),
        claimedAt: row.claimed_at ? row.claimed_at.toISOString() : null,
    };
}

function mapMail(row: any): AuctionMailRecord {
    return {
        id: row.id,
        recipientCharacterId: row.recipient_character_id,
        category: row.category,
        subject: row.subject,
        body: row.body,
        claimId: row.claim_id,
        createdAt: row.created_at.toISOString(),
        readAt: row.read_at ? row.read_at.toISOString() : null,
        deletedAt: row.deleted_at ? row.deleted_at.toISOString() : null,
    };
}

async function createMail(
    client: PoolClient,
    recipientCharacterId: string,
    category: AuctionMailRecord["category"],
    subject: string,
    body: string,
    claimId?: string | null,
) {
    await client.query(
        `
            INSERT INTO auction_mail (recipient_character_id, category, subject, body, claim_id)
            VALUES ($1, $2, $3, $4, $5)
        `,
        [recipientCharacterId, category, subject, body, claimId ?? null],
    );
}

async function createItemClaim(
    client: PoolClient,
    characterId: string,
    auction: AuctionListingRecord,
    claimType: "ITEM_WON" | "ITEM_RETURN",
) {
    const result = await client.query<{ id: string }>(
        `
            INSERT INTO auction_claims (
                character_id, auction_id, claim_type, asset_type, item_id, quantity, asset_payload
            )
            VALUES ($1, $2, $3, 'ITEM', $4, $5, '{}'::jsonb)
            RETURNING id
        `,
        [characterId, auction.id, claimType, auction.itemId, auction.quantity],
    );
    return result.rows[0].id;
}

async function createGoldClaim(client: PoolClient, characterId: string, auction: AuctionListingRecord, amount: number) {
    const result = await client.query<{ id: string }>(
        `
            INSERT INTO auction_claims (
                character_id, auction_id, claim_type, asset_type, gold_amount
            )
            VALUES ($1, $2, 'GOLD_SALE', 'GOLD', $3)
            RETURNING id
        `,
        [characterId, auction.id, Math.max(0, Math.floor(amount))],
    );
    return result.rows[0].id;
}

async function settleExpiredAuctions(client: PoolClient) {
    const expiredResult = await client.query(
        `
            SELECT *
            FROM auction_listings
            WHERE status = 'ACTIVE'
              AND ends_at <= NOW()
            FOR UPDATE SKIP LOCKED
        `,
    );

    for (const rawAuction of expiredResult.rows) {
        const auction = mapListing(rawAuction);
        if (auction.currentBidderCharacterId && auction.currentBidAmount) {
            await client.query(
                `
                    UPDATE auction_listings
                    SET status = 'SOLD_BY_BID',
                        resolved_at = NOW(),
                        updated_at = NOW(),
                        version = version + 1
                    WHERE id = $1
                `,
                [auction.id],
            );
            const itemClaimId = await createItemClaim(client, auction.currentBidderCharacterId, auction, "ITEM_WON");
            const sellerGold = Math.max(0, Math.floor(auction.currentBidAmount * (100 - AUCTION_SALE_FEE_PERCENT) / 100));
            const goldClaimId = await createGoldClaim(client, auction.sellerCharacterId, auction, sellerGold);
            await createMail(client, auction.currentBidderCharacterId, "AUCTION_WON", "Subasta ganada", `Has ganado ${auction.quantity} item(s) por ${auction.currentBidAmount} oro.`, itemClaimId);
            await createMail(client, auction.sellerCharacterId, "AUCTION_SOLD", "Subasta vendida", `Tu subasta se vendio por ${auction.currentBidAmount} oro.`, goldClaimId);
        } else {
            await client.query(
                `
                    UPDATE auction_listings
                    SET status = 'EXPIRED',
                        resolved_at = NOW(),
                        updated_at = NOW(),
                        version = version + 1
                    WHERE id = $1
                `,
                [auction.id],
            );
            const claimId = await createItemClaim(client, auction.sellerCharacterId, auction, "ITEM_RETURN");
            await createMail(client, auction.sellerCharacterId, "AUCTION_EXPIRED", "Subasta finalizada sin ventas", "Tu item no recibio ofertas.", claimId);
        }
    }
}

export async function listAuctionHouseState(input: z.input<typeof listAuctionSchema>): Promise<AuctionHouseStateRecord> {
    const parsed = listAuctionSchema.parse(input);
    const page = parsed.page ?? 1;
    const pageSize = parsed.pageSize ?? 20;
    const offset = (page - 1) * pageSize;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await settleExpiredAuctions(client);

        const values: Array<string | number | boolean> = ["ACTIVE"];
        const where = ["status = $1"];
        if (parsed.buyoutOnly) {
            where.push("buyout_price IS NOT NULL");
        }
        if (parsed.search) {
            values.push(`%${parsed.search.toLowerCase()}%`);
            where.push(`(LOWER(seller_name) LIKE $${values.length} OR item_id::text LIKE $${values.length})`);
        }

        const whereSql = `WHERE ${where.join(" AND ")}`;
        const totalResult = await client.query<{ count: string }>(
            `SELECT COUNT(*)::text AS count FROM auction_listings ${whereSql}`,
            values,
        );
        values.push(pageSize, offset);
        const listingsResult = await client.query(
            `
                SELECT *
                FROM auction_listings
                ${whereSql}
                ORDER BY ends_at ASC, created_at DESC
                LIMIT $${values.length - 1}
                OFFSET $${values.length}
            `,
            values,
        );

        let myAuctions: AuctionListingRecord[] = [];
        let myBids: AuctionListingRecord[] = [];
        let claims: AuctionClaimRecord[] = [];
        let mails: AuctionMailRecord[] = [];
        let unreadMailCount = 0;

        if (parsed.characterId) {
            const [myAuctionsResult, myBidsResult, claimsResult, mailsResult, unreadResult] = await Promise.all([
                client.query("SELECT * FROM auction_listings WHERE seller_character_id = $1 ORDER BY created_at DESC LIMIT 100", [parsed.characterId]),
                client.query(
                    `
                        SELECT DISTINCT ON (al.id) al.*
                        FROM auction_bids ab
                        INNER JOIN auction_listings al ON al.id = ab.auction_id
                        WHERE ab.bidder_character_id = $1
                        ORDER BY al.id, ab.created_at DESC
                        LIMIT 100
                    `,
                    [parsed.characterId],
                ),
                client.query("SELECT * FROM auction_claims WHERE character_id = $1 AND status = 'PENDING' ORDER BY created_at ASC", [parsed.characterId]),
                client.query("SELECT * FROM auction_mail WHERE recipient_character_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 100", [parsed.characterId]),
                client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM auction_mail WHERE recipient_character_id = $1 AND read_at IS NULL AND deleted_at IS NULL", [parsed.characterId]),
            ]);
            myAuctions = myAuctionsResult.rows.map(mapListing);
            myBids = myBidsResult.rows.map(mapListing);
            claims = claimsResult.rows.map(mapClaim);
            mails = mailsResult.rows.map(mapMail);
            unreadMailCount = Number(unreadResult.rows[0]?.count ?? 0);
        }

        await client.query("COMMIT");
        return {
            listings: listingsResult.rows.map(mapListing),
            myAuctions,
            myBids,
            claims,
            mails,
            totalListings: Number(totalResult.rows[0]?.count ?? 0),
            unreadMailCount,
            config: {
                minDurationHours: AUCTION_MIN_DURATION_HOURS,
                maxDurationHours: AUCTION_MAX_DURATION_HOURS,
                minBidIncrementPercent: AUCTION_MIN_BID_INCREMENT_PERCENT,
                saleFeePercent: AUCTION_SALE_FEE_PERCENT,
                maxActiveListingsPerCharacter: AUCTION_MAX_ACTIVE_LISTINGS_PER_CHARACTER,
            },
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function createAuctionListing(payload: z.input<typeof createAuctionSchema>) {
    const parsed = createAuctionSchema.parse(payload);
    ensureUniqueCharacterSlots(parsed.characterItems);
    if (parsed.buyoutPrice != null && parsed.buyoutPrice < parsed.startPrice) {
        throw new Error("La compra directa debe ser mayor o igual al precio inicial.");
    }
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await ensureCharacterExists(client, parsed.sellerCharacterId);
        await settleExpiredAuctions(client);
        const countResult = await client.query<{ count: string }>(
            "SELECT COUNT(*)::text AS count FROM auction_listings WHERE seller_character_id = $1 AND status = 'ACTIVE'",
            [parsed.sellerCharacterId],
        );
        if (Number(countResult.rows[0]?.count ?? 0) >= AUCTION_MAX_ACTIVE_LISTINGS_PER_CHARACTER) {
            throw new Error(`Ya tenes ${AUCTION_MAX_ACTIVE_LISTINGS_PER_CHARACTER} subastas activas.`);
        }
        await replaceCharacterItems(client, parsed.sellerCharacterId, parsed.characterItems);
        const result = await client.query(
            `
                INSERT INTO auction_listings (
                    auction_type, seller_character_id, seller_name, item_id, quantity,
                    start_price, buyout_price, ends_at, asset_payload
                )
                VALUES ('ITEM', $1, $2, $3, $4, $5, $6, NOW() + ($7::text || ' hours')::interval, '{}'::jsonb)
                RETURNING *
            `,
            [
                parsed.sellerCharacterId,
                parsed.sellerName,
                parsed.itemId,
                parsed.quantity,
                parsed.startPrice,
                parsed.buyoutPrice ?? null,
                parsed.durationHours,
            ],
        );
        await client.query("COMMIT");
        return { listing: mapListing(result.rows[0]) };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function placeAuctionBid(payload: z.input<typeof auctionBidSchema>) {
    const parsed = auctionBidSchema.parse(payload);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await ensureCharacterExists(client, parsed.bidderCharacterId);
        await settleExpiredAuctions(client);
        const result = await client.query("SELECT * FROM auction_listings WHERE id = $1 FOR UPDATE", [parsed.auctionId]);
        const auction = result.rows[0] ? mapListing(result.rows[0]) : null;
        if (!auction) throw new Error("La subasta no existe.");
        if (auction.status !== "ACTIVE" || new Date(auction.endsAt).getTime() <= Date.now()) throw new Error("La subasta ya no esta activa.");
        if (auction.sellerCharacterId === parsed.bidderCharacterId) throw new Error("No puedes ofertar tu propia subasta.");
        const minimumBid = calculateMinimumBid(auction);
        if (parsed.amount < minimumBid) throw new Error(`La oferta minima es ${minimumBid} oro.`);
        const previousBidderId = auction.currentBidderCharacterId;
        const previousBidAmount = auction.currentBidAmount ?? 0;
        const sameBidder = previousBidderId === parsed.bidderCharacterId;
        const extraRequired = sameBidder ? parsed.amount - previousBidAmount : parsed.amount;
        if (extraRequired <= 0) throw new Error("La nueva oferta debe superar tu oferta anterior.");
        if (parsed.characterGold < 0) throw new Error("No tienes oro suficiente.");
        if (previousBidderId && !sameBidder && previousBidAmount > 0) {
            await client.query("UPDATE characters SET gold = gold + $2, updated_at = NOW() WHERE id = $1", [previousBidderId, previousBidAmount]);
            await createMail(client, previousBidderId, "AUCTION_OUTBID", "Oferta superada", "Otro jugador ha superado tu oferta.", null);
        }
        await client.query("UPDATE characters SET gold = $2, updated_at = NOW() WHERE id = $1", [parsed.bidderCharacterId, parsed.characterGold]);
        await client.query("INSERT INTO auction_bids (auction_id, bidder_character_id, bidder_name, amount) VALUES ($1, $2, $3, $4)", [auction.id, parsed.bidderCharacterId, parsed.bidderName, parsed.amount]);
        await client.query(
            `
                UPDATE auction_listings
                SET current_bid_amount = $2,
                    current_bidder_character_id = $3,
                    current_bidder_name = $4,
                    updated_at = NOW(),
                    version = version + 1
                WHERE id = $1
            `,
            [auction.id, parsed.amount, parsed.bidderCharacterId, parsed.bidderName],
        );
        await createMail(client, auction.sellerCharacterId, "AUCTION_BID_RECEIVED", "Nueva oferta recibida", `Tu subasta recibio una oferta de ${parsed.amount} oro.`, null);
        await client.query("COMMIT");
        return { previousBidderId, previousBidAmount, sameBidder };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function buyoutAuction(payload: z.input<typeof auctionBuyoutSchema>) {
    const parsed = auctionBuyoutSchema.parse(payload);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await ensureCharacterExists(client, parsed.buyerCharacterId);
        await settleExpiredAuctions(client);
        const result = await client.query("SELECT * FROM auction_listings WHERE id = $1 FOR UPDATE", [parsed.auctionId]);
        const auction = result.rows[0] ? mapListing(result.rows[0]) : null;
        if (!auction) throw new Error("La subasta no existe.");
        if (auction.status !== "ACTIVE") throw new Error("La subasta ya no esta activa.");
        if (!auction.buyoutPrice) throw new Error("Esta subasta no tiene compra directa.");
        if (auction.sellerCharacterId === parsed.buyerCharacterId) throw new Error("No puedes comprar tu propia subasta.");
        if (parsed.characterGold < 0) throw new Error("No tienes oro suficiente.");
        if (auction.currentBidderCharacterId && auction.currentBidAmount) {
            await client.query("UPDATE characters SET gold = gold + $2, updated_at = NOW() WHERE id = $1", [auction.currentBidderCharacterId, auction.currentBidAmount]);
            if (auction.currentBidderCharacterId !== parsed.buyerCharacterId) {
                await createMail(client, auction.currentBidderCharacterId, "AUCTION_OUTBID", "Oferta superada", "La subasta fue comprada por compra directa.", null);
            }
        }
        await client.query("UPDATE characters SET gold = $2, updated_at = NOW() WHERE id = $1", [parsed.buyerCharacterId, parsed.characterGold]);
        await client.query(
            "UPDATE auction_listings SET status = 'SOLD_BY_BUYOUT', current_bid_amount = $2, current_bidder_character_id = $3, current_bidder_name = $4, resolved_at = NOW(), updated_at = NOW(), version = version + 1 WHERE id = $1",
            [auction.id, auction.buyoutPrice, parsed.buyerCharacterId, parsed.buyerName],
        );
        const soldAuction = { ...auction, currentBidAmount: auction.buyoutPrice, currentBidderCharacterId: parsed.buyerCharacterId };
        const itemClaimId = await createItemClaim(client, parsed.buyerCharacterId, soldAuction, "ITEM_WON");
        const sellerGold = Math.max(0, Math.floor(auction.buyoutPrice * (100 - AUCTION_SALE_FEE_PERCENT) / 100));
        const goldClaimId = await createGoldClaim(client, auction.sellerCharacterId, soldAuction, sellerGold);
        await createMail(client, parsed.buyerCharacterId, "AUCTION_WON", "Subasta ganada", `Has comprado el item por ${auction.buyoutPrice} oro.`, itemClaimId);
        await createMail(client, auction.sellerCharacterId, "AUCTION_SOLD", "Subasta vendida", `Tu subasta se vendio por ${auction.buyoutPrice} oro.`, goldClaimId);
        await client.query("COMMIT");
        return { previousBidderId: auction.currentBidderCharacterId, previousBidAmount: auction.currentBidAmount ?? 0 };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function cancelAuctionListing(payload: z.input<typeof cancelAuctionSchema>) {
    cancelAuctionSchema.parse(payload);
    throw new Error("Las subastas publicadas no se pueden cancelar.");
}

export async function claimAuctionReward(payload: z.input<typeof claimAuctionSchema>) {
    const parsed = claimAuctionSchema.parse(payload);
    ensureUniqueCharacterSlots(parsed.characterItems);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await ensureCharacterExists(client, parsed.characterId);
        await settleExpiredAuctions(client);
        const claimResult = await client.query("SELECT * FROM auction_claims WHERE id = $1 FOR UPDATE", [parsed.claimId]);
        const claim = claimResult.rows[0] ? mapClaim(claimResult.rows[0]) : null;
        if (!claim) throw new Error("El reclamo no existe.");
        if (claim.characterId !== parsed.characterId) throw new Error("No puedes reclamar una recompensa ajena.");
        if (claim.status !== "PENDING") throw new Error("Esta recompensa ya fue reclamada.");
        if (claim.claimType === "GOLD_SALE") {
            await client.query("UPDATE characters SET gold = $2, updated_at = NOW() WHERE id = $1", [parsed.characterId, parsed.characterGold]);
        } else {
            await replaceCharacterItems(client, parsed.characterId, parsed.characterItems);
        }
        await client.query("UPDATE auction_claims SET status = 'CLAIMED', claimed_at = NOW() WHERE id = $1", [claim.id]);
        await client.query("UPDATE auction_mail SET read_at = COALESCE(read_at, NOW()) WHERE claim_id = $1", [claim.id]);
        await client.query("COMMIT");
        return { claim };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function markAuctionMailRead(characterId: string, mailId: string) {
    const parsedCharacterId = z.string().uuid().parse(characterId);
    const parsedMailId = z.string().uuid().parse(mailId);
    await pool.query(
        "UPDATE auction_mail SET read_at = COALESCE(read_at, NOW()) WHERE id = $1 AND recipient_character_id = $2",
        [parsedMailId, parsedCharacterId],
    );
    return { ok: true };
}
