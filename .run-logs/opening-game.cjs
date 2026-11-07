const path=require('node:path'),fs=require('node:fs'),http=require('node:http');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'..');const apiRequire=createRequire(path.join(root,'api/package.json'));
apiRequire('tsx/cjs');const apiConfig=apiRequire('./src/config.ts').default;
process.env.PORT='7766';process.env.API_BASE_URL='http://127.0.0.1:3101';process.env.TOKEN_AUTH=apiConfig.tokenAuth;
process.env.NODE_ENV='development';process.env.GAME_DATA_SOURCE='api';process.env.AOWEB_TEST_MODE='true';process.env.RESET_CONNECTED_CHARACTERS_ON_STARTUP='true';
process.env.WOAO_DATA_DIR=path.join(root,'test-results/opening-runtime');fs.mkdirSync(process.env.WOAO_DATA_DIR,{recursive:true});
const sr=createRequire(path.join(root,'server/package.json'));sr('tsx/cjs');
const vars=sr('./src/vars.ts');const game=sr('./src/game.ts');const protocol=sr('./src/handleProtocol.ts');const socket=sr('./src/socket.ts');
const commands=sr('./src/commands.ts');const fixtures=JSON.parse(fs.readFileSync(path.join(root,'.run-logs/opening-characters.json')));
const packet=sr('../frontend/lib/aowProtocol.ts');const WS=sr('ws');const peers=new Map();const fixtureNpcs=new Set();
sr('./src/server.ts');
function player(role){const fixture=fixtures.players[role];const user=Object.values(vars.personajes).find(u=>u._id===fixture?.id);if(!user)throw new Error('Jugador no conectado: '+role);return user;}
function describe(){return {ready:vars.serverReady,players:Object.keys(fixtures.players).map(role=>{try{const u=player(role);return {role,id:u.id,name:u.nameCharacter,map:u.map,pos:u.pos,hp:u.hp,gold:u.gold,points:u.puntosCanje,clan:u.clanId,ranked:u.rankedMatchId,dead:u.dead};}catch{return {role,online:false};}}),npcs:[...fixtureNpcs].map(id=>{const n=vars.npcs[id];return n?{id,name:n.nameCharacter,hp:n.hp,maxHp:n.maxHp,map:n.map,pos:n.pos}:null;})};}
async function connect(role){if(peers.has(role))return;const f=fixtures.players[role];const response=await fetch('http://127.0.0.1:3101/auth/game-ticket',{method:'POST',headers:{Authorization:`Bearer ${f.sessionToken}`}});const data=await response.json();if(!data.ticket)throw new Error('Sin ticket');const ws=new WS('ws://127.0.0.1:7766');await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});ws.send(packet.createConnectCharacterPacket({ticket:data.ticket}));peers.set(role,ws);ws.on('error',()=>{});}
function publishNpc(n){game.loopAreaPos(n.map,n.pos,u=>{const client=vars.clients[u.id];if(client){protocol.sendNpc(n);socket.send(client);}});}
http.createServer(async(req,res)=>{res.setHeader('Content-Type','application/json');try{
 let raw='';for await(const chunk of req)raw+=chunk;const p=raw?JSON.parse(raw):{};
 if(req.url==='/state'){res.end(JSON.stringify(describe()));return;}
 if(!vars.serverReady)throw new Error('Servidor iniciando');
 if(req.url==='/peer') await connect(p.role);
 else if(req.url==='/disconnect-peer'){peers.get(p.role)?.close();peers.delete(p.role);}
 else if(req.url==='/teleport'){const u=player(p.role);game.telep(vars.clients[u.id],p.map,p.x,p.y,'validacion-apertura');}
 else if(req.url==='/command'){const u=player(p.role);await commands.msg(p.command,vars.clients[u.id]);}
 else if(req.url==='/items'){const u=player(p.role);for(const item of p.items)game.putItemToInv(u.id,item.idItem,item.amount,item.rarity??0);}
 else if(req.url==='/equip'){const u=player(p.role);const peer=peers.get(p.role);if(peer)peer.send(packet.createEquipItemPacket(p.slot));else throw new Error('Equipar este personaje desde el navegador');}
 else if(req.url==='/npc'){
  const u=player(p.role);const before=new Set(Object.keys(vars.npcs));const loader=new (sr('./src/loadNpcs.ts'))();loader.createNpcInMap({mapNum:u.map,x:p.x,y:p.y,npcIndex:p.template??501},true,false,true);
  const n=Object.values(vars.npcs).find(n=>!before.has(String(n.id)));if(!n)throw new Error('No se creó NPC');
  sr('./src/npcRanks.ts').refreshNpcRank(n,vars.datNpc[p.template??501],p.rank??'normal');n.movement=0;n.hostile=0;n.nextThinkAt=Date.now()+3600000;fixtureNpcs.add(n.id);publishNpc(n);
 }
 else if(req.url==='/clear-npcs'){for(const id of fixtureNpcs){const n=vars.npcs[id];if(!n)continue;game.loopAreaPos(n.map,n.pos,u=>{if(vars.clients[u.id])protocol.deleteCharacter(id,vars.clients[u.id]);});if(vars.mapData[n.map]?.[n.pos.y]?.[n.pos.x]?.id===id)vars.mapData[n.map][n.pos.y][n.pos.x].id=0;delete vars.npcs[id];delete vars.areaNpc[id];}fixtureNpcs.clear();}
 else if(req.url==='/strike'){
  const u=player(p.role),n=vars.npcs[p.npcId];if(!n)throw new Error('Sin NPC');n.hp=p.hp??n.hp;
  let i=0;while(n.hp>0&&i++<50){if(p.spell)game.userSpellNpc(u.id,n.id,p.spell);else game.userDmgNpc(u.id,n.id);}
  sr('./src/respawn.ts').muere(vars.clients[u.id],n.id);
 }
 else if(req.url==='/duel-hit'){
  const u=player(p.role),target=player(p.target);target.hp=p.hp??1;protocol.updateHP(target.hp,vars.clients[target.id]);
  let i=0;while(target.hp>0&&i++<30)game.userDmgUser(u.id,target.id);
  sr('./src/respawn.ts').muere(vars.clients[u.id],target.id);
 }
 else if(req.url==='/heal'){const u=player(p.role);game.revivirUsuario(u.id,{hp:u.maxHp,mana:u.maxMana});}
 else if(req.url==='/event-action'){
  const mod=sr('./src/'+p.module+'.ts');if(!['bloodCastle','huntersGame','tournamentAuto','factionWars','rankedArena'].includes(p.module))throw new Error('Módulo inválido');
  if(!['startEvent','joinEvent','cancelEvent','startWar','joinWar','tick','toggleQueue','acceptConfirmation','onUserDied','onNpcDied'].includes(p.action))throw new Error('Acción inválida');
  const args=p.args??[];await mod[p.action](...args.map(a=>typeof a==='string'&&a.startsWith('role:')?String(player(a.slice(5)).id):a));
 }
 else throw new Error('Acción desconocida');
 res.end(JSON.stringify(describe()));
}catch(error){res.statusCode=400;res.end(JSON.stringify({error:error.message}));}}).listen(7998,'127.0.0.1');
setInterval(()=>{for(const ws of peers.values())if(ws.readyState===1)ws.send(packet.createPingPacket(Date.now()%1000000));},5000).unref();
