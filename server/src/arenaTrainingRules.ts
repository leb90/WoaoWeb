// Reglas del entrenamiento contra el bot de la arena (arenaTraining.ts): cómo juega el bot en cada nivel y cuántos
// puntos da ganarle. Del nivel 1 al 10 el bot aprende a jugar (reacciona más rápido, aprovecha cada intervalo y suma
// tácticas); del 11 en adelante ya juega lo mejor que sabe y lo que sube es su vida y su daño.
//   npx tsx --test src/arenaTrainingRules.test.ts
export {};

/** Nivel desde el que el bot ya juega con todo lo que sabe. */
export const NIVEL_MAXIMO_DE_JUEGO = 10;

export type BotProfile = {
    nivel: number;
    /** Lo que tarda en darse cuenta de algo nuevo: que lo paralizaron, que le bajó la vida. */
    reaccionMs: number;
    /** Lo que tarda de más en usar cada intervalo de ataque o hechizo (0 = apenas se libera). */
    demoraAccionMs: number;
    /** Toma Pociones Rojas con la vida por debajo de este porcentaje (0 a 1). */
    pocionVidaPct: number;
    /** Como mucho una poción cada tanto; el server igual pone su propio intervalo. */
    pocionCadaMs: number;
    /** Toma Pociones Azules con el maná por debajo de este porcentaje (0 a 1). */
    pocionManaPct: number;
    /** Paraliza al rival. */
    paraliza: boolean;
    /** Se aleja de los que pegan de cerca y se mantiene a distancia de tiro. */
    mantieneDistancia: boolean;
    /** Se cura con hechizos cuando la clase tiene. */
    curaConHechizo: boolean;
    /** Toma las pociones de fuerza y agilidad y se pone Fuerza y Celeridad. */
    usaBuffs: boolean;
    /** Paraliza y castiga: se acerca a pegar o tira lo más fuerte mientras el rival no se puede mover. */
    combos: boolean;
    /** Elige el hechizo que más daño hace por el maná que tiene, y el que remata si el rival está bajo. */
    eligeMejorHechizo: boolean;
    /** Vuelve a paralizar apenas el rival se saca la parálisis. */
    reparaliza: boolean;
    /** Toma rojas apenas le falta un poco de vida, sin esperar a estar bajo. */
    anticipaCuras: boolean;
    /** Probabilidad de equivocarse en una decisión (tirar un hechizo flojo, quedarse quieto). */
    errorPct: number;
    /** Vida y daño de más (en %) a partir del nivel 11. */
    vidaExtraPct: number;
    danoExtraPct: number;
};

function lerp(from: number, to: number, t: number) {
    return from + (to - from) * t;
}

export function botProfile(nivelPedido: number): BotProfile {
    const nivel = Math.max(1, Math.floor(nivelPedido) || 1);
    const t = Math.min(1, (nivel - 1) / (NIVEL_MAXIMO_DE_JUEGO - 1));
    const extra = Math.max(0, nivel - NIVEL_MAXIMO_DE_JUEGO);

    return {
        nivel,
        reaccionMs: Math.round(lerp(1100, 150, t)),
        demoraAccionMs: Math.round(lerp(700, 30, t)),
        pocionVidaPct: Number(lerp(0.35, 0.82, t).toFixed(3)),
        pocionCadaMs: Math.round(lerp(900, 170, t)),
        pocionManaPct: Number(lerp(0.25, 0.6, t).toFixed(3)),
        paraliza: nivel >= 2,
        mantieneDistancia: nivel >= 3,
        curaConHechizo: nivel >= 3,
        usaBuffs: nivel >= 4,
        combos: nivel >= 5,
        eligeMejorHechizo: nivel >= 6,
        reparaliza: nivel >= 7,
        anticipaCuras: nivel >= 8,
        errorPct: Number(lerp(0.25, 0, t).toFixed(3)),
        vidaExtraPct: Math.min(150, extra * 8),
        danoExtraPct: Math.min(80, extra * 4),
    };
}

/**
 * Puntos por ganarle al bot en un nivel: 100 por nivel, más hasta la mitad de eso según la vida que te quedó
 * (ganar entero vale más que ganar raspando).
 */
export function puntosPorVictoria(nivel: number, vidaRestantePct: number): number {
    const vida = Math.min(1, Math.max(0, Number(vidaRestantePct) || 0));
    return 100 * nivel + Math.round(50 * nivel * vida);
}

/** Cómo pelea cada clase de la arena (arenaClasses.ts). */
export type BotEstilo = "lanzador" | "cuerpoACuerpo" | "distancia";

const ESTILOS: Record<number, BotEstilo> = {
    1: "lanzador", // Mago
    2: "lanzador", // Clérigo
    3: "cuerpoACuerpo", // Guerrero
    4: "cuerpoACuerpo", // Asesino
    6: "lanzador", // Bardo
    7: "lanzador", // Druida
    8: "cuerpoACuerpo", // Paladín
    9: "distancia", // Cazador
    18: "cuerpoACuerpo", // Pirata
    20: "distancia", // Arquero
    22: "lanzador", // Chamán
};

export function estiloDeClase(idClase: number): BotEstilo {
    return ESTILOS[Number(idClase)] ?? "cuerpoACuerpo";
}

/**
 * Distancia (en baldosas, la mayor entre x e y) a la que el bot quiere pelear. Los que pegan de cerca van al lado;
 * los demás se quedan fuera del alcance de un golpe y dentro de lo que ve el cliente (10 baldosas).
 */
export function distanciaDeseada(estiloPropio: BotEstilo, estiloRival: BotEstilo): { min: number; max: number } {
    if (estiloPropio === "cuerpoACuerpo") {
        return { min: 1, max: 1 };
    }
    if (estiloRival === "cuerpoACuerpo") {
        return { min: 4, max: 7 };
    }
    return { min: 4, max: 8 };
}
