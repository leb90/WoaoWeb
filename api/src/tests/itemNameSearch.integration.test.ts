import assert from "node:assert/strict";
import { beforeAll, test } from "vitest";
import pool from "../db";
import {
    createAuctionListing,
    listAuctionHouseState,
} from "../repositories/auctionHouse";
import {
    createMarketListing,
    listMarketListings,
} from "../repositories/market";
import { createCharacterFixture, ensureApiReady } from "./helpers/api";

beforeAll(async () => {
    assert.match(new URL(process.env.DATABASE_URL!).pathname, /_test$/);
    await ensureApiReady();
});

test("subastas y mercado encuentran el objeto por su nombre, además de vendedor e ID", async () => {
    const itemId = 1;
    const { rows } = await pool.query<{ name: string }>(
        "SELECT name FROM game_objects WHERE id = $1",
        [itemId],
    );
    const search = rows[0].name;
    const seller = await createCharacterFixture({
        namePrefix: "Busqueda",
        gold: 1000,
        items: [{ idPos: 1, idItem: itemId, cant: 4, equipped: false }],
    });
    const auction = await createAuctionListing({
        sellerCharacterId: seller.id,
        sellerName: seller.name,
        itemId,
        quantity: 1,
        startPrice: 100,
        buyoutPrice: 150,
        durationHours: 1,
        characterItems: [
            { idPos: 1, idItem: itemId, cant: 3, equipped: false },
        ],
    });
    const market = await createMarketListing({
        sellerCharacterId: seller.id,
        sellerName: seller.name,
        itemId,
        quantity: 1,
        price: 100,
        publicationFee: 0,
        durationHours: 1,
        characterGold: 1000,
        characterItems: [
            { idPos: 1, idItem: itemId, cant: 2, equipped: false, rarity: 0 },
        ],
    });
    const foundAuction = await listAuctionHouseState({
        search: search.toUpperCase(),
        pageSize: 50,
    });
    const foundMarket = await listMarketListings({
        search: search.toUpperCase(),
        limit: 100,
    });
    assert.ok(
        foundAuction.listings.some((row) => row.id === auction.listing.id),
    );
    assert.ok(foundMarket.listings.some((row) => row.id === market.listing.id));
    const bySeller = await listAuctionHouseState({ search: seller.name });
    assert.ok(bySeller.listings.some((row) => row.id === auction.listing.id));
});
