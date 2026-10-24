// Datos del Chamán elemental (docs/CHAMAN_ELEMENTAL.md): hechizos nuevos y modificados, sus pergaminos,
// qué clase puede aprender cada uno y en qué tiendas se venden. Se puede correr varias veces.
//   pnpm --dir server exec tsx src/scripts/applyShamanData.ts && pnpm --dir server export-client-objs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../..");
const SHAMAN = 22;
const ALL_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const allExcept = (...allowed: number[]) => ALL_CLASSES.filter((id) => !allowed.includes(id));

const spellPaths = ["server/jsons/spells.json", "api/src/jsons/spells.json", "frontend/public/init/spells.json"];
const objectPaths = ["server/jsons/objs.json", "api/src/jsons/objs.json"];
const npcPaths = ["server/jsons/npcs.json", "api/src/jsons/npcs.json"];

// Campos que se agregan o cambian en hechizos que ya existen.
const spellChanges: Record<number, Record<string, unknown>> = {
    1: { name: "Curar efectos", curaEfectos: 1 },
    // Es el hechizo con el que arranca el chamán: a nivel 1 el tope de cada habilidad es 5 puntos.
    7: { elemental: 1, minSkill: 5 },
    // Pega poco: pasa a ser para criaturas (como Onda de Luz) y gasta menos.
    15: { elemental: 1, target: 2, manaRequired: 120 },
    23: { name: "Descarga eléctrica", elemental: 1, ralentiza: 6000 },
    // De área: cruz de 5 baldosas alrededor del clic, pintada en verde al apuntar (spellArea.ts).
    51: { elemental: 1, aoe: 1 },
    61: { elemental: 1 },
    62: { elemental: 1, aoe: 1 },
    63: { elemental: 1, quema: 10 },
    64: { elemental: 1, silencioTotal: 3000, silencioRespiro: 1000, silencioTipo: "rayo" },
    65: { elemental: 1 },
};

const spellTemplate = {
    desc: "",
    type: 2,
    wav: 16,
    fxGrh: 0,
    minSkill: 0,
    manaRequired: 0,
    staRequired: 0,
    target: 1,
    palabrasMagicas: "",
    paraliza: 0,
    inmoviliza: 0,
    removerParalisis: 0,
    invisibilidad: 0,
    revivir: 0,
    curaVeneno: 0,
    envenena: 0,
    ceguera: 0,
    estupidez: 0,
    paralizaarea: 0,
    remueveInvisibilidadParcial: 0,
    morph: 0,
    protec: 0,
    invoca: 0,
    cant: 0,
    minNivel: 0,
    noesquivar: 0,
    minHp: 0,
    maxHp: 0,
    subeHp: 0,
    subeAg: 0,
    minAg: 0,
    maxAg: 0,
    subeFz: 0,
    minFz: 0,
    maxFz: 0,
    subeMana: 0,
    minMana: 0,
    maxMana: 0,
    subeHam: 0,
    minHam: 0,
    maxHam: 0,
    subeSed: 0,
    minSed: 0,
    maxSed: 0,
    staffAffected: 0,
    numNpc: 0,
    loops: 0,
};

type NewSpell = Record<string, unknown> & { name: string };

// fxGrh 146 a 152 son efectos nuevos indexados para el chamán y el clérigo (ver el documento). Los escudos y la
// evasión no tienen efecto al lanzar: el aura aparece enseguida y queda mientras dura (frontend elementalAuras.ts).
const newSpells: Record<number, NewSpell> = {
    76: { name: "Escudo mágico", escudoPropio: "magico", gastaTodaMana: 1, target: 1, manaRequired: 300, minSkill: 80, minNivel: 20, fxGrh: 0, wav: 16, palabrasMagicas: "AQUA VEL'MA" },
    77: { name: "Escudo físico", escudoPropio: "fisico", gastaTodaMana: 1, target: 1, manaRequired: 300, minSkill: 80, minNivel: 20, fxGrh: 0, wav: 16, palabrasMagicas: "TERRA GUAR'D" },
    78: { name: "Escudo de energía", escudoPropio: "energia", target: 1, manaRequired: 450, minSkill: 110, minNivel: 30, fxGrh: 0, wav: 16, palabrasMagicas: "PETRA VOLX" },
    79: { name: "Ráfaga de viento", elemental: 1, subeHp: 2, minHp: 40, maxHp: 46, silencioMagia: 4000, target: 3, manaRequired: 600, minSkill: 110, minNivel: 25, fxGrh: 87, wav: 27, palabrasMagicas: "VEN'TO RAX" },
    80: { name: "Prisión de agua", elemental: 1, silencioTotal: 3000, silencioTipo: "agua", target: 1, manaRequired: 700, minSkill: 130, minNivel: 35, fxGrh: 0, wav: 16, palabrasMagicas: "AQUA CAR'CER" },
    81: { name: "Escudo elemental mágico", escudoAliado: "magico", target: 1, manaRequired: 150, minSkill: 60, minNivel: 15, fxGrh: 0, wav: 16, palabrasMagicas: "AQUA ALIX" },
    82: { name: "Escudo elemental físico", escudoAliado: "fisico", target: 1, manaRequired: 150, minSkill: 60, minNivel: 15, fxGrh: 0, wav: 16, palabrasMagicas: "TERRA ALIX" },
    83: { name: "Evasión de viento", evasionViento: 1, target: 1, manaRequired: 600, minSkill: 150, minNivel: 40, fxGrh: 0, wav: 16, palabrasMagicas: "VEN'TO EVAX" },
    // Reemplazo de Llamarada para mago y druida: mismo daño y maná, magia común.
    84: { name: "Lluvia Arcana", subeHp: 2, minHp: 50, maxHp: 56, target: 3, manaRequired: 900, minSkill: 110, fxGrh: 122, wav: 107, palabrasMagicas: "ARX PLU'VIA" },
    // Clérigo: el daño de LLuvia de Sangre con un martillo de luz que cae del cielo.
    85: { name: "Martillo de luz celestial", subeHp: 2, minHp: 55, maxHp: 60, target: 3, manaRequired: 1050, minSkill: 150, minNivel: 30, fxGrh: 146, wav: 27, palabrasMagicas: "MAL'LEUS LUX" },
};

function describe(spell: Record<string, any>): string {
    const parts: string[] = [];
    const min = Number(spell.minHp ?? 0);
    const max = Number(spell.maxHp ?? 0);
    const kind = Number(spell.elemental ?? 0) === 1 ? "elemental" : "mágico";
    if ([2, 3, 4].includes(Number(spell.subeHp))) {
        const where = Number(spell.aoe ?? 0) === 1 ? " a todos en una cruz de 5 baldosas" : Number(spell.target) === 2 ? " a una criatura" : "";
        parts.push(`Causa ${min} a ${max} puntos de daño ${kind}${where}.`);
    }
    if (Number(spell.ralentiza ?? 0) > 0) parts.push(`El objetivo camina a la mitad de velocidad durante ${Number(spell.ralentiza) / 1000} s.`);
    if (Number(spell.silencioMagia ?? 0) > 0) parts.push(`No puede lanzar hechizos durante ${Number(spell.silencioMagia) / 1000} s.`);
    if (Number(spell.silencioTotal ?? 0) > 0) {
        parts.push(`No puede atacar ni lanzar hechizos durante ${Number(spell.silencioTotal) / 1000} s.`);
        if (Number(spell.silencioRespiro ?? 0) > 0) parts.push(`No se acumula y deja ${Number(spell.silencioRespiro) / 1000} s de respiro.`);
    }
    if (Number(spell.quema ?? 0) > 0) parts.push(`Lo quema: ${spell.quema} de daño cada 3 s hasta que se cure con Curar efectos.`);
    if (spell.escudoPropio === "magico") parts.push("Escudo propio por 10 s: reduce a la mitad el daño mágico y elemental que recibes.");
    if (spell.escudoPropio === "fisico") parts.push("Escudo propio por 10 s: reduce a la mitad el daño de golpes y flechas que recibes.");
    if (Number(spell.gastaTodaMana ?? 0) === 1) parts.push(`Gasta todo tu maná (mínimo ${spell.manaRequired}).`);
    if (spell.escudoPropio === "energia") parts.push("Escudo propio por 30 s: cada 2 s una piedra golpea a quien atacaste, si está a 4 baldosas o menos.");
    if (spell.escudoAliado === "magico") parts.push("Por 60 s el objetivo recibe 5 % menos daño mágico y elemental.");
    if (spell.escudoAliado === "fisico") parts.push("Por 60 s el objetivo recibe 5 % menos daño de golpes y flechas.");
    if (Number(spell.evasionViento ?? 0) === 1) parts.push("Por 10 s esquivas el 90 % de los golpes, flechas y hechizos, pero no puedes atacar ni hacerte invisible. Se recarga en 30 s.");
    if (Number(spell.curaEfectos ?? 0) === 1) return "Cura el envenenamiento y la quemadura.";
    if (Number(spell.subeHp) === 0 && Number(spell.paraliza ?? 0) === 1) return String(spell.desc ?? "");
    return parts.join(" ") || String(spell.desc ?? "");
}

function updateJson(relativePath: string, update: (data: Record<string, any>) => void) {
    const fullPath = path.join(root, relativePath);
    const data = JSON.parse(fs.readFileSync(fullPath, "utf8")) as Record<string, any>;
    update(data);
    fs.writeFileSync(fullPath, `${JSON.stringify(data)}\n`, "utf8");
}

for (const relativePath of spellPaths) {
    updateJson(relativePath, (spells) => {
        for (const [id, changes] of Object.entries(spellChanges)) {
            Object.assign(spells[id], changes);
            spells[id].desc = describe(spells[id]);
        }
        for (const [id, spell] of Object.entries(newSpells)) {
            spells[id] = { ...spellTemplate, ...spells[id], ...spell };
            spells[id].desc = describe(spells[id]);
        }
    });
}

// Pergaminos: los hechizos elementales y los nuevos del chamán son solo suyos.
const ELEMENTAL_SCROLLS = [204, 361, 531, 813, 1210, 1211, 1212, 1213, 1214];
// Lo que el chamán puede aprender además de lo elemental: Curar efectos, Remover Parálisis, Invisibilidad, Resucitar.
const SHAMAN_CLASSIC_SCROLLS = [200, 207, 318, 319];
const LLUVIA_DE_SANGRE_SCROLL = 820;

const newScrolls: Record<number, { spell: number; valor: number; allowed: number[] }> = {
    1821: { spell: 76, valor: 9000, allowed: [SHAMAN] },
    1822: { spell: 77, valor: 9000, allowed: [SHAMAN] },
    1823: { spell: 78, valor: 15000, allowed: [SHAMAN] },
    1824: { spell: 79, valor: 12000, allowed: [SHAMAN] },
    1825: { spell: 80, valor: 20000, allowed: [SHAMAN] },
    1826: { spell: 81, valor: 4000, allowed: [SHAMAN] },
    1827: { spell: 82, valor: 4000, allowed: [SHAMAN] },
    1828: { spell: 83, valor: 30000, allowed: [SHAMAN] },
    1829: { spell: 84, valor: 10000, allowed: [1, 7] },
    1830: { spell: 85, valor: 12500, allowed: [2] },
};

// Set de tier del chamán (los stats los pone applyTierSetData.ts). Gráficos que no usaba ningún ítem:
// corona de plumas (casco 38), bastón de gema verde (arma 85, planilla 16100), caparazón de tortuga (escudo 3)
// y la túnica blanca con faja (cuerpo 403).
const tierPieces: Record<number, { name: string; from: number; anim: number; grhIndex: number }> = {
    1817: { name: "Corona de Plumas Elemental", from: 1753, anim: 38, grhIndex: 32452 },
    1818: { name: "Bastón Elemental", from: 1754, anim: 85, grhIndex: 29120 },
    1819: { name: "Caparazón Elemental", from: 1755, anim: 3, grhIndex: 712 },
    1820: { name: "Túnica Elemental", from: 1756, anim: 403, grhIndex: 37995 },
};

for (const relativePath of objectPaths) {
    updateJson(relativePath, (objects) => {
        for (const [id, piece] of Object.entries(tierPieces)) {
            objects[id] = {
                ...objects[String(piece.from)],
                ...(objects[id] ?? {}),
                name: piece.name,
                anim: piece.anim,
                grhIndex: piece.grhIndex,
                clasesNoPermitidas: allExcept(SHAMAN),
            };
        }

        const template = objects["1214"];
        for (const [id, scroll] of Object.entries(newScrolls)) {
            objects[id] = {
                ...template,
                name: newSpells[scroll.spell].name,
                valor: scroll.valor,
                spellIndex: scroll.spell,
                clasesNoPermitidas: allExcept(...scroll.allowed),
            };
        }

        for (const [id, item] of Object.entries(objects)) {
            const list: number[] = Array.isArray(item.clasesNoPermitidas) ? item.clasesNoPermitidas : [];
            const numericId = Number(id);
            if (Number(item.objType) === 24 && Number(item.spellIndex ?? 0) > 0) {
                if (newScrolls[numericId]) continue;
                if (ELEMENTAL_SCROLLS.includes(numericId)) {
                    item.clasesNoPermitidas = allExcept(SHAMAN);
                } else if (numericId === LLUVIA_DE_SANGRE_SCROLL) {
                    item.clasesNoPermitidas = allExcept(1, 7);
                } else if (!SHAMAN_CLASSIC_SCROLLS.includes(numericId) && !list.includes(SHAMAN)) {
                    // El resto de la magia no es para el chamán.
                    item.clasesNoPermitidas = [...list, SHAMAN].sort((a, b) => a - b);
                }
                continue;
            }
            if (numericId >= 1817 && numericId <= 1820) continue; // su set de tier (applyTierSetData.ts)
            // Los sets de tier de las otras clases no son para el chamán (el Arcano, por ejemplo, también deja al druida).
            const otherClassTierPiece = numericId >= 1749 && numericId <= 1780;
            // El resto del equipo: usa lo mismo que el druida.
            if ((otherClassTierPiece || list.includes(7)) && !list.includes(SHAMAN)) {
                item.clasesNoPermitidas = [...list, SHAMAN].sort((a, b) => a - b);
            }
        }
    });
}

// Tiendas: los magos que hoy venden pergaminos elementales venden también los nuevos.
const SHOP_NPCS = ["47", "105", "143", "372"];
for (const relativePath of npcPaths) {
    updateJson(relativePath, (npcs) => {
        for (const npcId of SHOP_NPCS) {
            const npc = npcs[npcId];
            if (!npc || !Array.isArray(npc.objs)) continue;
            for (const scrollId of Object.keys(newScrolls).map(Number)) {
                if (!npc.objs.some((entry: { item: number }) => Number(entry.item) === scrollId)) {
                    npc.objs.push({ cant: 100, item: scrollId });
                }
            }
        }
    });
}

console.log(
    `Chamán: ${Object.keys(spellChanges).length} hechizos cambiados y ${Object.keys(newSpells).length} nuevos en ${spellPaths.length} copias, ` +
        `${Object.keys(newScrolls).length} pergaminos en ${objectPaths.length} copias y ${SHOP_NPCS.length} tiendas.`,
);
