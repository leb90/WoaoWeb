// Simulador de balance PvP sobre el motor real del server (game.userDmgUser y game.userSpellUser).
// No levanta el server ni toca la base: arma personajes en memoria y mide el daño.
//
//   pnpm --dir server balance-sim [opciones]
//   --propuesta <archivo.json>   cambios a probar (ver propuestas/ y docs/balance/BALANCE_PVP.md)
//   --perfil-balance <db.json>   perfil de balance exportado de game_balance (por defecto, el del código)
//   --salida <archivo.json>      resultado (por defecto balance-sim.json en el directorio actual)
//   --tiradas 1500 --niveles 30,40,50 --perfiles venta,comun,tier --clases 1,7,2,6,8,4,3,9
//   --atacantes 1,3 --raza 1 --sin-buff
import fs from "node:fs";
import path from "node:path";

import { BEST_ARROW, pickGear, type GearProfile, type GearRole, type GearSlot } from "./gear";
import { scoreResults, type SimResult } from "./targets";

const SRC = path.resolve(__dirname, "../..");
const args = process.argv.slice(2);
const option = (name: string, fallback: string) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
};
const list = (name: string, fallback: string) => option(name, fallback).split(",").map((value) => value.trim()).filter(Boolean);

type Proposal = {
    // Tope de fuerza y agilidad efectivas (buff + equipo) en PvP. Regla clásica de AO: 40.
    attributeCap?: number;
    attributeCapIncludesItems?: boolean;
    // Factores solo PvP por clase (clave = id de clase o "default").
    pvpMelee?: Record<string, number>;
    pvpRanged?: Record<string, number>;
    pvpMagic?: Record<string, number>;
    // Bonos porcentuales del set completo de tier, por clase o "default".
    tierSetBonus?: Record<string, { hp?: number; mana?: number; phys?: number; magic?: number }>;
    // Aplicar el bono de maná de objetoEspecial 8/9/10/17/19 (hoy no se suma: bug).
    applyOeMana?: boolean;
    balance?: Record<string, Record<string, unknown>>;
    spells?: Record<string, Record<string, unknown>>;
    objects?: Record<string, Record<string, unknown>>;
};

const proposalPath = option("--propuesta", "");
const proposal: Proposal | null = proposalPath ? JSON.parse(fs.readFileSync(proposalPath, "utf8")) : null;
const TRIALS = Number(option("--tiradas", "1500"));
const CLASSES = list("--clases", "1,7,2,6,8,4,3,9").map(Number);
const ATTACKERS = list("--atacantes", CLASSES.join(",")).map(Number);
const LEVELS = list("--niveles", "30,40,50").map(Number);
const PROFILES = list("--perfiles", "venta,comun,tier") as GearProfile[];
const RACE = Number(option("--raza", "1"));
const BUFFED = !args.includes("--sin-buff");
const ATTR_CAP = Number(proposal?.attributeCap ?? 0);

const vars = require(path.join(SRC, "vars"));
const { loadObjectsDataFromJsonFile } = require(path.join(SRC, "objectData"));
const { applyBalanceDataToVars, createDefaultBalanceData, normalizeBalanceData } = require(path.join(SRC, "balanceData"));
vars.datObj = loadObjectsDataFromJsonFile(path.join(SRC, "../jsons/objs.json"));
vars.datSpell = JSON.parse(fs.readFileSync(path.join(SRC, "../jsons/spells.json"), "utf8"));

const balanceFile = option("--perfil-balance", "");
const balanceData = balanceFile ? normalizeBalanceData(JSON.parse(fs.readFileSync(balanceFile, "utf8"))) : createDefaultBalanceData();
for (const [key, value] of Object.entries(proposal?.balance ?? {})) balanceData[key] = { ...(balanceData[key] || {}), ...value };
applyBalanceDataToVars(vars, balanceData);
for (const [id, changes] of Object.entries(proposal?.spells ?? {})) Object.assign(vars.datSpell[id], changes);
for (const [id, changes] of Object.entries(proposal?.objects ?? {})) Object.assign(vars.datObj[id], changes);

const game = require(path.join(SRC, "game"));
const balance = require(path.join(SRC, "balance"));
const skills = require(path.join(SRC, "skills"));
vars.mapData[1] = { ...(vars.mapData[1] || {}), pk: 0 };

const classFactor = (table: Record<string, number> | undefined, classId: number) => Number(table?.[String(classId)] ?? table?.default ?? 1);

// Propuesta: factor físico solo PvP y % físico del set, dentro de calcularDmg cuando el objetivo es un jugador
// (calcularDmg ya recibe targetIsNpc). userDmgUser llama a game.calcularDmg, así que envolverlo es exacto.
const originalCalcularDmg = game.calcularDmg;
game.calcularDmg = function (idUser: string, targetIsNpc = false) {
    const damage = originalCalcularDmg.call(game, idUser, targetIsNpc);
    if (targetIsNpc || !proposal) return damage;
    const user = vars.personajes[idUser];
    const weapon = vars.datObj[user.inv?.[String(user.idItemWeapon)]?.idItem ?? 0];
    const factor = classFactor(weapon?.proyectil ? proposal.pvpRanged : proposal.pvpMelee, user.idClase);
    return Math.max(1, Math.floor(damage * factor * (1 + Number(user.__setPhysPct || 0) / 100)));
};

const skillCap = (level: number) => (level >= 39 ? 200 : level <= 18 ? level * 5 : 100 + (level - 19) * 5);
// Mismas tablas que getObjectSpecialBonuses (game.ts).
const OE_STR: Record<number, number> = { 2: 5, 3: 2, 4: 3, 12: 1, 13: 2, 14: 5, 15: 3, 16: 1 };
const OE_AGI: Record<number, number> = { 5: 5, 6: 2, 7: 3, 12: 3, 13: 2, 14: 2, 15: 2, 16: 1, 17: 2, 18: 1 };
const OE_MANA: Record<number, number> = { 8: 100, 9: 200, 10: 300, 17: 200, 19: 55 };
const MAGIC_ROLE = new Set([1, 6, 7]);

function setBonus(classId: number, profile: GearProfile) {
    if (!proposal?.tierSetBonus || profile !== "tier") return {};
    return proposal.tierSetBonus[String(classId)] ?? proposal.tierSetBonus.default ?? {};
}

function gearFor(classId: number, profile: GearProfile, mode: string): Record<string, number> {
    const role: GearRole = mode === "magia" || (mode === "defensa" && MAGIC_ROLE.has(classId)) ? "magia" : "fisico";
    const gear: Record<string, number> = {};
    const pick = (slot: GearSlot) => pickGear(classId, role, slot, profile);
    if (mode === "rango") {
        gear.weapon = pickGear(classId, "fisico", "arco", profile);
        gear.arrow = gear.weapon ? BEST_ARROW[profile] : 0;
    } else {
        gear.weapon = pick("arma");
    }
    gear.body = pick("armadura");
    gear.helmet = pick("casco");
    gear.shield = Number(vars.modEscudo[classId] ?? 0) > 0 && mode !== "rango" ? pick("escudo") : 0;
    gear.ring = pick("anillo");
    for (const key of Object.keys(gear)) if (!gear[key]) delete gear[key];
    return gear;
}

let sequence = 0;
function makeCharacter(classId: number, level: number, profile: GearProfile, mode: string, team: number) {
    const id = `sim${++sequence}`;
    const race = vars.balanceRazas[RACE];
    const attr = (key: string) => 18 + Number(race[key] ?? 0);
    const gear = gearFor(classId, profile, mode);
    const inv: Record<string, { idItem: number; amount: number; equipped: number }> = {};
    const slots: Record<string, number> = {};
    let slot = 1;
    let oeMana = 0;
    let oeStr = 0;
    let oeAgi = 0;
    for (const [kind, idItem] of Object.entries(gear)) {
        inv[String(slot)] = { idItem, amount: kind === "arrow" ? 100000 : 1, equipped: 1 };
        slots[kind] = slot++;
        const oe = Number(vars.datObj[idItem]?.objetoEspecial ?? 0);
        if (proposal?.applyOeMana) oeMana += OE_MANA[oe] || 0;
        oeStr += OE_STR[oe] || 0;
        oeAgi += OE_AGI[oe] || 0;
    }
    const skillValues = Array.from({ length: 31 }, () => 0);
    for (const name of ["magia", "tacticas", "armas", "apunalar", "defensa", "proyectiles", "defMagia"]) skillValues[skills.SKILLS[name] - 1] = skillCap(level);
    const bonus = setBonus(classId, profile);
    const buff = (base: number, fromItems: number) => {
        let value = BUFFED ? base * 2 : base;
        if (ATTR_CAP > 0) value = Math.min(value, proposal?.attributeCapIncludesItems ? Math.max(0, ATTR_CAP - fromItems) : ATTR_CAP);
        return value;
    };
    const character: Record<string, any> = {
        id, nameCharacter: id, idClase: classId, idRaza: RACE, level, map: 1, pos: { x: 50, y: 50 + team }, heading: team,
        attrFuerza: buff(attr("fuerza"), oeStr), attrAgilidad: buff(attr("agilidad"), oeAgi),
        attrInteligencia: attr("inteligencia"), attrConstitucion: attr("constitucion"),
        bkAttrFuerza: attr("fuerza"), bkAttrAgilidad: attr("agilidad"),
        minHit: balance.getMinHitForLevel(classId, level), maxHit: balance.getMaxHitForLevel(classId, level),
        // Vida y maná "infinitos" para medir golpes sueltos; la vida real va aparte.
        hp: 1e7, maxHp: 1e7, mana: 1e7, maxMana: 1e7, sta: 1e7, maxSta: 1e7, skills: skillValues, skillPts: 0, inv,
        idItemWeapon: slots.weapon ?? 0, idItemBody: slots.body ?? 0, idItemHelmet: slots.helmet ?? 0,
        idItemShield: slots.shield ?? 0, idItemRing: slots.ring ?? 0, idItemArrow: slots.arrow ?? 0,
        // Combate de arena: saltea zona segura, facciones y fuego amigo.
        rankedMatchId: "sim", rankedTeam: team, spells: {},
        __setPhysPct: bonus.phys ?? 0,
    };
    vars.personajes[id] = character;
    const realMaxHp = Math.round(balance.getMaxHpForLevel(classId, attr("constitucion"), level) * (1 + (bonus.hp ?? 0) / 100));
    const realMaxMana = Math.round((balance.getMaxManaForLevel(classId, attr("inteligencia"), level) + oeMana) * (1 + (bonus.mana ?? 0) / 100));
    return { character, gear, realMaxHp, realMaxMana, bonus };
}

const scrollAllows = (spellId: number, classId: number) =>
    Object.values(vars.datObj).some((item: any) => Number(item.spellIndex) === spellId && !(item.clasesNoPermitidas || []).includes(classId));

// Mejor hechizo de daño individual que la clase puede aprender, lanzar (nivel y skill) y pagar.
function bestSpell(classId: number, level: number, maxMana: number) {
    let top: { id: number; average: number; spell: any } | null = null;
    for (const [rawId, spell] of Object.entries(vars.datSpell) as Array<[string, any]>) {
        const id = Number(rawId);
        if (Number(spell.subeHp) !== 2 || !scrollAllows(id, classId)) continue;
        if (Number(spell.minNivel ?? 0) > level || Number(spell.minSkill ?? 0) > skillCap(level) || Number(spell.manaRequired ?? 0) > maxMana) continue;
        const average = (Number(spell.minHp) + Number(spell.maxHp)) / 2;
        if (!top || average > top.average) top = { id, average, spell };
    }
    return top;
}

function hitsToKill(landed: number[], hp: number) {
    if (!landed.length) return { mean: Infinity, p2: 0, p3: 0, p4: 0 };
    const runs = 4000;
    let total = 0;
    const within = [0, 0, 0, 0, 0];
    for (let run = 0; run < runs; run++) {
        let left = hp;
        let hits = 0;
        while (left > 0 && hits < 60) {
            left -= landed[Math.floor(Math.random() * landed.length)];
            hits++;
        }
        total += hits;
        for (let k = 2; k <= 4; k++) if (hits <= k) within[k]++;
    }
    const round = (value: number) => Number(value.toFixed(2));
    return { mean: round(total / runs), p2: round(within[2] / runs), p3: round(within[3] / runs), p4: round(within[4] / runs) };
}

const modesFor = (classId: number) => [
    ...(Number(vars.modDmgMagia[classId] ?? 0) > 0 ? ["magia"] : []),
    "melee",
    ...([9, 20].includes(classId) ? ["rango"] : []),
];

const results: Array<SimResult & Record<string, unknown>> = [];
const loadouts: Record<string, unknown> = {};
for (const level of LEVELS) {
    for (const atkProfile of PROFILES) {
        for (const atkClass of ATTACKERS) {
            for (const mode of modesFor(atkClass)) {
                const attacker = makeCharacter(atkClass, level, atkProfile, mode, 1);
                const spell = mode === "magia" ? bestSpell(atkClass, level, attacker.realMaxMana) : null;
                if (mode === "magia" && !spell) continue;
                loadouts[`${atkClass}|${level}|${atkProfile}|${mode}`] = {
                    gear: attacker.gear,
                    maxMana: attacker.realMaxMana,
                    spell: spell ? { id: spell.id, name: spell.spell.name, mana: spell.spell.manaRequired, damage: `${spell.spell.minHp}-${spell.spell.maxHp}` } : null,
                };
                const magicFactor = proposal ? classFactor(proposal.pvpMagic, atkClass) * (1 + Number(attacker.bonus.magic ?? 0) / 100) : 1;
                for (const defProfile of PROFILES) {
                    for (const defClass of CLASSES) {
                        const defender = makeCharacter(defClass, level, defProfile, "defensa", 2);
                        loadouts[`${defClass}|${level}|${defProfile}|defensa`] = { gear: defender.gear, maxHp: defender.realMaxHp };
                        const landed: number[] = [];
                        for (let trial = 0; trial < TRIALS; trial++) {
                            defender.character.hp = 1e7;
                            if (spell) game.userSpellUser(attacker.character.id, defender.character.id, spell.id);
                            else game.userDmgUser(attacker.character.id, defender.character.id);
                            let damage = 1e7 - defender.character.hp;
                            // Propuesta: factor mágico solo PvP y % mágico del set, sobre el daño final del hechizo.
                            if (spell && damage > 0 && magicFactor !== 1) damage = Math.max(1, Math.floor(damage * magicFactor));
                            if (damage > 0) landed.push(damage);
                        }
                        landed.sort((a, b) => a - b);
                        const pct = (q: number) => (landed.length ? landed[Math.min(landed.length - 1, Math.floor(q * landed.length))] : 0);
                        results.push({
                            level, atkClass, atkProfile, mode, defClass, defProfile, spell: spell?.id ?? null,
                            hitRate: Number((landed.length / TRIALS).toFixed(3)),
                            dmgAvg: landed.length ? Math.round(landed.reduce((a, b) => a + b, 0) / landed.length) : 0,
                            dmgP10: pct(0.1), dmgP90: pct(0.9), hp: defender.realMaxHp,
                            casts: spell ? Math.floor(attacker.realMaxMana / Number(spell.spell.manaRequired)) : null,
                            ...hitsToKill(landed, defender.realMaxHp),
                        });
                        delete vars.personajes[defender.character.id];
                    }
                }
                delete vars.personajes[attacker.character.id];
            }
        }
    }
}

const output = option("--salida", "balance-sim.json");
fs.writeFileSync(output, JSON.stringify({ trials: TRIALS, race: RACE, buffed: BUFFED, proposal: proposalPath || null, loadouts, results }, null, 1));
const score = scoreResults(results);
console.log(
    `${results.length} combinaciones -> ${output}. Contra la matriz objetivo: ${score.within}/${score.total} a ±0,5 aciertos ` +
        `(${Math.round((score.within / Math.max(1, score.total)) * 100)}%), error cuadrático medio ${score.meanSquaredError.toFixed(2)}.`,
);
process.exit(0);
