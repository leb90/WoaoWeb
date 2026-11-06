import assert from "node:assert/strict";
import test from "node:test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { loadObjectsDataFromApi } from "./objectData";
const config = require("./config");
test("el arranque admite catálogos de objetos de más de un megabyte desde la API", async () => {
    const child = spawn(
        process.execPath,
        [
            "-e",
            `const http=require('http');const body=JSON.stringify({currentVersion:1,changes:[{id:1,version:1,data:{name:'Objeto grande',objType:1,grhIndex:1,valor:1,desc:'x'.repeat(1200000)}}]});const server=http.createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(body)});server.listen(0,'127.0.0.1',()=>console.log(server.address().port));`,
        ],
        { stdio: ["ignore", "pipe", "pipe"] },
    );
    const previous = { apiBaseUrl: config.apiBaseUrl, tokenAuth: config.tokenAuth };
    try {
        const [chunk] = await once(child.stdout!, "data");
        config.apiBaseUrl = `http://127.0.0.1:${String(chunk).trim()}`;
        config.tokenAuth = "fixture-token";
        let loaded: any;
        try {
            loaded = loadObjectsDataFromApi();
        } catch (error) {
            assert.fail(
                `No se pudo cargar el catálogo de 1.200.000 bytes: ${(error as { code?: string }).code ?? "error"}`,
            );
        }
        assert.equal(loaded[1].name, "Objeto grande");
        assert.equal(loaded[1].desc.length, 1200000);
    } finally {
        Object.assign(config, previous);
        child.kill();
    }
});
