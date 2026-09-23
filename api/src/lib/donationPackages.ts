export type DonationPackage = {
    id: string;
    usd: number;
    points: number;
    label: string;
};

const POINTS_PER_USD = 100;

// NOWPayments exige un mínimo por pago que varía según la moneda/red (hoy
// ronda 11-13 USD para USDT/USDC), así que el paquete más barato tiene que
// quedar con margen por encima de eso o el pago falla en el checkout.
export const DONATION_PACKAGES: DonationPackage[] = [
    { id: "d15", usd: 15, points: 15 * POINTS_PER_USD, label: "15 USD" },
    { id: "d25", usd: 25, points: 25 * POINTS_PER_USD, label: "25 USD" },
    { id: "d50", usd: 50, points: 50 * POINTS_PER_USD, label: "50 USD" },
    { id: "d100", usd: 100, points: 100 * POINTS_PER_USD, label: "100 USD" },
];

export const DONATION_COINS = {
    usdt: "usdttrc20",
    usdc: "usdcbsc",
} as const;

export type DonationCoin = keyof typeof DONATION_COINS;

export function isDonationCoin(value: string): value is DonationCoin {
    return value === "usdt" || value === "usdc";
}

export function getDonationPackage(packageId: string): DonationPackage | null {
    return DONATION_PACKAGES.find((pkg) => pkg.id === packageId) ?? null;
}
