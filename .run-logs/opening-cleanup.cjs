const {createRequire}=require('node:module'),path=require('node:path'),fs=require('node:fs');
const ar=createRequire(path.resolve('api/package.json'));ar('tsx/cjs');const cfg=ar('./src/config.ts').default;
const url=new URL(cfg.databaseUrl);url.pathname='/postgres';const pool=new (ar('pg').Pool)({connectionString:url.toString()});
(async()=>{
 const name='woao_opening_test';if(!name.endsWith('_test'))throw new Error('Destino inválido');
 const database=(await pool.query('SELECT datname FROM pg_database WHERE datname=$1',[name])).rows[0];
 if(database?.datname===name){await pool.query('DROP DATABASE woao_opening_test WITH (FORCE)');console.log('Base exclusiva de prueba retirada: '+name);}
 await pool.end();
 for(const relative of ['.run-logs/opening-characters.json','.run-logs/opening-browser-login.js']){const file=path.resolve(relative);if(path.dirname(file)!==path.resolve('.run-logs'))throw new Error('Ruta inválida');fs.rmSync(file,{force:true});}
 console.log('Sesiones de fixture y archivos con tokens retirados');
})().catch(error=>{console.error(error.message);process.exit(1)});
