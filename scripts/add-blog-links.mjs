#!/usr/bin/env node
/**
 * add-blog-links.mjs
 *
 * Fügt jeder SEO-Verbseite (konjugation/<lang>/<verb>/index.html) einen
 * kompakten „Zum Vertiefen"-Block mit internen Links auf die passenden
 * Grammatik-Guides im Blog hinzu — interne Verlinkung von ~2.000 Seiten
 * auf die Fast-Gewinner-Artikel (SEO: hebt Seite-1-Kandidaten in die
 * Klickzone). Nutzt die vorhandenen related-*-Styles der Seiten.
 *
 * Kein Netzwerk, keine AI. Idempotent: Seiten mit deepen-section werden
 * übersprungen. Einfügepunkt: direkt vor <section class="cta-bottom">.
 *
 * Aufruf:
 *   node scripts/add-blog-links.mjs            # alle
 *   node scripts/add-blog-links.mjs de/gehen   # einzelne (Debug)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const KONJ = path.join(ROOT, "konjugation");

// Je Sprache 3 Guides: bevorzugt die GSC-Fast-Gewinner + die stärksten
// Grundlagen-Artikel der Sprache.
const LINKS = {
  de: [
    ["/blog/perfekt-oder-praeteritum/", "Perfekt oder Präteritum?"],
    ["/blog/trennbare-verben-deutsch/", "Trennbare Verben"],
    ["/blog/perfekt-haben-oder-sein/", "Perfekt: haben oder sein?"],
  ],
  es: [
    ["/blog/unregelmaessige-verben-spanisch/", "Unregelmäßige Verben Spanisch"],
    ["/blog/ser-vs-estar/", "ser vs. estar"],
    ["/blog/indefinido-imperfecto/", "Indefinido oder Imperfecto?"],
  ],
  en: [
    ["/blog/irregular-verbs-englisch/", "Irregular Verbs"],
    ["/blog/present-perfect-vs-simple-past/", "Present Perfect vs. Simple Past"],
    ["/blog/englisch-3-person-s/", "Das s der 3. Person"],
  ],
  fr: [
    ["/blog/passe-compose-avoir-etre/", "Passé composé: avoir oder être?"],
    ["/blog/unregelmaessige-verben-franzoesisch/", "Unregelmäßige Verben Französisch"],
    ["/blog/conditionnel-franzoesisch/", "Le conditionnel"],
  ],
  nl: [
    ["/blog/t-kofschip/", "'t kofschip erklärt"],
    ["/blog/hebben-of-zijn/", "hebben of zijn?"],
    ["/blog/sterke-werkwoorden/", "Sterke werkwoorden"],
  ],
};

const ANCHOR = '<section class="cta-bottom">';
const MARK = 'deepen-section';

function boxHtml(lang) {
  const chips = (LINKS[lang] || []).map(([href, label]) =>
    `      <a class="related-chip" href="${href}"><span class="rc-verb">${label}</span><span class="rc-hint">Grammatik-Guide</span></a>`
  ).join("\n");
  return `  <section class="related-section ${MARK}">
    <h2>Zum Vertiefen</h2>
    <div class="related-grid">
${chips}
    </div>
  </section>

`;
}

function processPage(file, lang) {
  let s = fs.readFileSync(file, "utf8");
  if (s.includes(MARK)) return "skip";
  const i = s.indexOf(ANCHOR);
  if (i < 0) return "no-anchor";
  s = s.slice(0, i) + boxHtml(lang) + s.slice(i);
  fs.writeFileSync(file, s);
  return "ok";
}

function main() {
  const only = process.argv[2] || "";
  const stats = { ok: 0, skip: 0, "no-anchor": 0 };
  for (const lang of Object.keys(LINKS)) {
    const dir = path.join(KONJ, lang);
    if (!fs.existsSync(dir)) continue;
    for (const verb of fs.readdirSync(dir)) {
      if (only && only !== `${lang}/${verb}`) continue;
      const file = path.join(dir, verb, "index.html");
      if (!fs.existsSync(file)) continue;
      const r = processPage(file, lang);
      stats[r]++;
      if (r === "no-anchor") console.log(`⚠️  kein Anker: ${lang}/${verb}`);
    }
  }
  console.log(`✅ Vertiefen-Links: ${stats.ok} eingefügt, ${stats.skip} schon vorhanden, ${stats["no-anchor"]} ohne Anker.`);
}

main();
