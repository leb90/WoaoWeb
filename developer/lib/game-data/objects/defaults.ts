import { OBJ_TYPE } from "./catalogs";
import type { ObjData } from "./presentation";

/** Minimal draft for a new object of the given type — does not write disk. */
export function createObjectDraft(objType: number, name?: string): ObjData {
  const base: ObjData = {
    name: name ?? defaultNameForType(objType),
    objType,
    grhIndex: 0,
    valor: 0,
    anim: 0,
    agarrable: 0,
    newbie: 0,
    noSeCae: 0,
    clasesNoPermitidas: [],
  };

  switch (objType) {
    case OBJ_TYPE.armas:
      return {
        ...base,
        minHit: 1,
        maxHit: 1,
        proyectil: 0,
        apu: 0,
        subtipo: 0,
      };
    case OBJ_TYPE.flechas:
      return { ...base, minHit: 1, maxHit: 1 };
    case OBJ_TYPE.armaduras:
    case OBJ_TYPE.escudos:
    case OBJ_TYPE.cascos:
      return {
        ...base,
        minDef: 0,
        maxDef: 0,
        minDefMag: 0,
        maxDefMag: 0,
        subtipo: objType === OBJ_TYPE.cascos ? 1 : objType === OBJ_TYPE.escudos ? 2 : 0,
        abriga: 0,
        razaEnana: 0,
      };
    case OBJ_TYPE.anillos:
      return {
        ...base,
        subtipo: 0,
        resistenciaMagica: 0,
        minDefMag: 0,
        maxDefMag: 0,
      };
    case OBJ_TYPE.pociones:
      return {
        ...base,
        tipoPocion: 3,
        minModificador: 0,
        maxModificador: 0,
        porcentaje: 0,
      };
    case OBJ_TYPE.comida:
      return { ...base, minHam: 0, maxHam: 0 };
    case OBJ_TYPE.bebidas:
      return { ...base, minSed: 0, maxSed: 0 };
    case OBJ_TYPE.puerta:
      return {
        ...base,
        indexAbierta: 0,
        indexCerrada: 0,
        llave: 0,
        cerrada: 0,
        // Runtime: agarrable=1 blocks floor pickup (doors/trees/etc.)
        agarrable: 1,
      };
    case OBJ_TYPE.objetoContenedor:
      return {
        ...base,
        indexAbierta: 0,
        indexCerrada: 0,
      };
    case OBJ_TYPE.pergaminos:
      return { ...base, spellIndex: 0 };
    default:
      return base;
  }
}

function defaultNameForType(objType: number): string {
  switch (objType) {
    case OBJ_TYPE.armas:
      return "Nueva arma";
    case OBJ_TYPE.armaduras:
      return "Nueva armadura";
    case OBJ_TYPE.pociones:
      return "Nueva poción";
    case OBJ_TYPE.comida:
      return "Nueva comida";
    case OBJ_TYPE.puerta:
      return "Nueva puerta";
    case OBJ_TYPE.objetoContenedor:
      return "Nuevo contenedor";
    default:
      return "Nuevo objeto";
  }
}

export function duplicateAsDraft(source: ObjData, newName?: string): ObjData {
  const copy = structuredClone(source) as ObjData;
  const baseName = String(source.name ?? "Objeto");
  copy.name = newName ?? `${baseName} - copia`;
  return copy;
}
