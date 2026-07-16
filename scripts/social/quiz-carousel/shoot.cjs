#!/usr/bin/env node
// Quiz-Karussell-Generator: rendert die Slides aus template.html als 1080x1350 PNGs.
// Nutzung: node shoot.cjs [config.json]
const path=require('path'); const fs=require('fs');
let chromium; try{({chromium}=require('playwright'));}catch{({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const DIR=__dirname;
(async()=>{
  const cfgArg=process.argv[2];
  let cfg=null; if(cfgArg&&fs.existsSync(cfgArg)) cfg=JSON.parse(fs.readFileSync(cfgArg,'utf8'));
  const outDir=path.join(DIR,'out'); fs.mkdirSync(outDir,{recursive:true});
  const b=await chromium.launch({headless:true});
  const ctx=await b.newContext({viewport:{width:1120,height:1400},deviceScaleFactor:1});
  const p=await ctx.newPage();
  if(cfg&&cfg.quiz) await p.addInitScript((c)=>{window.__QUIZ=c;}, cfg.quiz);
  await p.goto('file://'+path.join(DIR,'template.html'),{waitUntil:'load'});
  await p.evaluate(async()=>{await window.__ready});
  await new Promise(r=>setTimeout(r,250));
  const n=await p.evaluate(()=>window.__count);
  const names=[];
  for(let i=0;i<n;i++){
    const el=(await p.$$('.slide'))[i];
    const out=`slide-${String(i+1).padStart(2,'0')}.png`;
    await el.screenshot({path:path.join(outDir,out)});
    names.push(out);
    console.log('shot',out);
  }
  // contact sheet
  const thumbs=names.map(nm=>`<img src="out/${nm}">`).join('');
  fs.writeFileSync(path.join(DIR,'contact.html'),`<!doctype html><meta charset=utf-8><style>body{margin:0;background:#22242c;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:10px}img{width:100%;display:block;border-radius:6px}</style>${thumbs}`);
  const cp=await ctx.newPage(); await cp.setViewportSize({width:1500,height:820});
  await cp.goto('file://'+path.join(DIR,'contact.html'),{waitUntil:'load'});
  await cp.evaluate(async()=>{await Promise.all(Array.from(document.images).map(i=>i.complete?0:new Promise(r=>{i.onload=r;i.onerror=r})))});
  await new Promise(r=>setTimeout(r,300));
  await cp.screenshot({path:path.join(DIR,'contact.png'),fullPage:true});
  await b.close(); console.log('contact done', n, 'slides');
})().catch(e=>{console.error('FATAL',e);process.exit(1)});
