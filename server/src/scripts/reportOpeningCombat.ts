// Medición repetible del motor PvE; no simula movimiento, pociones ni EXP por hora.
import fs from "node:fs";
import path from "node:path";
import { pickGear } from "./balanceSim/gear";
const vars = require("../vars"),
    game = require("../game"),
    balance = require("../balance"),
    skills = require("../skills");
vars.datObj = require("../objectData").loadObjectsDataFromJsonFile(path.resolve(__dirname, "../../jsons/objs.json"));
vars.datSpell = require("../../jsons/spells.json");
require("../balanceData").applyBalanceDataToVars(vars, require("../balanceData").createDefaultBalanceData());
vars.mapData[7] = { pk: 0 };
const templates = require("../../jsons/npcs.json");
let seed = 20261106;
Math.random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
const rows: string[] = [];
for (const [classId, mode] of [
    [3, "fisico"],
    [1, "magia"],
    [4, "fisico"],
    [7, "magia"],
] as const) {
    for (const level of [10, 30, 50]) {
        const id = "pve-review";
        const race = vars.balanceRazas[1];
        const cap = level >= 39 ? 200 : level <= 18 ? level * 5 : 100 + (level - 19) * 5;
        const skillValues = Array(31).fill(0);
        for (const name of ["magia", "tacticas", "armas", "defensa", "defMagia"])
            skillValues[skills.SKILLS[name] - 1] = cap;
        const inv: Record<string, any> = {};
        const slots: Record<string, number> = {};
        for (const [kind, slot] of [
            ["Weapon", "arma"],
            ["Body", "armadura"],
            ["Helmet", "casco"],
            ["Shield", "escudo"],
        ] as const) {
            const idItem = pickGear(classId, mode, slot, "venta");
            if (idItem) {
                const pos = Object.keys(inv).length + 1;
                inv[pos] = { idItem, cant: 1, equipped: 1 };
                slots[`idItem${kind}`] = pos;
            }
        }
        const user = {
            id,
            idClase: classId,
            idRaza: 1,
            level,
            map: 7,
            pos: { x: 50, y: 50 },
            heading: 2,
            skills: skillValues,
            skillPts: 0,
            inv,
            ...slots,
            attrFuerza: 18 + race.fuerza,
            attrAgilidad: 18 + race.agilidad,
            attrInteligencia: 18 + race.inteligencia,
            attrConstitucion: 18 + race.constitucion,
            minHit: balance.getMinHitForLevel(classId, level),
            maxHit: balance.getMaxHitForLevel(classId, level),
            hp: 1e8,
            maxHp: 1e8,
            mana: 1e8,
            maxMana: 1e8,
            sta: 1e8,
            maxSta: 1e8,
            exp: 0,
            spells: {},
        };
        vars.personajes[id] = user;
        const maxMana = balance.getMaxManaForLevel(classId, user.attrInteligencia, level);
        const spell =
            mode === "magia"
                ? Object.entries(vars.datSpell)
                      .filter(
                          ([sid, s]: any) =>
                              s.subeHp === 2 &&
                              Number(s.minNivel ?? 0) <= level &&
                              Number(s.minSkill ?? 0) <= cap &&
                              Number(s.manaRequired ?? 0) <= maxMana &&
                              Object.values(vars.datObj).some(
                                  (o: any) =>
                                      Number(o.spellIndex) === Number(sid) &&
                                      !(o.clasesNoPermitidas ?? []).includes(classId),
                              ),
                      )
                      .sort((a: any, b: any) => b[1].minHp + b[1].maxHp - (a[1].minHp + a[1].maxHp))[0]
                : undefined;
        if (mode === "magia" && !spell) continue;
        for (const npcId of [501, 510, 749, 739]) {
            const base = templates[npcId];
            const npc = {
                ...base,
                id: "pve-target",
                nameCharacter: base.name,
                templateNpcIndex: npcId,
                map: 7,
                pos: { x: 50, y: 51 },
                hp: 1e8,
                maxHp: 1e8,
                exp: 0,
            };
            vars.npcs[npc.id] = npc;
            let damage = 0;
            const trials = 500;
            npc.maxHp = base.maxHp;
            for (let i = 0; i < trials; i++) {
                npc.hp = 1e8;
                user.mana = 1e8;
                if (spell) game.userSpellNpc(id, npc.id, Number(spell[0]));
                else game.userDmgNpc(id, npc.id);
                damage += Math.min(base.maxHp, 1e8 - npc.hp);
            }
            const mean = damage / trials;
            if (!Number.isFinite(mean) || mean <= 0)
                throw new Error(`Sin daño: clase ${classId}, nivel ${level}, NPC ${npcId}`);
            rows.push(
                `| ${classId} | ${level} | ${mode}${spell ? ` (${spell[0]})` : ""} | ${npcId} ${base.name} | ${mean.toFixed(1)} | ${Math.ceil(base.maxHp / mean)} |`,
            );
        }
    }
}
const output = path.resolve(__dirname, "../../../docs/balance/APERTURA_COMBATE.md");
fs.writeFileSync(
    output,
    [
        "# Muestra de combate PvE",
        "",
        "Semilla 20261106; 500 intentos por cruce, equipo de venta, raza humana, sin buffs. Se ejecutan `game.userDmgNpc` y `game.userSpellNpc` reales. El daño efectivo incluye fallos y se limita a la vida base del objetivo, incluidas ejecuciones. Los intentos por baja son una estimación HP/daño medio. No mide tiempos, supervivencia, consumibles ni equilibrio entre todas las clases.",
        "",
        "| Clase | Nivel | Ataque | NPC | Daño efectivo/intento | Intentos/baja |",
        "| --- | --- | --- | --- | --- | --- |",
        ...rows,
        "",
    ].join("\n"),
);
console.log(`${rows.length} cruces PvE medidos: ${output}`);
process.exit(0);
