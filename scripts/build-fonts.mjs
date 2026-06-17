/**
 * Self-Hosting der Google Fonts (Datenschutz: keine Anfrage an Google-Server
 * mehr beim Seitenaufruf).
 *
 * Holt die @font-face-CSS von Google (mit modernem Browser-UA -> woff2),
 * laedt die woff2-Dateien nach /fonts/ herunter (nur Subsets latin + latin-ext,
 * decken DE/ES/FR-Akzente ab) und schreibt lokale CSS-Dateien, die auf
 * /fonts/*.woff2 zeigen. Anschliessend ersetzt build-index bzw. die HTML-
 * Seiten den Google-<link> durch das lokale Stylesheet.
 *
 * EINMALIG ausfuehren (braucht Netz):  node scripts/build-fonts.mjs
 * Die erzeugten Dateien in /fonts/ werden committet; danach ist kein Netz noetig.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FONTS = join(ROOT, "fonts");
mkdirSync(FONTS, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Gruppen entsprechen exakt den bisherigen Google-Fonts-URLs der Seiten.
const GROUPS = {
  app: "family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Rubik:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap",
  caveat: "family=Caveat:wght@600;700&display=swap",
  landing: "family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap",
  blog: "family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap",
};

const KEEP_SUBSETS = new Set(["latin", "latin-ext"]);
const downloaded = new Map(); // url -> local basename (dedupe ueber Gruppen)

async function fetchText(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`GET ${url} -> ${r.status}`);
  return r.text();
}

async function downloadFont(url) {
  if (downloaded.has(url)) return downloaded.get(url);
  const name = basename(new URL(url).pathname); // eindeutiger Google-Dateiname
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`GET ${url} -> ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(join(FONTS, name), buf);
  downloaded.set(url, name);
  return name;
}

// zerlegt das Google-CSS in (subset, @font-face-Block) und behaelt nur latin/-ext
async function localizeCss(css) {
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;
  let out = "";
  let m;
  while ((m = re.exec(css))) {
    const subset = m[1];
    let block = m[2];
    if (!KEEP_SUBSETS.has(subset)) continue;
    const urlMatch = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
    if (!urlMatch) continue;
    const local = await downloadFont(urlMatch[1]);
    block = block.replace(urlMatch[1], `/fonts/${local}`);
    out += `/* ${subset} */\n${block}\n`;
  }
  return out;
}

let totalCss = 0;
for (const [name, query] of Object.entries(GROUPS)) {
  const css = await fetchText(`https://fonts.googleapis.com/css2?${query}`);
  const local = await localizeCss(css);
  const header = `/* ConjuExpert self-hosted fonts (${name}) – generiert via scripts/build-fonts.mjs */\n`;
  writeFileSync(join(FONTS, `${name}.css`), header + local);
  totalCss++;
  console.log(`✓ fonts/${name}.css`);
}
console.log(`Fertig: ${totalCss} CSS-Dateien, ${downloaded.size} woff2-Dateien in /fonts/.`);
