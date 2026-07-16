#!/usr/bin/env node
/**
 * Reel-Generator — render.cjs
 * ---------------------------
 * Verb-Config rein -> fertiges 9:16-MP4-Reel raus.
 * Rendert das animierte template.html DETERMINISTISCH: die Animationen werden
 * pausiert und Frame für Frame per Web-Animations-API auf eine exakte Zeit
 * gesetzt und abfotografiert. Kein Aufnahme-Timing-Drift, gestochen scharf.
 * ffmpeg baut die Frames zu einem H.264-MP4 (1080x1920, 30 fps).
 *
 * Nutzung:
 *   node render.cjs                    # Default-Reel (aufstehen)
 *   node render.cjs reels/<name>.json  # konfiguriertes Reel
 * Voraussetzung: playwright + ffmpeg.
 */
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const DIR = __dirname;
const FPS = 30;
const SECONDS = 11;          // muss zur 11s-Timeline in template.html passen
const N = FPS * SECONDS;

(async () => {
  const configArg = process.argv[2];
  let cfg = null;
  if (configArg && fs.existsSync(configArg)) cfg = JSON.parse(fs.readFileSync(configArg, 'utf8'));
  const id = (cfg && cfg.id) || 'reel-aufstehen';
  const framesDir = path.join(DIR, '.frames');
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  if (cfg && cfg.reel) await page.addInitScript((c) => { window.__REEL = c; }, cfg.reel);
  await page.goto('file://' + path.join(DIR, 'template.html'), { waitUntil: 'load' });
  await page.evaluate(async () => { await window.__ready; });
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

  const mp4 = path.join(DIR, id + '.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error',
    '-framerate', String(FPS), '-i', path.join(framesDir, 'f%04d.png'),
    '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
    '-movflags', '+faststart', mp4]);
  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log('OK', mp4, `(${N} frames, ${SECONDS}s)`);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
