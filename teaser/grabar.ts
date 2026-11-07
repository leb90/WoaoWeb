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

    // 2. Una party cazando orcos.
    await escena(page, "caza");
    marcar("caza");
    await pelear(page, [HECHIZO.rayoElectrico, HECHIZO.llamarada, HECHIZO.rafaga], 14_000, 1400);
    marcar("caza.fin");

    // 3. El chamán, la clase nueva, contra una manada.
    await escena(page, "chaman");
    marcar("chaman");
    await pelear(page, [HECHIZO.ventisca, HECHIZO.llamarada, HECHIZO.rayoElectrico, HECHIZO.incinerar, HECHIZO.rafaga, HECHIZO.prisionDeAgua], 15_000, 1150);
    marcar("chaman.fin");

    // 4. El asedio al castillo, de noche y con tormenta.
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

    // 5. Al final: la mazmorra nueva, todavía en desarrollo.
    await pedir("escena", { id: "mazmorra", jugador: PERSONAJE.nombre });
    await page.waitForFunction(() => Number(window.__woaoEngine?.mapNumber ?? 0) > 1000, null, { timeout: 30_000 });
    await page.waitForTimeout(2000);
    marcar("mazmorra");
    // De la entrada hasta la puerta de la sala de al lado (server/mazmorras/prueba/mapa_590.txt), mirando.
    await caminar(page, "derecha", 6);
    await page.waitForTimeout(900);
    await caminar(page, "derecha", 8);
    await caminar(page, "arriba", 3);
    await page.waitForTimeout(600);
    await caminar(page, "derecha", 4);
    await page.waitForTimeout(3500);
    marcar("fin");
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
