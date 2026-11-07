const path=require('node:path');
const {createRequire}=require('node:module');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const apiRequire=createRequire(path.join(root,'api/package.json'));
apiRequire('tsx/cjs');
const config=apiRequire('./src/config.ts').default;
const url=new URL(config.databaseUrl);url.pathname='/woao_opening_test';
config.databaseUrl=url.toString();config.port=3101;
config.worldAccessAllowlist=null;
process.env.DATABASE_URL=url.toString();process.env.PORT='3101';process.env.API_TEST_URL='http://127.0.0.1:3101';
process.env.API_TEST_AUTH=config.tokenAuth;process.env.WORLD_ACCESS_ALLOWLIST='';
const mode=process.argv[2];
if(mode==='migrate') apiRequire('./src/migrate.ts');
else if(mode==='api') apiRequire('./src/server.ts');
else if(mode==='fixtures') require('./opening-create-fixtures.cjs');
else if(mode==='test') {
 const result=spawnSync(process.execPath,[path.join(path.dirname(apiRequire.resolve('vitest/package.json')),'vitest.mjs'),'run',...process.argv.slice(3)],{cwd:path.join(root,'api'),env:process.env,stdio:'inherit'});
 process.exit(result.status??1);
} else if(mode==='frontend') {
 const frontRequire=createRequire(path.join(root,'frontend/package.json'));
 const next=path.join(path.dirname(frontRequire.resolve('next/package.json')),'dist/bin/next');
 const child=spawnSync(process.execPath,[next,'dev','--hostname','127.0.0.1','--port','3000'],{cwd:path.join(root,'frontend'),env:{...process.env,NODE_ENV:'development',API_BASE_URL:'http://127.0.0.1:3101',NEXT_PUBLIC_WS_URL:'ws://127.0.0.1:7766'},stdio:'inherit'});
 process.exit(child.status??1);
} else throw new Error('Modo inválido');
