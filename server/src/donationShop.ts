export {};

import { canAddToInventory } from "./equipmentStorage";

// Tienda de donaciones (estilo tienda de WoW): se paga con puntos de
// donación. El catálogo vive en server/jsons/tienda.json; la categoría
// "Objetos" se arma sola con server/jsons/donaciones.json, así ese catálogo
// sigue siendo uno solo.

const vars = require("./vars");
const balance = require("./balance");
const transmog = require("./transmog") as typeof import("./transmog");
const { getProgress, saveProgress } = require("./woaoProgress");

type ProductKind = "item" | "levelUp" | "customDesign";

type CatalogProduct = {
    id: string;
    category: string;
    subcategory?: string;
    kind: ProductKind;
    name?: string;
    desc?: string;
    price: number;
    objIndex?: number;
    amount?: number;
    levels?: number;
    maxLevel?: number;
    slot?: "casco" | "escudo" | "arma" | "cuerpo";
    featured?: boolean;
    badge?: string;
    setName?: string;
};

type CatalogCategory = { key: string; name: string; desc?: string };

type DonacionEntry = { id: number; name: string; objIndex: number; cost: number; desc?: string };

type ShopUser = {
    id: string | number;
    _id?: string;
    level: number;
    exp: number;
    expNextLevel: number;
    dead?: boolean | number;
    inv: Record<string, { idItem: number; cant: number }>;
    puntosDonacion?: number;
};

type PurchaseResult = { ok: boolean; message: string; productId?: string };

const tiendaJson = require("../jsons/tienda.json") as { categories: CatalogCategory[]; products: CatalogProduct[] };
const donaciones = require("../jsons/donaciones.json") as Record<string, DonacionEntry>;

const MAX_STACK = 10000;

function buildCatalog(): CatalogProduct[] {
    const products = tiendaJson.products.map((product) => ({ ...product }));

    for (const entry of Object.values(donaciones)) {
        products.push({
            id: `objeto-${entry.id}`,
            category: "objetos",
            kind: "item",
            name: entry.name,
            desc: entry.desc,
            price: Number(entry.cost),
            objIndex: Number(entry.objIndex),
            amount: 1,
        });
    }

    return products;
}

const catalog = buildCatalog();
const catalogById = new Map(catalog.map((product) => [product.id, product]));

function getGame() {
    return require("./game");
}

function getHandleProtocol() {
    return require("./handleProtocol");
}

function getSocket() {
    return require("./socket");
}

function getUser(idUser: string | number): ShopUser | null {
    return (vars.personajes?.[idUser] as ShopUser | undefined) ?? null;
}

/** El id de memoria del personaje conectado a partir de su id de la DB. */
export function findOnlineIdByCharacterId(characterId: string): string | null {
    if (vars.personajes?.[characterId]) {
        return characterId;
    }

    for (const [id, user] of Object.entries(vars.personajes ?? {}) as Array<[string, ShopUser | undefined]>) {
        if (user && String(user._id ?? "") === characterId) {
            return id;
        }
    }

    return null;
}

function tell(idUser: string | number, message: string, color = "#E69500") {
    const client = vars.clients?.[idUser];
    if (client) {
        getHandleProtocol().console(message, color, 1, 0, client);
    }
}

function refreshSnapshot(idUser: string | number) {
    const user = getUser(idUser);
    const client = vars.clients?.[idUser];
    if (!user || !client) {
        return;
    }

    getHandleProtocol().sendMyCharacter(user);
    getSocket().send(client);
}

export function canReceiveItem(user: { inv: Record<string, { idItem: number; cant: number }> }, idItem: number, quantity: number, rarity = 0) {
    const obj = vars.datObj?.[idItem];
    if (!obj) {
        return false;
    }

    if (obj.objType == vars.objType.dinero) {
        return true;
    }

    return canAddToInventory(user.inv, idItem, quantity, MAX_STACK, require("./itemRarity").getItemRarity(idItem, rarity));
}

function getProductName(product: CatalogProduct): string {
    if (product.name) {
        return product.name;
    }

    return String(vars.datObj?.[product.objIndex ?? 0]?.name ?? product.id);
}

function describeProduct(product: CatalogProduct, user: ShopUser) {
    const obj = product.objIndex ? vars.datObj?.[product.objIndex] : null;
    const transmogSlot = obj ? transmog.getTransmogSlotForObject(obj) : null;
    let unavailableReason: string | null = null;

    if (product.kind === "item" && !obj) {
        unavailableReason = "Todavía no está disponible";
    }

    if (product.kind === "levelUp") {
        const maxLevel = Math.min(Number(product.maxLevel ?? balance.MAX_EXP_LEVEL), balance.MAX_EXP_LEVEL);
        if (Number(user.level) >= maxLevel) {
            unavailableReason = `Solo hasta nivel ${maxLevel - 1}`;
        }
    }

    return {
        id: product.id,
        category: product.category,
        subcategory: product.subcategory ?? null,
        kind: product.kind,
        name: getProductName(product),
        desc: product.desc ?? (obj ? String(obj.desc ?? "") : ""),
        price: Number(product.price),
        objIndex: product.objIndex ?? null,
        amount: Number(product.amount ?? 1),
        grhIndex: obj ? Number(obj.grhIndex ?? 0) : 0,
        transmogSlot: transmogSlot ?? product.slot ?? null,
        graphic: obj && transmogSlot ? transmog.getObjectTransmogGraphic(transmogSlot, obj) : 0,
        levels: product.levels ?? null,
        maxLevel: product.maxLevel ?? null,
        slot: product.slot ?? null,
        featured: Boolean(product.featured),
        badge: product.badge ?? null,
        setName: product.setName ?? null,
        unavailableReason,
    };
}

export function buildShopState(idUser: string | number, lastResult?: PurchaseResult) {
    const user = getUser(idUser);
    if (!user) {
        return null;
    }

    const progress = getProgress(user);

    return {
        points: Number(progress.puntosDonacion ?? 0),
        categories: tiendaJson.categories,
        products: catalog.map((product) => describeProduct(product, user)),
        appearance: transmog.buildAppearancePreview(user),
        level: Number(user.level ?? 1),
        pendingDeliveries: (progress.pendingDeliveries ?? []).length,
        lastResult: lastResult ? { ...lastResult, at: Date.now() } : null,
    };
}

export function sendShopState(idUser: string | number, lastResult?: PurchaseResult) {
    const client = vars.clients?.[idUser];
    const state = buildShopState(idUser, lastResult);
    if (!client || !state) {
        return;
    }

    getHandleProtocol().shopState(state, client);
}

function persistItems(idUser: string | number) {
    void getGame()
        .persistCharacterItemsById(idUser)
        .catch((error: unknown) => console.error("[Tienda] No se pudo guardar el inventario", idUser, error));
}

function chargePoints(user: ShopUser, amount: number): number | null {
    const progress = getProgress(user);
    const current = Number(progress.puntosDonacion ?? 0);
    if (current < amount) {
        return null;
    }

    progress.puntosDonacion = current - amount;
    user.puntosDonacion = progress.puntosDonacion;
    saveProgress(user);
    return progress.puntosDonacion;
}

function grantLevels(idUser: string | number, user: ShopUser, levels: number) {
    const game = getGame();

    for (let index = 0; index < levels; index++) {
        if (Number(user.level) >= balance.MAX_EXP_LEVEL) {
            break;
        }

        // Exactamente lo que falta para el próximo nivel: checkUserLevel hace
        // la subida completa (vida, maná, skills, efecto de nivel).
        user.exp = Math.max(Number(user.exp ?? 0), Number(user.expNextLevel ?? 0));
        game.checkUserLevel(idUser);
    }

    void game
        .persistCharacterSnapshot(user)
        .catch((error: unknown) => console.error("[Tienda] No se pudo guardar el nivel", idUser, error));
}

export function purchase(idUser: string | number, productId: string, quantityRaw?: unknown): PurchaseResult {
    const user = getUser(idUser);
    const product = catalogById.get(productId);

    if (!user) {
        return { ok: false, message: "No se pudo completar la compra." };
    }

    if (!product) {
        return { ok: false, message: "Ese producto no existe en la tienda.", productId };
    }

    if (product.kind === "customDesign") {
        return {
            ok: false,
            message: "Los diseños personalizados se piden desde el formulario de la tienda.",
            productId,
        };
    }

    const description = describeProduct(product, user);
    if (description.unavailableReason) {
        return { ok: false, message: `${description.name}: ${description.unavailableReason.toLowerCase()}.`, productId };
    }

    const isCosmetic = Boolean(description.transmogSlot);
    const quantity = isCosmetic || product.kind !== "item" ? 1 : Math.max(1, Math.min(99, Math.floor(Number(quantityRaw) || 1)));
    const totalPrice = Number(product.price) * quantity;
    const progress = getProgress(user);

    if (Number(progress.puntosDonacion ?? 0) < totalPrice) {
        return {
            ok: false,
            message: `Necesitás ${totalPrice} puntos de donación y tenés ${progress.puntosDonacion}.`,
            productId,
        };
    }

    if (product.kind === "item") {
        const objIndex = Number(product.objIndex);
        const units = Number(product.amount ?? 1) * quantity;

        if (!canReceiveItem(user, objIndex, units)) {
            return { ok: false, message: "No tenés lugar en el inventario.", productId };
        }

        const remaining = chargePoints(user, totalPrice);
        if (remaining === null) {
            return { ok: false, message: "No tenés puntos suficientes.", productId };
        }

        getGame().putItemToInv(idUser, objIndex, units);
        persistItems(idUser);
        refreshSnapshot(idUser);
        const quantityText = quantity > 1 ? ` x${quantity}` : "";
        const hint = isCosmetic ? " Ponelo en Transfigurar para usarlo." : "";
        return {
            ok: true,
            message: `Compraste ${description.name}${quantityText}. Te quedan ${remaining} puntos.${hint}`,
            productId,
        };
    }

    if (product.kind === "levelUp") {
        if (user.dead) {
            return { ok: false, message: "Los muertos no pueden subir de nivel.", productId };
        }

        const remaining = chargePoints(user, totalPrice);
        if (remaining === null) {
            return { ok: false, message: "No tenés puntos suficientes.", productId };
        }

        const before = Number(user.level);
        grantLevels(idUser, user, Number(product.levels ?? 1));
        refreshSnapshot(idUser);
        return {
            ok: true,
            message: `¡Subiste del nivel ${before} al ${user.level}! Te quedan ${remaining} puntos.`,
            productId,
        };
    }

    return { ok: false, message: "Ese producto no se puede comprar.", productId };
}

export function handleShopCommand(idUser: string | number, action: "abrir" | "comprar", args: string[]) {
    if (action === "comprar") {
        const result = purchase(idUser, String(args[0] ?? ""), args[1]);
        tell(idUser, result.message, result.ok ? "#E69500" : "white");
        sendShopState(idUser, result);
        return;
    }

    deliverPendingItems(idUser);
    sendShopState(idUser);
}

/**
 * Cobra un diseño personalizado (lo llama la api al recibir el pedido). El
 * precio sale del catálogo del server, no de lo que mande el cliente.
 */
export function chargeCustomDesign(characterId: string, productId: string, requestId = "") {
    const product = catalogById.get(productId);

    if (!product || product.kind !== "customDesign" || !product.slot) {
        return { status: 404, body: { error: "Ese diseño no existe en la tienda." } };
    }

    const progress = getProgress({ _id: characterId });
    const price = Number(product.price);
    const current = Number(progress.puntosDonacion ?? 0);
    const charges = (progress.designCharges ?? {}) as Record<
        string,
        { points: number; slot: string; productName: string; at: number }
    >;
    const previous = requestId ? charges[requestId] : undefined;

    if (previous) {
        // Reintento del mismo pedido: ya estaba cobrado.
        return {
            status: 200,
            body: {
                ok: true,
                points: previous.points,
                slot: previous.slot,
                productName: previous.productName,
                balance: current,
            },
        };
    }

    if (current < price) {
        return {
            status: 402,
            body: { error: `Necesitás ${price} puntos de donación y tenés ${current}.` },
        };
    }

    progress.puntosDonacion = current - price;

    if (requestId) {
        const kept = Object.entries(charges)
            .sort((left, right) => right[1].at - left[1].at)
            .slice(0, 29);
        progress.designCharges = {
            ...Object.fromEntries(kept),
            [requestId]: { points: price, slot: product.slot, productName: getProductName(product), at: Date.now() },
        };
    }

    saveProgress({ _id: characterId });

    const onlineId = findOnlineIdByCharacterId(characterId);
    if (onlineId) {
        const user = getUser(onlineId);
        if (user) {
            user.puntosDonacion = progress.puntosDonacion;
        }
        tell(onlineId, `Pediste ${getProductName(product)} por ${price} puntos. El equipo de arte te avisará cuando esté listo.`);
        refreshSnapshot(onlineId);
        sendShopState(onlineId);
    }

    return {
        status: 200,
        body: {
            ok: true,
            points: price,
            slot: product.slot,
            productName: getProductName(product),
            balance: progress.puntosDonacion,
        },
    };
}

/** Entrega pendiente: al conectarse o cuando haya lugar en el inventario. */
export function deliverPendingItems(idUser: string | number) {
    const user = getUser(idUser);
    if (!user) {
        return;
    }

    const progress = getProgress(user);
    const pending = Array.isArray(progress.pendingDeliveries) ? progress.pendingDeliveries : [];
    if (pending.length === 0) {
        return;
    }

    const remaining = [];
    let delivered = 0;

    for (const entry of pending) {
        const objIndex = Number(entry?.objIndex);
        const amount = Math.max(1, Number(entry?.amount ?? 1));

        const rarity = Math.max(0, Math.min(3, Math.floor(Number(entry?.rarity ?? 0)) || 0));
        if (!vars.datObj?.[objIndex] || !canReceiveItem(user, objIndex, amount, rarity)) {
            remaining.push(entry);
            continue;
        }

        getGame().putItemToInv(idUser, objIndex, amount, rarity);
        tell(idUser, `Recibiste ${vars.datObj[objIndex].name}${entry.reason ? ` (${entry.reason})` : ""}.`);
        delivered++;
    }

    progress.pendingDeliveries = remaining;
    saveProgress(user);

    if (delivered > 0) {
        persistItems(idUser);
    }

    if (remaining.length > 0) {
        tell(idUser, `Tenés ${remaining.length} objeto(s) esperando. Hacé lugar en el inventario y abrí la tienda para recibirlos.`);
    }
}

/** Le entrega un objeto a un personaje, esté conectado o no. */
export function deliverItem(characterId: string, objIndex: number, amount: number, reason: string, rarity = 0) {
    if (!vars.datObj?.[objIndex]) {
        return { status: 404, body: { error: "Ese objeto no existe en el servidor de juego." } };
    }

    const safeAmount = Math.max(1, Math.floor(amount || 1));
    const progress = getProgress({ _id: characterId });
    progress.pendingDeliveries = [
        ...(Array.isArray(progress.pendingDeliveries) ? progress.pendingDeliveries : []),
        { objIndex, amount: safeAmount, reason: String(reason ?? "").slice(0, 120), createdAt: Date.now(), ...(rarity > 0 ? { rarity } : {}) },
    ];
    saveProgress({ _id: characterId });

    const onlineId = findOnlineIdByCharacterId(characterId);
    if (onlineId) {
        deliverPendingItems(onlineId);
        const stillPending = (getProgress({ _id: characterId }).pendingDeliveries ?? []).length > 0;
        return { status: 200, body: { ok: true, delivered: stillPending ? "queued" : "now" } };
    }

    return { status: 200, body: { ok: true, delivered: "queued" } };
}

module.exports = {
    buildShopState,
    sendShopState,
    purchase,
    handleShopCommand,
    chargeCustomDesign,
    deliverItem,
    deliverPendingItems,
    canReceiveItem,
    findOnlineIdByCharacterId,
};
