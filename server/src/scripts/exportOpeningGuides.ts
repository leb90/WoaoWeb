import fs from "node:fs";
import path from "node:path";
import { NPC_RANKS } from "../npcRanks";
const root = path.resolve(__dirname, "../../..");
const target = path.join(root, "frontend/public/init/opening");
fs.mkdirSync(target, { recursive: true });
for (const file of ["clanLevels.json", "openingRewards.json"])
    fs.copyFileSync(path.join(root, "api/src/jsons", file), path.join(target, file));
fs.writeFileSync(path.join(target, "npcRanks.json"), JSON.stringify(NPC_RANKS, null, 2) + "\n");
console.log("Configuración de guías exportada.");
