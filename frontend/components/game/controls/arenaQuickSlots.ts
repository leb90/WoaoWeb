import type { StoredMacro } from "../../../lib/character-settings";
import { createEmptyMacros } from "../../../lib/character-settings";
import type { InventoryItem, SpellEntry } from "../../../lib/aowProtocol";
import { ITEM_QUICK_SLOT_INDICES, SPELL_QUICK_SLOT_INDICES } from "./MobileHud";

type ArenaQuickSlots = { hechizos: number[]; items: number[] };

// Arena: los accesos rápidos de mobile vienen puestos con lo de la clase (server/src/arenaClasses.ts, `accesos`).
// No se guardan: el personaje de la arena es de una sola partida.
export function buildArenaQuickSlotMacros(
    accesos: ArenaQuickSlots,
    spells: SpellEntry[],
    items: InventoryItem[],
): Array<StoredMacro | null> {
    const macros = createEmptyMacros();

    accesos.hechizos.forEach((idSpell, index) => {
        const spell = spells.find((entry) => entry.idSpell === idSpell);
        const macroIndex = SPELL_QUICK_SLOT_INDICES[index];
        if (spell && macroIndex !== undefined) {
            macros[macroIndex] = {
                // La misma tecla sintética que pone el editor de mobile (MacroBar, getTouchSlotKeyCode).
                keyCode: `TouchSlot${macroIndex}`,
                targetType: "spell",
                label: spell.name,
                targetSlot: spell.slot,
                targetId: spell.idSpell,
            };
        }
    });

    accesos.items.forEach((idItem, index) => {
        const item = items.find((entry) => entry.idItem === idItem);
        const macroIndex = ITEM_QUICK_SLOT_INDICES[index];
        if (item && macroIndex !== undefined) {
            macros[macroIndex] = {
                keyCode: `TouchSlot${macroIndex}`,
                targetType: "item",
                label: item.name,
                targetSlot: item.slot,
                targetId: item.idItem,
            };
        }
    });

    return macros;
}
