// Modo Arena: todos contra todos, estilo argentumonline.io. Las clases y su equipo salen de
// server/src/arenaClasses.ts: si cambia algo allá, hay que cambiarlo acá (la apariencia es la de los anim de cada pieza).

export type ArenaClassOption = {
    idClase: number;
    nombre: string;
    raza: string;
    /** Por qué esa raza, en pocas palabras (docs/balance/RAZAS.md). */
    porQueRaza: string;
    equipo: string;
    destacado: string;
    look: {
        bodyId: number;
        headId: number;
        weaponId: number;
        shieldId: number;
        helmetId: number;
    };
};

export const ARENA_CLASSES: ArenaClassOption[] = [
    {
        idClase: 1,
        nombre: "Mago",
        raza: "Humano",
        porQueRaza:
            "La mejor raza que puede ponerse el set: 5% de resistencia mágica y remover a mitad de maná.",
        equipo: "Set Arcano y Anillo de Energía",
        destacado: "Llama de Dragón, Apocalipsis, Implosión",
        look: {
            bodyId: 556,
            headId: 3,
            weaponId: 77,
            shieldId: 40,
            helmetId: 44,
        },
    },
    {
        idClase: 2,
        nombre: "Clérigo",
        raza: "Humano",
        porQueRaza:
            "La mejor raza que puede ponerse el set: 5% de resistencia mágica y remover a mitad de maná.",
        equipo: "Set Templario",
        destacado: "Martillo de luz celestial, Purificar, Curación Divina",
        look: {
            bodyId: 558,
            headId: 3,
            weaponId: 79,
            shieldId: 42,
            helmetId: 46,
        },
    },
    {
        idClase: 3,
        nombre: "Guerrero",
        raza: "Licántropo",
        porQueRaza: "Fuerza y agilidad altas, y golpes críticos de +20%.",
        equipo: "Set del Verdugo",
        destacado: "Cuerpo a cuerpo puro, la que más vida tiene",
        look: {
            bodyId: 561,
            headId: 900,
            weaponId: 82,
            shieldId: 45,
            helmetId: 49,
        },
    },
    {
        idClase: 4,
        nombre: "Asesino",
        raza: "Humano",
        porQueRaza:
            "Le da el maná para Destello infernal y la vida para aguantar.",
        equipo: "Set del Umbral",
        destacado: "Apuñalar, Destello infernal, Inmovilizar",
        look: {
            bodyId: 563,
            headId: 3,
            weaponId: 84,
            shieldId: 47,
            helmetId: 51,
        },
    },
    {
        idClase: 6,
        nombre: "Bardo",
        raza: "Elfo",
        porQueRaza: "Inteligencia y agilidad, y recupera maná al lanzar.",
        equipo: "Set Bardo",
        destacado: "Apocalipsis, Inmovilizar, Ceguera",
        look: {
            bodyId: 560,
            headId: 101,
            weaponId: 81,
            shieldId: 44,
            helmetId: 48,
        },
    },
    {
        idClase: 7,
        nombre: "Druida",
        raza: "Elfo",
        porQueRaza: "Inteligencia y agilidad, y recupera maná al lanzar.",
        equipo: "Set Silvestre y Anillo de Energía",
        destacado: "Enredar, Lluvia de Sangre, Implosión",
        look: {
            bodyId: 557,
            headId: 101,
            weaponId: 78,
            shieldId: 41,
            helmetId: 45,
        },
    },
    {
        idClase: 8,
        nombre: "Paladín",
        raza: "Humano",
        porQueRaza:
            "La raza más pareja para pegar y lanzar: 5% de resistencia mágica.",
        equipo: "Set Paladín",
        destacado: "Apocalipsis, Restauración, Inmovilizar",
        look: {
            bodyId: 559,
            headId: 3,
            weaponId: 80,
            shieldId: 43,
            helmetId: 47,
        },
    },
    {
        idClase: 9,
        nombre: "Cazador",
        raza: "Orco",
        porQueRaza:
            "Fuerza y constitución, y 10% de ignorar un hechizo dañino.",
        equipo: "Arco, casco y escudo del Caído y Placas Doradas",
        destacado: "Arco con Flecha Del Diablo",
        look: {
            bodyId: 208,
            headId: 601,
            weaponId: 7,
            shieldId: 2,
            helmetId: 2,
        },
    },
    {
        idClase: 18,
        nombre: "Pirata",
        raza: "Elfo Oscuro",
        porQueRaza: "La agilidad que necesita el pirata, y +5% de evasión.",
        equipo: "Espada, casco y escudo del Caído y Placas Azules",
        destacado: "Disparo Certero, Disparo de Conmoción, Bomba de Humo",
        look: {
            bodyId: 184,
            headId: 202,
            weaponId: 47,
            shieldId: 2,
            helmetId: 2,
        },
    },
    {
        idClase: 20,
        nombre: "Arquero",
        raza: "Orco",
        porQueRaza:
            "Fuerza y constitución, y 10% de ignorar un hechizo dañino.",
        equipo: "Set Silvano",
        destacado: "Arco Silvano con Flecha De Los Dioses",
        look: {
            bodyId: 562,
            headId: 601,
            weaponId: 83,
            shieldId: 46,
            helmetId: 50,
        },
    },
    {
        idClase: 22,
        nombre: "Chamán",
        raza: "Elfo",
        porQueRaza: "Inteligencia y agilidad, y recupera maná al lanzar.",
        equipo: "Set Elemental y Anillo de Energía",
        destacado: "Incinerar, Ventisca, Prisión de agua",
        look: {
            bodyId: 403,
            headId: 101,
            weaponId: 85,
            shieldId: 3,
            helmetId: 38,
        },
    },
];

export function getArenaClassOption(idClase: number) {
    return ARENA_CLASSES.find((option) => option.idClase === idClase);
}

export type ArenaLiveEntry = {
    nombre: string;
    idClase: number;
    puntos: number;
    kills: number;
    muertes: number;
};

export type ArenaRankingEntry = {
    nombre: string;
    kills: number;
    muertes: number;
    mejorPuntaje: number;
    mejorRacha: number;
};

export type ArenaOverviewResponse = {
    enVivo: {
        jugadores: number;
        top: ArenaLiveEntry[];
        actualizado: string | null;
    };
    ranking: ArenaRankingEntry[];
};

export type ArenaGameTicketResponse = {
    ticket: string;
    expiresAt: string;
};
