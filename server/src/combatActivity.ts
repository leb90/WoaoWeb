import type { EntityId } from "./types/runtime";
const lastAction = new Map<string, number>();
export function recordCombatActivity(attacker: EntityId, target: EntityId, effective: boolean) {
    if (!effective || String(attacker) === String(target)) return;
    lastAction.set(String(attacker), Date.now());
}
export function hasCombatActivity(id: EntityId, since: number): boolean {
    return (lastAction.get(String(id)) ?? 0) >= since;
}
