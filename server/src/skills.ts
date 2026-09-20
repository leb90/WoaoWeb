export {};

const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const { getCharacterById, getClientById } = require("./runtimeRegistry");

const NUM_SKILLS = 31;
const MAX_SKILL_POINTS = 200;
const CREATE_SKILL_POINTS = 10;
const LEVEL_UP_SKILL_POINTS = 5;
const TRAIN_ROLL_MAX = 8;
const TRAIN_SUCCESS_BELOW = 5;

const SKILLS = {
    suerte: 1,
    magia: 2,
    robar: 3,
    tacticas: 4,
    armas: 5,
    meditar: 6,
    apunalar: 7,
    ocultarse: 8,
    supervivencia: 9,
    talar: 10,
    comerciar: 11,
    defensa: 12,
    pesca: 13,
    mineria: 14,
    carpinteria: 15,
    herreria: 16,
    liderazgo: 17,
    domar: 18,
    proyectiles: 19,
    dobleArma: 20,
    navegacion: 21,
    danoMagia: 22,
    defMagia: 23,
    evitaMagia: 24,
    danoArma: 25,
    defArma: 26,
    requeArma: 27,
    danoProyec: 28,
    defProyec: 29,
    requeProyec: 30,
    evitarProyec: 31,
};

const SKILL_NAMES = [
    "Suerte",
    "Aprendizaje de Magias",
    "Robar",
    "Esquivar Cuerpo/Cuerpo",
    "Golpear Cuerpo/Cuerpo",
    "Meditar",
    "Apuñalar",
    "Ocultarse",
    "Supervivencia",
    "Talar arboles",
    "Comercio",
    "Defensa con escudos",
    "Pesca",
    "Mineria",
    "Carpinteria",
    "Herreria",
    "Liderazgo",
    "Domar Criaturas",
    "Golpeo con Proyectiles",
    "Golpeo con Armas Dobles",
    "Navegacion",
    "Daños en Magia",
    "Defensa en Magias",
    "Esquivar Magias",
    "Daño en Armas",
    "Defensa en Armas",
    "Aprendizaje de Armas",
    "Daño de Proyectiles",
    "Defensa de Proyectiles",
    "Aprendizaje de Proyectiles",
    "Esquivar Proyectiles",
];

function isWorkerClass(idClase: number) {
    return (
        idClase === vars.clases.pescador ||
        idClase === vars.clases.herrero ||
        idClase === vars.clases.lenador ||
        idClase === vars.clases.minero ||
        idClase === vars.clases.carpintero ||
        idClase === vars.clases.ermitano ||
        idClase === vars.clases.domador
    );
}

function getLevelSkillCap(level: number) {
    const safeLevel = Math.max(0, Math.floor(Number(level) || 0));

    if (safeLevel <= 0) {
        return 0;
    }

    if (safeLevel <= 18) {
        return safeLevel * 5;
    }

    if (safeLevel === 19) {
        return 100;
    }

    if (safeLevel <= 38) {
        return 100 + (safeLevel - 19) * 5;
    }

    return MAX_SKILL_POINTS;
}

function getLevelUpSkillPoints(idClase: number) {
    return isWorkerClass(idClase) ? LEVEL_UP_SKILL_POINTS * 2 : LEVEL_UP_SKILL_POINTS;
}

function getAccumulatedSkillPts(level: number, idClase: number) {
    return CREATE_SKILL_POINTS + getLevelUpSkillPoints(idClase) * Math.max(0, Math.floor(Number(level) || 1) - 1);
}

function createEmptySkills() {
    return Array.from({ length: NUM_SKILLS }, () => 0);
}

function normalizeSkills(raw: unknown) {
    const values = createEmptySkills();

    if (Array.isArray(raw)) {
        for (let index = 0; index < NUM_SKILLS; index++) {
            values[index] = clampSkillValue(raw[index]);
        }
        return values;
    }

    if (raw && typeof raw === "object") {
        for (let skillId = 1; skillId <= NUM_SKILLS; skillId++) {
            const record = raw as Record<string, unknown>;
            values[skillId - 1] = clampSkillValue(record[String(skillId)] ?? record[String(skillId - 1)]);
        }
    }

    return values;
}

function clampSkillValue(value: unknown) {
    const parsed = Math.floor(Number(value) || 0);
    return Math.max(0, Math.min(MAX_SKILL_POINTS, parsed));
}

function isValidSkillId(skillId: number) {
    return Number.isInteger(skillId) && skillId >= 1 && skillId <= NUM_SKILLS;
}

type SkillUser = {
    id?: unknown;
    skills?: unknown;
    skillPts?: unknown;
    level?: number;
    idClase?: number;
    exp?: number;
};

function isSkillsInitialized(user: { skills?: unknown; skillPts?: unknown }) {
    return Array.isArray(user.skills) && user.skills.length === NUM_SKILLS && user.skillPts != null;
}

function ensureSkills(user: SkillUser | null): number[] {
    if (!user) {
        return createEmptySkills();
    }

    if (!isSkillsInitialized(user)) {
        user.skills = createEmptySkills();
        user.skillPts = getAccumulatedSkillPts(Number(user.level ?? 1), Number(user.idClase ?? 0));
        return user.skills as number[];
    }

    user.skills = normalizeSkills(user.skills);
    user.skillPts = Math.max(0, Math.floor(Number(user.skillPts) || 0));
    return user.skills as number[];
}

function getSkill(user: SkillUser | null, skillId: number) {
    if (!user || !isValidSkillId(skillId)) {
        return 0;
    }

    const skills = ensureSkills(user);
    return skills[skillId - 1] ?? 0;
}

function getSkillName(skillId: number) {
    return SKILL_NAMES[skillId - 1] ?? "Skill";
}

function sendSkillsState(user: SkillUser) {
    const client = getClientById(user?.id);

    if (!client) {
        return;
    }

    handleProtocol.skillsState(
        {
            skillPts: Math.max(0, Math.floor(Number(user.skillPts) || 0)),
            values: ensureSkills(user),
        },
        client,
    );
}

function assignSkillPoint(user: SkillUser | null, skillId: number) {
    if (!user || !isValidSkillId(skillId)) {
        return false;
    }

    ensureSkills(user);

    if (Number(user.skillPts) < 1) {
        return false;
    }

    if (getSkill(user, skillId) >= MAX_SKILL_POINTS) {
        return false;
    }

    user.skillPts = Number(user.skillPts) - 1;
    (user.skills as number[])[skillId - 1] += 1;
    persistSkills(user);
    return true;
}

function grantLevelUpSkillPoints(user: SkillUser | null) {
    if (!user) {
        return 0;
    }

    ensureSkills(user);
    const points = getLevelUpSkillPoints(Number(user.idClase ?? 0));
    user.skillPts = Number(user.skillPts) + points;
    persistSkills(user);
    return points;
}

function tryTrainSkill(user: SkillUser | null, skillId: number) {
    if (!user || !isValidSkillId(skillId)) {
        return null;
    }

    ensureSkills(user);

    const current = getSkill(user, skillId);

    if (current >= MAX_SKILL_POINTS) {
        return null;
    }

    if (current >= getLevelSkillCap(Number(user.level ?? 0))) {
        return null;
    }

    const roll = Math.floor(Math.random() * TRAIN_ROLL_MAX) + 1;

    if (roll >= TRAIN_SUCCESS_BELOW) {
        return null;
    }

    (user.skills as number[])[skillId - 1] = current + 1;
    const value = current + 1;

    return {
        skillId,
        skillName: getSkillName(skillId),
        value,
        expGain: value,
    };
}

function persistSkills(user: { id?: unknown } | null) {
    if (!user?.id) {
        return;
    }

    const game = require("./game");

    void game.persistCharacterSnapshot(user, { connected: true }).catch((error: unknown) => {
        console.error("[skills] No se pudieron persistir los skills", error);
    });
}

function getOldGatherSuerte(skill: number, kind: "pesca" | "talar" | "mineria") {
    const value = Math.max(0, Math.floor(Number(skill) || 0));

    if (kind === "pesca") {
        if (value >= 200) {
            return 12;
        }
        if (value >= 181) {
            return 13;
        }
        if (value >= 161) {
            return 14;
        }
        if (value >= 141) {
            return 16;
        }
        if (value >= 121) {
            return 18;
        }
        if (value >= 101) {
            return 20;
        }
        if (value >= 81) {
            return 22;
        }
        if (value >= 61) {
            return 24;
        }
        if (value >= 41) {
            return 28;
        }
        if (value >= 21) {
            return 30;
        }
        return 35;
    }

    if (value >= 200) {
        return 7;
    }
    if (value >= 181) {
        return 10;
    }
    if (value >= 161) {
        return kind === "mineria" ? 12 : 13;
    }
    if (value >= 141) {
        return 15;
    }
    if (value >= 121) {
        return 18;
    }
    if (value >= 101) {
        return 20;
    }
    if (value >= 81) {
        return 22;
    }
    if (value >= 61) {
        return 24;
    }
    if (value >= 41) {
        return 28;
    }
    if (value >= 21) {
        return 30;
    }
    return 35;
}

function rollOldGatherSuccess(skill: number, kind: "pesca" | "talar" | "mineria") {
    const suerte = getOldGatherSuerte(skill, kind);
    const roll = Math.floor(Math.random() * suerte) + 1;
    return kind === "pesca" ? roll < 11 : roll < 6;
}

function applyTraining(user: SkillUser | null, skillId: number) {
    const result = tryTrainSkill(user, skillId);

    if (!result || !user) {
        return false;
    }

    user.exp = Math.max(0, Number(user.exp ?? 0) + result.expGain);

    const client = getClientById(user.id);

    if (client) {
        handleProtocol.console(
            `¡Has mejorado tu skill ${result.skillName} en un punto!. Ahora tienes ${result.value} pts.`,
            "white",
            0,
            0,
            client,
        );
        handleProtocol.console(`¡Has ganado ${result.expGain} puntos de experiencia!`, "red", 1, 0, client);
        handleProtocol.skillsState(
            {
                skillPts: Math.max(0, Math.floor(Number(user.skillPts) || 0)),
                values: ensureSkills(user),
            },
            client,
        );
    }

    const game = require("./game");
    game.checkUserLevel(user.id);
    persistSkills(user);
    return true;
}

module.exports = {
    NUM_SKILLS,
    MAX_SKILL_POINTS,
    SKILLS,
    SKILL_NAMES,
    isWorkerClass,
    getLevelSkillCap,
    getLevelUpSkillPoints,
    getAccumulatedSkillPts,
    createEmptySkills,
    normalizeSkills,
    ensureSkills,
    getSkill,
    getSkillName,
    sendSkillsState,
    assignSkillPoint,
    grantLevelUpSkillPoints,
    tryTrainSkill,
    applyTraining,
    rollOldGatherSuccess,
};
