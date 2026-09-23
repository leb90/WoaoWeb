export type DonationPackage = {
    id: string;
    usd: number;
    points: number;
    label: string;
};

const POINTS_PER_USD = 100;

export const DONATION_PACKAGES: DonationPackage[] = [
    { id: "d5", usd: 5, points: 5 * POINTS_PER_USD, label: "5 USD" },
    { id: "d10", usd: 10, points: 10 * POINTS_PER_USD, label: "10 USD" },
    { id: "d20", usd: 20, points: 20 * POINTS_PER_USD, label: "20 USD" },
    { id: "d50", usd: 50, points: 50 * POINTS_PER_USD, label: "50 USD" },
];

export function getDonationPackage(packageId: string): DonationPackage | null {
    return DONATION_PACKAGES.find((pkg) => pkg.id === packageId) ?? null;
}
