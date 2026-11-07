// Arma el video del teaser (README.md) con lo que grabó grabar.ts: los cuadros con su hora, las marcas de cada escena
// y los sonidos que sonaron. Corta cada escena, le pone su cartel, las une con fundidos, arma la música épica con los
// golpes de tráiler, el clima y los efectos del juego en su momento, y codifica el MP4.
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

// La música: "Five Armies", de Kevin MacLeod (incompetech.com, CC BY 4.0). Se baja la primera vez a assets/.
const MUSIC_URL = "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Five%20Armies.mp3";
const MUSIC = path.join(__dirname, "assets", "five-armies.mp3");
const MUSIC_CREDIT = "Música: «Five Armies», Kevin MacLeod (incompetech.com), CC BY 4.0";
// La ciudad va con el arranque del tema (los tambores suaves). Para el resto, el tema sigue hasta su golpe final, que
// cae justo cuando aparece el logo; el acorde que queda sonando cierra el video.
const ARRANQUE: [number, number] = [0, 14];
const GOLPE_FINAL = 147.2;
const FIN_DEL_TEMA = 155.8;

// El clima de algunas escenas (frontend/public/sounds/clima, CC0): el juego lo suena aparte y no queda anotado.
const CLIMA = path.join(PUBLIC, "sounds", "clima");

type Cuadro = { file: string; at: number };
type Sonido = { soundId: number; at: number; volume: number; category: string };
type Cartel = { titulo: string; antetitulo?: string; pie?: string } | "logo";
// Una escena: desde una marca (más unos segundos), cuánto dura, su cartel (si tiene), si arranca con un golpe de
// tráiler y el clima que suena de fondo.
type Escena = {
    marca: string;
    desde: number;
    segundos: number;
    cartel?: Cartel;
    golpe?: boolean;
    clima?: { archivo: string; ganancia: number; trueno?: string };
    /** Acerca la cámara (el personaje queda en el centro): en la mazmorra los bloques, las placas y las bombas son chicos. */
    zoom?: number;
    negro?: boolean;
};

const TORMENTA = { archivo: "clima-tormenta.mp3", ganancia: 0.35 };
const NIEVE = { archivo: "clima-nieve.mp3", ganancia: 0.3 };

const ESCENAS: Escena[] = [
    { marca: "ciudad", desde: 0.6, segundos: 9.2, cartel: { antetitulo: "World of Argentum", titulo: "Un mundo lleno de gente" } },
    { marca: "caza", desde: 0.8, segundos: 5.6, cartel: { titulo: "Armá tu party y salí a cazar" }, golpe: true },
    { marca: "caza", desde: 7.4, segundos: 3.4 },
    { marca: "chaman", desde: 0.5, segundos: 5.4, cartel: { antetitulo: "Clase nueva", titulo: "Chamán elemental" }, golpe: true, clima: NIEVE },
    { marca: "chaman", desde: 7.0, segundos: 3.8, clima: NIEVE },
    { marca: "castillo", desde: 0.6, segundos: 6.2, cartel: { titulo: "Conquistá castillos con tu clan" }, golpe: true, clima: { ...TORMENTA, trueno: "clima-trueno-1.ogg" } },
    { marca: "castillo", desde: 7.6, segundos: 3.6, clima: TORMENTA },
    // La mazmorra: la llave, el salto con la Pluma, la puerta, el bloque y las placas, y la sala del agua con el Abisal.
    { marca: "mazmorra.cofre", desde: -1.6, segundos: 3.4, cartel: { antetitulo: "Próximamente", titulo: "Mazmorras", pie: "En desarrollo" }, golpe: true, zoom: 1.4 },
    { marca: "mazmorra.salto", desde: -0.7, segundos: 2.2, zoom: 1.4 },
    { marca: "mazmorra.puerta", desde: -0.4, segundos: 1.9, zoom: 1.4 },
    { marca: "mazmorra.bloque", desde: 0.2, segundos: 3.6, cartel: { titulo: "Resolvé acertijos" }, zoom: 1.4 },
    { marca: "mazmorra.placa", desde: 1.2, segundos: 2.4, zoom: 1.4 },
    { marca: "mazmorra.ranas", desde: -0.6, segundos: 2.4, zoom: 1.4 },
    { marca: "mazmorra.agua", desde: 0.6, segundos: 6.0, cartel: { titulo: "Usá objetos nuevos" }, zoom: 1.6 },
    { marca: "fin", desde: 0, segundos: 7.0, cartel: "logo", golpe: true, negro: true },
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
    const acercar = escena.zoom ? `crop=iw/${escena.zoom}:ih/${escena.zoom},` : "";
    const base = `[0:v]fps=${FPS},${acercar}scale=${SIZE.width}:${SIZE.height}:flags=lanczos,setsar=1,trim=duration=${escena.segundos}`;
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

// Los golpes de tráiler, hechos acá con ffmpeg (no hay licencias que cumplir): un golpe grave con su eco, un barrido
// de aire que pasa de un lado al otro y una subida que lleva al logo.
function sonidosDeTrailer(): { golpe: string; barrido: string; subida: string } {
    const golpe = path.join(WORK, "golpe.wav");
    const barrido = path.join(WORK, "barrido.wav");
    const subida = path.join(WORK, "subida.wav");
    run([
        "-f", "lavfi", "-i", `aevalsrc='0.9*sin(2*PI*(52*t-10*t*t))*exp(-2.4*t)+0.3*sin(2*PI*(104*t-20*t*t))*exp(-5*t)':s=${RATE}:d=3.5`,
        "-f", "lavfi", "-i", `anoisesrc=d=3.5:c=brown:r=${RATE}:a=0.8`,
        "-filter_complex",
        "[1:a]lowpass=f=700,afade=t=out:st=0:d=0.6:curve=exp[ruido];" +
            "[0:a][ruido]amix=inputs=2:weights=1 0.6:normalize=0,aecho=0.8:0.6:70|140:0.35|0.25,highpass=f=25,alimiter=limit=0.95,pan=stereo|c0=c0|c1=c0",
        golpe,
    ]);
    run([
        "-f", "lavfi", "-i", `anoisesrc=d=1.2:c=pink:r=${RATE}:a=0.9`,
        "-af", "highpass=f=250,lowpass=f=5000,afade=t=in:st=0:d=0.8:curve=qsin,afade=t=out:st=0.8:d=0.4,pan=stereo|c0=c0|c1=c0,apulsator=hz=0.8:amount=0.7",
        barrido,
    ]);
    run([
        "-f", "lavfi", "-i", `aevalsrc='0.25*sin(2*PI*(180*t+70*t*t))*(t/2.5)':s=${RATE}:d=2.5`,
        "-f", "lavfi", "-i", `anoisesrc=d=2.5:c=white:r=${RATE}:a=0.5`,
        "-filter_complex", "[1:a]highpass=f=1500,volume=0.4[ruido];[0:a][ruido]amix=inputs=2:normalize=0,afade=t=in:st=0:d=2.3:curve=exp,pan=stereo|c0=c0|c1=c0",
        subida,
    ]);
    return { golpe, barrido, subida };
}

async function main(): Promise<void> {
    fs.rmSync(WORK, { recursive: true, force: true });
    fs.mkdirSync(WORK, { recursive: true });
    if (!fs.existsSync(MUSIC)) {
        fs.mkdirSync(path.dirname(MUSIC), { recursive: true });
        execFileSync("curl", ["-sL", "-A", "Mozilla/5.0", "-o", MUSIC, MUSIC_URL]);
    }
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

    // 4. El sonido.
    const pista = new Float32Array(Math.ceil(total * RATE) * 2);
    const conFundido = (valores: Float32Array, entra: number, sale: number) => {
        const largoEntra = Math.max(1, Math.round(entra * RATE) * 2);
        const largoSale = Math.max(1, Math.round(sale * RATE) * 2);
        for (let i = 0; i < valores.length; i++) {
            valores[i]! *= Math.min(1, i / largoEntra, (valores.length - i) / largoSale);
        }
        return valores;
    };

    // La música: el arranque del tema para la ciudad y, desde la caza, el tema hasta su golpe final con el logo.
    const primeraAccion = clips.findIndex((clip) => clip.escena.marca !== "ciudad");
    const logo = clips.findIndex((clip) => clip.escena.cartel === "logo");
    const enAccion = comienzos[primeraAccion]!;
    const desdeTema = Math.max(ARRANQUE[1], GOLPE_FINAL - (comienzos[logo]! - enAccion));
    const arranque = Math.min(enAccion + 0.8, ARRANQUE[1] - ARRANQUE[0]);
    mezclar(pista, conFundido(muestras(MUSIC, ARRANQUE[0], arranque).slice(), 0.3, 0.8), 0, 0.7);
    mezclar(pista, conFundido(muestras(MUSIC, desdeTema, FIN_DEL_TEMA - desdeTema).slice(), 0.15, 1.5), enAccion, 0.7);

    // Los golpes de tráiler: uno al entrar cada escena grande, un barrido en cada cambio de lugar y una subida antes
    // del logo.
    const trailer = sonidosDeTrailer();
    clips.forEach((clip, i) => {
        if (clip.escena.golpe) {
            mezclar(pista, muestras(trailer.golpe), comienzos[i]! + XFADE / 2, i === logo ? 1 : 0.85);
        }
        const lugar = (marca: string) => marca.split(".")[0];
        if (i > 0 && lugar(clip.escena.marca) !== lugar(clips[i - 1]!.escena.marca) && i !== logo) {
            mezclar(pista, muestras(trailer.barrido), comienzos[i]! - 0.7, 0.35);
        }
    });
    mezclar(pista, muestras(trailer.subida), comienzos[logo]! - 2.4, 0.45);

    // El clima de fondo y el trueno, en las escenas que lo tienen.
    clips.forEach((clip, i) => {
        const clima = clip.escena.clima;
        if (!clima) {
            return;
        }
        const fondo = muestras(path.join(CLIMA, clima.archivo));
        const largo = Math.round(clip.escena.segundos * RATE) * 2;
        const tramo = new Float32Array(largo);
        for (let j = 0; j < largo; j++) tramo[j] = fondo[j % fondo.length]!;
        mezclar(pista, conFundido(tramo, 0.4, 0.4), comienzos[i]!, clima.ganancia);
        if (clima.trueno) {
            mezclar(pista, muestras(path.join(CLIMA, clima.trueno)), comienzos[i]! + 0.4, 0.8);
        }
    });

    // Los efectos del juego donde sonaron. El mismo sonido dos veces en el mismo instante (lo anota el cliente y el
    // eco del server) va una sola vez.
    clips.forEach((clip, i) => {
        if (clip.escena.negro) {
            return;
        }
        const fin = clip.inicio + clip.escena.segundos * 1000;
        const ultimoDe = new Map<number, number>();
        for (const sonido of sonidos) {
            if (sonido.at < clip.inicio || sonido.at >= fin || sonido.at - (ultimoDe.get(sonido.soundId) ?? -Infinity) < 80) {
                continue;
            }
            ultimoDe.set(sonido.soundId, sonido.at);
            const file = archivoDeSonido(sonido.soundId);
            if (!file) {
                continue;
            }
            // Las pisadas, bien abajo: acompañan sin tapar la música.
            const ganancia = sonido.volume * (sonido.category === "pisadas" ? 0.12 : 0.85);
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
