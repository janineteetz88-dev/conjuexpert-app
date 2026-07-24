const path=require('path'),fs=require('fs'),{execFileSync}=require('child_process');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const DIR=__dirname,FPS=30,SECONDS=16,N=FPS*SECONDS;
const cfgArg=process.argv[2],outName=process.argv[3]||'cq.mp4';let cfg=null;
if(cfgArg&&fs.existsSync(cfgArg))cfg=JSON.parse(fs.readFileSync(cfgArg,'utf8'));
(async()=>{const fd=path.join(DIR,'.frames');fs.rmSync(fd,{recursive:true,force:true});fs.mkdirSync(fd,{recursive:true});
const b=await chromium.launch({headless:true});const ctx=await b.newContext({viewport:{width:1080,height:1920},deviceScaleFactor:1});const p=await ctx.newPage();
if(cfg&&cfg.cq)await p.addInitScript(c=>{window.__CQ=c;},cfg.cq);
await p.goto('file://'+path.join(DIR,'reel.html'),{waitUntil:'load'});await p.evaluate(async()=>{if(window.__ready)await window.__ready});
await p.evaluate(()=>{document.body.classList.add('go');window.__a=document.getAnimations();window.__a.forEach(a=>a.pause());});
for(let i=0;i<N;i++){await p.evaluate(ms=>window.__a.forEach(a=>a.currentTime=ms),(i*1000)/FPS);await p.screenshot({path:path.join(fd,`f${String(i).padStart(4,'0')}.png`),clip:{x:0,y:0,width:1080,height:1920}});}
await b.close();const mp4=path.join(DIR,outName);
execFileSync('ffmpeg',['-y','-loglevel','error','-framerate',String(FPS),'-i',path.join(fd,'f%04d.png'),'-vf','format=yuv420p','-c:v','libx264','-preset','medium','-crf', '14','-movflags','+faststart',mp4]);
fs.rmSync(fd,{recursive:true,force:true});console.log('OK',mp4);})().catch(e=>{console.error('FATAL',e);process.exit(1)});
