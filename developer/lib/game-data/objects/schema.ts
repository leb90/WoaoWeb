import { OBJ_TYPE } from "./catalogs";

export type EditorSectionId =
  | "general"
  | "combat"
  | "defense"
  | "potion"
  | "consumable"
  | "door"
  | "spell"
  | "classes"
  | "properties"
  | "advanced";

export type ObjectEditorSchema = {
  sections: EditorSectionId[];
  /** Property flags shown in the Properties section for this type */
  propertyFlags: string[];
  showProjectile: boolean;
  showApu: boolean;
  showHit: boolean;
  showDef: boolean;
  showDefMag: boolean;
  showMagicRes: boolean;
  showSubtype: boolean;
};

const COMMON_PROPS = [
  "agarrable",
  "noSeCae",
  "newbie",
  "objetoEspecial",
];

const ARMOR_PROPS = [...COMMON_PROPS, "abriga", "razaEnana", "mataHobbits"];

export function getEditorSchema(objType: number): ObjectEditorSchema {
  switch (objType) {
    case OBJ_TYPE.armas:
    case OBJ_TYPE.instrumentosMusicales:
      return {
        sections: ["general", "combat", "classes", "properties", "advanced"],
        propertyFlags: COMMON_PROPS,
        showProjectile: true,
        showApu: true,
        showHit: true,
        showDef: false,
        showDefMag: false,
        showMagicRes: false,
        showSubtype: true,
      };
    case OBJ_TYPE.flechas:
      return {
        sections: ["general", "combat", "properties", "advanced"],
        propertyFlags: COMMON_PROPS,
        showProjectile: false,
        showApu: false,
        showHit: true,
        showDef: false,
        showDefMag: false,
        showMagicRes: false,
        showSubtype: false,
      };
    case OBJ_TYPE.armaduras:
      return {
        sections: ["general", "defense", "classes", "properties", "advanced"],
        propertyFlags: ARMOR_PROPS,
        showProjectile: false,
        showApu: false,
        showHit: false,
        showDef: true,
        showDefMag: true,
        showMagicRes: false,
        showSubtype: true,
      };
    case OBJ_TYPE.escudos:
    case OBJ_TYPE.cascos:
      return {
        sections: ["general", "defense", "classes", "properties", "advanced"],
        propertyFlags: ARMOR_PROPS,
        showProjectile: false,
        showApu: false,
        showHit: false,
        showDef: true,
        showDefMag: true,
        showMagicRes: false,
        showSubtype: false,
      };
    case OBJ_TYPE.anillos:
      return {
        sections: ["general", "defense", "classes", "properties", "advanced"],
        propertyFlags: COMMON_PROPS,
        showProjectile: false,
        showApu: false,
        showHit: false,
        showDef: false,
        showDefMag: true,
        showMagicRes: true,
        showSubtype: true,
      };
    case OBJ_TYPE.pociones:
      return {
        sections: ["general", "potion", "properties", "advanced"],
        propertyFlags: COMMON_PROPS,
        showProjectile: false,
        showApu: false,
        showHit: false,
        showDef: false,
        showDefMag: false,
        showMagicRes: false,
        showSubtype: false,
      };
    case OBJ_TYPE.comida:
    case OBJ_TYPE.bebidas:
      return {
        sections: ["general", "consumable", "properties", "advanced"],
        propertyFlags: COMMON_PROPS,
        showProjectile: false,
        showApu: false,
        showHit: false,
        showDef: false,
        showDefMag: false,
        showMagicRes: false,
        showSubtype: false,
      };
    case OBJ_TYPE.puerta:
      return {
        sections: ["general", "door", "properties", "advanced"],
        propertyFlags: ["agarrable", "objetoEspecial"],
        showProjectile: false,
        showApu: false,
        showHit: false,
        showDef: false,
        showDefMag: false,
        showMagicRes: false,
        showSubtype: false,
      };
    case OBJ_TYPE.objetoContenedor:
      return {
        sections: ["general", "door", "properties", "advanced"],
        propertyFlags: COMMON_PROPS,
        showProjectile: false,
        showApu: false,
        showHit: false,
        showDef: false,
        showDefMag: false,
        showMagicRes: false,
        showSubtype: false,
      };
    case OBJ_TYPE.pergaminos:
      return {
        sections: ["general", "spell", "properties", "advanced"],
        propertyFlags: COMMON_PROPS,
        showProjectile: false,
        showApu: false,
        showHit: false,
        showDef: false,
        showDefMag: false,
        showMagicRes: false,
        showSubtype: false,
      };
    default:
      return {
        sections: ["general", "properties", "advanced"],
        propertyFlags: [...COMMON_PROPS, "abriga", "razaEnana", "mataHobbits"],
        showProjectile: false,
        showApu: false,
        showHit: false,
        showDef: false,
        showDefMag: false,
        showMagicRes: false,
        showSubtype: true,
      };
  }
}

export const FLAG_LABELS: Record<
  string,
  { label: string; hint?: string; /** UI checked means JSON 0 */ inverted?: boolean }
> = {
  agarrable: {
    label: "Agarrable",
    hint: "Si está activo, se puede juntar del piso. (En objs.json se guarda invertido: 0 = sí, 1 = no.)",
    inverted: true,
  },
  noSeCae: { label: "No se cae", hint: "No cae al morir." },
  newbie: { label: "Newbie", hint: "Ítem de principiante." },
  objetoEspecial: { label: "Objeto especial" },
  abriga: { label: "Abriga", hint: "Protección contra frío." },
  razaEnana: { label: "Raza enana", hint: "Restricción / bonus de raza enana." },
  mataHobbits: { label: "Mata hobbits", hint: "Flag legacy (sin lógica de combate actual)." },
  proyectil: { label: "Es un arma de proyectil" },
  apu: { label: "Puede apuñalar (APU)" },
  cerrada: { label: "Cerrada (flag legacy)" },
};
