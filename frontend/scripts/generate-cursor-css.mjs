import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Genera app/cursors.css con los cursores de public/cursors embebidos como data: URI. Así el cursor existe desde que
// carga la hoja de estilos: no hay descarga que esperar ni caché que leer, y nunca se ve la flecha del sistema
// mientras tanto (pasaba en el inicio, con el video de fondo bajando a la vez). Correr después de cambiar un PNG:
// pnpm generate:cursor-css

const CURSORS_DIR = path.resolve(process.cwd(), "public/cursors");
const OUTPUT_PATH = path.resolve(process.cwd(), "app/cursors.css");

// variable CSS, archivo, punto activo (x y) y cursor del sistema de respaldo.
const CURSORS = [
    ["--cursor-juego", "guantelete.png", "2 2", "default"],
    ["--cursor-juego-clic", "guantelete-oro.png", "2 2", "pointer"],
    ["--cursor-juego-presionado", "guantelete-presionado.png", "2 2", "pointer"],
    ["--cursor-juego-enemigo", "guantelete-rojo.png", "2 2", "default"],
    ["--cursor-juego-amigo", "guantelete-azul.png", "2 2", "default"],
    ["--cursor-juego-apuntar", "cruceta.png", "16 16", "crosshair"],
    ["--cursor-juego-prohibido", "prohibido.png", "16 16", "not-allowed"],
];

const lines = [];
for (const [variable, file, hotspot, fallback] of CURSORS) {
    const data = await readFile(path.join(CURSORS_DIR, file));
    lines.push(
        `    ${variable}: url("data:image/png;base64,${data.toString("base64")}") ${hotspot}, ${fallback};`,
    );
}

const css = `/* Generado por scripts/generate-cursor-css.mjs a partir de public/cursors: no editar a mano. */
:root {
${lines.join("\n")}
}
`;

await writeFile(OUTPUT_PATH, css);
console.log(`${path.relative(process.cwd(), OUTPUT_PATH)}: ${CURSORS.length} cursores, ${css.length} bytes`);
