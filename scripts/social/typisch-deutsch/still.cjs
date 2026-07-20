// still.cjs <html> [outname] — screenshot a 1080x1920 still from an HTML file
const path=require('path');const fs=require('fs');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const DIR=__dirname;
(async()=>{
  const html=process.argv[2]; const out=process.argv[3]||html.replace(/\.html$/,'.png');
  const b=await chromium.launch({headless:true});
  const ctx=await b.newContext({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  const p=await ctx.newPage();
  await p.goto('file://'+path.resolve(DIR,html),{waitUntil:'load'});
  await p.evaluate(async()=>{if(window.__ready)await window.__ready; if(document.fonts)await document.fonts.ready;});
  await new Promise(r=>setTimeout(r,300));
  await p.screenshot({path:path.resolve(DIR,out),clip:{x:0,y:0,width:1080,height:1920}});
  await b.close(); console.log('shot',out);
})().catch(e=>{console.error('FATAL',e);process.exit(1)});
