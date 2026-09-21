#!/usr/bin/env node
/**
 * build-site.mjs — baut das öffentliche Publish-Verzeichnis `_site` aus einer
 * festen ALLOWLIST (Positivliste) und minifiziert es anschließend.
 *
 * EINZIGE Quelle der Wahrheit für die Deploy-Allowlist. Sowohl der GitHub-
 * Actions-Workflow (.github/workflows/deploy-pages.yml) als auch der externe
 * Cloudflare-Pages-Build rufen `npm run build:site` auf — damit kann die
 * Allowlist nicht mehr zwischen zwei Orten auseinanderlaufen (genau diese Drift
 * hat den Deploy-Ausfall im September 2026 mitverursacht).
 *
 * Positivliste (bewusst KEINE Ausschlussliste): neue Top-Level-Dateien/Ordner
 * sind automatisch NICHT öffentlich, bis sie hier ergänzt werden. Sensible
 * Pfade wie /supabase/, /docs/, /scripts/, /package.json bleiben so out of the
 * box aus dem Live-Verzeichnis.
 */
import {
  existsSync,
  rmSync,
  mkdirSync,
  copyFileSync,
  cpSync,
  readdirSync,
  statSync,
  appendFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";

const OUT = "_site";

// Einzeldateien, die öffentlich erreichbar sein müssen.
// (.nojekyll bewusst NICHT dabei: fehlt sie, läuft ein etwaiger klassischer
//  Branch-Deploy als Jekyll-Build mit den Ausschlüssen aus _config.yml statt
//  den kompletten Repo-Root auszuliefern — zweite Verteidigungslinie.)
const FILES = [
  "index.html", "app.js", "manifest.webmanifest", "sw.js", "404.html",
  "robots.txt", "sitemap.xml", "sitemap-core.xml", "sitemap-verbs.xml", "llms.txt", "CNAME",
  "google21132ae6fe839054.html", "favicon.svg", "apple-touch-icon.png",
  "icon-192.png", "icon-512.png", "icon-maskable.png",
  "agb.html", "datenschutz.html", "impressum.html", "barrierefreiheit.html",
  "bildnachweise.html", "back-to-app.js",
  // logo-wordmark.png wird nicht von der Site selbst verlinkt, aber per
  // absoluter URL in den Transaktions-Mails eingebettet (emails/*/…) — muss
  // deshalb trotzdem live sein.
  "logo-wordmark.png",
];

// Ganze Verzeichnisse, die öffentlich erreichbar sein müssen.
const DIRS = ["engine", "fonts", "vendor", "blog", "konjugation", "landing", "bewertungen", "start"];

let hasError = false;
const warn = (m) => console.warn("::warning::" + m);
const fail = (m) => {
  hasError = true;
  console.error("::error::" + m);
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const f of FILES) {
  if (existsSync(f) && statSync(f).isFile()) copyFileSync(f, `${OUT}/${f}`);
  else warn(`Allowlist-Datei fehlt im Repo, übersprungen: ${f}`);
}
for (const d of DIRS) {
  if (existsSync(d) && statSync(d).isDirectory()) cpSync(d, `${OUT}/${d}`, { recursive: true });
  else fail(`Allowlist-Verzeichnis fehlt im Repo: ${d}`);
}

// Diese 3 Dateien sind für App-Start bzw. SEO essenziell — ohne sie lieber hart
// abbrechen als eine kaputte Seite deployen.
for (const critical of ["index.html", "app.js", "sw.js"]) {
  if (!existsSync(`${OUT}/${critical}`)) fail(`Kritische Datei fehlt: ${critical}`);
}
if (hasError) {
  console.error("Abbruch: Allowlist unvollständig (siehe ::error::-Zeilen).");
  process.exit(1);
}

// Minifizierung — NUR die Kopie in _site; die Quelldateien im Repo (app.js,
// index.html, CSS) bleiben unverändert und direkt editierbar.
execFileSync("node", ["scripts/minify-for-deploy.mjs", OUT], { stdio: "inherit" });

// GitHub-Step-Summary (nur im Actions-Kontext vorhanden).
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath) {
  const allow = new Set([...FILES, ...DIRS]);
  const excluded = readdirSync(".")
    .filter((name) => !allow.has(name))
    .sort()
    .map((name) => `- ${name}`)
    .join("\n");
  appendFileSync(
    summaryPath,
    `## Deploy-Allowlist — Publish-Verzeichnis\n\n` +
      `- Dateien gesamt: ${countFiles(OUT)}\n\n` +
      `### NICHT enthalten (bewusst ausgeschlossen)\n\n${excluded}\n`,
  );
}

function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) n += countFiles(`${dir}/${entry.name}`);
    else n++;
  }
  return n;
}
