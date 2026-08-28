/**
 * patch-verb-intro-de.mjs — einmalige Migration (28.08.2026)
 *
 * SEO-/GEO-Audit-Befund: Der Intro-Satz aller Verbseiten wirkte maschinell —
 * untersetzter Sprachname („… ist ein unregelmäßiges Français-Verb") und
 * englische Bedeutung („aller bedeutet ‚to go'") auf deutschen Seiten.
 * Genau diese Gleichförmigkeit korreliert mit Googles „Gefunden – zurzeit
 * nicht indexiert" für 1.642 der Seiten.
 *
 * Dieses Script hebt die BESTEHENDEN Seiten an (die Templates in
 * generate-verb-pages.mjs / geo-blocks.mjs wurden parallel angepasst):
 *   1. „… ${native}-Verb" → „… ${adjektiv} Verb" (deutsches/englisches/…)
 *   2. nicht-de-Seiten: englischer Gloss → deutsche Bedeutung
 *      (scripts/lib/verb-meanings-de.json), in Intro, FAQ, TL;DR, JSON-LD
 *      und Bild-alt.
 *   3. de-Seiten: „bedeutet „to do"" → „bedeutet auf Englisch „to do"".
 *   4. JSON-LD-Description: „(irregular)/(regular)" → deutsch.
 *
 * Idempotent: bereits migrierte Seiten werden nicht verändert.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MEANINGS = JSON.parse(readFileSync(join(ROOT, "scripts/lib/verb-meanings-de.json"), "utf8"));

const ADJ = {
  Deutsch: "deutsches",
  English: "englisches",
  Español: "spanisches",
  Français: "französisches",
  Nederlands: "niederländisches",
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let changed = 0, skippedNoGloss = 0, warnings = [];
const langDirs = readdirSync(join(ROOT, "konjugation"), { withFileTypes: true }).filter((d) => d.isDirectory());
for (const ld of langDirs) {
  const lang = ld.name;
  for (const vd of readdirSync(join(ROOT, "konjugation", lang), { withFileTypes: true })) {
    if (!vd.isDirectory()) continue;
    const verb = vd.name;
    const p = join(ROOT, "konjugation", lang, verb, "index.html");
    let s;
    try { s = readFileSync(p, "utf8"); } catch { continue; }
    const before = s;

    // 1. Sprachname → deutsches Adjektiv (alle Vorkommen: Intro, FAQ, TL;DR, JSON-LD)
    for (const [nat, adj] of Object.entries(ADJ)) {
      s = s.replaceAll(`regelmäßiges ${nat}-Verb`, `regelmäßiges ${adj} Verb`);
    }

    // 4. Englische Typ-Angabe in der JSON-LD-Description eindeutschen
    s = s.replace(/ \(irregular\)\. Alle Zeitformen/g, " (unregelmäßig). Alle Zeitformen")
         .replace(/ \(regular\)\. Alle Zeitformen/g, " (regelmäßig). Alle Zeitformen");

    // 2./3. Bedeutung
    const mm = s.match(/bedeutet(?: auf Englisch)? „([^"“”\\]+)[\\"“”]/);
    const en = mm ? mm[1].trim() : null;
    if (en) {
      if (lang === "de") {
        // de-Seiten: englischen Gloss als solchen kennzeichnen
        s = s.replaceAll(`bedeutet „${en}`, `bedeutet auf Englisch „${en}`)
             .replaceAll(`bedeutet auf Englisch auf Englisch „`, `bedeutet auf Englisch „`) // Idempotenz
             .replaceAll(`(Bedeutung: „${en}`, `(Bedeutung auf Englisch: „${en}`);
      } else {
        const de = MEANINGS[`${lang}/${verb}`];
        if (!de) {
          warnings.push(`KEINE Übersetzung für ${lang}/${verb} („${en}")`);
        } else if (en !== de) {
          // alle Kontexte: „EN" sichtbar, „EN\" in JSON-LD, "— EN (" im alt-Text
          s = s.replaceAll(`„${en}"`, `„${de}"`)
               .replaceAll(`„${en}\\"`, `„${de}\\"`)
               .replaceAll(`— ${en} (`, `— ${de} (`);
        }
      }
    } else if (!/bedeutet/.test(s)) {
      skippedNoGloss++;
    }

    if (s !== before) { writeFileSync(p, s); changed++; }
  }
}

console.log(`geändert: ${changed} Seiten | ohne Gloss: ${skippedNoGloss}`);
if (warnings.length) {
  console.error(`WARNUNGEN (${warnings.length}):\n  ` + warnings.slice(0, 20).join("\n  "));
  process.exit(1);
}
