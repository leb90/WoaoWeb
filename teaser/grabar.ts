// Graba el teaser (README.md): juega el recorrido en el juego real, con las escenas que arma el server
// (server/src/teaser.ts), y guarda los cuadros de la pantalla con su hora (la transmisión de pantalla de Chrome), las
// marcas de cada escena y los sonidos que sonaron. editar.ts arma el video con eso.
//   pnpm grabar          TEASER_MOSTRAR=1 para ver la ventana mientras graba
// La salida queda en TEASER_OUT (por defecto, teaser/out).
import fs from "node:fs";
import path from "node:path";
import type { Page } from "playwright";

import { abrirJuego, escena, pedir, PERSONAJE } from "./juego";

const OUT = process.env.TEASER_OUT ?? path.join(__dirname, "out");
// Para probar una parte sin grabar todo: TEASER_SOLO=mazmorra (o varias, separadas por coma).
const SOLO = process.env.TEASER_SOLO?.split(",").map((id) => id.trim());
const graba = (id: string) => !SOLO || SOLO.includes(id);

type Punto = { x: number; y: number };
type Estado = {
    jugador: { mapa: number; pos: Punto; hechizos: Record<string, number> } | null;
    criaturas: Array<{ id: string; pos: Punto; vida: number }>;
};

// Los hechizos del Chamán elemental (server/jsons/spells.json).
const HECHIZO = {
    rafaga: 79,
    rayoFuego: 63,
    rayoElectrico: 64,
    llamarada: 51,
    ventisca: 62,
    incinerar: 61,
    prisionDeAgua: 80,
};

const TECLA: Record<string, string> = { arriba: "KeyW", abajo: "KeyS", izquierda: "KeyA", derecha: "KeyD" };

const estado = () => pedir<Estado>("estado", { jugador: PERSONAJE.nombre });

async function posicion(page: Page): Promise<Punto> {
    return page.evaluate(() => {
        const pos = window.__woaoEngine?.user?.pos;
        return { x: pos?.x ?? 0, y: pos?.y ?? 0 };
    });
}

// Camina con la tecla apretada, como una persona, y suelta al dar los pasos pedidos (o si se traba).
async function caminar(page: Page, hacia: keyof typeof TECLA, pasos: number): Promise<void> {
    const inicio = await posicion(page);
    const tecla = TECLA[hacia]!;
    await page.keyboard.down(tecla);
    const empezo = Date.now();
    for (;;) {
        const ahora = await posicion(page);
        const dados = Math.abs(ahora.x - inicio.x) + Math.abs(ahora.y - inicio.y);
        if (dados >= pasos || Date.now() - empezo > pasos * 450 + 800) {
            break;
        }
        await page.waitForTimeout(15);
    }
    await page.keyboard.up(tecla);
    await page.waitForTimeout(250);
}

async function decir(page: Page, texto: string): Promise<void> {
    await page.evaluate((mensaje) => window.__woaoTeaser?.say(mensaje), texto);
}

async function mapa(page: Page): Promise<number> {
    return page.evaluate(() => Number(window.__woaoEngine?.mapNumber ?? 0));
}

// Un paso por un eje hasta la coordenada pedida: con la tecla apretada hasta quedar a uno, y el último paso (o la
// corrección, si se pasó) de a un toque, para caer justo en la baldosa.
async function moverEnEje(page: Page, eje: "x" | "y", destino: number): Promise<void> {
    const teclas = eje === "x" ? { mas: TECLA.derecha!, menos: TECLA.izquierda! } : { mas: TECLA.abajo!, menos: TECLA.arriba! };
    const falta = async () => destino - (await posicion(page))[eje];
    let resto = await falta();
    if (Math.abs(resto) > 1) {
        const tecla = resto > 0 ? teclas.mas : teclas.menos;
        await page.keyboard.down(tecla);
        const empezo = Date.now();
        while (Math.abs(resto) > 1 && Date.now() - empezo < 12_000) {
            await page.waitForTimeout(15);
            resto = await falta();
        }
        await page.keyboard.up(tecla);
        await page.waitForTimeout(260);
    }
    for (let intento = 0; intento < 6 && (resto = await falta()) !== 0; intento++) {
        await page.keyboard.press(resto > 0 ? teclas.mas : teclas.menos);
        await page.waitForTimeout(280);
    }
}

async function irA(page: Page, x: number, y: number): Promise<void> {
    await moverEnEje(page, "x", x);
    await moverEnEje(page, "y", y);
    const llego = await posicion(page);
    if (llego.x !== x || llego.y !== y) {
        console.log(`[aviso] quería ir a ${x},${y} y quedó en ${llego.x},${llego.y}`);
    }
}

// Clic en una baldosa (cofres, puertas y bloques de la mazmorra), con el mismo paquete que el juego.
async function clic(page: Page, x: number, y: number): Promise<void> {
    const actual = await mapa(page);
    await page.evaluate(({ x, y, actual }) => window.__woaoTeaser?.click(x, y, actual), { x, y, actual });
    await page.waitForTimeout(450);
}

const RUMBO: Record<string, number> = { arriba: 1, abajo: 2, derecha: 3, izquierda: 4 };

async function mirar(page: Page, hacia: keyof typeof RUMBO): Promise<void> {
    await page.evaluate((heading) => window.__woaoTeaser?.face(heading), RUMBO[hacia]!);
    await page.waitForTimeout(150);
}

async function lanzar(page: Page, idHechizo: number, objetivo: Punto & { id?: string }): Promise<void> {
    const actual = await estado();
    const slot = actual.jugador?.hechizos[String(idHechizo)];
    if (!slot || !actual.jugador) {
        return;
    }
    await page.evaluate(
        ({ slot, objetivo, mapa }) =>
            window.__woaoTeaser?.castSpell(slot, objetivo.x, objetivo.y, mapa, objetivo.id ? Number(objetivo.id) : undefined),
        { slot, objetivo, mapa: actual.jugador.mapa },
    );
}

// Tira hechizos, uno tras otro, a la criatura más cercana durante un rato.
async function pelear(page: Page, hechizos: number[], duracionMs: number, cadaMs = 1250): Promise<void> {
    const hasta = Date.now() + duracionMs;
    let vuelta = 0;
    while (Date.now() < hasta) {
        const actual = await estado();
        const yo = actual.jugador?.pos;
        const vivas = actual.criaturas.filter((c) => c.vida > 0 && c.pos);
        if (yo && vivas.length > 0) {
            vivas.sort((a, b) => Math.hypot(a.pos.x - yo.x, a.pos.y - yo.y) - Math.hypot(b.pos.x - yo.x, b.pos.y - yo.y));
            const objetivo = vivas[0]!;
            if (Math.max(Math.abs(objetivo.pos.x - yo.x), Math.abs(objetivo.pos.y - yo.y)) <= 9) {
                await lanzar(page, hechizos[vuelta % hechizos.length]!, { ...objetivo.pos, id: objetivo.id });
                vuelta += 1;
            }
        }
        await page.waitForTimeout(cadaMs);
    }
}

async function recorrido(page: Page, marcar: (nombre: string) => void): Promise<void> {
    // 1. Nix con gente.
    if (graba("ciudad")) {
        await escena(page, "ciudad");
        marcar("ciudad");
        await page.waitForTimeout(3000);
        await decir(page, "buenas!");
        await caminar(page, "abajo", 2);
        await caminar(page, "izquierda", 3);
        await page.waitForTimeout(2000);
        await caminar(page, "abajo", 1);
        await page.waitForTimeout(2500);
        marcar("ciudad.fin");
    }

    // 2. Una party cazando orcos.
    if (graba("caza")) {
        await escena(page, "caza");
        marcar("caza");
        await pelear(page, [HECHIZO.rayoElectrico, HECHIZO.llamarada, HECHIZO.rafaga], 14_000, 1400);
        marcar("caza.fin");
    }

    // 3. El chamán, la clase nueva, contra una manada.
    if (graba("chaman")) {
        await escena(page, "chaman");
        marcar("chaman");
        await pelear(page, [HECHIZO.ventisca, HECHIZO.llamarada, HECHIZO.rayoElectrico, HECHIZO.incinerar, HECHIZO.rafaga, HECHIZO.prisionDeAgua], 15_000, 1150);
        marcar("chaman.fin");
    }

    // 4. El asedio al castillo, de noche y con tormenta.
    if (graba("castillo")) {
        await escena(page, "castillo");
        marcar("castillo");
        await page.waitForTimeout(2000);
        await caminar(page, "arriba", 2);
        const rey = { x: 45, y: 16 };
        for (let vez = 0; vez < 8; vez++) {
            await lanzar(page, [HECHIZO.incinerar, HECHIZO.rayoElectrico, HECHIZO.llamarada][vez % 3]!, rey);
            await page.waitForTimeout(1300);
        }
        marcar("castillo.fin");
    }

    // 5. Al final: la mazmorra nueva, todavía en desarrollo. El recorrido sigue el plano
    // (server/mazmorras/prueba/mapa_590.txt): el cofre de la llave chica, el salto sobre la lava con la Pluma, la
    // puerta con llave, el bloque sobre una placa y el personaje sobre la otra (abre la sala del agua), el cofre de las
    // Patas de rana y, nadando, el Arco y una bomba cerca del Abisal.
    if (graba("mazmorra")) {
        await pedir("escena", { id: "mazmorra", jugador: PERSONAJE.nombre });
        await page.waitForFunction(() => Number(window.__woaoEngine?.mapNumber ?? 0) > 1000, null, { timeout: 30_000 });
        await page.waitForTimeout(2000);
        marcar("mazmorra");
        await irA(page, 26, 35);
        await irA(page, 26, 36);
        marcar("mazmorra.cofre");
        await clic(page, 27, 36);
        await page.waitForTimeout(1800);
        await irA(page, 26, 33);
        await irA(page, 18, 33);
        await irA(page, 18, 31);
        marcar("mazmorra.salto");
        await mirar(page, "arriba");
        await decir(page, "/mazmorra salto");
        await page.waitForTimeout(1400);
        await irA(page, 21, 29);
        await irA(page, 21, 27);
        marcar("mazmorra.puerta");
        await clic(page, 21, 26);
        await page.waitForTimeout(900);
        await irA(page, 21, 23);
        await irA(page, 20, 23);
        await irA(page, 20, 20);
        marcar("mazmorra.bloque");
        // Empuja el bloque cuatro veces a la derecha y dos para arriba, hasta la placa de (25,18).
        for (const x of [21, 22, 23, 24]) {
            await clic(page, x, 20);
            await irA(page, x, 20);
        }
        await irA(page, 24, 21);
        await irA(page, 25, 21);
        await clic(page, 25, 20);
        await irA(page, 25, 20);
        await clic(page, 25, 19);
        marcar("mazmorra.placa");
        await irA(page, 17, 20);
        await irA(page, 17, 18);
        await page.waitForTimeout(2200);
        await irA(page, 17, 19);
        await irA(page, 31, 19);
        marcar("mazmorra.sala");
        await irA(page, 34, 21);
        await irA(page, 37, 21);
        marcar("mazmorra.ranas");
        await clic(page, 38, 21);
        await page.waitForTimeout(1800);
        await irA(page, 37, 20);
        await irA(page, 42, 20);
        marcar("mazmorra.agua");
        await irA(page, 46, 20);
        await mirar(page, "arriba");
        await decir(page, "/mazmorra flecha");
        await page.waitForTimeout(800);
        await decir(page, "/mazmorra flecha");
        await page.waitForTimeout(800);
        await decir(page, "/mazmorra bomba");
        await page.waitForTimeout(3500);
        marcar("fin");
    }

}

async function main(): Promise<void> {
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(path.join(OUT, "cuadros"), { recursive: true });

    const { browser, page } = await abrirJuego({ mostrar: process.env.TEASER_MOSTRAR === "1" });
    const cdp = await page.context().newCDPSession(page);
    const cuadros: Array<{ file: string; at: number }> = [];
    cdp.on("Page.screencastFrame", (frame) => {
        const file = `${String(cuadros.length).padStart(6, "0")}.jpg`;
        fs.writeFileSync(path.join(OUT, "cuadros", file), Buffer.from(frame.data, "base64"));
        cuadros.push({ file, at: Number(frame.metadata.timestamp ?? Date.now() / 1000) * 1000 });
        void cdp.send("Page.screencastFrameAck", { sessionId: frame.sessionId }).catch(() => {});
    });
    const marcas: Record<string, number> = {};
    const marcar = (nombre: string) => {
        marcas[nombre] = Date.now();
        console.log(`[marca] ${nombre}`);
    };

    try {
        await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1600, maxHeight: 900, everyNthFrame: 1 });
        await recorrido(page, marcar);
    } finally {
        await cdp.send("Page.stopScreencast").catch(() => {});
        const sonidos = await page.evaluate(() => window.__woaoAudioLog ?? []).catch(() => []);
        fs.writeFileSync(path.join(OUT, "cuadros.json"), JSON.stringify(cuadros));
        fs.writeFileSync(path.join(OUT, "marcas.json"), JSON.stringify(marcas, null, 2));
        fs.writeFileSync(path.join(OUT, "sonidos.json"), JSON.stringify(sonidos));
        await pedir("limpiar").catch(() => {});
        await browser.close();
        console.log(`${cuadros.length} cuadros, ${sonidos.length} sonidos.`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
