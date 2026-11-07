const fs=require('node:fs'),path=require('node:path');
const {createRequire}=require('node:module');const root=path.resolve(__dirname,'..');
const apiRequire=createRequire(path.join(root,'api/package.json'));
const helpers=apiRequire('./src/tests/helpers/api.ts');
const pool=apiRequire('./src/db.ts').default;
const wallet=apiRequire('./src/repositories/questWallets.ts');
const vaults=apiRequire('./src/repositories/vaults.ts');
(async()=>{
 const players={};
 for(const [role,prefix] of [['leader','Lider'],['member','Miembro'],['rival','Rival'],['fourth','Aliado']]) {
  players[role]=await helpers.createCharacterFixture({namePrefix:prefix,level:50,gold:2000000,items:[{idPos:1,idItem:38,cant:100,equipped:false},{idPos:2,idItem:37,cant:100,equipped:false},{idPos:3,idItem:402,cant:1,rarity:2,equipped:false}]});
  await wallet.initializeQuestWallet({characterId:players[role].id,legacyBalance:100});
 }
 const created=await helpers.createClan({characterId:players.leader.id,name:'Clan Apertura',minJoinLevel:1});
 if(created.status!==201) throw new Error(JSON.stringify(created.data));
 const clanId=created.data.clanId;
 await pool.query("UPDATE characters SET clan_id=$1 WHERE id=$2",[clanId,players.member.id]);
 await pool.query("INSERT INTO clan_members(clan_id,character_id,role) VALUES($1,$2,'member')",[clanId,players.member.id]);
 await vaults.syncClanVault(clanId,{expectedRevision:0,gold:300000,items:[{idPos:1,idItem:1095,cant:1}]});
 const dir=path.join(root,'test-results/opening-runtime');fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(root,'.run-logs/opening-characters.json'),JSON.stringify({players,clanId},null,2));
 console.log(JSON.stringify({players:Object.fromEntries(Object.entries(players).map(([k,v])=>[k,{name:v.name,id:v.id}])),clanId}));
 await pool.end();
})().catch(error=>{console.error(error.message);process.exit(1);});
