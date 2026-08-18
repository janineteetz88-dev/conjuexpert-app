/**
 * Deploy-Zeit-Minifizierung — läuft NUR im "_site"-Publish-Verzeichnis, das der
 * Deploy-Workflow aus der Allowlist baut. Die Quelldateien im Repo (app.js,
 * index.html) bleiben unangetastet und weiterhin direkt lesbar/editierbar —
 * genau wie in scripts/build-index.mjs dokumentiert ("app.js direkt bearbeiten").
 *
 * Warum ein Minifizierer statt Babel/JSX-Transpile: reine Minifizierung ändert
 * nie Programmlogik, nur Leerzeichen/Bezeichner — anders als die Babel-Blöcke,
 * die früher aus genau diesem Grund entfernt wurden. Kein `target` gesetzt =
 * esbuild transpiliert nichts, verändert also keine Syntax-Semantik.
 *
 * Hintergrund: PageSpeed Insights (18.08.2026) zeigte auf Mobil FCP 3,8s /
 * LCP 4,7s (rot) bei TBT 10ms / CLS 0 (grün) — der Engpass ist reine
 * Downloadgröße vor dem ersten Render, nicht Interaktivität. app.js ist
 * 1,15 MB unminifiziert; index.html enthält zusätzlich ~264 KB inline CSS
 * über 9 <style>-Blöcke.
 *
 * Aufruf: node scripts/minify-for-deploy.mjs <publish-dir>
 */
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import * as esbuild from "esbuild";

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node scripts/minify-for-deploy.mjs <publish-dir>");
  process.exit(1);
}

function kib(bytes) {
  return (bytes / 1024).toFixed(1) + " KiB";
}

async function minifyAppJs() {
  const path = join(dir, "app.js");
  const src = readFileSync(path, "utf8");
  const result = await esbuild.transform(src, {
    loader: "js",
    minify: true,
    // Kein `target` -> keine Syntax-Transpilation, nur Minifizierung.
  });
  writeFileSync(path, result.code);
  console.log(`app.js: ${kib(src.length)} -> ${kib(result.code.length)}`);
}

async function minifyInlineStyles() {
  const path = join(dir, "index.html");
  let html = readFileSync(path, "utf8");
  const before = html.length;

  const blocks = [];
  const re = /<style([^>]*)>([\s\S]*?)<\/style>/g;
  let m;
  while ((m = re.exec(html))) {
    blocks.push({ full: m[0], attrs: m[1], css: m[2] });
  }

  let savedCss = 0;
  for (const b of blocks) {
    if (!b.css.trim()) continue;
    const result = await esbuild.transform(b.css, { loader: "css", minify: true });
    savedCss += b.css.length - result.code.length;
    const replacement = `<style${b.attrs}>${result.code}</style>`;
    html = html.replace(b.full, replacement);
  }
  writeFileSync(path, html);
  console.log(`index.html: ${kib(before)} -> ${kib(html.length)} (CSS-Anteil gespart: ${kib(savedCss)})`);
}

await minifyAppJs();
await minifyInlineStyles();
