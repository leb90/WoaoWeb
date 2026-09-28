import type { MountInstance, MountPerks } from "./mountRepository";

export const PVP_DAMAGE_CAP = 0.05;
export const PVE_DAMAGE_CAP = 0.1;
export const DEFENSE_CAP = 0.1;
export const EVASION_CAP = 0.1;
export const NPC_DAMAGE_REDUCTION_CAP = 0.1;

export type MountTalentBonuses = {
    pvpPhysical: number;
    pvpRanged: number;
    pvpMagic: number;
    pve: number;
    pveMagic: number;
    physicalDefense: number;
    projectileDefense: number;
    magicDefense: number;
    allDefenses: number;
    evasion: number;
    maxLife: number;
    maxMana: number;
    manaRegen: number;
    npcDamageReduction: number;
};

const EMPTY: MountTalentBonuses = {
    pvpPhysical: 0,
    pvpRanged: 0,
    pvpMagic: 0,
    pve: 0,
    pveMagic: 0,
    physicalDefense: 0,
    projectileDefense: 0,
    magicDefense: 0,
    allDefenses: 0,
    evasion: 0,
    maxLife: 0,
    maxMana: 0,
    manaRegen: 0,
    npcDamageReduction: 0,
};

function clampBonus(value: number, cap: number) {
    return Math.max(0, Math.min(cap, value));
}

function percentFromId(talentId: string): number {
    const match = talentId.match(/_(\d+)$/);
    if (!match) return 0;
    return Number(match[1]) / 100;
}

export function parseTalentId(talentId: string): Partial<MountTalentBonuses> {
    const id = String(talentId || "").toLowerCase();
    if (!id) return {};
    const pct = percentFromId(id);
    if (pct <= 0) return {};

    if (id.includes("npc_damage_reduction")) return { npcDamageReduction: pct };
    if (id.includes("all_defenses")) return { allDefenses: pct };
    if (id.includes("physical_defense") || id.includes("melee_defense")) {
        return { physicalDefense: pct };
    }
    if (id.includes("projectile_defense") || id.includes("ranged_defense")) {
        return { projectileDefense: pct };
    }
    if (id.includes("magic_defense")) return { magicDefense: pct };
    if (id.includes("evasion")) return { evasion: pct };
    if (id.includes("max_life") || id.includes("max_hp")) return { maxLife: pct };
    if (id.includes("max_mana")) return { maxMana: pct };
    if (id.includes("mana_regen")) return { manaRegen: pct };
    if (id.includes("pvp_physical") || (id.includes("pvp") && id.includes("physical"))) {
        return { pvpPhysical: pct };
    }
    if (id.includes("pvp_projectile") || (id.includes("pvp") && id.includes("projectile"))) {
        return { pvpRanged: pct };
    }
    if (id.includes("pvp_magic") || (id.includes("pvp") && id.includes("magic"))) {
        return { pvpMagic: pct };
    }
    if (id.includes("pvp_profile") || (id.includes("pvp") && !id.includes("pve"))) {
        return { pvpPhysical: pct };
    }
    if (id.includes("pve_magic")) return { pveMagic: pct };
    if (id.includes("pve")) return { pve: pct };
    return {};
}

export function collectTalentBonuses(perks: MountPerks | undefined | null): MountTalentBonuses {
    const out: MountTalentBonuses = { ...EMPTY };
    if (!perks) return out;
    for (const talentId of [perks.level10, perks.level20, perks.level30]) {
        if (!talentId) continue;
        const partial = parseTalentId(talentId);
        for (const [key, value] of Object.entries(partial) as Array<
            [keyof MountTalentBonuses, number]
        >) {
            out[key] += value;
        }
    }
    return out;
}

export function getActiveMountTalentBonuses(
    mount: MountInstance | null | undefined,
): MountTalentBonuses {
    if (!mount) return { ...EMPTY };
    return collectTalentBonuses(mount.perks);
}

export function applyMountOutgoingPvpDamage(
    baseDamage: number,
    bonuses: MountTalentBonuses,
    kind: "melee" | "ranged" | "magic",
): number {
    const raw =
        kind === "magic"
            ? bonuses.pvpMagic
            : kind === "ranged"
              ? bonuses.pvpRanged
              : bonuses.pvpPhysical;
    return Math.max(1, Math.floor(baseDamage * (1 + clampBonus(raw, PVP_DAMAGE_CAP))));
}

export function applyMountOutgoingPveDamage(
    baseDamage: number,
    mount: MountInstance | null | undefined,
    bonuses: MountTalentBonuses,
    kind: "melee" | "ranged" | "magic" = "melee",
): number {
    if (!mount) return baseDamage;
    const percent =
        kind === "magic"
            ? clampBonus(bonuses.pveMagic || bonuses.pve, PVE_DAMAGE_CAP)
            : clampBonus(bonuses.pve, PVE_DAMAGE_CAP);
    return Math.max(1, Math.floor(baseDamage * (1 + percent)) + Math.max(0, Number(mount.npcDamage ?? 0)));
}

export function applyMountIncomingDamage(
    baseDamage: number,
    bonuses: MountTalentBonuses,
    kind: "melee" | "ranged" | "magic",
): number {
    let reduction = bonuses.allDefenses;
    if (kind === "magic") reduction += bonuses.magicDefense;
    else if (kind === "ranged") reduction += bonuses.projectileDefense;
    else reduction += bonuses.physicalDefense;
    return Math.max(1, Math.floor(baseDamage * (1 - clampBonus(reduction, DEFENSE_CAP))));
}

export function applyMountNpcDamageReduction(
    baseDamage: number,
    bonuses: MountTalentBonuses,
): number {
    return Math.max(
        1,
        Math.floor(
            baseDamage * (1 - clampBonus(bonuses.npcDamageReduction, NPC_DAMAGE_REDUCTION_CAP)),
        ),
    );
}

export function getMountEvasionChance(bonuses: MountTalentBonuses): number {
    return clampBonus(bonuses.evasion, EVASION_CAP);
}

export function describeTalentId(talentId: string): string {
    const id = String(talentId || "");
    const pct = Math.round(percentFromId(id) * 100);
    if (!pct) return id;
    if (id.includes("npc_damage_reduction")) return `-${pct}% daño NPC recibido`;
    if (id.includes("all_defenses")) return `+${pct}% todas las defensas`;
    if (id.includes("physical_defense")) return `+${pct}% defensa física`;
    if (id.includes("projectile_defense")) return `+${pct}% defensa proyectiles`;
    if (id.includes("magic_defense")) return `+${pct}% defensa mágica`;
    if (id.includes("evasion")) return `+${pct}% evasión`;
    if (id.includes("max_life")) return `+${pct}% vida máxima`;
    if (id.includes("max_mana")) return `+${pct}% maná máximo`;
    if (id.includes("mana_regen")) return `+${pct}% regeneración de maná`;
    if (id.includes("pvp_physical")) return `+${pct}% daño físico PvP`;
    if (id.includes("pvp_projectile")) return `+${pct}% daño proyectiles PvP`;
    if (id.includes("pvp_magic")) return `+${pct}% daño mágico PvP`;
    if (id.includes("pve_magic")) return `+${pct}% daño mágico NPC`;
    if (id.includes("pve")) return `+${pct}% daño NPC`;
    if (id.includes("pvp")) return `+${pct}% daño PvP`;
    return id;
}
