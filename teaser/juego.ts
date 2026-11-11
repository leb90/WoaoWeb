// Abre el juego real en Chrome con la cuenta del teaser y deja al personaje adentro, en modo grabación
// (frontend/lib/teaserRecording.ts): sin HUD y anotando los sonidos. Lo usan grabar.ts y las pruebas de escenas.
// Necesita el stack local levantado (README.md): API, server de juego y frontend.
import { chromium, type Browser, type Page } from "playwright";

export const FRONT = process.env.TEASER_FRONT ?? "http://localhost:3010";
export const SERVER = process.env.TEASER_SERVER ?? "http://localhost:7666";

// Una cuenta y un personaje solo para grabar: el Chamán elemental, la clase nueva. Se crean solos la primera vez.
const CUENTA = { usuario: "teaser", email: "teaser@example.com", clave: "teaser-woao-1" };
export const PERSONAJE = { nombre: "Nahuel", clase: "chaman", raza: "elfo", genero: "male", cabeza: 101 };

// 1600 × 900: el render va al doble exacto (el modo grabación usa una escala entera) y muestra 25 × 14 baldosas.
// La transmisión de pantalla de Chrome manda los cuadros de este tamaño; editar.ts los lleva a 1920 × 1080.
export const VENTANA = { width: 1600, height: 900 };

type Motor = {
    mapNumber?: number;
    user?: { pos?: { x: number; y: number } };
};

declare global {
    interface Window {
        __woaoEngine?: Motor;
        __woaoAudioLog?: Array<{ soundId: number; at: number; volume: number; category: string }>;
        __woaoTeaser?: {
            castSpell: (slot: number, x: number, y: number, map: number, targetId?: number) => void;
            say: (text: string) => void;
            click: (x: number, y: number, map: number) => void;
            face: (heading: number) => void;
            hideSelf: (hidden: boolean) => void;
        };
    }
}

async function entrarConCuenta(page: Page): Promise<void> {
    await page.goto(`${FRONT}/login`);
    await page.getByPlaceholder("Email o nombre de usuario").fill(CUENTA.usuario);
    await page.getByPlaceholder("Contraseña").fill(CUENTA.clave);
    await page.locator('button[type="submit"]').click();
    const entro = await page
        .waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 8000 })
        .then(() => true)
        .catch(() => false);
    if (entro) {
        return;
    }

    // La primera vez: se registra.
    await page.goto(`${FRONT}/register?redirect=/characters`);
    await page.getByPlaceholder("Nombre de usuario").fill(CUENTA.usuario);
    await page.getByPlaceholder("Email").fill(CUENTA.email);
    await page.getByPlaceholder("Contraseña").fill(CUENTA.clave);
    await page.getByPlaceholder("Confirmar password").fill(CUENTA.clave);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.startsWith("/register"), { timeout: 15_000 });
}

async function asegurarPersonaje(page: Page): Promise<void> {
    await page.goto(`${FRONT}/characters`);
    const existe = await page
        .getByText(PERSONAJE.nombre, { exact: true })
        .first()
        .waitFor({ timeout: 8000 })
        .then(() => true)
        .catch(() => false);
    if (existe) {
        return;
    }
    const resultado = await page.evaluate(async (personaje) => {
        const response = await fetch("/api/auth/create-character", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: personaje.nombre,
                class: personaje.clase,
                race: personaje.raza,
                gender: personaje.genero,
                headId: personaje.cabeza,
            }),
        });
        return { ok: response.ok, body: await response.text() };
    }, PERSONAJE);
    if (!resultado.ok) {
        throw new Error(`No se pudo crear ${PERSONAJE.nombre}: ${resultado.body}`);
    }
    await page.goto(`${FRONT}/characters`);
}

// Los avisos de bienvenida están debajo del render: se cierran sin hacer clic en la pantalla.
async function cerrarAvisos(page: Page): Promise<void> {
    for (const texto of ["Seguir asi", "Entendido"]) {
        await page
            .getByText(texto, { exact: true })
            .first()
            .evaluate((element) => (element as HTMLElement).click())
            .catch(() => {});
    }
}

export async function abrirJuego(opciones: { mostrar?: boolean } = {}): Promise<{ browser: Browser; page: Page }> {
    const browser = await chromium.launch({
        channel: "chrome",
        headless: !opciones.mostrar,
        args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"],
    });
    const context = await browser.newContext({ viewport: VENTANA, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await entrarConCuenta(page);
    await asegurarPersonaje(page);

    // /play se abre sin recargar la página: la marca va antes, en la sesión de la pestaña.
    await page.evaluate(() => window.sessionStorage.setItem("woao.grabacion", "1"));
    await page.getByText(PERSONAJE.nombre, { exact: true }).first().click();
    await page.waitForURL((url) => url.pathname.startsWith("/play"), { timeout: 20_000 });
    await page.waitForFunction(() => Boolean(window.__woaoEngine?.user?.pos), null, { timeout: 60_000 });
    // El indicador de desarrollo de Next queda arriba de todo: no va en el video.
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    await page.waitForTimeout(1500);
    await cerrarAvisos(page);
    return { browser, page };
}

export async function pedir<T = Record<string, unknown>>(ruta: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`/debug/teaser/${ruta}`, SERVER);
    for (const [clave, valor] of Object.entries(params)) {
        url.searchParams.set(clave, String(valor));
    }
    const response = await fetch(url);
    const body = (await response.json()) as T & { ok?: boolean; error?: string };
    if (body.ok === false) {
        throw new Error(`${ruta}: ${body.error}`);
    }
    return body;
}

/** Arma una escena del server (server/src/teaser.ts) y espera a que el juego ya esté mostrando el lugar. */
export async function escena(page: Page, id: string): Promise<{ mapa: number; x: number; y: number }> {
    const armada = await pedir<{ mapa: number; x: number; y: number }>("escena", { id, jugador: PERSONAJE.nombre });
    await page.waitForFunction(
        ({ mapa }) => window.__woaoEngine?.mapNumber === mapa,
        { mapa: armada.mapa },
        { timeout: 30_000 },
    );
    // Que terminen de llegar los gráficos del lugar.
    await page.waitForTimeout(1800);
    return armada;
}

/** Lleva al personaje a un punto (o a la baldosa libre más cercana, como cualquier teletransporte). */
export async function ir(page: Page, mapa: number, x: number, y: number): Promise<void> {
    await pedir("ir", { jugador: PERSONAJE.nombre, mapa, x, y });
    await page.waitForFunction(({ mapa }) => window.__woaoEngine?.mapNumber === mapa, { mapa }, { timeout: 30_000 });
    await page.waitForTimeout(2500);
}
