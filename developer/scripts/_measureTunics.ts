import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const assets =
  "C:/Users/ACER NITRO/.cursor/projects/c-Programaci-n-Proyectos-WoaoWeb/assets";
const files = [
  [
    "dorada",
    "c__Users_ACER_NITRO_AppData_Roaming_Cursor_User_workspaceStorage_4bc37bc4207ade557b2dbc9c5ffe11b5_images_Imagen_de_ChatGPT_22_oct_2026__02_48_05_p.m-94abe41d-a2c6-4555-bdc5-04806a927582.png",
  ],
  [
    "suerte",
    "c__Users_ACER_NITRO_AppData_Roaming_Cursor_User_workspaceStorage_4bc37bc4207ade557b2dbc9c5ffe11b5_images_Imagen_de_ChatGPT_22_oct_2026__02_48_08_p.m-74df33bd-5db5-43b9-b449-5e601df66030.png",
  ],
  [
    "experiencia",
    "c__Users_ACER_NITRO_AppData_Roaming_Cursor_User_workspaceStorage_4bc37bc4207ade557b2dbc9c5ffe11b5_images_Hoja_de_sprites_del_mago_celestial-f205d503-ec2e-4439-a674-6476304c08fc.png",
  ],
] as const;

async function main() {
  for (const [label, file] of files) {
    const meta = await sharp(path.join(assets, file)).metadata();
    console.log(label, `${meta.width}x${meta.height}`);
  }

  const root = path.resolve(__dirname, "../..");
  const bodies = JSON.parse(
    fs.readFileSync(path.join(root, "frontend/public/init/bodies.json"), "utf8"),
  );
  const graphics = JSON.parse(
    fs.readFileSync(
      path.join(root, "frontend/public/init/graficos.json"),
      "utf8",
    ),
  );
  const objs = JSON.parse(
    fs.readFileSync(path.join(root, "server/jsons/objs.json"), "utf8"),
  );

  const ref = objs["1238"];
  console.log("ref1238", ref?.name, "anim", ref?.anim);
  const body = bodies[String(ref?.anim)];
  console.log("body", body);
  for (const dir of ["1", "2", "3", "4"]) {
    console.log("dir", dir, graphics[String(body?.[dir])]);
  }

  let n = 0;
  for (const [oid, obj] of Object.entries(objs) as Array<[string, any]>) {
    if (Number(obj.objType) !== 3) continue;
    if (Number(obj.razaEnana) === 1) continue;
    const bd = bodies[String(obj.anim)];
    if (!bd) continue;
    const grh = graphics[String(bd["2"])];
    if (!grh) continue;
    console.log("sample", oid, obj.name, JSON.stringify(grh).slice(0, 160));
    if (++n >= 5) break;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
