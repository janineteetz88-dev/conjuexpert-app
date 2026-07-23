#!/usr/bin/env node
// render.cjs [outName] — deterministic render of outro.html (3-card follow sequence) to MP4
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const DIR = __dirname;
const FPS = 30;
const SECONDS = 7;             // must match --dur in outro.html
const N = FPS * SECONDS;
const outName = process.argv[2] || 'outro-follow.mp4';
(async () => {
  const framesDir = path.join(DIR, '.frames');
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto('file://' + path.join(DIR, 'outro.html'), { waitUntil: 'load' });
  await page.evaluate(async () => { if (window.__ready) await window.__ready; });
  await page.evaluate(() => {
    document.body.classList.add('go');
    window.__anims = document.getAnimations();
    window.__anims.forEach((a) => a.pause());
  });
  const clip = { x: 0, y: 0, width: 1080, height: 1920 };
  for (let i = 0; i < N; i++) {
    const t = (i * 1000) / FPS;
    await page.evaluate((ms) => { window.__anims.forEach((a) => { a.currentTime = ms; }); }, t);
    await page.screenshot({ path: path.join(framesDir, `f${String(i).padStart(4, '0')}.png`), clip });
  }
  await browser.close();
  const mp4 = path.join(DIR, outName);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS),
    '-i', path.join(framesDir, 'f%04d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264',
    '-preset', 'medium', '-crf', '14', '-movflags', '+faststart', mp4]);
  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log('OK', mp4, `(${N} frames, ${SECONDS}s)`);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
