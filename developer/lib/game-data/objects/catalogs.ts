/**
 * Object type / class / potion catalogs derived from server/src/vars.ts.
 * Do not invent IDs — unknown types fall back to "Tipo N".
 */

export const OBJ_TYPE = {
  comida: 1,
  armas: 2,
  armaduras: 3,
  arboles: 4,
  dinero: 5,
  puerta: 6,
  objetoContenedor: 7,
  carteles: 8,
  llaves: 9,
  foros: 10,
  pociones: 11,
  libros: 12,
  bebidas: 13,
  lenia: 14,
  fogata: 15,
  escudos: 16,
  cascos: 17,
  anillos: 18,
  teleport: 19,
  muebles: 20,
  joyas: 21,
  yacimientos: 22,
  metales: 23,
  pergaminos: 24,
  aura: 25,
  instrumentosMusicales: 26,
  yunque: 27,
  fraguas: 28,
  gemas: 29,
  flores: 30,
  barcos: 31,
  flechas: 32,
  botellasVacias: 33,
  botellasLlenas: 34,
  manchas: 35,
  lingotes: 36,
  recetas: 46,
  capaHobbit: 50,
  mascotas: 60,
} as const;

export type ObjTypeId = (typeof OBJ_TYPE)[keyof typeof OBJ_TYPE];

export type ObjectTypeMeta = {
  id: number;
  key: string;
  label: string;
  plural: string;
  icon: string;
  /** Quick-filter chip group */
  filterGroup:
    | "all"
    | "armas"
    | "armaduras"
    | "pociones"
    | "comida"
    | "puertas"
    | "contenedores"
    | "especiales"
    | "other";
  description: string;
  badgeTone:
    | "weapon"
    | "armor"
    | "potion"
    | "food"
    | "door"
    | "container"
    | "special"
    | "neutral";
};

export const OBJECT_TYPE_METAS: ObjectTypeMeta[] = [
  { id: 1, key: "comida", label: "Comida", plural: "Comida", icon: "🍎", filterGroup: "comida", description: "Consume para recuperar hambre.", badgeTone: "food" },
  { id: 2, key: "armas", label: "Arma", plural: "Armas", icon: "⚔", filterGroup: "armas", description: "Armas cuerpo a cuerpo o proyectil.", badgeTone: "weapon" },
  { id: 3, key: "armaduras", label: "Armadura", plural: "Armaduras", icon: "🛡", filterGroup: "armaduras", description: "Ropa / armadura (subtipo puede casco/escudo).", badgeTone: "armor" },
  { id: 4, key: "arboles", label: "Árbol", plural: "Árboles", icon: "🌳", filterGroup: "especiales", description: "Recurso de leña.", badgeTone: "special" },
  { id: 5, key: "dinero", label: "Dinero", plural: "Dinero", icon: "🪙", filterGroup: "especiales", description: "Moneda del juego.", badgeTone: "special" },
  { id: 6, key: "puerta", label: "Puerta", plural: "Puertas", icon: "🚪", filterGroup: "puertas", description: "Puerta abrible / bloqueo de mapa.", badgeTone: "door" },
  { id: 7, key: "objetoContenedor", label: "Contenedor", plural: "Contenedores", icon: "▣", filterGroup: "contenedores", description: "Cofre u objeto contenedor.", badgeTone: "container" },
  { id: 8, key: "carteles", label: "Cartel", plural: "Carteles", icon: "🪧", filterGroup: "especiales", description: "Cartel informativo.", badgeTone: "special" },
  { id: 9, key: "llaves", label: "Llave", plural: "Llaves", icon: "🔑", filterGroup: "especiales", description: "Llave de casa / acceso.", badgeTone: "special" },
  { id: 10, key: "foros", label: "Foro", plural: "Foros", icon: "📜", filterGroup: "especiales", description: "Foro del juego.", badgeTone: "special" },
  { id: 11, key: "pociones", label: "Poción", plural: "Pociones", icon: "⚗", filterGroup: "pociones", description: "Poción consumible.", badgeTone: "potion" },
  { id: 12, key: "libros", label: "Libro", plural: "Libros", icon: "📕", filterGroup: "especiales", description: "Libro.", badgeTone: "special" },
  { id: 13, key: "bebidas", label: "Bebida", plural: "Bebidas", icon: "🧃", filterGroup: "comida", description: "Bebida (sed).", badgeTone: "food" },
  { id: 14, key: "lenia", label: "Leña", plural: "Leña", icon: "🪵", filterGroup: "especiales", description: "Leña.", badgeTone: "special" },
  { id: 15, key: "fogata", label: "Fogata", plural: "Fogatas", icon: "🔥", filterGroup: "especiales", description: "Fogata.", badgeTone: "special" },
  { id: 16, key: "escudos", label: "Escudo", plural: "Escudos", icon: "🛡", filterGroup: "armaduras", description: "Escudo equipable.", badgeTone: "armor" },
  { id: 17, key: "cascos", label: "Casco", plural: "Cascos", icon: "🪖", filterGroup: "armaduras", description: "Casco equipable.", badgeTone: "armor" },
  { id: 18, key: "anillos", label: "Anillo", plural: "Anillos", icon: "💍", filterGroup: "especiales", description: "Anillo / accesorio.", badgeTone: "special" },
  { id: 19, key: "teleport", label: "Teleport", plural: "Teleports", icon: "✨", filterGroup: "especiales", description: "Ticket / teleport.", badgeTone: "special" },
  { id: 20, key: "muebles", label: "Mueble", plural: "Muebles", icon: "🪑", filterGroup: "especiales", description: "Mueble de escenario.", badgeTone: "special" },
  { id: 21, key: "joyas", label: "Joya", plural: "Joyas", icon: "💎", filterGroup: "especiales", description: "Joya.", badgeTone: "special" },
  { id: 22, key: "yacimientos", label: "Yacimiento", plural: "Yacimientos", icon: "⛏", filterGroup: "especiales", description: "Yacimiento minable.", badgeTone: "special" },
  { id: 23, key: "metales", label: "Metal", plural: "Metales", icon: "⛓", filterGroup: "especiales", description: "Mineral / metal.", badgeTone: "special" },
  { id: 24, key: "pergaminos", label: "Pergamino", plural: "Pergaminos", icon: "📜", filterGroup: "especiales", description: "Pergamino de hechizo.", badgeTone: "special" },
  { id: 25, key: "aura", label: "Aura", plural: "Auras", icon: "✧", filterGroup: "especiales", description: "Aura.", badgeTone: "special" },
  { id: 26, key: "instrumentosMusicales", label: "Instrumento", plural: "Instrumentos", icon: "🎵", filterGroup: "armas", description: "Instrumento musical / báculo.", badgeTone: "weapon" },
  { id: 27, key: "yunque", label: "Yunque", plural: "Yunques", icon: "⚒", filterGroup: "especiales", description: "Yunque.", badgeTone: "special" },
  { id: 28, key: "fraguas", label: "Fragua", plural: "Fraguas", icon: "🔥", filterGroup: "especiales", description: "Fragua.", badgeTone: "special" },
  { id: 29, key: "gemas", label: "Gema", plural: "Gemas", icon: "💠", filterGroup: "especiales", description: "Gema.", badgeTone: "special" },
  { id: 30, key: "flores", label: "Flor", plural: "Flores", icon: "🌸", filterGroup: "especiales", description: "Flor.", badgeTone: "special" },
  { id: 31, key: "barcos", label: "Barco", plural: "Barcos", icon: "⛵", filterGroup: "especiales", description: "Barco / navegación.", badgeTone: "special" },
  { id: 32, key: "flechas", label: "Flecha", plural: "Flechas", icon: "➳", filterGroup: "armas", description: "Munición de proyectil.", badgeTone: "weapon" },
  { id: 33, key: "botellasVacias", label: "Botella vacía", plural: "Botellas vacías", icon: "🫙", filterGroup: "especiales", description: "Botella vacía.", badgeTone: "special" },
  { id: 34, key: "botellasLlenas", label: "Botella llena", plural: "Botellas llenas", icon: "🫙", filterGroup: "especiales", description: "Botella llena.", badgeTone: "special" },
  { id: 35, key: "manchas", label: "Mancha", plural: "Manchas", icon: "◈", filterGroup: "especiales", description: "Mancha de escenario.", badgeTone: "special" },
  { id: 36, key: "lingotes", label: "Lingote", plural: "Lingotes", icon: "▮", filterGroup: "especiales", description: "Lingote fundido.", badgeTone: "special" },
  { id: 46, key: "recetas", label: "Receta", plural: "Recetas", icon: "📋", filterGroup: "especiales", description: "Ítem de receta de crafting.", badgeTone: "special" },
  { id: 50, key: "capaHobbit", label: "Capa hobbit", plural: "Capas hobbit", icon: "🧥", filterGroup: "especiales", description: "Tipo 50 (capa hobbit en runtime).", badgeTone: "special" },
  { id: 60, key: "mascotas", label: "Mascota", plural: "Mascotas", icon: "🐾", filterGroup: "especiales", description: "Mascota / montura.", badgeTone: "special" },
];

const META_BY_ID = new Map(OBJECT_TYPE_METAS.map((m) => [m.id, m]));

export function getObjectTypeMeta(objType: number): ObjectTypeMeta {
  return (
    META_BY_ID.get(objType) ?? {
      id: objType,
      key: `tipo_${objType}`,
      label: `Tipo ${objType}`,
      plural: `Tipo ${objType}`,
      icon: "★",
      filterGroup: "especiales",
      description: "Tipo fuera del catálogo vars.objType.",
      badgeTone: "special",
    }
  );
}

export function getObjectTypeLabel(objType: number): string {
  return getObjectTypeMeta(objType).label;
}

/** Types offered in the "Nuevo objeto" wizard (main content types). */
export const CREATEABLE_OBJECT_TYPES: number[] = [
  OBJ_TYPE.armas,
  OBJ_TYPE.armaduras,
  OBJ_TYPE.pociones,
  OBJ_TYPE.comida,
  OBJ_TYPE.puerta,
  OBJ_TYPE.objetoContenedor,
  OBJ_TYPE.flechas,
  OBJ_TYPE.escudos,
  OBJ_TYPE.cascos,
  OBJ_TYPE.anillos,
  OBJ_TYPE.pergaminos,
  OBJ_TYPE.llaves,
  OBJ_TYPE.bebidas,
  OBJ_TYPE.carteles,
  OBJ_TYPE.teleport,
  OBJ_TYPE.barcos,
  OBJ_TYPE.recetas,
  OBJ_TYPE.mascotas,
];

export const POTION_TYPES: Array<{ id: number; label: string }> = [
  { id: 1, label: "Agilidad" },
  { id: 2, label: "Fuerza" },
  { id: 3, label: "Vida" },
  { id: 4, label: "Maná" },
  { id: 5, label: "Cura veneno" },
];

export function getPotionTypeLabel(id: number): string {
  return POTION_TYPES.find((p) => p.id === id)?.label ?? `Poción ${id}`;
}

export type ClassMeta = {
  id: number;
  name: string;
  category: "combat" | "magic" | "worker";
};

/** From vars.clases / nameClases — IDs 10–11 intentionally absent. */
export const GAME_CLASSES: ClassMeta[] = [
  { id: 1, name: "Mago", category: "magic" },
  { id: 2, name: "Clérigo", category: "magic" },
  { id: 3, name: "Guerrero", category: "combat" },
  { id: 4, name: "Asesino", category: "combat" },
  { id: 5, name: "Ladrón", category: "worker" },
  { id: 6, name: "Bardo", category: "magic" },
  { id: 7, name: "Druida", category: "magic" },
  { id: 8, name: "Paladín", category: "combat" },
  { id: 9, name: "Cazador", category: "combat" },
  { id: 12, name: "Bandido", category: "combat" },
  { id: 13, name: "Pescador", category: "worker" },
  { id: 14, name: "Herrero", category: "worker" },
  { id: 15, name: "Leñador", category: "worker" },
  { id: 16, name: "Minero", category: "worker" },
  { id: 17, name: "Carpintero", category: "worker" },
  { id: 18, name: "Pirata", category: "worker" },
  { id: 19, name: "Ermitaño", category: "worker" },
  { id: 20, name: "Arquero", category: "combat" },
  { id: 21, name: "Domador", category: "worker" },
];

export function getClassName(classId: number): string {
  return GAME_CLASSES.find((c) => c.id === classId)?.name ?? `Clase ${classId}`;
}

export const ALL_CLASS_IDS = GAME_CLASSES.map((c) => c.id);

/** Flags stored as 0/1 in objs.json */
export const FLAG_KEYS = [
  "agarrable",
  "noSeCae",
  "newbie",
  "proyectil",
  "objetoEspecial",
  "cerrada",
  "abriga",
  "razaEnana",
  "mataHobbits",
  "apu",
] as const;

export type FlagKey = (typeof FLAG_KEYS)[number];

export function flagToBool(value: unknown): boolean {
  return Number(value) === 1 || value === true;
}

export function boolToFlag(value: boolean): number {
  return value ? 1 : 0;
}
