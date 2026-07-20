const path=require('path');let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
(async()=>{const b=await chromium.launch({headless:true});const ctx=await b.newContext({viewport:{width:1080,height:1350},deviceScaleFactor:1});const p=await ctx.newPage();
await p.goto('file://'+path.join(__dirname,'template.html'),{waitUntil:'load'});
await p.evaluate(async()=>{if(window.__ready)await window.__ready;if(document.fonts)await document.fonts.ready});
await new Promise(r=>setTimeout(r,250));
await p.screenshot({path:path.join(__dirname,process.argv[2]||'out.png'),clip:{x:0,y:0,width:1080,height:1350}});
await b.close();console.log('shot');})().catch(e=>{console.error(e);process.exit(1)});
