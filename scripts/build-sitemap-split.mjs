/**
 * build-sitemap-split.mjs
 *
 * Leitet aus der (weiterhin kanonischen) sitemap.xml zwei Teil-Sitemaps ab:
 *   - sitemap-core.xml  — alles außer /konjugation/ (Start, Blog, Hubs, Recht)
 *   - sitemap-verbs.xml — die ~2.000 generierten Verbseiten
 *
 * Hintergrund (SEO-Audit 28.08.2026): Google hat 2.124 gleichförmige URLs aus
 * EINER Sitemap gelesen und 1.642 davon auf „Gefunden – zurzeit nicht
 * indexiert" gestellt. Getrennt eingereicht lässt sich das Kern-Set (Blog &
 * Co.) separat überwachen und priorisieren; die Verbseiten ziehen ihren
 * eigenen Bericht. sitemap.xml bleibt unangetastet — alle bestehenden
 * Schreiber (Blog-Pipeline, Verb-Generator) funktionieren unverändert; dieses
 * Script läuft danach und ist idempotent.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function buildSitemapSplit(root = ROOT) {
  const src = readFileSync(join(root, "sitemap.xml"), "utf8");
  const entries = src.match(/<url>[\s\S]*?<\/url>/g) || [];
  const isVerb = (e) => /<loc>[^<]*\/konjugation\//.test(e);
  const wrap = (list) =>
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n  ${list.join("\n  ")}\n</urlset>\n`;

  const core = entries.filter((e) => !isVerb(e));
  const verbs = entries.filter(isVerb);
  writeFileSync(join(root, "sitemap-core.xml"), wrap(core));
  writeFileSync(join(root, "sitemap-verbs.xml"), wrap(verbs));
  return { core: core.length, verbs: verbs.length };
}

// Direktaufruf: node scripts/build-sitemap-split.mjs
if (process.argv[1] && process.argv[1].endsWith("build-sitemap-split.mjs")) {
  const n = buildSitemapSplit();
  console.log(`sitemap-core.xml: ${n.core} URLs · sitemap-verbs.xml: ${n.verbs} URLs`);
}
