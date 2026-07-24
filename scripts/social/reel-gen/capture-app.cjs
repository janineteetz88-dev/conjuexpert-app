#!/usr/bin/env node
/**
 * capture-app.cjs — echten ConjuExpert-App-Screen als langen Scroll-Streifen ziehen
 * -------------------------------------------------------------------------------
 * Startet einen lokalen Static-Server über dem Repo-Root, öffnet die echte App im
 * Deep-Link `?lang=de&verb=<verb>` (rotes Deutsch-CI, Onboarding übersprungen),
 * lässt ALLE Zeitformen ausklappen und fotografiert die komplette Konjugations-
 * Liste als 1:1-PNG-Streifen nach `assets/<verb>-scroll.png`.
 *
 * Der Streifen wird vom Reel-Template (Scene B) als scrollende App im Handy-Frame
 * abgespielt — die Scroll-Distanz berechnet das Template dynamisch aus der Bildhöhe,
 * es funktioniert also für jedes Verb ohne manuelles Nachjustieren.
 *
 * Nutzung:  node capture-app.cjs <verb>        # z. B. anfangen, denken, aufstehen
 * Voraussetzung: playwright (Chromium), python3 (nur für den Static-Server).
 */
const path = require('path');
const fs = require('fs');
const { spawn, execFileSync } = require('child_process');

let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const DIR = __dirname;
const REPO = path.resolve(DIR, '../../..');        // /home/user/conjuexpert-app
const PORT = Number(process.env.CAP_PORT || 8099);
const verb = (process.argv[2] || 'aufstehen').trim();

const waitServer = async (url, tries = 60) => {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.status < 500) return true; } catch {}
    await new Promise((r) => setTimeout(r, 120));
  }
  return false;
};

(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
    { cwd: REPO, stdio: 'ignore' });
  const stop = () => { try { srv.kill('SIGKILL'); } catch {} };
  process.on('exit', stop);

  try {
    if (!await waitServer(`http://127.0.0.1:${PORT}/index.html`)) throw new Error('static server did not start');

    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ viewport: { width: 440, height: 940 }, deviceScaleFactor: 2, colorScheme: 'light' });
    const page = await ctx.newPage();
    // pin German (red CI) even against a stale persisted language
    await page.addInitScript(() => {
      try {
        localStorage.setItem('kunju-langorder', JSON.stringify(['de', 'es', 'en', 'nl', 'fr']));
        localStorage.setItem('kunju-lang', 'de');
        // pre-answer the cookie/consent banner so it never overlays the scroll capture
        localStorage.setItem('ce-consent', 'denied');
      } catch {}
    });
    await page.goto(`http://127.0.0.1:${PORT}/?lang=de&verb=${encodeURIComponent(verb)}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.content .tcard .conjrow', { timeout: 20000 });
    await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });

    await page.waitForTimeout(250);

    const content = await page.$('.content');
    if (!content) throw new Error('.content scroll container not found');
    // Playwright element-screenshots only paint the visible viewport of a scroll
    // container, so we step-scroll .content top→bottom, shoot each viewport slice,
    // and stitch them into one tall strip (same technique the original strip used).
    const DSF = 2;
    const dims = await page.evaluate(() => {
      const c = document.querySelector('.content');
      return { sh: c.scrollHeight, ch: c.clientHeight };
    });
    const step = dims.ch;
    const n = Math.max(1, Math.ceil(dims.sh / step));
    const framesDir = path.join(DIR, '.capframes');
    fs.rmSync(framesDir, { recursive: true, force: true });
    fs.mkdirSync(framesDir, { recursive: true });
    const slicePaths = [];
    for (let i = 0; i < n; i++) {
      const y = Math.min(i * step, Math.max(0, dims.sh - dims.ch));
      await page.evaluate((yy) => { document.querySelector('.content').scrollTop = yy; }, y);
      await page.waitForTimeout(90);
      const f = path.join(framesDir, `s${String(i).padStart(3, '0')}.png`);
      await content.screenshot({ path: f });
      slicePaths.push(f);
    }
    await browser.close();

    const out = path.join(DIR, 'assets', `${verb}-scroll.png`);
    if (n === 1) {
      fs.copyFileSync(slicePaths[0], out);
    } else {
      // crop the LAST slice to just its non-overlapping bottom part, then vstack all
      const keepCss = dims.sh - (n - 1) * step;                 // unseen remainder height
      const keepNative = Math.round(keepCss * DSF);
      const sliceNative = Math.round(dims.ch * DSF);
      const cropTop = Math.max(0, sliceNative - keepNative);
      const lastCropped = path.join(framesDir, 'last-cropped.png');
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', slicePaths[n - 1],
        '-vf', `crop=iw:${keepNative}:0:${cropTop}`, lastCropped]);
      const inputs = slicePaths.slice(0, n - 1).concat([lastCropped]);
      const args = ['-y', '-loglevel', 'error'];
      inputs.forEach((p) => args.push('-i', p));
      args.push('-filter_complex', `${inputs.map((_, i) => `[${i}:v]`).join('')}vstack=inputs=${inputs.length}`, out);
      execFileSync('ffmpeg', args);
    }
    fs.rmSync(framesDir, { recursive: true, force: true });
    const sz = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', out]).toString().trim();
    console.log('OK', out, `(${sz} px · ${verb})`);
  } finally {
    stop();
  }
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
