// Muñecos de entrenamiento en Nix (server/src/trainingDummies.ts): la plantilla del NPC, su gráfico (quieto y
// tambaleándose cuando le pegan) y dónde van en el mapa. Se puede correr varias veces.
//   pnpm --dir server exec tsx src/scripts/applyTrainingDummiesData.ts
// El gráfico es el "combat dummy" de wulax (OGA-BY 3.0, docs/CREDITOS_GRAFICOS.md), ya armado en
// frontend/public/graphics/330050.png: 5 cuadros de 64×59 (quieto y 4 de golpe), con la base 3 px arriba del borde
// como los pies de los personajes.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../..");

export const TRAINING_DUMMY_NPC = 9845;
const BODY = 600;
const HIT_BODY = 601;
const FILE = 330050;
const FRAME = { width: 64, height: 59 };
const FIRST_GRH = 43265;
// 43265 quieto, 43266-43269 golpe y 43270 la animación del golpe. El cuerpo quieto usa el cuadro directo: el cliente
// dibuja los cuerpos de un cuadro desde el gráfico fijo, no desde una animación de uno.
const HIT_ANIM = FIRST_GRH + 5;
const HIT_SPEED = 90;

// Nix: el pasto entre la pared este del salón de los entrenadores de clase (x 74-75) y la calle (x 82-83), lejos de la
// fuente (25,58). Dos columnas de tres, con baldosas libres alrededor para pegarles de cualquier lado.
const NIX = 34;
const SPOTS = [
    { x: 77, y: 58 },
    { x: 80, y: 58 },
    { x: 77, y: 61 },
    { x: 80, y: 61 },
    { x: 77, y: 64 },
    { x: 80, y: 64 },
];

const npcPaths = ["server/jsons/npcs.json", "api/src/jsons/npcs.json"];
const clientNpcPaths = ["frontend/public/init/npcs.json", "frontend/public/init/npcs_optimized.json"];
const mapSourceDirs = ["server/mapas_source", "api/src/mapas_source"];

type Json = Record<string, any>;

function readJson(relativePath: string): Json {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")) as Json;
}

// Respeta si el archivo terminaba con salto de línea, así el diff muestra solo el cambio.
function writeJson(relativePath: string, data: unknown) {
    const fullPath = path.join(root, relativePath);
    const newline = fs.readFileSync(fullPath, "utf8").endsWith("\n");
    fs.writeFileSync(fullPath, `${JSON.stringify(data)}${newline ? "\n" : ""}`, "utf8");
}

function updateJson(relativePath: string, update: (data: Json) => void) {
    const data = readJson(relativePath);
    update(data);
    writeJson(relativePath, data);
}

// --- Plantilla: no se mueve, no pega, no da experiencia ni oro y no se muere (trainingDummies.ts le devuelve la
// vida). `hostile` deja pegarle dentro de la ciudad segura, como a las criaturas.
const template = {
    name: "Muñeco de entrenamiento",
    npcType: 0,
    idHead: 0,
    idBody: BODY,
    movement: 1,
    aguaValida: 0,
    exp: 0,
    gold: 0,
    hp: 50_000,
    maxHp: 50_000,
    minHit: 0,
    maxHit: 0,
    def: 0,
    poderAtaque: 0,
    poderEvasion: 0,
    magicResistance: 0,
    magicDef: 0,
    defM: 0,
    snd1: 0,
    snd2: 0,
    soundClose: 0,
    objs: [],
    drop: [],
    desc: "Pegame y tirame hechizos: no me rompo. Cuando dejás de pegarme te digo cuánto daño hiciste.",
    spells: [],
    hostile: 1,
    comercia: 0,
    attackable: 1,
    tierraInvalida: 0,
};

for (const relativePath of npcPaths) {
    updateJson(relativePath, (npcs) => {
        npcs[String(TRAINING_DUMMY_NPC)] = template;
    });
}

for (const relativePath of clientNpcPaths) {
    updateJson(relativePath, (npcs) => {
        npcs[String(TRAINING_DUMMY_NPC)] = {
            name: template.name,
            idHead: template.idHead,
            idBody: template.idBody,
            desc: template.desc,
            hp: template.hp,
            maxHp: template.maxHp,
        };
    });
}

// --- Gráficos: los dos índices del cliente (el juego carga el optimizado) ---
const frames = Array.from({ length: 5 }, (_, index) => FIRST_GRH + index);
updateJson("frontend/public/init/graficos.json", (graphics) => {
    frames.forEach((grh, index) => {
        graphics[String(grh)] = {
            numFrames: 1,
            numFile: FILE,
            sX: index * FRAME.width,
            sY: 0,
            width: FRAME.width,
            height: FRAME.height,
            frames: { "1": grh },
        };
    });
    // Se tambalea y vuelve a quedar quieto.
    const hit = [...frames.slice(1), FIRST_GRH];
    graphics[String(HIT_ANIM)] = {
        numFrames: hit.length,
        frames: Object.fromEntries(hit.map((grh, index) => [String(index + 1), grh])),
        speed: HIT_SPEED,
    };
});
updateJson("frontend/public/init/graficos_optimized.json", (graphics) => {
    frames.forEach((grh, index) => {
        graphics[String(grh)] = [FILE, index * FRAME.width, 0, FRAME.width, FRAME.height];
    });
    graphics[String(HIT_ANIM)] = { f: 5, r: [...frames.slice(1), FIRST_GRH], s: HIT_SPEED };
});

// bodies.json mezcla dos formatos: los cuerpos nuevos se agregan al final como texto (si no estaban).
{
    const relativePath = "frontend/public/init/bodies.json";
    const fullPath = path.join(root, relativePath);
    const raw = fs.readFileSync(fullPath, "utf8");
    const bodies = JSON.parse(raw) as Json;
    const body = (anim: number, extra: Json = {}) => ({
        "1": anim,
        "2": anim,
        "3": anim,
        "4": anim,
        headOffsetX: 0,
        headOffsetY: 0,
        ...extra,
    });
    const wanted: Record<string, Json> = {
        [String(BODY)]: body(FIRST_GRH, { ataque: HIT_BODY }),
        [String(HIT_BODY)]: body(HIT_ANIM),
    };
    const missing = Object.entries(wanted).filter(([id, value]) => JSON.stringify(bodies[id]) !== JSON.stringify(value));
    if (missing.some(([id]) => bodies[id])) {
        throw new Error(`bodies.json ya tiene otros cuerpos ${missing.map(([id]) => id).join(", ")}.`);
    }
    if (missing.length) {
        const end = raw.lastIndexOf("}");
        const added = missing.map(([id, value]) => `,${JSON.stringify(id)}:${JSON.stringify(value)}`).join("");
        fs.writeFileSync(fullPath, `${raw.slice(0, end)}${added}${raw.slice(end)}`, "utf8");
    }
}

// --- Ubicación: npcs.json del mapa y la clave npcs de specials.json, que van sincronizadas ---
type Placement = { mapNum: number; x: number; y: number; npcIndex: number; movement?: number };
const sortPlacements = (list: Placement[]) =>
    [...list].sort((a, b) => a.mapNum - b.mapNum || a.y - b.y || a.x - b.x || a.npcIndex - b.npcIndex);

for (const sourceDir of mapSourceDirs) {
    const mapDir = path.join(sourceDir, `mapa_${NIX}`);
    const placementsPath = path.join(mapDir, "npcs.json");
    const specialsPath = path.join(mapDir, "specials.json");
    const current = (readJson(placementsPath) as unknown as Placement[]).filter(
        (entry) => entry.npcIndex !== TRAINING_DUMMY_NPC,
    );
    for (const spot of SPOTS) {
        const taken = current.find((entry) => entry.x === spot.x && entry.y === spot.y);
        if (taken) {
            throw new Error(`Nix ${spot.x},${spot.y} ya tiene el NPC ${taken.npcIndex}.`);
        }
        current.push({ mapNum: NIX, x: spot.x, y: spot.y, npcIndex: TRAINING_DUMMY_NPC, movement: 1 });
    }
    const placements = sortPlacements(current);
    writeJson(placementsPath, placements);
    updateJson(specialsPath, (specials) => {
        specials.npcs = Object.fromEntries(placements.map((entry) => [`${entry.x},${entry.y}`, entry.npcIndex]));
    });
}

console.log(`Muñecos de entrenamiento: plantilla ${TRAINING_DUMMY_NPC}, cuerpos ${BODY}/${HIT_BODY}, ${SPOTS.length} en Nix.`);
