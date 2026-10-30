import type { Character, Engine } from "./Engine";

// El golpe de las criaturas que tienen hoja de ataque (bodies.json: "ataque" es el cuerpo con la animación). Cuando
// una criatura pega, el server manda el golpe con la marca de cuerpo (CHARACTER_SWING_BODY, server/src/npcs.ts); la
// criatura pasa a su cuerpo de ataque, que se anima una vez aunque esté quieta, y después vuelve al de caminar.

type AttackingCharacter = Character & { creatureAttack?: { walkBody: number; until: number } };
// En bodies.json, el cuerpo de caminar de una criatura con hoja de ataque trae "ataque": el cuerpo de la animación.
type BodyWithAttack = { ataque?: number };

const DEFAULT_ATTACK_MS = 540;

export function startCreatureAttack(engine: Engine, character: Character, now: number): void {
    const attacking = character as AttackingCharacter;
    const walkBody = attacking.creatureAttack?.walkBody ?? character.idBody;
    const attackBody = Number((engine.bodiesDB?.[String(walkBody)] as BodyWithAttack | undefined)?.ataque ?? 0);
    if (!attackBody || !engine.bodiesDB?.[String(attackBody)]) return;
    const graphic = engine.graphicsDB?.[String(engine.bodiesDB[String(attackBody)]["2"])];
    const durationMs = graphic ? Math.max(1, Number(graphic.numFrames) || 1) * Math.max(Number(graphic.speed) || 0, 40) : DEFAULT_ATTACK_MS;
    attacking.creatureAttack = { walkBody, until: now + durationMs };
    character.bodyAnimationStartedAt = now;
    if (character.idBody !== attackBody) {
        character.idBody = attackBody;
        engine.requestCharacterRerender?.(Number(character.id));
    }
}

export function isCreatureAttacking(character: Character, now: number): boolean {
    return ((character as AttackingCharacter).creatureAttack?.until ?? 0) > now;
}

// Terminado el golpe, vuelve al cuerpo de caminar.
export function updateCreatureAttack(engine: Engine, character: Character, now: number): void {
    const attacking = character as AttackingCharacter;
    const attack = attacking.creatureAttack;
    if (!attack || attack.until > now) return;
    attacking.creatureAttack = undefined;
    if (character.idBody !== attack.walkBody) {
        character.idBody = attack.walkBody;
        character.bodyAnimationStartedAt = undefined;
        engine.requestCharacterRerender?.(Number(character.id));
    }
}
