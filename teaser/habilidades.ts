// Graba los videos de las habilidades que muestra la creación de personaje al elegir una clase
// (frontend/lib/classSkills.ts). Para cada clase arma la vitrina del server (server/src/teaser.ts): un bot de la clase y
// un muñeco en un claro del bosque, con el que graba escondido entre los dos. El bot hace cada habilidad mientras se
// graba la pantalla, y después se corta un clip de 4 s de cada una, de cerca y sin sonido, que la página repite.
//   pnpm habilidades [clase ...]        (sin clases, todas)
// Deja frontend/public/static/clases/<clase>/<habilidad>.mp4 y .jpg (la imagen que se ve mientras carga).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { CLASS_SKILLS } from "../frontend/lib/classSkills";
import type { CharacterClassKey } from "../frontend/lib/characterCreation";
import { abrirJuego, pedir, PERSONAJE } from "./juego";

const OUT = path.join(__dirname, "out", "habilidades");
const DESTINO = path.resolve(__dirname, "..", "frontend", "public", "static", "clases");
const SEGUNDOS = 4;
// El recorte: 8 × 5 baldosas alrededor del que graba (escondido en el medio), al doble exacto como se graban.
const RECORTE = { ancho: 512, alto: 320, x: 544, y: 270 };

const CLASES: Record<string, { id: number; nombre: string }> = {
    mago: { id: 1, nombre: "Mago" },
    clerigo: { id: 2, nombre: "Clérigo" },
    guerrero: { id: 3, nombre: "Guerrero" },
    asesino: { id: 4, nombre: "Asesino" },
    bardo: { id: 6, nombre: "Bardo" },
    druida: { id: 7, nombre: "Druida" },
    paladin: { id: 8, nombre: "Paladín" },
    cazador: { id: 9, nombre: "Cazador" },
    pirata: { id: 18, nombre: "Pirata" },
    arquero: { id: 20, nombre: "Arquero" },
    chaman: { id: 22, nombre: "Chamán" },
};

// Lo que hace el bot (el endpoint /debug/teaser/hacer): `antes` lo acomoda y `pasos` va en el clip, cada uno a los
// segundos que dice `en`. El bot arranca en (36,31), el muñeco está en (40,31) y el que graba, escondido, en (38,31).
type Paso = { en: number; que: string } & Record<string, string | number>;
type Toma = { antes?: Paso[]; pasos: Paso[] };

const alMuneco = (id: number): Toma => ({ pasos: [0.2, 2.2].map((en) => ({ en, que: "hechizo", id })) });
// Las curaciones, con el bot herido antes: con la vida llena no se ve cuánto cura.
const curacion = (id: number): Toma => ({
    antes: [{ en: 0, que: "herir" }],
    pasos: [0.2, 2.2].map((en) => ({ en, que: "hechizo", id, a: "yo" })),
});
const golpes = (x = 39, y = 31, mira?: string): Toma => ({
    antes: [{ en: 0, que: "ir", x, y }, ...(mira ? [{ en: 1.6, que: "mirar", rumbo: mira }] : [])],
    pasos: [0.2, 1.1, 2.0, 2.9].map((en) => ({ en, que: "golpe" })),
});
const disparos: Toma = { pasos: [0.2, 1.2, 2.2, 3.2].map((en) => ({ en, que: "disparo" })) };

const TOMAS: Record<string, Toma> = {
    "mago/llama-de-dragon": alMuneco(45),
    // Daña alrededor del mago: se tira a una criatura que esté a una baldosa de costado.
    "mago/implosion": { antes: [{ en: 0, que: "ir", x: 39, y: 30 }], pasos: alMuneco(41).pasos },
    "mago/paralizar": alMuneco(9),
    "clerigo/purificar": alMuneco(75),
    "clerigo/martillo-de-luz": alMuneco(85),
    "clerigo/curacion-divina": curacion(39),
    "guerrero/golpes-pesados": golpes(),
    "guerrero/pocion-de-fuerza": { ...golpes(), pasos: [{ en: 0.2, que: "pocion", id: 1093 }, ...[1.0, 1.9, 2.8].map((en) => ({ en, que: "golpe" }))] },
    // Por la espalda: arriba del muñeco, mirando para donde mira él.
    "asesino/apunalar": golpes(40, 30, "abajo"),
    "asesino/destello-infernal": alMuneco(73),
    "asesino/invisibilidad": { pasos: [{ en: 0.4, que: "hechizo", id: 14, a: "yo" }] },
    "bardo/apocalipsis": alMuneco(25),
    "bardo/inmovilizar": alMuneco(66),
    "bardo/curacion-milagrosa": curacion(32),
    "druida/enredar": alMuneco(49),
    "druida/lluvia-de-sangre": alMuneco(44),
    "druida/lluvia-arcana": alMuneco(84),
    "paladin/arma-y-escudo": golpes(),
    "paladin/restauracion": curacion(60),
    "paladin/apocalipsis": alMuneco(25),
    "cazador/disparo": disparos,
    "cazador/ocultarse": { pasos: [0.4, 1.4, 2.4].map((en) => ({ en, que: "ocultar" })) },
    "pirata/disparo-certero": alMuneco(72),
    "pirata/disparo-de-conmocion": alMuneco(71),
    "pirata/sable": golpes(),
    "arquero/disparo": disparos,
    // Arranca pegado al muñeco, se aleja y le tira.
    "arquero/a-distancia": {
        antes: [{ en: 0, que: "ir", x: 39, y: 30 }],
        pasos: [{ en: 0.1, que: "ir", x: 36, y: 30 }, ...[1.4, 2.4, 3.4].map((en) => ({ en, que: "disparo" }))],
    },
    "chaman/ventisca": alMuneco(62),
    "chaman/rayo-de-fuego": alMuneco(63),
    "chaman/escudo-de-energia": { pasos: [{ en: 0.2, que: "hechizo", id: 78, a: "yo" }, { en: 1.3, que: "hechizo", id: 63 }] },
};

type Cuadro = { file: string; at: number };

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const run = (args: string[]) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });

async function hacer(bot: string, paso: Paso) {
    const { en: _en, ...params } = paso;
    await pedir("hacer", { bot, ...params }).catch((error) => console.log(`[aviso] ${bot}: ${String(error).slice(0, 160)}`));
}

async function main() {
    const pedidas = process.argv.slice(2);
    const clases = (Object.keys(CLASS_SKILLS) as CharacterClassKey[]).filter((clase) => !pedidas.length || pedidas.includes(clase));
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(path.join(OUT, "cuadros"), { recursive: true });

    const { browser, page } = await abrirJuego({ mostrar: process.env.TEASER_MOSTRAR === "1" });
    const cdp = await page.context().newCDPSession(page);
    const cuadros: Cuadro[] = [];
    cdp.on("Page.screencastFrame", (frame) => {
        const file = `${String(cuadros.length).padStart(6, "0")}.jpg`;
        fs.writeFileSync(path.join(OUT, "cuadros", file), Buffer.from(frame.data, "base64"));
        cuadros.push({ file, at: Number(frame.metadata.timestamp ?? Date.now() / 1000) * 1000 });
        void cdp.send("Page.screencastFrameAck", { sessionId: frame.sessionId }).catch(() => {});
    });
    const tomas: Array<{ clase: CharacterClassKey; id: string; desde: number }> = [];

    try {
        await page.evaluate(() => window.__woaoTeaser?.hideSelf(true));
        await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1600, maxHeight: 900, everyNthFrame: 1 });
        for (const clase of clases) {
            const datos = CLASES[clase]!;
            await pedir("vitrina", { jugador: PERSONAJE.nombre, clase: datos.id, nombre: datos.nombre });
            await page.waitForFunction(() => window.__woaoEngine?.mapNumber === 54, null, { timeout: 30_000 });
            await esperar(2500);
            for (const habilidad of CLASS_SKILLS[clase] ?? []) {
                const toma = TOMAS[`${clase}/${habilidad.id}`];
                if (!toma) {
                    console.log(`[aviso] falta cómo grabar ${clase}/${habilidad.id}`);
                    continue;
                }
                // Vuelve a su lugar, mirando al muñeco.
                await hacer(datos.nombre, { en: 0, que: "ir", x: 36, y: 31 });
                await esperar(1800);
                await hacer(datos.nombre, { en: 0, que: "mirar", rumbo: "derecha" });
                for (const paso of toma.antes ?? []) {
                    await hacer(datos.nombre, paso);
                    await esperar(paso.que === "ir" ? 1800 : 300);
                }
                await esperar(400);
                const desde = Date.now();
                for (const paso of toma.pasos) {
                    await esperar(Math.max(0, desde + paso.en * 1000 - Date.now()));
                    await hacer(datos.nombre, paso);
                }
                await esperar(Math.max(0, desde + (SEGUNDOS + 0.4) * 1000 - Date.now()));
                tomas.push({ clase, id: habilidad.id, desde });
                console.log(`[toma] ${clase}/${habilidad.id}`);
            }
        }
    } finally {
        await cdp.send("Page.stopScreencast").catch(() => {});
        await pedir("limpiar").catch(() => {});
        await browser.close();
    }

    // Los clips: los cuadros de cada toma, recortados alrededor de la acción, a 30 cuadros por segundo.
    for (const toma of tomas) {
        const fin = toma.desde + SEGUNDOS * 1000;
        const dentro = cuadros.filter((cuadro, i) => cuadro.at < fin && (cuadros[i + 1]?.at ?? Infinity) > toma.desde);
        const lista: string[] = [];
        dentro.forEach((cuadro, i) => {
            const desde = Math.max(cuadro.at, toma.desde);
            const hasta = Math.min(dentro[i + 1]?.at ?? fin, fin);
            lista.push(`file '${path.join(OUT, "cuadros", cuadro.file)}'`, `duration ${Math.max(0.001, (hasta - desde) / 1000).toFixed(4)}`);
        });
        lista.push(`file '${path.join(OUT, "cuadros", dentro.at(-1)!.file)}'`);
        const listFile = path.join(OUT, `${toma.clase}-${toma.id}.txt`);
        fs.writeFileSync(listFile, lista.join("\n"));
        const carpeta = path.join(DESTINO, toma.clase);
        fs.mkdirSync(carpeta, { recursive: true });
        const video = path.join(carpeta, `${toma.id}.mp4`);
        const filtro = `fps=30,crop=${RECORTE.ancho}:${RECORTE.alto}:${RECORTE.x}:${RECORTE.y},setsar=1,format=yuv420p`;
        run(["-f", "concat", "-safe", "0", "-i", listFile, "-vf", filtro, "-t", String(SEGUNDOS), "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-movflags", "+faststart", video]);
        run(["-ss", "0.6", "-i", video, "-frames:v", "1", "-q:v", "4", path.join(carpeta, `${toma.id}.jpg`)]);
    }
    console.log(`${tomas.length} clips en ${DESTINO}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
