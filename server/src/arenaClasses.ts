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
    /**
     * De arriba hacia abajo, como se ven en la lista. Van en los últimos casilleros, igual que en
     * argentumonline.io. De abajo para arriba: Remover Parálisis (el último de todos), Paralizar, el hechizo
     * más poderoso, el que le sigue y la curación más poderosa (los que la clase tenga). Arriba van los demás.
     */
    hechizos: number[];
    /**
     * Lo que ya viene puesto en los accesos rápidos de mobile: 4 hechizos (Remover Parálisis, Paralizar, el más
     * poderoso y la mejor curación, o el que le sigue si la clase no cura) y 2 items (las pociones; el arquero y el
     * cazador llevan el arco, que es con lo que atacan).
     */
    accesos: { hechizos: number[]; items: number[] };
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

// Casilleros de hechizos del personaje (MAX_USER_SPELLS en game.ts y en el cliente).
export const ARENA_SPELL_SLOTS = 50;

export const ARENA_CLASSES: ArenaClass[] = [
    {
        idClase: 1,
        nombre: "Mago",
        idRaza: 1,
        cabezas: [3, 53],
        cuerpo: 21,
        // Set Arcano y Anillo de Energía.
        equipo: [1750, 1752, 1749, 1751, 1221],
        // Ceguera, Estupidez, Fuerza II, Celeridad II, Invisibilidad, Implosión, Lluvia Arcana, Apocalipsis |
        // Curación Milagrosa, Lluvia de Sangre, Llama de Dragón, Paralizar, Remover Parálisis.
        hechizos: [30, 31, 22, 40, 14, 41, 84, 25, 32, 44, 45, 9, 10],
        accesos: { hechizos: [10, 9, 45, 32], items: [POCION_ROJA, POCION_AZUL] },
    },
    {
        idClase: 2,
        nombre: "Clérigo",
        idRaza: 1,
        cabezas: [3, 53],
        cuerpo: 21,
        // Set Templario.
        equipo: [1758, 1760, 1757, 1759],
        // Ceguera, Estupidez, Fuerza II, Celeridad II, Invisibilidad, Curación Milagrosa, Apocalipsis |
        // Curación Divina, Martillo de luz celestial, Purificar, Paralizar, Remover Parálisis.
        hechizos: [30, 31, 22, 40, 14, 32, 25, 39, 85, 75, 9, 10],
        accesos: { hechizos: [10, 9, 75, 39], items: [POCION_ROJA, POCION_AZUL] },
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
        accesos: { hechizos: [], items: [POCION_ROJA, POCION_SUPER_FUERZA] },
    },
    {
        idClase: 4,
        nombre: "Asesino",
        idRaza: 1,
        cabezas: [3, 53],
        cuerpo: 21,
        // Set del Umbral.
        equipo: [1778, 1780, 1777, 1779],
        // Fuerza II, Celeridad II, Invisibilidad, Inmovilizar |
        // Restauración, Apocalipsis, Destello infernal, Paralizar, Remover Parálisis.
        hechizos: [22, 40, 14, 66, 60, 25, 73, 9, 10],
        accesos: { hechizos: [10, 9, 73, 60], items: [POCION_ROJA, POCION_AZUL] },
    },
    {
        idClase: 6,
        nombre: "Bardo",
        idRaza: 2,
        cabezas: [101, 119],
        cuerpo: 21,
        // Set Bardo.
        equipo: [1766, 1768, 1765, 1767],
        // Ceguera, Estupidez, Fuerza II, Celeridad II, Invisibilidad, Inmovilizar |
        // Curación Milagrosa, MINIApocalipsis, Apocalipsis, Paralizar, Remover Parálisis.
        hechizos: [30, 31, 22, 40, 14, 66, 32, 33, 25, 9, 10],
        accesos: { hechizos: [10, 9, 25, 32], items: [POCION_ROJA, POCION_AZUL] },
    },
    {
        idClase: 7,
        nombre: "Druida",
        idRaza: 2,
        cabezas: [101, 119],
        cuerpo: 21,
        // Set Silvestre y Anillo de Energía.
        equipo: [1754, 1756, 1753, 1755, 1221],
        // Fuerza II, Celeridad II, Invisibilidad, Implosión, Apocalipsis, Enredar |
        // Curación Milagrosa, Lluvia Arcana, Lluvia de Sangre, Paralizar, Remover Parálisis.
        hechizos: [22, 40, 14, 41, 25, 49, 32, 84, 44, 9, 10],
        accesos: { hechizos: [10, 9, 44, 32], items: [POCION_ROJA, POCION_AZUL] },
    },
    {
        idClase: 8,
        nombre: "Paladín",
        idRaza: 1,
        cabezas: [3, 53],
        cuerpo: 21,
        // Set Paladín.
        equipo: [1762, 1764, 1761, 1763],
        // Fuerza II, Celeridad II, Invisibilidad, Inmovilizar |
        // Restauración, MINIApocalipsis, Apocalipsis, Paralizar, Remover Parálisis.
        hechizos: [22, 40, 14, 66, 60, 33, 25, 9, 10],
        accesos: { hechizos: [10, 9, 25, 60], items: [POCION_ROJA, POCION_AZUL] },
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
        accesos: { hechizos: [], items: [1518, POCION_ROJA] },
    },
    {
        idClase: 18,
        nombre: "Pirata",
        idRaza: 3,
        cabezas: [202, 216],
        cuerpo: 32,
        // No tiene set: Espada, Casco y Escudo del Caído (legendarios) y Placas Azules.
        equipo: [1503, 705, 1490, 1466],
        // Bomba de Humo, Disparo Tóxico | Restauración, Disparo Certero, Disparo de Conmoción (paraliza).
        // El pirata no tiene Remover Parálisis y Disparo Certero es su único hechizo de daño.
        hechizos: [35, 46, 60, 72, 71],
        accesos: { hechizos: [71, 72, 60, 46], items: [POCION_ROJA, POCION_AZUL] },
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
        accesos: { hechizos: [], items: [1774, POCION_ROJA] },
    },
    {
        idClase: 22,
        nombre: "Chamán",
        idRaza: 2,
        cabezas: [101, 119],
        cuerpo: 21,
        // Set Elemental y Anillo de Energía.
        equipo: [1818, 1820, 1817, 1819, 1221],
        // Curar efectos, Invisibilidad, Evasión de viento, Escudo de energía, Escudo físico, Escudo mágico,
        // Prisión de agua, Ráfaga de viento, Rayo de Fuego, Descarga eléctrica, Rayo Eléctrico, Llamarada |
        // Ventisca, Incinerar, Petrificar (paraliza), Remover Parálisis. El chamán no tiene curaciones.
        hechizos: [1, 14, 83, 78, 77, 76, 80, 79, 63, 23, 64, 51, 62, 61, 65, 10],
        accesos: { hechizos: [10, 65, 61, 62], items: [POCION_ROJA, POCION_AZUL] },
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

    // Al final de la lista: el último hechizo queda en el último casillero.
    const spells: Record<string, { idSpell: number }> = {};
    const firstSlot = ARENA_SPELL_SLOTS - arenaClass.hechizos.length + 1;
    arenaClass.hechizos.forEach((idSpell, index) => {
        spells[String(firstSlot + index)] = { idSpell };
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
