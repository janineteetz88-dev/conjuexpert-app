/**
 * Tests für die deutsche Anführungszeichen-Normalisierung.
 *
 *   node --test scripts/lib/text-polish.test.mjs
 *
 * Regression (29.07.2026, Commit e253070a): Lief die "-Variante vor der
 * &quot;-Variante, überlas sie ein &quot; als normalen Text und griff sich
 * stattdessen das nächste ECHTE " als Matchende — bei mehreren Meta-Tags mit
 * gleichem Textbaustein (description/og:description/twitter:description) traf
 * das den schließenden Anführungsstrich des HTML-Attributs selbst und machte
 * ihn dadurch nicht mehr terminiert (3 Live-Artikel, 11 Meta-Attribute).
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeGermanQuotesHtml } from "./text-polish.mjs";

test("normalizeGermanQuotesHtml: &quot; wird durch typografisches Zeichen ersetzt", () => {
  const out = normalizeGermanQuotesHtml('<p>Das nennt man „sein&quot; hier.</p>');
  assert.equal(out, "<p>Das nennt man „sein“ hier.</p>");
});

test("normalizeGermanQuotesHtml: gerader ASCII-Schluss wird typografisch", () => {
  const out = normalizeGermanQuotesHtml('<p>Das nennt man „sein" hier.</p>');
  assert.equal(out, "<p>Das nennt man „sein“ hier.</p>");
});

test("normalizeGermanQuotesHtml: rührt das schließende Attribut-Anführungszeichen nicht an, wenn dasselbe Muster mehrfach im HTML vorkommt", () => {
  const html =
    '<meta name="description" content="Beide heißen „sein&quot; – Rest." />\n' +
    '<meta property="og:description" content="Beide heißen „sein&quot; – Rest." />';
  const out = normalizeGermanQuotesHtml(html);

  // Jedes Meta-Tag muss weiterhin sein eigenes ASCII-Anführungszeichen als
  // echten Attribut-Abschluss haben (kein „…" das bis ins nächste Tag reicht).
  const matches = out.match(/content="[^"]*"/g) || [];
  assert.equal(matches.length, 2, `HTML-Attribute müssen korrekt terminiert sein, bekam: ${out}`);
  assert.equal(
    out,
    '<meta name="description" content="Beide heißen „sein“ – Rest." />\n' +
      '<meta property="og:description" content="Beide heißen „sein“ – Rest." />'
  );
});
