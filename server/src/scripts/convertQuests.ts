import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");
const OLD_DAT = path.join(ROOT, "old/Nuevo Motor Graf/Servidor 7.0/Dat");
const SERVER_JSONS = path.join(ROOT, "server/jsons");
const FRONT_INIT = path.join(ROOT, "frontend/public/init");
const API_JSONS = path.join(ROOT, "api/src/jsons");

type IniSection = Record<string, string>;
type IniFile = Record<string, IniSection>;
type JsonRecord = Record<string, Record<string, unknown>>;

export type QuestRequirement = {
    index: number;
    amount: number;
};

export type QuestDefinition = {
    id: number;
    name: string;
    desc: string;
    requiredLevel: number;
    requiredNpcs: QuestRequirement[];
    requiredObjs: QuestRequirement[];
    rewardGold: number;
    rewardExp: number;
    rewardPoints: number;
    rewardObjs: QuestRequirement[];
};

function readLatin1(filePath: string): string {
    return fs.readFileSync(filePath, "latin1");
}

function parseIni(content: string): IniFile {
    const result: IniFile = {};
    let current = "";

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("'") || line.startsWith(";")) {
            continue;
        }

        const sectionMatch = line.match(/^\[([^\]]+)]/);
        if (sectionMatch) {
            current = sectionMatch[1];
            result[current] ??= {};
            continue;
        }

        const eq = line.indexOf("=");
        if (eq < 0 || !current) {
            continue;
        }

        result[current][line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }

    return result;
}

function decodeLatin1(value: string): string {
    return value.replace(/^"+|"+$/g, "").replace(/\s+/g, " ").trim();
}

function toInt(value: string | undefined, fallback = 0): number {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePairs(section: IniSection, prefix: string, countKey: string): QuestRequirement[] {
    const count = toInt(section[countKey]);
    const pairs: QuestRequirement[] = [];

    for (let index = 1; index <= Math.max(count, 8); index += 1) {
        const raw = section[`${prefix}${index}`];
        if (!raw) {
            continue;
        }

        const [idRaw, amountRaw] = raw.split("-");
        const id = toInt(idRaw);
        const amount = toInt(amountRaw, 1);
        if (id > 0 && amount > 0) {
            pairs.push({ index: id, amount });
        }
    }

    return pairs;
}

function convertQuests(): Record<string, QuestDefinition> {
    const ini = parseIni(readLatin1(path.join(OLD_DAT, "QUESTS.DAT")));
    const quests: Record<string, QuestDefinition> = {};

    for (const [sectionName, section] of Object.entries(ini)) {
        const match = sectionName.match(/^QUEST(\d+)$/i);
        if (!match) {
            continue;
        }

        const id = Number(match[1]);
        quests[String(id)] = {
            id,
            name: decodeLatin1(section.Nombre ?? `Mision ${id}`),
            desc: decodeLatin1(section.Desc ?? ""),
            requiredLevel: toInt(section.RequiredLevel, 1),
            requiredNpcs: parsePairs(section, "RequiredNPC", "RequiredNPCs"),
            requiredObjs: parsePairs(section, "RequiredOBJ", "RequiredOBJs"),
            rewardGold: toInt(section.RewardGLD),
            rewardExp: toInt(section.RewardEXP),
            rewardPoints: toInt(section.RewardDragPoints),
            rewardObjs: parsePairs(section, "RewardOBJ", "RewardOBJs"),
        };
    }

    return quests;
}

function convertQuestGivers(): Record<string, number> {
    const ini = parseIni(readLatin1(path.join(OLD_DAT, "NPCs.dat")));
    const givers: Record<string, number> = {};

    for (const [sectionName, section] of Object.entries(ini)) {
        const match = sectionName.match(/^NPC(\d+)$/i);
        if (!match) {
            continue;
        }

        const questNumber = toInt(section.QuestNumber);
        if (questNumber > 0) {
            givers[match[1]] = questNumber;
        }
    }

    return givers;
}

function patchNpcQuestNumbers(filePath: string, givers: Record<string, number>): number {
    if (!fs.existsSync(filePath)) {
        return 0;
    }

    const npcs = JSON.parse(fs.readFileSync(filePath, "utf8")) as JsonRecord;
    let patched = 0;

    for (const [npcId, questNumber] of Object.entries(givers)) {
        if (!npcs[npcId]) {
            continue;
        }

        if (Number(npcs[npcId].questNumber ?? 0) !== questNumber) {
            npcs[npcId].questNumber = questNumber;
            patched += 1;
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(npcs));
    return patched;
}

function main() {
    fs.mkdirSync(SERVER_JSONS, { recursive: true });
    fs.mkdirSync(FRONT_INIT, { recursive: true });

    const quests = convertQuests();
    const givers = convertQuestGivers();

    fs.writeFileSync(path.join(SERVER_JSONS, "quests.json"), JSON.stringify(quests, null, 2));
    fs.writeFileSync(path.join(FRONT_INIT, "quests.json"), JSON.stringify(quests));
    fs.writeFileSync(path.join(SERVER_JSONS, "questGivers.json"), JSON.stringify(givers, null, 2));

    const npcPatched = [
        path.join(API_JSONS, "npcs.json"),
        path.join(SERVER_JSONS, "npcs.json"),
        path.join(FRONT_INIT, "npcs.json"),
    ].reduce((total, filePath) => total + patchNpcQuestNumbers(filePath, givers), 0);

    console.log(
        JSON.stringify(
            {
                quests: Object.keys(quests).length,
                questGivers: Object.keys(givers).length,
                npcPatched,
            },
            null,
            2,
        ),
    );
}

main();
