// Compara las razas sobre el motor real (game.userDmgUser y game.userSpellUser), sin levantar el server ni tocar la base.
// Cada raza pelea contra un rival de la misma clase con atributos neutros (todo +0), a nivel 50, buffeado y sin
// pasivas raciales (solo cuentan los atributos). Por clase se combina, en log y con pesos por rol:
// - el duelo físico: golpes que necesita el rival para matarte / golpes que necesitás vos;
// - la vida (aguantar magia) y el maná (las clases con magia);
// - para el mago, solo la defensa física (su golpe no importa).
// La salida dice cuánto rinde cada raza respecto de la mejor de esa clase. Ver docs/balance/RAZAS.md.
//
//   pnpm --dir server balance-razas [--tiradas 6000] [--perfiles venta,comun,tier] [--perfil-balance <db.json>]
//   --lineas <archivo.json>   líneas a probar en vez de la tabla de razas: { "nombre": { fuerza, agilidad, inteligencia, constitucion } }
import fs from "node:fs";
import path from "node:path";

import { BEST_ARROW, hasOwnSetPiece, pickGear, type GearProfile, type GearRole, type GearSlot } from "./gear";

const SRC = path.resolve(__dirname, "../..");
const args = process.argv.slice(2);
const option = (name: string, fallback: string) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
};
const TRIALS = Number(option("--tiradas", "6000"));
const PROFILES = option("--perfiles", "venta,comun,tier").split(",") as GearProfile[];
const LEVEL = 50;

const vars = require(path.join(SRC, "vars"));
const { loadObjectsDataFromJsonFile } = require(path.join(SRC, "objectData"));
const { applyBalanceDataToVars, createDefaultBalanceData, normalizeBalanceData } = require(path.join(SRC, "balanceData"));
vars.datObj = loadObjectsDataFromJsonFile(path.join(SRC, "../jsons/objs.json"));
vars.datSpell = JSON.parse(fs.readFileSync(path.join(SRC, "../jsons/spells.json"), "utf8"));
const balanceFile = option("--perfil-balance", "");
applyBalanceDataToVars(vars, balanceFile ? normalizeBalanceData(JSON.parse(fs.readFileSync(balanceFile, "utf8"))) : createDefaultBalanceData());
const game = require(path.join(SRC, "game"));
const balance = require(path.join(SRC, "balance"));
const skills = require(path.join(SRC, "skills"));
vars.mapData[1] = { ...(vars.mapData[1] || {}), pk: 0 };

type Line = { fuerza: number; agilidad: number; inteligencia: number; constitucion: number };

const RACE_NAMES: Record<number, string> = {
    1: "Humano", 2: "Elfo", 3: "Elfo Oscuro", 4: "Enano", 5: "Gnomo", 6: "Orco",
    7: "Vampiro", 8: "Abisario", 9: "Goblin", 10: "Tauros", 11: "Licántropo", 12: "No-Muerto",
};

// Sin --lineas, las razas de la tabla; las que tienen los mismos atributos (los espejos) van juntas.
function linesFromRaceTable(): Record<string, Line> {
    const groups = new Map<string, { names: string[]; line: Line }>();
    for (const [id, name] of Object.entries(RACE_NAMES)) {
        const race = vars.balanceRazas[Number(id)];
        const line = { fuerza: race.fuerza, agilidad: race.agilidad, inteligencia: race.inteligencia, constitucion: race.constitucion };
        const key = JSON.stringify(line);
        if (!groups.has(key)) groups.set(key, { names: [], line });
        groups.get(key)!.names.push(name);
    }
    return Object.fromEntries([...groups.values()].map((group) => [group.names.join(" / "), group.line]));
}
const linesFile = option("--lineas", "");
const LINES: Record<string, Line> = linesFile ? JSON.parse(fs.readFileSync(linesFile, "utf8")) : linesFromRaceTable();
const NEUTRAL: Line = { fuerza: 0, agilidad: 0, inteligencia: 0, constitucion: 0 };

const CLASSES: Record<number, string> = {
    1: "Mago", 22: "Chamán", 2: "Clérigo", 7: "Druida", 6: "Bardo", 8: "Paladín",
    4: "Asesino", 3: "Guerrero", 18: "Pirata", 5: "Ladrón", 9: "Cazador", 20: "Arquero",
};
// Pesos por clase: vida (contra magia), maná, duelo físico y, para el mago, solo la defensa física.
type Weights = { hp: number; mana?: number; phys?: number; defPhys?: number };
const WEIGHTS: Record<number, Weights> = {
    1: { hp: 0.4, mana: 0.35, defPhys: 0.25 },
    22: { hp: 0.3, mana: 0.3, phys: 0.4 }, 7: { hp: 0.3, mana: 0.3, phys: 0.4 }, 6: { hp: 0.3, mana: 0.3, phys: 0.4 },
    2: { hp: 0.35, mana: 0.25, phys: 0.4 },
    8: { hp: 0.3, mana: 0.15, phys: 0.55 }, 4: { hp: 0.3, mana: 0.15, phys: 0.55 },
    3: { hp: 0.3, phys: 0.7 }, 18: { hp: 0.3, phys: 0.7 }, 5: { hp: 0.3, phys: 0.7 }, 9: { hp: 0.3, phys: 0.7 }, 20: { hp: 0.3, phys: 0.7 },
};
const MAGIC_ROLE = new Set([1, 6, 7, 22]);
const RANGED = new Set([9, 20]);
const NO_MANA = new Set([3, 5, 9, 18, 20]);

function gearFor(classId: number, profile: GearProfile, mode: string) {
    const role: GearRole = mode === "defensa" && MAGIC_ROLE.has(classId) ? "magia" : "fisico";
    const gear: Record<string, number> = {};
    const pick = (slot: GearSlot) => pickGear(classId, role, slot, profile);
    if (mode === "rango" || (mode === "defensa" && RANGED.has(classId))) {
        gear.weapon = pickGear(classId, "fisico", "arco", profile);
        gear.arrow = gear.weapon ? BEST_ARROW[profile] : 0;
    } else {
        gear.weapon = pick("arma");
    }
    gear.body = pick("armadura");
    gear.helmet = pick("casco");
    const usesShield = (Number(vars.modEscudo[classId] ?? 0) > 0 && mode !== "rango") || (profile === "tier" && hasOwnSetPiece(classId, "escudo"));
    gear.shield = usesShield ? pick("escudo") : 0;
    gear.ring = pick("anillo");
    for (const key of Object.keys(gear)) if (!gear[key]) delete gear[key];
    return gear;
}

let sequence = 0;
function makeCharacter(classId: number, line: Line, profile: GearProfile, mode: string, team: number) {
    const id = `raza${++sequence}`;
    const attr = (key: keyof Line) => 18 + Number(line[key] ?? 0);
    const inv: Record<string, { idItem: number; amount: number; equipped: number }> = {};
    const slots: Record<string, number> = {};
    let slot = 1;
    for (const [kind, idItem] of Object.entries(gearFor(classId, profile, mode))) {
        inv[String(slot)] = { idItem, amount: kind === "arrow" ? 100000 : 1, equipped: 1 };
        slots[kind] = slot++;
    }
    const skillValues = Array.from({ length: 31 }, () => 0);
    for (const name of ["magia", "tacticas", "armas", "apunalar", "defensa", "proyectiles", "defMagia"]) skillValues[skills.SKILLS[name] - 1] = 200;
    const character: Record<string, any> = {
        // idRaza 0: sin pasivas raciales, solo cuentan los atributos.
        id, nameCharacter: id, idClase: classId, idRaza: 0, level: LEVEL, map: 1, pos: { x: 50, y: 50 + team }, heading: team,
        attrFuerza: attr("fuerza") * 2, attrAgilidad: attr("agilidad") * 2,
        attrInteligencia: attr("inteligencia"), attrConstitucion: attr("constitucion"),
        bkAttrFuerza: attr("fuerza"), bkAttrAgilidad: attr("agilidad"),
        minHit: balance.getMinHitForLevel(classId, LEVEL), maxHit: balance.getMaxHitForLevel(classId, LEVEL),
        sta: 1e7, maxSta: 1e7, skills: skillValues, skillPts: 0, inv,
        idItemWeapon: slots.weapon ?? 0, idItemBody: slots.body ?? 0, idItemHelmet: slots.helmet ?? 0,
        idItemShield: slots.shield ?? 0, idItemRing: slots.ring ?? 0, idItemArrow: slots.arrow ?? 0,
        rankedMatchId: "sim", rankedTeam: team, spells: {},
    };
    vars.personajes[id] = character;
    character.maxHp = balance.getMaxHpForLevel(classId, attr("constitucion"), LEVEL);
    character.maxMana = NO_MANA.has(classId) ? 0 : balance.getMaxManaForLevel(classId, attr("inteligencia"), LEVEL);
    character.hp = character.maxHp;
    character.mana = character.maxMana;
    game.refreshEquipmentVitals(character, false);
    const vitals = { hp: character.maxHp as number, mana: character.maxMana as number };
    Object.assign(character, { hp: 1e7, maxHp: 1e7, mana: 1e7, maxMana: 1e7, equipVitalsMaxHp: 0, equipVitalsMaxMana: 0 });
    return { character, vitals };
}

const scrollAllows = (spellId: number, classId: number) =>
    Object.values(vars.datObj).some((item: any) => Number(item.spellIndex) === spellId && !(item.clasesNoPermitidas || []).includes(classId));
function bestSpell(classId: number): number | null {
    let top: { id: number; average: number } | null = null;
    for (const [rawId, spell] of Object.entries(vars.datSpell) as Array<[string, any]>) {
        const id = Number(rawId);
        if (Number(spell.subeHp) !== 2 || Number(spell.minNivel ?? 0) > LEVEL || !scrollAllows(id, classId)) continue;
        const average = (Number(spell.minHp) + Number(spell.maxHp)) / 2;
        if (!top || average > top.average) top = { id, average };
    }
    return top?.id ?? null;
}

// Daño esperado por ataque (acierto × daño) de una línea contra otra, misma clase.
function damagePerAttack(classId: number, attackerLine: Line, defenderLine: Line, profile: GearProfile, mode: string, spellId: number | null = null) {
    const attacker = makeCharacter(classId, attackerLine, profile, mode, 1);
    const defender = makeCharacter(classId, defenderLine, profile, "defensa", 2);
    let total = 0;
    for (let trial = 0; trial < TRIALS; trial++) {
        defender.character.hp = 1e7;
        if (spellId) game.userSpellUser(attacker.character.id, defender.character.id, spellId);
        else game.userDmgUser(attacker.character.id, defender.character.id);
        total += 1e7 - defender.character.hp;
    }
    delete vars.personajes[attacker.character.id];
    delete vars.personajes[defender.character.id];
    return total / TRIALS;
}

const names = Object.keys(LINES);
const score: Record<number, Record<string, number>> = {};
for (const [rawClassId, weights] of Object.entries(WEIGHTS)) {
    const classId = Number(rawClassId);
    const physMode = RANGED.has(classId) ? "rango" : "melee";
    score[classId] = Object.fromEntries(names.map((name) => [name, 0]));
    for (const profile of PROFILES) {
        const neutral = makeCharacter(classId, NEUTRAL, profile, "defensa", 2);
        delete vars.personajes[neutral.character.id];
        const rows = names.map((name) => {
            const me = makeCharacter(classId, LINES[name], profile, "defensa", 1);
            delete vars.personajes[me.character.id];
            const dealt = damagePerAttack(classId, LINES[name], NEUTRAL, profile, physMode);
            const taken = damagePerAttack(classId, NEUTRAL, LINES[name], profile, physMode);
            return { name, hp: me.vitals.hp, mana: me.vitals.mana, taken, duel: (me.vitals.hp / taken) / (neutral.vitals.hp / dealt) };
        });
        const mean = (key: "hp" | "mana" | "duel") => rows.reduce((sum, row) => sum + row[key], 0) / rows.length;
        const meanDefense = rows.reduce((sum, row) => sum + 1 / row.taken, 0) / rows.length;
        for (const row of rows) {
            let value = weights.hp * Math.log(row.hp / mean("hp"));
            if (weights.mana && mean("mana") > 0) value += weights.mana * Math.log(Math.max(1, row.mana) / mean("mana"));
            if (weights.phys) value += weights.phys * Math.log(row.duel / mean("duel"));
            if (weights.defPhys) value += weights.defPhys * Math.log(1 / row.taken / meanDefense);
            score[classId][row.name] += value / PROFILES.length;
        }
    }
}

const pct = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1).replace(".", ",")}`;
console.log(`Nivel ${LEVEL}, buffeado, perfiles ${PROFILES.join("/")}, ${TRIALS} tiradas. % respecto de la mejor raza de cada clase.\n`);
console.log(`| Clase | ${names.join(" | ")} |`);
console.log(`|---|${names.map(() => "---:").join("|")}|`);
const best: Record<string, number> = Object.fromEntries(names.map((name) => [name, 0]));
const near: Record<string, number> = Object.fromEntries(names.map((name) => [name, 0]));
for (const [classId, className] of Object.entries(CLASSES)) {
    const row = score[Number(classId)];
    const top = Math.max(...Object.values(row));
    const values = names.map((name) => (Math.exp(row[name] - top) - 1) * 100);
    names.forEach((name, index) => {
        if (values[index] >= -0.05) best[name]++;
        if (values[index] >= -1.5) near[name]++;
    });
    console.log(`| ${className} | ${values.map((value) => (value >= -0.05 ? "**mejor**" : pct(value))).join(" | ")} |`);
}
console.log("\n| Raza | Clases donde es la mejor | A menos de 1,5 % de la mejor |\n|---|---:|---:|");
for (const name of names) console.log(`| ${name} | ${best[name]} | ${near[name]} |`);
