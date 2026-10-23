import fs from "node:fs";
import path from "node:path";

import {
    calculateMagicDamage,
    getMagicEquipmentTotals,
    getManaPotionRecovery,
} from "../combatBalance";

const balance = require("../balance");
const vars = require("../vars");

const LEVEL = 50;
const root = path.resolve(__dirname, "../../..");
const outputDirectory = path.join(root, "docs/balance");

const classes: Array<[number, string]> = [
    [1, "Mago"], [2, "Clerigo"], [3, "Guerrero"], [4, "Asesino"], [5, "Ladron"],
    [6, "Bardo"], [7, "Druida"], [8, "Paladin"], [9, "Cazador"], [12, "Bandido"],
    [13, "Pescador"], [14, "Herrero"], [15, "Lenador"], [16, "Minero"],
    [17, "Carpintero"], [18, "Pirata"], [19, "Ermitano"], [20, "Arquero"], [21, "Domador"],
    [22, "Chaman"],
];

const races: Array<[number, string]> = [
    [1, "Humano"], [2, "Elfo"], [3, "Elfo Drow"], [4, "Enano"], [5, "Gnomo"],
    [6, "Orco"], [7, "Vampiro"], [8, "Abisario"], [9, "Goblin"], [10, "Tauros"],
    [11, "Licantropo"], [12, "No-Muerto"],
];

function csvCell(value: unknown): string {
    const text = String(value);
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const hpRows = classes.flatMap(([classId, className]) =>
    races.map(([raceId, raceName]) => {
        const constitution = 18 + Number(vars.balanceRazas[raceId].constitucion ?? 0);
        const range = balance.getHpGainRange(classId, constitution);
        return {
            classId,
            className,
            raceId,
            raceName,
            constitution,
            gainMin: range.min,
            gainAverage: range.average,
            gainMax: range.max,
            hpMin: balance.getMinHpForLevel(classId, constitution, LEVEL),
            hpAverage: balance.getMaxHpForLevel(classId, constitution, LEVEL),
            hpMax: balance.getMaxRolledHpForLevel(classId, constitution, LEVEL),
        };
    }),
);

const csvHeaders = Object.keys(hpRows[0]);
const csv = [
    csvHeaders.join(";"),
    ...hpRows.map((row) => csvHeaders.map((key) => csvCell(row[key as keyof typeof row])).join(";")),
].join("\n");

const spells = JSON.parse(fs.readFileSync(path.join(root, "server/jsons/spells.json"), "utf8")) as Record<
    string,
    { name?: string; minHp?: number; maxHp?: number; manaRequired?: number; subeHp?: number }
>;
const objects = JSON.parse(fs.readFileSync(path.join(root, "server/jsons/objs.json"), "utf8")) as Record<
    string,
    {
        name?: string;
        objType?: number;
        minHit?: number;
        maxHit?: number;
        minDef?: number;
        maxDef?: number;
        tipoPocion?: number;
        minModificador?: number;
        maxModificador?: number;
        porcentaje?: number;
        spellIndex?: number;
        clasesNoPermitidas?: number[];
    }
>;

const weapons = Object.entries(objects).filter(([, item]) => Number(item.objType) === 2);
const armor = Object.entries(objects).filter(([, item]) => Number(item.objType) === 3);
const weaponMax = Math.max(...weapons.map(([, item]) => Number(item.maxHit ?? 0)));
const armorMax = Math.max(...armor.map(([, item]) => Number(item.maxDef ?? 0)));

const mageElf = hpRows.find((row) => row.classId === 1 && row.raceId === 2)!;
const mageMana = balance.getMaxManaForLevel(1, 20, LEVEL);
const topEquipment = getMagicEquipmentTotals([{ magicDamageBonus: 90 }]);
const dragonFlame = spells["45"];
const dragonFlameCost = Number(dragonFlame.manaRequired ?? 0);
const spellDamageMin = calculateMagicDamage(Number(dragonFlame.minHp ?? 0), LEVEL, 1.05, topEquipment);
const spellDamageMax = calculateMagicDamage(Number(dragonFlame.maxHp ?? 0), LEVEL, 1.05, topEquipment);
const mountDamageMin = Math.floor(spellDamageMin * 1.05);
const mountDamageMax = Math.floor(spellDamageMax * 1.05);
const standardPotion = getManaPotionRecovery(mageMana, LEVEL, 20);
const manaForThreeCasts = dragonFlameCost * 3;
const potionsForThreeCasts = (recovery: number) => Math.max(0, Math.ceil((manaForThreeCasts - mageMana) / recovery));

const classSpellRoles = [
    { classId: 1, className: "Mago", spellId: 45, objectId: 821, oldDamage: "105-110", oldMana: 1000, note: "Exclusivo; mejor ataque individual." },
    { classId: 7, className: "Druida", spellId: 61, objectId: 1214, oldDamage: "100-105", oldMana: 840, note: "Incinerar; el FX 113 figura como Lluvia de Fuego en old." },
    { classId: 2, className: "Clerigo", spellId: 75, objectId: 1396, oldDamage: "85-100", oldMana: 1500, note: "Exclusivo; devuelve parte del dano causado." },
    { classId: 4, className: "Asesino", spellId: 73, objectId: 1290, oldDamage: "80-85", oldMana: 640, note: "Exclusivo." },
    { classId: 6, className: "Bardo", spellId: 25, objectId: 532, oldDamage: "80-85", oldMana: 640, note: "Mejor ataque individual disponible para la clase." },
    { classId: 8, className: "Paladin", spellId: 25, objectId: 532, oldDamage: "80-85", oldMana: 640, note: "Mejor ataque individual disponible para la clase." },
];

const classSpellRows = classSpellRoles.map(({ classId, className, spellId, objectId, oldDamage, oldMana, note }) => {
    const spell = spells[String(spellId)];
    const object = objects[String(objectId)];
    const blocked = object?.clasesNoPermitidas ?? [];
    if (!spell || Number(object?.spellIndex) !== spellId || blocked.includes(classId)) {
        throw new Error(`Asignacion de hechizo invalida para ${className}: objeto ${objectId}, hechizo ${spellId}.`);
    }
    return `| ${className} | ${spell.name ?? ""} (#${spellId}) | #${objectId} | ${spell.minHp ?? 0}-${spell.maxHp ?? 0} | ${spell.manaRequired ?? 0} | ${oldDamage} / ${oldMana} | ${note} |`;
});

const scenarioTargets = [1, 2, 7, 6, 8].map((classId) => {
    const hp = hpRows.find((row) => row.classId === classId && row.raceId === 2)!;
    const resistance = Number(vars.modResistenciaMagica[classId] ?? 0);
    const minDamage = mountDamageMin - Math.floor((mountDamageMin * resistance) / 100);
    const maxDamage = mountDamageMax - Math.floor((mountDamageMax * resistance) / 100);
    const averageDamage = (minDamage + maxDamage) / 2;
    return {
        className: hp.className,
        hp: hp.hpAverage,
        resistance,
        minDamage,
        maxDamage,
        hits: Math.ceil(hp.hpAverage / averageDamage),
    };
});

const classSummary = classes.map(([classId, className]) => {
    const range = balance.getHpGainRange(classId, 21);
    return `| ${className} | ${range.min} | ${range.average} | ${range.max} |`;
});

const classCombatRows = classes.map(([classId, className]) => {
    const mana = balance.getMaxManaForLevel(classId, 21, LEVEL);
    return (
        `| ${className} | ${mana} | ${vars.modDmgArmas[classId]} | ${vars.modDmgProyectiles[classId]} | ` +
        `${vars.modDmgMagia[classId]} | ${vars.modEvasion[classId]} | ${vars.modEscudo[classId]} | ` +
        `${vars.modResistenciaMagica[classId]}% |`
    );
});

const raceAttributeRows = races.map(([raceId, raceName]) => {
    const race = vars.balanceRazas[raceId];
    return (
        `| ${raceName} | ${18 + race.fuerza} | ${18 + race.agilidad} | ${18 + race.inteligencia} | ` +
        `${18 + race.constitucion} | ${18 + race.carisma} |`
    );
});

const potionRows = Object.entries(objects)
    .filter(([id]) => ["37", "38"].includes(id))
    .map(([id, item]) => {
        const type = Number(item.tipoPocion) === 3 ? "Vida" : "Mana";
        const recovery = Number(item.porcentaje ?? 0) > 0
            ? `${item.porcentaje}%`
            : `${item.minModificador ?? 0}-${item.maxModificador ?? 0}`;
        return `| ${id} | ${item.name ?? ""} | ${type} | ${recovery} |`;
    });

const raceTables = classes.flatMap(([classId, className]) => {
    const rows = hpRows
        .filter((row) => row.classId === classId)
        .map(
            (row) =>
                `| ${row.raceName} | ${row.constitution} | ${row.gainMin} | ${row.gainAverage} | ${row.gainMax} | ${row.hpMin} | ${row.hpAverage} | ${row.hpMax} |`,
        );
    return [
        `### ${className}`,
        "| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |",
        "|---|---:|---:|---:|---:|---:|---:|---:|",
        ...rows,
        "",
    ];
});

const healingRows = Object.entries(spells)
    .filter(([, spell]) => Number(spell.subeHp) === 1)
    .map(
        ([id, spell]) =>
            `| ${id} | ${spell.name ?? ""} | ${spell.minHp ?? 0}-${spell.maxHp ?? 0} | ${spell.manaRequired ?? 0} |`,
    );

const markdown = [
    "# Balance de combate",
    "",
    "Modelo generado desde los datos efectivos del servidor. Nivel de comparacion: 50.",
    "",
    "## Reglas centrales",
    "",
    "- La vida por nivel es una tirada entera persistente. Iniciar sesion o recargar balance no vuelve a calcularla.",
    "- Constitucion mueve el promedio 0,5 por punto respecto de CON 21.",
    "- El equipo suma hasta 90 de dano magico bruto con 50% de efectividad (45 efectivo), 15% porcentual y 20 de penetracion.",
    "- La resistencia magica porcentual se limita a 60%; la defensa magica plana se aplica despues.",
    "- Las monturas aportan hasta 5% de dano PvP y hasta 10% de defensa/PvE segun sus talentos.",
    "- Ninguna curacion de jugador puede superar 120 HP por lanzamiento.",
    "",
    "## Logica de combate",
    "",
    "- Acierto fisico: `clamp(50 + (ataque - evasion) * 0,4)`.",
    "- Dano fisico: `floor((3 * golpeArma + (maxArma / 5) * max(0, fuerza - 15) + golpePersonaje) * modClase)`.",
    "- La armadura o casco y el escudo absorben despues del golpe; las pasivas raciales y la montura se aplican una sola vez.",
    "- Dano magico: hechizo con escala de nivel 2%, equipo plano al 50%, porcentaje, modificador de clase y montura PvP.",
    "- La defensa magica combina resistencia de equipo, clase, raza y skills; penetracion resta antes del limite de 60%.",
    "- El dano adicional independiente de la mascota solo se aplica contra NPC; en PvP la montura queda limitada a 5%.",
    "",
    "## Rango base por clase (CON 21)",
    "",
    "| Clase | Min | Promedio | Max |",
    "|---|---:|---:|---:|",
    ...classSummary,
    "",
    "## Modificadores por clase",
    "",
    "Los valores de dano, evasion y escudo son multiplicadores efectivos del servidor.",
    "",
    "| Clase | Mana 50 (INT 21) | Dano arma | Dano proyectil | Dano magico | Evasion | Escudo | Resist. magica |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
    ...classCombatRows,
    "",
    "## Atributos por raza",
    "",
    "| Raza | Fuerza | Agilidad | Inteligencia | Constitucion | Carisma |",
    "|---|---:|---:|---:|---:|---:|",
    ...raceAttributeRows,
    "",
    "## Caso de control: Mago Elfo",
    "",
    `- Vida nivel 50: ${mageElf.hpMin}-${mageElf.hpMax}, promedio ${mageElf.hpAverage}.`,
        `- Mana nivel 50: ${mageMana}. Llama de Dragon cuesta ${dragonFlameCost}.`,
        `- Para tres Llamas de Dragon necesita ${potionsForThreeCasts(standardPotion)} azules comunes (${standardPotion} de mana efectivo cada una): una entre el primer y segundo lanzamiento, y otra entre el segundo y tercero.`,
        `- Llama de Dragon con equipo y montura al limite: ${mountDamageMin}-${mountDamageMax} antes de la resistencia del objetivo.`,
    "",
    "| Objetivo Elfo | HP promedio | Resist. clase | Dano por Llama de Dragon | Impactos promedio |",
    "|---|---:|---:|---:|---:|",
    ...scenarioTargets.map(
        (row) => `| ${row.className} | ${row.hp} | ${row.resistance}% | ${row.minDamage}-${row.maxDamage} | ${row.hits} |`,
    ),
    "",
    "## Hechizos principales por clase",
    "",
    "La identidad se obtiene de los objetos-pergamino de `old/OBJ.dat`, no solo del dano nominal del hechizo.",
    "Incinerar usa el FX 113, etiquetado como Lluvia de Fuego en `old/Fx.dat`.",
    "",
    "| Clase | Hechizo actual | Objeto | Dano actual | Mana actual | Referencia old (dano / mana) | Funcion |",
    "|---|---|---:|---:|---:|---:|---|",
    ...classSpellRows,
    "",
    "Implosion (#41) sigue disponible solo para Mago y Druida como ataque de area: no reemplaza al hechizo principal individual. En old costaba 2000 de mana; actualmente cuesta 1800. No existe en old una receta aprendible exclusiva de Druida que cueste 1400 de mana.",
    "",
    "## Auditoria de equipo",
    "",
    `- Armas analizadas: ${weapons.length}. Mayor golpe maximo de arma: ${weaponMax}.`,
    `- Armaduras analizadas: ${armor.length}. Mayor defensa maxima: ${armorMax}.`,
    "- Espada MataDragones conserva su muerte instantanea contra NPC dragon, pero usa 35-48 contra jugadores y otros objetivos.",
    "- Los bonus magicos de sets se suman una sola vez y luego se limitan; ya no se multiplican secuencialmente por item.",
    "",
    "## Curaciones",
    "",
    "| ID | Hechizo | Curacion | Mana |",
    "|---:|---|---:|---:|",
    ...healingRows,
    "",
    "## Pociones de combate",
    "",
    "| ID | Pocion | Recurso | Recuperacion declarada |",
    "|---:|---|---|---:|",
    ...potionRows,
    "",
    "El balance utiliza exclusivamente pociones normales. La azul comun conserva su recuperacion dinamica por nivel y mana maximo; cualquier pocion mejorada o super heredada queda limitada al mismo efecto normal. Los NPC ya no entregan esas variantes heredadas.",
    "",
    "## Vida nivel 50 por clase y raza",
    "",
    ...raceTables,
].join("\n");

fs.mkdirSync(outputDirectory, { recursive: true });

function writeIfChanged(filePath: string, content: string): void {
    if (fs.existsSync(filePath)) {
        const current = fs.readFileSync(filePath, "utf8");
        const normalize = (value: string) => value.replace(/\r\n/g, "\n").trimEnd();
        if (normalize(current) === normalize(content)) {
            return;
        }
    }
    fs.writeFileSync(filePath, content, "utf8");
}

writeIfChanged(path.join(outputDirectory, "hp-level-50.csv"), `${csv}\n`);
writeIfChanged(path.join(outputDirectory, "combat-balance.md"), `${markdown}\n`);

console.log(`Reporte generado en ${outputDirectory} (${hpRows.length} combinaciones).`);
