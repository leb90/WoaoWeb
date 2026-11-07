const delay=ms=>new Promise(r=>setTimeout(r,ms));
const post=async(p,body)=>{const r=await fetch('http://127.0.0.1:7998/'+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(await r.text());return r.json();};
(async()=>{
 for(const role of ['leader','rival']){await post('heal',{role});await post('teleport',{role,map:34,x:45,y:45});await post('command',{role,command:'/ranked'});}
 await delay(2000);for(const role of ['leader','rival'])await post('command',{role,command:'/rankedaceptar'});
 await delay(11000);const state=await(await fetch('http://127.0.0.1:7998/state')).json();const leader=state.players.find(p=>p.role==='leader');
 await post('teleport',{role:'rival',map:leader.map,x:leader.pos.x,y:leader.pos.y+1});await post('duel-hit',{role:'rival',target:'leader',hp:9999});await post('duel-hit',{role:'leader',target:'rival'});
 await delay(51000);await post('teleport',{role:'rival',map:leader.map,x:leader.pos.x,y:leader.pos.y+1});console.log(JSON.stringify(await post('duel-hit',{role:'leader',target:'rival'})));
})().catch(e=>{console.error(e.message);process.exit(1)});
