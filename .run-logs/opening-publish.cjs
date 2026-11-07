const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const credentials=spawnSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\npath=leb90/WoaoWeb.git\n\n',encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never',GCM_GUI_PROMPT:'0'}});
if(credentials.status!==0)throw new Error('Credencial local de GitHub no disponible');
const values=Object.fromEntries(credentials.stdout.trim().split(/\r?\n/).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)];}));
if(!values.password)throw new Error('Credencial local de GitHub vacía');
const headers={Accept:'application/vnd.github+json',Authorization:'Bearer '+values.password,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
async function request(route,method='GET',body){const response=await fetch('https://api.github.com/repos/leb90/WoaoWeb'+route,{method,headers,...(body?{body:JSON.stringify(body)}:{})});const result=await response.json();if(!response.ok)throw new Error('GitHub '+response.status+': '+result.message);return result;}
(async()=>{
 const branch='feat/prioridad-1-apertura';const existing=await request('/pulls?state=open&head='+encodeURIComponent('leb90:'+branch)+'&base=main');
 const pr=existing[0]??await request('/pulls','POST',{title:'Prioridad 1: estabilidad, balance PvE, clanes y recompensas con wiki',head:branch,base:'main',draft:false,maintainer_can_modify:true,body:fs.readFileSync('.run-logs/opening-pr.md','utf8')});
 const result={number:pr.number,url:pr.html_url,head:pr.head.ref,sha:pr.head.sha,base:pr.base.ref};fs.writeFileSync('.run-logs/opening-pr-created.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 const images=[...pr.body.matchAll(/!\[[^\]]*\]\((https:[^)]+)\)/g)].map(m=>m[1]);
 for(const url of images){const r=await fetch(url);await r.arrayBuffer();if(!r.ok)throw new Error('Imagen no accesible: '+r.status+' '+url.split('/').pop());}
 console.log('Imágenes del PR accesibles: '+images.length);
 const current=await request('/pulls/'+pr.number);console.log(JSON.stringify({state:current.state,draft:current.draft,mergeable:current.mergeable,head:current.head.sha}));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
