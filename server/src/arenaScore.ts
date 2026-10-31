// Puntaje del modo Arena: en vez de subir de nivel, se sube en el ranking de la partida, como en los .io.
//   - Cada muerte te saca la mitad de tus puntos, y quien te mató se los lleva más 10 de base:
//     cazar al primero rinde más que cazar a uno que recién entra.
//   - Matar dos veces a la misma persona en menos de un minuto no suma (ni le saca a ella), para que no se
//     puedan regalar muertes entre amigos.
//   npx tsx --test src/arenaScore.test.ts
export {};

export const ARENA_KILL_POINTS = 10;
export const ARENA_REKILL_WINDOW_MS = 60_000;

export type ArenaScore = {
    id: string;
    accountId: string;
    nombre: string;
    idClase: number;
    puntos: number;
    kills: number;
    muertes: number;
    racha: number;
    mejorRacha: number;
    mejorPuntaje: number;
    /** Cuándo llegó a su puntaje actual: desempata a favor de quien llegó primero. */
    puntosDesde: number;
    /** Lo que perdió en su última muerte, a la espera de saber quién lo mató. */
    botin: number;
};

export function createScore(id: string, accountId: string, nombre: string, idClase: number, now: number): ArenaScore {
    return {
        id,
        accountId,
        nombre,
        idClase,
        puntos: 0,
        kills: 0,
        muertes: 0,
        racha: 0,
        mejorRacha: 0,
        mejorPuntaje: 0,
        puntosDesde: now,
        botin: 0,
    };
}

function setPoints(score: ArenaScore, puntos: number, now: number) {
    if (puntos !== score.puntos) {
        score.puntos = puntos;
        score.puntosDesde = now;
    }
    score.mejorPuntaje = Math.max(score.mejorPuntaje, score.puntos);
}

/** Muerte de cualquier causa: pierde la mitad de sus puntos y la racha. */
export function applyDeath(victim: ArenaScore, now: number): number {
    const perdidos = Math.floor(victim.puntos / 2);
    setPoints(victim, victim.puntos - perdidos, now);
    victim.botin = perdidos;
    victim.muertes += 1;
    victim.racha = 0;
    return perdidos;
}

export type KillResult = { ganados: number; repetida: boolean };

/** Se llama después de applyDeath(victim). `lastKills` guarda la última vez que cada uno mató a cada otro. */
export function applyKill(
    killer: ArenaScore,
    victim: ArenaScore,
    lastKills: Map<string, number>,
    now: number,
): KillResult {
    const pair = `${killer.id}>${victim.id}`;
    const previous = lastKills.get(pair);
    const botin = victim.botin;
    victim.botin = 0;

    if (typeof previous === "number" && now - previous < ARENA_REKILL_WINDOW_MS) {
        setPoints(victim, victim.puntos + botin, now);
        return { ganados: 0, repetida: true };
    }

    lastKills.set(pair, now);
    const ganados = ARENA_KILL_POINTS + botin;
    setPoints(killer, killer.puntos + ganados, now);
    killer.kills += 1;
    killer.racha += 1;
    killer.mejorRacha = Math.max(killer.mejorRacha, killer.racha);
    return { ganados, repetida: false };
}

export function compareScores(left: ArenaScore, right: ArenaScore): number {
    return right.puntos - left.puntos || right.kills - left.kills || left.puntosDesde - right.puntosDesde;
}

export function standings(scores: Iterable<ArenaScore>): ArenaScore[] {
    return [...scores].sort(compareScores);
}

/** Saca de la memoria de muertes repetidas lo que ya no cuenta. */
export function pruneLastKills(lastKills: Map<string, number>, now: number) {
    for (const [pair, at] of lastKills) {
        if (now - at >= ARENA_REKILL_WINDOW_MS) {
            lastKills.delete(pair);
        }
    }
}
