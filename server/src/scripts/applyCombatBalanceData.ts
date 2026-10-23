import fs from "node:fs";
import path from "node:path";

import { createDefaultBalanceData } from "../balanceData";

const root = path.resolve(__dirname, "../../..");

const spellChanges: Record<number, Record<string, number>> = {
    2: { minHp: 8, maxHp: 12, manaRequired: 20 },
    3: { minHp: 5, maxHp: 12, manaRequired: 30 },
    5: { minHp: 35, maxHp: 55, manaRequired: 160 },
    6: { minHp: 10, maxHp: 15, manaRequired: 30 },
    7: { minHp: 14, maxHp: 20, manaRequired: 45 },
    8: { minHp: 20, maxHp: 28, manaRequired: 85 },
    15: { minHp: 32, maxHp: 42, manaRequired: 120 },
    23: { minHp: 38, maxHp: 50, manaRequired: 350 },
    25: { minHp: 50, maxHp: 55, manaRequired: 950 },
    32: { minHp: 85, maxHp: 105, manaRequired: 520 },
    33: { minHp: 30, maxHp: 38, manaRequired: 220 },
    39: { minHp: 100, maxHp: 120, manaRequired: 700 },
    41: { minHp: 56, maxHp: 60, manaRequired: 1800 },
    42: { minHp: 55, maxHp: 75, manaRequired: 260 },
    44: { minHp: 55, maxHp: 60, manaRequired: 1050 },
    45: { minHp: 60, maxHp: 65, manaRequired: 1000 },
    50: { minHp: 46, maxHp: 52, manaRequired: 800 },
    51: { minHp: 50, maxHp: 56, manaRequired: 900 },
    60: { minHp: 90, maxHp: 110, manaRequired: 600 },
    61: { minHp: 58, maxHp: 63, manaRequired: 1050 },
    62: { minHp: 55, maxHp: 60, manaRequired: 1050 },
    63: { minHp: 32, maxHp: 42, manaRequired: 250 },
    64: { minHp: 38, maxHp: 50, manaRequired: 350 },
    68: { minHp: 62, maxHp: 68, manaRequired: 1450 },
    73: { minHp: 54, maxHp: 59, manaRequired: 950 },
    75: { minHp: 58, maxHp: 63, manaRequired: 1500 },
};

const spellPaths = [
    "server/jsons/spells.json",
    "api/src/jsons/spells.json",
    "frontend/public/init/spells.json",
];

const objectPaths = [
    "server/jsons/objs.json",
    "api/src/jsons/objs.json",
];

const npcPaths = [
    "server/jsons/npcs.json",
    "api/src/jsons/npcs.json",
    "frontend/public/init/npcs.json",
];

const legacyCombatPotionReplacements = new Map([
    [848, 37],
    [849, 38],
    [1091, 37],
    [1092, 38],
]);

function updateJson(relativePath: string, update: (data: Record<string, any>) => void): void {
    const fullPath = path.join(root, relativePath);
    const data = JSON.parse(fs.readFileSync(fullPath, "utf8")) as Record<string, any>;
    update(data);
    fs.writeFileSync(fullPath, `${JSON.stringify(data)}\n`, "utf8");
}

function syncSpellDescription(spellId: number, spell: Record<string, any>): void {
    // Las descripciones de la magia elemental (daño elemental, lentitud, silencios, quemadura) las arma applyShamanData.ts.
    if (Number(spell.elemental ?? 0) === 1) {
        return;
    }

    const minHp = Number(spell.minHp ?? 0);
    const maxHp = Number(spell.maxHp ?? 0);

    if (Number(spell.subeHp) === 1) {
        spell.desc = `Restaura entre ${minHp} y ${maxHp} puntos de salud.`;
        return;
    }

    if (![2, 3, 4].includes(Number(spell.subeHp))) {
        return;
    }

    if (spellId === 41) {
        spell.desc = `Causa ${minHp} a ${maxHp} puntos de daño a las victimas cercanas al lanzador.`;
        return;
    }

    if (spellId === 75) {
        spell.desc = `Causa ${minHp} a ${maxHp} puntos de daño y devuelve la mitad del daño infligido.`;
        return;
    }

    spell.desc = `Causa ${minHp} a ${maxHp} puntos de daño a la victima.`;
}

for (const relativePath of spellPaths) {
    updateJson(relativePath, (spells) => {
        for (const [id, changes] of Object.entries(spellChanges)) {
            if (!spells[id]) {
                throw new Error(`No existe el hechizo ${id} en ${relativePath}`);
            }
            Object.assign(spells[id], changes);
            syncSpellDescription(Number(id), spells[id]);
        }
    });
}

for (const relativePath of objectPaths) {
    updateJson(relativePath, (objects) => {
        for (const id of [402, 1160]) {
            if (!objects[id]) {
                throw new Error(`No existe el objeto ${id} en ${relativePath}`);
            }
            objects[id].minHit = 35;
            objects[id].maxHit = 48;
        }
    });
}

for (const relativePath of npcPaths) {
    updateJson(relativePath, (npcs) => {
        for (const npc of Object.values(npcs)) {
            if (!Array.isArray(npc.drop)) {
                continue;
            }

            npc.drop = npc.drop.map((drop: Record<string, any>) => ({
                ...drop,
                item: legacyCombatPotionReplacements.get(Number(drop.item)) ?? Number(drop.item),
            }));
        }
    });
}

const balancePath = path.join(root, "api/src/jsons/balance.json");
fs.writeFileSync(balancePath, `${JSON.stringify(createDefaultBalanceData(), null, 4)}\n`, "utf8");

console.log(
    `Balance actualizado: ${Object.keys(spellChanges).length} hechizos en ${spellPaths.length} copias, ` +
        `2 objetos en ${objectPaths.length} copias, drops en ${npcPaths.length} copias y balance.json.`,
);
