export type CharacterClassKey =
    | "mago"
    | "clerigo"
    | "guerrero"
    | "asesino"
    | "ladron"
    | "bardo"
    | "druida"
    | "bandido"
    | "paladin"
    | "cazador"
    | "pescador"
    | "herrero"
    | "lenador"
    | "minero"
    | "carpintero"
    | "pirata"
    | "ermitano"
    | "arquero"
    | "domador";

export type RaceKey =
    | "humano"
    | "elfo"
    | "elfoDrow"
    | "enano"
    | "gnomo"
    | "orco"
    | "vampiro"
    | "abisario"
    | "goblin"
    | "tauros"
    | "licantropo"
    | "nomuerto";

export type GenderKey = "male" | "female";
export type FactionKey = "alianza" | "horda";

export type BaseStats = {
    fuerza: number;
    agilidad: number;
    inteligencia: number;
    carisma: number;
    constitucion: number;
    vida: number;
    mana: number;
    golpeMin: number;
    golpeMax: number;
    expProximoNivel: number;
};

export type RaceBonus = {
    fuerza: number;
    agilidad: number;
    inteligencia: number;
    carisma: number;
    constitucion: number;
};

export type CharacterClassOption = {
    key: CharacterClassKey;
    label: string;
    summary: string;
    icon: string;
};

type ClassProgress = {
    vida: number;
    manaInicial: number;
    multMana: number;
    hitPre36: number;
    hitPost36: number;
};

export type ClassCombatMods = {
    evasion: number;
    aciertoArmas: number;
    aciertoProyectiles: number;
    danoArmas: number;
    danoProyectiles: number;
    escudos: number;
    danoMagia: number;
    resistMagia: number;
};

export type CombatPreview = {
    aciertoArmas: number;
    aciertoProyectiles: number;
    danoArmas: number;
    danoProyectiles: number;
    evasion: number;
    defensaFisica: number;
    defensaEscudos: number;
    resistMagia: number;
    danoMagia: number;
};

type RaceGenderConfig = {
    bodyId: number;
    startHeadId: number;
    endHeadId: number;
};

export type RaceOption = {
    key: RaceKey;
    label: string;
    summary: string;
    faction: FactionKey;
    bonus: RaceBonus;
    genders: Record<GenderKey, RaceGenderConfig>;
};

const BASE_STAT = 18;

export const CLASS_ID_MAP: Record<CharacterClassKey, number> = {
    mago: 1,
    clerigo: 2,
    guerrero: 3,
    asesino: 4,
    ladron: 5,
    bardo: 6,
    druida: 7,
    paladin: 8,
    cazador: 9,
    bandido: 12,
    pescador: 13,
    herrero: 14,
    lenador: 15,
    minero: 16,
    carpintero: 17,
    pirata: 18,
    ermitano: 19,
    arquero: 20,
    domador: 21,
};

export const RACE_ID_MAP: Record<RaceKey, number> = {
    humano: 1,
    elfo: 2,
    elfoDrow: 3,
    enano: 4,
    gnomo: 5,
    orco: 6,
    vampiro: 7,
    abisario: 8,
    goblin: 9,
    tauros: 10,
    licantropo: 11,
    nomuerto: 12,
};

export const characterClassOptions: CharacterClassOption[] = [
    { key: "mago", label: "Mago", icon: "✦", summary: "Con poderosas capacidades mágicas, pero físicamente inferior." },
    { key: "clerigo", label: "Clerigo", icon: "✚", summary: "Balance entre magia y combate. Curación Divina y Purificar." },
    { key: "guerrero", label: "Guerrero", icon: "⚔", summary: "Centrado en combate, sin magia. Un golpe puede decidir la pelea." },
    { key: "asesino", label: "Asesino", icon: "🗡", summary: "Poco maná, dagas y apuñalada. Extra de daño por la espalda." },
    { key: "ladron", label: "Ladron", icon: "👜", summary: "Experto en robar objetos y oro de otros personajes." },
    { key: "bardo", label: "Bardo", icon: "♫", summary: "Inmune a estupidez, ceguera y paranoia. Gran evasión." },
    { key: "druida", label: "Druida", icon: "❀", summary: "Casi tan fuerte en magia como el mago. Enredar no gasta maná." },
    { key: "bandido", label: "Bandido", icon: "☠", summary: "Silencioso y traicionero." },
    { key: "paladin", label: "Paladin", icon: "🛡", summary: "Resistente y fuerte, poco maná. Resucitar devuelve el maná." },
    { key: "cazador", label: "Cazador", icon: "➳", summary: "Resistente con arco y flecha. Menos daño que un Arquero." },
    { key: "pescador", label: "Pescador", icon: "🎣", summary: "Pesca peces y cofres de las profundidades." },
    { key: "herrero", label: "Herrero", icon: "⚒", summary: "Experto en forja de armas y armaduras." },
    { key: "lenador", label: "Leñador", icon: "🪓", summary: "Experto en la tala de árboles." },
    { key: "minero", label: "Minero", icon: "⛏", summary: "Extrae minerales y puede crear lingotes." },
    { key: "carpintero", label: "Carpintero", icon: "🪵", summary: "Trabaja la madera para crear objetos." },
    { key: "pirata", label: "Pirata", icon: "☠", summary: "Golpe y resistencia cercanos al Guerrero. No remueve parálisis." },
    { key: "ermitano", label: "Ermitaño", icon: "🕯", summary: "Clase aislada, equilibrio entre supervivencia y magia menor." },
    { key: "arquero", label: "Arquero", icon: "🏹", summary: "Gran daño con arco y flechas, pero poca vida." },
    { key: "domador", label: "Domador", icon: "🐾", summary: "Controla criaturas. Débil en combate directo." },
];

const classProgressByKey: Record<CharacterClassKey, ClassProgress> = {
    mago: { vida: 7.5, manaInicial: 8.33, multMana: 2.65, hitPre36: 1, hitPost36: 1 },
    clerigo: { vida: 8.5, manaInicial: 2.5, multMana: 2, hitPre36: 2, hitPost36: 2 },
    guerrero: { vida: 10.5, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    asesino: { vida: 9, manaInicial: 2.5, multMana: 1, hitPre36: 3, hitPost36: 2 },
    ladron: { vida: 8, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    bardo: { vida: 8.5, manaInicial: 2.5, multMana: 2, hitPre36: 2, hitPost36: 2 },
    druida: { vida: 8.5, manaInicial: 2.5, multMana: 2, hitPre36: 2, hitPost36: 2 },
    bandido: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    paladin: { vida: 10, manaInicial: 2.5, multMana: 1, hitPre36: 3, hitPost36: 2 },
    cazador: { vida: 10, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    pescador: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    herrero: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    lenador: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    minero: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    carpintero: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    pirata: { vida: 10, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    ermitano: { vida: 8.5, manaInicial: 2.5, multMana: 1, hitPre36: 2, hitPost36: 2 },
    arquero: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    domador: { vida: 9, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
};

export const classCombatMods: Record<CharacterClassKey, ClassCombatMods> = {
    mago: { evasion: 80, aciertoArmas: 50, aciertoProyectiles: 50, danoArmas: 50, danoProyectiles: 50, escudos: 60, danoMagia: 120, resistMagia: 120 },
    guerrero: { evasion: 100, aciertoArmas: 100, aciertoProyectiles: 80, danoArmas: 110, danoProyectiles: 100, escudos: 100, danoMagia: 90, resistMagia: 90 },
    cazador: { evasion: 90, aciertoArmas: 80, aciertoProyectiles: 120, danoArmas: 90, danoProyectiles: 90, escudos: 80, danoMagia: 90, resistMagia: 90 },
    paladin: { evasion: 90, aciertoArmas: 85, aciertoProyectiles: 75, danoArmas: 90, danoProyectiles: 80, escudos: 100, danoMagia: 90, resistMagia: 90 },
    bandido: { evasion: 90, aciertoArmas: 85, aciertoProyectiles: 90, danoArmas: 80, danoProyectiles: 75, escudos: 80, danoMagia: 90, resistMagia: 90 },
    asesino: { evasion: 110, aciertoArmas: 85, aciertoProyectiles: 75, danoArmas: 90, danoProyectiles: 80, escudos: 80, danoMagia: 100, resistMagia: 100 },
    pirata: { evasion: 100, aciertoArmas: 95, aciertoProyectiles: 85, danoArmas: 90, danoProyectiles: 85, escudos: 85, danoMagia: 90, resistMagia: 90 },
    ladron: { evasion: 110, aciertoArmas: 75, aciertoProyectiles: 80, danoArmas: 80, danoProyectiles: 75, escudos: 70, danoMagia: 90, resistMagia: 90 },
    bardo: { evasion: 120, aciertoArmas: 80, aciertoProyectiles: 70, danoArmas: 80, danoProyectiles: 70, escudos: 75, danoMagia: 110, resistMagia: 110 },
    clerigo: { evasion: 80, aciertoArmas: 70, aciertoProyectiles: 70, danoArmas: 80, danoProyectiles: 70, escudos: 90, danoMagia: 110, resistMagia: 110 },
    druida: { evasion: 80, aciertoArmas: 70, aciertoProyectiles: 75, danoArmas: 75, danoProyectiles: 75, escudos: 75, danoMagia: 100, resistMagia: 100 },
    arquero: { evasion: 80, aciertoArmas: 50, aciertoProyectiles: 120, danoArmas: 50, danoProyectiles: 130, escudos: 60, danoMagia: 90, resistMagia: 90 },
    pescador: { evasion: 80, aciertoArmas: 60, aciertoProyectiles: 65, danoArmas: 60, danoProyectiles: 60, escudos: 70, danoMagia: 90, resistMagia: 90 },
    lenador: { evasion: 80, aciertoArmas: 60, aciertoProyectiles: 70, danoArmas: 70, danoProyectiles: 60, escudos: 70, danoMagia: 90, resistMagia: 90 },
    minero: { evasion: 80, aciertoArmas: 60, aciertoProyectiles: 65, danoArmas: 75, danoProyectiles: 70, escudos: 70, danoMagia: 90, resistMagia: 90 },
    herrero: { evasion: 80, aciertoArmas: 60, aciertoProyectiles: 65, danoArmas: 75, danoProyectiles: 70, escudos: 70, danoMagia: 90, resistMagia: 90 },
    carpintero: { evasion: 80, aciertoArmas: 60, aciertoProyectiles: 70, danoArmas: 70, danoProyectiles: 70, escudos: 70, danoMagia: 90, resistMagia: 90 },
    ermitano: { evasion: 80, aciertoArmas: 80, aciertoProyectiles: 75, danoArmas: 80, danoProyectiles: 75, escudos: 80, danoMagia: 90, resistMagia: 90 },
    domador: { evasion: 80, aciertoArmas: 50, aciertoProyectiles: 50, danoArmas: 50, danoProyectiles: 50, escudos: 60, danoMagia: 90, resistMagia: 90 },
};

export const raceOptions: RaceOption[] = [
    {
        key: "humano",
        label: "Humano",
        faction: "alianza",
        summary: "Los humanos tienen 5% de resistencia mágica y el hechizo Remover Paralisis consume 50% menos de mana.",
        bonus: { fuerza: 2, inteligencia: 1, agilidad: 1, carisma: 0, constitucion: 2 },
        genders: {
            male: { bodyId: 21, startHeadId: 3, endHeadId: 53 },
            female: { bodyId: 39, startHeadId: 70, endHeadId: 82 },
        },
    },
    {
        key: "elfo",
        label: "Elfo",
        faction: "alianza",
        summary: "Los elfos tienen 10% probabilidad de restaurar un 15% de su mana total, al lanzar cualquier hechizo.",
        bonus: { fuerza: -1, inteligencia: 2, agilidad: 3, carisma: 2, constitucion: 1 },
        genders: {
            male: { bodyId: 21, startHeadId: 101, endHeadId: 119 },
            female: { bodyId: 39, startHeadId: 170, endHeadId: 180 },
        },
    },
    {
        key: "enano",
        label: "Enano",
        faction: "alianza",
        summary: "Los enanos cuando tienen menos de 33% de vida, su daño físico aumenta un 50%.",
        bonus: { fuerza: 3, inteligencia: -2, agilidad: 0, carisma: 0, constitucion: 3 },
        genders: {
            male: { bodyId: 53, startHeadId: 401, endHeadId: 411 },
            female: { bodyId: 60, startHeadId: 470, endHeadId: 476 },
        },
    },
    {
        key: "gnomo",
        label: "Gnomo",
        faction: "alianza",
        summary: "Los gnomos tienen un 10% de evasión extra.",
        bonus: { fuerza: -2, inteligencia: 4, agilidad: 3, carisma: 0, constitucion: 0 },
        genders: {
            male: { bodyId: 53, startHeadId: 301, endHeadId: 315 },
            female: { bodyId: 60, startHeadId: 370, endHeadId: 373 },
        },
    },
    {
        key: "tauros",
        label: "Tauros",
        faction: "alianza",
        summary: "Los Tauros tienen 5% de resistencia mágica, 5% de resistencia física y 5% de resistencia a flechas.",
        bonus: { fuerza: 2, inteligencia: -1, agilidad: 3, carisma: 0, constitucion: 2 },
        genders: {
            male: { bodyId: 529, startHeadId: 920, endHeadId: 923 },
            female: { bodyId: 528, startHeadId: 910, endHeadId: 913 },
        },
    },
    {
        key: "abisario",
        label: "Abisario",
        faction: "alianza",
        summary: "Poseen un 10% de probabilidad al recibir un golpe mortal, quedar en 1 de vida, evitando la muerte.",
        bonus: { fuerza: 3, inteligencia: 0, agilidad: 1, carisma: 0, constitucion: 1 },
        genders: {
            male: { bodyId: 488, startHeadId: 801, endHeadId: 804 },
            female: { bodyId: 486, startHeadId: 851, endHeadId: 853 },
        },
    },
    {
        key: "elfoDrow",
        label: "Elfo Oscuro",
        faction: "horda",
        summary: "Los elfos de la noche poseen 3% de evasión extra y 2% de daño extra con arcos.",
        bonus: { fuerza: 2, inteligencia: -1, agilidad: 3, carisma: 0, constitucion: 2 },
        genders: {
            male: { bodyId: 32, startHeadId: 201, endHeadId: 216 },
            female: { bodyId: 40, startHeadId: 270, endHeadId: 277 },
        },
    },
    {
        key: "orco",
        label: "Orco",
        faction: "horda",
        summary: "Los Orcos tienen 10% de probabilidad de evitar hechizos dañinos.",
        bonus: { fuerza: 3, inteligencia: -2, agilidad: 0, carisma: 0, constitucion: 3 },
        genders: {
            male: { bodyId: 215, startHeadId: 601, endHeadId: 606 },
            female: { bodyId: 217, startHeadId: 607, endHeadId: 609 },
        },
    },
    {
        key: "vampiro",
        label: "Vampiro",
        faction: "horda",
        summary: "Los Vampiros tienen 10% probabilidad de restaurar un 15% de su vida total, al recibir cualquier tipo de daño.",
        bonus: { fuerza: -1, inteligencia: 2, agilidad: 3, carisma: 2, constitucion: 1 },
        genders: {
            male: { bodyId: 32, startHeadId: 505, endHeadId: 512 },
            female: { bodyId: 40, startHeadId: 501, endHeadId: 503 },
        },
    },
    {
        key: "goblin",
        label: "Goblin",
        faction: "horda",
        summary: "Los goblins tienen 15% de probabilidad de evitar ser paralizados.",
        bonus: { fuerza: -2, inteligencia: 4, agilidad: 3, carisma: 0, constitucion: 0 },
        genders: {
            male: { bodyId: 178, startHeadId: 705, endHeadId: 712 },
            female: { bodyId: 212, startHeadId: 701, endHeadId: 704 },
        },
    },
    {
        key: "licantropo",
        label: "Licantropo",
        faction: "horda",
        summary: "Los licantropos tienen probabilidad de acertar golpes críticos con daño cuerpo a cuerpo y con arcos.",
        bonus: { fuerza: 3, inteligencia: 0, agilidad: 1, carisma: 0, constitucion: 1 },
        genders: {
            male: { bodyId: 531, startHeadId: 900, endHeadId: 903 },
            female: { bodyId: 530, startHeadId: 890, endHeadId: 893 },
        },
    },
    {
        key: "nomuerto",
        label: "No-Muerto",
        faction: "horda",
        summary: "Los No-Muertos tienen 10% de resistencia a los daños con flechas y el hechizo Paralizar consume 50% menos de mana.",
        bonus: { fuerza: 2, inteligencia: 1, agilidad: 1, carisma: 0, constitucion: 2 },
        genders: {
            male: { bodyId: 527, startHeadId: 860, endHeadId: 863 },
            female: { bodyId: 526, startHeadId: 880, endHeadId: 883 },
        },
    },
];

const MAX_LEVEL = 50;
const LAST_LEGACY_EXP_LEVEL = 46;

export function getAlianzaRaces(): RaceOption[] {
    return raceOptions.filter((race) => race.faction === "alianza");
}

export function getHordaRaces(): RaceOption[] {
    return raceOptions.filter((race) => race.faction === "horda");
}

export function getClassOption(key: CharacterClassKey): CharacterClassOption {
    const option = characterClassOptions.find((item) => item.key === key);
    if (!option) {
        throw new Error(`Unknown class: ${key}`);
    }
    return option;
}

export function getRaceOption(key: RaceKey): RaceOption {
    const option = raceOptions.find((item) => item.key === key);
    if (!option) {
        throw new Error(`Unknown race: ${key}`);
    }
    return option;
}

export function getRaceAppearance(raceKey: RaceKey, genderKey: GenderKey) {
    return getRaceOption(raceKey).genders[genderKey];
}

export type ClassPreviewGear = {
    bodyId: number;
    weaponId: number;
    shieldId: number;
    helmetId: number;
};

type ClassOutfit = {
    weaponId: number;
    shieldId: number;
    helmetId: number;
    tallMale?: number;
    tallFemale?: number;
    short?: number;
};

const SHORT_RACES = new Set<RaceKey>(["enano", "gnomo", "goblin"]);

const CLASS_OUTFITS: Record<CharacterClassKey, ClassOutfit> = {
    mago: {
        weaponId: 14,
        shieldId: 0,
        helmetId: 11,
        tallMale: 50,
        tallFemale: 124,
        short: 22,
    },
    clerigo: {
        weaponId: 31,
        shieldId: 7,
        helmetId: 17,
        tallMale: 181,
        tallFemale: 181,
        short: 57,
    },
    guerrero: {
        weaponId: 1,
        shieldId: 33,
        helmetId: 6,
        tallMale: 113,
        tallFemale: 142,
        short: 103,
    },
    asesino: {
        weaponId: 11,
        shieldId: 0,
        helmetId: 0,
        tallMale: 46,
        tallFemale: 96,
        short: 38,
    },
    ladron: {
        weaponId: 11,
        shieldId: 0,
        helmetId: 0,
        tallMale: 190,
        tallFemale: 191,
        short: 155,
    },
    bardo: {
        weaponId: 5,
        shieldId: 3,
        helmetId: 0,
        tallMale: 63,
        tallFemale: 63,
        short: 52,
    },
    druida: {
        weaponId: 6,
        shieldId: 0,
        helmetId: 13,
        tallMale: 56,
        tallFemale: 56,
        short: 52,
    },
    bandido: {
        weaponId: 11,
        shieldId: 5,
        helmetId: 0,
        tallMale: 190,
        tallFemale: 191,
        short: 155,
    },
    paladin: {
        weaponId: 24,
        shieldId: 31,
        helmetId: 17,
        tallMale: 208,
        tallFemale: 208,
        short: 201,
    },
    cazador: {
        weaponId: 7,
        shieldId: 0,
        helmetId: 5,
        tallMale: 190,
        tallFemale: 191,
        short: 155,
    },
    pescador: {
        weaponId: 0,
        shieldId: 0,
        helmetId: 0,
        tallMale: 1,
        tallFemale: 44,
        short: 52,
    },
    herrero: {
        weaponId: 4,
        shieldId: 0,
        helmetId: 0,
        tallMale: 100,
        tallFemale: 100,
        short: 52,
    },
    lenador: {
        weaponId: 3,
        shieldId: 0,
        helmetId: 0,
        tallMale: 1,
        tallFemale: 44,
        short: 52,
    },
    minero: {
        weaponId: 4,
        shieldId: 0,
        helmetId: 0,
        tallMale: 100,
        tallFemale: 100,
        short: 52,
    },
    carpintero: {
        weaponId: 4,
        shieldId: 0,
        helmetId: 0,
        tallMale: 1,
        tallFemale: 44,
        short: 52,
    },
    pirata: {
        weaponId: 5,
        shieldId: 0,
        helmetId: 0,
        tallMale: 190,
        tallFemale: 191,
        short: 155,
    },
    ermitano: {
        weaponId: 6,
        shieldId: 0,
        helmetId: 0,
        tallMale: 47,
        tallFemale: 47,
        short: 52,
    },
    arquero: {
        weaponId: 7,
        shieldId: 0,
        helmetId: 0,
        tallMale: 190,
        tallFemale: 191,
        short: 155,
    },
    domador: {
        weaponId: 11,
        shieldId: 0,
        helmetId: 0,
        tallMale: 1,
        tallFemale: 44,
        short: 52,
    },
};

export function getClassCreationPreview(
    classKey: CharacterClassKey,
    raceKey: RaceKey,
    genderKey: GenderKey,
    fallbackBodyId: number,
): ClassPreviewGear {
    const outfit = CLASS_OUTFITS[classKey];
    const bodyId = SHORT_RACES.has(raceKey)
        ? (outfit.short ?? fallbackBodyId)
        : ((genderKey === "female" ? outfit.tallFemale : outfit.tallMale) ??
          fallbackBodyId);
    return {
        bodyId,
        weaponId: outfit.weaponId,
        shieldId: outfit.shieldId,
        helmetId: outfit.helmetId,
    };
}

export function getHeadIds(raceKey: RaceKey, genderKey: GenderKey): number[] {
    const appearance = getRaceAppearance(raceKey, genderKey);
    const headIds: number[] = [];
    for (let id = appearance.startHeadId; id <= appearance.endHeadId; id += 1) {
        headIds.push(id);
    }
    return headIds;
}

export function getFinalStats(raceKey: RaceKey): RaceBonus {
    const bonus = getRaceOption(raceKey).bonus;
    return {
        fuerza: BASE_STAT + bonus.fuerza,
        agilidad: BASE_STAT + bonus.agilidad,
        inteligencia: BASE_STAT + bonus.inteligencia,
        carisma: BASE_STAT + bonus.carisma,
        constitucion: BASE_STAT + bonus.constitucion,
    };
}

function clampLevel(level: number): number {
    return Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
}

function getLegacyExpNextLevelForLevel(level: number): number {
    const safeLevel = clampLevel(level);
    const expCurveLevel = Math.min(safeLevel, LAST_LEGACY_EXP_LEVEL);
    let expNextLevel = 300;

    for (let currentLevel = 2; currentLevel <= expCurveLevel; currentLevel += 1) {
        if (currentLevel < 15) {
            expNextLevel = Math.floor(expNextLevel * 1.4);
        } else if (currentLevel < 21) {
            expNextLevel = Math.floor(expNextLevel * 1.35);
        } else if (currentLevel < 33) {
            expNextLevel = Math.floor(expNextLevel * 1.3);
        } else if (currentLevel < 41) {
            expNextLevel = Math.floor(expNextLevel * 1.225);
        } else {
            expNextLevel = Math.floor(expNextLevel * 1.25);
        }
    }

    return expNextLevel;
}

function getHitModifierForLevel(classKey: CharacterClassKey, level: number): number {
    const safeLevel = clampLevel(level);
    const classProgress = classProgressByKey[classKey];
    if (safeLevel <= 1) {
        return 0;
    }
    if (safeLevel <= 36) {
        return (safeLevel - 1) * classProgress.hitPre36;
    }
    return 35 * classProgress.hitPre36 + (safeLevel - 36) * classProgress.hitPost36;
}

function getMaxHpForLevel(classKey: CharacterClassKey, constitucion: number, level: number): number {
    const safeLevel = clampLevel(level);
    const classProgress = classProgressByKey[classKey];
    const total =
        constitucion +
        (classProgress.vida - (21 - constitucion) * 0.5) * (safeLevel - 1);
    return Math.round(total);
}

function getMaxManaForLevel(classKey: CharacterClassKey, inteligencia: number, level: number): number {
    const safeLevel = clampLevel(level);
    const classProgress = classProgressByKey[classKey];
    const total =
        inteligencia * classProgress.manaInicial +
        classProgress.multMana * inteligencia * (safeLevel - 1);
    return Math.max(0, Math.round(total));
}

export function getBaseStats(characterClassKey: CharacterClassKey, raceKey: RaceKey): BaseStats {
    const finals = getFinalStats(raceKey);
    return {
        ...finals,
        vida: getMaxHpForLevel(characterClassKey, finals.constitucion, 1),
        mana: getMaxManaForLevel(characterClassKey, finals.inteligencia, 1),
        golpeMin: 1 + getHitModifierForLevel(characterClassKey, 1),
        golpeMax: 2 + getHitModifierForLevel(characterClassKey, 1),
        expProximoNivel: getLegacyExpNextLevelForLevel(1),
    };
}

export function getCombatPreview(
    characterClassKey: CharacterClassKey,
    raceKey: RaceKey,
): CombatPreview {
    const finals = getFinalStats(raceKey);
    const mods = classCombatMods[characterClassKey];
    const fuerzaEx = finals.fuerza;
    const agilidadEx = finals.agilidad;

    const danoArmasBase =
        3 * 3 + ((3 / 5) * (fuerzaEx - 15) + 2) * (mods.danoArmas / 100);
    const danoProyectilesBase =
        3 * 4 + ((3 / 5) * (fuerzaEx - 15) + 2) * (mods.danoProyectiles / 100);
    let danoMagia = 20 * (mods.danoMagia / 100);
    danoMagia += danoMagia * 0.03;

    return {
        aciertoArmas: Math.round(agilidadEx * (mods.aciertoArmas / 100)),
        aciertoProyectiles: Math.round(agilidadEx * (mods.aciertoProyectiles / 100)),
        danoArmas: Math.round(danoArmasBase),
        danoProyectiles: Math.round(danoProyectilesBase),
        evasion: Math.round(agilidadEx * (mods.evasion / 100)),
        defensaFisica: 20,
        defensaEscudos: Math.round((mods.escudos / 100) * 10),
        resistMagia: Math.round(20 * (mods.resistMagia / 100)),
        danoMagia: Math.round(danoMagia),
    };
}
