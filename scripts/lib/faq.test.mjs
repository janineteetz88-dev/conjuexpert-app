/**
 * faq.test.mjs — deckt den FAQ-Pfad über die real vorkommenden Autoren-Formate ab.
 * Läuft über den echten Produktionspfad: extractFaqAndContent → normalizeFaq → renderFaqHtml.
 */
import test from "node:test";
import assert from "node:assert/strict";

import { extractFaqAndContent } from "./notion-adapt.mjs";
import { normalizeFaq, renderFaqHtml } from "./faq.mjs";

/* ─── Block-Builder (Notion-ähnliche Shapes) ─────────────────────────────── */
const rt = (text, bold = false) => [{ plain_text: text, annotations: { bold } }];
const para = (t, bold = false) => ({ type: "paragraph", paragraph: { rich_text: rt(t, bold) } });
const quote = (t, bold = false) => ({ type: "quote", quote: { rich_text: rt(t, bold) } });
const h2 = (t) => ({ type: "heading_2", heading_2: { rich_text: rt(t) } });
const h3 = (t) => ({ type: "heading_3", heading_3: { rich_text: rt(t) } });
const toggle = (q, a) => ({ type: "toggle", toggle: { rich_text: rt(q) }, _children: [para(a)] });
const bulletQ = (q, a) => ({
  type: "bulleted_list_item",
  bulleted_list_item: { rich_text: [{ plain_text: "▸ ", annotations: { bold: false } }, { plain_text: q, annotations: { bold: true } }] },
  _children: [para(a)],
});

// Läuft den vollen Pfad und gibt die normalisierten Items zurück.
function run(blocks) {
  const { faqBlocks } = extractFaqAndContent(blocks);
  return normalizeFaq(faqBlocks);
}

test("FAQ: fett gesetzte Frage-Absätze + Antwort-Absätze (## FAQ + **Frage**)", () => {
  const items = run([
    h2("FAQ"),
    para("Wann benutzt man das Perfekt?", true),
    para("Immer dann, wenn es bis ins Jetzt reicht."),
    para("Wie bildet man es?", true),
    para("Mit haben plus Partizip."),
  ]);
  assert.equal(items.length, 2);
  assert.equal(items[0].q, "Wann benutzt man das Perfekt?");
  assert.match(items[0].a_html, /Immer dann/);
  assert.equal(items[1].q, "Wie bildet man es?");
  assert.match(items[1].a_html, /haben plus Partizip/);
});

test("FAQ: Zitate mit ### Frage + Zitat-Antwort (> ### …)", () => {
  const items = run([
    h2("Häufige Fragen"),
    quote("### Wann nehme ich ir a + Infinitiv?"),
    quote("Faustregel: bei nahen, konkreten Plänen."),
    quote("### Und wann das futuro simple?"),
    quote("Bei Fernem und Vermutungen."),
  ]);
  assert.equal(items.length, 2);
  assert.equal(items[0].q, "Wann nehme ich ir a + Infinitiv?");
  assert.match(items[0].a_html, /Faustregel/);
  assert.equal(items[1].q, "Und wann das futuro simple?");
});

test("FAQ: heading_3 als Frage + Absatz-Antwort", () => {
  const items = run([h2("FAQ"), h3("Muss ich vosotros lernen?"), para("Kommt auf dein Ziel an.")]);
  assert.equal(items.length, 1);
  assert.equal(items[0].q, "Muss ich vosotros lernen?");
  assert.match(items[0].a_html, /Kommt auf dein Ziel an/);
});

test("FAQ: escaped <toggle>-Marker werden übersprungen, Frage/Antwort erkannt", () => {
  const items = run([
    h2("Häufige Fragen"),
    para("<toggle>"),
    para('Warum hat no hables ein -s?', true),
    para("Weil der verneinte Imperativ der Subjuntivo ist."),
    para("</toggle>"),
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].q, "Warum hat no hables ein -s?");
  assert.match(items[0].a_html, /Subjuntivo/);
  assert.doesNotMatch(items[0].a_html, /toggle/i);
});

test("FAQ: Regression — toggle-Format bleibt korrekt", () => {
  const items = run([h2("FAQ"), toggle("Frage 1?", "Antwort 1."), toggle("Frage 2?", "Antwort 2.")]);
  assert.equal(items.length, 2);
  assert.equal(items[0].q, "Frage 1?");
  assert.match(items[0].a_html, /Antwort 1/);
});

test("FAQ: Regression — ▸ **Frage**-Bullet-Format bleibt korrekt", () => {
  const items = run([h2("FAQ"), bulletQ("Frage A?", "Antwort A."), bulletQ("Frage B?", "Antwort B.")]);
  assert.equal(items.length, 2);
  assert.equal(items[0].q, "Frage A?");
  assert.doesNotMatch(items[0].q, /^▸/);
  assert.match(items[0].a_html, /Antwort A/);
});

test("FAQ: renderFaqHtml erzeugt genau ein <h2 id=\"faq\"> und je <details>", () => {
  const items = run([
    h2("FAQ"),
    para("Frage eins?", true),
    para("Antwort eins."),
    para("Frage zwei?", true),
    para("Antwort zwei."),
  ]);
  const html = renderFaqHtml(items);
  assert.equal((html.match(/<h2 id="faq">/g) || []).length, 1);
  assert.equal((html.match(/<details>/g) || []).length, 2);
  assert.match(html, /class="faq2"/);
});

test("FAQ: kein FAQ-Abschnitt → leere Liste, kein HTML", () => {
  const items = run([h2("Ein Abschnitt"), para("Nur Inhalt, keine FAQ.")]);
  assert.equal(items.length, 0);
  assert.equal(renderFaqHtml(items), "");
});
