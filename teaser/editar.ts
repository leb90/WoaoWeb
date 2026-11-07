// Arma el video del teaser (README.md) con lo que grabó grabar.ts: los cuadros con su hora, las marcas de cada escena
// y los sonidos que sonaron. Corta cada escena, le pone su cartel, las une con fundidos, arma la música (tres tramos
// del tema del menú del juego) con los efectos del juego en su momento, y codifica el MP4.
//   pnpm editar [salida.mp4]
// Necesita ffmpeg (con libx264) y Chrome (dibuja los carteles con la letra del sitio).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "frontend", "public");
const OUT = process.env.TEASER_OUT ?? path.join(__dirname, "out");
const WORK = path.join(OUT, "edicion");
const FINAL = process.argv[2] ?? path.join(OUT, "world-of-argentum-teaser.mp4");
const FPS = 30;
const SIZE = { width: 1920, height: 1080 };
const RATE = 48000;
// El fundido entre escenas, en segundos.
const XFADE = 0.5;

// La música: "Shoulders of Giants", de Scott Buckley (CC BY 4.0), la del inicio del sitio (lib/musicCredits.ts).
const MUSIC = path.join(PUBLIC, "music", "menu", "inicio.mp3");
const MUSIC_CREDIT = "Música: «Shoulders of Giants», Scott Buckley (CC BY 4.0)";
// Los tramos (en segundos del tema): el arranque suave para la ciudad, la parte más fuerte para la acción y la bajada
// para el final.
const CALMA: [number, number] = [8, 32];
const ACCION: [number, number] = [292, 347];
const CIERRE: [number, number] = [347, 372];

type Cuadro = { file: string; at: number };
type Sonido = { soundId: number; at: number; volume: number; category: string };
type Cartel = { titulo: string; antetitulo?: string; pie?: string } | "logo";
// Una escena: desde una marca (más unos segundos), cuánto dura, su cartel (si tiene) y en qué parte de la música va.
type Escena = { marca: string; desde: number; segundos: number; cartel?: Cartel; parte: "calma" | "accion" | "cierre"; negro?: boolean };

const ESCENAS: Escena[] = [
    { marca: "ciudad", desde: 0.6, segundos: 9.2, cartel: { antetitulo: "World of Argentum", titulo: "Un mundo lleno de gente" }, parte: "calma" },
    { marca: "caza", desde: 0.8, segundos: 5.6, cartel: { titulo: "Armá tu party y salí a cazar" }, parte: "accion" },
    { marca: "caza", desde: 7.4, segundos: 4.2, parte: "accion" },
    { marca: "chaman", desde: 0.5, segundos: 5.4, cartel: { antetitulo: "Clase nueva", titulo: "Chamán elemental" }, parte: "accion" },
    { marca: "chaman", desde: 7.0, segundos: 4.6, parte: "accion" },
    { marca: "castillo", desde: 0.6, segundos: 6.2, cartel: { titulo: "Conquistá castillos con tu clan" }, parte: "accion" },
    { marca: "castillo", desde: 7.6, segundos: 4.4, parte: "accion" },
    { marca: "mazmorra", desde: 1.2, segundos: 6.4, cartel: { antetitulo: "Próximamente", titulo: "Mazmorras", pie: "En desarrollo" }, parte: "cierre" },
    { marca: "fin", desde: 0, segundos: 7.0, cartel: "logo", parte: "cierre", negro: true },
];

const run = (args: string[]) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });

const dataUrl = (file: string, type: string) => `data:${type};base64,${fs.readFileSync(file).toString("base64")}`;

// Los carteles, con la letra del sitio (Cinzel) y sus dorados: una frase arriba a la izquierda (los nombres y los
// globos del juego van en el medio), o el logo al final.
async function dibujarCarteles(): Promise<Map<Escena["cartel"], string>> {
    const browser = await chromium.launch({ channel: "chrome" });
    const page = await browser.newPage({ viewport: SIZE });
    const carteles = new Map<Escena["cartel"], string>();
    const logo = dataUrl(path.join(PUBLIC, "static", "imgs", "woaoicon-hero.webp"), "image/webp");
    const style = `
        html, body { margin: 0; width: ${SIZE.width}px; height: ${SIZE.height}px; background: transparent; }
        .sombra { position: absolute; left: 0; top: 60px; width: 1250px; height: 330px;
                  background: linear-gradient(90deg, rgba(5,3,2,0.78) 0%, rgba(5,3,2,0.5) 45%, rgba(5,3,2,0) 100%);
                  -webkit-mask-image: linear-gradient(180deg, transparent, #000 22%, #000 78%, transparent); }
        .cartel { position: absolute; left: 140px; top: 120px; font-family: "Cinzel", serif; }
        .ante { font-size: 26px; font-weight: 600; letter-spacing: 0.42em; text-transform: uppercase; color: #f2cf8a;
                text-shadow: 0 2px 10px rgba(0,0,0,0.9); margin-bottom: 10px; }
        .titulo { font-size: 66px; font-weight: 700; color: #f6ead2; letter-spacing: 0.02em;
                  text-shadow: 0 4px 0 #120b05, 0 0 26px rgba(0,0,0,0.9); }
        .barra { margin-top: 18px; width: 150px; height: 4px; background: linear-gradient(90deg, #f7d488, #c9922f); }
        .pie { margin-top: 16px; font-size: 24px; letter-spacing: 0.32em; text-transform: uppercase; color: #d9c8a4;
               text-shadow: 0 2px 10px rgba(0,0,0,0.9); }
        .final { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
                 font-family: "Cinzel", serif; }
        .final img { width: 980px; filter: drop-shadow(0 0 45px rgba(0,0,0,0.65)); }
        .final .lema { margin-top: 6px; font-size: 26px; font-weight: 600; letter-spacing: 0.5em; color: rgba(242,207,138,0.85); }
        .final .web { margin-top: 26px; font-size: 44px; font-weight: 700; color: #f6ead2; letter-spacing: 0.06em; }
        .final .credito { position: absolute; bottom: 36px; font-family: Georgia, serif; font-size: 18px; color: rgba(217,200,164,0.6); }`;
    for (const escena of ESCENAS) {
        if (!escena.cartel || carteles.has(escena.cartel)) {
            continue;
        }
        const cartel = escena.cartel;
        const html =
            cartel === "logo"
                ? `<div class="final"><img src="${logo}"><div class="lema">MMORPG 2D · Gratis · En tu navegador</div>` +
                  `<div class="web">worldofargentum.io</div><div class="credito">${MUSIC_CREDIT}</div></div>`
                : `<div class="sombra"></div><div class="cartel">${cartel.antetitulo ? `<div class="ante">${cartel.antetitulo}</div>` : ""}` +
                  `<div class="titulo">${cartel.titulo}</div><div class="barra"></div>${cartel.pie ? `<div class="pie">${cartel.pie}</div>` : ""}</div>`;
        await page.setContent(
            `<!doctype html><html><head><meta charset="utf-8">` +
                `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&display=block">` +
                `<style>${style}</style></head><body>${html}</body></html>`,
        );
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(300);
        const file = path.join(WORK, `cartel-${carteles.size}.png`);
        await page.screenshot({ path: file, omitBackground: true });
        carteles.set(cartel, file);
    }
    await browser.close();
    return carteles;
}

// Un clip de la escena: los cuadros entre sus horas, a cuadros por segundo fijos, con su cartel que entra y sale.
function cortar(escena: Escena, indice: number, cuadros: Cuadro[], marcas: Record<string, number>, carteles: Map<Escena["cartel"], string>) {
    const file = path.join(WORK, `escena-${String(indice).padStart(2, "0")}.mp4`);
    const inicio = (marcas[escena.marca] ?? 0) + escena.desde * 1000;
    const fin = inicio + escena.segundos * 1000;
    const entradas: string[] = [];
    if (escena.negro) {
        entradas.push("-f", "lavfi", "-i", `color=c=#050302:s=${SIZE.width}x${SIZE.height}:r=${FPS}:d=${escena.segundos}`);
    } else {
        // La lista de cuadros con cuánto dura cada uno (llegan cuando cambia algo en la pantalla).
        const lista: string[] = [];
        const dentro = cuadros.filter((cuadro, i) => cuadro.at < fin && (cuadros[i + 1]?.at ?? Infinity) > inicio);
        if (dentro.length === 0) {
            throw new Error(`No hay cuadros para la escena ${escena.marca} +${escena.desde}s.`);
        }
        dentro.forEach((cuadro, i) => {
            const desde = Math.max(cuadro.at, inicio);
            const hasta = Math.min(dentro[i + 1]?.at ?? fin, fin);
            lista.push(`file '${path.join(OUT, "cuadros", cuadro.file)}'`, `duration ${Math.max(0.001, (hasta - desde) / 1000).toFixed(4)}`);
        });
        lista.push(`file '${path.join(OUT, "cuadros", dentro.at(-1)!.file)}'`);
        const listFile = path.join(WORK, `escena-${indice}.txt`);
        fs.writeFileSync(listFile, lista.join("\n"));
        entradas.push("-f", "concat", "-safe", "0", "-i", listFile);
    }
    const base = `[0:v]fps=${FPS},scale=${SIZE.width}:${SIZE.height}:flags=lanczos,setsar=1,trim=duration=${escena.segundos}`;
    let filtro = `${base},format=yuv420p[v]`;
    const cartel = escena.cartel ? carteles.get(escena.cartel) : undefined;
    if (cartel) {
        entradas.push("-loop", "1", "-t", String(escena.segundos), "-i", cartel);
        const esLogo = escena.cartel === "logo";
        const entra = esLogo ? 0.6 : 0.4;
        const sale = esLogo ? escena.segundos - 1.4 : escena.segundos - 1.1;
        filtro =
            `${base}[fondo];` +
            `[1:v]format=rgba,fade=t=in:st=${entra}:d=0.6:alpha=1,fade=t=out:st=${sale}:d=0.7:alpha=1[cartel];` +
            `[fondo][cartel]overlay=0:0:shortest=1,format=yuv420p[v]`;
    }
    run([...entradas, "-filter_complex", filtro, "-map", "[v]", "-r", String(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-t", String(escena.segundos), file]);
    return { file, inicio };
}

// Un sonido decodificado a muestras estéreo de 32 bits, una vez por archivo.
const decodificados = new Map<string, Float32Array>();
function muestras(file: string, desde = 0, segundos?: number): Float32Array {
    const clave = `${file}:${desde}:${segundos}`;
    const guardado = decodificados.get(clave);
    if (guardado) {
        return guardado;
    }
    const args = ["-hide_banner", "-loglevel", "error", ...(desde ? ["-ss", String(desde)] : []), ...(segundos ? ["-t", String(segundos)] : []), "-i", file, "-f", "f32le", "-ac", "2", "-ar", String(RATE), "-"];
    const buffer = execFileSync("ffmpeg", args, { maxBuffer: 1 << 30 });
    const valores = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
    decodificados.set(clave, valores);
    return valores;
}

function mezclar(pista: Float32Array, valores: Float32Array, enSegundos: number, ganancia: number): void {
    const offset = Math.round(enSegundos * RATE) * 2;
    for (let i = 0; i < valores.length && offset + i < pista.length; i++) {
        if (offset + i >= 0) {
            pista[offset + i]! += valores[i]! * ganancia;
        }
    }
}

// El archivo de un sonido del juego (lib/sound.ts prueba en este orden).
function archivoDeSonido(soundId: number): string | null {
    for (const extension of ["wav", "ogg", "mp3"]) {
        const file = path.join(PUBLIC, "sounds", `${soundId}.${extension}`);
        if (fs.existsSync(file)) {
            return file;
        }
    }
    return null;
}

function escribirWav(file: string, pista: Float32Array): void {
    const data = Buffer.alloc(pista.length * 2);
    for (let i = 0; i < pista.length; i++) data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, pista[i]!)) * 32767), i * 2);
    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + data.length, 4);
    header.write("WAVEfmt ", 8);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(2, 22);
    header.writeUInt32LE(RATE, 24);
    header.writeUInt32LE(RATE * 4, 28);
    header.writeUInt16LE(4, 32);
    header.writeUInt16LE(16, 34);
    header.write("data", 36);
    header.writeUInt32LE(data.length, 40);
    fs.writeFileSync(file, Buffer.concat([header, data]));
}

async function main(): Promise<void> {
    fs.rmSync(WORK, { recursive: true, force: true });
    fs.mkdirSync(WORK, { recursive: true });
    const cuadros = JSON.parse(fs.readFileSync(path.join(OUT, "cuadros.json"), "utf8")) as Cuadro[];
    const marcas = JSON.parse(fs.readFileSync(path.join(OUT, "marcas.json"), "utf8")) as Record<string, number>;
    const sonidos = JSON.parse(fs.readFileSync(path.join(OUT, "sonidos.json"), "utf8")) as Sonido[];

    // 1. Los carteles y los clips.
    const carteles = await dibujarCarteles();
    const clips = ESCENAS.map((escena, i) => ({ escena, ...cortar(escena, i, cuadros, marcas, carteles) }));

    // 2. Dónde empieza cada clip en el video (los fundidos los superponen).
    const comienzos: number[] = [];
    let t = 0;
    for (const clip of clips) {
        comienzos.push(t);
        t += clip.escena.segundos - XFADE;
    }
    const total = t + XFADE;

    // 3. El video: los clips unidos con fundidos.
    const entradas = clips.flatMap((clip) => ["-i", clip.file]);
    let filtro = "";
    let anterior = "[0:v]";
    clips.slice(1).forEach((_, i) => {
        const salida = i === clips.length - 2 ? "[video]" : `[x${i}]`;
        filtro += `${anterior}[${i + 1}:v]xfade=transition=fade:duration=${XFADE}:offset=${comienzos[i + 1]!.toFixed(3)}${salida};`;
        anterior = salida;
    });
    filtro += `[video]fade=t=in:st=0:d=0.8,fade=t=out:st=${(total - 1.2).toFixed(3)}:d=1.2[final]`;
    const mudo = path.join(WORK, "video.mp4");
    run([...entradas, "-filter_complex", filtro, "-map", "[final]", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-r", String(FPS), mudo]);

    // 4. El sonido: la música en sus tres tramos, con fundidos, y los efectos del juego donde sonaron.
    const pista = new Float32Array(Math.ceil(total * RATE) * 2);
    const primeraAccion = clips.findIndex((clip) => clip.escena.parte === "accion");
    const primerCierre = clips.findIndex((clip) => clip.escena.parte === "cierre");
    const partes: Array<{ tramo: [number, number]; en: number; hasta: number }> = [
        { tramo: CALMA, en: 0, hasta: comienzos[primeraAccion]! + 1.2 },
        { tramo: ACCION, en: comienzos[primeraAccion]!, hasta: comienzos[primerCierre]! + 1.5 },
        { tramo: CIERRE, en: comienzos[primerCierre]!, hasta: total },
    ];
    for (const parte of partes) {
        const segundos = Math.min(parte.hasta - parte.en, parte.tramo[1] - parte.tramo[0]);
        const valores = muestras(MUSIC, parte.tramo[0], segundos).slice();
        // Entra y sale en 1,2 segundos (se cruza con el tramo de al lado).
        const fundido = Math.round(1.2 * RATE) * 2;
        for (let i = 0; i < valores.length; i++) {
            valores[i]! *= Math.min(1, i / fundido, (valores.length - i) / fundido);
        }
        mezclar(pista, valores, parte.en, 0.8);
    }
    clips.forEach((clip, i) => {
        if (clip.escena.negro) {
            return;
        }
        const fin = clip.inicio + clip.escena.segundos * 1000;
        for (const sonido of sonidos) {
            if (sonido.at < clip.inicio || sonido.at >= fin) {
                continue;
            }
            const file = archivoDeSonido(sonido.soundId);
            if (!file) {
                continue;
            }
            // Las pisadas, bien abajo: acompañan sin tapar la música.
            const ganancia = sonido.volume * (sonido.category === "pisadas" ? 0.12 : 0.5);
            mezclar(pista, muestras(file), comienzos[i]! + (sonido.at - clip.inicio) / 1000, ganancia);
        }
    });
    // Que no sature: se baja todo si algún pico pasa del techo.
    let pico = 0;
    for (const valor of pista) pico = Math.max(pico, Math.abs(valor));
    if (pico > 0.95) for (let i = 0; i < pista.length; i++) pista[i]! *= 0.95 / pico;
    const finSuave = Math.round((total - 2) * RATE) * 2;
    for (let i = finSuave; i < pista.length; i++) pista[i]! *= Math.max(0, 1 - (i - finSuave) / (pista.length - finSuave));
    const wav = path.join(WORK, "sonido.wav");
    escribirWav(wav, pista);

    // 5. El video final.
    fs.mkdirSync(path.dirname(FINAL), { recursive: true });
    // Al volumen de las redes (−14 LUFS).
    run(["-i", mudo, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", String(RATE), "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", FINAL]);
    console.log(`Listo: ${FINAL} (${total.toFixed(1)} s)`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
