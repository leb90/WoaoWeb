// Muñecos de entrenamiento de Nix (plantilla 9845, scripts/applyTrainingDummiesData.ts): para practicar golpes,
// flechas y hechizos. No se mueven, no pegan y no se rompen: en cada golpe respawn.muere les devuelve la vida en vez
// de matarlos. Se tambalean con cada golpe (su cuerpo de golpe en bodies.json, como el ataque de las criaturas) y,
// cuando dejás de pegarles, te dicen cuánto daño hiciste y cuánto por segundo.
import type { EntityId, RuntimeClient } from "./types/runtime";

export {};

const vars = require("./vars");
const handleProtocol = require("./handleProtocol");

function getGame() {
    return require("./game");
}

/** El mismo número que usa scripts/applyTrainingDummiesData.ts. */
export const TRAINING_DUMMY_NPC = 9845;
// Marca de cuerpo del golpe (CHARACTER_SWING_BODY de npcs.ts): el cliente pasa al cuerpo de golpe del muñeco.
const SWING_BODY = 4;
// Sin pegarle este tiempo, la tanda terminó y el muñeco dice el total.
const FIN_DE_TANDA_MS = 4_000;
const REVISAR_CADA_MS = 1_000;

type DummyNpc = {
    id: EntityId;
    map: number;
    pos: { x: number; y: number };
    hp: number;
    maxHp: number;
    templateNpcIndex?: number;
    nameCharacter?: string;
};

type Tanda = { atacante: string; muneco: string; golpes: number; dano: number; maximo: number; desde: number; hasta: number };

const tandas = new Map<string, Tanda>();
let proximaRevision = 0;

export function isTrainingDummy(npc: { templateNpcIndex?: number } | null | undefined): boolean {
    return Number(npc?.templateNpcIndex ?? 0) === TRAINING_DUMMY_NPC;
}

function numero(valor: number) {
    return Math.round(valor).toLocaleString("es-AR");
}

function vitalesYGolpe(npc: DummyNpc, conGolpe: boolean) {
    getGame().loopAreaPos(npc.map, npc.pos, (target: { id: EntityId; isNpc?: boolean }) => {
        if (target.isNpc) {
            return;
        }
        const client = vars.clients[target.id] as RuntimeClient | undefined;
        if (!client) {
            return;
        }
        if (conGolpe) {
            handleProtocol.characterSwing(npc.id, SWING_BODY, client);
        }
        handleProtocol.entityVitalsDelta(npc.id, npc.hp, npc.maxHp, 0, 0, client);
    });
}

/** Lo llama respawn.muere después de cada golpe o hechizo: anota el daño y le devuelve la vida. */
export function onHit(npc: DummyNpc, atacanteId: EntityId, ahora = Date.now()) {
    const dano = Math.max(0, Number(npc.maxHp) - Number(npc.hp));
    npc.hp = Number(npc.maxHp);
    vitalesYGolpe(npc, dano > 0);
    if (dano <= 0) {
        return;
    }

    const clave = `${atacanteId}>${npc.id}`;
    const tanda = tandas.get(clave) ?? {
        atacante: String(atacanteId),
        muneco: String(npc.id),
        golpes: 0,
        dano: 0,
        maximo: 0,
        desde: ahora,
        hasta: ahora,
    };
    tanda.golpes += 1;
    tanda.dano += dano;
    tanda.maximo = Math.max(tanda.maximo, dano);
    tanda.hasta = ahora;
    tandas.set(clave, tanda);
}

export function resumenDeTanda(tanda: Pick<Tanda, "golpes" | "dano" | "maximo" | "desde" | "hasta">): string {
    if (tanda.golpes === 1) {
        return `Muñeco> Un golpe de ${numero(tanda.dano)}.`;
    }
    const segundos = Math.max(1, (tanda.hasta - tanda.desde) / 1000);
    const duracion = segundos.toLocaleString("es-AR", { maximumFractionDigits: 1 });
    return `Muñeco> ${tanda.golpes} golpes: ${numero(tanda.dano)} de daño en ${duracion} s (${numero(
        tanda.dano / segundos,
    )} por segundo; el más fuerte, ${numero(tanda.maximo)}).`;
}

/** Una vuelta del bucle del server: cierra las tandas terminadas y cura lo que hayan sacado venenos o áreas. */
export function tick(ahora: number) {
    if (ahora < proximaRevision) {
        return;
    }
    proximaRevision = ahora + REVISAR_CADA_MS;

    for (const [clave, tanda] of tandas) {
        if (ahora - tanda.hasta < FIN_DE_TANDA_MS) {
            continue;
        }
        tandas.delete(clave);
        const client = vars.clients[tanda.atacante] as RuntimeClient | undefined;
        if (client) {
            handleProtocol.console(resumenDeTanda(tanda), "#9FD3FF", 1, 0, client);
        }
    }

    for (const npc of Object.values(vars.npcs as Record<string, DummyNpc | undefined>)) {
        if (npc && isTrainingDummy(npc) && Number(npc.hp) < Number(npc.maxHp)) {
            npc.hp = Number(npc.maxHp);
            vitalesYGolpe(npc, false);
        }
    }
}
