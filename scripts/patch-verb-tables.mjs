#!/usr/bin/env node
/**
 * patch-verb-tables.mjs — chirurgischer Tabellen-Patch für bestehende
 * SEO-Verbseiten (konjugation/<lang>/<verb>/index.html).
 *
 * Rendert ALLE Konjugationstabellen (tense-blocks) einer Seite deterministisch
 * aus der aktuellen Engine neu — exakt im Markup des Generators
 * (generate-verb-pages.mjs → conjugationTableHTML). Prosa, Beispielsätze,
 * FAQ, JSON-LD und Bilder bleiben unangetastet. Kein Netzwerk, keine KI.
 *
 * Zweck: Engine-Fixes (z. B. NL Gebiedende wijs, DE Präteritum ihr-Form)
 * auf die schon generierten Seiten bringen, ohne sie teuer neu zu erzeugen.
 *
 * Aufruf:
 *   node scripts/patch-verb-tables.mjs nl de     # ganze Sprachen
 *   node scripts/patch-verb-tables.mjs nl/kopen  # einzelne Seite (Debug)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEngine } from "./geo-blocks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const KONJ = path.join(ROOT, "konjugation");

const args = process.argv.slice(2);
if (!args.length) { console.error("Nutzung: node scripts/patch-verb-tables.mjs <lang|lang/verb> …"); process.exit(1); }

const ENGINES = {};
function engineFor(lang) {
  if (!ENGINES[lang]) ENGINES[lang] = loadEngine(ROOT, lang);
  return ENGINES[lang];
}

// Verzeichnisname → Verb (Reflexive: "se-lever" → "se lever", "zich-wassen" → "zich wassen")
function dirToVerb(dir) { return decodeURIComponent(dir).replace(/-/g, " "); }

// Identisch zum Generator (generate-verb-pages.mjs → conjugationTableHTML).
function tableHTML(tense, pronouns) {
  const rows = tense.forms.map((form, i) => {
    const pron = pronouns[i] || "";
    const isHighlighted = tense.reg && form !== tense.reg[i];
    return `<tr><td class="pron">${pron}</td><td class="${isHighlighted ? "irr" : ""}">${form || "—"}</td></tr>`;
  }).join("");
  return `<div class="tense-block">\n  <h3 class="tense-label">${tense.label}</h3>\n  <table class="conj-table"><tbody>${rows}</tbody></table>\n</div>`;
}

function patchPage(lang, dir) {
  const file = path.join(KONJ, lang, dir, "index.html");
  if (!fs.existsSync(file)) return null;
  const verb = dirToVerb(dir);
  const eng = engineFor(lang);
  let r;
  try { r = eng.conjugate(verb); } catch { return null; }
  if (!r || r.error || !r.tenses) return null;
  const pronouns = r.pronouns || [];
  const byLabel = {};
  for (const t of r.tenses) byLabel[t.label] = t;

  const src = fs.readFileSync(file, "utf8");
  // Jeden tense-block (Label + Tabelle) durch die frische Engine-Version ersetzen.
  const out = src.replace(
    /<div class="tense-block">\s*<h3 class="tense-label">([^<]+)<\/h3>\s*<table class="conj-table"><tbody>.*?<\/tbody><\/table>\s*<\/div>/gs,
    (block, label) => {
      const t = byLabel[label.trim()];
      return t ? tableHTML(t, pronouns) : block;
    }
  );
  if (out === src) return false;
  fs.writeFileSync(file, out);
  return true;
}

let patched = 0, unchanged = 0, skipped = 0;
for (const a of args) {
  const [lang, one] = a.split("/");
  const dirs = one ? [one] : fs.readdirSync(path.join(KONJ, lang)).filter(d => fs.existsSync(path.join(KONJ, lang, d, "index.html")));
  for (const dir of dirs) {
    const res = patchPage(lang, dir);
    if (res === true) { patched++; }
    else if (res === false) unchanged++;
    else { skipped++; console.log(`  übersprungen: ${lang}/${dir}`); }
  }
}
console.log(`Tabellen-Patch: ${patched} geändert, ${unchanged} unverändert, ${skipped} übersprungen.`);
