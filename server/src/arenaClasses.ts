// Clases del modo Arena (todos contra todos, estilo argentumonline.io). Cada clase entra en nivel 50 con su
// mejor raza y el mejor equipo que puede usar. La raza sale de docs/balance/RAZAS.md, salvo Gnomo y Goblin:
// son razas bajas y no pueden ponerse las túnicas, armaduras ni escudos de tier, así que mago y clérigo van
// con Humano, la siguiente de la tabla.
//   npx tsx --test src/arenaClasses.test.ts
export {};

type InventoryItem = { idItem: number; cant: number; equipped: number };

export type ArenaClass = {
    idClase: number;
    nombre: string;
    idRaza: number;
    /** Cabezas de hombre de la raza (characterCreation.ts) y cuerpo desnudo. */
    cabezas: [number, number];
    cuerpo: number;
    /** Arma, armadura, casco, escudo y, si corresponde, anillo y flechas: todo equipado. */
    equipo: number[];
    hechizos: number[];
};

const POCION_ROJA = 38;
const POCION_AZUL = 37;
const POCION_SUPER_AGILIDAD = 1090;
const POCION_SUPER_FUERZA = 1093;

// Las pociones no se gastan (quitarUserInvItem no hace nada con pvpChar): alcanza con mostrar una pila.
const CANTIDAD_POCIONES = 1000;
const CANTIDAD_FLECHAS = 1000;

// Lo que tiene un personaje de nivel 50 entrenado, igual que el simulador de balance (balanceSim/simulate.ts),
// más meditar para recuperar maná a ritmo normal.
export const ARENA_SKILLS = ["magia", "tacticas", "armas", "meditar", "apunalar", "defensa", "proyectiles", "defMagia"];
export const ARENA_SKILL_VALUE = 200;

export const ARENA_CLASSES: ArenaClass[] = [
    {
        idClase: 1,
        nombre: "Mago",
        idRaza: 1,
        cabezas: [3, 53],
        cuerpo: 21,
        // Set Arcano y Anillo de Energía.
        equipo: [1750, 1752, 1749, 1751, 1221],
        // Remover Parálisis, Apocalipsis, Llama de Dragón, Lluvia de Sangre, Lluvia Arcana, Implosión, Paralizar,
        // Invisibilidad, Curación Milagrosa, Celeridad II, Fuerza II, Ceguera, Estupidez.
        hechizos: [10, 25, 45, 44, 84, 41, 9, 14, 32, 40, 22, 30, 31],
    },
    {
        idClase: 2,
        nombre: "Clérigo",
        idRaza: 1,
        cabezas: [3, 53],
        cuerpo: 21,
        // Set Templario.
        equipo: [1758, 1760, 1757, 1759],
        // Remover Parálisis, Martillo de luz celestial, Purificar, Apocalipsis, Paralizar, Curación Divina,
        // Curación Milagrosa, Invisibilidad, Celeridad II, Fuerza II, Ceguera, Estupidez.
        hechizos: [10, 85, 75, 25, 9, 39, 32, 14, 40, 22, 30, 31],
    },
    {
        idClase: 3,
        nombre: "Guerrero",
        idRaza: 11,
        cabezas: [900, 903],
        cuerpo: 531,
        // Set del Verdugo.
        equipo: [1770, 1772, 1769, 1771],
        hechizos: [],
    },
    {
        idClase: 4,
        nombre: "Asesino",
        idRaza: 1,
        cabezas: [3, 53],
        cuerpo: 21,
        // Set del Umbral.
        equipo: [1778, 1780, 1777, 1779],
        // Remover Parálisis, Destello infernal, Inmovilizar, Restauración, Paralizar, Invisibilidad, Celeridad II, Fuerza II.
        hechizos: [10, 73, 66, 60, 9, 14, 40, 22],
    },
    {
        idClase: 6,
        nombre: "Bardo",
        idRaza: 2,
        cabezas: [101, 119],
        cuerpo: 21,
        // Set Bardo.
        equipo: [1766, 1768, 1765, 1767],
        // Remover Parálisis, Apocalipsis, Inmovilizar, Paralizar, Invisibilidad, Curación Milagrosa, Celeridad II,
        // Fuerza II, Ceguera, Estupidez.
        hechizos: [10, 25, 66, 9, 14, 32, 40, 22, 30, 31],
    },
    {
        idClase: 7,
        nombre: "Druida",
        idRaza: 2,
        cabezas: [101, 119],
        cuerpo: 21,
        // Set Silvestre y Anillo de Energía.
        equipo: [1754, 1756, 1753, 1755, 1221],
        // Remover Parálisis, Enredar, Lluvia de Sangre, Lluvia Arcana, Implosión, Apocalipsis, Paralizar,
        // Invisibilidad, Curación Milagrosa, Celeridad II, Fuerza II.
        hechizos: [10, 49, 44, 84, 41, 25, 9, 14, 32, 40, 22],
    },
    {
        idClase: 8,
        nombre: "Paladín",
        idRaza: 1,
        cabezas: [3, 53],
        cuerpo: 21,
        // Set Paladín.
        equipo: [1762, 1764, 1761, 1763],
        // Remover Parálisis, Apocalipsis, Inmovilizar, Restauración, Paralizar, Invisibilidad, Celeridad II, Fuerza II.
        hechizos: [10, 25, 66, 60, 9, 14, 40, 22],
    },
    {
        idClase: 9,
        nombre: "Cazador",
        idRaza: 6,
        cabezas: [601, 606],
        cuerpo: 215,
        // No tiene set: Arco Desterrado, Placas Doradas, Casco y Escudo del Caído (legendarios) y Flecha Del Diablo.
        equipo: [1518, 729, 1493, 1469, 606],
        hechizos: [],
    },
    {
        idClase: 18,
        nombre: "Pirata",
        idRaza: 3,
        cabezas: [202, 216],
        cuerpo: 32,
        // No tiene set: Espada, Casco y Escudo del Caído (legendarios) y Placas Azules.
        equipo: [1503, 705, 1490, 1466],
        // Disparo Certero, Disparo de Conmoción, Bomba de Humo, Disparo Tóxico, Restauración.
        hechizos: [72, 71, 35, 46, 60],
    },
    {
        idClase: 20,
        nombre: "Arquero",
        idRaza: 6,
        cabezas: [601, 606],
        cuerpo: 215,
        // Set Silvano y Flecha De Los Dioses.
        equipo: [1774, 1776, 1773, 1775, 607],
        hechizos: [],
    },
    {
        idClase: 22,
        nombre: "Chamán",
        idRaza: 2,
        cabezas: [101, 119],
        cuerpo: 21,
        // Set Elemental y Anillo de Energía.
        equipo: [1818, 1820, 1817, 1819, 1221],
        // Remover Parálisis, Rayo Eléctrico, Descarga eléctrica, Rayo de Fuego, Incinerar, Ventisca, Llamarada,
        // Ráfaga de viento, Prisión de agua, Petrificar, Escudo mágico, Escudo físico, Escudo de energía,
        // Evasión de viento, Invisibilidad, Curar efectos.
        hechizos: [10, 64, 23, 63, 61, 62, 51, 79, 80, 65, 76, 77, 78, 83, 14, 1],
    },
];

const FLECHAS = new Set([606, 607]);
const CLASES_SIN_MANA = new Set([3, 9, 20]);

export function getArenaClass(idClase: number): ArenaClass | undefined {
    return ARENA_CLASSES.find((arenaClass) => arenaClass.idClase === Number(idClase));
}

/**
 * Plantilla para login.connectCharacterPvP: el equipo va equipado en el inventario y
 * normalizeEquipmentStorage/hydrateEquipmentState lo pasan a los lugares de equipo y a la apariencia.
 */
export function buildArenaTemplate(idClase: number, random: () => number = Math.random) {
    const arenaClass = getArenaClass(idClase);
    if (!arenaClass) {
        return null;
    }

    const inv: Record<string, InventoryItem> = {};
    let slot = 1;
    const add = (idItem: number, cant: number, equipped: number) => {
        inv[String(slot)] = { idItem, cant, equipped };
        slot += 1;
    };

    add(POCION_ROJA, CANTIDAD_POCIONES, 0);
    if (!CLASES_SIN_MANA.has(arenaClass.idClase)) {
        add(POCION_AZUL, CANTIDAD_POCIONES, 0);
    }
    add(POCION_SUPER_AGILIDAD, CANTIDAD_POCIONES, 0);
    add(POCION_SUPER_FUERZA, CANTIDAD_POCIONES, 0);
    for (const idItem of arenaClass.equipo) {
        add(idItem, FLECHAS.has(idItem) ? CANTIDAD_FLECHAS : 1, 1);
    }

    const spells: Record<string, { idSpell: number }> = {};
    arenaClass.hechizos.forEach((idSpell, index) => {
        spells[String(index + 1)] = { idSpell };
    });

    const [minHead, maxHead] = arenaClass.cabezas;
    const idHead = minHead + Math.floor(random() * (maxHead - minHead + 1));

    return {
        name: arenaClass.nombre,
        idClase: arenaClass.idClase,
        idRaza: arenaClass.idRaza,
        idHead,
        idBody: arenaClass.cuerpo,
        idHelmet: 0,
        idWeapon: 0,
        idShield: 0,
        hp: 0,
        mana: 0,
        hit: 0,
        inv,
        spells,
    };
}
