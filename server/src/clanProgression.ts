import { economyRequest, applyQuestWalletState } from "./questWallet";
const meta = require("./clanMeta");
const vars = require("./vars");
export async function hydrateClanProgression(user: any) {
    if (!user.clanId) return;
    const state = await economyRequest("/internal/clans/import-progression", {
        clanId: String(user.clanId),
        legacyLevel: meta.getClanLevel(user.clanId),
    });
    meta.setClanLevel(String(user.clanId), state.level);
    return state;
}
export async function donateQuestToClan(user: any, amount: number, operationId: string) {
    if (!user.clanId || !user._id) throw new Error("No perteneces a un clan");
    const state = await economyRequest("/internal/clans/donate-quest", {
        characterId: String(user._id),
        clanId: String(user.clanId),
        amount,
        operationId,
    });
    applyQuestWalletState(user, state);
    return state;
}
export async function upgradeUserClan(user: any, expectedLevel: number, operationId: string) {
    if (!user.clanId || !user._id) throw new Error("No perteneces a un clan");
    return require("./game").withClanVaultExclusive(String(user.clanId), async () => {
        const current = await hydrateClanProgression(user);
        const state = await economyRequest("/internal/clans/upgrade", {
            leaderCharacterId: String(user._id),
            clanId: String(user.clanId),
            expectedLevel,
            expectedVaultRevision: current.vaultRevision,
            operationId,
        });
        meta.setClanLevel(String(user.clanId), state.level);
        for (const member of Object.values(vars.personajes as Record<string, any>)) {
            if (member.clanId === user.clanId && vars.clients[member.id])
                require("./handleProtocol").console(
                    `Tu clan alcanzó el nivel ${state.level}. Cupo: ${state.maxMembers} miembros.`,
                    "#E69500",
                    1,
                    0,
                    vars.clients[member.id],
                );
        }
        return state;
    });
}
