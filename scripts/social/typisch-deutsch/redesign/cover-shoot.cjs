// cover-shoot.cjs <config.json> <out.png> — render cover.html with injected window.__COVER
const path=require('path'),fs=require('fs');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const DIR=__dirname;const cfg=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const out=process.argv[3];
(async()=>{const b=await chromium.launch({headless:true});const ctx=await b.newContext({viewport:{width:1080,height:1920},deviceScaleFactor:1});const p=await ctx.newPage();
if(cfg.cover) await p.addInitScript(c=>{window.__COVER=c;},cfg.cover);
await p.goto('file://'+path.join(DIR,'cover.html'),{waitUntil:'load'});
await p.evaluate(async()=>{if(window.__ready)await window.__ready; if(document.fonts)await document.fonts.ready;});
await new Promise(r=>setTimeout(r,250));
await p.screenshot({path:path.resolve(out),clip:{x:0,y:0,width:1080,height:1920}});
await b.close();console.log('cover',out);})().catch(e=>{console.error(e);process.exit(1)});
