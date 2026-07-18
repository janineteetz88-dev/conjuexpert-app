const path=require('path'),fs=require('fs');let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const DIR=path.join(__dirname);const cfg=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const tag=process.argv[3];const times=[3000,6300];
(async()=>{const b=await chromium.launch({headless:true});const ctx=await b.newContext({viewport:{width:1080,height:1920},deviceScaleFactor:1});const p=await ctx.newPage();
await p.addInitScript(c=>{window.__REEL=c;},cfg.reel);
await p.goto('file://'+path.join(DIR,'brand-reel.html'),{waitUntil:'load'});
await p.evaluate(async()=>{if(window.__ready)await window.__ready});
await p.evaluate(()=>{document.body.classList.add('go');window.__a=document.getAnimations();window.__a.forEach(a=>a.pause());});
const S='/tmp/claude-0/-home-user/1ce7736a-8598-5365-ab07-3f0977067ba4/scratchpad';
for(const t of times){await p.evaluate(ms=>window.__a.forEach(a=>a.currentTime=ms),t);await p.screenshot({path:`${S}/${tag}_${t}.png`,clip:{x:0,y:0,width:1080,height:1920}});}
await b.close();console.log('probed',tag);})().catch(e=>{console.error(e);process.exit(1)});
