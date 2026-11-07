const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const tests = fs.readdirSync(path.join(root, "src"), {recursive: true})
    .filter(file => file.endsWith(".test.ts")).sort().map(file => path.join(root,"src",file));
const result = spawnSync(process.execPath,[require.resolve("tsx/cli"),"--test",...tests],{cwd:root,stdio:"inherit"});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
