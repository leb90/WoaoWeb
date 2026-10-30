// Arma los mapas de una mazmorra desde sus planos en texto (server/mazmorras/<id>/), con las texturas del dungeon
// del mapa 116, y escribe las mismas copias que el editor de mapas: server y api (mapas_source) y cliente
// (static/maps_local, que es lo que carga para los mapas 500-599, y maps). También anota en jsons/dungeons.json
// la entrada (E) y las salidas (S) que marca el plano.
//   pnpm --dir server exec tsx src/scripts/buildDungeonMaps.ts prueba
//
// Plano (mapa_<N>.txt): unas líneas "clave: valor" (nombre, musica, origen x,y, restringir), una línea "---" y el dibujo, un
// carácter por baldosa, ubicado en el origen; lo que queda afuera es vacío.
//   #  pared: si abajo hay piso a 4 o menos, se dibuja la cara de la pared; si no, piedra oscura
//   .  piso          ~  agua profunda (se nada con el ítem de la mazmorra)        (espacio)  vacío
//   E  entrada (piso) S  portal de salida
//   1-9 escalera: une las dos escaleras con el mismo número en dos mapas de la mazmorra (con más de nueve pares, se
//       suman símbolos en "escalerasExtra" de leyenda.json)
//   minúsculas: criaturas, según "criaturas" en leyenda.json
// Mecánicas (dungeons.ts). Las salas se detectan solas: cada zona de piso cerrada por paredes y puertas.
//   L  puerta con llave chica     J  puerta de la llave del jefe
//   +  puerta de sala: abierta, se cierra cuando la sala se cierra
//   =  puerta que se abre al resolver una de las salas que separa: apretar sus placas o encender sus antorchas
//   !  esta sala se cierra al entrar hasta matar a sus criaturas (sus cofres aparecen al vaciarla)
//   O  pozo          ^  lava (quema al pisarla)          %  lava que erupciona cada tanto
//   _  placa (se aprieta con un jugador o un bloque encima)          B  bloque que se empuja con un clic
//   ?  losa de piedra (texto en "losas" de leyenda.json, en orden de lectura)
//   cofres: K llave chica, N llave del jefe, M mapa, X brújula, $ oro, G oro grande, R ítem de la mazmorra, T trampa,
//           Y cofre del jefe (trofeo y oro, una vez por día), C caracola secreta (una por mazmorra)
// Caverna de las Llaves (la Carrera y el salto, dungeonMotion.ts):
//   *  bloque de cristal (lo rompe la Carrera)      :  piso que se desmorona (se cruza corriendo o saltando)
//   P  runa con tiempo (abre las puertas Q por unos segundos)      Q  reja que abre la runa con tiempo
//   W  pared rajada (tiembla con la Carrera; en la arena del jefe, lo baja)      Z  aplastador
//   < > { }  puerta de un solo sentido hacia el oeste, el este, el norte y el sur
// Cueva de la Cola:
//   &  bloque con cerradura (se abre con una llave chica y desaparece)
//   ,  piso que las criaturas no pisan (los puentes de la arena del Ciempiés)
//   D  adonde se cae desde los pozos de otro mapa (el plano de ese mapa dice "caida: <este mapa>")
// Roca de la Tortuga (el Polvo de Fuego, el Gancho y el Brazalete de Fuerza, dungeonTools.ts):
//   F  antorcha apagada (se enciende con el Polvo; si la sala tiene cofres, aparecen al encender todas)
//   A  antorcha encendida      I  bloque de hielo (lo derrite el Polvo)      H  estatua (se engancha con el Gancho)
//   U  vasija    V  vasija sobre una placa    ;  piedra suelta (se levantan y se tiran con el Brazalete de Fuerza)
//   ]  piedra pesada (solo con el Brazalete de Fuerza II)
// Mecánicas compartidas (Roca de la Tortuga y Gruta de la Botella):
//   0  cofre del pico de piedra      /  estatua búho: habla (texto en "buhos" de leyenda.json) si el grupo tiene el pico
//   (  bloque azul (arranca levantado)      )  bloque naranja (arranca bajado)      |  cristal: al golpearlo se
//      invierten los bloques de color de toda la corrida      "  remolino: arrastra hacia el centro y lleva a la entrada
//   Las salas con antorchas (F o A) están a oscuras mientras quede alguna apagada.
// Gruta de la Botella:
//   -  placa de peso: solo se aprieta si el que la pisa carga algo con el Brazalete (cuenta para las puertas =)
//   Las escaleras de una sala con placas aparecen al apretarlas todas (los bloques que abren la escalera A), y los
//   cofres de una sala con criaturas "orden" aparecen al matarlas en orden.
// Santuario del Rostro:
//   ♜  estatua pesada (solo con el Brazalete nivel 2)      ♞  cabeza de caballo: se tira y cae parada o acostada; con
//      todas las de la sala paradas, la sala se resuelve (abre sus puertas =)      [  persiana: se abre tirándole algo
//   Ñ  cofre de la llave del jefe trabado: se abre tirándole algo
//   ▦  baldosa voladora (se despega y vuela hacia el jugador)      ▩  la que deja un pozo; romperlas todas resuelve la sala
//   → ← ↑ ↓  cinta transportadora      ♨  lanzallamas (escupe fuego hacia la sala)      ◉  ojo de piedra (rayo)
// Fauces del Bagre (dungeonMaw.ts):
//   ≈  agua baja: se camina (es agua con un reflejo encima)      ∿  agua profunda donde salta un pez
//   ⚓  ancla: si el Gancho pasa por encima, arma un puente sobre la columna de pozos que vuelve hacia el jugador
//   ▾  piso que se hunde si te quedás quieto encima      ◇  cristal que se rompe de un golpe (o con una bomba)
//   ■  bloque que se empuja y se junta: con dos pegados en la misma fila, aparecen los cofres de la sala
//   ✉  cofre con una nota (texto en "notas" de leyenda.json, en orden de lectura)      Ψ  cabeza de dragón (se engancha)
//   Las escaleras de "bajoElAgua" (por número) quedan bajo el agua profunda en la punta que tiene agua al lado: solo se
//   llega nadando (la otra punta es una escalera común).
// Torre del Águila (dungeonTower.ts):
//   ¶  pilar: lo tira el Orbe (con los cuatro rotos se derrumba el piso de arriba y aparecen las escaleras de
//      "escalerasTrasPilares" de leyenda.json)      ●  el Orbe, en el piso (se levanta con el Brazalete y se tira)
//   Con "ojosAbrenPuertas" en leyenda.json, las puertas = de una sala con ojos de piedra se abren al romperlos todos
//   (el Campo de Protección rebota su rayo).
// Bombas (los básicos que tiene todo el mundo):
//   @  pared rajada: un paso tapado que se abre con una bomba (arco tapiado en una pared horizontal, rocas en una vertical)
// Lo que aparece: los cofres de una sala que se cierra (!), que tiene placas o antorchas apagadas aparecen al vaciarla,
// al apretar las placas o al encender las antorchas; las escaleras de una sala que se cierra (y la otra punta)
// aparecen al vaciarla.
// Las puertas van en pasos de una baldosa: en una pared horizontal se ven como un arco de piedra; en una vertical,
// como un cristal que tapa el paso.
// leyenda.json puede traer "plantillas": criaturas propias de la mazmorra, armadas sobre una de AO ("base") con sus
// cambios (nombre, cuerpo, vida y las marcas de dungeons.ts: despierta, pareja, revivirMs, flota, divide; de
// dungeonHazards.ts: chispa, cuchilla, rodillo, empuja; de dungeonBoss.ts: ciempies). También "graficos" (piso y pared
// propios, bloques de 4 × 4), "portales" (escaleras que se ven como portal, por número) y "siempreVisibles" (escaleras
// que no se esconden aunque lleguen a una sala que se cierra).
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(__dirname, "../../..");
const SIZE = 100;
const DEFAULT_FLOOR_GRH = 9428; // bloque de 4×4 del piso verde del mapa 116
const DEFAULT_WALL_FACE_GRH = 9412; // bloque de 4×4 de la cara de las paredes
const VOID_GRH = 1; // negro
const WATER_GRH = 1505; // bloque de 4×4 de agua (waterTiles.ts)
// Gráficos de las Fauces del Bagre (docs/CREDITOS_GRAFICOS.md). El agua baja es un bloque de 4 × 4, como el agua.
const MAW_GRH = { aguaBaja: 42326, anclaNorte: 42342, anclaSur: 42343, anclaEste: 42344, anclaOeste: 42345, pisoFlojo: 42346, cristalGolpe: 42348, cabezaDragon: 42349, puente: 42350, puenteHorizontal: 42351 };
// Gráficos de la Torre del Águila (docs/CREDITOS_GRAFICOS.md).
const TOWER_GRH = { pilar: 42448, pilarRoto: 42449, orbe: 42450, ojoRoto: 42451 };
// El reflejo del agua baja (capa 2): con algo en la capa 2, el juego no la toma como agua y se camina.
const SHALLOW_WATER_GRH = MAW_GRH.aguaBaja;
const PORTAL_OBJ = 378; // Teleport (portal azul, no se puede levantar)
const STAIRS_OBJ = 1198; // Escalera Grande
const LAVA_GRHS = [9487, 9488, 9489, 9490, 9491, 9492, 9493, 9494, 9495]; // piso de lava del mapa 162
// Trigger que las criaturas no pisan (POSINVALIDA del AO original): pozos, lava y puertas, así ninguna sale de su
// sala (como en Zelda) y la sala que se cierra las encierra a todas.
const NO_NPC_TRIGGER = 2;
// Objetos de mazmorra (tipo 0, no se levantan): se crean o actualizan en objs.json al correr el generador.
export const DUNGEON_OBJECTS = {
    cofre: { id: 1832, name: "Cofre de mazmorra", grh: 18532 },
    cofreAbierto: { id: 1833, name: "Cofre de mazmorra abierto", grh: 502 },
    puerta: { id: 1834, name: "Puerta de piedra", grh: 9193 },
    puertaAbierta: { id: 1835, name: "Puerta de piedra abierta", grh: 9199 },
    bloque: { id: 1836, name: "Bloque de piedra", grh: 8623 },
    placa: { id: 1837, name: "Runa del suelo", grh: 36796 },
    placaApretada: { id: 1838, name: "Runa del suelo encendida", grh: 36797 },
    losa: { id: 1839, name: "Losa de piedra", grh: 513 },
    barrera: { id: 1840, name: "Barrera de cristal", grh: 18543 },
    cristal: { id: 1841, name: "Bloque de cristal", grh: 18542 },
    pisoRajado: { id: 1842, name: "Baldosa rajada", grh: 8629 },
    hueco: { id: 1843, name: "Hueco", grh: 1 },
    runaTiempo: { id: 1844, name: "Runa del tiempo", grh: 36798 },
    runaTiempoEncendida: { id: 1845, name: "Runa del tiempo encendida", grh: 36797 },
    paredRajada: { id: 1846, name: "Pared rajada", grh: 2161 },
    losaAplastador: { id: 1847, name: "Losa del aplastador", grh: 9413 },
    aplastador: { id: 1848, name: "Aplastador", grh: 8623 },
    cofreJefe: { id: 1849, name: "Cofre del jefe", grh: 18532 },
    rodillo: { id: 1851, name: "Rodillo de púas", grh: 18537 },
    // Roca de la Tortuga: lo que tocan el Polvo de Fuego, el Gancho y el Brazalete de Fuerza (docs/CREDITOS_GRAFICOS.md).
    vasija: { id: 1852, name: "Vasija", grh: 38215 },
    piedra: { id: 1853, name: "Piedra suelta", grh: 38216 },
    hielo: { id: 1854, name: "Bloque de hielo", grh: 38217 },
    poste: { id: 1855, name: "Estatua de piedra", grh: 38218 },
    antorchaApagada: { id: 1856, name: "Antorcha apagada", grh: 38219 },
    antorchaEncendida: { id: 1857, name: "Antorcha encendida", grh: 38229 },
    // Pared que se vuela con una bomba: un arco tapiado (pared horizontal) o un montón de rocas (vertical).
    paredBombeable: { id: 1858, name: "Pared rajada", grh: 38230 },
    rocas: { id: 1859, name: "Rocas sueltas", grh: 38231 },
    // Piedra pesada: solo la levanta el Brazalete de Fuerza II.
    piedraPesada: { id: 1860, name: "Piedra pesada", grh: 38232 },
    // Mecánicas compartidas de la Roca de la Tortuga y la Gruta de la Botella.
    buho: { id: 1861, name: "Estatua búho", grh: 42253 },
    bloqueAzul: { id: 1862, name: "Bloque azul", grh: 42249 },
    bloqueAzulBajo: { id: 1863, name: "Bloque azul bajado", grh: 42250 },
    bloqueNaranja: { id: 1864, name: "Bloque naranja", grh: 42251 },
    bloqueNaranjaBajo: { id: 1865, name: "Bloque naranja bajado", grh: 42252 },
    cristalAzul: { id: 1866, name: "Cristal azul", grh: 18543 },
    cristalNaranja: { id: 1867, name: "Cristal naranja", grh: 18544 },
    remolino: { id: 1868, name: "Remolino", grh: 42266 },
    // La botella del Genio (dungeonGrotto.ts): no va en el plano; es lo que se ve al levantarla y tirarla.
    botellaGenio: { id: 1869, name: "Botella del Genio", grh: 42287 },
    // Santuario del Rostro (dungeonShrine.ts).
    estatuaPesada: { id: 1870, name: "Estatua pesada", grh: 42289 },
    cabezaParada: { id: 1871, name: "Cabeza de caballo (parada)", grh: 42290 },
    cabezaAcostada: { id: 1872, name: "Cabeza de caballo (acostada)", grh: 42291 },
    baldosaVoladora: { id: 1873, name: "Baldosa con dibujo", grh: 42292 },
    pozoAbierto: { id: 1874, name: "Pozo", grh: 42293 },
    cintaNorte: { id: 1875, name: "Cinta transportadora", grh: 42294 },
    cintaSur: { id: 1876, name: "Cinta transportadora", grh: 42295 },
    cintaEste: { id: 1877, name: "Cinta transportadora", grh: 42296 },
    cintaOeste: { id: 1878, name: "Cinta transportadora", grh: 42297 },
    lanzallamas: { id: 1879, name: "Lanzallamas", grh: 42298 },
    ojoDePiedra: { id: 1880, name: "Ojo de piedra", grh: 42299 },
    // Fauces del Bagre (dungeonMaw.ts).
    // El ancla apunta hacia donde avanza el puente (hacia los pozos).
    ancla: { id: 1882, name: "Ancla del Gancho", grh: MAW_GRH.anclaNorte },
    pisoFlojo: { id: 1883, name: "Piso flojo", grh: MAW_GRH.pisoFlojo },
    cristalGolpe: { id: 1884, name: "Cristal", grh: MAW_GRH.cristalGolpe },
    cabezaDragon: { id: 1885, name: "Cabeza de dragón", grh: MAW_GRH.cabezaDragon },
    puente: { id: 1886, name: "Puente", grh: MAW_GRH.puente },
    anclaSur: { id: 1887, name: "Ancla del Gancho", grh: MAW_GRH.anclaSur },
    anclaEste: { id: 1888, name: "Ancla del Gancho", grh: MAW_GRH.anclaEste },
    anclaOeste: { id: 1889, name: "Ancla del Gancho", grh: MAW_GRH.anclaOeste },
    puenteHorizontal: { id: 1890, name: "Puente", grh: MAW_GRH.puenteHorizontal },
    // Torre del Águila (dungeonTower.ts, docs/CREDITOS_GRAFICOS.md): el pilar entero y el roto, el Orbe (la bola de
    // hierro del Machacador, ahora como objeto del piso) y el ojo de piedra roto.
    pilar: { id: 1891, name: "Pilar de la torre", grh: TOWER_GRH.pilar },
    pilarRoto: { id: 1892, name: "Pilar roto", grh: TOWER_GRH.pilarRoto },
    orbe: { id: 1893, name: "Orbe", grh: TOWER_GRH.orbe },
    ojoRoto: { id: 1894, name: "Ojo de piedra roto", grh: TOWER_GRH.ojoRoto },
} as const;
const CONVEYOR_DIR: Record<string, string> = { "↑": "norte", "↓": "sur", "→": "este", "←": "oeste" };
const CHEST_CONTENT: Record<string, string> = {
    K: "llave",
    N: "jefe",
    M: "mapa",
    X: "brujula",
    $: "oro",
    G: "oroGrande",
    R: "premio",
    T: "trampa",
    Y: "trofeo",
    C: "caracola",
    "0": "pico",
    // La llave del jefe del Santuario del Rostro, en un cofre trabado que se abre tirándole algo.
    Ñ: "jefe",
    // El cofre vacío con la nota del Maestro Stalfos (Fauces del Bagre).
    "✉": "nota",
};
const BARRIER_TYPE: Record<string, string> = {
    L: "llave",
    J: "jefe",
    "+": "sala",
    "=": "placa",
    Q: "tiempo",
    "<": "unica",
    ">": "unica",
    "{": "unica",
    "}": "unica",
    "&": "llave",
    "@": "bomba",
    "[": "golpe",
};
const ONE_WAY_DIR: Record<string, string> = { "<": "oeste", ">": "este", "{": "norte", "}": "sur" };
// Puertas que arrancan abiertas (no bloquean).
const OPEN_BARRIERS = new Set(["+", "<", ">", "{", "}"]);

type Tile = {
    graphics: number;
    // Capa 2 (el reflejo del agua baja).
    graphics2?: number;
    blocked?: boolean;
    trigger?: number;
    object?: number;
    npc?: number;
    exit?: { map: number; x: number; y: number };
};
type Plan = { mapId: number; meta: Record<string, string>; origin: { x: number; y: number }; grid: string[] };
// Un tramo de pared: baldosas de 32 × 32 seguidas desde "grh", fila por fila ("ancho" por fila, "alto" filas).
type WallPiece = { grh: number; ancho: number; alto: number };
// Paredes de tres baldosas de grosor: "arriba" es la cara norte de una sala (fila 0 el borde, la última la que toca el
// piso), "abajo" la pared sur (fila 0 la que toca la sala), "izquierda" la oeste (la última columna toca la sala),
// "derecha" la este (la columna 0 toca la sala) y las piezas en L de 6 × 6 de cada esquina: "no" arriba a la izquierda
// de la sala (la esquina en las columnas 0-2 y filas 0-2, el brazo de la pared de arriba en las columnas 3-5 y el de la
// pared de la izquierda en las filas 3-5), "ne", "so" y "se" espejadas.
type WallSet = Record<"arriba" | "abajo" | "izquierda" | "derecha" | "no" | "ne" | "so" | "se", WallPiece>;
// La piel de una mazmorra: sus propios dibujos de los objetos de mazmorra, que son los mismos para todas. El server
// sigue usando los objetos de siempre (dungeons.ts) y le manda al cliente el de la piel (skinObject); los mapas del
// cliente ya salen con la piel puesta. "objetos" son los nuevos (se crean en objs.json); lo demás dice qué objeto de la
// piel reemplaza a cuál, por su clave en "objetos".
type Skin = {
    objetos: Record<string, { id: number; name: string; grh: number }>;
    // Clave de DUNGEON_OBJECTS -> clave de la piel.
    reemplazos?: Partial<Record<keyof typeof DUNGEON_OBJECTS, string>>;
    portal?: string;
    // Las escaleras que se ven como portal ("portales"): los atajos, de otro color que la salida.
    portalAtajo?: string;
    // La escalera que baja a un mapa de número mayor y la que sube.
    escaleras?: { baja: string; sube: string };
    cofreJefe?: { cerrado: string; abierto: string };
    // Puertas en paredes horizontales: la abierta ("abierta") y la cerrada de cada tipo de barrera (sala, llave, jefe...).
    puertas?: Record<string, string>;
    // Puertas en paredes verticales de tres de grosor, abiertas y cerradas, en la pared oeste o este de una sala.
    puertasLaterales?: { abierta: { izquierda: string; derecha: string }; cerrada: { izquierda: string; derecha: string } };
};
type Legend = {
    criaturas?: Record<string, number | { npc: number; movimiento?: number }>;
    // Torre del Águila: escaleras que aparecen al tirar los cuatro pilares, y si romper los ojos de una sala abre sus puertas.
    escalerasTrasPilares?: string[];
    ojosAbrenPuertas?: boolean;
    // Textos de las losas de cada mapa, en orden de lectura (de arriba abajo y de izquierda a derecha).
    losas?: Record<string, string[]>;
    // Lo que dice cada búho de cada mapa, en orden de lectura (solo con el pico de piedra).
    buhos?: Record<string, string[]>;
    // Oro de cada cofre de oro y de cada cofre de oro grande.
    oro?: number;
    oroGrande?: number;
    // Criaturas que suelta un cofre trampa.
    trampa?: number[];
    // Criaturas propias de la mazmorra: número → plantilla de AO de base y los cambios.
    plantillas?: Record<string, { base: number } & Record<string, unknown>>;
    // Piso y cara de pared propios (bloques de 4 × 4); sin esto, los del mapa 116. Con "paredes", las paredes se arman
    // con tramos y esquinas que rodean cada sala por los cuatro lados (ver themedWallGrh).
    graficos?: { piso?: number; pared?: number; paredes?: WallSet };
    // Los objetos de mazmorra dibujados para esta mazmorra (ver Skin).
    piel?: Skin;
    // Escaleras (por número) que se ven como portal: el atajo de la Cueva de la Cola.
    portales?: string[];
    // Escaleras (por número) que llegan a una sala que se cierra y se ven siempre: se llega por ellas y la sala se
    // cierra hasta vaciarla (la F del Santuario del Rostro).
    siempreVisibles?: string[];
    // Escaleras (por número) bajo el agua profunda: solo se llega nadando (la zambullida de las Fauces del Bagre).
    bajoElAgua?: string[];
    // Lo que dice cada cofre con nota de cada mapa, en orden de lectura.
    notas?: Record<string, string[]>;
    // Símbolos de escalera además de los números del 1 al 9, para mazmorras con más de nueve pares (las Fauces del Bagre).
    escalerasExtra?: string[];
    // Cofres (por letra) que no aparecen al vaciar su sala sino cuando lo dice el módulo del jefe (el del Gancho, al vencer
    // al cuarto Maestro Stalfos).
    cofresTrasJefe?: string[];
};

const dungeonId = process.argv[2];
if (!dungeonId) {
    console.error("Uso: tsx src/scripts/buildDungeonMaps.ts <mazmorra>");
    process.exit(1);
}
const planDir = path.join(ROOT, "server/mazmorras", dungeonId);
const legend: Legend = fs.existsSync(path.join(planDir, "leyenda.json"))
    ? JSON.parse(fs.readFileSync(path.join(planDir, "leyenda.json"), "utf8"))
    : {};
const FLOOR_GRH = Number(legend.graficos?.piso ?? DEFAULT_FLOOR_GRH);
const WALL_FACE_GRH = Number(legend.graficos?.pared ?? DEFAULT_WALL_FACE_GRH);
const portalDigits = new Set(legend.portales ?? []);
const underwaterDigits = new Set(legend.bajoElAgua ?? []);
const extraStairs = new Set(legend.escalerasExtra ?? []);
// Una escalera: un número del 1 al 9 o uno de los símbolos de "escalerasExtra".
const isStair = (c: string) => /[1-9]/.test(c) || extraStairs.has(c);

function readPlan(file: string): Plan {
    const mapId = Number(/mapa_(\d+)\.txt$/.exec(file)?.[1]);
    const text = fs.readFileSync(path.join(planDir, file), "utf8").replace(/\r/g, "");
    const [head, ...rest] = text.split("\n---\n");
    const meta: Record<string, string> = {};
    for (const line of head.split("\n")) {
        const match = /^\s*([a-zñ]+)\s*:\s*(.*)$/i.exec(line);
        if (match) meta[match[1].toLowerCase()] = match[2].trim();
    }
    const [ox, oy] = (meta.origen ?? "1,1").split(",").map((v) => Number(v.trim()));
    const grid = rest.join("\n---\n").split("\n");
    while (grid.length && !grid[grid.length - 1].trim()) grid.pop();
    return { mapId, meta, origin: { x: ox, y: oy }, grid };
}

const plans = fs
    .readdirSync(planDir)
    .filter((file) => /^mapa_\d+\.txt$/.test(file))
    .map(readPlan)
    .sort((a, b) => a.mapId - b.mapId);

const charAt = (plan: Plan, x: number, y: number) => plan.grid[y - plan.origin.y]?.[x - plan.origin.x] ?? " ";
const isWall = (c: string) => c === "#" || c === "W";
const isOpen = (c: string) => !isWall(c) && c !== " ";
const isBarrier = (c: string) => c in BARRIER_TYPE;
// Lo que forma parte de una sala (las puertas la cierran).
const isRoomTile = (c: string) => isOpen(c) && !isBarrier(c);
const block4 = (base: number, x: number, y: number, row?: number) => base + (row ?? (y - 1) % 4) * 4 + ((x - 1) % 4);

// Paredes con tramos y esquinas (legend.graficos.paredes): cada baldosa de pared mira a qué distancia (1 a 3) tiene
// piso en línea recta hacia cada lado, atravesando solo pared. Con piso abajo es la cara norte de esa sala (en vista de
// tres cuartos manda la cara); si no, con piso a un costado es la pared oeste o este; si no, con piso arriba es la pared
// sur; si no hay piso en línea recta pero sí en diagonal, es una esquina. Junto a una esquina, los tramos rectos siguen
// con los brazos de su pieza en L, donde dobla el borde. Las paredes de menos de tres baldosas entre dos salas se
// dibujan con el borde de roca (un muro bajo visto desde arriba). Lo que queda lejos de todo es negro.
const WALLS = legend.graficos?.paredes;
const wallPiece = (piece: WallPiece, col: number, row: number) => piece.grh + (row % piece.alto) * piece.ancho + (col % piece.ancho);

// Una puerta metida en una pared y el pasillo que la cruza con ella (de hasta tres baldosas, con pared a los dos
// costados) se dibujan como pared: la pared sigue de largo por detrás del dibujo de la puerta, que tapa el pasillo, en
// vez de abrirse en dos caras.
function isDoorway(plan: Plan, x: number, y: number): boolean {
    // [dx, dy]: hacia dónde va el pasillo (vertical a través de una pared horizontal, u horizontal).
    return [[0, 1], [1, 0]].some(([dx, dy]) => {
        const inWall = (px: number, py: number) =>
            isOpen(charAt(plan, px, py)) && isWall(charAt(plan, px - dy, py - dx)) && isWall(charAt(plan, px + dy, py + dx));
        if (!inWall(x, y)) return false;
        let back = 0;
        let ahead = 0;
        while (back < 3 && inWall(x - dx * (back + 1), y - dy * (back + 1))) back++;
        while (ahead < 3 && inWall(x + dx * (ahead + 1), y + dy * (ahead + 1))) ahead++;
        if (back + ahead + 1 > 3) return false;
        for (let k = -back; k <= ahead; k++) if (isBarrier(charAt(plan, x + dx * k, y + dy * k))) return true;
        return false;
    });
}
const isSolid = (plan: Plan, x: number, y: number) => isWall(charAt(plan, x, y)) || isDoorway(plan, x, y);
const isRoomFloor = (plan: Plan, x: number, y: number) => isOpen(charAt(plan, x, y)) && !isDoorway(plan, x, y);

// Las salas de cada mapa (lo abierto, sin puertas) y en qué orden se llega a cada una desde donde se entra al mapa (la
// entrada, o las escaleras que vienen de un mapa anterior).
const roomsCache = new Map<number, { room: Map<string, number>; rank: number[] }>();
function roomsOf(plan: Plan): { room: Map<string, number>; rank: number[] } {
    const cached = roomsCache.get(plan.mapId);
    if (cached) return cached;
    const tiles: Array<[number, number]> = [];
    plan.grid.forEach((line, gy) => [...line].forEach((_, gx) => tiles.push([gx + plan.origin.x, gy + plan.origin.y])));
    const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const room = new Map<string, number>();
    let rooms = 0;
    for (const [x, y] of tiles) {
        if (room.has(`${x},${y}`) || !isRoomFloor(plan, x, y)) continue;
        const queue: Array<[number, number]> = [[x, y]];
        room.set(`${x},${y}`, rooms);
        while (queue.length) {
            const [cx, cy] = queue.pop()!;
            for (const [dx, dy] of steps) {
                const key = `${cx + dx},${cy + dy}`;
                if (room.has(key) || !isRoomFloor(plan, cx + dx, cy + dy)) continue;
                room.set(key, rooms);
                queue.push([cx + dx, cy + dy]);
            }
        }
        rooms++;
    }
    const comesFromBefore = (c: string, x: number, y: number) =>
        (stairs.get(c) ?? []).some((s) => !(s.mapId === plan.mapId && s.x === x && s.y === y) && s.mapId < plan.mapId);
    let sources = tiles.filter(([x, y]) => {
        const c = charAt(plan, x, y);
        return c === "E" || (isStair(c) && !portalDigits.has(c) && comesFromBefore(c, x, y));
    });
    if (!sources.length) sources = tiles.filter(([x, y]) => isStair(charAt(plan, x, y)) && !portalDigits.has(charAt(plan, x, y)));
    // Distancia caminando (cruzando puertas) desde donde se entra; cada sala toma la de su baldosa más cercana.
    const rank = Array.from({ length: rooms }, (_, i) => Number.MAX_SAFE_INTEGER - rooms + i);
    const distance = new Map(sources.map(([x, y]) => [`${x},${y}`, 0]));
    const queue = [...sources];
    for (let head = 0; head < queue.length; head++) {
        const [x, y] = queue[head];
        const d = distance.get(`${x},${y}`)!;
        const r = room.get(`${x},${y}`);
        if (r !== undefined) rank[r] = Math.min(rank[r], d);
        for (const [dx, dy] of steps) {
            const key = `${x + dx},${y + dy}`;
            if (distance.has(key) || !isOpen(charAt(plan, x + dx, y + dy))) continue;
            distance.set(key, d + 1);
            queue.push([x + dx, y + dy]);
        }
    }
    const result = { room, rank };
    roomsCache.set(plan.mapId, result);
    return result;
}

// Una pared vertical entre la sala de (lx, y) y la de (rx, y) es entera de una de las dos, la primera a la que se llega:
// "derecha" si es la pared este de la de la izquierda, "izquierda" si es la oeste de la de la derecha. Su puerta abre
// hacia esa misma sala.
function sharedWallSide(plan: Plan, lx: number, rx: number, y: number): "izquierda" | "derecha" {
    const { room, rank } = roomsOf(plan);
    const left = room.get(`${lx},${y}`);
    const right = room.get(`${rx},${y}`);
    if (left === undefined) return "izquierda";
    if (right === undefined) return "derecha";
    return rank[right] < rank[left] ? "izquierda" : "derecha";
}

function floorDistance(plan: Plan, x: number, y: number, dx: number, dy: number): number {
    for (let d = 1; d <= 3; d++) {
        if (isSolid(plan, x + dx * d, y + dy * d)) continue;
        return isOpen(charAt(plan, x + dx * d, y + dy * d)) ? d : 0;
    }
    return 0;
}

// Qué pieza va en una baldosa de pared: la columna y la fila dentro de la pieza, y la baldosa de piso de la sala a la que
// mira (thin: pared de menos de tres, sin brazos de esquina).
type WallTile = { piece: keyof WallSet; col: number; row: number; floor: [number, number]; thin?: boolean };
const wallTiles = new Map<string, WallTile | null>();
function wallTile(plan: Plan, x: number, y: number): WallTile | null {
    const key = `${plan.mapId},${x},${y}`;
    if (!wallTiles.has(key)) wallTiles.set(key, computeWallTile(plan, x, y));
    return wallTiles.get(key)!;
}

// Si la baldosa está debajo o encima de una pared vertical entre dos salas (sharedWallSide), de cuál de las dos es.
function sharedWallAlong(plan: Plan, x: number, y: number): "izquierda" | "derecha" | undefined {
    for (const dy of [1, -1]) {
        for (let d = 1; d <= 3 && isSolid(plan, x, y + dy * d); d++) {
            const e = floorDistance(plan, x, y + dy * d, 1, 0);
            const w = floorDistance(plan, x, y + dy * d, -1, 0);
            if (e && w && e + w - 1 >= 3) return sharedWallSide(plan, x - w, x + e, y + dy * d);
            if (e || w) break;
        }
    }
    return undefined;
}

function computeWallTile(plan: Plan, x: number, y: number): WallTile | null {
    const s = floorDistance(plan, x, y, 0, 1);
    const n = floorDistance(plan, x, y, 0, -1);
    const e = floorDistance(plan, x, y, 1, 0);
    const w = floorDistance(plan, x, y, -1, 0);
    if (s) {
        // Grosor entre la sala de abajo y la de arriba (si hay una a tres o menos): con tres o más, borde, cara y la
        // fila que toca el piso; con dos, borde y la que toca el piso; con una, el borde.
        const thickness = n ? s + n - 1 : 3;
        const row = thickness >= 3 ? 3 - s : thickness === 2 ? (s === 1 ? 2 : 0) : 0;
        return { piece: "arriba", col: x - 1, row, floor: [x, y + s], thin: thickness < 3 };
    }
    if (e || w) {
        const thickness = e && w ? e + w - 1 : 3;
        if (thickness < 3) {
            return w
                ? { piece: "derecha", col: 2, row: y - 1, floor: [x - w, y], thin: true }
                : { piece: "izquierda", col: 0, row: y - 1, floor: [x + e, y], thin: true };
        }
        // Entre dos salas, la pared es entera de una: su cara contra esa sala y el borde contra la otra.
        const side = e && w ? sharedWallSide(plan, x - w, x + e, y) : e ? "izquierda" : "derecha";
        return side === "izquierda"
            ? { piece: "izquierda", col: 3 - e, row: y - 1, floor: [x + e, y] }
            : { piece: "derecha", col: w - 1, row: y - 1, floor: [x - w, y] };
    }
    if (n) return { piece: "abajo", col: x - 1, row: n - 1, floor: [x, y - n] };
    // Esquinas: el piso más cercano en diagonal (la sala está abajo a la derecha de la esquina "no", y así). Mandan las
    // salas de abajo, como la cara de la pared; encima o debajo de una pared entre dos salas, la esquina es de la sala
    // dueña de esa pared.
    const side = sharedWallAlong(plan, x, y);
    let best: { d: number; tile: WallTile } | null = null;
    for (let j = 1; j <= 3; j++) {
        for (let i = 1; i <= 3; i++) {
            const options: Array<[number, number, keyof WallSet, number, number]> = [
                [x + i, y + j, "no", 3 - i, 3 - j],
                [x - i, y + j, "ne", 2 + i, 3 - j],
                [x + i, y - j, "so", 3 - i, 2 + j],
                [x - i, y - j, "se", 2 + i, 2 + j],
            ];
            for (const [fx, fy, piece, col, row] of options) {
                if (!isRoomFloor(plan, fx, fy)) continue;
                if (side && (side === "derecha") !== (fx < x)) continue;
                const d = (fy < y ? 1000 : 0) + Math.max(i, j) * 10 + i + j;
                if (!best || d < best.d) best = { d, tile: { piece, col, row, floor: [fx, fy] } };
            }
        }
    }
    return best?.tile ?? null;
}

// Cerca de una esquina (a tres baldosas o menos), el tramo recto sigue con el brazo de la pieza en L, si esa esquina es
// de la misma sala.
function cornerArm(plan: Plan, x: number, y: number, tile: WallTile): WallTile | null {
    const [fx, fy] = tile.floor;
    // Cuántas baldosas de piso hay más allá de la de la sala hacia (dx, dy), hasta su pared.
    const reach = (dx: number, dy: number) => {
        let k = 0;
        while (k < 3 && isRoomFloor(plan, fx + dx * (k + 1), fy + dy * (k + 1))) k++;
        return k;
    };
    const cornerIs = (cx: number, cy: number, piece: keyof WallSet, cfx: number, cfy: number) => {
        const corner = wallTile(plan, cx, cy);
        return corner?.piece === piece && corner.floor[0] === cfx && corner.floor[1] === cfy;
    };
    const arms: Array<{ k: number; tile: WallTile }> = [];
    if (tile.piece === "arriba" || tile.piece === "abajo") {
        const [west, east] = tile.piece === "arriba" ? (["no", "ne"] as const) : (["so", "se"] as const);
        const row = tile.row + (tile.piece === "abajo" ? 3 : 0);
        const kw = reach(-1, 0);
        const ke = reach(1, 0);
        if (kw < 3 && cornerIs(x - kw - 1, y, west, fx - kw, fy)) arms.push({ k: kw, tile: { ...tile, piece: west, col: 3 + kw, row } });
        if (ke < 3 && cornerIs(x + ke + 1, y, east, fx + ke, fy)) arms.push({ k: ke, tile: { ...tile, piece: east, col: 2 - ke, row } });
    } else if (tile.piece === "izquierda" || tile.piece === "derecha") {
        const [north, south] = tile.piece === "izquierda" ? (["no", "so"] as const) : (["ne", "se"] as const);
        const col = tile.col + (tile.piece === "derecha" ? 3 : 0);
        const kn = reach(0, -1);
        const ks = reach(0, 1);
        if (kn < 3 && cornerIs(x, y - kn - 1, north, fx, fy - kn)) arms.push({ k: kn, tile: { ...tile, piece: north, col, row: 3 + kn } });
        if (ks < 3 && cornerIs(x, y + ks + 1, south, fx, fy + ks)) arms.push({ k: ks, tile: { ...tile, piece: south, col, row: 2 - ks } });
    }
    arms.sort((a, b) => a.k - b.k);
    return arms[0]?.tile ?? null;
}

function themedWallGrh(plan: Plan, x: number, y: number, walls: WallSet): number {
    const tile = wallTile(plan, x, y);
    if (!tile) return VOID_GRH;
    const shown = (!tile.thin && cornerArm(plan, x, y, tile)) || tile;
    return wallPiece(walls[shown.piece], shown.col, shown.row);
}

// Una escalera de "bajoElAgua" está bajo el agua en la punta que tiene agua profunda al lado (la otra es común).
function isUnderwaterStair(plan: Plan, x: number, y: number): boolean {
    const c = charAt(plan, x, y);
    if (!isStair(c) || !underwaterDigits.has(c)) return false;
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => ["~", "∿"].includes(charAt(plan, x + dx, y + dy)));
}

// Escaleras: dónde está cada número en cada mapa.
const stairs = new Map<string, Array<{ mapId: number; x: number; y: number }>>();
const markers: {
    entrada?: { map: number; x: number; y: number };
    salidas: Array<{ map: number; x: number; y: number }>;
    // Adonde se cae en cada mapa (D).
    caidas: Map<number, { map: number; x: number; y: number }>;
} = { salidas: [], caidas: new Map() };
for (const plan of plans) {
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            const c = charAt(plan, x, y);
            if (isStair(c)) stairs.set(c, [...(stairs.get(c) ?? []), { mapId: plan.mapId, x, y }]);
            if (c === "E") markers.entrada = { map: plan.mapId, x, y };
            if (c === "S") markers.salidas.push({ map: plan.mapId, x, y });
            if (c === "D") markers.caidas.set(plan.mapId, { map: plan.mapId, x, y });
        }
    }
}

// Al bajar una escalera se llega a la baldosa libre de al lado de la otra (no encima, si no rebotaría).
function arrivalNextTo(target: { mapId: number; x: number; y: number }) {
    const plan = plans.find((p) => p.mapId === target.mapId)!;
    for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const c = charAt(plan, target.x + dx, target.y + dy);
        const underwater = isUnderwaterStair(plan, target.x, target.y);
        if (c === "." || c === "E" || c === "D" || c === "," || c === "≈" || (underwater && c === "~")) {
            return { map: target.mapId, x: target.x + dx, y: target.y + dy };
        }
    }
    throw new Error(`La escalera de ${target.mapId} (${target.x},${target.y}) no tiene piso al lado.`);
}

// Salas: zonas de piso unidas por los lados, cortadas por paredes y puertas.
type Room = { id: number; x1: number; y1: number; x2: number; y2: number; cierra: boolean; tiles: number };
function detectRooms(plan: Plan) {
    const roomOf = new Map<string, number>();
    const rooms: Room[] = [];
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            if (roomOf.has(`${x},${y}`) || !isRoomTile(charAt(plan, x, y))) continue;
            const room: Room = { id: rooms.length + 1, x1: x, y1: y, x2: x, y2: y, cierra: false, tiles: 0 };
            const queue = [[x, y]];
            roomOf.set(`${x},${y}`, room.id);
            while (queue.length) {
                const [cx, cy] = queue.pop()!;
                room.tiles++;
                room.x1 = Math.min(room.x1, cx);
                room.y1 = Math.min(room.y1, cy);
                room.x2 = Math.max(room.x2, cx);
                room.y2 = Math.max(room.y2, cy);
                if (charAt(plan, cx, cy) === "!") room.cierra = true;
                for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const key = `${cx + dx},${cy + dy}`;
                    if (!roomOf.has(key) && isRoomTile(charAt(plan, cx + dx, cy + dy))) {
                        roomOf.set(key, room.id);
                        queue.push([cx + dx, cy + dy]);
                    }
                }
            }
            rooms.push(room);
        }
    }
    return { rooms, roomOf };
}

const roomsByMap = new Map(plans.map((plan) => [plan.mapId, detectRooms(plan)]));
// Salas con placas (sus cofres aparecen al apretarlas todas).
const plateRooms = new Set<string>();
for (const plan of plans) {
    const { roomOf } = roomsByMap.get(plan.mapId)!;
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            const plate = charAt(plan, x, y);
            if ((plate === "_" || plate === "V" || plate === "-") && roomOf.has(`${x},${y}`)) plateRooms.add(`${plan.mapId}:${roomOf.get(`${x},${y}`)}`);
        }
    }
}
// Salas con criaturas que se matan en orden (plantillas con "orden"): sus cofres aparecen al terminar.
const orderRooms = new Set<string>();
{
    const serverNpcs = JSON.parse(fs.readFileSync(path.join(ROOT, "server/jsons/npcs.json"), "utf8"));
    const hasOrder = (id: number) => Boolean((legend.plantillas?.[String(id)] as { orden?: number } | undefined)?.orden ?? serverNpcs[String(id)]?.orden);
    for (const plan of plans) {
        const { roomOf } = roomsByMap.get(plan.mapId)!;
        for (let y = 1; y <= SIZE; y++) {
            for (let x = 1; x <= SIZE; x++) {
                const c = charAt(plan, x, y);
                const entry = /[a-z]/.test(c) ? legend.criaturas?.[c] : undefined;
                const id = typeof entry === "number" ? entry : entry?.npc;
                if (id && hasOrder(id) && roomOf.has(`${x},${y}`)) orderRooms.add(`${plan.mapId}:${roomOf.get(`${x},${y}`)}`);
            }
        }
    }
}
// Salas con antorchas apagadas (sus cofres aparecen al encenderlas todas con el Polvo de Fuego).
const torchRooms = new Set<string>();
for (const plan of plans) {
    const { roomOf } = roomsByMap.get(plan.mapId)!;
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            if (charAt(plan, x, y) === "F" && roomOf.has(`${x},${y}`)) torchRooms.add(`${plan.mapId}:${roomOf.get(`${x},${y}`)}`);
        }
    }
}
// Salas con baldosas voladoras (sus cofres aparecen al romperlas todas).
const flyingTileRooms = new Set<string>();
for (const plan of plans) {
    const { roomOf } = roomsByMap.get(plan.mapId)!;
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            const c = charAt(plan, x, y);
            if ((c === "▦" || c === "▩") && roomOf.has(`${x},${y}`)) flyingTileRooms.add(`${plan.mapId}:${roomOf.get(`${x},${y}`)}`);
        }
    }
}
// Salas con bloques que se juntan (sus cofres aparecen al juntarlos).
const joinRooms = new Set<string>();
for (const plan of plans) {
    const { roomOf } = roomsByMap.get(plan.mapId)!;
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            if (charAt(plan, x, y) === "■" && roomOf.has(`${x},${y}`)) joinRooms.add(`${plan.mapId}:${roomOf.get(`${x},${y}`)}`);
        }
    }
}
// Hacia dónde escupe un lanzallamas: hacia la sala, del lado contrario a la pared que tiene pegada (si no, hacia donde
// hay más piso libre en línea).
function shooterDir(plan: Plan, x: number, y: number): string {
    const dirs: Array<[string, number, number]> = [["norte", 0, -1], ["sur", 0, 1], ["este", 1, 0], ["oeste", -1, 0]];
    for (const [name, dx, dy] of dirs) {
        if (isWall(charAt(plan, x - dx, y - dy)) && isOpen(charAt(plan, x + dx, y + dy))) return name;
    }
    let best = "sur";
    let bestRun = -1;
    for (const [name, dx, dy] of dirs) {
        let run = 0;
        while (run < 20 && isOpen(charAt(plan, x + dx * (run + 1), y + dy * (run + 1)))) run++;
        if (run > bestRun) {
            best = name;
            bestRun = run;
        }
    }
    return best;
}
// Los cofres de las salas que se cierran no se ven hasta vaciarlas; los de las salas con placas, hasta apretarlas;
// los de las salas con antorchas apagadas, hasta encenderlas; los de las salas con baldosas voladoras, hasta romperlas.
const hiddenChests = new Set<string>();
for (const plan of plans) {
    const { rooms, roomOf } = roomsByMap.get(plan.mapId)!;
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            if (!(charAt(plan, x, y) in CHEST_CONTENT)) continue;
            const roomId = roomOf.get(`${x},${y}`);
            const room = rooms.find((r) => r.id === roomId);
            const roomKey = `${plan.mapId}:${roomId}`;
            // Los cofres que esperan al jefe ("cofresTrasJefe") se esconden aunque su sala no se cierre: los revela su muerte.
            if (room?.cierra || plateRooms.has(roomKey) || torchRooms.has(roomKey) || orderRooms.has(roomKey) || flyingTileRooms.has(roomKey) || joinRooms.has(roomKey) || (legend.cofresTrasJefe ?? []).includes(charAt(plan, x, y))) {
                hiddenChests.add(`${plan.mapId}:${x},${y}`);
            }
        }
    }
}
// Las escaleras de una sala que se cierra aparecen al vaciarla, y su otra punta también.
const hiddenExits = new Map<number, Array<{ x: number; y: number; revela: { map: number; sala: number } }>>();
const alwaysVisible = new Set(legend.siempreVisibles ?? []);
for (const [digit, ends] of stairs) {
    if (alwaysVisible.has(digit)) continue;
    for (const end of ends) {
        const { rooms, roomOf } = roomsByMap.get(end.mapId)!;
        const roomId = roomOf.get(`${end.x},${end.y}`) ?? [[0, 1], [1, 0], [-1, 0], [0, -1]]
            .map(([dx, dy]) => roomOf.get(`${end.x + dx},${end.y + dy}`))
            .find((id) => id !== undefined);
        // Aparecen al vaciar una sala que se cierra o al apretar todas las placas de su sala.
        if (!rooms.find((r) => r.id === roomId)?.cierra && !plateRooms.has(`${end.mapId}:${roomId}`)) continue;
        for (const other of ends) {
            hiddenExits.set(other.mapId, [...(hiddenExits.get(other.mapId) ?? []), { x: other.x, y: other.y, revela: { map: end.mapId, sala: roomId! } }]);
        }
    }
}

// Torre del Águila: las escaleras que aparecen con el derrumbe quedan escondidas hasta que el mapa de los pilares las
// revela (sala -1: no la vacía nadie; las revela dungeonTower.ts al caer el cuarto pilar).
const pillarsMap = plans.find((plan) => plan.grid.some((row) => row.includes("¶")))?.mapId;
for (const digit of legend.escalerasTrasPilares ?? []) {
    if (pillarsMap === undefined) throw new Error(`"escalerasTrasPilares" pide pilares (¶) en algún mapa.`);
    for (const end of stairs.get(digit) ?? []) {
        hiddenExits.set(end.mapId, [...(hiddenExits.get(end.mapId) ?? []), { x: end.x, y: end.y, revela: { map: pillarsMap, sala: -1 } }]);
    }
}

// La piel de la mazmorra (legend.piel). skinId da el número de un objeto de la piel por su clave.
const SKIN = legend.piel;
const skinId = (key?: string) => (key ? SKIN?.objetos[key]?.id : undefined);

// Una puerta en una pared vertical de tres de grosor (pared en las cuatro diagonales): la de la piel se ve abierta y
// cerrada. En una pared de una baldosa queda como siempre (un cristal), porque el dibujo de la piel ocupa tres.
function isThickSideDoor(plan: Plan, x: number, y: number): boolean {
    return [[-1, -1], [1, -1], [-1, 1], [1, 1]].every(([dx, dy]) => isWall(charAt(plan, x + dx, y + dy)));
}

// La piel de una baldosa: objeto de base -> el de la piel. Las puertas, según su tipo y su pared; el cofre del jefe
// (cerrado y abierto); las escaleras, según si bajan o suben.
function tileSkin(plan: Plan, x: number, y: number): Record<number, number> {
    const skin: Record<number, number> = {};
    if (!SKIN) return skin;
    const c = charAt(plan, x, y);
    if (isBarrier(c) && BARRIER_TYPE[c] !== "bomba") {
        const horizontal = isWall(charAt(plan, x - 1, y)) && isWall(charAt(plan, x + 1, y));
        if (horizontal) {
            const closed = skinId(SKIN.puertas?.[BARRIER_TYPE[c]]);
            const open = skinId(SKIN.puertas?.abierta);
            if (closed) skin[DUNGEON_OBJECTS.puerta.id] = closed;
            if (open) skin[DUNGEON_OBJECTS.puertaAbierta.id] = open;
        } else if (SKIN.puertasLaterales && isThickSideDoor(plan, x, y)) {
            // La de la pared de la sala a la que se llega primero (sharedWallSide): abre hacia esa sala.
            const side = sharedWallSide(plan, x - 2, x + 2, y);
            const closed = skinId(SKIN.puertasLaterales.cerrada[side]);
            const open = skinId(SKIN.puertasLaterales.abierta[side]);
            if (closed) {
                skin[DUNGEON_OBJECTS.barrera.id] = closed;
                skin[DUNGEON_OBJECTS.puerta.id] = closed;
            }
            if (open) skin[DUNGEON_OBJECTS.puertaAbierta.id] = open;
        }
    }
    if (c === "Y" && SKIN.cofreJefe) {
        const closed = skinId(SKIN.cofreJefe.cerrado);
        const open = skinId(SKIN.cofreJefe.abierto);
        if (closed) skin[DUNGEON_OBJECTS.cofreJefe.id] = closed;
        if (open) skin[DUNGEON_OBJECTS.cofreAbierto.id] = open;
    }
    if (isStair(c) && portalDigits.has(c) && skinId(SKIN.portalAtajo)) skin[PORTAL_OBJ] = skinId(SKIN.portalAtajo)!;
    if (isStair(c) && SKIN.escaleras && !portalDigits.has(c)) {
        const other = (stairs.get(c) ?? []).find((s) => !(s.mapId === plan.mapId && s.x === x && s.y === y));
        const id = skinId(other && other.mapId < plan.mapId ? SKIN.escaleras.sube : SKIN.escaleras.baja);
        if (id) skin[STAIRS_OBJ] = id;
    }
    return skin;
}

// La piel de los objetos que se ven igual en toda la mazmorra.
const objectSkin: Record<number, number> = {};
for (const [base, key] of Object.entries(SKIN?.reemplazos ?? {})) {
    const id = skinId(key);
    const baseId = DUNGEON_OBJECTS[base as keyof typeof DUNGEON_OBJECTS]?.id;
    if (!id || !baseId) throw new Error(`La piel reemplaza "${base}" por "${key}", y uno de los dos no existe.`);
    objectSkin[baseId] = id;
}
if (skinId(SKIN?.portal)) objectSkin[PORTAL_OBJ] = skinId(SKIN?.portal)!;

// Datos de mecánicas que lee dungeons.ts (clave "dungeon" de specials.json; el server no la usa para otra cosa).
function buildMechanics(plan: Plan) {
    const { rooms, roomOf } = roomsByMap.get(plan.mapId)!;
    const slabTexts = legend.losas?.[String(plan.mapId)] ?? [];
    const owlTexts = legend.buhos?.[String(plan.mapId)] ?? [];
    const noteTexts = legend.notas?.[String(plan.mapId)] ?? [];
    let notes = 0;
    const data = {
        rooms: rooms.map(({ id, x1, y1, x2, y2, cierra }) => ({ id, x1, y1, x2, y2, cierra })),
        roomOf: Object.fromEntries(roomOf),
        barriers: [] as Array<{ x: number; y: number; tipo: string; horizontal: boolean; salas: number[]; dir?: string }>,
        pits: [] as string[],
        lava: [] as string[],
        lavaPeriodica: [] as string[],
        plates: [] as string[],
        blocks: [] as string[],
        chests: [] as Array<{ x: number; y: number; contenido: string; oculto: boolean; sala: number }>,
        slabs: [] as Array<{ x: number; y: number; texto: string }>,
        oro: Number(legend.oro ?? 250),
        oroGrande: Number(legend.oroGrande ?? 4 * Number(legend.oro ?? 250)),
        trampa: legend.trampa ?? [],
        crystals: [] as string[],
        fragile: [] as string[],
        timedPlates: [] as string[],
        crackedWalls: [] as string[],
        crushers: [] as string[],
        hiddenExits: hiddenExits.get(plan.mapId) ?? [],
        caida: null as { map: number; x: number; y: number } | null,
        // Roca de la Tortuga: antorchas, hielo, lo que se levanta con el Brazalete y las estatuas del Gancho.
        torches: [] as Array<{ x: number; y: number; encendida: boolean; sala: number }>,
        ice: [] as string[],
        liftables: [] as Array<{ x: number; y: number; tipo: "vasija" | "piedra" | "pesada" | "estatua"; placa: boolean }>,
        hookPosts: [] as string[],
        // Mecánicas compartidas: búhos, bloques de color, cristales y remolinos.
        owls: [] as Array<{ x: number; y: number; texto: string }>,
        colorBlocks: { azul: [] as string[], naranja: [] as string[] },
        switches: [] as string[],
        vortexes: [] as string[],
        weightPlates: [] as string[],
        // Santuario del Rostro (dungeonShrine.ts).
        santuario: {
            cabezas: [] as Array<{ x: number; y: number; sala: number }>,
            baldosas: [] as Array<{ x: number; y: number; pozo: boolean; sala: number }>,
            cintas: [] as Array<{ x: number; y: number; dir: string }>,
            lanzallamas: [] as Array<{ x: number; y: number; dir: string; sala: number }>,
            ojos: [] as Array<{ x: number; y: number; sala: number }>,
        },
        // Fauces del Bagre (dungeonMaw.ts).
        fauces: {
            anclas: [] as string[],
            pisoFlojo: [] as string[],
            cristalesGolpe: [] as string[],
            salasJuntar: [...joinRooms].filter((key) => key.startsWith(`${plan.mapId}:`)).map((key) => Number(key.split(":")[1])),
            peces: [] as Array<{ x: number; y: number; sala: number }>,
            aguaBaja: [] as string[],
        },
        // Torre del Águila (dungeonTower.ts): los pilares, dónde arranca el Orbe y las salas cuyas puertas abren los ojos rotos.
        torre: {
            pilares: [] as Array<{ x: number; y: number; sala: number }>,
            orbe: null as { x: number; y: number } | null,
            salasOjos: [] as number[],
            // La sala del cofre del jefe: el Águila vencida abre sus puertas = y revela sus cofres "trasJefe".
            salaTrofeo: null as number | null,
        },
    };
    if (plan.meta.caida) {
        const caida = markers.caidas.get(Number(plan.meta.caida));
        if (!caida) throw new Error(`El mapa ${plan.mapId} dice "caida: ${plan.meta.caida}", pero ese mapa no tiene una D.`);
        data.caida = caida;
    }
    for (let y = 1; y <= SIZE; y++) {
        for (let x = 1; x <= SIZE; x++) {
            const c = charAt(plan, x, y);
            const key = `${x},${y}`;
            if (isBarrier(c)) {
                const salas = [[1, 0], [-1, 0], [0, 1], [0, -1]]
                    .map(([dx, dy]) => roomOf.get(`${x + dx},${y + dy}`))
                    .filter((id): id is number => Boolean(id));
                data.barriers.push({
                    x,
                    y,
                    tipo: BARRIER_TYPE[c],
                    horizontal: isWall(charAt(plan, x - 1, y)) && isWall(charAt(plan, x + 1, y)),
                    salas: [...new Set(salas)],
                    ...(ONE_WAY_DIR[c] ? { dir: ONE_WAY_DIR[c] } : {}),
                    ...(c === "&" ? { bloque: true } : {}),
                });
            }
            if (c === "*") data.crystals.push(key);
            if (c === ":") data.fragile.push(key);
            if (c === "P") data.timedPlates.push(key);
            if (c === "W") data.crackedWalls.push(key);
            if (c === "Z") data.crushers.push(key);
            if (c === "O") data.pits.push(key);
            if (c === "^") data.lava.push(key);
            if (c === "%") data.lavaPeriodica.push(key);
            if (c === "_" || c === "V" || c === "-") data.plates.push(key);
            if (c === "-") data.weightPlates.push(key);
            if (c === "B" || c === "■") data.blocks.push(key);
            if (c === "⚓") data.fauces.anclas.push(key);
            if (c === "▾") data.fauces.pisoFlojo.push(key);
            if (c === "◇") data.fauces.cristalesGolpe.push(key);
            if (c === "≈") data.fauces.aguaBaja.push(key);
            if (c === "F" || c === "A") data.torches.push({ x, y, encendida: c === "A", sala: roomOf.get(key) ?? 0 });
            if (c === "I") data.ice.push(key);
            if (c === "U" || c === "V" || c === ";" || c === "]" || c === "♜") {
                data.liftables.push({ x, y, tipo: c === ";" ? "piedra" : c === "]" ? "pesada" : c === "♜" ? "estatua" : "vasija", placa: c === "V" });
            }
            const sala = roomOf.get(key) ?? 0;
            if (c === "♞") data.santuario.cabezas.push({ x, y, sala });
            if (c === "▦" || c === "▩") data.santuario.baldosas.push({ x, y, pozo: c === "▩", sala });
            if (c in CONVEYOR_DIR) data.santuario.cintas.push({ x, y, dir: CONVEYOR_DIR[c] });
            if (c === "♨") data.santuario.lanzallamas.push({ x, y, dir: shooterDir(plan, x, y), sala });
            if (c === "◉") data.santuario.ojos.push({ x, y, sala });
            if (c === "¶") data.torre.pilares.push({ x, y, sala });
            if (c === "●") data.torre.orbe = { x, y };
            if (c === "H" || c === "Ψ") data.hookPosts.push(key);
            if (c === "∿") data.fauces.peces.push({ x, y, sala });
            if (c === "/") data.owls.push({ x, y, texto: owlTexts[data.owls.length] ?? "El búho no dice nada." });
            if (c === "(") data.colorBlocks.azul.push(key);
            if (c === ")") data.colorBlocks.naranja.push(key);
            if (c === "|") data.switches.push(key);
            if (c === '"') data.vortexes.push(key);
            if (c in CHEST_CONTENT) {
                data.chests.push({
                    x,
                    y,
                    contenido: CHEST_CONTENT[c],
                    oculto: hiddenChests.has(`${plan.mapId}:${key}`),
                    sala: roomOf.get(key) ?? 0,
                    ...(c === "Ñ" ? { golpe: true } : {}),
                    ...(c === "✉" ? { texto: noteTexts[notes++] ?? "La nota está borrosa." } : {}),
                    ...((legend.cofresTrasJefe ?? []).includes(c) ? { trasJefe: true } : {}),
                });
            }
            if (c === "?") data.slabs.push({ x, y, texto: slabTexts[data.slabs.length] ?? "La losa está gastada: no se puede leer." });
        }
    }
    if (legend.ojosAbrenPuertas) {
        const eyeRooms = new Set(data.santuario.ojos.map((eye) => eye.sala));
        data.torre.salasOjos = [...eyeRooms].filter((sala) => data.barriers.some((b) => b.tipo === "placa" && b.salas.includes(sala)));
    }
    data.torre.salaTrofeo = data.chests.find((chest) => chest.contenido === "trofeo")?.sala ?? null;
    return data;
}

function buildTile(plan: Plan, x: number, y: number): Tile {
    const c = charAt(plan, x, y);
    if (c === " ") return { graphics: VOID_GRH, blocked: true };
    if (isWall(c)) {
        // Cara de la pared si hay piso abajo a 4 baldosas o menos; la fila de la textura depende de la distancia.
        let distance = 1;
        while (distance <= 4 && isWall(charAt(plan, x, y + distance))) distance++;
        const object = c === "W" ? DUNGEON_OBJECTS.paredRajada.id : undefined;
        if (WALLS) return { graphics: themedWallGrh(plan, x, y, WALLS), blocked: true, object };
        if (distance <= 4 && isOpen(charAt(plan, x, y + distance))) {
            return { graphics: block4(WALL_FACE_GRH, x, y, 4 - distance), blocked: true, object };
        }
        return { graphics: VOID_GRH, blocked: true, object };
    }
    if (c === "~" || c === "∿" || isUnderwaterStair(plan, x, y)) {
        // La escalera bajo el agua no se ve: es la zambullida.
        const exit = isStair(c) ? stairExit(plan, c, x, y) : undefined;
        return { graphics: block4(WATER_GRH, x, y), ...(exit ? { exit } : {}) };
    }
    // El agua baja es agua con un reflejo encima (capa 2): así el juego no la toma como agua y se camina.
    if (c === "≈") return { graphics: block4(WATER_GRH, x, y), graphics2: block4(SHALLOW_WATER_GRH, x, y) };
    if (c === "O") return { graphics: VOID_GRH, trigger: NO_NPC_TRIGGER };
    if (c === "^" || c === "%") return { graphics: LAVA_GRHS[(x * 7 + y * 3) % LAVA_GRHS.length], trigger: NO_NPC_TRIGGER };
    const tile: Tile = { graphics: block4(FLOOR_GRH, x, y) };
    if (c === "S") tile.object = PORTAL_OBJ;
    if (isBarrier(c)) {
        const horizontal = isWall(charAt(plan, x - 1, y)) && isWall(charAt(plan, x + 1, y));
        const open = OPEN_BARRIERS.has(c);
        tile.object =
            c === "&"
                ? DUNGEON_OBJECTS.puerta.id
                : horizontal
                  ? open
                      ? DUNGEON_OBJECTS.puertaAbierta.id
                      : DUNGEON_OBJECTS.puerta.id
                  : open
                    ? // Con piel, la puerta lateral abierta también se ve (dungeons.ts, setBarrier).
                      SKIN?.puertasLaterales && isThickSideDoor(plan, x, y)
                        ? DUNGEON_OBJECTS.puertaAbierta.id
                        : undefined
                    : DUNGEON_OBJECTS.barrera.id;
        if (c === "@") tile.object = horizontal ? DUNGEON_OBJECTS.paredBombeable.id : DUNGEON_OBJECTS.rocas.id;
        tile.blocked = !open;
        tile.trigger = NO_NPC_TRIGGER;
    }
    if (c === "_" || c === "-") tile.object = DUNGEON_OBJECTS.placa.id;
    if (c === "P") tile.object = DUNGEON_OBJECTS.runaTiempo.id;
    if (c === "*") {
        tile.object = DUNGEON_OBJECTS.cristal.id;
        tile.blocked = true;
    }
    // Las criaturas no pisan el piso que se desmorona ni los aplastadores.
    if (c === ":") {
        tile.object = DUNGEON_OBJECTS.pisoRajado.id;
        tile.trigger = NO_NPC_TRIGGER;
    }
    if (c === "Z") {
        tile.object = DUNGEON_OBJECTS.losaAplastador.id;
        tile.trigger = NO_NPC_TRIGGER;
    }
    if (c === ",") tile.trigger = NO_NPC_TRIGGER;
    if (c === "B" || c === "■") {
        tile.object = DUNGEON_OBJECTS.bloque.id;
        tile.blocked = true;
    }
    // Fauces del Bagre: el ancla y el piso flojo se pisan (las criaturas no pisan el piso flojo); el cristal de golpe y
    // la cabeza de dragón tapan el paso.
    if (c === "⚓") tile.object = anchorObject(plan, x, y);
    if (c === "▾") {
        tile.object = DUNGEON_OBJECTS.pisoFlojo.id;
        tile.trigger = NO_NPC_TRIGGER;
    }
    if (c === "◇" || c === "Ψ") {
        tile.object = c === "◇" ? DUNGEON_OBJECTS.cristalGolpe.id : DUNGEON_OBJECTS.cabezaDragon.id;
        tile.blocked = true;
    }
    // Torre del Águila: el pilar y el Orbe tapan el paso (el Orbe, hasta que lo levantan).
    if (c === "¶" || c === "●") {
        tile.object = c === "¶" ? DUNGEON_OBJECTS.pilar.id : DUNGEON_OBJECTS.orbe.id;
        tile.blocked = true;
    }
    if (c === "?") {
        tile.object = DUNGEON_OBJECTS.losa.id;
        tile.blocked = true;
    }
    // Roca de la Tortuga: F antorcha apagada, A encendida, I hielo, U vasija, V vasija sobre una placa, ; piedra
    // suelta y H estatua para el Gancho. Todo tapa el paso hasta que se lo enciende, derrite o levanta.
    const tortoiseObject: Record<string, number> = {
        F: DUNGEON_OBJECTS.antorchaApagada.id,
        A: DUNGEON_OBJECTS.antorchaEncendida.id,
        I: DUNGEON_OBJECTS.hielo.id,
        U: DUNGEON_OBJECTS.vasija.id,
        V: DUNGEON_OBJECTS.vasija.id,
        ";": DUNGEON_OBJECTS.piedra.id,
        "]": DUNGEON_OBJECTS.piedraPesada.id,
        H: DUNGEON_OBJECTS.poste.id,
        // Santuario del Rostro: la estatua pesada, la cabeza de caballo (arranca acostada), el lanzallamas y el ojo.
        "♜": DUNGEON_OBJECTS.estatuaPesada.id,
        "♞": DUNGEON_OBJECTS.cabezaAcostada.id,
        "♨": DUNGEON_OBJECTS.lanzallamas.id,
        "◉": DUNGEON_OBJECTS.ojoDePiedra.id,
    };
    if (c in tortoiseObject) {
        tile.object = tortoiseObject[c];
        tile.blocked = true;
    }
    // Búhos, bloques de color (los azules arrancan levantados), cristales y remolinos.
    if (c === "/") {
        tile.object = DUNGEON_OBJECTS.buho.id;
        tile.blocked = true;
    }
    if (c === "(") {
        tile.object = DUNGEON_OBJECTS.bloqueAzul.id;
        tile.blocked = true;
        tile.trigger = NO_NPC_TRIGGER;
    }
    if (c === ")") {
        tile.object = DUNGEON_OBJECTS.bloqueNaranjaBajo.id;
        tile.trigger = NO_NPC_TRIGGER;
    }
    if (c === "|") {
        tile.object = DUNGEON_OBJECTS.cristalAzul.id;
        tile.blocked = true;
    }
    if (c === '"') {
        tile.object = DUNGEON_OBJECTS.remolino.id;
        tile.trigger = NO_NPC_TRIGGER;
    }
    // Baldosas voladoras y cintas: se pisan.
    if (c === "▦" || c === "▩") tile.object = DUNGEON_OBJECTS.baldosaVoladora.id;
    const conveyor: Record<string, number> = {
        "↑": DUNGEON_OBJECTS.cintaNorte.id,
        "↓": DUNGEON_OBJECTS.cintaSur.id,
        "→": DUNGEON_OBJECTS.cintaEste.id,
        "←": DUNGEON_OBJECTS.cintaOeste.id,
    };
    if (c in conveyor) tile.object = conveyor[c];
    if (c in CHEST_CONTENT && !hiddenChests.has(`${plan.mapId}:${x},${y}`)) {
        tile.object = c === "Y" ? DUNGEON_OBJECTS.cofreJefe.id : DUNGEON_OBJECTS.cofre.id;
        tile.blocked = true;
    }
    if (isStair(c)) {
        tile.object = portalDigits.has(c) ? PORTAL_OBJ : STAIRS_OBJ;
        tile.exit = stairExit(plan, c, x, y);
    }
    if (/[a-z]/.test(c)) {
        const entry = legend.criaturas?.[c];
        if (!entry) throw new Error(`La letra "${c}" del mapa ${plan.mapId} no está en criaturas de leyenda.json.`);
        tile.npc = typeof entry === "number" ? entry : entry.npc;
        // Las criaturas de agua nacen en el agua profunda; las pulgas, en el agua baja.
        if (templateFlag(tile.npc, "tierraInvalida")) tile.graphics = block4(WATER_GRH, x, y);
        if (templateFlag(tile.npc, "pulga")) {
            tile.graphics = block4(WATER_GRH, x, y);
            tile.graphics2 = block4(SHALLOW_WATER_GRH, x, y);
        }
    }
    return tile;
}

// Una marca de la plantilla de una criatura (de leyenda.json o de npcs.json).
const serverNpcsForFlags = JSON.parse(fs.readFileSync(path.join(ROOT, "server/jsons/npcs.json"), "utf8"));
function templateFlag(id: number, flag: string): boolean {
    const custom = legend.plantillas?.[String(id)] as Record<string, unknown> | undefined;
    return Boolean(custom?.[flag] ?? serverNpcsForFlags[String(id)]?.[flag]);
}

// El ancla apunta hacia el pozo que tiene al lado: por ahí avanza el puente.
function anchorObject(plan: Plan, x: number, y: number): number {
    const sides: Array<[number, number, number]> = [
        [0, -1, DUNGEON_OBJECTS.ancla.id],
        [0, 1, DUNGEON_OBJECTS.anclaSur.id],
        [1, 0, DUNGEON_OBJECTS.anclaEste.id],
        [-1, 0, DUNGEON_OBJECTS.anclaOeste.id],
    ];
    return sides.find(([dx, dy]) => charAt(plan, x + dx, y + dy) === "O")?.[2] ?? DUNGEON_OBJECTS.ancla.id;
}

// Adonde lleva la escalera `c` de (x, y): al lado de la otra punta.
function stairExit(plan: Plan, c: string, x: number, y: number) {
    const pair = (stairs.get(c) ?? []).filter((s) => !(s.mapId === plan.mapId && s.x === x && s.y === y));
    if (pair.length !== 1) throw new Error(`La escalera ${c} tiene que estar en dos lugares (está en ${pair.length + 1}).`);
    return arrivalNextTo(pair[0]);
}

// Minimapa (frontend/public/imgs_maps/<N>.png): un píxel por baldosa, con los colores del minimapa del mapa 116.
const MINIMAP_COLORS = {
    floor: [62, 60, 26],
    wall: [34, 30, 6],
    void: [17, 17, 17],
    water: [40, 70, 110],
    shallow: [70, 110, 140],
    portal: [70, 150, 230],
    stairs: [150, 110, 60],
    lava: [150, 50, 20],
    chest: [210, 170, 60],
    door: [120, 100, 80],
    crystal: [150, 110, 200],
    fragile: [120, 70, 40],
    crusher: [110, 40, 30],
    crackedWall: [90, 70, 50],
} as const;

function crc32(buffer: Buffer) {
    let crc = ~0;
    for (const byte of buffer) {
        crc ^= byte;
        for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return ~crc >>> 0;
}

function pngChunk(type: string, data: Buffer) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
}

function encodePng(width: number, height: number, rgb: (x: number, y: number) => readonly number[]) {
    const raw = Buffer.alloc((width * 3 + 1) * height);
    for (let y = 0; y < height; y++) {
        raw[y * (width * 3 + 1)] = 0;
        for (let x = 0; x < width; x++) {
            const [r, g, b] = rgb(x + 1, y + 1);
            const i = y * (width * 3 + 1) + 1 + x * 3;
            raw[i] = r;
            raw[i + 1] = g;
            raw[i + 2] = b;
        }
    }
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header[8] = 8; // bits por canal
    header[9] = 2; // RGB
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        pngChunk("IHDR", header),
        pngChunk("IDAT", zlib.deflateSync(raw)),
        pngChunk("IEND", Buffer.alloc(0)),
    ]);
}

function minimapColor(plan: Plan, tile: Tile, x: number, y: number) {
    const c = charAt(plan, x, y);
    if (tile.object === PORTAL_OBJ) return MINIMAP_COLORS.portal;
    if (c === "&") return MINIMAP_COLORS.door;
    // La pared que se vuela no se delata: se ve como pared.
    if (c === "@") return MINIMAP_COLORS.wall;
    if (tile.object === STAIRS_OBJ) return MINIMAP_COLORS.stairs;
    if (c === "*") return MINIMAP_COLORS.crystal;
    if (c === ":") return MINIMAP_COLORS.fragile;
    if (c === "Z") return MINIMAP_COLORS.crusher;
    if (c === "W" || c === "¶") return MINIMAP_COLORS.crackedWall;
    if (c === "~" || c === "∿" || isUnderwaterStair(plan, x, y)) return MINIMAP_COLORS.water;
    if (c === "≈") return MINIMAP_COLORS.shallow;
    if (c === " " || c === "O") return MINIMAP_COLORS.void;
    if (c === "^" || c === "%") return MINIMAP_COLORS.lava;
    // Los cofres ocultos no se delatan en el minimapa.
    if (c in CHEST_CONTENT) return hiddenChests.has(`${plan.mapId}:${x},${y}`) ? MINIMAP_COLORS.floor : MINIMAP_COLORS.chest;
    if (isBarrier(c)) return MINIMAP_COLORS.door;
    if (isWall(c)) return tile.graphics === VOID_GRH ? MINIMAP_COLORS.void : MINIMAP_COLORS.wall;
    return MINIMAP_COLORS.floor;
}

function writeJson(relativePath: string, data: unknown) {
    const fullPath = path.join(ROOT, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(data), "utf8");
}

for (const plan of plans) {
    const palette: Record<string, { graphics: number | number[]; blocked?: boolean }> = {};
    const paletteIds = new Map<string, number>();
    const rows: number[][] = [];
    const specials = {
        id: plan.mapId,
        exits: {} as Record<string, unknown>,
        objects: {} as Record<string, unknown>,
        npcs: {} as Record<string, number>,
        triggers: {} as Record<string, number>,
        dungeon: buildMechanics(plan),
    };
    const placements: Array<{ mapNum: number; x: number; y: number; npcIndex: number; movement?: number }> = [];
    const expanded: Record<string, Record<string, Record<string, unknown>>> = {};
    // La piel para el server (dungeons.ts, skinObject): los objetos de siempre y por baldosa.
    const skinByTile: Record<string, Record<number, number>> = {};

    for (let y = 1; y <= SIZE; y++) {
        const row: number[] = [];
        const expandedRow: Record<string, Record<string, unknown>> = {};
        for (let x = 1; x <= SIZE; x++) {
            const tile = buildTile(plan, x, y);
            const key = `${tile.graphics}|${tile.graphics2 ?? 0}|${tile.blocked ? 1 : 0}`;
            let paletteId = paletteIds.get(key);
            if (!paletteId) {
                paletteId = paletteIds.size + 1;
                paletteIds.set(key, paletteId);
                const graphics = tile.graphics2 ? [tile.graphics, tile.graphics2] : tile.graphics;
                palette[String(paletteId)] = tile.blocked ? { graphics, blocked: true } : { graphics };
            }
            row.push(paletteId);
            const coord = `${x},${y}`;
            const cell: Record<string, unknown> = {};
            if (tile.blocked) cell.blocked = 1;
            cell.graphics = tile.graphics2 ? { "1": tile.graphics, "2": tile.graphics2 } : { "1": tile.graphics };
            if (tile.trigger) {
                specials.triggers[coord] = tile.trigger;
                cell.trigger = tile.trigger;
            }
            if (tile.exit) {
                specials.exits[coord] = tile.exit;
                cell.tileExit = tile.exit;
            }
            const skin = tileSkin(plan, x, y);
            if (Object.keys(skin).length) skinByTile[coord] = skin;
            if (tile.object) {
                // El server guarda el objeto de siempre; el cliente ve el de la piel.
                specials.objects[coord] = { objIndex: tile.object, amount: 1 };
                cell.objInfo = { objIndex: skin[tile.object] ?? objectSkin[tile.object] ?? tile.object, amount: 1 };
            }
            if (tile.npc) {
                specials.npcs[coord] = tile.npc;
                placements.push({ mapNum: plan.mapId, x, y, npcIndex: tile.npc });
            }
            expandedRow[String(x)] = cell;
        }
        rows.push(row);
        expanded[String(y)] = expandedRow;
    }
    if (SKIN) (specials.dungeon as Record<string, unknown>).piel = { objetos: objectSkin, porBaldosa: skinByTile };

    const meta = {
        id: plan.mapId,
        name: plan.meta.nombre ?? `Mazmorra ${plan.mapId}`,
        musicNum: Number(plan.meta.musica ?? 15),
        magiaSinEfecto: 0,
        noEncriptarMp: 0,
        terreno: "DUNGEON",
        zona: "DUNGEON",
        // "GM" la saca de la lista de mapas de la wiki (api/src/repositories/wiki.ts); el server no lo usa.
        restringir: plan.meta.restringir ?? "No",
        minLevel: 0,
        maxLevel: 0,
        backup: 0,
        pk: 0,
    };
    const terrain = { id: plan.mapId, width: SIZE, height: SIZE, palette, rows };
    for (const dir of ["server/mapas_source", "api/src/mapas_source"]) {
        writeJson(`${dir}/mapa_${plan.mapId}/meta.json`, meta);
        writeJson(`${dir}/mapa_${plan.mapId}/terrain.json`, terrain);
        writeJson(`${dir}/mapa_${plan.mapId}/specials.json`, specials);
        writeJson(`${dir}/mapa_${plan.mapId}/npcs.json`, placements);
    }
    writeJson(`frontend/public/static/maps_local/mapa_${plan.mapId}.json`, { [String(plan.mapId)]: expanded });
    fs.writeFileSync(
        path.join(ROOT, `frontend/public/imgs_maps/${plan.mapId}.png`),
        encodePng(SIZE, SIZE, (x, y) => minimapColor(plan, buildTile(plan, x, y), x, y)),
    );
    console.log(`mapa ${plan.mapId} (${meta.name}): ${placements.length} criaturas, ${Object.keys(specials.exits).length} escaleras, ${Object.keys(specials.objects).length} objetos`);
}

// Objetos de mazmorra en objs.json (server y api) y en la copia del cliente.
function upsertDungeonObjects() {
    for (const file of ["server/jsons/objs.json", "api/src/jsons/objs.json"]) {
        const fullPath = path.join(ROOT, file);
        const raw = fs.readFileSync(fullPath, "utf8");
        const objects = JSON.parse(raw);
        const template = objects["864"]; // Pozo: decoración que no se levanta
        for (const entry of [...Object.values(DUNGEON_OBJECTS), ...Object.values(SKIN?.objetos ?? {})]) {
            objects[String(entry.id)] = { ...template, name: entry.name, grhIndex: entry.grh, objType: 0, agarrable: 1, valor: 0 };
        }
        fs.writeFileSync(fullPath, `${JSON.stringify(objects)}${raw.endsWith("\n") ? "\n" : ""}`, "utf8");
    }
    execFileSync("pnpm", ["exec", "tsx", "src/scripts/exportClientObjs.ts"], { cwd: path.join(ROOT, "server"), stdio: "ignore" });
    console.log(`objetos de mazmorra: ${Object.values(DUNGEON_OBJECTS).map((entry) => entry.id).join(", ")}`);
}
upsertDungeonObjects();

// Criaturas propias de la mazmorra (plantillas de leyenda.json) en npcs.json (server y api) y en las copias del cliente.
function upsertCustomNpcs() {
    const custom = Object.entries(legend.plantillas ?? {});
    if (!custom.length) return;
    const serverNpcs = JSON.parse(fs.readFileSync(path.join(ROOT, "server/jsons/npcs.json"), "utf8"));
    const templates = new Map<string, Record<string, unknown>>();
    for (const [id, { base, ...changes }] of custom) {
        const baseTemplate = serverNpcs[String(base)];
        if (!baseTemplate) throw new Error(`La plantilla ${id} usa de base la criatura ${base}, que no existe.`);
        templates.set(id, { ...baseTemplate, ...changes });
    }
    for (const file of ["server/jsons/npcs.json", "api/src/jsons/npcs.json"]) {
        const fullPath = path.join(ROOT, file);
        const raw = fs.readFileSync(fullPath, "utf8");
        const npcs = JSON.parse(raw);
        for (const [id, template] of templates) npcs[id] = template;
        fs.writeFileSync(fullPath, `${JSON.stringify(npcs)}${raw.endsWith("\n") ? "\n" : ""}`, "utf8");
    }
    for (const file of ["frontend/public/init/npcs.json", "frontend/public/init/npcs_optimized.json"]) {
        const fullPath = path.join(ROOT, file);
        const raw = fs.readFileSync(fullPath, "utf8");
        const npcs = JSON.parse(raw);
        for (const [id, template] of templates) {
            const fields = ["name", "idHead", "idBody", "exp", "gold", "hp", "maxHp", "minHit", "maxHit", "def", "poderAtaque", "poderEvasion"];
            npcs[id] = Object.fromEntries(fields.filter((field) => template[field] !== undefined).map((field) => [field, template[field]]));
        }
        fs.writeFileSync(fullPath, `${JSON.stringify(npcs)}${raw.endsWith("\n") ? "\n" : ""}`, "utf8");
    }
    console.log(`criaturas propias: ${[...templates.keys()].join(", ")}`);
}
upsertCustomNpcs();

// Plantilla de la piedra de invocación de la mazmorra (piedraNpc en dungeons.json): una estatua que no se ataca,
// con el nombre de la mazmorra debajo y el id de la mazmorra, que es lo que abre su panel (dungeons.ts).
function upsertStoneTemplate(def: Record<string, unknown>) {
    const npcId = Number(def.piedraNpc ?? 0);
    if (!npcId) return;
    const template = {
        name: "Piedra de invocación",
        npcType: 0,
        idHead: 0,
        idBody: Number(def.piedraCuerpo ?? 256),
        etiqueta: String(def.nombre),
        dungeonId: String(def.id),
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
        objs: [],
        drop: [],
        desc: `Una piedra antigua late con un brillo tenue. Lleva a ${def.nombre}.`,
        spells: [],
        hostile: 0,
        comercia: 0,
        attackable: 0,
        tierraInvalida: 0,
    };
    for (const file of ["server/jsons/npcs.json", "api/src/jsons/npcs.json"]) {
        const npcs = JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
        npcs[String(npcId)] = template;
        fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(npcs)}\n`, "utf8");
    }
    for (const file of ["frontend/public/init/npcs.json", "frontend/public/init/npcs_optimized.json"]) {
        const fullPath = path.join(ROOT, file);
        const raw = fs.readFileSync(fullPath, "utf8");
        const npcs = JSON.parse(raw);
        npcs[String(npcId)] = { name: template.name, idHead: template.idHead, idBody: template.idBody, desc: template.desc, hp: 1, maxHp: 1 };
        fs.writeFileSync(fullPath, `${JSON.stringify(npcs)}${raw.endsWith("\n") ? "\n" : ""}`, "utf8");
    }
    console.log(`piedra de invocación: NPC ${npcId}`);
}

// Entrada y salidas en la definición de la mazmorra.
const dungeonsPath = path.join(ROOT, "server/jsons/dungeons.json");
const dungeons = JSON.parse(fs.readFileSync(dungeonsPath, "utf8")) as Array<Record<string, unknown>>;
const def = dungeons.find((entry) => entry.id === dungeonId);
if (def) {
    if (!markers.entrada) throw new Error("El plano no tiene entrada (E).");
    def.mapas = plans.map((plan) => plan.mapId);
    def.entrada = markers.entrada;
    def.salidas = markers.salidas;
    fs.writeFileSync(dungeonsPath, `${JSON.stringify(dungeons, null, 4)}\n`, "utf8");
    upsertStoneTemplate(def);
    console.log(`dungeons.json: ${dungeonId} entrada ${JSON.stringify(markers.entrada)}, ${markers.salidas.length} salidas`);
} else {
    console.warn(`No hay "${dungeonId}" en jsons/dungeons.json: no se anotaron entrada ni salidas.`);
}
