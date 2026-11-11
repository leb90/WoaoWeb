// Video de ejemplo de cómo funciona la invisibilidad (README.md): graba las escenas "invisibilidad" e
// "invisibilidad-clan" de server/src/teaser.ts (un asesino y un paladín, vistos por otro jugador, que no se dibuja) y
// arma un MP4 con un cartel por parte.
//   pnpm invisibilidad      deja out/invisibilidad-ejemplo.mp4
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

import { abrirJuego, escena, pedir } from "./juego";

const OUT = path.join(__dirname, "out", "invisibilidad");
const FINAL = path.join(__dirname, "out", "invisibilidad-ejemplo.mp4");
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const run = (args: string[]) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
const hacer = (bot: string, params: Record<string, string | number>) => pedir("hacer", { bot, ...params }).catch((e) => console.log("[aviso]", String(e).slice(0, 120)));

type Parte = { desde: string; segundos: number; titulo: string; texto: string };
const PARTES: Parte[] = [
    { desde: "invisible", segundos: 5.5, titulo: "1 · Se vuelve invisible (dura 20 s)", texto: "Para los demás jugadores desaparece del todo, también el nombre. Las criaturas no lo detectan." },
    { desde: "combate", segundos: 6.5, titulo: "2 · Si pelea con un jugador, se lo ve parpadear", texto: "Cada golpe o hechizo entre jugadores abre 5 s en los que aparece y desaparece del todo." },
    { desde: "corte", segundos: 4.5, titulo: "3 · Si le hace daño a un jugador, se le corta", texto: "Con un golpe o un hechizo de daño. Paralizar o inmovilizar no la cortan, y pegarle a criaturas tampoco." },
    { desde: "clan", segundos: 6.0, titulo: "4 · Así lo ven su clan y su party", texto: "Transparente y con el nombre. Él mismo también se ve así." },
];

async function main() {
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(path.join(OUT, "cuadros"), { recursive: true });
    const { browser, page } = await abrirJuego();
    const cdp = await page.context().newCDPSession(page);
    const cuadros: Array<{ file: string; at: number }> = [];
    cdp.on("Page.screencastFrame", (frame) => {
        const file = `${String(cuadros.length).padStart(6, "0")}.jpg`;
        fs.writeFileSync(path.join(OUT, "cuadros", file), Buffer.from(frame.data, "base64"));
        cuadros.push({ file, at: Number(frame.metadata.timestamp ?? Date.now() / 1000) * 1000 });
        void cdp.send("Page.screencastFrameAck", { sessionId: frame.sessionId }).catch(() => {});
    });
    const marcas: Record<string, number> = {};
    try {
        await page.evaluate(() => window.__woaoTeaser?.hideSelf(true));
        await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1600, maxHeight: 900, everyNthFrame: 1 });

        await escena(page, "invisibilidad");
        await esperar(1500);
        marcas.invisible = Date.now() - 1000;
        await hacer("Asesino", { que: "hechizo", id: 14, a: "yo" });
        await esperar(5500);
        // El paladín lo inmoviliza: no lo daña, así que no se corta, pero abre la ventana de pelea.
        marcas.combate = Date.now() - 300;
        await hacer("Paladín", { que: "hechizo", id: 66, a: "Asesino" });
        await esperar(6500);
        // El asesino le tira un hechizo de daño (inmovilizado no puede caminar hasta él): se le corta.
        marcas.corte = Date.now() - 600;
        await hacer("Asesino", { que: "hechizo", id: 73, a: "Paladín" });
        await esperar(4500);

        await escena(page, "invisibilidad-clan");
        await esperar(1500);
        marcas.clan = Date.now() - 800;
        await hacer("Asesino", { que: "hechizo", id: 14, a: "yo" });
        await esperar(6000);
    } finally {
        await cdp.send("Page.stopScreencast").catch(() => {});
        await pedir("limpiar").catch(() => {});
        await browser.close();
    }

    // Los carteles.
    const navegador = await chromium.launch({ channel: "chrome" });
    const pagina = await navegador.newPage({ viewport: { width: 1280, height: 720 } });
    const carteles: string[] = [];
    for (const [i, parte] of PARTES.entries()) {
        await pagina.setContent(`<!doctype html><html><head><meta charset="utf-8">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&display=block">
            <style>html,body{margin:0;width:1280px;height:720px;background:transparent}
            .banda{position:absolute;left:0;right:0;bottom:0;height:150px;background:linear-gradient(180deg,rgba(5,3,2,0),rgba(5,3,2,.88) 38%)}
            .t{position:absolute;left:48px;bottom:62px;font:700 30px Cinzel,serif;color:#f6ead2;text-shadow:0 3px 0 #120b05}
            .s{position:absolute;left:48px;right:48px;bottom:26px;font:20px Georgia,serif;color:#d9c8a4}</style></head>
            <body><div class="banda"></div><div class="t">${parte.titulo}</div><div class="s">${parte.texto}</div></body></html>`);
        await pagina.evaluate(() => document.fonts.ready);
        const file = path.join(OUT, `cartel-${i}.png`);
        await pagina.screenshot({ path: file, omitBackground: true });
        carteles.push(file);
    }
    await navegador.close();

    // Los clips: recorte alrededor de la acción (los bots están dos baldosas arriba del que graba) llevado a 1280x720.
    const clips: string[] = [];
    for (const [i, parte] of PARTES.entries()) {
        const inicio = marcas[parte.desde]!;
        const fin = inicio + parte.segundos * 1000;
        const dentro = cuadros.filter((c, j) => c.at < fin && (cuadros[j + 1]?.at ?? Infinity) > inicio);
        const lista: string[] = [];
        dentro.forEach((c, j) => {
            const desde = Math.max(c.at, inicio);
            const hasta = Math.min(dentro[j + 1]?.at ?? fin, fin);
            lista.push(`file '${path.join(OUT, "cuadros", c.file)}'`, `duration ${Math.max(0.001, (hasta - desde) / 1000).toFixed(4)}`);
        });
        lista.push(`file '${path.join(OUT, "cuadros", dentro.at(-1)!.file)}'`);
        const listFile = path.join(OUT, `parte-${i}.txt`);
        fs.writeFileSync(listFile, lista.join("\n"));
        const clip = path.join(OUT, `parte-${i}.mp4`);
        run([
            "-f", "concat", "-safe", "0", "-i", listFile, "-loop", "1", "-t", String(parte.segundos), "-i", carteles[i]!,
            "-filter_complex",
            `[0:v]fps=30,crop=1067:600:267:96,scale=1280:720:flags=lanczos,setsar=1,trim=duration=${parte.segundos}[v];` +
                `[1:v]format=rgba,fade=t=in:st=0.2:d=0.4:alpha=1[c];[v][c]overlay=0:0:shortest=1,format=yuv420p[o]`,
            "-map", "[o]", "-r", "30", "-c:v", "libx264", "-crf", "18", "-t", String(parte.segundos), clip,
        ]);
        clips.push(clip);
    }
    let filtro = "";
    let anterior = "[0:v]";
    let offset = 0;
    clips.slice(1).forEach((_, i) => {
        offset += PARTES[i]!.segundos - 0.4;
        const salida = i === clips.length - 2 ? "[final]" : `[x${i}]`;
        filtro += `${anterior}[${i + 1}:v]xfade=transition=fade:duration=0.4:offset=${offset.toFixed(2)}${salida};`;
        anterior = salida;
    });
    run([...clips.flatMap((c) => ["-i", c]), "-filter_complex", filtro.replace(/;$/, ""), "-map", "[final]", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", FINAL]);
    console.log("Listo:", FINAL);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
