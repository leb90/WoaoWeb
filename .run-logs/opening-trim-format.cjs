const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const ts=require('../server/node_modules/typescript');
const files=cp.execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(f=>/^(api|server)\/src\/.*\.ts$/.test(f));
const scan=s=>{const source=ts.createSourceFile('source.ts',s,ts.ScriptTarget.Latest,true),tokens=[],comments=new Map();
 const visit=node=>{for(const c of [...(ts.getLeadingCommentRanges(s,node.pos)||[]),...(ts.getTrailingCommentRanges(s,node.end)||[])])comments.set(c.pos,{start:c.pos,end:c.end,key:'comment:'+s.slice(c.pos,c.end)});
 const children=node.getChildren(source);if(children.length)children.forEach(visit);else if(![ts.SyntaxKind.EndOfFileToken,ts.SyntaxKind.CommaToken,ts.SyntaxKind.SemicolonToken].includes(node.kind))tokens.push({start:node.getStart(source),end:node.end,key:node.kind+':'+node.getText(source)});};visit(source);return [...tokens,...comments.values()].sort((a,b)=>a.start-b.start);};
for(const file of files){
 const original=cp.execFileSync('git',['show','HEAD:'+file],{encoding:'utf8',maxBuffer:20e6});const current=fs.readFileSync(file,'utf8');const a=scan(original),b=scan(current);
 const payload={a:a.map(t=>t.key),b:b.map(t=>t.key)};
 const python='import sys,json,difflib; p=json.load(sys.stdin); print(json.dumps(list(difflib.SequenceMatcher(None,p["a"],p["b"],autojunk=False).get_opcodes())))';
 const opcodes=JSON.parse(cp.execFileSync('python',['-c',python],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:20e6}));
 const changes=opcodes.filter(x=>x[0]!=='equal').map(([,i,j,k,l])=>({start:i?a[i-1].end:0,end:j<a.length?a[j].start:original.length,text:current.slice(k?b[k-1].end:0,l<b.length?b[l].start:current.length)}));
 let restored=original;for(const c of changes.reverse())restored=restored.slice(0,c.start)+c.text+restored.slice(c.end);
 if(JSON.stringify(scan(restored).map(t=>t.key))!==JSON.stringify(b.map(t=>t.key)))throw new Error('Diferencia semántica: '+file);
 fs.writeFileSync(file,restored);console.log(file+': formato original conservado');
}

