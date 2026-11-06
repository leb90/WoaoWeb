const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
for (const name of ["jsons", "mapas_source"]) {
  fs.cpSync(path.join(root, "src", name), path.join(root, "dist", name), { recursive: true });
}
