// Entrenadores de clase (docs/ENTRENADORES_DE_CLASE.md): en cada ciudad importante, un círculo con un entrenador por
// clase jugable. Cada uno vende equipo de nivel medio para su clase y todos los pergaminos que esa clase puede
// aprender, y tiene su clase escrita debajo del cuerpo. También crea los pergaminos que faltaban. Se puede correr
// varias veces.
//   pnpm --dir server exec tsx src/scripts/applyClassTrainersData.ts && pnpm --dir server export-client-objs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../..");
const ALL_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const allExcept = (...allowed: number[]) => ALL_CLASSES.filter((id) => !allowed.includes(id));

const objectPaths = ["server/jsons/objs.json", "api/src/jsons/objs.json"];
const npcPaths = ["server/jsons/npcs.json", "api/src/jsons/npcs.json"];
// Copia recortada del cliente (inspector de GM y cabezas de criaturas).
const clientNpcPaths = ["frontend/public/init/npcs.json", "frontend/public/init/npcs_optimized.json"];
const mapSourceDirs = ["server/mapas_source", "api/src/mapas_source"];

type Json = Record<string, any>;

function readJson(relativePath: string): Json {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")) as Json;
}

// Respeta si el archivo terminaba con salto de línea (los de mapas no), así el diff muestra solo el cambio.
function writeJson(relativePath: string, data: unknown) {
    const fullPath = path.join(root, relativePath);
    const newline = !fs.existsSync(fullPath) || fs.readFileSync(fullPath, "utf8").endsWith("\n");
    fs.writeFileSync(fullPath, `${JSON.stringify(data)}${newline ? "\n" : ""}`, "utf8");
}

function updateJson(relativePath: string, update: (data: Json) => void) {
    const data = readJson(relativePath);
    update(data);
    writeJson(relativePath, data);
}

// Pergamino que faltaba: Círculo de Protección. El resto de los hechizos sin pergamino son de GM (34, 38, 53, 69),
// gratis (37 resucita sin maná, 52 y 56 no gastan maná), no se usan (58, 59) o son de criatura: Aliento de Dragón
// (68, del Caballero Oscuro) haría 62-68 y pasaría a ser el mejor hechizo del mago, por encima de Llama de Dragón.
const newScrolls: Record<number, { spell: number; valor: number; allowed: number[] }> = {
    // Círculo de Protección: los mismos que aprenden Curar Heridas Críticas.
    1831: { spell: 67, valor: 6000, allowed: [1, 2, 4, 6, 7, 8] },
};

// Hechizos que ningún entrenador vende aunque tengan pergamino: Aura Protectora (57, de GM) y "SIN USO".
const EXCLUDED_SPELLS = new Set([34, 37, 38, 52, 53, 56, 57, 58, 59, 69]);

// Equipo de nivel medio: lo que se compra en tiendas y rinde entre nivel 20 y 35, sin llegar a lo mejor del juego
// (sets de tier, premios, crafteos de nivel 40). Las armaduras van en sus dos versiones: altos y bajos.
const ROBES = [519, 940, 1183, 381, 947, 360, 945, 946]; // Túnicas Legendaria, del Acólito, de las Tinieblas, Protectora.
const MAGIC_GEAR = [1035, 1076, ...ROBES]; // Vara de Magia (+20 DM) y Sombrero de Mago (+12 DM).
const PLATES = [723, 243, 724, 595, 497, 596]; // Coraza, Armadura Titánica, Placas Terráneas.
const HELMETS = [405, 1070, 1072]; // Casco de Plata, Casco Cruzado, Casco con Cuernos.
const SHIELDS = [133, 828, 829, 985]; // Escudo Imperial, Genovés, Mongol, de Madera Reforzado.
// Arcos y flechas se fabrican y valen 1: en el entrenador tienen precio propio (se cobra la mitad, como todo).
const ARROWS = [
    { item: 480, valor: 2 },
    { item: 551, valor: 4 },
    { item: 552, valor: 6 },
    { item: 553, valor: 10 },
];
const BOWS = [
    { item: 479, valor: 900 }, // Arco Compuesto (6-12)
    { item: 972, valor: 2500 }, // Ballesta (8-12)
    { item: 546, valor: 3000 }, // Arco Mágico 33 %
    { item: 843, valor: 6000 }, // Arco Mágico 50 %
];

type ShopEntry = number | { item: number; valor: number };

type Trainer = {
    npcId: number;
    classId: number;
    // Lo que se lee debajo del cuerpo: la clase, corta para que no se pise con la de al lado.
    label: string;
    singular: string;
    plural: string;
    // Cara y ropa: la misma vestimenta por clase que la vista previa de creación de personaje.
    look: { idHead: number; idBody: number; idWeapon: number; idShield: number; idHelmet: number };
    gear: ShopEntry[];
};

// En el orden en que quedan en el círculo, empezando arriba y siguiendo como las agujas del reloj:
// magia, híbridos, cuerpo a cuerpo y a distancia.
const TRAINERS: Trainer[] = [
    {
        npcId: 9700,
        classId: 1,
        label: "Mago",
        singular: "mago",
        plural: "Magos",
        look: { idHead: 7, idBody: 50, idWeapon: 14, idShield: 0, idHelmet: 11 },
        gear: MAGIC_GEAR,
    },
    {
        npcId: 9701,
        classId: 7,
        label: "Druida",
        singular: "druida",
        plural: "Druidas",
        look: { idHead: 172, idBody: 56, idWeapon: 6, idShield: 0, idHelmet: 13 },
        gear: MAGIC_GEAR,
    },
    {
        npcId: 9702,
        classId: 22,
        label: "Chamán",
        singular: "chamán",
        plural: "Chamanes",
        look: { idHead: 20, idBody: 403, idWeapon: 85, idShield: 3, idHelmet: 38 },
        gear: MAGIC_GEAR,
    },
    {
        npcId: 9703,
        classId: 6,
        label: "Bardo",
        singular: "bardo",
        plural: "Bardos",
        look: { idHead: 105, idBody: 63, idWeapon: 5, idShield: 3, idHelmet: 0 },
        // Katana, Espada Cántabra, Mangual; Yelmo (el bardo no usa los otros cascos).
        gear: [124, 754, 604, ...PLATES, 945, 946, 830, 828, 829, 985],
    },
    {
        npcId: 9704,
        classId: 2,
        label: "Clérigo",
        singular: "clérigo",
        plural: "Clérigos",
        look: { idHead: 74, idBody: 181, idWeapon: 31, idShield: 7, idHelmet: 17 },
        // Espada de los Templarios, Espada Cántabra, Halberd, Katana.
        gear: [1064, 754, 1058, 124, ...PLATES, ...HELMETS, ...SHIELDS],
    },
    {
        npcId: 9705,
        classId: 8,
        label: "Paladín",
        singular: "paladín",
        plural: "Paladines",
        look: { idHead: 30, idBody: 208, idWeapon: 24, idShield: 31, idHelmet: 17 },
        // Espada de los Templarios, Espada Cántabra, Halberd, Hacha de Guerra dos Filos.
        gear: [1064, 754, 1058, 129, ...PLATES, ...HELMETS, ...SHIELDS],
    },
    {
        npcId: 9706,
        classId: 3,
        label: "Guerrero",
        singular: "guerrero",
        plural: "Guerreros",
        look: { idHead: 40, idBody: 113, idWeapon: 1, idShield: 33, idHelmet: 6 },
        // Espada Cántabra, Hacha Dos Manos, Espada Dos Manos, Doble Hacha, Hacha de Guerra dos Filos, Halberd.
        gear: [754, 1060, 19, 1022, 129, 1058, ...PLATES, ...HELMETS, ...SHIELDS],
    },
    {
        npcId: 9707,
        classId: 18,
        label: "Pirata",
        singular: "pirata",
        plural: "Piratas",
        look: { idHead: 45, idBody: 190, idWeapon: 1, idShield: 0, idHelmet: 0 },
        // Sable Pirata, Doble Espada-Hacha +1, Doble Hacha, Halberd (el pirata no usa cascos).
        gear: [962, 1082, 1022, 1058, ...PLATES, 828, 829, 985],
    },
    {
        npcId: 9708,
        classId: 4,
        label: "Asesino",
        singular: "asesino",
        plural: "Asesinos",
        look: { idHead: 72, idBody: 96, idWeapon: 11, idShield: 0, idHelmet: 0 },
        // Puñal Asesino, Espada Cántabra, Katana.
        gear: [845, 754, 124, ...PLATES, ...HELMETS, 828, 829],
    },
    {
        npcId: 9709,
        classId: 9,
        label: "Cazador",
        singular: "cazador",
        plural: "Cazadores",
        look: { idHead: 15, idBody: 190, idWeapon: 7, idShield: 0, idHelmet: 5 },
        gear: [...BOWS, ...ARROWS, 754, ...PLATES, ...HELMETS],
    },
    {
        npcId: 9710,
        classId: 20,
        label: "Arquero",
        singular: "arquero",
        plural: "Arqueros",
        look: { idHead: 175, idBody: 191, idWeapon: 7, idShield: 0, idHelmet: 0 },
        // Además el Arco Galadhriel (9-13), que es solo del arquero.
        gear: [...BOWS, { item: 971, valor: 5000 }, ...ARROWS, ...PLATES, ...HELMETS],
    },
];

// Lugar de cada ciudad: lejos del tránsito (el camino más corto entre la llegada, las salidas, las puertas y las
// criaturas fijas pasa a dos baldosas o más de cada entrenador), sin tapar puertas, salidas ni otras criaturas, sin
// cortar ningún camino y sin que el mapa les tape el cuerpo. Lo buscó un script que miró el terreno de cada mapa y se
// midió en el cliente (docs/ENTRENADORES_DE_CLASE.md).
// Forma: "circulo" (radio 4; "giro" lo rota en dieciseisavos del paso entre dos entrenadores), "fila" contra una
// pared o "herradura". "orient" es hacia dónde abren la fila y la herradura: la gente se para de ese lado.
type Forma = "circulo" | "fila" | "herradura";
type Orient = "norte" | "sur" | "este" | "oeste";
const CITIES: Array<{ name: string; map: number; x: number; y: number; forma: Forma; giro?: number; orient?: Orient }> = [
    { name: "Ullathorpe", map: 1, x: 24, y: 54, forma: "circulo", giro: 0 },
    // Nix: la franja de pasto del sur, junto al mar, lejos de calles, puertas y otras criaturas.
    { name: "Nix", map: 34, x: 50, y: 85, forma: "circulo", giro: 4 },
    // En Banderbill no entra un círculo fuera de las calles: van en fila contra la pared sur del bolsón del oeste.
    { name: "Banderbill", map: 59, x: 23, y: 32, forma: "fila", orient: "norte" },
    // Lindos es el mapa 62 (el 63 es la playa del muelle).
    { name: "Lindos", map: 62, x: 54, y: 37, forma: "circulo", giro: 0 },
    // Arghal es el mapa 151 (el 150 es el puerto).
    { name: "Arghal", map: 151, x: 30, y: 16, forma: "circulo", giro: 0 },
    // Caos es una cuadrícula de calles angostas sin plazas: van en fila sobre el muelle, contra la baranda del agua y
    // mirando a la vereda de las tiendas, cerca de donde se llega.
    { name: "Caos", map: 170, x: 23, y: 73, forma: "fila", orient: "norte" },
];
const RING_RADIUS = 4;
// Desde el centro, abriendo hacia el sur, de una punta a la otra.
const FORMAS: Record<Exclude<Forma, "circulo">, Array<[number, number]>> = {
    fila: [[-10, 0], [-8, 0], [-6, 0], [-4, 0], [-2, 0], [0, 0], [2, 0], [4, 0], [6, 0], [8, 0], [10, 0]],
    herradura: [[-7, 1], [-7, -1], [-6, -3], [-4, -4], [-2, -4], [0, -4], [2, -4], [4, -4], [6, -3], [7, -1], [7, 1]],
};

function positionsFor(city: (typeof CITIES)[number]) {
    if (city.forma === "circulo") {
        const step = (2 * Math.PI) / TRAINERS.length;
        return TRAINERS.map((_, index) => {
            const angle = -Math.PI / 2 + ((city.giro ?? 0) / 16) * step + index * step;
            return { x: city.x + Math.round(RING_RADIUS * Math.cos(angle)), y: city.y + Math.round(RING_RADIUS * Math.sin(angle)) };
        });
    }
    const rotate = ([dx, dy]: [number, number]): [number, number] => {
        switch (city.orient ?? "sur") {
            case "norte":
                return [dx, -dy];
            case "este":
                return [dy, dx];
            case "oeste":
                return [-dy, dx];
            default:
                return [dx, dy];
        }
    };
    return FORMAS[city.forma].map((offset) => {
        const [dx, dy] = rotate(offset);
        return { x: city.x + dx, y: city.y + dy };
    });
}

// --- Pergaminos nuevos ---
const spells = readJson("server/jsons/spells.json");
for (const relativePath of objectPaths) {
    updateJson(relativePath, (objects) => {
        const template = objects["1214"];
        for (const [id, scroll] of Object.entries(newScrolls)) {
            objects[id] = {
                ...template,
                name: spells[String(scroll.spell)].name,
                valor: scroll.valor,
                spellIndex: scroll.spell,
                clasesNoPermitidas: allExcept(...scroll.allowed),
            };
        }
    });
}

// --- Tiendas ---
const objects = readJson("server/jsons/objs.json");
const canUse = (itemId: number, classId: number) => {
    const item = objects[String(itemId)];
    return Boolean(item) && !(item.clasesNoPermitidas ?? []).includes(classId);
};

function scrollsFor(classId: number): number[] {
    return Object.entries(objects)
        .filter(([, item]) => Number(item.objType) === 24 && Number(item.spellIndex ?? 0) > 0)
        .filter(([, item]) => !EXCLUDED_SPELLS.has(Number(item.spellIndex)) && !/sin uso/i.test(String(item.name)))
        .filter(([id]) => canUse(Number(id), classId))
        .map(([id, item]) => ({ id: Number(id), spell: spells[String(item.spellIndex)] ?? {}, valor: Number(item.valor) }))
        // De lo que se aprende primero a lo último.
        .sort((a, b) => Number(a.spell.minSkill ?? 0) - Number(b.spell.minSkill ?? 0) || a.valor - b.valor || a.id - b.id)
        .map((entry) => entry.id);
}

function shopFor(trainer: Trainer) {
    const gear = trainer.gear.map((entry) => (typeof entry === "number" ? { item: entry } : entry));
    for (const { item } of gear) {
        if (!canUse(item, trainer.classId)) {
            throw new Error(`El ítem ${item} no lo puede usar la clase ${trainer.classId} (${trainer.plural}).`);
        }
    }
    const scrolls = scrollsFor(trainer.classId).map((item) => ({ item }));
    return [...gear, ...scrolls].map((entry) => ({ cant: 100, ...entry }));
}

function descriptionFor(trainer: Trainer, scrollCount: number) {
    const spellsText =
        scrollCount === 0
            ? "Un " + trainer.singular + " no aprende hechizos, pero tengo armas y armaduras para que sigas creciendo."
            : "Tengo equipo para que sigas creciendo y " +
              (scrollCount === 1 ? "el hechizo" : "todos los hechizos") +
              " que un " +
              trainer.singular +
              " puede aprender.";
    return `Entreno a los ${trainer.plural.toLowerCase()}. ${spellsText}`;
}

const shops = new Map(TRAINERS.map((trainer) => [trainer.npcId, shopFor(trainer)]));

for (const relativePath of npcPaths) {
    updateJson(relativePath, (npcs) => {
        for (const trainer of TRAINERS) {
            const objs = shops.get(trainer.npcId)!;
            const scrollCount = objs.filter((entry) => Number(objects[String(entry.item)]?.objType) === 24).length;
            npcs[String(trainer.npcId)] = {
                name: `Entrenador de ${trainer.plural}`,
                npcType: 0,
                ...trainer.look,
                etiqueta: trainer.label,
                movement: 0,
                aguaValida: 0,
                exp: 0,
                gold: 0,
                hp: 1,
                maxHp: 1,
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
                objs,
                drop: [],
                desc: descriptionFor(trainer, scrollCount),
                spells: [],
                hostile: 0,
                comercia: 1,
                attackable: 0,
                tierraInvalida: 0,
            };
        }
    });
}

const serverNpcs = readJson("server/jsons/npcs.json");
for (const relativePath of clientNpcPaths) {
    updateJson(relativePath, (npcs) => {
        for (const trainer of TRAINERS) {
            const npc = serverNpcs[String(trainer.npcId)];
            npcs[String(trainer.npcId)] = {
                name: npc.name,
                idHead: npc.idHead,
                idBody: npc.idBody,
                desc: npc.desc,
                hp: npc.hp,
                maxHp: npc.maxHp,
            };
        }
    });
}

// --- Ubicación en cada ciudad: npcs.json del mapa y la clave npcs de specials.json, que van sincronizadas ---
const trainerIds = new Set(TRAINERS.map((trainer) => trainer.npcId));
type Placement = { mapNum: number; x: number; y: number; npcIndex: number; movement?: number };
const sortPlacements = (list: Placement[]) =>
    [...list].sort((a, b) => a.mapNum - b.mapNum || a.y - b.y || a.x - b.x || a.npcIndex - b.npcIndex);

function writePlacements(sourceDir: string, map: number, update: (current: Placement[]) => Placement[]) {
    const mapDir = path.join(sourceDir, `mapa_${map}`);
    const placementsPath = path.join(mapDir, "npcs.json");
    const specialsPath = path.join(mapDir, "specials.json");
    const placements = sortPlacements(update(readJson(placementsPath) as unknown as Placement[]));
    writeJson(placementsPath, placements);
    updateJson(specialsPath, (specials) => {
        specials.npcs = Object.fromEntries(placements.map((entry) => [`${entry.x},${entry.y}`, entry.npcIndex]));
    });
}

for (const sourceDir of mapSourceDirs) {
    // Saca a los entrenadores de los mapas donde ya no van (por ejemplo, si una ciudad cambia de mapa).
    const cityMaps = new Set(CITIES.map((city) => city.map));
    for (const entry of fs.readdirSync(path.join(root, sourceDir))) {
        const map = Number(/^mapa_(\d+)$/.exec(entry)?.[1] ?? 0);
        if (!map || cityMaps.has(map)) continue;
        const placementsPath = path.join(sourceDir, entry, "npcs.json");
        if (!fs.existsSync(path.join(root, placementsPath))) continue;
        const current = readJson(placementsPath) as unknown as Placement[];
        if (current.some((p) => trainerIds.has(p.npcIndex))) writePlacements(sourceDir, map, (list) => list.filter((p) => !trainerIds.has(p.npcIndex)));
    }

    for (const city of CITIES) {
        const spots = positionsFor(city);
        writePlacements(sourceDir, city.map, (list) => {
            const current = list.filter((entry) => !trainerIds.has(entry.npcIndex));
            spots.forEach((position, index) => {
                const taken = current.find((entry) => entry.x === position.x && entry.y === position.y);
                if (taken) {
                    throw new Error(`${city.name} ${position.x},${position.y} ya tiene el NPC ${taken.npcIndex}.`);
                }
                current.push({ mapNum: city.map, x: position.x, y: position.y, npcIndex: TRAINERS[index].npcId, movement: 0 });
            });
            return current;
        });
    }
}

console.log(
    `Entrenadores: ${TRAINERS.length} en ${CITIES.length} ciudades (${CITIES.map((city) => city.name).join(", ")}). ` +
        `Tiendas: ${TRAINERS.map((trainer) => `${trainer.plural} ${shops.get(trainer.npcId)!.length}`).join(", ")}. ` +
        `${Object.keys(newScrolls).length} pergaminos nuevos.`,
);
