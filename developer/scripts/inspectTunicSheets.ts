import fs from "node:fs";
import path from "node:path";
import { detectSheet } from "../lib/graphics/spriteImport";

async function main() {
  const dir = path.resolve(__dirname, "../tmp/tunicas");
  for (const file of ["suerte.png", "experiencia.png", "dorada.png"]) {
    const buf = fs.readFileSync(path.join(dir, file));
    const detected = await detectSheet(buf);
    console.log(
      JSON.stringify({
        file,
        size: `${detected.width}x${detected.height}`,
        rows: detected.rows.map((row) => ({
          role: row.role,
          frames: row.frames.length,
          y: row.y,
          height: row.height,
          widths: row.frames.map((frame) => frame.width),
        })),
      }),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
